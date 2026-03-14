// Sync metadata system for tracking synchronization state
import { browser } from '$app/environment'
import { TABLES } from './localEncrypted'
import type { MergeResult } from './syncMetadataMerge'
export { simpleMerge, intelligentMerge } from './syncMetadataMerge'
export type { MergeResult }

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

// Device ID management
let deviceId: string | null = null

// Get or create device ID
export function getDeviceId(): string {
  if (!browser) {
    return 'server'
  }
  
  if (!deviceId) {
    deviceId = localStorage.getItem('sync_device_id')
    
    if (!deviceId) {
      deviceId = crypto.randomUUID()
      localStorage.setItem('sync_device_id', deviceId)
    }
  }
  
  return deviceId
}

// Generate hash for data
export async function generateHash(data: any): Promise<string> {
  const encoder = new TextEncoder()
  const dataString = JSON.stringify(data)
  const dataBuffer = encoder.encode(dataString)
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Create sync metadata
export async function createSyncMetadata(
  tableName: string,
  recordId: string,
  data: any
): Promise<SyncMetadata> {
  const hash = await generateHash(data)
  const now = Date.now()
  
  const metadata: SyncMetadata = {
    id: `${tableName}:${recordId}:${getDeviceId()}`,
    tableName,
    recordId,
    lastSyncedAt: null,
    hash,
    deviceId: getDeviceId(),
    version: 1,
    conflict: false,
    conflictResolution: null,
    createdAt: now,
    updatedAt: now
  }
  
  return metadata
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
  resolution: 'local' | 'cloud' | 'merged'
): SyncMetadata {
  return {
    ...metadata,
    conflict: false,
    conflictResolution: resolution,
    updatedAt: Date.now()
  }
}

// Compare metadata for changes
export async function hasChanges(
  metadata: SyncMetadata,
  data: any
): Promise<boolean> {
  const currentHash = await generateHash(data)
  return currentHash !== metadata.hash
}

// Check if record needs sync
export function needsSync(metadata: SyncMetadata): boolean {
  return metadata.lastSyncedAt === null || metadata.conflict
}

// Get sync status
export function getSyncStatus(metadata: SyncMetadata): 'synced' | 'pending' | 'conflict' | 'local' {
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

// Create empty sync report
export function createEmptySyncReport(): SyncReport {
  return {
    totalRecords: 0,
    syncedRecords: 0,
    pendingRecords: 0,
    conflictedRecords: 0,
    localRecords: 0,
    lastSyncTime: null,
    deviceId: getDeviceId(),
    tables: {}
  }
}

// Sync metadata store operations
// These would integrate with the localEncrypted storage
export const SYNC_METADATA_STORE = {
  // Store metadata in the sync_metadata table
  async store(metadata: SyncMetadata): Promise<void> {
    // This would use the localEncrypted store
    // For now, we'll implement a placeholder
    console.log('Storing sync metadata:', metadata)
  },
  
  // Get metadata for a record
  async get(tableName: string, recordId: string): Promise<SyncMetadata | null> {
    // This would use the localEncrypted store
    console.log('Getting sync metadata for:', { tableName, recordId })
    return null
  },
  
  // Update metadata
  async update(metadata: SyncMetadata): Promise<void> {
    // This would use the localEncrypted store
    console.log('Updating sync metadata:', metadata)
  },
  
  // Delete metadata
  async delete(tableName: string, recordId: string): Promise<void> {
    // This would use the localEncrypted store
    console.log('Deleting sync metadata for:', { tableName, recordId })
  },
  
  // Get all metadata for a table
  async getAllForTable(tableName: string): Promise<SyncMetadata[]> {
    // This would use the localEncrypted store
    console.log('Getting all sync metadata for table:', tableName)
    return []
  },
  
  // Get pending sync records
  async getPending(): Promise<SyncMetadata[]> {
    // This would use the localEncrypted store
    console.log('Getting pending sync metadata')
    return []
  },
  
  // Get conflicted records
  async getConflicted(): Promise<SyncMetadata[]> {
    // This would use the localEncrypted store
    console.log('Getting conflicted sync metadata')
    return []
  }
}

// Sync configuration
export const SYNC_CONFIG = {
  AUTO_SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  BATCH_SIZE: 50,
  CONFLICT_RESOLUTION_STRATEGY: 'intelligent' as 'simple' | 'intelligent'
} as const