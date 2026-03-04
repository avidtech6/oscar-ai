/**
 * Workflow Intelligence Layer – main orchestrator for all workflow intelligence.
 * 
 * Coordinates the workflow graph, cross‑document intelligence, prediction,
 * automatic task generation, multi‑document workflows, context/chat modes,
 * and event model.
 */

import type {
	WorkflowNode,
	WorkflowEdge,
	WorkflowEvent,
	WorkflowEventType,
	WorkflowGap,
	PredictedNextStep,
	WorkflowNodeType,
	WorkflowEdgeType,
} from './WorkflowTypes';

import type { WorkflowAction } from './WorkflowEventModel';
import type { CrossDocumentAnalysis } from './CrossDocumentIntelligenceEngine';

import { WorkflowGraphEngine } from './WorkflowGraphEngine';
import { ProjectLevelReasoningEngine } from './ProjectLevelReasoningEngine';
import { CrossDocumentIntelligenceEngine } from './CrossDocumentIntelligenceEngine';
import { WorkflowPredictionEngine, type PredictionContext } from './WorkflowPredictionEngine';
import { AutomaticTaskGenerationEngine } from './AutomaticTaskGenerationEngine';
import { MultiDocumentWorkflowEngine } from './MultiDocumentWorkflowEngine';
import { WorkflowAwareContextMode } from './WorkflowAwareContextMode';
import { WorkflowAwareChatMode } from './WorkflowAwareChatMode';
import { WorkflowEventModel } from './WorkflowEventModel';

export class WorkflowIntelligenceLayer {
	private graph: WorkflowGraphEngine;
	private projectReasoning: ProjectLevelReasoningEngine;
	private crossDoc: CrossDocumentIntelligenceEngine;
	private prediction: WorkflowPredictionEngine;
	private taskGen: AutomaticTaskGenerationEngine;
	private multiDoc: MultiDocumentWorkflowEngine;
	private contextMode: WorkflowAwareContextMode;
	private chatMode: WorkflowAwareChatMode;
	private eventModel: WorkflowEventModel;

	constructor() {
		this.graph = new WorkflowGraphEngine();
		this.projectReasoning = new ProjectLevelReasoningEngine(this.graph);
		this.crossDoc = new CrossDocumentIntelligenceEngine(this.graph, this.projectReasoning);
		this.prediction = new WorkflowPredictionEngine(this.graph, this.projectReasoning);
		this.taskGen = new AutomaticTaskGenerationEngine(this.graph, this.crossDoc);
		this.multiDoc = new MultiDocumentWorkflowEngine(
			this.graph,
			this.crossDoc,
			this.taskGen,
			this.projectReasoning
		);
		this.contextMode = new WorkflowAwareContextMode(this.graph, this.projectReasoning);
		this.chatMode = new WorkflowAwareChatMode(
			this.graph,
			this.projectReasoning,
			this.taskGen,
			this.crossDoc
		);
		this.eventModel = new WorkflowEventModel(
			this.graph,
			this.projectReasoning,
			this.taskGen,
			this.crossDoc,
			this.prediction
		);
	}

	// ==================== Core Accessors ====================

	/**
	 * Get the underlying workflow graph engine.
	 */
	getGraph(): WorkflowGraphEngine {
		return this.graph;
	}

	/**
	 * Get the project‑level reasoning engine.
	 */
	getProjectReasoning(): ProjectLevelReasoningEngine {
		return this.projectReasoning;
	}

	/**
	 * Get the cross‑document intelligence engine.
	 */
	getCrossDocumentIntelligence(): CrossDocumentIntelligenceEngine {
		return this.crossDoc;
	}

	/**
	 * Get the prediction engine.
	 */
	getPredictionEngine(): WorkflowPredictionEngine {
		return this.prediction;
	}

	/**
	 * Get the automatic task generation engine.
	 */
	getTaskGenerationEngine(): AutomaticTaskGenerationEngine {
		return this.taskGen;
	}

	/**
	 * Get the multi‑document workflow engine.
	 */
	getMultiDocumentWorkflowEngine(): MultiDocumentWorkflowEngine {
		return this.multiDoc;
	}

	/**
	 * Get the workflow‑aware context mode.
	 */
	getContextMode(): WorkflowAwareContextMode {
		return this.contextMode;
	}

	/**
	 * Get the workflow‑aware chat mode.
	 */
	getChatMode(): WorkflowAwareChatMode {
		return this.chatMode;
	}

	/**
	 * Get the workflow event model.
	 */
	getEventModel(): WorkflowEventModel {
		return this.eventModel;
	}

	// ==================== Graph Operations ====================

