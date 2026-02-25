/**
 * Workflow Memory Engine
 * 
 * Manages workflow-level memory, workflow execution tracking, and workflow intelligence.
 * Provides workflow intelligence for context-aware automation.
 */

import type { 
	WorkflowHistory, 
	MemoryItem, 
	MemoryCategory,
	MemoryWriteOptions 
} from './memoryTypes';
import { MemoryEngine } from './memoryEngine';
import { MemorySelectors } from './memorySelectors';

/**
 * Workflow Engine Configuration
 */
export interface WorkflowEngineConfig {
	/** Memory engine instance */
	memoryEngine: MemoryEngine;
	
	/** Memory selectors instance */
	memorySelectors: MemorySelectors;
	
	/** Whether to auto-track workflow executions */
	autoTrackExecutions: boolean;
	
	/** Whether to track execution steps */
	trackExecutionSteps: boolean;
	
	/** Whether to analyze automation patterns */
	analyzePatterns: boolean;
	
	/** Update interval in milliseconds */
	updateIntervalMs: number;
}

/**
 * Workflow Analysis Result
 */
export interface WorkflowAnalysis {
	/** Workflow identifier */
	workflowId: string;
	
	/** Execution statistics */
	executions: {
		total: number;
		successful: number;
		failed: number;
		cancelled: number;
		paused: number;
		successRate: number;
		averageDurationMs: number;
	};
	
	/** Step analysis */
	steps: {
		totalSteps: number;
		mostCommonSteps: string[];
		mostFailingSteps: string[];
		averageStepDurationMs: number;
	};
	
	/** Timing patterns */
	timing: {
		mostCommonExecutionTimes: string[];
		mostCommonExecutionDays: string[];
		peakExecutionHours: string[];
	};
	
	/** Context patterns */
	contexts: {
		mostCommonContexts: string[];
		mostSuccessfulContexts: string[];
		leastSuccessfulContexts: string[];
	};
	
	/** Error analysis */
	errors: {
		totalErrors: number;
		mostCommonErrors: string[];
		resolutionRate: number;
		unresolvedErrors: string[];
	};
	
	/** User preferences */
	preferences: {
		autoStart: boolean;
		notifications: boolean;
		preferredTime?: string;
		preferredDay?: string;
	};
	
	/** Recommendations */
	recommendations: string[];
	
	/** Confidence score (0-100) */
	confidence: number;
}

/**
 * Workflow Memory Engine
 */
export class WorkflowEngine {
	private memoryEngine: MemoryEngine;
	private memorySelectors: MemorySelectors;
	private config: WorkflowEngineConfig;
	private updateInterval: NodeJS.Timeout | null = null;
	
	constructor(config: Partial<WorkflowEngineConfig> = {}) {
		this.memoryEngine = config.memoryEngine ?? new MemoryEngine();
		this.memorySelectors = config.memorySelectors ?? new MemorySelectors({ memoryEngine: this.memoryEngine });
		
		this.config = {
			memoryEngine: this.memoryEngine,
			memorySelectors: this.memorySelectors,
			autoTrackExecutions: config.autoTrackExecutions ?? true,
			trackExecutionSteps: config.trackExecutionSteps ?? true,
			analyzePatterns: config.analyzePatterns ?? true,
			updateIntervalMs: config.updateIntervalMs ?? 30 * 60 * 1000 // 30 minutes
		};
		
		// Start auto-update if enabled
		if (this.config.autoTrackExecutions) {
			this.startAutoUpdate();
		}
	}
	
	/**
	 * Start auto-update interval
	 */
	private startAutoUpdate(): void {
		if (this.updateInterval) {
			clearInterval(this.updateInterval);
		}
		
		this.updateInterval = setInterval(async () => {
			try {
				await this.autoUpdateWorkflowMetrics();
			} catch (error) {
				console.error('Auto-update of workflow metrics failed:', error);
			}
		}, this.config.updateIntervalMs);
	}
	
	/**
	 * Stop auto-update interval
	 */
	stopAutoUpdate(): void {
		if (this.updateInterval) {
			clearInterval(this.updateInterval);
			this.updateInterval = null;
		}
	}
	
