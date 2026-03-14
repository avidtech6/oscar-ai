/**
 * Cross‑Document Intelligence Engine (Phase 25)
 * 
 * Links notes to reports, reports to blog posts, tasks to documents.
 * Detects when a note should become a task, a task should become a report section,
 * a report should become a blog post, etc.
 * 
 * Uses the Workflow Graph Engine and Project‑Level Reasoning Engine to infer relationships.
 */

import type { WorkflowNodeType } from './WorkflowTypes';
import { WorkflowGraphEngine } from './WorkflowGraphEngine';
import { ProjectLevelReasoningEngine } from './ProjectLevelReasoningEngine';

import type { CrossDocumentAnalysis } from './CrossDocumentAnalysisTypes';
import {
	detectNoteShouldBecomeTask,
	detectTaskShouldBecomeReportSection,
	detectReportShouldBecomeBlogPost,
} from './CrossDocumentIntelligenceDetection';
import {
	linkNoteToReport,
	linkReportToBlogPost,
	linkTaskToDocument,
	suggestLinksForNode,
	applySuggestedLinks,
} from './CrossDocumentIntelligenceLinking';
import { analyseCrossDocumentRelationships } from './CrossDocumentIntelligenceAnalysis';

export { type CrossDocumentAnalysis };

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
		linkNoteToReport(this.graph, noteId, reportId, evidence);
	}

	/**
	 * Link a report to a blog post (report generates blog post).
	 */
	linkReportToBlogPost(reportId: string, blogPostId: string, evidence: string[] = []): void {
		linkReportToBlogPost(this.graph, reportId, blogPostId, evidence);
	}

	/**
	 * Link a task to a document (task references document).
	 */
	linkTaskToDocument(taskId: string, documentId: string, evidence: string[] = []): void {
		linkTaskToDocument(this.graph, taskId, documentId, evidence);
	}

	// ==================== Detection ====================

	/**
	 * Detect whether a note should become a task.
	 */
	detectNoteShouldBecomeTask(noteId: string): { should: boolean; confidence: number; reason: string } {
		return detectNoteShouldBecomeTask(this.graph, noteId);
	}

	/**
	 * Detect whether a task should become a report section.
	 */
	detectTaskShouldBecomeReportSection(taskId: string): { should: boolean; confidence: number; reason: string } {
		return detectTaskShouldBecomeReportSection(this.graph, taskId);
	}

	/**
	 * Detect whether a report should become a blog post.
	 */
	detectReportShouldBecomeBlogPost(reportId: string): { should: boolean; confidence: number; reason: string } {
		return detectReportShouldBecomeBlogPost(this.graph, reportId);
	}

	// ==================== Suggestion ====================

	/**
	 * Suggest possible links for a given node.
	 */
	suggestLinksForNode(nodeId: string): Array<{ targetNodeId: string; edgeType: import('./WorkflowTypes').WorkflowEdgeType; confidence: number }> {
		return suggestLinksForNode(this.graph, nodeId);
	}

	// ==================== Analysis ====================

	/**
	 * Analyse cross‑document relationships across the whole graph or within a project.
	 */
	analyseCrossDocumentRelationships(projectId?: string): CrossDocumentAnalysis {
		return analyseCrossDocumentRelationships(this.graph, this.projectReasoning, projectId);
	}

	// ==================== Utilities ====================

	/**
	 * Apply suggested links (auto‑link based on high confidence).
	 */
	applySuggestedLinks(confidenceThreshold = 0.8): number {
		return applySuggestedLinks(this.graph, confidenceThreshold);
	}
}