	/**
	 * Add a node to the workflow graph.
	 */
	addNode(node: Omit<WorkflowNode, 'id' | 'createdAt' | 'updatedAt'>): WorkflowNode {
		const newNode: WorkflowNode = {
			...node,
			id: `workflow_node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		this.graph.addNode(newNode);
		this.emitNodeEvent('created', newNode);
		return newNode;
	}

	/**
	 * Create a node from an entity.
	 */
	createNodeFromEntity(
		entityId: string,
		entityType: WorkflowNodeType,
		label: string,
		metadata: Record<string, any> = {},
		tags: string[] = []
	): WorkflowNode {
		const node = this.graph.createNodeFromEntity(entityId, entityType, label, metadata, tags);
		this.graph.addNode(node);
		this.emitNodeEvent('created', node);
		return node;
	}

	/**
	 * Link two entities in the workflow graph.
	 */
	linkEntities(
		sourceEntityId: string,
		sourceType: WorkflowNodeType,
		sourceLabel: string,
		targetEntityId: string,
		targetType: WorkflowNodeType,
		targetLabel: string,
		edgeType: WorkflowEdgeType,
		evidence: string[] = []
	): WorkflowEdge {
		this.graph.linkEntities(
			sourceEntityId,
			sourceType,
			sourceLabel,
			targetEntityId,
			targetType,
			targetLabel,
			edgeType,
			evidence
		);
		// Retrieve the created edge (simplified)
		const sourceNode = this.graph.getNodeByEntityId(sourceEntityId);
		const targetNode = this.graph.getNodeByEntityId(targetEntityId);
		if (!sourceNode || !targetNode) {
			throw new Error('Failed to link entities');
		}
		const edges = this.graph.findEdgesBetween(sourceNode.id, targetNode.id);
		const edge = edges.find(e => e.type === edgeType);
		if (!edge) {
			throw new Error('Edge not found after linking');
		}
		this.emitEdgeEvent('created', edge);
		return edge;
	}

	/**
	 * Remove a node (and its edges) from the graph.
	 */
	removeNode(nodeId: string): void {
		const node = this.graph.getNode(nodeId);
		if (node) {
			this.emitNodeEvent('removed', node);
		}
		this.graph.removeNode(nodeId);
	}

	// ==================== Project‑Level Reasoning ====================

	/**
	 * Analyse gaps in a project.
	 */
	analyseProjectGaps(projectId: string): WorkflowGap[] {
		return this.projectReasoning.analyseProjectGaps(projectId);
	}

	/**
	 * Get the context of a project (nodes, edges, metadata).
	 */
	getProjectContext(projectId: string) {
		return this.projectReasoning.getProjectContext(projectId);
	}

	// ==================== Cross‑Document Intelligence ====================

	/**
	 * Analyse cross‑document relationships within a project.
	 */
	analyseCrossDocumentRelationships(projectId?: string): CrossDocumentAnalysis {
		return this.crossDoc.analyseCrossDocumentRelationships(projectId);
	}

	/**
	 * Detect whether a note should become a task.
	 */
	detectNoteShouldBecomeTask(noteId: string) {
		return this.crossDoc.detectNoteShouldBecomeTask(noteId);
	}

	/**
	 * Detect whether a task should become a report section.
	 */
	detectTaskShouldBecomeReportSection(taskId: string) {
		return this.crossDoc.detectTaskShouldBecomeReportSection(taskId);
	}

	/**
	 * Detect whether a report should become a blog post.
	 */
	detectReportShouldBecomeBlogPost(reportId: string) {
		return this.crossDoc.detectReportShouldBecomeBlogPost(reportId);
	}

	// ==================== Prediction ====================

	/**
	 * Predict next steps for a given context.
	 */
	predictNextSteps(context: PredictionContext): PredictedNextStep[] {
		return this.prediction.predictNextSteps(context);
	}

	/**
	 * Get a summary of predictions.
	 */
	getPredictionSummary(context: PredictionContext) {
		return this.prediction.getPredictionSummary(context);
	}

	/**
	 * Explain predictions in natural language.
	 */
	explainPredictions(context: PredictionContext): string {
		return this.prediction.explainPredictions(context);
	}

	// ==================== Automatic Task Generation ====================

	/**
	 * Generate tasks for a given node (note, report, etc.).
	 */
	generateTasksForNode(nodeId: string) {
		return this.taskGen.generateTasksForNode(nodeId);
	}

	/**
	 * Apply generated tasks to the graph.
	 */
	applyGeneratedTasks(tasks: any[]) {
		return this.taskGen.applyGeneratedTasks(tasks);
	}

	// ==================== Multi‑Document Workflows ====================

	/**
	 * Discover potential workflows in the graph.
	 */
	discoverWorkflows() {
		return this.multiDoc.discoverWorkflows();
	}

	/**
	 * Suggest workflows for a given node.
	 */
	suggestWorkflows(nodeId: string) {
		return this.multiDoc.suggestWorkflows(nodeId);
	}

	/**
	 * Execute a workflow template.
	 */
	executeTemplate(templateId: string, sourceNodeIds: string[]) {
		return this.multiDoc.executeTemplate(templateId, sourceNodeIds);
	}

	// ==================== Context Mode ====================

	/**
	 * Get suggestions for the current context.
	 */
	getSuggestions(projectId?: string) {
		return this.contextMode.getSuggestions(projectId);
	}

	// ==================== Chat Mode ====================

	/**
	 * Process a chat message with workflow awareness.
	 */
	processChatMessage(
		message: string,
		context?: { projectId?: string; activeNodeId?: string }
	) {
		return this.chatMode.processMessage(message, context);
	}

	// ==================== Event Model ====================

	/**
	 * Subscribe to workflow events.
	 */
	subscribe(eventType: WorkflowEventType, handler: (event: WorkflowEvent) => void): void {
		this.eventModel.subscribe(eventType, handler);
	}

	/**
	 * Unsubscribe from workflow events.
	 */
	unsubscribe(eventType: WorkflowEventType, handler: (event: WorkflowEvent) => void): void {
		this.eventModel.unsubscribe(eventType, handler);
	}

	/**
	 * Emit a custom workflow event.
	 */
	emitEvent(event: WorkflowEvent): void {
		this.eventModel.emit(event);
	}

	/**
	 * Get recent workflow actions.
	 */
	getRecentActions(limit = 50): WorkflowAction[] {
		return this.eventModel.getRecentActions(limit);
	}

	// ==================== Private Helpers ====================

	private emitNodeEvent(action: 'created' | 'removed', node: WorkflowNode): void {
		let eventType: WorkflowEventType;
		switch (node.type) {
			case 'note':
				eventType = action === 'created' ? 'noteCreated' : 'userAction';
				break;
			case 'task':
				eventType = action === 'created' ? 'taskCreated' : 'userAction';
				break;
			case 'report':
				eventType = action === 'created' ? 'documentCreated' : 'userAction';
				break;
			case 'media':
				eventType = action === 'created' ? 'mediaAdded' : 'userAction';
				break;
			default:
				eventType = 'userAction';
		}
		this.eventModel.createEvent(eventType, node.entityId, { nodeType: node.type, action });
	}

	private emitEdgeEvent(action: 'created', edge: WorkflowEdge): void {
		this.eventModel.createEvent('userAction', edge.sourceId, {
			edgeType: edge.type,
			targetId: edge.targetId,
			action: 'edgeCreated',
		});
	}

	// ==================== Diagnostics ====================

	/**
	 * Export the current workflow intelligence state.
	 */
	exportState(projectId?: string): any {
		const nodes = Array.from((this.graph as any).nodes.values()) as WorkflowNode[];
		const edges = Array.from((this.graph as any).edges.values()) as WorkflowEdge[];

		const projectNodes = projectId
			? nodes.filter(n => n.metadata.projectId === projectId)
			: nodes;

		const gaps = projectId ? this.projectReasoning.analyseProjectGaps(projectId) : [];
		const crossDoc = this.crossDoc.analyseCrossDocumentRelationships(projectId);
		const workflows = this.multiDoc.discoverWorkflows();
		const recentActions = this.eventModel.getRecentActions(20);

		return {
			nodeCount: nodes.length,
			edgeCount: edges.length,
			projectNodeCount: projectNodes.length,
			gaps,
			crossDocumentAnalysis: crossDoc,
			detectedWorkflows: workflows,
			recentActions,
		};
	}

	/**
	 * Validate the workflow graph for common issues.
	 */
	validateGraph(): Array<{ type: string; description: string; severity: string }> {
		const issues: Array<{ type: string; description: string; severity: string }> = [];

		const nodes = Array.from((this.graph as any).nodes.values()) as WorkflowNode[];
		const edges = Array.from((this.graph as any).edges.values()) as WorkflowEdge[];

		// Orphaned nodes (no edges)
		for (const node of nodes) {
			const incoming = edges.filter(e => e.targetId === node.id);
			const outgoing = edges.filter(e => e.sourceId === node.id);
			if (incoming.length === 0 && outgoing.length === 0) {
				issues.push({
					type: 'orphanedNode',
					description: `Node "${node.label}" (${node.type}) has no connections`,
					severity: 'low',
				});
			}
		}

		// Duplicate edges (same source/target/type)
		const edgeKey = (e: WorkflowEdge) => `${e.sourceId}-${e.targetId}-${e.type}`;
		const seen = new Set<string>();
		for (const edge of edges) {
			const key = edgeKey(edge);
			if (seen.has(key)) {
				issues.push({
					type: 'duplicateEdge',
					description: `Duplicate edge between ${edge.sourceId} and ${edge.targetId} (${edge.type})`,
					severity: 'medium',
				});
			}
			seen.add(key);
		}

		// Nodes with missing metadata
		for (const node of nodes) {
			if (!node.metadata || Object.keys(node.metadata).length === 0) {
				issues.push({
					type: 'missingMetadata',
					description: `Node "${node.label}" has no metadata`,
					severity: 'low',
				});
			}
		}

		return issues;
	}
}