/**
 * CRDT Operation types and transformation logic
 * 
 * This module defines CRDT operations and provides functions for
 * transforming operations to maintain consistency in collaborative editing.
 */

import type { CrdtOperation, CrdtTimestamp } from '../types';
import { compareTimestamps, areTimestampsConcurrent } from './CrdtTimestamp';

/**
 * Create a new insert operation
 */
export function createInsertOperation(
  siteId: string,
  timestamp: CrdtTimestamp,
  position: number,
  content: string
): CrdtOperation {
  return {
    id: `insert_${timestamp.counter}_${siteId}`,
    type: 'insert',
    timestamp,
    siteId,
    position,
    content,
    length: content.length
  };
}

/**
 * Create a new delete operation
 */
export function createDeleteOperation(
  siteId: string,
  timestamp: CrdtTimestamp,
  position: number,
  length: number
): CrdtOperation {
  return {
    id: `delete_${timestamp.counter}_${siteId}`,
    type: 'delete',
    timestamp,
    siteId,
    position,
    length
  };
}

/**
 * Create a new update operation
 */
export function createUpdateOperation(
  siteId: string,
  timestamp: CrdtTimestamp,
  position: number,
  content: string,
  properties?: Record<string, any>
): CrdtOperation {
  return {
    id: `update_${timestamp.counter}_${siteId}`,
    type: 'update',
    timestamp,
    siteId,
    position,
    content,
    length: content.length,
    properties
  };
}

/**
 * Transform an operation based on another operation (Operational Transform)
 * This ensures that operations can be applied in any order while maintaining consistency.
 */
export function transformOperation(
  operation: CrdtOperation,
  otherOperation: CrdtOperation
): CrdtOperation {
  // If operations are from the same site or not concurrent, no transformation needed
  if (operation.siteId === otherOperation.siteId || 
      !areTimestampsConcurrent(operation.timestamp, otherOperation.timestamp)) {
    return operation;
  }
  
  // Handle different operation types
  if (operation.type === 'insert' && otherOperation.type === 'insert') {
    return transformInsertInsert(operation, otherOperation);
  }
  
  if (operation.type === 'insert' && otherOperation.type === 'delete') {
    return transformInsertDelete(operation, otherOperation);
  }
  
  if (operation.type === 'delete' && otherOperation.type === 'insert') {
    return transformDeleteInsert(operation, otherOperation);
  }
  
  if (operation.type === 'delete' && otherOperation.type === 'delete') {
    return transformDeleteDelete(operation, otherOperation);
  }
  
  // For update operations, preserve the operation but adjust position if needed
  if (operation.type === 'update') {
    return transformUpdate(operation, otherOperation);
  }
  
  // Default: return operation unchanged
  return operation;
}

/**
 * Transform insert vs insert (two concurrent insertions)
 */
function transformInsertInsert(
  insert1: CrdtOperation,
  insert2: CrdtOperation
): CrdtOperation {
  // If insert1 is before insert2, no change
  if (insert1.position! < insert2.position!) {
    return insert1;
  }
  
  // If insert1 is after insert2, adjust position
  if (insert1.position! > insert2.position!) {
    return {
      ...insert1,
      position: insert1.position! + insert2.content!.length
    };
  }
  
  // Same position: use timestamp ordering
  const comparison = compareTimestamps(insert1.timestamp, insert2.timestamp);
  if (comparison === -1) {
    // insert1 happened before insert2
    return insert1;
  } else {
    // insert1 happened after insert2 or concurrent
    return {
      ...insert1,
      position: insert1.position! + insert2.content!.length
    };
  }
}

/**
 * Transform insert vs delete
 */
function transformInsertDelete(
  insert: CrdtOperation,
  del: CrdtOperation
): CrdtOperation {
  // If insert is before the deletion range, no change
  if (insert.position! < del.position!) {
    return insert;
  }
  
  // If insert is after the deletion range, adjust position
  if (insert.position! >= del.position! + del.length!) {
    return {
      ...insert,
      position: insert.position! - del.length!
    };
  }
  
  // Insert is within deletion range: position becomes the start of deletion
  return {
    ...insert,
    position: del.position!
  };
}

/**
 * Transform delete vs insert
 */
function transformDeleteInsert(
  del: CrdtOperation,
  insert: CrdtOperation
): CrdtOperation {
  // If deletion ends before insert position, no change
  if (del.position! + del.length! <= insert.position!) {
    return del;
  }
  
  // If deletion starts after insert position, adjust position
  if (del.position! > insert.position!) {
    return {
      ...del,
      position: del.position! + insert.content!.length
    };
  }
  
  // Overlap: deletion range expands to include the insert
  return {
    ...del,
    length: del.length! + insert.content!.length
  };
}

