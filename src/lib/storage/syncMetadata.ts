// Sync metadata system for tracking synchronization state
import { browser } from '$app/environment'
import { TABLES } from './localEncrypted'
import type { MergeResult } from './syncMetadataMerge'
export { simpleMerge, intelligentMerge } from './syncMetadataMerge'
export type { MergeResult }

// Sync metadata interface
import type { SyncMetadata } from './layer1/syncMetadataCoreTypes'
import type { BatchMetadataUpdate, SyncReport } from './layer1/syncMetadataCoreTypes'

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
import { generateHashCore } from './layer1/syncMetadataCoreUtils'
export async function generateHash(data: any): Promise<string> {
  return generateHashCore(data)
}

// Create sync metadata
import { createSyncMetadataCore } from './layer1/syncMetadataCoreUtils'
export async function createSyncMetadata(
  tableName: string,
  recordId: string,
  data: any
): Promise<SyncMetadata> {
  const deviceId = getDeviceId()
  const coreMetadata = await createSyncMetadataCore(tableName, recordId, deviceId, data)
  return coreMetadata
}

// Update sync metadata
import { updateSyncMetadataCore } from './layer1/syncMetadataCoreUtils'
export async function updateSyncMetadata(
  metadata: SyncMetadata,
  data: any
): Promise<SyncMetadata> {
  return updateSyncMetadataCore(metadata, data)
}

// Mark as synced
import { markAsSyncedCore } from './layer1/syncMetadataCoreUtils'
export function markAsSynced(metadata: SyncMetadata): SyncMetadata {
  return markAsSyncedCore(metadata)
}

// Mark as conflicted
import { markAsConflictedCore } from './layer1/syncMetadataCoreUtils'
export function markAsConflicted(metadata: SyncMetadata): SyncMetadata {
  return markAsConflictedCore(metadata)
}

// Resolve conflict
import { resolveConflictCore } from './layer1/syncMetadataCoreUtils'
export function resolveConflict(
  metadata: SyncMetadata,
  resolution: 'local' | 'cloud' | 'merged'
): SyncMetadata {
  return resolveConflictCore(metadata, resolution)
}

// Compare metadata for changes
import { hasChangesCore } from './layer1/syncMetadataCoreUtils'
export async function hasChanges(
  metadata: SyncMetadata,
  data: any
): Promise<boolean> {
  return hasChangesCore(metadata, data)
}

// Check if record needs sync
export function needsSync(metadata: SyncMetadata): boolean {
  return metadata.lastSyncedAt === null || metadata.conflict
}

// Get sync status
import { getSyncStatusCore } from './layer1/syncMetadataCoreUtils'
export function getSyncStatus(metadata: SyncMetadata): 'synced' | 'pending' | 'conflict' | 'local' {
  return getSyncStatusCore(metadata)
}



// Create empty sync report
import { createEmptySyncReportCore } from './layer1/syncMetadataCoreUtils'
export function createEmptySyncReport(): SyncReport {
  return createEmptySyncReportCore(getDeviceId())
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