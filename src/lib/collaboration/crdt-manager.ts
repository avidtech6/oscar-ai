/**
 * CRDT Manager for Oscar AI Phase Compliance Package
 * 
 * This file implements the CRDTManager class for Phase 19: Real-Time Collaboration Layer (CRDT + Presence).
 * It provides conflict-free replicated data types for collaborative editing.
 * 
 * File: src/lib/collaboration/crdt-manager.ts
 * Generated as part of Oscar AI Phase Compliance Package implementation
 */

export interface CRDTOperation {
  id: string;
  type: 'insert' | 'delete' | 'format';
  position: number;
  length: number;
  content?: string;
  format?: any;
  author: string;
  timestamp: Date;
  version: number;
}

export interface CRDTDocument {
  id: string;
  content: string;
  operations: CRDTOperation[];
  version: number;
  authors: Set<string>;
  lastModified: Date;
}

export interface CRDTSyncResult {
  success: boolean;
  merged: boolean;
  conflicts: Array<{
    local: CRDTOperation;
    remote: CRDTOperation;
  }>;
  newOperations: CRDTOperation[];
}

/**
 * CRDT Manager for conflict-free collaborative editing
 */
export class CRDTManager {
  private document: CRDTDocument;
  private pendingOperations: CRDTOperation[] = [];
  private remoteOperations: CRDTOperation[] = [];
  private operationCallbacks: Array<(op: CRDTOperation) => void> = [];
  
  /**
   * Initialize CRDT manager
   */
  constructor(documentId: string) {
    this.document = {
      id: documentId,
      content: '',
      operations: [],
      version: 0,
      authors: new Set(),
      lastModified: new Date()
    };
  }
  
  /**
   * Get current document content
   */
  getContent(): string {
    return this.document.content;
  }
  
  /**
   * Get document metadata
   */
  getDocument(): CRDTDocument {
    return { ...this.document };
  }
  
  /**
   * Insert content at position
   */
  insert(position: number, content: string, author: string): CRDTOperation {
    const operation: CRDTOperation = {
      id: this.generateOperationId(),
      type: 'insert',
      position,
      length: content.length,
      content,
      author,
      timestamp: new Date(),
      version: this.document.version + 1
    };
    
    this.applyOperation(operation);
    this.pendingOperations.push(operation);
    
    return operation;
  }
  
  /**
   * Delete content at position
   */
  delete(position: number, length: number, author: string): CRDTOperation {
    const operation: CRDTOperation = {
      id: this.generateOperationId(),
      type: 'delete',
      position,
      length,
      author,
      timestamp: new Date(),
      version: this.document.version + 1
    };
    
    this.applyOperation(operation);
    this.pendingOperations.push(operation);
    
    return operation;
  }
  
  /**
   * Apply formatting to content
   */
  format(position: number, length: number, format: any, author: string): CRDTOperation {
    const operation: CRDTOperation = {
      id: this.generateOperationId(),
      type: 'format',
      position,
      length,
      format,
      author,
      timestamp: new Date(),
      version: this.document.version + 1
    };
    
    this.applyOperation(operation);
    this.pendingOperations.push(operation);
    
    return operation;
  }
  
  /**
   * Add remote operation
   */
  addRemoteOperation(operation: CRDTOperation): void {
    this.remoteOperations.push(operation);
  }
  
  /**
   * Sync with remote changes
   */
  syncRemote(): CRDTSyncResult {
    const result: CRDTSyncResult = {
      success: true,
      merged: false,
      conflicts: [],
      newOperations: []
    };
    
    // Sort remote operations by version
    const sortedRemote = [...this.remoteOperations].sort((a, b) => a.version - b.version);
    
    for (const remoteOp of sortedRemote) {
      // Check for conflicts
      const conflictingLocal = this.findConflictingOperation(remoteOp);
      
      if (conflictingLocal) {
        result.conflicts.push({
          local: conflictingLocal,
          remote: remoteOp
        });
        
        // For now, let remote win (could be made configurable)
        this.resolveConflict(remoteOp, conflictingLocal);
      } else {
        // Apply remote operation
        this.applyOperation(remoteOp);
        result.newOperations.push(remoteOp);
      }
    }
    
    // Clear remote operations after processing
    this.remoteOperations = [];
    
    if (result.conflicts.length > 0) {
      result.merged = true;
    }
    
    return result;
  }
  
