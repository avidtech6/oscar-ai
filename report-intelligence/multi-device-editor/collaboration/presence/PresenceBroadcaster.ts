/**
 * Presence Broadcaster - Broadcasts presence updates to connected clients
 * 
 * This module handles broadcasting presence information to all connected
 * clients via WebSocket or other real-time communication channels.
 */

import type { PresenceState } from '../types';
import { PresenceTracker, type PresenceTrackerConfig } from './PresenceTracker';

/**
 * Broadcast message types
 */
export type BroadcastMessageType = 
  | 'presence-update' 
  | 'presence-join' 
  | 'presence-leave' 
  | 'cursor-update' 
  | 'selection-update'
  | 'presence-sync';

/**
 * Broadcast message
 */
export interface BroadcastMessage {
  type: BroadcastMessageType;
  data: any;
  timestamp: Date;
  senderId?: string;
}

/**
 * Client connection interface
 */
export interface ClientConnection {
  id: string;
  userId: string;
  deviceId: string;
  send: (message: BroadcastMessage) => void;
  disconnect?: () => void;
}

/**
 * Presence Broadcaster configuration
 */
export interface PresenceBroadcasterConfig extends PresenceTrackerConfig {
  broadcastInterval?: number;
  enableHeartbeat?: boolean;
  maxBroadcastSize?: number;
}

/**
 * Presence Broadcaster class
 */
export class PresenceBroadcaster {
  private tracker: PresenceTracker;
  private config: PresenceBroadcasterConfig;
  private connections: Map<string, ClientConnection> = new Map();
  private broadcastTimer?: NodeJS.Timeout;
  private eventListeners: Map<string, Function[]> = new Map();
  
  /**
   * Create a new presence broadcaster
   */
  constructor(config: PresenceBroadcasterConfig) {
    this.config = {
      broadcastInterval: 1000, // 1 second
      enableHeartbeat: true,
      maxBroadcastSize: 1000, // 1KB
      ...config
    };
    
    this.tracker = new PresenceTracker(config);
    
    // Set up event forwarding from tracker
    this.setupTrackerEvents();
    
    // Start broadcast timer if enabled
    if (this.config.enableHeartbeat) {
      this.startBroadcastTimer();
    }
  }
  
  /**
   * Set up event forwarding from the tracker
   */
  private setupTrackerEvents(): void {
    this.tracker.on('presence-updated', (event: any) => {
      this.broadcastPresenceUpdate(event);
    });
    
    this.tracker.on('cursor-updated', (event: any) => {
      this.broadcastCursorUpdate(event);
    });
    
    this.tracker.on('selection-updated', (event: any) => {
      this.broadcastSelectionUpdate(event);
    });
    
    this.tracker.on('presences-cleaned', (event: any) => {
      this.emit('presences-cleaned', event);
    });
  }
  
  /**
   * Register a client connection
   */
  registerConnection(connection: ClientConnection): void {
    const connectionId = connection.id;
    this.connections.set(connectionId, connection);
    
    // Update presence for this user
    this.tracker.updatePresence(
      connection.userId,
      connection.deviceId,
      connection.userId // Using userId as userName for now
    );
    
    // Send current presence state to the new connection
    this.sendPresenceSync(connection);
    
    this.emit('connection-registered', { connection });
  }
  
  /**
   * Unregister a client connection
   */
  unregisterConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      // Remove presence for this user/device
      this.tracker.removePresence(connection.userId, connection.deviceId);
      