/**
 * Transform delete vs delete
 */
function transformDeleteDelete(
  del1: CrdtOperation,
  del2: CrdtOperation
): CrdtOperation {
  // No overlap cases
  if (del1.position! + del1.length! <= del2.position!) {
    return del1;
  }
  
  if (del2.position! + del2.length! <= del1.position!) {
    return del1;
  }
  
  // Overlap: adjust deletion range
  const overlapStart = Math.max(del1.position!, del2.position!);
  const overlapEnd = Math.min(del1.position! + del1.length!, del2.position! + del2.length!);
  const overlapLength = overlapEnd - overlapStart;
  
  if (overlapLength > 0) {
    // Reduce deletion length by overlap
    return {
      ...del1,
      length: del1.length! - overlapLength
    };
  }
  
  return del1;
}

/**
 * Transform update operation
 */
function transformUpdate(
  update: CrdtOperation,
  other: CrdtOperation
): CrdtOperation {
  if (other.type === 'insert') {
    if (update.position! >= other.position!) {
      return {
        ...update,
        position: update.position! + other.content!.length
      };
    }
  }
  
  if (other.type === 'delete') {
    if (update.position! >= other.position! + other.length!) {
      return {
        ...update,
        position: update.position! - other.length!
      };
    }
    
    if (update.position! + update.length! <= other.position!) {
      return update;
    }
    
    // Overlap: update may need to be split (simplified for now)
    return update;
  }
  
  return update;
}

/**
 * Check if two operations conflict
 */
export function operationsConflict(
  op1: CrdtOperation,
  op2: CrdtOperation
): boolean {
  // Operations from same site don't conflict (ordered by timestamp)
  if (op1.siteId === op2.siteId) {
    return false;
  }
  
  // Check if operations are concurrent
  if (!areTimestampsConcurrent(op1.timestamp, op2.timestamp)) {
    return false;
  }
  
  // Check for specific conflict types
  if (op1.type === 'insert' && op2.type === 'insert') {
    // Insert-insert conflict at same position
    return op1.position === op2.position;
  }
  
  if ((op1.type === 'insert' && op2.type === 'delete') ||
      (op1.type === 'delete' && op2.type === 'insert')) {
    // Insert-delete conflict if positions overlap
    const insert = op1.type === 'insert' ? op1 : op2;
    const del = op1.type === 'delete' ? op1 : op2;
    
    return insert.position! >= del.position! && 
           insert.position! < del.position! + del.length!;
  }
  
  if (op1.type === 'delete' && op2.type === 'delete') {
    // Delete-delete conflict if ranges overlap
    const range1 = { start: op1.position!, end: op1.position! + op1.length! };
    const range2 = { start: op2.position!, end: op2.position! + op2.length! };
    
    return !(range1.end <= range2.start || range2.end <= range1.start);
  }
  
  return false;
}

/**
 * Apply an operation to a string (for testing and simulation)
 */
export function applyOperationToString(
  content: string,
  operation: CrdtOperation
): string {
  switch (operation.type) {
    case 'insert':
      return (
        content.slice(0, operation.position!) +
        operation.content! +
        content.slice(operation.position!)
      );
      
    case 'delete':
      return (
        content.slice(0, operation.position!) +
        content.slice(operation.position! + operation.length!)
      );
      
    case 'update':
      return (
        content.slice(0, operation.position!) +
        operation.content! +
        content.slice(operation.position! + operation.length!)
      );
      
    default:
      return content;
  }
}

/**
 * Validate an operation
 */
export function validateOperation(operation: CrdtOperation): string[] {
  const errors: string[] = [];
  
  if (!operation.id) {
    errors.push('Operation must have an ID');
  }
  
  if (!operation.type) {
    errors.push('Operation must have a type');
  }
  
  if (!operation.timestamp) {
    errors.push('Operation must have a timestamp');
  }
  
  if (!operation.siteId) {
    errors.push('Operation must have a siteId');
  }
  
  if (operation.type === 'insert' || operation.type === 'update') {
    if (operation.position === undefined) {
      errors.push('Insert/update operations must have a position');
    }
    
    if (!operation.content) {
      errors.push('Insert/update operations must have content');
    }
  }
  
  if (operation.type === 'delete') {
    if (operation.position === undefined) {
      errors.push('Delete operations must have a position');
    }
    
    if (!operation.length || operation.length <= 0) {
      errors.push('Delete operations must have a positive length');
    }
  }
  
  return errors;
}