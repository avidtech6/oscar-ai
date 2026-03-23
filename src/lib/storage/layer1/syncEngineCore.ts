// Layer 1: Sync Engine Core Logic - Pure Core Logic
// Extracted from syncEngine.ts

import type { SyncResult, SyncStatus } from './syncEngineTypes'
import type { SyncEngineConfig } from './syncEngineTypes'

// Core sync orchestration logic
export class SyncEngineCore {
  private config: SyncEngineConfig
  private isSyncing = false
  private lastSyncTime: number | null = null
  private syncListeners: Array<(status: SyncStatus) => void> = []

  constructor(config: SyncEngineConfig) {
    this.config = config
  }

  // Check if sync can proceed
  canSync(): boolean {
    return !this.isSyncing
  }

  // Check if auto sync should run
  shouldAutoSync(): boolean {
    return this.config.autoSync
  }

  // Calculate next sync time
  getNextSyncTime(): number | null {
    if (!this.lastSyncTime) return null
    return this.lastSyncTime + this.config.syncInterval
  }

  // Mark sync as started
  startSync(): void {
    this.isSyncing = true
    this.notifyListeners()
  }

  // Mark sync as completed
  completeSync(result: SyncResult): void {
    this.isSyncing = false
    if (result.success) {
      this.lastSyncTime = Date.now()
    }
    this.notifyListeners()
  }

  // Add sync listener
  addListener(listener: (status: SyncStatus) => void): void {
    this.syncListeners.push(listener)
  }

  // Remove sync listener
  removeListener(listener: (status: SyncStatus) => void): void {
    this.syncListeners = this.syncListeners.filter(l => l !== listener)
  }

  // Notify all listeners
  private notifyListeners(): void {
    // This would normally call getStatus() but that's Layer 2 logic
    // For Layer 1, we just maintain the listener list
  }

  // Update configuration
  updateConfig(newConfig: Partial<SyncEngineConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  // Get current configuration
  getConfig(): SyncEngineConfig {
    return { ...this.config }
  }

  // Get sync state
  getSyncState(): {
    isSyncing: boolean
    lastSyncTime: number | null
    config: SyncEngineConfig
  } {
    return {
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      config: this.config
    }
  }
}

// Sync result aggregation
export function aggregateSyncResults(
  pushResult: Partial<SyncResult>,
  pullResult: Partial<SyncResult>
): SyncResult {
  return {
    success: (pushResult.success ?? false) && (pullResult.success ?? false),
    message: 'Sync completed successfully',
    recordsProcessed: (pushResult.recordsProcessed ?? 0) + (pullResult.recordsProcessed ?? 0),
    syncedRecords: (pushResult.syncedRecords ?? 0) + (pullResult.syncedRecords ?? 0),
    failedRecords: (pushResult.failedRecords ?? 0) + (pullResult.failedRecords ?? 0),
    conflictedRecords: (pushResult.conflictedRecords ?? 0) + (pullResult.conflictedRecords ?? 0),
    newRecords: pullResult.newRecords ?? 0,
    updatedRecords: (pushResult.updatedRecords ?? 0) + (pullResult.updatedRecords ?? 0),
    deletedRecords: pullResult.deletedRecords ?? 0,
    errors: [...(pushResult.errors ?? []), ...(pullResult.errors ?? [])],
    duration: 0, // Duration calculated externally
    timestamp: Date.now()
  }
}

// Sync timing utilities
export function calculateSyncDuration(startTime: number): number {
  return Date.now() - startTime
}

// Sync health assessment
export function assessSyncHealth(result: SyncResult): {
  isHealthy: boolean
  issues: string[]
  recommendations: string[]
} {
  const issues: string[] = []
  const recommendations: string[] = []

  if (!result.success) {
    issues.push('Sync failed')
    recommendations.push('Check connectivity and retry')
  }

  if ((result.failedRecords ?? 0) > 0) {
    issues.push(`${result.failedRecords} records failed to sync`)
    recommendations.push('Review failed records and retry')
  }

  if ((result.conflictedRecords ?? 0) > 0) {
    issues.push(`${result.conflictedRecords} records had conflicts`)
    recommendations.push('Review conflicts and resolve manually if needed')
  }

  if (result.duration > 30000) {
    issues.push('Sync took longer than 30 seconds')
    recommendations.push('Consider reducing batch size or increasing timeout')
  }

  return {
    isHealthy: issues.length === 0,
    issues,
    recommendations
  }
}