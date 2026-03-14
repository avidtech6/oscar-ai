/**
 * Cloud vault sync operations
 */

import { browser } from '$app/environment'
import type { ApiKey } from './localVault'
import type { CloudApiKey } from './cloudVaultTypes'
import { getSupabaseClient, localToCloud } from './cloudVaultHelpers'
import { detectConflict, resolveConflict } from './cloudVaultConflict'
import { uploadToCloud, downloadFromCloud } from './cloudVaultCrud'

// Sync local key to cloud
export async function syncToCloud(key: ApiKey): Promise<{
	success: boolean
	cloudKey?: CloudApiKey
	conflict?: boolean
	resolution?: 'local' | 'cloud' | 'merged'
}> {
	if (!browser) {
		return { success: false }
	}
	
	try {
		const cloudKey = await downloadFromCloud(key.id)
		
		if (!cloudKey) {
			// No cloud key exists, upload local version
			const uploaded = await uploadToCloud(key)
			return {
				success: true,
				cloudKey: uploaded
			}
		}
		
		// Check for conflict
		const conflict = await detectConflict(key, cloudKey)
		
		if (!conflict) {
			// No conflict, update cloud with local version
			const updated = await uploadToCloud(key)
			return {
				success: true,
				cloudKey: updated
			}
		} else {
			// Conflict detected, resolve it
			const resolution = await resolveConflict(key, cloudKey)
			
			if (resolution === 'local') {
				// Local wins, update cloud
				const updated = await uploadToCloud(key)
				return {
					success: true,
					cloudKey: updated,
					conflict: true,
					resolution: 'local'
				}
			} else if (resolution === 'cloud') {
				// Cloud wins, return cloud key
				return {
					success: true,
					cloudKey: localToCloud(cloudKey, 'temp'),
					conflict: true,
					resolution: 'cloud'
				}
			} else {
				// Merge needed (for now, local wins)
				const updated = await uploadToCloud(key)
				return {
					success: true,
					cloudKey: updated,
					conflict: true,
					resolution: 'merged'
				}
			}
		}
	} catch (error: any) {
		console.error(`Failed to sync key ${key.id} to cloud:`, error)
		return {
			success: false
		}
	}
}

// Sync cloud key to local
export async function syncFromCloud(keyId: string, localKey?: ApiKey): Promise<{
	success: boolean
	key?: ApiKey
	conflict?: boolean
	resolution?: 'local' | 'cloud' | 'merged'
}> {
	if (!browser) {
		return { success: false }
	}
	
	try {
		const cloudKey = await downloadFromCloud(keyId)
		
		if (!cloudKey) {
			// No cloud key exists
			return {
				success: true,
				key: localKey
			}
		}
		
		if (!localKey) {
			// No local key, use cloud version
			return {
				success: true,
				key: cloudKey,
				resolution: 'cloud'
			}
		}
		
		// Check for conflict
		const conflict = await detectConflict(localKey, cloudKey)
		
		if (!conflict) {
			// No conflict, use cloud version
			return {
				success: true,
				key: cloudKey,
				resolution: 'cloud'
			}
		} else {
			// Conflict detected, resolve it
			const resolution = await resolveConflict(localKey, cloudKey)
			
			return {
				success: true,
				key: resolution === 'local' ? localKey : cloudKey,
				conflict: true,
				resolution
			}
		}
	} catch (error: any) {
		console.error(`Failed to sync key ${keyId} from cloud:`, error)
		return {
			success: false
		}
	}
}

// Mark key as synced in cloud
export async function markKeyAsSynced(keyId: string): Promise<void> {
	if (!browser) {
		return
	}
	
	const supabase = getSupabaseClient()
	
	// Check if user is authenticated
	const { data: session } = await supabase.auth.getSession()
	if (!session.session) {
		throw new Error('User must be authenticated to mark key as synced')
	}
	
	const userId = session.session.user.id
	const now = new Date().toISOString()
	
	const { error } = await supabase
		.from('api_keys')
		.update({
			last_synced_at: now,
			updated_at: now
		})
		.eq('id', keyId)
		.eq('user_id', userId)
	
	if (error) {
		throw new Error(`Failed to mark key as synced: ${error.message}`)
	}
}