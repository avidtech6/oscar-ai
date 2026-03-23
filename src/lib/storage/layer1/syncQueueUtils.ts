// Layer 1: Sync Queue Utilities - Pure Core Logic
// Extracted from syncQueueDatabase.ts

import type {
  QueueItem,
  QueueStatus,
  QueueOperation,
  QueuePriority,
  QueueFilterOptions,
  QueueSortOptions,
  QueueStatistics,
  QueueEventType,
  QueueEvent
} from './syncQueueTypes'

// Generate queue item ID
export function generateQueueId(): string {
  return `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Create queue item
export function createQueueItem(
  operation: QueueOperation,
  table: string,
  recordId: string,
  data?: any
): QueueItem {
  const now = Date.now()
  
  return {
    id: generateQueueId(),
    operation,
    table,
    recordId,
    data,
    attempts: 0,
    lastAttempt: null,
    status: 'pending',
    createdAt: now,
    updatedAt: now
  }
}

// Update queue item
export function updateQueueItem(
  item: QueueItem,
  updates: Partial<QueueItem>
): QueueItem {
  return {
    ...item,
    ...updates,
    updatedAt: Date.now()
  }
}

// Mark item as processing
export function markAsProcessing(item: QueueItem): QueueItem {
  return {
    ...item,
    status: 'processing',
    lastAttempt: Date.now(),
    attempts: item.attempts + 1,
    updatedAt: Date.now()
  }
}

// Mark item as completed
export function markAsCompleted(item: QueueItem): QueueItem {
  return {
    ...item,
    status: 'completed',
    updatedAt: Date.now()
  }
}

// Mark item as failed
export function markAsFailed(item: QueueItem, error?: string): QueueItem {
  return {
    ...item,
    status: 'failed',
    error,
    updatedAt: Date.now()
  }
}

// Check if item can be retried
export function canRetry(item: QueueItem, maxAttempts: number): boolean {
  return item.attempts < maxAttempts && item.status === 'failed'
}

// Calculate next retry time
export function calculateNextRetryTime(
  item: QueueItem,
  retryDelay: number,
  retryStrategy: 'immediate' | 'exponential' | 'linear' = 'exponential'
): number {
  const baseDelay = retryDelay
  const attempt = item.attempts
  
  switch (retryStrategy) {
    case 'immediate':
      return Date.now()
    case 'linear':
      return Date.now() + (baseDelay * attempt)
    case 'exponential':
    default:
      return Date.now() + (baseDelay * Math.pow(2, attempt))
  }
}

// Filter queue items
export function filterQueueItems(
  items: QueueItem[],
  filter: QueueFilterOptions
): QueueItem[] {
  return items.filter(item => {
    if (filter.status && !filter.status.includes(item.status)) {
      return false
    }
    
    if (filter.table && !filter.table.includes(item.table)) {
      return false
    }
    
    if (filter.operation && !filter.operation.includes(item.operation)) {
      return false
    }
    
    if (filter.olderThan && item.createdAt < filter.olderThan) {
      return false
    }
    
    if (filter.newerThan && item.createdAt > filter.newerThan) {
      return false
    }
    
    return true
  })
}

// Sort queue items
export function sortQueueItems(
  items: QueueItem[],
  sort: QueueSortOptions
): QueueItem[] {
  return [...items].sort((a, b) => {
    let aValue: any = a[sort.field]
    let bValue: any = b[sort.field]
    
    // Handle null/undefined values
    if (aValue == null) aValue = sort.direction === 'asc' ? -Infinity : Infinity
    if (bValue == null) bValue = sort.direction === 'asc' ? -Infinity : Infinity
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }
    
    if (sort.direction === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })
}

// Calculate queue statistics
export function calculateQueueStatistics(items: QueueItem[]): QueueStatistics {
  const stats: QueueStatistics = {
    totalItems: items.length,
    itemsByStatus: {
      pending: 0,
      processing: 0,
      failed: 0,
      completed: 0
    },
    itemsByOperation: {
      create: 0,
      update: 0,
      delete: 0
    },
    itemsByTable: {},
    averageAttempts: 0,
    oldestItem: null,
    newestItem: null,
    processingTime: {
      average: 0,
      min: 0,
      max: 0
    }
  }
  
  let totalAttempts = 0
  let processingTimes: number[] = []
  
  items.forEach(item => {
    // Status counts
    stats.itemsByStatus[item.status]++
    
    // Operation counts
    stats.itemsByOperation[item.operation]++
    
    // Table counts
    stats.itemsByTable[item.table] = (stats.itemsByTable[item.table] || 0) + 1
    
    // Attempts
    totalAttempts += item.attempts
    
    // Processing times
    if (item.status === 'completed' && item.lastAttempt && item.createdAt) {
      const processingTime = item.lastAttempt - item.createdAt
      processingTimes.push(processingTime)
    }
  })
  
  // Calculate averages
  stats.averageAttempts = items.length > 0 ? totalAttempts / items.length : 0
  
  if (processingTimes.length > 0) {
    stats.processingTime.average = processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
    stats.processingTime.min = Math.min(...processingTimes)
    stats.processingTime.max = Math.max(...processingTimes)
  }
  
  // Oldest and newest items
  if (items.length > 0) {
    stats.oldestItem = Math.min(...items.map(item => item.createdAt))
    stats.newestItem = Math.max(...items.map(item => item.createdAt))
  }
  
  return stats
}

// Validate queue item
export function validateQueueItem(item: QueueItem): string[] {
  const errors: string[] = []
  
  if (!item.id || item.id.trim() === '') {
    errors.push('Item ID is required')
  }
  
  if (!item.operation || !['create', 'update', 'delete'].includes(item.operation)) {
    errors.push('Valid operation is required')
  }
  
  if (!item.table || item.table.trim() === '') {
    errors.push('Table name is required')
  }
  
  if (!item.recordId || item.recordId.trim() === '') {
    errors.push('Record ID is required')
  }
  
  if (item.attempts < 0) {
    errors.push('Attempts cannot be negative')
  }
  
  if (item.createdAt > Date.now()) {
    errors.push('Creation time cannot be in the future')
  }
  
  if (item.updatedAt > Date.now()) {
    errors.push('Update time cannot be in the future')
  }
  
  return errors
}

// Create queue event
export function createQueueEvent(
  type: QueueEventType,
  payload?: any,
  error?: string
): QueueEvent {
  return {
    type,
    timestamp: Date.now(),
    payload,
    error
  }
}