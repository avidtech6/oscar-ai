/**
 * Local vault statistics and utility functions
 */

import { browser } from '$app/environment'
import type { ApiKey } from './localVaultTypes'
import { VAULT_CONFIG } from './localVaultTypes'
import { getDB } from './localVaultHelpers'
import { getAllApiKeys } from './localVaultCrud'

// Get vault statistics
export async function getVaultStats(): Promise<{
	totalKeys: number
	activeKeys: number
	expiredKeys: number
	byProvider: Record<string, number>
	totalUsage: number
}> {
	const allKeys = await getAllApiKeys()
	const activeKeys = allKeys.filter(key => key.isActive)
	const expiredKeys = allKeys.filter(key => 
		key.rotationDueAt && key.rotationDueAt < Date.now()
	)
	
	const byProvider: Record<string, number> = {}
	let totalUsage = 0
	
	allKeys.forEach(key => {
		byProvider[key.provider] = (byProvider[key.provider] || 0) + 1
		totalUsage += key.usageCount
	})
	
	return {
		totalKeys: allKeys.length,
		activeKeys: activeKeys.length,
		expiredKeys: expiredKeys.length,
		byProvider,
		totalUsage
	}
}

// Clear all keys (for testing/reset)
export async function clearVault(): Promise<void> {
	if (!browser) {
		return
	}
	
	const db = await getDB()
	
	return new Promise((resolve, reject) => {
		const transaction = db.transaction([VAULT_CONFIG.STORE_NAME], 'readwrite')
		const store = transaction.objectStore(VAULT_CONFIG.STORE_NAME)
		
		const request = store.clear()
		
		request.onerror = () => reject(request.error)
		request.onsuccess = () => resolve()
	})
}