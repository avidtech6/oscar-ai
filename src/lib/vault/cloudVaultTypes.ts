/**
 * Types and constants for cloud vault
 */

// Cloud API key interface (matches Supabase table)
export interface CloudApiKey {
	id: string
	user_id: string
	encrypted_key: string
	iv: string
	key_name: string
	provider: 'openai' | 'anthropic' | 'google' | 'azure' | 'grok' | 'custom'
	model_family?: string
	last_used_at?: string
	usage_count: number
	key_version: number
	rotation_due_at?: string
	is_active: boolean
	local_hash?: string
	last_synced_at?: string
	created_at: string
	updated_at: string
}

// Sync configuration
export const SYNC_CONFIG = {
	BATCH_SIZE: 50,
	MAX_RETRY_ATTEMPTS: 3,
	RETRY_DELAY: 1000,
	CONFLICT_RESOLUTION: 'timestamp' as 'timestamp' | 'version' | 'manual'
}