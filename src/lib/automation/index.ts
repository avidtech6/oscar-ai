/**
 * Automation Layer - Phase 33.5
 * Entry point for the automation system
 */

export { AutomationEngine } from './automation-engine';
export { TriggerSystem } from './trigger-system';
export type {
  // Type exports from automation-types.ts
  TriggerType,
  ActionType,
  ConditionOperator,
  ScheduleFrequency,
  AutomationContext,
  Trigger,
  Condition,
  Routine,
  Action,
  ActionConfig,
  Schedule,
  RetryPolicy,
  LoggingConfig,
  AutomationResult,
  AutomationStats,
  AutomationEngineConfig,
  TriggerEvaluationResult,
  ActionExecutionResult,
  RoutineExecutionResult,
  AutomationEvent,
  AutomationListener
} from './automation-types';
