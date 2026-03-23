/**
 * Automation Engine for Phase 33.5
 * Handles routine execution, orchestration, and automation lifecycle
 */

import type {
  Routine,
  Action,
  ActionType,
  AutomationContext,
  AutomationResult,
  AutomationEvent,
  Trigger,
  TriggerEvaluationResult,
  AutomationEngineConfig,
  AutomationStats
} from './automation-types';

export class AutomationEngine {
  private routines: Map<string, Routine> = new Map();
  private activeExecutions: Map<string, Promise<AutomationResult>> = new Map();
  private executionHistory: AutomationResult[] = [];
  private stats: AutomationStats = {
    totalRoutines: 0,
    enabledRoutines: 0,
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    averageExecutionTime: 0,
    lastExecutionTime: 0,
    mostActiveTrigger: '',
    mostFailedAction: ''
  };
  private config: AutomationEngineConfig;
  private isRunning: boolean = false;
  private shutdownRequested: boolean = false;

  constructor(config: Partial<AutomationEngineConfig> = {}) {
    this.config = this.normalizeConfig(config);
    this.initializeDefaultRoutines();
  }

  /**
   * Execute a routine by ID
   */
  public async executeRoutine(
    routineId: string, 
    context: Partial<AutomationContext> = {}
  ): Promise<AutomationResult> {
    if (!this.isRunning) {
      throw new Error('Automation engine is not running');
    }

    if (this.activeExecutions.has(routineId)) {
      throw new Error(`Routine ${routineId} is already executing`);
    }

    const routine = this.routines.get(routineId);
    if (!routine) {
      throw new Error(`Routine ${routineId} not found`);
    }

    const executionId = `${routineId}-${Date.now()}`;
    const startTime = Date.now();
    
    try {
      const fullContext: AutomationContext = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        userId: 'system',
        systemState: {},
        metadata: {
          ...routine.metadata,
          ...context.metadata
        }
      };

      this.activeExecutions.set(executionId, this.executeRoutineInternal(routine, fullContext));
      const result = await this.activeExecutions.get(executionId)!;

      // Update statistics
      this.updateStats(result, Date.now() - startTime);
      
      // Add to history
      this.executionHistory.push(result);
      
      // Keep history within limits
      if (this.executionHistory.length > this.config.maxRetries) {
        this.executionHistory = this.executionHistory.slice(-this.config.maxRetries);
      }

      return result;
    } catch (error) {
      const result: AutomationResult = {
        success: false,
        routineId,
        executionId: `${routineId}-${Date.now()}`,
        routineName: routine.name,
        startTime,
        endTime: Date.now(),
        duration: Date.now() - startTime,
        trigger: routine.triggers[0] || { id: routine.id, name: routine.name, type: 'manual' as const, enabled: true, executionCount: 0, createdAt: 0, updatedAt: 0 },
        actionsExecuted: [] as string[],
        errors: [error instanceof Error ? error.message : String(error)],
        context: {
          id: Date.now().toString(),
          timestamp: Date.now(),
          userId: 'system',
          systemState: {},
          metadata: {}
        },
        metadata: {}
      };

      this.updateStats(result, Date.now() - startTime);
      this.executionHistory.push(result);
      
      throw error;
    } finally {
      this.activeExecutions.delete(executionId);
    }
  }

  /**
   * Execute multiple routines in sequence
   */
  public async executeRoutinesInSequence(
    routineIds: string[], 
    context: Partial<AutomationContext> = {}
  ): Promise<AutomationResult[]> {
    const results: AutomationResult[] = [];
    
    for (const routineId of routineIds) {
      if (this.shutdownRequested) {
        break;
      }
      
      try {
        const result = await this.executeRoutine(routineId, context);
        results.push(result);
        
        // If routine failed and we're configured to stop on failure, break
        if (!result.success && this.config.enableLogging) {
          break;
        }
      } catch (error) {
        const routine = this.routines.get(routineId);
        if (!routine) {
          throw new Error(`Routine ${routineId} not found`);
        }
        const result: AutomationResult = {
          success: false,
          routineId,
          executionId: `${routineId}-${Date.now()}`,
          routineName: routine.name,
          startTime: Date.now(),
          endTime: Date.now(),
          duration: 0,
          trigger: routine.triggers[0] || { id: routine.id, name: routine.name, type: 'manual' as const, enabled: true, executionCount: 0, createdAt: 0, updatedAt: 0 },
          actionsExecuted: [] as string[],
          errors: [error instanceof Error ? error.message : String(error)],
          context: {
            id: Date.now().toString(),
            timestamp: Date.now(),
            userId: 'system',
            systemState: {},
            metadata: {}
          },
          metadata: {}
        };
        
        results.push(result);
        
        if (this.config.enableLogging) {
          break;
        }
      }
    }
    
    return results;
  }

  /**
   * Execute multiple routines in parallel
   */
  public async executeRoutinesInParallel(
    routineIds: string[], 
    context: Partial<AutomationContext> = {}
  ): Promise<AutomationResult[]> {
    const promises = routineIds.map(routineId => 
      this.executeRoutine(routineId, context).catch(error => {
        const routine = this.routines.get(routineId);
        if (!routine) {
          throw new Error(`Routine ${routineId} not found`);
        }
        const result: AutomationResult = {
          success: false,
          routineId,
          executionId: `${routineId}-${Date.now()}`,
          routineName: routine.name,
          startTime: Date.now(),
          endTime: Date.now(),
          duration: 0,
          trigger: routine.triggers[0] || { id: routine.id, name: routine.name, type: 'manual' as const, enabled: true, executionCount: 0, createdAt: 0, updatedAt: 0 },
          actionsExecuted: [] as string[],
          errors: [error instanceof Error ? error.message : String(error)],
          context: {
            id: Date.now().toString(),
            timestamp: Date.now(),
            userId: 'system',
            systemState: {},
            metadata: {}
          },
          metadata: {}
        };
        return result;
      })
    );
    
    return Promise.all(promises);
  }

  /**
   * Register a new routine
   */
  public registerRoutine(routine: Routine): void {
    this.validateRoutine(routine);
    routine.createdAt = Date.now();
    routine.updatedAt = Date.now();
    routine.executionCount = 0;
    this.routines.set(routine.id, routine);
    console.log(`[AutomationEngine] Registered routine: ${routine.name} (${routine.id})`);
  }

  /**
   * Unregister a routine
   */
  public unregisterRoutine(routineId: string): boolean {
    const routine = this.routines.get(routineId);
    if (!routine) {
      return false;
    }

    // Check if routine is currently executing
    if (this.isRoutineExecuting(routineId)) {
      throw new Error(`Cannot unregister routine ${routineId}: it is currently executing`);
    }

    this.routines.delete(routineId);
    console.log(`[AutomationEngine] Unregistered routine: ${routineId}`);
    return true;
  }

  /**
   * Get a routine by ID
   */
  public getRoutine(routineId: string): Routine | undefined {
    return this.routines.get(routineId);
  }

  /**
   * Get all registered routines
   */
  public getAllRoutines(): Routine[] {
    return Array.from(this.routines.values());
  }

  /**
   * Get routines by category
   */
  public getRoutinesByMetadata(category: string): Routine[] {
    return this.getAllRoutines().filter(routine => routine.metadata?.category === category);
  }

  /**
   * Get execution history
   */
  public getExecutionHistory(limit?: number): AutomationResult[] {
    const history = this.executionHistory.slice().reverse();
    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Get statistics
   */
  public getStats(): AutomationStats {
    return { ...this.stats };
  }

  /**
   * Check if a routine is currently executing
   */
  public isRoutineExecuting(routineId: string): boolean {
    return Array.from(this.activeExecutions.keys()).some(id => id.includes(routineId));
  }

  /**
   * Get active executions
   */
  public getActiveExecutions(): string[] {
    return Array.from(this.activeExecutions.keys());
  }

  /**
   * Stop all running routines
   */
  public async stopAll(): Promise<void> {
    this.shutdownRequested = true;
    
    // Wait for active executions to complete or timeout
    const timeout = this.config.defaultTimeout || 30000;
    const startTime = Date.now();
    
    while (this.activeExecutions.size > 0 && Date.now() - startTime < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (this.activeExecutions.size > 0) {
      console.warn(`[AutomationEngine] Timeout waiting for ${this.activeExecutions.size} routines to complete`);
      this.activeExecutions.clear();
    }
    
    this.isRunning = false;
    console.log('[AutomationEngine] All routines stopped');
  }

  /**
   * Start the automation engine
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }
    
    this.isRunning = true;
    this.shutdownRequested = false;
    console.log('[AutomationEngine] Automation engine started');
  }

  /**
   * Shutdown the automation engine
   */
  public async shutdown(): Promise<void> {
    await this.stopAll();
    this.routines.clear();
    this.executionHistory = [];
    this.stats = {
      totalRoutines: 0,
      enabledRoutines: 0,
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      lastExecutionTime: 0,
      mostActiveTrigger: '',
      mostFailedAction: ''
    };
    console.log('[AutomationEngine] Automation engine shutdown complete');
  }

  /**
   * Internal routine execution
   */
  private async executeRoutineInternal(
    routine: Routine,
    context: AutomationContext
  ): Promise<AutomationResult> {
    const startTime = Date.now();
    let actionsExecuted: string[] = [];
    let lastError: Error | null = null;

    try {
      console.log(`[AutomationEngine] Executing routine: ${routine.name} (${routine.id})`);
      
      // Validate routine before execution
      this.validateRoutineExecution(routine, context);

      // Execute each action in sequence
      for (const action of routine.actions) {
        if (this.shutdownRequested) {
          throw new Error('Execution interrupted: shutdown requested');
        }

        try {
          await this.executeAction(action, context);
          actionsExecuted.push(action.id);
          console.log(`[AutomationEngine] Action executed: ${action.type}`);
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          console.error(`[AutomationEngine] Action failed: ${action.type}`, error);
          
          // If action fails and we have error handling, continue
          if (routine.retryPolicy && routine.retryPolicy.maxAttempts && routine.retryPolicy.maxAttempts > 0) {
            continue;
          } else {
            throw lastError;
          }
        }
      }

      const actionsExecutedList: string[] = actionsExecuted;
      return {
        success: true,
        routineId: routine.id,
        executionId: context.id,
        routineName: routine.name,
        startTime,
        endTime: Date.now(),
        duration: Date.now() - startTime,
        trigger: routine.triggers[0] || { id: routine.id, name: routine.name, type: 'manual' as const, enabled: true, executionCount: 0, createdAt: 0, updatedAt: 0 },
        actionsExecuted: actionsExecutedList,
        errors: [],
        context,
        metadata: {}
      };
    } catch (error) {
      const actionsExecutedList: string[] = actionsExecuted;
      return {
        success: false,
        routineId: routine.id,
        executionId: context.id,
        routineName: routine.name,
        startTime,
        endTime: Date.now(),
        duration: Date.now() - startTime,
        trigger: routine.triggers[0] || { id: routine.id, name: routine.name, type: 'manual' as const, enabled: true, executionCount: 0, createdAt: 0, updatedAt: 0 },
        actionsExecuted: actionsExecutedList,
        errors: [error instanceof Error ? error.message : String(error)],
        context,
        metadata: {}
      };
    }
  }

  /**
   * Execute a single action
   */
  private async executeAction(action: Action, context: AutomationContext): Promise<void> {
    const actionStartTime = Date.now();
    
    try {
      switch (action.type) {
        case 'api':
          await this.executeApiAction(action, context);
          break;
        case 'notification':
          await this.executeNotificationAction(action, context);
          break;
        case 'document':
          await this.executeDocumentAction(action, context);
          break;
        case 'workflow':
          await this.executeWorkflowAction(action, context);
          break;
        case 'system':
          await this.executeSystemAction(action, context);
          break;
        case 'custom':
          await this.executeCustomAction(action, context);
          break;
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
    } catch (error) {
      throw new Error(`Action ${action.type} failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Execute API action
   */
  private async executeApiAction(action: Action, context: AutomationContext): Promise<void> {
    const url = this.interpolateString(action.config?.endpoint || '', context);
    const method = action.config?.method || 'GET';
    const headers = action.config?.headers || {};
    const data = action.config?.body;
    
    console.log(`[AutomationEngine] API ${method} ${url}`);
    
    // Simulate API request
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Execute document action
   */
  private async executeDocumentAction(action: Action, context: AutomationContext): Promise<void> {
    const documentId = action.config?.documentId || 'unknown';
    
    console.log(`[AutomationEngine] Document: ${documentId}`);
    
    // Simulate document operation
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  /**
   * Execute workflow action
   */
  private async executeWorkflowAction(action: Action, context: AutomationContext): Promise<void> {
    const workflowId = action.config?.workflowId || 'unknown';
    
    console.log(`[AutomationEngine] Workflow: ${workflowId}`);
    
    // Simulate workflow execution
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  /**
   * Execute system action
   */
  private async executeSystemAction(action: Action, context: AutomationContext): Promise<void> {
    const operation = action.config?.template || 'info';
    
    console.log(`[AutomationEngine] System: ${operation}`);
    
    // Simulate system operation
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  /**
   * Execute custom action
   */
  private async executeCustomAction(action: Action, context: AutomationContext): Promise<void> {
    const script = action.config?.template || 'custom';
    
    console.log(`[AutomationEngine] Custom: ${script.substring(0, 50)}...`);
    
    // Simulate custom action
    await new Promise(resolve => setTimeout(resolve, 25));
  }

  /**
   * Execute notification action
   */
  private async executeNotificationAction(action: Action, context: AutomationContext): Promise<void> {
    const message = this.interpolateString(action.config?.body?.message || '', context);
    const recipient = this.interpolateString(action.config?.body?.recipient || '', context);
    
    console.log(`[AutomationEngine] Notification to ${recipient}: ${message}`);
    
    // Simulate notification
    await new Promise(resolve => setTimeout(resolve, 75));
  }

  /**
   * Update statistics
   */
  private updateStats(result: AutomationResult, executionTime: number): void {
    this.stats.totalExecutions++;
    this.stats.lastExecutionTime = executionTime;
    
    if (result.success) {
      this.stats.successfulExecutions++;
    } else {
      this.stats.failedExecutions++;
    }
    
    // Calculate average execution time
    const totalTime = this.stats.averageExecutionTime * (this.stats.totalExecutions - 1) + executionTime;
    this.stats.averageExecutionTime = totalTime / this.stats.totalExecutions;
  }

  /**
   * Create base context
   */
  private createBaseContext(): AutomationContext {
    return {
      id: Date.now().toString(),
      timestamp: Date.now(),
      userId: 'system',
      systemState: {},
      metadata: {}
    };
  }

  /**
   * Normalize configuration
   */
  private normalizeConfig(config: Partial<AutomationEngineConfig>): AutomationEngineConfig {
    return {
      maxConcurrentExecutions: config.maxConcurrentExecutions || 10,
      defaultTimeout: config.defaultTimeout || 30000,
      defaultCooldown: config.defaultCooldown || 5000,
      enableLogging: config.enableLogging ?? true,
      logLevel: config.logLevel || 'info',
      maxRetries: config.maxRetries || 3,
      storagePath: config.storagePath,
      enablePersistence: config.enablePersistence ?? false,
      cleanupIntervalMs: config.cleanupIntervalMs || 60000
    };
  }

  /**
   * Initialize default routines
   */
  private initializeDefaultRoutines(): void {
    // Add some default routines for testing
    const testRoutine: Routine = {
      id: 'test-routine',
      name: 'Test Routine',
      description: 'A test routine for debugging',
      enabled: true,
      triggers: [
        {
          id: 'test-trigger',
          name: 'Test Trigger',
          type: 'manual',
          enabled: true,
          executionCount: 0,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ],
      actions: [
        {
          id: 'action-1',
          name: 'Notification Action',
          type: 'notification',
          enabled: true,
          config: {
            body: {
              message: 'Starting test routine',
              type: 'info',
              recipient: 'system'
            }
          },
          metadata: {}
        },
        {
          id: 'action-2',
          name: 'API Action',
          type: 'api',
          enabled: true,
          config: {
            endpoint: 'https://api.example.com/test',
            method: 'GET'
          },
          metadata: {}
        },
        {
          id: 'action-3',
          name: 'Notification Action',
          type: 'notification',
          enabled: true,
          config: {
            body: {
              message: 'Test routine completed',
              type: 'info',
              recipient: 'system'
            }
          },
          metadata: {}
        }
      ],
      logging: {
        enabled: true,
        level: 'info',
        includeContext: true,
        includeTriggerData: true
      },
      metadata: { category: 'test' },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      executionCount: 0,
      successCount: 0,
      failureCount: 0
    };

    this.registerRoutine(testRoutine);
  }

  /**
   * Validate routine
   */
  private validateRoutine(routine: Routine): void {
    if (!routine.id || !routine.name) {
      throw new Error('Routine must have an id and name');
    }
    
    if (!routine.actions || routine.actions.length === 0) {
      throw new Error('Routine must have at least one action');
    }
    
    for (const action of routine.actions) {
      if (!action.type) {
        throw new Error('Action must have a type');
      }
      if (!action.id) {
        throw new Error('Action must have an id');
      }
      if (!action.config) {
        throw new Error('Action must have a config');
      }
    }
  }

  /**
   * Validate routine execution
   */
  private validateRoutineExecution(routine: Routine, context: AutomationContext): void {
    if (!this.isRunning) {
      throw new Error('Automation engine is not running');
    }
    
    if (this.shutdownRequested) {
      throw new Error('Execution interrupted: shutdown requested');
    }
    
    // Check execution limits
    if (this.activeExecutions.size >= this.config.maxConcurrentExecutions) {
      throw new Error(`Maximum concurrent executions (${this.config.maxConcurrentExecutions}) reached`);
    }
  }

  /**
   * Interpolate string with context variables
   */
  private interpolateString(str: string, context: AutomationContext): string {
    if (!str) return '';
    return str.replace(/\{(\w+)\}/g, (match, key) => {
      return String(context[key as keyof AutomationContext] || match);
    });
  }
}