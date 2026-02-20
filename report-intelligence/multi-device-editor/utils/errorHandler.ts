// Error handling and recovery utilities for the multi-device editor
// Phase 18 - Error Handler Module v1.0

import type { SyncError, SyncErrorCode, Result, AsyncResult } from '../types';
import { logger } from './logger';

/**
 * Error categories for the multi-device editor system
 */
export type ErrorCategory = 
  | 'network'
  | 'authentication'
  | 'synchronization'
  | 'conflict'
  | 'storage'
  | 'device'
  | 'validation'
  | 'unknown';

/**
 * Extended error interface with additional context
 */
export interface ExtendedError extends Error {
  category: ErrorCategory;
  code: string;
  retryable: boolean;
  context: Record<string, any>;
  timestamp: Date;
  originalError?: Error;
}

/**
 * Error handler configuration
 */
export interface ErrorHandlerConfig {
  maxRetries: number;
  retryDelay: number;
  exponentialBackoff: boolean;
  maxRetryDelay: number;
  logErrors: boolean;
  notifyUser: boolean;
  autoRecover: boolean;
  recoveryStrategies: RecoveryStrategy[];
}

/**
 * Recovery strategy for different error types
 */
export interface RecoveryStrategy {
  errorPattern: RegExp | string;
  category: ErrorCategory;
  action: 'retry' | 'fallback' | 'ignore' | 'notify' | 'recover';
  maxAttempts: number;
  fallbackAction?: () => Promise<void>;
  recoveryAction?: () => Promise<void>;
}

/**
 * Error handler for the multi-device editor system
 */
