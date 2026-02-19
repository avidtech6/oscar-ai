/**
 * Phase 8: Developer Tools
 * 
 * Provides debugging, visualization, and diagnostic tools for healing orchestration.
 * Includes healing trace, before/after diff, debugging mode, and visualization utilities.
 */

import type { SchemaMappingResult } from '../schema-mapper/SchemaMappingResult';
import type { ClassificationResult } from '../classification/ClassificationResult';
import type { SelfHealingActionBatch, SelfHealingAction } from '../self-healing/SelfHealingAction';
import type { HealingPassResult } from './HealingPassManager';
import type { HealingOrchestrationResult } from './HealingOrchestrator';
import type { HealingIntegrationResult } from './HealingResultIntegrator';
import type { HealingEvent } from './HealingEventTelemetry';

export interface HealingTraceEntry {
  id: string;
  timestamp: string;
  type: 'orchestration' | 'pass' | 'integration' | 'action' | 'event';
  component: string;
  operation: string;
  input?: any;
  output?: any;
  durationMs?: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface HealingDiff {
  before: any;
  after: any;
  changes: Array<{
    path: string;
    operation: 'added' | 'removed' | 'modified';
    before?: any;
    after?: any;
    description: string;
  }>;
  summary: {
    totalChanges: number;
    added: number;
    removed: number;
    modified: number;
  };
}

export interface HealingVisualizationData {
  timeline: HealingTraceEntry[];
  metrics: any;
  actions: SelfHealingAction[];
  passes: HealingPassResult[];
  integrations: HealingIntegrationResult[];
  events: HealingEvent[];
}

export interface HealingDebugConfig {
  enableTracing: boolean;
  enableDiffGeneration: boolean;
  enableVisualization: boolean;
  enablePerformanceProfiling: boolean;
  enableMemoryMonitoring: boolean;
  traceBufferSize: number;
  diffDepthLimit: number;
  visualizationOptions: {
    showTimeline: boolean;
    showMetrics: boolean;
    showActions: boolean;
    showPasses: boolean;
    showIntegrations: boolean;
  };
}

export class HealingDeveloperTools {
  private config: HealingDebugConfig;
  private traceBuffer: HealingTraceEntry[] = [];
  private diffCache: Map<string, HealingDiff> = new Map();
  private performanceProfiles: Map<string, any> = new Map();
  private memorySnapshots: Array<{
    timestamp: string;
    heapUsed: number;
    heapTotal: number;
    external: number;
    arrayBuffers: number;
  }> = [];
  
  // Visualization state
  private visualizationState: HealingVisualizationData = {
    timeline: [],
    metrics: {},
    actions: [],
    passes: [],
    integrations: [],
    events: []
  };

  constructor(config: Partial<HealingDebugConfig> = {}) {
    this.config = {
      enableTracing: true,
      enableDiffGeneration: true,
      enableVisualization: true,
      enablePerformanceProfiling: false,
      enableMemoryMonitoring: false,
      traceBufferSize: 10000,
      diffDepthLimit: 10,
      visualizationOptions: {
        showTimeline: true,
        showMetrics: true,
        showActions: true,
        showPasses: true,
        showIntegrations: true
      },
      ...config
    };
    
    // Start memory monitoring if enabled
    if (this.config.enableMemoryMonitoring) {
      this.startMemoryMonitoring();
    }
  }

  /**
   * Record a trace entry
   */
  public trace(
    type: HealingTraceEntry['type'],
    component: string,
    operation: string,
    input?: any,
    output?: any,
    durationMs?: number,
    success: boolean = true,
    error?: string,
    metadata?: Record<string, any>
  ): string {
    if (!this.config.enableTracing) {
      return '';
    }
    
    const traceId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const timestamp = new Date().toISOString();
    
    const traceEntry: HealingTraceEntry = {
      id: traceId,
      timestamp,
      type,
      component,
      operation,
      input: this.sanitizeForTrace(input),
      output: this.sanitizeForTrace(output),
      durationMs,
      success,
      error,
      metadata
    };
    
    // Add to trace buffer
    this.traceBuffer.push(traceEntry);
    
    // Trim buffer if exceeding size
    if (this.traceBuffer.length > this.config.traceBufferSize) {
      this.traceBuffer = this.traceBuffer.slice(-this.config.traceBufferSize);
    }
    
    // Update visualization state
    this.updateVisualizationState(traceEntry);
    
    return traceId;
  }

