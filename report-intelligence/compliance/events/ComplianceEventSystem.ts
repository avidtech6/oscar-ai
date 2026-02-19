/**
 * Phase 9: Report Compliance Validator
 * Compliance Event System
 * 
 * Centralized event system for compliance validation events.
 * Integrates with validator, storage, and scoring components.
 */

import type { ComplianceResult } from '../ComplianceResult';

/**
 * Compliance event types
 */
export type ComplianceEventType = 
  // Core validation events
  | 'compliance:validation:started'
  | 'compliance:validation:completed'
  | 'compliance:validation:error'
  
  // Validation step events
  | 'compliance:validation:section:started'
  | 'compliance:validation:section:completed'
  | 'compliance:validation:field:started'
  | 'compliance:validation:field:completed'
  | 'compliance:validation:rule:started'
  | 'compliance:validation:rule:completed'
  | 'compliance:validation:structure:started'
  | 'compliance:validation:structure:completed'
  | 'compliance:validation:terminology:started'
  | 'compliance:validation:terminology:completed'
  | 'compliance:validation:contradiction:started'
  | 'compliance:validation:contradiction:completed'
  
  // Scoring events
  | 'compliance:scoring:calculated'
  | 'compliance:scoring:updated'
  
  // Storage events
  | 'compliance:storage:result:stored'
  | 'compliance:storage:result:retrieved'
  | 'compliance:storage:result:updated'
  | 'compliance:storage:result:deleted'
  | 'compliance:storage:results:queried'
  | 'compliance:storage:cleared'
  
  // Integration events
  | 'compliance:integration:phase1:connected'
  | 'compliance:integration:phase2:connected'
  | 'compliance:integration:phase3:connected'
  | 'compliance:integration:phase4:connected'
  | 'compliance:integration:phase5:connected'
  | 'compliance:integration:phase6:connected'
  | 'compliance:integration:phase7:connected'
  | 'compliance:integration:phase8:connected'
  
  // System events
  | 'compliance:system:initialized'
  | 'compliance:system:shutdown'
  | 'compliance:system:error';

/**
 * Event data structure
 */
export interface ComplianceEventData {
  // Common fields
  timestamp: Date;
  eventId: string;
  source: string;
  
  // Event-specific data
  [key: string]: any;
}

/**
 * Event listener function
 */
export type ComplianceEventListener = (eventType: ComplianceEventType, data: ComplianceEventData) => void;

/**
 * Event subscription
 */
export interface EventSubscription {
  unsubscribe: () => void;
}

/**
 * Compliance Event System
 */
export class ComplianceEventSystem {
  private static instance: ComplianceEventSystem;
  private listeners: Map<ComplianceEventType, Set<ComplianceEventListener>> = new Map();
  private eventHistory: Array<{type: ComplianceEventType, data: ComplianceEventData, timestamp: Date}> = [];
  private maxHistorySize = 1000;
  private enabled = true;

