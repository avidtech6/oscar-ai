// Sync engine operations (pure functions)
import type { SyncMetadata } from './syncMetadata'
import type { SyncResult } from './syncEngineTypes'

export async function syncLocalToCloud(
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

export async function syncCloudToLocal(
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