	/**
	 * Auto-update workflow metrics
	 */
	private async autoUpdateWorkflowMetrics(): Promise<void> {
		console.log('Auto-updating workflow metrics...');
		
		// Get recent workflow memories
		const recentMemories = await this.memorySelectors.getRecentMemories(100);
		const workflowMemories = recentMemories.filter(m =>
			m.category === 'workflow'
		);
		
		if (workflowMemories.length === 0) {
			return;
		}
		
		// Group by workflow
		const workflowGroups = new Map<string, MemoryItem[]>();
		for (const memory of workflowMemories) {
			const workflowId = memory.metadata.relatedEntities.workflowId ||
							  memory.content.workflowId ||
							  'unknown';
			if (!workflowGroups.has(workflowId)) {
				workflowGroups.set(workflowId, []);
			}
			workflowGroups.get(workflowId)!.push(memory);
		}
		
		// Update metrics for each workflow
		const entries = Array.from(workflowGroups.entries());
		for (const [workflowId, memories] of entries) {
			if (workflowId !== 'unknown') {
				try {
					await this.updateWorkflowMetrics(workflowId, memories);
					console.log(`Updated metrics for workflow: ${workflowId}`);
				} catch (error) {
					console.error(`Failed to update metrics for workflow ${workflowId}:`, error);
				}
			}
		}
	}
	
	/**
	 * Update workflow metrics
	 */
	private async updateWorkflowMetrics(workflowId: string, memories: MemoryItem[]): Promise<void> {
		const analysis = await this.analyzeWorkflow(workflowId);
		
		// Create workflow history from analysis
		const history: WorkflowHistory = {
			workflowId,
			executions: [],
			userPreferences: analysis.preferences,
			automationPatterns: {
				commonTriggers: [],
				commonContexts: analysis.contexts.mostCommonContexts,
				successRate: analysis.executions.successRate,
				averageDurationMs: analysis.executions.averageDurationMs
			},
			lastExecuted: new Date(),
			totalExecutions: analysis.executions.total,
			successRate: analysis.executions.successRate
		};
		
		// Save history to memory
		await this.memoryEngine.writeMemory(
			'workflow',
			'system',
			history,
			`Workflow metrics updated: ${workflowId}`,
			{
				tags: ['workflow-metrics', workflowId, 'auto-updated'],
				importance: 60,
				confidence: analysis.confidence
			}
		);
	}
	
	/**
	 * Get workflow history
	 */
	async getWorkflowHistory(workflowId: string): Promise<WorkflowHistory | null> {
		return await this.memorySelectors.getWorkflowHistory(workflowId);
	}
	
	/**
	 * Analyze workflow
	 */
	async analyzeWorkflow(workflowId: string): Promise<WorkflowAnalysis> {
		const history = await this.getWorkflowHistory(workflowId);
		const memories = await this.getWorkflowMemories(workflowId);
		
		if (memories.length === 0) {
			return this.createDefaultAnalysis(workflowId);
		}
		
		// Analyze workflow data
		const executions = this.analyzeExecutions(memories);
		const steps = this.analyzeSteps(memories);
		const timing = this.analyzeTiming(memories);
		const contexts = this.analyzeContexts(memories);
		const errors = this.analyzeErrors(memories);
		const preferences = this.analyzePreferences(memories);
		const recommendations = this.generateRecommendations(executions, steps, timing, contexts, errors, preferences);
		
		// Calculate confidence based on data points
		const confidence = Math.min(100, memories.length * 5);
		
		return {
			workflowId,
			executions,
			steps,
			timing,
			contexts,
			errors,
			preferences,
			recommendations,
			confidence
		};
	}
	
	/**
	 * Record workflow execution
	 */
	async recordExecution(
		workflowId: string,
		execution: {
			executionId: string;
			startedAt: Date;
			completedAt?: Date;
			status: 'completed' | 'failed' | 'cancelled' | 'paused';
			result?: any;
			error?: string;
			steps?: Array<{
				stepId: string;
				startedAt: Date;
				completedAt?: Date;
				status: 'completed' | 'failed' | 'skipped';
				result?: any;
				error?: string;
			}>;
			context?: any;
		}
	): Promise<void> {
		const now = new Date();
		
		// Create execution memory
		const memoryContent = {
			workflowId,
			executionId: execution.executionId,
			startedAt: execution.startedAt,
			completedAt: execution.completedAt,
			status: execution.status,
			result: execution.result,
			error: execution.error,
			steps: execution.steps || [],
			context: execution.context,
			timestamp: now
		};
		
		await this.memoryEngine.writeMemory(
			'workflow',
			'system',
			memoryContent,
			`Workflow execution: ${execution.status}`,
			{
				tags: ['workflow-execution', workflowId, execution.status],
				importance: 70,
				confidence: 85
			}
		);
		
		// Auto-update metrics
		if (this.config.autoTrackExecutions) {
			const memories = await this.getWorkflowMemories(workflowId);
			await this.updateWorkflowMetrics(workflowId, memories);
		}
	}
	
