/**
 * Helper functions for cloud vault
 */

import { createClient } from '@supabase/supabase-js'
import { browser } from '$app/environment'
import type { ApiKey } from './localVault'
import type { CloudApiKey } from './cloudVaultTypes'

// Environment variables
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

// Supabase client
let supabaseClient: any = null

export function getSupabaseClient() {
	if (!browser) {
		throw new Error('Supabase client requires browser environment')
	}
	
	if (!supabaseClient) {
		if (!supabaseUrl || !supabaseAnonKey) {
			throw new Error('Supabase URL and Anon Key must be configured in environment variables')
		}
		
		supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
			auth: {
				persistSession: true,
				autoRefreshToken: true,
				detectSessionInUrl: true
			}
		})
	}
	
	return supabaseClient
}

// Convert local API key to cloud format
export function localToCloud(key: ApiKey, userId: string): CloudApiKey {
	return {
		id: key.id,
		user_id: userId,
		encrypted_key: key.encryptedKey,
		iv: key.iv,
		key_name: key.keyName,
		provider: key.provider,
		model_family: key.modelFamily,
		last_used_at: key.lastUsedAt ? new Date(key.lastUsedAt).toISOString() : undefined,
		usage_count: key.usageCount,
		key_version: key.keyVersion,
		rotation_due_at: key.rotationDueAt ? new Date(key.rotationDueAt).toISOString() : undefined,
		is_active: key.isActive,
		local_hash: key.localHash,
		last_synced_at: key.lastSyncedAt ? new Date(key.lastSyncedAt).toISOString() : undefined,
		created_at: new Date(key.createdAt).toISOString(),
		updated_at: new Date(key.updatedAt).toISOString()
	}
}

// Convert cloud API key to local format
export function cloudToLocal(key: CloudApiKey): ApiKey {
	return {
		id: key.id,
		keyName: key.key_name,
		provider: key.provider,
		modelFamily: key.model_family,
		encryptedKey: key.encrypted_key,
		iv: key.iv,
		keyVersion: key.key_version,
		isActive: key.is_active,
		lastUsedAt: key.last_used_at ? new Date(key.last_used_at).getTime() : undefined,
		usageCount: key.usage_count,
		rotationDueAt: key.rotation_due_at ? new Date(key.rotation_due_at).getTime() : undefined,
		createdAt: new Date(key.created_at).getTime(),
		updatedAt: new Date(key.updated_at).getTime(),
		localHash: key.local_hash || '',
		lastSyncedAt: key.last_synced_at ? new Date(key.last_synced_at).getTime() : undefined
	}
}