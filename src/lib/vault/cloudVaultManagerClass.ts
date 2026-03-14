/**
 * Cloud Vault Manager class
 */

import { browser } from '$app/environment'
import type { ApiKey } from './localVault'
import { bulkUploadToCloud, bulkDownloadFromCloud, checkCloudConnectivity, getCloudVaultStats } from './cloudVaultOperations'

// Cloud vault manager
export class CloudVaultManager {
	private isSyncing = false
	
	// Sync all keys between local and cloud
	async syncAll(localKeys: ApiKey[]): Promise<{
		total: number
		uploaded: number
		downloaded: number
		conflicts: number
		errors: string[]
	}> {
		if (!browser || this.isSyncing) {
			return { total: 0, uploaded: 0, downloaded: 0, conflicts: 0, errors: ['Not in browser or already syncing'] }
		}
		
		this.isSyncing = true
		const errors: string[] = []
		
		try {
			// Upload local keys to cloud
			const uploadResult = await bulkUploadToCloud(localKeys)
			
			// Download cloud keys
			const downloadResult = await bulkDownloadFromCloud()
			
			return {
				total: localKeys.length + downloadResult.total,
				uploaded: uploadResult.uploaded,
				downloaded: downloadResult.downloaded,
				conflicts: uploadResult.conflicts + downloadResult.conflicts,
				errors
			}
		} catch (error: any) {
			errors.push(error.message || 'Unknown sync error')
			return {
				total: 0,
				uploaded: 0,
				downloaded: 0,
				conflicts: 0,
				errors
			}
		} finally {
			this.isSyncing = false
		}
	}
	
	// Get sync status
	async getSyncStatus(): Promise<{
		isSyncing: boolean
		connectivity: Awaited<ReturnType<typeof checkCloudConnectivity>>
		stats: Awaited<ReturnType<typeof getCloudVaultStats>>
	}> {
		const [connectivity, stats] = await Promise.all([
			checkCloudConnectivity(),
			getCloudVaultStats()
		])
		
		return {
			isSyncing: this.isSyncing,
			connectivity,
			stats
		}
	}
}