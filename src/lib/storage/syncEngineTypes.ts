// Sync Engine types and constants
import { SYNC_CONFIG } from './syncMetadata'

// Sync engine configuration
export interface SyncEngineConfig {
  autoSyncEnabled: boolean
  autoSyncInterval: number
  conflictResolutionStrategy: 'simple' | 'intelligent'
  maxRetryAttempts: number
  batchSize: number
}

// Default configuration
export const DEFAULT_SYNC_CONFIG: SyncEngineConfig = {
  autoSyncEnabled: true,
  autoSyncInterval: SYNC_CONFIG.AUTO_SYNC_INTERVAL,
  conflictResolutionStrategy: SYNC_CONFIG.CONFLICT_RESOLUTION_STRATEGY,
  maxRetryAttempts: SYNC_CONFIG.MAX_RETRY_ATTEMPTS,
  batchSize: SYNC_CONFIG.BATCH_SIZE
}

// Sync status
export interface SyncStatus {
  isSyncing: boolean
  lastSyncTime: number | null
  connectivity: {
    connected: boolean
    authenticated: boolean
    latency: number | null
  }
  queueStats: {
    pending: number
    processing: number
    failed: number
    completed: number
  }
  cloudStats: {
    totalRecords: number
    totalSize: number
    lastSync: string | null
  }
  localStats: {
    totalRecords: number
    byTable: Record<string, number>
  }
}

// Sync result
export interface SyncResult {
  success: boolean
  syncedRecords: number
  failedRecords: number
  conflictedRecords: number
  newRecords: number
  updatedRecords: number
  deletedRecords: number
  errors: string[]
  duration: number
}