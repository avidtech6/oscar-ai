/**
 * Project Question Answerer (extracted from ProjectLevelReasoningEngine)
 * 
 * Answers natural‑language questions about a project and generates summaries.
 */

import type { WorkflowGraphEngine } from './WorkflowGraphEngine';
import type { WorkflowNode } from './WorkflowTypes';
import { getProjectContext } from './ProjectContextManager';
import { analyseProjectGaps } from './ProjectGapAnalyzer';
import { predictNextSteps } from './ProjectNextStepPredictor';

export interface ProjectQaStore {
	graph: WorkflowGraphEngine;
}

/**
 * Answer a natural‑language question about the project.
 */
export function answerQuestion(store: ProjectQaStore, projectEntityId: string, question: string): string {
	const context = getProjectContext(store, projectEntityId);
	if (!context) return "I couldn't find that project.";

	const q = question.toLowerCase();
	if (q.includes('what') && q.includes('next')) {
		const steps = predictNextSteps(store, projectEntityId);
		if (steps.length === 0) return "No next steps predicted. The project seems up‑to‑date.";
		return `Next steps:\n${steps.map(s => `• ${s.description} (priority ${s.priority})`).join('\n')}`;
	}

	if (q.includes('gap') || q.includes('missing') || q.includes('incomplete')) {
		const gaps = analyseProjectGaps(store, projectEntityId);
		if (gaps.length === 0) return "No significant gaps detected.";
		return `Gaps detected:\n${gaps.map(g => `• ${g.description} (severity ${g.severity})`).join('\n')}`;
	}

	if (q.includes('status')) {
		return `Project "${context.name}" is ${context.status}. Priority ${context.priority}. ${context.deadline ? `Deadline: ${context.deadline.toLocaleDateString()}` : 'No deadline set.'}`;
	}

	if (q.includes('task') || q.includes('todo')) {
		const taskNodes = context.nodeIds
			.map(id => store.graph.getNode(id))
			.filter((node): node is WorkflowNode => !!node && node.type === 'task');
		const incomplete = taskNodes.filter(t => t.metadata.status !== 'completed');
		if (incomplete.length === 0) return "No pending tasks.";
		return `Pending tasks:\n${incomplete.map(t => `• ${t.label} (priority ${t.metadata.priority || 3})`).join('\n')}`;
	}

	if (q.includes('report')) {
		const reportNodes = context.nodeIds
			.map(id => store.graph.getNode(id))
			.filter((node): node is WorkflowNode => !!node && node.type === 'report');
		const incomplete = reportNodes.filter(r => r.metadata.status !== 'completed');
		if (incomplete.length === 0) return "All reports are complete.";
		return `Incomplete reports:\n${incomplete.map(r => `• ${r.label}`).join('\n')}`;
	}

	// Default answer
	return `Project "${context.name}" has ${context.nodeIds.length} linked items, status is ${context.status}. Use more specific questions about tasks, reports, gaps, or next steps.`;
}

/**
 * Generate a summary of the project.
 */
export function generateSummary(store: ProjectQaStore, projectEntityId: string): string {
	const context = getProjectContext(store, projectEntityId);
	if (!context) return 'Project not found.';

	const tasks = context.nodeIds
		.map(id => store.graph.getNode(id))
		.filter((node): node is WorkflowNode => !!node && node.type === 'task');
	const reports = context.nodeIds
		.map(id => store.graph.getNode(id))
		.filter((node): node is WorkflowNode => !!node && node.type === 'report');
	const notes = context.nodeIds
		.map(id => store.graph.getNode(id))
		.filter((node): node is WorkflowNode => !!node && node.type === 'note');
	const media = context.nodeIds
		.map(id => store.graph.getNode(id))
		.filter((node): node is WorkflowNode => !!node && node.type === 'media');

	const completedTasks = tasks.filter(t => t.metadata.status === 'completed').length;
	const completedReports = reports.filter(r => r.metadata.status === 'completed').length;

	return `
Project: ${context.name}
Status: ${context.status}
Priority: ${context.priority}
Deadline: ${context.deadline ? context.deadline.toLocaleDateString() : 'None'}
Linked items: ${tasks.length} tasks, ${reports.length} reports, ${notes.length} notes, ${media.length} media
Progress: ${completedTasks}/${tasks.length} tasks completed, ${completedReports}/${reports.length} reports completed
Last updated: ${context.updatedAt.toLocaleDateString()}
	`.trim();
}