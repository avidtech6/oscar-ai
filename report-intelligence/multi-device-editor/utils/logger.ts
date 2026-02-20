// Structured logging utilities for the multi-device editor
// Phase 18 - Logger Module v1.0

import type { EditorEvent, SyncError, Conflict } from '../types';

/**
 * Log levels for structured logging
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

/**
 * Log entry structure
 */
export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  source: string;
  context: Record<string, any>;
  error?: Error;
  event?: EditorEvent;
  deviceId?: string;
  documentId?: string;
  userId?: string;
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  maxBufferSize: number;
  flushInterval: number;
  includeTimestamps: boolean;
  includeStackTrace: boolean;
}

/**
 * Structured logger for the multi-device editor system
 */
export class StructuredLogger {
  private config: LoggerConfig;
  private buffer: LogEntry[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      minLevel: config.minLevel || 'info',
      enableConsole: config.enableConsole ?? true,
      enableRemote: config.enableRemote ?? false,
      remoteEndpoint: config.remoteEndpoint,
      maxBufferSize: config.maxBufferSize || 1000,
      flushInterval: config.flushInterval || 5000,
      includeTimestamps: config.includeTimestamps ?? true,
      includeStackTrace: config.includeStackTrace ?? true,
    };

    this.startFlushTimer();
  }

  /**
   * Log a debug message
   */
  debug(message: string, context: Record<string, any> = {}): void {
    this.log('debug', message, context);
  }

  /**
   * Log an info message
   */
  info(message: string, context: Record<string, any> = {}): void {
    this.log('info', message, context);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context: Record<string, any> = {}): void {
    this.log('warn', message, context);
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error, context: Record<string, any> = {}): void {
    this.log('error', message, { ...context, error });
  }

  /**
   * Log a critical error message
   */
  critical(message: string, error?: Error, context: Record<string, any> = {}): void {
    this.log('critical', message, { ...context, error });
  }

  /**
   * Log an editor event
   */
  logEvent(event: EditorEvent, context: Record<string, any> = {}): void {
    const level = this.getEventLogLevel(event.type);
    this.log(level, `Editor event: ${event.type}`, {
      ...context,
      event,
      source: event.source,
      timestamp: event.timestamp,
    });
  }

  /**
   * Log a synchronization error
   */
  logSyncError(error: SyncError, context: Record<string, any> = {}): void {
    this.error(`Sync error: ${error.code} - ${error.message}`, undefined, {
      ...context,
      error,
      operationId: error.operationId,
      retryable: error.retryable,
    });
  }

  /**
   * Log a conflict detection
   */
  logConflict(conflict: Conflict, context: Record<string, any> = {}): void {
    this.warn(`Conflict detected: ${conflict.type}`, {
      ...context,
      conflict,
      documentId: conflict.documentId,
      severity: conflict.severity,
      operationCount: conflict.operations.length,
    });
  }

  /**
   * Log device connection status
   */
  logDeviceConnection(deviceId: string, isOnline: boolean, networkQuality: string): void {
    this.info(`Device ${deviceId} ${isOnline ? 'connected' : 'disconnected'}`, {
      deviceId,
      isOnline,
      networkQuality,
      timestamp: new Date(),
    });
  }

  /**
   * Log synchronization status
   */
  logSyncStatus(
    documentId: string,
    status: string,
    pendingOperations: number,
    context: Record<string, any> = {}
  ): void {
    this.debug(`Sync status for ${documentId}: ${status}`, {
      ...context,
      documentId,
      status,
      pendingOperations,
      timestamp: new Date(),
    });
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context: Record<string, any> = {}): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      source: context.source || 'editor',
      context: this.sanitizeContext(context),
      error: context.error,
      event: context.event,
      deviceId: context.deviceId,
      documentId: context.documentId,
      userId: context.userId,
    };

    // Add to buffer
    this.buffer.push(entry);

    // Log to console if enabled
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Flush if buffer is full
    if (this.buffer.length >= this.config.maxBufferSize) {
      this.flush();
    }
  }

  /**
   * Log entry to console with appropriate formatting
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = this.config.includeTimestamps
      ? entry.timestamp.toISOString()
      : '';
    
    const prefix = `[${entry.level.toUpperCase()}]${timestamp ? ` ${timestamp}` : ''}`;
    const message = `${prefix}: ${entry.message}`;

    switch (entry.level) {
      case 'debug':
        console.debug(message, entry.context);
        break;
      case 'info':
        console.info(message, entry.context);
        break;
      case 'warn':
        console.warn(message, entry.context);
        break;
      case 'error':
      case 'critical':
        console.error(message, entry.context);
        if (entry.error && this.config.includeStackTrace) {
          console.error('Stack trace:', entry.error.stack);
        }
        break;
    }
  }

  /**
   * Determine if a log level should be logged based on configuration
   */
  private shouldLog(level: LogLevel): boolean {
    const levelPriority: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      critical: 4,
    };

    return levelPriority[level] >= levelPriority[this.config.minLevel];
  }

  /**
   * Get appropriate log level for an editor event type
   */
  private getEventLogLevel(eventType: string): LogLevel {
    const eventLevels: Record<string, LogLevel> = {
      'contentChanged': 'debug',
      'selectionChanged': 'debug',
      'operationApplied': 'info',
      'syncStarted': 'info',
      'syncCompleted': 'info',
      'syncFailed': 'error',
      'conflictDetected': 'warn',
      'conflictResolved': 'info',
      'deviceChanged': 'info',
      'networkChanged': 'info',
      'storageChanged': 'debug',
      'errorOccurred': 'error',
    };

    return eventLevels[eventType] || 'info';
  }

  /**
   * Sanitize context to remove circular references and sensitive data
   */
  private sanitizeContext(context: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(context)) {
      // Skip sensitive fields
      if (key.includes('password') || key.includes('token') || key.includes('secret')) {
        sanitized[key] = '[REDACTED]';
        continue;
      }

      // Handle different value types
      if (value === null || value === undefined) {
        sanitized[key] = value;
      } else if (value instanceof Error) {
        sanitized[key] = {
          name: value.name,
          message: value.message,
          stack: this.config.includeStackTrace ? value.stack : undefined,
        };
      } else if (value instanceof Date) {
        sanitized[key] = value.toISOString();
      } else if (typeof value === 'object') {
        // Prevent circular references by limiting depth
        try {
          sanitized[key] = JSON.parse(JSON.stringify(value));
        } catch {
          sanitized[key] = '[Circular or non-serializable object]';
        }
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Start the flush timer for remote logging
   */
  private startFlushTimer(): void {
    if (this.config.enableRemote && this.config.flushInterval > 0) {
      this.flushTimer = setInterval(() => {
        this.flush();
      }, this.config.flushInterval);
    }
  }

  /**
   * Flush logs to remote endpoint
   */
  async flush(): Promise<void> {
    if (!this.config.enableRemote || this.buffer.length === 0) {
      return;
    }

    const logsToFlush = [...this.buffer];
    this.buffer = [];

    try {
      if (this.config.remoteEndpoint) {
        await fetch(this.config.remoteEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            logs: logsToFlush,
            timestamp: new Date().toISOString(),
            source: 'multi-device-editor',
          }),
        });
      }
    } catch (error) {
      // If remote logging fails, put logs back in buffer (except the oldest ones if buffer is full)
      console.error('Failed to flush logs to remote endpoint:', error);
      this.buffer = [...logsToFlush, ...this.buffer].slice(0, this.config.maxBufferSize);
    }
  }

  /**
   * Get current buffer size
   */
  getBufferSize(): number {
    return this.buffer.length;
  }

  /**
   * Clear the log buffer
   */
  clearBuffer(): void {
    this.buffer = [];
  }

  /**
   * Update logger configuration
   */
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Restart flush timer if interval changed
    if (newConfig.flushInterval !== undefined && this.flushTimer) {
      clearInterval(this.flushTimer);
      this.startFlushTimer();
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // Flush any remaining logs
    this.flush().catch(console.error);
  }
}

