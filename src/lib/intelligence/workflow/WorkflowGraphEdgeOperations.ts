/**
 * Edge‑operation functions for WorkflowGraphEngine.
 */

import type { WorkflowEdge, WorkflowEdgeType } from './WorkflowTypes';

export interface EdgeStore {
	edges: Map<string, WorkflowEdge>;
	edgesBySource: Map<string, WorkflowEdge[]>;
	edgesByTarget: Map<string, WorkflowEdge[]>;
}

/**
 * Add or update an edge in the graph.
 */
export function addEdge(
	store: EdgeStore,
	edge: WorkflowEdge
): void {
	store.edges.set(edge.id, edge);

	// Update source index
	if (!store.edgesBySource.has(edge.sourceId)) {
		store.edgesBySource.set(edge.sourceId, []);
	}
	const sourceList = store.edgesBySource.get(edge.sourceId)!;
	if (!sourceList.find(e => e.id === edge.id)) {
		sourceList.push(edge);
	}

	// Update target index
	if (!store.edgesByTarget.has(edge.targetId)) {
		store.edgesByTarget.set(edge.targetId, []);
	}
	const targetList = store.edgesByTarget.get(edge.targetId)!;
	if (!targetList.find(e => e.id === edge.id)) {
		targetList.push(edge);
	}
}

/**
 * Remove an edge.
 */
export function removeEdge(
	store: EdgeStore,
	edgeId: string
): void {
	const edge = store.edges.get(edgeId);
	if (!edge) return;

	// Remove from source index
	const sourceList = store.edgesBySource.get(edge.sourceId);
	if (sourceList) {
		const idx = sourceList.findIndex(e => e.id === edgeId);
		if (idx >= 0) sourceList.splice(idx, 1);
	}

	// Remove from target index
	const targetList = store.edgesByTarget.get(edge.targetId);
	if (targetList) {
		const idx = targetList.findIndex(e => e.id === edgeId);
		if (idx >= 0) targetList.splice(idx, 1);
	}

	store.edges.delete(edgeId);
}

/**
 * Get edges where the given node is source.
 */
export function getOutgoingEdges(
	store: EdgeStore,
	nodeId: string
): WorkflowEdge[] {
	return store.edgesBySource.get(nodeId) || [];
}

/**
 * Get edges where the given node is target.
 */
export function getIncomingEdges(
	store: EdgeStore,
	nodeId: string
): WorkflowEdge[] {
	return store.edgesByTarget.get(nodeId) || [];
}

/**
 * Get edges of a specific type.
 */
export function findEdgesByType(
	store: EdgeStore,
	type: WorkflowEdgeType
): WorkflowEdge[] {
	const result: WorkflowEdge[] = [];
	for (const edge of Array.from(store.edges.values())) {
		if (edge.type === type) result.push(edge);
	}
	return result;
}

/**
 * Find edges between two nodes (any direction).
 */
export function findEdgesBetween(
	store: EdgeStore,
	sourceId: string,
	targetId: string
): WorkflowEdge[] {
	const outgoing = getOutgoingEdges(store, sourceId);
	return outgoing.filter(e => e.targetId === targetId);
}

/**
 * Update edge weight.
 */
export function updateEdgeWeight(
	store: EdgeStore,
	edgeId: string,
	weight: number
): void {
	const edge = store.edges.get(edgeId);
	if (!edge) return;
	edge.weight = weight;
	edge.updatedAt = new Date();
}