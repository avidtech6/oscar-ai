/**
 * Workflow Intelligence Layer – graph operations
 */

import type { WorkflowNode, WorkflowEdge, WorkflowNodeType, WorkflowEdgeType } from './WorkflowTypes';
import { WorkflowEventModel } from './WorkflowEventModel';
import { WorkflowGraphEngine } from './WorkflowGraphEngine';

import { addNode, createNodeFromEntity, linkEntities, removeNode } from './WorkflowIntelligenceLayerGraphOps';

export class WorkflowIntelligenceLayerGraph {
	private graph: WorkflowGraphEngine;
	private eventModel: WorkflowEventModel;

	constructor(graph: WorkflowGraphEngine, eventModel: WorkflowEventModel) {
		this.graph = graph;
		this.eventModel = eventModel;
	}

	/**
	 * Add a node to the workflow graph.
	 */
	addNode(node: Omit<WorkflowNode, 'id' | 'createdAt' | 'updatedAt'>): WorkflowNode {
		return addNode(this.graph, this.eventModel, node);
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
		return createNodeFromEntity(this.graph, this.eventModel, entityId, entityType, label, metadata, tags);
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
		return linkEntities(
			this.graph,
			this.eventModel,
			sourceEntityId,
			sourceType,
			sourceLabel,
			targetEntityId,
			targetType,
			targetLabel,
			edgeType,
			evidence
		);
	}

	/**
	 * Remove a node (and its edges) from the graph.
	 */
	removeNode(nodeId: string): void {
		removeNode(this.graph, this.eventModel, nodeId);
	}
}