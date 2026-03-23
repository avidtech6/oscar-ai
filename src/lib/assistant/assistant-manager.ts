/**
 * Global Assistant Intelligence Layer - PHASE 21
 * Assistant Manager for coordinating multiple assistant instances and managing system-wide assistant operations
 */

import { AssistantEngine } from './assistant-engine';
import type { AssistantConfig, AssistantOptions, AssistantInitResult, AssistantEvent, AssistantEventListener } from './assistant-types';
import { AssistantEventType } from './assistant-types';

/**
 * Assistant manager configuration
 */
export interface AssistantManagerConfig {
  defaultConfig: AssistantConfig;
  maxConcurrentSessions: number;
  sessionTimeout: number;
  enableMetrics: boolean;
  enableLogging: boolean;
}

/**
 * Assistant session information
 */
export interface AssistantSessionInfo {
  sessionId: string;
  userId?: string;
  engine: AssistantEngine;
  createdAt: Date;
  lastActivity: Date;
  messageCount: number;
  isActive: boolean;
}

/**
 * Assistant manager statistics
 */
export interface AssistantManagerStats {
  totalSessions: number;
  activeSessions: number;
  totalMessages: number;
  averageResponseTime: number;
  errorRate: number;
  memoryUsage: number;
  startTime: Date;
  uptime: number;
}

/**
 * Assistant Manager - Central coordinator for assistant operations
 */
export class AssistantManager {
  private config: AssistantManagerConfig;
  private activeSessions: Map<string, AssistantSessionInfo> = new Map();
  private eventListeners: AssistantEventListener[] = [];
  private stats: AssistantManagerStats;
  private intervalId?: NodeJS.Timeout;

  constructor(config: AssistantManagerConfig) {
    this.config = config;
    this.stats = {
      totalSessions: 0,
      activeSessions: 0,
      totalMessages: 0,
      averageResponseTime: 0,
      errorRate: 0,
      memoryUsage: 0,
      startTime: new Date(),
      uptime: 0
    };
    this.startCleanupInterval();
  }

