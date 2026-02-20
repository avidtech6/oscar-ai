/**
 * Message Handler - Handles real-time message parsing and routing
 * 
 * This module parses WebSocket messages and routes them to appropriate
 * handlers based on message type.
 */

import type { RealtimeMessage, RealtimeMessageType, CrdtOperation, PresenceState } from '../types';

/**
 * Message handler configuration
 */
export interface MessageHandlerConfig {
  validateMessages: boolean;
  maxMessageSize: number;
  allowUnknownMessageTypes: boolean;
  enableMessageLogging: boolean;
  messageTimeout: number;
}

/**
 * Default message handler configuration
 */
export const DEFAULT_MESSAGE_HANDLER_CONFIG: MessageHandlerConfig = {
  validateMessages: true,
  maxMessageSize: 1024 * 1024, // 1MB
  allowUnknownMessageTypes: false,
  enableMessageLogging: false,
  messageTimeout: 5000
};

/**
 * Message handler function
 */
export type MessageHandlerFunction = (message: RealtimeMessage) => void | Promise<void>;

/**
 * Message handler registration
 */
export interface HandlerRegistration {
  type: RealtimeMessageType;
  handler: MessageHandlerFunction;
  priority: number;
}

/**
 * Message validation result
 */
export interface MessageValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Message Handler class
 */
export class MessageHandler {
  private config: MessageHandlerConfig;
  private handlers: Map<RealtimeMessageType, HandlerRegistration[]> = new Map();
  private defaultHandler?: MessageHandlerFunction;
  private eventListeners: Map<string, Function[]> = new Map();
  
  /**
   * Create a new message handler
   */
  constructor(config: Partial<MessageHandlerConfig> = {}) {
    this.config = {
      ...DEFAULT_MESSAGE_HANDLER_CONFIG,
      ...config
    };
  }
  
  /**
   * Register a handler for a specific message type
   */
  registerHandler(
    type: RealtimeMessageType,
    handler: MessageHandlerFunction,
    priority: number = 0
  ): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    
    const registrations = this.handlers.get(type)!;
    registrations.push({ type, handler, priority });
    
    // Sort by priority (higher priority first)
    registrations.sort((a, b) => b.priority - a.priority);
    
