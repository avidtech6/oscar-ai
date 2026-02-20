// Real-time synchronization engine for the multi-device editor
// Phase 18 - Sync Engine Module v1.0

import type {
  Document,
  EditorOperation,
  OperationBatch,
  SyncState,
  SyncStatus,
  SyncError,
  SyncErrorCode,
  DeviceSyncState,
  ChangeTracking,
  DocumentChange,
  Result,
  AsyncResult
} from '../types';
import { logger, errorHandler, generateId, deepClone } from '../utils';
import type { SupabaseClientWrapper } from '../supabase/client';

/**
 * Synchronization engine configuration
 */
export interface SyncEngineConfig {
  syncInterval: number; // Milliseconds between sync attempts
  batchSize: number; // Maximum operations per batch
  maxRetries: number; // Maximum retry attempts for failed syncs
  conflictDetectionEnabled: boolean;
  offlineQueueEnabled: boolean;
  maxQueueSize: number;
  compressionEnabled: boolean;
  realtimeSyncEnabled: boolean;
}

/**
 * Synchronization event types
 */
export type SyncEventType = 
  | 'syncStarted'
  | 'syncCompleted'
  | 'syncFailed'
  | 'operationQueued'
  | 'operationSynced'
  | 'conflictDetected'
  | 'deviceStateChanged'
  | 'networkStateChanged';

/**
 * Synchronization event
 */
export interface SyncEvent {
  type: SyncEventType;
  timestamp: Date;
  data: Record<string, any>;
}

/**
 * Synchronization engine for real-time multi-device editing
 */
export class SyncEngine {
  private config: SyncEngineConfig;
  private supabaseClient: SupabaseClientWrapper;
  private syncStates: Map<string, SyncState> = new Map();
  private operationQueue: Map<string, EditorOperation[]> = new Map();
  private changeTracking: Map<string, ChangeTracking> = new Map();
  private eventListeners: Map<SyncEventType, ((event: SyncEvent) => void)[]> = new Map();
  private syncIntervalId: NodeJS.Timeout | null = null;
  private autoSaveTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private documentsSyncing: Map<string, boolean> = new Map(); // Per-document syncing state
  private deviceId: string;

  constructor(
    supabaseClient: SupabaseClientWrapper,
    config: Partial<SyncEngineConfig> = {}
  ) {
    this.supabaseClient = supabaseClient;
    this.deviceId = generateId('device');
    
    this.config = {
      syncInterval: config.syncInterval || 5000,
      batchSize: config.batchSize || 100,
      maxRetries: config.maxRetries || 3,
      conflictDetectionEnabled: config.conflictDetectionEnabled ?? true,
      offlineQueueEnabled: config.offlineQueueEnabled ?? true,
      maxQueueSize: config.maxQueueSize || 1000,
      compressionEnabled: config.compressionEnabled ?? true,
      realtimeSyncEnabled: config.realtimeSyncEnabled ?? true,
    };

    this.initializeEventListeners();
    this.startSyncInterval();
    
    logger.info('Sync engine initialized', {
      deviceId: this.deviceId,
      syncInterval: this.config.syncInterval,
      batchSize: this.config.batchSize,
    });
  }

