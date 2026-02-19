/**
 * Phase 8: Event & Telemetry Integration
 * 
 * Provides comprehensive event system and telemetry for healing orchestration.
 * Integrates with global event bus, provides metrics, monitoring, and observability.
 */

import type { SchemaMappingResult } from '../schema-mapper/SchemaMappingResult';
import type { ClassificationResult } from '../classification/ClassificationResult';
import type { SelfHealingActionBatch, SelfHealingAction } from '../self-healing/SelfHealingAction';
import type { HealingPassResult } from './HealingPassManager';
import type { HealingOrchestrationResult } from './HealingOrchestrator';
import type { HealingIntegrationResult } from './HealingResultIntegrator';

export type HealingEventType =
  | 'healing:orchestration:started'
  | 'healing:orchestration:completed'
  | 'healing:orchestration:failed'
  | 'healing:pass:registered'
  | 'healing:pass:started'
  | 'healing:pass:completed'
  | 'healing:pass:failed'
  | 'healing:integration:started'
  | 'healing:integration:completed'
  | 'healing:integration:failed'
  | 'healing:action:generated'
  | 'healing:action:applied'
  | 'healing:action:rejected'
  | 'healing:batch:created'
  | 'healing:batch:processed'
  | 'healing:metrics:updated'
  | 'healing:error:occurred'
  | 'healing:warning:issued'
  | 'healing:debug:log';

export interface HealingEvent {
  id: string;
  type: HealingEventType;
  timestamp: string;
  correlationId?: string;
  sessionId?: string;
  userId?: string;
  source: string;
  payload: any;
  metadata: {
    severity: 'debug' | 'info' | 'warning' | 'error' | 'critical';
    component: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
  };
}

export interface HealingTelemetryMetrics {
  // Orchestration metrics
  totalOrchestrations: number;
  successfulOrchestrations: number;
  failedOrchestrations: number;
  averageOrchestrationTimeMs: number;
  
  // Pass metrics
  totalPassesExecuted: number;
  successfulPasses: number;
  failedPasses: number;
  averagePassTimeMs: number;
  
  // Integration metrics
  totalIntegrations: number;
  successfulIntegrations: number;
  partialIntegrations: number;
  failedIntegrations: number;
  averageIntegrationTimeMs: number;
  
  // Action metrics
  totalActionsGenerated: number;
  totalActionsApplied: number;
  totalActionsRejected: number;
  averageActionConfidence: number;
  
  // Performance metrics
  healingThroughput: number; // Actions per minute
  healingLatencyP50: number; // 50th percentile latency
  healingLatencyP95: number; // 95th percentile latency
  healingLatencyP99: number; // 99th percentile latency
  
  // Quality metrics
  improvementScoreAverage: number;
  contradictionResolutionRate: number;
  schemaCompletenessImprovement: number;
  
  // Timestamps
  metricsUpdatedAt: string;
  collectionStartedAt: string;
}

export interface HealingEventBusConfig {
  enableGlobalEventBus: boolean;
  enableTelemetry: boolean;
  enableMetricsCollection: boolean;
  enableEventPersistence: boolean;
  enableRealTimeMonitoring: boolean;
  maxEventsInMemory: number;
  flushIntervalMs: number;
  telemetryEndpoint?: string;
  eventHandlers: HealingEventHandler[];
}

export type HealingEventHandler = (event: HealingEvent) => Promise<void> | void;

export class HealingEventTelemetry {
  private config: HealingEventBusConfig;
  private events: HealingEvent[] = [];
  private metrics: HealingTelemetryMetrics;
  private eventHandlers: Map<HealingEventType, HealingEventHandler[]> = new Map();
  private globalEventBus: any = null; // Would be connected to global event bus
  
  // Performance tracking
  private performanceEntries: Array<{
    type: string;
    startTime: number;
    endTime: number;
    duration: number;
  }> = [];
  
