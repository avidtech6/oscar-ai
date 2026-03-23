// Data fetching functions for sync engine - Layer 2 Presentation
// Core logic extracted to Layer 1 for purity and reusability

import { TABLES, getAllRecords } from './localEncrypted'
import { createSyncMetadata, needsSync } from './syncMetadata'
import type { SyncMetadata } from './layer1/syncMetadataCoreTypes'
import { getRecordsNeedingSyncCore, getCloudRecordsForTableCore } from './layer1/syncEngineDataCore'

export async function getRecordsNeedingSync(): Promise<Array<{
  table: string
  recordId: string
  data: any
  metadata: SyncMetadata
}>> {
  // Delegate to Layer 1 pure core logic
  return getRecordsNeedingSyncCore(
    getAllRecords,
    createSyncMetadata,
    needsSync,
    Object.values(TABLES)
  )
}

export async function getCloudRecordsForTable(table: string): Promise<any[]> {
  // Delegate to Layer 1 pure core logic
  return getCloudRecordsForTableCore(() => {
    // This would fetch from cloud
    // For now, return empty array
    return Promise.resolve([])
  })
}