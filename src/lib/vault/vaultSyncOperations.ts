// Sync operations for VaultManager

import type { SyncStatus } from './types'
import { getAllApiKeys } from './localVault'
import { checkCloudConnectivity, cloudVaultManager } from './cloudVault'

// Sync local and cloud vaults
export async function syncOperation(): Promise<SyncStatus> {
	// Check cloud availability
	const connectivity = await checkCloudConnectivity()
	if (!connectivity.connected) {
		return {
			status: 'offline',
			message: 'Cloud not available',
			timestamp: new Date()
		}
	}

	// Get local keys
	const localKeys = await getAllApiKeys()

	// Perform sync using cloud vault manager
	const syncResult = await cloudVaultManager.syncAll(localKeys)

	return {
		status: 'success',
		message: `Sync completed: ${syncResult.uploaded} uploaded, ${syncResult.downloaded} downloaded, ${syncResult.conflicts} conflicts`,
		timestamp: new Date(),
		details: {
			added: syncResult.downloaded,
			updated: syncResult.uploaded,
			conflicts: syncResult.conflicts
		}
	}
}