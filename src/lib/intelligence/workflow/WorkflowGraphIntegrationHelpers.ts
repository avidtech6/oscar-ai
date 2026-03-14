/**
 * Integration‑helper functions for WorkflowGraphEngine.
 */

import type { WorkflowNode, WorkflowEdge, WorkflowNodeType, WorkflowEdgeType } from './WorkflowTypes';
import type { NodeStore } from './WorkflowGraphNodeOperations';
import type { EdgeStore } from './WorkflowGraphEdgeOperations';
import { addNode, getNodeByEntityId } from './WorkflowGraphNodeOperations';
import { addEdge } from './WorkflowGraphEdgeOperations';

export interface GraphStore extends NodeStore, EdgeStore {}

/**
 * Create a node from a generic entity (note, report, task, etc.).
 */
export function createNodeFromEntity(
	entityId: string,
	entityType: WorkflowNodeType,
	label: string,
	metadata: Record<string, any> = {},
	tags: string[] = []
): WorkflowNode {
	const nodeId = `workflow_node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	const now = new Date();
	return {
		id: nodeId,
		type: entityType,
		entityId,
		entityType: entityType,
		label,
		metadata,
		createdAt: now,
		updatedAt: now,
		tags,
		confidence: 1.0,
	};
}

/**
 * Create an edge between two existing nodes.
 */
export function createEdge(
	sourceId: string,
	targetId: string,
	type: WorkflowEdgeType,
	weight = 0.5,
	evidence: string[] = []
): WorkflowEdge {
	const edgeId = `workflow_edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	const now = new Date();
	return {
		id: edgeId,
		sourceId,
		targetId,
		type,
		weight,
		evidence,
		createdAt: now,
		updatedAt: now,
		metadata: {},
	};
}

/**
 * Link two entities (create nodes if they don't exist, then create edge).
 */
export function linkEntities(
	store: GraphStore,
	sourceEntityId: string,
	sourceType: WorkflowNodeType,
	sourceLabel: string,
	targetEntityId: string,
	targetType: WorkflowNodeType,
	targetLabel: string,
	edgeType: WorkflowEdgeType,
	evidence: string[] = []
): void {
	let sourceNode = getNodeByEntityId(store, sourceEntityId);
	if (!sourceNode) {
		sourceNode = createNodeFromEntity(sourceEntityId, sourceType, sourceLabel);
		addNode(store, sourceNode);
	}

	let targetNode = getNodeByEntityId(store, targetEntityId);
	if (!targetNode) {
		targetNode = createNodeFromEntity(targetEntityId, targetType, targetLabel);
		addNode(store, targetNode);
	}

	const edge = createEdge(sourceNode.id, targetNode.id, edgeType, 0.5, evidence);
	addEdge(store, edge);
}

/**
 * Clear the entire graph (for testing).
 */
export function clearGraph(store: GraphStore): void {
	store.nodes.clear();
	store.edges.clear();
	store.nodeByEntityId.clear();
	store.edgesBySource.clear();
	store.edgesByTarget.clear();
}