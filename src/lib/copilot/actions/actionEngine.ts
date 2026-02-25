/**
 * Action Engine
 * 
 * Core engine for executing intelligent actions based on copilot intelligence.
 * Handles action discovery, execution, and result tracking in the Communication Hub.
 */

import type { CopilotContext } from '../context/contextTypes';
import type { Hint } from '../hints/hintTypes';
import type { DeliverabilityScore } from '../deliverability/deliverabilityEngine';
import type { SurveyData, GeneratedDocument } from '../document/documentIntelligence';

/**
 * Action type
 */
export type ActionType = 
	| 'provider-setup'
	| 'deliverability-fix'
	| 'smart-share'
	| 'document-generation'
	| 'email-send'
	| 'campaign-create'
	| 'report-generate'
	| 'hint-execute'
	| 'context-update'
	| 'validation-run';

/**
 * Action priority
 */
export type ActionPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Action status
 */
export type ActionStatus = 
	| 'pending'
	| 'in-progress'
	| 'completed'
	| 'failed'
	| 'cancelled'
	| 'skipped';

/**
 * Action result
 */
export interface ActionResult {
	/** Whether the action succeeded */
	success: boolean;
	
	/** Result data (if any) */
	data?: any;
	
	/** Error message (if failed) */
	error?: string;
	
	/** Execution time in milliseconds */
	executionTime: number;
	
	/** Timestamp */
	timestamp: Date;
	
	/** Follow-up actions (if any) */
	followUpActions?: ActionDefinition[];
}

/**
 * Action definition
 */
export interface ActionDefinition {
	/** Action ID */
	id: string;
	
	/** Action type */
	type: ActionType;
	
	/** Action title */
	title: string;
	
	/** Action description */
	description: string;
	
	/** Priority */
	priority: ActionPriority;
	
	/** Required context */
	requiredContext: Partial<CopilotContext>;
	
	/** Execution function */
	execute: (context: CopilotContext, params?: any) => Promise<ActionResult>;
	
	/** Validation function (optional) */
	validate?: (context: CopilotContext) => { valid: boolean; reason?: string };
	
	/** Estimated execution time in milliseconds */
	estimatedTime: number;
	
	/** Whether action can be automated */
	automationLevel: 'manual' | 'semi-auto' | 'full-auto';
	
	/** Risk level */
	riskLevel: 'low' | 'medium' | 'high';
	
	/** Dependencies (other action IDs) */
	dependencies?: string[];
	
	/** Tags for categorization */
	tags: string[];
}

/**
 * Action execution context
 */
export interface ActionExecutionContext {
	/** Action being executed */
	action: ActionDefinition;
	
	/** Current copilot context */
	context: CopilotContext;
	
	/** Execution parameters */
	params?: any;
	
	/** Start time */
	startTime: Date;
	
	/** Status */
	status: ActionStatus;
	
	/** Result (if completed) */
	result?: ActionResult;
	
	/** Progress (0-100) */
	progress: number;
	
	/** Error (if any) */
	error?: string;
}

/**
 * Action engine
 */
export class ActionEngine {
	private actions: Map<string, ActionDefinition> = new Map();
	private executionHistory: ActionExecutionContext[] = [];
	private actionRegistry: Map<ActionType, ActionDefinition[]> = new Map();

	constructor() {
		this.initializeDefaultActions();
	}

