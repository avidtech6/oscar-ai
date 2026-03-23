// Core statistics calculation functions for sync queue database
// Extracted from syncQueueDatabase.ts for Layer 1 purity

import type { QueueItem } from './syncQueueDatabaseCoreTypes'

// Calculate queue statistics from array of queue items
export function calculateQueueStats(items: QueueItem[]): {
  total: number
  pending: number
  processing: number
  failed: number
  completed: number
  oldestPending: number | null
} {
  const stats = {
    total: items.length,
    pending: items.filter(item => item.status === 'pending').length,
    processing: items.filter(item => item.status === 'processing').length,
    failed: items.filter(item => item.status === 'failed').length,
    completed: items.filter(item => item.status === 'completed').length,
    oldestPending: null as number | null
  }
  
  // Find oldest pending item
  const pendingItems = items.filter(item => item.status === 'pending')
  if (pendingItems.length > 0) {
    const oldest = Math.min(...pendingItems.map(item => item.createdAt))
    stats.oldestPending = oldest
  }
  
  return stats
}

// Filter old completed items for cleanup
export function getOldCompletedItems(items: QueueItem[], cutoffTime: number): QueueItem[] {
  return items.filter(item => item.status === 'completed' && item.updatedAt < cutoffTime)
}