/**
 * Intelligence Orchestrator interfaces
 * 
 * Defines the interfaces for PHASE_12: Report Intelligence Orchestrator
 */
export interface IntelligenceTask {
  /**
   * Unique identifier for the task
   */
  taskId: string;

  /**
   * Type of intelligence task
   */
  taskType: 'analysis' | 'generation' | 'validation' | 'optimization' | 'transformation';

  /**
   * Input parameters for the task
   */
  input: Record<string, any>;

  /**
   * Target document ID
   */
  documentId: string;

  /**
   * Priority of the task (1-10, higher = higher priority)
   */
  priority: number;

  /**
   * Status of the task
   */
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

  /**
   * Progress percentage (0-100)
   */
  progress: number;

  /**
   * Task dependencies
   */
  dependencies: string[];

  /**
   * Task metadata
   */
  metadata: {
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    estimatedDuration?: number;
    actualDuration?: number;
    retryCount: number;
    maxRetries: number;
  };

  /**
   * Task result
   */
  result?: Record<string, any>;

  /**
   * Task errors
   */
  errors: string[];

  /**
   * Task warnings
   */
  warnings: string[];
}

export interface OrchestratorConfig {
  /**
   * Maximum concurrent tasks
   */
  maxConcurrentTasks: number;

  /**
   * Task timeout in milliseconds
   */
  taskTimeout: number;

  /**
   * Retry configuration
   */
  retryConfig: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelay: number;
  };

  /**
   * Priority configuration
   */
  priorityConfig: {
    highPriorityWeight: number;
    normalPriorityWeight: number;
    lowPriorityWeight: number;
  };

  /**
   * Resource limits
   */
  resourceLimits: {
    maxMemory: number;
    maxCpu: number;
    maxStorage: number;
  };

  /**
   * Logging configuration
   */
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    logFile: string;
  };
}

export interface TaskQueue {
  /**
   * Array of pending tasks
   */
  pending: IntelligenceTask[];

  /**
   * Array of running tasks
   */
  running: IntelligenceTask[];

  /**
   * Array of completed tasks
   */
  completed: IntelligenceTask[];

  /**
   * Array of failed tasks
   */
  failed: IntelligenceTask[];

  /**
   * Array of cancelled tasks
   */
  cancelled: IntelligenceTask[];

  /**
   * Statistics about the queue
   */
  statistics: {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    averageCompletionTime: number;
    successRate: number;
  };
}

/**
 * Intelligence Orchestrator class
 * 
 * Implements PHASE_12: Report Intelligence Orchestrator from the Phase Compliance Package.
 * Coordinates all intelligence operations and manages task execution.
 */
export class IntelligenceOrchestrator {
  /**
   * Configuration for the orchestrator
   */
  config: OrchestratorConfig;

  /**
   * Task queue management
   */
  taskQueue: TaskQueue;

  /**
   * Running tasks map
   */
  private runningTasks: Map<string, IntelligenceTask> = new Map();

  /**
   * Task execution workers
   */
  private workers: Worker[] = [];

  /**
   * Event handlers
   */
  private eventHandlers: Map<string, Function[]> = new Map();

  /**
   * Initialize the Intelligence Orchestrator
   * @param config - Configuration for the orchestrator
   */
  constructor(config: Partial<OrchestratorConfig> = {}) {
    this.config = this.mergeConfig(config);
    this.taskQueue = this.initializeTaskQueue();
    this.initializeWorkers();
  }

