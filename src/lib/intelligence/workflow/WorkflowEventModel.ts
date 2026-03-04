/**
 * Workflow Event Model (Phase 25)
 * 
 * Listens for events (project opened, document created, task created, etc.)
 * and emits workflow actions (create task, link nodes, suggest workflows).
 */

import type { WorkflowEvent, WorkflowEventType } from './WorkflowTypes';
import { WorkflowGraphEngine } from './WorkflowGraphEngine';
import { ProjectLevelReasoningEngine } from './ProjectLevelReasoningEngine';
import { AutomaticTaskGenerationEngine } from './AutomaticTaskGenerationEngine';
import { CrossDocumentIntelligenceEngine } from './CrossDocumentIntelligenceEngine';
import { WorkflowPredictionEngine, type PredictionContext } from './WorkflowPredictionEngine';

export interface EventHandler {
	(event: WorkflowEvent): void;
}

export interface WorkflowAction {
	type: 'createTask' | 'linkNodes' | 'suggestWorkflow' | 'updateMetadata' | 'notifyUser';
	payload: Record<string, any>;
	timestamp: Date;
}

export class WorkflowEventModel {
	private graph: WorkflowGraphEngine;
	private projectReasoning: ProjectLevelReasoningEngine;
	private taskGen: AutomaticTaskGenerationEngine;
	private crossDoc: CrossDocumentIntelligenceEngine;
	private prediction: WorkflowPredictionEngine;
	private handlers: Map<WorkflowEventType, EventHandler[]>;
	private actionLog: WorkflowAction[];

	constructor(
		graph?: WorkflowGraphEngine,
		projectReasoning?: ProjectLevelReasoningEngine,
		taskGen?: AutomaticTaskGenerationEngine,
		crossDoc?: CrossDocumentIntelligenceEngine,
		prediction?: WorkflowPredictionEngine
	) {
		this.graph = graph ?? new WorkflowGraphEngine();
		this.projectReasoning = projectReasoning ?? new ProjectLevelReasoningEngine(this.graph);
		this.taskGen = taskGen ?? new AutomaticTaskGenerationEngine(this.graph, crossDoc);
		this.crossDoc = crossDoc ?? new CrossDocumentIntelligenceEngine(this.graph, this.projectReasoning);
		this.prediction = prediction ?? new WorkflowPredictionEngine(this.graph, this.projectReasoning);
		this.handlers = new Map();
		this.actionLog = [];
		this.setupDefaultHandlers();
	}

	// ==================== Event Subscription ====================

	/**
	 * Subscribe a handler to a specific event type.
	 */
	subscribe(eventType: WorkflowEventType, handler: EventHandler): void {
		if (!this.handlers.has(eventType)) {
			this.handlers.set(eventType, []);
		}
		this.handlers.get(eventType)!.push(handler);
	}

	/**
	 * Unsubscribe a handler.
	 */
	unsubscribe(eventType: WorkflowEventType, handler: EventHandler): void {
		const list = this.handlers.get(eventType);
		if (!list) return;
		const idx = list.indexOf(handler);
		if (idx >= 0) list.splice(idx, 1);
	}

	/**
	 * Emit an event (trigger all subscribed handlers).
	 */
	emit(event: WorkflowEvent): void {
		const handlers = this.handlers.get(event.type) || [];
		for (const handler of handlers) {
			try {
				handler(event);
			} catch (err) {
				console.error(`Handler for event ${event.type} failed:`, err);
			}
		}
		this.logAction({
			type: 'notifyUser',
			payload: { event: event.type, source: event.sourceNodeId },
			timestamp: new Date(),
		});
	}

	// ==================== Default Handlers ====================

	private setupDefaultHandlers(): void {
		this.subscribe('noteCreated', this.handleNoteCreated.bind(this));
		this.subscribe('taskCreated', this.handleTaskCreated.bind(this));
		this.subscribe('reportPublished', this.handleReportPublished.bind(this));
		this.subscribe('projectOpened', this.handleProjectOpened.bind(this));
		this.subscribe('userAction', this.handleUserAction.bind(this));
		this.subscribe('workflowBreakDetected', this.handleWorkflowBreak.bind(this));
		this.subscribe('deadlineMissed', this.handleDeadlineMissed.bind(this));
	}

	private handleNoteCreated(event: WorkflowEvent): void {
		const noteId = event.sourceNodeId;
		if (!noteId) return;

		// Automatically generate tasks if note contains action words
		const tasks = this.taskGen.generateTasksForNode(noteId);
		if (tasks.length > 0) {
			this.taskGen.applyGeneratedTasks(tasks);
			this.logAction({
				type: 'createTask',
				payload: { noteId, taskCount: tasks.length },
				timestamp: new Date(),
			});
		}

		// Suggest linking to tasks (note → task detection)
		const detection = this.crossDoc.detectNoteShouldBecomeTask(noteId);
		if (detection.should) {
			this.logAction({
				type: 'suggestWorkflow',
				payload: { noteId, suggestion: 'note → task', confidence: detection.confidence },
				timestamp: new Date(),
			});
		}
	}

