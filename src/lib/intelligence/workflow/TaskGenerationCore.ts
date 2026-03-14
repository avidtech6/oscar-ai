/**
 * Task Generation Core (extracted from AutomaticTaskGenerationEngine)
 * 
 * Contains scanning and generation logic.
 */

import type { WorkflowNode, GeneratedTask } from './WorkflowTypes';
import type { TaskGenerationRule } from './TaskGenerationRules';

export interface TaskGenerationStore {
	rules: TaskGenerationRule[];
}

/**
 * Scan all nodes and generate tasks based on rules.
 */
export function scanAndGenerateTasks(
	store: TaskGenerationStore,
	nodes: WorkflowNode[],
	confidenceThreshold = 0.5
): GeneratedTask[] {
	const generated: GeneratedTask[] = [];
	const now = new Date();

	for (const node of nodes) {
		for (const rule of store.rules) {
			if (rule.confidenceThreshold < confidenceThreshold) continue;
			try {
				if (rule.condition(node)) {
					const taskBase = rule.generate(node);
					const task: GeneratedTask = {
						...taskBase,
						id: `generated_task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
						createdAt: now,
						updatedAt: now,
					};
					generated.push(task);
					break; // only apply one rule per node
				}
			} catch (err) {
				console.warn(`Rule ${rule.id} failed for node ${node.id}:`, err);
			}
		}
	}

	return generated;
}

/**
 * Generate tasks for a specific node (e.g., when a note is created).
 */
export function generateTasksForNode(
	store: TaskGenerationStore,
	node: WorkflowNode
): GeneratedTask[] {
	const generated: GeneratedTask[] = [];
	const now = new Date();

	for (const rule of store.rules) {
		try {
			if (rule.condition(node)) {
				const taskBase = rule.generate(node);
				const task: GeneratedTask = {
					...taskBase,
					id: `generated_task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
					createdAt: now,
					updatedAt: now,
				};
				generated.push(task);
			}
		} catch (err) {
			console.warn(`Rule ${rule.id} failed for node ${node.id}:`, err);
		}
	}

	return generated;
}

/**
 * Generate tasks from a list of node IDs.
 */
export function generateTasksFromNodes(
	store: TaskGenerationStore,
	nodeIds: string[],
	getNode: (id: string) => WorkflowNode | undefined
): GeneratedTask[] {
	const tasks: GeneratedTask[] = [];
	for (const id of nodeIds) {
		const node = getNode(id);
		if (node) {
			tasks.push(...generateTasksForNode(store, node));
		}
	}
	return tasks;
}