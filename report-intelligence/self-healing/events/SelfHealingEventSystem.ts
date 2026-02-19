/**
 * Self Healing Event System
 * Enhanced event system for the Report Self-Healing Engine
 */

import type { SelfHealingAction, SelfHealingActionBatch } from '../SelfHealingAction';
import type { SchemaMappingResult } from '../../schema-mapper/SchemaMappingResult';
import type { ClassificationResult } from '../../classification/ClassificationResult';

/**
 * Self-healing event types
 */
export type SelfHealingEventType =
  | 'selfHealing:engine:initialized'
  | 'selfHealing:engine:shutdown'
  | 'selfHealing:analysis:started'
  | 'selfHealing:analysis:completed'
  | 'selfHealing:analysis:failed'
  | 'selfHealing:detector:started'
  | 'selfHealing:detector:completed'
  | 'selfHealing:detector:foundIssues'
  | 'selfHealing:actions:generated'
  | 'selfHealing:actions:prioritized'
  | 'selfHealing:actions:batchCreated'
  | 'selfHealing:actions:applying'
  | 'selfHealing:actions:applied'
  | 'selfHealing:actions:failed'
  | 'selfHealing:actions:skipped'
  | 'selfHealing:storage:saved'
  | 'selfHealing:storage:loaded'
  | 'selfHealing:storage:error'
  | 'selfHealing:integration:phase1'
  | 'selfHealing:integration:phase3'
  | 'selfHealing:integration:phase4'
  | 'selfHealing:integration:phase6'
  | 'selfHealing:error'
  | '*'; // Wildcard for all events

/**
 * Event data interfaces for each event type
 */
export interface SelfHealingEventData {
  event: SelfHealingEventType;
  timestamp: Date;
  source: string;
  correlationId?: string;
}

export interface EngineInitializedEvent extends SelfHealingEventData {
  event: 'selfHealing:engine:initialized';
  data: {
    config: any;
    version: string;
  };
}

export interface EngineShutdownEvent extends SelfHealingEventData {
  event: 'selfHealing:engine:shutdown';
  data: {
    totalAnalyses: number;
    totalActionsGenerated: number;
    totalActionsApplied: number;
    uptimeMs: number;
  };
}

export interface AnalysisStartedEvent extends SelfHealingEventData {
  event: 'selfHealing:analysis:started';
  data: {
    mappingResultId: string;
    classificationResultId?: string;
    reportTypeId?: string;
  };
}

export interface AnalysisCompletedEvent extends SelfHealingEventData {
  event: 'selfHealing:analysis:completed';
  data: {
    mappingResultId: string;
    batchId: string;
    totalActions: number;
    processingTimeMs: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
  };
}

export interface AnalysisFailedEvent extends SelfHealingEventData {
  event: 'selfHealing:analysis:failed';
  data: {
    mappingResultId: string;
    error: string;
    stackTrace?: string;
  };
}

export interface DetectorStartedEvent extends SelfHealingEventData {
  event: 'selfHealing:detector:started';
  data: {
    detector: string;
    mappingResultId: string;
  };
}

export interface DetectorCompletedEvent extends SelfHealingEventData {
  event: 'selfHealing:detector:completed';
  data: {
    detector: string;
    mappingResultId: string;
    findingsCount: number;
    actionsGenerated: number;
    confidence: number;
    processingTimeMs: number;
  };
}

export interface DetectorFoundIssuesEvent extends SelfHealingEventData {
  event: 'selfHealing:detector:foundIssues';
  data: {
    detector: string;
    mappingResultId: string;
    issues: Array<{
      type: string;
      severity: string;
      description: string;
      confidence: number;
    }>;
  };
}

export interface ActionsGeneratedEvent extends SelfHealingEventData {
  event: 'selfHealing:actions:generated';
  data: {
    mappingResultId: string;
    actions: SelfHealingAction[];
    totalCount: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
  };
}

export interface ActionsPrioritizedEvent extends SelfHealingEventData {
  event: 'selfHealing:actions:prioritized';
  data: {
    mappingResultId: string;
    prioritizedActions: SelfHealingAction[];
    priorityScores: Record<string, number>;
  };
}

export interface BatchCreatedEvent extends SelfHealingEventData {
  event: 'selfHealing:actions:batchCreated';
  data: {
    batchId: string;
    mappingResultId: string;
    actions: SelfHealingAction[];
    summary: any;
  };
}

export interface ActionsApplyingEvent extends SelfHealingEventData {
  event: 'selfHealing:actions:applying';
  data: {
    batchId: string;
    actionIds: string[];
    totalActions: number;
  };
}

export interface ActionsAppliedEvent extends SelfHealingEventData {
  event: 'selfHealing:actions:applied';
  data: {
    batchId: string;
    appliedActions: number;
    failedActions: number;
    skippedActions: number;
    details: Array<{
      actionId: string;
      status: string;
      error?: string;
    }>;
  };
}

export interface ActionsFailedEvent extends SelfHealingEventData {
  event: 'selfHealing:actions:failed';
  data: {
    batchId: string;
    actionId: string;
    error: string;
    retryCount: number;
  };
}

