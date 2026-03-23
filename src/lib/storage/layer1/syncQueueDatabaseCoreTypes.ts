// Core type definitions for sync queue database
// Extracted from syncQueueDatabase.ts for Layer 1 purity

// Queue item interface
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