  // Error tracking
  private errorLog: Array<{
    timestamp: string;
    error: string;
    context: any;
    severity: 'error' | 'warning' | 'critical';
  }> = [];

  constructor(config: Partial<HealingEventBusConfig> = {}) {
    this.config = {
      enableGlobalEventBus: true,
      enableTelemetry: true,
      enableMetricsCollection: true,
      enableEventPersistence: false,
      enableRealTimeMonitoring: true,
      maxEventsInMemory: 10000,
      flushIntervalMs: 60000, // 1 minute
      eventHandlers: [],
      ...config
    };
    
    // Initialize metrics
    this.metrics = this.initializeMetrics();
    
    // Register default event handlers
    this.registerDefaultEventHandlers();
    
    // Start metrics collection if enabled
    if (this.config.enableMetricsCollection) {
      this.startMetricsCollection();
    }
    
    // Start event flushing if persistence is enabled
    if (this.config.enableEventPersistence) {
      this.startEventFlushing();
    }
  }

  /**
   * Initialize metrics
   */
  private initializeMetrics(): HealingTelemetryMetrics {
    const now = new Date().toISOString();
    
    return {
      totalOrchestrations: 0,
      successfulOrchestrations: 0,
      failedOrchestrations: 0,
      averageOrchestrationTimeMs: 0,
      
      totalPassesExecuted: 0,
      successfulPasses: 0,
      failedPasses: 0,
      averagePassTimeMs: 0,
      
      totalIntegrations: 0,
      successfulIntegrations: 0,
      partialIntegrations: 0,
      failedIntegrations: 0,
      averageIntegrationTimeMs: 0,
      
      totalActionsGenerated: 0,
      totalActionsApplied: 0,
      totalActionsRejected: 0,
      averageActionConfidence: 0,
      
      healingThroughput: 0,
      healingLatencyP50: 0,
      healingLatencyP95: 0,
      healingLatencyP99: 0,
      
      improvementScoreAverage: 0,
      contradictionResolutionRate: 0,
      schemaCompletenessImprovement: 0,
      
      metricsUpdatedAt: now,
      collectionStartedAt: now
    };
  }

  /**
   * Register default event handlers
   */
  private registerDefaultEventHandlers(): void {
    // Metrics collection handler
    this.registerEventHandler('healing:orchestration:completed', async (event) => {
      this.metrics.totalOrchestrations++;
      this.metrics.successfulOrchestrations++;
      this.updateOrchestrationMetrics(event);
    });
    
    this.registerEventHandler('healing:orchestration:failed', async (event) => {
      this.metrics.totalOrchestrations++;
      this.metrics.failedOrchestrations++;
    });
    
    this.registerEventHandler('healing:pass:completed', async (event) => {
      this.metrics.totalPassesExecuted++;
      this.metrics.successfulPasses++;
      this.updatePassMetrics(event);
    });
    
    this.registerEventHandler('healing:pass:failed', async (event) => {
      this.metrics.totalPassesExecuted++;
      this.metrics.failedPasses++;
    });
    
    this.registerEventHandler('healing:integration:completed', async (event) => {
      this.metrics.totalIntegrations++;
      this.metrics.successfulIntegrations++;
      this.updateIntegrationMetrics(event);
    });
    
    this.registerEventHandler('healing:integration:failed', async (event) => {
      this.metrics.totalIntegrations++;
      this.metrics.failedIntegrations++;
    });
    
    this.registerEventHandler('healing:action:generated', async (event) => {
      this.metrics.totalActionsGenerated++;
      this.updateActionMetrics(event);
    });
    
    this.registerEventHandler('healing:action:applied', async (event) => {
      this.metrics.totalActionsApplied++;
    });
    
    this.registerEventHandler('healing:action:rejected', async (event) => {
      this.metrics.totalActionsRejected++;
    });
    
    // Error logging handler
    this.registerEventHandler('healing:error:occurred', async (event) => {
      this.logError(event.payload.error, event.payload.context, 'error');
    });
    
    this.registerEventHandler('healing:warning:issued', async (event) => {
      this.logError(event.payload.warning, event.payload.context, 'warning');
    });
  }

