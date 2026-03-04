/**
 * Workflow‑Aware Chat Mode (Phase 25)
 * 
 * Chat that can apply answers to project workflow.
 * 
 * Features:
 * - Ask to apply answers to workflow (create task, update note, update report, generate section)
 * - Default apply action configurable
 * - Confirmation required before applying
 * - Timeout before auto‑decline
 */

import type { WorkflowAwareChatConfig } from './WorkflowTypes';
import { WorkflowGraphEngine } from './WorkflowGraphEngine';
import { ProjectLevelReasoningEngine } from './ProjectLevelReasoningEngine';
import { AutomaticTaskGenerationEngine } from './AutomaticTaskGenerationEngine';
import { CrossDocumentIntelligenceEngine } from './CrossDocumentIntelligenceEngine';

export interface ChatMessage {
	id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: Date;
	metadata?: Record<string, any>;
}

export interface ApplyAction {
	type: 'createTask' | 'updateNote' | 'updateReport' | 'generateSection' | 'none';
	targetNodeId?: string;
	parameters: Record<string, any>;
	confidence: number;
	description: string;
}

export class WorkflowAwareChatMode {
	private graph: WorkflowGraphEngine;
	private projectReasoning: ProjectLevelReasoningEngine;
	private taskGen: AutomaticTaskGenerationEngine;
	private crossDoc: CrossDocumentIntelligenceEngine;
	private config: WorkflowAwareChatConfig;
	private pendingApply: ApplyAction | null = null;
	private pendingTimeout: NodeJS.Timeout | null = null;

	constructor(
		graph?: WorkflowGraphEngine,
		projectReasoning?: ProjectLevelReasoningEngine,
		taskGen?: AutomaticTaskGenerationEngine,
		crossDoc?: CrossDocumentIntelligenceEngine,
		config?: Partial<WorkflowAwareChatConfig>
	) {
		this.graph = graph ?? new WorkflowGraphEngine();
		this.projectReasoning = projectReasoning ?? new ProjectLevelReasoningEngine(this.graph);
		this.taskGen = taskGen ?? new AutomaticTaskGenerationEngine(this.graph, crossDoc);
		this.crossDoc = crossDoc ?? new CrossDocumentIntelligenceEngine(this.graph, this.projectReasoning);
		this.config = {
			askToApply: true,
			defaultApplyAction: 'createTask',
			allowedApplyActions: ['createTask', 'updateNote', 'updateReport', 'generateSection'],
			confirmationRequired: true,
			timeout: 30, // seconds
			...config,
		};
	}

	// ==================== Core Chat Processing ====================

	/**
	 * Process a user message and generate a response with optional apply actions.
	 */
	processMessage(
		message: string,
		context?: { projectId?: string; activeNodeId?: string }
	): {
		response: string;
		applyActions: ApplyAction[];
		shouldAskToApply: boolean;
	} {
		const applyActions = this.detectApplyActions(message, context);
		const response = this.generateResponse(message, applyActions, context);

		const shouldAskToApply =
			this.config.askToApply &&
			applyActions.length > 0 &&
			applyActions.some(action => this.config.allowedApplyActions.includes(action.type));

		return { response, applyActions, shouldAskToApply };
	}

	private detectApplyActions(
		message: string,
		context?: { projectId?: string; activeNodeId?: string }
	): ApplyAction[] {
		const actions: ApplyAction[] = [];
		const lower = message.toLowerCase();

		// Detect task creation
		if (lower.includes('task') || lower.includes('todo') || lower.includes('need to') || lower.includes('should')) {
			actions.push({
				type: 'createTask',
				parameters: { title: this.extractTitle(message), description: message },
				confidence: 0.7,
				description: 'Create a task from this message',
			});
		}

		// Detect note update
		if (lower.includes('note') || lower.includes('write down') || lower.includes('remember')) {
			actions.push({
				type: 'updateNote',
				targetNodeId: context?.activeNodeId,
				parameters: { content: message },
				confidence: 0.6,
				description: 'Update or create a note',
			});
		}

		// Detect report update
		if (lower.includes('report') || lower.includes('section') || lower.includes('document')) {
			actions.push({
				type: 'updateReport',
				parameters: { content: message },
				confidence: 0.5,
				description: 'Update a report section',
			});
		}

		// Detect section generation
		if (lower.includes('generate') || lower.includes('create section') || lower.includes('add to')) {
			actions.push({
				type: 'generateSection',
				parameters: { content: message },
				confidence: 0.8,
				description: 'Generate a new section',
			});
		}

		// Filter by allowed actions
		return actions.filter(action => this.config.allowedApplyActions.includes(action.type));
	}