	/**
	 * Record workflow step
	 */
	async recordStep(
		workflowId: string,
		executionId: string,
		step: {
			stepId: string;
			startedAt: Date;
			completedAt?: Date;
			status: 'completed' | 'failed' | 'skipped';
			result?: any;
			error?: string;
		}
	): Promise<void> {
		const now = new Date();
		
		// Create step memory
		const memoryContent = {
			workflowId,
			executionId,
			stepId: step.stepId,
			startedAt: step.startedAt,
			completedAt: step.completedAt,
			status: step.status,
			result: step.result,
			error: step.error,
			timestamp: now
		};
		
		await this.memoryEngine.writeMemory(
			'workflow',
			'system',
			memoryContent,
			`Workflow step: ${step.stepId} - ${step.status}`,
			{
				tags: ['workflow-step', workflowId, step.stepId, step.status],
				importance: 60,
				confidence: 80
			}
		);
	}
	
	/**
	 * Record workflow error
	 */
	async recordError(
		workflowId: string,
		error: {
			error: string;
			severity: 'low' | 'medium' | 'high' | 'critical';
			context?: any;
			resolved?: boolean;
			resolution?: string;
		}
	): Promise<void> {
		const now = new Date();
		
		// Create error memory
		const memoryContent = {
			workflowId,
			error: error.error,
			severity: error.severity,
			context: error.context,
			resolved: error.resolved || false,
			resolution: error.resolution,
			timestamp: now
		};
		
		await this.memoryEngine.writeMemory(
			'workflow',
			'system',
			memoryContent,
			`Workflow error: ${error.error.substring(0, 50)}...`,
			{
				tags: ['workflow-error', workflowId, error.severity],
				importance: error.severity === 'critical' ? 90 : 
						   error.severity === 'high' ? 80 : 
						   error.severity === 'medium' ? 70 : 60,
				confidence: 85
			}
		);
	}
	
	/**
	 * Update workflow preferences
	 */
	async updatePreferences(
		workflowId: string,
		preferences: {
			autoStart: boolean;
			notifications: boolean;
			preferredTime?: string;
			preferredDay?: string;
		}
	): Promise<void> {
		const now = new Date();
		
		// Create preferences memory
		const memoryContent = {
			workflowId,
			autoStart: preferences.autoStart,
			notifications: preferences.notifications,
			preferredTime: preferences.preferredTime,
			preferredDay: preferences.preferredDay,
			timestamp: now
		};
		
		await this.memoryEngine.writeMemory(
			'workflow',
			'user-action',
			memoryContent,
			`Workflow preferences updated`,
			{
				tags: ['workflow-preferences', workflowId],
				importance: 50,
				confidence: 90
			}
		);
	}
	
	/**
	 * Suggest workflow improvements
	 */
	async suggestWorkflowImprovements(workflowId: string): Promise<string[]> {
		const analysis = await this.analyzeWorkflow(workflowId);
		return analysis.recommendations;
	}
	
	/**
	 * Get workflow memories
	 */
	private async getWorkflowMemories(workflowId: string): Promise<MemoryItem[]> {
		const query = {
			category: 'workflow' as MemoryCategory,
			relatedTo: { workflowId },
			limit: 200,
			sortBy: 'createdAt' as const,
			sortOrder: 'desc' as const
		};
		
		const result = await this.memoryEngine.queryMemories(query);
		return result.items;
	}
	
	/**
	 * Create default analysis for new workflows
	 */
	private createDefaultAnalysis(workflowId: string): WorkflowAnalysis {
		return {
			workflowId,
			executions: {
				total: 0,
				successful: 0,
				failed: 0,
				cancelled: 0,
				paused: 0,
				successRate: 0,
				averageDurationMs: 0
			},
			steps: {
				totalSteps: 0,
				mostCommonSteps: [],
				mostFailingSteps: [],
				averageStepDurationMs: 0
			},
			timing: {
				mostCommonExecutionTimes: [],
				mostCommonExecutionDays: [],
				peakExecutionHours: []
			},
			contexts: {
				mostCommonContexts: [],
				mostSuccessfulContexts: [],
				leastSuccessfulContexts: []
			},
			errors: {
				totalErrors: 0,
				mostCommonErrors: [],
				resolutionRate: 0,
				unresolvedErrors: []
			},
			preferences: {
				autoStart: false,
				notifications: true
			},
			recommendations: [
				'Configure workflow settings',
				'Test workflow execution',
				'Monitor workflow performance'
			],
			confidence: 0
		};
	}
	