  /**
   * Emit a healing event
   */
  public emitEvent(
    type: HealingEventType,
    payload: any,
    metadata: Partial<HealingEvent['metadata']> = {}
  ): string {
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const timestamp = new Date().toISOString();
    
    const event: HealingEvent = {
      id: eventId,
      type,
      timestamp,
      correlationId: payload.correlationId,
      sessionId: payload.sessionId,
      userId: payload.userId,
      source: 'healing-orchestration',
      payload,
      metadata: {
        severity: metadata.severity || 'info',
        component: metadata.component || 'healing-orchestration',
        version: metadata.version || '1.0.0',
        environment: metadata.environment || 'development',
        ...metadata
      }
    };
    
    // Store event in memory
    this.events.push(event);
    
    // Trim events if exceeding max
    if (this.events.length > this.config.maxEventsInMemory) {
      this.events = this.events.slice(-this.config.maxEventsInMemory);
    }
    
    // Notify event handlers
    this.notifyEventHandlers(event);
    
    // Emit to global event bus if enabled
    if (this.config.enableGlobalEventBus && this.globalEventBus) {
      this.emitToGlobalEventBus(event);
    }
    
    // Update metrics timestamp
    this.metrics.metricsUpdatedAt = timestamp;
    
    return eventId;
  }

  /**
   * Register an event handler
   */
  public registerEventHandler(
    eventType: HealingEventType,
    handler: HealingEventHandler
  ): void {
    const handlers = this.eventHandlers.get(eventType) || [];
    handlers.push(handler);
    this.eventHandlers.set(eventType, handlers);
  }

  /**
   * Unregister an event handler
   */
  public unregisterEventHandler(
    eventType: HealingEventType,
    handler: HealingEventHandler
  ): void {
    const handlers = this.eventHandlers.get(eventType) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
    this.eventHandlers.set(eventType, handlers);
  }

