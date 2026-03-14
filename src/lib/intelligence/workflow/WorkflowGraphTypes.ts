/**
 * Workflow Graph Types (Phase 25)
 * 
 * Defines nodes, edges, and basic graph structures.
 */

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