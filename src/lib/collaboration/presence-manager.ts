/**
 * Presence Manager for Oscar AI Phase Compliance Package
 * 
 * This file implements the PresenceManager class for Phase 19: Real-Time Collaboration Layer (CRDT + Presence).
 * It manages user presence, cursors, and collaborative awareness.
 * 
 * File: src/lib/collaboration/presence-manager.ts
 * Generated as part of Oscar AI Phase Compliance Package implementation
 */

export interface UserPresence {
  id: string;
  userId: string;
  userName: string;
  color: string;
  cursor?: {
    position: number;
    selection?: {
      start: number;
      end: number;
    };
  };
  lastActive: Date;
  isActive: boolean;
  device: string;
  location?: string;
}

export interface PresenceEvent {
  type: 'join' | 'leave' | 'move' | 'selection' | 'activity';
  userId: string;
  timestamp: Date;
  data?: any;
}

export interface PresenceConfig {
  heartbeatInterval: number;
  inactivityTimeout: number;
  maxUsers: number;
  enableLocation: boolean;
}

/**
 * Presence Manager for collaborative awareness
 */
export class PresenceManager {
  private config: PresenceConfig;
  private users: Map<string, UserPresence> = new Map();
  private eventCallbacks: Array<(event: PresenceEvent) => void> = [];
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private cleanupTimer: NodeJS.Timeout | null = null;
  
  /**
   * Initialize presence manager
   */
  constructor(config: Partial<PresenceConfig> = {}) {
    this.config = {
      heartbeatInterval: 30000, // 30 seconds
      inactivityTimeout: 120000, // 2 minutes
      maxUsers: 50,
      enableLocation: false,
      ...config
    };
    
    this.startHeartbeat();
    this.startCleanup();
  }
  
  /**
   * User joins the session
   */
  userJoin(userId: string, userName: string, color?: string): UserPresence {
    if (this.users.size >= this.config.maxUsers) {
      throw new Error('Maximum number of users reached');
    }
    
    const presence: UserPresence = {
      id: this.generatePresenceId(),
      userId,
      userName,
      color: color || this.generateUserColor(),
      lastActive: new Date(),
      isActive: true,
      device: 'unknown'
    };
    
    this.users.set(userId, presence);
    
    this.notifyEvent({
      type: 'join',
      userId,
      timestamp: new Date()
    });
    
    return presence;
  }
  
  /**
   * User leaves the session
   */
  userLeave(userId: string): void {
    const presence = this.users.get(userId);
    if (presence) {
      this.users.delete(userId);
      
      this.notifyEvent({
        type: 'leave',
        userId,
        timestamp: new Date()
      });
    }
  }
  
  /**
   * Update user cursor position
   */
  updateCursor(userId: string, position: number, selection?: { start: number; end: number }): void {
    const presence = this.users.get(userId);
    if (presence) {
      presence.cursor = { position, selection };
      presence.lastActive = new Date();
      
      this.notifyEvent({
        type: 'move',
        userId,
        timestamp: new Date(),
        data: { position, selection }
      });
    }
  }
  
  /**
   * Update user selection
   */
  updateSelection(userId: string, selection: { start: number; end: number }): void {
    const presence = this.users.get(userId);
    if (presence && presence.cursor) {
      presence.cursor.selection = selection;
      presence.lastActive = new Date();
      
      this.notifyEvent({
        type: 'selection',
        userId,
        timestamp: new Date(),
        data: { selection }
      });
    }
  }
  
  /**
   * Update user activity
   */
  updateActivity(userId: string): void {
    const presence = this.users.get(userId);
    if (presence) {
      presence.lastActive = new Date();
      presence.isActive = true;
      
      this.notifyEvent({
        type: 'activity',
        userId,
        timestamp: new Date()
      });
    }
  }
  
  /**
   * Update user device information
   */
  updateDevice(userId: string, device: string): void {
    const presence = this.users.get(userId);
    if (presence) {
      presence.device = device;
      presence.lastActive = new Date();
    }
  }
  
  /**
   * Update user location (if enabled)
   */
  updateLocation(userId: string, location: string): void {
    if (!this.config.enableLocation) return;
    
    const presence = this.users.get(userId);
    if (presence) {
      presence.location = location;
      presence.lastActive = new Date();
    }
  }
  
  /**
   * Get all active users
   */
  getUsers(): UserPresence[] {
    return Array.from(this.users.values())
      .filter(p => p.isActive)
      .sort((a, b) => a.lastActive.getTime() - b.lastActive.getTime());
  }
  
  /**
   * Get specific user presence
   */
  getUser(userId: string): UserPresence | undefined {
    return this.users.get(userId);
  }
  
  /**
   * Get user count
   */
  getUserCount(): number {
    return this.users.size;
  }
  
  /**
   * Get active user count
   */
  getActiveUserCount(): number {
    return Array.from(this.users.values()).filter(p => p.isActive).length;
  }
  
  /**
   * Check if user is active
   */
  isUserActive(userId: string): boolean {
    const presence = this.users.get(userId);
    return presence ? presence.isActive : false;
  }
  
  /**
   * Get user cursors
   */
  getCursors(): Array<{ userId: string; userName: string; color: string; cursor: any }> {
    return this.getUsers()
      .filter(p => p.cursor)
      .map(p => ({
        userId: p.userId,
        userName: p.userName,
        color: p.color,
        cursor: p.cursor
      }));
  }
  
  /**
   * Add event callback
   */
  onEvent(callback: (event: PresenceEvent) => void): void {
    this.eventCallbacks.push(callback);
  }
  
  /**
   * Remove event callback
   */
  removeEventCallback(callback: (event: PresenceEvent) => void): void {
    const index = this.eventCallbacks.indexOf(callback);
    if (index > -1) {
      this.eventCallbacks.splice(index, 1);
    }
  }
  
  /**
   * Get presence events
   */
  getEvents(): PresenceEvent[] {
    // In a real implementation, this would return recent events
    return [];
  }
  
  /**
   * Clear all users
   */
  clear(): void {
    this.users.clear();
  }
  
  /**
   * Stop presence manager
   */
  stop(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
  
  /**
   * Start heartbeat timer
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      // In a real implementation, this would send heartbeat to server
      this.checkUserActivity();
    }, this.config.heartbeatInterval);
  }
  
  /**
   * Start cleanup timer
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupInactiveUsers();
    }, this.config.inactivityTimeout);
  }
  
  /**
   * Check user activity
   */
  private checkUserActivity(): void {
    const now = new Date();
    const threshold = new Date(now.getTime() - this.config.inactivityTimeout);
    
    this.users.forEach((presence, userId) => {
      if (presence.lastActive < threshold) {
        presence.isActive = false;
      }
    });
  }
  
  /**
   * Clean up inactive users
   */
  private cleanupInactiveUsers(): void {
    const now = new Date();
    const threshold = new Date(now.getTime() - this.config.inactivityTimeout * 2);
    
    this.users.forEach((presence, userId) => {
      if (presence.lastActive < threshold) {
        this.userLeave(userId);
      }
    });
  }
  
  /**
   * Notify event callbacks
   */
  private notifyEvent(event: PresenceEvent): void {
    this.eventCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in event callback:', error);
      }
    });
  }
  
  /**
   * Generate unique presence ID
   */
  private generatePresenceId(): string {
    return `presence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Generate user color
   */
  private generateUserColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}