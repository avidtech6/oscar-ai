/**
 * Cross‑Document Intelligence Engine (Phase 25)
 * 
 * Links notes to reports, reports to blog posts, tasks to documents.
 * Detects when a note should become a task, a task should become a report section,
 * a report should become a blog post, etc.
 * 
 * Uses the Workflow Graph Engine and Project‑Level Reasoning Engine to infer relationships.
 */

import type { WorkflowNode, WorkflowEdge, WorkflowEdgeType, WorkflowNodeType } from './WorkflowTypes';
import { WorkflowGraphEngine } from './WorkflowGraphEngine';
import { ProjectLevelReasoningEngine } from './ProjectLevelReasoningEngine';

export interface CrossDocumentAnalysis {
	/** Analysis ID */
	id: string;
	/** Timestamp */
	timestamp: Date;
	/** Project ID (optional) */
	projectId?: string;
	/** Detected note‑to‑report links */
	noteToReportLinks: Array<{
		noteId: string;
		reportId: string;
		confidence: number;
		evidence: string[];
	}>;
	/** Detected report‑to‑blog‑post links */
	reportToBlogPostLinks: Array<{
		reportId: string;
		blogPostId: string;
		confidence: number;
		evidence: string[];
	}>;
	/** Detected task‑to‑document links */
	taskToDocumentLinks: Array<{
		taskId: string;
		documentId: string;
		confidence: number;
		evidence: string[];
	}>;
	/** Notes that should become tasks */
	notesThatShouldBeTasks: Array<{
		noteId: string;
		confidence: number;
		reason: string;
		suggestedTaskTitle: string;
	}>;
	/** Tasks that should become report sections */
	tasksThatShouldBeReportSections: Array<{
		taskId: string;
		confidence: number;
		reason: string;
		suggestedSectionTitle: string;
	}>;
	/** Reports that should become blog posts */
	reportsThatShouldBeBlogPosts: Array<{
		reportId: string;
		confidence: number;
		reason: string;
		suggestedBlogPostTitle: string;
	}>;
	/** Missing links (gaps) */
	missingLinks: Array<{
		sourceId: string;
		sourceType: WorkflowNodeType;
		targetType: WorkflowNodeType;
		reason: string;
		severity: number;
	}>;
}

export class CrossDocumentIntelligenceEngine {
	private graph: WorkflowGraphEngine;
	private projectReasoning: ProjectLevelReasoningEngine;

	constructor(graph?: WorkflowGraphEngine, projectReasoning?: ProjectLevelReasoningEngine) {
		this.graph = graph ?? new WorkflowGraphEngine();
		this.projectReasoning = projectReasoning ?? new ProjectLevelReasoningEngine(this.graph);
	}

	// ==================== Explicit Linking ====================

