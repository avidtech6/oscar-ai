/**
 * Agent Scheduler
 * 
 * Schedules and manages periodic agent execution.
 * Handles delayed, scheduled, and conditional agent runs.
 */

import type {
	Agent,
	AgentConfig,
	AgentContext,
	AgentResult,
	AgentSchedule,
	AgentSchedulerConfig,
	AgentTrigger
} from './agentTypes';

/**
 * Scheduled agent execution
 */
interface ScheduledExecution {
	/** Agent ID */
	agentId: string;
	
	/** Execution context */
	context: AgentContext;
	
	/** Scheduled time */
	scheduledTime: Date;
	
	/** Whether the execution is delayed */
	isDelayed: boolean;
	
	/** Delay in milliseconds (for delayed executions) */
	delayMs?: number;
	
	/** Condition to check (for conditional executions) */
	condition?: () => boolean | Promise<boolean>;
	
	/** Whether the execution has been cancelled */
	cancelled: boolean;
	
	/** Timeout ID (for delayed executions) */
	timeoutId?: NodeJS.Timeout;
	
	/** Interval ID (for periodic executions) */
	intervalId?: NodeJS.Timeout;
}

/**
 * Agent Scheduler
 */
export class AgentScheduler {
	private config: AgentSchedulerConfig;
	private scheduledExecutions: Map<string, ScheduledExecution[]> = new Map();
	private isRunning = false;
	private tickInterval?: NodeJS.Timeout;
	
	constructor(config: Partial<AgentSchedulerConfig> = {}) {
		this.config = {
			maxScheduledAgents: config.maxScheduledAgents ?? 100,
			schedulerTickIntervalMs: config.schedulerTickIntervalMs ?? 1000, // 1 second
			useRequestAnimationFrame: config.useRequestAnimationFrame ?? false,
			useWebWorkers: config.useWebWorkers ?? false,
			maxRetryAttempts: config.maxRetryAttempts ?? 3,
			retryDelayMs: config.retryDelayMs ?? 5000 // 5 seconds
		};
	}
	
	/**
	 * Initialize the scheduler
	 */
	async initialize(): Promise<void> {
		if (this.isRunning) {
			return;
		}
		
		console.log('Initializing Agent Scheduler...');
		
		// Start scheduler tick
		this.startSchedulerTick();
		
		this.isRunning = true;
		console.log('Agent Scheduler initialized');
	}
	
	/**
	 * Start scheduler tick
	 */
	private startSchedulerTick(): void {
		if (this.config.useRequestAnimationFrame && typeof requestAnimationFrame === 'function') {
			// Use requestAnimationFrame for browser environments
			const tick = () => {
				this.processScheduledExecutions();
				requestAnimationFrame(tick);
			};
			requestAnimationFrame(tick);
		} else {
			// Use setInterval for Node.js environments
			this.tickInterval = setInterval(() => {
				this.processScheduledExecutions();
			}, this.config.schedulerTickIntervalMs);
		}
	}
	
	/**
	 * Schedule an agent for execution
	 */
	scheduleAgent(
		agentId: string,
		context: AgentContext,
		schedule: AgentSchedule,
		executeFn: (agentId: string, context: AgentContext) => Promise<AgentResult | null>
	): string {
		const executionId = `${agentId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		
		const scheduledExecution: ScheduledExecution = {
			agentId,
			context,
			scheduledTime: this.calculateScheduledTime(schedule),
			isDelayed: schedule.when === 'delayed',
			delayMs: schedule.delayMs,
			condition: schedule.condition,
			cancelled: false
		};
		
		// Store the execution
		if (!this.scheduledExecutions.has(agentId)) {
			this.scheduledExecutions.set(agentId, []);
		}
		this.scheduledExecutions.get(agentId)!.push(scheduledExecution);
		
		// Set up execution based on schedule type
		this.setupExecution(scheduledExecution, executionId, executeFn);
		
		console.log(`Scheduled agent ${agentId} for execution at ${scheduledExecution.scheduledTime.toISOString()}`);
		
		return executionId;
	}
	
	/**
	 * Calculate scheduled time based on schedule configuration
	 */
	private calculateScheduledTime(schedule: AgentSchedule): Date {
		switch (schedule.when) {
			case 'immediate':
				return new Date();
				
			case 'delayed':
				return new Date(Date.now() + (schedule.delayMs || 0));
				
			case 'scheduled':
				return schedule.scheduledTime || new Date();
				
			case 'conditional':
				// For conditional schedules, we'll check on each tick
				return new Date();
				
			default:
				return new Date();
		}
	}
	
	/**
	 * Set up execution based on schedule type
	 */
	private setupExecution(
		execution: ScheduledExecution,
		executionId: string,
		executeFn: (agentId: string, context: AgentContext) => Promise<AgentResult | null>
	): void {
		const now = Date.now();
		const scheduledTime = execution.scheduledTime.getTime();
		const delayMs = scheduledTime - now;
		
		if (execution.isDelayed && delayMs > 0) {
			// Set up delayed execution
			execution.timeoutId = setTimeout(async () => {
				await this.executeScheduledAgent(execution, executionId, executeFn);
			}, delayMs);
		} else if (execution.condition) {
			// Conditional execution - will be checked on each tick
			// Nothing to set up here
		} else {
			// Immediate or past-due execution
			// Will be executed on next tick
		}
	}
	
	/**
	 * Process scheduled executions
	 */
	private async processScheduledExecutions(): Promise<void> {
		const now = new Date();
		
		for (const [agentId, executions] of this.scheduledExecutions) {
			// Process each execution
			for (let i = executions.length - 1; i >= 0; i--) {
				const execution = executions[i];
				
				if (execution.cancelled) {
					// Remove cancelled executions
					executions.splice(i, 1);
					continue;
				}
				
				// Check if execution is due
				if (execution.scheduledTime <= now) {
					// Execute immediately
					const executionId = `${agentId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
					
					// Remove from scheduled executions
					executions.splice(i, 1);
					
					// Execute the agent
					// Note: We need the execute function from the agent engine
					// For now, we'll just log it
					console.log(`Agent ${agentId} is due for execution at ${execution.scheduledTime.toISOString()}`);
				}
			}
			
