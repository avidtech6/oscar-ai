// Layer 1: Sync Metadata Configuration - Pure Core Logic
// Extracted from syncMetadata.ts

// Sync configuration constants
export const SYNC_CONFIG = {
  AUTO_SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  BATCH_SIZE: 50,
  CONFLICT_RESOLUTION_STRATEGY: 'intelligent' as 'simple' | 'intelligent',
  CLEANUP_OLDER_THAN: 7 * 24 * 60 * 60 * 1000, // 7 days
  STALE_THRESHOLD: 5 * 60 * 1000, // 5 minutes
  MAX_QUEUE_SIZE: 100,
  MAX_FAILED_ITEMS: 10
} as const

// Sync configuration validation
export function validateSyncConfig(config: Partial<typeof SYNC_CONFIG>): string[] {
  const errors: string[] = []
  
  if (config.AUTO_SYNC_INTERVAL !== undefined && config.AUTO_SYNC_INTERVAL < 1000) {
    errors.push('Auto sync interval must be at least 1000ms')
  }
  
  if (config.MAX_RETRY_ATTEMPTS !== undefined && config.MAX_RETRY_ATTEMPTS < 0) {
    errors.push('Max retry attempts must be non-negative')
  }
  
  if (config.RETRY_DELAY !== undefined && config.RETRY_DELAY < 100) {
    errors.push('Retry delay must be at least 100ms')
  }
  
  if (config.BATCH_SIZE !== undefined && config.BATCH_SIZE < 1) {
    errors.push('Batch size must be at least 1')
  }
  
  if (config.CLEANUP_OLDER_THAN !== undefined && config.CLEANUP_OLDER_THAN < 0) {
    errors.push('Cleanup older than must be non-negative')
  }
  
  if (config.STALE_THRESHOLD !== undefined && config.STALE_THRESHOLD < 1000) {
    errors.push('Stale threshold must be at least 1000ms')
  }
  
  if (config.MAX_QUEUE_SIZE !== undefined && config.MAX_QUEUE_SIZE < 1) {
    errors.push('Max queue size must be at least 1')
  }
  
  if (config.MAX_FAILED_ITEMS !== undefined && config.MAX_FAILED_ITEMS < 0) {
    errors.push('Max failed items must be non-negative')
  }
  
  return errors
}

// Sync configuration defaults
export function getSyncConfigDefaults(): typeof SYNC_CONFIG {
  return SYNC_CONFIG
}

// Sync configuration with overrides
export function getSyncConfigWithOverrides(
  overrides: Partial<typeof SYNC_CONFIG>
): typeof SYNC_CONFIG {
  return {
    ...SYNC_CONFIG,
    ...overrides
  }
}

// Backoff calculation for retries
export function calculateBackoffDelay(
  attempt: number,
  baseDelay: number = SYNC_CONFIG.RETRY_DELAY
): number {
  return baseDelay * Math.pow(2, attempt)
}

// Is stale check
export function isStale(timestamp: number, threshold: number = SYNC_CONFIG.STALE_THRESHOLD): boolean {
  return Date.now() - timestamp > threshold
}

// Should cleanup check
export function shouldCleanup(timestamp: number, threshold: number = SYNC_CONFIG.CLEANUP_OLDER_THAN): boolean {
  return Date.now() - timestamp > threshold
}

// Queue health thresholds
export function getQueueHealthThresholds() {
  return {
    maxFailedItems: SYNC_CONFIG.MAX_FAILED_ITEMS,
    maxQueueSize: SYNC_CONFIG.MAX_QUEUE_SIZE,
    staleThreshold: SYNC_CONFIG.STALE_THRESHOLD
  }
}

// Sync performance metrics
export function getSyncPerformanceMetrics() {
  return {
    maxSyncDuration: 30000, // 30 seconds
    maxRecordsPerSecond: 100,
    maxConcurrentOperations: 5
  }
}