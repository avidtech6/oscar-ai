/**
 * Presence Tracker - Tracks active users and devices in collaborative sessions
 * 
 * This module manages presence information for all users in a document,
 * including their status, cursor positions, and selection ranges.
 */

import type { PresenceState } from '../types';
import { 
  DEFAULT_PRESENCE_CONFIG,
  createPresenceState,
  updatePresenceActivity,
  updatePresenceStatus,
  isPresenceStale,
  isSamePresence,
  mergePresenceStates,
  getPresenceDisplayName
} from './PresenceState';

/**
 * Configuration for presence tracking
 */
export interface PresenceTrackerConfig {
  documentId: string;
  idleTimeout?: number;
  awayTimeout?: number;
  heartbeatInterval?: number;
  maxUsersPerDocument?: number;
  enableAutoCleanup?: boolean;
  cleanupInterval?: number;
}

/**
 * Presence update event
 */
export interface PresenceUpdateEvent {
  type: 'joined' | 'updated' | 'left' | 'status-changed';
  presence: PresenceState;
  previousPresence?: PresenceState;
  timestamp: Date;
}

/**
 * Presence Tracker class
 */
export class PresenceTracker {
  private config: PresenceTrackerConfig;
  private presences: Map<string, PresenceState> = new Map(); // key: userId:deviceId
  private eventListeners: Map<string, Function[]> = new Map();
  private cleanupTimer?: NodeJS.Timeout;
  private heartbeatTimer?: NodeJS.Timeout;
  
  /**
   * Create a new presence tracker
   */
  constructor(config: PresenceTrackerConfig) {
    this.config = {
      idleTimeout: DEFAULT_PRESENCE_CONFIG.idleTimeout,
      awayTimeout: DEFAULT_PRESENCE_CONFIG.awayTimeout,
      heartbeatInterval: DEFAULT_PRESENCE_CONFIG.heartbeatInterval,
      maxUsersPerDocument: DEFAULT_PRESENCE_CONFIG.maxUsersPerDocument,
      enableAutoCleanup: true,
      cleanupInterval: 60000, // 1 minute
      ...config
    };
    
    // Start auto-cleanup if enabled
    if (this.config.enableAutoCleanup) {
      this.startAutoCleanup();
    }
    
    // Start heartbeat for local presence updates
    this.startHeartbeat();
  }
  
  /**
   * Add or update a user's presence
   */
  updatePresence(
    userId: string,
    deviceId: string,
    userName: string,
    updates?: {
      cursorPosition?: number;
      selectionRange?: { start: number; end: number };
      status?: 'active' | 'idle' | 'away';
      userColor?: string;
    }
  ): PresenceState {
    const presenceKey = this.getPresenceKey(userId, deviceId);
    const existingPresence = this.presences.get(presenceKey);
    
    let newPresence: PresenceState;
    
    if (existingPresence) {
      // Update existing presence
      newPresence = updatePresenceActivity(existingPresence, updates);
      this.presences.set(presenceKey, newPresence);
      
      this.emit('presence-updated', {
        type: 'updated',
        presence: newPresence,
        previousPresence: existingPresence,
        timestamp: new Date()
      });
    } else {
      // Check if we've reached the user limit
      if (this.presences.size >= (this.config.maxUsersPerDocument || 100)) {
        this.cleanupStalePresences();
        
        // If still at limit, remove oldest presence
        if (this.presences.size >= (this.config.maxUsersPerDocument || 100)) {
          this.removeOldestPresence();
        }
      }
      
      // Create new presence
      newPresence = createPresenceState(userId, deviceId, userName, updates);
      this.presences.set(presenceKey, newPresence);
      
      this.emit('presence-updated', {
        type: 'joined',
        presence: newPresence,
        timestamp: new Date()
      });
    }
    
    // Update status based on activity
    this.updatePresenceStatuses();
    
    return newPresence;
  }
  