	/**
	 * Analyze executions from memories
	 */
	private analyzeExecutions(memories: MemoryItem[]): {
		total: number;
		successful: number;
		failed: number;
		cancelled: number;
		paused: number;
		successRate: number;
		averageDurationMs: number;
	} {
		const executionMemories = memories.filter(m => 
			m.content.executionId ||
			m.metadata.tags?.includes('workflow-execution')
		);
		
		if (executionMemories.length === 0) {
			return {
				total: 0,
				successful: 0,
				failed: 0,
				cancelled: 0,
				paused: 0,
				successRate: 0,
				averageDurationMs: 0
			};
		}
		
		let total = 0;
		let successful = 0;
		let failed = 0;
		let cancelled = 0;
		let paused = 0;
		let totalDuration = 0;
		let durationCount = 0;
		
		for (const memory of executionMemories) {
			total++;
			
			const status = memory.content.status || 'unknown';
			switch (status) {
				case 'completed':
					successful++;
					break;
				case 'failed':
					failed++;
					break;
				case 'cancelled':
					cancelled++;
					break;
				case 'paused':
					paused++;
					break;
			}
			
			// Calculate duration if available
			if (memory.content.startedAt && memory.content.completedAt) {
				const startedAt = new Date(memory.content.startedAt);
				const completedAt = new Date(memory.content.completedAt);
				const duration = completedAt.getTime() - startedAt.getTime();
				if (duration > 0) {
					totalDuration += duration;
					durationCount++;
				}
			}
		}
		
		const successRate = total > 0 ? (successful / total) * 100 : 0;
		const averageDurationMs = durationCount > 0 ? totalDuration / durationCount : 0;
		return {
			total,
			successful,
			failed,
			cancelled,
			paused,
			successRate,
			averageDurationMs
		};
	}
	
	/**
		* Analyze steps from memories
		*/
	private analyzeSteps(memories: MemoryItem[]): {
		totalSteps: number;
		mostCommonSteps: string[];
		mostFailingSteps: string[];
		averageStepDurationMs: number;
	} {
		const stepMemories = memories.filter(m =>
			m.content.stepId ||
			m.metadata.tags?.includes('workflow-step')
		);
		
		if (stepMemories.length === 0) {
			return {
				totalSteps: 0,
				mostCommonSteps: [],
				mostFailingSteps: [],
				averageStepDurationMs: 0
			};
		}
		
		let totalSteps = 0;
		let totalStepDuration = 0;
		let stepDurationCount = 0;
		const stepCounts = new Map<string, number>();
		const failingStepCounts = new Map<string, number>();
		
		for (const memory of stepMemories) {
			totalSteps++;
			
			const stepId = memory.content.stepId || 'unknown';
			stepCounts.set(stepId, (stepCounts.get(stepId) || 0) + 1);
			
			// Track failing steps
			const status = memory.content.status || 'unknown';
			if (status === 'failed') {
				failingStepCounts.set(stepId, (failingStepCounts.get(stepId) || 0) + 1);
			}
			
			// Calculate step duration if available
			if (memory.content.startedAt && memory.content.completedAt) {
				const startedAt = new Date(memory.content.startedAt);
				const completedAt = new Date(memory.content.completedAt);
				const duration = completedAt.getTime() - startedAt.getTime();
				if (duration > 0) {
					totalStepDuration += duration;
					stepDurationCount++;
				}
			}
		}
		
		// Get most common steps
		const mostCommonSteps = Array.from(stepCounts.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5)
			.map(([stepId]) => stepId);
		
		// Get most failing steps
		const mostFailingSteps = Array.from(failingStepCounts.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5)
			.map(([stepId]) => stepId);
		
		const averageStepDurationMs = stepDurationCount > 0 ? totalStepDuration / stepDurationCount : 0;
		
		return {
			totalSteps,
			mostCommonSteps,
			mostFailingSteps,
			averageStepDurationMs
		};
	}
	
