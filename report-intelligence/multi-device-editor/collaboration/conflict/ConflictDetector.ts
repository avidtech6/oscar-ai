/**
 * Conflict Detector - Detects conflicts in collaborative editing operations
 * 
 * This module identifies conflicts between concurrent operations in
 * real-time collaborative editing sessions.
 */

import type { CrdtOperation, ConflictInfo, ResolutionStrategy } from '../types';
import { operationsConflict } from '../crdt/CrdtOperation';
import { compareTimestamps, areTimestampsConcurrent } from '../crdt/CrdtTimestamp';

/**
 * Conflict detection configuration
 */
export interface ConflictDetectionConfig {
  enabled: boolean;
  detectInsertInsert: boolean;
  detectInsertDelete: boolean;
  detectDeleteDelete: boolean;
  detectUpdateUpdate: boolean;
  severityThreshold: 'low' | 'medium' | 'high';
  autoResolveSimpleConflicts: boolean;
}

/**
 * Default conflict detection configuration
 */
export const DEFAULT_CONFLICT_DETECTION_CONFIG: ConflictDetectionConfig = {
  enabled: true,
  detectInsertInsert: true,
  detectInsertDelete: true,
  detectDeleteDelete: true,
  detectUpdateUpdate: true,
  severityThreshold: 'medium',
  autoResolveSimpleConflicts: true
};

/**
 * Detect conflicts between two operations
 */
export function detectConflict(
  operation1: CrdtOperation,
  operation2: CrdtOperation,
  config: ConflictDetectionConfig = DEFAULT_CONFLICT_DETECTION_CONFIG
): ConflictInfo | null {
  if (!config.enabled) {
    return null;
  }
  
  // Check if operations are concurrent
  if (!areTimestampsConcurrent(operation1.timestamp, operation2.timestamp)) {
    return null;
  }
  
  // Check if operations are from the same site (no conflict)
  if (operation1.siteId === operation2.siteId) {
    return null;
  }
  
  // Check specific conflict types based on configuration
  const conflictType = getConflictType(operation1, operation2);
  if (!conflictType) {
    return null;
  }
  
  // Check if this conflict type is enabled
  if (!isConflictTypeEnabled(conflictType, config)) {
    return null;
  }
  
  // Determine conflict severity
  const severity = calculateConflictSeverity(operation1, operation2, conflictType);
  
  // Check if severity meets threshold
  if (!isSeverityAboveThreshold(severity, config.severityThreshold)) {
    return null;
  }
  
  return {
    operation1,
    operation2,
    type: conflictType,
    severity,
    resolved: false
  };
}

/**
 * Detect conflicts between a new operation and existing operations
 */
export function detectConflictsWithExisting(
  newOperation: CrdtOperation,
  existingOperations: CrdtOperation[],
  config: ConflictDetectionConfig = DEFAULT_CONFLICT_DETECTION_CONFIG
): ConflictInfo[] {
  if (!config.enabled) {
    return [];
  }
  
  const conflicts: ConflictInfo[] = [];
  
  for (const existingOperation of existingOperations) {
    const conflict = detectConflict(newOperation, existingOperation, config);
    if (conflict) {
      conflicts.push(conflict);
    }
  }
  
  return conflicts;
}

/**
 * Get conflict type between two operations
 */
export function getConflictType(
  operation1: CrdtOperation,
  operation2: CrdtOperation
): ConflictInfo['type'] | null {
  // Use the operationsConflict function from CRDT module
  if (!operationsConflict(operation1, operation2)) {
    return null;
  }
  
  // Determine specific conflict type
  if (operation1.type === 'insert' && operation2.type === 'insert') {
    return 'insert-insert';
  }
  
  if ((operation1.type === 'insert' && operation2.type === 'delete') ||
      (operation1.type === 'delete' && operation2.type === 'insert')) {
    return 'insert-delete';
  }
  
  if (operation1.type === 'delete' && operation2.type === 'delete') {
    return 'delete-delete';
  }
  
  if (operation1.type === 'update' && operation2.type === 'update') {
    return 'update-update';
  }
  
  // Mixed types (insert-update, delete-update, etc.)
  if (operation1.type === 'insert' && operation2.type === 'update') {
    return 'insert-insert'; // Treat as insert-insert conflict
  }
  
  if (operation1.type === 'update' && operation2.type === 'insert') {
    return 'insert-insert'; // Treat as insert-insert conflict
  }
  
  return null;
}

/**
 * Calculate conflict severity
 */
