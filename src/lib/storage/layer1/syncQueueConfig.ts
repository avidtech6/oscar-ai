// Sync queue database configuration (Layer 1 Core)
import type { QueueConfig } from './syncQueueTypes'

export const QUEUE_CONFIG: QueueConfig = {
  DB_NAME: 'oscar_ai_sync_queue',
  DB_VERSION: 1,
  STORE_NAME: 'queue_items'
}

export const QUEUE_DEFAULTS = {
  BATCH_SIZE: 50,
  MAX_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CLEANUP_INTERVAL: 7 * 24 * 60 * 60 * 1000, // 7 days
  MAX_QUEUE_SIZE: 1000
}