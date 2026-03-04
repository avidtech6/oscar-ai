/**
 * Workflow Prediction Engine (Phase 25)
 * 
 * Predicts what the user is likely to do next, what tasks should be created,
 * what documents need updating, and what workflows are incomplete.
 * 
 * Uses the Workflow Graph Engine and Project‑Level Reasoning Engine to infer
 * patterns and generate predictions.
 */

import type { WorkflowNode, WorkflowEdge, PredictedNextStep, WorkflowGap } from './WorkflowTypes';
import { WorkflowGraphEngine } from './WorkflowGraphEngine';
import { ProjectLevelReasoningEngine } from './ProjectLevelReasoningEngine';

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

	// ==================== Core Prediction ====================

	/**
	 * Predict next steps for a given context.
	 */
	predictNextSteps(context: PredictionContext): PredictedNextStep[] {
		const steps: PredictedNextStep[] = [];

		// 1. Predict based on recent activity
		if (context.recentActivity.length > 0) {
			const recentStep = this.predictFromRecentActivity(context.recentActivity);
			if (recentStep) steps.push(recentStep);
		}

		// 2. Predict based on project gaps
		if (context.projectId) {
			const projectSteps = this.predictFromProjectGaps(context.projectId);
			steps.push(...projectSteps);
		}

		// 3. Predict based on incomplete workflows
		const workflowSteps = this.predictFromIncompleteWorkflows();
		steps.push(...workflowSteps);

		// 4. Predict based on deadlines
		const deadlineSteps = this.predictFromDeadlines();
		steps.push(...deadlineSteps);

		// Deduplicate and sort by confidence
		return this.deduplicateAndSort(steps);
	}

	/**
	 * Predict a single step based on recent activity.
	 */
	private predictFromRecentActivity(recentActivity: string[]): PredictedNextStep | null {
		// For simplicity, pick the most recent node and suggest a logical follow‑up
		const lastNodeId = recentActivity[recentActivity.length - 1];
		const node = this.graph.getNode(lastNodeId);
		if (!node) return null;

		const now = new Date();

		// Example heuristics
		if (node.type === 'note') {
			// After creating a note, likely want to turn it into a task or report section
			return {
				id: `pred_recent_${Date.now()}_1`,
				description: `Create a task from note: ${node.label}`,
				confidence: 0.7,
				expectedEffort: 15,
				priority: 3,
				relatedNodeIds: [node.id],
				trigger: 'note created',
				predictedAt: now,
			};
		}

		if (node.type === 'task' && node.metadata.status !== 'completed') {
			return {
				id: `pred_recent_${Date.now()}_2`,
				description: `Complete task: ${node.label}`,
				confidence: 0.8,
				expectedEffort: node.metadata.estimatedDuration || 30,
				priority: node.metadata.priority || 3,
				relatedNodeIds: [node.id],
				trigger: 'task viewed',
				predictedAt: now,
			};
		}

		if (node.type === 'report' && node.metadata.status !== 'completed') {
			return {
				id: `pred_recent_${Date.now()}_3`,
				description: `Continue writing report: ${node.label}`,
				confidence: 0.6,
				expectedEffort: 45,
				priority: 2,
				relatedNodeIds: [node.id],
				trigger: 'report opened',
				predictedAt: now,
			};
		}

		return null;
	}

	/**
	 * Predict steps based on project gaps.
	 */
	private predictFromProjectGaps(projectId: string): PredictedNextStep[] {
		const gaps = this.projectReasoning.analyseProjectGaps(projectId);
		const steps: PredictedNextStep[] = [];
		const now = new Date();

		for (const gap of gaps) {
			let description = '';
			let confidence = 0.7;
			let effort = 30;
			let priority = gap.severity;

			switch (gap.type) {
				case 'missingTask':
					description = `Create a task for project`;
					confidence = 0.8;
					effort = 10;
					break;
				case 'incompleteSection':
					description = `Complete incomplete report section`;
					confidence = 0.9;
					effort = 60;
					break;
				case 'staleContent':
					description = `Update stale content`;
					confidence = 0.5;
					effort = 20;
					break;
				case 'deadlineApproaching':
					description = `Address approaching deadline`;
					confidence = 1.0;
					effort = 120;
					priority = 5;
					break;
				default:
					description = `Address ${gap.type}`;
			}

			steps.push({
				id: `pred_gap_${Date.now()}_${gap.id}`,
				description,
				confidence,
				expectedEffort: effort,
				priority,
				relatedNodeIds: gap.relatedNodeIds,
				trigger: 'gap detected',
				predictedAt: now,
			});
		}

		return steps;
	}

	/**
	 * Predict steps based on incomplete workflows (e.g., note → report missing link).
	 */
	private predictFromIncompleteWorkflows(): PredictedNextStep[] {
		const steps: PredictedNextStep[] = [];
		const now = new Date();

		// Find notes without linked reports
		const notes = this.graph.findNodesByType('note');
		for (const note of notes) {
			const outgoing = this.graph.getOutgoingEdges(note.id);
			const hasReportLink = outgoing.some(e => e.type === 'usedAsSource' || e.type === 'generatesReportSection');
			if (!hasReportLink) {
				steps.push({
					id: `pred_workflow_${Date.now()}_${note.id}`,
					description: `Link note "${note.label}" to a report`,
					confidence: 0.6,
					expectedEffort: 5,
					priority: 2,
					relatedNodeIds: [note.id],
					trigger: 'note without report',
					predictedAt: now,
				});
				break; // limit to one suggestion
			}
		}

		// Find tasks without linked documents
		const tasks = this.graph.findNodesByType('task');
		for (const task of tasks) {
			const outgoing = this.graph.getOutgoingEdges(task.id);
			const hasDocLink = outgoing.some(e => e.type === 'references');
			if (!hasDocLink && task.metadata.status === 'completed') {
				steps.push({
					id: `pred_workflow_${Date.now()}_${task.id}`,
					description: `Link completed task "${task.label}" to a document`,
					confidence: 0.7,
					expectedEffort: 5,
					priority: 2,
					relatedNodeIds: [task.id],
					trigger: 'task without document',
					predictedAt: now,
				});
				break;
			}
		}

		// Find reports without blog posts (if publishable)
		const reports = this.graph.findNodesByType('report');
		for (const report of reports) {
			const outgoing = this.graph.getOutgoingEdges(report.id);
			const hasBlogLink = outgoing.some(e => e.type === 'generatesBlogPost');
			if (!hasBlogLink && report.metadata.publishable === true) {
				steps.push({
					id: `pred_workflow_${Date.now()}_${report.id}`,
					description: `Generate blog post from report "${report.label}"`,
					confidence: 0.8,
					expectedEffort: 60,
					priority: 3,
					relatedNodeIds: [report.id],
					trigger: 'publishable report',
					predictedAt: now,
				});
				break;
			}
		}

		return steps;
	}

	/**
	 * Predict steps based on upcoming deadlines.
	 */
	private predictFromDeadlines(): PredictedNextStep[] {
		const steps: PredictedNextStep[] = [];
		const now = new Date();

		// Get all projects
		const projects = this.graph.findNodesByType('project');
		for (const project of projects) {
			const deadline = project.metadata.deadline;
			if (deadline) {
				const deadlineDate = new Date(deadline);
				const daysUntil = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
				if (daysUntil > 0 && daysUntil <= 7) {
					steps.push({
						id: `pred_deadline_${Date.now()}_${project.id}`,
						description: `Project "${project.label}" deadline in ${Math.ceil(daysUntil)} day(s)`,
						confidence: 1.0,
						expectedEffort: 180,
						priority: 5,
						relatedNodeIds: [project.id],
						trigger: 'deadline approaching',
						predictedAt: now,
					});
				}
			}
		}

		return steps;
	}

	// ==================== Utility ====================

	/**
	 * Deduplicate predictions (by description) and sort by priority then confidence.
	 */
	private deduplicateAndSort(steps: PredictedNextStep[]): PredictedNextStep[] {
		const seen = new Set<string>();
		const unique: PredictedNextStep[] = [];

		for (const step of steps) {
			const key = step.description;
			if (!seen.has(key)) {
				seen.add(key);
				unique.push(step);
			}
		}

		return unique.sort((a, b) => {
			if (a.priority !== b.priority) return b.priority - a.priority; // higher priority first
			return b.confidence - a.confidence;
		});
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
		const highPriority = predictions.filter(p => p.priority >= 4).length;
		const byCategory: Record<string, number> = {};

		// Simple categorization by trigger
		for (const p of predictions) {
			const cat = p.trigger;
			byCategory[cat] = (byCategory[cat] || 0) + 1;
		}

		return {
			totalPredictions: predictions.length,
			highPriority,
			byCategory,
			nextSuggestedStep: predictions.length > 0 ? predictions[0] : null,
		};
	}

	/**
	 * Generate a natural‑language explanation of the predictions.
	 */
	explainPredictions(context: PredictionContext): string {
		const predictions = this.predictNextSteps(context);
		if (predictions.length === 0) {
			return "No predictions at this time. Your workflow seems up‑to‑date.";
		}

		const lines = predictions.map((p, idx) => {
			return `${idx + 1}. ${p.description} (priority ${p.priority}, confidence ${Math.round(p.confidence * 100)}%)`;
		});

		return `I predict you should:\n${lines.join('\n')}`;
	}
}