// Supabase Cloud Storage Layer for Oscar AI V2
import { createClient } from '@supabase/supabase-js'
import { browser } from '$app/environment'
import type { SyncMetadata } from './syncMetadata'
import { generateHash, simpleMerge, intelligentMerge, SYNC_CONFIG } from './syncMetadata'
import { addToQueue } from './syncQueue'

// Environment variables
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

// Initialize Supabase client
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

// Cloud table names (match local tables)
const CLOUD_TABLES = {
  REPORTS: 'reports',
  NOTES: 'notes',
  SETTINGS: 'settings',
  INTELLIGENCE_TRACES: 'intelligence_traces',
  SYNC_METADATA: 'sync_metadata'
}

// Cloud record interface
export interface CloudRecord {
  id: string
  table: string
  data: any
  metadata: SyncMetadata
  created_at: string
  updated_at: string
  deleted_at: string | null
  version: number
}

// Conflict detection
function detectConflict(localMetadata: SyncMetadata, cloudMetadata: SyncMetadata): boolean {
  return localMetadata.hash !== cloudMetadata.hash
}

// Conflict resolution
interface ConflictResolution {
  data: any
  metadata: SyncMetadata
  strategy: 'local_wins' | 'cloud_wins' | 'merge'
}

function resolveConflict(
  localData: any,
  localMetadata: SyncMetadata,
  cloudData: any,
  cloudMetadata: SyncMetadata
): ConflictResolution {
  // Determine data type from table name
  let dataType: 'report' | 'note' | 'setting' | 'trace' = 'report'
  if (localMetadata.tableName.includes('note')) dataType = 'note'
  if (localMetadata.tableName.includes('setting')) dataType = 'setting'
  if (localMetadata.tableName.includes('trace')) dataType = 'trace'
  
  // Use intelligent merge for appropriate data types
  const mergeResult = intelligentMerge(
    localData,
    cloudData,
    localMetadata,
    cloudMetadata,
    dataType
  )
  
  // Create updated metadata
  const resolvedMetadata: SyncMetadata = {
    ...localMetadata,
    conflict: false,
    conflictResolution: mergeResult.resolution,
    updatedAt: Date.now(),
    version: Math.max(localMetadata.version, cloudMetadata.version) + 1
  }
  
  return {
    data: mergeResult.mergedData,
    metadata: resolvedMetadata,
    strategy: mergeResult.resolution === 'local' ? 'local_wins' :
              mergeResult.resolution === 'cloud' ? 'cloud_wins' : 'merge'
  }
}

// Upload record to cloud
export async function uploadToCloud(
  table: string,
  recordId: string,
  data: any,
  metadata: SyncMetadata
): Promise<CloudRecord> {
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
  const now = new Date().toISOString()
  
  // Prepare cloud record
  const cloudRecord: Partial<CloudRecord> = {
    id: recordId,
    table,
    data,
    metadata,
    created_at: now,
    updated_at: now,
    deleted_at: null,
    version: metadata.version
  }
  
  // Check if record already exists in cloud
  const { data: existingRecord } = await supabase
    .from(CLOUD_TABLES.SYNC_METADATA)
    .select('*')
    .eq('user_id', userId)
    .eq('table', table)
    .eq('record_id', recordId)
    .eq('deleted_at', null)
    .single()
  
  if (existingRecord) {
    // Update existing record
    const { data: updatedRecord, error } = await supabase
      .from(CLOUD_TABLES.SYNC_METADATA)
      .update({
        data,
        metadata,
        updated_at: now,
        version: metadata.version
      })
      .eq('id', existingRecord.id)
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to update cloud record: ${error.message}`)
    }
    
    return updatedRecord as CloudRecord
  } else {
    // Insert new record
    const { data: newRecord, error } = await supabase
      .from(CLOUD_TABLES.SYNC_METADATA)
      .insert({
        user_id: userId,
        table,
        record_id: recordId,
        data,
        metadata,
        created_at: now,
        updated_at: now,
        version: metadata.version
      })
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to create cloud record: ${error.message}`)
    }
    
    return newRecord as CloudRecord
  }
}

// Download record from cloud
export async function downloadFromCloud(
  table: string,
  recordId: string
): Promise<CloudRecord | null> {
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
  
  const { data: cloudRecord, error } = await supabase
    .from(CLOUD_TABLES.SYNC_METADATA)
    .select('*')
    .eq('user_id', userId)
    .eq('table', table)
    .eq('record_id', recordId)
    .eq('deleted_at', null)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // Record not found
      return null
    }
    throw new Error(`Failed to download cloud record: ${error.message}`)
  }
  
  return cloudRecord as CloudRecord
}