  /**
   * Submit a new intelligence task
   * @param task - Task to submit
   * @returns Task ID
   */
  submitTask(task: Omit<IntelligenceTask, 'taskId' | 'status' | 'progress' | 'metadata' | 'errors' | 'warnings'>): string {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullTask: IntelligenceTask = {
      taskId,
      status: 'pending',
      progress: 0,
      metadata: {
        createdAt: new Date().toISOString(),
        retryCount: 0,
        maxRetries: this.config.retryConfig.maxRetries
      },
      errors: [],
      warnings: [],
      ...task
    };

    // Add to pending queue
    this.taskQueue.pending.push(fullTask);
    
    // Trigger task submitted event
    this.emit('taskSubmitted', fullTask);
    
    // Start processing if not already running
    if (this.workers.length > 0) {
      this.processTaskQueue();
    }
    
    return taskId;
  }

  /**
   * Cancel a task
   * @param taskId - ID of the task to cancel
   * @returns Success status
   */
  cancelTask(taskId: string): boolean {
    // Check pending tasks
    const pendingIndex = this.taskQueue.pending.findIndex(t => t.taskId === taskId);
    if (pendingIndex !== -1) {
      const task = this.taskQueue.pending.splice(pendingIndex, 1)[0];
      task.status = 'cancelled';
      this.taskQueue.cancelled.push(task);
      this.emit('taskCancelled', task);
      return true;
    }

    // Check running tasks
    const runningTask = this.runningTasks.get(taskId);
    if (runningTask) {
      runningTask.status = 'cancelled';
      this.taskQueue.cancelled.push(runningTask);
      this.runningTasks.delete(taskId);
      this.emit('taskCancelled', runningTask);
      return true;
    }

    return false;
  }

  /**
   * Get task status
   * @param taskId - ID of the task to check
   * @returns Task information or undefined
   */
  getTaskStatus(taskId: string): IntelligenceTask | undefined {
    // Check all queues
    const allTasks = [
      ...this.taskQueue.pending,
      ...this.taskQueue.running,
      ...this.taskQueue.completed,
      ...this.taskQueue.failed,
      ...this.taskQueue.cancelled
    ];
    
    return allTasks.find(task => task.taskId === taskId);
  }

  /**
   * Get task queue statistics
   * @returns Task queue statistics
   */
  getQueueStatistics(): TaskQueue['statistics'] {
    const totalTasks = this.taskQueue.pending.length + 
                     this.taskQueue.running.length + 
                     this.taskQueue.completed.length + 
                     this.taskQueue.failed.length + 
                     this.taskQueue.cancelled.length;
    
    const completedTasks = this.taskQueue.completed.length;
    const failedTasks = this.taskQueue.failed.length;
    const successRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
    
    // Calculate average completion time (placeholder)
    const averageCompletionTime = 0; // Would need to track actual completion times
    
    return {
      totalTasks,
      completedTasks,
      failedTasks,
      averageCompletionTime,
      successRate
    };
  }

  /**
   * Pause task processing
   */
  pauseProcessing(): void {
    this.emit('processingPaused');
  }

  /**
   * Resume task processing
   */
  resumeProcessing(): void {
    this.processTaskQueue();
    this.emit('processingResumed');
  }

  /**
   * Shutdown the orchestrator
   */
  shutdown(): void {
    // Cancel all running tasks
    for (const [taskId, task] of this.runningTasks) {
      task.status = 'cancelled';
      this.taskQueue.cancelled.push(task);
    }
    this.runningTasks.clear();
    
    // Stop all workers
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    
    this.emit('shutdown');
  }

  /**
   * Add event handler
   * @param event - Event name
   * @param handler - Event handler function
   */
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  /**
   * Remove event handler
   * @param event - Event name
   * @param handler - Event handler function to remove
   */
  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event
   * @param event - Event name
   * @param data - Event data
   */
  private emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Process the task queue
   */
  private processTaskQueue(): void {
    if (this.taskQueue.running.length >= this.config.maxConcurrentTasks) {
      return; // Max concurrent tasks reached
    }

    // Get next highest priority task
    const nextTask = this.getNextTask();
    if (!nextTask) {
      return; // No more tasks to process
    }

    // Start the task
    this.startTask(nextTask);
  }

