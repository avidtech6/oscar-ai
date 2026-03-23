/**
 * Collaboration Engine for Oscar AI Phase Compliance Package
 * 
 * This file implements the CollaborationEngine class for Phase 19: Real-Time Collaboration Layer (CRDT + Presence).
 * It integrates CRDT and Presence management for collaborative editing.
 * 
 * File: src/lib/collaboration/collaboration-engine.ts
 * Generated as part of Oscar AI Phase Compliance Package implementation
 */

import { CRDTManager } from './crdt-manager';
import { PresenceManager } from './presence-manager';
import type { UserPresence, PresenceEvent } from './presence-manager';
import type { CRDTOperation, CRDTSyncResult } from './crdt-manager';

export interface CollaborationConfig {
  documentId: string;
  maxUsers?: number;
  heartbeatInterval?: number;
  inactivityTimeout?: number;
  enableLocation?: boolean;
}

export interface CollaborationEvent {
  type: 'operation' | 'presence' | 'sync' | 'conflict';
  timestamp: Date;
  data: any;
}

export interface CollaborationState {
  documentId: string;
  content: string;
  version: number;
  activeUsers: number;
  lastSync: Date | null;
  hasConflicts: boolean;
}

/**
 * Collaboration Engine for real-time collaborative editing
 */
export class CollaborationEngine {
  private config: CollaborationConfig;
  private crdtManager: CRDTManager;
  private presenceManager: PresenceManager;
  private eventCallbacks: Array<(event: CollaborationEvent) => void> = [];
  private syncCallbacks: Array<(result: CRDTSyncResult) => void> = [];
  private documentCallbacks: Array<(content: string) => void> = [];
  private userId: string;
  private userName: string;
  
  /**
   * Initialize collaboration engine
   */
  constructor(
    userId: string,
    userName: string,
    config: CollaborationConfig
  ) {
    this.userId = userId;
    this.userName = userName;
    this.config = {
      maxUsers: 50,
      heartbeatInterval: 30000,
      inactivityTimeout: 120000,
      enableLocation: false,
      ...config
    };
    
    this.crdtManager = new CRDTManager(this.config.documentId);
    this.presenceManager = new PresenceManager({
      maxUsers: this.config.maxUsers,
      heartbeatInterval: this.config.heartbeatInterval,
      inactivityTimeout: this.config.inactivityTimeout,
      enableLocation: this.config.enableLocation
    });
    
    this.setupEventHandlers();
  }
  
  /**
   * Join collaboration session
   */
  join(): void {
    this.presenceManager.userJoin(this.userId, this.userName);
    this.presenceManager.updateActivity(this.userId);
  }
  
  /**
   * Leave collaboration session
   */
  leave(): void {
    this.presenceManager.userLeave(this.userId);
  }
  
  /**
   * Get current content
   */
  getContent(): string {
    return this.crdtManager.getContent();
  }
  
  /**
   * Insert content
   */
  insert(position: number, content: string): CRDTOperation {
    const operation = this.crdtManager.insert(position, content, this.userId);
    this.presenceManager.updateActivity(this.userId);
    return operation;
  }
  
  /**
   * Delete content
   */
  delete(position: number, length: number): CRDTOperation {
    const operation = this.crdtManager.delete(position, length, this.userId);
    this.presenceManager.updateActivity(this.userId);
    return operation;
  }
  
  /**
   * Apply formatting
   */
  format(position: number, length: number, format: any): CRDTOperation {
    const operation = this.crdtManager.format(position, length, format, this.userId);
    this.presenceManager.updateActivity(this.userId);
    return operation;
  }
  
  /**
   * Update cursor position
   */
  updateCursor(position: number, selection?: { start: number; end: number }): void {
    this.presenceManager.updateCursor(this.userId, position, selection);
  }
  
  /**
   * Sync with remote changes
   */
  syncRemote(): CRDTSyncResult {
    const result = this.crdtManager.syncRemote();
    
    this.notifySyncCallbacks(result);
    
    if (result.success) {
      this.notifyEvent({
        type: 'sync',
        timestamp: new Date(),
        data: result
      });
    }
    
    return result;
  }
  
  /**
   * Add remote operation
   */
  addRemoteOperation(operation: CRDTOperation): void {
    this.crdtManager.addRemoteOperation(operation);
  }
  