export interface ActionsSkippedEvent extends SelfHealingEventData {
  event: 'selfHealing:actions:skipped';
  data: {
    batchId: string;
    actionId: string;
    reason: string;
    severity: string;
    confidence: number;
  };
}

export interface StorageSavedEvent extends SelfHealingEventData {
  event: 'selfHealing:storage:saved';
  data: {
    storagePath: string;
    actionCount: number;
    batchCount: number;
    fileSizeBytes: number;
  };
}

export interface StorageLoadedEvent extends SelfHealingEventData {
  event: 'selfHealing:storage:loaded';
  data: {
    storagePath: string;
    actionCount: number;
    batchCount: number;
    version: string;
  };
}

export interface StorageErrorEvent extends SelfHealingEventData {
  event: 'selfHealing:storage:error';
  data: {
    storagePath: string;
    error: string;
    operation: 'save' | 'load' | 'delete' | 'update';
  };
}

export interface IntegrationPhase1Event extends SelfHealingEventData {
  event: 'selfHealing:integration:phase1';
  data: {
    reportTypeId: string;
    registryAction: 'check' | 'update' | 'create';
    result: any;
  };
}

export interface IntegrationPhase3Event extends SelfHealingEventData {
  event: 'selfHealing:integration:phase3';
  data: {
    mappingResultId: string;
    schemaAction: 'validate' | 'update' | 'enhance';
    result: any;
  };
}

export interface IntegrationPhase4Event extends SelfHealingEventData {
  event: 'selfHealing:integration:phase4';
  data: {
    schemaUpdaterAction: 'apply' | 'rollback' | 'validate';
    actionId: string;
    result: any;
  };
}

export interface IntegrationPhase6Event extends SelfHealingEventData {
  event: 'selfHealing:integration:phase6';
  data: {
    classificationResultId: string;
    classificationAction: 'enhance' | 'validate' | 'correct';
    result: any;
  };
}

export interface ErrorEvent extends SelfHealingEventData {
  event: 'selfHealing:error';
  data: {
    error: string;
    context: string;
    stackTrace?: string;
    recoverable: boolean;
  };
}

/**
 * Union type of all possible events
 */
export type SelfHealingEvent =
  | EngineInitializedEvent
  | EngineShutdownEvent
  | AnalysisStartedEvent
  | AnalysisCompletedEvent
  | AnalysisFailedEvent
  | DetectorStartedEvent
  | DetectorCompletedEvent
  | DetectorFoundIssuesEvent
  | ActionsGeneratedEvent
  | ActionsPrioritizedEvent
  | BatchCreatedEvent
  | ActionsApplyingEvent
  | ActionsAppliedEvent
  | ActionsFailedEvent
  | ActionsSkippedEvent
  | StorageSavedEvent
  | StorageLoadedEvent
  | StorageErrorEvent
  | IntegrationPhase1Event
  | IntegrationPhase3Event
  | IntegrationPhase4Event
  | IntegrationPhase6Event
  | ErrorEvent;

/**
 * Event listener type
 */
export type SelfHealingEventListener = (event: SelfHealingEvent) => void;

/**
 * Event system configuration
 */
export interface SelfHealingEventSystemConfig {
  enableLogging: boolean;
  enableMetrics: boolean;
  maxListeners: number;
  correlationIdPrefix: string;
}

/**
 * Self Healing Event System
 */
export class SelfHealingEventSystem {
  private listeners: Map<SelfHealingEventType, SelfHealingEventListener[]> = new Map();
  private config: SelfHealingEventSystemConfig;
  private correlationIdCounter: number = 0;
  private eventHistory: SelfHealingEvent[] = [];
  private maxHistorySize: number = 1000;

  constructor(config: Partial<SelfHealingEventSystemConfig> = {}) {
    this.config = {
      enableLogging: true,
      enableMetrics: true,
      maxListeners: 10,
      correlationIdPrefix: 'selfhealing',
      ...config
    };
  }

  /**
   * Generate a correlation ID
   */
  private generateCorrelationId(): string {
    this.correlationIdCounter++;
    return `${this.config.correlationIdPrefix}_${Date.now()}_${this.correlationIdCounter}`;
  }

