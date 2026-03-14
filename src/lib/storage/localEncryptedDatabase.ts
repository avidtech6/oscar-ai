// Database initialization and table creation for local encrypted storage
import { browser } from '$app/environment'
import { TABLES } from './localEncryptedCrypto'

// Database configuration
const DB_NAME = 'oscar_ai_encrypted'
const DB_VERSION = 1

// Database instance
let db: IDBDatabase | null = null

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

// Get database instance
export async function getDB(): Promise<IDBDatabase> {
	if (!db) {
		db = await initDatabase()
	}
	return db
}