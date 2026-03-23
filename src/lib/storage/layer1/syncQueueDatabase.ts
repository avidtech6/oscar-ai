// Sync queue database initialization (Layer 1 Core)
import type { IDBDatabase } from './syncQueueTypes'
import { QUEUE_CONFIG } from './syncQueueConfig'

let queueDB: IDBDatabase | null = null

// Initialize queue database
export async function initQueueDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(QUEUE_CONFIG.DB_NAME, QUEUE_CONFIG.DB_VERSION)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      queueDB = request.result
      resolve(queueDB)
    }
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      
      if (!db.objectStoreNames.contains(QUEUE_CONFIG.STORE_NAME)) {
        const store = db.createObjectStore(QUEUE_CONFIG.STORE_NAME, { keyPath: 'id' })
        store.createIndex('status', 'status')
        store.createIndex('createdAt', 'createdAt')
        store.createIndex('table_record', ['table', 'recordId'])
      }
    }
  })
}

// Get queue database instance
export async function getQueueDB(): Promise<IDBDatabase> {
  if (!queueDB) {
    queueDB = await initQueueDB()
  }
  return queueDB
}

// Reset database (for testing)
export function resetQueueDB(): void {
  queueDB = null
}