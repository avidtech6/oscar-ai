/**
 * Workflow Configuration Types (Phase 25)
 * 
 * Defines configuration and status types for workflow‑aware modes.
 */

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
 * A context suggestion for workflow‑aware context mode.
 */
export interface ContextSuggestion {
	id: string;
	type: 'note' | 'task' | 'report' | 'media' | 'blogPost' | 'project';
	nodeId: string;
	title: string;
	description: string;
	relevanceScore: number; // 0‑1
	action?: 'open' | 'edit' | 'complete' | 'link' | 'ignore';
	metadata: Record<string, any>;
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