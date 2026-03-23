// Layer 1: Sync Engine Types - Pure Core Logic
// Extracted from syncEngine.ts

// Sync status types
export type SyncStatus = 'idle' | 'syncing' | 'conflict' | 'error' | 'complete' | 'paused'

// Sync priority levels
export type SyncPriority = 'low' | 'normal' | 'high' | 'critical'

// Sync operation types
export type SyncOperationType = 'create' | 'update' | 'delete' | 'merge'

// Sync result types
export type SyncResult = {
  success: boolean
  message: string
  recordsProcessed: number
  errors: string[]
  duration: number
  timestamp: number
  syncedRecords?: number
  failedRecords?: number
  conflictedRecords?: number
  newRecords?: number
  updatedRecords?: number
  deletedRecords?: number
}

// Sync configuration interface
export interface SyncEngineConfig {
  autoSync: boolean
  syncInterval: number
  maxRetries: number
  batchSize: number
  conflictResolution: 'simple' | 'intelligent'
  enableOfflineMode: boolean
  enableConflictResolution: boolean
  enableBatching: boolean
  enableProgressTracking: boolean
  enableLogging: boolean
  maxQueueSize: number
  maxFailedItems: number
  staleThreshold: number
  cleanupInterval: number
}

// Sync operation interface
export interface SyncOperation {
  id: string
  type: SyncOperationType
  tableName: string
  recordId: string
  data: any
  priority: SyncPriority
  timestamp: number
  retries: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error?: string
}

// Sync event types
export type SyncEventType = 
  | 'sync:start'
  | 'sync:progress'
  | 'sync:complete'
  | 'sync:error'
  | 'sync:conflict'
  | 'sync:retry'
  | 'sync:pause'
  | 'sync:resume'
  | 'sync:cancel'

// Sync event interface
export interface SyncEvent {
  type: SyncEventType
  timestamp: number
  payload?: any
  error?: string
}

// Sync listener interface
export type SyncListener = (event: SyncEvent) => void

// Sync health metrics
export interface SyncHealthMetrics {
  isHealthy: boolean
  lastSyncTime: number | null
  totalOperations: number
  successfulOperations: number
  failedOperations: number
  currentQueueSize: number
  averageSyncTime: number
  errorRate: number
  warnings: string[]
}

// Sync status report
export interface SyncStatusReport {
  status: SyncStatus
  progress: number
  message: string
  startTime: number | null
  endTime: number | null
  operations: SyncOperation[]
  health: SyncHealthMetrics
  warnings: string[]
  errors: string[]
}

// Sync conflict resolution strategy
export type ConflictResolutionStrategy = 'local_wins' | 'remote_wins' | 'merge' | 'manual'

// Sync conflict interface
export interface SyncConflict {
  id: string
  operation: SyncOperation
  localData: any
  remoteData: any
  timestamp: number
  resolution: ConflictResolutionStrategy | null
  resolved: boolean
}

// Sync batch interface
export interface SyncBatch {
  id: string
  operations: SyncOperation[]
  startTime: number
  endTime: number | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result: SyncResult | null
}