/**
 * CRDT Document representation and management
 * 
 * This module manages the state of a collaborative document,
 * including operation history, version vectors, and content.
 */

import type { CrdtDocument, CrdtOperation, CrdtTimestamp } from '../types';
import { compareTimestamps, TimestampUtils } from './CrdtTimestamp';
import { transformOperation, applyOperationToString, validateOperation } from './CrdtOperation';

/**
 * Create a new empty CRDT document
 */
export function createEmptyDocument(
  documentId: string,
  siteId: string,
  createdBy: string
): CrdtDocument {
  const now = new Date();
  const versionVector = new Map<string, number>();
  versionVector.set(siteId, 0);
  
  return {
    id: documentId,
    content: '',
    operations: [],
    versionVector,
    metadata: {
      createdAt: now,
      updatedAt: now,
      createdBy,
      lastModifiedBy: createdBy
    }
  };
}

/**
 * Create a document from existing content
 */
export function createDocumentFromContent(
  documentId: string,
  content: string,
  siteId: string,
  createdBy: string
): CrdtDocument {
  const now = new Date();
  const versionVector = new Map<string, number>();
  versionVector.set(siteId, 0);
  
  return {
    id: documentId,
    content,
    operations: [],
    versionVector,
    metadata: {
      createdAt: now,
      updatedAt: now,
      createdBy,
      lastModifiedBy: createdBy
    }
  };
}

/**
 * Apply an operation to a document
 * Returns a new document with the operation applied
 */
export function applyOperation(
  document: CrdtDocument,
  operation: CrdtOperation
): CrdtDocument {
  // Validate the operation
  const errors = validateOperation(operation);
  if (errors.length > 0) {
    throw new Error(`Invalid operation: ${errors.join(', ')}`);
  }
  
  // Check if operation is already applied
  if (document.operations.some(op => op.id === operation.id)) {
    return document; // Operation already applied
  }
  
  // Transform the operation against all previously applied operations
  let transformedOperation = operation;
  for (const appliedOp of document.operations) {
    transformedOperation = transformOperation(transformedOperation, appliedOp);
  }
  
  // Apply the transformed operation to content
  const newContent = applyOperationToString(document.content, transformedOperation);
  
  // Update version vector
  const newVersionVector = new Map(document.versionVector);
  const currentCounter = newVersionVector.get(operation.siteId) || 0;
  if (operation.timestamp.counter > currentCounter) {
    newVersionVector.set(operation.siteId, operation.timestamp.counter);
  }
  
  // Add operation to history
  const newOperations = [...document.operations, transformedOperation];
  
  // Sort operations by timestamp (for consistency)
  newOperations.sort((a, b) => {
    const comparison = compareTimestamps(a.timestamp, b.timestamp);
    if (comparison === -1) return -1;
    if (comparison === 1) return 1;
    return a.siteId.localeCompare(b.siteId);
  });
  
  return {
    ...document,
    content: newContent,
    operations: newOperations,
    versionVector: newVersionVector,
    metadata: {
      ...document.metadata,
      updatedAt: new Date(),
      lastModifiedBy: operation.siteId
    }
  };
}

/**
 * Apply multiple operations to a document
 */
export function applyOperations(
  document: CrdtDocument,
  operations: CrdtOperation[]
): CrdtDocument {
  let result = document;
  for (const operation of operations) {
    result = applyOperation(result, operation);
  }
  return result;
}

/**
 * Merge two documents (for synchronization)
 * Returns a new document that incorporates all operations from both documents
 */
