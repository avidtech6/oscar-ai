/**
 * Editor Collaboration Integration Module
 * 
 * This module integrates the Phase 19 Real-Time Collaboration Layer with the existing UnifiedEditor.
 * It provides a bridge between the editor's operation system and the CRDT-based collaboration engine.
 */

import type { Document, EditorOperation, EditorEvent } from '../../types';
import { logger } from '../../utils';
import { RealtimeSyncEngine, type RealtimeSyncEngineConfig } from '../realtime/RealtimeSyncEngine';
import type { CrdtOperation, CrdtDocument, PresenceState } from '../types';

/**
 * Integration configuration
 */
export interface EditorCollaborationConfig {
  /** Whether to enable real-time collaboration */
  enabled: boolean;
  /** WebSocket URL for real-time communication */
  websocketUrl?: string;
  /** User ID for presence tracking */
  userId: string;
  /** User name for presence tracking */
  userName: string;
  /** Document ID */
  documentId: string;
  /** Whether to enable presence tracking */
  enablePresence: boolean;
  /** Whether to enable conflict resolution */
  enableConflictResolution: boolean;
  /** Sync interval in milliseconds */
  syncInterval: number;
}

/**
 * Default integration configuration
 */
export const DEFAULT_COLLABORATION_CONFIG: EditorCollaborationConfig = {
  enabled: true,
  userId: 'anonymous',
  userName: 'Anonymous User',
  documentId: 'unknown',
  enablePresence: true,
  enableConflictResolution: true,
  syncInterval: 1000
};

/**
 * Editor operation to CRDT operation converter
 */
export class OperationConverter {
  /**
   * Convert editor operation to CRDT operation
   */
  static editorToCrdt(editorOp: EditorOperation, siteId: string): CrdtOperation {
    const timestamp: CrdtTimestamp = {
      counter: Date.now(),
      siteId
    };
    
    switch (editorOp.type) {
      case 'insert':
        return {
          id: editorOp.id,
          type: 'insert',
          timestamp,
          siteId,
          position: editorOp.position,
          content: editorOp.content,
          properties: editorOp.metadata
        };
        
      case 'delete':
        return {
          id: editorOp.id,
          type: 'delete',
          timestamp,
          siteId,
          position: editorOp.position,
          length: editorOp.content?.length || 0,
          properties: editorOp.metadata
        };
        
      case 'replace':
        // Replace is treated as an update operation
        return {
          id: editorOp.id,
          type: 'update',
          timestamp,
          siteId,
          position: editorOp.position,
          content: editorOp.content,
          properties: editorOp.metadata
        };
        
      case 'format':
        return {
          id: editorOp.id,
          type: 'format',
          timestamp,
          siteId,
          position: editorOp.position,
          content: editorOp.content,
          properties: editorOp.metadata
        };
        
      default:
        throw new Error(`Unsupported editor operation type: ${editorOp.type}`);
    }
  }
  
  /**
   * Convert CRDT operation to editor operation
   */
  static crdtToEditor(crdtOp: CrdtOperation, documentId: string, userId: string, deviceId: string): EditorOperation {
    // Determine editor operation type from CRDT type
    let editorType: 'insert' | 'delete' | 'replace' | 'format';
    switch (crdtOp.type) {
      case 'insert':
        editorType = 'insert';
        break;
      case 'delete':
        editorType = 'delete';
        break;
      case 'update':
        editorType = 'replace';
        break;
      case 'format':
        editorType = 'format';
        break;
      default:
        editorType = 'insert'; // Default fallback
    }
    
    return {
      id: crdtOp.id,
      type: editorType,
      position: crdtOp.position || 0,
      content: crdtOp.content || '',
      timestamp: (crdtOp.timestamp as any).counter || Date.now(),
      deviceId,
      userId,
      documentId,
      version: 1, // CRDT doesn't use version numbers in the same way
      previousOperationId: undefined,
      metadata: crdtOp.properties
    };
  }
}

/**
 * Editor Collaboration Integration
 * 
 * This class integrates the UnifiedEditor with the real-time collaboration layer.
 */
export class EditorCollaborationIntegration {
  private config: EditorCollaborationConfig;
  private realtimeEngine: RealtimeSyncEngine | null = null;
  private isConnected = false;
  private eventListeners: Map<string, Function[]> = new Map();
  
  constructor(config: Partial<EditorCollaborationConfig> = {}) {
    this.config = {
      ...DEFAULT_COLLABORATION_CONFIG,
      ...config
    };
    
    if (this.config.enabled) {
      this.initializeRealtimeEngine();
    }
  }
  
