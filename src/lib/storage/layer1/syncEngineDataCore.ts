// Sync engine data operations - Layer 1 Core
// Pure data fetching logic extracted from Layer 2 presentation

import type { SyncMetadata } from './syncMetadataCoreTypes'

export async function getRecordsNeedingSyncCore(
  getAllRecords: (table: string) => Promise<any[]>,
  createSyncMetadata: (tableName: string, recordId: string, data: any) => Promise<SyncMetadata>,
  needsSync: (metadata: SyncMetadata) => boolean,
  tables: string[]
): Promise<Array<{
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
  for (const table of tables) {
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

export async function getCloudRecordsForTableCore(
  fetchFromCloud: (table: string) => Promise<any[]>
): Promise<any[]> {
  // This would fetch from cloud
  // For now, return empty array
  return []
}