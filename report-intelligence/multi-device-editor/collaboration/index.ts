/**
 * Phase 19: Real‑Time Collaboration Layer (CRDT + Presence + Conflict Resolution)
 * 
 * This module provides real-time collaborative editing capabilities with:
 * - Conflict-Free Replicated Data Types (CRDT) for consistency
 * - Presence tracking for user awareness
 * - Conflict detection and resolution
 * - Real-time synchronization via WebSocket
 * - Integration with existing UnifiedEditor
 */

// Export CRDT module
export * from './crdt';

// Export presence module
export * from './presence';

// Export conflict module
export * from './conflict';

// Export real-time synchronization module
export * from './realtime';

// Export integration module
export * from './integration';

// Export type definitions
export * from './types';

/**
 * Collaboration layer factory
 */
export class CollaborationLayerFactory {
  /**
   * Create a complete collaboration layer for a document
   */
  static createForDocument(
    documentId: string,
    userId: string,
    userName: string,
    options?: {
      enableRealtime?: boolean;
      enablePresence?: boolean;
      enableConflictResolution?: boolean;
      websocketUrl?: string;
    }
  ) {
    const collaborationConfig = {
      documentId,
      userId,
      userName,
      enabled: options?.enableRealtime ?? true,
      websocketUrl: options?.websocketUrl,
      enablePresence: options?.enablePresence ?? true,
      enableConflictResolution: options?.enableConflictResolution ?? true
    };
    
    return {
      config: collaborationConfig,
      modules: {
        // Individual modules can be accessed through their respective exports
      }
    };
  }
  
  /**
   * Check if collaboration is supported in the current environment
   */
  static isSupported(): boolean {
    return typeof WebSocket !== 'undefined';
  }
  
  /**
   * Get collaboration layer version
   */
  static getVersion(): string {
    return '1.0.0';
  }
}

/**
 * Collaboration layer constants
 */
export const CollaborationConstants = {
  VERSION: '1.0.0',
  MODULES: {
    CRDT: 'crdt',
    PRESENCE: 'presence',
    CONFLICT: 'conflict',
    REALTIME: 'realtime',
    INTEGRATION: 'integration'
  },
  EVENT_TYPES: {
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    OPERATION_RECEIVED: 'operation-received',
    OPERATION_SENT: 'operation-sent',
    PRESENCE_UPDATED: 'presence-updated',
    CONFLICT_DETECTED: 'conflict-detected',
    CONFLICT_RESOLVED: 'conflict-resolved',
    ERROR: 'error'
  },
  RESOLUTION_STRATEGIES: {
    LAST_WRITE_WINS: 'last-write-wins',
    OPERATIONAL_TRANSFORM: 'operational-transform',
    MANUAL: 'manual',
    PRIORITY_BASED: 'priority-based',
    AUTO: 'auto',
    HYBRID: 'hybrid'
  }
} as const;

/**
 * Default export for convenience
 */
export default {
  CollaborationLayerFactory,
  CollaborationConstants,
  // Re-export all modules
  ...require('./crdt'),
  ...require('./presence'),
  ...require('./conflict'),
  ...require('./realtime'),
  ...require('./integration'),
  ...require('./types')
};