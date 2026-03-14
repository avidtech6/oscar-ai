/**
 * Workflow Multi‑Document Types (Phase 25)
 * 
 * Defines multi‑document workflows and steps.
 */

import type { WorkflowNodeType } from './WorkflowGraphTypes';

/**
 * A multi‑document workflow definition.
 */
export interface MultiDocumentWorkflow {
	/** Workflow ID */
	id: string;
	/** Name */
	name: string;
	/** Description */
	description: string;
	/** Steps (ordered) */
	steps: WorkflowStep[];
	/** Input node types */
	inputTypes: WorkflowNodeType[];
	/** Output node types */
	outputTypes: WorkflowNodeType[];
	/** Example */
	example: string;
	/** Success criteria */
	successCriteria: string[];
	/** Created at */
	createdAt: Date;
	/** Updated at */
	updatedAt: Date;
}

/**
 * A single step in a multi‑document workflow.
 */
export interface WorkflowStep {
	/** Step number */
	step: number;
	/** Action description */
	action: string;
	/** Required input node types */
	requires: WorkflowNodeType[];
	/** Produced output node types */
	produces: WorkflowNodeType[];
	/** AI assistance needed? */
	aiAssistance: boolean;
	/** Estimated time (minutes) */
	estimatedTime: number;
	/** Notes */
	notes: string;
}