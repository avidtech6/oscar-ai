/**
 * Conflict Module - Conflict detection and resolution for collaborative editing
 *
 * This module provides conflict detection, resolution strategies, and
 * coordination for handling conflicts in real-time collaborative editing.
 */

// Import for re-export
import type { CrdtOperation, ConflictInfo, ResolutionStrategy } from '../types';
import {
  ConflictDetectionConfig,
  DEFAULT_CONFLICT_DETECTION_CONFIG,
  detectConflict,
  detectConflictsWithExisting,
  getConflictType,
  calculateConflictSeverity,
  isConflictTypeEnabled,
  isSeverityAboveThreshold,
  getConflictDescription,
  getSuggestedResolutionStrategy,
  canAutoResolveConflict,
  getConflictStats
} from './ConflictDetector';
import {
  ResolutionStrategyConfig,
  DEFAULT_RESOLUTION_CONFIG,
  type ResolutionResult,
  resolveConflict,
  applyLastWriteWins,
  applyOperationalTransform,
  applyManualResolution,
  applyPriorityBasedResolution,
  applyHybridResolution,
  autoResolveConflict,
  getAutoResolutionStrategy,
  batchResolveConflicts,
  getResolutionStats,
  validateResolutionResult
} from './ResolutionStrategies';
import {
  ConflictResolver,
  type ConflictResolverConfig,
  type ConflictEvent,
  DEFAULT_CONFLICT_RESOLVER_CONFIG
} from './ConflictResolver';

// Export types
export type { ConflictInfo, ResolutionStrategy, CrdtOperation };

// Export detector
export {
  ConflictDetectionConfig,
  DEFAULT_CONFLICT_DETECTION_CONFIG,
  detectConflict,
  detectConflictsWithExisting,
  getConflictType,
  calculateConflictSeverity,
  isConflictTypeEnabled,
  isSeverityAboveThreshold,
  getConflictDescription,
  getSuggestedResolutionStrategy,
  canAutoResolveConflict,
  getConflictStats
};

// Export resolution strategies
export {
  ResolutionStrategyConfig,
  DEFAULT_RESOLUTION_CONFIG,
  type ResolutionResult,
  resolveConflict,
  applyLastWriteWins,
  applyOperationalTransform,
  applyManualResolution,
  applyPriorityBasedResolution,
  applyHybridResolution,
  autoResolveConflict,
  getAutoResolutionStrategy,
  batchResolveConflicts,
  getResolutionStats,
  validateResolutionResult
};

// Export main resolver
export {
  ConflictResolver,
  type ConflictResolverConfig,
  type ConflictEvent,
  DEFAULT_CONFLICT_RESOLVER_CONFIG
};

/**
 * Create a new conflict resolver instance
 */
export function createConflictResolver(
  config: Partial<ConflictResolverConfig> = {}
): ConflictResolver {
  return new ConflictResolver(config);
}

/**
 * Create a simple conflict detector
 */
export function createConflictDetector(
  config: Partial<ConflictDetectionConfig> = {}
): {
  detect: (op1: CrdtOperation, op2: CrdtOperation) => ConflictInfo | null;
  detectAll: (newOp: CrdtOperation, existingOps: CrdtOperation[]) => ConflictInfo[];
} {
  const fullConfig: ConflictDetectionConfig = {
    ...DEFAULT_CONFLICT_DETECTION_CONFIG,
    ...config
  };
  
  return {
    detect: (op1, op2) => detectConflict(op1, op2, fullConfig),
    detectAll: (newOp, existingOps) =>
      detectConflictsWithExisting(newOp, existingOps, fullConfig)
  };
}

/**
 * Example usage:
 * 
 * ```typescript
 * import { createConflictResolver } from './conflict';
 * 
 * const resolver = createConflictResolver({
 *   detection: {
 *     enabled: true,
 *     detectInsertInsert: true
 *   }
 * });
 * 
 * // Process operations for conflicts
 * const result = resolver.processOperation(newOperation, existingOperations);
 * 
 * // Auto-resolve conflicts
 * const autoResolved = result.autoResolved;
 * 
 * // Handle manual conflicts
 * const manualConflicts = result.requiresManual;
 * ```
 */