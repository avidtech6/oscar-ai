/**
 * Local Encrypted Vault for API Keys
 * Barrel file exporting all local vault functionality
 */

// Types and constants
export type { ApiKey } from './localVaultTypes'
export { VAULT_CONFIG } from './localVaultTypes'

// Helper functions
export { generateHash, encryptApiKey, decryptApiKey } from './localVaultHelpers'

// Core operations
export {
	storeApiKey,
	getApiKey,
	getAllApiKeys,
	updateApiKey,
	deleteApiKey
} from './localVaultCrud'

export {
	getActiveApiKeys,
	rotateApiKey,
	markKeyAsUsed,
	getKeysNeedingRotation,
	deactivateExpiredKeys
} from './localVaultKeyManagement'

export {
	searchApiKeys
} from './localVaultSearch'

export {
	getVaultStats,
	clearVault
} from './localVaultStats'

export {
	exportEncryptedKeys,
	importEncryptedKeys
} from './localVaultImportExport'

// Vault managers
export { VaultKeyOperationsManager } from './vaultKeyOperationsManager'
export { VaultStatsManager } from './vaultStatsManager'
export { VaultImportExportManager } from './vaultImportExportManager'
export { VaultSyncManager } from './vaultSyncManager'