// Core type definitions for sync metadata
// Extracted from syncMetadata.ts for Layer 1 purity

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

// Generate sync report
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