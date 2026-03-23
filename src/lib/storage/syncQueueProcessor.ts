// Sync queue processing logic - Layer 2 Presentation
// Core logic extracted to Layer 1 for purity and reusability

import { browser } from '$app/environment'
import { storeRecord, updateRecord, deleteRecord } from './localEncrypted'
import { SYNC_CONFIG } from './syncMetadata'
import type { QueueItem } from './layer1/syncQueueDatabaseCore'
import { updateItemStatus, getPendingItems, getFailedItems, getQueueStats } from './syncQueueDatabase'
import {
  processQueueItemCore,
  processPendingItemsCore,
  retryFailedItemsCore,
  checkQueueHealthCore
} from './layer1/syncQueueProcessorCore'

// Process queue item (execute the operation)
export async function processQueueItem(item: QueueItem): Promise<boolean> {
  if (!browser) {
    return false
  }
  
  // Delegate to Layer 1 pure core logic
  const result = await processQueueItemCore(
    item,
    async (operation, table, recordId, data) => {
      switch (operation) {
        case 'create':
          if (data) {
            await storeRecord(table, recordId, data)
            return true
          }
          break
          
        case 'update':
          if (data) {
            await updateRecord(table, recordId, data)
            return true
          }
          break
          
        case 'delete':
          await deleteRecord(table, recordId)
          return true
      }
      return false
    },
    updateItemStatus
  )
  
  return result.success
}

// Process all pending items
export async function processPendingItems(): Promise<{
  processed: number
  succeeded: number
  failed: number
}> {
  if (!browser) {
    return { processed: 0, succeeded: 0, failed: 0 }
  }
  
  // Delegate to Layer 1 pure core logic
  return processPendingItemsCore(
    getPendingItems,
    (item) => {
      const result = processQueueItem(item)
      return result as any
    },
    (item, config) => item.attempts < config.maxAttempts,
    (attempts, baseDelay) => baseDelay * Math.pow(2, attempts),
    {
      maxAttempts: SYNC_CONFIG.MAX_RETRY_ATTEMPTS,
      retryDelay: SYNC_CONFIG.RETRY_DELAY
    }
  )
}

// Retry failed items
export async function retryFailedItems(): Promise<{
  retried: number
  succeeded: number
  failed: number
}> {
  if (!browser) {
    return { retried: 0, succeeded: 0, failed: 0 }
  }
  
  // Delegate to Layer 1 pure core logic
  return retryFailedItemsCore(
    getFailedItems,
    (item) => {
      const result = processQueueItem(item)
      return result as any
    },
    updateItemStatus
  )
}

// Queue health check
export async function checkQueueHealth(): Promise<{
  isHealthy: boolean
  stats: {
    total: number
    pending: number
    failed: number
  }
  issues: string[]
}> {
  if (!browser) {
    return {
      isHealthy: true,
      stats: { total: 0, pending: 0, failed: 0 },
      issues: []
    }
  }
  
  // Delegate to Layer 1 pure core logic
  return checkQueueHealthCore(
    () => getQueueStats(),
    10,
    100,
    60 * 60 * 1000
  )
}

// Re-export getQueueStats for convenience
export { getQueueStats } from './syncQueueDatabase'