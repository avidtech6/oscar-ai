/**
 * Graph‑operation functions for WorkflowIntelligenceLayer.
 */

import type { WorkflowNode, WorkflowEdge, WorkflowNodeType, WorkflowEdgeType } from './WorkflowTypes';
import type { WorkflowGraphEngine } from './WorkflowGraphEngine';
import { emitNodeEvent, emitEdgeEvent } from './WorkflowIntelligenceLayerHelpers';

/**
 * Add a node to the workflow graph.
 */
export function addNode(
	graph: WorkflowGraphEngine,
	eventModel: any,
	node: Omit<WorkflowNode, 'id' | 'createdAt' | 'updatedAt'>
): WorkflowNode {
	const newNode: WorkflowNode = {
		...node,
		id: `workflow_node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
		createdAt: new Date(),
		updatedAt: new Date(),
	};
	graph.addNode(newNode);
	emitNodeEvent(eventModel, 'created', newNode);
	return newNode;
}

/**
 * Create a node from an entity.
 */
export function createNodeFromEntity(
	graph: WorkflowGraphEngine,
	eventModel: any,
	entityId: string,
	entityType: WorkflowNodeType,
	label: string,
	metadata: Record<string, any> = {},
	tags: string[] = []
): WorkflowNode {
	const node = graph.createNodeFromEntity(entityId, entityType, label, metadata, tags);
	graph.addNode(node);
	emitNodeEvent(eventModel, 'created', node);
	return node;
}

/**
 * Link two entities in the workflow graph.
 */
export function linkEntities(
	graph: WorkflowGraphEngine,
	eventModel: any,
	sourceEntityId: string,
	sourceType: WorkflowNodeType,
	sourceLabel: string,
	targetEntityId: string,
	targetType: WorkflowNodeType,
	targetLabel: string,
	edgeType: WorkflowEdgeType,
	evidence: string[] = []
): WorkflowEdge {
	graph.linkEntities(
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
	const sourceNode = graph.getNodeByEntityId(sourceEntityId);
	const targetNode = graph.getNodeByEntityId(targetEntityId);
	if (!sourceNode || !targetNode) {
		throw new Error('Failed to link entities');
	}
	const edges = graph.findEdgesBetween(sourceNode.id, targetNode.id);
	const edge = edges.find(e => e.type === edgeType);
	if (!edge) {
		throw new Error('Edge not found after linking');
	}
	emitEdgeEvent(eventModel, 'created', edge);
	return edge;
}

/**
 * Remove a node (and its edges) from the graph.
 */
export function removeNode(
	graph: WorkflowGraphEngine,
	eventModel: any,
	nodeId: string
): void {
	const node = graph.getNode(nodeId);
	if (node) {
		emitNodeEvent(eventModel, 'removed', node);
	}
	graph.removeNode(nodeId);
}