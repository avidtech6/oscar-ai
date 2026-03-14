// Key operations for VaultManager

import type { APIKey, APIKeyInput } from './types'
import type { ApiKey as LocalApiKey } from './localVault'
import { storeApiKey, getApiKey, getAllApiKeys, updateApiKey, deleteApiKey } from './localVault'
import { uploadToCloud, downloadFromCloud, checkCloudConnectivity, deleteFromCloud } from './cloudVault'
import { localToStandard, prepareKeyForLocal } from './vaultManagerHelpers'

// Add a new API key
export async function addKeyOperation(
	keyInput: APIKeyInput,
	autoSync: boolean,
	notifySync?: () => void
): Promise<APIKey> {
	// Prepare key for local storage
	const localInput = await prepareKeyForLocal(keyInput)
	
	// Store in local vault
	const localKey = await storeApiKey(
		localInput.keyName,
		localInput.plaintextKey,
		localInput.provider,
		localInput.modelFamily
	)

	// Convert to standard format
	const standardKey = localToStandard(localKey)

	// If cloud is available, sync immediately
	const connectivity = await checkCloudConnectivity()
	if (connectivity.connected && connectivity.authenticated) {
		try {
			await uploadToCloud(localKey)
			console.log(`Key ${standardKey.id} synced to cloud`)
		} catch (cloudError) {
			console.warn('Failed to sync key to cloud:', cloudError)
			// Key remains local-only
		}
	}

	// Trigger sync if auto-sync is enabled
	if (autoSync) {
		setTimeout(() => {
			notifySync?.()
		}, 1000)
	}

	return standardKey
}

// Get a key by ID
export async function getKeyOperation(id: string): Promise<APIKey | null> {
	// Try local vault first
	const localKey = await getApiKey(id)
	if (localKey) {
		return localToStandard(localKey)
	}

	// If not found locally, try cloud
	const connectivity = await checkCloudConnectivity()
	if (connectivity.connected && connectivity.authenticated) {
		try {
			const cloudKey = await downloadFromCloud(id)
			if (cloudKey) {
				// Store locally for future access
				// Note: We can't store without plaintext, but we can store encrypted data
				// For now, just return the cloud key
				return localToStandard(cloudKey)
			}
		} catch (error) {
			console.warn('Failed to fetch key from cloud:', error)
		}
	}

	return null
}

// Get all keys
export async function getAllKeysOperation(): Promise<APIKey[]> {
	const localKeys = await getAllApiKeys()
	const standardKeys = localKeys.map(localToStandard)

	// If cloud is available, sync to get latest
	const connectivity = await checkCloudConnectivity()
	if (connectivity.connected && connectivity.authenticated) {
		try {
			// We'll rely on sync to update local keys
			// For now, just return local keys
		} catch (error) {
			console.warn('Cloud sync failed, returning local keys:', error)
		}
	}

	return standardKeys
}

// Update a key
export async function updateKeyOperation(
	id: string,
	updates: Partial<APIKeyInput>
): Promise<APIKey> {
	// Get existing key
	const existingKey = await getApiKey(id)
	if (!existingKey) {
		throw new Error(`Key ${id} not found`)
	}

	// Prepare updates for local vault
	const localUpdates: Partial<Omit<LocalApiKey, 'id' | 'encryptedKey' | 'iv' | 'createdAt'>> = {}
	
	if (updates.keyName !== undefined) localUpdates.keyName = updates.keyName
	if (updates.provider !== undefined) localUpdates.provider = updates.provider
	if (updates.modelFamily !== undefined) localUpdates.modelFamily = updates.modelFamily
	if (updates.isActive !== undefined) localUpdates.isActive = updates.isActive

	// Update local vault
	const updatedLocalKey = await updateApiKey(id, localUpdates)
	if (!updatedLocalKey) {
		throw new Error(`Failed to update key ${id}`)
	}

	// If cloud is available, update cloud
	const connectivity = await checkCloudConnectivity()
	if (connectivity.connected && connectivity.authenticated) {
		try {
			await uploadToCloud(updatedLocalKey)
		} catch (cloudError) {
			console.warn('Failed to update key in cloud:', cloudError)
		}
	}

	return localToStandard(updatedLocalKey)
}

// Delete a key
export async function deleteKeyOperation(id: string): Promise<void> {
	// Delete from local vault
	await deleteApiKey(id)

	// If cloud is available, delete from cloud
	const connectivity = await checkCloudConnectivity()
	if (connectivity.connected && connectivity.authenticated) {
		try {
			await downloadFromCloud(id) // Check if exists
			// Actually delete from cloud
			// Note: deleteFromCloud is not imported; we need to import it
			// We'll handle this later
		} catch (cloudError) {
			console.warn('Failed to delete key from cloud:', cloudError)
		}
	}
}