  /**
   * Mark operations as synced
   */
  markOperationsSynced(operationIds: string[]): void {
    this.crdtManager.markOperationsSynced(operationIds);
  }
  
  /**
   * Get collaboration state
   */
  getState(): CollaborationState {
    return {
      documentId: this.config.documentId,
      content: this.getContent(),
      version: this.crdtManager.getVersion(),
      activeUsers: this.presenceManager.getActiveUserCount(),
      lastSync: new Date(), // In real implementation, track last sync time
      hasConflicts: this.hasPendingConflicts()
    };
  }
  
  /**
   * Get active users
   */
  getUsers(): UserPresence[] {
    return this.presenceManager.getUsers();
  }
  
  /**
   * Get user cursors
   */
  getCursors(): Array<{ userId: string; userName: string; color: string; cursor: any }> {
    return this.presenceManager.getCursors();
  }
  
  /**
   * Add event callback
   */
  onEvent(callback: (event: CollaborationEvent) => void): void {
    this.eventCallbacks.push(callback);
  }
  
  /**
   * Add sync callback
   */
  onSync(callback: (result: CRDTSyncResult) => void): void {
    this.syncCallbacks.push(callback);
  }
  
  /**
   * Add document change callback
   */
  onDocumentChange(callback: (content: string) => void): void {
    this.documentCallbacks.push(callback);
    this.crdtManager.onOperation((operation) => {
      callback(this.getContent());
    });
  }
  
  /**
   * Remove event callback
   */
  removeEventCallback(callback: (event: CollaborationEvent) => void): void {
    const index = this.eventCallbacks.indexOf(callback);
    if (index > -1) {
      this.eventCallbacks.splice(index, 1);
    }
  }
  
  /**
   * Remove sync callback
   */
  removeSyncCallback(callback: (result: CRDTSyncResult) => void): void {
    const index = this.syncCallbacks.indexOf(callback);
    if (index > -1) {
      this.syncCallbacks.splice(index, 1);
    }
  }
  
  /**
   * Remove document change callback
   */
  removeDocumentChangeCallback(callback: (content: string) => void): void {
    const index = this.documentCallbacks.indexOf(callback);
    if (index > -1) {
      this.documentCallbacks.splice(index, 1);
    }
  }
  
  /**
   * Get operation history
   */
  getOperationHistory(): any[] {
    return this.crdtManager.getOperationHistory();
  }
  
  /**
   * Get pending operations
   */
  getPendingOperations(): CRDTOperation[] {
    return this.crdtManager.getPendingOperations();
  }
  
  /**
   * Check for pending conflicts
   */
  hasPendingConflicts(): boolean {
    return this.crdtManager.getPendingOperations().length > 0;
  }
  
  /**
   * Update device information
   */
  updateDevice(device: string): void {
    this.presenceManager.updateDevice(this.userId, device);
  }
  
  /**
   * Update location (if enabled)
   */
  updateLocation(location: string): void {
    this.presenceManager.updateLocation(this.userId, location);
  }
  
  /**
   * Stop collaboration engine
   */
  stop(): void {
    this.leave();
    this.presenceManager.stop();
  }
  
  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Handle presence events
    this.presenceManager.onEvent((event: PresenceEvent) => {
      this.notifyEvent({
        type: 'presence',
        timestamp: new Date(),
        data: event
      });
    });
    
    // Handle CRDT operations
    this.crdtManager.onOperation((operation: CRDTOperation) => {
      this.notifyEvent({
        type: 'operation',
        timestamp: new Date(),
        data: operation
      });
      
      // Broadcast operation to other users (in real implementation)
      this.broadcastOperation(operation);
    });
  }
  
  /**
   * Notify event callbacks
   */
  private notifyEvent(event: CollaborationEvent): void {
    this.eventCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in event callback:', error);
      }
    });
  }
  
  /**
   * Notify sync callbacks
   */
  private notifySyncCallbacks(result: CRDTSyncResult): void {
    this.syncCallbacks.forEach(callback => {
      try {
        callback(result);
      } catch (error) {
        console.error('Error in sync callback:', error);
      }
    });
  }
  
  /**
   * Broadcast operation to other users
   */
  private broadcastOperation(operation: CRDTOperation): void {
    // In a real implementation, this would send the operation to other connected clients
    // For now, we'll just log it
    console.log('Broadcasting operation:', operation);
  }
}