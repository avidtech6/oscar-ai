/**
 * Local vault key management operations
 */

import { browser } from '$app/environment'
import type { ApiKey } from './localVaultTypes'
import { VAULT_CONFIG } from './localVaultTypes'
import { getDB, generateHash, encryptApiKey } from './localVaultHelpers'
import { getApiKey, updateApiKey, getAllApiKeys } from './localVaultCrud'

// Get active API keys
export async function getActiveApiKeys(): Promise<ApiKey[]> {
	const allKeys = await getAllApiKeys()
	return allKeys.filter(key => key.isActive)
}

// Rotate API key (create new version)
export async function rotateApiKey(
	keyId: string,
	newPlaintextKey: string
): Promise<ApiKey> {
	if (!browser) {
		throw new Error('Local vault requires browser environment')
	}
	
	const existingKey = await getApiKey(keyId)
	if (!existingKey) {
		throw new Error(`API key ${keyId} not found`)
	}
	
	// Encrypt the new key
	const { encryptedKey, iv } = await encryptApiKey(newPlaintextKey)
	
	// Generate new hash
	const hashData = `${existingKey.keyName}:${existingKey.provider}:${encryptedKey}:${iv}`
	const localHash = await generateHash(hashData)
	
	const now = Date.now()
	const rotationDueAt = now + (VAULT_CONFIG.KEY_ROTATION_DAYS * 24 * 60 * 60 * 1000)
	
	const rotatedKey: ApiKey = {
		...existingKey,
		encryptedKey,
		iv,
		keyVersion: existingKey.keyVersion + 1,
		lastUsedAt: now,
		rotationDueAt,
		updatedAt: now,
		localHash,
		lastSyncedAt: undefined // Reset sync status
	}
	
	const db = await getDB()
	
	return new Promise((resolve, reject) => {
		const transaction = db.transaction([VAULT_CONFIG.STORE_NAME], 'readwrite')
		const store = transaction.objectStore(VAULT_CONFIG.STORE_NAME)
		
		const request = store.put(rotatedKey)
		
		request.onerror = () => reject(request.error)
		request.onsuccess = () => resolve(rotatedKey)
	})
}

// Mark key as used (increment usage count)
export async function markKeyAsUsed(keyId: string): Promise<void> {
	if (!browser) {
		return
	}
	
	const existingKey = await getApiKey(keyId)
	if (!existingKey) {
		return
	}
	
	await updateApiKey(keyId, {
		lastUsedAt: Date.now(),
		usageCount: existingKey.usageCount + 1
	})
}

// Get keys needing rotation
export async function getKeysNeedingRotation(warningDays: number = 7): Promise<ApiKey[]> {
	const activeKeys = await getActiveApiKeys()
	const now = Date.now()
	const warningThreshold = now + (warningDays * 24 * 60 * 60 * 1000)
	
	return activeKeys.filter(key => 
		key.rotationDueAt && key.rotationDueAt < warningThreshold
	)
}

// Deactivate expired keys
export async function deactivateExpiredKeys(): Promise<string[]> {
	const activeKeys = await getActiveApiKeys()
	const now = Date.now()
	const deactivatedIds: string[] = []
	
	for (const key of activeKeys) {
		if (key.rotationDueAt && key.rotationDueAt < now) {
			await updateApiKey(key.id, { isActive: false })
			deactivatedIds.push(key.id)
		}
	}
	
	return deactivatedIds
}