// Helper functions for VaultManager

import type { APIKey, APIKeyInput } from './types'
import type { ApiKey as LocalApiKey } from './localVault'

// Helper function to convert LocalApiKey to APIKey
export function localToStandard(localKey: LocalApiKey): APIKey {
	return {
		id: localKey.id,
		keyName: localKey.keyName,
		provider: localKey.provider,
		modelFamily: localKey.modelFamily,
		encryptedKey: localKey.encryptedKey,
		iv: localKey.iv,
		keyVersion: localKey.keyVersion,
		isActive: localKey.isActive,
		lastUsedAt: localKey.lastUsedAt,
		usageCount: localKey.usageCount,
		rotationDueAt: localKey.rotationDueAt,
		createdAt: localKey.createdAt,
		updatedAt: localKey.updatedAt,
		localHash: localKey.localHash,
		lastSyncedAt: localKey.lastSyncedAt,
		cloudId: localKey.id // Local ID used as cloud ID for now
	}
}

// Helper function to convert APIKeyInput to local storage format
export async function prepareKeyForLocal(keyInput: APIKeyInput): Promise<{
	keyName: string
	plaintextKey: string
	provider: LocalApiKey['provider']
	modelFamily?: string
}> {
	return {
		keyName: keyInput.keyName,
		plaintextKey: keyInput.plaintextKey,
		provider: keyInput.provider,
		modelFamily: keyInput.modelFamily
	}
}