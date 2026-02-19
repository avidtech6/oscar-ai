/**
 * Report Validation Engine - Phase 4
 * Validation Event Emitter
 * 
 * Event system for validation engine with typed events and listeners.
 */

import type { ValidationResult } from '../ValidationResult';
import type { SchemaMappingResult } from '../../schema-mapper/SchemaMappingResult';
import type { ValidationRule } from '../ValidationResult';

/**
 * Validation event types
 */
export type ValidationEvent = 
  | 'validation:started'
  | 'validation:ruleProcessed'
  | 'validation:complianceChecked'
  | 'validation:qualityChecked'
  | 'validation:completenessChecked'
  | 'validation:consistencyChecked'
  | 'validation:terminologyChecked'
  | 'validation:completed'
  | 'validation:error'
  | 'validation:storage:stored'
  | 'validation:storage:retrieved'
  | 'validation:storage:deleted'
  | 'validation:rule:added'
  | 'validation:rule:updated'
  | 'validation:rule:enabled'
  | 'validation:rule:disabled';

/**
 * Event listener function type
 */
export type EventListener = (event: ValidationEvent, data: any) => void;

/**
 * Event data interfaces
 */
export interface ValidationStartedEventData {
  validationResultId: string;
  schemaMappingResultId: string;
  reportTypeId?: string;
  timestamp: Date;
}

export interface RuleProcessedEventData {
  validationResultId: string;
  ruleId: string;
  ruleName: string;
  ruleType: string;
  passed: boolean;
  severity: string;
  processingTimeMs?: number;
}

export interface ValidationCompletedEventData {
  validationResultId: string;
  overallScore: number;
  findingsCount: number;
  complianceViolationsCount: number;
  qualityIssuesCount: number;
  processingTimeMs: number;
  timestamp: Date;
}

export interface ValidationErrorEventData {
  validationResultId?: string;
  schemaMappingResultId?: string;
  error: string;
  timestamp: Date;
  stackTrace?: string;
}

export interface StorageEventData {
  resultId: string;
  operation: 'store' | 'retrieve' | 'update' | 'delete';
  timestamp: Date;
}

export interface RuleEventData {
  ruleId: string;
  ruleName: string;
  ruleType: string;
  enabled?: boolean;
  timestamp: Date;
}

/**
 * Validation event emitter class
 */
export class ValidationEventEmitter {
  private listeners: Map<ValidationEvent, Set<EventListener>> = new Map();
  private eventHistory: Array<{
    event: ValidationEvent;
    data: any;
    timestamp: Date;
  }> = [];
  private maxHistorySize = 1000;

  constructor() {
    this.initializeEventTypes();
  }

  /**
   * Initialize all event types
   */
  private initializeEventTypes(): void {
    const eventTypes: ValidationEvent[] = [
      'validation:started',
      'validation:ruleProcessed',
      'validation:complianceChecked',
      'validation:qualityChecked',
      'validation:completenessChecked',
      'validation:consistencyChecked',
      'validation:terminologyChecked',
      'validation:completed',
      'validation:error',
      'validation:storage:stored',
      'validation:storage:retrieved',
      'validation:storage:deleted',
      'validation:rule:added',
      'validation:rule:updated',
      'validation:rule:enabled',
      'validation:rule:disabled',
    ];

    for (const eventType of eventTypes) {
      this.listeners.set(eventType, new Set());
    }
  }

  /**
   * Emit an event
   */
  emit(event: ValidationEvent, data: any): void {
    const timestamp = new Date();
    
    // Add to history
    this.eventHistory.push({ event, data, timestamp });
    
    // Trim history if needed
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
    
    // Notify listeners
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      // Convert Set to Array to avoid iteration issues
      const listenerArray = Array.from(eventListeners);
      for (const listener of listenerArray) {
        try {
          listener(event, { ...data, timestamp });
        } catch (error) {
          console.error(`[ValidationEventEmitter] Error in event listener for ${event}:`, error);
        }
      }
    }
    
