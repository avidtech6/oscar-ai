// Encrypted local storage using IndexedDB with AES-GCM encryption
import { browser } from '$app/environment'

// Database configuration
const DB_NAME = 'oscar_ai_encrypted'
const DB_VERSION = 1

// Table names
export const TABLES = {
  REPORTS: 'reports',
  NOTES: 'notes',
  SETTINGS: 'settings',
  INTELLIGENCE_TRACES: 'intelligence_traces',
  SYNC_METADATA: 'sync_metadata'
} as const

// Encryption key management
let encryptionKey: CryptoKey | null = null

// Initialize encryption key from PIN
export async function initEncryptionKey(pin: string, salt: string): Promise<CryptoKey> {
  if (!browser) {
    throw new Error('Encryption requires browser environment')
  }
  
  // Derive key using PBKDF2
  const encoder = new TextEncoder()
  const pinBuffer = encoder.encode(pin)
  const saltBuffer = encoder.encode(salt)
  
  const baseKey = await crypto.subtle.importKey(
    'raw',
    pinBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  )
  
  encryptionKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
  
  return encryptionKey
}

// Clear encryption key (for logout)
export function clearEncryptionKey(): void {
  encryptionKey = null
}

// Check if encryption is ready
export function isEncryptionReady(): boolean {
  return encryptionKey !== null
}

// Encrypt data
export async function encryptData(data: any): Promise<{ iv: Uint8Array; ciphertext: ArrayBuffer }> {
  if (!encryptionKey) {
    throw new Error('Encryption key not initialized')
  }
  
  const encoder = new TextEncoder()
  const dataString = JSON.stringify(data)
  const dataBuffer = encoder.encode(dataString)
  
  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12))
  
  // Create a proper ArrayBuffer from the IV
  const ivBuffer = new Uint8Array(iv).buffer
  
  // Encrypt
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer
    },
    encryptionKey,
    dataBuffer
  )
  
  return { iv, ciphertext }
}

// Decrypt data
export async function decryptData(iv: Uint8Array, ciphertext: ArrayBuffer): Promise<any> {
  if (!encryptionKey) {
    throw new Error('Encryption key not initialized')
  }
  
  try {
    // Create a proper ArrayBuffer from the IV
    const ivBuffer = new Uint8Array(iv).buffer
    
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBuffer
      },
      encryptionKey,
      ciphertext
    )
    
    const decoder = new TextDecoder()
    const decryptedString = decoder.decode(decryptedBuffer)
    return JSON.parse(decryptedString)
  } catch (error) {
    console.error('Decryption failed:', error)
    throw new Error('Failed to decrypt data')
  }
}

// Database instance
let db: IDBDatabase | null = null

// Initialize database
export async function initDatabase(): Promise<IDBDatabase> {
  if (!browser) {
    throw new Error('IndexedDB requires browser environment')
  }
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      
      // Create tables with indexes
      createTable(db, TABLES.REPORTS, ['id', 'createdAt', 'updatedAt', 'syncStatus'])
      createTable(db, TABLES.NOTES, ['id', 'createdAt', 'updatedAt', 'syncStatus'])
      createTable(db, TABLES.SETTINGS, ['id', 'key', 'syncStatus'])
      createTable(db, TABLES.INTELLIGENCE_TRACES, ['id', 'timestamp', 'type', 'syncStatus'])
      createTable(db, TABLES.SYNC_METADATA, ['id', 'tableName', 'recordId', 'lastSyncedAt', 'hash'])
    }
  })
}

// Create table helper
function createTable(db: IDBDatabase, name: string, indexes: string[]): void {
  if (!db.objectStoreNames.contains(name)) {
    const store = db.createObjectStore(name, { keyPath: 'id' })
    
    indexes.forEach(index => {
      if (index !== 'id') {
        store.createIndex(index, index)
      }
    })
  }
}

// Get database instance
async function getDB(): Promise<IDBDatabase> {
  if (!db) {
    db = await initDatabase()
  }
  return db
}

// Generic CRUD operations
export interface EncryptedRecord {
  id: string
  iv: Uint8Array
  ciphertext: ArrayBuffer
  createdAt: number
  updatedAt: number
  syncStatus: 'local' | 'synced' | 'pending' | 'conflict'
}

// Store record
export async function storeRecord(
  table: string,
  id: string,
  data: any
): Promise<EncryptedRecord> {
  if (!isEncryptionReady()) {
    throw new Error('Encryption not ready')
  }
  
  const { iv, ciphertext } = await encryptData(data)
  const now = Date.now()
  
  const record: EncryptedRecord = {
    id,
    iv,
    ciphertext,
    createdAt: now,
    updatedAt: now,
    syncStatus: 'local'
  }
  
  const db = await getDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([table], 'readwrite')
    const store = transaction.objectStore(table)
    
    const request = store.put(record)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(record)
  })
}

// Get record
export async function getRecord(table: string, id: string): Promise<any> {
  if (!isEncryptionReady()) {
    throw new Error('Encryption not ready')
  }
  
  const db = await getDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([table], 'readonly')
    const store = transaction.objectStore(table)
    
    const request = store.get(id)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = async () => {
      const record = request.result as EncryptedRecord
      if (!record) {
        resolve(null)
        return
      }
      
      try {
        const data = await decryptData(record.iv, record.ciphertext)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    }
  })
}

