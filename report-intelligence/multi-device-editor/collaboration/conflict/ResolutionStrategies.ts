/**
 * Resolution Strategies - Conflict resolution algorithms for collaborative editing
 * 
 * This module implements various conflict resolution strategies for
 * handling conflicts in real-time collaborative editing.
 */

import type { CrdtOperation, ConflictInfo, ResolutionStrategy } from '../types';
import { transformOperation } from '../crdt/CrdtOperation';
import { compareTimestamps } from '../crdt/CrdtTimestamp';

/**
 * Resolution strategy configuration
 */
export interface ResolutionStrategyConfig {
  defaultStrategy: ResolutionStrategy;
  userPriority: Record<string, number>; // userId -> priority (higher = more important)
  enableAutoResolution: boolean;
  maxRetries: number;
}

/**
 * Default resolution strategy configuration
 */
export const DEFAULT_RESOLUTION_CONFIG: ResolutionStrategyConfig = {
  defaultStrategy: 'last-write-wins',
  userPriority: {},
  enableAutoResolution: true,
  maxRetries: 3
};

/**
 * Resolution result
 */
export interface ResolutionResult {
  resolved: boolean;
  strategy: ResolutionStrategy;
  resolvedOperations: CrdtOperation[];
  conflict: ConflictInfo;
  message?: string;
  error?: string;
}

/**
 * Apply a resolution strategy to a conflict
 */
