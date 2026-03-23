// Sync Engine Aggregate Results Core - Layer 1 Pure Logic
import type { SyncResult } from '../syncEngineTypes'

// Pure core logic for aggregating sync results
export function aggregateSyncResultsCore(pushResult: SyncResult, pullResult: SyncResult): SyncResult {
  return {
    success: pushResult.success && pullResult.success,
    syncedRecords: pushResult.syncedRecords + pullResult.syncedRecords,
    failedRecords: pushResult.failedRecords + pullResult.failedRecords,
    conflictedRecords: pushResult.conflictedRecords + pullResult.conflictedRecords,
    newRecords: pullResult.newRecords,
    updatedRecords: pushResult.updatedRecords + pullResult.updatedRecords,
    deletedRecords: pullResult.deletedRecords,
    errors: [...pushResult.errors, ...pullResult.errors],
    duration: 0 // Duration will be set by the caller
  }
}