  /**
   * Sanitize data for tracing (prevent circular references, limit size)
   */
  private sanitizeForTrace(data: any): any {
    if (data === undefined || data === null) {
      return data;
    }
    
    // Handle primitives
    if (typeof data !== 'object') {
      return data;
    }
    
    // Handle arrays
    if (Array.isArray(data)) {
      return data.slice(0, 10).map(item => this.sanitizeForTrace(item)); // Limit array size
    }
    
    // Handle objects
    const sanitized: Record<string, any> = {};
    const keys = Object.keys(data);
    
    // Limit number of properties
    const limitedKeys = keys.slice(0, 20);
    
    for (const key of limitedKeys) {
      const value = data[key];
      
      // Skip functions and complex objects
      if (typeof value === 'function') {
        sanitized[key] = '[Function]';
      } else if (value && typeof value === 'object') {
        // Check for circular references by limiting depth
        sanitized[key] = this.limitObjectDepth(value, 3);
      } else {
        sanitized[key] = value;
      }
    }
    
    // Add indicator if properties were limited
    if (keys.length > limitedKeys.length) {
      sanitized['_trace_limited'] = `Properties limited from ${keys.length} to ${limitedKeys.length}`;
    }
    
    return sanitized;
  }

  /**
   * Limit object depth for tracing
   */
  private limitObjectDepth(obj: any, maxDepth: number, currentDepth: number = 0): any {
    if (currentDepth >= maxDepth) {
      return '[Object depth limited]';
    }
    
    if (Array.isArray(obj)) {
      return obj.slice(0, 5).map(item => 
        this.limitObjectDepth(item, maxDepth, currentDepth + 1)
      );
    }
    
    if (obj && typeof obj === 'object') {
      const limited: Record<string, any> = {};
      const keys = Object.keys(obj).slice(0, 10); // Limit keys
      
      for (const key of keys) {
        limited[key] = this.limitObjectDepth(obj[key], maxDepth, currentDepth + 1);
      }
      
      if (Object.keys(obj).length > keys.length) {
        limited['_keys_limited'] = `Keys limited to ${keys.length}`;
      }
      
      return limited;
    }
    
    return obj;
  }

  /**
   * Generate diff between two states
   */
  public generateDiff(
    before: any,
    after: any,
    id: string = `diff_${Date.now()}`
  ): HealingDiff {
    if (!this.config.enableDiffGeneration) {
      return {
        before,
        after,
        changes: [],
        summary: { totalChanges: 0, added: 0, removed: 0, modified: 0 }
      };
    }
    
    // Check cache
    const cachedDiff = this.diffCache.get(id);
    if (cachedDiff) {
      return cachedDiff;
    }
    
    const changes: HealingDiff['changes'] = [];
    
    // Simple diff implementation
    // In a real implementation, you'd use a proper diffing library
    this.findDifferences(before, after, '', changes, 0);
    
    const diff: HealingDiff = {
      before: this.sanitizeForTrace(before),
      after: this.sanitizeForTrace(after),
      changes,
      summary: {
        totalChanges: changes.length,
        added: changes.filter(c => c.operation === 'added').length,
        removed: changes.filter(c => c.operation === 'removed').length,
        modified: changes.filter(c => c.operation === 'modified').length
      }
    };
    
    // Cache the diff
    this.diffCache.set(id, diff);
    
    // Trim cache if too large
    if (this.diffCache.size > 100) {
      const keys = Array.from(this.diffCache.keys());
      for (let i = 0; i < 20; i++) {
        this.diffCache.delete(keys[i]);
      }
    }
    
    return diff;
  }

