/**
 * Workflow Graph Engine (Phase 25)
 * 
 * Maintains a graph of relationships between notes, tasks, reports, blog posts,
 * projects, media, user actions, and AI actions.
 * 
 * Graph stored in IndexedDB + Supabase (future). For now, in‑memory.
 */

import type { WorkflowNode, WorkflowEdge, WorkflowNodeType, WorkflowEdgeType } from './WorkflowTypes';
import * as NodeOps from './WorkflowGraphNodeOperations';
import * as EdgeOps from './WorkflowGraphEdgeOperations';
import * as GraphQueries from './WorkflowGraphQueries';
import * as IntegrationHelpers from './WorkflowGraphIntegrationHelpers';

export class WorkflowGraphEngine {
	private nodes: Map<string, WorkflowNode>;
	private edges: Map<string, WorkflowEdge>;
	private nodeByEntityId: Map<string, WorkflowNode>;
	private edgesBySource: Map<string, WorkflowEdge[]>;
	private edgesByTarget: Map<string, WorkflowEdge[]>;

	constructor() {
		this.nodes = new Map();
		this.edges = new Map();
		this.nodeByEntityId = new Map();
		this.edgesBySource = new Map();
		this.edgesByTarget = new Map();
	}

	private getNodeStore(): NodeOps.NodeStore {
		return { nodes: this.nodes, nodeByEntityId: this.nodeByEntityId };
	}

	private getEdgeStore(): EdgeOps.EdgeStore {
		return { edges: this.edges, edgesBySource: this.edgesBySource, edgesByTarget: this.edgesByTarget };
	}

	private getGraphStore(): GraphQueries.GraphStore {
		return {
			nodes: this.nodes,
			edges: this.edges,
			nodeByEntityId: this.nodeByEntityId,
			edgesBySource: this.edgesBySource,
			edgesByTarget: this.edgesByTarget,
		};
	}

	// ==================== Node Operations ====================

	/**
	 * Add or update a node in the graph.
	 */
	addNode(node: WorkflowNode): void {
		NodeOps.addNode(this.getNodeStore(), node);
	}

	/**
	 * Remove a node and all its incident edges.
	 */
	removeNode(nodeId: string): void {
		const node = NodeOps.removeNode(this.getNodeStore(), nodeId);
		if (!node) return;

		// Remove edges where node is source or target
		const sourceEdges = this.edgesBySource.get(nodeId) || [];
		const targetEdges = this.edgesByTarget.get(nodeId) || [];
		const allEdges = [...sourceEdges, ...targetEdges];
		for (const edge of allEdges) {
			this.removeEdge(edge.id);
		}

		this.edgesBySource.delete(nodeId);
		this.edgesByTarget.delete(nodeId);
	}

	/**
	 * Get a node by its ID.
	 */
	getNode(nodeId: string): WorkflowNode | undefined {
		return NodeOps.getNode(this.getNodeStore(), nodeId);
	}

	/**
	 * Get a node by its entity ID.
	 */
	getNodeByEntityId(entityId: string): WorkflowNode | undefined {
		return NodeOps.getNodeByEntityId(this.getNodeStore(), entityId);
	}

	/**
	 * Find nodes by type.
	 */
	findNodesByType(type: WorkflowNodeType): WorkflowNode[] {
		return NodeOps.findNodesByType(this.getNodeStore(), type);
	}

	/**
	 * Find nodes by tag.
	 */
	findNodesByTag(tag: string): WorkflowNode[] {
		return NodeOps.findNodesByTag(this.getNodeStore(), tag);
	}

	/**
	 * Update node metadata.
	 */
	updateNodeMetadata(nodeId: string, metadata: Record<string, any>): void {
		NodeOps.updateNodeMetadata(this.getNodeStore(), nodeId, metadata);
	}

	// ==================== Edge Operations ====================

	/**
	 * Add or update an edge in the graph.
	 */
	addEdge(edge: WorkflowEdge): void {
		EdgeOps.addEdge(this.getEdgeStore(), edge);
	}

	/**
	 * Remove an edge.
	 */
	removeEdge(edgeId: string): void {
		EdgeOps.removeEdge(this.getEdgeStore(), edgeId);
	}

	/**
	 * Get edges where the given node is source.
	 */
	getOutgoingEdges(nodeId: string): WorkflowEdge[] {
		return EdgeOps.getOutgoingEdges(this.getEdgeStore(), nodeId);
	}

	/**
	 * Get edges where the given node is target.
	 */
	getIncomingEdges(nodeId: string): WorkflowEdge[] {
		return EdgeOps.getIncomingEdges(this.getEdgeStore(), nodeId);
	}

	/**
	 * Get edges of a specific type.
	 */
	findEdgesByType(type: WorkflowEdgeType): WorkflowEdge[] {
		return EdgeOps.findEdgesByType(this.getEdgeStore(), type);
	}

	/**
	 * Find edges between two nodes (any direction).
	 */
	findEdgesBetween(sourceId: string, targetId: string): WorkflowEdge[] {
		return EdgeOps.findEdgesBetween(this.getEdgeStore(), sourceId, targetId);
	}

	/**
	 * Update edge weight.
	 */
	updateEdgeWeight(edgeId: string, weight: number): void {
		EdgeOps.updateEdgeWeight(this.getEdgeStore(), edgeId, weight);
	}

	// ==================== Graph Queries ====================

	/**
	 * Get all nodes reachable from a given node via outgoing edges.
	 */
	getReachableNodes(nodeId: string, maxDepth = 5): WorkflowNode[] {
		return GraphQueries.getReachableNodes(this.getGraphStore(), nodeId, maxDepth);
	}

	/**
	 * Find the shortest path (by edge count) between two nodes.
	 */
	findShortestPath(sourceId: string, targetId: string): WorkflowNode[] | null {
		return GraphQueries.findShortestPath(this.getGraphStore(), sourceId, targetId);
	}

	/**
	 * Detect cycles in the graph (simple DFS).
	 */
	detectCycles(): string[][] {
		return GraphQueries.detectCycles(this.getGraphStore());
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
		return GraphQueries.getStatistics(this.getGraphStore());
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
		return IntegrationHelpers.createNodeFromEntity(entityId, entityType, label, metadata, tags);
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
		return IntegrationHelpers.createEdge(sourceId, targetId, type, weight, evidence);
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
		IntegrationHelpers.linkEntities(
			this.getGraphStore(),
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
	 * Clear the entire graph (for testing).
	 */
	clear(): void {
		IntegrationHelpers.clearGraph(this.getGraphStore());
	}
}