  /**
   * Notify event handlers
   */
  private notifyEventHandlers(event: HealingEvent): void {
    const handlers = this.eventHandlers.get(event.type) || [];
    
    handlers.forEach(handler => {
      try {
        const result = handler(event);
        if (result instanceof Promise) {
          result.catch(error => {
            console.error(`Error in event handler for ${event.type}:`, error);
          });
        }
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    });
  }

  /**
   * Emit to global event bus
   */
  private emitToGlobalEventBus(event: HealingEvent): void {
    // This would integrate with the global event bus
    // For now, we'll just log it
    if (this.config.enableTelemetry) {
      console.log(`[Global Event Bus] ${event.type}:`, event.payload);
    }
  }

  /**
   * Update orchestration metrics
   */
  private updateOrchestrationMetrics(event: HealingEvent): void {
    const payload = event.payload;
    
    if (payload.processingTimeMs) {
      // Update average orchestration time
      const totalTime = this.metrics.averageOrchestrationTimeMs * (this.metrics.successfulOrchestrations - 1);
      this.metrics.averageOrchestrationTimeMs = (totalTime + payload.processingTimeMs) / this.metrics.successfulOrchestrations;
    }
    
    if (payload.improvementScore !== undefined) {
      // Update improvement score average
      const totalScore = this.metrics.improvementScoreAverage * (this.metrics.successfulOrchestrations - 1);
      this.metrics.improvementScoreAverage = (totalScore + payload.improvementScore) / this.metrics.successfulOrchestrations;
    }
    
    // Record performance entry
    this.recordPerformanceEntry('orchestration', payload.processingTimeMs || 0);
  }

  /**
   * Update pass metrics
   */
  private updatePassMetrics(event: HealingEvent): void {
    const payload = event.payload;
    
    if (payload.processingTimeMs) {
      // Update average pass time
      const totalTime = this.metrics.averagePassTimeMs * (this.metrics.successfulPasses - 1);
      this.metrics.averagePassTimeMs = (totalTime + payload.processingTimeMs) / this.metrics.successfulPasses;
    }
    
    if (payload.improvementScore !== undefined) {
      // Update improvement score for passes
      // This could be weighted differently
    }
    
    // Record performance entry
    this.recordPerformanceEntry('pass', payload.processingTimeMs || 0);
  }

  /**
   * Update integration metrics
   */
  private updateIntegrationMetrics(event: HealingEvent): void {
    const payload = event.payload;
    
    if (payload.totalTimeMs) {
      // Update average integration time
      const totalTime = this.metrics.averageIntegrationTimeMs * (this.metrics.successfulIntegrations - 1);
      this.metrics.averageIntegrationTimeMs = (totalTime + payload.totalTimeMs) / this.metrics.successfulIntegrations;
    }
    
    if (payload.totalIntegrated !== undefined) {
      // Update throughput
      const now = Date.now();
      const collectionStart = new Date(this.metrics.collectionStartedAt).getTime();
      const minutesElapsed = Math.max(1, (now - collectionStart) / (1000 * 60));
      this.metrics.healingThroughput = this.metrics.totalActionsApplied / minutesElapsed;
    }
    
    // Record performance entry
    this.recordPerformanceEntry('integration', payload.totalTimeMs || 0);
  }

  /**
   * Update action metrics
   */
  private updateActionMetrics(event: HealingEvent): void {
    const payload = event.payload;
    
    if (payload.confidence !== undefined) {
      // Update average action confidence
      const totalConfidence = this.metrics.averageActionConfidence * (this.metrics.totalActionsGenerated - 1);
      this.metrics.averageActionConfidence = (totalConfidence + payload.confidence) / this.metrics.totalActionsGenerated;
    }
  }

  /**
   * Record performance entry
   */
  private recordPerformanceEntry(type: string, duration: number): void {
    this.performanceEntries.push({
      type,
      startTime: Date.now() - duration,
      endTime: Date.now(),
      duration
    });
    
    // Trim performance entries if too many
    if (this.performanceEntries.length > 1000) {
      this.performanceEntries = this.performanceEntries.slice(-500);
    }
    
    // Update latency percentiles periodically
    if (this.performanceEntries.length % 100 === 0) {
      this.updateLatencyPercentiles();
    }
  }

  /**
   * Update latency percentiles
   */
  private updateLatencyPercentiles(): void {
    if (this.performanceEntries.length === 0) return;
    
    // Sort by duration
    const sortedDurations = [...this.performanceEntries]
      .map(entry => entry.duration)
      .sort((a, b) => a - b);
    
    const n = sortedDurations.length;
    
    // Calculate percentiles
    this.metrics.healingLatencyP50 = sortedDurations[Math.floor(n * 0.5)];
    this.metrics.healingLatencyP95 = sortedDurations[Math.floor(n * 0.95)];
    this.metrics.healingLatencyP99 = sortedDurations[Math.floor(n * 0.99)];
  }

  /**
   * Log an error
   */
  public logError(error: string | Error, context: any = {}, severity: 'error' | 'warning' | 'critical' = 'error'): void {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      context,
      severity
    };
    
    this.errorLog.push(errorEntry);
    
    // Trim error log if too large
    if (this.errorLog.length > 1000) {
      this.errorLog = this.errorLog.slice(-500);
    }
    
    // Emit error event
    this.emitEvent(
      severity === 'error' ? 'healing:error:occurred' : 'healing:warning:issued',
      { error: errorEntry.error, context: errorEntry.context },
      { severity }
    );
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    // This would start periodic metrics collection
    // For now, we'll just update latency percentiles periodically
    setInterval(() => {
      this.updateLatencyPercentiles();
    }, 30000); // Every 30 seconds
  }

