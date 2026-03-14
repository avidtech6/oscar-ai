/**
 * Basic cloud vault CRUD operations
 */

import { browser } from '$app/environment'
import type { ApiKey } from './localVault'
import type { CloudApiKey } from './cloudVaultTypes'
import { getSupabaseClient, localToCloud, cloudToLocal } from './cloudVaultHelpers'

// Upload API key to cloud
export async function uploadToCloud(key: ApiKey): Promise<CloudApiKey> {
	if (!browser) {
		throw new Error('Cloud operations require browser environment')
	}
	
	const supabase = getSupabaseClient()
	
	// Check if user is authenticated
	const { data: session } = await supabase.auth.getSession()
	if (!session.session) {
		throw new Error('User must be authenticated to upload to cloud')
	}
	
	const userId = session.session.user.id
	const cloudKey = localToCloud(key, userId)
	
	// Check if key already exists in cloud
	const { data: existingKey } = await supabase
		.from('api_keys')
		.select('*')
		.eq('id', key.id)
		.eq('user_id', userId)
		.single()
	
	if (existingKey) {
		// Update existing key
		const { data: updatedKey, error } = await supabase
			.from('api_keys')
			.update({
				encrypted_key: cloudKey.encrypted_key,
				iv: cloudKey.iv,
				key_name: cloudKey.key_name,
				provider: cloudKey.provider,
				model_family: cloudKey.model_family,
				key_version: cloudKey.key_version,
				is_active: cloudKey.is_active,
				rotation_due_at: cloudKey.rotation_due_at,
				local_hash: cloudKey.local_hash,
				last_synced_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			})
			.eq('id', key.id)
			.eq('user_id', userId)
			.select()
			.single()
		
		if (error) {
			throw new Error(`Failed to update cloud key: ${error.message}`)
		}
		
		return updatedKey as CloudApiKey
	} else {
		// Insert new key
		const { data: newKey, error } = await supabase
			.from('api_keys')
			.insert(cloudKey)
			.select()
			.single()
		
		if (error) {
			throw new Error(`Failed to create cloud key: ${error.message}`)
		}
		
		return newKey as CloudApiKey
	}
}

// Download API key from cloud
export async function downloadFromCloud(keyId: string): Promise<ApiKey | null> {
	if (!browser) {
		return null
	}
	
	const supabase = getSupabaseClient()
	
	// Check if user is authenticated
	const { data: session } = await supabase.auth.getSession()
	if (!session.session) {
		throw new Error('User must be authenticated to download from cloud')
	}
	
	const userId = session.session.user.id
	
	const { data: cloudKey, error } = await supabase
		.from('api_keys')
		.select('*')
		.eq('id', keyId)
		.eq('user_id', userId)
		.single()
	
	if (error) {
		if (error.code === 'PGRST116') {
			// Key not found
			return null
		}
		throw new Error(`Failed to download cloud key: ${error.message}`)
	}
	
	return cloudToLocal(cloudKey as CloudApiKey)
}

// Delete API key from cloud
export async function deleteFromCloud(keyId: string): Promise<void> {
	if (!browser) {
		return
	}
	
	const supabase = getSupabaseClient()
	
	// Check if user is authenticated
	const { data: session } = await supabase.auth.getSession()
	if (!session.session) {
		throw new Error('User must be authenticated to delete from cloud')
	}
	
	const userId = session.session.user.id
	
	const { error } = await supabase
		.from('api_keys')
		.delete()
		.eq('id', keyId)
		.eq('user_id', userId)
	
	if (error) {
		throw new Error(`Failed to delete cloud key: ${error.message}`)
	}
}

// List all API keys from cloud
export async function listCloudKeys(): Promise<ApiKey[]> {
	if (!browser) {
		return []
	}
	
	const supabase = getSupabaseClient()
	
	// Check if user is authenticated
	const { data: session } = await supabase.auth.getSession()
	if (!session.session) {
		throw new Error('User must be authenticated to list cloud keys')
	}
	
	const userId = session.session.user.id
	
	const { data: cloudKeys, error } = await supabase
		.from('api_keys')
		.select('*')
		.eq('user_id', userId)
		.order('updated_at', { ascending: false })
	
	if (error) {
		throw new Error(`Failed to list cloud keys: ${error.message}`)
	}
	
	return (cloudKeys || []).map(cloudToLocal)
}