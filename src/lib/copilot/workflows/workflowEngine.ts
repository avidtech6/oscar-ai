/**
 * Workflow Engine
 * 
 * Core engine for executing AI-driven workflows in the Communication Hub.
 * Manages multi-step workflows with pausing, resuming, and integration with
 * Smart Share, provider intelligence, deliverability intelligence, and document intelligence.
 */

import type {
	WorkflowDefinition,
	WorkflowInstance,
	WorkflowStep,
	StepType,
	StepStatus,
	WorkflowStatus,
	StepConfig,
	StepResult,
	StepError,
	WorkflowEvent,
	WorkflowContext,
	WorkflowResult,
	WorkflowError,
	AIStepConfig,
	UserActionStepConfig,
	SmartShareStepConfig,
	ProviderVerificationStepConfig,
	DeliverabilityFixStepConfig,
	DocumentGenerationStepConfig,
	EmailSendStepConfig,
	WaitStepConfig,
	ContextCheckStepConfig
} from './workflowTypes';

import type { CopilotContext } from '../context/contextTypes';

// Import engine instances
import { contextEngine } from '../context/contextEngine';
import { hintEngine } from '../hints/hintEngine';
import { smartShareEngine } from '../smart-share/smartShareEngine';
import { providerIntelligence } from '../providers/providerIntelligence';
import { DeliverabilityEngine } from '../deliverability/deliverabilityEngine';
import { DocumentIntelligence } from '../document/documentIntelligence';
import { actionEngine } from '../actions/actionEngine';

/**
 * Workflow engine configuration
 */
export interface WorkflowEngineConfig {
	/** Maximum concurrent workflows */
	maxConcurrentWorkflows: number;
	
	/** Step execution timeout (ms) */
	stepTimeoutMs: number;
	
	/** Maximum step retries */
	maxStepRetries: number;
	
	/** Auto-start workflows when context matches */
	autoStartMatchingWorkflows: boolean;
	
	/** Persist workflow state */
	persistWorkflowState: boolean;
	
	/** Log level */
	logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Workflow engine
 */
export class WorkflowEngine {
	private config: WorkflowEngineConfig;
	private activeWorkflows: Map<string, WorkflowInstance> = new Map();
	private pausedWorkflows: Map<string, WorkflowInstance> = new Map();
	private completedWorkflows: Map<string, WorkflowInstance> = new Map();
	private eventListeners: Array<(event: WorkflowEvent) => void> = [];
	private stepHandlers: Map<StepType, (step: WorkflowStep, context: WorkflowContext) => Promise<StepResult>> = new Map();
	private deliverabilityEngine: DeliverabilityEngine;
	private documentIntelligence: DocumentIntelligence;
	
	constructor(config?: Partial<WorkflowEngineConfig>) {
		this.config = {
			maxConcurrentWorkflows: 5,
			stepTimeoutMs: 30000,
			maxStepRetries: 3,
			autoStartMatchingWorkflows: true,
			persistWorkflowState: true,
			logLevel: 'info',
			...config
		};
		
		this.deliverabilityEngine = new DeliverabilityEngine();
		this.documentIntelligence = new DocumentIntelligence();
		
		this.initializeStepHandlers();
		this.setupContextListener();
		
		this.log('info', 'Workflow engine initialized');
	}
	
