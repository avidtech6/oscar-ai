// Sync queue for offline writes with retry logic
import { browser } from '$app/environment'
import { TABLES, storeRecord, updateRecord, deleteRecord } from './localEncrypted'
import { SYNC_CONFIG } from './syncMetadata'

// Queue item interface
export interface QueueItem {
  id: string
  operation: 'create' | 'update' | 'delete'
  table: string
  recordId: string
  data?: any
  attempts: number
  lastAttempt: number | null
  status: 'pending' | 'processing' | 'failed' | 'completed'
  error?: string
  createdAt: number
  updatedAt: number
}

// Queue storage in IndexedDB
const QUEUE_DB_NAME = 'oscar_ai_sync_queue'
const QUEUE_DB_VERSION = 1
const QUEUE_STORE_NAME = 'queue_items'

let queueDB: IDBDatabase | null = null

// Initialize queue database
async function initQueueDB(): Promise<IDBDatabase> {
  if (!browser) {
    throw new Error('Sync queue requires browser environment')
  }
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(QUEUE_DB_NAME, QUEUE_DB_VERSION)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      queueDB = request.result
      resolve(queueDB)
    }
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      
      if (!db.objectStoreNames.contains(QUEUE_STORE_NAME)) {
        const store = db.createObjectStore(QUEUE_STORE_NAME, { keyPath: 'id' })
        store.createIndex('status', 'status')
        store.createIndex('createdAt', 'createdAt')
        store.createIndex('table_record', ['table', 'recordId'])
      }
    }
  })
}

// Get queue database instance
async function getQueueDB(): Promise<IDBDatabase> {
  if (!queueDB) {
    queueDB = await initQueueDB()
  }
  return queueDB
}