  /**
   * Get the next task to execute based on priority and dependencies
   * @returns Next task or undefined
   */
  private getNextTask(): IntelligenceTask | undefined {
    // Sort pending tasks by priority and dependencies
    const sortedTasks = [...this.taskQueue.pending].sort((a, b) => {
      // First sort by priority (higher priority first)
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      
      // Then sort by creation time (older first)
      return new Date(a.metadata.createdAt).getTime() - new Date(b.metadata.createdAt).getTime();
    });

    // Find first task with resolved dependencies
    for (const task of sortedTasks) {
      if (this.areDependenciesResolved(task)) {
        return task;
      }
    }

    return undefined;
  }

  /**
   * Check if task dependencies are resolved
   * @param task - Task to check
   * @returns Whether dependencies are resolved
   */
  private areDependenciesResolved(task: IntelligenceTask): boolean {
    for (const depId of task.dependencies) {
      const depTask = this.getTaskStatus(depId);
      if (!depTask || depTask.status !== 'completed') {
        return false;
      }
    }
    return true;
  }

  /**
   * Start a task execution
   * @param task - Task to start
   */
  private startTask(task: IntelligenceTask): void {
    // Remove from pending queue
    const index = this.taskQueue.pending.findIndex(t => t.taskId === task.taskId);
    if (index !== -1) {
      this.taskQueue.pending.splice(index, 1);
    }

    // Update task status
    task.status = 'running';
    task.metadata.startedAt = new Date().toISOString();
    task.progress = 0;

    // Add to running tasks
    this.runningTasks.set(task.taskId, task);
    this.taskQueue.running.push(task);

    // Trigger task started event
    this.emit('taskStarted', task);

    // Execute task in worker
    this.executeTask(task);
  }

  /**
   * Execute a task in a worker
   * @param task - Task to execute
   */
  private async executeTask(task: IntelligenceTask): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Simulate task execution
      const result = await this.simulateTaskExecution(task);
      
      // Update task with result
      task.status = 'completed';
      task.progress = 100;
      task.metadata.completedAt = new Date().toISOString();
      task.metadata.actualDuration = Date.now() - startTime;
      task.result = result;
      
      // Move to completed queue
      this.moveToCompleted(task);
      