// Default logger instance
export const defaultLogger = new StructuredLogger();

// Convenience functions using default logger
export const logger = {
  debug: (message: string, context?: Record<string, any>) => defaultLogger.debug(message, context),
  info: (message: string, context?: Record<string, any>) => defaultLogger.info(message, context),
  warn: (message: string, context?: Record<string, any>) => defaultLogger.warn(message, context),
  error: (message: string, error?: Error, context?: Record<string, any>) => defaultLogger.error(message, error, context),
  critical: (message: string, error?: Error, context?: Record<string, any>) => defaultLogger.critical(message, error, context),
  logEvent: (event: EditorEvent, context?: Record<string, any>) => defaultLogger.logEvent(event, context),
  logSyncError: (error: SyncError, context?: Record<string, any>) => defaultLogger.logSyncError(error, context),
  logConflict: (conflict: Conflict, context?: Record<string, any>) => defaultLogger.logConflict(conflict, context),
  logDeviceConnection: (deviceId: string, isOnline: boolean, networkQuality: string) => 
    defaultLogger.logDeviceConnection(deviceId, isOnline, networkQuality),
  logSyncStatus: (documentId: string, status: string, pendingOperations: number, context?: Record<string, any>) =>
    defaultLogger.logSyncStatus(documentId, status, pendingOperations, context),
  flush: () => defaultLogger.flush(),
  getBufferSize: () => defaultLogger.getBufferSize(),
  clearBuffer: () => defaultLogger.clearBuffer(),
  updateConfig: (config: Partial<LoggerConfig>) => defaultLogger.updateConfig(config),
  destroy: () => defaultLogger.destroy(),
};