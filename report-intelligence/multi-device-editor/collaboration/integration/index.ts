/**
 * Editor Collaboration Integration Module
 *
 * This module provides integration between the UnifiedEditor and the Phase 19
 * Real-Time Collaboration Layer (CRDT + Presence + Conflict Resolution).
 */

import {
  EditorCollaborationIntegration,
  type EditorCollaborationConfig,
  DEFAULT_COLLABORATION_CONFIG,
  EditorCollaborationFactory,
  OperationConverter
} from './EditorCollaborationIntegration';

export {
  EditorCollaborationIntegration,
  type EditorCollaborationConfig,
  DEFAULT_COLLABORATION_CONFIG,
  EditorCollaborationFactory,
  OperationConverter
};

/**
 * Integration utilities
 */

/**
 * Check if collaboration integration is supported
 */
export function isCollaborationSupported(): boolean {
  return typeof WebSocket !== 'undefined';
}

/**
 * Create a collaboration integration for a document
 */
export function createCollaborationIntegration(
  documentId: string,
  userId: string,
  userName: string,
  options?: {
    enabled?: boolean;
    websocketUrl?: string;
    enablePresence?: boolean;
    enableConflictResolution?: boolean;
  }
) {
  return EditorCollaborationFactory.createForDocument(
    documentId,
    userId,
    userName,
    options
  );
}

/**
 * Integration event types
 */
export const CollaborationEvents = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  REMOTE_OPERATION: 'remote-operation',
  LOCAL_OPERATION_SENT: 'local-operation-sent',
  PRESENCE_UPDATED: 'presence-updated',
  CONFLICT_DETECTED: 'conflict-detected',
  CONFLICT_RESOLVED: 'conflict-resolved',
  ERROR: 'error'
} as const;

/**
 * Integration status constants
 */
export const CollaborationStatus = {
  DISABLED: 'disabled',
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  SYNCING: 'syncing',
  ERROR: 'error'
} as const;

export type CollaborationStatusType = typeof CollaborationStatus[keyof typeof CollaborationStatus];

/**
 * Integration adapter for UnifiedEditor
 */
export class UnifiedEditorCollaborationAdapter {
  private integration: EditorCollaborationIntegration;
  
  constructor(
    documentId: string,
    userId: string,
    userName: string,
    editorConfig: any
  ) {
    this.integration = EditorCollaborationFactory.createFromEditorConfig(
      documentId,
      userId,
      userName,
      editorConfig
    );
  }
  
  /**
   * Get the underlying integration instance
   */
  getIntegration(): EditorCollaborationIntegration {
    return this.integration;
  }
  
  /**
   * Connect to collaboration server
   */
  connect(): boolean {
    return this.integration.connect();
  }
  
  /**
   * Disconnect from collaboration server
   */
  disconnect(): void {
    this.integration.disconnect();
  }
  
  /**
   * Process editor operation for collaboration
   */
  processEditorOperation(operation: any, deviceId: string): void {
    this.integration.processLocalOperation(operation, deviceId);
  }
  
  /**
   * Update cursor position for presence
   */
  updateCursorPosition(cursorPosition: number, deviceId: string = 'default'): void {
    this.integration.updateCursorPosition(cursorPosition, deviceId);
  }
  
  /**
   * Update selection for presence
   */
  updateSelection(selection: { start: number; end: number }, deviceId: string = 'default'): void {
    this.integration.updateSelectionRange(selection, deviceId);
  }
  
  /**
   * Get current presence states
   */
  getPresences(): any[] {
    return this.integration.getPresences();
  }
  
  /**
   * Get integration status
   */
  getStatus(): CollaborationStatusType {
    if (!this.integration.isEnabled()) {
      return CollaborationStatus.DISABLED;
    }
    
    if (!this.integration.isConnectedToServer()) {
      return CollaborationStatus.DISCONNECTED;
    }
    
    // For now, return connected if enabled and connected
    // In a real implementation, we would check sync status
    return CollaborationStatus.CONNECTED;
  }
  
  /**
   * Get integration statistics
   */
  getStats(): any {
    return this.integration.getStats();
  }
  
  /**
   * Add event listener
   */
  on(eventName: string, listener: Function): void {
    this.integration.on(eventName, listener);
  }
  
  /**
   * Remove event listener
   */
  off(eventName: string, listener: Function): void {
    this.integration.off(eventName, listener);
  }
  
  /**
   * Clean up resources
   */
  destroy(): void {
    this.integration.destroy();
  }
}

/**
 * Default export for convenience
 */
export default {
  EditorCollaborationIntegration,
  EditorCollaborationFactory,
  OperationConverter,
  createCollaborationIntegration,
  isCollaborationSupported,
  CollaborationEvents,
  CollaborationStatus,
  UnifiedEditorCollaborationAdapter
};