  /**
   * Initialize the real-time engine
   */
  private initializeRealtimeEngine(): void {
    try {
      const realtimeConfig: Partial<RealtimeSyncEngineConfig> = {
        crdt: {
          siteId: this.config.userId,
          documentId: this.config.documentId,
          userName: this.config.userName,
          maxOperationHistory: 1000,
          enableCompression: true,
          conflictDetectionEnabled: this.config.enableConflictResolution
        },
        presence: {
          documentId: this.config.documentId,
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
            enabled: this.config.enableConflictResolution,
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
        websocket: this.config.websocketUrl ? {
          url: this.config.websocketUrl,
          reconnectAttempts: 10,
          reconnectDelay: 1000,
          maxReconnectDelay: 30000,
          heartbeatInterval: 30000,
          heartbeatTimeout: 5000,
          autoReconnect: true
        } : undefined,
        messageHandler: {
          validateMessages: true,
          maxMessageSize: 1024 * 1024,
          allowUnknownMessageTypes: false,
          enableMessageLogging: false,
          messageTimeout: 5000
        },
        enableAutoSync: true,
        syncInterval: this.config.syncInterval,
        maxPendingOperations: 100,
        operationBatchSize: 10
      };
      
      this.realtimeEngine = new RealtimeSyncEngine(realtimeConfig);
      
      // Set up event listeners
      this.setupEventListeners();
      
      logger.info('Real-time collaboration engine initialized', {
        documentId: this.config.documentId,
        userId: this.config.userId,
        enabled: this.config.enabled
      });
    } catch (error) {
      logger.error('Failed to initialize real-time collaboration engine', error as Error, {
        documentId: this.config.documentId
      });
      this.realtimeEngine = null;
    }
  }
  
  /**
   * Set up event listeners for the real-time engine
   */
  private setupEventListeners(): void {
    if (!this.realtimeEngine) return;
    
    // Listen for connection events
    this.realtimeEngine.on('connected', (event: any) => {
      this.isConnected = true;
      this.emit('connected', event);
    });
    
    this.realtimeEngine.on('disconnected', (event: any) => {
      this.isConnected = false;
      this.emit('disconnected', event);
    });
    
    // Listen for operation events
    this.realtimeEngine.on('operation-received', (event: any) => {
      this.emit('remote-operation', event);
    });
    
    this.realtimeEngine.on('operation-sent', (event: any) => {
      this.emit('local-operation-sent', event);
    });
    
    // Listen for presence events
    this.realtimeEngine.on('presence-updated', (event: any) => {
      this.emit('presence-updated', event);
    });
    
    // Listen for conflict events
    this.realtimeEngine.on('conflict-detected', (event: any) => {
      this.emit('conflict-detected', event);
    });
    
    this.realtimeEngine.on('conflict-resolved', (event: any) => {
      this.emit('conflict-resolved', event);
    });
    
    // Listen for error events
    this.realtimeEngine.on('error', (event: any) => {
      this.emit('error', event);
    });
  }
  
  /**
   * Connect to the real-time server
   */
  connect(): boolean {
    if (!this.realtimeEngine || !this.config.enabled) {
      return false;
    }
    
    const connected = this.realtimeEngine.connect();
    if (connected) {
      logger.info('Connected to real-time collaboration server', {
        documentId: this.config.documentId
      });
    }
    
    return connected;
  }
  
  /**
   * Disconnect from the real-time server
   */
  disconnect(): void {
    if (this.realtimeEngine) {
      this.realtimeEngine.disconnect();
      this.isConnected = false;
      logger.info('Disconnected from real-time collaboration server', {
        documentId: this.config.documentId
      });
    }
  }
  
  /**
   * Process a local editor operation for real-time collaboration
   */
  processLocalOperation(editorOp: EditorOperation, deviceId: string): void {
    if (!this.realtimeEngine || !this.isConnected || !this.config.enabled) {
      return;
    }
    
    try {
      // Convert editor operation to CRDT operation
      const crdtOp = OperationConverter.editorToCrdt(editorOp, this.config.userId);
      
      // Apply to real-time engine based on operation type
      switch (editorOp.type) {
        case 'insert':
          this.realtimeEngine.insertText(editorOp.position, editorOp.content);
          break;
          
        case 'delete':
          this.realtimeEngine.deleteText(editorOp.position, editorOp.content.length);
          break;
          
        case 'replace':
          // For replace, we need to delete old content and insert new
          // This is simplified - in reality we'd need to know the old content length
          this.realtimeEngine.updateText(editorOp.position, editorOp.content);
          break;
          
        case 'format':
          // Format operations are handled differently
          this.realtimeEngine.updateText(editorOp.position, editorOp.content, editorOp.metadata);
          break;
      }
      
      logger.debug('Local operation processed for real-time collaboration', {
        operationId: editorOp.id,
        type: editorOp.type,
        documentId: this.config.documentId
      });
    } catch (error) {
      logger.error('Failed to process local operation for real-time collaboration', error as Error, {
        operationId: editorOp.id,
        type: editorOp.type,
        documentId: this.config.documentId
      });
    }
  }
  
  /**
   * Get remote operations that need to be applied to the editor
   */
  getRemoteOperations(): EditorOperation[] {
    if (!this.realtimeEngine || !this.isConnected) {
      return [];
    }
    
    // In a real implementation, we would track which operations have been applied
    // For now, we'll return an empty array and rely on event-based integration
    return [];
  }
  
  /**
   * Update cursor position for presence tracking
   */
  updateCursorPosition(cursorPosition: number, deviceId: string = 'default'): void {
    if (!this.realtimeEngine || !this.config.enablePresence) {
      return;
    }
    
    this.realtimeEngine.updateCursorPosition(cursorPosition);
  }
  
  /**
   * Update selection range for presence tracking
   */
  updateSelectionRange(selectionRange: { start: number; end: number }, deviceId: string = 'default'): void {
    if (!this.realtimeEngine || !this.config.enablePresence) {
      return;
    }
    
    this.realtimeEngine.updateSelectionRange(selectionRange);
  }
  
  /**
   * Get current presence states
   */
  getPresences(): PresenceState[] {
    if (!this.realtimeEngine || !this.config.enablePresence) {
      return [];
    }
    
    return this.realtimeEngine.getPresences();
  }
  
  /**
   * Get current document content from collaboration engine
   */
  getCollaborationContent(): string {
    if (!this.realtimeEngine) {
      return '';
    }
    
    return this.realtimeEngine.getContent();
  }
  
  /**
   * Get current document from collaboration engine
   */
  getCollaborationDocument(): CrdtDocument | null {
    if (!this.realtimeEngine) {
      return null;
    }
    
    return this.realtimeEngine.getDocument();
  }
  
  /**
   * Get active conflicts
   */
  getActiveConflicts(): any[] {
    if (!this.realtimeEngine || !this.config.enableConflictResolution) {
      return [];
    }
    
    return this.realtimeEngine.getConflicts();
  }
  
  /**
   * Get engine statistics
   */
  getStats(): any {
    if (!this.realtimeEngine) {
      return {
        connected: false,
        enabled: this.config.enabled,
        realtimeEngine: false
      };
    }
    
    return {
      ...this.realtimeEngine.getStats(),
      enabled: this.config.enabled,
      config: this.config
    };
  }
  
  /**
   * Check if connected to real-time server
   */
  isConnectedToServer(): boolean {
    return this.isConnected && (this.realtimeEngine?.isConnected() || false);
  }
  
  /**
   * Check if collaboration is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }
  
  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<EditorCollaborationConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };
    
    // Reinitialize if enabled status changed
    if (oldConfig.enabled !== this.config.enabled) {
      if (this.config.enabled) {
        this.initializeRealtimeEngine();
      } else {
        this.disconnect();
        this.realtimeEngine = null;
      }
    }
    
    logger.info('Collaboration configuration updated', {
      documentId: this.config.documentId,
      enabledChanged: oldConfig.enabled !== this.config.enabled,
      newEnabled: this.config.enabled
    });
  }
  
  /**
   * Clean up resources
   */
  destroy(): void {
    this.disconnect();
    this.eventListeners.clear();
    this.realtimeEngine = null;
    
    logger.info('Collaboration integration destroyed', {
      documentId: this.config.documentId
    });
  }
  
  /**
   * Emit an event
   */
  private emit(eventName: string, data?: any): void {
    const listeners = this.eventListeners.get(eventName) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        logger.error(`Error in event listener for ${eventName}`, error as Error);
      }
    });
  }
  
  /**
   * Add event listener
   */
  on(eventName: string, listener: Function): void {
    const listeners = this.eventListeners.get(eventName) || [];
    listeners.push(listener);
    this.eventListeners.set(eventName, listeners);
  }
  
  /**
   * Remove event listener
   */
  off(eventName: string, listener: Function): void {
    const listeners = this.eventListeners.get(eventName) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
      this.eventListeners.set(eventName, listeners);
    }
  }
}

