// Sync Engine - Layer 2 Presentation
// Main orchestrator for offline sync and cloud merge
// Core logic extracted to Layer 1 for purity and reusability

import { browser } from '$app/environment'
import { TABLES, storeRecord, updateRecord, deleteRecord, getRecord } from './localEncrypted'
import { createSyncMetadata, markAsSynced } from './syncMetadata'
import type { SyncMetadata } from './layer1/syncMetadataCoreTypes'
import { syncQueueManager, processPendingItems } from './syncQueue'
import { syncToCloud, syncFromCloud, checkCloudConnectivity, getCloudStorageStats } from './supabaseCloud'
import { DEFAULT_SYNC_CONFIG, type SyncEngineConfig, type SyncStatus, type SyncResult } from './syncEngineTypes'
import { syncLocalToCloud, syncCloudToLocal } from './syncEngineOperations'
import { getRecordsNeedingSync, getCloudRecordsForTable } from './syncEngineData'
import { getQueueStats, getLocalStats } from './syncEngineStats'
import { aggregateSyncResultsCore } from './layer1/syncEngineAggregateResultsCore'

// Sync Engine class - Layer 2 Presentation
// Delegates core logic to Layer 1 while preserving presentation layer functionality
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
      const pushResult = await syncLocalToCloud(
        getRecordsNeedingSync,
        syncToCloud,
        updateRecord,
        markAsSynced
      )

      // Sync cloud to local (pull)
      const pullResult = await syncCloudToLocal(
        Object.values(TABLES),
        getCloudRecordsForTable,
        getRecord,
        createSyncMetadata,
        syncFromCloud,
        storeRecord,
        updateRecord
      )

      // Aggregate results using Layer 1 pure function
      const finalResult = aggregateSyncResultsCore(pushResult as any, pullResult as any)
      finalResult.duration = Date.now() - startTime

      this.isSyncing = false
      this.lastSyncTime = Date.now()
      this.notifyListeners()

      console.log(`Sync completed in ${finalResult.duration}ms`)
      return finalResult

    } catch (error) {
      this.isSyncing = false
      this.notifyListeners()

      const errorResult: SyncResult = {
        success: false,
        syncedRecords: 0,
        failedRecords: 0,
        conflictedRecords: 0,
        newRecords: 0,
        updatedRecords: 0,
        deletedRecords: 0,
        errors: [error instanceof Error ? error.message : 'Unknown sync error'],
        duration: Date.now() - startTime
      }

      console.error('Sync failed:', error)
      return errorResult
    }
  }

  // Sync specific table
  async syncTable(tableName: string): Promise<SyncResult> {
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
      console.log(`Starting sync for table: ${tableName}`)

      // Get records needing sync for this table
      const recordsNeedingSync = await getRecordsNeedingSync()
      const cloudRecords = await getCloudRecordsForTable(tableName)

      // Sync logic would go here
      // For now, return a simple result
      const result: SyncResult = {
        success: true,
        syncedRecords: recordsNeedingSync.length,
        failedRecords: 0,
        conflictedRecords: 0,
        newRecords: cloudRecords.length,
        updatedRecords: 0,
        deletedRecords: 0,
        errors: [],
        duration: Date.now() - startTime
      }

      this.isSyncing = false
      this.lastSyncTime = Date.now()
      this.notifyListeners()

      return result
    } catch (error) {
      this.isSyncing = false
      this.notifyListeners()

      return {
        success: false,
        syncedRecords: 0,
        failedRecords: 0,
        conflictedRecords: 0,
        newRecords: 0,
        updatedRecords: 0,
        deletedRecords: 0,
        errors: [error instanceof Error ? error.message : 'Unknown sync error'],
        duration: Date.now() - startTime
      }
    }
  }

  // Get sync status
  getStatus(): SyncStatus {
    return {
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      connectivity: {
        connected: true, // This would come from cloud manager
        authenticated: true, // This would come from cloud manager
        latency: null
      },
      queueStats: {
        pending: 0,
        processing: 0,
        failed: 0,
        completed: 0
      },
      cloudStats: {
        totalRecords: 0, // This would come from cloud manager
        totalSize: 0, // This would come from cloud manager
        lastSync: this.lastSyncTime ? new Date(this.lastSyncTime).toISOString() : null
      },
      localStats: {
        totalRecords: 0, // This would come from local stats
        byTable: {} // This would come from local stats
      }
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

  // Get sync statistics
  getStats() {
    return {
      ...getQueueStats(),
      ...getLocalStats(),
      lastSyncTime: this.lastSyncTime,
      isSyncing: this.isSyncing
    }
  }

  // Force sync now
  async forceSync(): Promise<SyncResult> {
    return this.syncAll()
  }

  // Pause sync
  pauseSync(): void {
    this.stopAutoSync()
  }

  // Resume sync
  resumeSync(): void {
    if (this.config.autoSyncEnabled) {
      this.startAutoSync()
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<SyncEngineConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  // Get configuration
  getConfig(): SyncEngineConfig {
    return this.config
  }

  // Notify all listeners
  private notifyListeners(): void {
    const status = this.getStatus()
    this.syncListeners.forEach(listener => {
      try {
        listener(status)
      } catch (error) {
        console.error('Error in sync listener:', error)
      }
    })
  }
}

export async function initializeSyncEngine(deps) {
  const engine = new SyncEngine(deps);
  await engine.initialize();
  return engine;
}