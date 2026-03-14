/**
 * Linking and suggestion functions for CrossDocumentIntelligenceEngine.
 */

import type { WorkflowEdgeType } from './WorkflowTypes';
import type { WorkflowGraphEngine } from './WorkflowGraphEngine';

/**
 * Link a note to a report (note used as source material).
 */
export function linkNoteToReport(
	graph: WorkflowGraphEngine,
	noteId: string,
	reportId: string,
	evidence: string[] = []
): void {
	graph.linkEntities(
		noteId,
		'note',
		`Note ${noteId}`,
		reportId,
		'report',
		`Report ${reportId}`,
		'usedAsSource',
		evidence
	);
}

/**
 * Link a report to a blog post (report generates blog post).
 */
export function linkReportToBlogPost(
	graph: WorkflowGraphEngine,
	reportId: string,
	blogPostId: string,
	evidence: string[] = []
): void {
	graph.linkEntities(
		reportId,
		'report',
		`Report ${reportId}`,
		blogPostId,
		'blogPost',
		`Blog post ${blogPostId}`,
		'generatesBlogPost',
		evidence
	);
}

/**
 * Link a task to a document (task references document).
 */
export function linkTaskToDocument(
	graph: WorkflowGraphEngine,
	taskId: string,
	documentId: string,
	evidence: string[] = []
): void {
	graph.linkEntities(
		taskId,
		'task',
		`Task ${taskId}`,
		documentId,
		'report', // assuming document is a report; could be note, blogPost, etc.
		`Document ${documentId}`,
		'references',
		evidence
	);
}

/**
 * Suggest possible links for a given node.
 */
export function suggestLinksForNode(
	graph: WorkflowGraphEngine,
	nodeId: string
): Array<{ targetNodeId: string; edgeType: WorkflowEdgeType; confidence: number }> {
	const node = graph.getNode(nodeId);
	if (!node) return [];

	const suggestions: Array<{ targetNodeId: string; edgeType: WorkflowEdgeType; confidence: number }> = [];

	// If node is a note, suggest linking to all reports
	if (node.type === 'note') {
		const reports = graph.findNodesByType('report');
		for (const report of reports) {
			suggestions.push({
				targetNodeId: report.id,
				edgeType: 'usedAsSource',
				confidence: 0.6,
			});
		}
	}

	// If node is a report, suggest linking to blog posts
	if (node.type === 'report') {
		const blogPosts = graph.findNodesByType('blogPost');
		for (const blogPost of blogPosts) {
			suggestions.push({
				targetNodeId: blogPost.id,
				edgeType: 'generatesBlogPost',
				confidence: 0.5,
			});
		}
	}

	// If node is a task, suggest linking to reports
	if (node.type === 'task') {
		const reports = graph.findNodesByType('report');
		for (const report of reports) {
			suggestions.push({
				targetNodeId: report.id,
				edgeType: 'references',
				confidence: 0.4,
			});
		}
	}

	return suggestions;
}

/**
 * Apply suggested links (auto‑link based on high confidence).
 */
export function applySuggestedLinks(
	graph: WorkflowGraphEngine,
	confidenceThreshold = 0.8
): number {
	const allNodes = Array.from((graph as any).nodes.values()) as any[];
	let applied = 0;

	for (const node of allNodes) {
		const suggestions = suggestLinksForNode(graph, node.id);
		for (const suggestion of suggestions) {
			if (suggestion.confidence >= confidenceThreshold) {
				graph.linkEntities(
					node.entityId,
					node.type,
					node.label,
					suggestion.targetNodeId,
					graph.getNode(suggestion.targetNodeId)?.type ?? 'unknown',
					graph.getNode(suggestion.targetNodeId)?.label ?? '',
					suggestion.edgeType,
					['auto‑detected by CrossDocumentIntelligenceEngine']
				);
				applied++;
			}
		}
	}

	return applied;
}