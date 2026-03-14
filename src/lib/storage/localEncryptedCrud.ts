// CRUD operations for local encrypted storage
import { isEncryptionReady, encryptData, decryptData } from './localEncryptedCrypto'
import { getDB } from './localEncryptedDatabase'

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