	/**
	 * Initialize step handlers
	 */
	private initializeStepHandlers(): void {
		// AI action step handler
		this.stepHandlers.set('ai_action', async (step, context) => {
			const config = step.config as AIStepConfig;
			try {
				// Execute action via action engine
				const result = await actionEngine.executeAction(config.actionId, context.copilotContext, config.params);
				return {
					type: 'ai_action',
					data: result,
					success: true,
					metadata: {}
				};
			} catch (error: any) {
				return {
					type: 'ai_action',
					data: { error: error.message },
					success: false,
					message: `AI action failed: ${error.message}`,
					metadata: {}
				};
			}
		});
		
		// User action step handler
		this.stepHandlers.set('user_action', async (step, context) => {
			// User action steps just mark as pending - UI will handle completion
			return {
				type: 'user_action',
				data: { stepId: step.id, requiresUserInput: true },
				success: true,
				message: 'Waiting for user action',
				metadata: {}
			};
		});
		
		// Smart Share step handler
		this.stepHandlers.set('smart_share', async (step, context) => {
			const config = step.config as SmartShareStepConfig;
			// Request Smart Share (placeholder)
			this.log('info', `Smart Share requested for: ${config.lookFor}`);
			
			return {
				type: 'smart_share',
				data: { requested: true, lookFor: config.lookFor },
				success: true,
				message: 'Smart Share requested',
				metadata: {}
			};
		});
		
		// Provider verification step handler
		this.stepHandlers.set('provider_verification', async (step, context) => {
			const config = step.config as ProviderVerificationStepConfig;
			// Verify provider (placeholder)
			this.log('info', `Verifying provider: ${config.providerId}`);
			
			return {
				type: 'provider_verification',
				data: { providerId: config.providerId, isValid: true },
				success: true,
				message: 'Provider verified',
				metadata: {}
			};
		});
		
		// Deliverability fix step handler
		this.stepHandlers.set('deliverability_fix', async (step, context) => {
			const config = step.config as DeliverabilityFixStepConfig;
			// Analyze deliverability
			const analysis = this.deliverabilityEngine.analyzeEmail(context.copilotContext);
			
			return {
				type: 'deliverability_fix',
				data: analysis,
				success: analysis.riskLevel !== 'critical',
				message: `Deliverability analyzed: ${analysis.riskLevel}`,
				metadata: {}
			};
		});
		
		// Document generation step handler
		this.stepHandlers.set('document_generation', async (step, context) => {
			const config = step.config as DocumentGenerationStepConfig;
			// Generate document (placeholder)
			const document = {
				id: `doc-${Date.now()}`,
				title: 'Generated Document',
				content: { html: '<p>Document content</p>', markdown: 'Document content', plainText: 'Document content' },
				metadata: { generatedAt: new Date(), source: 'workflow', confidence: 90, wordCount: 100 },
				recommendations: []
			};
			
			context.artifacts.push({
				type: 'document',
				id: document.id,
				data: document
			});
			
			return {
				type: 'document_generation',
				data: document,
				success: true,
				message: `Document generated: ${document.title}`,
				metadata: {}
			};
		});
		
		// Email send step handler
		this.stepHandlers.set('email_send', async (step, context) => {
			return {
				type: 'email_send',
				data: { sent: false },
				success: true,
				message: 'Email send step (placeholder)',
				metadata: {}
			};
		});
		
		// Wait step handler
		this.stepHandlers.set('wait', async (step, context) => {
			const config = step.config as WaitStepConfig;
			if (config.waitType === 'time' && config.durationMs) {
				await new Promise(resolve => setTimeout(resolve, config.durationMs));
			}
			
			return {
				type: 'wait',
				data: { waited: config.durationMs || 0 },
				success: true,
				message: 'Wait completed',
				metadata: {}
			};
		});
		
		// Context check step handler
		this.stepHandlers.set('context_check', async (step, context) => {
			const config = step.config as ContextCheckStepConfig;
			// Check context value (simplified)
			const passes = true; // Placeholder
			
			return {
				type: 'context_check',
				data: { passes, expected: config.expectedValue },
				success: passes,
				message: passes ? 'Context check passed' : 'Context check failed',
				metadata: {}
			};
		});
	}
	
	/**
	 * Setup context listener for auto-starting workflows
	 */
	private setupContextListener(): void {
		if (this.config.autoStartMatchingWorkflows) {
			contextEngine.addListener((event) => {
				this.checkForMatchingWorkflows(event.newContext as CopilotContext);
			});
		}
	}
	
	/**
	 * Check for workflows that match current context
	 */
	private checkForMatchingWorkflows(context: CopilotContext): void {
		// This would check workflow registry for workflows with matching requiredContext
		this.log('debug', 'Context changed, checking for matching workflows');
	}
	
