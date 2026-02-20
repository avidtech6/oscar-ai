/**
 * Conflict Resolver - Main conflict resolution engine
 * 
 * This module coordinates conflict detection and resolution in
 * real-time collaborative editing sessions.
 */

import type { CrdtOperation, ConflictInfo, ResolutionStrategy } from '../types';
import { 
  ConflictDetectionConfig, 
  DEFAULT_CONFLICT_DETECTION_CONFIG,
  detectConflict,
  detectConflictsWithExisting,
  getConflictDescription,
  getSuggestedResolutionStrategy,
  canAutoResolveConflict,
  getConflictStats
} from './ConflictDetector';
import {
  ResolutionStrategyConfig,
  DEFAULT_RESOLUTION_CONFIG,
  resolveConflict,
  autoResolveConflict,
  applyHybridResolution,
  batchResolveConflicts,
  getResolutionStats,
  type ResolutionResult
} from './ResolutionStrategies';

/**
 * Conflict resolver configuration
 */
export interface ConflictResolverConfig {
  detection: ConflictDetectionConfig;
  resolution: ResolutionStrategyConfig;
  enableRealTimeDetection: boolean;
  maxConflictsInMemory: number;
  conflictHistorySize: number;
  notifyUsersOnConflict: boolean;
}

/**
 * Default conflict resolver configuration
 */
export const DEFAULT_CONFLICT_RESOLVER_CONFIG: ConflictResolverConfig = {
  detection: DEFAULT_CONFLICT_DETECTION_CONFIG,
  resolution: DEFAULT_RESOLUTION_CONFIG,
  enableRealTimeDetection: true,
  maxConflictsInMemory: 1000,
  conflictHistorySize: 100,
  notifyUsersOnConflict: true
};

/**
 * Conflict event
 */
export interface ConflictEvent {
  type: 'detected' | 'resolved' | 'auto-resolved' | 'manual-required' | 'error';
  conflict: ConflictInfo;
  resolution?: ResolutionResult;
  timestamp: Date;
}

/**
 * Conflict Resolver class
 */
export class ConflictResolver {
  private config: ConflictResolverConfig;
  private activeConflicts: Map<string, ConflictInfo> = new Map(); // conflictId -> ConflictInfo
  private conflictHistory: ConflictInfo[] = [];
  private eventListeners: Map<string, Function[]> = new Map();
  
  /**
   * Create a new conflict resolver
   */
  constructor(config: Partial<ConflictResolverConfig> = {}) {
    this.config = {
      ...DEFAULT_CONFLICT_RESOLVER_CONFIG,
      ...config,
      detection: {
        ...DEFAULT_CONFLICT_DETECTION_CONFIG,
        ...config.detection
      },
      resolution: {
        ...DEFAULT_RESOLUTION_CONFIG,
        ...config.resolution
      }
    };
  }
  
  /**
   * Process a new operation for conflicts
   */
  processOperation(
    newOperation: CrdtOperation,
    existingOperations: CrdtOperation[]
  ): {
    conflicts: ConflictInfo[];
    autoResolved: ResolutionResult[];
    requiresManual: ConflictInfo[];
  } {
    if (!this.config.detection.enabled) {
      return { conflicts: [], autoResolved: [], requiresManual: [] };
    }
    
    // Detect conflicts
    const conflicts = detectConflictsWithExisting(
      newOperation,
      existingOperations,
      this.config.detection
    );
    
    const autoResolved: ResolutionResult[] = [];
    const requiresManual: ConflictInfo[] = [];
    
    // Process each conflict
    for (const conflict of conflicts) {
      // Generate unique conflict ID
      const conflictId = this.generateConflictId(conflict);
      
      // Check if already active
      if (this.activeConflicts.has(conflictId)) {
        continue;
      }
      
      // Store conflict
      this.activeConflicts.set(conflictId, conflict);
      this.addToHistory(conflict);
      
      // Emit detection event
      this.emit('conflict-detected', {
        type: 'detected',
        conflict,
        timestamp: new Date()
      });
      
      // Check if auto-resolution is possible
      if (canAutoResolveConflict(conflict, this.config.detection)) {
        const resolution = this.autoResolveConflict(conflict);
        
        if (resolution.resolved) {
          autoResolved.push(resolution);
          this.activeConflicts.delete(conflictId);
          
          this.emit('conflict-resolved', {
            type: 'auto-resolved',
            conflict,
            resolution,
            timestamp: new Date()
          });
        } else {
          requiresManual.push(conflict);
          
          this.emit('conflict-event', {
            type: 'manual-required',
            conflict,
            timestamp: new Date()
          });
        }
      } else {
        requiresManual.push(conflict);
        
        this.emit('conflict-event', {
          type: 'manual-required',
          conflict,
          timestamp: new Date()
        });
      }
    }
    
    // Clean up if we have too many active conflicts
    if (this.activeConflicts.size > this.config.maxConflictsInMemory) {
      this.cleanupOldConflicts();
    }
    
    return { conflicts, autoResolved, requiresManual };
  }
  
