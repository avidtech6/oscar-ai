// Sync Engine - Main orchestrator for offline sync and cloud merge
import { browser } from '$app/environment'
import { TABLES, storeRecord, updateRecord, deleteRecord, getRecord, getAllRecords } from './localEncrypted'
import { createSyncMetadata, updateSyncMetadata, markAsSynced, markAsConflicted, resolveConflict, needsSync, SYNC_CONFIG, type SyncMetadata } from './syncMetadata'
import { syncQueueManager, addToQueue, getPendingItems, processPendingItems } from './syncQueue'
import { cloudStorageManager, syncToCloud, syncFromCloud, checkCloudConnectivity, getCloudStorageStats } from './supabaseCloud'

// Sync engine configuration
export interface SyncEngineConfig {
  autoSyncEnabled: boolean
  autoSyncInterval: number
  conflictResolutionStrategy: 'simple' | 'intelligent'
  maxRetryAttempts: number
  batchSize: number
}

// Default configuration
export const DEFAULT_SYNC_CONFIG: SyncEngineConfig = {
  autoSyncEnabled: true,
  autoSyncInterval: SYNC_CONFIG.AUTO_SYNC_INTERVAL,
  conflictResolutionStrategy: SYNC_CONFIG.CONFLICT_RESOLUTION_STRATEGY,
  maxRetryAttempts: SYNC_CONFIG.MAX_RETRY_ATTEMPTS,
  batchSize: SYNC_CONFIG.BATCH_SIZE
}

// Sync status
export interface SyncStatus {
  isSyncing: boolean
  lastSyncTime: number | null
  connectivity: {
    connected: boolean
    authenticated: boolean
    latency: number | null
  }
  queueStats: {
    pending: number
    processing: number
    failed: number
    completed: number
  }
  cloudStats: {
    totalRecords: number
    totalSize: number
    lastSync: string | null
  }
  localStats: {
    totalRecords: number
    byTable: Record<string, number>
  }
}