  /**
   * Find differences between two objects
   */
  private findDifferences(
    before: any,
    after: any,
    path: string,
    changes: HealingDiff['changes'],
    depth: number
  ): void {
    if (depth >= this.config.diffDepthLimit) {
      return;
    }
    
    // Handle null/undefined cases
    if (before === undefined && after !== undefined) {
      changes.push({
        path,
        operation: 'added',
        after,
        description: `Added at ${path}`
      });
      return;
    }
    
    if (before !== undefined && after === undefined) {
      changes.push({
        path,
        operation: 'removed',
        before,
        description: `Removed from ${path}`
      });
      return;
    }
    
    // Handle primitives
    if (typeof before !== 'object' || typeof after !== 'object' || before === null || after === null) {
      if (before !== after) {
        changes.push({
          path,
          operation: 'modified',
          before,
          after,
          description: `Changed from ${JSON.stringify(before)} to ${JSON.stringify(after)} at ${path}`
        });
      }
      return;
    }
    
    // Handle arrays
    if (Array.isArray(before) && Array.isArray(after)) {
      // Compare array lengths
      if (before.length !== after.length) {
        changes.push({
          path,
          operation: 'modified',
          before: before.length,
          after: after.length,
          description: `Array length changed from ${before.length} to ${after.length} at ${path}`
        });
      }
      
      // Compare array elements (limited)
      const maxElements = Math.min(before.length, after.length, 10);
      for (let i = 0; i < maxElements; i++) {
        this.findDifferences(before[i], after[i], `${path}[${i}]`, changes, depth + 1);
      }
      return;
    }
    
    // Handle objects
    const beforeKeys = new Set(Object.keys(before));
    const afterKeys = new Set(Object.keys(after));
    
    // Find added keys
    for (const key of afterKeys) {
      if (!beforeKeys.has(key)) {
        changes.push({
          path: path ? `${path}.${key}` : key,
          operation: 'added',
          after: after[key],
          description: `Added property ${key}`
        });
      }
    }
    
    // Find removed keys
    for (const key of beforeKeys) {
      if (!afterKeys.has(key)) {
        changes.push({
          path: path ? `${path}.${key}` : key,
          operation: 'removed',
          before: before[key],
          description: `Removed property ${key}`
        });
      }
    }
    
    // Find modified keys
    for (const key of beforeKeys) {
      if (afterKeys.has(key)) {
        this.findDifferences(before[key], after[key], path ? `${path}.${key}` : key, changes, depth + 1);
      }
    }
  }

  /**
   * Start performance profiling for an operation
   */
  public startProfile(profileId: string): void {
    if (!this.config.enablePerformanceProfiling) {
      return;
    }
    
    const profile = {
      id: profileId,
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
      memoryStart: this.getMemoryUsage(),
      memoryEnd: null as any,
      traceEntries: [] as string[]
    };
    
    this.performanceProfiles.set(profileId, profile);
    
    // Record trace entry for profile start
    this.trace('action', 'developer-tools', 'profile-start', { profileId });
  }

  /**
   * End performance profiling
   */
  public endProfile(profileId: string): any {
    if (!this.config.enablePerformanceProfiling) {
      return null;
    }
    
    const profile = this.performanceProfiles.get(profileId);
    if (!profile) {
      return null;
    }
    
    profile.endTime = performance.now();
    profile.duration = profile.endTime - profile.startTime;
    profile.memoryEnd = this.getMemoryUsage();
    
    // Calculate memory delta
    const memoryDelta = {
      heapUsed: profile.memoryEnd.heapUsed - profile.memoryStart.heapUsed,
      heapTotal: profile.memoryEnd.heapTotal - profile.memoryStart.heapTotal,
      external: profile.memoryEnd.external - profile.memoryStart.external,
      arrayBuffers: profile.memoryEnd.arrayBuffers - profile.memoryStart.arrayBuffers
    };
    
    // Record trace entry for profile end
    this.trace('action', 'developer-tools', 'profile-end', {
      profileId,
      duration: profile.duration,
      memoryDelta
    });
    
    return {
      ...profile,
      memoryDelta
    };
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): any {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage();
    }
    
    // Browser environment or Node.js without process.memoryUsage
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory;
    }
    
