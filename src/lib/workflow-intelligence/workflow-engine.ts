/**
 * Workflow Intelligence Layer - PHASE 25
 * Manages workflow execution, task generation, and project reasoning for the Oscar-AI-v2 system
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
 * Workflow Intelligence Engine - Manages workflow execution and project reasoning
 */
export class WorkflowIntelligenceEngine {
  private config: WorkflowConfig;
  private taskGeneratorConfig: TaskGeneratorConfig;
  private workflows: Map<string, Workflow> = new Map();
  private projects: Map<string, Project> = new Map();
  private eventListeners: WorkflowEventListener[] = [];
  private executionContexts: Map<string, ExecutionContext> = new Map();
  private performanceMetrics: Map<string, WorkflowPerformanceMetrics> = new Map();

  constructor(
    config: WorkflowConfig = {
      enableAutoStart: true,
      enableAutoSave: true,
      maxConcurrentTasks: 3,
      taskTimeout: 300000, // 5 minutes
      retryAttempts: 3,
      enableNotifications: true
    },
    taskGeneratorConfig: TaskGeneratorConfig = {
      enableAutoGeneration: true,
      maxTasksPerWorkflow: 50,
      enableDependencyAnalysis: true,
      enablePriorityAssignment: true,
      enableTimeEstimation: true
    }
  ) {
    this.config = config;
    this.taskGeneratorConfig = taskGeneratorConfig;
    
    // Initialize event listeners
    if (config.eventListeners) {
      this.eventListeners.push(...config.eventListeners);
    }
  }

