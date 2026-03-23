// Layer 1: Sync Metadata Utilities - Pure Core Logic
// Extracted from syncMetadata.ts

import type { SyncMetadata, SyncStatus, ConflictResolution } from './syncMetadataTypes'

// Generate hash for data (pure function)
export async function generateHash(data: any): Promise<string> {
  const encoder = new TextEncoder()
  const dataString = JSON.stringify(data)
  const dataBuffer = encoder.encode(dataString)
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Create sync metadata
export function createSyncMetadata(
  tableName: string,
  recordId: string,
  deviceId: string,
  data: any
): Promise<SyncMetadata> {
  return generateHash(data).then(hash => {
    const now = Date.now()
    
    return {
      id: `${tableName}:${recordId}:${deviceId}`,
      tableName,
      recordId,
      lastSyncedAt: null,
      hash,
      deviceId,
      version: 1,
      conflict: false,
      conflictResolution: null,
      createdAt: now,
      updatedAt: now
    }
  })
}

// Update sync metadata
export async function updateSyncMetadata(
  metadata: SyncMetadata,
  data: any
): Promise<SyncMetadata> {
  const hash = await generateHash(data)
  const now = Date.now()
  
  return {
    ...metadata,
    hash,
    version: metadata.version + 1,
    updatedAt: now,
    lastSyncedAt: metadata.conflict ? metadata.lastSyncedAt : null
  }
}

// Mark as synced
export function markAsSynced(metadata: SyncMetadata): SyncMetadata {
  return {
    ...metadata,
    lastSyncedAt: Date.now(),
    conflict: false,
    conflictResolution: null,
    updatedAt: Date.now()
  }
}

// Mark as conflicted
export function markAsConflicted(metadata: SyncMetadata): SyncMetadata {
  return {
    ...metadata,
    conflict: true,
    updatedAt: Date.now()
  }
}

// Resolve conflict
export function resolveConflict(
  metadata: SyncMetadata,
  resolution: ConflictResolution
): SyncMetadata {
  return {
    ...metadata,
    conflict: false,
    conflictResolution: resolution,
    updatedAt: Date.now()
  }
}

// Check if record needs sync
export function needsSync(metadata: SyncMetadata): boolean {
  return metadata.lastSyncedAt === null || metadata.conflict
}

// Get sync status
export function getSyncStatus(metadata: SyncMetadata): SyncStatus {
  if (metadata.conflict) {
    return 'conflict'
  }
  
  if (metadata.lastSyncedAt === null) {
    return 'local'
  }
  
  // Check if synced within last 5 minutes
  const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
  if (metadata.lastSyncedAt < fiveMinutesAgo) {
    return 'pending'
  }
  
  return 'synced'
}

// Check if data has changed compared to metadata
export async function hasChanges(
  metadata: SyncMetadata,
  data: any
): Promise<boolean> {
  const currentHash = await generateHash(data)
  return currentHash !== metadata.hash
}

// Create empty sync report
export function createEmptySyncReport(deviceId: string): SyncMetadata['deviceId'] extends infer T ? T : never {
  return {
    totalRecords: 0,
    syncedRecords: 0,
    pendingRecords: 0,
    conflictedRecords: 0,
    localRecords: 0,
    lastSyncTime: null,
    deviceId,
    tables: {}
  } as any
}

// Merge metadata reports
export function mergeSyncReports(
  report1: any,
  report2: any
): any {
  return {
    totalRecords: report1.totalRecords + report2.totalRecords,
    syncedRecords: report1.syncedRecords + report2.syncedRecords,
    pendingRecords: report1.pendingRecords + report2.pendingRecords,
    conflictedRecords: report1.conflictedRecords + report2.conflictedRecords,
    localRecords: report1.localRecords + report2.localRecords,
    lastSyncTime: report1.lastSyncTime || report2.lastSyncTime,
    deviceId: report1.deviceId,
    tables: { ...report1.tables, ...report2.tables }
  }
}