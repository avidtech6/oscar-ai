/**
 * Workflow Prediction Engine (Phase 25)
 * 
 * Predicts what the user is likely to do next, what tasks should be created,
 * what documents need updating, and what workflows are incomplete.
 * 
 * Uses the Workflow Graph Engine and Project‑Level Reasoning Engine to infer
 * patterns and generate predictions.
 * 
 * This is a thin wrapper delegating to extracted modules.
 */

import type { WorkflowNode, WorkflowEdge, PredictedNextStep, WorkflowGap } from './WorkflowTypes';
import { WorkflowGraphEngine } from './WorkflowGraphEngine';
import { ProjectLevelReasoningEngine } from './ProjectLevelReasoningEngine';
import * as PredictionSources from './WorkflowPredictionSources';
import * as PredictionUtils from './WorkflowPredictionUtils';

export interface PredictionContext {
	/** User ID (optional) */
	userId?: string;
	/** Current project ID (optional) */
	projectId?: string;
	/** Recent activity (node IDs) */
	recentActivity: string[];
	/** Current time */
	now: Date;
	/** User preferences (e.g., prefers tasks over reports) */
	preferences: Record<string, any>;
}

export class WorkflowPredictionEngine {
	private graph: WorkflowGraphEngine;
	private projectReasoning: ProjectLevelReasoningEngine;

	constructor(graph?: WorkflowGraphEngine, projectReasoning?: ProjectLevelReasoningEngine) {
		this.graph = graph ?? new WorkflowGraphEngine();
		this.projectReasoning = projectReasoning ?? new ProjectLevelReasoningEngine(this.graph);
	}

	private getStore(): PredictionSources.PredictionSourceStore {
		return { graph: this.graph, projectReasoning: this.projectReasoning };
	}

	// ==================== Core Prediction ====================

	/**
	 * Predict next steps for a given context.
	 */
	predictNextSteps(context: PredictionContext): PredictedNextStep[] {
		const steps: PredictedNextStep[] = [];

		// 1. Predict based on recent activity
		if (context.recentActivity.length > 0) {
			const recentStep = PredictionSources.predictFromRecentActivity(this.getStore(), context.recentActivity);
			if (recentStep) steps.push(recentStep);
		}

		// 2. Predict based on project gaps
		if (context.projectId) {
			const projectSteps = PredictionSources.predictFromProjectGaps(this.getStore(), context.projectId);
			steps.push(...projectSteps);
		}

		// 3. Predict based on incomplete workflows
		const workflowSteps = PredictionSources.predictFromIncompleteWorkflows(this.getStore());
		steps.push(...workflowSteps);

		// 4. Predict based on deadlines
		const deadlineSteps = PredictionSources.predictFromDeadlines(this.getStore());
		steps.push(...deadlineSteps);

		// Deduplicate and sort by confidence
		return PredictionUtils.deduplicateAndSort(steps);
	}

	// ==================== Public API ====================

	/**
	 * Get a summary of predictions for a given context.
	 */
	getPredictionSummary(context: PredictionContext): {
		totalPredictions: number;
		highPriority: number;
		byCategory: Record<string, number>;
		nextSuggestedStep: PredictedNextStep | null;
	} {
		const predictions = this.predictNextSteps(context);
		return PredictionUtils.getPredictionSummary(predictions);
	}

	/**
	 * Generate a natural‑language explanation of the predictions.
	 */
	explainPredictions(context: PredictionContext): string {
		const predictions = this.predictNextSteps(context);
		return PredictionUtils.explainPredictions(predictions);
	}
}