// Generate queue item ID
function generateQueueId(): string {
  return `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Add item to queue
export async function addToQueue(
  operation: QueueItem['operation'],
  table: string,
  recordId: string,
  data?: any
): Promise<QueueItem> {
  if (!browser) {
    throw new Error('Sync queue requires browser environment')
  }
  
  const now = Date.now()
  const item: QueueItem = {
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
  
  const db = await getQueueDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([QUEUE_STORE_NAME], 'readwrite')
    const store = transaction.objectStore(QUEUE_STORE_NAME)
    
    const request = store.put(item)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(item)
  })
}

// Get pending items
export async function getPendingItems(limit: number = SYNC_CONFIG.BATCH_SIZE): Promise<QueueItem[]> {
  if (!browser) {
    return []
  }
  
  const db = await getQueueDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([QUEUE_STORE_NAME], 'readonly')
    const store = transaction.objectStore(QUEUE_STORE_NAME)
    const index = store.index('status')
    
    const request = index.getAll('pending')
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const items = request.result as QueueItem[]
      // Sort by createdAt (oldest first)
      items.sort((a, b) => a.createdAt - b.createdAt)
      // Apply limit
      resolve(items.slice(0, limit))
    }
  })
}

// Get failed items
export async function getFailedItems(): Promise<QueueItem[]> {
  if (!browser) {
    return []
  }
  
  const db = await getQueueDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([QUEUE_STORE_NAME], 'readonly')
    const store = transaction.objectStore(QUEUE_STORE_NAME)
    const index = store.index('status')
    
    const request = index.getAll('failed')
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const items = request.result as QueueItem[]
      // Sort by lastAttempt (oldest first)
      items.sort((a, b) => (a.lastAttempt || 0) - (b.lastAttempt || 0))
      resolve(items)
    }
  })
}

// Update item status
export async function updateItemStatus(
  itemId: string,
  status: QueueItem['status'],
  error?: string
): Promise<void> {
  if (!browser) {
    return
  }
  
  const db = await getQueueDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([QUEUE_STORE_NAME], 'readwrite')
    const store = transaction.objectStore(QUEUE_STORE_NAME)
    
    const getRequest = store.get(itemId)
    
    getRequest.onerror = () => reject(getRequest.error)
    getRequest.onsuccess = () => {
      const item = getRequest.result as QueueItem
      if (!item) {
        reject(new Error(`Queue item ${itemId} not found`))
        return
      }
      
      item.status = status
      item.updatedAt = Date.now()
      
      if (status === 'processing') {
        item.attempts += 1
        item.lastAttempt = Date.now()
      }
      
      if (error) {
        item.error = error
      }
      
      const putRequest = store.put(item)
      
      putRequest.onerror = () => reject(putRequest.error)
      putRequest.onsuccess = () => resolve()
    }
  })
}

// Remove item from queue
export async function removeFromQueue(itemId: string): Promise<void> {
  if (!browser) {
    return
  }
  
  const db = await getQueueDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([QUEUE_STORE_NAME], 'readwrite')
    const store = transaction.objectStore(QUEUE_STORE_NAME)
    
    const request = store.delete(itemId)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

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

// Clear completed items (cleanup)
export async function clearCompletedItems(olderThan: number = 7 * 24 * 60 * 60 * 1000): Promise<number> {
  if (!browser) {
    return 0
  }
  
  const db = await getQueueDB()
  const cutoffTime = Date.now() - olderThan
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([QUEUE_STORE_NAME], 'readwrite')
    const store = transaction.objectStore(QUEUE_STORE_NAME)
    const index = store.index('status')
    
    const request = index.getAll('completed')
    
    request.onerror = () => reject(request.error)
    request.onsuccess = async () => {
      const items = request.result as QueueItem[]
      const oldItems = items.filter(item => item.updatedAt < cutoffTime)
      
      let deleted = 0
      for (const item of oldItems) {
        try {
          await removeFromQueue(item.id)
          deleted++
        } catch (error) {
          console.error(`Failed to delete queue item ${item.id}:`, error)
        }
      }
      
      resolve(deleted)
    }
  })
}

// Queue statistics
export async function getQueueStats(): Promise<{
  total: number
  pending: number
  processing: number
  failed: number
  completed: number
  oldestPending: number | null
}> {
  if (!browser) {
    return { total: 0, pending: 0, processing: 0, failed: 0, completed: 0, oldestPending: null }
  }
  
  const db = await getQueueDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([QUEUE_STORE_NAME], 'readonly')
    const store = transaction.objectStore(QUEUE_STORE_NAME)
    
    const request = store.getAll()
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const items = request.result as QueueItem[]
      
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
      
      resolve(stats)
    }
  })
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

// Queue manager
export class SyncQueueManager {
  private isProcessing = false
  private intervalId: number | null = null
  
  // Start automatic processing
  startAutoProcessing(interval: number = SYNC_CONFIG.AUTO_SYNC_INTERVAL): void {
    if (!browser || this.intervalId) {
      return
    }
    
    this.intervalId = window.setInterval(() => {
      this.processQueue()
    }, interval)
    
    // Also process immediately
    this.processQueue()
  }
  
  // Stop automatic processing
  stopAutoProcessing(): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
  
  // Process queue (with concurrency control)
  async processQueue(): Promise<void> {
    if (!browser || this.isProcessing) {
      return
    }
    
    this.isProcessing = true
    
    try {
      const result = await processPendingItems()
      
      if (result.failed > 0) {
        console.warn(`Queue processing: ${result.succeeded} succeeded, ${result.failed} failed`)
      }
    } catch (error) {
      console.error('Queue processing failed:', error)
    } finally {
      this.isProcessing = false
    }
  }
  
  // Manual sync trigger
  async manualSync(): Promise<{
    processed: number
    succeeded: number
    failed: number
  }> {
    return processPendingItems()
  }
  
  // Get current status
  async getStatus(): Promise<{
    isProcessing: boolean
    stats: Awaited<ReturnType<typeof getQueueStats>>
    health: Awaited<ReturnType<typeof checkQueueHealth>>
  }> {
    const [stats, health] = await Promise.all([
      getQueueStats(),
      checkQueueHealth()
    ])
    
    return {
      isProcessing: this.isProcessing,
      stats,
      health
    }
  }
}

// Singleton instance
export const syncQueueManager = new SyncQueueManager()