  /**
   * Start event flushing
   */
  private startEventFlushing(): void {
    if (!this.config.enableEventPersistence) return;
    
    setInterval(() => {
      this.flushEvents();
    }, this.config.flushIntervalMs);
  }

  /**
   * Flush events to persistent storage
   */
  private async flushEvents(): Promise<void> {
    if (this.events.length === 0) return;
    
    // This would flush events to a database or external service
    // For now, we'll just log that flushing would happen
    if (this.config.enableTelemetry) {
      console.log(`[Event Flushing] Would flush ${this.events.length} events`);
    }
    
    // Clear events after flushing (in a real implementation, you'd mark them as flushed)
    this.events = [];
  }

  /**
   * Get current metrics
   */
  public getMetrics(): HealingTelemetryMetrics {
    return { ...this.metrics };
  }

  /**
   * Get recent events
   */
  public getRecentEvents(limit: number = 100): HealingEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Get events by type
   */
  public getEventsByType(type: HealingEventType, limit: number = 100): HealingEvent[] {
    return this.events
      .filter(event => event.type === type)
      .slice(-limit);
  }

  /**
   * Get performance entries
   */
  public getPerformanceEntries(type?: string, limit: number = 100): any[] {
    let entries = this.performanceEntries;
    
    if (type) {
      entries = entries.filter(entry => entry.type === type);
    }
    
    return entries.slice(-limit);
  }

  /**
   * Get error log
   */
  public getErrorLog(severity?: string, limit: number = 100): any[] {
    let errors = this.errorLog;
    
    if (severity) {
      errors = errors.filter(error => error.severity === severity);
    }
    
    return errors.slice(-limit);
  }

  /**
   * Clear all data
   */
  public clearData(): void {
    this.events = [];
    this.performanceEntries = [];
    this.errorLog = [];
    this.metrics = this.initializeMetrics();
  }

  /**
   * Connect to global event bus
   */
  public connectToGlobalEventBus(eventBus: any): void {
    this.globalEventBus = eventBus;
    
    // Register as listener to global events if needed
    if (this.config.enableGlobalEventBus) {
      console.log('[HealingEventTelemetry] Connected to global event bus');
    }
  }

  /**
   * Disconnect from global event bus
   */
  public disconnectFromGlobalEventBus(): void {
    this.globalEventBus = null;
    console.log('[HealingEventTelemetry] Disconnected from global event bus');
  }

  /**
   * Generate telemetry report
   */
  public generateTelemetryReport(): {
    summary: HealingTelemetryMetrics;
    recentEvents: HealingEvent[];
    performanceSummary: any;
    errorSummary: any;
  } {
    // Calculate performance summary
    const performanceSummary = {
      totalEntries: this.performanceEntries.length,
      byType: {} as Record<string, number>
    };
    
    this.performanceEntries.forEach(entry => {
      performanceSummary.byType[entry.type] = (performanceSummary.byType[entry.type] || 0) + 1;
    });
    
    // Calculate error summary
    const errorSummary = {
      totalErrors: this.errorLog.length,
      bySeverity: {} as Record<string, number>
    };
    
    this.errorLog.forEach(error => {
      errorSummary.bySeverity[error.severity] = (errorSummary.bySeverity[error.severity] || 0) + 1;
    });
    
    return {
      summary: this.getMetrics(),
      recentEvents: this.getRecentEvents(50),
      performanceSummary,
      errorSummary
    };
  }

  /**
   * Validate configuration
   */
  public validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (this.config.maxEventsInMemory <= 0) {
      errors.push('maxEventsInMemory must be greater than 0');
    }
    
    if (this.config.flushIntervalMs <= 0) {
      errors.push('flushIntervalMs must be greater than 0');
    }
    
    if (this.config.maxEventsInMemory > 1000000) {
      errors.push('maxEventsInMemory cannot exceed 1,000,000');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Reset telemetry system
   */
  public reset(): void {
    this.clearData();
    this.eventHandlers.clear();
    this.registerDefaultEventHandlers();
  }
}