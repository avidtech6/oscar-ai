/**
 * CRDT Module - Conflict-Free Replicated Data Types for collaborative editing
 * 
 * This module provides the core CRDT functionality for real-time collaboration,
 * including timestamp generation, operation transformation, document management,
 * and synchronization.
 */

// Export types
export type { 
  CrdtOperation, 
  CrdtTimestamp, 
  CrdtDocument 
} from '../types';

// Export timestamp utilities
export { 
  generateTimestamp,
  compareTimestamps,
  areTimestampsConcurrent,
  updateTimestamp,
  parseTimestamp,
  timestampToString,
  generateOperationId,
  TimestampUtils
} from './CrdtTimestamp';

// Export operation utilities
export {
  createInsertOperation,
  createDeleteOperation,
  createUpdateOperation,
  transformOperation,
  operationsConflict,
  applyOperationToString,
  validateOperation
} from './CrdtOperation';

// Export document utilities
export {
  createEmptyDocument,
  createDocumentFromContent,
  applyOperation,
  applyOperations,
  mergeDocuments,
  getMissingOperations,
  isDocumentUpToDate,
  getDocumentAtTimestamp,
  compressDocumentHistory,
  exportDocumentToJson,
  importDocumentFromJson,
  getDocumentStats
} from './CrdtDocument';

// Import main engine for re-export
import { CrdtEngine, type CrdtEngineConfig } from './CrdtEngine';

// Export main engine
export {
  CrdtEngine,
  type CrdtEngineConfig
};

/**
 * Create a new CRDT engine instance
 */
export function createCrdtEngine(config: {
  siteId: string;
  documentId: string;
  userName: string;
  maxOperationHistory?: number;
  enableCompression?: boolean;
  conflictDetectionEnabled?: boolean;
}): CrdtEngine {
  const fullConfig: CrdtEngineConfig = {
    maxOperationHistory: 1000,
    enableCompression: true,
    conflictDetectionEnabled: true,
    ...config
  };
  
  return new CrdtEngine(fullConfig);
}

/**
 * Example usage:
 * 
 * ```typescript
 * import { createCrdtEngine } from './crdt';
 * 
 * const engine = createCrdtEngine({
 *   siteId: 'user-123',
 *   documentId: 'doc-456',
 *   userName: 'Alice'
 * });
 * 
 * engine.insertText(0, 'Hello');
 * engine.insertText(5, ' World');
 * 
 * console.log(engine.getContent()); // 'Hello World'
 * ```
 */