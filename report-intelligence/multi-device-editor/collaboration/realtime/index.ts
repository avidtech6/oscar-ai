/**
 * Real-Time Synchronization Module
 *
 * This module provides real-time synchronization capabilities for collaborative editing,
 * including WebSocket communication, message handling, and operation synchronization.
 */

import { RealtimeSyncEngine, type RealtimeSyncEngineConfig, DEFAULT_REALTIME_SYNC_CONFIG, type SyncEvent } from './RealtimeSyncEngine';

export { WebSocketManager, type WebSocketConfig } from './WebSocketManager';
export { MessageHandler, type MessageHandlerConfig } from './MessageHandler';
export { RealtimeSyncEngine, type RealtimeSyncEngineConfig, DEFAULT_REALTIME_SYNC_CONFIG, type SyncEvent };

/**
 * Create a new real-time sync engine instance
 */
export function createRealtimeSyncEngine(config?: Partial<RealtimeSyncEngineConfig>) {
  return new RealtimeSyncEngine(config);
}

/**
 * Check if real-time synchronization is supported in the current environment
 */
export function isRealtimeSyncSupported(): boolean {
  return typeof WebSocket !== 'undefined' && typeof window !== 'undefined';
}

/**
 * Get default WebSocket URL based on environment
 */
export function getDefaultWebSocketUrl(): string {
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws`;
  }
  return 'ws://localhost:3000/ws';
}

/**
 * Real-time sync engine factory with sensible defaults
 */
export class RealtimeSyncEngineFactory {
  static createForDocument(
    documentId: string,
    userId: string,
    userName: string,
    options?: {
      websocketUrl?: string;
      enableAutoSync?: boolean;
      syncInterval?: number;
    }
  ): RealtimeSyncEngine {
    const config: Partial<RealtimeSyncEngineConfig> = {
      crdt: {
        siteId: userId,
        documentId,
        userName
      },
      presence: {
        documentId
      },
      websocket: {
        url: options?.websocketUrl || getDefaultWebSocketUrl()
      },
      enableAutoSync: options?.enableAutoSync ?? true,
      syncInterval: options?.syncInterval ?? 1000
    };
    
    return new RealtimeSyncEngine(config);
  }
  
  static createForCollaborativeEditing(
    documentId: string,
    userId: string,
    userName: string,
    initialContent?: string
  ): RealtimeSyncEngine {
    const engine = this.createForDocument(documentId, userId, userName);
    
    if (initialContent) {
      // Initialize document with content
      const crdtEngine = (engine as any).crdtEngine;
      if (crdtEngine && typeof crdtEngine.initializeDocument === 'function') {
        crdtEngine.initializeDocument(initialContent);
      }
    }
    
    return engine;
  }
}

/**
 * Real-time sync event types
 */
export const RealtimeSyncEvents = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  SYNC_STARTED: 'sync-started',
  SYNC_COMPLETED: 'sync-completed',
  OPERATION_SENT: 'operation-sent',
  OPERATION_RECEIVED: 'operation-received',
  CONFLICT_DETECTED: 'conflict-detected',
  PRESENCE_UPDATED: 'presence-updated',
  ERROR: 'error'
} as const;

/**
 * Real-time sync status constants
 */
export const RealtimeSyncStatus = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  SYNCING: 'syncing',
  ERROR: 'error'
} as const;

export type RealtimeSyncStatusType = typeof RealtimeSyncStatus[keyof typeof RealtimeSyncStatus];