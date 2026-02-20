/**
 * Presence State types and utilities
 * 
 * This module defines the data structures for tracking user presence
 * in collaborative editing sessions.
 */

import type { PresenceState } from '../types';

/**
 * Default presence configuration
 */
export const DEFAULT_PRESENCE_CONFIG = {
  idleTimeout: 30000, // 30 seconds
  awayTimeout: 300000, // 5 minutes
  heartbeatInterval: 10000, // 10 seconds
  maxUsersPerDocument: 100,
  defaultUserColor: '#3B82F6' // Blue
};

/**
 * Generate a random color for a user
 */
export function generateUserColor(userId: string): string {
  // Simple deterministic color generation based on user ID
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#6366F1'  // Indigo
  ];
  
  // Simple hash of user ID to pick a color
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

/**
 * Create a new presence state for a user
 */
export function createPresenceState(
  userId: string,
  deviceId: string,
  userName: string,
  options?: {
    userColor?: string;
    cursorPosition?: number;
    selectionRange?: { start: number; end: number };
  }
): PresenceState {
  const now = new Date();
  
  return {
    userId,
    deviceId,
    userName,
    userColor: options?.userColor || generateUserColor(userId),
    cursorPosition: options?.cursorPosition,
    selectionRange: options?.selectionRange,
    lastActivity: now,
    status: 'active'
  };
}

/**
 * Update presence state with new activity
 */
export function updatePresenceActivity(
  presence: PresenceState,
  updates?: {
    cursorPosition?: number;
    selectionRange?: { start: number; end: number };
    status?: 'active' | 'idle' | 'away';
  }
): PresenceState {
  const now = new Date();
  
  return {
    ...presence,
    cursorPosition: updates?.cursorPosition ?? presence.cursorPosition,
    selectionRange: updates?.selectionRange ?? presence.selectionRange,
    lastActivity: now,
    status: updates?.status ?? presence.status
  };
}

/**
 * Partial presence configuration for functions that don't need all fields
 */
export type PartialPresenceConfig = {
  idleTimeout: number;
  awayTimeout: number;
  heartbeatInterval?: number;
  maxUsersPerDocument?: number;
  defaultUserColor?: string;
};

/**
 * Check if a presence state is stale (user is likely offline)
 */
export function isPresenceStale(
  presence: PresenceState,
  config: PartialPresenceConfig = DEFAULT_PRESENCE_CONFIG
): boolean {
  const now = new Date();
  const timeSinceLastActivity = now.getTime() - presence.lastActivity.getTime();
  
  // If last activity was more than away timeout ago, consider stale
  return timeSinceLastActivity > config.awayTimeout * 2; // Double away timeout
}

/**
 * Update presence status based on last activity time
 */
export function updatePresenceStatus(
  presence: PresenceState,
  config: PartialPresenceConfig = DEFAULT_PRESENCE_CONFIG
): PresenceState {
  const now = new Date();
  const timeSinceLastActivity = now.getTime() - presence.lastActivity.getTime();
  
  let newStatus: 'active' | 'idle' | 'away' | 'offline' = presence.status;
  
  if (timeSinceLastActivity <= config.idleTimeout) {
    newStatus = 'active';
  } else if (timeSinceLastActivity <= config.awayTimeout) {
    newStatus = 'idle';
  } else {
    newStatus = 'away';
  }
  
  return {
    ...presence,
    status: newStatus
  };
}

/**
 * Compare two presence states to see if they represent the same user/device
 */
export function isSamePresence(
  presence1: PresenceState,
  presence2: PresenceState
): boolean {
  return presence1.userId === presence2.userId && 
         presence1.deviceId === presence2.deviceId;
}

/**
 * Merge two presence states (for updates)
 */
export function mergePresenceStates(
  existing: PresenceState,
  update: Partial<PresenceState>
): PresenceState {
  return {
    ...existing,
    ...update,
    lastActivity: update.lastActivity ? new Date(update.lastActivity) : existing.lastActivity
  };
}

/**
 * Get a display name for a presence state
 */
export function getPresenceDisplayName(presence: PresenceState): string {
  return presence.userName || presence.userId;
}

/**
 * Check if a user is currently active (editing)
 */
export function isUserActive(presence: PresenceState): boolean {
  return presence.status === 'active';
}

/**
 * Check if a user has cursor position information
 */
export function hasCursorPosition(presence: PresenceState): boolean {
  return presence.cursorPosition !== undefined;
}

/**
 * Check if a user has selection range information
 */
export function hasSelectionRange(presence: PresenceState): boolean {
  return presence.selectionRange !== undefined;
}

/**
 * Calculate distance between two cursor positions (for UI purposes)
 */
export function getCursorDistance(
  pos1: number | undefined,
  pos2: number | undefined
): number | null {
  if (pos1 === undefined || pos2 === undefined) {
    return null;
  }
  
  return Math.abs(pos1 - pos2);
}

/**
 * Check if two selection ranges overlap
 */
export function doSelectionsOverlap(
  range1: { start: number; end: number } | undefined,
  range2: { start: number; end: number } | undefined
): boolean {
  if (!range1 || !range2) {
    return false;
  }
  
  return !(range1.end <= range2.start || range2.end <= range1.start);
}

/**
 * Export presence state to JSON
 */
export function exportPresenceToJson(presence: PresenceState): string {
  const exportData = {
    ...presence,
    lastActivity: presence.lastActivity.toISOString()
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Import presence state from JSON
 */
export function importPresenceFromJson(jsonString: string): PresenceState {
  const data = JSON.parse(jsonString);
  
  return {
    ...data,
    lastActivity: new Date(data.lastActivity)
  };
}