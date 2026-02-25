/**
 * Memory Storage
 * 
 * Handles persistence of memory items with in-memory cache and AppFlowy integration.
 */

import type { MemoryItem, MemoryStatistics } from './memoryTypes';

/**
 * Memory Storage Configuration
 */
export interface MemoryStorageConfig {
	/** Whether to use in-memory cache */
	useCache: boolean;
	
	/** Maximum cache size */
	maxCacheSize: number;
	
	/** Whether to persist to AppFlowy */
	persistToAppFlowy: boolean;
	
	/** AppFlowy collection name */
	appFlowyCollection: string;
	
	/** Whether to enable versioning */
	enableVersioning: boolean;
	
	/** Whether to enable corruption recovery */
	enableRecovery: boolean;
}

/**
 * Memory Storage
 */
export class MemoryStorage {
	private config: MemoryStorageConfig;
	private cache: Map<string, MemoryItem> = new Map();
	private appFlowyClient: any = null; // Would be AppFlowy client in production
	
	constructor(config: Partial<MemoryStorageConfig> = {}) {
		this.config = {
			useCache: config.useCache ?? true,
			maxCacheSize: config.maxCacheSize ?? 1000,
			persistToAppFlowy: config.persistToAppFlowy ?? false,
			appFlowyCollection: config.appFlowyCollection ?? 'copilot_memories',
			enableVersioning: config.enableVersioning ?? true,
			enableRecovery: config.enableRecovery ?? true
		};
		
		// Initialize AppFlowy client if needed
		if (this.config.persistToAppFlowy) {
			this.initializeAppFlowy();
		}
	}
	
	/**
	 * Save a memory item
	 */
	async saveMemory(memory: MemoryItem): Promise<boolean> {
		try {
			// Update cache
			if (this.config.useCache) {
				this.cache.set(memory.id, memory);
				this.manageCacheSize();
			}
			
			// Persist to AppFlowy if enabled
			if (this.config.persistToAppFlowy && this.appFlowyClient) {
				await this.saveToAppFlowy(memory);
			}
			
			return true;
		} catch (error) {
			console.error('Failed to save memory:', error);
			
			// Attempt recovery if enabled
			if (this.config.enableRecovery) {
				return this.recoverFromError('save', memory, error);
			}
			
			return false;
		}
	}
	
	/**
	 * Get a memory item by ID
	 */
	async getMemory(id: string): Promise<MemoryItem | null> {
		try {
			// Check cache first
			if (this.config.useCache) {
				const cached = this.cache.get(id);
				if (cached) {
					return cached;
				}
			}
			
			// Load from AppFlowy if enabled
			if (this.config.persistToAppFlowy && this.appFlowyClient) {
				const memory = await this.loadFromAppFlowy(id);
				if (memory) {
					// Update cache
					if (this.config.useCache) {
						this.cache.set(id, memory);
						this.manageCacheSize();
					}
					return memory;
				}
			}
			
			return null;
		} catch (error) {
			console.error('Failed to get memory:', error);
			
			// Attempt recovery if enabled
			if (this.config.enableRecovery) {
				return this.recoverFromError('get', { id }, error);
			}
			
			return null;
		}
	}
	
	/**
	 * Get all memories
	 */
	async getAllMemories(): Promise<MemoryItem[]> {
		try {
			// If using cache and AppFlowy is not enabled, return cache contents
			if (this.config.useCache && !this.config.persistToAppFlowy) {
				return Array.from(this.cache.values());
			}
			
			// Load from AppFlowy if enabled
			if (this.config.persistToAppFlowy && this.appFlowyClient) {
				const memories = await this.loadAllFromAppFlowy();
				
				// Update cache
				if (this.config.useCache) {
					memories.forEach(memory => {
						this.cache.set(memory.id, memory);
					});
					this.manageCacheSize();
				}
				
				return memories;
			}
			
			// Fallback to cache
			return Array.from(this.cache.values());
		} catch (error) {
			console.error('Failed to get all memories:', error);
			
			// Attempt recovery if enabled
			if (this.config.enableRecovery) {
				// Return cache contents as fallback
				return Array.from(this.cache.values());
			}
			
			return [];
		}
	}
	
