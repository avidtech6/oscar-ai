/**
 * Workflow Event Types (Phase 25)
 * 
 * Defines workflow event types and event structure.
 */

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