  /**
   * Auto-resolve a conflict
   */
  autoResolveConflict(conflict: ConflictInfo): ResolutionResult {
    try {
      const resolution = autoResolveConflict(conflict, this.config.resolution);
      
      if (resolution.resolved) {
        conflict.resolved = true;
        conflict.resolutionStrategy = resolution.strategy;
      }
      
      return resolution;
    } catch (error) {
      return {
        resolved: false,
        strategy: 'auto',
        resolvedOperations: [],
        conflict,
        error: error instanceof Error ? error.message : 'Auto-resolution failed'
      };
    }
  }
  
  /**
   * Manually resolve a conflict
   */
  manuallyResolveConflict(
    conflictId: string,
    strategy: ResolutionStrategy,
    userDecision?: CrdtOperation
  ): ResolutionResult | null {
    const conflict = this.activeConflicts.get(conflictId);
    if (!conflict) {
      return null;
    }
    
    let resolution: ResolutionResult;
    
    if (strategy === 'manual' && userDecision) {
      // User provided a manual decision
      resolution = {
        resolved: true,
        strategy: 'manual',
        resolvedOperations: [userDecision],
        conflict,
        message: 'Manually resolved by user'
      };
    } else {
      // Use the specified strategy
      resolution = resolveConflict(conflict, strategy, this.config.resolution);
    }
    
    if (resolution.resolved) {
      conflict.resolved = true;
      conflict.resolutionStrategy = resolution.strategy;
      this.activeConflicts.delete(conflictId);
      
      this.emit('conflict-resolved', {
        type: 'resolved',
        conflict,
        resolution,
        timestamp: new Date()
      });
    }
    
    return resolution;
  }
  
  /**
   * Batch resolve multiple conflicts
   */
  batchResolveConflicts(
    conflictIds: string[],
    strategy: ResolutionStrategy | 'auto' = 'auto'
  ): ResolutionResult[] {
    const results: ResolutionResult[] = [];
    
    for (const conflictId of conflictIds) {
      const conflict = this.activeConflicts.get(conflictId);
      if (!conflict) {
        continue;
      }
      
      let resolution: ResolutionResult;
      
      if (strategy === 'auto') {
        resolution = this.autoResolveConflict(conflict);
      } else {
        resolution = resolveConflict(conflict, strategy, this.config.resolution);
      }
      
      if (resolution.resolved) {
        conflict.resolved = true;
        conflict.resolutionStrategy = resolution.strategy;
        this.activeConflicts.delete(conflictId);
      }
      
      results.push(resolution);
      
      this.emit('conflict-event', {
        type: resolution.resolved ? 'resolved' : 'error',
        conflict,
        resolution,
        timestamp: new Date()
      });
    }
    
    return results;
  }
  
  /**
   * Get all active conflicts
   */
  getActiveConflicts(): ConflictInfo[] {
    return Array.from(this.activeConflicts.values());
  }
  
  /**
   * Get conflicts requiring manual resolution
   */
  getManualConflicts(): ConflictInfo[] {
    return Array.from(this.activeConflicts.values())
      .filter(conflict => !conflict.resolved && 
             !canAutoResolveConflict(conflict, this.config.detection));
  }
  
  /**
   * Get conflict by ID
   */
  getConflict(conflictId: string): ConflictInfo | undefined {
    return this.activeConflicts.get(conflictId);
  }
  
  /**
   * Get conflict history
   */
  getConflictHistory(limit?: number): ConflictInfo[] {
    if (limit && limit > 0) {
      return this.conflictHistory.slice(-limit);
    }
    return [...this.conflictHistory];
  }
  
  /**
   * Clear resolved conflicts
   */
  clearResolvedConflicts(): number {
    let clearedCount = 0;
    
    for (const [conflictId, conflict] of this.activeConflicts.entries()) {
      if (conflict.resolved) {
        this.activeConflicts.delete(conflictId);
        clearedCount++;
      }
    }
    
    if (clearedCount > 0) {
      this.emit('conflicts-cleared', {
        count: clearedCount,
        timestamp: new Date()
      });
    }
    
    return clearedCount;
  }
  
