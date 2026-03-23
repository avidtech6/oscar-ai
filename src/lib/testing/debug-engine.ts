/**
 * Debug Engine for Oscar AI Phase Compliance Package
 * 
 * This file implements the DebugEngine class for Phase 20: Full System Testing & Debugging.
 * It provides debugging and diagnostic capabilities.
 * 
 * File: src/lib/testing/debug-engine.ts
 * Generated as part of Oscar AI Phase Compliance Package implementation
 */

export interface DebugLog {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug';
  category: string;
  message: string;
  details?: any;
  stack?: string;
}

export interface DebugSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  logs: DebugLog[];
  errors: DebugLog[];
  warnings: DebugLog[];
  metrics: {
    totalLogs: number;
    totalErrors: number;
    totalWarnings: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

export interface DebugConfig {
  enableLogging: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  maxLogs: number;
  enableMetrics: boolean;
  enableTracing: boolean;
  sessionTimeout: number;
}

/**
 * Debug Engine for system diagnostics
 */
export class DebugEngine {
  private config: DebugConfig;
  private sessions: Map<string, DebugSession> = new Map();
  private activeSessionId: string | null = null;
  private logCallbacks: Array<(log: DebugLog) => void> = [];
  private errorCallbacks: Array<(error: DebugLog) => void> = [];
  private sessionCallbacks: Array<(session: DebugSession) => void> = [];
  
  /**
   * Initialize debug engine
   */
  constructor(config: Partial<DebugConfig> = {}) {
    this.config = {
      enableLogging: true,
      logLevel: 'info',
      maxLogs: 1000,
      enableMetrics: true,
      enableTracing: false,
      sessionTimeout: 3600000, // 1 hour
      ...config
    };
    
    this.startNewSession();
  }
  
  /**
   * Start a new debug session
   */
  startNewSession(): string {
    const sessionId = this.generateSessionId();
    const session: DebugSession = {
      id: sessionId,
      startTime: new Date(),
      logs: [],
      errors: [],
      warnings: [],
      metrics: {
        totalLogs: 0,
        totalErrors: 0,
        totalWarnings: 0,
        memoryUsage: 0,
        cpuUsage: 0
      }
    };
    
    this.sessions.set(sessionId, session);
    this.activeSessionId = sessionId;
    
    this.log('info', 'debug_engine', 'Debug session started', { sessionId });
    
    return sessionId;
  }
  
  /**
   * End current debug session
   */
  endCurrentSession(): void {
    if (!this.activeSessionId) return;
    
    const session = this.sessions.get(this.activeSessionId);
    if (session) {
      session.endTime = new Date();
      session.metrics.totalLogs = session.logs.length;
      session.metrics.totalErrors = session.errors.length;
      session.metrics.totalWarnings = session.warnings.length;
      
      this.notifySessionCallbacks(session);
      this.log('info', 'debug_engine', 'Debug session ended', { sessionId: this.activeSessionId });
    }
    
    this.activeSessionId = null;
  }
  
  /**
   * Log a message
   */
  log(level: 'error' | 'warn' | 'info' | 'debug', category: string, message: string, details?: any): void {
    if (!this.config.enableLogging) return;
    if (this.getLogLevelPriority(level) > this.getLogLevelPriority(this.config.logLevel)) return;
    
    const log: DebugLog = {
      id: this.generateLogId(),
      timestamp: new Date(),
      level,
      category,
      message,
      details
    };
    
    if (level === 'error' && log.stack) {
      log.stack = new Error().stack;
    }
    
    const session = this.getActiveSession();
    if (session) {
      session.logs.push(log);
      
      if (level === 'error') {
        session.errors.push(log);
      } else if (level === 'warn') {
        session.warnings.push(log);
      }
      
      // Trim logs if exceeding max limit
      if (session.logs.length > this.config.maxLogs) {
        session.logs = session.logs.slice(-this.config.maxLogs);
      }
      
      // Update metrics
      session.metrics.totalLogs = session.logs.length;
      session.metrics.totalErrors = session.errors.length;
      session.metrics.totalWarnings = session.warnings.length;
      
      if (this.config.enableMetrics) {
        this.updateSessionMetrics(session);
      }
    }
    
    this.notifyLogCallbacks(log);
    
    if (level === 'error') {
      this.notifyErrorCallbacks(log);
    }
  }
  
  /**
   * Log an error
   */
  error(category: string, message: string, details?: any): void {
    this.log('error', category, message, details);
  }
  
  /**
   * Log a warning
   */
  warn(category: string, message: string, details?: any): void {
    this.log('warn', category, message, details);
  }
  
  /**
   * Log info
   */
  info(category: string, message: string, details?: any): void {
    this.log('info', category, message, details);
  }
  
  /**
   * Log debug
   */
  debug(category: string, message: string, details?: any): void {
    this.log('debug', category, message, details);
  }
  
  /**
   * Get active session
   */
  getActiveSession(): DebugSession | undefined {
    if (!this.activeSessionId) return undefined;
    return this.sessions.get(this.activeSessionId);
  }
  
  /**
   * Get session by ID
   */
  getSession(sessionId: string): DebugSession | undefined {
    return this.sessions.get(sessionId);
  }
  /**
   * Get all sessions
   */
  getSessions(): DebugSession[] {
    return Array.from(this.sessions.values());
  }
  
  /**
   * Get logs for session
   */
  getLogs(sessionId: string): DebugLog[] {
    const session = this.sessions.get(sessionId);
    return session ? session.logs : [];
  }
  
  /**
   * Get errors for session
   */
  getErrors(sessionId: string): DebugLog[] {
    const session = this.sessions.get(sessionId);
    return session ? session.errors : [];
  }
  
  /**
   * Get warnings for session
   */
  getWarnings(sessionId: string): DebugLog[] {
    const session = this.sessions.get(sessionId);
    return session ? session.warnings : [];
  }
  
  /**
   * Get session metrics
   */
  getMetrics(sessionId: string): DebugSession['metrics'] | undefined {
    const session = this.sessions.get(sessionId);
    return session ? session.metrics : undefined;
  }
  
  /**
   * Clear session logs
   */
  clearSessionLogs(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.logs = [];
      session.errors = [];
      session.warnings = [];
      session.metrics.totalLogs = 0;
      session.metrics.totalErrors = 0;
      session.metrics.totalWarnings = 0;
    }
  }
  
  /**
   * Clear all sessions
   */
  clearAllSessions(): void {
    this.sessions.clear();
    this.activeSessionId = null;
  }
  
  /**
   * Add log callback
   */
  onLog(callback: (log: DebugLog) => void): void {
    this.logCallbacks.push(callback);
  }
  
  /**
   * Add error callback
   */
  onError(callback: (error: DebugLog) => void): void {
    this.errorCallbacks.push(callback);
  }
  
  /**
   * Add session callback
   */
  onSession(callback: (session: DebugSession) => void): void {
    this.sessionCallbacks.push(callback);
  }
  
  /**
   * Remove log callback
   */
  removeLogCallback(callback: (log: DebugLog) => void): void {
    const index = this.logCallbacks.indexOf(callback);
    if (index > -1) {
      this.logCallbacks.splice(index, 1);
    }
  }
  
  /**
   * Remove error callback
   */
  removeErrorCallback(callback: (error: DebugLog) => void): void {
    const index = this.errorCallbacks.indexOf(callback);
    if (index > -1) {
      this.errorCallbacks.splice(index, 1);
    }
  }
  
  /**
   * Remove session callback
   */
  removeSessionCallback(callback: (session: DebugSession) => void): void {
    const index = this.sessionCallbacks.indexOf(callback);
    if (index > -1) {
      this.sessionCallbacks.splice(index, 1);
    }
  }
  
  /**
   * Update session metrics
   */
  private updateSessionMetrics(session: DebugSession): void {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      session.metrics.memoryUsage = process.memoryUsage().heapUsed;
    }
    
    if (typeof process !== 'undefined' && process.cpuUsage) {
      session.metrics.cpuUsage = process.cpuUsage().system;
    }
  }
  
  /**
   * Get log level priority
   */
  private getLogLevelPriority(level: 'error' | 'warn' | 'info' | 'debug'): number {
    const priorities = { error: 4, warn: 3, info: 2, debug: 1 };
    return priorities[level];
  }
  
  /**
   * Notify log callbacks
   */
  private notifyLogCallbacks(log: DebugLog): void {
    this.logCallbacks.forEach(callback => {
      try {
        callback(log);
      } catch (error) {
        console.error('Error in log callback:', error);
      }
    });
  }
  
  /**
   * Notify error callbacks
   */
  private notifyErrorCallbacks(error: DebugLog): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (error) {
        console.error('Error in error callback:', error);
      }
    });
  }
  
  /**
   * Notify session callbacks
   */
  private notifySessionCallbacks(session: DebugSession): void {
    this.sessionCallbacks.forEach(callback => {
      try {
        callback(session);
      } catch (error) {
        console.error('Error in session callback:', error);
      }
    });
  }
  
  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Generate unique log ID
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}