// Get all records
export async function getAllRecords(table: string): Promise<Array<{ id: string; data: any }>> {
  if (!isEncryptionReady()) {
    throw new Error('Encryption not ready')
  }
  
  const db = await getDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([table], 'readonly')
    const store = transaction.objectStore(table)
    
    const request = store.getAll()
    
    request.onerror = () => reject(request.error)
    request.onsuccess = async () => {
      const records = request.result as EncryptedRecord[]
      const decryptedRecords: Array<{ id: string; data: any }> = []
      
      for (const record of records) {
        try {
          const data = await decryptData(record.iv, record.ciphertext)
          decryptedRecords.push({ id: record.id, data })
        } catch (error) {
          console.error(`Failed to decrypt record ${record.id}:`, error)
        }
      }
      
      resolve(decryptedRecords)
    }
  })
}

// Update record
export async function updateRecord(
  table: string,
  id: string,
  data: any,
  merge: boolean = false
): Promise<EncryptedRecord> {
  if (!isEncryptionReady()) {
    throw new Error('Encryption not ready')
  }
  
  const db = await getDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([table], 'readwrite')
    const store = transaction.objectStore(table)
    
    const getRequest = store.get(id)
    
    getRequest.onerror = () => reject(getRequest.error)
    getRequest.onsuccess = async () => {
      const existingRecord = getRequest.result as EncryptedRecord
      
      let finalData = data
      if (merge && existingRecord) {
        try {
          const existingData = await decryptData(existingRecord.iv, existingRecord.ciphertext)
          finalData = { ...existingData, ...data, id }
        } catch (error) {
          console.error('Failed to merge data:', error)
          finalData = data
        }
      }
      
      const { iv, ciphertext } = await encryptData(finalData)
      const now = Date.now()
      
      const record: EncryptedRecord = {
        id,
        iv,
        ciphertext,
        createdAt: existingRecord?.createdAt || now,
        updatedAt: now,
        syncStatus: existingRecord?.syncStatus === 'synced' ? 'pending' : 'local'
      }
      
      const putRequest = store.put(record)
      
      putRequest.onerror = () => reject(putRequest.error)
      putRequest.onsuccess = () => resolve(record)
    }
  })
}

// Delete record
export async function deleteRecord(table: string, id: string): Promise<void> {
  const db = await getDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([table], 'readwrite')
    const store = transaction.objectStore(table)
    
    const request = store.delete(id)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// Clear table
export async function clearTable(table: string): Promise<void> {
  const db = await getDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([table], 'readwrite')
    const store = transaction.objectStore(table)
    
    const request = store.clear()
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// Get record count
export async function getRecordCount(table: string): Promise<number> {
  const db = await getDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([table], 'readonly')
    const store = transaction.objectStore(table)
    
    const request = store.count()
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

// Get records by sync status
export async function getRecordsBySyncStatus(
  table: string,
  status: EncryptedRecord['syncStatus']
): Promise<EncryptedRecord[]> {
  const db = await getDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([table], 'readonly')
    const store = transaction.objectStore(table)
    const index = store.index('syncStatus')
    
    const request = index.getAll(status)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

// Update sync status
export async function updateSyncStatus(
  table: string,
  id: string,
  status: EncryptedRecord['syncStatus']
): Promise<void> {
  const db = await getDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([table], 'readwrite')
    const store = transaction.objectStore(table)
    
    const getRequest = store.get(id)
    
    getRequest.onerror = () => reject(getRequest.error)
    getRequest.onsuccess = async () => {
      const record = getRequest.result as EncryptedRecord
      if (!record) {
        reject(new Error(`Record ${id} not found in ${table}`))
        return
      }
      
      record.syncStatus = status
      record.updatedAt = Date.now()
      
      const putRequest = store.put(record)
      
      putRequest.onerror = () => reject(putRequest.error)
      putRequest.onsuccess = () => resolve()
    }
  })
}

// Batch operations
export async function batchStoreRecords(
  table: string,
  records: Array<{ id: string; data: any }>
): Promise<EncryptedRecord[]> {
  if (!isEncryptionReady()) {
    throw new Error('Encryption not ready')
  }
  
  const db = await getDB()
  const encryptedRecords: EncryptedRecord[] = []
  const now = Date.now()
  
  // Encrypt all records first
  for (const { id, data } of records) {
    const { iv, ciphertext } = await encryptData(data)
    encryptedRecords.push({
      id,
      iv,
      ciphertext,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local'
    })
  }
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([table], 'readwrite')
    const store = transaction.objectStore(table)
    
    let completed = 0
    const errors: Error[] = []
    
    encryptedRecords.forEach(record => {
      const request = store.put(record)
      
      request.onerror = () => {
        errors.push(request.error as Error)
        completed++
        if (completed === encryptedRecords.length) {
          if (errors.length > 0) {
            reject(new Error(`Batch store failed: ${errors.map(e => e.message).join(', ')}`))
          } else {
            resolve(encryptedRecords)
          }
        }
      }
      
      request.onsuccess = () => {
        completed++
        if (completed === encryptedRecords.length && errors.length === 0) {
          resolve(encryptedRecords)
        }
      }
    })
  })
}

// Database health check
export async function checkDatabaseHealth(): Promise<{
  isAvailable: boolean
  tables: string[]
  totalRecords: number
}> {
  if (!browser) {
    return { isAvailable: false, tables: [], totalRecords: 0 }
  }
  
  try {
    const db = await getDB()
    const tables = Array.from(db.objectStoreNames)
    
    let totalRecords = 0
    for (const table of tables) {
      totalRecords += await getRecordCount(table)
    }
    
    return {
      isAvailable: true,
      tables,
      totalRecords
    }
  } catch (error) {
    console.error('Database health check failed:', error)
    return { isAvailable: false, tables: [], totalRecords: 0 }
  }
}