  /**
   * Create a new workflow
   */
  createWorkflow(
    name: string,
    description: string,
    tasks: Task[] = [],
    config?: Partial<Workflow['metadata']>
  ): Workflow {
    const workflow: Workflow = {
      id: this.generateId(),
      name,
      description,
      status: WorkflowStatus.PENDING,
      tasks,
      currentTaskIndex: 0,
      metadata: {
        totalEstimatedTime: tasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0),
        totalActualTime: 0,
        progress: 0,
        priority: TaskPriority.MEDIUM,
        assignee: config?.assignee,
        dueDate: config?.dueDate,
        tags: config?.tags || [],
        ...config
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.workflows.set(workflow.id, workflow);
    this.emitEvent(WorkflowEventType.PROJECT_CREATED, { workflowId: workflow.id, data: workflow });
    
    return workflow;
  }

  /**
   * Create a new project
   */
  createProject(
    name: string,
    description: string,
    workflows: Workflow[] = [],
    config?: Partial<Project['metadata']>
  ): Project {
    const project: Project = {
      id: this.generateId(),
      name,
      description,
      status: 'planning',
      workflows,
      metadata: {
        totalTasks: workflows.reduce((sum, wf) => sum + wf.tasks.length, 0),
        completedTasks: 0,
        totalEstimatedTime: workflows.reduce((sum, wf) => sum + wf.metadata.totalEstimatedTime, 0),
        totalActualTime: 0,
        progress: 0,
        priority: TaskPriority.MEDIUM,
        assignee: config?.assignee,
        dueDate: config?.dueDate,
        tags: config?.tags || [],
        budget: config?.budget,
        cost: config?.cost,
        ...config
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.projects.set(project.id, project);
    this.emitEvent(WorkflowEventType.PROJECT_CREATED, { projectId: project.id, data: project });
    
    return project;
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    if (workflow.status !== WorkflowStatus.PENDING) {
      throw new Error(`Workflow is not in pending state: ${workflow.status}`);
    }

    // Update workflow status
    workflow.status = WorkflowStatus.RUNNING;
    workflow.updatedAt = new Date();
    
    // Create execution context
    const context: ExecutionContext = {
      workflow,
      currentStep: null!,
      variables: {},
      metadata: {},
      startTime: new Date(),
      lastUpdate: new Date()
    };
    
    this.executionContexts.set(workflowId, context);
    
    // Emit event
    this.emitEvent(WorkflowEventType.WORKFLOW_STARTED, { workflowId, data: workflow });
    
    try {
      // Execute workflow tasks
      await this.executeWorkflowTasks(workflow, context);
      
      // Update workflow status
      workflow.status = WorkflowStatus.COMPLETED;
      workflow.completedAt = new Date();
      workflow.metadata.progress = 100;
      
      // Emit completion event
      this.emitEvent(WorkflowEventType.WORKFLOW_COMPLETED, { workflowId, data: workflow });
      
    } catch (error) {
      // Update workflow status
      workflow.status = WorkflowStatus.FAILED;
      workflow.error = error instanceof Error ? error.message : String(error);
      workflow.updatedAt = new Date();
      
      // Emit failure event
      this.emitEvent(WorkflowEventType.WORKFLOW_FAILED, { workflowId, data: { error: workflow.error } });
      
      throw error;
    } finally {
      // Clean up execution context
      this.executionContexts.delete(workflowId);
    }
  }

  /**
   * Execute workflow tasks
   */
  private async executeWorkflowTasks(workflow: Workflow, context: ExecutionContext): Promise<void> {
    const startTime = Date.now();
    
    for (let i = 0; i < workflow.tasks.length; i++) {
      const task = workflow.tasks[i];
      
      // Skip completed tasks
      if (task.status === TaskStatus.COMPLETED) {
        continue;
      }
      
      // Check dependencies
      if (!this.checkDependencies(task, workflow)) {
        task.status = TaskStatus.BLOCKED;
        continue;
      }
      
      // Update current task index
      workflow.currentTaskIndex = i;
      
      // Execute task
      await this.executeTask(task, workflow, context);
      
      // Update workflow progress
      this.updateWorkflowProgress(workflow);
    }
    
    // Update performance metrics
    const executionTime = Date.now() - startTime;
    this.updatePerformanceMetrics(workflow.id, { executionTime, memoryUsage: 0, cpuUsage: 0, throughput: workflow.tasks.length, latency: executionTime / workflow.tasks.length, errorRate: 0, retryRate: 0 });
  }

  /**
   * Execute a single task
   */
  private async executeTask(task: Task, workflow: Workflow, context: ExecutionContext): Promise<void> {
    const startTime = Date.now();
    
    // Update task status
    task.status = TaskStatus.RUNNING;
    task.updatedAt = new Date();
    
    // Emit event
    this.emitEvent(WorkflowEventType.TASK_STARTED, { workflowId: workflow.id, taskId: task.id, data: task });
    
    try {
      // Execute task logic (placeholder for actual task execution)
      await this.executeTaskLogic(task, workflow, context);
      
      // Update task status
      task.status = TaskStatus.COMPLETED;
      task.completedAt = new Date();
      task.actualTime = Date.now() - startTime;
      
      // Emit completion event
      this.emitEvent(WorkflowEventType.TASK_COMPLETED, { workflowId: workflow.id, taskId: task.id, data: task });
      
    } catch (error) {
      // Update task status
      task.status = TaskStatus.FAILED;
      task.error = error instanceof Error ? error.message : String(error);
      task.updatedAt = new Date();
      
      // Emit failure event
      this.emitEvent(WorkflowEventType.TASK_FAILED, { workflowId: workflow.id, taskId: task.id, data: { error: task.error } });
      
      throw error;
    }
  }

  /**
   * Execute task logic (placeholder implementation)
   */
  private async executeTaskLogic(task: Task, workflow: Workflow, context: ExecutionContext): Promise<void> {
    // Simulate task execution
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock result
    task.result = {
      status: 'completed',
      output: `Task "${task.title}" completed successfully`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check task dependencies
   */
  private checkDependencies(task: Task, workflow: Workflow): boolean {
    if (task.dependencies.length === 0) {
      return true;
    }
    
    return task.dependencies.every(depId => {
      const depTask = workflow.tasks.find(t => t.id === depId);
      return depTask && depTask.status === TaskStatus.COMPLETED;
    });
  }

  /**
   * Update workflow progress
   */
  private updateWorkflowProgress(workflow: Workflow): void {
    const completedTasks = workflow.tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const totalTasks = workflow.tasks.length;
    
    workflow.metadata.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    workflow.metadata.totalActualTime = workflow.tasks.reduce((sum, task) => sum + (task.actualTime || 0), 0);
    workflow.updatedAt = new Date();
  }

  /**
   * Generate tasks for a workflow
   */
  generateTasks(workflowId: string, templateId?: string): Task[] {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }
    
    // Generate tasks based on template or default logic
    if (templateId && this.taskGeneratorConfig.templates) {
      const template = this.taskGeneratorConfig.templates.find(t => t.id === templateId);
      if (template) {
        return this.generateTasksFromTemplate(template, workflow);
      }
    }
    
    // Default task generation
    return this.generateDefaultTasks(workflow);
  }

  /**
   * Generate tasks from template
   */
  private generateTasksFromTemplate(template: TaskTemplate, workflow: Workflow): Task[] {
    const tasks: Task[] = [];
    const taskCount = Math.min(this.taskGeneratorConfig.maxTasksPerWorkflow, 10); // Limit to 10 tasks for demo
    
    for (let i = 0; i < taskCount; i++) {
      tasks.push({
        id: this.generateId(),
        title: `${template.name} - Task ${i + 1}`,
        description: template.description,
        priority: template.priority,
        status: TaskStatus.PENDING,
        dependencies: [],
        tags: template.tags,
        metadata: {
          ...template.config,
          templateId: template.id
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return tasks;
  }

  /**
   * Generate default tasks
   */
  private generateDefaultTasks(workflow: Workflow): Task[] {
    const tasks: Task[] = [];
    const taskCount = Math.min(this.taskGeneratorConfig.maxTasksPerWorkflow, 10); // Limit to 10 tasks for demo
    
    for (let i = 0; i < taskCount; i++) {
      tasks.push({
        id: this.generateId(),
        title: `Task ${i + 1}`,
        description: `Description for task ${i + 1}`,
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.PENDING,
        dependencies: [],
        tags: ['default'],
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return tasks;
  }

  /**
   * Perform project reasoning
   */
  performProjectReasoning(projectId: string): ProjectReasoningResult {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }
    
    // Analyze project data
    const completedWorkflows = project.workflows.filter(wf => wf.status === WorkflowStatus.COMPLETED).length;
    const totalWorkflows = project.workflows.length;
    const completedTasks = project.workflows.reduce((sum, wf) => sum + wf.tasks.filter(t => t.status === TaskStatus.COMPLETED).length, 0);
    const totalTasks = project.workflows.reduce((sum, wf) => sum + wf.tasks.length, 0);
    
    // Generate recommendations
    const recommendations: string[] = [];
    const risks: Array<{
      type: string;
      description: string;
      probability: number;
      impact: number;
      mitigation: string;
    }> = [];
    const opportunities: Array<{
      type: string;
      description: string;
      potential: number;
      effort: number;
      timeline: string;
    }> = [];
    const optimizations: Array<{
      type: string;
      description: string;
      savings: number;
      timeline: string;
    }> = [];
    
    // Analyze completion rates
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
    if (completionRate < 0.5) {
      recommendations.push('Consider reviewing task dependencies and priorities to improve completion rate');
      risks.push({
        type: 'completion',
        description: 'Low task completion rate may indicate issues with task planning or execution',
        probability: 0.7,
        impact: 0.8,
        mitigation: 'Review task assignments and provide better support for team members'
      });
    }
    
    // Analyze workflow efficiency
    const avgWorkflowTime = project.workflows.reduce((sum, wf) => {
      if (wf.completedAt && wf.createdAt) {
        return sum + (wf.completedAt.getTime() - wf.createdAt.getTime());
      }
      return sum;
    }, 0) / totalWorkflows;
    
    if (avgWorkflowTime > 7 * 24 * 60 * 60 * 1000) { // More than 7 days
      recommendations.push('Consider optimizing workflow processes to reduce execution time');
      optimizations.push({
        type: 'efficiency',
        description: 'Workflow execution time exceeds optimal duration',
        savings: 0.3,
        timeline: '2-4 weeks'
      });
    }
    
    // Identify opportunities
    if (project.workflows.length < 5) {
      opportunities.push({
        type: 'scaling',
        description: 'Project has room for additional workflows to increase throughput',
        potential: 0.8,
        effort: 0.3,
        timeline: '1-2 weeks'
      });
    }
    
    return {
      recommendations,
      risks,
      opportunities,
      optimizations
    };
  }

  /**
   * Optimize workflow
   */
  optimizeWorkflow(workflowId: string): WorkflowOptimizationResult {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }
    
    const improvements: Array<{
      type: string;
      description: string;
      impact: number;
      timeline: string;
    }> = [];
    const recommendations: string[] = [];
    
    // Analyze task dependencies
    const circularDeps = this.findCircularDependencies(workflow);
    if (circularDeps.length > 0) {
      improvements.push({
        type: 'dependency',
        description: `Remove circular dependencies: ${circularDeps.join(', ')}`,
        impact: 0.9,
        timeline: '1 day'
      });
    }
    
    // Analyze task prioritization
    const lowPriorityTasks = workflow.tasks.filter(t => t.priority === TaskPriority.LOW && t.status === TaskStatus.PENDING);
    if (lowPriorityTasks.length > workflow.tasks.length * 0.3) {
      recommendations.push('Consider reevaluating task priorities to focus on high-value activities');
    }
    
    // Calculate efficiency metrics
    const beforeEfficiency = this.calculateWorkflowEfficiency(workflow);
    
    // Apply optimizations (simplified for demo)
    const optimized = improvements.length > 0;
    
    // Calculate after efficiency (simulated improvement)
    const afterEfficiency = optimized ? beforeEfficiency * 1.2 : beforeEfficiency;
    
    return {
      optimized,
      improvements,
      efficiency: {
        before: beforeEfficiency,
        after: afterEfficiency,
        improvement: optimized ? (afterEfficiency - beforeEfficiency) / beforeEfficiency : 0
      },
      recommendations
    };
  }

  /**
   * Find circular dependencies
   */
  private findCircularDependencies(workflow: Workflow): string[] {
    // Simplified circular dependency detection
    return []; // Placeholder implementation
  }

  /**
   * Calculate workflow efficiency
   */
  private calculateWorkflowEfficiency(workflow: Workflow): number {
    const completedTasks = workflow.tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const totalTasks = workflow.tasks.length;
    const avgActualTime = workflow.tasks.reduce((sum, t) => sum + (t.actualTime || 0), 0) / totalTasks;
    const avgEstimatedTime = workflow.tasks.reduce((sum, t) => sum + (t.estimatedTime || 0), 0) / totalTasks;
    
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
    const timeAccuracy = avgEstimatedTime > 0 ? Math.min(1, avgEstimatedTime / avgActualTime) : 1;
    
    return (completionRate * 0.6 + timeAccuracy * 0.4) * 100;
  }

  /**
   * Get workflow statistics
   */
  getWorkflowStatistics(): WorkflowStatistics {
    const allWorkflows = Array.from(this.workflows.values());
    const totalWorkflows = allWorkflows.length;
    const completedWorkflows = allWorkflows.filter(wf => wf.status === WorkflowStatus.COMPLETED).length;
    const runningWorkflows = allWorkflows.filter(wf => wf.status === WorkflowStatus.RUNNING).length;
    const failedWorkflows = allWorkflows.filter(wf => wf.status === WorkflowStatus.FAILED).length;
    
    const totalTasks = allWorkflows.reduce((sum, wf) => sum + wf.tasks.length, 0);
    const completedTasks = allWorkflows.reduce((sum, wf) => sum + wf.tasks.filter(t => t.status === TaskStatus.COMPLETED).length, 0);
    
    const avgCompletionTime = completedWorkflows > 0 
      ? allWorkflows
          .filter(wf => wf.completedAt && wf.createdAt)
          .reduce((sum, wf) => sum + (wf.completedAt!.getTime() - wf.createdAt.getTime()), 0) / completedWorkflows
      : 0;
    
    const avgTaskTime = completedTasks > 0
      ? allWorkflows
          .reduce((sum, wf) => sum + wf.tasks.reduce((taskSum, task) => taskSum + (task.actualTime || 0), 0), 0) / completedTasks
      : 0;
    
    const successRate = totalWorkflows > 0 ? (completedWorkflows / totalWorkflows) * 100 : 0;
    const efficiency = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    return {
      totalWorkflows,
      completedWorkflows,
      runningWorkflows,
      failedWorkflows,
      averageCompletionTime: avgCompletionTime,
      totalTasks,
      completedTasks,
      averageTaskTime: avgTaskTime,
      successRate,
      efficiency
    };
  }

  /**
   * Get workflow performance metrics
   */
  getWorkflowPerformanceMetrics(workflowId: string): WorkflowPerformanceMetrics | null {
    return this.performanceMetrics.get(workflowId) || null;
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(workflowId: string, metrics: Partial<WorkflowPerformanceMetrics>): void {
    const existing = this.performanceMetrics.get(workflowId) || {
      executionTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      throughput: 0,
      latency: 0,
      errorRate: 0,
      retryRate: 0
    };
    
    this.performanceMetrics.set(workflowId, { ...existing, ...metrics });
  }

  /**
   * Emit workflow event
   */
  private emitEvent(type: WorkflowEventType, data: Record<string, any>): void {
    const event: WorkflowEvent = {
      type,
      timestamp: new Date(),
      data: data.data || {}
    };
    
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('[WorkflowIntelligenceEngine] Event listener error:', error);
      }
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Get all projects
   */
  getAllProjects(): Project[] {
    return Array.from(this.projects.values());
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(id: string): Workflow | null {
    return this.workflows.get(id) || null;
  }

  /**
   * Get project by ID
   */
  getProject(id: string): Project | null {
    return this.projects.get(id) || null;
  }

  /**
   * Update workflow
   */
  updateWorkflow(id: string, updates: Partial<Workflow>): Workflow {
    const workflow = this.workflows.get(id);
    if (!workflow) {
      throw new Error(`Workflow not found: ${id}`);
    }
    
    Object.assign(workflow, updates, { updatedAt: new Date() });
    this.workflows.set(id, workflow);
    
    return workflow;
  }

  /**
   * Update project
   */
  updateProject(id: string, updates: Partial<Project>): Project {
    const project = this.projects.get(id);
    if (!project) {
      throw new Error(`Project not found: ${id}`);
    }
    
    Object.assign(project, updates, { updatedAt: new Date() });
    this.projects.set(id, project);
    
    return project;
  }

  /**
   * Delete workflow
   */
  deleteWorkflow(id: string): boolean {
    const deleted = this.workflows.delete(id);
    if (deleted) {
      this.performanceMetrics.delete(id);
      this.executionContexts.delete(id);
    }
    return deleted;
  }

  /**
   * Delete project
   */
  deleteProject(id: string): boolean {
    return this.projects.delete(id);
  }

  /**
   * Add event listener
   */
  addEventListener(listener: WorkflowEventListener): void {
    this.eventListeners.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: WorkflowEventListener): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * Clear all workflows
   */
  clearAllWorkflows(): void {
    this.workflows.clear();
    this.performanceMetrics.clear();
    this.executionContexts.clear();
  }

  /**
   * Clear all projects
   */
  clearAllProjects(): void {
    this.projects.clear();
  }

  /**
   * Get system status
   */
  getSystemStatus(): {
    workflows: number;
    projects: number;
    runningWorkflows: number;
    completedWorkflows: number;
    performanceMetrics: Map<string, WorkflowPerformanceMetrics>;
  } {
    return {
      workflows: this.workflows.size,
      projects: this.projects.size,
      runningWorkflows: Array.from(this.workflows.values()).filter(wf => wf.status === WorkflowStatus.RUNNING).length,
      completedWorkflows: Array.from(this.workflows.values()).filter(wf => wf.status === WorkflowStatus.COMPLETED).length,
      performanceMetrics: this.performanceMetrics
    };
  }
}