// Layer 1: Sync Metadata Types - Pure Core Logic
// Extracted from syncMetadata.ts

// Sync metadata interface
export interface SyncMetadata {
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

// Batch metadata operations
export interface BatchMetadataUpdate {
  tableName: string
  recordId: string
  metadata: Partial<SyncMetadata>
}

// Sync metadata report
export interface SyncReport {
  totalRecords: number
  syncedRecords: number
  pendingRecords: number
  conflictedRecords: number
  localRecords: number
  lastSyncTime: number | null
  deviceId: string
  tables: Record<string, {
    total: number
    synced: number
    pending: number
    conflicted: number
  }>
}

// Sync status types
export type SyncStatus = 'synced' | 'pending' | 'conflict' | 'local'

// Conflict resolution types
export type ConflictResolution = 'local' | 'cloud' | 'merged' | null

// Metadata validation
export function validateSyncMetadata(metadata: SyncMetadata): string[] {
  const errors: string[] = []
  
  if (!metadata.id) {
    errors.push('Metadata ID is required')
  }
  
  if (!metadata.tableName) {
    errors.push('Table name is required')
  }
  
  if (!metadata.recordId) {
    errors.push('Record ID is required')
  }
  
  if (!metadata.hash) {
    errors.push('Hash is required')
  }
  
  if (!metadata.deviceId) {
    errors.push('Device ID is required')
  }
  
  if (metadata.version < 1) {
    errors.push('Version must be at least 1')
  }
  
  return errors
}

// Metadata comparison
export function compareMetadata(
  metadata1: SyncMetadata,
  metadata2: SyncMetadata
): {
  isSame: boolean
  differences: string[]
} {
  const differences: string[] = []
  
  if (metadata1.lastSyncedAt !== metadata2.lastSyncedAt) {
    differences.push('lastSyncedAt differs')
  }
  
  if (metadata1.hash !== metadata2.hash) {
    differences.push('hash differs')
  }
  
  if (metadata1.version !== metadata2.version) {
    differences.push('version differs')
  }
  
  if (metadata1.conflict !== metadata2.conflict) {
    differences.push('conflict status differs')
  }
  
  if (metadata1.conflictResolution !== metadata2.conflictResolution) {
    differences.push('conflict resolution differs')
  }
  
  return {
    isSame: differences.length === 0,
    differences
  }
}