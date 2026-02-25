/**
 * Workflow State Management
 * 
 * Manages persistence and state management for AI-driven workflows.
 * Integrates with AppFlowy for storing workflow instances, state, and artifacts.
 */

import type {
	WorkflowInstance,
	WorkflowStep,
	WorkflowStatus,
	StepStatus,
	WorkflowResult,
	WorkflowError
} from './workflowTypes';

import type { CopilotContext } from '../context/contextTypes';

/**
 * Workflow state storage interface
 */
export interface WorkflowStateStorage {
	/** Save workflow instance */
	saveWorkflow(workflow: WorkflowInstance): Promise<void>;
	
	/** Load workflow instance by ID */
	loadWorkflow(workflowInstanceId: string): Promise<WorkflowInstance | null>;
	
	/** Load all workflows for user */
	loadUserWorkflows(userId?: string): Promise<WorkflowInstance[]>;
	
	/** Update workflow status */
	updateWorkflowStatus(workflowInstanceId: string, status: WorkflowStatus): Promise<void>;
	
	/** Update step status */
	updateStepStatus(workflowInstanceId: string, stepId: string, status: StepStatus): Promise<void>;
	
	/** Save step result */
	saveStepResult(workflowInstanceId: string, stepId: string, result: any): Promise<void>;
	
	/** Save workflow result */
	saveWorkflowResult(workflowInstanceId: string, result: WorkflowResult): Promise<void>;
	
	/** Save workflow error */
	saveWorkflowError(workflowInstanceId: string, error: WorkflowError): Promise<void>;
	
	/** Delete workflow */
	deleteWorkflow(workflowInstanceId: string): Promise<void>;
	
	/** Clean up old workflows */
	cleanupOldWorkflows(maxAgeDays: number): Promise<number>;
}

/**
 * AppFlowy storage implementation
 */
export class AppFlowyWorkflowStorage implements WorkflowStateStorage {
	private baseUrl: string;
	private userId?: string;
	
	constructor(baseUrl: string, userId?: string) {
		this.baseUrl = baseUrl;
		this.userId = userId;
	}
	