	/**
	 * Start a workflow
	 */
	async startWorkflow(workflowId: string, context?: CopilotContext): Promise<WorkflowInstance> {
		// Check if already at max concurrent workflows
		if (this.activeWorkflows.size >= this.config.maxConcurrentWorkflows) {
			throw new Error(`Maximum concurrent workflows (${this.config.maxConcurrentWorkflows}) reached`);
		}
		
		// Get workflow definition from registry (would be imported)
		// For now, create a placeholder
		const workflowDefinition: WorkflowDefinition = {
			id: workflowId,
			name: 'Placeholder Workflow',
			description: 'Placeholder workflow definition',
			category: 'provider',
			version: '1.0.0',
			steps: [],
			entryStepId: 'step-1',
			metadata: {},
			estimatedTimeMinutes: 10,
			priority: 5,
			automationLevel: 'semi_auto'
		};
		
		// Create workflow instance
		const workflowInstance: WorkflowInstance = {
			id: `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			workflowId,
			currentStepId: workflowDefinition.entryStepId,
			status: 'active',
			context: context || contextEngine.getCurrentContext(),
			steps: workflowDefinition.steps.map(step => ({
				...step,
				status: 'pending',
				result: undefined,
				error: undefined,
				metadata: {}
			})),
			startedAt: new Date(),
			metadata: {},
			persistent: this.config.persistWorkflowState
		};
		
		// Add to active workflows
		this.activeWorkflows.set(workflowInstance.id, workflowInstance);
		
		// Emit workflow started event
		this.emitEvent({
			type: 'workflow_started',
			workflowInstanceId: workflowInstance.id,
			data: { workflowId, context: workflowInstance.context },
			timestamp: new Date()
		});
		
		// Start first step
		this.executeNextStep(workflowInstance.id);
		
		this.log('info', `Workflow started: ${workflowId} (instance: ${workflowInstance.id})`);
		
		return workflowInstance;
	}
	
	/**
	 * Pause a workflow
	 */
	pauseWorkflow(workflowInstanceId: string): void {
		const workflow = this.activeWorkflows.get(workflowInstanceId);
		if (!workflow) {
			throw new Error(`Workflow not found: ${workflowInstanceId}`);
		}
		
		if (workflow.status !== 'active') {
			throw new Error(`Workflow is not active: ${workflowInstanceId}`);
		}
		
		// Update workflow status
		workflow.status = 'paused';
		workflow.pausedAt = new Date();
		
		// Update current step status if it's in progress
		const currentStep = workflow.steps.find(step => step.id === workflow.currentStepId);
		if (currentStep && currentStep.status === 'in_progress') {
			currentStep.status = 'paused';
		}
		
		// Move to paused workflows
		this.activeWorkflows.delete(workflowInstanceId);
		this.pausedWorkflows.set(workflowInstanceId, workflow);
		
		// Emit workflow paused event
		this.emitEvent({
			type: 'workflow_paused',
			workflowInstanceId,
			data: { reason: 'user_requested' },
			timestamp: new Date()
		});
		
		this.log('info', `Workflow paused: ${workflowInstanceId}`);
	}
	
	/**
	 * Resume a workflow
	 */
	resumeWorkflow(workflowInstanceId: string): void {
		const workflow = this.pausedWorkflows.get(workflowInstanceId);
		if (!workflow) {
			throw new Error(`Workflow not found or not paused: ${workflowInstanceId}`);
		}
		
		// Check if we can resume (max concurrent workflows)
		if (this.activeWorkflows.size >= this.config.maxConcurrentWorkflows) {
			throw new Error(`Maximum concurrent workflows (${this.config.maxConcurrentWorkflows}) reached`);
		}
		
		// Update workflow status
		workflow.status = 'active';
		
		// Update current step status if it was paused
		const currentStep = workflow.steps.find(step => step.id === workflow.currentStepId);
		if (currentStep && currentStep.status === 'paused') {
			currentStep.status = 'in_progress';
		}
		
		// Move back to active workflows
		this.pausedWorkflows.delete(workflowInstanceId);
		this.activeWorkflows.set(workflowInstanceId, workflow);
		
		// Emit workflow resumed event
		this.emitEvent({
			type: 'workflow_resumed',
			workflowInstanceId,
			data: {},
			timestamp: new Date()
		});
		
		// Continue execution
		this.executeNextStep(workflowInstanceId);
		
		this.log('info', `Workflow resumed: ${workflowInstanceId}`);
	}
	
	/**
	 * Cancel a workflow
	 */
	cancelWorkflow(workflowInstanceId: string): void {
		let workflow = this.activeWorkflows.get(workflowInstanceId) || 
					  this.pausedWorkflows.get(workflowInstanceId);
		
		if (!workflow) {
			throw new Error(`Workflow not found: ${workflowInstanceId}`);
		}
		
		// Update workflow status
		workflow.status = 'cancelled';
		workflow.completedAt = new Date();
		
		// Remove from active/paused workflows
		this.activeWorkflows.delete(workflowInstanceId);
		this.pausedWorkflows.delete(workflowInstanceId);
		
		// Add to completed workflows
		this.completedWorkflows.set(workflowInstanceId, workflow);
		
		// Emit workflow cancelled event
		this.emitEvent({
			type: 'workflow_cancelled',
			workflowInstanceId,
			data: {},
			timestamp: new Date()
		});
		
		this.log('info', `Workflow cancelled: ${workflowInstanceId}`);
	}
	
	/**
	 * Get active workflows
	 */
	getActiveWorkflows(): WorkflowInstance[] {
		return Array.from(this.activeWorkflows.values());
	}
	
	/**
	 * Get paused workflows
	 */
	getPausedWorkflows(): WorkflowInstance[] {
		return Array.from(this.pausedWorkflows.values());
	}
	
	/**
	 * Get completed workflows
	 */
	getCompletedWorkflows(): WorkflowInstance[] {
		return Array.from(this.completedWorkflows.values());
	}
	
	/**
	 * Get workflow by ID
	 */
	getWorkflow(workflowInstanceId: string): WorkflowInstance | undefined {
		return this.activeWorkflows.get(workflowInstanceId) ||
			   this.pausedWorkflows.get(workflowInstanceId) ||
			   this.completedWorkflows.get(workflowInstanceId);
	}
	
	/**
	 * Add event listener
	 */
	onEvent(listener: (event: WorkflowEvent) => void): () => void {
		this.eventListeners.push(listener);
		return () => {
			const index = this.eventListeners.indexOf(listener);
			if (index > -1) {
				this.eventListeners.splice(index, 1);
			}
		};
	}
	
	/**
	 * Execute next step in workflow
	 */
	private async executeNextStep(workflowInstanceId: string): Promise<void> {
		const workflow = this.activeWorkflows.get(workflowInstanceId);
		if (!workflow || workflow.status !== 'active') {
			return;
		}
		
		const currentStep = workflow.steps.find(step => step.id === workflow.currentStepId);
		if (!currentStep) {
			this.failWorkflow(workflowInstanceId, {
				code: 'STEP_NOT_FOUND',
				message: `Step not found: ${workflow.currentStepId}`,
				stepId: workflow.currentStepId,
				recoverable: false
			});
			return;
		}
		
		// Check step dependencies
		const unmetDependencies = currentStep.dependencies.filter(depId => {
			const depStep = workflow.steps.find(step => step.id === depId);
			return !depStep || depStep.status !== 'completed';
		});
		
		if (unmetDependencies.length > 0) {
			this.log('warn', `Step ${currentStep.id} has unmet dependencies: ${unmetDependencies.join(', ')}`);
			// Try to find next executable step
			const nextStep = this.findNextExecutableStep(workflow);
			if (nextStep) {
				workflow.currentStepId = nextStep.id;
				return this.executeNextStep(workflowInstanceId);
			} else {
				this.failWorkflow(workflowInstanceId, {
					code: 'DEADLOCK',
					message: `Workflow deadlock: no executable step found`,
					stepId: currentStep.id,
					recoverable: false
				});
			}
		}
		
		// Execute the step
		try {
			const handler = this.stepHandlers.get(currentStep.type);
			if (!handler) {
				throw new Error(`No handler for step type: ${currentStep.type}`);
			}
			
			// Update step status
			currentStep.status = 'in_progress';
			currentStep.startedAt = new Date();
			
			// Create workflow context
			const workflowContext: WorkflowContext = {
				copilotContext: workflow.context,
				data: {},
				artifacts: [],
				stepResults: {},
				userInputs: {},
				smartShareResults: {}
			};
			
			// Execute step with timeout
			const result = await Promise.race([
				handler(currentStep, workflowContext),
				new Promise<StepResult>((_, reject) =>
					setTimeout(() => reject(new Error(`Step timeout after ${this.config.stepTimeoutMs}ms`)), this.config.stepTimeoutMs)
				)
			]);
			
			// Update step with result
			currentStep.status = result.success ? 'completed' : 'failed';
			currentStep.completedAt = new Date();
			currentStep.result = result;
			
			// Store artifacts in workflow metadata
			if (workflowContext.artifacts.length > 0) {
				workflow.metadata.artifacts = [...(workflow.metadata.artifacts || []), ...workflowContext.artifacts];
			}
			
			// Emit step completed event
			this.emitEvent({
				type: 'step_completed',
				workflowInstanceId,
				data: { stepId: currentStep.id, result },
				timestamp: new Date()
			});
			
			if (result.success) {
				this.log('info', `Step completed: ${currentStep.id} (${currentStep.type})`);
				
				// Find next step
				const nextStep = this.findNextStep(workflow, currentStep.id);
				if (nextStep) {
					workflow.currentStepId = nextStep.id;
					// Continue with next step
					setTimeout(() => this.executeNextStep(workflowInstanceId), 0);
				} else {
					// Workflow completed
					this.completeWorkflow(workflowInstanceId);
				}
			} else {
				this.log('error', `Step failed: ${currentStep.id} - ${result.message}`);
				
				// Check retries
				const retryCount = currentStep.metadata.retryCount || 0;
				if (retryCount < this.config.maxStepRetries) {
					currentStep.metadata.retryCount = retryCount + 1;
					currentStep.status = 'pending';
					currentStep.result = undefined;
					
					this.log('info', `Retrying step ${currentStep.id} (attempt ${retryCount + 1}/${this.config.maxStepRetries})`);
					setTimeout(() => this.executeNextStep(workflowInstanceId), 1000);
				} else {
					// Max retries exceeded
					this.failWorkflow(workflowInstanceId, {
						code: 'STEP_FAILED',
						message: `Step failed after ${this.config.maxStepRetries} retries: ${result.message}`,
						stepId: currentStep.id,
						recoverable: false
					});
				}
			}
		} catch (error: any) {
			this.log('error', `Step execution error: ${currentStep.id} - ${error.message}`);
			
			currentStep.status = 'failed';
			currentStep.completedAt = new Date();
			currentStep.error = {
				code: 'EXECUTION_ERROR',
				message: error.message,
				details: { stepId: currentStep.id },
				recoverable: false
			};
			
			this.failWorkflow(workflowInstanceId, {
				code: 'EXECUTION_ERROR',
				message: `Step execution error: ${error.message}`,
				stepId: currentStep.id,
				recoverable: false
			});
		}
	}
	
	/**
		* Find next executable step
		*/
	private findNextExecutableStep(workflow: WorkflowInstance): WorkflowStep | null {
		// Find steps that are pending and have all dependencies satisfied
		for (const step of workflow.steps) {
			if (step.status === 'pending') {
				const unmetDependencies = step.dependencies.filter(depId => {
					const depStep = workflow.steps.find(s => s.id === depId);
					return !depStep || depStep.status !== 'completed';
				});
				
				if (unmetDependencies.length === 0) {
					return step;
				}
			}
		}
		return null;
	}
	
	/**
		* Find next step after current step
		*/
	private findNextStep(workflow: WorkflowInstance, currentStepId: string): WorkflowStep | null {
		const currentStep = workflow.steps.find(step => step.id === currentStepId);
		if (!currentStep) return null;
		
		// Find steps that depend on this step
		const dependentSteps = workflow.steps.filter(step =>
			step.dependencies.includes(currentStepId) && step.status === 'pending'
		);
		
		if (dependentSteps.length > 0) {
			// Return first dependent step
			return dependentSteps[0];
		}
		
		// No more steps
		return null;
	}
	
	/**
		* Complete workflow
		*/
	private completeWorkflow(workflowInstanceId: string): void {
		const workflow = this.activeWorkflows.get(workflowInstanceId);
		if (!workflow) return;
		
		workflow.status = 'completed';
		workflow.completedAt = new Date();
		
		// Move to completed workflows
		this.activeWorkflows.delete(workflowInstanceId);
		this.completedWorkflows.set(workflowInstanceId, workflow);
		
		// Emit workflow completed event
		this.emitEvent({
			type: 'workflow_completed',
			workflowInstanceId,
			data: { result: 'success' },
			timestamp: new Date()
		});
		
		this.log('info', `Workflow completed: ${workflowInstanceId}`);
	}
	
	/**
		* Fail workflow
		*/
	private failWorkflow(workflowInstanceId: string, error: WorkflowError): void {
		const workflow = this.activeWorkflows.get(workflowInstanceId) ||
						this.pausedWorkflows.get(workflowInstanceId);
		
		if (!workflow) return;
		
		workflow.status = 'failed';
		workflow.completedAt = new Date();
		workflow.error = error;
		
		// Remove from active/paused workflows
		this.activeWorkflows.delete(workflowInstanceId);
		this.pausedWorkflows.delete(workflowInstanceId);
		
		// Add to completed workflows
		this.completedWorkflows.set(workflowInstanceId, workflow);
		
		// Emit workflow failed event
		this.emitEvent({
			type: 'workflow_failed',
			workflowInstanceId,
			data: { error },
			timestamp: new Date()
		});
		
		this.log('error', `Workflow failed: ${workflowInstanceId} - ${error.message}`);
	}
	
	/**
		* Log message
		*/
	private log(level: 'debug' | 'info' | 'warn' | 'error', message: string): void {
		if (this.config.logLevel === 'debug' ||
			(level === 'info' && this.config.logLevel !== 'error') ||
			(level === 'warn' && this.config.logLevel !== 'error') ||
			level === 'error') {
			console.log(`[WorkflowEngine ${level.toUpperCase()}] ${message}`);
		}
	}
	
	/**
		* Emit event to listeners
		*/
	private emitEvent(event: WorkflowEvent): void {
		for (const listener of this.eventListeners) {
			try {
				listener(event);
			} catch (error) {
				console.error('Error in workflow event listener:', error);
			}
		}
	}
}
