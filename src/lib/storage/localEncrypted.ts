// Encrypted local storage using IndexedDB with AES-GCM encryption
// This file re‑exports all functionality from split modules for backward compatibility.

export { TABLES } from './localEncryptedCrypto'
export {
	initEncryptionKey,
	clearEncryptionKey,
	isEncryptionReady,
	encryptData,
	decryptData
} from './localEncryptedCrypto'

export { initDatabase, getDB } from './localEncryptedDatabase'

export type { EncryptedRecord } from './localEncryptedCrud'
export {
	storeRecord,
	getRecord,
	getAllRecords,
	updateRecord,
	deleteRecord,
	clearTable,
	getRecordCount,
	getRecordsBySyncStatus,
	updateSyncStatus
} from './localEncryptedCrud'

export { batchStoreRecords, checkDatabaseHealth } from './localEncryptedBatch'