export function calculateConflictSeverity(
  operation1: CrdtOperation,
  operation2: CrdtOperation,
  conflictType: ConflictInfo['type']
): ConflictInfo['severity'] {
  switch (conflictType) {
    case 'insert-insert':
      // Insert-insert at same position is high severity
      if (operation1.position === operation2.position) {
        return 'high';
      }
      // Insert-insert at nearby positions is medium severity
      if (Math.abs(operation1.position! - operation2.position!) <= 10) {
        return 'medium';
      }
      return 'low';
      
    case 'insert-delete':
      const insert = operation1.type === 'insert' ? operation1 : operation2;
      const del = operation1.type === 'delete' ? operation1 : operation2;
      
      // If insert is at the exact start of deletion, medium severity
      if (insert.position === del.position) {
        return 'medium';
      }
      
      // If insert is within deletion range, high severity
      if (insert.position! > del.position! && 
          insert.position! < del.position! + del.length!) {
        return 'high';
      }
      
      return 'low';
      
    case 'delete-delete':
      const range1 = { start: operation1.position!, end: operation1.position! + operation1.length! };
      const range2 = { start: operation2.position!, end: operation2.position! + operation2.length! };
      
      // Calculate overlap percentage
      const overlapStart = Math.max(range1.start, range2.start);
      const overlapEnd = Math.min(range1.end, range2.end);
      const overlapLength = Math.max(0, overlapEnd - overlapStart);
      
      const totalLength = (range1.end - range1.start) + (range2.end - range2.start);
      const overlapPercentage = overlapLength / totalLength;
      
      if (overlapPercentage > 0.5) {
        return 'high';
      } else if (overlapPercentage > 0.2) {
        return 'medium';
      } else {
        return 'low';
      }
      
    case 'update-update':
      // Update-update conflicts are typically high severity
      return 'high';
      
    default:
      return 'medium';
  }
}

/**
 * Check if a conflict type is enabled in the configuration
 */
export function isConflictTypeEnabled(
  conflictType: ConflictInfo['type'],
  config: ConflictDetectionConfig
): boolean {
  switch (conflictType) {
    case 'insert-insert':
      return config.detectInsertInsert;
    case 'insert-delete':
      return config.detectInsertDelete;
    case 'delete-delete':
      return config.detectDeleteDelete;
    case 'update-update':
      return config.detectUpdateUpdate;
    default:
      return true;
  }
}

/**
 * Check if severity meets or exceeds threshold
 */
export function isSeverityAboveThreshold(
  severity: ConflictInfo['severity'],
  threshold: ConflictInfo['severity']
): boolean {
  const severityLevels = { low: 0, medium: 1, high: 2 };
  return severityLevels[severity] >= severityLevels[threshold];
}

/**
 * Get conflict description for UI display
 */
export function getConflictDescription(conflict: ConflictInfo): string {
  const op1 = conflict.operation1;
  const op2 = conflict.operation2;
  
  switch (conflict.type) {
    case 'insert-insert':
      return `Insert conflict: "${op1.content}" at position ${op1.position} vs "${op2.content}" at position ${op2.position}`;
      
    case 'insert-delete':
      const insert = op1.type === 'insert' ? op1 : op2;
      const del = op1.type === 'delete' ? op1 : op2;
      return `Insert-delete conflict: Insert "${insert.content}" at position ${insert.position} within deletion range ${del.position}-${del.position! + del.length!}`;
      
    case 'delete-delete':
      return `Delete conflict: Delete ${op1.length} chars at ${op1.position} vs ${op2.length} chars at ${op2.position}`;
      
    case 'update-update':
      return `Update conflict: Update "${op1.content}" at ${op1.position} vs "${op2.content}" at ${op2.position}`;
      
    default:
      return `Conflict between ${op1.type} and ${op2.type} operations`;
  }
}

/**
 * Get suggested resolution strategy for a conflict
 */
export function getSuggestedResolutionStrategy(
  conflict: ConflictInfo
): ResolutionStrategy {
  switch (conflict.type) {
    case 'insert-insert':
      // For insert-insert at same position, use last-write-wins
      if (conflict.operation1.position === conflict.operation2.position) {
        return 'last-write-wins';
      }
      // For nearby inserts, operational transform works well
      return 'operational-transform';
      
    case 'insert-delete':
      // Insert-delete conflicts often need operational transform
      return 'operational-transform';
      
    case 'delete-delete':
      // Delete-delete can use last-write-wins or operational transform
      if (conflict.severity === 'low') {
        return 'last-write-wins';
      }
      return 'operational-transform';
      
    case 'update-update':
      // Update-update conflicts often need manual resolution
      return 'manual';
      
    default:
      return 'last-write-wins';
  }
}

/**
 * Check if a conflict can be auto-resolved
 */
export function canAutoResolveConflict(
  conflict: ConflictInfo,
  config: ConflictDetectionConfig = DEFAULT_CONFLICT_DETECTION_CONFIG
): boolean {
  if (!config.autoResolveSimpleConflicts) {
    return false;
  }
  
  // Simple conflicts that can be auto-resolved
  if (conflict.severity === 'low') {
    return true;
  }
  
  // Insert-insert at different positions can often be auto-resolved
  if (conflict.type === 'insert-insert' && 
      conflict.operation1.position !== conflict.operation2.position) {
    return true;
  }
  
  return false;
}

/**
 * Get conflict statistics from a list of conflicts
 */
export function getConflictStats(conflicts: ConflictInfo[]): {
  total: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  autoResolvable: number;
} {
  const byType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  let autoResolvable = 0;
  
  for (const conflict of conflicts) {
    // Count by type
    byType[conflict.type] = (byType[conflict.type] || 0) + 1;
    
    // Count by severity
    bySeverity[conflict.severity] = (bySeverity[conflict.severity] || 0) + 1;
    
    // Count auto-resolvable
    if (canAutoResolveConflict(conflict)) {
      autoResolvable++;
    }
  }
  
  return {
    total: conflicts.length,
    byType,
    bySeverity,
    autoResolvable
  };
}