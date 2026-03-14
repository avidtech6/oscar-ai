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
import { detectApplyActions, extractTitle, generateResponse } from './WorkflowChatDetection';
import { executeApplyAction } from './WorkflowChatActionExecutor';
import { WorkflowChatTimeoutManager } from './WorkflowChatTimeoutManager';

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
	private timeoutManager: WorkflowChatTimeoutManager;

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
		this.timeoutManager = new WorkflowChatTimeoutManager(this.config.timeout);
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
		const applyActions = detectApplyActions(message, this.config.allowedApplyActions, context);
		const response = generateResponse(message, applyActions, context);

		const shouldAskToApply =
			this.config.askToApply &&
			applyActions.length > 0 &&
			applyActions.some(action => this.config.allowedApplyActions.includes(action.type));

		return { response, applyActions, shouldAskToApply };
	}

	// ==================== Apply Action Flow ====================

	/**
	 * Propose an apply action to the user (start confirmation flow).
	 */
	proposeApplyAction(action: ApplyAction): void {
		this.pendingApply = action;
		this.timeoutManager.startTimeout(() => this.declineApplyAction());
	}

	/**
	 * User confirms the pending apply action.
	 */
	confirmApplyAction(): boolean {
		if (!this.pendingApply) return false;

		const success = executeApplyAction(this.pendingApply, this.graph);
		this.clearPending();
		return success;
	}

	/**
	 * User declines the pending apply action.
	 */
	declineApplyAction(): void {
		this.clearPending();
	}

	// ==================== Timeout Management ====================

	private clearPending(): void {
		this.pendingApply = null;
		this.timeoutManager.clearTimeout();
	}

	// ==================== Configuration ====================

	/**
	 * Update configuration.
	 */
	updateConfig(config: Partial<WorkflowAwareChatConfig>): void {
		this.config = { ...this.config, ...config };
		if (config.timeout !== undefined) {
			this.timeoutManager.updateTimeout(config.timeout);
		}
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