/**
 * Real-Time Sync Engine - Main engine for real-time synchronization
 * 
 * This module coordinates WebSocket communication, message handling,
 * and synchronization between clients in real-time collaborative editing.
 */

import type { CrdtOperation, CrdtDocument, PresenceState, RealtimeMessage } from '../types';
import { CrdtEngine, type CrdtEngineConfig } from '../crdt/CrdtEngine';
import { PresenceBroadcaster, type PresenceBroadcasterConfig } from '../presence/PresenceBroadcaster';
import { ConflictResolver, type ConflictResolverConfig } from '../conflict/ConflictResolver';
import { WebSocketManager, type WebSocketConfig } from './WebSocketManager';
import { MessageHandler, type MessageHandlerConfig } from './MessageHandler';

/**
 * Real-time sync engine configuration
 */
export interface RealtimeSyncEngineConfig {
  crdt: CrdtEngineConfig;
  presence: PresenceBroadcasterConfig;
  conflict: ConflictResolverConfig;
  websocket: WebSocketConfig;
  messageHandler: MessageHandlerConfig;
  syncInterval: number;
  enableAutoSync: boolean;
  maxPendingOperations: number;
  operationBatchSize: number;
}

/**
 * Default real-time sync engine configuration
 */
export const DEFAULT_REALTIME_SYNC_CONFIG: RealtimeSyncEngineConfig = {
  crdt: {
    siteId: 'unknown',
    documentId: 'unknown',
    userName: 'Unknown User',
    maxOperationHistory: 1000,
    enableCompression: true,
    conflictDetectionEnabled: true
  },
  presence: {
    documentId: 'unknown',
    broadcastInterval: 1000,
    enableHeartbeat: true,
    maxBroadcastSize: 1000,
    idleTimeout: 30000,
    awayTimeout: 300000,
    heartbeatInterval: 10000,
    maxUsersPerDocument: 100
  },
  conflict: {
    detection: {
      enabled: true,
      detectInsertInsert: true,
      detectInsertDelete: true,
      detectDeleteDelete: true,
      detectUpdateUpdate: true,
      severityThreshold: 'medium',
      autoResolveSimpleConflicts: true
    },
    resolution: {
      defaultStrategy: 'last-write-wins',
      userPriority: {},
      enableAutoResolution: true,
      maxRetries: 3
    },
    enableRealTimeDetection: true,
    maxConflictsInMemory: 1000,
    conflictHistorySize: 100,
    notifyUsersOnConflict: true
  },
  websocket: {
    url: 'ws://localhost:3000/ws',
    reconnectAttempts: 10,
    reconnectDelay: 1000,
    maxReconnectDelay: 30000,
    heartbeatInterval: 30000,
    heartbeatTimeout: 5000,
    autoReconnect: true
  },
  messageHandler: {
    validateMessages: true,
    maxMessageSize: 1024 * 1024,
    allowUnknownMessageTypes: false,
    enableMessageLogging: false,
    messageTimeout: 5000
  },
  syncInterval: 1000,
  enableAutoSync: true,
  maxPendingOperations: 100,
  operationBatchSize: 10
};

/**
 * Sync event
 */
export interface SyncEvent {
  type: 'connected' | 'disconnected' | 'sync-started' | 'sync-completed' | 
        'operation-sent' | 'operation-received' | 'conflict-detected' | 
        'presence-updated' | 'error';
  data?: any;
  timestamp: Date;
}

/**
 * Real-Time Sync Engine class
 */
export class RealtimeSyncEngine {
  private config: RealtimeSyncEngineConfig;
  private crdtEngine: CrdtEngine;
  private presenceBroadcaster: PresenceBroadcaster;
  private conflictResolver: ConflictResolver;
  private websocketManager: WebSocketManager;
  private messageHandler: MessageHandler;
  private syncTimer?: NodeJS.Timeout;
  private eventListeners: Map<string, Function[]> = new Map();
  private pendingOperations: CrdtOperation[] = [];
  private isSyncing = false;
  
