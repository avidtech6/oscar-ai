/**
 * Workflow Intelligence Layer – Type Definitions (Phase 25)
 * 
 * Defines nodes, edges, and structures for the workflow graph,
 * project‑level reasoning, cross‑document intelligence, and task generation.
 */

import type { Note } from '../../components/index';
import type { Report } from '../../components/index';
import type { MediaItem } from '../media/MediaTypes';
import type { TaskDescriptor } from '../unified-orchestration/OrchestrationKernel';

/**
 * Node types in the workflow graph.
 */
export type WorkflowNodeType =
	| 'note'
	| 'task'
	| 'report'
	| 'blogPost'
	| 'project'
	| 'media'
	| 'userAction'
	| 'aiAction'
	| 'voiceNote'
	| 'image'
	| 'diagram'
	| 'calendarEvent'
	| 'email'
	| 'section'
	| 'template'
	| 'unknown';

/**
 * Edge types representing relationships between nodes.
 */
export type WorkflowEdgeType =
	| 'usedAsSource'          // note → report
	| 'belongsToProject'      // report → project
	| 'transcribedInto'       // voice note → note
	| 'illustrates'           // image → report section
	| 'generatesTask'         // note → task
	| 'generatesReportSection' // note → report section
	| 'generatesBlogPost'     // report → blog post
	| 'references'            // task → document
	| 'dependsOn'             // task → task
	| 'follows'               // user action → AI action
	| 'triggers'              // event → action
	| 'contains'              // project → note
	| 'createdFrom'           // report → note
	| 'updatedBy'             // document → user action
	| 'scheduledFor'          // task → calendar event
	| 'attached'              // media → note
	| 'summarisedBy'          // note → summary
	| 'relatedTo'             // generic relation
	| 'unknown';

/**
 * A node in the workflow graph.
 */
export interface WorkflowNode {
	/** Unique node ID */
	id: string;
	/** Node type */
	type: WorkflowNodeType;
	/** Original entity ID (e.g., note.id, report.id) */
	entityId: string;
	/** Entity type (for quick lookup) */
	entityType: string;
	/** Human‑readable label */
	label: string;
	/** Metadata (depends on entity type) */
	metadata: Record<string, any>;
	/** Timestamp of creation */
	createdAt: Date;
	/** Timestamp of last update */
	updatedAt: Date;
	/** Tags for categorisation */
	tags: string[];
	/** Confidence score (0‑1) for automated linking */
	confidence: number;
}

/**
 * An edge in the workflow graph.
 */
export interface WorkflowEdge {
	/** Unique edge ID */
	id: string;
	/** Source node ID */
	sourceId: string;
	/** Target node ID */
	targetId: string;
	/** Edge type */
	type: WorkflowEdgeType;
	/** Strength/weight (0‑1) */
	weight: number;
	/** Evidence (e.g., user action, AI inference, rule) */
	evidence: string[];
	/** Timestamp of creation */
	createdAt: Date;
	/** Timestamp of last update */
	updatedAt: Date;
	/** Metadata */
	metadata: Record<string, any>;
}

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

/**
 * Event types for the workflow event model.
 */
export type WorkflowEventType =
	| 'projectOpened'
	| 'documentCreated'
	| 'taskCreated'
	| 'noteCreated'
	| 'mediaAdded'
	| 'userAction'
	| 'workflowBreakDetected'
	| 'sectionCompleted'
	| 'reportPublished'
	| 'blogPostGenerated'
	| 'taskCompleted'
	| 'deadlineMissed'
	| 'contentUpdated'
	| 'aiActionPerformed';

/**
 * A workflow event.
 */
export interface WorkflowEvent {
	/** Event ID */
	id: string;
	/** Event type */
	type: WorkflowEventType;
	/** Source node ID (optional) */
	sourceNodeId?: string;
	/** Payload */
	payload: Record<string, any>;
	/** Timestamp */
	timestamp: Date;
	/** User ID */
	userId: string;
	/** Session ID */
	sessionId: string;
}

/**
 * Workflow‑aware context mode configuration.
 */
export interface WorkflowAwareContextConfig {
	/** Whether to show project‑aware suggestions */
	showProjectSuggestions: boolean;
	/** Whether to surface relevant notes */
	surfaceRelevantNotes: boolean;
	/** Whether to surface relevant tasks */
	surfaceRelevantTasks: boolean;
	/** Whether to surface relevant media */
	surfaceRelevantMedia: boolean;
	/** Whether to surface relevant reports */
	surfaceRelevantReports: boolean;
	/** Maximum number of suggestions */
	maxSuggestions: number;
	/** Refresh interval (seconds) */
	refreshInterval: number;
}

/**
 * Workflow‑aware chat mode configuration.
 */
export interface WorkflowAwareChatConfig {
	/** Whether to ask to apply answers to workflow */
	askToApply: boolean;
	/** Default apply action */
	defaultApplyAction: 'createTask' | 'updateNote' | 'updateReport' | 'generateSection' | 'none';
	/** Allowed apply actions */
	allowedApplyActions: string[];
	/** Confirmation required */
	confirmationRequired: boolean;
	/** Timeout (seconds) before auto‑decline */
	timeout: number;
}

/**
 * Workflow intelligence layer status.
 */
export interface WorkflowIntelligenceStatus {
	/** Graph node count */
	nodeCount: number;
	/** Graph edge count */
	edgeCount: number;
	/** Project count */
	projectCount: number;
	/** Detected gaps count */
	gapCount: number;
	/** Predicted steps count */
	predictedStepsCount: number;
	/** Generated tasks count */
	generatedTasksCount: number;
	/** Last analysis timestamp */
	lastAnalysis: Date;
	/** Engine health */
	health: 'healthy' | 'degraded' | 'unhealthy';
	/** Error messages (if any) */
	errors: string[];
}