			// Clean up empty arrays
			if (executions.length === 0) {
				this.scheduledExecutions.delete(agentId);
			}
		}
	}
	
	/**
	 * Execute a scheduled agent
	 */
	private async executeScheduledAgent(
		execution: ScheduledExecution,
		executionId: string,
		executeFn: (agentId: string, context: AgentContext) => Promise<AgentResult | null>
	): Promise<void> {
		if (execution.cancelled) {
			return;
		}
		
		// Check condition if present
		if (execution.condition) {
			try {
				const conditionResult = await execution.condition();
				if (!conditionResult) {
					// Condition not met, reschedule for next tick
					execution.scheduledTime = new Date(Date.now() + this.config.schedulerTickIntervalMs);
					return;
				}
			} catch (error) {
				console.error(`Error checking condition for agent ${execution.agentId}:`, error);
				return;
			}
		}
		
		console.log(`Executing scheduled agent ${execution.agentId} (${executionId})`);
		
		try {
			// Execute the agent
			await executeFn(execution.agentId, execution.context);
		} catch (error) {
			console.error(`Error executing scheduled agent ${execution.agentId}:`, error);
		}
	}
	
	/**
	 * Schedule periodic agent execution
	 */
	schedulePeriodicAgent(
		agentId: string,
		context: AgentContext,
		intervalMs: number,
		executeFn: (agentId: string, context: AgentContext) => Promise<AgentResult | null>
	): string {
		const executionId = `${agentId}-periodic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		
		console.log(`Scheduling periodic agent ${agentId} with interval ${intervalMs}ms`);
		
		// Set up periodic execution
		const intervalId = setInterval(async () => {
			try {
				await executeFn(agentId, context);
			} catch (error) {
				console.error(`Error executing periodic agent ${agentId}:`, error);
			}
		}, intervalMs);
		
		// Store the execution
		const scheduledExecution: ScheduledExecution = {
			agentId,
			context,
			scheduledTime: new Date(Date.now() + intervalMs),
			isDelayed: false,
			cancelled: false,
			intervalId
		};
		
		if (!this.scheduledExecutions.has(agentId)) {
			this.scheduledExecutions.set(agentId, []);
		}
		this.scheduledExecutions.get(agentId)!.push(scheduledExecution);
		
		return executionId;
	}
	
	/**
	 * Cancel scheduled execution
	 */
	cancelScheduledExecution(agentId: string, executionId?: string): boolean {
		const executions = this.scheduledExecutions.get(agentId);
		if (!executions || executions.length === 0) {
			return false;
		}
		
		let cancelledCount = 0;
		
		if (executionId) {
			// Cancel specific execution
			for (let i = executions.length - 1; i >= 0; i--) {
				const execution = executions[i];
				if (execution.agentId === agentId) {
					this.cancelExecution(execution);
					executions.splice(i, 1);
					cancelledCount++;
					break;
				}
			}
		} else {
			// Cancel all executions for this agent
			for (const execution of executions) {
				this.cancelExecution(execution);
			}
			this.scheduledExecutions.delete(agentId);
			cancelledCount = executions.length;
		}
		
		console.log(`Cancelled ${cancelledCount} scheduled execution(s) for agent ${agentId}`);
		return cancelledCount > 0;
	}
	
	/**
	 * Cancel an execution
	 */
	private cancelExecution(execution: ScheduledExecution): void {
		execution.cancelled = true;
		
		// Clear timeout if set
		if (execution.timeoutId) {
			clearTimeout(execution.timeoutId);
		}
		
		// Clear interval if set
		if (execution.intervalId) {
			clearInterval(execution.intervalId);
		}
	}
	
	/**
	 * Get scheduled executions for an agent
	 */
	getScheduledExecutions(agentId: string): ScheduledExecution[] {
		return this.scheduledExecutions.get(agentId) || [];
	}
	
	/**
	 * Get all scheduled executions
	 */
	getAllScheduledExecutions(): Map<string, ScheduledExecution[]> {
		return new Map(this.scheduledExecutions);
	}
	
	/**
	 * Get next scheduled execution time for an agent
	 */
	getNextScheduledExecutionTime(agentId: string): Date | null {
		const executions = this.scheduledExecutions.get(agentId);
		if (!executions || executions.length === 0) {
			return null;
		}
		
		// Find the earliest scheduled time
		let earliestTime: Date | null = null;
		
		for (const execution of executions) {
			if (!execution.cancelled) {
				if (!earliestTime || execution.scheduledTime < earliestTime) {
					earliestTime = execution.scheduledTime;
				}
			}
		}
		
		return earliestTime;
	}
	
	/**
	 * Check if agent has scheduled executions
	 */
	hasScheduledExecutions(agentId: string): boolean {
		const executions = this.scheduledExecutions.get(agentId);
		return !!(executions && executions.length > 0);
	}
	
	/**
	 * Get scheduled execution count
	 */
	getScheduledExecutionCount(): number {
		let count = 0;
		
		for (const executions of this.scheduledExecutions.values()) {
			count += executions.length;
		}
		
		return count;
	}
	
	/**
	 * Clean up scheduler resources
	 */
	async cleanup(): Promise<void> {
		// Clear tick interval
		if (this.tickInterval) {
			clearInterval(this.tickInterval);
			this.tickInterval = undefined;
		}
		
		// Cancel all scheduled executions
		for (const [agentId, executions] of this.scheduledExecutions) {
			for (const execution of executions) {
				this.cancelExecution(execution);
			}
		}
		
		// Clear scheduled executions
		this.scheduledExecutions.clear();
		
		this.isRunning = false;
		
		console.log('Agent Scheduler cleaned up');
	}
	
	/**
	 * Process agent triggers and schedule executions
	 */
	processAgentTriggers(
		agentId: string,
		agentConfig: AgentConfig,
		context: AgentContext,
		executeFn: (agentId: string, context: AgentContext) => Promise<AgentResult | null>
	): string[] {
		const executionIds: string[] = [];
		
		for (const trigger of agentConfig.triggers) {
			if (trigger.type === 'periodic' && trigger.config.intervalMs) {
				// Schedule periodic execution
				const executionId = this.schedulePeriodicAgent(
					agentId,
					context,
					trigger.config.intervalMs,
					executeFn
				);
				executionIds.push(executionId);
			} else if (agentConfig.schedule) {
				// Schedule based on agent schedule
				const executionId = this.scheduleAgent(
					agentId,
					context,
					agentConfig.schedule,
					executeFn
				);
				executionIds.push(executionId);
			}
		}
		
		return executionIds;
	}
	
	/**
	 * Retry failed agent execution
	 */
	async retryFailedExecution(
		agentId: string,
		context: AgentContext,
		executeFn: (agentId: string, context: AgentContext) => Promise<AgentResult | null>,
		retryCount: number = 0
	): Promise<boolean> {
		if (retryCount >= this.config.maxRetryAttempts) {
			console.log(`Max retry attempts (${this.config.maxRetryAttempts}) reached for agent ${agentId}`);
			return false;
		}
		
		console.log(`Retrying agent ${agentId} (attempt ${retryCount + 1}/${this.config.maxRetryAttempts})`);
		
		// Schedule retry with delay
		const executionId = this.scheduleAgent(
			agentId,
			context,
			{
				when: 'delayed',
				delayMs: this.config.retryDelayMs
			},
			async (retryAgentId: string, retryContext: AgentContext) => {
				try {
					const result = await executeFn(retryAgentId, retryContext);
					
					if (!result || !result.success) {
						// Retry again if still failing
						await this.retryFailedExecution(
							retryAgentId,
							retryContext,
							executeFn,
							retryCount + 1
						);
					}
					
					return result;
				} catch (error) {
					console.error(`Error in retry execution for agent ${retryAgentId}:`, error);
					
					// Retry again on error
					await this.retryFailedExecution(
						retryAgentId,
						retryContext,
						executeFn,
						retryCount + 1
					);
					
					return null;
				}
			}
		);
		
		return true;
	}
}