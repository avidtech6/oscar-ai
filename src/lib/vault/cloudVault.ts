/**
 * Cloud Vault Integration for Supabase
 * Barrel file exporting all cloud vault functionality
 */

// Types and constants
export type { CloudApiKey } from './cloudVaultTypes'
export { SYNC_CONFIG } from './cloudVaultTypes'

// Helper functions
export { getSupabaseClient, localToCloud, cloudToLocal } from './cloudVaultHelpers'

// Core operations
export {
	uploadToCloud,
	downloadFromCloud,
	deleteFromCloud,
	listCloudKeys
} from './cloudVaultCrud'

export {
	detectConflict,
	resolveConflict
} from './cloudVaultConflict'

export {
	syncToCloud,
	syncFromCloud,
	markKeyAsSynced
} from './cloudVaultSync'

export {
	bulkUploadToCloud,
	bulkDownloadFromCloud
} from './cloudVaultBulk'

export {
	getCloudVaultStats,
	checkCloudConnectivity
} from './cloudVaultUtils'

// Manager class
export { CloudVaultManager } from './cloudVaultManagerClass'

// Singleton instance
import { CloudVaultManager } from './cloudVaultManagerClass'
export const cloudVaultManager = new CloudVaultManager()