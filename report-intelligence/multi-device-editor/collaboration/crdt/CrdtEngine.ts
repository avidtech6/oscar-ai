/**
 * CRDT Engine - Main engine for CRDT operations
 * 
 * This is the core engine that coordinates CRDT operations,
 * manages document state, and handles synchronization.
 */

import type { CrdtDocument, CrdtOperation, CrdtTimestamp } from '../types';
import { generateTimestamp, compareTimestamps, TimestampUtils } from './CrdtTimestamp';
import { 
  createInsertOperation, 
  createDeleteOperation, 
  createUpdateOperation,
  transformOperation,
  operationsConflict 
} from './CrdtOperation';
import { 
  createEmptyDocument, 
  applyOperation, 
  applyOperations,
  mergeDocuments,
  getMissingOperations,
  isDocumentUpToDate 
} from './CrdtDocument';

/**
 * Configuration for the CRDT engine
 */
export interface CrdtEngineConfig {
  siteId: string;
  documentId: string;
  userName: string;
  maxOperationHistory: number;
  enableCompression: boolean;
  conflictDetectionEnabled: boolean;
}

/**
 * CRDT Engine class
 */
export class CrdtEngine {
  private config: CrdtEngineConfig;
  private document: CrdtDocument;
  private localCounter: number = 0;
  private pendingOperations: CrdtOperation[] = [];
  private eventListeners: Map<string, Function[]> = new Map();
  
  /**
   * Create a new CRDT engine
   */
  constructor(config: CrdtEngineConfig) {
    this.config = config;
    this.document = createEmptyDocument(
      config.documentId,
      config.siteId,
      config.userName
    );
    this.localCounter = 0;
  }
  
  /**
   * Initialize engine with existing document
   */
  initializeWithDocument(document: CrdtDocument): void {
    this.document = document;
    
    // Update local counter based on existing operations
    const siteCounter = document.versionVector.get(this.config.siteId) || 0;
    this.localCounter = siteCounter;
    
    this.emit('document-loaded', { document });
  }
  
  /**
   * Get current document
   */
  getDocument(): CrdtDocument {
    return this.document;
  }
  
  /**
   * Get current content
   */
  getContent(): string {
    return this.document.content;
  }
  
  /**
   * Insert text at position
   */
  insertText(position: number, text: string): CrdtOperation {
    this.localCounter++;
    const timestamp = generateTimestamp(this.config.siteId, this.localCounter);
    
    const operation = createInsertOperation(
      this.config.siteId,
      timestamp,
      position,
      text
    );
    
    return this.applyLocalOperation(operation);
  }
  
  /**
   * Delete text at position
   */
  deleteText(position: number, length: number): CrdtOperation {
    this.localCounter++;
    const timestamp = generateTimestamp(this.config.siteId, this.localCounter);
    
    const operation = createDeleteOperation(
      this.config.siteId,
      timestamp,
      position,
      length
    );
    
    return this.applyLocalOperation(operation);
  }
  
  /**
   * Update text at position
   */
  updateText(position: number, newText: string, properties?: Record<string, any>): CrdtOperation {
    this.localCounter++;
    const timestamp = generateTimestamp(this.config.siteId, this.localCounter);
    
    const operation = createUpdateOperation(
      this.config.siteId,
      timestamp,
      position,
      newText,
      properties
    );
    
    return this.applyLocalOperation(operation);
  }
  
  /**
   * Apply a local operation (from this site)
   */
  private applyLocalOperation(operation: CrdtOperation): CrdtOperation {
    // Apply to local document
    this.document = applyOperation(this.document, operation);
    
    // Add to pending operations for synchronization
    this.pendingOperations.push(operation);
    
    // Emit events
    this.emit('operation-applied', { operation, document: this.document });
    this.emit('content-changed', { content: this.document.content });
    
    // Check for compression
    if (this.config.enableCompression && 
        this.document.operations.length > this.config.maxOperationHistory) {
      this.compressHistory();
    }
    
    return operation;
  }
  
  /**
   * Apply a remote operation (from another site)
   */
  applyRemoteOperation(operation: CrdtOperation): void {
    // Check for conflicts if enabled
    if (this.config.conflictDetectionEnabled) {
      const conflicts = this.detectConflicts(operation);
      if (conflicts.length > 0) {
        this.emit('conflict-detected', { operation, conflicts });
        // For now, we'll still apply the operation
        // Conflict resolution will be handled by the conflict module
      }
    }
    
    // Apply the operation
    this.document = applyOperation(this.document, operation);
    
    // Update local counter if needed
    const remoteCounter = operation.timestamp.counter;
    const siteId = operation.siteId;
    
    if (siteId === this.config.siteId && remoteCounter > this.localCounter) {
      this.localCounter = remoteCounter;
    }
    
    // Emit events
    this.emit('remote-operation-applied', { operation, document: this.document });
    this.emit('content-changed', { content: this.document.content });
  }
  
