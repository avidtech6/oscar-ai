// Supabase Cloud Sync and Conflict Resolution
import { browser } from '$app/environment'
import type { SyncMetadata } from './layer1/syncMetadataCoreTypes'
import { generateHash, simpleMerge, intelligentMerge, SYNC_CONFIG } from './syncMetadata'
import { addToQueue } from './syncQueue'
import { uploadToCloud, downloadFromCloud } from './supabaseCloudCrud'
import type { CloudRecord } from './supabaseCloudClient'

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
        source: resolved.strategy === 'merge' ? 'merged' : 'cloud'
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