// Statistics functions for sync engine
import { TABLES, getAllRecords } from './localEncrypted'
import { getPendingItems } from './syncQueue'

export async function getQueueStats(): Promise<{
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

export async function getLocalStats(): Promise<{
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