// Layer 1: Sync Engine Configuration - Pure Core Logic
// Extracted from syncEngine.ts

import type { SyncEngineConfig } from './syncEngineTypes'

// Configuration validation
export function validateSyncConfig(config: Partial<SyncEngineConfig>): string[] {
  const errors: string[] = []
  
  if (config.syncInterval !== undefined && config.syncInterval < 1000) {
    errors.push('Sync interval must be at least 1000ms')
  }
  
  if (config.maxRetries !== undefined && config.maxRetries < 0) {
    errors.push('Max retries must be non-negative')
  }
  
  if (config.batchSize !== undefined && config.batchSize < 1) {
    errors.push('Batch size must be at least 1')
  }
  
  return errors
}

// Configuration merging
export function mergeSyncConfig(
  defaultConfig: SyncEngineConfig,
  userConfig: Partial<SyncEngineConfig>
): SyncEngineConfig {
  return {
    ...defaultConfig,
    ...userConfig,
    // Ensure numeric values are within bounds
    syncInterval: userConfig.syncInterval ?? defaultConfig.syncInterval,
    maxRetries: userConfig.maxRetries ?? defaultConfig.maxRetries,
    batchSize: userConfig.batchSize ?? defaultConfig.batchSize
  }
}

// Configuration health check
export function checkConfigHealth(config: SyncEngineConfig): {
  isValid: boolean
  warnings: string[]
} {
  const warnings: string[] = []
  
  if (config.syncInterval > 60 * 60 * 1000) {
    warnings.push('Sync interval is very long (over 1 hour)')
  }
  
  if (config.maxRetries > 10) {
    warnings.push('High retry count may cause performance issues')
  }
  
  if (config.batchSize > 100) {
    warnings.push('Large batch size may impact performance')
  }
  
  return {
    isValid: true,
    warnings
  }
}