	/**
	 * Link a note to a report (note used as source material).
	 */
	linkNoteToReport(noteId: string, reportId: string, evidence: string[] = []): void {
		this.graph.linkEntities(
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
	linkReportToBlogPost(reportId: string, blogPostId: string, evidence: string[] = []): void {
		this.graph.linkEntities(
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
	linkTaskToDocument(taskId: string, documentId: string, evidence: string[] = []): void {
		this.graph.linkEntities(
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

	// ==================== Detection ====================

	/**
	 * Detect whether a note should become a task.
	 */
	detectNoteShouldBecomeTask(noteId: string): { should: boolean; confidence: number; reason: string } {
		const note = this.graph.getNodeByEntityId(noteId);
		if (!note || note.type !== 'note') {
			return { should: false, confidence: 0, reason: 'Not a note' };
		}

		// Simple heuristic: if note contains action words and no linked task
		const content = note.metadata.content || '';
		const actionWords = ['need to', 'must', 'should', 'todo', 'task', 'do', 'finish', 'complete'];
		const hasAction = actionWords.some(word => content.toLowerCase().includes(word));
		const outgoing = this.graph.getOutgoingEdges(note.id);
		const alreadyHasTask = outgoing.some(e => e.type === 'generatesTask');

		if (hasAction && !alreadyHasTask) {
			return { should: true, confidence: 0.7, reason: 'Note contains action words and no linked task' };
		}

		return { should: false, confidence: 0.3, reason: 'No strong indicators' };
	}

	/**
	 * Detect whether a task should become a report section.
	 */
	detectTaskShouldBecomeReportSection(taskId: string): { should: boolean; confidence: number; reason: string } {
		const task = this.graph.getNodeByEntityId(taskId);
		if (!task || task.type !== 'task') {
			return { should: false, confidence: 0, reason: 'Not a task' };
		}

		// Heuristic: if task is completed and has no linked report section
		const isCompleted = task.metadata.status === 'completed';
		const outgoing = this.graph.getOutgoingEdges(task.id);
		const alreadyHasReportSection = outgoing.some(e => e.type === 'generatesReportSection');

		if (isCompleted && !alreadyHasReportSection) {
			return { should: true, confidence: 0.8, reason: 'Completed task with no linked report section' };
		}

		return { should: false, confidence: 0.2, reason: 'Task not completed or already linked' };
	}

	/**
	 * Detect whether a report should become a blog post.
	 */
	detectReportShouldBecomeBlogPost(reportId: string): { should: boolean; confidence: number; reason: string } {
		const report = this.graph.getNodeByEntityId(reportId);
		if (!report || report.type !== 'report') {
			return { should: false, confidence: 0, reason: 'Not a report' };
		}

		// Heuristic: if report is marked as "publishable" and has no linked blog post
		const isPublishable = report.metadata.publishable === true;
		const outgoing = this.graph.getOutgoingEdges(report.id);
		const alreadyHasBlogPost = outgoing.some(e => e.type === 'generatesBlogPost');

		if (isPublishable && !alreadyHasBlogPost) {
			return { should: true, confidence: 0.9, reason: 'Report is marked publishable with no linked blog post' };
		}

		return { should: false, confidence: 0.3, reason: 'Report not publishable or already linked' };
	}

	// ==================== Suggestion ====================

	/**
	 * Suggest possible links for a given node.
	 */
	suggestLinksForNode(nodeId: string): Array<{ targetNodeId: string; edgeType: WorkflowEdgeType; confidence: number }> {
		const node = this.graph.getNode(nodeId);
		if (!node) return [];

		const suggestions: Array<{ targetNodeId: string; edgeType: WorkflowEdgeType; confidence: number }> = [];

		// If node is a note, suggest linking to all reports
		if (node.type === 'note') {
			const reports = this.graph.findNodesByType('report');
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
			const blogPosts = this.graph.findNodesByType('blogPost');
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
			const reports = this.graph.findNodesByType('report');
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

	// ==================== Analysis ====================

	/**
	 * Analyse cross‑document relationships across the whole graph or within a project.
	 */
	analyseCrossDocumentRelationships(projectId?: string): CrossDocumentAnalysis {
		const analysisId = `crossdoc_analysis_${Date.now()}`;
		const timestamp = new Date();

		// Get relevant nodes
		const allNodes = Array.from((this.graph as any).nodes.values()) as WorkflowNode[]; // internal access, but we can add a public getter later
		let projectNodes: WorkflowNode[] = allNodes;
		if (projectId) {
			const context = this.projectReasoning.getProjectContext(projectId);
			if (context) {
				projectNodes = context.nodeIds
					.map((id: string) => this.graph.getNode(id))
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
				const detection = this.detectNoteShouldBecomeTask(node.entityId);
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
				const detection = this.detectTaskShouldBecomeReportSection(node.entityId);
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
				const detection = this.detectReportShouldBecomeBlogPost(node.entityId);
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
		const edges = Array.from((this.graph as any).edges.values()) as WorkflowEdge[];
		for (const edge of edges) {
			const source = this.graph.getNode(edge.sourceId);
			const target = this.graph.getNode(edge.targetId);
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
				const outgoing = this.graph.getOutgoingEdges(node.id);
				const hasReportLink = outgoing.some(e => e.type === 'usedAsSource');
				if (!hasReportLink) {
					missingLinks.push({
						sourceId: node.entityId,
						sourceType: 'note',
						targetType: 'report',
						reason: 'Note not linked to any report',
						severity: 2,
					});
				}
			}
			if (node.type === 'report') {
				const outgoing = this.graph.getOutgoingEdges(node.id);
				const hasBlogPostLink = outgoing.some(e => e.type === 'generatesBlogPost');
				if (!hasBlogPostLink && node.metadata.publishable) {
					missingLinks.push({
						sourceId: node.entityId,
						sourceType: 'report',
						targetType: 'blogPost',
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

	// ==================== Utilities ====================

	/**
	 * Apply suggested links (auto‑link based on high confidence).
	 */
	applySuggestedLinks(confidenceThreshold = 0.8): number {
		const allNodes = Array.from((this.graph as any).nodes.values()) as WorkflowNode[];
		let applied = 0;

		for (const node of allNodes) {
			const suggestions = this.suggestLinksForNode(node.id);
			for (const suggestion of suggestions) {
				if (suggestion.confidence >= confidenceThreshold) {
					this.graph.linkEntities(
						node.entityId,
						node.type,
						node.label,
						suggestion.targetNodeId,
						this.graph.getNode(suggestion.targetNodeId)?.type ?? 'unknown',
						this.graph.getNode(suggestion.targetNodeId)?.label ?? '',
						suggestion.edgeType,
						['auto‑detected by CrossDocumentIntelligenceEngine']
					);
					applied++;
				}
			}
		}

		return applied;
	}
}