	async saveWorkflow(workflow: WorkflowInstance): Promise<void> {
		// Save to AppFlowy
		const response = await fetch(`${this.baseUrl}/workflows`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				...workflow,
				userId: this.userId,
				updatedAt: new Date()
			})
		});
		
		if (!response.ok) {
			throw new Error(`Failed to save workflow: ${response.statusText}`);
		}
	}
	
	async loadWorkflow(workflowInstanceId: string): Promise<WorkflowInstance | null> {
		const response = await fetch(`${this.baseUrl}/workflows/${workflowInstanceId}`);
		
		if (!response.ok) {
			if (response.status === 404) {
				return null;
			}
			throw new Error(`Failed to load workflow: ${response.statusText}`);
		}
		
		const data = await response.json();
		return this.normalizeWorkflow(data);
	}
	
	async loadUserWorkflows(userId?: string): Promise<WorkflowInstance[]> {
		const targetUserId = userId || this.userId;
		if (!targetUserId) {
			throw new Error('User ID required to load workflows');
		}
		
		const response = await fetch(`${this.baseUrl}/workflows?userId=${targetUserId}`);
		
		if (!response.ok) {
			throw new Error(`Failed to load user workflows: ${response.statusText}`);
		}
		
		const data = await response.json();
		return data.map((item: any) => this.normalizeWorkflow(item));
	}
	
	async updateWorkflowStatus(workflowInstanceId: string, status: WorkflowStatus): Promise<void> {
		const response = await fetch(`${this.baseUrl}/workflows/${workflowInstanceId}/status`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ status, updatedAt: new Date() })
		});
		
		if (!response.ok) {
			throw new Error(`Failed to update workflow status: ${response.statusText}`);
		}
	}
	
	async updateStepStatus(workflowInstanceId: string, stepId: string, status: StepStatus): Promise<void> {
		const response = await fetch(`${this.baseUrl}/workflows/${workflowInstanceId}/steps/${stepId}/status`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ status, updatedAt: new Date() })
		});
		
		if (!response.ok) {
			throw new Error(`Failed to update step status: ${response.statusText}`);
		}
	}
	
	async saveStepResult(workflowInstanceId: string, stepId: string, result: any): Promise<void> {
		const response = await fetch(`${this.baseUrl}/workflows/${workflowInstanceId}/steps/${stepId}/result`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ result, updatedAt: new Date() })
		});
		
		if (!response.ok) {
			throw new Error(`Failed to save step result: ${response.statusText}`);
		}
	}
	
	async saveWorkflowResult(workflowInstanceId: string, result: WorkflowResult): Promise<void> {
		const response = await fetch(`${this.baseUrl}/workflows/${workflowInstanceId}/result`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ result, updatedAt: new Date() })
		});
		
		if (!response.ok) {
			throw new Error(`Failed to save workflow result: ${response.statusText}`);
		}
	}
	
	async saveWorkflowError(workflowInstanceId: string, error: WorkflowError): Promise<void> {
		const response = await fetch(`${this.baseUrl}/workflows/${workflowInstanceId}/error`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ error, updatedAt: new Date() })
		});
		
		if (!response.ok) {
			throw new Error(`Failed to save workflow error: ${response.statusText}`);
		}
	}
	
	async deleteWorkflow(workflowInstanceId: string): Promise<void> {
		const response = await fetch(`${this.baseUrl}/workflows/${workflowInstanceId}`, {
			method: 'DELETE'
		});
		
		if (!response.ok) {
			throw new Error(`Failed to delete workflow: ${response.statusText}`);
		}
	}
	
	async cleanupOldWorkflows(maxAgeDays: number): Promise<number> {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
		
		const response = await fetch(`${this.baseUrl}/workflows/cleanup`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ cutoffDate })
		});
		
		if (!response.ok) {
			throw new Error(`Failed to cleanup old workflows: ${response.statusText}`);
		}
		
		const result = await response.json();
		return result.deletedCount || 0;
	}
	
	/**
	 * Normalize workflow data from storage
	 */
	private normalizeWorkflow(data: any): WorkflowInstance {
		return {
			id: data.id,
			workflowId: data.workflowId,
			currentStepId: data.currentStepId,
			status: data.status,
			context: data.context,
			steps: data.steps.map((step: any) => ({
				...step,
				startedAt: step.startedAt ? new Date(step.startedAt) : undefined,
				completedAt: step.completedAt ? new Date(step.completedAt) : undefined
			})),
			result: data.result,
			error: data.error,
			startedAt: new Date(data.startedAt),
			pausedAt: data.pausedAt ? new Date(data.pausedAt) : undefined,
			completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
			metadata: data.metadata || {},
			userId: data.userId,
			persistent: data.persistent !== false
		};
	}
}

/**
 * In-memory storage for testing
 */
export class InMemoryWorkflowStorage implements WorkflowStateStorage {
	private workflows: Map<string, WorkflowInstance> = new Map();
	
	async saveWorkflow(workflow: WorkflowInstance): Promise<void> {
		this.workflows.set(workflow.id, workflow);
	}
	
	async loadWorkflow(workflowInstanceId: string): Promise<WorkflowInstance | null> {
		return this.workflows.get(workflowInstanceId) || null;
	}
	
	async loadUserWorkflows(userId?: string): Promise<WorkflowInstance[]> {
		return Array.from(this.workflows.values())
			.filter(workflow => !userId || workflow.userId === userId);
	}
	
	async updateWorkflowStatus(workflowInstanceId: string, status: WorkflowStatus): Promise<void> {
		const workflow = this.workflows.get(workflowInstanceId);
		if (workflow) {
			workflow.status = status;
			if (status === 'completed' || status === 'failed' || status === 'cancelled') {
				workflow.completedAt = new Date();
			}
		}
	}
	
	async updateStepStatus(workflowInstanceId: string, stepId: string, status: StepStatus): Promise<void> {
		const workflow = this.workflows.get(workflowInstanceId);
		if (workflow) {
			const step = workflow.steps.find(s => s.id === stepId);
			if (step) {
				step.status = status;
				if (status === 'in_progress') {
					step.startedAt = new Date();
				} else if (status === 'completed' || status === 'failed') {
					step.completedAt = new Date();
				}
			}
		}
	}
	
