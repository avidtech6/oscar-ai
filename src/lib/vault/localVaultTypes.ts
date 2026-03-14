/**
 * Types and constants for local vault
 */

// API Key interface
export interface ApiKey {
	id: string
	keyName: string
	provider: 'openai' | 'anthropic' | 'google' | 'azure' | 'grok' | 'custom'
	modelFamily?: string
	encryptedKey: string // Base64 encoded AES-GCM encrypted key
	iv: string // Base64 encoded initialization vector
	keyVersion: number
	isActive: boolean
	lastUsedAt?: number
	usageCount: number
	rotationDueAt?: number
	createdAt: number
	updatedAt: number
	localHash: string // For conflict detection
	lastSyncedAt?: number
}

// Vault configuration
export const VAULT_CONFIG = {
	DB_NAME: 'oscar_ai_api_vault',
	DB_VERSION: 1,
	STORE_NAME: 'api_keys',
	KEY_ROTATION_DAYS: 90,
	MAX_KEY_VERSIONS: 3
}