/**
 * Workflow Project Types (Phase 25)
 * 
 * Defines project context, gaps, predicted steps, and generated tasks.
 */

import type { WorkflowNodeType } from './WorkflowGraphTypes';

/**
 * A project context for project‑level reasoning.
 */
export interface ProjectContext {
	/** Project ID */
	id: string;
	/** Project name */
	name: string;
	/** Description */
	description: string;
	/** Associated nodes (notes, tasks, reports, media) */
	nodeIds: string[];
	/** Current status */
	status: 'active' | 'completed' | 'onHold' | 'archived';
	/** Priority (1‑5) */
	priority: number;
	/** Deadline (optional) */
	deadline?: Date;
	/** Tags */
	tags: string[];
	/** Metadata */
	metadata: Record<string, any>;
	/** Created at */
	createdAt: Date;
	/** Updated at */
	updatedAt: Date;
}

/**
 * A workflow gap detected by the prediction engine.
 */
export interface WorkflowGap {
	/** Gap ID */
	id: string;
	/** Gap type */
	type: 'missingTask' | 'missingReport' | 'missingNote' | 'missingMedia' | 'incompleteSection' | 'unlinkedContent' | 'deadlineApproaching' | 'staleContent';
	/** Description */
	description: string;
	/** Severity (1‑5) */
	severity: number;
	/** Suggested action */
	suggestedAction: string;
	/** Related node IDs */
	relatedNodeIds: string[];
	/** Detected at */
	detectedAt: Date;
	/** Resolved flag */
	resolved: boolean;
}

/**
 * A predicted next step for the user.
 */
export interface PredictedNextStep {
	/** Prediction ID */
	id: string;
	/** Step description */
	description: string;
	/** Confidence (0‑1) */
	confidence: number;
	/** Expected effort (minutes) */
	expectedEffort: number;
	/** Priority (1‑5) */
	priority: number;
	/** Related node IDs */
	relatedNodeIds: string[];
	/** Suggested trigger (e.g., 'user opens project', 'note created') */
	trigger: string;
	/** Timestamp */
	predictedAt: Date;
}

/**
 * A generated task from automatic task generation.
 */
export interface GeneratedTask {
	/** Task ID */
	id: string;
	/** Title */
	title: string;
	/** Description */
	description: string;
	/** Source node IDs (e.g., note that triggered generation) */
	sourceNodeIds: string[];
	/** Priority (1‑5) */
	priority: number;
	/** Estimated duration (minutes) */
	estimatedDuration: number;
	/** Deadline (optional) */
	deadline?: Date;
	/** Assigned to (user ID) */
	assignedTo?: string;
	/** Status */
	status: 'pending' | 'inProgress' | 'completed' | 'cancelled';
	/** Created at */
	createdAt: Date;
	/** Updated at */
	updatedAt: Date;
}