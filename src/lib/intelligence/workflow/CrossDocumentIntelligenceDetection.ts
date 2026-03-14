/**
 * Detection logic for CrossDocumentIntelligenceEngine.
 */

import type { WorkflowGraphEngine } from './WorkflowGraphEngine';

export interface DetectionResult {
	should: boolean;
	confidence: number;
	reason: string;
}

/**
 * Detect whether a note should become a task.
 */
export function detectNoteShouldBecomeTask(
	graph: WorkflowGraphEngine,
	noteId: string
): DetectionResult {
	const note = graph.getNodeByEntityId(noteId);
	if (!note || note.type !== 'note') {
		return { should: false, confidence: 0, reason: 'Not a note' };
	}

	// Simple heuristic: if note contains action words and no linked task
	const content = note.metadata.content || '';
	const actionWords = ['need to', 'must', 'should', 'todo', 'task', 'do', 'finish', 'complete'];
	const hasAction = actionWords.some(word => content.toLowerCase().includes(word));
	const outgoing = graph.getOutgoingEdges(note.id);
	const alreadyHasTask = outgoing.some(e => e.type === 'generatesTask');

	if (hasAction && !alreadyHasTask) {
		return { should: true, confidence: 0.7, reason: 'Note contains action words and no linked task' };
	}

	return { should: false, confidence: 0.3, reason: 'No strong indicators' };
}

/**
 * Detect whether a task should become a report section.
 */
export function detectTaskShouldBecomeReportSection(
	graph: WorkflowGraphEngine,
	taskId: string
): DetectionResult {
	const task = graph.getNodeByEntityId(taskId);
	if (!task || task.type !== 'task') {
		return { should: false, confidence: 0, reason: 'Not a task' };
	}

	// Heuristic: if task is completed and has no linked report section
	const isCompleted = task.metadata.status === 'completed';
	const outgoing = graph.getOutgoingEdges(task.id);
	const alreadyHasReportSection = outgoing.some(e => e.type === 'generatesReportSection');

	if (isCompleted && !alreadyHasReportSection) {
		return { should: true, confidence: 0.8, reason: 'Completed task with no linked report section' };
	}

	return { should: false, confidence: 0.2, reason: 'Task not completed or already linked' };
}

/**
 * Detect whether a report should become a blog post.
 */
export function detectReportShouldBecomeBlogPost(
	graph: WorkflowGraphEngine,
	reportId: string
): DetectionResult {
	const report = graph.getNodeByEntityId(reportId);
	if (!report || report.type !== 'report') {
		return { should: false, confidence: 0, reason: 'Not a report' };
	}

	// Heuristic: if report is marked as "publishable" and has no linked blog post
	const isPublishable = report.metadata.publishable === true;
	const outgoing = graph.getOutgoingEdges(report.id);
	const alreadyHasBlogPost = outgoing.some(e => e.type === 'generatesBlogPost');

	if (isPublishable && !alreadyHasBlogPost) {
		return { should: true, confidence: 0.9, reason: 'Report is marked publishable with no linked blog post' };
	}

	return { should: false, confidence: 0.3, reason: 'Report not publishable or already linked' };
}