	async saveStepResult(workflowInstanceId: string, stepId: string, result: any): Promise<void> {
		const workflow = this.workflows.get(workflowInstanceId);
		if (workflow) {
			const step = workflow.steps.find(s => s.id === stepId);
			if (step) {
				step.result = result;
			}
		}
	}
	
	async saveWorkflowResult(workflowInstanceId: string, result: WorkflowResult): Promise<void> {
		const workflow = this.workflows.get(workflowInstanceId);
		if (workflow) {
			workflow.result = result;
		}
	}
	
	async saveWorkflowError(workflowInstanceId: string, error: WorkflowError): Promise<void> {
		const workflow = this.workflows.get(workflowInstanceId);
		if (workflow) {
			workflow.error = error;
		}
	}
	
	async deleteWorkflow(workflowInstanceId: string): Promise<void> {
		this.workflows.delete(workflowInstanceId);
	}
	
	async cleanupOldWorkflows(maxAgeDays: number): Promise<number> {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
		
		let deletedCount = 0;
		for (const [id, workflow] of this.workflows.entries()) {
			if (workflow.completedAt && workflow.completedAt < cutoffDate) {
				this.workflows.delete(id);
				deletedCount++;
			}
		}
		
		return deletedCount;
	}
	
	/**
	 * Clear all workflows (for testing)
	 */
	clear(): void {
		this.workflows.clear();
	}
	
	/**
	 * Get all workflows (for testing)
	 */
	getAllWorkflows(): WorkflowInstance[] {
		return Array.from(this.workflows.values());
	}
}

/**
 * Workflow state manager
 */
export class WorkflowStateManager {
	private storage: WorkflowStateStorage;
	
	constructor(storage?: WorkflowStateStorage) {
		this.storage = storage || new InMemoryWorkflowStorage();
	}
	
	/**
	 * Initialize workflow state manager
	 */
	static async initialize(baseUrl?: string, userId?: string): Promise<WorkflowStateManager> {
		let storage: WorkflowStateStorage;
		
		if (baseUrl) {
			storage = new AppFlowyWorkflowStorage(baseUrl, userId);
		} else {
			storage = new InMemoryWorkflowStorage();
		}
		
		return new WorkflowStateManager(storage);
	}
	
