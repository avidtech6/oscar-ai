/**
 * Workflow Graph Engine (Phase 25)
 * 
 * Maintains a graph of relationships between notes, tasks, reports, blog posts,
 * projects, media, user actions, and AI actions.
 * 
 * Graph stored in IndexedDB + Supabase (future). For now, in‑memory.
 */

import type { WorkflowNode, WorkflowEdge, WorkflowNodeType, WorkflowEdgeType } from './WorkflowTypes';

export class WorkflowGraphEngine {
	private nodes: Map<string, WorkflowNode>;
	private edges: Map<string, WorkflowEdge>;
	private nodeByEntityId: Map<string, WorkflowNode>; // entityId → node
	private edgesBySource: Map<string, WorkflowEdge[]>; // sourceId → edges
	private edgesByTarget: Map<string, WorkflowEdge[]>; // targetId → edges

	constructor() {
		this.nodes = new Map();
		this.edges = new Map();
		this.nodeByEntityId = new Map();
		this.edgesBySource = new Map();
		this.edgesByTarget = new Map();
	}

	// ==================== Node Operations ====================

	/**
	 * Add or update a node in the graph.
	 */
	addNode(node: WorkflowNode): void {
		this.nodes.set(node.id, node);
		this.nodeByEntityId.set(node.entityId, node);
	}

	/**
	 * Remove a node and all its incident edges.
	 */
	removeNode(nodeId: string): void {
		const node = this.nodes.get(nodeId);
		if (!node) return;

		// Remove edges where node is source or target
		const sourceEdges = this.edgesBySource.get(nodeId) || [];
		const targetEdges = this.edgesByTarget.get(nodeId) || [];
		const allEdges = [...sourceEdges, ...targetEdges];
		for (const edge of allEdges) {
			this.removeEdge(edge.id);
		}

		this.nodes.delete(nodeId);
		this.nodeByEntityId.delete(node.entityId);
		this.edgesBySource.delete(nodeId);
		this.edgesByTarget.delete(nodeId);
	}

	/**
	 * Get a node by its ID.
	 */
	getNode(nodeId: string): WorkflowNode | undefined {
		return this.nodes.get(nodeId);
	}

	/**
	 * Get a node by its entity ID.
	 */
	getNodeByEntityId(entityId: string): WorkflowNode | undefined {
		return this.nodeByEntityId.get(entityId);
	}

	/**
	 * Find nodes by type.
	 */
	findNodesByType(type: WorkflowNodeType): WorkflowNode[] {
		const result: WorkflowNode[] = [];
		for (const node of Array.from(this.nodes.values())) {
			if (node.type === type) result.push(node);
		}
		return result;
	}

	/**
	 * Find nodes by tag.
	 */
	findNodesByTag(tag: string): WorkflowNode[] {
		const result: WorkflowNode[] = [];
		for (const node of Array.from(this.nodes.values())) {
			if (node.tags.includes(tag)) result.push(node);
		}
		return result;
	}

	/**
	 * Update node metadata.
	 */
	updateNodeMetadata(nodeId: string, metadata: Record<string, any>): void {
		const node = this.nodes.get(nodeId);
		if (!node) return;
		node.metadata = { ...node.metadata, ...metadata };
		node.updatedAt = new Date();
	}

	// ==================== Edge Operations ====================

	/**
	 * Add or update an edge in the graph.
	 */
	addEdge(edge: WorkflowEdge): void {
		this.edges.set(edge.id, edge);

		// Update source index
		if (!this.edgesBySource.has(edge.sourceId)) {
			this.edgesBySource.set(edge.sourceId, []);
		}
		const sourceList = this.edgesBySource.get(edge.sourceId)!;
		if (!sourceList.find(e => e.id === edge.id)) {
			sourceList.push(edge);
		}

		// Update target index
		if (!this.edgesByTarget.has(edge.targetId)) {
			this.edgesByTarget.set(edge.targetId, []);
		}
		const targetList = this.edgesByTarget.get(edge.targetId)!;
		if (!targetList.find(e => e.id === edge.id)) {
			targetList.push(edge);
		}
	}

	/**
	 * Remove an edge.
	 */
	removeEdge(edgeId: string): void {
		const edge = this.edges.get(edgeId);
		if (!edge) return;

		// Remove from source index
		const sourceList = this.edgesBySource.get(edge.sourceId);
		if (sourceList) {
			const idx = sourceList.findIndex(e => e.id === edgeId);
			if (idx >= 0) sourceList.splice(idx, 1);
		}

		// Remove from target index
		const targetList = this.edgesByTarget.get(edge.targetId);
		if (targetList) {
			const idx = targetList.findIndex(e => e.id === edgeId);
			if (idx >= 0) targetList.splice(idx, 1);
		}

		this.edges.delete(edgeId);
	}

	/**
	 * Get edges where the given node is source.
	 */
	getOutgoingEdges(nodeId: string): WorkflowEdge[] {
		return this.edgesBySource.get(nodeId) || [];
	}

	/**
	 * Get edges where the given node is target.
	 */
	getIncomingEdges(nodeId: string): WorkflowEdge[] {
		return this.edgesByTarget.get(nodeId) || [];
	}

