/**
 * Local vault import/export functionality
 */

import { browser } from '$app/environment'
import type { ApiKey } from './localVaultTypes'
import { VAULT_CONFIG } from './localVaultTypes'
import { getDB, generateHash } from './localVaultHelpers'
import { getAllApiKeys } from './localVaultCrud'

// Export keys for backup (encrypted)
export async function exportEncryptedKeys(): Promise<string> {
	const allKeys = await getAllApiKeys()
	
	// Remove sensitive sync metadata
	const exportData = allKeys.map(key => ({
		id: key.id,
		keyName: key.keyName,
		provider: key.provider,
		modelFamily: key.modelFamily,
		encryptedKey: key.encryptedKey,
		iv: key.iv,
		keyVersion: key.keyVersion,
		isActive: key.isActive,
		createdAt: key.createdAt,
		updatedAt: key.updatedAt
	}))
	
	return JSON.stringify(exportData, null, 2)
}

// Import keys from backup
export async function importEncryptedKeys(backupData: string): Promise<number> {
	if (!browser) {
		return 0
	}
	
	const keysToImport = JSON.parse(backupData)
	let importedCount = 0
	
	const db = await getDB()
	
	for (const keyData of keysToImport) {
		try {
			// Generate hash for imported key
			const hashData = `${keyData.keyName}:${keyData.provider}:${keyData.encryptedKey}:${keyData.iv}`
			const localHash = await generateHash(hashData)
			
			const apiKey: ApiKey = {
				...keyData,
				lastUsedAt: undefined,
				usageCount: 0,
				rotationDueAt: keyData.createdAt + (VAULT_CONFIG.KEY_ROTATION_DAYS * 24 * 60 * 60 * 1000),
				localHash,
				lastSyncedAt: undefined
			}
			
			await new Promise((resolve, reject) => {
				const transaction = db.transaction([VAULT_CONFIG.STORE_NAME], 'readwrite')
				const store = transaction.objectStore(VAULT_CONFIG.STORE_NAME)
				
				const request = store.put(apiKey)
				
				request.onerror = () => reject(request.error)
				request.onsuccess = () => resolve(null)
			})
			
			importedCount++
		} catch (error) {
			console.error(`Failed to import key ${keyData.id}:`, error)
		}
	}
	
	return importedCount
}