	/**
		* Analyze timing from memories
		*/
	private analyzeTiming(memories: MemoryItem[]): {
		mostCommonExecutionTimes: string[];
		mostCommonExecutionDays: string[];
		peakExecutionHours: string[];
	} {
		const executionMemories = memories.filter(m =>
			m.content.startedAt ||
			m.metadata.tags?.includes('workflow-execution')
		);
		
		if (executionMemories.length === 0) {
			return {
				mostCommonExecutionTimes: [],
				mostCommonExecutionDays: [],
				peakExecutionHours: []
			};
		}
		
		const timeCounts = new Map<string, number>();
		const dayCounts = new Map<string, number>();
		const hourCounts = new Map<number, number>();
		
		for (const memory of executionMemories) {
			if (memory.content.startedAt) {
				const startedAt = new Date(memory.content.startedAt);
				
				// Track time of day (morning, afternoon, evening, night)
				const hour = startedAt.getHours();
				let timeOfDay = 'unknown';
				if (hour >= 5 && hour < 12) timeOfDay = 'morning';
				else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
				else if (hour >= 17 && hour < 22) timeOfDay = 'evening';
				else timeOfDay = 'night';
				
				timeCounts.set(timeOfDay, (timeCounts.get(timeOfDay) || 0) + 1);
				
				// Track day of week
				const day = startedAt.toLocaleDateString('en-US', { weekday: 'long' });
				dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
				
				// Track hour for peak analysis
				hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
			}
		}
		
		// Get most common execution times
		const mostCommonExecutionTimes = Array.from(timeCounts.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 3)
			.map(([time]) => time);
		
		// Get most common execution days
		const mostCommonExecutionDays = Array.from(dayCounts.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 3)
			.map(([day]) => day);
		
		// Get peak execution hours (hours with most executions)
		const peakExecutionHours = Array.from(hourCounts.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 3)
			.map(([hour]) => `${hour}:00`);
		
		return {
			mostCommonExecutionTimes,
			mostCommonExecutionDays,
			peakExecutionHours
		};
	}
	
	/**
		* Analyze contexts from memories
		*/
	private analyzeContexts(memories: MemoryItem[]): {
		mostCommonContexts: string[];
		mostSuccessfulContexts: string[];
		leastSuccessfulContexts: string[];
	} {
		const executionMemories = memories.filter(m =>
			m.content.context ||
			m.metadata.tags?.includes('workflow-execution')
		);
		
		if (executionMemories.length === 0) {
			return {
				mostCommonContexts: [],
				mostSuccessfulContexts: [],
				leastSuccessfulContexts: []
			};
		}
		
		const contextCounts = new Map<string, number>();
		const contextSuccessCounts = new Map<string, number>();
		const contextFailureCounts = new Map<string, number>();
		
		for (const memory of executionMemories) {
			// Extract context type from memory
			let context = 'unknown';
			if (memory.content.context) {
				if (typeof memory.content.context === 'string') {
					context = memory.content.context;
				} else if (memory.content.context.type) {
					context = memory.content.context.type;
				} else if (memory.content.context.name) {
					context = memory.content.context.name;
				}
			}
			
			contextCounts.set(context, (contextCounts.get(context) || 0) + 1);
			
			// Track success/failure by context
			const status = memory.content.status || 'unknown';
			if (status === 'completed') {
				contextSuccessCounts.set(context, (contextSuccessCounts.get(context) || 0) + 1);
			} else if (status === 'failed') {
				contextFailureCounts.set(context, (contextFailureCounts.get(context) || 0) + 1);
			}
		}
		
		// Get most common contexts
		const mostCommonContexts = Array.from(contextCounts.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5)
			.map(([context]) => context);
		
		// Calculate success rates for contexts
		const contextSuccessRates = new Map<string, number>();
		for (const [context, total] of contextCounts.entries()) {
			const successes = contextSuccessCounts.get(context) || 0;
			const successRate = total > 0 ? (successes / total) * 100 : 0;
			contextSuccessRates.set(context, successRate);
		}
		
		// Get most successful contexts
		const mostSuccessfulContexts = Array.from(contextSuccessRates.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 3)
			.map(([context]) => context);
		
		// Get least successful contexts
		const leastSuccessfulContexts = Array.from(contextSuccessRates.entries())
			.sort((a, b) => a[1] - b[1])
			.slice(0, 3)
			.map(([context]) => context);
		
		return {
			mostCommonContexts,
			mostSuccessfulContexts,
			leastSuccessfulContexts
		};
	}
	
