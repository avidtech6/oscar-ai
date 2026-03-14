/**
 * Analysis logic for CrossDocumentIntelligenceEngine.
 */

import type { WorkflowNode, WorkflowEdge, WorkflowNodeType } from './WorkflowTypes';
import type { WorkflowGraphEngine } from './WorkflowGraphEngine';
import type { ProjectLevelReasoningEngine } from './ProjectLevelReasoningEngine';
import type { CrossDocumentAnalysis } from './CrossDocumentAnalysisTypes';
import {
	detectNoteShouldBecomeTask,
	detectTaskShouldBecomeReportSection,
	detectReportShouldBecomeBlogPost,
} from './CrossDocumentIntelligenceDetection';

/**
 * Analyse cross‑document relationships across the whole graph or within a project.
 */
export function analyseCrossDocumentRelationships(
	graph: WorkflowGraphEngine,
	projectReasoning: ProjectLevelReasoningEngine,
	projectId?: string
): CrossDocumentAnalysis {
	const analysisId = `crossdoc_analysis_${Date.now()}`;
	const timestamp = new Date();

	// Get relevant nodes
	const allNodes = Array.from((graph as any).nodes.values()) as WorkflowNode[]; // internal access, but we can add a public getter later
	let projectNodes: WorkflowNode[] = allNodes;
	if (projectId) {
		const context = projectReasoning.getProjectContext(projectId);
		if (context) {
			projectNodes = context.nodeIds
				.map((id: string) => graph.getNode(id))
				.filter((node): node is WorkflowNode => !!node) as WorkflowNode[];
		} else {
			projectNodes = [];
		}
	}

	const noteToReportLinks: CrossDocumentAnalysis['noteToReportLinks'] = [];
	const reportToBlogPostLinks: CrossDocumentAnalysis['reportToBlogPostLinks'] = [];
	const taskToDocumentLinks: CrossDocumentAnalysis['taskToDocumentLinks'] = [];
	const notesThatShouldBeTasks: CrossDocumentAnalysis['notesThatShouldBeTasks'] = [];
	const tasksThatShouldBeReportSections: CrossDocumentAnalysis['tasksThatShouldBeReportSections'] = [];
	const reportsThatShouldBeBlogPosts: CrossDocumentAnalysis['reportsThatShouldBeBlogPosts'] = [];
	const missingLinks: CrossDocumentAnalysis['missingLinks'] = [];

	for (const node of projectNodes) {
		// Detect note → task
		if (node.type === 'note') {
			const detection = detectNoteShouldBecomeTask(graph, node.entityId);
			if (detection.should) {
				notesThatShouldBeTasks.push({
					noteId: node.entityId,
					confidence: detection.confidence,
					reason: detection.reason,
					suggestedTaskTitle: `Task from note: ${node.label}`,
				});
			}
		}

		// Detect task → report section
		if (node.type === 'task') {
			const detection = detectTaskShouldBecomeReportSection(graph, node.entityId);
			if (detection.should) {
				tasksThatShouldBeReportSections.push({
					taskId: node.entityId,
					confidence: detection.confidence,
					reason: detection.reason,
					suggestedSectionTitle: `Section from task: ${node.label}`,
				});
			}
		}

		// Detect report → blog post
		if (node.type === 'report') {
			const detection = detectReportShouldBecomeBlogPost(graph, node.entityId);
			if (detection.should) {
				reportsThatShouldBeBlogPosts.push({
					reportId: node.entityId,
					confidence: detection.confidence,
					reason: detection.reason,
					suggestedBlogPostTitle: `Blog post: ${node.label}`,
				});
			}
		}
	}

	// Collect existing edges of interest
	const edges = Array.from((graph as any).edges.values()) as WorkflowEdge[];
	for (const edge of edges) {
		const source = graph.getNode(edge.sourceId);
		const target = graph.getNode(edge.targetId);
		if (!source || !target) continue;

		if (source.type === 'note' && target.type === 'report' && edge.type === 'usedAsSource') {
			noteToReportLinks.push({
				noteId: source.entityId,
				reportId: target.entityId,
				confidence: edge.weight,
				evidence: edge.evidence,
			});
		}
		if (source.type === 'report' && target.type === 'blogPost' && edge.type === 'generatesBlogPost') {
			reportToBlogPostLinks.push({
				reportId: source.entityId,
				blogPostId: target.entityId,
				confidence: edge.weight,
				evidence: edge.evidence,
			});
		}
		if (source.type === 'task' && target.type === 'report' && edge.type === 'references') {
			taskToDocumentLinks.push({
				taskId: source.entityId,
				documentId: target.entityId,
				confidence: edge.weight,
				evidence: edge.evidence,
			});
		}
	}

	// Identify missing links (simple heuristic: note without linked report, report without linked blog post)
	for (const node of projectNodes) {
		if (node.type === 'note') {
			const outgoing = graph.getOutgoingEdges(node.id);
			const hasReportLink = outgoing.some((e: WorkflowEdge) => e.type === 'usedAsSource');
			if (!hasReportLink) {
				missingLinks.push({
					sourceId: node.entityId,
					sourceType: 'note' as WorkflowNodeType,
					targetType: 'report' as WorkflowNodeType,
					reason: 'Note not linked to any report',
					severity: 2,
				});
			}
		}
		if (node.type === 'report') {
			const outgoing = graph.getOutgoingEdges(node.id);
			const hasBlogPostLink = outgoing.some((e: WorkflowEdge) => e.type === 'generatesBlogPost');
			if (!hasBlogPostLink && node.metadata.publishable) {
				missingLinks.push({
					sourceId: node.entityId,
					sourceType: 'report' as WorkflowNodeType,
					targetType: 'blogPost' as WorkflowNodeType,
					reason: 'Publishable report not linked to blog post',
					severity: 3,
				});
			}
		}
	}

	return {
		id: analysisId,
		timestamp,
		projectId,
		noteToReportLinks,
		reportToBlogPostLinks,
		taskToDocumentLinks,
		notesThatShouldBeTasks,
		tasksThatShouldBeReportSections,
		reportsThatShouldBeBlogPosts,
		missingLinks,
	};
}