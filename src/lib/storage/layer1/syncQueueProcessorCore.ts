// Sync queue processing logic - Layer 1 Core
// Pure processing operations extracted from Layer 2 presentation

import type { QueueItem } from './syncQueueDatabaseCore'

export interface QueueProcessingResult {
  success: boolean
  error?: string
}

export interface BatchProcessingResult {
  processed: number
  succeeded: number
  failed: number
}

export interface RetryResult {
  retried: number
  succeeded: number
  failed: number
}

export interface QueueHealthResult {
  isHealthy: boolean
  stats: {
    total: number
    pending: number
    failed: number
  }
  issues: string[]
}

export interface RetryConfig {
  maxAttempts: number
  retryDelay: number
}

// Process individual queue item
export async function processQueueItemCore(
  item: QueueItem,
  executeOperation: (operation: QueueItem['operation'], table: string, recordId: string, data?: any) => Promise<boolean>,
  updateStatus: (itemId: string, status: QueueItem['status'], error?: string) => Promise<void>
): Promise<QueueProcessingResult> {
  try {
    // Update status to processing
    await updateStatus(item.id, 'processing')
    
    let success = false
    
    try {
      success = await executeOperation(item.operation, item.table, item.recordId, item.data)
    } catch (error: any) {
      await updateStatus(item.id, 'failed', error.message || 'Unknown error')
      return { success: false, error: error.message || 'Unknown error' }
    }
    
    if (success) {
      await updateStatus(item.id, 'completed')
      return { success: true }
    } else {
      await updateStatus(item.id, 'failed', 'Operation data missing')
      return { success: false, error: 'Operation data missing' }
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Unknown error' }
  }
}

// Process all pending items with retry logic
export async function processPendingItemsCore(
  getPendingItems: (limit?: number) => Promise<QueueItem[]>,
  processItem: (item: QueueItem) => Promise<QueueProcessingResult>,
  shouldRetry: (item: QueueItem, config: RetryConfig) => boolean,
  getBackoffTime: (attempts: number, baseDelay: number) => number,
  config: RetryConfig
): Promise<BatchProcessingResult> {
  const pendingItems = await getPendingItems()
  let succeeded = 0
  let failed = 0
  
  for (const item of pendingItems) {
    // Check if item has exceeded max attempts
    if (!shouldRetry(item, config)) {
      await processItem(item) // This will mark as failed
      failed++
      continue
    }
    
    // Apply exponential backoff
    if (item.lastAttempt) {
      const backoffTime = getBackoffTime(item.attempts, config.retryDelay)
      const timeSinceLastAttempt = Date.now() - item.lastAttempt
      
      if (timeSinceLastAttempt < backoffTime) {
        // Skip this item for now (still in backoff period)
        continue
      }
    }
    
    const result = await processItem(item)
    
    if (result.success) {
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
export async function retryFailedItemsCore(
  getFailedItems: () => Promise<QueueItem[]>,
  processItem: (item: QueueItem) => Promise<QueueProcessingResult>,
  updateStatus: (itemId: string, status: QueueItem['status'], error?: string) => Promise<void>
): Promise<RetryResult> {
  const failedItems = await getFailedItems()
  let succeeded = 0
  let failed = 0
  
  for (const item of failedItems) {
    // Reset status to pending for retry
    await updateStatus(item.id, 'pending')
    
    const result = await processItem(item)
    
    if (result.success) {
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

// Queue health assessment
export async function checkQueueHealthCore(
  getStats: () => Promise<{
    total: number
    pending: number
    failed: number
    oldestPending: number | null
  }>,
  maxFailedItems: number = 10,
  maxPendingItems: number = 100,
  staleThreshold: number = 60 * 60 * 1000
): Promise<QueueHealthResult> {
  const stats = await getStats()
  const issues: string[] = []
  
  // Check for too many failed items
  if (stats.failed > maxFailedItems) {
    issues.push(`Too many failed items: ${stats.failed}`)
  }
  
  // Check for stale pending items (older than threshold)
  if (stats.oldestPending && Date.now() - stats.oldestPending > staleThreshold) {
    issues.push(`Stale pending items (oldest: ${new Date(stats.oldestPending).toISOString()})`)
  }
  
  // Check for too many pending items
  if (stats.pending > maxPendingItems) {
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

// Helper functions
export function calculateBackoffTimeCore(attempts: number, baseDelay: number): number {
  return baseDelay * Math.pow(2, attempts)
}

export function shouldRetryItemCore(item: QueueItem, config: RetryConfig): boolean {
  return item.attempts < config.maxAttempts
}