      this.connections.delete(connectionId);
      this.emit('connection-unregistered', { connectionId, connection });
    }
  }
  
  /**
   * Update cursor position for a user
   */
  updateCursorPosition(
    userId: string,
    deviceId: string,
    cursorPosition: number
  ): void {
    this.tracker.updateCursorPosition(userId, deviceId, cursorPosition);
  }
  
  /**
   * Update selection range for a user
   */
  updateSelectionRange(
    userId: string,
    deviceId: string,
    selectionRange: { start: number; end: number }
  ): void {
    this.tracker.updateSelectionRange(userId, deviceId, selectionRange);
  }
  
  /**
   * Send presence sync to a specific connection
   */
  private sendPresenceSync(connection: ClientConnection): void {
    const allPresences = this.tracker.getAllPresences();
    
    const message: BroadcastMessage = {
      type: 'presence-sync',
      data: {
        presences: allPresences,
        timestamp: new Date()
      },
      timestamp: new Date()
    };
    
    connection.send(message);
  }
  
  /**
   * Broadcast presence update to all connections
   */
  private broadcastPresenceUpdate(event: any): void {
    const message: BroadcastMessage = {
      type: this.getBroadcastTypeForEvent(event.type),
      data: {
        presence: event.presence,
        previousPresence: event.previousPresence,
        eventType: event.type
      },
      timestamp: event.timestamp,
      senderId: event.presence.userId
    };
    
    this.broadcastToAll(message, event.presence.userId, event.presence.deviceId);
  }
  
  /**
   * Broadcast cursor update to all connections
   */
  private broadcastCursorUpdate(event: any): void {
    const message: BroadcastMessage = {
      type: 'cursor-update',
      data: {
        userId: event.userId,
        deviceId: event.deviceId,
        cursorPosition: event.cursorPosition,
        presence: event.presence
      },
      timestamp: event.timestamp,
      senderId: event.userId
    };
    
    this.broadcastToAll(message, event.userId, event.deviceId);
  }
  
  /**
   * Broadcast selection update to all connections
   */
  private broadcastSelectionUpdate(event: any): void {
    const message: BroadcastMessage = {
      type: 'selection-update',
      data: {
        userId: event.userId,
        deviceId: event.deviceId,
        selectionRange: event.selectionRange,
        presence: event.presence
      },
      timestamp: event.timestamp,
      senderId: event.userId
    };
    
    this.broadcastToAll(message, event.userId, event.deviceId);
  }
  
  /**
   * Broadcast a message to all connections except the sender
   */
  private broadcastToAll(
    message: BroadcastMessage,
    excludeUserId?: string,
    excludeDeviceId?: string
  ): void {
    // Check message size
    const messageSize = JSON.stringify(message).length;
    if (messageSize > (this.config.maxBroadcastSize || 1000)) {
      this.emit('message-too-large', { message, size: messageSize });
      return;
    }
    
    for (const [connectionId, connection] of this.connections.entries()) {
      // Skip sender if specified
      if (excludeUserId && excludeDeviceId && 
          connection.userId === excludeUserId && 
          connection.deviceId === excludeDeviceId) {
        continue;
      }
      
      try {
        connection.send(message);
      } catch (error) {
        console.error(`Error sending message to connection ${connectionId}:`, error);
        this.emit('send-error', { connectionId, error, message });
      }
    }
    
    this.emit('message-broadcast', {
      message,
      recipientCount: this.connections.size,
      excludedSender: excludeUserId ? true : false
    });
  }
  
  /**
   * Broadcast a message to specific users
   */
  broadcastToUsers(
    message: BroadcastMessage,
    userIds: string[]
  ): void {
    const recipientConnections = Array.from(this.connections.values())
      .filter(connection => userIds.includes(connection.userId));
    
    for (const connection of recipientConnections) {
      try {
        connection.send(message);
      } catch (error) {
        console.error(`Error sending message to user ${connection.userId}:`, error);
      }
    }
    
    this.emit('message-broadcast-to-users', {
      message,
      userIds,
      recipientCount: recipientConnections.length
    });
  }
  
  /**
   * Send a direct message to a specific connection
   */
  sendToConnection(
    connectionId: string,
    message: BroadcastMessage
  ): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return false;
    }
    
    try {
      connection.send(message);
      return true;
    } catch (error) {
      console.error(`Error sending message to connection ${connectionId}:`, error);
      return false;
    }
  }
  
  /**
   * Get broadcast type for event type
   */
  private getBroadcastTypeForEvent(eventType: string): BroadcastMessageType {
    switch (eventType) {
      case 'joined':
        return 'presence-join';
      case 'left':
        return 'presence-leave';
      case 'updated':
      case 'status-changed':
        return 'presence-update';
      default:
        return 'presence-update';
    }
  }
  
  /**
   * Start broadcast timer for periodic updates
   */
  private startBroadcastTimer(): void {
    if (this.broadcastTimer) {
      clearInterval(this.broadcastTimer);
    }
    
    this.broadcastTimer = setInterval(() => {
      // Send heartbeat/presence sync to all connections
      const allPresences = this.tracker.getAllPresences();
      
      const message: BroadcastMessage = {
        type: 'presence-sync',
        data: {
          presences: allPresences,
          timestamp: new Date(),
          heartbeat: true
        },
        timestamp: new Date()
      };
      
      this.broadcastToAll(message);
      
      this.emit('heartbeat', {
        presences: allPresences.length,
        connections: this.connections.size,
        timestamp: new Date()
      });
    }, this.config.broadcastInterval || 1000);
  }
  
  /**
   * Get all active connections
   */
  getConnections(): ClientConnection[] {
    return Array.from(this.connections.values());
  }
  
  /**
   * Get connection by ID
   */
  getConnection(connectionId: string): ClientConnection | undefined {
    return this.connections.get(connectionId);
  }
  
  /**
   * Get connections for a specific user
   */
  getConnectionsForUser(userId: string): ClientConnection[] {
    return Array.from(this.connections.values())
      .filter(connection => connection.userId === userId);
  }
  
  /**
   * Get the underlying presence tracker
   */
  getTracker(): PresenceTracker {
    return this.tracker;
  }
  
  /**
   * Get broadcaster statistics
   */
  getStats(): {
    connections: number;
    presences: number;
    activeUsers: number;
    broadcastInterval: number;
    lastHeartbeat?: Date;
  } {
    const trackerStats = this.tracker.getStats();
    
    return {
      connections: this.connections.size,
      presences: trackerStats.totalPresences,
      activeUsers: trackerStats.activeUsers,
      broadcastInterval: this.config.broadcastInterval || 1000
    };
  }
  
  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.broadcastTimer) {
      clearInterval(this.broadcastTimer);
      this.broadcastTimer = undefined;
    }
    
    this.tracker.dispose();
    this.connections.clear();
    this.eventListeners.clear();
    
    this.emit('disposed', { timestamp: new Date() });
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
}