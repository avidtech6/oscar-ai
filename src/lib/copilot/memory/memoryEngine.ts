/**
 * Memory Engine
 * 
 * Core engine for the unified memory and knowledge layer.
 * Handles memory storage, retrieval, querying, embeddings, and summarization.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
	MemoryItem,
	MemoryCategory,
	MemorySource,
	MemoryWriteOptions,
	MemoryQuery,
	MemoryResult,
	MemoryEmbedding,
	ClientProfile,
	ThreadSummary,
	DocumentSummary,
	StyleProfile,
	ProviderHistory,
	DeliverabilityHistory,
	WorkflowHistory,
	MemoryUpdateEvent,
	MemoryStatistics
} from './memoryTypes';
import { MemoryStorage } from './memoryStorage';

/**
 * Memory Engine Configuration
 */
export interface MemoryEngineConfig {
	/** Whether to generate embeddings for new memories */
	generateEmbeddings: boolean;
	
	/** Embedding model to use */
	embeddingModel: string;
	
	/** Embedding dimension */
	embeddingDimension: number;
	
	/** Default importance for new memories */
	defaultImportance: number;
	
	/** Default confidence for new memories */
	defaultConfidence: number;
	
	/** Default expiration time in milliseconds (optional) */
	defaultExpirationMs?: number;
	
	/** Maximum number of memories to keep in cache */
	maxCacheSize: number;
	
	/** Whether to persist memories to storage */
	persistToStorage: boolean;
	
	/** Whether to emit memory events */
	emitEvents: boolean;
}

/**
 * Memory Engine
 */
export class MemoryEngine {
	private storage: MemoryStorage;
	private config: MemoryEngineConfig;
	private cache: Map<string, MemoryItem> = new Map();
	private eventListeners: Array<(event: MemoryUpdateEvent) => void> = [];
	
	constructor(config: Partial<MemoryEngineConfig> = {}) {
		this.config = {
			generateEmbeddings: config.generateEmbeddings ?? false,
			embeddingModel: config.embeddingModel ?? 'text-embedding-ada-002',
			embeddingDimension: config.embeddingDimension ?? 1536,
			defaultImportance: config.defaultImportance ?? 50,
			defaultConfidence: config.defaultConfidence ?? 80,
			defaultExpirationMs: config.defaultExpirationMs,
			maxCacheSize: config.maxCacheSize ?? 1000,
			persistToStorage: config.persistToStorage ?? true,
			emitEvents: config.emitEvents ?? true
		};
		
		this.storage = new MemoryStorage();
	}
	
	/**
	 * Write a memory item
	 */
	async writeMemory(
		category: MemoryCategory,
		source: MemorySource,
		content: any,
		summary: string,
		options: MemoryWriteOptions = {}
	): Promise<MemoryItem> {
		const startTime = Date.now();
		
		// Generate ID
		const id = options.overwrite && content.id ? content.id : uuidv4();
		
		// Check if memory already exists
		const existingMemory = await this.storage.getMemory(id);
		if (existingMemory && !options.overwrite) {
			throw new Error(`Memory with ID ${id} already exists. Use overwrite option to replace.`);
		}
		
		// Generate embedding if requested
		let embedding: number[] | undefined;
		if (this.config.generateEmbeddings && options.generateEmbedding !== false) {
			embedding = await this.generateEmbedding(summary);
		}
		
		// Create memory item
		const now = new Date();
		const memoryItem: MemoryItem = {
			id,
			category,
			source,
			content,
			embedding,
			metadata: {
				createdAt: existingMemory?.metadata.createdAt ?? now,
				lastAccessedAt: now,
				expiresAt: options.expiresInMs ? new Date(now.getTime() + options.expiresInMs) : undefined,
				importance: options.importance ?? this.config.defaultImportance,
				confidence: options.confidence ?? this.config.defaultConfidence,
				tags: options.tags ?? [],
				relatedEntities: this.extractRelatedEntities(content, category),
				version: 1
			},
			summary,
			rawDataRef: content.rawDataRef
		};
		
		// Update cache
		this.cache.set(id, memoryItem);
		this.manageCacheSize();
		
		// Persist to storage if requested
		if (this.config.persistToStorage && options.persist !== false) {
			await this.storage.saveMemory(memoryItem);
		}
		
		// Emit event if requested
		if (this.config.emitEvents) {
			this.emitEvent({
				type: 'memory-written',
				memoryId: id,
				category,
				timestamp: now,
				data: { summary, source }
			});
		}
		
		console.log(`Memory written: ${id} (${category}) - ${summary.substring(0, 50)}...`);
		
		return memoryItem;
	}
	