  /**
   * Emit an event
   */
  public emit<T extends SelfHealingEventType>(
    eventType: T,
    data: Extract<SelfHealingEvent, { event: T }>['data'],
    source: string = 'self-healing-engine',
    correlationId?: string
  ): void {
    const event: SelfHealingEvent = {
      event: eventType,
      timestamp: new Date(),
      source,
      correlationId: correlationId || this.generateCorrelationId(),
      data
    } as SelfHealingEvent;

    // Add to history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }

    // Log if enabled
    if (this.config.enableLogging) {
      console.log(`[SelfHealingEvent] ${eventType}`, {
        timestamp: event.timestamp.toISOString(),
        source,
        correlationId: event.correlationId,
        data
      });
    }

    // Notify listeners
    const eventListeners = this.listeners.get(eventType) || [];
    eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error(`Error in event listener for ${eventType}:`, error);
      }
    });

    // Also notify wildcard listeners
    const wildcardListeners = this.listeners.get('*' as SelfHealingEventType) || [];
    wildcardListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error(`Error in wildcard event listener for ${eventType}:`, error);
      }
    });
  }

  /**
   * Add an event listener
   */
  public on(eventType: SelfHealingEventType | '*', listener: SelfHealingEventListener): void {
    const listeners = this.listeners.get(eventType) || [];
    
    // Check max listeners
    if (listeners.length >= this.config.maxListeners) {
      console.warn(`Maximum listeners (${this.config.maxListeners}) reached for event ${eventType}`);
      return;
    }
    
    listeners.push(listener);
    this.listeners.set(eventType, listeners);
  }

  /**
   * Remove an event listener
   */
  public off(eventType: SelfHealingEventType | '*', listener: SelfHealingEventListener): void {
    const listeners = this.listeners.get(eventType) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
      this.listeners.set(eventType, listeners);
    }
  }

  /**
   * Remove all listeners for an event type
   */
  public removeAllListeners(eventType?: SelfHealingEventType): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get event history
   */
  public getEventHistory(filter?: {
    eventType?: SelfHealingEventType | SelfHealingEventType[];
    source?: string;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  }): SelfHealingEvent[] {
    let history = [...this.eventHistory];

    if (filter?.eventType) {
      const eventTypes = Array.isArray(filter.eventType) ? filter.eventType : [filter.eventType];
      history = history.filter(event => eventTypes.includes(event.event));
    }

    if (filter?.source) {
      history = history.filter(event => event.source === filter.source);
    }

    if (filter?.startTime) {
      const start = filter.startTime.getTime();
      history = history.filter(event => event.timestamp.getTime() >= start);
    }

    if (filter?.endTime) {
      const end = filter.endTime.getTime();
      history = history.filter(event => event.timestamp.getTime() <= end);
    }

    if (filter?.limit && filter.limit > 0) {
      history = history.slice(-filter.limit);
    }

    return history;
  }

  /**
   * Get event statistics
   */
  public getEventStatistics(): {
    totalEvents: number;
    byEventType: Record<SelfHealingEventType, number>;
    bySource: Record<string, number>;
    byHour: Record<string, number>;
  } {
    const stats = {
      totalEvents: this.eventHistory.length,
      byEventType: {} as Record<SelfHealingEventType, number>,
      bySource: {} as Record<string, number>,
      byHour: {} as Record<string, number>
    };

    this.eventHistory.forEach(event => {
      // Count by event type
      stats.byEventType[event.event] = (stats.byEventType[event.event] || 0) + 1;
      
      // Count by source
      stats.bySource[event.source] = (stats.bySource[event.source] || 0) + 1;
      
      // Count by hour
      const hour = event.timestamp.toISOString().substring(0, 13) + ':00';
      stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear event history
   */
  public clearEventHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Create a child event system with shared configuration
   */
  public createChildSystem(source: string): SelfHealingEventSystem {
    const childSystem = new SelfHealingEventSystem(this.config);
    
    // Forward all child events to parent
    childSystem.on('*', (event) => {
      this.emit(event.event, event.data, `${source}.${event.source}`, event.correlationId);
    });
    
    return childSystem;
  }

  /**
   * Create event builders for common scenarios
   */
  public createAnalysisStartedEvent(
    mappingResult: SchemaMappingResult,
    classificationResult?: ClassificationResult
  ): AnalysisStartedEvent {
    return {
      event: 'selfHealing:analysis:started',
      timestamp: new Date(),
      source: 'self-healing-engine',
      correlationId: this.generateCorrelationId(),
      data: {
        mappingResultId: mappingResult.id,
        classificationResultId: classificationResult?.id,
        reportTypeId: mappingResult.reportTypeId
      }
    };
  }

  public createActionsGeneratedEvent(
    mappingResultId: string,
    actions: SelfHealingAction[]
  ): ActionsGeneratedEvent {
    const bySeverity: Record<string, number> = {};
    const byType: Record<string, number> = {};
    
    actions.forEach(action => {
      bySeverity[action.severity] = (bySeverity[action.severity] || 0) + 1;
      byType[action.type] = (byType[action.type] || 0) + 1;
    });
    
    return {
      event: 'selfHealing:actions:generated',
      timestamp: new Date(),
      source: 'self-healing-engine',
      correlationId: this.generateCorrelationId(),
      data: {
        mappingResultId,
        actions,
        totalCount: actions.length,
        bySeverity,
        byType
      }
    };
  }

  public createErrorEvent(
    error: Error,
    context: string,
    recoverable: boolean = false
  ): ErrorEvent {
    return {
      event: 'selfHealing:error',
      timestamp: new Date(),
      source: 'self-healing-engine',
      correlationId: this.generateCorrelationId(),
      data: {
        error: error.message,
        context,
        stackTrace: error.stack,
        recoverable
      }
    };
  }
}