      // Trigger task completed event
      this.emit('taskCompleted', task);
      
    } catch (error) {
      // Handle task failure
      task.status = 'failed';
      task.metadata.actualDuration = Date.now() - startTime;
      task.errors = [`Task execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`];
      
      // Check if we should retry
      if (task.metadata.retryCount < task.metadata.maxRetries) {
        task.metadata.retryCount++;
        task.status = 'pending';
        task.errors = [];
        this.taskQueue.pending.push(task);
        
        // Trigger task retry event
        this.emit('taskRetry', task);
        
        // Schedule retry with backoff
        setTimeout(() => {
          this.processTaskQueue();
        }, this.calculateBackoffDelay(task.metadata.retryCount));
        
      } else {
        // Move to failed queue
        this.moveToFailed(task);
        
        // Trigger task failed event
        this.emit('taskFailed', task);
      }
    } finally {
      // Remove from running tasks
      this.runningTasks.delete(task.taskId);
      
      // Process next task
      this.processTaskQueue();
    }
  }

  /**
   * Simulate task execution (placeholder)
   * @param task - Task to execute
   * @returns Task result
   */
  private async simulateTaskExecution(task: IntelligenceTask): Promise<Record<string, any>> {
    // Simulate different task types
    const duration = Math.random() * 5000 + 1000; // 1-6 seconds
    
    await new Promise(resolve => setTimeout(resolve, duration));
    
    // Update progress during execution
    for (let i = 0; i <= 100; i += 10) {
      task.progress = i;
      await new Promise(resolve => setTimeout(resolve, duration / 10));
    }
    
    return {
      taskId: task.taskId,
      taskType: task.taskType,
      documentId: task.documentId,
      result: `Task ${task.taskType} completed successfully for document ${task.documentId}`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate backoff delay for retries
   * @param retryCount - Number of retries attempted
   * @returns Delay in milliseconds
   */
  private calculateBackoffDelay(retryCount: number): number {
    return this.config.retryConfig.initialDelay * 
           Math.pow(this.config.retryConfig.backoffMultiplier, retryCount);
  }

  /**
   * Move task to completed queue
   * @param task - Task to move
   */
  private moveToCompleted(task: IntelligenceTask): void {
    const index = this.taskQueue.running.findIndex(t => t.taskId === task.taskId);
    if (index !== -1) {
      this.taskQueue.running.splice(index, 1);
    }
    this.taskQueue.completed.push(task);
  }

  /**
   * Move task to failed queue
   * @param task - Task to move
   */
  private moveToFailed(task: IntelligenceTask): void {
    const index = this.taskQueue.running.findIndex(t => t.taskId === task.taskId);
    if (index !== -1) {
      this.taskQueue.running.splice(index, 1);
    }
    this.taskQueue.failed.push(task);
  }

  /**
   * Initialize task queue
   * @returns Empty task queue
   */
  private initializeTaskQueue(): TaskQueue {
    return {
      pending: [],
      running: [],
      completed: [],
      failed: [],
      cancelled: [],
      statistics: {
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        averageCompletionTime: 0,
        successRate: 0
      }
    };
  }

  /**
   * Initialize workers
   */
  private initializeWorkers(): void {
    // Create worker pool based on max concurrent tasks
    for (let i = 0; i < this.config.maxConcurrentTasks; i++) {
      const worker = new Worker(this.createWorkerScript());
      this.workers.push(worker);
    }
  }

  /**
   * Create worker script (placeholder)
   * @returns Worker script as blob URL
   */
  private createWorkerScript(): string {
    const script = `
      self.onmessage = function(e) {
        const { task } = e.data;
        
        // Simulate task execution
        setTimeout(() => {
          self.postMessage({
            taskId: task.taskId,
            success: true,
            result: {
              message: 'Task completed successfully',
              timestamp: new Date().toISOString()
            }
          });
        }, Math.random() * 2000 + 1000);
      };
    `;
    
    const blob = new Blob([script], { type: 'application/javascript' });
    return URL.createObjectURL(blob);
  }

  /**
   * Merge default configuration with provided config
   * @param config - User-provided configuration
   * @returns Merged configuration
   */
  private mergeConfig(config: Partial<OrchestratorConfig>): OrchestratorConfig {
    return {
      maxConcurrentTasks: config.maxConcurrentTasks || 5,
      taskTimeout: config.taskTimeout || 30000,
      retryConfig: {
        maxRetries: config.retryConfig?.maxRetries || 3,
        backoffMultiplier: config.retryConfig?.backoffMultiplier || 2,
        initialDelay: config.retryConfig?.initialDelay || 1000,
        ...config.retryConfig
      },
      priorityConfig: {
        highPriorityWeight: config.priorityConfig?.highPriorityWeight || 3,
        normalPriorityWeight: config.priorityConfig?.normalPriorityWeight || 2,
        lowPriorityWeight: config.priorityConfig?.lowPriorityWeight || 1,
        ...config.priorityConfig
      },
      resourceLimits: {
        maxMemory: config.resourceLimits?.maxMemory || 1024 * 1024 * 1024, // 1GB
        maxCpu: config.resourceLimits?.maxCpu || 80, // 80%
        maxStorage: config.resourceLimits?.maxStorage || 10 * 1024 * 1024 * 1024, // 10GB
        ...config.resourceLimits
      },
      logging: {
        enabled: config.logging?.enabled ?? true,
        level: config.logging?.level || 'info',
        logFile: config.logging?.logFile || 'intelligence-orchestrator.log',
        ...config.logging
      }
    };
  }
}