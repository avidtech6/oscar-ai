// Sync queue database operations - Layer 2 Presentation
// Core logic extracted to Layer 1 for purity and reusability

import { browser } from '$app/environment'
import { SYNC_CONFIG } from './syncMetadata'
import type { QueueItem } from './layer1/syncQueueDatabaseCore'
import {
  initQueueDatabaseCore,
  getQueueDatabaseInstanceCore,
  createQueueItemCore,
  addQueueItemCore,
  getPendingQueueItemsCore,
  getFailedQueueItemsCore,
  updateQueueItemStatusCore,
  deleteQueueItemCore
} from './layer1/syncQueueDatabaseCore'
import { calculateQueueStats } from './layer1/syncQueueDatabaseCoreStats'
import { generateQueueId } from './layer1/syncQueueDatabaseCoreUtils'

// Queue configuration
const QUEUE_DB_NAME = 'oscar_ai_sync_queue'
const QUEUE_DB_VERSION = 1
const QUEUE_STORE_NAME = 'queue_items'

let queueDB: IDBDatabase | null = null

// Initialize queue database
async function initQueueDB(): Promise<IDBDatabase> {
  if (!browser) {
    throw new Error('Sync queue requires browser environment')
  }
  
  const config = {
    dbName: QUEUE_DB_NAME,
    version: QUEUE_DB_VERSION,
    storeName: QUEUE_STORE_NAME
  }
  
  return initQueueDatabaseCore(config)
}

// Get queue database instance
async function getQueueDB(): Promise<IDBDatabase> {
  if (!queueDB) {
    queueDB = await getQueueDatabaseInstanceCore(initQueueDB)
  }
  return queueDB
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
  
  const db = await getQueueDB()
  
  // Delegate to Layer 1 pure core logic
  const item = await createQueueItemCore(operation, table, recordId, data, generateQueueId)
  return addQueueItemCore(db, QUEUE_STORE_NAME, item)
}

// Get pending items
export async function getPendingItems(limit: number = SYNC_CONFIG.BATCH_SIZE): Promise<QueueItem[]> {
  if (!browser) {
    return []
  }
  
  const db = await getQueueDB()
  
  // Delegate to Layer 1 pure core logic
  return getPendingQueueItemsCore(db, QUEUE_STORE_NAME, limit)
}

// Get failed items
export async function getFailedItems(): Promise<QueueItem[]> {
  if (!browser) {
    return []
  }
  
  const db = await getQueueDB()
  
  // Delegate to Layer 1 pure core logic
  return getFailedQueueItemsCore(db, QUEUE_STORE_NAME)
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
  
  // Delegate to Layer 1 pure core logic
  return updateQueueItemStatusCore(db, QUEUE_STORE_NAME, itemId, status, error)
}

// Remove item from queue
export async function removeFromQueue(itemId: string): Promise<void> {
  if (!browser) {
    return
  }
  
  const db = await getQueueDB()
  
  // Delegate to Layer 1 pure core logic
  return deleteQueueItemCore(db, QUEUE_STORE_NAME, itemId)
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
      
      const stats = calculateQueueStats(items)
      
      resolve(stats)
    }
  })
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
      const oldItems = items.filter(item => item.createdAt < cutoffTime)
      
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