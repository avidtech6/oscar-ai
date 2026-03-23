/**
 * Trigger System for Automation Layer
 * Phase 33.5 - Trigger Evaluation Engine
 */

import type {
  Trigger,
  TriggerType,
  Condition,
  TriggerEvaluationResult,
  AutomationContext,
  AutomationEvent,
  Schedule,
  ScheduleFrequency
} from './automation-types';

export class TriggerSystem {
  private triggers: Map<string, Trigger> = new Map();
  private activeEvaluations: Map<string, Promise<TriggerEvaluationResult[]>> = new Map();
  private eventListeners: Map<string, ((event: AutomationEvent) => void)[]> = new Map();
  private scheduleTimers: Map<string, NodeJS.Timeout> = new Map();
  private lastTriggerCheck: number = Date.now();
  private cooldownPeriods: Map<string, number> = new Map();

  constructor() {
    this.initializeDefaultTriggers();
  }

  /**
   * Register a new trigger
   */
  public registerTrigger(trigger: Trigger): void {
    this.validateTrigger(trigger);
    trigger.createdAt = Date.now();
    trigger.updatedAt = Date.now();
    trigger.executionCount = 0;
    this.triggers.set(trigger.id, trigger);
    this.setupTriggerMonitoring(trigger);
    console.log(`[TriggerSystem] Registered trigger: ${trigger.name} (${trigger.id})`);
  }

  /**
   * Unregister a trigger
   */
  public unregisterTrigger(triggerId: string): boolean {
    const trigger = this.triggers.get(triggerId);
    if (!trigger) {
      return false;
    }

    // Cleanup any active monitoring
    this.cleanupTriggerMonitoring(trigger);
    this.triggers.delete(triggerId);
    this.cooldownPeriods.delete(triggerId);
    console.log(`[TriggerSystem] Unregistered trigger: ${trigger.name} (${triggerId})`);
    return true;
  }

  /**
   * Get a trigger by ID
   */
  public getTrigger(triggerId: string): Trigger | undefined {
    return this.triggers.get(triggerId);
  }

  /**
   * Get all triggers
   */
  public getAllTriggers(): Trigger[] {
    return Array.from(this.triggers.values());
  }

  /**
   * Get enabled triggers only
   */
  public getEnabledTriggers(): Trigger[] {
    return this.getAllTriggers().filter(trigger => trigger.enabled);
  }