  /**
   * Emit an event to registered listeners
   */
  private emit(eventName: string, data?: any): void {
    const listeners = this.eventListeners.get(eventName) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for ${eventName}:`, error);
      }
    });
  }
  
  /**
   * Register an event listener
   */
  on(eventName: string, listener: Function): void {
    const listeners = this.eventListeners.get(eventName) || [];
    listeners.push(listener);
    this.eventListeners.set(eventName, listeners);
  }
  
  /**
   * Remove an event listener
   */
  off(eventName: string, listener: Function): void {
    const listeners = this.eventListeners.get(eventName) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
      this.eventListeners.set(eventName, listeners);
    }
  }
  
  /**
   * Create a new real-time sync engine
   */
  constructor(config: Partial<RealtimeSyncEngineConfig> = {}) {
    this.config = {
      ...DEFAULT_REALTIME_SYNC_CONFIG,
      ...config,
      crdt: {
        ...DEFAULT_REALTIME_SYNC_CONFIG.crdt,
        ...config.crdt
      },
      presence: {
        ...DEFAULT_REALTIME_SYNC_CONFIG.presence,
        ...config.presence
      },
      conflict: {
        ...DEFAULT_REALTIME_SYNC_CONFIG.conflict,
        ...config.conflict
      },
      websocket: {
        ...DEFAULT_REALTIME_SYNC_CONFIG.websocket,
        ...config.websocket
      },
      messageHandler: {
        ...DEFAULT_REALTIME_SYNC_CONFIG.messageHandler,
        ...config.messageHandler
      }
    };
    
    // Initialize components
    this.crdtEngine = new CrdtEngine(this.config.crdt);
    this.presenceBroadcaster = new PresenceBroadcaster(this.config.presence);
    this.conflictResolver = new ConflictResolver(this.config.conflict);
    this.websocketManager = new WebSocketManager(this.config.websocket);
    this.messageHandler = new MessageHandler(this.config.messageHandler);
    
    // Set up event forwarding
    this.setupEventForwarding();
    
    // Set up message handlers
    this.setupMessageHandlers();
    
    // Start auto-sync if enabled
    if (this.config.enableAutoSync) {
      this.startAutoSync();
    }
  }
  
  /**
   * Set up event forwarding from components
   */
  private setupEventForwarding(): void {
    // Forward CRDT engine events
    this.crdtEngine.on('operation-applied', (event: any) => {
      this.emit('operation-applied', event);
    });
    
    this.crdtEngine.on('remote-operation-applied', (event: any) => {
      this.emit('remote-operation-applied', event);
    });
    
    this.crdtEngine.on('content-changed', (event: any) => {
      this.emit('content-changed', event);
    });
    
    this.crdtEngine.on('conflict-detected', (event: any) => {
      this.emit('conflict-detected', event);
    });
    
    // Forward presence events
    this.presenceBroadcaster.on('presence-updated', (event: any) => {
      this.emit('presence-updated', event);
    });
    
    this.presenceBroadcaster.on('cursor-updated', (event: any) => {
      this.emit('cursor-updated', event);
    });
    
    this.presenceBroadcaster.on('selection-updated', (event: any) => {
      this.emit('selection-updated', event);
    });
    
    // Forward conflict events
    this.conflictResolver.on('conflict-detected', (event: any) => {
      this.emit('conflict-detected', event);
    });
    
    this.conflictResolver.on('conflict-resolved', (event: any) => {
      this.emit('conflict-resolved', event);
    });
    
    // Forward WebSocket events
    this.websocketManager.on('open', (event: any) => {
      this.emit('connected', {
        type: 'connected',
        data: event,
        timestamp: new Date()
      });
    });
    
    this.websocketManager.on('close', (event: any) => {
      this.emit('disconnected', {
        type: 'disconnected',
        data: event,
        timestamp: new Date()
      });
    });
    
    this.websocketManager.on('error', (event: any) => {
      this.emit('error', {
        type: 'error',
        data: event,
        timestamp: new Date()
      });
    });
  }
  
  /**
   * Set up message handlers
   */
  private setupMessageHandlers(): void {
    // Operation message handler
    this.messageHandler.registerHandler('operation', async (message: RealtimeMessage) => {
      const operation = message.data.operation as CrdtOperation;
      
      // Apply remote operation
      this.crdtEngine.applyRemoteOperation(operation);
      
      // Check for conflicts
      const conflicts = this.conflictResolver.processOperation(
        operation,
        this.crdtEngine.getDocument().operations
      );
      
      // Handle auto-resolved conflicts
      for (const resolution of conflicts.autoResolved) {
        if (resolution.resolved && resolution.resolvedOperations.length > 0) {
          for (const resolvedOp of resolution.resolvedOperations) {
            this.crdtEngine.applyRemoteOperation(resolvedOp);
          }
        }
      }
      
      this.emit('operation-received', {
        type: 'operation-received',
        data: { message, operation, conflicts },
        timestamp: new Date()
      });
    });
    
    // Presence message handler
    this.messageHandler.registerHandler('presence', async (message: RealtimeMessage) => {
      const presence = message.data.presence as PresenceState;
      
      // Update presence - using the tracker directly since PresenceBroadcaster doesn't have updatePresence method
      const tracker = this.presenceBroadcaster.getTracker();
      tracker.updatePresence(
        presence.userId,
        presence.deviceId,
        presence.userName,
        {
          cursorPosition: presence.cursorPosition,
          selectionRange: presence.selectionRange,
          status: presence.status as 'active' | 'idle' | 'away' | undefined,
          userColor: presence.userColor
        }
      );
      
      this.emit('presence-received', {
        type: 'presence-updated',
        data: { message, presence },
        timestamp: new Date()
      });
    });
    
    // Sync message handler
    this.messageHandler.registerHandler('sync', async (message: RealtimeMessage) => {
      const data = message.data;
      
      if (data.operations) {
        // Apply remote operations
        this.crdtEngine.applyRemoteOperations(data.operations);
      }
      
      if (data.document) {
        // TODO: Handle full document sync
      }
      
      this.emit('sync-received', {
        type: 'sync-completed',
        data: { message },
        timestamp: new Date()
      });
    });
    
    // Ack message handler
    this.messageHandler.registerHandler('ack', async (message: RealtimeMessage) => {
      const data = message.data;
      
      this.emit('ack-received', {
        type: 'sync-completed',
        data: { message },
        timestamp: new Date()
      });
    });
    
    // Error message handler
    this.messageHandler.registerHandler('error', async (message: RealtimeMessage) => {
      const data = message.data;
      
      this.emit('error', {
        type: 'error',
        data: { message },
        timestamp: new Date()
      });
    });
    
    // Set up WebSocket message handling
    this.websocketManager.on('message', (event: any) => {
      this.messageHandler.handleRawMessage(event.data.raw);
    });
  }
  
  /**
   * Connect to the real-time server
   */
  connect(): boolean {
    return this.websocketManager.connect();
  }
  
  /**
   * Disconnect from the real-time server
   */
  disconnect(): void {
    this.websocketManager.disconnect();
    this.stopAutoSync();
  }
  
  /**
   * Insert text at position
   */
  insertText(position: number, text: string): CrdtOperation {
    const operation = this.crdtEngine.insertText(position, text);
    this.queueOperationForSync(operation);
    return operation;
  }
  
  /**
   * Delete text at position
   */
  deleteText(position: number, length: number): CrdtOperation {
    const operation = this.crdtEngine.deleteText(position, length);
    this.queueOperationForSync(operation);
    return operation;
  }
  
  /**
   * Update text at position
   */
  updateText(position: number, newText: string, properties?: Record<string, any>): CrdtOperation {
    const operation = this.crdtEngine.updateText(position, newText, properties);
    this.queueOperationForSync(operation);
    return operation;
  }
  
  /**
   * Update cursor position
   */
  updateCursorPosition(cursorPosition: number): void {
    const siteId = this.config.crdt.siteId;
    const deviceId = 'default'; // TODO: Get actual device ID
    
    this.presenceBroadcaster.updateCursorPosition(siteId, deviceId, cursorPosition);
  }
  
  /**
   * Update selection range
   */
  updateSelectionRange(selectionRange: { start: number; end: number }): void {
    const siteId = this.config.crdt.siteId;
    const deviceId = 'default'; // TODO: Get actual device ID
    
    this.presenceBroadcaster.updateSelectionRange(siteId, deviceId, selectionRange);
  }
  
  /**
   * Queue operation for synchronization
   */
  private queueOperationForSync(operation: CrdtOperation): void {
    this.pendingOperations.push(operation);
    
    // Check if we need to sync immediately
    if (this.pendingOperations.length >= this.config.operationBatchSize) {
      this.syncPendingOperations();
    }
    
    // Check if we've reached the maximum pending operations
    if (this.pendingOperations.length > this.config.maxPendingOperations) {
      this.syncPendingOperations();
    }
  }
  
  /**
   * Synchronize pending operations
   */
  async syncPendingOperations(): Promise<boolean> {
    if (this.isSyncing || this.pendingOperations.length === 0) {
      return false;
    }
    
    this.isSyncing = true;
    
    try {
      this.emit('sync-started', {
        type: 'sync-started',
        data: { pendingCount: this.pendingOperations.length },
        timestamp: new Date()
      });
      
      // Get operations to sync
      const operationsToSync = this.pendingOperations.slice(0, this.config.operationBatchSize);
      
      // Send each operation
      let successCount = 0;
      
      for (const operation of operationsToSync) {
        const message = this.messageHandler.createOperationMessage(
          operation,
          this.config.crdt.siteId
        );
        
        const sent = this.websocketManager.send(message);
        
        if (sent) {
          successCount++;
          
          this.emit('operation-sent', {
            type: 'operation-sent',
            data: { operation, message },
            timestamp: new Date()
          });
        }
      }
      
      // Remove sent operations from pending queue
      this.pendingOperations = this.pendingOperations.slice(operationsToSync.length);
      
      this.emit('sync-completed', {
        type: 'sync-completed',
        data: { 
          sent: successCount, 
          total: operationsToSync.length,
          remaining: this.pendingOperations.length 
        },
        timestamp: new Date()
      });
      
      return successCount > 0;
    } catch (error) {
      this.emit('error', {
        type: 'error',
        data: { error, message: 'Sync failed' },
        timestamp: new Date()
      });
      
      return false;
    } finally {
      this.isSyncing = false;
    }
  }
  
  /**
   * Start auto-sync timer
   */
  private startAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
    
    this.syncTimer = setInterval(() => {
      if (this.pendingOperations.length > 0) {
        this.syncPendingOperations();
      }
    }, this.config.syncInterval);
  }
  
  /**
   * Stop auto-sync timer
   */
  private stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
    }
  }
  
  /**
   * Get current document
   */
  getDocument(): CrdtDocument {
    return this.crdtEngine.getDocument();
  }
  
  /**
   * Get current content
   */
  getContent(): string {
    return this.crdtEngine.getContent();
  }
  
  /**
   * Get active presences
   */
  getPresences(): PresenceState[] {
    return this.presenceBroadcaster.getTracker().getAllPresences();
  }
  
  /**
   * Get active conflicts
   */
  getConflicts(): any[] {
    return this.conflictResolver.getActiveConflicts();
  }
  
  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.websocketManager.isConnected();
  }
  
  /**
   * Get engine statistics
   */
  getStats(): {
    connected: boolean;
    pendingOperations: number;
    documentOperations: number;
    activePresences: number;
    activeConflicts: number;
    syncEnabled: boolean;
  } {
    return {
      connected: this.isConnected(),
      pendingOperations: this.pendingOperations.length,
      documentOperations: this.crdtEngine.getDocument().operations.length,
      activePresences: this.presenceBroadcaster.getTracker().getAllPresences().length,
      activeConflicts: this.conflictResolver.getActiveConflicts().length,
      syncEnabled: this.config.enableAutoSync
    };
  }
  
  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<RealtimeSyncEngineConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
      crdt: {
        ...this.config.crdt,
        ...newConfig.crdt
      },
      presence: {
        ...this.config.presence,
        ...newConfig.presence
      },
      conflict: {
        ...this.config.conflict,
        ...newConfig.conflict
      },
      websocket: {
        ...this.config.websocket,
        ...newConfig.websocket
      },
      messageHandler: {
        ...this.config.messageHandler,
        ...newConfig.messageHandler
      }
    };
    
    // Update component configurations
    this.crdtEngine.importState(JSON.stringify({
      config: this.config.crdt,
      document: this.crdtEngine.getDocument(),
      localCounter: 0,
      pendingOperations: []
    }));
    
    this.emit('config-updated', {
      type: 'sync-completed',
      data: { config: this.config },
      timestamp: new Date()
    });
  }
  
  /**
   * Export engine state
   */
  exportState(): string {
    const state = {
      config: this.config,
      crdt: this.crdtEngine.exportState(),
      presence: this.presenceBroadcaster.getTracker().getAllPresences(),
      conflict: this.conflictResolver.getActiveConflicts(),
      pendingOperations: this.pendingOperations,
      isConnected: this.isConnected(),
      stats: this.getStats(),
      timestamp: new Date().toISOString()
    };
    
    return JSON.stringify(state, null, 2);
  }