  private constructor() {
    this.initialize();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ComplianceEventSystem {
    if (!ComplianceEventSystem.instance) {
      ComplianceEventSystem.instance = new ComplianceEventSystem();
    }
    return ComplianceEventSystem.instance;
  }

  /**
   * Initialize event system
   */
  private initialize(): void {
    // Initialize listener sets for all event types
    const eventTypes: ComplianceEventType[] = [
      'compliance:validation:started',
      'compliance:validation:completed',
      'compliance:validation:error',
      'compliance:validation:section:started',
      'compliance:validation:section:completed',
      'compliance:validation:field:started',
      'compliance:validation:field:completed',
      'compliance:validation:rule:started',
      'compliance:validation:rule:completed',
      'compliance:validation:structure:started',
      'compliance:validation:structure:completed',
      'compliance:validation:terminology:started',
      'compliance:validation:terminology:completed',
      'compliance:validation:contradiction:started',
      'compliance:validation:contradiction:completed',
      'compliance:scoring:calculated',
      'compliance:scoring:updated',
      'compliance:storage:result:stored',
      'compliance:storage:result:retrieved',
      'compliance:storage:result:updated',
      'compliance:storage:result:deleted',
      'compliance:storage:results:queried',
      'compliance:storage:cleared',
      'compliance:integration:phase1:connected',
      'compliance:integration:phase2:connected',
      'compliance:integration:phase3:connected',
      'compliance:integration:phase4:connected',
      'compliance:integration:phase5:connected',
      'compliance:integration:phase6:connected',
      'compliance:integration:phase7:connected',
      'compliance:integration:phase8:connected',
      'compliance:system:initialized',
      'compliance:system:shutdown',
      'compliance:system:error',
    ];

    for (const eventType of eventTypes) {
      this.listeners.set(eventType, new Set());
    }

    // Emit initialization event
    this.emit('compliance:system:initialized', {
      timestamp: new Date(),
      eventId: this.generateEventId(),
      source: 'ComplianceEventSystem',
      version: '1.0.0',
    });
  }

  /**
   * Subscribe to an event type
   */
  subscribe(eventType: ComplianceEventType, listener: ComplianceEventListener): EventSubscription {
    const listenerSet = this.listeners.get(eventType);
    if (!listenerSet) {
      throw new Error(`Unknown event type: ${eventType}`);
    }

    listenerSet.add(listener);

    return {
      unsubscribe: () => {
        listenerSet.delete(listener);
      },
    };
  }

  /**
   * Subscribe to multiple event types
   */
  subscribeMultiple(
    eventTypes: ComplianceEventType[],
    listener: ComplianceEventListener
  ): EventSubscription[] {
    return eventTypes.map(eventType => this.subscribe(eventType, listener));
  }

  /**
   * Subscribe to all events
   */
  subscribeAll(listener: ComplianceEventListener): EventSubscription {
    const subscriptions: EventSubscription[] = [];
    
    for (const eventType of this.listeners.keys()) {
      subscriptions.push(this.subscribe(eventType, listener));
    }
    
    return {
      unsubscribe: () => {
        subscriptions.forEach(sub => sub.unsubscribe());
      },
    };
  }

  /**
   * Emit an event
   */
  emit(eventType: ComplianceEventType, data: Partial<ComplianceEventData>): void {
    if (!this.enabled) {
      return;
    }

    // Create complete event data
    const eventData: ComplianceEventData = {
      timestamp: new Date(),
      eventId: this.generateEventId(),
      source: 'unknown',
      ...data,
    };

    // Add to history
    this.eventHistory.push({
      type: eventType,
      data: eventData,
      timestamp: new Date(),
    });

    // Trim history if needed
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }

    // Notify listeners
    const listenerSet = this.listeners.get(eventType);
    if (listenerSet) {
      // Convert to array to avoid iteration issues
      const listeners = Array.from(listenerSet);
      for (const listener of listeners) {
        try {
          listener(eventType, eventData);
        } catch (error) {
          console.error(`[ComplianceEventSystem] Error in listener for ${eventType}:`, error);
          // Emit error event but prevent infinite recursion
          if (eventType !== 'compliance:system:error') {
            this.emit('compliance:system:error', {
              timestamp: new Date(),
              eventId: this.generateEventId(),
              source: 'ComplianceEventSystem',
              error: error instanceof Error ? error.message : String(error),
              originalEvent: eventType,
            });
          }
        }
      }
    }

    // Also notify wildcard listeners if any
    const wildcardListeners = this.listeners.get('compliance:system:error' as ComplianceEventType);
    // Note: We don't have a wildcard event type, so this is just for error propagation
  }

  /**
   * Get event history
   */
  getHistory(
    filter?: (event: {type: ComplianceEventType, data: ComplianceEventData, timestamp: Date}) => boolean,
    limit?: number
  ): Array<{type: ComplianceEventType, data: ComplianceEventData, timestamp: Date}> {
    let history = this.eventHistory;
    
    if (filter) {
      history = history.filter(filter);
    }
    
    if (limit && limit > 0) {
      history = history.slice(-limit);
    }
    
    return [...history]; // Return copy
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Enable/disable event system
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if event system is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    listenersByType: Record<string, number>;
    enabled: boolean;
  } {
    const eventsByType: Record<string, number> = {};
    const listenersByType: Record<string, number> = {};
    
    // Count events by type
    for (const event of this.eventHistory) {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    }
    
    // Count listeners by type
    for (const [eventType, listenerSet] of this.listeners.entries()) {
      listenersByType[eventType] = listenerSet.size;
    }
    
    return {
      totalEvents: this.eventHistory.length,
      eventsByType,
      listenersByType,
      enabled: this.enabled,
    };
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Shutdown event system
   */
  shutdown(): void {
    this.emit('compliance:system:shutdown', {
      timestamp: new Date(),
      eventId: this.generateEventId(),
      source: 'ComplianceEventSystem',
      reason: 'system_shutdown',
    });
    
    this.listeners.clear();
    this.eventHistory = [];
    this.enabled = false;
  }
}

/**
 * Convenience functions for common events
 */
export class ComplianceEventHelpers {
  /**
   * Emit validation started event
   */
  static emitValidationStarted(
    complianceResultId: string,
    reportTypeId: string,
    reportTypeName: string
  ): void {
    const eventSystem = ComplianceEventSystem.getInstance();
    eventSystem.emit('compliance:validation:started', {
      timestamp: new Date(),
      eventId: eventSystem['generateEventId'](),
      source: 'ReportComplianceValidator',
      complianceResultId,
      reportTypeId,
      reportTypeName,
    });
  }