  /**
   * Evaluate triggers against an event
   */
  public async evaluateTriggers(event: AutomationEvent): Promise<TriggerEvaluationResult[]> {
    const evaluationId = `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Prevent concurrent evaluations
    if (this.activeEvaluations.has(evaluationId)) {
      return this.activeEvaluations.get(evaluationId)!;
    }

    const evaluationPromise = this.performTriggerEvaluation(event);
    this.activeEvaluations.set(evaluationId, evaluationPromise);

    try {
      const results = await evaluationPromise;
      return results.filter(result => result.shouldTrigger);
    } finally {
      this.activeEvaluations.delete(evaluationId);
    }
  }

  /**
   * Evaluate triggers against current system state
   */
  public async evaluateSystemTriggers(context: AutomationContext): Promise<TriggerEvaluationResult[]> {
    const timeTriggers = this.getEnabledTriggers().filter(trigger => 
      trigger.type === 'time' || trigger.type === 'schedule'
    );

    const results: TriggerEvaluationResult[] = [];
    
    for (const trigger of timeTriggers) {
      const result = await this.evaluateTrigger(trigger, context);
      if (result.shouldTrigger) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Evaluate a single trigger
   */
  public async evaluateTrigger(trigger: Trigger, context?: AutomationContext): Promise<TriggerEvaluationResult> {
    if (!trigger.enabled) {
      return {
        shouldTrigger: false,
        triggeredBy: 'disabled',
        confidence: 0,
        reason: 'Trigger is disabled'
      };
    }

    // Check cooldown period
    if (this.isInCooldown(trigger)) {
      return {
        shouldTrigger: false,
        triggeredBy: 'cooldown',
        confidence: 0,
        reason: 'Trigger is in cooldown period'
      };
    }

    // Check execution limits
    if (this.hasExceededExecutionLimit(trigger)) {
      return {
        shouldTrigger: false,
        triggeredBy: 'limit',
        confidence: 0,
        reason: 'Trigger has exceeded maximum execution limit'
      };
    }

    let shouldTrigger = false;
    let triggeredBy = '';
    let confidence = 0;
    let reason = '';

    switch (trigger.type) {
      case 'event':
        ({ shouldTrigger, triggeredBy, confidence, reason } = await this.evaluateEventTrigger(trigger, context));
        break;
      case 'time':
        ({ shouldTrigger, triggeredBy, confidence, reason } = await this.evaluateTimeTrigger(trigger, context));
        break;
      case 'schedule':
        ({ shouldTrigger, triggeredBy, confidence, reason } = await this.evaluateScheduleTrigger(trigger, context));
        break;
      case 'state':
        ({ shouldTrigger, triggeredBy, confidence, reason } = await this.evaluateStateTrigger(trigger, context));
        break;
      default:
        reason = 'Unsupported trigger type';
    }

    // Evaluate conditions if trigger should fire
    if (shouldTrigger && trigger.conditions && trigger.conditions.length > 0) {
      const conditionResult = await this.evaluateConditions(trigger.conditions, context);
      if (!conditionResult.passed) {
        shouldTrigger = false;
        reason = `Conditions not met: ${conditionResult.reason}`;
        confidence = conditionResult.confidence;
      }
    }

    const result: TriggerEvaluationResult = {
      shouldTrigger,
      triggeredBy,
      confidence,
      reason,
      metadata: {
        triggerId: trigger.id,
        triggerName: trigger.name,
        triggerType: trigger.type
      }
    };

    if (shouldTrigger) {
      this.recordTriggerExecution(trigger);
    }

    return result;
  }

  /**
   * Trigger a specific trigger manually
   */
  public async triggerManually(triggerId: string, context?: AutomationContext): Promise<TriggerEvaluationResult> {
    const trigger = this.getTrigger(triggerId);
    if (!trigger) {
      return {
        shouldTrigger: false,
        triggeredBy: 'missing',
        confidence: 0,
        reason: 'Trigger not found'
      };
    }

    if (!trigger.enabled) {
      return {
        shouldTrigger: false,
        triggeredBy: 'disabled',
        confidence: 0,
        reason: 'Trigger is disabled'
      };
    }

    const result = await this.evaluateTrigger(trigger, context);
    
    if (result.shouldTrigger) {
      this.recordTriggerExecution(trigger);
    }

    return result;
  }

  /**
   * Enable a trigger
   */
  public enableTrigger(triggerId: string): boolean {
    const trigger = this.getTrigger(triggerId);
    if (trigger) {
      trigger.enabled = true;
      trigger.updatedAt = Date.now();
      this.setupTriggerMonitoring(trigger);
      return true;
    }
    return false;
  }

  /**
   * Disable a trigger
   */
  public disableTrigger(triggerId: string): boolean {
    const trigger = this.getTrigger(triggerId);
    if (trigger) {
      trigger.enabled = false;
      trigger.updatedAt = Date.now();
      this.cleanupTriggerMonitoring(trigger);
      return true;
    }
    return false;
  }

  /**
   * Cleanup all resources
   */
  public async shutdown(): Promise<void> {
    // Clear all timers
    for (const timer of Array.from(this.scheduleTimers.values())) {
      clearTimeout(timer);
    }
    this.scheduleTimers.clear();

    // Clear all event listeners
    this.eventListeners.clear();

    // Clear active evaluations
    this.activeEvaluations.clear();

    console.log('[TriggerSystem] Shutdown complete');
  }

  /**
   * Get trigger statistics
   */
  public getStatistics(): {
    totalTriggers: number;
    enabledTriggers: number;
    totalExecutions: number;
    cooldownTriggers: number;
    scheduledTriggers: number;
    eventTriggers: number;
    timeTriggers: number;
    stateTriggers: number;
  } {
    const triggers = this.getAllTriggers();
    return {
      totalTriggers: triggers.length,
      enabledTriggers: triggers.filter(t => t.enabled).length,
      totalExecutions: triggers.reduce((sum, t) => sum + t.executionCount, 0),
      cooldownTriggers: this.cooldownPeriods.size,
      scheduledTriggers: triggers.filter(t => t.type === 'schedule').length,
      eventTriggers: triggers.filter(t => t.type === 'event').length,
      timeTriggers: triggers.filter(t => t.type === 'time').length,
      stateTriggers: triggers.filter(t => t.type === 'state').length,
    };
  }

  // Private helper methods

  private validateTrigger(trigger: Trigger): void {
    if (!trigger.id || !trigger.name || !trigger.type) {
      throw new Error('Trigger must have id, name, and type');
    }

    if (!['event', 'time', 'schedule', 'state', 'manual'].includes(trigger.type)) {
      throw new Error(`Invalid trigger type: ${trigger.type}`);
    }

    if (trigger.type === 'schedule' && !trigger.schedule) {
      throw new Error('Schedule triggers must have a schedule configuration');
    }
  }

  private initializeDefaultTriggers(): void {
    // Initialize with no default triggers - they should be explicitly registered
  }

  private setupTriggerMonitoring(trigger: Trigger): void {
    if (trigger.type === 'schedule' && trigger.schedule) {
      this.setupScheduleMonitoring(trigger);
    }
  }

  private cleanupTriggerMonitoring(trigger: Trigger): void {
    if (trigger.type === 'schedule') {
      this.cleanupScheduleMonitoring(trigger);
    }
  }

  private setupScheduleMonitoring(trigger: Trigger): void {
    if (!trigger.schedule || !trigger.enabled) {
      return;
    }

    const timer = setInterval(async () => {
      const context: AutomationContext = {
        id: `ctx_${Date.now()}`,
        timestamp: Date.now(),
        userId: 'system',
        metadata: {},
        systemState: {}
      };

      const result = await this.evaluateTrigger(trigger, context);
      if (result.shouldTrigger) {
        const event: AutomationEvent = {
          id: `event_${Date.now()}`,
          type: 'schedule',
          source: trigger.id,
          timestamp: Date.now(),
          data: { triggerId: trigger.id, schedule: trigger.schedule },
          metadata: { triggerName: trigger.name }
        };

        this.emitEvent(event);
      }
    }, this.calculateScheduleInterval(trigger.schedule));

    this.scheduleTimers.set(trigger.id, timer);
  }

  private cleanupScheduleMonitoring(trigger: Trigger): void {
    const timer = this.scheduleTimers.get(trigger.id);
    if (timer) {
      clearInterval(timer);
      this.scheduleTimers.delete(trigger.id);
    }
  }

  private calculateScheduleInterval(schedule: Schedule): number {
    switch (schedule.frequency) {
      case 'minute': return 60 * 1000;
      case 'hour': return 60 * 60 * 1000;
      case 'day': return 24 * 60 * 60 * 1000;
      case 'week': return 7 * 24 * 60 * 60 * 1000;
      case 'month': return 30 * 24 * 60 * 60 * 1000;
      case 'year': return 365 * 24 * 60 * 60 * 1000;
      case 'once': return Infinity; // Run once only
      case 'custom':
        return schedule.interval || 60 * 1000;
      default:
        return 60 * 1000;
    }
  }

  private async performTriggerEvaluation(event: AutomationEvent): Promise<TriggerEvaluationResult[]> {
    const results: TriggerEvaluationResult[] = [];
    const eventTriggers = this.getEnabledTriggers().filter(trigger => 
      trigger.type === 'event' && this.matchesEventPattern(trigger, event)
    );

    for (const trigger of eventTriggers) {
      const result = await this.evaluateTrigger(trigger);
      if (result.shouldTrigger) {
        results.push(result);
      }
    }

    return results;
  }

  private matchesEventPattern(trigger: Trigger, event: AutomationEvent): boolean {
    if (!trigger.eventSource || !trigger.eventPattern) {
      return true; // No pattern means match all events
    }

    // Simple pattern matching - can be enhanced with regex or more complex logic
    return event.source === trigger.eventSource && 
           event.type.includes(trigger.eventPattern);
  }

  private async evaluateEventTrigger(trigger: Trigger, context?: AutomationContext): Promise<{
    shouldTrigger: boolean;
    triggeredBy: string;
    confidence: number;
    reason: string;
  }> {
    return {
      shouldTrigger: true,
      triggeredBy: 'event',
      confidence: 0.8,
      reason: 'Event trigger matched'
    };
  }

  private async evaluateTimeTrigger(trigger: Trigger, context?: AutomationContext): Promise<{
    shouldTrigger: boolean;
    triggeredBy: string;
    confidence: number;
    reason: string;
  }> {
    const now = Date.now();
    const timeSinceLastTrigger = trigger.lastTriggered ? now - trigger.lastTriggered : Infinity;
    
    if (timeSinceLastTrigger >= (trigger.schedule?.interval || 60000)) {
      return {
        shouldTrigger: true,
        triggeredBy: 'time',
        confidence: 0.9,
        reason: 'Time trigger interval elapsed'
      };
    }

    return {
      shouldTrigger: false,
      triggeredBy: 'time',
      confidence: 0,
      reason: 'Time trigger interval not elapsed'
    };
  }

  private async evaluateScheduleTrigger(trigger: Trigger, context?: AutomationContext): Promise<{
    shouldTrigger: boolean;
    triggeredBy: string;
    confidence: number;
    reason: string;
  }> {
    // Schedule triggers are handled by the interval monitoring
    return {
      shouldTrigger: false,
      triggeredBy: 'schedule',
      confidence: 0,
      reason: 'Schedule triggers handled by monitoring system'
    };
  }

  private async evaluateStateTrigger(trigger: Trigger, context?: AutomationContext): Promise<{
    shouldTrigger: boolean;
    triggeredBy: string;
    confidence: number;
    reason: string;
  }> {
    // Placeholder for state-based trigger evaluation
    return {
      shouldTrigger: false,
      triggeredBy: 'state',
      confidence: 0,
      reason: 'State trigger evaluation not implemented'
    };
  }

  private async evaluateConditions(conditions: Condition[], context?: AutomationContext): Promise<{
    passed: boolean;
    confidence: number;
    reason: string;
  }> {
    if (!conditions || conditions.length === 0) {
      return { passed: true, confidence: 1.0, reason: 'No conditions to evaluate' };
    }

    for (const condition of conditions) {
      const result = this.evaluateCondition(condition, context?.systemState);
      if (!result.passed) {
        return result;
      }
    }

    return { passed: true, confidence: 1.0, reason: 'All conditions passed' };
  }

  private evaluateCondition(condition: Condition, systemState?: Record<string, any>): {
    passed: boolean;
    confidence: number;
    reason: string;
  } {
    const actualValue = this.getFieldValue(condition.field, systemState);
    const expectedValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        return {
          passed: condition.negate ? actualValue !== expectedValue : actualValue === expectedValue,
          confidence: 0.9,
          reason: condition.negate ? 'Not equals check failed' : 'Equals check passed'
        };
      case 'not_equals':
        return {
          passed: condition.negate ? actualValue === expectedValue : actualValue !== expectedValue,
          confidence: 0.9,
          reason: condition.negate ? 'Equals check failed' : 'Not equals check passed'
        };
      case 'contains':
        return {
          passed: condition.negate ? !String(actualValue).includes(String(expectedValue)) : String(actualValue).includes(String(expectedValue)),
          confidence: 0.8,
          reason: condition.negate ? 'Contains check failed' : 'Contains check passed'
        };
      case 'exists':
        return {
          passed: condition.negate ? actualValue === undefined : actualValue !== undefined,
          confidence: 0.9,
          reason: condition.negate ? 'Exists check failed' : 'Exists check passed'
        };
      default:
        return {
          passed: false,
          confidence: 0,
          reason: `Unsupported operator: ${condition.operator}`
        };
    }
  }

  private getFieldValue(field: string, systemState?: Record<string, any>): any {
    if (!systemState) {
      return undefined;
    }

    // Simple field navigation - supports dot notation
    return field.split('.').reduce((obj, key) => obj && obj[key], systemState);
  }

  private isInCooldown(trigger: Trigger): boolean {
    const cooldownEnd = this.cooldownPeriods.get(trigger.id);
    if (!cooldownEnd) {
      return false;
    }
    return Date.now() < cooldownEnd;
  }

  private hasExceededExecutionLimit(trigger: Trigger): boolean {
    if (!trigger.maxExecutions) {
      return false;
    }
    return trigger.executionCount >= trigger.maxExecutions;
  }

  private recordTriggerExecution(trigger: Trigger): void {
    trigger.executionCount++;
    trigger.lastTriggered = Date.now();
    trigger.updatedAt = Date.now();

    // Set cooldown period if specified
    if (trigger.cooldownPeriod && trigger.cooldownPeriod > 0) {
      this.cooldownPeriods.set(trigger.id, Date.now() + trigger.cooldownPeriod);
    }
  }

  private emitEvent(event: AutomationEvent): void {
    const listeners = this.eventListeners.get(event.type) || [];
    for (const listener of listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error(`[TriggerSystem] Error in event listener:`, error);
      }
    }
  }

  /**
   * Add event listener
   */
  public addEventListener(eventType: string, listener: (event: AutomationEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(eventType: string, listener: (event: AutomationEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
}