	/**
	 * Read a memory item by ID
	 */
	async readMemory(id: string): Promise<MemoryItem | null> {
		const startTime = Date.now();
		
		// Check cache first
		let memoryItem: MemoryItem | undefined = this.cache.get(id);
		
		// If not in cache, load from storage
		if (!memoryItem) {
			const storedMemory = await this.storage.getMemory(id);
			if (storedMemory) {
				memoryItem = storedMemory;
				// Update last accessed time
				memoryItem.metadata.lastAccessedAt = new Date();
				this.cache.set(id, memoryItem);
				this.manageCacheSize();
				
				// Update in storage
				await this.storage.saveMemory(memoryItem);
			}
		} else {
			// Update last accessed time for cached item
			memoryItem.metadata.lastAccessedAt = new Date();
		}
		
		// Emit event if memory was found
		if (memoryItem && this.config.emitEvents) {
			this.emitEvent({
				type: 'memory-read',
				memoryId: id,
				category: memoryItem.category,
				timestamp: new Date(),
				data: { summary: memoryItem.summary }
			});
		}
		
		return memoryItem || null;
	}
	
	/**
	 * Query memories
	 */
	async queryMemories(query: MemoryQuery): Promise<MemoryResult> {
		const startTime = Date.now();
		
		// Get all memories from storage
		const allMemories = await this.storage.getAllMemories();
		
		// Apply filters
		let filteredMemories = allMemories;
		
		// Category filter
		if (query.category) {
			const categories = Array.isArray(query.category) ? query.category : [query.category];
			filteredMemories = filteredMemories.filter((memory: MemoryItem) => categories.includes(memory.category));
		}
		
		// Source filter
		if (query.source) {
			const sources = Array.isArray(query.source) ? query.source : [query.source];
			filteredMemories = filteredMemories.filter((memory: MemoryItem) => sources.includes(memory.source));
		}
		
		// Tags filter
		if (query.tags && query.tags.length > 0) {
			filteredMemories = filteredMemories.filter((memory: MemoryItem) =>
				query.tags!.some((tag: string) => memory.metadata.tags.includes(tag))
			);
		}
		
		// Related entity filters
		if (query.relatedTo) {
			filteredMemories = filteredMemories.filter((memory: MemoryItem) => {
				const entities = memory.metadata.relatedEntities;
				const relatedTo = query.relatedTo!;
				
				return (
					(!relatedTo.clientId || entities.clientId === relatedTo.clientId) &&
					(!relatedTo.threadId || entities.threadId === relatedTo.threadId) &&
					(!relatedTo.documentId || entities.documentId === relatedTo.documentId) &&
					(!relatedTo.providerId || entities.providerId === relatedTo.providerId) &&
					(!relatedTo.workflowId || entities.workflowId === relatedTo.workflowId) &&
					(!relatedTo.emailId || entities.emailId === relatedTo.emailId)
				);
			});
		}
		
		// Date range filter
		if (query.dateRange) {
			const { from, to } = query.dateRange;
			filteredMemories = filteredMemories.filter((memory: MemoryItem) => {
				const createdAt = memory.metadata.createdAt;
				return (
					(!from || createdAt >= from) &&
					(!to || createdAt <= to)
				);
			});
		}
		
		// Importance threshold
		if (query.minImportance) {
			filteredMemories = filteredMemories.filter((memory: MemoryItem) => memory.metadata.importance >= query.minImportance!);
		}
		
		// Confidence threshold
		if (query.minConfidence) {
			filteredMemories = filteredMemories.filter((memory: MemoryItem) => memory.metadata.confidence >= query.minConfidence!);
		}
		
		// Text search (simple substring match on summary)
		if (query.textSearch) {
			const searchTerm = query.textSearch.toLowerCase();
			filteredMemories = filteredMemories.filter((memory: MemoryItem) =>
				memory.summary.toLowerCase().includes(searchTerm) ||
				memory.metadata.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm))
			);
		}
		
		// Embedding similarity search (placeholder - would require vector database)
		if (query.embeddingSimilarity) {
			// For now, just return all memories
			// In production, this would use a vector database like Pinecone, Weaviate, or pgvector
			console.warn('Embedding similarity search not implemented - returning all filtered memories');
		}
		
		// Sort results
		if (query.sortBy) {
			filteredMemories.sort((a: MemoryItem, b: MemoryItem) => {
				let aValue: any, bValue: any;
				
				switch (query.sortBy) {
					case 'createdAt':
						aValue = a.metadata.createdAt.getTime();
						bValue = b.metadata.createdAt.getTime();
						break;
					case 'lastAccessedAt':
						aValue = a.metadata.lastAccessedAt.getTime();
						bValue = b.metadata.lastAccessedAt.getTime();
						break;
					case 'importance':
						aValue = a.metadata.importance;
						bValue = b.metadata.importance;
						break;
					case 'confidence':
						aValue = a.metadata.confidence;
						bValue = b.metadata.confidence;
						break;
					default:
						aValue = 0;
						bValue = 0;
				}
				
				const order = query.sortOrder === 'asc' ? 1 : -1;
				return (aValue - bValue) * order;
			});
		}
		
		// Apply limit
		const hasMore = query.limit ? filteredMemories.length > query.limit : false;
		const items = query.limit ? filteredMemories.slice(0, query.limit) : filteredMemories;
		
		const executionTimeMs = Date.now() - startTime;
		
		return {
			items,
			total: filteredMemories.length,
			executionTimeMs,
			hasMore
		};
	}
	
	/**
	 * Delete a memory item
	 */
	async deleteMemory(id: string): Promise<boolean> {
		const memoryItem = await this.readMemory(id);
		if (!memoryItem) {
			return false;
		}
		
		// Remove from cache
		this.cache.delete(id);
		
		// Remove from storage
		const deleted = await this.storage.deleteMemory(id);
		
		// Emit event
		if (deleted && this.config.emitEvents) {
			this.emitEvent({
				type: 'memory-deleted',
				memoryId: id,
				category: memoryItem.category,
				timestamp: new Date(),
				data: { summary: memoryItem.summary }
			});
		}
		
		return deleted;
	}
	
	/**
	 * Clear memories by category
	 */
	async clearCategory(category: MemoryCategory): Promise<number> {
		const memories = await this.queryMemories({ category });
		
		// Delete each memory
		let deletedCount = 0;
		for (const memory of memories.items) {
			const deleted = await this.deleteMemory(memory.id);
			if (deleted) {
				deletedCount++;
			}
		}
		
		return deletedCount;
	}
	
	/**
	 * Generate embedding for text (placeholder implementation)
	 */
	private async generateEmbedding(text: string): Promise<number[]> {
		// In production, this would call an embedding API (OpenAI, Cohere, etc.)
		// or use a local embedding model
		
		// For now, return a dummy embedding
		const dimension = this.config.embeddingDimension;
		const embedding = new Array(dimension).fill(0);
		
		// Simple hash-based "embedding" for demo purposes
		let hash = 0;
		for (let i = 0; i < text.length; i++) {
			hash = (hash << 5) - hash + text.charCodeAt(i);
			hash |= 0; // Convert to 32-bit integer
		}
		
		// Distribute hash across dimensions
		for (let i = 0; i < dimension; i++) {
			embedding[i] = Math.sin(hash * (i + 1)) * 0.5;
		}
		
		return embedding;
	}
	
	/**
	 * Extract related entities from content
	 */
	private extractRelatedEntities(content: any, category: MemoryCategory): MemoryItem['metadata']['relatedEntities'] {
		const entities: MemoryItem['metadata']['relatedEntities'] = {};
		
		// Extract based on category
		switch (category) {
			case 'client':
				entities.clientId = content.clientId;
				break;
			case 'thread':
				entities.threadId = content.threadId;
				entities.clientId = content.clientId;
				break;
			case 'document':
				entities.documentId = content.documentId;
				entities.clientId = content.clientId;
				break;
			case 'provider':
				entities.providerId = content.providerId;
				break;
			case 'workflow':
				entities.workflowId = content.workflowId;
				break;
			case 'email':
				entities.emailId = content.emailId;
				entities.threadId = content.threadId;
				entities.clientId = content.clientId;
				break;
		}
		
		// Also check for common fields
		if (content.clientId && !entities.clientId) entities.clientId = content.clientId;
		if (content.threadId && !entities.threadId) entities.threadId = content.threadId;
		if (content.documentId && !entities.documentId) entities.documentId = content.documentId;
		if (content.providerId && !entities.providerId) entities.providerId = content.providerId;
		if (content.workflowId && !entities.workflowId) entities.workflowId = content.workflowId;
		if (content.emailId && !entities.emailId) entities.emailId = content.emailId;
		
		return entities;
	}
	
	/**
	 * Summarize content based on category
	 */
	async summarizeContent(
		category: MemoryCategory,
		content: any,
		existingSummary?: string
	): Promise<string> {
		// In production, this would use AI to generate summaries
		// For now, create simple rule-based summaries
		
		switch (category) {
			case 'email':
				return `Email from ${content.from} to ${content.to}: ${content.subject}`;
			
			case 'document':
				return `Document: ${content.title || 'Untitled'} (${content.type})`;
			
			case 'thread':
				return `Thread: ${content.subject || 'No subject'} with ${content.participants?.length || 0} participants`;
			
			case 'client':
				return `Client: ${content.name || content.email || 'Unknown client'}`;
			
			case 'workflow':
				return `Workflow: ${content.name || content.workflowId} - ${content.status || 'unknown status'}`;
			
			case 'provider':
				return `Provider: ${content.providerId} - ${content.status || 'unknown status'}`;
			
			case 'deliverability':
				return `Deliverability: ${content.issue || 'issue'} - score: ${content.score || 'unknown'}`;
			
			default:
				return existingSummary || `Memory in category: ${category}`;
		}
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
	 * Emit memory event
	 */
	private emitEvent(event: MemoryUpdateEvent): void {
		for (const listener of this.eventListeners) {
			try {
				listener(event);
			} catch (error) {
				console.error('Error in memory event listener:', error);
			}
		}
	}
	
	/**
	 * Add event listener
	 */
	addEventListener(listener: (event: MemoryUpdateEvent) => void): void {
		this.eventListeners.push(listener);
	}
	
	/**
	 * Remove event listener
	 */
	removeEventListener(listener: (event: MemoryUpdateEvent) => void): void {
		const index = this.eventListeners.indexOf(listener);
		if (index !== -1) {
			this.eventListeners.splice(index, 1);
		}
	}
	
	/**
	 * Get memory statistics
	 */
	async getStatistics(): Promise<MemoryStatistics> {
		return await this.storage.getStatistics();
	}
	
	/**
	 * Update client profile (placeholder - would be implemented in clientEngine)
	 */
	async updateClientProfile(clientId: string, updates: Partial<ClientProfile>): Promise<ClientProfile> {
		// This would be implemented in the clientEngine
		// For now, throw error to indicate it should be implemented there
		throw new Error('updateClientProfile should be implemented in clientEngine');
	}
	
	/**
	 * Get client profile (placeholder - would be implemented in clientEngine)
	 */
	async getClientProfile(clientId: string): Promise<ClientProfile | null> {
		// This would be implemented in the clientEngine
		// For now, return null
		return null;
	}
	
	/**
	 * Update thread summary (placeholder - would be implemented in threadEngine)
	 */
	async updateThreadSummary(threadId: string, updates: Partial<ThreadSummary>): Promise<ThreadSummary> {
		throw new Error('updateThreadSummary should be implemented in threadEngine');
	}
	
	/**
	 * Get thread summary (placeholder - would be implemented in threadEngine)
	 */
	async getThreadSummary(threadId: string): Promise<ThreadSummary | null> {
		return null;
	}
	
	/**
	 * Update document summary (placeholder - would be implemented in documentEngine)
	 */
	async updateDocumentSummary(documentId: string, updates: Partial<DocumentSummary>): Promise<DocumentSummary> {
		throw new Error('updateDocumentSummary should be implemented in documentEngine');
	}
	
	/**
	 * Get document summary (placeholder - would be implemented in documentEngine)
	 */
	async getDocumentSummary(documentId: string): Promise<DocumentSummary | null> {
		return null;
	}
	
	/**
	 * Update style profile (placeholder - would be implemented in styleEngine)
	 */
	async updateStyleProfile(userId: string, updates: Partial<StyleProfile>): Promise<StyleProfile> {
		throw new Error('updateStyleProfile should be implemented in styleEngine');
	}
	
	/**
	 * Get style profile (placeholder - would be implemented in styleEngine)
	 */
	async getStyleProfile(userId: string): Promise<StyleProfile | null> {
		return null;
	}
	
	/**
	 * Update provider history (placeholder - would be implemented in providerEngine)
	 */
	async updateProviderHistory(providerId: string, updates: Partial<ProviderHistory>): Promise<ProviderHistory> {
		throw new Error('updateProviderHistory should be implemented in providerEngine');
	}
	
	/**
	 * Get provider history (placeholder - would be implemented in providerEngine)
	 */
	async getProviderHistory(providerId: string): Promise<ProviderHistory | null> {
		return null;
	}
	
	/**
	 * Update deliverability history (placeholder - would be implemented in deliverabilityEngine)
	 */
	async updateDeliverabilityHistory(domain: string, updates: Partial<DeliverabilityHistory>): Promise<DeliverabilityHistory> {
		throw new Error('updateDeliverabilityHistory should be implemented in deliverabilityEngine');
	}
	
	/**
	 * Get deliverability history (placeholder - would be implemented in deliverabilityEngine)
	 */
	async getDeliverabilityHistory(domain: string): Promise<DeliverabilityHistory | null> {
		return null;
	}
	
	/**
	 * Update workflow history (placeholder - would be implemented in workflowEngine)
	 */
	async updateWorkflowHistory(workflowId: string, updates: Partial<WorkflowHistory>): Promise<WorkflowHistory> {
		throw new Error('updateWorkflowHistory should be implemented in workflowEngine');
	}
	
	/**
	 * Get workflow history (placeholder - would be implemented in workflowEngine)
	 */
	async getWorkflowHistory(workflowId: string): Promise<WorkflowHistory | null> {
		return null;
	}
}