  /**
   * Emit validation completed event
   */
  static emitValidationCompleted(
    complianceResult: ComplianceResult,
    processingTimeMs: number
  ): void {
    const eventSystem = ComplianceEventSystem.getInstance();
    eventSystem.emit('compliance:validation:completed', {
      timestamp: new Date(),
      eventId: eventSystem['generateEventId'](),
      source: 'ReportComplianceValidator',
      complianceResultId: complianceResult.id,
      passed: complianceResult.passed,
      status: complianceResult.status,
      overallScore: complianceResult.scores.overallScore,
      confidenceScore: complianceResult.confidenceScore,
      processingTimeMs,
      totalIssues: 
        complianceResult.missingRequiredSections.length +
        complianceResult.missingRequiredFields.length +
        complianceResult.failedComplianceRules.length +
        complianceResult.structuralIssues.length +
        complianceResult.terminologyIssues.length +
        complianceResult.contradictions.length,
    });
  }

  /**
   * Emit scoring calculated event
   */
  static emitScoringCalculated(
    complianceResultId: string,
    scores: ComplianceResult['scores'],
    confidenceScore: number
  ): void {
    const eventSystem = ComplianceEventSystem.getInstance();
    eventSystem.emit('compliance:scoring:calculated', {
      timestamp: new Date(),
      eventId: eventSystem['generateEventId'](),
      source: 'computeComplianceScore',
      complianceResultId,
      scores,
      confidenceScore,
    });
  }

  /**
   * Emit result stored event
   */
  static emitResultStored(
    complianceResultId: string,
    storageType: string,
    success: boolean
  ): void {
    const eventSystem = ComplianceEventSystem.getInstance();
    eventSystem.emit('compliance:storage:result:stored', {
      timestamp: new Date(),
      eventId: eventSystem['generateEventId'](),
      source: 'ComplianceResultStorage',
      complianceResultId,
      storageType,
      success,
    });
  }

  /**
   * Emit integration connected event
   */
  static emitIntegrationConnected(
    phaseNumber: number,
    componentName: string,
    success: boolean
  ): void {
    const eventSystem = ComplianceEventSystem.getInstance();
    eventSystem.emit(`compliance:integration:phase${phaseNumber}:connected` as ComplianceEventType, {
      timestamp: new Date(),
      eventId: eventSystem['generateEventId'](),
      source: 'ComplianceIntegration',
      phaseNumber,
      componentName,
      success,
    });
  }
}

/**
 * Event logger for debugging and monitoring
 */
export class ComplianceEventLogger {
  private subscriptions: EventSubscription[] = [];

  constructor() {
    this.setupLogging();
  }

  /**
   * Setup logging for all events
   */
  private setupLogging(): void {
    const eventSystem = ComplianceEventSystem.getInstance();
    
    // Subscribe to all events
    const subscription = eventSystem.subscribeAll((eventType, data) => {
      this.logEvent(eventType, data);
    });
    
    this.subscriptions.push(subscription);
  }

  /**
   * Log an event
   */
  private logEvent(eventType: ComplianceEventType, data: ComplianceEventData): void {
    const timestamp = data.timestamp.toISOString();
    const source = data.source || 'unknown';
    const eventId = data.eventId || 'unknown';
    
    // Format log message
    const logMessage = `[${timestamp}] [${eventId}] [${source}] ${eventType}`;
    
    // Add additional data for certain event types
    let additionalInfo = '';
    
    if (eventType.includes('error')) {
      additionalInfo = ` - ERROR: ${data.error || 'Unknown error'}`;
      console.error(logMessage + additionalInfo, data);
    } else if (eventType.includes('completed') || eventType.includes('calculated')) {
      // Log success events at info level
      console.info(logMessage, data);
    } else {
      // Log other events at debug level
      console.debug(logMessage, data);
    }
  }

  /**
   * Get logged events
   */
  getLoggedEvents(limit?: number): Array<{type: ComplianceEventType, data: ComplianceEventData, timestamp: Date}> {
    const eventSystem = ComplianceEventSystem.getInstance();
    return eventSystem.getHistory(undefined, limit);
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }
}