    this.emit('handler-registered', {
      type,
      priority,
      handlerCount: registrations.length,
      timestamp: new Date()
    });
  }
  
  /**
   * Unregister a handler
   */
  unregisterHandler(type: RealtimeMessageType, handler: MessageHandlerFunction): boolean {
    const registrations = this.handlers.get(type);
    if (!registrations) {
      return false;
    }
    
    const initialLength = registrations.length;
    const filtered = registrations.filter(reg => reg.handler !== handler);
    
    if (filtered.length === initialLength) {
      return false;
    }
    
    this.handlers.set(type, filtered);
    
    this.emit('handler-unregistered', {
      type,
      handlerCount: filtered.length,
      timestamp: new Date()
    });
    
    return true;
  }
  
  /**
   * Set default handler for unhandled message types
   */
  setDefaultHandler(handler: MessageHandlerFunction): void {
    this.defaultHandler = handler;
    
    this.emit('default-handler-set', {
      timestamp: new Date()
    });
  }
  
  /**
   * Handle a message
   */
  async handleMessage(message: RealtimeMessage): Promise<boolean> {
    // Validate message
    const validation = this.validateMessage(message);
    if (!validation.valid && this.config.validateMessages) {
      this.emit('message-validation-failed', {
        message,
        validation,
        timestamp: new Date()
      });
      return false;
    }
    
    // Log message if enabled
    if (this.config.enableMessageLogging) {
      this.emit('message-received', {
        message,
        timestamp: new Date()
      });
    }
    
    // Get handlers for this message type
    const handlers = this.handlers.get(message.type) || [];
    
    if (handlers.length === 0) {
      // No specific handlers, use default if available
      if (this.defaultHandler) {
        try {
          await this.defaultHandler(message);
          return true;
        } catch (error) {
          this.emit('handler-error', {
            message,
            error,
            handler: 'default',
            timestamp: new Date()
          });
          return false;
        }
      } else if (!this.config.allowUnknownMessageTypes) {
        this.emit('unhandled-message', {
          message,
          timestamp: new Date()
        });
        return false;
      }
      
      return true;
    }
    
    // Execute all handlers in order
    let success = true;
    
    for (const registration of handlers) {
      try {
        await registration.handler(message);
        
        this.emit('handler-executed', {
          message,
          handlerType: registration.type,
          priority: registration.priority,
          timestamp: new Date()
        });
      } catch (error) {
        success = false;
        
        this.emit('handler-error', {
          message,
          error,
          handler: registration.type,
          priority: registration.priority,
          timestamp: new Date()
        });
        
        // Continue with other handlers even if one fails
      }
    }
    
    return success;
  }
  
  /**
   * Handle a raw message (string or ArrayBuffer)
   */
  async handleRawMessage(
    rawMessage: string | ArrayBuffer | Blob
  ): Promise<boolean> {
    try {
      // Parse message
      let message: RealtimeMessage;
      
      if (typeof rawMessage === 'string') {
        message = JSON.parse(rawMessage);
      } else if (rawMessage instanceof ArrayBuffer) {
        const text = new TextDecoder().decode(rawMessage);
        message = JSON.parse(text);
      } else if (rawMessage instanceof Blob) {
        const text = await rawMessage.text();
        message = JSON.parse(text);
      } else {
        throw new Error('Unsupported message format');
      }
      
      // Check message size
      const messageSize = JSON.stringify(message).length;
      if (messageSize > this.config.maxMessageSize) {
        this.emit('message-too-large', {
          message,
          size: messageSize,
          maxSize: this.config.maxMessageSize,
          timestamp: new Date()
        });
        return false;
      }
      
      // Handle the parsed message
      return await this.handleMessage(message);
    } catch (error) {
      this.emit('parse-error', {
        rawMessage,
        error,
        timestamp: new Date()
      });
      return false;
    }
  }
  
  /**
   * Validate a message
   */
  validateMessage(message: any): MessageValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check if message is an object
    if (typeof message !== 'object' || message === null) {
      errors.push('Message must be an object');
      return { valid: false, errors, warnings };
    }
    
    // Check required fields
    if (!message.type) {
      errors.push('Message must have a type');
    }
    
    if (!message.timestamp) {
      errors.push('Message must have a timestamp');
    }
    
    if (!message.data) {
      warnings.push('Message has no data field');
    }
    
    // Check timestamp format
    if (message.timestamp) {
      const timestamp = new Date(message.timestamp);
      if (isNaN(timestamp.getTime())) {
        errors.push('Invalid timestamp format');
      }
    }
    
    // Check message type
    if (message.type) {
      const validTypes: RealtimeMessageType[] = [
        'operation', 'presence', 'sync', 'ack', 'error'
      ];
      
      if (!validTypes.includes(message.type)) {
        if (this.config.allowUnknownMessageTypes) {
          warnings.push(`Unknown message type: ${message.type}`);
        } else {
          errors.push(`Invalid message type: ${message.type}`);
        }
      }
    }
    
    // Check data structure based on type
    if (message.data && message.type) {
      switch (message.type) {
        case 'operation':
          if (!message.data.operation) {
            warnings.push('Operation message should have an operation field');
          }
          break;
          
        case 'presence':
          if (!message.data.presence) {
            warnings.push('Presence message should have a presence field');
          }
          break;
          
        case 'sync':
          if (!message.data.document && !message.data.operations) {
            warnings.push('Sync message should have document or operations field');
          }
          break;
          
        case 'ack':
          if (!message.data.messageId) {
            warnings.push('Ack message should have a messageId field');
          }
          break;
          
        case 'error':
          if (!message.data.code && !message.data.message) {
            warnings.push('Error message should have code or message field');
          }
          break;
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Create a standard operation message
   */
  createOperationMessage(
    operation: CrdtOperation,
    senderId: string,
    messageId?: string
  ): RealtimeMessage {
    return {
      type: 'operation',
      data: { operation },
      timestamp: new Date(),
      senderId,
      messageId: messageId || `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }
  
  /**
   * Create a standard presence message
   */
  createPresenceMessage(
    presence: PresenceState,
    senderId: string,
    messageId?: string
  ): RealtimeMessage {
    return {
      type: 'presence',
      data: { presence },
      timestamp: new Date(),
      senderId,
      messageId: messageId || `presence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }
  
  /**
   * Create a sync message
   */
  createSyncMessage(
    data: {
      document?: any;
      operations?: CrdtOperation[];
      versionVector?: Map<string, number>;
    },
    senderId: string,
    messageId?: string
  ): RealtimeMessage {
    // Convert Map to object for JSON serialization
    const versionVectorObj = data.versionVector 
      ? Object.fromEntries(data.versionVector)
      : undefined;
    
    return {
      type: 'sync',
      data: {
        ...data,
        versionVector: versionVectorObj
      },
      timestamp: new Date(),
      senderId,
      messageId: messageId || `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }
  
  /**
   * Create an acknowledgment message
   */
  createAckMessage(
    originalMessageId: string,
    success: boolean,
    senderId: string,
    messageId?: string
  ): RealtimeMessage {
    return {
      type: 'ack',
      data: {
        originalMessageId,
        success,
        timestamp: Date.now()
      },
      timestamp: new Date(),
      senderId,
      messageId: messageId || `ack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }
  
  /**
   * Create an error message
   */
  createErrorMessage(
    code: string,
    message: string,
    originalMessageId?: string,
    senderId?: string,
    messageId?: string
  ): RealtimeMessage {
    return {
      type: 'error',
      data: {
        code,
        message,
        originalMessageId,
        timestamp: Date.now()
      },
      timestamp: new Date(),
      senderId: senderId || 'system',
      messageId: messageId || `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }
  
  /**
   * Get handler statistics
   */
  getStats(): {
    handlerCount: number;
    handlerTypes: string[];
    defaultHandler: boolean;
    config: MessageHandlerConfig;
  } {
    const handlerTypes: string[] = [];
    let totalHandlers = 0;
    
    for (const [type, handlers] of this.handlers.entries()) {
      handlerTypes.push(type);
      totalHandlers += handlers.length;
    }
    
    return {
      handlerCount: totalHandlers,
      handlerTypes,
      defaultHandler: !!this.defaultHandler,
      config: this.config
    };
  }
  
  /**
   * Clear all handlers
   */
  clearHandlers(): void {
    this.handlers.clear();
    this.defaultHandler = undefined;
    
    this.emit('handlers-cleared', {
      timestamp: new Date()
    });
  }
  
  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<MessageHandlerConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    };
    
    this.emit('config-updated', {
      config: this.config,
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
    this.clearHandlers();
    this.eventListeners.clear();
    
    this.emit('disposed', {
      timestamp: new Date()
    });
  }
}