	/**
	 * Initialize default actions
	 */
	private initializeDefaultActions(): void {
		// Provider setup actions
		this.registerAction({
			id: 'provider-setup-gmail',
			type: 'provider-setup',
			title: 'Setup Gmail Provider',
			description: 'Configure Gmail email provider with OAuth authentication',
			priority: 'high',
			requiredContext: {
				ui: { currentScreen: 'provider-setup' } as any,
				provider: { providerId: 'gmail' } as any
			},
			execute: async (context, params) => {
				// Simulate provider setup
				await new Promise(resolve => setTimeout(resolve, 2000));
				return {
					success: true,
					data: { providerId: 'gmail', status: 'configured' },
					executionTime: 2000,
					timestamp: new Date()
				};
			},
			estimatedTime: 3000,
			automationLevel: 'semi-auto',
			riskLevel: 'low',
			tags: ['provider', 'setup', 'gmail']
		});

		// Deliverability fix actions
		this.registerAction({
			id: 'fix-dkim-configuration',
			type: 'deliverability-fix',
			title: 'Fix DKIM Configuration',
			description: 'Configure DKIM authentication to improve email deliverability',
			priority: 'high',
			requiredContext: {
				deliverability: { dkimConfigured: false } as any
			},
			execute: async (context, params) => {
				// Simulate DKIM fix
				await new Promise(resolve => setTimeout(resolve, 1500));
				return {
					success: true,
					data: { fix: 'dkim', status: 'configured' },
					executionTime: 1500,
					timestamp: new Date()
				};
			},
			estimatedTime: 2000,
			automationLevel: 'semi-auto',
			riskLevel: 'medium',
			tags: ['deliverability', 'authentication', 'dkim']
		});

		// Smart share actions
		this.registerAction({
			id: 'smart-share-verification',
			type: 'smart-share',
			title: 'Share Verification Email',
			description: 'Use Smart Share to extract verification code from email',
			priority: 'medium',
			requiredContext: {
				smartShare: { isNeeded: true, neededFor: 'verification-code' } as any
			},
			execute: async (context, params) => {
				// Simulate smart share
				await new Promise(resolve => setTimeout(resolve, 1000));
				return {
					success: true,
					data: { code: '123456', source: 'verification-email' },
					executionTime: 1000,
					timestamp: new Date()
				};
			},
			estimatedTime: 1500,
			automationLevel: 'full-auto',
			riskLevel: 'low',
			tags: ['smart-share', 'verification', 'automation']
		});

		// Document generation actions
		this.registerAction({
			id: 'generate-survey-report',
			type: 'document-generation',
			title: 'Generate Survey Report',
			description: 'Convert survey email content into professional report',
			priority: 'medium',
			requiredContext: {
				ui: { currentScreen: 'message-view' } as any
			},
			execute: async (context, params) => {
				// Simulate document generation
				await new Promise(resolve => setTimeout(resolve, 2500));
				return {
					success: true,
					data: { 
						documentId: 'doc-123',
						title: 'Survey Analysis Report',
						pages: 5
					},
					executionTime: 2500,
					timestamp: new Date()
				};
			},
			estimatedTime: 3000,
			automationLevel: 'full-auto',
			riskLevel: 'low',
			tags: ['document', 'report', 'survey']
		});

		// Email send actions
		this.registerAction({
			id: 'send-followup-email',
			type: 'email-send',
			title: 'Send Follow-up Email',
			description: 'Send automated follow-up email based on context',
			priority: 'medium',
			requiredContext: {
				ui: { currentScreen: 'compose' } as any
			},
			execute: async (context, params) => {
				// Simulate email send
				await new Promise(resolve => setTimeout(resolve, 1000));
				return {
					success: true,
					data: { messageId: 'msg-123', status: 'sent' },
					executionTime: 1000,
					timestamp: new Date()
				};
			},
			estimatedTime: 1500,
			automationLevel: 'semi-auto',
			riskLevel: 'medium',
			tags: ['email', 'send', 'communication']
		});
	}

	/**
	 * Register an action
	 */
	registerAction(action: ActionDefinition): void {
		this.actions.set(action.id, action);
		
		// Add to type registry
		if (!this.actionRegistry.has(action.type)) {
			this.actionRegistry.set(action.type, []);
		}
		this.actionRegistry.get(action.type)!.push(action);
	}

	/**
	 * Unregister an action
	 */
	unregisterAction(actionId: string): boolean {
		const action = this.actions.get(actionId);
		if (!action) return false;

		// Remove from type registry
		const typeActions = this.actionRegistry.get(action.type);
		if (typeActions) {
			const index = typeActions.findIndex(a => a.id === actionId);
			if (index !== -1) {
				typeActions.splice(index, 1);
			}
		}

		return this.actions.delete(actionId);
	}