export class ErrorHandler {
  private config: ErrorHandlerConfig;
  private retryCounts: Map<string, number> = new Map();
  private recoveryStrategies: Map<ErrorCategory, RecoveryStrategy[]> = new Map();

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      exponentialBackoff: config.exponentialBackoff ?? true,
      maxRetryDelay: config.maxRetryDelay || 30000,
      logErrors: config.logErrors ?? true,
      notifyUser: config.notifyUser ?? true,
      autoRecover: config.autoRecover ?? true,
      recoveryStrategies: config.recoveryStrategies || this.getDefaultRecoveryStrategies(),
    };

    this.initializeRecoveryStrategies();
  }

  /**
   * Handle an error with appropriate recovery actions
   */
  async handleError(error: Error | ExtendedError | SyncError, context: Record<string, any> = {}): Promise<Result<void, ExtendedError>> {
    const extendedError = this.extendError(error, context);
    
    // Log the error
    if (this.config.logErrors) {
      this.logError(extendedError);
    }

    // Check if error should be retried
    if (extendedError.retryable) {
      const shouldRetry = await this.handleRetry(extendedError);
      if (shouldRetry) {
        return { success: true, data: undefined };
      }
    }

    // Apply recovery strategy
    const recoveryResult = await this.applyRecoveryStrategy(extendedError);
    if (recoveryResult.success) {
      return { success: true, data: undefined };
    }

    // Notify user if configured
    if (this.config.notifyUser) {
      this.notifyUser(extendedError);
    }

    return { success: false, error: extendedError };
  }

  /**
   * Handle a synchronization error specifically
   */
  async handleSyncError(error: SyncError, context: Record<string, any> = {}): Promise<Result<void, ExtendedError>> {
    const extendedError: ExtendedError = {
      name: 'SyncError',
      message: `Synchronization error: ${error.code} - ${error.message}`,
      category: 'synchronization',
      code: error.code,
      retryable: error.retryable,
      context: { ...context, ...(error.details || {}) },
      timestamp: error.timestamp,
      stack: new Error().stack,
    };

    return this.handleError(extendedError, context);
  }

  /**
   * Wrap an async function with error handling
   */
  async withErrorHandling<T>(
    fn: () => Promise<T>,
    context: Record<string, any> = {}
  ): AsyncResult<T, ExtendedError> {
    try {
      const result = await fn();
      return { success: true, data: result };
    } catch (error) {
      const handled = await this.handleError(error as Error, context);
      if (handled.success) {
        // Retry the function if error was handled successfully
        return this.withErrorHandling(fn, { ...context, retry: true });
      }
      return { success: false, error: handled.error! };
    }
  }

  /**
   * Create a retry wrapper for async functions
   */
  createRetryWrapper<T>(
    fn: () => Promise<T>,
    options: {
      maxRetries?: number;
      retryDelay?: number;
      shouldRetry?: (error: Error) => boolean;
    } = {}
  ): () => Promise<T> {
    const maxRetries = options.maxRetries || this.config.maxRetries;
    const retryDelay = options.retryDelay || this.config.retryDelay;
    const shouldRetry = options.shouldRetry || ((error: Error) => true);

    return async (): Promise<T> => {
      let lastError: Error;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await fn();
        } catch (error) {
          lastError = error as Error;

          if (attempt === maxRetries || !shouldRetry(lastError)) {
            throw lastError;
          }

          // Calculate delay with exponential backoff
          const delay = this.calculateRetryDelay(attempt, retryDelay);
          
          logger.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`, {
            error: lastError.message,
            attempt: attempt + 1,
            maxRetries,
            delay,
          });

          await this.sleep(delay);
        }
      }

      throw lastError!;
    };
  }

  /**
   * Extend a basic error with additional context
   */
  private extendError(error: Error | ExtendedError | SyncError, context: Record<string, any>): ExtendedError {
    if (this.isExtendedError(error)) {
      return {
        ...error,
        context: { ...error.context, ...context },
        timestamp: error.timestamp || new Date(),
      };
    }

    if (this.isSyncError(error)) {
      return {
        name: 'SyncError',
        message: `Synchronization error: ${error.code} - ${error.message}`,
        category: 'synchronization',
        code: error.code,
        retryable: error.retryable,
        context: { ...context, ...(error.details || {}) },
        timestamp: error.timestamp,
        stack: new Error().stack,
        originalError: new Error(error.message),
      };
    }

    // Determine error category
    const category = this.categorizeError(error);
    const retryable = this.isRetryableError(error, category);

    return {
      name: error.name || 'UnknownError',
      message: error.message,
      category,
      code: this.extractErrorCode(error),
      retryable,
      context,
      timestamp: new Date(),
      stack: error.stack,
      originalError: error,
    };
  }

  /**
   * Categorize an error based on its properties
   */
  private categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    // Network errors
    if (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('offline') ||
      message.includes('connection') ||
      name.includes('network')
    ) {
      return 'network';
    }

    // Authentication errors
    if (
      message.includes('auth') ||
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('token') ||
      name.includes('auth')
    ) {
      return 'authentication';
    }

    // Synchronization errors
    if (
      message.includes('sync') ||
      message.includes('conflict') ||
      message.includes('version') ||
      name.includes('sync')
    ) {
      return 'synchronization';
    }

    // Storage errors
    if (
      message.includes('storage') ||
      message.includes('database') ||
      message.includes('quota') ||
      message.includes('full') ||
      name.includes('storage')
    ) {
      return 'storage';
    }

    // Device errors
    if (
      message.includes('device') ||
      message.includes('capability') ||
      message.includes('memory') ||
      name.includes('device')
    ) {
      return 'device';
    }

    // Validation errors
    if (
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('type') ||
      name.includes('validation')
    ) {
      return 'validation';
    }

    return 'unknown';
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: Error, category: ErrorCategory): boolean {
    const message = error.message.toLowerCase();

    // Non-retryable errors
    if (
      message.includes('permission') ||
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('invalid') ||
      message.includes('syntax')
    ) {
      return false;
    }

    // Retryable errors
    if (
      category === 'network' ||
      message.includes('timeout') ||
      message.includes('busy') ||
      message.includes('temporary') ||
      message.includes('retry')
    ) {
      return true;
    }

    return false;
  }

  /**
   * Extract error code from error object
   */
  private extractErrorCode(error: Error): string {
    if ('code' in error && typeof (error as any).code === 'string') {
      return (error as any).code;
    }

    // Extract code from common error patterns
    const message = error.message;
    const codeMatch = message.match(/\[([A-Z_]+)\]/);
    if (codeMatch) {
      return codeMatch[1];
    }

    return 'UNKNOWN_ERROR';
  }

  /**
   * Log an error with appropriate level
   */
  private logError(error: ExtendedError): void {
    const logContext = {
      category: error.category,
      code: error.code,
      retryable: error.retryable,
      context: error.context,
      stack: error.stack,
    };

    // Check if error is severe (non-retryable errors are more severe)
    if (!error.retryable) {
      logger.error(error.message, error.originalError, logContext);
    } else if (error.category === 'synchronization' || error.category === 'network') {
      logger.warn(error.message, logContext);
    } else {
      logger.info(error.message, logContext);
    }
  }

  /**
   * Handle retry logic for retryable errors
   */
  private async handleRetry(error: ExtendedError): Promise<boolean> {
    const errorKey = `${error.category}:${error.code}`;
    const currentRetryCount = this.retryCounts.get(errorKey) || 0;

    if (currentRetryCount >= this.config.maxRetries) {
      logger.warn(`Max retries exceeded for error: ${error.code}`, {
        errorKey,
        currentRetryCount,
        maxRetries: this.config.maxRetries,
      });
      return false;
    }

    // Calculate retry delay
    const delay = this.calculateRetryDelay(currentRetryCount, this.config.retryDelay);
    
    logger.info(`Retrying error (${currentRetryCount + 1}/${this.config.maxRetries}) after ${delay}ms`, {
      errorKey,
      currentRetryCount: currentRetryCount + 1,
      maxRetries: this.config.maxRetries,
      delay,
      error: error.message,
    });

    // Update retry count
    this.retryCounts.set(errorKey, currentRetryCount + 1);

    // Wait before retry
    await this.sleep(delay);

    return true;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number, baseDelay: number): number {
    if (!this.config.exponentialBackoff) {
      return baseDelay;
    }

    const delay = baseDelay * Math.pow(2, attempt);
    return Math.min(delay, this.config.maxRetryDelay);
  }

  /**
   * Apply recovery strategy for an error
   */
  private async applyRecoveryStrategy(error: ExtendedError): Promise<Result<void, ExtendedError>> {
    if (!this.config.autoRecover) {
      return { success: false, error };
    }

    const strategies = this.recoveryStrategies.get(error.category) || [];
    
    for (const strategy of strategies) {
      const matches = typeof strategy.errorPattern === 'string'
        ? error.message.includes(strategy.errorPattern)
        : strategy.errorPattern.test(error.message);

      if (matches) {
        logger.info(`Applying recovery strategy: ${strategy.action}`, {
          errorCategory: error.category,
          errorCode: error.code,
          strategy: strategy.action,
        });

        try {
          switch (strategy.action) {
            case 'retry':
              // Already handled in handleRetry
              break;
            case 'fallback':
              if (strategy.fallbackAction) {
                await strategy.fallbackAction();
              }
              break;
            case 'recover':
              if (strategy.recoveryAction) {
                await strategy.recoveryAction();
              }
              break;
            case 'ignore':
              // Do nothing
              break;
            case 'notify':
              this.notifyUser(error);
              break;
          }

          return { success: true, data: undefined };
        } catch (recoveryError) {
          logger.error('Recovery strategy failed', recoveryError as Error, {
            strategy: strategy.action,
            error: error.message,
          });
        }
      }
    }

    return { success: false, error };
  }

  /**
   * Notify user about an error
   */
  private notifyUser(error: ExtendedError): void {
    // In a real implementation, this would show a user-friendly notification
    // For now, we'll just log it
    logger.warn(`User notification: ${error.message}`, {
      category: error.category,
      code: error.code,
      userFriendly: this.getUserFriendlyMessage(error),
    });
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(error: ExtendedError): string {
    switch (error.category) {
      case 'network':
        return 'Network connection issue. Please check your internet connection.';
      case 'authentication':
        return 'Authentication error. Please sign in again.';
      case 'synchronization':
        return 'Synchronization issue. Your changes are saved locally and will sync when possible.';
      case 'conflict':
        return 'Edit conflict detected. The system will attempt to merge changes automatically.';
      case 'storage':
        return 'Storage issue. Please free up some space and try again.';
      case 'device':
        return 'Device capability issue. Some features may be limited.';
      case 'validation':
        return 'Validation error. Please check your input and try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Initialize recovery strategies
   */
  private initializeRecoveryStrategies(): void {
    for (const strategy of this.config.recoveryStrategies) {
      const strategies = this.recoveryStrategies.get(strategy.category) || [];
      strategies.push(strategy);
      this.recoveryStrategies.set(strategy.category, strategies);
    }
  }

  /**
   * Get default recovery strategies
   */
  private getDefaultRecoveryStrategies(): RecoveryStrategy[] {
    return [
      {
        errorPattern: /network|timeout|offline/,
        category: 'network',
        action: 'retry',
        maxAttempts: 3,
      },
      {
        errorPattern: /quota|storage full/,
        category: 'storage',
        action: 'notify',
        maxAttempts: 1,
      },
      {
        errorPattern: /conflict/,
        category: 'synchronization',
        action: 'recover',
        maxAttempts: 1,
      },
      {
        errorPattern: /unauthorized|forbidden/,
        category: 'authentication',
        action: 'notify',
        maxAttempts: 1,
      },
    ];
  }

  /**
   * Type guard for ExtendedError
   */
  private isExtendedError(error: any): error is ExtendedError {
    return error && typeof error === 'object' && 'category' in error;
  }

  /**
   * Type guard for SyncError
   */
  private isSyncError(error: any): error is SyncError {
    return error && typeof error === 'object' && 'code' in error && 'retryable' in error;
  }

  /**
   * Sleep utility function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Reset retry counts for a specific error or all errors
   */
  resetRetryCounts(errorKey?: string): void {
    if (errorKey) {
      this.retryCounts.delete(errorKey);
    } else {
      this.retryCounts.clear();
    }
  }

  /**
   * Get current retry count for an error
   */
  getRetryCount(errorKey: string): number {
    return this.retryCounts.get(errorKey) || 0;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.recoveryStrategies) {
      this.recoveryStrategies.clear();
      this.initializeRecoveryStrategies();
    }
  }
}

// Default error handler instance
export const defaultErrorHandler = new ErrorHandler();

// Convenience functions using default error handler
export const errorHandler = {
  handleError: (error: Error | ExtendedError | SyncError, context?: Record<string, any>) =>
    defaultErrorHandler.handleError(error, context),
  handleSyncError: (error: SyncError, context?: Record<string, any>) =>
    defaultErrorHandler.handleSyncError(error, context),
  withErrorHandling: <T>(fn: () => Promise<T>, context?: Record<string, any>) =>
    defaultErrorHandler.withErrorHandling(fn, context),
  createRetryWrapper: <T>(
    fn: () => Promise<T>,
    options?: {
      maxRetries?: number;
      retryDelay?: number;
      shouldRetry?: (error: Error) => boolean;
    }
  ) => defaultErrorHandler.createRetryWrapper(fn, options),
  resetRetryCounts: (errorKey?: string) => defaultErrorHandler.resetRetryCounts(errorKey),
  getRetryCount: (errorKey: string) => defaultErrorHandler.getRetryCount(errorKey),
  updateConfig: (newConfig: Partial<ErrorHandlerConfig>) => defaultErrorHandler.updateConfig(newConfig),
};