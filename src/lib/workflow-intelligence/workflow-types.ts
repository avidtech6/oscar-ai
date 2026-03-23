/**
 * Workflow Intelligence Layer - PHASE 25
 * Type definitions for the Workflow Intelligence System
 */

/**
 * Workflow status types
 */
export enum WorkflowStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled'
}

/**
 * Task priority levels
 */
export enum TaskPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4
}

/**
 * Task status types
 */
export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  BLOCKED = 'blocked',
  CANCELLED = 'cancelled'
}

/**
 * Task interface
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee?: string;
  dueDate?: Date;
  estimatedTime?: number;
  actualTime?: number;
  dependencies: string[];
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
}

/**
 * Workflow interface
 */
export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  tasks: Task[];
  currentTaskIndex: number;
  metadata: {
    totalEstimatedTime: number;
    totalActualTime: number;
    progress: number;
    priority: TaskPriority;
    assignee?: string;
    dueDate?: Date;
    tags: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
}

/**
 * Project interface
 */
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
  workflows: Workflow[];
  metadata: {
    totalTasks: number;
    completedTasks: number;
    totalEstimatedTime: number;
    totalActualTime: number;
    progress: number;
    priority: TaskPriority;
    assignee?: string;
    dueDate?: Date;
    tags: string[];
    budget?: number;
    cost?: number;
  };
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

/**
 * Workflow step interface
 */
export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'task' | 'condition' | 'loop' | 'parallel' | 'decision';
  config: Record<string, any>;
  status: WorkflowStatus;
  result?: any;
  error?: string;
  children?: WorkflowStep[];
}

/**
 * Workflow execution context
 */
export interface ExecutionContext {
  workflow: Workflow;
  currentStep: WorkflowStep;
  variables: Record<string, any>;
  metadata: Record<string, any>;
  startTime: Date;
  lastUpdate: Date;
}

/**
 * Workflow event types
 */
export enum WorkflowEventType {
  WORKFLOW_STARTED = 'workflow_started',
  WORKFLOW_COMPLETED = 'workflow_completed',
  WORKFLOW_FAILED = 'workflow_failed',
  TASK_STARTED = 'task_started',
  TASK_COMPLETED = 'task_completed',
  TASK_FAILED = 'task_failed',
  STEP_STARTED = 'step_started',
  STEP_COMPLETED = 'step_completed',
  PROJECT_CREATED = 'project_created',
  PROJECT_UPDATED = 'project_updated',
  PROJECT_COMPLETED = 'project_completed'
}

/**
 * Workflow event
 */
export interface WorkflowEvent {
  type: WorkflowEventType;
  timestamp: Date;
  workflowId?: string;
  taskId?: string;
  projectId?: string;
  data: Record<string, any>;
}

/**
 * Workflow event listener
 */
export type WorkflowEventListener = (event: WorkflowEvent) => void;

/**
 * Workflow configuration
 */
export interface WorkflowConfig {
  enableAutoStart: boolean;
  enableAutoSave: boolean;
  maxConcurrentTasks: number;
  taskTimeout: number;
  retryAttempts: number;
  enableNotifications: boolean;
  eventListeners?: WorkflowEventListener[];
  persistence?: {
    enabled: boolean;
    interval: number;
    maxHistory: number;
  };
}

/**
 * Task generator configuration
 */
export interface TaskGeneratorConfig {
  enableAutoGeneration: boolean;
  maxTasksPerWorkflow: number;
  enableDependencyAnalysis: boolean;
  enablePriorityAssignment: boolean;
  enableTimeEstimation: boolean;
  templates?: TaskTemplate[];
}

/**
 * Task template interface
 */
export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  config: Record<string, any>;
  priority: TaskPriority;
  estimatedTime: number;
  tags: string[];
  conditions?: Record<string, any>;
}

/**
 * Project reasoning result
 */
export interface ProjectReasoningResult {
  recommendations: string[];
  risks: Array<{
    type: string;
    description: string;
    probability: number;
    impact: number;
    mitigation: string;
  }>;
  opportunities: Array<{
    type: string;
    description: string;
    potential: number;
    effort: number;
    timeline: string;
  }>;
  optimizations: Array<{
    type: string;
    description: string;
    savings: number;
    timeline: string;
  }>;
}

/**
 * Workflow optimization result
 */
export interface WorkflowOptimizationResult {
  optimized: boolean;
  improvements: Array<{
    type: string;
    description: string;
    impact: number;
    timeline: string;
  }>;
  efficiency: {
    before: number;
    after: number;
    improvement: number;
  };
  recommendations: string[];
}

