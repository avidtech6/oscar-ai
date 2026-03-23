// Sync queue basic operations (Layer 1 Core)
import type { QueueItem } from './syncQueueTypes'
import { generateQueueId } from './syncQueueUtils'
import { QUEUE_CONFIG, QUEUE_DEFAULTS } from './syncQueueConfig'

// Add item to queue
export async function addToQueueCore(
  operation: QueueItem['operation'],
  table: string,
  recordId: string,
  data?: any
): Promise<QueueItem> {
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
    const transaction = db.transaction([QUEUE_CONFIG.STORE_NAME], 'readwrite')
    const store = transaction.objectStore(QUEUE_CONFIG.STORE_NAME)
    
    const request = store.put(item)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(item)
  })
}

// Get pending items
export async function getPendingItemsCore(limit: number = QUEUE_DEFAULTS.BATCH_SIZE): Promise<QueueItem[]> {
  const db = await getQueueDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([QUEUE_CONFIG.STORE_NAME], 'readonly')
    const store = transaction.objectStore(QUEUE_CONFIG.STORE_NAME)
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
export async function getFailedItemsCore(): Promise<QueueItem[]> {
  const db = await getQueueDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([QUEUE_CONFIG.STORE_NAME], 'readonly')
    const store = transaction.objectStore(QUEUE_CONFIG.STORE_NAME)
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

// Remove item from queue
export async function removeFromQueueCore(itemId: string): Promise<void> {
  const db = await getQueueDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([QUEUE_CONFIG.STORE_NAME], 'readwrite')
    const store = transaction.objectStore(QUEUE_CONFIG.STORE_NAME)
    
    const request = store.delete(itemId)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// Helper function (import from database module)
async function getQueueDB() {
  const { getQueueDB } = await import('./syncQueueDatabase')
  return getQueueDB()
}