  /**
   * Get pending operations for sync
   */
  getPendingOperations(): CRDTOperation[] {
    return [...this.pendingOperations];
  }
  
  /**
   * Mark operations as synced
   */
  markOperationsSynced(operationIds: string[]): void {
    this.pendingOperations = this.pendingOperations.filter(
      op => !operationIds.includes(op.id)
    );
  }
  
  /**
   * Add operation callback
   */
  onOperation(callback: (op: CRDTOperation) => void): void {
    this.operationCallbacks.push(callback);
  }
  
  /**
   * Remove operation callback
   */
  removeOperationCallback(callback: (op: CRDTOperation) => void): void {
    const index = this.operationCallbacks.indexOf(callback);
    if (index > -1) {
      this.operationCallbacks.splice(index, 1);
    }
  }
  
  /**
   * Get operation history
   */
  getOperationHistory(): CRDTOperation[] {
    return [...this.document.operations];
  }
  
  /**
   * Get document version
   */
  getVersion(): number {
    return this.document.version;
  }
  
  /**
   * Get active authors
   */
  getActiveAuthors(): string[] {
    return Array.from(this.document.authors);
  }
  
  /**
   * Apply operation to document
   */
  private applyOperation(operation: CRDTOperation): void {
    switch (operation.type) {
      case 'insert':
        this.applyInsert(operation);
        break;
      case 'delete':
        this.applyDelete(operation);
        break;
      case 'format':
        this.applyFormat(operation);
        break;
    }
    
    this.document.operations.push(operation);
    this.document.version++;
    this.document.lastModified = new Date();
    this.document.authors.add(operation.author);
    
    this.notifyOperationCallbacks(operation);
  }
  
  /**
   * Apply insert operation
   */
  private applyInsert(operation: CRDTOperation): void {
    const before = this.document.content.substring(0, operation.position);
    const after = this.document.content.substring(operation.position);
    this.document.content = before + (operation.content || '') + after;
  }
  
  /**
   * Apply delete operation
   */
  private applyDelete(operation: CRDTOperation): void {
    const before = this.document.content.substring(0, operation.position);
    const after = this.document.content.substring(operation.position + operation.length);
    this.document.content = before + after;
  }
  
  /**
   * Apply format operation
   */
  private applyFormat(operation: CRDTOperation): void {
    // Format operations don't change content, just metadata
    // In a real implementation, this would store formatting information
  }
  
  /**
   * Find conflicting operation
   */
  private findConflictingOperation(operation: CRDTOperation): CRDTOperation | null {
    // Simple conflict detection: overlapping ranges
    for (const localOp of this.pendingOperations) {
      if (this.operationsOverlap(localOp, operation)) {
        return localOp;
      }
    }
    return null;
  }
  
  /**
   * Check if two operations overlap
   */
  private operationsOverlap(a: CRDTOperation, b: CRDTOperation): boolean {
    if (a.type === 'insert' && b.type === 'insert') {
      return a.position <= b.position && a.position >= b.position - b.length;
    }
    if (a.type === 'delete' && b.type === 'delete') {
      return !(a.position + a.length <= b.position || b.position + b.length <= a.position);
    }
    return false;
  }
  
  /**
   * Resolve conflict between operations
   */
  private resolveConflict(remoteOp: CRDTOperation, localOp: CRDTOperation): void {
    // Simple resolution: remote wins
    // In a real implementation, this could be more sophisticated
    this.applyOperation(remoteOp);
  }
  
  /**
   * Notify operation callbacks
   */
  private notifyOperationCallbacks(operation: CRDTOperation): void {
    this.operationCallbacks.forEach(callback => {
      try {
        callback(operation);
      } catch (error) {
        console.error('Error in operation callback:', error);
      }
    });
  }
  
  /**
   * Generate unique operation ID
   */
  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}