    // Fallback
    return {
      heapUsed: 0,
      heapTotal: 0,
      external: 0,
      arrayBuffers: 0
    };
  }

  /**
   * Start memory monitoring
   */
  private startMemoryMonitoring(): void {
    if (!this.config.enableMemoryMonitoring) {
      return;
    }
    
    const monitorInterval = setInterval(() => {
      const memoryUsage = this.getMemoryUsage();
      const snapshot = {
        timestamp: new Date().toISOString(),
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external,
        arrayBuffers: memoryUsage.arrayBuffers
      };
      
      this.memorySnapshots.push(snapshot);
      
      // Keep only last 1000 snapshots
      if (this.memorySnapshots.length > 1000) {
        this.memorySnapshots = this.memorySnapshots.slice(-500);
      }
    }, 5000); // Every 5 seconds
    
    // Store interval ID for cleanup
    (this as any)._memoryMonitorInterval = monitorInterval;
  }

  /**
   * Stop memory monitoring
   */
  public stopMemoryMonitoring(): void {
    if ((this as any)._memoryMonitorInterval) {
      clearInterval((this as any)._memoryMonitorInterval);
      (this as any)._memoryMonitorInterval = null;
    }
  }

  /**
   * Update visualization state
   */
  private updateVisualizationState(traceEntry: HealingTraceEntry): void {
    if (!this.config.enableVisualization) {
      return;
    }
    
    this.visualizationState.timeline.push(traceEntry);
    
    // Keep timeline limited
    if (this.visualizationState.timeline.length > 1000) {
      this.visualizationState.timeline = this.visualizationState.timeline.slice(-500);
    }
  }

  /**
   * Update visualization with healing data
   */
  public updateVisualizationData(data: {
    metrics?: any;
    actions?: SelfHealingAction[];
    passes?: HealingPassResult[];
    integrations?: HealingIntegrationResult[];
    events?: HealingEvent[];
  }): void {
    if (!this.config.enableVisualization) {
      return;
    }
    
    if (data.metrics) {
      this.visualizationState.metrics = data.metrics;
    }
    
    if (data.actions) {
      this.visualizationState.actions = data.actions;
    }
    
    if (data.passes) {
      this.visualizationState.passes = data.passes;
    }
    
    if (data.integrations) {
      this.visualizationState.integrations = data.integrations;
    }
    
    if (data.events) {
      this.visualizationState.events = data.events;
    }
  }

  /**
   * Get visualization data
   */
  public getVisualizationData(): HealingVisualizationData {
    return { ...this.visualizationState };
  }

  /**
   * Generate healing report
   */
  public generateHealingReport(): {
    traceSummary: any;
    diffSummary: any;
    performanceSummary: any;
    memorySummary: any;
    visualizationData: HealingVisualizationData;
  } {
    // Trace summary
    const traceSummary = {
      totalEntries: this.traceBuffer.length,
      byType: {} as Record<string, number>,
      byComponent: {} as Record<string, number>,
      successRate: 0
    };
    
    let successfulEntries = 0;
    
    this.traceBuffer.forEach(entry => {
      traceSummary.byType[entry.type] = (traceSummary.byType[entry.type] || 0) + 1;
      traceSummary.byComponent[entry.component] = (traceSummary.byComponent[entry.component] || 0) + 1;
      
      if (entry.success) {
        successfulEntries++;
      }
    });
    
    traceSummary.successRate = this.traceBuffer.length > 0 
      ? successfulEntries / this.traceBuffer.length 
      : 0;
    
    // Diff summary
    const diffSummary = {
      totalDiffs: this.diffCache.size,
      diffIds: Array.from(this.diffCache.keys())
    };
    
    // Performance summary
    const performanceSummary = {
      totalProfiles: this.performanceProfiles.size,
      profiles: Array.from(this.performanceProfiles.values()).map(profile => ({
        id: profile.id,
        duration: profile.duration,
        memoryDelta: profile.memoryDelta
      }))
    };
    
    // Memory summary
    const memorySummary = {
      totalSnapshots: this.memorySnapshots.length,
      latestSnapshot: this.memorySnapshots[this.memorySnapshots.length - 1] || null,
      averageHeapUsed: 0
    };
    
    if (this.memorySnapshots.length > 0) {
      const totalHeapUsed = this.memorySnapshots.reduce((sum, snapshot) => sum + snapshot.heapUsed, 0);
      memorySummary.averageHeapUsed = totalHeapUsed / this.memorySnapshots.length;
    }
    
    return {
      traceSummary,
      diffSummary,
      performanceSummary,
      memorySummary,
      visualizationData: this.getVisualizationData()
    };
  }

  /**
   * Get trace entries
   */
  public getTraceEntries(limit: number = 100): HealingTraceEntry[] {
    return this.traceBuffer.slice(-limit);
  }

  /**
   * Get trace entries by type
   */
  public getTraceEntriesByType(type: string, limit: number = 100): HealingTraceEntry[] {
    return this.traceBuffer
      .filter(entry => entry.type === type)
      .slice(-limit);
  }

  /**
   * Get diff by ID
   */
  public getDiff(id: string): HealingDiff | undefined {
    return this.diffCache.get(id);
  }

  /**
   * Get all diffs
   */
  public getAllDiffs(): Map<string, HealingDiff> {
    return new Map(this.diffCache);
  }

  /**
   * Get performance profile by ID
   */
  public getPerformanceProfile(id: string): any | undefined {
    return this.performanceProfiles.get(id);
  }

  /**
   * Get all performance profiles
   */
  public getAllPerformanceProfiles(): Map<string, any> {
    return new Map(this.performanceProfiles);
  }

  /**
   * Get memory snapshots
   */
  public getMemorySnapshots(limit: number = 100): any[] {
    return this.memorySnapshots.slice(-limit);
  }

  /**
   * Clear all data
   */
  public clearData(): void {
    this.traceBuffer = [];
    this.diffCache.clear();
    this.performanceProfiles.clear();
    this.memorySnapshots = [];
    this.visualizationState = {
      timeline: [],
      metrics: {},
      actions: [],
      passes: [],
      integrations: [],
      events: []
    };
  }

  /**
   * Export data for debugging
   */
  public exportData(): {
    trace: HealingTraceEntry[];
    diffs: Array<{ id: string; diff: HealingDiff }>;
    performanceProfiles: Array<{ id: string; profile: any }>;
    memorySnapshots: any[];
    visualization: HealingVisualizationData;
  } {
    return {
      trace: this.getTraceEntries(1000),
      diffs: Array.from(this.diffCache.entries()).map(([id, diff]) => ({ id, diff })),
      performanceProfiles: Array.from(this.performanceProfiles.entries()).map(([id, profile]) => ({ id, profile })),
      memorySnapshots: this.getMemorySnapshots(1000),
      visualization: this.getVisualizationData()
    };
  }

  /**
   * Import data for debugging
   */
  public importData(data: {
    trace?: HealingTraceEntry[];
    diffs?: Array<{ id: string; diff: HealingDiff }>;
    performanceProfiles?: Array<{ id: string; profile: any }>;
    memorySnapshots?: any[];
    visualization?: Partial<HealingVisualizationData>;
  }): void {
    if (data.trace) {
      this.traceBuffer = data.trace;
    }
    
    if (data.diffs) {
      this.diffCache.clear();
      data.diffs.forEach(({ id, diff }) => {
        this.diffCache.set(id, diff);
      });
    }
    
    if (data.performanceProfiles) {
      this.performanceProfiles.clear();
      data.performanceProfiles.forEach(({ id, profile }) => {
        this.performanceProfiles.set(id, profile);
      });
    }
    
    if (data.memorySnapshots) {
      this.memorySnapshots = data.memorySnapshots;
    }
    
    if (data.visualization) {
      this.visualizationState = {
        ...this.visualizationState,
        ...data.visualization
      };
    }
  }

  /**
   * Validate configuration
   */
  public validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (this.config.traceBufferSize <= 0) {
      errors.push('traceBufferSize must be greater than 0');
    }
    
    if (this.config.diffDepthLimit <= 0) {
      errors.push('diffDepthLimit must be greater than 0');
    }
    
    if (this.config.traceBufferSize > 1000000) {
      errors.push('traceBufferSize cannot exceed 1,000,000');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Reset developer tools
   */
  public reset(): void {
    this.clearData();
    this.stopMemoryMonitoring();
    
    // Restart memory monitoring if enabled
    if (this.config.enableMemoryMonitoring) {
      this.startMemoryMonitoring();
    }
  }
}