  /**
   * Register a document for synchronization
   */
  registerDocument(document: Document): Result<void, Error> {
    try {
      const syncState: SyncState = {
        documentId: document.id,
        status: 'pending',
        pendingOperations: 0,
        conflictCount: 0,
        retryCount: 0,
        deviceSyncStates: [{
          deviceId: this.deviceId,
          lastSeenAt: new Date(),
          version: document.version,
          pendingOperations: 0,
          isOnline: true,
          networkQuality: 'good',
        }],
      };

      this.syncStates.set(document.id, syncState);
      this.operationQueue.set(document.id, []);
      this.changeTracking.set(document.id, {
        documentId: document.id,
        changes: [],
        lastTrackedAt: new Date(),
        changeCount: 0,
        compressedSize: 0,
      });

      this.emitEvent('deviceStateChanged', {
        documentId: document.id,
        deviceId: this.deviceId,
        state: 'registered',
      });

      logger.info('Document registered for synchronization', {
        documentId: document.id,
        version: document.version,
      });

      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Failed to register document'),
      };
    }
  }

  /**
   * Unregister a document from synchronization
   */
  unregisterDocument(documentId: string): Result<void, Error> {
    try {
      this.syncStates.delete(documentId);
      this.operationQueue.delete(documentId);
      this.changeTracking.delete(documentId);

      this.emitEvent('deviceStateChanged', {
        documentId,
        deviceId: this.deviceId,
        state: 'unregistered',
      });

      logger.info('Document unregistered from synchronization', { documentId });

      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Failed to unregister document'),
      };
    }
  }

  /**
   * Queue an operation for synchronization
   */
  queueOperation(operation: EditorOperation): Result<void, Error> {
    try {
      const documentId = operation.documentId;
      const queue = this.operationQueue.get(documentId);

      if (!queue) {
        return {
          success: false,
          error: new Error(`Document ${documentId} not registered for synchronization`),
        };
      }

      // Check queue size limit
      if (queue.length >= this.config.maxQueueSize) {
        return {
          success: false,
          error: new Error(`Operation queue for document ${documentId} is full`),
        };
      }

      queue.push(operation);

      // Update sync state
      const syncState = this.syncStates.get(documentId);
      if (syncState) {
        syncState.pendingOperations = queue.length;
        syncState.status = 'pending';
      }

      // Track change
      this.trackChange(documentId, operation);

      this.emitEvent('operationQueued', {
        documentId,
        operationId: operation.id,
        queueSize: queue.length,
      });

      logger.debug('Operation queued for synchronization', {
        documentId,
        operationId: operation.id,
        type: operation.type,
        queueSize: queue.length,
      });

      // Trigger sync if queue reaches batch size
      if (queue.length >= this.config.batchSize) {
        logger.debug('Batch size reached, triggering auto-save', {
          documentId,
          queueSize: queue.length,
          batchSize: this.config.batchSize,
        });
        this.syncDocument(documentId).catch(error => {
          logger.error('Auto-sync failed', error as Error, { documentId });
        });
      } else {
        // Schedule auto-save timeout (save after 2 seconds of inactivity)
        this.scheduleAutoSave(documentId);
      }

      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Failed to queue operation'),
      };
    }
  }

  /**
   * Synchronize a specific document
   */
  async syncDocument(documentId: string): AsyncResult<void> {
    // Check if this document is already syncing
    if (this.documentsSyncing.get(documentId)) {
      logger.debug('Document sync already in progress, scheduling retry', { documentId });
      // Schedule a retry in 1 second
      setTimeout(() => {
        this.syncDocument(documentId).catch(error => {
          logger.error('Retry sync failed', error as Error, { documentId });
        });
      }, 1000);
      return { success: true, data: undefined };
    }

    return errorHandler.withErrorHandling(async () => {
      this.documentsSyncing.set(documentId, true);
      this.emitEvent('syncStarted', { documentId });

      const queue = this.operationQueue.get(documentId);
      const syncState = this.syncStates.get(documentId);

      if (!queue || !syncState) {
        this.documentsSyncing.set(documentId, false);
        throw new Error(`Document ${documentId} not found`);
      }

      if (queue.length === 0) {
        logger.debug('No operations to sync', { documentId });
        syncState.status = 'synced';
        this.documentsSyncing.set(documentId, false);
        return;
      }

      // Check network connectivity
      const isOnline = this.checkNetworkConnectivity();
      if (!isOnline && this.config.offlineQueueEnabled) {
        logger.debug('Device offline, operations queued locally', {
          documentId,
          queueSize: queue.length,
        });
        syncState.status = 'offline';
        this.documentsSyncing.set(documentId, false);
        return;
      }

      // Create operation batch - sync ALL pending operations, not just batch size
      const operationsToSync = queue.splice(0, queue.length); // Sync all operations
      const batch: OperationBatch = {
        id: generateId('batch'),
        operations: operationsToSync,
        documentId,
        deviceId: this.deviceId,
        userId: operationsToSync[0]?.userId || 'unknown',
        timestamp: Date.now(),
        versionRange: [
          Math.min(...operationsToSync.map(op => op.version)),
          Math.max(...operationsToSync.map(op => op.version)),
        ],
        isCompressed: this.config.compressionEnabled,
      };

      try {
        // Sync with Supabase
        await this.syncWithSupabase(documentId, batch);

        // Update sync state
        syncState.pendingOperations = queue.length;
        syncState.lastSyncedAt = new Date();
        syncState.status = queue.length > 0 ? 'pending' : 'synced'; // Fix: status should reflect actual state
        syncState.retryCount = 0;

        // Clear tracked changes for synced operations
        this.clearTrackedChanges(documentId, operationsToSync.map(op => op.id));

        this.emitEvent('syncCompleted', {
          documentId,
          batchId: batch.id,
          operationCount: operationsToSync.length,
          remainingQueue: queue.length,
        });

        logger.info('Document synchronized successfully', {
          documentId,
          batchId: batch.id,
          operationCount: operationsToSync.length,
          remainingQueue: queue.length,
        });
      } catch (error) {
        // Put operations back in queue
        queue.unshift(...operationsToSync);
        syncState.pendingOperations = queue.length;
        syncState.status = 'error';
        syncState.error = {
          code: 'server_error' as SyncErrorCode,
          message: error instanceof Error ? error.message : 'Sync failed',
          timestamp: new Date(),
          retryable: true,
        };
        syncState.retryCount++;

        this.emitEvent('syncFailed', {
          documentId,
          error: error instanceof Error ? error.message : 'Unknown error',
          retryCount: syncState.retryCount,
        });

        throw error;
      } finally {
        this.documentsSyncing.set(documentId, false);
        // Clear auto-save timeout for this document
        this.clearAutoSaveTimeout(documentId);
      }
    }, { operation: 'syncDocument', documentId });
  }

  /**
   * Synchronize all registered documents
   */
  async syncAll(): AsyncResult<void> {
    return errorHandler.withErrorHandling(async () => {
      const documentIds = Array.from(this.syncStates.keys());
      logger.info('Syncing all documents', { documentCount: documentIds.length });

      const results = await Promise.allSettled(
        documentIds.map(documentId => this.syncDocument(documentId))
      );

      const successes = results.filter(r => r.status === 'fulfilled').length;
      const failures = results.filter(r => r.status === 'rejected').length;

      logger.info('Batch sync completed', {
        total: documentIds.length,
        successes,
        failures,
      });

      if (failures > 0) {
        throw new Error(`${failures} documents failed to sync`);
      }
    }, { operation: 'syncAll' });
  }

  /**
   * Get synchronization state for a document
   */
  getSyncState(documentId: string): SyncState | undefined {
    return deepClone(this.syncStates.get(documentId));
  }

  /**
   * Get all synchronization states
   */
  getAllSyncStates(): SyncState[] {
    return Array.from(this.syncStates.values()).map(state => deepClone(state));
  }

  /**
   * Get pending operation count for a document
   */
  getPendingOperationCount(documentId: string): number {
    const queue = this.operationQueue.get(documentId);
    return queue ? queue.length : 0;
  }

  /**
   * Get total pending operation count across all documents
   */
  getTotalPendingOperations(): number {
    return Array.from(this.operationQueue.values()).reduce(
      (total, queue) => total + queue.length,
      0
    );
  }

  /**
   * Add event listener for sync events
   */
  addEventListener(
    eventType: SyncEventType,
    listener: (event: SyncEvent) => void
  ): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.push(listener);
    this.eventListeners.set(eventType, listeners);
  }

  /**
   * Remove event listener
   */
  removeEventListener(
    eventType: SyncEventType,
    listener: (event: SyncEvent) => void
  ): void {
    const listeners = this.eventListeners.get(eventType) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Update synchronization configuration
   */
  updateConfig(newConfig: Partial<SyncEngineConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };

    // Restart sync interval if interval changed
    if (newConfig.syncInterval && newConfig.syncInterval !== oldConfig.syncInterval) {
      this.stopSyncInterval();
      this.startSyncInterval();
    }

    logger.info('Sync engine configuration updated', {
      syncIntervalChanged: newConfig.syncInterval !== oldConfig.syncInterval,
      batchSizeChanged: newConfig.batchSize !== oldConfig.batchSize,
      newSyncInterval: this.config.syncInterval,
    });
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopSyncInterval();
    this.clearAllAutoSaveTimeouts();
    this.eventListeners.clear();
    this.syncStates.clear();
    this.operationQueue.clear();
    this.changeTracking.clear();
    this.documentsSyncing.clear();
    
    logger.info('Sync engine destroyed');
  }

  /**
   * Initialize event listeners
   */
  private initializeEventListeners(): void {
    // Initialize empty listener arrays for all event types
    const eventTypes: SyncEventType[] = [
      'syncStarted',
      'syncCompleted',
      'syncFailed',
      'operationQueued',
      'operationSynced',
      'conflictDetected',
      'deviceStateChanged',
      'networkStateChanged',
    ];

    eventTypes.forEach(eventType => {
      this.eventListeners.set(eventType, []);
    });
  }

  /**
   * Start periodic sync interval
   */
  private startSyncInterval(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
    }

    this.syncIntervalId = setInterval(() => {
      this.syncAll().catch(error => {
        logger.error('Periodic sync failed', error as Error);
      });
    }, this.config.syncInterval);

    logger.debug('Sync interval started', { interval: this.config.syncInterval });
  }

  /**
   * Stop periodic sync interval
   */
  private stopSyncInterval(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
      logger.debug('Sync interval stopped');
    }
  }

  /**
   * Emit a sync event to all listeners
   */
  private emitEvent(eventType: SyncEventType, data: Record<string, any> = {}): void {
    const event: SyncEvent = {
      type: eventType,
      timestamp: new Date(),
      data,
    };

    const listeners = this.eventListeners.get(eventType) || [];
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        logger.error('Error in sync event listener', error as Error, { eventType });
      }
    });
  }

  /**
   * Track a change for synchronization
   */
  private trackChange(documentId: string, operation: EditorOperation): void {
    let changeTracking = this.changeTracking.get(documentId);
    if (!changeTracking) {
      changeTracking = {
        documentId,
        changes: [],
        lastTrackedAt: new Date(),
        changeCount: 0,
        compressedSize: 0,
      };
      this.changeTracking.set(documentId, changeTracking);
    }

    const change: DocumentChange = {
      id: generateId('change'),
      type: this.mapOperationTypeToChangeType(operation.type),
      position: operation.position,
      length: operation.content.length,
      content: operation.content,
      timestamp: new Date(operation.timestamp),
      deviceId: operation.deviceId,
      operationId: operation.id,
    };

    changeTracking.changes.push(change);
    changeTracking.changeCount++;
    changeTracking.lastTrackedAt = new Date();
    changeTracking.compressedSize += JSON.stringify(change).length;

    // Limit change history to prevent memory issues
    if (changeTracking.changes.length > 1000) {
      changeTracking.changes = changeTracking.changes.slice(-500);
    }
  }

  /**
   * Clear tracked changes for synced operations
   */
  private clearTrackedChanges(documentId: string, operationIds: string[]): void {
    const changeTracking = this.changeTracking.get(documentId);
    if (!changeTracking) return;

    changeTracking.changes = changeTracking.changes.filter(
      change => !operationIds.includes(change.operationId)
    );
    changeTracking.changeCount = changeTracking.changes.length;
  }

  /**
   * Map operation type to change type
   */
  private mapOperationTypeToChangeType(operationType: string): 'insert' | 'delete' | 'format' | 'metadata' {
    switch (operationType) {
      case 'insert':
      case 'replace':
        return 'insert';
      case 'delete':
        return 'delete';
      case 'format':
      case 'annotation':
      case 'comment':
        return 'format';
      default:
        return 'metadata';
    }
  }

  /**
   * Check network connectivity
   */
  private checkNetworkConnectivity(): boolean {
    // Simple check - in a real implementation, this would use the Network Information API
    return typeof navigator !== 'undefined' && navigator.onLine;
  }

  /**
   * Synchronize with Supabase backend
   */
  private async syncWithSupabase(documentId: string, batch: OperationBatch): Promise<void> {
    // Check if Supabase is configured
    if (!this.supabaseClient.isConfigured()) {
      throw new Error('Supabase client not configured');
    }

    // Check authentication
    const authState = this.supabaseClient.getAuthState();
    if (!authState.isAuthenticated) {
      throw new Error('User not authenticated');
    }

    logger.debug('Syncing with Supabase', {
      documentId,
      batchId: batch.id,
      operationCount: batch.operations.length,
    });

    try {
      // Store batch in Supabase
      const result = await this.supabaseClient.query(
        'operation_batches',
        'insert',
        {
          id: batch.id,
          document_id: batch.documentId,
          device_id: batch.deviceId,
          user_id: batch.userId,
          operations: batch.operations,
          timestamp: new Date(batch.timestamp).toISOString(),
          version_range: batch.versionRange,
          is_compressed: batch.isCompressed,
          created_at: new Date().toISOString(),
        }
      );

      if (!result.success) {
        throw new Error(`Failed to store batch in Supabase: ${result.error?.message}`);
      }

      // Store individual operations
      const operationPromises = batch.operations.map(operation =>
        this.supabaseClient.query(
          'editor_operations',
          'insert',
          {
            id: operation.id,
            document_id: operation.documentId,
            device_id: operation.deviceId,
            user_id: operation.userId,
            type: operation.type,
            position: operation.position,
            content: operation.content,
            timestamp: new Date(operation.timestamp).toISOString(),
            version: operation.version,
            previous_operation_id: operation.previousOperationId,
            metadata: operation.metadata,
            created_at: new Date().toISOString(),
          }
        )
      );

      const operationResults = await Promise.allSettled(operationPromises);
      const failedOperations = operationResults.filter(r => r.status === 'rejected');

      if (failedOperations.length > 0) {
        logger.warn('Some operations failed to sync', {
          documentId,
          total: batch.operations.length,
          failed: failedOperations.length,
        });
      }

      // Update document version
      const latestVersion = Math.max(...batch.operations.map(op => op.version));
      await this.supabaseClient.query(
        'documents',
        'update',
        { version: latestVersion, updated_at: new Date().toISOString() },
        { filters: { id: documentId } }
      );

      logger.debug('Supabase sync completed', {
        documentId,
        batchId: batch.id,
        operationCount: batch.operations.length,
        latestVersion,
      });
    } catch (error) {
      logger.error('Supabase sync failed', error as Error, {
        documentId,
        batchId: batch.id,
      });
      throw error;
    }
  }

  /**
   * Schedule auto-save for a document after inactivity
   */
  private scheduleAutoSave(documentId: string): void {
    // Clear existing timeout
    this.clearAutoSaveTimeout(documentId);

    // Schedule new timeout (2 seconds)
    const timeoutId = setTimeout(() => {
      const queue = this.operationQueue.get(documentId);
      if (queue && queue.length > 0) {
        logger.debug('Auto-save timeout triggered', {
          documentId,
          queueSize: queue.length,
        });
        this.syncDocument(documentId).catch(error => {
          logger.error('Auto-save failed', error as Error, { documentId });
        });
      }
      this.autoSaveTimeouts.delete(documentId);
    }, 2000);

    this.autoSaveTimeouts.set(documentId, timeoutId);
  }

  /**
   * Clear auto-save timeout for a document
   */
  private clearAutoSaveTimeout(documentId: string): void {
    const timeoutId = this.autoSaveTimeouts.get(documentId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.autoSaveTimeouts.delete(documentId);
    }
  }

  /**
   * Clean up all auto-save timeouts
   */
  private clearAllAutoSaveTimeouts(): void {
    for (const [documentId, timeoutId] of this.autoSaveTimeouts.entries()) {
      clearTimeout(timeoutId);
    }
    this.autoSaveTimeouts.clear();
  }
}