export function resolveConflict(
  conflict: ConflictInfo,
  strategy: ResolutionStrategy,
  config: ResolutionStrategyConfig = DEFAULT_RESOLUTION_CONFIG
): ResolutionResult {
  try {
    switch (strategy) {
      case 'last-write-wins':
        return applyLastWriteWins(conflict);
        
      case 'operational-transform':
        return applyOperationalTransform(conflict);
        
      case 'manual':
        return applyManualResolution(conflict);
        
      case 'priority-based':
        return applyPriorityBasedResolution(conflict, config);
        
      default:
        return applyLastWriteWins(conflict);
    }
  } catch (error) {
    return {
      resolved: false,
      strategy,
      resolvedOperations: [],
      conflict,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Last-Write-Wins resolution strategy
 * The operation with the later timestamp wins
 */
export function applyLastWriteWins(conflict: ConflictInfo): ResolutionResult {
  const op1 = conflict.operation1;
  const op2 = conflict.operation2;
  
  // Compare timestamps
  const comparison = compareTimestamps(op1.timestamp, op2.timestamp);
  
  let winningOperation: CrdtOperation;
  let losingOperation: CrdtOperation;
  
  if (comparison === 1) {
    // op1 is later
    winningOperation = op1;
    losingOperation = op2;
  } else if (comparison === -1) {
    // op2 is later
    winningOperation = op2;
    losingOperation = op1;
  } else {
    // Concurrent or equal timestamps, use site ID as tiebreaker
    winningOperation = op1.siteId > op2.siteId ? op1 : op2;
    losingOperation = op1.siteId > op2.siteId ? op2 : op1;
  }
  
  return {
    resolved: true,
    strategy: 'last-write-wins',
    resolvedOperations: [winningOperation],
    conflict,
    message: `Last-write-wins: Operation from ${winningOperation.siteId} (timestamp: ${winningOperation.timestamp.counter}) wins`
  };
}

/**
 * Operational Transform resolution strategy
 * Transform operations to preserve both changes when possible
 */
export function applyOperationalTransform(conflict: ConflictInfo): ResolutionResult {
  const op1 = conflict.operation1;
  const op2 = conflict.operation2;
  
  // Transform op2 against op1
  const transformedOp2 = transformOperation(op2, op1);
  
  // For some conflict types, we might need to transform both
  // For now, we'll apply op1 first, then transformed op2
  const resolvedOperations = [op1, transformedOp2];
  
  return {
    resolved: true,
    strategy: 'operational-transform',
    resolvedOperations,
    conflict,
    message: 'Operational transform applied: Both operations transformed and preserved'
  };
}

/**
 * Manual resolution strategy
 * Flag the conflict for manual resolution by users
 */
export function applyManualResolution(conflict: ConflictInfo): ResolutionResult {
  return {
    resolved: false,
    strategy: 'manual',
    resolvedOperations: [],
    conflict,
    message: 'Conflict requires manual resolution by users'
  };
}

/**
 * Priority-Based resolution strategy
 * Use user priority levels to determine which operation wins
 */
export function applyPriorityBasedResolution(
  conflict: ConflictInfo,
  config: ResolutionStrategyConfig
): ResolutionResult {
  const op1 = conflict.operation1;
  const op2 = conflict.operation2;
  
  const priority1 = config.userPriority[op1.siteId] || 0;
  const priority2 = config.userPriority[op2.siteId] || 0;
  
  let winningOperation: CrdtOperation;
  let losingOperation: CrdtOperation;
  
  if (priority1 > priority2) {
    winningOperation = op1;
    losingOperation = op2;
  } else if (priority2 > priority1) {
    winningOperation = op2;
    losingOperation = op1;
  } else {
    // Equal priority, fall back to last-write-wins
    return applyLastWriteWins(conflict);
  }
  
  return {
    resolved: true,
    strategy: 'priority-based',
    resolvedOperations: [winningOperation],
    conflict,
    message: `Priority-based: User ${winningOperation.siteId} (priority: ${priority1 > priority2 ? priority1 : priority2}) wins`
  };
}

/**
 * Hybrid resolution strategy
 * Try multiple strategies in sequence until one works
 */
export function applyHybridResolution(
  conflict: ConflictInfo,
  strategies: ResolutionStrategy[] = ['operational-transform', 'last-write-wins', 'priority-based'],
  config: ResolutionStrategyConfig = DEFAULT_RESOLUTION_CONFIG
): ResolutionResult {
  for (const strategy of strategies) {
    const result = resolveConflict(conflict, strategy, config);
    if (result.resolved) {
      return {
        ...result,
        strategy: 'hybrid' as ResolutionStrategy,
        message: `Hybrid resolution used ${strategy}: ${result.message}`
      };
    }
  }
  
  // If all strategies fail, fall back to manual
  return applyManualResolution(conflict);
}

/**
 * Auto-resolve conflict using the best strategy
 */
export function autoResolveConflict(
  conflict: ConflictInfo,
  config: ResolutionStrategyConfig = DEFAULT_RESOLUTION_CONFIG
): ResolutionResult {
  // Determine the best strategy based on conflict type and severity
  const suggestedStrategy = getAutoResolutionStrategy(conflict, config);
  
  // Apply the strategy
  const result = resolveConflict(conflict, suggestedStrategy, config);
  
  // Return with 'auto' as the strategy to indicate it was auto-resolved
  return {
    ...result,
    strategy: 'auto'
  };
}

/**
 * Get the best auto-resolution strategy for a conflict
 */
export function getAutoResolutionStrategy(
  conflict: ConflictInfo,
  config: ResolutionStrategyConfig = DEFAULT_RESOLUTION_CONFIG
): ResolutionStrategy {
  // Use priority-based if user priorities are defined
  if (Object.keys(config.userPriority).length > 0) {
    const op1Priority = config.userPriority[conflict.operation1.siteId];
    const op2Priority = config.userPriority[conflict.operation2.siteId];
    
    if (op1Priority !== undefined || op2Priority !== undefined) {
      return 'priority-based';
    }
  }
  
  // Choose strategy based on conflict type and severity
  switch (conflict.type) {
    case 'insert-insert':
      if (conflict.severity === 'low') {
        return 'operational-transform';
      }
      return 'last-write-wins';
      
    case 'insert-delete':
      return 'operational-transform';
      
    case 'delete-delete':
      if (conflict.severity === 'low') {
        return 'last-write-wins';
      }
      return 'operational-transform';
      
    case 'update-update':
      return 'manual'; // Update conflicts often need manual resolution
      
    default:
      return config.defaultStrategy;
  }
}

/**
 * Batch resolve multiple conflicts
 */
export function batchResolveConflicts(
  conflicts: ConflictInfo[],
  strategy: ResolutionStrategy | 'auto' = 'auto',
  config: ResolutionStrategyConfig = DEFAULT_RESOLUTION_CONFIG
): ResolutionResult[] {
  return conflicts.map(conflict => {
    if (strategy === 'auto') {
      return autoResolveConflict(conflict, config);
    } else {
      return resolveConflict(conflict, strategy, config);
    }
  });
}

/**
 * Get resolution statistics
 */
export function getResolutionStats(results: ResolutionResult[]): {
  total: number;
  resolved: number;
  failed: number;
  byStrategy: Record<string, number>;
  autoResolved: number;
  manualRequired: number;
} {
  const byStrategy: Record<string, number> = {};
  let resolved = 0;
  let failed = 0;
  let autoResolved = 0;
  let manualRequired = 0;
  
  for (const result of results) {
    // Count by strategy
    byStrategy[result.strategy] = (byStrategy[result.strategy] || 0) + 1;
    
    // Count resolved/failed
    if (result.resolved) {
      resolved++;
    } else {
      failed++;
    }
    
    // Count auto-resolved (non-manual strategies that succeeded)
    if (result.resolved && result.strategy !== 'manual') {
      autoResolved++;
    }
    
    // Count manual required
    if (result.strategy === 'manual') {
      manualRequired++;
    }
  }
  
  return {
    total: results.length,
    resolved,
    failed,
    byStrategy,
    autoResolved,
    manualRequired
  };
}

/**
 * Validate resolution result
 */
export function validateResolutionResult(result: ResolutionResult): string[] {
  const errors: string[] = [];
  
  if (!result.conflict) {
    errors.push('Missing conflict information');
  }
  
  if (!result.strategy) {
    errors.push('Missing resolution strategy');
  }
  
  if (result.resolved && result.resolvedOperations.length === 0) {
    errors.push('Resolution marked as successful but no operations provided');
  }
  
  if (result.resolved && result.error) {
    errors.push('Resolution marked as successful but has error: ' + result.error);
  }
  
  return errors;
}