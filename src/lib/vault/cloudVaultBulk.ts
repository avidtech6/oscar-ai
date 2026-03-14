/**
 * Cloud vault bulk operations
 */

import { browser } from '$app/environment'
import type { ApiKey } from './localVault'
import { syncToCloud, syncFromCloud } from './cloudVaultSync'
import { listCloudKeys } from './cloudVaultCrud'

// Bulk upload all local keys to cloud
export async function bulkUploadToCloud(localKeys: ApiKey[]): Promise<{
	total: number
	uploaded: number
	failed: number
	conflicts: number
}> {
	if (!browser) {
		return { total: 0, uploaded: 0, failed: 0, conflicts: 0 }
	}
	
	let uploaded = 0
	let failed = 0
	let conflicts = 0
	
	for (const key of localKeys) {
		try {
			const result = await syncToCloud(key)
			
			if (result.success) {
				uploaded++
				if (result.conflict) {
					conflicts++
				}
			} else {
				failed++
			}
		} catch (error) {
			console.error(`Failed to upload key ${key.id}:`, error)
			failed++
		}
	}
	
	return {
		total: localKeys.length,
		uploaded,
		failed,
		conflicts
	}
}

// Bulk download all cloud keys to local
export async function bulkDownloadFromCloud(): Promise<{
	total: number
	downloaded: number
	failed: number
	conflicts: number
}> {
	if (!browser) {
		return { total: 0, downloaded: 0, failed: 0, conflicts: 0 }
	}
	
	try {
		const cloudKeys = await listCloudKeys()
		
		return {
			total: cloudKeys.length,
			downloaded: cloudKeys.length,
			failed: 0,
			conflicts: 0
		}
	} catch (error) {
		console.error('Failed to download cloud keys:', error)
		return {
			total: 0,
			downloaded: 0,
			failed: 1,
			conflicts: 0
		}
	}
}