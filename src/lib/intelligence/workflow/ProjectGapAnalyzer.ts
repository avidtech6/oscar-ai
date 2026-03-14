/**
 * Project Gap Analyzer (extracted from ProjectLevelReasoningEngine)
 * 
 * Analyses project gaps (missing tasks, incomplete reports, stale content, deadlines).
 */

import type { WorkflowGraphEngine } from './WorkflowGraphEngine';
import type { WorkflowNode, WorkflowGap } from './WorkflowTypes';
import { getProjectContext } from './ProjectContextManager';

export interface ProjectGapStore {
	graph: WorkflowGraphEngine;
}

/**
 * Analyse project gaps (missing tasks, incomplete reports, stale content).
 */
export function analyseProjectGaps(store: ProjectGapStore, projectEntityId: string): WorkflowGap[] {
	const context = getProjectContext(store, projectEntityId);
	if (!context) return [];

	const gaps: WorkflowGap[] = [];
	const now = new Date();

	// 1. Missing tasks (no task nodes linked)
	const taskNodes = context.nodeIds
		.map(id => store.graph.getNode(id))
		.filter((node): node is WorkflowNode => !!node && node.type === 'task');
	if (taskNodes.length === 0) {
		gaps.push({
			id: `gap_${Date.now()}_1`,
			type: 'missingTask',
			description: 'No tasks defined for this project.',
			severity: 3,
			suggestedAction: 'Create at least one task to track progress.',
			relatedNodeIds: [],
			detectedAt: now,
			resolved: false,
		});
	}

	// 2. Incomplete reports (report nodes with status not 'completed')
	const reportNodes = context.nodeIds
		.map(id => store.graph.getNode(id))
		.filter((node): node is WorkflowNode => !!node && node.type === 'report');
	for (const report of reportNodes) {
		if (report.metadata.status !== 'completed') {
			gaps.push({
				id: `gap_${Date.now()}_2`,
				type: 'incompleteSection',
				description: `Report "${report.label}" is incomplete.`,
				severity: 4,
				suggestedAction: `Finish writing the report or update its status.`,
				relatedNodeIds: [report.id],
				detectedAt: now,
				resolved: false,
			});
		}
	}

	// 3. Stale content (notes/media older than 30 days without updates)
	const staleThreshold = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
	const contentNodes = context.nodeIds
		.map(id => store.graph.getNode(id))
		.filter((node): node is WorkflowNode => !!node && (node.type === 'note' || node.type === 'media'));
	for (const node of contentNodes) {
		const age = now.getTime() - node.updatedAt.getTime();
		if (age > staleThreshold) {
			gaps.push({
				id: `gap_${Date.now()}_3`,
				type: 'staleContent',
				description: `${node.type} "${node.label}" hasn't been updated in over 30 days.`,
				severity: 2,
				suggestedAction: 'Review and update or archive.',
				relatedNodeIds: [node.id],
				detectedAt: now,
				resolved: false,
			});
		}
	}

	// 4. Deadline approaching (within 7 days)
	if (context.deadline) {
		const daysUntilDeadline = (context.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
		if (daysUntilDeadline > 0 && daysUntilDeadline <= 7) {
			gaps.push({
				id: `gap_${Date.now()}_4`,
				type: 'deadlineApproaching',
				description: `Project deadline is in ${Math.ceil(daysUntilDeadline)} day(s).`,
				severity: 5,
				suggestedAction: 'Prioritise remaining tasks and send reminders.',
				relatedNodeIds: [],
				detectedAt: now,
				resolved: false,
			});
		}
	}

	return gaps;
}