	private extractTitle(message: string): string {
		// Simple extraction: first 50 characters
		return message.substring(0, 50).trim() + (message.length > 50 ? '...' : '');
	}

	private generateResponse(
		message: string,
		applyActions: ApplyAction[],
		context?: { projectId?: string; activeNodeId?: string }
	): string {
		// Simple echo with detected actions
		if (applyActions.length === 0) {
			return `I understand: "${message}".`;
		}

		const actionDescriptions = applyActions.map(a => a.description).join(', ');
		return `I understand: "${message}". I can ${actionDescriptions}. Would you like me to apply any of these?`;
	}

	// ==================== Apply Action Flow ====================

	/**
	 * Propose an apply action to the user (start confirmation flow).
	 */
	proposeApplyAction(action: ApplyAction): void {
		this.pendingApply = action;
		this.startTimeout();
	}

	/**
	 * User confirms the pending apply action.
	 */
	confirmApplyAction(): boolean {
		if (!this.pendingApply) return false;

		const success = this.executeApplyAction(this.pendingApply);
		this.clearPending();
		return success;
	}

	/**
	 * User declines the pending apply action.
	 */
	declineApplyAction(): void {
		this.clearPending();
	}

	/**
	 * Execute an apply action (create/update nodes in the graph).
	 */
	private executeApplyAction(action: ApplyAction): boolean {
		try {
			switch (action.type) {
				case 'createTask': {
					// Create a task node
					const taskNode = this.graph.createNodeFromEntity(
						`task_${Date.now()}`,
						'task',
						action.parameters.title || 'New task',
						{
							description: action.parameters.description,
							priority: action.parameters.priority || 3,
							estimatedDuration: action.parameters.estimatedDuration || 60,
							status: 'pending',
						},
						['chat‑generated']
					);
					this.graph.addNode(taskNode);
					break;
				}
				case 'updateNote': {
					// Update an existing note or create a new one
					const noteId = action.targetNodeId || `note_${Date.now()}`;
					let noteNode = this.graph.getNodeByEntityId(noteId);
					if (noteNode) {
						this.graph.updateNodeMetadata(noteNode.id, {
							content: action.parameters.content,
							updatedAt: new Date(),
						});
					} else {
						noteNode = this.graph.createNodeFromEntity(
							noteId,
							'note',
							'Note from chat',
							{ content: action.parameters.content },
							['chat‑generated']
						);
						this.graph.addNode(noteNode);
					}
					break;
				}
				case 'updateReport': {
					// Placeholder: update report metadata
					console.log('Updating report with:', action.parameters);
					break;
				}
				case 'generateSection': {
					// Placeholder: generate a section
					console.log('Generating section with:', action.parameters);
					break;
				}
				default:
					return false;
			}
			return true;
		} catch (err) {
			console.error('Failed to execute apply action:', err);
			return false;
		}
	}

	// ==================== Timeout Management ====================

	private startTimeout(): void {
		if (this.config.timeout <= 0) return;
		this.clearTimeout();
		this.pendingTimeout = setTimeout(() => {
			this.declineApplyAction();
		}, this.config.timeout * 1000);
	}

	private clearTimeout(): void {
		if (this.pendingTimeout) {
			clearTimeout(this.pendingTimeout);
			this.pendingTimeout = null;
		}
	}

	private clearPending(): void {
		this.pendingApply = null;
		this.clearTimeout();
	}

	// ==================== Configuration ====================

	/**
	 * Update configuration.
	 */
	updateConfig(config: Partial<WorkflowAwareChatConfig>): void {
		this.config = { ...this.config, ...config };
	}

	/**
	 * Get current configuration.
	 */
	getConfig(): WorkflowAwareChatConfig {
		return { ...this.config };
	}

	// ==================== Integration ====================

	/**
	 * Set the active project for context.
	 */
	setActiveProject(projectId: string): void {
		// Could store for later use
	}

	/**
	 * Set the active node (note, report, task) for context.
	 */
	setActiveNode(nodeId: string): void {
		// Could store for later use
	}

	// ==================== Statistics ====================

	/**
	 * Get statistics about chat usage.
	 */
	getStatistics(): {
		totalMessages: number;
		totalApplyActions: number;
		confirmedActions: number;
		declinedActions: number;
		timedOutActions: number;
	} {
		// Placeholder
		return {
			totalMessages: 0,
			totalApplyActions: 0,
			confirmedActions: 0,
			declinedActions: 0,
			timedOutActions: 0,
		};
	}
}