	/**
		* Analyze errors from memories
		*/
	private analyzeErrors(memories: MemoryItem[]): {
		totalErrors: number;
		mostCommonErrors: string[];
		resolutionRate: number;
		unresolvedErrors: string[];
	} {
		const errorMemories = memories.filter(m =>
			m.content.error ||
			m.metadata.tags?.includes('workflow-error')
		);
		
		if (errorMemories.length === 0) {
			return {
				totalErrors: 0,
				mostCommonErrors: [],
				resolutionRate: 0,
				unresolvedErrors: []
			};
		}
		
		let totalErrors = 0;
		let resolvedErrors = 0;
		const errorCounts = new Map<string, number>();
		const unresolvedErrors: string[] = [];
		
		for (const memory of errorMemories) {
			totalErrors++;
			
			const error = memory.content.error || 'Unknown error';
			errorCounts.set(error, (errorCounts.get(error) || 0) + 1);
			
			// Track resolved errors
			if (memory.content.resolved === true) {
				resolvedErrors++;
			} else {
				unresolvedErrors.push(error);
			}
		}
		
		// Get most common errors
		const mostCommonErrors = Array.from(errorCounts.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5)
			.map(([error]) => error);
		
		const resolutionRate = totalErrors > 0 ? (resolvedErrors / totalErrors) * 100 : 0;
		
		return {
			totalErrors,
			mostCommonErrors,
			resolutionRate,
			unresolvedErrors: Array.from(new Set(unresolvedErrors)).slice(0, 5)
		};
	}
	
	/**
		* Analyze preferences from memories
		*/
	private analyzePreferences(memories: MemoryItem[]): {
		autoStart: boolean;
		notifications: boolean;
		preferredTime?: string;
		preferredDay?: string;
	} {
		const preferenceMemories = memories.filter(m =>
			m.content.autoStart !== undefined ||
			m.metadata.tags?.includes('workflow-preferences')
		);
		
		if (preferenceMemories.length === 0) {
			return {
				autoStart: false,
				notifications: true
			};
		}
		
		// Use the most recent preferences
		const latestPreferences = preferenceMemories[0];
		
		return {
			autoStart: latestPreferences.content.autoStart || false,
			notifications: latestPreferences.content.notifications !== false,
			preferredTime: latestPreferences.content.preferredTime,
			preferredDay: latestPreferences.content.preferredDay
		};
	}
	
	/**
		* Generate recommendations
		*/
	private generateRecommendations(
		executions: any,
		steps: any,
		timing: any,
		contexts: any,
		errors: any,
		preferences: any
	): string[] {
		const recommendations: string[] = [];
		
		// Execution recommendations
		if (executions.successRate < 80) {
			recommendations.push('Improve workflow success rate');
		}
		
		if (executions.failed > 0) {
			recommendations.push('Investigate failed executions');
		}
		
		if (executions.averageDurationMs > 60000) {
			recommendations.push('Optimize workflow execution time');
		}
		
		// Step recommendations
		if (steps.mostFailingSteps.length > 0) {
			recommendations.push(`Fix failing steps: ${steps.mostFailingSteps.slice(0, 2).join(', ')}`);
		}
		
		if (steps.averageStepDurationMs > 10000) {
			recommendations.push('Optimize slow workflow steps');
		}
		
		// Timing recommendations
		if (timing.peakExecutionHours.length > 0) {
			recommendations.push(`Consider scheduling executions outside peak hours: ${timing.peakExecutionHours.join(', ')}`);
		}
		
		// Context recommendations
		if (contexts.leastSuccessfulContexts.length > 0) {
			recommendations.push(`Improve success rate for contexts: ${contexts.leastSuccessfulContexts.slice(0, 2).join(', ')}`);
		}
		
		// Error recommendations
		if (errors.totalErrors > 0) {
			recommendations.push(`Resolve common errors: ${errors.mostCommonErrors.slice(0, 2).join(', ')}`);
		}
		
		if (errors.resolutionRate < 70) {
			recommendations.push('Improve error resolution rate');
		}
		
		if (errors.unresolvedErrors.length > 0) {
			recommendations.push(`Address unresolved errors: ${errors.unresolvedErrors.slice(0, 2).join(', ')}`);
		}
		
		// Preference recommendations
		if (!preferences.autoStart && executions.total > 10) {
			recommendations.push('Consider enabling auto-start for frequently used workflows');
		}
		
		if (!preferences.notifications && errors.totalErrors > 0) {
			recommendations.push('Enable notifications for workflow errors');
		}
		
		return recommendations.slice(0, 10);
	}
}
	