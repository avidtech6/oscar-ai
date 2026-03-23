// Sync Cloud Manager Types - Layer 1 Pure Types
export interface CloudStorageStats {
  totalRecords: number
  totalSize: number
  byTable: Record<string, { count: number; size: number }>
  lastSync: string | null
}

export interface CloudConnectivityResult {
  connected: boolean
  authenticated: boolean
  latency: number | null
  error?: string
}

export interface BulkOperationResult {
  total: number
  uploaded: number
  failed: number
  conflicts: number
}

export interface CloudSyncResult {
  success: boolean
  cloudRecord?: CloudRecord
  conflict?: boolean
  resolvedData?: any
}

export interface CloudToLocalSyncResult {
  success: boolean
  data?: any
  metadata?: SyncMetadata
  conflict?: boolean
  source: 'cloud' | 'local' | 'merged'
}

// Cloud record type (import from supabaseCloudClient)
export interface CloudRecord {
  id: string
  table: string
  data: any
  metadata: SyncMetadata
  createdAt: string
  updatedAt: string
}

// Sync metadata type (import from syncMetadata)
export interface SyncMetadata {
  id: string
  recordId: string
  table: string
  hash: string
  version: number
  lastSync: string
  conflictResolution: 'local' | 'cloud' | 'manual' | 'auto'
}