// Default sync engine instance
export const defaultSyncEngine = new SyncEngine(
  // Note: In a real implementation, we would pass the actual Supabase client
  // For now, we'll create a mock instance
  {} as any,
  {
    syncInterval: 5000,
    batchSize: 100,
    maxRetries: 3,
  }
);

// Convenience functions using default sync engine
export const syncEngine = {
  registerDocument: (document: any) => defaultSyncEngine.registerDocument(document),
  unregisterDocument: (documentId: string) => defaultSyncEngine.unregisterDocument(documentId),
  queueOperation: (operation: any) => defaultSyncEngine.queueOperation(operation),
  syncDocument: (documentId: string) => defaultSyncEngine.syncDocument(documentId),
  syncAll: () => defaultSyncEngine.syncAll(),
  getSyncState: (documentId: string) => defaultSyncEngine.getSyncState(documentId),
  getAllSyncStates: () => defaultSyncEngine.getAllSyncStates(),
  getPendingOperationCount: (documentId: string) => defaultSyncEngine.getPendingOperationCount(documentId),
  getTotalPendingOperations: () => defaultSyncEngine.getTotalPendingOperations(),
  addEventListener: (eventType: any, listener: any) => defaultSyncEngine.addEventListener(eventType, listener),
  removeEventListener: (eventType: any, listener: any) => defaultSyncEngine.removeEventListener(eventType, listener),
  updateConfig: (newConfig: any) => defaultSyncEngine.updateConfig(newConfig),
  destroy: () => defaultSyncEngine.destroy(),
};