	/**
	 * Discover available actions for context
	 */
	discoverActions(context: CopilotContext): ActionDefinition[] {
		const availableActions: ActionDefinition[] = [];

		// Convert Map values to array for iteration
		const actionsArray = Array.from(this.actions.values());
		
		for (const action of actionsArray) {
			// Check if context matches requirements
			if (this.isContextValidForAction(context, action.requiredContext)) {
				// Check validation if available
				if (action.validate) {
					const validation = action.validate(context);
					if (!validation.valid) continue;
				}

				availableActions.push(action);
			}
		}

		// Sort by priority (critical first, then high, medium, low)
		const priorityOrder: Record<ActionPriority, number> = {
			'critical': 0,
			'high': 1,
			'medium': 2,
			'low': 3
		};

		return availableActions.sort((a, b) =>
			priorityOrder[a.priority] - priorityOrder[b.priority]
		);
	}

	/**
	 * Check if context is valid for action
	 */
	private isContextValidForAction(
		context: CopilotContext,
		requiredContext: Partial<CopilotContext>
	): boolean {
		// Check UI context
		if (requiredContext.ui) {
			for (const [key, value] of Object.entries(requiredContext.ui)) {
				if (context.ui?.[key as keyof typeof context.ui] !== value) {
					return false;
				}
			}
		}

		// Check provider context
		if (requiredContext.provider) {
			if (!context.provider) return false;
			for (const [key, value] of Object.entries(requiredContext.provider)) {
				if (context.provider[key as keyof typeof context.provider] !== value) {
					return false;
				}
			}
		}

		// Check deliverability context
		if (requiredContext.deliverability) {
			if (!context.deliverability) return false;
			for (const [key, value] of Object.entries(requiredContext.deliverability)) {
				if (context.deliverability[key as keyof typeof context.deliverability] !== value) {
					return false;
				}
			}
		}

		// Check smart share context
		if (requiredContext.smartShare) {
			if (!context.smartShare) return false;
			for (const [key, value] of Object.entries(requiredContext.smartShare)) {
				if (context.smartShare[key as keyof typeof context.smartShare] !== value) {
					return false;
				}
			}
		}

		return true;
	}

	/**
	 * Execute an action
	 */
	async executeAction(
		actionId: string,
		context: CopilotContext,
		params?: any
	): Promise<ActionResult> {
		const action = this.actions.get(actionId);
		if (!action) {
			throw new Error(`Action not found: ${actionId}`);
		}

		// Create execution context
		const executionContext: ActionExecutionContext = {
			action,
			context,
			params,
			startTime: new Date(),
			status: 'in-progress',
			progress: 0
		};

		this.executionHistory.push(executionContext);

		try {
			// Check dependencies
			if (action.dependencies && action.dependencies.length > 0) {
				const unmetDependencies = action.dependencies.filter(depId => 
					!this.executionHistory.some(ctx => 
						ctx.action.id === depId && ctx.status === 'completed'
					)
				);

				if (unmetDependencies.length > 0) {
					throw new Error(`Unmet dependencies: ${unmetDependencies.join(', ')}`);
				}
			}

			// Update progress
			executionContext.progress = 10;

			// Execute the action
			const result = await action.execute(context, params);
			
			// Update execution context
			executionContext.status = result.success ? 'completed' : 'failed';
			executionContext.result = result;
			executionContext.progress = 100;

			if (!result.success) {
				executionContext.error = result.error;
			}

			return result;

		} catch (error) {
			// Update execution context with error
			executionContext.status = 'failed';
			executionContext.error = error instanceof Error ? error.message : 'Unknown error';
			executionContext.progress = 0;

			throw error;
		}
	}

