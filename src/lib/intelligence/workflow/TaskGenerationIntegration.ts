/**
 * Task Generation Integration (extracted from AutomaticTaskGenerationEngine)
 * 
 * Contains applying generated tasks to the graph and running the full pipeline.
 */

import type { WorkflowGraphEngine } from './WorkflowGraphEngine';
import type { WorkflowNode, GeneratedTask } from './WorkflowTypes';

export interface TaskIntegrationStore {
	graph: WorkflowGraphEngine;
}

/**
 * Apply generated tasks to the workflow graph (create task nodes and edges).
 */
export function applyGeneratedTasks(
	store: TaskIntegrationStore,
	tasks: GeneratedTask[]
): void {
	for (const task of tasks) {
		// Create a task node in the graph
		const taskNode: WorkflowNode = {
			id: task.id,
			type: 'task',
			entityId: task.id,
			entityType: 'task',
			label: task.title,
			metadata: {
				description: task.description,
				priority: task.priority,
				estimatedDuration: task.estimatedDuration,
				deadline: task.deadline,
				assignedTo: task.assignedTo,
				status: task.status,
				sourceNodeIds: task.sourceNodeIds,
			},
			createdAt: task.createdAt,
			updatedAt: task.updatedAt,
			tags: ['auto‑generated'],
			confidence: 1.0,
		};
		store.graph.addNode(taskNode);

		// Link to source nodes
		for (const sourceId of task.sourceNodeIds) {
			const sourceNode = store.graph.getNodeByEntityId(sourceId);
			if (sourceNode) {
				store.graph.linkEntities(
					sourceNode.entityId,
					sourceNode.type,
					sourceNode.label,
					taskNode.entityId,
					'task',
					taskNode.label,
					'generatesTask',
					['AutomaticTaskGenerationEngine']
				);
			}
		}
	}
}

/**
 * Get statistics about generated tasks (placeholder).
 */
export function getStatistics(): {
	totalGenerated: number;
	byRule: Record<string, number>;
	byNodeType: Record<string, number>;
	lastRun: Date | null;
} {
	// This would require storing history; for now return placeholder
	return {
		totalGenerated: 0,
		byRule: {},
		byNodeType: {},
		lastRun: null,
	};
}