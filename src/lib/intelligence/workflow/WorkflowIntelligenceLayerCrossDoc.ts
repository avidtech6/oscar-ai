/**
 * Workflow Intelligence Layer – cross-document intelligence
 */

import type { CrossDocumentAnalysis } from './CrossDocumentIntelligenceEngine';
import { CrossDocumentIntelligenceEngine } from './CrossDocumentIntelligenceEngine';
import * as Delegates from './WorkflowIntelligenceLayerDelegates';

export class WorkflowIntelligenceLayerCrossDoc {
	private crossDoc: CrossDocumentIntelligenceEngine;

	constructor(crossDoc: CrossDocumentIntelligenceEngine) {
		this.crossDoc = crossDoc;
	}

	/**
	 * Analyse cross‑document relationships within a project.
	 */
	analyseCrossDocumentRelationships(projectId?: string): CrossDocumentAnalysis {
		return Delegates.analyseCrossDocumentRelationships(this.crossDoc, projectId);
	}

	/**
	 * Detect whether a note should become a task.
	 */
	detectNoteShouldBecomeTask(noteId: string) {
		return Delegates.detectNoteShouldBecomeTask(this.crossDoc, noteId);
	}

	/**
	 * Detect whether a task should become a report section.
	 */
	detectTaskShouldBecomeReportSection(taskId: string) {
		return Delegates.detectTaskShouldBecomeReportSection(this.crossDoc, taskId);
	}

	/**
	 * Detect whether a report should become a blog post.
	 */
	detectReportShouldBecomeBlogPost(reportId: string) {
		return Delegates.detectReportShouldBecomeBlogPost(this.crossDoc, reportId);
	}
}