	/**
	 * Execute multiple actions in sequence
	 */
	async executeActions(
		actionIds: string[],
		context: CopilotContext,
		params?: Record<string, any>
	): Promise<ActionResult[]> {
		const results: ActionResult[] = [];

		for (const actionId of actionIds) {
			try {
				const actionParams = params?.[actionId];
				const result = await this.executeAction(actionId, context, actionParams);
				results.push(result);

				// If action failed and has critical priority, stop execution
				const action = this.actions.get(actionId);
				if (!result.success && action?.priority === 'critical') {
					throw new Error(`Critical action failed: ${actionId}`);
				}

			} catch (error) {
				results.push({
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error',
					executionTime: 0,
					timestamp: new Date()
				});
				break;
			}
		}

		return results;
	}

	/**
	 * Get action by ID
	 */
	getAction(actionId: string): ActionDefinition | undefined {
		return this.actions.get(actionId);
	}

	/**
	 * Get actions by type
	 */
	getActionsByType(type: ActionType): ActionDefinition[] {
		return this.actionRegistry.get(type) || [];
	}

	/**
	 * Get all actions
	 */
	getAllActions(): ActionDefinition[] {
		return Array.from(this.actions.values());
	}

	/**
	 * Get execution history
	 */
	getExecutionHistory(): ActionExecutionContext[] {
		return [...this.executionHistory];
	}

	/**
	 * Clear execution history
	 */
	clearExecutionHistory(): void {
		this.executionHistory = [];
	}

	/**
	 * Get action suggestions from hints
	 */
	getActionSuggestionsFromHints(hints: Hint[]): ActionDefinition[] {
		const suggestedActions: ActionDefinition[] = [];

		for (const hint of hints) {
			// Map hint categories to action types
			const actionTypeMap: Record<string, ActionType[]> = {
				'provider-setup': ['provider-setup'],
				'deliverability': ['deliverability-fix'],
				'smart-share': ['smart-share'],
				'reports': ['document-generation', 'report-generate'],
				'compose': ['email-send'],
				'campaign': ['campaign-create']
			};

			const actionTypes = actionTypeMap[hint.category] || [];
			
			for (const actionType of actionTypes) {
				const typeActions = this.getActionsByType(actionType);
				suggestedActions.push(...typeActions);
			}
		}

		// Remove duplicates
		const uniqueActions = suggestedActions.filter((action, index, self) =>
			index === self.findIndex(a => a.id === action.id)
		);

		return uniqueActions.slice(0, 10); // Limit to 10 suggestions
	}

	/**
	 * Get action suggestions from deliverability score
	 */
	getActionSuggestionsFromDeliverability(score: DeliverabilityScore): ActionDefinition[] {
		const suggestions: ActionDefinition[] = [];

		// Suggest fixes based on score
		if (score.authentication < 70) {
			suggestions.push(...this.getActionsByType('deliverability-fix'));
		}

		if (score.spamRisk > 50) {
			suggestions.push(
				...this.getActionsByType('deliverability-fix').filter(action => 
					action.tags.includes('spam') || action.tags.includes('content')
				)
			);
		}

		if (score.riskLevel === 'critical' || score.riskLevel === 'high') {
			suggestions.push(
				...this.getActionsByType('provider-setup').filter(action => 
					action.tags.includes('reputation') || action.tags.includes('authentication')
				)
			);
		}

		return suggestions.slice(0, 5); // Limit to 5 suggestions
	}

	/**
	 * Get action suggestions from document intelligence
	 */
	getActionSuggestionsFromDocument(document: GeneratedDocument): ActionDefinition[] {
		const suggestions: ActionDefinition[] = [];

		// Suggest document-related actions (check if it's a report based on title or content)
		if (document.title.toLowerCase().includes('report') || document.title.toLowerCase().includes('analysis')) {
			suggestions.push(
				...this.getActionsByType('document-generation'),
				...this.getActionsByType('report-generate')
			);
		}

		// Suggest email actions for survey reports
		if (document.metadata.source === 'survey-email') {
			suggestions.push(
				...this.getActionsByType('email-send').filter(action =>
					action.tags.includes('followup') || action.tags.includes('survey')
				)
			);
		}

		// Suggest smart share for document sharing
		if (document.recommendations.length > 0) {
			suggestions.push(
				...this.getActionsByType('smart-share').filter(action =>
					action.tags.includes('document') || action.tags.includes('share')
				)
			);
		}

		return suggestions.slice(0, 5); // Limit to 5 suggestions
	}

