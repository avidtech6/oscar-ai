// Sync Engine Operations Core - Layer 1 Pure Logic
import type { SyncMetadata } from '../syncMetadata'
import type { SyncResult } from '../syncEngineTypes'

// Pure core logic extracted from syncEngineOperations.ts
export async function syncLocalToCloudCore(
  getRecordsNeedingSync: () => Promise<Array<{
    table: string
    recordId: string
    data: any
    metadata: SyncMetadata
  }>>,
  syncToCloud: (table: string, recordId: string, data: any, metadata: SyncMetadata) => Promise<{
    success: boolean
    conflict?: boolean
    resolvedData?: any
  }>,
  updateRecord: (table: string, recordId: string, data: any) => Promise<any>,
  markAsSynced: (metadata: SyncMetadata) => SyncMetadata
): Promise<Omit<SyncResult, 'newRecords' | 'deletedRecords'>> {
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
    const recordsToSync = await getRecordsNeedingSync()

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

export async function syncCloudToLocalCore(
  tables: string[],
  getCloudRecordsForTable: (table: string) => Promise<any[]>,
  getRecord: (table: string, recordId: string) => Promise<any>,
  createSyncMetadata: (tableName: string, recordId: string, data: any) => Promise<SyncMetadata>,
  syncFromCloud: (table: string, recordId: string, localData: any, localMetadata: SyncMetadata) => Promise<{
    success: boolean
    conflict?: boolean
    source: 'local' | 'cloud' | 'merged'
    data?: any
    metadata?: SyncMetadata
  }>,
  storeRecord: (table: string, recordId: string, data: any) => Promise<any>,
  updateRecord: (table: string, recordId: string, data: any) => Promise<any>
): Promise<Pick<SyncResult, 'success' | 'syncedRecords' | 'failedRecords' | 'conflictedRecords' | 'newRecords' | 'updatedRecords' | 'deletedRecords' | 'errors' | 'duration'>> {
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
    for (const table of tables) {
      try {
        const cloudRecords = await getCloudRecordsForTable(table)

        for (const cloudRecord of cloudRecords) {
          try {
            const localData = await getRecord(table, cloudRecord.id)
            let localMetadata: SyncMetadata | null = null

            if (localData) {
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
                await storeRecord(table, cloudRecord.id, syncResult.data!)
                result.newRecords++
              } else if (syncResult.source !== 'local') {
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

// Pure utility functions for sync operations
export function calculateSyncEfficiency(result: SyncResult): {
  successRate: number
  conflictRate: number
  recordsPerSecond: number
  efficiencyScore: number
} {
  const totalRecords = result.syncedRecords + result.failedRecords + result.conflictedRecords
  const successRate = totalRecords > 0 ? result.syncedRecords / totalRecords : 0
  const conflictRate = totalRecords > 0 ? result.conflictedRecords / totalRecords : 0
  const durationSeconds = result.duration / 1000
  const recordsPerSecond = durationSeconds > 0 ? totalRecords / durationSeconds : 0
  
  // Efficiency score based on success rate and conflict rate
  const efficiencyScore = successRate * (1 - conflictRate * 0.5) * 100
  
  return {
    successRate,
    conflictRate,
    recordsPerSecond,
    efficiencyScore
  }
}

export function formatSyncDuration(duration: number): string {
  if (duration < 1000) {
    return `${duration}ms`
  } else if (duration < 60000) {
    return `${(duration / 1000).toFixed(1)}s`
  } else {
    const minutes = Math.floor(duration / 60000)
    const seconds = Math.floor((duration % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }
}

export function generateSyncSummary(result: SyncResult): string {
  const efficiency = calculateSyncEfficiency(result)
  
  const parts = [
    `Sync ${result.success ? 'completed' : 'failed'} in ${formatSyncDuration(result.duration)}`,
    `${result.syncedRecords} records synced`
  ]
  
  if (result.newRecords > 0) {
    parts.push(`${result.newRecords} new records`)
  }
  
  if (result.updatedRecords > 0) {
    parts.push(`${result.updatedRecords} updated records`)
  }
  
  if (result.deletedRecords > 0) {
    parts.push(`${result.deletedRecords} deleted records`)
  }
  
  if (result.conflictedRecords > 0) {
    parts.push(`${result.conflictedRecords} conflicts resolved`)
  }
  
  if (result.failedRecords > 0) {
    parts.push(`${result.failedRecords} failed`)
  }
  
  if (efficiency.efficiencyScore < 90) {
    parts.push(`Efficiency: ${efficiency.efficiencyScore.toFixed(1)}%`)
  }
  
  return parts.join(', ')
}