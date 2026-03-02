// Vault Manager - Unified interface for API key management
// Combines local encrypted vault with cloud sync capabilities

import type { APIKey, APIKeyInput, SyncStatus, VaultStats, VaultConfig } from './types'

// Import local vault functions
import {
  storeApiKey as localStoreApiKey,
  getApiKey as localGetApiKey,
  getAllApiKeys as localGetAllApiKeys,
  updateApiKey as localUpdateApiKey,
  deleteApiKey as localDeleteApiKey,
  exportEncryptedKeys as localExportVault,
  importEncryptedKeys as localImportVault,
  clearVault as localClearVault,
  getVaultStats as localGetStats,
  encryptApiKey,
  type ApiKey as LocalApiKey
} from './localVault'

// Import cloud vault functions
import {
  uploadToCloud,
  downloadFromCloud,
  listCloudKeys,
  deleteFromCloud,
  bulkUploadToCloud,
  bulkDownloadFromCloud,
  getCloudVaultStats,
  checkCloudConnectivity,
  cloudVaultManager,
  type CloudApiKey
} from './cloudVault'

// Helper function to convert LocalApiKey to APIKey
function localToStandard(localKey: LocalApiKey): APIKey {
  return {
    id: localKey.id,
    keyName: localKey.keyName,
    provider: localKey.provider,
    modelFamily: localKey.modelFamily,
    encryptedKey: localKey.encryptedKey,
    iv: localKey.iv,
    keyVersion: localKey.keyVersion,
    isActive: localKey.isActive,
    lastUsedAt: localKey.lastUsedAt,
    usageCount: localKey.usageCount,
    rotationDueAt: localKey.rotationDueAt,
    createdAt: localKey.createdAt,
    updatedAt: localKey.updatedAt,
    localHash: localKey.localHash,
    lastSyncedAt: localKey.lastSyncedAt,
    cloudId: localKey.id // Local ID used as cloud ID for now
  }
}

