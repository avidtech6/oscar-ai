// Data fetching functions for sync engine
import { TABLES, getAllRecords } from './localEncrypted'
import { createSyncMetadata, needsSync, type SyncMetadata } from './syncMetadata'

export async function getRecordsNeedingSync(): Promise<Array<{
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

export async function getCloudRecordsForTable(table: string): Promise<any[]> {
  // This would fetch from cloud
  // For now, return empty array
  return []
}