	/**
	 * Get action statistics
	 */
	getActionStats(): {
		totalActions: number;
		executedActions: number;
		successRate: number;
		averageExecutionTime: number;
		mostExecutedType: ActionType;
	} {
		const completedExecutions = this.executionHistory.filter(ctx =>
			ctx.status === 'completed' || ctx.status === 'failed'
		);

		const successfulExecutions = completedExecutions.filter(ctx =>
			ctx.status === 'completed' && ctx.result?.success
		);

		const executionTimes = completedExecutions
			.filter(ctx => ctx.result?.executionTime)
			.map(ctx => ctx.result!.executionTime);

		const averageExecutionTime = executionTimes.length > 0
			? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
			: 0;

		// Find most executed action type
		const typeCounts: Record<ActionType, number> = {} as Record<ActionType, number>;
		for (const ctx of completedExecutions) {
			typeCounts[ctx.action.type] = (typeCounts[ctx.action.type] || 0) + 1;
		}

		let mostExecutedType: ActionType = 'provider-setup';
		let maxCount = 0;
		for (const [type, count] of Object.entries(typeCounts)) {
			if (count > maxCount) {
				maxCount = count;
				mostExecutedType = type as ActionType;
			}
		}

		return {
			totalActions: this.actions.size,
			executedActions: completedExecutions.length,
			successRate: completedExecutions.length > 0
				? (successfulExecutions.length / completedExecutions.length) * 100
				: 0,
			averageExecutionTime,
			mostExecutedType
		};
	}

	/**
	 * Get recommended actions for context
	 */
	getRecommendedActions(context: CopilotContext): ActionDefinition[] {
		const discoveredActions = this.discoverActions(context);
		
		// Filter by automation level (prefer semi-auto and full-auto)
		const automatedActions = discoveredActions.filter(action =>
			action.automationLevel !== 'manual'
		);

		// Sort by priority and estimated time
		const priorityOrder: Record<ActionPriority, number> = {
			'critical': 0,
			'high': 1,
			'medium': 2,
			'low': 3
		};

		return automatedActions.sort((a, b) => {
			// First by priority
			const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
			if (priorityDiff !== 0) return priorityDiff;
			
			// Then by estimated time (shorter first)
			return a.estimatedTime - b.estimatedTime;
		}).slice(0, 10); // Return top 10 recommendations
	}

	/**
	 * Create action from hint
	 */
	createActionFromHint(hint: Hint): ActionDefinition | null {
		// Map hint to appropriate action type
		let actionType: ActionType | null = null;
		const title = hint.text.substring(0, 50) + (hint.text.length > 50 ? '...' : '');
		const description = hint.text;

		switch (hint.category) {
			case 'provider-setup':
				actionType = 'provider-setup';
				break;
			case 'deliverability':
				actionType = 'deliverability-fix';
				break;
			case 'smart-share':
				actionType = 'smart-share';
				break;
			case 'reports':
				actionType = 'document-generation';
				break;
			case 'compose':
				actionType = 'email-send';
				break;
			case 'campaign':
				actionType = 'campaign-create';
				break;
			default:
				return null;
		}

		if (!actionType) return null;

		return {
			id: `hint-action-${hint.id}`,
			type: actionType,
			title,
			description,
			priority: hint.priority === 'critical' ? 'high' : (hint.priority === 'high' ? 'high' : 'medium'),
			requiredContext: {},
			execute: async () => {
				// Default execution for hint-based actions
				await new Promise(resolve => setTimeout(resolve, 1000));
				return {
					success: true,
					data: { hintId: hint.id, executed: true },
					executionTime: 1000,
					timestamp: new Date()
				};
			},
			estimatedTime: 2000,
			automationLevel: 'semi-auto',
			riskLevel: 'low',
			tags: ['hint', hint.category]
		};
	}
}

// Export singleton instance
export const actionEngine = new ActionEngine();