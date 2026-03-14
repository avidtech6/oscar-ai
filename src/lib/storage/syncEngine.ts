// Sync Engine - Main orchestrator for offline sync and cloud merge
import { browser } from '$app/environment'
import { TABLES, storeRecord, updateRecord, deleteRecord, getRecord } from './localEncrypted'
import { createSyncMetadata, markAsSynced, type SyncMetadata } from './syncMetadata'
import { syncQueueManager, processPendingItems } from './syncQueue'
import { syncToCloud, syncFromCloud, checkCloudConnectivity, getCloudStorageStats } from './supabaseCloud'
import { DEFAULT_SYNC_CONFIG, type SyncEngineConfig, type SyncStatus, type SyncResult } from './syncEngineTypes'
import { syncLocalToCloud, syncCloudToLocal } from './syncEngineOperations'
import { getRecordsNeedingSync, getCloudRecordsForTable } from './syncEngineData'
import { getQueueStats, getLocalStats } from './syncEngineStats'

// Sync Engine class
export class SyncEngine {
  private config: SyncEngineConfig
  private isSyncing = false
  private syncIntervalId: number | null = null
  private lastSyncTime: number | null = null
  private syncListeners: Array<(status: SyncStatus) => void> = []

  constructor(config: Partial<SyncEngineConfig> = {}) {
    this.config = { ...DEFAULT_SYNC_CONFIG, ...config }
  }

  // Initialize the sync engine
  async initialize(): Promise<void> {
    if (!browser) {
      return
    }

    console.log('Sync Engine initializing...')

    // Start auto-sync if enabled
    if (this.config.autoSyncEnabled) {
      this.startAutoSync()
    }

    // Start queue processing
    syncQueueManager.startAutoProcessing()

    console.log('Sync Engine initialized')
  }

  // Start automatic sync
  startAutoSync(): void {
    if (!browser || this.syncIntervalId) {
      return
    }

    this.syncIntervalId = window.setInterval(() => {
      this.syncAll().catch(error => {
        console.error('Auto-sync failed:', error)
      })
    }, this.config.autoSyncInterval)

    console.log(`Auto-sync started (interval: ${this.config.autoSyncInterval}ms)`)
  }

  // Stop automatic sync
  stopAutoSync(): void {
    if (this.syncIntervalId) {
      window.clearInterval(this.syncIntervalId)
      this.syncIntervalId = null
      console.log('Auto-sync stopped')
    }
  }

  // Manual sync trigger
  async syncAll(): Promise<SyncResult> {
    if (!browser || this.isSyncing) {
      return {
        success: false,
        syncedRecords: 0,
        failedRecords: 0,
        conflictedRecords: 0,
        newRecords: 0,
        updatedRecords: 0,
        deletedRecords: 0,
        errors: ['Sync already in progress or browser not available'],
        duration: 0
      }
    }

    const startTime = Date.now()
    this.isSyncing = true
    this.notifyListeners()

    try {
      console.log('Starting full sync...')

      // Check connectivity
      const connectivity = await checkCloudConnectivity()
      if (!connectivity.connected || !connectivity.authenticated) {
        throw new Error(`Not connected to cloud: ${connectivity.error || 'Unknown error'}`)
      }

      // Process any pending queue items first
      const queueResult = await processPendingItems()
      console.log(`Queue processed: ${queueResult.succeeded} succeeded, ${queueResult.failed} failed`)

      // Sync local to cloud (push)
      const pushResult = await this.syncLocalToCloud()
      console.log(`Push sync: ${pushResult.syncedRecords} synced, ${pushResult.conflictedRecords} conflicted`)

      // Sync cloud to local (pull)
      const pullResult = await this.syncCloudToLocal()
      console.log(`Pull sync: ${pullResult.syncedRecords} synced, ${pullResult.conflictedRecords} conflicted`)

      // Update last sync time
      this.lastSyncTime = Date.now()

      const result: SyncResult = {
        success: pushResult.success && pullResult.success,
        syncedRecords: pushResult.syncedRecords + pullResult.syncedRecords,
        failedRecords: pushResult.failedRecords + pullResult.failedRecords,
        conflictedRecords: pushResult.conflictedRecords + pullResult.conflictedRecords,
        newRecords: pullResult.newRecords,
        updatedRecords: pushResult.updatedRecords + pullResult.updatedRecords,
        deletedRecords: pullResult.deletedRecords,
        errors: [...pushResult.errors, ...pullResult.errors],
        duration: Date.now() - startTime
      }

      console.log(`Sync completed in ${result.duration}ms`)
      return result

    } catch (error: any) {
      console.error('Sync failed:', error)
      return {
        success: false,
        syncedRecords: 0,
        failedRecords: 0,
        conflictedRecords: 0,
        newRecords: 0,
        updatedRecords: 0,
        deletedRecords: 0,
        errors: [error.message || 'Unknown sync error'],
        duration: Date.now() - startTime
      }
    } finally {
      this.isSyncing = false
      this.notifyListeners()
    }
  }

