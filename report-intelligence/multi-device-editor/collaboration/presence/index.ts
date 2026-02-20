/**
 * Presence Module - User presence tracking for collaborative editing
 * 
 * This module tracks active users, their cursor positions, selection ranges,
 * and status in real-time collaborative editing sessions.
 */

// Export types
export type { PresenceState } from '../types';

// Export state utilities
export {
  DEFAULT_PRESENCE_CONFIG,
  type PartialPresenceConfig,
  generateUserColor,
  createPresenceState,
  updatePresenceActivity,
  updatePresenceStatus,
  isPresenceStale,
  isSamePresence,
  mergePresenceStates,
  getPresenceDisplayName,
  isUserActive,
  hasCursorPosition,
  hasSelectionRange,
  getCursorDistance,
  doSelectionsOverlap,
  exportPresenceToJson,
  importPresenceFromJson
} from './PresenceState';

// Import for re-export
import { PresenceTracker, type PresenceTrackerConfig, type PresenceUpdateEvent } from './PresenceTracker';
import { PresenceBroadcaster, type PresenceBroadcasterConfig, type BroadcastMessage, type BroadcastMessageType, type ClientConnection } from './PresenceBroadcaster';

// Export tracker
export {
  PresenceTracker,
  type PresenceTrackerConfig,
  type PresenceUpdateEvent
};

// Export broadcaster
export {
  PresenceBroadcaster,
  type PresenceBroadcasterConfig,
  type BroadcastMessage,
  type BroadcastMessageType,
  type ClientConnection
};

/**
 * Create a new presence tracker instance
 */
export function createPresenceTracker(config: {
  documentId: string;
  idleTimeout?: number;
  awayTimeout?: number;
  heartbeatInterval?: number;
  maxUsersPerDocument?: number;
  enableAutoCleanup?: boolean;
  cleanupInterval?: number;
}): PresenceTracker {
  const fullConfig: PresenceTrackerConfig = {
    idleTimeout: 30000,
    awayTimeout: 300000,
    heartbeatInterval: 10000,
    maxUsersPerDocument: 100,
    enableAutoCleanup: true,
    cleanupInterval: 60000,
    ...config
  };
  
  return new PresenceTracker(fullConfig);
}

/**
 * Create a new presence broadcaster instance
 */
export function createPresenceBroadcaster(config: {
  documentId: string;
  broadcastInterval?: number;
  enableHeartbeat?: boolean;
  maxBroadcastSize?: number;
  idleTimeout?: number;
  awayTimeout?: number;
  heartbeatInterval?: number;
  maxUsersPerDocument?: number;
}): PresenceBroadcaster {
  const fullConfig: PresenceBroadcasterConfig = {
    broadcastInterval: 1000,
    enableHeartbeat: true,
    maxBroadcastSize: 1000,
    idleTimeout: 30000,
    awayTimeout: 300000,
    heartbeatInterval: 10000,
    maxUsersPerDocument: 100,
    ...config
  };
  
  return new PresenceBroadcaster(fullConfig);
}

/**
 * Example usage:
 * 
 * ```typescript
 * import { createPresenceBroadcaster } from './presence';
 * 
 * const broadcaster = createPresenceBroadcaster({
 *   documentId: 'doc-123'
 * });
 * 
 * // Register a client connection
 * broadcaster.registerConnection({
 *   id: 'conn-1',
 *   userId: 'user-123',
 *   deviceId: 'device-456',
 *   send: (message) => console.log('Message:', message)
 * });
 * 
 * // Update cursor position
 * broadcaster.updateCursorPosition('user-123', 'device-456', 42);
 * ```
 */