/**
 * Factory for creating editor collaboration integrations
 */
export class EditorCollaborationFactory {
  /**
   * Create collaboration integration for a document
   */
  static createForDocument(
    documentId: string,
    userId: string,
    userName: string,
    options?: {
      enabled?: boolean;
      websocketUrl?: string;
      enablePresence?: boolean;
      enableConflictResolution?: boolean;
    }
  ): EditorCollaborationIntegration {
    const config: Partial<EditorCollaborationConfig> = {
      documentId,
      userId,
      userName,
      enabled: options?.enabled ?? true,
      websocketUrl: options?.websocketUrl,
      enablePresence: options?.enablePresence ?? true,
      enableConflictResolution: options?.enableConflictResolution ?? true
    };
    
    return new EditorCollaborationIntegration(config);
  }
  
  /**
   * Create collaboration integration from existing editor configuration
   */
  static createFromEditorConfig(
    documentId: string,
    userId: string,
    userName: string,
    editorConfig: any
  ): EditorCollaborationIntegration {
    const config: Partial<EditorCollaborationConfig> = {
      documentId,
      userId,
      userName,
      enabled: editorConfig.realtimeCollaboration ?? true,
      enablePresence: true,
      enableConflictResolution: editorConfig.conflictDetection ?? true,
      syncInterval: 1000
    };
    
    return new EditorCollaborationIntegration(config);
  }
}