	/**
	 * Create and save new workflow instance
	 */
	async createWorkflowInstance(
		workflowId: string,
		context: CopilotContext,
		userId?: string
	): Promise<WorkflowInstance> {
		const workflowInstance: WorkflowInstance = {
			id: `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			workflowId,
			currentStepId: '',
			status: 'draft',
			context,
			steps: [],
			startedAt: new Date(),
			metadata: {},
			userId,
			persistent: true
		};
		
		await this.storage.saveWorkflow(workflowInstance);
		return workflowInstance;
	}
	
	/**
	 * Start workflow
	 */
	async startWorkflow(workflowInstanceId: string, entryStepId: string): Promise<void> {
		const workflow = await this.storage.loadWorkflow(workflowInstanceId);
		if (!workflow) {
			throw new Error(`Workflow not found: ${workflowInstanceId}`);
		}
		
		workflow.status = 'active';
		workflow.currentStepId = entryStepId;
		workflow.startedAt = new Date();
		
		await this.storage.saveWorkflow(workflow);
		await this.storage.updateWorkflowStatus(workflowInstanceId, 'active');
	}
	
	/**
	 * Pause workflow
	 */
	async pauseWorkflow(workflowInstanceId: string): Promise<void> {
		await this.storage.updateWorkflowStatus(workflowInstanceId, 'paused');
	}
	
	/**
	 * Resume workflow
	 */
	async resumeWorkflow(workflowInstanceId: string): Promise<void> {
		await this.storage.updateWorkflowStatus(workflowInstanceId, 'active');
	}
	
	/**
	 * Complete workflow
	 */
	async completeWorkflow(workflowInstanceId: string, result: WorkflowResult): Promise<void> {
		await this.storage.updateWorkflowStatus(workflowInstanceId, 'completed');
		await this.storage.saveWorkflowResult(workflowInstanceId, result);
	}
	
	/**
	 * Fail workflow
	 */
	async failWorkflow(workflowInstanceId: string, error: WorkflowError): Promise<void> {
		await this.storage.updateWorkflowStatus(workflowInstanceId, 'failed');
		await this.storage.saveWorkflowError(workflowInstanceId, error);
	}
	
	/**
	 * Cancel workflow
	 */
	async cancelWorkflow(workflowInstanceId: string): Promise<void> {
		await this.storage.updateWorkflowStatus(workflowInstanceId, 'cancelled');
	}
	
	/**
	 * Update step status
	 */
	async updateStep(
		workflowInstanceId: string,
		stepId: string,
		status: StepStatus,
		result?: any
	): Promise<void> {
		await this.storage.updateStepStatus(workflowInstanceId, stepId, status);
		
		if (result !== undefined) {
			await this.storage.saveStepResult(workflowInstanceId, stepId, result);
		}
	}
	
	/**
	 * Get workflow by ID
	 */
	async getWorkflow(workflowInstanceId: string): Promise<WorkflowInstance | null> {
		return await this.storage.loadWorkflow(workflowInstanceId);
	}
	
	/**
	 * Get user workflows
	 */
	async getUserWorkflows(userId?: string, status?: WorkflowStatus): Promise<WorkflowInstance[]> {
		const workflows = await this.storage.loadUserWorkflows(userId);
		
		if (status) {
			return workflows.filter(workflow => workflow.status === status);
		}
		
		return workflows;
	}
	
	/**
	 * Get active workflows
	 */
	async getActiveWorkflows(userId?: string): Promise<WorkflowInstance[]> {
		return this.getUserWorkflows(userId, 'active');
	}
	
	/**
	 * Get paused workflows
	 */
	async getPausedWorkflows(userId?: string): Promise<WorkflowInstance[]> {
		return this.getUserWorkflows(userId, 'paused');
	}
	
	/**
	 * Get completed workflows
	 */
	async getCompletedWorkflows(userId?: string): Promise<WorkflowInstance[]> {
		return this.getUserWorkflows(userId, 'completed');
	}
	
	/**
	 * Delete workflow
	 */
	async deleteWorkflow(workflowInstanceId: string): Promise<void> {
		await this.storage.deleteWorkflow(workflowInstanceId);
	}
	
	/**
	 * Cleanup old workflows
	 */
	async cleanupOldWorkflows(maxAgeDays: number = 30): Promise<number> {
		return await this.storage.cleanupOldWorkflows(maxAgeDays);
	}
	
	/**
	 * Export workflow data
	 */
	async exportWorkflow(workflowInstanceId: string): Promise<any> {
		const workflow = await this.getWorkflow(workflowInstanceId);
		if (!workflow) {
			throw new Error(`Workflow not found: ${workflowInstanceId}`);
		}
		
		return {
			workflow,
			exportedAt: new Date(),
			format: 'workflow-export-v1'
		};
	}
	
	/**
	 * Import workflow data
	 */
	async importWorkflow(data: any): Promise<WorkflowInstance> {
		if (!data.workflow || !data.workflow.id) {
			throw new Error('Invalid workflow data format');
		}
		
		const workflow = data.workflow;
		
		// Update timestamps
		workflow.importedAt = new Date();
		if (workflow.startedAt && typeof workflow.startedAt === 'string') {
			workflow.startedAt = new Date(workflow.startedAt);
		}
		if (workflow.completedAt && typeof workflow.completedAt === 'string') {
			workflow.completedAt = new Date(workflow.completedAt);
		}
		
		// Save imported workflow
		await this.storage.saveWorkflow(workflow);
		return workflow;
	}
	
	/**
	 * Get workflow statistics
	 */
	async getStatistics(userId?: string): Promise<{
		total: number;
		byStatus: Record<WorkflowStatus, number>;
		byCategory: Record<string, number>;
		averageDurationMinutes: number;
		successRate: number;
	}> {
		const workflows = await this.getUserWorkflows(userId);
		
		const byStatus: Record<WorkflowStatus, number> = {
			draft: 0,
			active: 0,
			paused: 0,
			completed: 0,
			failed: 0,
			cancelled: 0
		};
		
		const byCategory: Record<string, number> = {};
		let totalDuration = 0;
		let completedCount = 0;
		let successfulCount = 0;
		
		for (const workflow of workflows) {
			byStatus[workflow.status] = (byStatus[workflow.status] || 0) + 1;
			
			// Extract category from workflow ID or metadata
			const category = workflow.metadata.category || 'unknown';
			byCategory[category] = (byCategory[category] || 0) + 1;
			
			// Calculate duration for completed workflows
			if (workflow.completedAt && workflow.startedAt) {
				const durationMs = workflow.completedAt.getTime() - workflow.startedAt.getTime();
				const durationMinutes = durationMs / (1000 * 60);
				totalDuration += durationMinutes;
				completedCount++;
				
				if (workflow.status === 'completed') {
					successfulCount++;
				}
			}
		}
		
		return {
			total: workflows.length,
			byStatus,
			byCategory,
			averageDurationMinutes: completedCount > 0 ? Math.round(totalDuration / completedCount) : 0,
			successRate: completedCount > 0 ? Math.round((successfulCount / completedCount) * 100) : 0
		};
	}
	
	/**
	 * Get workflow analytics
	 */
	async getAnalytics(userId?: string, days: number = 30): Promise<{
		dailyCompletions: Array<{ date: string; count: number }>;
		categoryDistribution: Array<{ category: string; count: number; percentage: number }>;
		stepSuccessRates: Record<string, number>;
		averageStepsPerWorkflow: number;
	}> {
		const workflows = await this.getUserWorkflows(userId);
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - days);
		
		// Daily completions
		const dailyCompletions: Record<string, number> = {};
		const categoryCounts: Record<string, number> = {};
		const stepSuccessCounts: Record<string, { success: number; total: number }> = {};
		let totalSteps = 0;
		
		for (const workflow of workflows) {
			if (workflow.completedAt && workflow.completedAt >= cutoffDate) {
				const dateStr = workflow.completedAt.toISOString().split('T')[0];
				dailyCompletions[dateStr] = (dailyCompletions[dateStr] || 0) + 1;
			}
			
			// Category distribution
			const category = workflow.metadata.category || 'unknown';
			categoryCounts[category] = (categoryCounts[category] || 0) + 1;
			
			// Step success rates
			for (const step of workflow.steps) {
				totalSteps++;
				const stepType = step.type;
				if (!stepSuccessCounts[stepType]) {
					stepSuccessCounts[stepType] = { success: 0, total: 0 };
				}
				stepSuccessCounts[stepType].total++;
				if (step.status === 'completed' && step.result?.success) {
					stepSuccessCounts[stepType].success++;
				}
			}
		}
		
		// Convert daily completions to array
		const dailyCompletionsArray = Object.entries(dailyCompletions)
			.map(([date, count]) => ({ date, count }))
			.sort((a, b) => a.date.localeCompare(b.date));
		
		// Calculate category distribution with percentages
		const totalWorkflows = workflows.length;
		const categoryDistribution = Object.entries(categoryCounts)
			.map(([category, count]) => ({
				category,
				count,
				percentage: totalWorkflows > 0 ? Math.round((count / totalWorkflows) * 100) : 0
			}))
			.sort((a, b) => b.count - a.count);
		
		// Calculate step success rates
		const stepSuccessRates: Record<string, number> = {};
		for (const [stepType, counts] of Object.entries(stepSuccessCounts)) {
			stepSuccessRates[stepType] = counts.total > 0 ?
				Math.round((counts.success / counts.total) * 100) : 0;
		}
		
		return {
			dailyCompletions: dailyCompletionsArray,
			categoryDistribution,
			stepSuccessRates,
			averageStepsPerWorkflow: workflows.length > 0 ? Math.round(totalSteps / workflows.length) : 0
		};
	}
}