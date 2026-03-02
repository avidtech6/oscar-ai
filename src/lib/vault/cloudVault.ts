// Cloud Vault Integration for Supabase
// Handles sync between local vault and cloud storage
import { createClient } from '@supabase/supabase-js'
import { browser } from '$app/environment'
import type { ApiKey } from './localVault'
import { generateHash } from './localVault'

// Environment variables
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

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
const SYNC_CONFIG = {
  BATCH_SIZE: 50,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CONFLICT_RESOLUTION: 'timestamp' as 'timestamp' | 'version' | 'manual'
}

// Supabase client
let supabaseClient: any = null

function getSupabaseClient() {
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
function localToCloud(key: ApiKey, userId: string): CloudApiKey {
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
function cloudToLocal(key: CloudApiKey): ApiKey {
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

// Detect conflict between local and cloud keys
async function detectConflict(localKey: ApiKey, cloudKey: ApiKey): Promise<boolean> {
  // Compare hashes first
  if (localKey.localHash && cloudKey.localHash) {
    return localKey.localHash !== cloudKey.localHash
  }
  
  // Fallback to timestamp comparison
  return localKey.updatedAt !== new Date(cloudKey.updatedAt).getTime()
}

// Resolve conflict between local and cloud keys
async function resolveConflict(
  localKey: ApiKey,
  cloudKey: ApiKey
): Promise<'local' | 'cloud' | 'merged'> {
  const localTime = localKey.updatedAt
  const cloudTime = new Date(cloudKey.updatedAt).getTime()
  
  // Simple timestamp-based resolution
  if (localTime > cloudTime) {
    return 'local'
  } else if (cloudTime > localTime) {
    return 'cloud'
  }
  
  // Same timestamp, compare versions
  if (localKey.keyVersion > cloudKey.keyVersion) {
    return 'local'
  } else if (cloudKey.keyVersion > localKey.keyVersion) {
    return 'cloud'
  }
  
  // Default to local
  return 'local'
}

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

// Get cloud vault statistics
export async function getCloudVaultStats(): Promise<{
  totalKeys: number
  activeKeys: number
  byProvider: Record<string, number>
  lastSync: string | null
}> {
  if (!browser) {
    return {
      totalKeys: 0,
      activeKeys: 0,
      byProvider: {},
      lastSync: null
    }
  }
  
  try {
    const cloudKeys = await listCloudKeys()
    
    const byProvider: Record<string, number> = {}
    let activeKeys = 0
    
    cloudKeys.forEach(key => {
      byProvider[key.provider] = (byProvider[key.provider] || 0) + 1
      if (key.isActive) {
        activeKeys++
      }
    })
    
    // Get most recent sync time
    const lastSync = cloudKeys.length > 0
      ? new Date(Math.max(...cloudKeys.map(k => k.lastSyncedAt || 0))).toISOString()
      : null
    
    return {
      totalKeys: cloudKeys.length,
      activeKeys,
      byProvider,
      lastSync
    }
  } catch (error) {
    console.error('Failed to get cloud vault stats:', error)
    return {
      totalKeys: 0,
      activeKeys: 0,
      byProvider: {},
      lastSync: null
    }
  }
}

// Check cloud connectivity
export async function checkCloudConnectivity(): Promise<{
  connected: boolean
  authenticated: boolean
  latency: number | null
  error?: string
}> {
  if (!browser) {
    return { connected: false, authenticated: false, latency: null, error: 'Browser required' }
  }
  
  const supabase = getSupabaseClient()
  
  try {
    const startTime = performance.now()
    
    // Simple ping to Supabase
    const { data, error } = await supabase.from('api_keys').select('count').limit(1)
    
    const latency = performance.now() - startTime
    
    if (error) {
      // Check if it's an auth error
      if (error.message.includes('JWT')) {
        return {
          connected: true,
          authenticated: false,
          latency,
          error: 'Authentication required'
        }
      }
      
      return {
        connected: false,
        authenticated: false,
        latency,
        error: error.message
      }
    }
    
    // Check authentication status
    const { data: session } = await supabase.auth.getSession()
    
    return {
      connected: true,
      authenticated: !!session.session,
      latency
    }
  } catch (error: any) {
    return {
      connected: false,
      authenticated: false,
      latency: null,
      error: error.message || 'Unknown error'
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

// Singleton instance
export const cloudVaultManager = new CloudVaultManager()