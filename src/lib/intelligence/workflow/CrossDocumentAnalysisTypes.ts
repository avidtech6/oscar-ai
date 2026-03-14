/**
 * Types for cross‑document intelligence analysis.
 */

import type { WorkflowNodeType } from './WorkflowTypes';

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