	/**
	 * Delete a memory item
	 */
	async deleteMemory(id: string): Promise<boolean> {
		try {
			// Remove from cache
			if (this.config.useCache) {
				this.cache.delete(id);
			}
			
			// Delete from AppFlowy if enabled
			if (this.config.persistToAppFlowy && this.appFlowyClient) {
				await this.deleteFromAppFlowy(id);
			}
			
			return true;
		} catch (error) {
			console.error('Failed to delete memory:', error);
			
			// Attempt recovery if enabled
			if (this.config.enableRecovery) {
				return this.recoverFromError('delete', { id }, error);
			}
			
			return false;
		}
	}
	
	/**
	 * Clear all memories (use with caution!)
	 */
	async clearAll(): Promise<number> {
		try {
			const count = this.cache.size;
			
			// Clear cache
			this.cache.clear();
			
			// Clear AppFlowy if enabled
			if (this.config.persistToAppFlowy && this.appFlowyClient) {
				await this.clearAppFlowy();
			}
			
			return count;
		} catch (error) {
			console.error('Failed to clear memories:', error);
			return 0;
		}
	}
	
	/**
	 * Get memory statistics
	 */
	async getStatistics(): Promise<MemoryStatistics> {
		const memories = await this.getAllMemories();
		const now = new Date();
		
		// Calculate statistics by category
		const byCategory: Record<string, number> = {};
		const bySource: Record<string, number> = {};
		
		let totalImportance = 0;
		let totalConfidence = 0;
		let oldestMemory = now;
		let newestMemory = new Date(0);
		
		for (const memory of memories) {
			// Category statistics
			byCategory[memory.category] = (byCategory[memory.category] || 0) + 1;
			
			// Source statistics
			bySource[memory.source] = (bySource[memory.source] || 0) + 1;
			
			// Importance and confidence
			totalImportance += memory.metadata.importance;
			totalConfidence += memory.metadata.confidence;
			
			// Date ranges
			if (memory.metadata.createdAt < oldestMemory) {
				oldestMemory = memory.metadata.createdAt;
			}
			if (memory.metadata.createdAt > newestMemory) {
				newestMemory = memory.metadata.createdAt;
			}
		}
		
		const totalMemories = memories.length;
		const averageImportance = totalMemories > 0 ? totalImportance / totalMemories : 0;
		const averageConfidence = totalMemories > 0 ? totalConfidence / totalMemories : 0;
		
		// Estimate storage size (rough approximation)
		const storageSizeBytes = totalMemories * 1024; // 1KB per memory on average
		
		return {
			totalMemories,
			byCategory: byCategory as any,
			bySource: bySource as any,
			averageImportance,
			averageConfidence,
			oldestMemory,
			newestMemory,
			storageSizeBytes
		};
	}
	
	/**
	 * Initialize AppFlowy client (placeholder)
	 */
	private initializeAppFlowy(): void {
		// In production, this would initialize the AppFlowy client
		// For now, create a mock client
		this.appFlowyClient = {
			collection: this.config.appFlowyCollection,
			isConnected: true,
			lastSync: new Date()
		};
		
		console.log('AppFlowy client initialized (mock)');
	}
	
	/**
	 * Save to AppFlowy (placeholder)
	 */
	private async saveToAppFlowy(memory: MemoryItem): Promise<void> {
		// In production, this would save to AppFlowy
		// For now, just log
		console.log(`[AppFlowy] Saving memory: ${memory.id} (${memory.category})`);
		
		// Simulate async operation
		await new Promise(resolve => setTimeout(resolve, 10));
	}
	
