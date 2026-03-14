/**
 * Workflow Prediction Sources (extracted from WorkflowPredictionEngine)
 * 
 * Contains the four core prediction source methods.
 */

import type { WorkflowGraphEngine } from './WorkflowGraphEngine';
import type { ProjectLevelReasoningEngine } from './ProjectLevelReasoningEngine';
import type { WorkflowNode, PredictedNextStep } from './WorkflowTypes';

export interface PredictionSourceStore {
	graph: WorkflowGraphEngine;
	projectReasoning: ProjectLevelReasoningEngine;
}

/**
 * Predict a single step based on recent activity.
 */
export function predictFromRecentActivity(
	store: PredictionSourceStore,
	recentActivity: string[]
): PredictedNextStep | null {
	// For simplicity, pick the most recent node and suggest a logical follow‑up
	const lastNodeId = recentActivity[recentActivity.length - 1];
	const node = store.graph.getNode(lastNodeId);
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
export function predictFromProjectGaps(
	store: PredictionSourceStore,
	projectId: string
): PredictedNextStep[] {
	const gaps = store.projectReasoning.analyseProjectGaps(projectId);
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
export function predictFromIncompleteWorkflows(
	store: PredictionSourceStore
): PredictedNextStep[] {
	const steps: PredictedNextStep[] = [];
	const now = new Date();

	// Find notes without linked reports
	const notes = store.graph.findNodesByType('note');
	for (const note of notes) {
		const outgoing = store.graph.getOutgoingEdges(note.id);
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
	const tasks = store.graph.findNodesByType('task');
	for (const task of tasks) {
		const outgoing = store.graph.getOutgoingEdges(task.id);
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
	const reports = store.graph.findNodesByType('report');
	for (const report of reports) {
		const outgoing = store.graph.getOutgoingEdges(report.id);
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
export function predictFromDeadlines(
	store: PredictionSourceStore
): PredictedNextStep[] {
	const steps: PredictedNextStep[] = [];
	const now = new Date();

	// Get all projects
	const projects = store.graph.findNodesByType('project');
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