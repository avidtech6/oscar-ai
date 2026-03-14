/**
 * Project Context Manager (extracted from ProjectLevelReasoningEngine)
 * 
 * Handles project retrieval, context building, and status determination.
 */

import type { WorkflowGraphEngine } from './WorkflowGraphEngine';
import type { WorkflowNode, ProjectContext } from './WorkflowTypes';

export interface ProjectContextStore {
	graph: WorkflowGraphEngine;
}

/**
 * Get all projects (nodes of type 'project').
 */
export function getAllProjects(store: ProjectContextStore): WorkflowNode[] {
	return store.graph.findNodesByType('project');
}

/**
 * Get a project by its entity ID.
 */
export function getProject(store: ProjectContextStore, projectEntityId: string): WorkflowNode | undefined {
	return store.graph.getNodeByEntityId(projectEntityId);
}

/**
 * Get project context (including related nodes).
 */
export function getProjectContext(store: ProjectContextStore, projectEntityId: string): ProjectContext | null {
	const projectNode = getProject(store, projectEntityId);
	if (!projectNode) return null;

	// Find all nodes linked to this project (via 'belongsToProject' edges)
	const outgoing = store.graph.getOutgoingEdges(projectNode.id);
	const incoming = store.graph.getIncomingEdges(projectNode.id);
	const allEdges = [...outgoing, ...incoming];

	const nodeIds = new Set<string>();
	for (const edge of allEdges) {
		if (edge.type === 'belongsToProject' || edge.type === 'contains') {
			nodeIds.add(edge.sourceId === projectNode.id ? edge.targetId : edge.sourceId);
		}
	}

	// Also include nodes that are reachable within 2 steps (optional)
	const reachable = store.graph.getReachableNodes(projectNode.id, 2);
	reachable.forEach(node => nodeIds.add(node.id));

	// Determine status based on tasks and deadlines
	const status = determineProjectStatus(store, projectNode, Array.from(nodeIds));

	return {
		id: projectNode.entityId,
		name: projectNode.label,
		description: projectNode.metadata.description || '',
		nodeIds: Array.from(nodeIds),
		status,
		priority: projectNode.metadata.priority || 3,
		deadline: projectNode.metadata.deadline ? new Date(projectNode.metadata.deadline) : undefined,
		tags: projectNode.tags,
		metadata: projectNode.metadata,
		createdAt: projectNode.createdAt,
		updatedAt: projectNode.updatedAt,
	};
}

/**
 * Determine project status based on tasks, reports, and deadlines.
 */
export function determineProjectStatus(
	store: ProjectContextStore,
	projectNode: WorkflowNode,
	relatedNodeIds: string[]
): ProjectContext['status'] {
	// Default to active
	let status: ProjectContext['status'] = 'active';

	// Check for deadline
	const deadline = projectNode.metadata.deadline;
	if (deadline) {
		const now = new Date();
		const deadlineDate = new Date(deadline);
		if (deadlineDate < now) {
			status = 'onHold'; // overdue
		}
	}

	// Check if all tasks are completed
	const tasks = relatedNodeIds
		.map(id => store.graph.getNode(id))
		.filter((node): node is WorkflowNode => !!node && node.type === 'task');
	if (tasks.length > 0) {
		const allCompleted = tasks.every(task => task.metadata.status === 'completed');
		if (allCompleted) {
			status = 'completed';
		}
	}

	// Check for explicit status in metadata
	if (projectNode.metadata.status && ['active', 'completed', 'onHold', 'archived'].includes(projectNode.metadata.status)) {
		status = projectNode.metadata.status;
	}

	return status;
}