  /**
   * Apply multiple remote operations
   */
  applyRemoteOperations(operations: CrdtOperation[]): void {
    for (const operation of operations) {
      this.applyRemoteOperation(operation);
    }
  }
  
  /**
   * Synchronize with remote document
   */
  synchronize(remoteDocument: CrdtDocument): {
    localToRemote: CrdtOperation[];
    remoteToLocal: CrdtOperation[];
    mergedDocument: CrdtDocument;
  } {
    // Get operations that remote is missing
    const localToRemote = getMissingOperations(
      this.document,
      remoteDocument.versionVector
    );
    
    // Get operations that local is missing
    const remoteToLocal = getMissingOperations(
      remoteDocument,
      this.document.versionVector
    );
    
    // Merge documents
    const mergedDocument = mergeDocuments(this.document, remoteDocument);
    this.document = mergedDocument;
    
    // Clear pending operations that were synchronized
    this.pendingOperations = this.pendingOperations.filter(op => 
      !localToRemote.some(remoteOp => remoteOp.id === op.id)
    );
    
    // Update local counter
    const siteCounter = mergedDocument.versionVector.get(this.config.siteId) || 0;
    if (siteCounter > this.localCounter) {
      this.localCounter = siteCounter;
    }
    
    // Emit events
    this.emit('synchronized', { 
      localToRemote, 
      remoteToLocal, 
      mergedDocument 
    });
    
    return {
      localToRemote,
      remoteToLocal,
      mergedDocument
    };
  }
  
  /**
   * Get pending operations for synchronization
   */
  getPendingOperations(): CrdtOperation[] {
    return [...this.pendingOperations];
  }
  
  /**
   * Clear pending operations (after successful synchronization)
   */
  clearPendingOperations(operationIds: string[]): void {
    this.pendingOperations = this.pendingOperations.filter(
      op => !operationIds.includes(op.id)
    );
  }
  
  /**
   * Detect conflicts with a new operation
   */
  private detectConflicts(newOperation: CrdtOperation): CrdtOperation[] {
    const conflicts: CrdtOperation[] = [];
    
    for (const existingOperation of this.document.operations) {
      if (operationsConflict(newOperation, existingOperation)) {
        conflicts.push(existingOperation);
      }
    }
    
    return conflicts;
  }
  
  /**
   * Compress operation history
   */
  private compressHistory(): void {
    // Simple compression: keep only recent operations
    const recentOperations = this.document.operations.slice(-this.config.maxOperationHistory);
    
    // Recreate document with compressed history
    const compressedDoc = createEmptyDocument(
      this.document.id,
      this.config.siteId,
      this.document.metadata.createdBy
    );
    
    this.document = applyOperations(compressedDoc, recentOperations);
    
    this.emit('history-compressed', { 
      originalCount: this.document.operations.length + this.config.maxOperationHistory,
      compressedCount: this.document.operations.length 
    });
  }
  
  /**
   * Get engine statistics
   */
  getStats(): {
    operationCount: number;
    pendingCount: number;
    siteCount: number;
    contentLength: number;
    localCounter: number;
  } {
    const siteIds = new Set(this.document.operations.map(op => op.siteId));
    
    return {
      operationCount: this.document.operations.length,
      pendingCount: this.pendingOperations.length,
      siteCount: siteIds.size,
      contentLength: this.document.content.length,
      localCounter: this.localCounter
    };
  }
  
  /**
   * Export document state
   */
  exportState(): string {
    const exportData = {
      document: this.document,
      config: this.config,
      localCounter: this.localCounter,
      pendingOperations: this.pendingOperations
    };
    
    return JSON.stringify(exportData, null, 2);
  }
  
  /**
   * Import document state
   */
  importState(stateJson: string): void {
    const state = JSON.parse(stateJson);
    
    this.document = state.document;
    this.config = state.config;
    this.localCounter = state.localCounter;
    this.pendingOperations = state.pendingOperations;
    
    this.emit('state-imported', { state });
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
   * Reset engine (for testing)
   */
  reset(): void {
    this.document = createEmptyDocument(
      this.config.documentId,
      this.config.siteId,
      this.config.userName
    );
    this.localCounter = 0;
    this.pendingOperations = [];
    
    this.emit('reset', {});
  }
}