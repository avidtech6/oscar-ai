// Synchronization module exports for the multi-device editor
// Phase 18 - Sync Module v1.0

// Export sync engine
export * from './SyncEngine';
export {
  SyncEngine,
  type SyncEngineConfig,
  type SyncEventType,
  type SyncEvent,
  defaultSyncEngine,
  syncEngine,
} from './SyncEngine';

// Note: In a complete implementation, we would also export:
// - changeTracking.ts: Change detection and tracking
// - queue.ts: Operation queue management
// - network.ts: Network status monitoring

// For now, we'll create placeholder exports for the planned modules
export const changeTracking = {
  // Will be implemented in changeTracking.ts
};

export const operationQueue = {
  // Will be implemented in queue.ts
};

export const networkMonitor = {
  // Will be implemented in network.ts
};