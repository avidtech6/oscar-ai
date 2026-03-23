// Sync queue types and interfaces (Layer 1 Core)
export type IDBDatabase = any // Global IndexedDB type

export interface QueueItem {
  id: string
  operation: 'create' | 'update' | 'delete'
  table: string
  recordId: string
  data?: any
  attempts: number
  lastAttempt: number | null
  status: 'pending' | 'processing' | 'failed' | 'completed'
  error?: string
  createdAt: number
  updatedAt: number
}

export type QueueStatus = QueueItem['status']
export type QueueOperation = QueueItem['operation']
export type QueuePriority = 'high' | 'medium' | 'low'

export interface QueueFilterOptions {
  status?: QueueStatus[]
  table?: string[]
  operation?: QueueOperation[]
  olderThan?: number
  newerThan?: number
}

export interface QueueSortOptions {
  field: keyof QueueItem
  direction: 'asc' | 'desc'
}

export interface QueueStats {
  total: number
  pending: number
  processing: number
  failed: number
  completed: number
  oldestPending: number | null
}

export type QueueEventType =
  | 'item_added'
  | 'item_updated'
  | 'item_removed'
  | 'item_completed'
  | 'item_failed'
  | 'batch_processed'

export interface QueueEvent {
  type: QueueEventType
  itemId: string
  timestamp: number
  data?: any
  payload?: any
  error?: string
}

export interface QueueConfig {
  DB_NAME: string
  DB_VERSION: number
  STORE_NAME: string
}