// Delete record from cloud (soft delete)
export async function deleteFromCloud(
  table: string,
  recordId: string
): Promise<void> {
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
  const now = new Date().toISOString()
  
  const { error } = await supabase
    .from(CLOUD_TABLES.SYNC_METADATA)
    .update({
      deleted_at: now,
      updated_at: now
    })
    .eq('user_id', userId)
    .eq('table', table)
    .eq('record_id', recordId)
    .eq('deleted_at', null)
  
  if (error) {
    throw new Error(`Failed to delete cloud record: ${error.message}`)
  }
}

// List all cloud records for a table
export async function listCloudRecords(
  table: string,
  options: {
    includeDeleted?: boolean
    limit?: number
    offset?: number
  } = {}
): Promise<CloudRecord[]> {
  if (!browser) {
    return []
  }
  
  const supabase = getSupabaseClient()
  
  // Check if user is authenticated
  const { data: session } = await supabase.auth.getSession()
  if (!session.session) {
    throw new Error('User must be authenticated to list cloud records')
  }
  
  const userId = session.session.user.id
  
  let query = supabase
    .from(CLOUD_TABLES.SYNC_METADATA)
    .select('*')
    .eq('user_id', userId)
    .eq('table', table)
  
  if (!options.includeDeleted) {
    query = query.is('deleted_at', null)
  }
  
  if (options.limit) {
    query = query.limit(options.limit)
  }
  
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }
  
  const { data: records, error } = await query.order('updated_at', { ascending: false })
  
  if (error) {
    throw new Error(`Failed to list cloud records: ${error.message}`)
  }
  
  return records as CloudRecord[]
}

// Sync local record to cloud
export async function syncToCloud(
  table: string,
  recordId: string,
  localData: any,
  localMetadata: SyncMetadata
): Promise<{
  success: boolean
  cloudRecord?: CloudRecord
  conflict?: boolean
  resolvedData?: any
}> {
  if (!browser) {
    return { success: false }
  }
  
  try {
    // Check if record exists in cloud
    const cloudRecord = await downloadFromCloud(table, recordId)
    
    if (!cloudRecord) {
      // No cloud record exists, upload local version
      const uploaded = await uploadToCloud(table, recordId, localData, localMetadata)
      return {
        success: true,
        cloudRecord: uploaded
      }
    }
    
    // Check for conflict
    const conflict = detectConflict(localMetadata, cloudRecord.metadata)
    
    if (!conflict) {
      // No conflict, update cloud with local version
      const updated = await uploadToCloud(table, recordId, localData, localMetadata)
      return {
        success: true,
        cloudRecord: updated
      }
    } else {
      // Conflict detected, resolve it
      const resolved = resolveConflict(localData, localMetadata, cloudRecord.data, cloudRecord.metadata)
      
      if (resolved.strategy === 'local_wins') {
        // Local wins, update cloud
        const updated = await uploadToCloud(table, recordId, resolved.data, resolved.metadata)
        return {
          success: true,
          conflict: true,
          cloudRecord: updated,
          resolvedData: resolved.data
        }
      } else if (resolved.strategy === 'cloud_wins') {
        // Cloud wins, return cloud data
        return {
          success: true,
          conflict: true,
          cloudRecord,
          resolvedData: cloudRecord.data
        }
      } else {
        // Merge strategy, upload merged version
        const updated = await uploadToCloud(table, recordId, resolved.data, resolved.metadata)
        return {
          success: true,
          conflict: true,
          cloudRecord: updated,
          resolvedData: resolved.data
        }
      }
    }
  } catch (error: any) {
    console.error(`Failed to sync ${table}/${recordId} to cloud:`, error)
    
    // Add to queue for retry
    await addToQueue('update', table, recordId, localData)
    
    return {
      success: false
    }
  }
}

// Sync cloud record to local
export async function syncFromCloud(
  table: string,
  recordId: string,
  localData: any,
  localMetadata: SyncMetadata
): Promise<{
  success: boolean
  data?: any
  metadata?: SyncMetadata
  conflict?: boolean
  source: 'cloud' | 'local' | 'merged'
}> {
  if (!browser) {
    return { success: false, source: 'local' }
  }
  
  try {
    const cloudRecord = await downloadFromCloud(table, recordId)
    
    if (!cloudRecord) {
      // No cloud record, keep local
      return {
        success: true,
        data: localData,
        metadata: localMetadata,
        source: 'local'
      }
    }
    
    // Check for conflict
    const conflict = detectConflict(localMetadata, cloudRecord.metadata)
    
    if (!conflict) {
      // No conflict, use cloud version
      return {
        success: true,
        data: cloudRecord.data,
        metadata: cloudRecord.metadata,
        source: 'cloud'
      }
    } else {
      // Conflict detected, resolve it
      const resolved = resolveConflict(localData, localMetadata, cloudRecord.data, cloudRecord.metadata)
      
      return {
        success: true,
        data: resolved.data,
        metadata: resolved.metadata,
        conflict: true,
        source: resolved.strategy === 'merge' ? 'merged' : 
                resolved.strategy === 'local_wins' ? 'local' : 'cloud'
      }
    }
  } catch (error: any) {
    console.error(`Failed to sync ${table}/${recordId} from cloud:`, error)
    return {
      success: false,
      source: 'local'
    }
  }
}

