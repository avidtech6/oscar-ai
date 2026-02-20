/**
 * WebSocket Manager - WebSocket connection management for real-time collaboration
 * 
 * This module manages WebSocket connections, reconnection logic, and
 * message handling for real-time collaborative editing.
 */

import type { RealtimeMessage } from '../types';

/**
 * WebSocket connection state
 */
export type WebSocketState = 
  | 'connecting' 
  | 'connected' 
  | 'disconnected' 
  | 'reconnecting' 
  | 'error' 
  | 'closed';

/**
 * WebSocket configuration
 */
export interface WebSocketConfig {
  url: string;
  reconnectAttempts: number;
  reconnectDelay: number;
  maxReconnectDelay: number;
  heartbeatInterval: number;
  heartbeatTimeout: number;
  autoReconnect: boolean;
  protocols?: string | string[];
}

/**
 * Default WebSocket configuration
 */
export const DEFAULT_WEBSOCKET_CONFIG: WebSocketConfig = {
  url: 'ws://localhost:3000/ws',
  reconnectAttempts: 10,
  reconnectDelay: 1000,
  maxReconnectDelay: 30000,
  heartbeatInterval: 30000,
  heartbeatTimeout: 5000,
  autoReconnect: true,
  protocols: undefined
};

/**
 * WebSocket event
 */
export interface WebSocketEvent {
  type: 'open' | 'message' | 'close' | 'error' | 'state-change' | 'reconnect';
  data?: any;
  timestamp: Date;
}

/**
 * WebSocket Manager class
 */
export class WebSocketManager {
  private config: WebSocketConfig;
  private socket: WebSocket | null = null;
  private state: WebSocketState = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, Function[]> = new Map();
  private messageQueue: RealtimeMessage[] = [];
  private isSending = false;
  