	/**
	 * Load from AppFlowy (placeholder)
	 */
	private async loadFromAppFlowy(id: string): Promise<MemoryItem | null> {
		// In production, this would load from AppFlowy
		// For now, return null (simulating empty database)
		console.log(`[AppFlowy] Loading memory: ${id}`);
		
		// Simulate async operation
		await new Promise(resolve => setTimeout(resolve, 10));
		
		return null;
	}
	
	/**
	 * Load all from AppFlowy (placeholder)
	 */
	private async loadAllFromAppFlowy(): Promise<MemoryItem[]> {
		// In production, this would load all from AppFlowy
		// For now, return empty array
		console.log('[AppFlowy] Loading all memories');
		
		// Simulate async operation
		await new Promise(resolve => setTimeout(resolve, 50));
		
		return [];
	}
	
	/**
	 * Delete from AppFlowy (placeholder)
	 */
	private async deleteFromAppFlowy(id: string): Promise<void> {
		// In production, this would delete from AppFlowy
		// For now, just log
		console.log(`[AppFlowy] Deleting memory: ${id}`);
		
		// Simulate async operation
		await new Promise(resolve => setTimeout(resolve, 10));
	}
	
	/**
	 * Clear AppFlowy (placeholder)
	 */
	private async clearAppFlowy(): Promise<void> {
		// In production, this would clear AppFlowy collection
		// For now, just log
		console.log('[AppFlowy] Clearing all memories');
		
		// Simulate async operation
		await new Promise(resolve => setTimeout(resolve, 50));
	}
	
	/**
	 * Manage cache size
	 */
	private manageCacheSize(): void {
		if (this.cache.size <= this.config.maxCacheSize) {
			return;
		}
		
		// Remove least recently accessed items
		const items = Array.from(this.cache.entries());
		items.sort((a, b) => a[1].metadata.lastAccessedAt.getTime() - b[1].metadata.lastAccessedAt.getTime());
		
		const itemsToRemove = items.slice(0, this.cache.size - this.config.maxCacheSize);
		for (const [id] of itemsToRemove) {
			this.cache.delete(id);
		}
		
		console.log(`Cache trimmed: removed ${itemsToRemove.length} items`);
	}
	
	/**
	 * Recover from error
	 */
	private async recoverFromError(operation: string, data: any, error: any): Promise<any> {
		console.warn(`Attempting recovery from ${operation} error:`, error);
		
		switch (operation) {
			case 'save':
				// For save errors, try to save to cache only
				if (this.config.useCache && data.id) {
					this.cache.set(data.id, data);
					this.manageCacheSize();
					console.warn('Recovered: Saved to cache only');
					return true;
				}
				break;
				
			case 'get':
				// For get errors, try cache only
				if (this.config.useCache && data.id) {
					return this.cache.get(data.id) || null;
				}
				break;
				
			case 'delete':
				// For delete errors, try cache only
				if (this.config.useCache && data.id) {
					this.cache.delete(data.id);
					console.warn('Recovered: Deleted from cache only');
					return true;
				}
				break;
		}
		
		// Default recovery
		console.error('Recovery failed for operation:', operation);
		return null;
	}
	
	/**
	 * Migrate memories to new version (placeholder)
	 */
	async migrateMemories(fromVersion: number, toVersion: number): Promise<number> {
		if (!this.config.enableVersioning) {
			console.warn('Versioning is disabled, skipping migration');
			return 0;
		}
		
		console.log(`Migrating memories from version ${fromVersion} to ${toVersion}`);
		
		// In production, this would apply migration scripts
		// For now, just update version numbers in cache
		let migratedCount = 0;
		
		const entries = Array.from(this.cache.entries());
		for (const [id, memory] of entries) {
			if (memory.metadata.version === fromVersion) {
				memory.metadata.version = toVersion;
				migratedCount++;
				
				// Persist updated memory
				await this.saveMemory(memory);
			}
		}
		
		console.log(`Migrated ${migratedCount} memories`);
		return migratedCount;
	}
}