  /**
   * Clear all conflicts (use with caution)
   */
  clearAllConflicts(): number {
    const count = this.activeConflicts.size;
    this.activeConflicts.clear();
    
    this.emit('all-conflicts-cleared', {
      count,
      timestamp: new Date()
    });
    
    return count;
  }
  
  /**
   * Get resolver statistics
   */
  getStats(): {
    activeConflicts: number;
    manualConflicts: number;
    historySize: number;
    detectionEnabled: boolean;
    autoResolutionEnabled: boolean;
  } {
    const manualConflicts = this.getManualConflicts().length;
    
    return {
      activeConflicts: this.activeConflicts.size,
      manualConflicts,
      historySize: this.conflictHistory.length,
      detectionEnabled: this.config.detection.enabled,
      autoResolutionEnabled: this.config.resolution.enableAutoResolution
    };
  }
  
  /**
   * Get detailed conflict statistics
   */
  getDetailedStats(): {
    active: ReturnType<typeof getConflictStats>;
    history: ReturnType<typeof getConflictStats>;
    resolution: ReturnType<typeof getResolutionStats>;
  } {
    const activeConflicts = this.getActiveConflicts();
    const historyConflicts = this.getConflictHistory();
    
    // Get resolution results from history (simplified)
    const resolutionResults: ResolutionResult[] = historyConflicts
      .filter(c => c.resolved)
      .map(c => ({
        resolved: true,
        strategy: (c.resolutionStrategy as ResolutionStrategy) || 'unknown',
        resolvedOperations: [],
        conflict: c,
        message: 'Resolved'
      }));
    
    return {
      active: getConflictStats(activeConflicts),
      history: getConflictStats(historyConflicts),
      resolution: getResolutionStats(resolutionResults)
    };
  }
  
  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ConflictResolverConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
      detection: {
        ...this.config.detection,
        ...newConfig.detection
      },
      resolution: {
        ...this.config.resolution,
        ...newConfig.resolution
      }
    };
    
    this.emit('config-updated', {
      config: this.config,
      timestamp: new Date()
    });
  }
  
  /**
   * Export conflicts to JSON
   */
  exportToJson(): string {
    const exportData = {
      config: this.config,
      activeConflicts: Array.from(this.activeConflicts.values()),
      conflictHistory: this.conflictHistory,
      timestamp: new Date().toISOString()
    };
    
    return JSON.stringify(exportData, null, 2);
  }
  
  /**
   * Import conflicts from JSON
   */
  importFromJson(jsonString: string): void {
    const data = JSON.parse(jsonString);
    
    this.config = data.config;
    this.activeConflicts.clear();
    this.conflictHistory = data.conflictHistory || [];
    
    // Restore active conflicts
    for (const conflict of data.activeConflicts || []) {
      const conflictId = this.generateConflictId(conflict);
      this.activeConflicts.set(conflictId, conflict);
    }
    
    this.emit('conflicts-imported', {
      activeCount: this.activeConflicts.size,
      historyCount: this.conflictHistory.length,
      timestamp: new Date()
    });
  }
  
  /**
   * Generate unique conflict ID
   */
  private generateConflictId(conflict: ConflictInfo): string {
    const op1 = conflict.operation1;
    const op2 = conflict.operation2;
    
    // Sort operation IDs to ensure consistent conflict ID
    const sortedOpIds = [op1.id, op2.id].sort();
    
    return `conflict_${sortedOpIds[0]}_${sortedOpIds[1]}`;
  }
  
  /**
   * Add conflict to history
   */
  private addToHistory(conflict: ConflictInfo): void {
    this.conflictHistory.push(conflict);
    
    // Trim history if too large
    if (this.conflictHistory.length > this.config.conflictHistorySize) {
      this.conflictHistory = this.conflictHistory.slice(-this.config.conflictHistorySize);
    }
  }
  
  /**
   * Clean up old conflicts
   */
  private cleanupOldConflicts(): void {
    const maxConflicts = this.config.maxConflictsInMemory;
    
    if (this.activeConflicts.size <= maxConflicts) {
      return;
    }
    
    // Remove oldest conflicts (simplified: remove first N)
    const toRemove = this.activeConflicts.size - maxConflicts;
    const keys = Array.from(this.activeConflicts.keys()).slice(0, toRemove);
    
    for (const key of keys) {
      this.activeConflicts.delete(key);
    }
    
    this.emit('conflicts-cleaned', {
      removed: toRemove,
      remaining: this.activeConflicts.size,
      timestamp: new Date()
    });
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
   * Clean up resources
   */
  dispose(): void {
    this.activeConflicts.clear();
    this.conflictHistory = [];
    this.eventListeners.clear();
    
    this.emit('disposed', { timestamp: new Date() });
  }
}