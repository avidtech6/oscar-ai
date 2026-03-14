/**
 * Node‑operation functions for WorkflowGraphEngine.
 */

import type { WorkflowNode, WorkflowNodeType } from './WorkflowTypes';

export interface NodeStore {
	nodes: Map<string, WorkflowNode>;
	nodeByEntityId: Map<string, WorkflowNode>;
}

/**
 * Add or update a node in the graph.
 */
export function addNode(
	store: NodeStore,
	node: WorkflowNode
): void {
	store.nodes.set(node.id, node);
	store.nodeByEntityId.set(node.entityId, node);
}

/**
 * Remove a node and all its incident edges.
 * Note: edge removal must be handled separately.
 */
export function removeNode(
	store: NodeStore,
	nodeId: string
): WorkflowNode | undefined {
	const node = store.nodes.get(nodeId);
	if (!node) return undefined;

	store.nodes.delete(nodeId);
	store.nodeByEntityId.delete(node.entityId);
	return node;
}

/**
 * Get a node by its ID.
 */
export function getNode(
	store: NodeStore,
	nodeId: string
): WorkflowNode | undefined {
	return store.nodes.get(nodeId);
}

/**
 * Get a node by its entity ID.
 */
export function getNodeByEntityId(
	store: NodeStore,
	entityId: string
): WorkflowNode | undefined {
	return store.nodeByEntityId.get(entityId);
}

/**
 * Find nodes by type.
 */
export function findNodesByType(
	store: NodeStore,
	type: WorkflowNodeType
): WorkflowNode[] {
	const result: WorkflowNode[] = [];
	for (const node of Array.from(store.nodes.values())) {
		if (node.type === type) result.push(node);
	}
	return result;
}

/**
 * Find nodes by tag.
 */
export function findNodesByTag(
	store: NodeStore,
	tag: string
): WorkflowNode[] {
	const result: WorkflowNode[] = [];
	for (const node of Array.from(store.nodes.values())) {
		if (node.tags.includes(tag)) result.push(node);
	}
	return result;
}

/**
 * Update node metadata.
 */
export function updateNodeMetadata(
	store: NodeStore,
	nodeId: string,
	metadata: Record<string, any>
): void {
	const node = store.nodes.get(nodeId);
	if (!node) return;
	node.metadata = { ...node.metadata, ...metadata };
	node.updatedAt = new Date();
}