  /**
   * Create a new WebSocket manager
   */
  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      ...DEFAULT_WEBSOCKET_CONFIG,
      ...config
    };
  }
  
  /**
   * Connect to the WebSocket server
   */
  connect(): boolean {
    if (this.state === 'connecting' || this.state === 'connected') {
      return false;
    }
    
    try {
      this.setState('connecting');
      
      // Create WebSocket connection
      this.socket = new WebSocket(this.config.url, this.config.protocols);
      
      // Set up event handlers
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      
      return true;
    } catch (error) {
      this.emit('error', {
        type: 'error',
        data: { error, message: 'Failed to create WebSocket connection' },
        timestamp: new Date()
      });
      
      this.setState('error');
      return false;
    }
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    this.clearTimers();
    
    if (this.socket) {
      this.socket.close(1000, 'Client disconnected');
      this.socket = null;
    }
    
    this.setState('disconnected');
    this.reconnectAttempts = 0;
    
    this.emit('close', {
      type: 'close',
      data: { code: 1000, reason: 'Client disconnected' },
      timestamp: new Date()
    });
  }
  
  /**
   * Send a message through the WebSocket
   */
  send(message: RealtimeMessage): boolean {
    if (!this.socket || this.state !== 'connected') {
      // Queue message for later
      this.messageQueue.push(message);
      return false;
    }
    
    try {
      const messageStr = JSON.stringify(message);
      this.socket.send(messageStr);
      
      this.emit('message-sent', {
        type: 'message',
        data: { message, size: messageStr.length },
        timestamp: new Date()
      });
      
      return true;
    } catch (error) {
      this.emit('error', {
        type: 'error',
        data: { error, message: 'Failed to send message' },
        timestamp: new Date()
      });
      
      // Queue message for retry
      this.messageQueue.push(message);
      return false;
    }
  }
  
  /**
   * Send multiple messages
   */
  sendBatch(messages: RealtimeMessage[]): number {
    let successCount = 0;
    
    for (const message of messages) {
      if (this.send(message)) {
        successCount++;
      }
    }
    
    return successCount;
  }
  
  /**
   * Process queued messages
   */
  processQueue(): number {
    if (this.messageQueue.length === 0 || !this.socket || this.state !== 'connected') {
      return 0;
    }
    
    const messagesToSend = [...this.messageQueue];
    this.messageQueue = [];
    
    let successCount = 0;
    
    for (const message of messagesToSend) {
      if (this.send(message)) {
        successCount++;
      } else {
        // Re-queue failed messages
        this.messageQueue.push(message);
      }
    }
    
    return successCount;
  }
  
  /**
   * Get current connection state
   */
  getState(): WebSocketState {
    return this.state;
  }
  
  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.state === 'connected';
  }
  
  /**
   * Get connection statistics
   */
  getStats(): {
    state: WebSocketState;
    reconnectAttempts: number;
    queueSize: number;
    connected: boolean;
    url: string;
  } {
    return {
      state: this.state,
      reconnectAttempts: this.reconnectAttempts,
      queueSize: this.messageQueue.length,
      connected: this.isConnected(),
      url: this.config.url
    };
  }
  
  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<WebSocketConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    };
    
    this.emit('config-updated', {
      type: 'state-change',
      data: { config: this.config },
      timestamp: new Date()
    });
  }
  
  /**
   * Handle WebSocket open event
   */
  private handleOpen(event: Event): void {
    this.setState('connected');
    this.reconnectAttempts = 0;
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Process queued messages
    this.processQueue();
    
    this.emit('open', {
      type: 'open',
      data: event,
      timestamp: new Date()
    });
  }
  
  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as RealtimeMessage;
      
      this.emit('message', {
        type: 'message',
        data: { message, raw: event.data },
        timestamp: new Date()
      });
      
      // Forward to specific message type handlers
      this.emit(`message:${message.type}`, {
        type: 'message',
        data: { message },
        timestamp: new Date()
      });
    } catch (error) {
      this.emit('error', {
        type: 'error',
        data: { error, message: 'Failed to parse WebSocket message' },
        timestamp: new Date()
      });
    }
  }
  
  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    this.clearTimers();
    this.setState('disconnected');
    
    this.emit('close', {
      type: 'close',
      data: { code: event.code, reason: event.reason, wasClean: event.wasClean },
      timestamp: new Date()
    });
    
    // Attempt reconnection if configured
    if (this.config.autoReconnect && event.code !== 1000) {
      this.attemptReconnect();
    }
  }
  
  /**
   * Handle WebSocket error event
   */
  private handleError(event: Event): void {
    this.setState('error');
    
    this.emit('error', {
      type: 'error',
      data: event,
      timestamp: new Date()
    });
  }
  
  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.config.reconnectAttempts) {
      this.emit('reconnect-failed', {
        type: 'error',
        data: { message: 'Max reconnect attempts reached' },
        timestamp: new Date()
      });
      return;
    }
    
    this.reconnectAttempts++;
    this.setState('reconnecting');
    
    // Calculate reconnect delay with exponential backoff
    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1),
      this.config.maxReconnectDelay
    );
    
    this.emit('reconnect', {
      type: 'reconnect',
      data: { attempt: this.reconnectAttempts, delay },
      timestamp: new Date()
    });
    
    // Schedule reconnect
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }
  
  /**
   * Start heartbeat/ping-pong
   */
  private startHeartbeat(): void {
    this.clearHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.socket && this.state === 'connected') {
        // Send ping message
        const pingMessage: RealtimeMessage = {
          type: 'ack',
          data: { type: 'ping', timestamp: Date.now() },
          timestamp: new Date(),
          senderId: 'client',
          messageId: `ping_${Date.now()}`
        };
        
        this.send(pingMessage);
      }
    }, this.config.heartbeatInterval);
  }
  
  /**
   * Clear all timers
   */
  private clearTimers(): void {
    this.clearReconnectTimer();
    this.clearHeartbeat();
  }
  
  /**
   * Clear reconnect timer
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
  
  /**
   * Clear heartbeat timer
   */
  private clearHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
  
  /**
   * Set connection state
   */
  private setState(newState: WebSocketState): void {
    const oldState = this.state;
    this.state = newState;
    
    if (oldState !== newState) {
      this.emit('state-change', {
        type: 'state-change',
        data: { oldState, newState },
        timestamp: new Date()
      });
    }
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
  
  private emit(event: string, data: WebSocketEvent): void {
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
    this.disconnect();
    this.clearTimers();
    this.messageQueue = [];
    this.eventListeners.clear();
    
    this.emit('disposed', {
      type: 'state-change',
      data: { message: 'WebSocketManager disposed' },
      timestamp: new Date()
    });
  }
}