/**
 * Workflow Context Suggestion Sources (extracted from WorkflowAwareContextMode)
 * 
 * Contains suggestion generation for projects, notes, tasks, media, reports.
 */

import type { WorkflowGraphEngine } from './WorkflowGraphEngine';
import type { ProjectLevelReasoningEngine } from './ProjectLevelReasoningEngine';
import type { WorkflowNode, ContextSuggestion } from './WorkflowTypes';

export interface SuggestionSourceStore {
	graph: WorkflowGraphEngine;
	projectReasoning: ProjectLevelReasoningEngine;
}

export function getProjectSuggestions(
	store: SuggestionSourceStore,
	projectId: string
): ContextSuggestion[] {
	const context = store.projectReasoning.getProjectContext(projectId);
	if (!context) return [];

	const suggestions: ContextSuggestion[] = [];

	// Suggest completing the project if many pending tasks
	const pendingTasks = context.nodeIds
		.map(id => store.graph.getNode(id))
		.filter((node): node is WorkflowNode => !!node && node.type === 'task' && node.metadata.status !== 'completed');
	if (pendingTasks.length > 0) {
		suggestions.push({
			id: `project_${projectId}_complete`,
			type: 'project',
			nodeId: projectId,
			title: `Complete project: ${context.name}`,
			description: `${pendingTasks.length} pending tasks. Consider marking as completed.`,
			relevanceScore: 0.8,
			action: 'complete',
			metadata: { pendingTasks: pendingTasks.length },
		});
	}

	// Suggest linking missing nodes
	const missingLinks = store.projectReasoning.analyseProjectGaps(projectId);
	if (missingLinks.length > 0) {
		suggestions.push({
			id: `project_${projectId}_gaps`,
			type: 'project',
			nodeId: projectId,
			title: `Fill gaps in project: ${context.name}`,
			description: `${missingLinks.length} gaps detected (e.g., missing notes, incomplete sections).`,
			relevanceScore: 0.7,
			action: 'link',
			metadata: { gaps: missingLinks.length },
		});
	}

	return suggestions;
}

export function getNoteSuggestions(
	store: SuggestionSourceStore,
	projectId?: string
): ContextSuggestion[] {
	const notes = store.graph.findNodesByType('note');
	const suggestions: ContextSuggestion[] = [];

	for (const note of notes) {
		// Filter by project if needed
		if (projectId) {
			const context = store.projectReasoning.getProjectContext(projectId);
			if (!context?.nodeIds.includes(note.id)) continue;
		}

		// Suggest if note is old and not linked
		const age = Date.now() - note.createdAt.getTime();
		const daysOld = age / (1000 * 60 * 60 * 24);
		const outgoing = store.graph.getOutgoingEdges(note.id);
		const hasLinks = outgoing.length > 0;

		if (daysOld > 7 && !hasLinks) {
			suggestions.push({
				id: `note_${note.id}_unlinked`,
				type: 'note',
				nodeId: note.id,
				title: `Unlinked note: ${note.label}`,
				description: 'This note has not been linked to any report or task for over a week.',
				relevanceScore: 0.6,
				action: 'link',
				metadata: { daysOld: Math.floor(daysOld) },
			});
		}
	}

	return suggestions;
}

export function getTaskSuggestions(
	store: SuggestionSourceStore,
	projectId?: string
): ContextSuggestion[] {
	const tasks = store.graph.findNodesByType('task');
	const suggestions: ContextSuggestion[] = [];

	for (const task of tasks) {
		if (projectId) {
			const context = store.projectReasoning.getProjectContext(projectId);
			if (!context?.nodeIds.includes(task.id)) continue;
		}

		const status = task.metadata.status;
		if (status === 'pending') {
			const deadline = task.metadata.deadline;
			if (deadline) {
				const dueIn = new Date(deadline).getTime() - Date.now();
				const daysDue = dueIn / (1000 * 60 * 60 * 24);
				if (daysDue < 2) {
					suggestions.push({
						id: `task_${task.id}_deadline`,
						type: 'task',
						nodeId: task.id,
						title: `Upcoming deadline: ${task.label}`,
						description: `Due in ${Math.ceil(daysDue * 24)} hours.`,
						relevanceScore: 0.9,
						action: 'complete',
						metadata: { dueInHours: Math.ceil(daysDue * 24) },
					});
				}
			}
		}
	}

	return suggestions;
}

export function getMediaSuggestions(
	store: SuggestionSourceStore,
	projectId?: string
): ContextSuggestion[] {
	const media = store.graph.findNodesByType('media');
	const suggestions: ContextSuggestion[] = [];

	for (const item of media) {
		if (projectId) {
			const context = store.projectReasoning.getProjectContext(projectId);
			if (!context?.nodeIds.includes(item.id)) continue;
		}

		// Suggest if media is not linked to any note/report
		const outgoing = store.graph.getOutgoingEdges(item.id);
		const hasLinks = outgoing.length > 0;
		if (!hasLinks) {
			suggestions.push({
				id: `media_${item.id}_unlinked`,
				type: 'media',
				nodeId: item.id,
				title: `Unlinked media: ${item.label}`,
				description: 'This media item is not linked to any note or report.',
				relevanceScore: 0.5,
				action: 'link',
				metadata: {},
			});
		}
	}

	return suggestions;
}

export function getReportSuggestions(
	store: SuggestionSourceStore,
	projectId?: string
): ContextSuggestion[] {
	const reports = store.graph.findNodesByType('report');
	const suggestions: ContextSuggestion[] = [];

	for (const report of reports) {
		if (projectId) {
			const context = store.projectReasoning.getProjectContext(projectId);
			if (!context?.nodeIds.includes(report.id)) continue;
		}

		const status = report.metadata.status;
		if (status === 'draft' || status === 'inProgress') {
			suggestions.push({
				id: `report_${report.id}_incomplete`,
				type: 'report',
				nodeId: report.id,
				title: `Incomplete report: ${report.label}`,
				description: 'This report is still in draft or in‑progress.',
				relevanceScore: 0.7,
				action: 'edit',
				metadata: { status },
			});
		}
	}

	return suggestions;
}