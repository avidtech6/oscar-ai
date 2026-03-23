// Supabase Cloud Sync and Conflict Resolution - Layer 1 Pure Core Logic
// Extracted from supabaseCloudSync.ts for Layer 1 purity

// Conflict detection - pure logic
export function detectConflictCore(
  localMetadata: {
    hash: string
  },
  cloudMetadata: {
    hash: string
  }
): boolean {
  return localMetadata.hash !== cloudMetadata.hash
}

// Conflict resolution - pure logic
export interface ConflictResolutionCore {
  data: any
  metadata: {
    id: string
    tableName: string
    recordId: string
    lastSyncedAt: number | null
    hash: string
    deviceId: string
    version: number
    conflict: boolean
    conflictResolution: 'local' | 'cloud' | 'merged' | null
    createdAt: number
    updatedAt: number
  }
  strategy: 'local_wins' | 'cloud_wins' | 'merge'
}

export function resolveConflictCore(
  localData: any,
  localMetadata: {
    id: string
    tableName: string
    recordId: string
    lastSyncedAt: number | null
    hash: string
    deviceId: string
    version: number
    conflict: boolean
    conflictResolution: 'local' | 'cloud' | 'merged' | null
    createdAt: number
    updatedAt: number
  },
  cloudData: any,
  cloudMetadata: {
    id: string
    tableName: string
    recordId: string
    lastSyncedAt: number | null
    hash: string
    deviceId: string
    version: number
    conflict: boolean
    conflictResolution: 'local' | 'cloud' | 'merged' | null
    createdAt: number
    updatedAt: number
  }
): ConflictResolutionCore {
  // Determine data type from table name
  let dataType: 'report' | 'note' | 'setting' | 'trace' = 'report'
  if (localMetadata.tableName.includes('note')) dataType = 'note'
  if (localMetadata.tableName.includes('setting')) dataType = 'setting'
  if (localMetadata.tableName.includes('trace')) dataType = 'trace'
  
  // Import merge functions (already in Layer 1)
  const { intelligentMerge } = require('./syncMetadataMerge')
  
  // Use intelligent merge for appropriate data types
  const mergeResult = intelligentMerge(
    localData,
    cloudData,
    localMetadata,
    cloudMetadata,
    dataType
  )
  
  // Create updated metadata
  const resolvedMetadata = {
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

// Sync local record to cloud - pure logic
export async function syncToCloudCore(
  table: string,
  recordId: string,
  localData: any,
  localMetadata: {
    id: string
    tableName: string
    recordId: string
    lastSyncedAt: number | null
    hash: string
    deviceId: string
    version: number
    conflict: boolean
    conflictResolution: 'local' | 'cloud' | 'merged' | null
    createdAt: number
    updatedAt: number
  },
  downloadFromCloud: (table: string, recordId: string) => Promise<any>,
  uploadToCloud: (table: string, recordId: string, data: any, metadata: any) => Promise<any>
): Promise<{
  success: boolean
  cloudRecord?: any
  conflict?: boolean
  resolvedData?: any
}> {
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
    const conflict = detectConflictCore(localMetadata, cloudRecord.metadata)
    
    if (!conflict) {
      // No conflict, update cloud with local version
      const updated = await uploadToCloud(table, recordId, localData, localMetadata)
      return {
        success: true,
        cloudRecord: updated
      }
    } else {
      // Conflict detected, resolve it
      const resolved = resolveConflictCore(localData, localMetadata, cloudRecord.data, cloudRecord.metadata)
      
      // Upload resolved data
      const uploaded = await uploadToCloud(table, recordId, resolved.data, resolved.metadata)
      
      return {
        success: true,
        cloudRecord: uploaded,
        conflict: true,
        resolvedData: resolved.data
      }
    }
  } catch (error) {
    return {
      success: false,
      conflict: false
    }
  }
}

// Sync from cloud to local - pure logic
export async function syncFromCloudCore(
  table: string,
  recordId: string,
  localData: any,
  localMetadata: {
    id: string
    tableName: string
    recordId: string
    lastSyncedAt: number | null
    hash: string
    deviceId: string
    version: number
    conflict: boolean
    conflictResolution: 'local' | 'cloud' | 'merged' | null
    createdAt: number
    updatedAt: number
  },
  downloadFromCloud: (table: string, recordId: string) => Promise<any>,
  storeRecord: (table: string, recordId: string, data: any) => Promise<any>,
  updateRecord: (table: string, recordId: string, data: any) => Promise<any>
): Promise<{
  success: boolean
  data?: any
  metadata?: any
  conflict?: boolean
  source: 'cloud' | 'local' | 'merged'
}> {
  try {
    // Get cloud record
    const cloudRecord = await downloadFromCloud(table, recordId)
    
    if (!cloudRecord) {
      // No cloud record exists, use local version
      return {
        success: true,
        data: localData,
        metadata: localMetadata,
        source: 'local'
      }
    }
    
    // Check for conflict
    const conflict = detectConflictCore(localMetadata, cloudRecord.metadata)
    
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
      const resolved = resolveConflictCore(localData, localMetadata, cloudRecord.data, cloudRecord.metadata)
      
      // Store resolved data locally
      await storeRecord(table, recordId, resolved.data)
      
      return {
        success: true,
        data: resolved.data,
        metadata: resolved.metadata,
        conflict: true,
        source: resolved.strategy === 'merge' ? 'merged' : 'cloud'
      }
    }
  } catch (error) {
    return {
      success: false,
      data: localData,
      metadata: localMetadata,
      source: 'local'
    }
  }
}