    // Also emit to global listeners if any
    const globalListeners = this.listeners.get('*' as ValidationEvent);
    if (globalListeners) {
      const listenerArray = Array.from(globalListeners);
      for (const listener of listenerArray) {
        try {
          listener(event, { ...data, timestamp });
        } catch (error) {
          console.error(`[ValidationEventEmitter] Error in global listener for ${event}:`, error);
        }
      }
    }
  }

  /**
   * Register an event listener
   */
  on(event: ValidationEvent, listener: EventListener): () => void {
    let eventListeners = this.listeners.get(event);
    
    if (!eventListeners) {
      eventListeners = new Set();
      this.listeners.set(event, eventListeners);
    }
    
    eventListeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.off(event, listener);
    };
  }

  /**
   * Register a listener for all events
   */
  onAll(listener: EventListener): () => void {
    return this.on('*' as ValidationEvent, listener);
  }

  /**
   * Remove an event listener
   */
  off(event: ValidationEvent, listener: EventListener): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
    }
  }

  /**
   * Remove all listeners for an event
   */
  offAll(event: ValidationEvent): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.clear();
    }
  }

  /**
   * Remove all listeners
   */
  clearAllListeners(): void {
    this.listeners.clear();
    this.initializeEventTypes();
  }

  /**
   * Get listener count for an event
   */
  getListenerCount(event: ValidationEvent): number {
    const eventListeners = this.listeners.get(event);
    return eventListeners ? eventListeners.size : 0;
  }

  /**
   * Get total listener count
   */
  getTotalListenerCount(): number {
    let total = 0;
    for (const listeners of Array.from(this.listeners.values())) {
      total += listeners.size;
    }
    return total;
  }

  /**
   * Get event history
   */
  getEventHistory(limit?: number): Array<{
    event: ValidationEvent;
    data: any;
    timestamp: Date;
  }> {
    if (limit && limit > 0) {
      return this.eventHistory.slice(-limit);
    }
    return [...this.eventHistory];
  }

  /**
   * Clear event history
   */
  clearEventHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Emit validation started event
   */
  emitValidationStarted(data: ValidationStartedEventData): void {
    this.emit('validation:started', data);
  }

  /**
   * Emit rule processed event
   */
  emitRuleProcessed(data: RuleProcessedEventData): void {
    this.emit('validation:ruleProcessed', data);
  }

  /**
   * Emit validation completed event
   */
  emitValidationCompleted(data: ValidationCompletedEventData): void {
    this.emit('validation:completed', data);
  }

  /**
   * Emit validation error event
   */
  emitValidationError(data: ValidationErrorEventData): void {
    this.emit('validation:error', data);
  }

  /**
   * Emit storage event
   */
  emitStorageEvent(operation: 'store' | 'retrieve' | 'update' | 'delete', resultId: string): void {
    this.emit(`validation:storage:${operation}` as ValidationEvent, {
      resultId,
      operation,
      timestamp: new Date(),
    });
  }

  /**
   * Emit rule event
   */
  emitRuleEvent(
    operation: 'added' | 'updated' | 'enabled' | 'disabled',
    ruleId: string,
    ruleName: string,
    ruleType: string,
    enabled?: boolean
  ): void {
    this.emit(`validation:rule:${operation}` as ValidationEvent, {
      ruleId,
      ruleName,
      ruleType,
      enabled,
      timestamp: new Date(),
    });
  }

  /**
   * Create a validation started event data object
   */
  createValidationStartedData(
    validationResultId: string,
    schemaMappingResultId: string,
    reportTypeId?: string
  ): ValidationStartedEventData {
    return {
      validationResultId,
      schemaMappingResultId,
      reportTypeId,
      timestamp: new Date(),
    };
  }

  /**
   * Create a rule processed event data object
   */
  createRuleProcessedData(
    validationResultId: string,
    rule: ValidationRule,
    passed: boolean,
    processingTimeMs?: number
  ): RuleProcessedEventData {
    return {
      validationResultId,
      ruleId: rule.id,
      ruleName: rule.name,
      ruleType: rule.type,
      passed,
      severity: rule.severity,
      processingTimeMs,
    };
  }

  /**
   * Create a validation completed event data object
   */
  createValidationCompletedData(
    validationResult: ValidationResult
  ): ValidationCompletedEventData {
    return {
      validationResultId: validationResult.id,
      overallScore: validationResult.scores.overallScore,
      findingsCount: validationResult.findings.length,
      complianceViolationsCount: validationResult.complianceViolations.length,
      qualityIssuesCount: validationResult.qualityIssues.length,
      processingTimeMs: validationResult.processingTimeMs,
      timestamp: validationResult.validatedAt,
    };
  }

  /**
   * Create a validation error event data object
   */
  createValidationErrorData(
    error: Error | string,
    validationResultId?: string,
    schemaMappingResultId?: string
  ): ValidationErrorEventData {
    return {
      validationResultId,
      schemaMappingResultId,
      error: error instanceof Error ? error.message : String(error),
      stackTrace: error instanceof Error ? error.stack : undefined,
      timestamp: new Date(),
    };
  }

  /**
   * Get event statistics
   */
  getEventStats(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsPerMinute: number;
    lastEventTime: Date | null;
  } {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    
    const eventsByType: Record<string, number> = {};
    let eventsLastMinute = 0;
    let lastEventTime: Date | null = null;
    
    for (const eventRecord of this.eventHistory) {
      // Count by type
      eventsByType[eventRecord.event] = (eventsByType[eventRecord.event] || 0) + 1;
      
      // Count events in last minute
      if (eventRecord.timestamp > oneMinuteAgo) {
        eventsLastMinute++;
      }
      
      // Track last event time
      if (!lastEventTime || eventRecord.timestamp > lastEventTime) {
        lastEventTime = eventRecord.timestamp;
      }
    }
    
    return {
      totalEvents: this.eventHistory.length,
      eventsByType,
      eventsPerMinute: eventsLastMinute,
      lastEventTime,
    };
  }

  /**
   * Check if there are any listeners for an event
   */
  hasListeners(event: ValidationEvent): boolean {
    const eventListeners = this.listeners.get(event);
    return !!eventListeners && eventListeners.size > 0;
  }

  /**
   * Wait for a specific event
   */
  waitForEvent(event: ValidationEvent, timeoutMs: number = 5000): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.off(event, eventHandler);
        reject(new Error(`Timeout waiting for event: ${event}`));
      }, timeoutMs);
      
      const eventHandler = (eventType: ValidationEvent, data: any) => {
        clearTimeout(timeoutId);
        this.off(event, eventHandler);
        resolve(data);
      };
      
      this.on(event, eventHandler);
    });
  }
}