// Sync result
export interface SyncResult {
  success: boolean
  syncedRecords: number
  failedRecords: number
  conflictedRecords: number
  newRecords: number
  updatedRecords: number
  deletedRecords: number
  errors: string[]
  duration: number
}

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
    const result: Omit<SyncResult, 'newRecords' | 'deletedRecords'> = {
      success: true,
      syncedRecords: 0,
      failedRecords: 0,
      conflictedRecords: 0,
      updatedRecords: 0,
      errors: [],
      duration: 0
    }

    const startTime = Date.now()

    try {
      // Get all local records that need sync
      const recordsToSync = await this.getRecordsNeedingSync()

      for (const { table, recordId, data, metadata } of recordsToSync) {
        try {
          const syncResult = await syncToCloud(table, recordId, data, metadata)

          if (syncResult.success) {
            result.syncedRecords++
            
            if (syncResult.conflict) {
              result.conflictedRecords++
              
              // Update local with resolved data if there was a conflict
              if (syncResult.resolvedData) {
                await updateRecord(table, recordId, syncResult.resolvedData)
                result.updatedRecords++
              }
            } else {
              result.updatedRecords++
            }

            // Mark as synced in local metadata
            const updatedMetadata = markAsSynced(metadata)
            // TODO: Store updated metadata
          } else {
            result.failedRecords++
            result.errors.push(`Failed to sync ${table}/${recordId}`)
          }
        } catch (error: any) {
          result.failedRecords++
          result.errors.push(`Error syncing ${table}/${recordId}: ${error.message}`)
          console.error(`Error syncing ${table}/${recordId}:`, error)
        }
      }

      result.success = result.failedRecords === 0
    } catch (error: any) {
      result.success = false
      result.errors.push(`Sync to cloud failed: ${error.message}`)
    }

    result.duration = Date.now() - startTime
    return result
  }

  // Sync cloud records to local
  private async syncCloudToLocal(): Promise<Pick<SyncResult, 'success' | 'syncedRecords' | 'failedRecords' | 'conflictedRecords' | 'newRecords' | 'updatedRecords' | 'deletedRecords' | 'errors' | 'duration'>> {
    const result: Pick<SyncResult, 'success' | 'syncedRecords' | 'failedRecords' | 'conflictedRecords' | 'newRecords' | 'updatedRecords' | 'deletedRecords' | 'errors' | 'duration'> = {
      success: true,
      syncedRecords: 0,
      failedRecords: 0,
      conflictedRecords: 0,
      newRecords: 0,
      updatedRecords: 0,
      deletedRecords: 0,
      errors: [],
      duration: 0
    }

    const startTime = Date.now()

    try {
      // For each table, get cloud records and sync them
      for (const table of Object.values(TABLES)) {
        try {
          const cloudRecords = await this.getCloudRecordsForTable(table)

          for (const cloudRecord of cloudRecords) {
            try {
              // Get local record if it exists
              const localData = await getRecord(table, cloudRecord.id)
              let localMetadata: SyncMetadata | null = null

              if (localData) {
                // Create metadata for local data
                localMetadata = await createSyncMetadata(table, cloudRecord.id, localData)
              }

              const syncResult = await syncFromCloud(
                table,
                cloudRecord.id,
                localData || {},
                localMetadata || await createSyncMetadata(table, cloudRecord.id, {})
              )

              if (syncResult.success) {
                result.syncedRecords++

                if (syncResult.conflict) {
                  result.conflictedRecords++
                }

                if (!localData) {
                  // New record from cloud
                  await storeRecord(table, cloudRecord.id, syncResult.data!)
                  result.newRecords++
                } else if (syncResult.source !== 'local') {
                  // Updated record from cloud
                  await updateRecord(table, cloudRecord.id, syncResult.data!)
                  result.updatedRecords++
                }
              } else {
                result.failedRecords++
                result.errors.push(`Failed to sync ${table}/${cloudRecord.id} from cloud`)
              }
            } catch (error: any) {
              result.failedRecords++
              result.errors.push(`Error syncing ${table}/${cloudRecord.id} from cloud: ${error.message}`)
              console.error(`Error syncing ${table}/${cloudRecord.id} from cloud:`, error)
            }
          }
        } catch (error: any) {
          result.errors.push(`Error fetching cloud records for table ${table}: ${error.message}`)
          console.error(`Error fetching cloud records for table ${table}:`, error)
        }
      }

      result.success = result.failedRecords === 0
    } catch (error: any) {
      result.success = false
      result.errors.push(`Sync from cloud failed: ${error.message}`)
    }

    result.duration = Date.now() - startTime
    return result
  }

  // Get local records that need sync
  private async getRecordsNeedingSync(): Promise<Array<{
    table: string
    recordId: string
    data: any
    metadata: SyncMetadata
  }>> {
    const records: Array<{
      table: string
      recordId: string
      data: any
      metadata: SyncMetadata
    }> = []

    // For each table, get all records
    for (const table of Object.values(TABLES)) {
      try {
        const tableRecords = await getAllRecords(table)

        for (const record of tableRecords) {
          // Create metadata for the record
          const metadata = await createSyncMetadata(table, record.id, record.data)

          // Check if record needs sync
          if (needsSync(metadata)) {
            records.push({
              table,
              recordId: record.id,
              data: record.data,
              metadata
            })
          }
        }
      } catch (error) {
        console.error(`Error getting records from table ${table}:`, error)
      }
    }

    return records
  }

  // Get cloud records for a table
  private async getCloudRecordsForTable(table: string): Promise<any[]> {
    // This would fetch from cloud
    // For now, return empty array
    return []
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
        this.getQueueStats()
      ])

      // Get local stats
      const localStats = await this.getLocalStats()

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

  // Get queue statistics
  private async getQueueStats(): Promise<{
    pending: number
    processing: number
    failed: number
    completed: number
  }> {
    try {
      const pendingItems = await getPendingItems()
      // For now, return simplified stats
      return {
        pending: pendingItems.length,
        processing: 0,
        failed: 0,
        completed: 0
      }
    } catch (error) {
      console.error('Error getting queue stats:', error)
      return {
        pending: 0,
        processing: 0,
        failed: 0,
        completed: 0
      }
    }
  }

  // Get local storage statistics
  private async getLocalStats(): Promise<{
    totalRecords: number
    byTable: Record<string, number>
  }> {
    const byTable: Record<string, number> = {}
    let totalRecords = 0

    try {
      for (const table of Object.values(TABLES)) {
        try {
          const records = await getAllRecords(table)
          byTable[table] = records.length
          totalRecords += records.length
        } catch (error) {
          console.error(`Error getting records from table ${table}:`, error)
          byTable[table] = 0
        }
      }
    } catch (error) {
      console.error('Error getting local stats:', error)
    }

    return {
      totalRecords,
      byTable
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

// Singleton instance
export const syncEngine = new SyncEngine()

// Export convenience functions
export async function initializeSyncEngine(config?: Partial<SyncEngineConfig>): Promise<void> {
  if (config) {
    syncEngine.updateConfig(config)
  }
  return syncEngine.initialize()
}

export async function triggerSync(): Promise<SyncResult> {
  return syncEngine.syncAll()
}

export async function getSyncStatus(): Promise<SyncStatus> {
  return syncEngine.getStatus()
}

export function addSyncListener(listener: (status: SyncStatus) => void): void {
  syncEngine.addListener(listener)
}

export function removeSyncListener(listener: (status: SyncStatus) => void): void {
  syncEngine.removeListener(listener)
}

export function updateSyncConfig(config: Partial<SyncEngineConfig>): void {
  syncEngine.updateConfig(config)
}

export function getSyncConfig(): SyncEngineConfig {
  return syncEngine.getConfig()
}

export function destroySyncEngine(): void {
  syncEngine.destroy()
}