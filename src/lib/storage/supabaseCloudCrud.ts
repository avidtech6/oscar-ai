// Supabase Cloud CRUD Operations
import { browser } from '$app/environment'
import type { SyncMetadata } from './syncMetadata'
import { getSupabaseClient, CLOUD_TABLES, type CloudRecord } from './supabaseCloudClient'

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