  /**
   * Remove a user's presence
   */
  removePresence(userId: string, deviceId: string): boolean {
    const presenceKey = this.getPresenceKey(userId, deviceId);
    const existingPresence = this.presences.get(presenceKey);
    
    if (existingPresence) {
      this.presences.delete(presenceKey);
      
      this.emit('presence-updated', {
        type: 'left',
        presence: existingPresence,
        timestamp: new Date()
      });
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Update cursor position for a user
   */
  updateCursorPosition(
    userId: string,
    deviceId: string,
    cursorPosition: number
  ): PresenceState | null {
    const presenceKey = this.getPresenceKey(userId, deviceId);
    const existingPresence = this.presences.get(presenceKey);
    
    if (!existingPresence) {
      return null;
    }
    
    const updatedPresence = updatePresenceActivity(existingPresence, {
      cursorPosition,
      status: 'active'
    });
    
    this.presences.set(presenceKey, updatedPresence);
    
    this.emit('cursor-updated', {
      userId,
      deviceId,
      cursorPosition,
      presence: updatedPresence,
      timestamp: new Date()
    });
    
    return updatedPresence;
  }
  
  /**
   * Update selection range for a user
   */
  updateSelectionRange(
    userId: string,
    deviceId: string,
    selectionRange: { start: number; end: number }
  ): PresenceState | null {
    const presenceKey = this.getPresenceKey(userId, deviceId);
    const existingPresence = this.presences.get(presenceKey);
    
    if (!existingPresence) {
      return null;
    }
    
    const updatedPresence = updatePresenceActivity(existingPresence, {
      selectionRange,
      status: 'active'
    });
    
    this.presences.set(presenceKey, updatedPresence);
    
    this.emit('selection-updated', {
      userId,
      deviceId,
      selectionRange,
      presence: updatedPresence,
      timestamp: new Date()
    });
    
    return updatedPresence;
  }
  
  /**
   * Get all active presences
   */
  getAllPresences(): PresenceState[] {
    return Array.from(this.presences.values());
  }
  
  /**
   * Get presences for a specific user (across all devices)
   */
  getPresencesForUser(userId: string): PresenceState[] {
    return Array.from(this.presences.values())
      .filter(presence => presence.userId === userId);
  }
  
  /**
   * Get a specific presence
   */
  getPresence(userId: string, deviceId: string): PresenceState | undefined {
    const presenceKey = this.getPresenceKey(userId, deviceId);
    return this.presences.get(presenceKey);
  }
  
  /**
   * Get active users (users with at least one active presence)
   */
  getActiveUsers(): string[] {
    const userSet = new Set<string>();
    
    for (const presence of this.presences.values()) {
      if (presence.status === 'active') {
        userSet.add(presence.userId);
      }
    }
    
    return Array.from(userSet);
  }
  
  /**
   * Get users with cursor positions
   */
  getUsersWithCursors(): Array<{ userId: string; cursorPosition: number }> {
    const result: Array<{ userId: string; cursorPosition: number }> = [];
    
    for (const presence of this.presences.values()) {
      if (presence.cursorPosition !== undefined) {
        result.push({
          userId: presence.userId,
          cursorPosition: presence.cursorPosition
        });
      }
    }
    
    return result;
  }
  
  /**
   * Check if a user is present
   */
  isUserPresent(userId: string): boolean {
    return Array.from(this.presences.values())
      .some(presence => presence.userId === userId);
  }
  
  /**
   * Check if a specific device is present
   */
  isDevicePresent(userId: string, deviceId: string): boolean {
    const presenceKey = this.getPresenceKey(userId, deviceId);
    return this.presences.has(presenceKey);
  }
  
  /**
   * Update all presence statuses based on activity
   */
  updatePresenceStatuses(): void {
    const now = new Date();
    
    for (const [key, presence] of this.presences.entries()) {
      const updatedPresence = updatePresenceStatus(presence, {
        idleTimeout: this.config.idleTimeout!,
        awayTimeout: this.config.awayTimeout!,
        heartbeatInterval: this.config.heartbeatInterval,
        maxUsersPerDocument: this.config.maxUsersPerDocument
      });
      
      if (updatedPresence.status !== presence.status) {
        this.presences.set(key, updatedPresence);
        
        this.emit('presence-updated', {
          type: 'status-changed',
          presence: updatedPresence,
          previousPresence: presence,
          timestamp: now
        });
      }
    }
  }
  
  /**
   * Clean up stale presences (users who haven't been active)
   */
  cleanupStalePresences(): number {
    const now = new Date();
    let removedCount = 0;
    
    for (const [key, presence] of this.presences.entries()) {
      if (isPresenceStale(presence, {
        idleTimeout: this.config.idleTimeout!,
        awayTimeout: this.config.awayTimeout!,
        heartbeatInterval: this.config.heartbeatInterval,
        maxUsersPerDocument: this.config.maxUsersPerDocument
      })) {
        this.presences.delete(key);
        removedCount++;
        
        this.emit('presence-updated', {
          type: 'left',
          presence,
          timestamp: now
        });
      }
    }
    
    if (removedCount > 0) {
      this.emit('presences-cleaned', {
        removedCount,
        timestamp: now
      });
    }
    
    return removedCount;
  }
  
  /**
   * Remove the oldest presence (based on last activity)
   */
  private removeOldestPresence(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    
    for (const [key, presence] of this.presences.entries()) {
      const lastActivityTime = presence.lastActivity.getTime();
      if (lastActivityTime < oldestTime) {
        oldestTime = lastActivityTime;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      const presence = this.presences.get(oldestKey)!;
      this.presences.delete(oldestKey);
      
      this.emit('presence-updated', {
        type: 'left',
        presence,
        timestamp: new Date()
      });
    }
  }
  
  /**
   * Start automatic cleanup of stale presences
   */
  private startAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cleanupTimer = setInterval(() => {
      this.cleanupStalePresences();
    }, this.config.cleanupInterval || 60000);
  }
  
  /**
   * Start heartbeat for local presence updates
   */
  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    
    this.heartbeatTimer = setInterval(() => {
      this.updatePresenceStatuses();
    }, this.config.heartbeatInterval || 10000);
  }
  
  /**
   * Get presence key for Map
   */
  private getPresenceKey(userId: string, deviceId: string): string {
    return `${userId}:${deviceId}`;
  }
  
  /**
   * Get statistics about current presences
   */
  getStats(): {
    totalPresences: number;
    activeUsers: number;
    idleUsers: number;
    awayUsers: number;
    usersWithCursors: number;
    usersWithSelections: number;
  } {
    let activeUsers = 0;
    let idleUsers = 0;
    let awayUsers = 0;
    let usersWithCursors = 0;
    let usersWithSelections = 0;
    
    for (const presence of this.presences.values()) {
      switch (presence.status) {
        case 'active':
          activeUsers++;
          break;
        case 'idle':
          idleUsers++;
          break;
        case 'away':
          awayUsers++;
          break;
      }
      
      if (presence.cursorPosition !== undefined) {
        usersWithCursors++;
      }
      
      if (presence.selectionRange !== undefined) {
        usersWithSelections++;
      }
    }
    
    return {
      totalPresences: this.presences.size,
      activeUsers,
      idleUsers,
      awayUsers,
      usersWithCursors,
      usersWithSelections
    };
  }
  
  /**
   * Export all presences to JSON
   */
  exportToJson(): string {
    const exportData = {
      config: this.config,
      presences: Array.from(this.presences.values()).map(presence => ({
        ...presence,
        lastActivity: presence.lastActivity.toISOString()
      }))
    };
    
    return JSON.stringify(exportData, null, 2);
  }
  
  /**
   * Import presences from JSON
   */
  importFromJson(jsonString: string): void {
    const data = JSON.parse(jsonString);
    
    this.config = data.config;
    this.presences.clear();
    
    for (const presenceData of data.presences) {
      const presence: PresenceState = {
        ...presenceData,
        lastActivity: new Date(presenceData.lastActivity)
      };
      
      const key = this.getPresenceKey(presence.userId, presence.deviceId);
      this.presences.set(key, presence);
    }
    
    this.emit('presences-imported', {
      count: this.presences.size,
      timestamp: new Date()
    });
  }
  
  /**
   * Event handling
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }
  
  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      for (const callback of listeners) {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      }
    }
  }
  
  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
    
    this.presences.clear();
    this.eventListeners.clear();
    
    this.emit('disposed', { timestamp: new Date() });
  }
}