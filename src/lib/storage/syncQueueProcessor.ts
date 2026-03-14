// Sync queue processing logic
import { browser } from '$app/environment'
import { storeRecord, updateRecord, deleteRecord } from './localEncrypted'
import { SYNC_CONFIG } from './syncMetadata'
import type { QueueItem } from './syncQueueDatabase'
import { updateItemStatus, getPendingItems, getFailedItems, getQueueStats } from './syncQueueDatabase'

// Process queue item (execute the operation)
export async function processQueueItem(item: QueueItem): Promise<boolean> {
  if (!browser) {
    return false
  }
  
  try {
    // Update status to processing
    await updateItemStatus(item.id, 'processing')
    
    let success = false
    
    switch (item.operation) {
      case 'create':
        if (item.data) {
          await storeRecord(item.table, item.recordId, item.data)
          success = true
        }
        break
        
      case 'update':
        if (item.data) {
          await updateRecord(item.table, item.recordId, item.data)
          success = true
        }
        break
        
      case 'delete':
        await deleteRecord(item.table, item.recordId)
        success = true
        break
    }
    
    if (success) {
      await updateItemStatus(item.id, 'completed')
      return true
    } else {
      await updateItemStatus(item.id, 'failed', 'Operation data missing')
      return false
    }
  } catch (error: any) {
    await updateItemStatus(item.id, 'failed', error.message || 'Unknown error')
    return false
  }
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
  
  const pendingItems = await getPendingItems()
  let succeeded = 0
  let failed = 0
  
  for (const item of pendingItems) {
    // Check if item has exceeded max attempts
    if (item.attempts >= SYNC_CONFIG.MAX_RETRY_ATTEMPTS) {
      await updateItemStatus(item.id, 'failed', 'Max retry attempts exceeded')
      failed++
      continue
    }
    
    // Apply exponential backoff
    if (item.lastAttempt) {
      const backoffTime = SYNC_CONFIG.RETRY_DELAY * Math.pow(2, item.attempts)
      const timeSinceLastAttempt = Date.now() - item.lastAttempt
      
      if (timeSinceLastAttempt < backoffTime) {
        // Skip this item for now (still in backoff period)
        continue
      }
    }
    
    const success = await processQueueItem(item)
    
    if (success) {
      succeeded++
    } else {
      failed++
    }
  }
  
  return {
    processed: pendingItems.length,
    succeeded,
    failed
  }
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
  
  const failedItems = await getFailedItems()
  let succeeded = 0
  let failed = 0
  
  for (const item of failedItems) {
    // Reset status to pending for retry
    await updateItemStatus(item.id, 'pending')
    
    const success = await processQueueItem(item)
    
    if (success) {
      succeeded++
    } else {
      failed++
    }
  }
  
  return {
    retried: failedItems.length,
    succeeded,
    failed
  }
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
  
  const stats = await getQueueStats()
  const issues: string[] = []
  
  // Check for too many failed items
  if (stats.failed > 10) {
    issues.push(`Too many failed items: ${stats.failed}`)
  }
  
  // Check for stale pending items (older than 1 hour)
  if (stats.oldestPending && Date.now() - stats.oldestPending > 60 * 60 * 1000) {
    issues.push(`Stale pending items (oldest: ${new Date(stats.oldestPending).toISOString()})`)
  }
  
  // Check for too many pending items
  if (stats.pending > 100) {
    issues.push(`Queue backlog: ${stats.pending} pending items`)
  }
  
  return {
    isHealthy: issues.length === 0,
    stats: {
      total: stats.total,
      pending: stats.pending,
      failed: stats.failed
    },
    issues
  }
}

// Re-export getQueueStats for convenience
export { getQueueStats } from './syncQueueDatabase'