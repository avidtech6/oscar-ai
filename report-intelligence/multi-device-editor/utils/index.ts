// Utility module exports for the multi-device editor
// Phase 18 - Utils Module v1.0

// Export logger module
export * from './logger';
export { 
  StructuredLogger, 
  type LogLevel, 
  type LogEntry, 
  type LoggerConfig,
  defaultLogger,
  logger 
} from './logger';

// Export error handler module
export * from './errorHandler';
export { 
  ErrorHandler, 
  type ErrorCategory, 
  type ExtendedError, 
  type ErrorHandlerConfig,
  type RecoveryStrategy,
  defaultErrorHandler,
  errorHandler 
} from './errorHandler';

// Export helpers module
export * from './helpers';
export {
  generateId,
  generateDeviceId,
  deepClone,
  deepMerge,
  isPlainObject,
  debounce,
  throttle,
  getScreenSizeCategory,
  detectNetworkType,
  supportsStorageBackend,
  formatFileSize,
  calculateDocumentSize,
  validateOperation,
  operationsEqual,
  calculateOperationHash,
  sleep,
  retryWithBackoff,
  createDeferred,
  measureExecutionTime,
  generateDeviceColor,
  arraysEqual,
  unique,
  groupBy,
  memoize,
  isBrowser,
  isNode,
  getTimestamp,
  formatTimestamp,
  parseTimestamp,
} from './helpers';