// Bulk sync: upload all local records to cloud
export async function bulkUploadToCloud(): Promise<{
  total: number
  uploaded: number
  failed: number
  conflicts: number
}> {
  if (!browser) {
    return { total: 0, uploaded: 0, failed: 0, conflicts: 0 }
  }
  
  // This would require fetching all local records and syncing them
  // For now, return placeholder stats
  return {
    total: 0,
    uploaded: 0,
    failed: 0,
    conflicts: 0
  }
}

// Bulk sync: download all cloud records to local
export async function bulkDownloadFromCloud(): Promise<{
  total: number
  downloaded: number
  failed: number
  conflicts: number
}> {
  if (!browser) {
    return { total: 0, downloaded: 0, failed: 0, conflicts: 0 }
  }
  
  // This would require fetching all cloud records and syncing them
  // For now, return placeholder stats
  return {
    total: 0,
    downloaded: 0,
    failed: 0,
    conflicts: 0
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
    const { data, error } = await supabase.from(CLOUD_TABLES.SYNC_METADATA).select('count').limit(1)
    
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

// Cloud storage statistics
export async function getCloudStorageStats(): Promise<{
  totalRecords: number
  totalSize: number
  byTable: Record<string, { count: number; size: number }>
  lastSync: string | null
}> {
  if (!browser) {
    return {
      totalRecords: 0,
      totalSize: 0,
      byTable: {},
      lastSync: null
    }
  }
  
  const supabase = getSupabaseClient()
  
  try {
    const { data: session } = await supabase.auth.getSession()
    if (!session.session) {
      throw new Error('Not authenticated')
    }
    
    const userId = session.session.user.id
    
    // Get all records
    const { data: allRecords, error } = await supabase
      .from(CLOUD_TABLES.SYNC_METADATA)
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
    
    if (error) {
      throw new Error(`Failed to get cloud records: ${error.message}`)
    }
    
    let totalSize = 0
    const byTable: Record<string, { count: number; size: number }> = {}
    
    if (allRecords && allRecords.length > 0) {
      // Calculate approximate size and group by table
      allRecords.forEach((record: any) => {
        const recordSize = JSON.stringify(record).length
        totalSize += recordSize
        
        const tableName = record.table
        if (!byTable[tableName]) {
          byTable[tableName] = { count: 0, size: 0 }
        }
        
        byTable[tableName].count += 1
        byTable[tableName].size += recordSize
      })
      
      // Get last sync time (most recent updated_at)
      const lastRecord = allRecords.reduce((latest: any, record: any) => {
        return new Date(record.updated_at) > new Date(latest.updated_at) ? record : latest
      }, allRecords[0])
      
      return {
        totalRecords: allRecords.length,
        totalSize,
        byTable,
        lastSync: lastRecord.updated_at
      }
    }
    
    return {
      totalRecords: 0,
      totalSize: 0,
      byTable: {},
      lastSync: null
    }
  } catch (error) {
    console.error('Failed to get cloud storage stats:', error)
    return {
      totalRecords: 0,
      totalSize: 0,
      byTable: {},
      lastSync: null
    }
  }
}

// Cloud storage manager
export class CloudStorageManager {
  private isSyncing = false
  
  // Start automatic sync
  async startAutoSync(interval: number = SYNC_CONFIG.AUTO_SYNC_INTERVAL): Promise<void> {
    if (!browser || this.isSyncing) {
      return
    }
    
    // This would set up an interval for automatic sync
    // For now, just do a one-time sync
    await this.syncAll()
  }
  
  // Stop automatic sync
  stopAutoSync(): void {
    // Clear any intervals
  }
  
  // Sync all tables
  async syncAll(): Promise<{
    tables: string[]
    synced: number
    failed: number
    conflicts: number
  }> {
    if (!browser || this.isSyncing) {
      return { tables: [], synced: 0, failed: 0, conflicts: 0 }
    }
    
    this.isSyncing = true
    
    try {
      // This would implement actual sync logic
      // For now, return placeholder
      return {
        tables: ['reports', 'notes', 'settings', 'intelligence_traces'],
        synced: 0,
        failed: 0,
        conflicts: 0
      }
    } finally {
      this.isSyncing = false
    }
  }
  
  // Get sync status
  async getStatus(): Promise<{
    isSyncing: boolean
    connectivity: Awaited<ReturnType<typeof checkCloudConnectivity>>
    stats: Awaited<ReturnType<typeof getCloudStorageStats>>
  }> {
    const [connectivity, stats] = await Promise.all([
      checkCloudConnectivity(),
      getCloudStorageStats()
    ])
    
    return {
      isSyncing: this.isSyncing,
      connectivity,
      stats
    }
  }
}

// Singleton instance
export const cloudStorageManager = new CloudStorageManager()