  // Sync local records to cloud
  private async syncLocalToCloud(): Promise<Omit<SyncResult, 'newRecords' | 'deletedRecords'>> {
    return syncLocalToCloud(
      getRecordsNeedingSync,
      syncToCloud,
      updateRecord,
      markAsSynced
    )
  }

  // Sync cloud records to local
  private async syncCloudToLocal(): Promise<Pick<SyncResult, 'success' | 'syncedRecords' | 'failedRecords' | 'conflictedRecords' | 'newRecords' | 'updatedRecords' | 'deletedRecords' | 'errors' | 'duration'>> {
    return syncCloudToLocal(
      Object.values(TABLES),
      getCloudRecordsForTable,
      getRecord,
      createSyncMetadata,
      syncFromCloud,
      storeRecord,
      updateRecord
    )
  }


  // Get current sync status
  async getStatus(): Promise<SyncStatus> {
    if (!browser) {
      return {
        isSyncing: false,
        lastSyncTime: this.lastSyncTime,
        connectivity: {
          connected: false,
          authenticated: false,
          latency: null
        },
        queueStats: {
          pending: 0,
          processing: 0,
          failed: 0,
          completed: 0
        },
        cloudStats: {
          totalRecords: 0,
          totalSize: 0,
          lastSync: null
        },
        localStats: {
          totalRecords: 0,
          byTable: {}
        }
      }
    }

    try {
      const [connectivity, cloudStats, queueStats] = await Promise.all([
        checkCloudConnectivity(),
        getCloudStorageStats(),
        getQueueStats()
      ])

      // Get local stats
      const localStats = await getLocalStats()

      return {
        isSyncing: this.isSyncing,
        lastSyncTime: this.lastSyncTime,
        connectivity,
        queueStats,
        cloudStats,
        localStats
      }
    } catch (error) {
      console.error('Error getting sync status:', error)
      return {
        isSyncing: this.isSyncing,
        lastSyncTime: this.lastSyncTime,
        connectivity: {
          connected: false,
          authenticated: false,
          latency: null
        },
        queueStats: {
          pending: 0,
          processing: 0,
          failed: 0,
          completed: 0
        },
        cloudStats: {
          totalRecords: 0,
          totalSize: 0,
          lastSync: null
        },
        localStats: {
          totalRecords: 0,
          byTable: {}
        }
      }
    }
  }


  // Add sync status listener
  addListener(listener: (status: SyncStatus) => void): void {
    this.syncListeners.push(listener)
  }

  // Remove sync status listener
  removeListener(listener: (status: SyncStatus) => void): void {
    this.syncListeners = this.syncListeners.filter(l => l !== listener)
  }

  // Notify all listeners
  private notifyListeners(): void {
    if (!browser) {
      return
    }

    this.getStatus().then(status => {
      this.syncListeners.forEach(listener => {
        try {
          listener(status)
        } catch (error) {
          console.error('Error in sync listener:', error)
        }
      })
    }).catch(error => {
      console.error('Error getting status for listeners:', error)
    })
  }

  // Update configuration
  updateConfig(newConfig: Partial<SyncEngineConfig>): void {
    this.config = { ...this.config, ...newConfig }

    // Restart auto-sync if interval changed
    if (this.syncIntervalId && newConfig.autoSyncInterval !== undefined) {
      this.stopAutoSync()
      if (this.config.autoSyncEnabled) {
        this.startAutoSync()
      }
    }

    console.log('Sync engine configuration updated:', this.config)
  }

  // Get current configuration
  getConfig(): SyncEngineConfig {
    return { ...this.config }
  }

  // Cleanup resources
  destroy(): void {
    this.stopAutoSync()
    syncQueueManager.stopAutoProcessing()
    this.syncListeners = []
    console.log('Sync Engine destroyed')
  }
}

// Singleton instance (lazy initialization)
let syncEngineInstance: SyncEngine | null = null

function getSyncEngine(): SyncEngine {
  if (!syncEngineInstance) {
    syncEngineInstance = new SyncEngine()
  }
  return syncEngineInstance
}

// Export convenience functions
export async function initializeSyncEngine(config?: Partial<SyncEngineConfig>): Promise<void> {
  const engine = getSyncEngine()
  if (config) {
    engine.updateConfig(config)
  }
  return engine.initialize()
}

export async function triggerSync(): Promise<SyncResult> {
  const engine = getSyncEngine()
  return engine.syncAll()
}

export async function getSyncStatus(): Promise<SyncStatus> {
  const engine = getSyncEngine()
  return engine.getStatus()
}

export function addSyncListener(listener: (status: SyncStatus) => void): void {
  const engine = getSyncEngine()
  engine.addListener(listener)
}

export function removeSyncListener(listener: (status: SyncStatus) => void): void {
  const engine = getSyncEngine()
  engine.removeListener(listener)
}

export function updateSyncConfig(config: Partial<SyncEngineConfig>): void {
  const engine = getSyncEngine()
  engine.updateConfig(config)
}

export function getSyncConfig(): SyncEngineConfig {
  const engine = getSyncEngine()
  return engine.getConfig()
}

export function destroySyncEngine(): void {
  const engine = getSyncEngine()
  engine.destroy()
}

// Export the getSyncEngine function for external use
export { getSyncEngine }