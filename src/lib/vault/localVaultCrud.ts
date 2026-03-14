/**
 * Local vault basic CRUD operations
 */

import { browser } from '$app/environment'
import type { ApiKey } from './localVaultTypes'
import { VAULT_CONFIG } from './localVaultTypes'
import { getDB, generateHash, encryptApiKey } from './localVaultHelpers'

// Store API key in local vault
export async function storeApiKey(
	keyName: string,
	plaintextKey: string,
	provider: ApiKey['provider'],
	modelFamily?: string
): Promise<ApiKey> {
	if (!browser) {
		throw new Error('Local vault requires browser environment')
	}
	
	// Encrypt the key
	const { encryptedKey, iv } = await encryptApiKey(plaintextKey)
	
	// Generate hash for conflict detection
	const hashData = `${keyName}:${provider}:${encryptedKey}:${iv}`
	const localHash = await generateHash(hashData)
	
	const now = Date.now()
	const rotationDueAt = now + (VAULT_CONFIG.KEY_ROTATION_DAYS * 24 * 60 * 60 * 1000)
	
	const apiKey: ApiKey = {
		id: crypto.randomUUID(),
		keyName,
		provider,
		modelFamily,
		encryptedKey,
		iv,
		keyVersion: 1,
		isActive: true,
		usageCount: 0,
		rotationDueAt,
		createdAt: now,
		updatedAt: now,
		localHash
	}
	
	const db = await getDB()
	
	return new Promise((resolve, reject) => {
		const transaction = db.transaction([VAULT_CONFIG.STORE_NAME], 'readwrite')
		const store = transaction.objectStore(VAULT_CONFIG.STORE_NAME)
		
		const request = store.put(apiKey)
		
		request.onerror = () => reject(request.error)
		request.onsuccess = () => resolve(apiKey)
	})
}

// Get API key from local vault (returns encrypted data only)
export async function getApiKey(keyId: string): Promise<ApiKey | null> {
	if (!browser) {
		return null
	}
	
	const db = await getDB()
	
	return new Promise((resolve, reject) => {
		const transaction = db.transaction([VAULT_CONFIG.STORE_NAME], 'readonly')
		const store = transaction.objectStore(VAULT_CONFIG.STORE_NAME)
		
		const request = store.get(keyId)
		
		request.onerror = () => reject(request.error)
		request.onsuccess = () => resolve(request.result || null)
	})
}

// Get all API keys from local vault
export async function getAllApiKeys(): Promise<ApiKey[]> {
	if (!browser) {
		return []
	}
	
	const db = await getDB()
	
	return new Promise((resolve, reject) => {
		const transaction = db.transaction([VAULT_CONFIG.STORE_NAME], 'readonly')
		const store = transaction.objectStore(VAULT_CONFIG.STORE_NAME)
		
		const request = store.getAll()
		
		request.onerror = () => reject(request.error)
		request.onsuccess = () => resolve(request.result || [])
	})
}

// Update API key
export async function updateApiKey(
	keyId: string,
	updates: Partial<Omit<ApiKey, 'id' | 'encryptedKey' | 'iv' | 'createdAt'>>
): Promise<ApiKey | null> {
	if (!browser) {
		return null
	}
	
	const existingKey = await getApiKey(keyId)
	if (!existingKey) {
		throw new Error(`API key ${keyId} not found`)
	}
	
	const updatedKey: ApiKey = {
		...existingKey,
		...updates,
		updatedAt: Date.now()
	}
	
	// Update hash if key name or provider changed
	if (updates.keyName || updates.provider) {
		const hashData = `${updatedKey.keyName}:${updatedKey.provider}:${updatedKey.encryptedKey}:${updatedKey.iv}`
		updatedKey.localHash = await generateHash(hashData)
	}
	
	const db = await getDB()
	
	return new Promise((resolve, reject) => {
		const transaction = db.transaction([VAULT_CONFIG.STORE_NAME], 'readwrite')
		const store = transaction.objectStore(VAULT_CONFIG.STORE_NAME)
		
		const request = store.put(updatedKey)
		
		request.onerror = () => reject(request.error)
		request.onsuccess = () => resolve(updatedKey)
	})
}

// Delete API key
export async function deleteApiKey(keyId: string): Promise<void> {
	if (!browser) {
		return
	}
	
	const db = await getDB()
	
	return new Promise((resolve, reject) => {
		const transaction = db.transaction([VAULT_CONFIG.STORE_NAME], 'readwrite')
		const store = transaction.objectStore(VAULT_CONFIG.STORE_NAME)
		
		const request = store.delete(keyId)
		
		request.onerror = () => reject(request.error)
		request.onsuccess = () => resolve()
	})
}