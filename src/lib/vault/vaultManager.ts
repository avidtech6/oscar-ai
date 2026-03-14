// Vault Manager - Unified interface for API key management
// Combines local encrypted vault with cloud sync capabilities

import type { APIKey, APIKeyInput, SyncStatus, VaultConfig } from './types'
import { VaultKeyOperationsManager } from './vaultKeyOperationsManager'
import { VaultStatsManager } from './vaultStatsManager'
import { VaultImportExportManager } from './vaultImportExportManager'
import { VaultSyncManager } from './vaultSyncManager'
import { clearVault } from './localVault'

// Default configuration
const DEFAULT_CONFIG: VaultConfig = {
	autoSync: true,
	syncInterval: 30000, // 30 seconds
	maxRetries: 3,
	requireBiometric: false
}

// Vault manager class
export class VaultManager {
	private config: VaultConfig
	private isInitialized = false
	private lastSyncTime: Date | null = null
	private keyOperationsManager: VaultKeyOperationsManager
	private statsManager: VaultStatsManager
	private importExportManager: VaultImportExportManager
	private syncManager: VaultSyncManager

	constructor(config: Partial<VaultConfig> = {}) {
		this.config = { ...DEFAULT_CONFIG, ...config }
		this.keyOperationsManager = new VaultKeyOperationsManager()
		this.statsManager = new VaultStatsManager()
		this.importExportManager = new VaultImportExportManager()
		this.syncManager = new VaultSyncManager()
	}

	// Initialize the vault manager
	async initialize(): Promise<void> {
		if (this.isInitialized) {
			return
		}

		try {
			// Initialize auto-sync if enabled
			if (this.config.autoSync) {
				this.startAutoSync()
			}

			this.isInitialized = true
			console.log('Vault manager initialized')
		} catch (error) {
			console.error('Failed to initialize vault manager:', error)
			throw error
		}
	}

	// Start automatic sync
	startAutoSync(): void {
		this.syncManager.startAutoSync(this.config.syncInterval)
	}

	// Stop automatic sync
	stopAutoSync(): void {
		this.syncManager.stopAutoSync()
	}

	// Add sync listener
	addSyncListener(listener: (status: SyncStatus) => void): void {
		this.syncManager.addSyncListener(listener)
	}

	// Remove sync listener
	removeSyncListener(listener: (status: SyncStatus) => void): void {
		this.syncManager.removeSyncListener(listener)
	}

	// Add a new API key
	async addKey(keyInput: APIKeyInput): Promise<APIKey> {
		if (!this.isInitialized) {
			await this.initialize()
		}

		try {
			const key = await this.keyOperationsManager.addKey(keyInput, this.config.autoSync, () => {
				this.sync().catch(() => { /* Ignore sync errors */ })
			})
			return key
		} catch (error) {
			console.error('Failed to add key:', error)
			throw error
		}
	}

	// Get a key by ID
	async getKey(id: string): Promise<APIKey | null> {
		if (!this.isInitialized) {
			await this.initialize()
		}

		return this.keyOperationsManager.getKey(id)
	}

	// Get all keys
	async getAllKeys(): Promise<APIKey[]> {
		if (!this.isInitialized) {
			await this.initialize()
		}

		return this.keyOperationsManager.getAllKeys()
	}

	// Update a key
	async updateKey(id: string, updates: Partial<APIKeyInput>): Promise<APIKey> {
		if (!this.isInitialized) {
			await this.initialize()
		}

		return this.keyOperationsManager.updateKey(id, updates)
	}

	// Delete a key
	async deleteKey(id: string): Promise<void> {
		if (!this.isInitialized) {
			await this.initialize()
		}

		await this.keyOperationsManager.deleteKey(id)
	}

	// Sync local and cloud vaults
	async sync(): Promise<SyncStatus> {
		if (!this.isInitialized) {
			await this.initialize()
		}

		const result = await this.syncManager.sync()
		if (result.status === 'success') {
			this.lastSyncTime = new Date()
		}
		return result
	}

	// Get vault statistics
	async getStats(): Promise<any> {
		if (!this.isInitialized) {
			await this.initialize()
		}

		return this.statsManager.getStats(this.lastSyncTime)
	}

	// Export vault data
	async exportVault(): Promise<string> {
		if (!this.isInitialized) {
			await this.initialize()
		}

		return this.importExportManager.exportVault()
	}

	// Import vault data
	async importVault(data: string): Promise<void> {
		if (!this.isInitialized) {
			await this.initialize()
		}

		await this.importExportManager.importVault(data)
	}

	// Clear all data (local only)
	async clearLocalVault(): Promise<void> {
		if (!this.isInitialized) {
			await this.initialize()
		}

		await clearVault()
	}

	// Check if biometric authentication is required
	isBiometricRequired(): boolean {
		return this.config.requireBiometric
	}

	// Set biometric requirement
	setBiometricRequired(required: boolean): void {
		this.config.requireBiometric = required
	}

	// Get configuration
	getConfig(): VaultConfig {
		return { ...this.config }
	}

	// Update configuration
	updateConfig(newConfig: Partial<VaultConfig>): void {
		this.config = { ...this.config, ...newConfig }

		// Restart auto-sync if interval changed
		if (newConfig.syncInterval && this.config.autoSync) {
			this.stopAutoSync()
			this.startAutoSync()
		}
	}

	// Cleanup resources
	cleanup(): void {
		this.stopAutoSync()
		this.isInitialized = false
	}
}

// Create singleton instance
export const vaultManager = new VaultManager()

// Export types
export type { VaultConfig, SyncStatus }