// Helper function to convert APIKeyInput to local storage format
async function prepareKeyForLocal(keyInput: APIKeyInput): Promise<{
  keyName: string
  plaintextKey: string
  provider: LocalApiKey['provider']
  modelFamily?: string
}> {
  return {
    keyName: keyInput.keyName,
    plaintextKey: keyInput.plaintextKey,
    provider: keyInput.provider,
    modelFamily: keyInput.modelFamily
  }
}

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
  private syncIntervalId: number | null = null
  private isInitialized = false
  private syncInProgress = false
  private lastSyncTime: Date | null = null
  private syncListeners: Array<(status: SyncStatus) => void> = []

  constructor(config: Partial<VaultConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
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
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId)
    }

    this.syncIntervalId = window.setInterval(() => {
      this.sync().catch(error => {
        console.warn('Auto-sync failed:', error)
      })
    }, this.config.syncInterval)

    console.log(`Auto-sync started (interval: ${this.config.syncInterval}ms)`)
  }

  // Stop automatic sync
  stopAutoSync(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId)
      this.syncIntervalId = null
      console.log('Auto-sync stopped')
    }
  }

  // Add sync listener
  addSyncListener(listener: (status: SyncStatus) => void): void {
    this.syncListeners.push(listener)
  }

  // Remove sync listener
  removeSyncListener(listener: (status: SyncStatus) => void): void {
    this.syncListeners = this.syncListeners.filter(l => l !== listener)
  }

  // Notify sync listeners
  private notifySyncListeners(status: SyncStatus): void {
    this.syncListeners.forEach(listener => {
      try {
        listener(status)
      } catch (error) {
        console.error('Sync listener error:', error)
      }
    })
  }

  // Add a new API key
  async addKey(keyInput: APIKeyInput): Promise<APIKey> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      // Prepare key for local storage
      const localInput = await prepareKeyForLocal(keyInput)
      
      // Store in local vault
      const localKey = await localStoreApiKey(
        localInput.keyName,
        localInput.plaintextKey,
        localInput.provider,
        localInput.modelFamily
      )

      // Convert to standard format
      const standardKey = localToStandard(localKey)

      // If cloud is available, sync immediately
      const connectivity = await checkCloudConnectivity()
      if (connectivity.connected && connectivity.authenticated) {
        try {
          await uploadToCloud(localKey)
          console.log(`Key ${standardKey.id} synced to cloud`)
        } catch (cloudError) {
          console.warn('Failed to sync key to cloud:', cloudError)
          // Key remains local-only
        }
      }

      // Trigger sync if auto-sync is enabled
      if (this.config.autoSync) {
        setTimeout(() => {
          this.sync().catch(() => { /* Ignore sync errors */ })
        }, 1000)
      }

      return standardKey
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

    // Try local vault first
    const localKey = await localGetApiKey(id)
    if (localKey) {
      return localToStandard(localKey)
    }

    // If not found locally, try cloud
    const connectivity = await checkCloudConnectivity()
    if (connectivity.connected && connectivity.authenticated) {
      try {
        const cloudKey = await downloadFromCloud(id)
        if (cloudKey) {
          // Store locally for future access
          const localInput = await prepareKeyForLocal({
            keyName: cloudKey.keyName,
            plaintextKey: '', // We don't have plaintext, but we have encrypted data
            provider: cloudKey.provider,
            modelFamily: cloudKey.modelFamily
          })
          
          // Note: We can't store without plaintext, so we'd need to handle this differently
          // For now, just return the cloud key
          return localToStandard(cloudKey)
        }
      } catch (error) {
        console.warn('Failed to fetch key from cloud:', error)
      }
    }

    return null
  }

  // Get all keys
  async getAllKeys(): Promise<APIKey[]> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const localKeys = await localGetAllApiKeys()
    const standardKeys = localKeys.map(localToStandard)

    // If cloud is available, sync to get latest
    const connectivity = await checkCloudConnectivity()
    if (connectivity.connected && connectivity.authenticated) {
      try {
        await this.sync()
        // Return updated local keys after sync
        const updatedLocalKeys = await localGetAllApiKeys()
        return updatedLocalKeys.map(localToStandard)
      } catch (error) {
        console.warn('Sync failed, returning local keys:', error)
      }
    }

    return standardKeys
  }

  // Update a key
  async updateKey(id: string, updates: Partial<APIKeyInput>): Promise<APIKey> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      // Get existing key
      const existingKey = await localGetApiKey(id)
      if (!existingKey) {
        throw new Error(`Key ${id} not found`)
      }

      // Prepare updates for local vault
      const localUpdates: Partial<Omit<LocalApiKey, 'id' | 'encryptedKey' | 'iv' | 'createdAt'>> = {}
      
      if (updates.keyName !== undefined) localUpdates.keyName = updates.keyName
      if (updates.provider !== undefined) localUpdates.provider = updates.provider
      if (updates.modelFamily !== undefined) localUpdates.modelFamily = updates.modelFamily
      if (updates.isActive !== undefined) localUpdates.isActive = updates.isActive

      // Update local vault
      const updatedLocalKey = await localUpdateApiKey(id, localUpdates)
      if (!updatedLocalKey) {
        throw new Error(`Failed to update key ${id}`)
      }

      // If cloud is available, update cloud
      const connectivity = await checkCloudConnectivity()
      if (connectivity.connected && connectivity.authenticated) {
        try {
          await uploadToCloud(updatedLocalKey)
        } catch (cloudError) {
          console.warn('Failed to update key in cloud:', cloudError)
        }
      }

      return localToStandard(updatedLocalKey)
    } catch (error) {
      console.error('Failed to update key:', error)
      throw error
    }
  }

  // Delete a key
  async deleteKey(id: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      // Delete from local vault
      await localDeleteApiKey(id)

      // If cloud is available, delete from cloud
      const connectivity = await checkCloudConnectivity()
      if (connectivity.connected && connectivity.authenticated) {
        try {
          await deleteFromCloud(id)
        } catch (cloudError) {
          console.warn('Failed to delete key from cloud:', cloudError)
        }
      }
    } catch (error) {
      console.error('Failed to delete key:', error)
      throw error
    }
  }

  // Sync local and cloud vaults
  async sync(): Promise<SyncStatus> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    if (this.syncInProgress) {
      return { status: 'in-progress', message: 'Sync already in progress', timestamp: new Date() }
    }

    this.syncInProgress = true
    const startTime = Date.now()

    try {
      // Check cloud availability
      const connectivity = await checkCloudConnectivity()
      if (!connectivity.connected) {
        const status: SyncStatus = {
          status: 'offline',
          message: 'Cloud not available',
          timestamp: new Date()
        }
        this.notifySyncListeners(status)
        return status
      }

      this.notifySyncListeners({
        status: 'in-progress',
        message: 'Starting sync...',
        timestamp: new Date()
      })

      // Get local keys
      const localKeys = await localGetAllApiKeys()

      // Perform sync using cloud vault manager
      const syncResult = await cloudVaultManager.syncAll(localKeys)

      const status: SyncStatus = {
        status: 'success',
        message: `Sync completed: ${syncResult.uploaded} uploaded, ${syncResult.downloaded} downloaded, ${syncResult.conflicts} conflicts`,
        timestamp: new Date(),
        details: {
          added: syncResult.downloaded,
          updated: syncResult.uploaded,
          conflicts: syncResult.conflicts
        }
      }

      this.lastSyncTime = new Date()
      this.notifySyncListeners(status)
      return status

    } catch (error: any) {
      const status: SyncStatus = {
        status: 'error',
        message: `Sync failed: ${error.message}`,
        timestamp: new Date(),
        error: error.message
      }

      this.notifySyncListeners(status)
      return status

    } finally {
      this.syncInProgress = false
    }
  }

  // Get vault statistics
  async getStats(): Promise<VaultStats> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const localKeys = await localGetAllApiKeys()
    const connectivity = await checkCloudConnectivity()

    const stats: VaultStats = {
      totalKeys: localKeys.length,
      localKeys: localKeys.length,
      cloudKeys: 0,
      syncedKeys: localKeys.filter((k: LocalApiKey) => k.lastSyncedAt).length,
      lastSync: this.lastSyncTime,
      cloudAvailable: connectivity.connected && connectivity.authenticated,
      providers: {}
    }

    // Count by provider
    localKeys.forEach((key: LocalApiKey) => {
      stats.providers[key.provider] = (stats.providers[key.provider] || 0) + 1
    })

    // Get cloud stats if available
    if (connectivity.connected && connectivity.authenticated) {
      try {
        const cloudStats = await getCloudVaultStats()
        stats.cloudKeys = cloudStats.totalKeys
      } catch (error) {
        console.warn('Failed to get cloud stats:', error)
      }
    }

    return stats
  }

  // Export vault data
  async exportVault(): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    return localExportVault()
  }

  // Import vault data
  async importVault(data: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    await localImportVault(data)
    
    // Sync imported data to cloud
    if (this.config.autoSync) {
      const connectivity = await checkCloudConnectivity()
      if (connectivity.connected && connectivity.authenticated) {
        setTimeout(() => {
          this.sync().catch(() => { /* Ignore sync errors */ })
        }, 2000)
      }
    }
  }

  // Clear all data (local only)
  async clearLocalVault(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    await localClearVault()
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
    if (newConfig.syncInterval && this.syncIntervalId) {
      this.stopAutoSync()
      if (this.config.autoSync) {
        this.startAutoSync()
      }
    }
  }

  // Cleanup resources
  cleanup(): void {
    this.stopAutoSync()
    this.syncListeners = []
    this.isInitialized = false
  }
}

// Create singleton instance
export const vaultManager = new VaultManager()

// Export types
export type { VaultConfig, SyncStatus, VaultStats }