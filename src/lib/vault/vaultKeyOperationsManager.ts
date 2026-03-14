// Vault key operations manager

import type { APIKey, APIKeyInput, SyncStatus } from './types'
import { addKeyOperation, getKeyOperation, getAllKeysOperation, updateKeyOperation, deleteKeyOperation } from './vaultKeyOperations'
import { syncOperation } from './vaultSyncOperations'

export class VaultKeyOperationsManager {
	// Add a new API key
	async addKey(keyInput: APIKeyInput, autoSync: boolean, onSync?: () => void): Promise<APIKey> {
		try {
			const key = await addKeyOperation(keyInput, autoSync, onSync)
			return key
		} catch (error) {
			console.error('Failed to add key:', error)
			throw error
		}
	}

	// Get a key by ID
	async getKey(id: string): Promise<APIKey | null> {
		return getKeyOperation(id)
	}

	// Get all keys
	async getAllKeys(): Promise<APIKey[]> {
		const keys = await getAllKeysOperation()
		return keys
	}

	// Update a key
	async updateKey(id: string, updates: Partial<APIKeyInput>): Promise<APIKey> {
		return updateKeyOperation(id, updates)
	}

	// Delete a key
	async deleteKey(id: string): Promise<void> {
		await deleteKeyOperation(id)
	}

	// Sync vault after key operations
	async syncVault(): Promise<SyncStatus> {
		try {
			return await syncOperation()
		} catch (error) {
			console.error('Sync failed:', error)
			throw error
		}
	}
}