  /**
   * Create a new assistant session
   */
  async createSession(userId?: string, options?: Partial<AssistantConfig>): Promise<AssistantInitResult> {
    try {
      // Check if we can create a new session
      if (this.activeSessions.size >= this.config.maxConcurrentSessions) {
        return {
          success: false,
          error: {
            type: 'SESSION_NOT_FOUND' as any,
            message: 'Maximum concurrent sessions reached',
            timestamp: new Date()
          }
        };
      }

      // Create assistant config
      const assistantConfig: AssistantConfig = {
        ...this.config.defaultConfig,
        ...options
      };

      // Create assistant engine
      const engine = new AssistantEngine(assistantConfig);

      // Start session
      const sessionId = await engine.startSession(userId);

      // Store session info
      const sessionInfo: AssistantSessionInfo = {
        sessionId,
        userId,
        engine,
        createdAt: new Date(),
        lastActivity: new Date(),
        messageCount: 0,
        isActive: true
      };

      this.activeSessions.set(sessionId, sessionInfo);
      this.stats.totalSessions++;
      this.stats.activeSessions++;

      // Emit session started event
      this.emitEvent({
        type: AssistantEventType.SESSION_STARTED,
        timestamp: new Date(),
        sessionId,
        userId,
        data: { config: assistantConfig }
      });

      return {
        success: true,
        sessionId
      };
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'SESSION_NOT_FOUND' as any,
          message: 'Failed to create session',
          timestamp: new Date(),
          details: { error }
        }
      };
    }
  }

  /**
   * Process user input through a session
   */
  async processInput(sessionId: string, userInput: string): Promise<any> {
    const session = this.activeSessions.get(sessionId);
    if (!session || !session.isActive) {
      throw new Error(`Session ${sessionId} not found or inactive`);
    }

    try {
      const startTime = Date.now();
      const response = await session.engine.processInput(sessionId, userInput);
      const responseTime = Date.now() - startTime;

      // Update session stats
      session.lastActivity = new Date();
      session.messageCount++;
      this.stats.totalMessages++;
      this.stats.averageResponseTime = 
        (this.stats.averageResponseTime * (this.stats.totalMessages - 1) + responseTime) / this.stats.totalMessages;

      // Emit message received and response generated events
      this.emitEvent({
        type: AssistantEventType.MESSAGE_RECEIVED,
        timestamp: new Date(),
        sessionId,
        userId: session.userId,
        data: { userInput }
      });

      this.emitEvent({
        type: AssistantEventType.RESPONSE_GENERATED,
        timestamp: new Date(),
        sessionId,
        userId: session.userId,
        data: { response, responseTime }
      });

      return response;
    } catch (error) {
      // Emit error event
      this.emitEvent({
        type: AssistantEventType.ERROR_OCCURRED,
        timestamp: new Date(),
        sessionId,
        userId: session.userId,
        data: { error }
      });

      throw error;
    }
  }

  /**
   * End a session
   */
  async endSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      session.engine.endSession(sessionId);
      session.isActive = false;
      this.activeSessions.delete(sessionId);
      this.stats.activeSessions--;

      // Emit session ended event
      this.emitEvent({
        type: AssistantEventType.SESSION_ENDED,
        timestamp: new Date(),
        sessionId,
        userId: session.userId,
        data: { finalMessageCount: session.messageCount }
      });
    } catch (error) {
      // Emit error event
      this.emitEvent({
        type: AssistantEventType.ERROR_OCCURRED,
        timestamp: new Date(),
        sessionId,
        userId: session.userId,
        data: { error }
      });

      throw error;
    }
  }

  /**
   * Get session information
   */
  getSession(sessionId: string): AssistantSessionInfo | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): AssistantSessionInfo[] {
    return Array.from(this.activeSessions.values()).filter(session => session.isActive);
  }

  /**
   * Get user sessions
   */
  getUserSessions(userId: string): AssistantSessionInfo[] {
    return Array.from(this.activeSessions.values()).filter(session => 
      session.userId === userId && session.isActive
    );
  }

  /**
   * Add event listener
   */
  addEventListener(listener: AssistantEventListener): void {
    this.eventListeners.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: AssistantEventListener): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * Emit event to all listeners
   */
  private emitEvent(event: AssistantEvent): void {
    if (this.config.enableLogging) {
      console.log(`[AssistantManager] ${event.type} - ${event.timestamp.toISOString()}`, event);
    }

    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('[AssistantManager] Event listener error:', error);
      }
    });
  }

  /**
   * Start cleanup interval for inactive sessions
   */
  private startCleanupInterval(): void {
    this.intervalId = setInterval(() => {
      this.cleanupInactiveSessions();
    }, this.config.sessionTimeout);
  }

  /**
   * Clean up inactive sessions
   */
  private cleanupInactiveSessions(): void {
    const now = new Date();
    const sessionsToCleanup: string[] = [];

    this.activeSessions.forEach((session, sessionId) => {
      const timeSinceActivity = now.getTime() - session.lastActivity.getTime();
      if (timeSinceActivity > this.config.sessionTimeout) {
        sessionsToCleanup.push(sessionId);
      }
    });

    sessionsToCleanup.forEach(sessionId => {
      this.endSession(sessionId).catch(error => {
        console.error(`[AssistantManager] Failed to cleanup session ${sessionId}:`, error);
      });
    });
  }

  /**
   * Get manager statistics
   */
  getStats(): AssistantManagerStats {
    this.stats.uptime = Date.now() - this.stats.startTime.getTime();
    return { ...this.stats };
  }

  /**
   * Get memory usage
   */
  getMemoryUsage(): number {
    let totalMemory = 0;
    
    // Calculate memory for active sessions
    this.activeSessions.forEach(session => {
      totalMemory += this.estimateObjectSize(session.engine);
    });

    // Calculate memory for event listeners
    totalMemory += this.estimateObjectSize(this.eventListeners);

    this.stats.memoryUsage = totalMemory;
    return totalMemory;
  }

  /**
   * Estimate object size in bytes
   */
  private estimateObjectSize(obj: any): number {
    return JSON.stringify(obj).length * 2; // Rough estimate
  }

  /**
   * Shutdown the manager
   */
  async shutdown(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // End all active sessions
    const activeSessionIds = Array.from(this.activeSessions.keys());
    for (const sessionId of activeSessionIds) {
      try {
        await this.endSession(sessionId);
      } catch (error) {
        console.error(`[AssistantManager] Failed to end session ${sessionId} during shutdown:`, error);
      }
    }

    // Clear event listeners
    this.eventListeners = [];
  }
}