/**
 * Workflow statistics
 */
export interface WorkflowStatistics {
  totalWorkflows: number;
  completedWorkflows: number;
  runningWorkflows: number;
  failedWorkflows: number;
  averageCompletionTime: number;
  totalTasks: number;
  completedTasks: number;
  averageTaskTime: number;
  successRate: number;
  efficiency: number;
}

/**
 * Workflow performance metrics
 */
export interface WorkflowPerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  throughput: number;
  latency: number;
  errorRate: number;
  retryRate: number;
}

/**
 * Workflow step types
 */
export enum WorkflowStepType {
  TASK = 'task',
  CONDITION = 'condition',
  LOOP = 'loop',
  PARALLEL = 'parallel',
  DECISION = 'decision',
  WAIT = 'wait',
  NOTIFICATION = 'notification',
  VALIDATION = 'validation'
}

/**
 * Workflow step configuration
 */
export interface WorkflowStepConfig {
  timeout?: number;
  retryCount?: number;
  conditions?: Record<string, any>;
  parameters?: Record<string, any>;
  notifications?: Array<{
    type: string;
    message: string;
    recipients: string[];
  }>;
}

/**
 * Task assignment
 */
export interface TaskAssignment {
  taskId: string;
  assignee: string;
  assignedAt: Date;
  status: 'assigned' | 'accepted' | 'declined' | 'completed';
  estimatedTime?: number;
  actualTime?: number;
  notes?: string;
}

/**
 * Workflow template
 */
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: Array<{
    id: string;
    name: string;
    type: WorkflowStepType;
    config: WorkflowStepConfig;
    priority: TaskPriority;
    estimatedTime: number;
    dependencies: string[];
  }>;
  metadata: {
    totalEstimatedTime: number;
    totalTasks: number;
    tags: string[];
    complexity: 'simple' | 'moderate' | 'complex';
  };
}

/**
 * Workflow execution history
 */
export interface WorkflowExecutionHistory {
  id: string;
  workflowId: string;
  executionId: string;
  startTime: Date;
  endTime?: Date;
  status: WorkflowStatus;
  stepsExecuted: Array<{
    stepId: string;
    startTime: Date;
    endTime?: Date;
    status: WorkflowStatus;
    result?: any;
    error?: string;
  }>;
  variables: Record<string, any>;
  metadata: Record<string, any>;
}

/**
 * Task execution history
 */
export interface TaskExecutionHistory {
  id: string;
  taskId: string;
  workflowId: string;
  executionId: string;
  startTime: Date;
  endTime?: Date;
  status: TaskStatus;
  result?: any;
  error?: string;
  retries: number;
  metadata: Record<string, any>;
}

/**
 * Workflow dashboard metrics
 */
export interface WorkflowDashboardMetrics {
  activeWorkflows: number;
  completedWorkflows: number;
  failedWorkflows: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  highPriorityTasks: number;
  averageCompletionTime: number;
  successRate: number;
  throughput: number;
  efficiency: number;
}

/**
 * Workflow filter options
 */
export interface WorkflowFilterOptions {
  status?: WorkflowStatus[];
  priority?: TaskPriority[];
  assignee?: string[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

/**
 * Task filter options
 */
export interface TaskFilterOptions {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignee?: string[];
  tags?: string[];
  dueDate?: {
    before?: Date;
    after?: Date;
  };
  workflowId?: string;
  search?: string;
}

/**
 * Workflow export options
 */
export interface WorkflowExportOptions {
  format: 'json' | 'csv' | 'pdf' | 'xml';
  includeHistory: boolean;
  includeMetrics: boolean;
  includeDetails: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filter?: WorkflowFilterOptions;
}

/**
 * Workflow export result
 */
export interface WorkflowExportResult {
  success: boolean;
  content: string;
  filename: string;
  mimeType: string;
  size: number;
  downloadUrl?: string;
  error?: string;
}

/**
 * Workflow collaboration options
 */
export interface WorkflowCollaborationOptions {
  enableRealTime: boolean;
  enableComments: boolean;
  enableTaskAssignments: boolean;
  enableNotifications: boolean;
  maxConcurrentEditors: number;
  autoSave: boolean;
  saveInterval: number;
}

/**
 * Workflow notification settings
 */
export interface WorkflowNotificationSettings {
  enableEmail: boolean;
  enableInApp: boolean;
  enablePush: boolean;
  events: WorkflowEventType[];
  recipients: string[];
  template?: string;
}