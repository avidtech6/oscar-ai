/**
 * Automation Layer Type Definitions
 * Phase 33.5 - Automation Layer (Triggers + Routines)
 */

export type TriggerType = 'event' | 'time' | 'state' | 'schedule' | 'manual';

export type ActionType = 'document' | 'notification' | 'workflow' | 'api' | 'system' | 'custom';

export type ConditionOperator = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'exists' | 'not_exists';

export type ScheduleFrequency = 'once' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year' | 'custom';

export interface AutomationContext {
  id: string;
  timestamp: number;
  userId: string;
  sessionId?: string;
  metadata: Record<string, any>;
  systemState: Record<string, any>;
  knowledgeGraph?: any;
  workflowEngine?: any;
  triggerData?: any;
}

export interface Trigger {
  id: string;
  name: string;
  type: TriggerType;
  enabled: boolean;
  conditions?: Condition[];
  schedule?: Schedule;
  eventSource?: string;
  eventPattern?: string;
  cooldownPeriod?: number;
  maxExecutions?: number;
  executionCount: number;
  createdAt: number;
  updatedAt: number;
  lastTriggered?: number;
}

export interface Condition {
  id: string;
  field: string;
  operator: ConditionOperator;
  value: any;
  negate?: boolean;
  description?: string;
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  triggers: Trigger[];
  actions: Action[];
  conditions?: Condition[];
  timeout?: number;
  retryPolicy?: RetryPolicy;
  logging: LoggingConfig;
  metadata: Record<string, any>;
  createdAt: number;
  updatedAt: number;
  lastExecuted?: number;
  executionCount: number;
  successCount: number;
  failureCount: number;
}

export interface Action {
  id: string;
  name: string;
  type: ActionType;
  enabled: boolean;
  config: ActionConfig;
  conditions?: Condition[];
  timeout?: number;
  retryPolicy?: RetryPolicy;
  metadata: Record<string, any>;
}

export interface ActionConfig {
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  documentId?: string;
  workflowId?: string;
  template?: string;
  parameters?: Record<string, any>;
}

export interface Schedule {
  frequency: ScheduleFrequency;
  interval?: number;
  cronExpression?: string;
  startTime?: number;
  endTime?: number;
  timezone?: string;
  runOnStartup?: boolean;
}

export interface RetryPolicy {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier?: number;
  maxDelayMs?: number;
  retryableErrors?: string[];
}

export interface LoggingConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
  includeContext: boolean;
  includeTriggerData: boolean;
  maxLogSize?: number;
}

export interface AutomationResult {
  success: boolean;
  routineId: string;
  routineName: string;
  executionId: string;
  startTime: number;
  endTime: number;
  duration: number;
  trigger: Trigger;
  actionsExecuted: string[];
  errors: string[];
  context: AutomationContext;
  metadata: Record<string, any>;
}

export interface AutomationStats {
  totalRoutines: number;
  enabledRoutines: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  lastExecutionTime?: number;
  mostActiveTrigger: string;
  mostFailedAction: string;
}

export interface AutomationEngineConfig {
  maxConcurrentExecutions: number;
  defaultTimeout: number;
  defaultCooldown: number;
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  maxRetries: number;
  storagePath?: string;
  enablePersistence: boolean;
  cleanupIntervalMs?: number;
}

export interface TriggerEvaluationResult {
  shouldTrigger: boolean;
  triggeredBy: string;
  confidence: number;
  reason: string;
  metadata?: Record<string, any>;
}

export interface ActionExecutionResult {
  success: boolean;
  actionId: string;
  actionName: string;
  result: any;
  duration: number;
  error?: string;
  metadata?: Record<string, any>;
}

export interface RoutineExecutionResult {
  success: boolean;
  routineId: string;
  routineName: string;
  executionId: string;
  startTime: number;
  endTime: number;
  duration: number;
  actionsExecuted: ActionExecutionResult[];
  trigger: Trigger;
  context: AutomationContext;
  errors: string[];
  metadata: Record<string, any>;
}

export interface AutomationEvent {
  id: string;
  type: string;
  source: string;
  timestamp: number;
  data: any;
  metadata: Record<string, any>;
}

export interface AutomationListener {
  id: string;
  eventType: string;
  handler: (event: AutomationEvent) => Promise<void>;
  filter?: (event: AutomationEvent) => boolean;
  priority?: number;
}