/**
 * AI Reasoning Storage and Context Management - Phase 12.10
 * 
 * Exports for the Storage module components.
 */

export * from './ReasoningStorageService';
export { DEFAULT_STORAGE_CONFIG } from './ReasoningStorageService';
export type {
  ReasoningStorageConfiguration,
  StoredReasoningResult,
  ReasoningContext,
  StorageStatistics
} from './ReasoningStorageService';

// Note: Additional storage components will be exported here as they are implemented
// - StorageBackendAdapter
// - ContextManager
// - DataMigrator
// - etc.