	/**
	 * Get edges of a specific type.
	 */
	findEdgesByType(type: WorkflowEdgeType): WorkflowEdge[] {
		const result: WorkflowEdge[] = [];
		for (const edge of Array.from(this.edges.values())) {
			if (edge.type === type) result.push(edge);
		}
		return result;
	}

	/**
	 * Find edges between two nodes (any direction).
	 */
	findEdgesBetween(sourceId: string, targetId: string): WorkflowEdge[] {
		const outgoing = this.getOutgoingEdges(sourceId);
		return outgoing.filter(e => e.targetId === targetId);
	}

	/**
	 * Update edge weight.
	 */
	updateEdgeWeight(edgeId: string, weight: number): void {
		const edge = this.edges.get(edgeId);
		if (!edge) return;
		edge.weight = weight;
		edge.updatedAt = new Date();
	}

	// ==================== Graph Queries ====================

	/**
	 * Get all nodes reachable from a given node via outgoing edges.
	 */
	getReachableNodes(nodeId: string, maxDepth = 5): WorkflowNode[] {
		const visited = new Set<string>();
		const queue: { nodeId: string; depth: number }[] = [{ nodeId, depth: 0 }];
		const result: WorkflowNode[] = [];

		while (queue.length > 0) {
			const { nodeId: currentId, depth } = queue.shift()!;
			if (visited.has(currentId) || depth > maxDepth) continue;
			visited.add(currentId);

			const node = this.nodes.get(currentId);
			if (node && depth > 0) {
				result.push(node);
			}

			const outgoing = this.getOutgoingEdges(currentId);
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
	findShortestPath(sourceId: string, targetId: string): WorkflowNode[] | null {
		if (sourceId === targetId) return [];

		const visited = new Set<string>();
		const queue: { nodeId: string; path: string[] }[] = [{ nodeId: sourceId, path: [] }];

		while (queue.length > 0) {
			const { nodeId, path } = queue.shift()!;
			if (visited.has(nodeId)) continue;
			visited.add(nodeId);

			const outgoing = this.getOutgoingEdges(nodeId);
			for (const edge of outgoing) {
				if (edge.targetId === targetId) {
					const fullPath = [...path, nodeId, targetId];
					return fullPath.map(id => this.nodes.get(id)!).filter(Boolean);
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
	detectCycles(): string[][] {
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

			const outgoing = this.getOutgoingEdges(nodeId);
			for (const edge of outgoing) {
				dfs(edge.targetId, [...path]);
			}

			recursionStack.delete(nodeId);
		};

		for (const nodeId of Array.from(this.nodes.keys())) {
			if (!visited.has(nodeId)) {
				dfs(nodeId, []);
			}
		}

		return cycles;
	}

	/**
	 * Compute graph statistics.
	 */
	getStatistics(): {
		nodeCount: number;
		edgeCount: number;
		nodeTypes: Record<WorkflowNodeType, number>;
		edgeTypes: Record<WorkflowEdgeType, number>;
		averageDegree: number;
	} {
		const nodeTypes: Record<WorkflowNodeType, number> = {} as any;
		const edgeTypes: Record<WorkflowEdgeType, number> = {} as any;

		for (const node of Array.from(this.nodes.values())) {
			nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
		}
		for (const edge of Array.from(this.edges.values())) {
			edgeTypes[edge.type] = (edgeTypes[edge.type] || 0) + 1;
		}

		const totalDegree = Array.from(this.edgesBySource.values()).reduce((sum, edges) => sum + edges.length, 0);
		const averageDegree = this.nodes.size > 0 ? totalDegree / this.nodes.size : 0;

		return {
			nodeCount: this.nodes.size,
			edgeCount: this.edges.size,
			nodeTypes,
			edgeTypes,
			averageDegree,
		};
	}

	// ==================== Integration Helpers ====================

	/**
	 * Create a node from a generic entity (note, report, task, etc.).
	 */
	createNodeFromEntity(
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
	createEdge(
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
	linkEntities(
		sourceEntityId: string,
		sourceType: WorkflowNodeType,
		sourceLabel: string,
		targetEntityId: string,
		targetType: WorkflowNodeType,
		targetLabel: string,
		edgeType: WorkflowEdgeType,
		evidence: string[] = []
	): void {
		let sourceNode = this.getNodeByEntityId(sourceEntityId);
		if (!sourceNode) {
			sourceNode = this.createNodeFromEntity(sourceEntityId, sourceType, sourceLabel);
			this.addNode(sourceNode);
		}

		let targetNode = this.getNodeByEntityId(targetEntityId);
		if (!targetNode) {
			targetNode = this.createNodeFromEntity(targetEntityId, targetType, targetLabel);
			this.addNode(targetNode);
		}

		const edge = this.createEdge(sourceNode.id, targetNode.id, edgeType, 0.5, evidence);
		this.addEdge(edge);
	}

	/**
	 * Clear the entire graph (for testing).
	 */
	clear(): void {
		this.nodes.clear();
		this.edges.clear();
		this.nodeByEntityId.clear();
		this.edgesBySource.clear();
		this.edgesByTarget.clear();
	}
}