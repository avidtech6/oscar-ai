/**
 * Self Healing Events Module Index
 * Exports event system and related types
 */

import { SelfHealingEventSystem, type SelfHealingEventListener } from './SelfHealingEventSystem';
export { SelfHealingEventSystem };
export type {
  SelfHealingEventType,
  SelfHealingEvent,
  SelfHealingEventListener,
  SelfHealingEventSystemConfig,
  EngineInitializedEvent,
  EngineShutdownEvent,
  AnalysisStartedEvent,
  AnalysisCompletedEvent,
  AnalysisFailedEvent,
  DetectorStartedEvent,
  DetectorCompletedEvent,
  DetectorFoundIssuesEvent,
  ActionsGeneratedEvent,
  ActionsPrioritizedEvent,
  BatchCreatedEvent,
  ActionsApplyingEvent,
  ActionsAppliedEvent,
  ActionsFailedEvent,
  ActionsSkippedEvent,
  StorageSavedEvent,
  StorageLoadedEvent,
  StorageErrorEvent,
  IntegrationPhase1Event,
  IntegrationPhase3Event,
  IntegrationPhase4Event,
  IntegrationPhase6Event,
  ErrorEvent
} from './SelfHealingEventSystem';

/**
 * Create a default event system instance
 */
export function createDefaultEventSystem(): SelfHealingEventSystem {
  return new SelfHealingEventSystem({
    enableLogging: true,
    enableMetrics: true,
    maxListeners: 20,
    correlationIdPrefix: 'selfhealing'
  });
}

/**
 * Utility to create common event listeners
 */
export function createConsoleLogger(): SelfHealingEventListener {
  return (event) => {
    console.log(`[SelfHealing] ${event.event}`, {
      timestamp: event.timestamp.toISOString(),
      source: event.source,
      correlationId: event.correlationId,
      data: event.data
    });
  };
}

export function createErrorHandler(onError: (error: Error, context: string) => void): SelfHealingEventListener {
  return (event) => {
    if (event.event === 'selfHealing:error') {
      const error = new Error(event.data.error);
      error.stack = event.data.stackTrace;
      onError(error, event.data.context);
    }
  };
}

export function createMetricsCollector(): {
  listener: SelfHealingEventListener;
  getMetrics: () => any;
} {
  const metrics = {
    totalEvents: 0,
    byEventType: {} as Record<string, number>,
    bySource: {} as Record<string, number>,
    errors: [] as Array<{ timestamp: Date; error: string; context: string }>,
    lastEventTime: null as Date | null
  };

  const listener: SelfHealingEventListener = (event) => {
    metrics.totalEvents++;
    metrics.byEventType[event.event] = (metrics.byEventType[event.event] || 0) + 1;
    metrics.bySource[event.source] = (metrics.bySource[event.source] || 0) + 1;
    metrics.lastEventTime = event.timestamp;

    if (event.event === 'selfHealing:error') {
      metrics.errors.push({
        timestamp: event.timestamp,
        error: event.data.error,
        context: event.data.context
      });
    }
  };

  return {
    listener,
    getMetrics: () => ({ ...metrics })
  };
}