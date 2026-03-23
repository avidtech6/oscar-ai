// Sync queue database operations - Layer 1 Core
// Pure IndexedDB operations extracted from Layer 2 presentation

export interface QueueItem {
  id: string
  operation: 'create' | 'update' | 'delete'
  table: string
  recordId: string
  data?: any
  attempts: number
  lastAttempt: number | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: number
  updatedAt: number
  error?: string
}

// Database configuration
export interface QueueDatabaseConfig {
  dbName: string
  version: number
  storeName: string
}

// Core database operations
export async function initQueueDatabaseCore(config: QueueDatabaseConfig): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(config.dbName, config.version)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      resolve(db)
    }
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      
      if (!db.objectStoreNames.contains(config.storeName)) {
        const store = db.createObjectStore(config.storeName, { keyPath: 'id' })
        store.createIndex('status', 'status')
        store.createIndex('createdAt', 'createdAt')
        store.createIndex('table_record', ['table', 'recordId'])
      }
    }
  })
}

export async function getQueueDatabaseInstanceCore(initFn: () => Promise<IDBDatabase>): Promise<IDBDatabase> {
  return initFn()
}

export async function createQueueItemCore(
  operation: QueueItem['operation'],
  table: string,
  recordId: string,
  data?: any,
  generateId: () => string = () => Date.now().toString() + Math.random().toString(36)
): Promise<QueueItem> {
  const now = Date.now()
  const item: QueueItem = {
    id: generateId(),
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
  
  return item
}

export async function addQueueItemCore(
  db: IDBDatabase,
  storeName: string,
  item: QueueItem
): Promise<QueueItem> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    
    const request = store.put(item)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(item)
  })
}

export async function getPendingQueueItemsCore(
  db: IDBDatabase,
  storeName: string,
  limit: number = 100
): Promise<QueueItem[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
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

export async function getFailedQueueItemsCore(
  db: IDBDatabase,
  storeName: string
): Promise<QueueItem[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
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

export async function updateQueueItemStatusCore(
  db: IDBDatabase,
  storeName: string,
  itemId: string,
  status: QueueItem['status'],
  error?: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    
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

export async function deleteQueueItemCore(
  db: IDBDatabase,
  storeName: string,
  itemId: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    
    const request = store.delete(itemId)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}