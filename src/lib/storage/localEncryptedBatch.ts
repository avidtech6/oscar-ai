// Batch operations and health check for local encrypted storage
import { browser } from '$app/environment'
import { isEncryptionReady, encryptData } from './localEncryptedCrypto'
import { getDB } from './localEncryptedDatabase'
import { getRecordCount } from './localEncryptedCrud'
import type { EncryptedRecord } from './localEncryptedCrud'

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