export function mergeDocuments(
  document1: CrdtDocument,
  document2: CrdtDocument
): CrdtDocument {
  if (document1.id !== document2.id) {
    throw new Error('Cannot merge documents with different IDs');
  }
  
  // Start with document1
  let merged = { ...document1 };
  
  // Find operations in document2 that aren't in document1
  const document1OperationIds = new Set(document1.operations.map(op => op.id));
  const newOperations = document2.operations.filter(op => !document1OperationIds.has(op.id));
  
  // Apply new operations
  merged = applyOperations(merged, newOperations);
  
  // Merge version vectors
  merged.versionVector = TimestampUtils.mergeVersionVectors(
    document1.versionVector,
    document2.versionVector
  );
  
  // Update metadata
  const now = new Date();
  merged.metadata = {
    ...merged.metadata,
    updatedAt: now,
    lastModifiedBy: document2.metadata.lastModifiedBy
  };
  
  return merged;
}

/**
 * Get operations that are missing from a document (for synchronization)
 */
export function getMissingOperations(
  document: CrdtDocument,
  remoteVersionVector: Map<string, number>
): CrdtOperation[] {
  const missingOperations: CrdtOperation[] = [];
  
  for (const operation of document.operations) {
    const remoteCounter = remoteVersionVector.get(operation.siteId) || 0;
    if (operation.timestamp.counter > remoteCounter) {
      missingOperations.push(operation);
    }
  }
  
  return missingOperations;
}

/**
 * Check if a document has all operations up to a certain version vector
 */
export function isDocumentUpToDate(
  document: CrdtDocument,
  targetVersionVector: Map<string, number>
): boolean {
  for (const [siteId, counter] of targetVersionVector) {
    const documentCounter = document.versionVector.get(siteId) || 0;
    if (documentCounter < counter) {
      return false;
    }
  }
  return true;
}

/**
 * Get the document state at a specific point in time (for undo/redo)
 */
export function getDocumentAtTimestamp(
  document: CrdtDocument,
  targetTimestamp: CrdtTimestamp
): CrdtDocument {
  // Filter operations that happened before or at the target timestamp
  const filteredOperations = document.operations.filter(op => {
    const comparison = compareTimestamps(op.timestamp, targetTimestamp);
    return comparison === -1 || comparison === 0;
  });
  
  // Reapply operations to reconstruct document state
  const emptyDoc = createEmptyDocument(
    document.id,
    targetTimestamp.siteId,
    document.metadata.createdBy
  );
  
  return applyOperations(emptyDoc, filteredOperations);
}

/**
 * Compress operation history (remove redundant operations)
 * This helps reduce memory usage for long editing sessions
 */
export function compressDocumentHistory(
  document: CrdtDocument,
  maxOperations: number = 1000
): CrdtDocument {
  if (document.operations.length <= maxOperations) {
    return document;
  }
  
  // Keep the most recent operations
  const recentOperations = document.operations.slice(-maxOperations);
  
  // Recreate document with only recent operations
  const compressedDoc = createEmptyDocument(
    document.id,
    Array.from(document.versionVector.keys())[0] || 'system',
    document.metadata.createdBy
  );
  
  return applyOperations(compressedDoc, recentOperations);
}

/**
 * Export document to JSON for storage/transmission
 */
export function exportDocumentToJson(document: CrdtDocument): string {
  const exportData = {
    ...document,
    versionVector: Array.from(document.versionVector.entries()),
    metadata: {
      ...document.metadata,
      createdAt: document.metadata.createdAt.toISOString(),
      updatedAt: document.metadata.updatedAt.toISOString()
    }
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Import document from JSON
 */
export function importDocumentFromJson(jsonString: string): CrdtDocument {
  const data = JSON.parse(jsonString);
  
  return {
    ...data,
    versionVector: new Map(data.versionVector),
    metadata: {
      ...data.metadata,
      createdAt: new Date(data.metadata.createdAt),
      updatedAt: new Date(data.metadata.updatedAt)
    }
  };
}

/**
 * Get document statistics
 */
export function getDocumentStats(document: CrdtDocument): {
  operationCount: number;
  siteCount: number;
  contentLength: number;
  lastModified: Date;
} {
  const siteIds = new Set(document.operations.map(op => op.siteId));
  
  return {
    operationCount: document.operations.length,
    siteCount: siteIds.size,
    contentLength: document.content.length,
    lastModified: document.metadata.updatedAt
  };
}