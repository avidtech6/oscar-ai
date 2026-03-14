/**
 * Project Next Step Predictor (extracted from ProjectLevelReasoningEngine)
 * 
 * Predicts next steps for a project based on incomplete tasks, notes, reports, and activity.
 */

import type { WorkflowGraphEngine } from './WorkflowGraphEngine';
import type { WorkflowNode, PredictedNextStep } from './WorkflowTypes';
import { getProjectContext } from './ProjectContextManager';

export interface ProjectPredictorStore {
	graph: WorkflowGraphEngine;
}

/**
 * Get the date of the most recent activity among a set of nodes.
 */
export function getLastActivityDate(store: ProjectPredictorStore, nodeIds: string[]): Date {
	let latest = new Date(0);
	for (const id of nodeIds) {
		const node = store.graph.getNode(id);
		if (node && node.updatedAt > latest) {
			latest = node.updatedAt;
		}
	}
	return latest;
}

/**
 * Predict next steps for a project.
 */
export function predictNextSteps(store: ProjectPredictorStore, projectEntityId: string): PredictedNextStep[] {
	const context = getProjectContext(store, projectEntityId);
	if (!context) return [];

	const steps: PredictedNextStep[] = [];
	const now = new Date();

	// 1. If there are incomplete tasks, suggest completing the highest priority one
	const taskNodes = context.nodeIds
		.map(id => store.graph.getNode(id))
		.filter((node): node is WorkflowNode => !!node && node.type === 'task' && node.metadata.status !== 'completed');
	if (taskNodes.length > 0) {
		const highestPriority = taskNodes.reduce((prev, curr) =>
			(curr.metadata.priority || 3) > (prev.metadata.priority || 3) ? curr : prev
		);
		steps.push({
			id: `pred_${Date.now()}_1`,
			description: `Complete task: ${highestPriority.label}`,
			confidence: 0.8,
			expectedEffort: highestPriority.metadata.estimatedDuration || 60,
			priority: highestPriority.metadata.priority || 3,
			relatedNodeIds: [highestPriority.id],
			trigger: 'user opens project',
			predictedAt: now,
		});
	}

	// 2. If there are notes without linked reports, suggest creating a report section
	const noteNodes = context.nodeIds
		.map(id => store.graph.getNode(id))
		.filter((node): node is WorkflowNode => !!node && node.type === 'note');
	for (const note of noteNodes) {
		const outgoing = store.graph.getOutgoingEdges(note.id);
		const hasReportLink = outgoing.some(edge => edge.type === 'usedAsSource' || edge.type === 'generatesReportSection');
		if (!hasReportLink) {
			steps.push({
				id: `pred_${Date.now()}_2`,
				description: `Create a report section from note: ${note.label}`,
				confidence: 0.6,
				expectedEffort: 30,
				priority: 2,
				relatedNodeIds: [note.id],
				trigger: 'note viewed',
				predictedAt: now,
			});
			break; // only suggest one
		}
	}

	// 3. If there are reports without blog posts, suggest generating a blog post
	const reportNodes = context.nodeIds
		.map(id => store.graph.getNode(id))
		.filter((node): node is WorkflowNode => !!node && node.type === 'report');
	for (const report of reportNodes) {
		const outgoing = store.graph.getOutgoingEdges(report.id);
		const hasBlogLink = outgoing.some(edge => edge.type === 'generatesBlogPost');
		if (!hasBlogLink && report.metadata.status === 'completed') {
			steps.push({
				id: `pred_${Date.now()}_3`,
				description: `Generate a blog post from report: ${report.label}`,
				confidence: 0.7,
				expectedEffort: 45,
				priority: 2,
				relatedNodeIds: [report.id],
				trigger: 'report published',
				predictedAt: now,
			});
			break;
		}
	}

	// 4. If project has no recent activity, suggest reviewing
	const lastActivity = getLastActivityDate(store, context.nodeIds);
	const daysInactive = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
	if (daysInactive > 14) {
		steps.push({
			id: `pred_${Date.now()}_4`,
			description: 'Review project progress and update plan',
			confidence: 0.9,
			expectedEffort: 20,
			priority: 1,
			relatedNodeIds: [],
			trigger: 'project opened',
			predictedAt: now,
		});
	}

	// Sort by priority (desc) and confidence (desc)
	return steps.sort((a, b) => {
		if (a.priority !== b.priority) return b.priority - a.priority;
		return b.confidence - a.confidence;
	});
}