/**
 * Graph‑query functions for WorkflowGraphEngine.
 */

import type { WorkflowNode, WorkflowEdge, WorkflowNodeType, WorkflowEdgeType } from './WorkflowTypes';
import { getOutgoingEdges } from './WorkflowGraphEdgeOperations';
import type { EdgeStore } from './WorkflowGraphEdgeOperations';
import type { NodeStore } from './WorkflowGraphNodeOperations';

export interface GraphStore extends NodeStore, EdgeStore {}

/**
 * Get all nodes reachable from a given node via outgoing edges.
 */
export function getReachableNodes(
	store: GraphStore,
	nodeId: string,
	maxDepth = 5
): WorkflowNode[] {
	const visited = new Set<string>();
	const queue: { nodeId: string; depth: number }[] = [{ nodeId, depth: 0 }];
	const result: WorkflowNode[] = [];

	while (queue.length > 0) {
		const { nodeId: currentId, depth } = queue.shift()!;
		if (visited.has(currentId) || depth > maxDepth) continue;
		visited.add(currentId);

		const node = store.nodes.get(currentId);
		if (node && depth > 0) {
			result.push(node);
		}

		const outgoing = getOutgoingEdges(store, currentId);
		for (const edge of outgoing) {
			if (!visited.has(edge.targetId)) {
				queue.push({ nodeId: edge.targetId, depth: depth + 1 });
			}
		}
	}

	return result;
}

/**
 * Find the shortest path (by edge count) between two nodes.
 */
export function findShortestPath(
	store: GraphStore,
	sourceId: string,
	targetId: string
): WorkflowNode[] | null {
	if (sourceId === targetId) return [];

	const visited = new Set<string>();
	const queue: { nodeId: string; path: string[] }[] = [{ nodeId: sourceId, path: [] }];

	while (queue.length > 0) {
		const { nodeId, path } = queue.shift()!;
		if (visited.has(nodeId)) continue;
		visited.add(nodeId);

		const outgoing = getOutgoingEdges(store, nodeId);
		for (const edge of outgoing) {
			if (edge.targetId === targetId) {
				const fullPath = [...path, nodeId, targetId];
				return fullPath.map(id => store.nodes.get(id)!).filter(Boolean);
			}
			if (!visited.has(edge.targetId)) {
				queue.push({ nodeId: edge.targetId, path: [...path, nodeId] });
			}
		}
	}

	return null;
}

/**
 * Detect cycles in the graph (simple DFS).
 */
export function detectCycles(store: GraphStore): string[][] {
	const cycles: string[][] = [];
	const visited = new Set<string>();
	const recursionStack = new Set<string>();

	const dfs = (nodeId: string, path: string[]): void => {
		if (recursionStack.has(nodeId)) {
			// Found a cycle
			const startIdx = path.indexOf(nodeId);
			if (startIdx >= 0) {
				cycles.push(path.slice(startIdx));
			}
			return;
		}
		if (visited.has(nodeId)) return;

		visited.add(nodeId);
		recursionStack.add(nodeId);
		path.push(nodeId);

		const outgoing = getOutgoingEdges(store, nodeId);
		for (const edge of outgoing) {
			dfs(edge.targetId, [...path]);
		}

		recursionStack.delete(nodeId);
	};

	for (const nodeId of Array.from(store.nodes.keys())) {
		if (!visited.has(nodeId)) {
			dfs(nodeId, []);
		}
	}

	return cycles;
}

/**
 * Compute graph statistics.
 */
export function getStatistics(store: GraphStore): {
	nodeCount: number;
	edgeCount: number;
	nodeTypes: Record<WorkflowNodeType, number>;
	edgeTypes: Record<WorkflowEdgeType, number>;
	averageDegree: number;
} {
	const nodeTypes: Record<WorkflowNodeType, number> = {} as any;
	const edgeTypes: Record<WorkflowEdgeType, number> = {} as any;

	for (const node of Array.from(store.nodes.values())) {
		nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
	}
	for (const edge of Array.from(store.edges.values())) {
		edgeTypes[edge.type] = (edgeTypes[edge.type] || 0) + 1;
	}

	const totalDegree = Array.from(store.edgesBySource.values()).reduce((sum, edges) => sum + edges.length, 0);
	const averageDegree = store.nodes.size > 0 ? totalDegree / store.nodes.size : 0;

	return {
		nodeCount: store.nodes.size,
		edgeCount: store.edges.size,
		nodeTypes,
		edgeTypes,
		averageDegree,
	};
}