	private handleTaskCreated(event: WorkflowEvent): void {
		const taskId = event.sourceNodeId;
		if (!taskId) return;

		// Link task to relevant project if not already linked
		const taskNode = this.graph.getNodeByEntityId(taskId);
		if (!taskNode) return;

		// Find projects that contain similar tags
		const projects = this.graph.findNodesByType('project');
		for (const project of projects) {
			const sharedTags = taskNode.tags.filter(tag => project.tags.includes(tag));
			if (sharedTags.length > 0) {
				this.graph.linkEntities(
					taskNode.entityId,
					taskNode.type,
					taskNode.label,
					project.entityId,
					project.type,
					project.label,
					'belongsToProject',
					['WorkflowEventModel']
				);
				this.logAction({
					type: 'linkNodes',
					payload: { taskId, projectId: project.entityId },
					timestamp: new Date(),
				});
				break;
			}
		}
	}

	private handleReportPublished(event: WorkflowEvent): void {
		const reportId = event.sourceNodeId;
		if (!reportId) return;

		// Suggest generating a blog post
		const detection = this.crossDoc.detectReportShouldBecomeBlogPost(reportId);
		if (detection.should) {
			this.logAction({
				type: 'suggestWorkflow',
				payload: { reportId, suggestion: 'report → blog post' },
				timestamp: new Date(),
			});
		}
	}

	private handleProjectOpened(event: WorkflowEvent): void {
		const projectId = event.sourceNodeId;
		if (!projectId) return;

		// Analyse gaps and predict next steps
		const gaps = this.projectReasoning.analyseProjectGaps(projectId);
		if (gaps.length > 0) {
			this.logAction({
				type: 'notifyUser',
				payload: { projectId, gaps: gaps.length },
				timestamp: new Date(),
			});
		}

		// Build a minimal prediction context
		const context: PredictionContext = {
			projectId,
			recentActivity: [], // we could collect recent activity from event payload
			now: new Date(),
			preferences: {},
		};

		const predictions = this.prediction.predictNextSteps(context);
		if (predictions.length > 0) {
			this.logAction({
				type: 'suggestWorkflow',
				payload: { projectId, predictions: predictions.length },
				timestamp: new Date(),
			});
		}
	}

	private handleUserAction(event: WorkflowEvent): void {
		// Track user behaviour for learning (placeholder)
	}

	private handleWorkflowBreak(event: WorkflowEvent): void {
		// Attempt to auto‑heal (placeholder)
	}

	private handleDeadlineMissed(event: WorkflowEvent): void {
		const projectId = event.payload?.projectId;
		if (projectId) {
			this.logAction({
				type: 'notifyUser',
				payload: { projectId, severity: 'high', message: 'Deadline missed' },
				timestamp: new Date(),
			});
		}
	}

	// ==================== Action Logging ====================

	private logAction(action: WorkflowAction): void {
		this.actionLog.push(action);
		// Keep log size manageable
		if (this.actionLog.length > 1000) {
			this.actionLog = this.actionLog.slice(-500);
		}
	}

	/**
	 * Get recent actions (for debugging or UI).
	 */
	getRecentActions(limit = 50): WorkflowAction[] {
		return this.actionLog.slice(-limit);
	}

	/**
	 * Clear action log.
	 */
	clearActionLog(): void {
		this.actionLog = [];
	}

	// ==================== Integration ====================

	/**
	 * Create and emit a standard event.
	 */
	createEvent(
		type: WorkflowEventType,
		sourceNodeId?: string,
		payload: Record<string, any> = {}
	): WorkflowEvent {
		const event: WorkflowEvent = {
			id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			type,
			sourceNodeId,
			payload,
			timestamp: new Date(),
			userId: 'system', // placeholder
			sessionId: 'default',
		};
		this.emit(event);
		return event;
	}

	// ==================== Statistics ====================

	/**
	 * Get statistics about events and actions.
	 */
	getStatistics(): {
		totalEvents: number;
		totalActions: number;
		byEventType: Record<string, number>;
		byActionType: Record<string, number>;
	} {
		const byEventType: Record<string, number> = {};
		const byActionType: Record<string, number> = {};

		// Count events (would need to store events)
		// For now, placeholder
		return {
			totalEvents: 0,
			totalActions: this.actionLog.length,
			byEventType,
			byActionType,
		};
	}
}