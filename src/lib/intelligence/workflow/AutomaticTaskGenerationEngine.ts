/**
 * Automatic Task Generation Engine (Phase 25)
 * 
 * Generates tasks from notes, reports, voice notes, and user behaviour.
 * 
 * Uses the Workflow Graph Engine and Cross‑Document Intelligence Engine to detect
 * actionable content and propose tasks.
 * 
 * This is a thin wrapper delegating to extracted modules.
 */

import type { WorkflowNode, GeneratedTask } from './WorkflowTypes';
import { WorkflowGraphEngine } from './WorkflowGraphEngine';
import { CrossDocumentIntelligenceEngine } from './CrossDocumentIntelligenceEngine';
import { buildDefaultRules, type TaskGenerationRule } from './TaskGenerationRules';
import * as TaskGenerationCore from './TaskGenerationCore';
import * as TaskGenerationIntegration from './TaskGenerationIntegration';

export { type TaskGenerationRule } from './TaskGenerationRules';

export class AutomaticTaskGenerationEngine {
	private graph: WorkflowGraphEngine;
	private crossDoc: CrossDocumentIntelligenceEngine;
	private rules: TaskGenerationRule[];

	constructor(graph?: WorkflowGraphEngine, crossDoc?: CrossDocumentIntelligenceEngine) {
		this.graph = graph ?? new WorkflowGraphEngine();
		this.crossDoc = crossDoc ?? new CrossDocumentIntelligenceEngine(this.graph);
		this.rules = buildDefaultRules(this.crossDoc);
	}

	private getStore(): TaskGenerationCore.TaskGenerationStore {
		return { rules: this.rules };
	}

	private getIntegrationStore(): TaskGenerationIntegration.TaskIntegrationStore {
		return { graph: this.graph };
	}

	private getAllNodes(): WorkflowNode[] {
		// Access private nodes map (hacky but works for now)
		return Array.from((this.graph as any).nodes.values()) as WorkflowNode[];
	}

	// ==================== Core Generation ====================

	/**
	 * Scan all nodes and generate tasks based on rules.
	 */
	scanAndGenerateTasks(confidenceThreshold = 0.5): GeneratedTask[] {
		const nodes = this.getAllNodes();
		return TaskGenerationCore.scanAndGenerateTasks(this.getStore(), nodes, confidenceThreshold);
	}

	/**
	 * Generate tasks for a specific node (e.g., when a note is created).
	 */
	generateTasksForNode(nodeId: string): GeneratedTask[] {
		const node = this.graph.getNode(nodeId);
		if (!node) return [];
		return TaskGenerationCore.generateTasksForNode(this.getStore(), node);
	}

	/**
	 * Generate tasks from a list of node IDs.
	 */
	generateTasksFromNodes(nodeIds: string[]): GeneratedTask[] {
		return TaskGenerationCore.generateTasksFromNodes(
			this.getStore(),
			nodeIds,
			(id) => this.graph.getNode(id)
		);
	}

	// ==================== Rule Management ====================

	/**
	 * Add a custom rule.
	 */
	addRule(rule: TaskGenerationRule): void {
		this.rules.push(rule);
	}

	/**
	 * Remove a rule by ID.
	 */
	removeRule(ruleId: string): void {
		this.rules = this.rules.filter(r => r.id !== ruleId);
	}

	/**
	 * Get all rules.
	 */
	getRules(): TaskGenerationRule[] {
		return [...this.rules];
	}

	// ==================== Integration ====================

	/**
	 * Apply generated tasks to the workflow graph (create task nodes and edges).
	 */
	applyGeneratedTasks(tasks: GeneratedTask[]): void {
		TaskGenerationIntegration.applyGeneratedTasks(this.getIntegrationStore(), tasks);
	}

	/**
	 * Run full pipeline: scan, generate, apply.
	 */
	runFullPipeline(confidenceThreshold = 0.5): GeneratedTask[] {
		const tasks = this.scanAndGenerateTasks(confidenceThreshold);
		this.applyGeneratedTasks(tasks);
		return tasks;
	}

	// ==================== Statistics ====================

	/**
	 * Get statistics about generated tasks.
	 */
	getStatistics(): {
		totalGenerated: number;
		byRule: Record<string, number>;
		byNodeType: Record<string, number>;
		lastRun: Date | null;
	} {
		return TaskGenerationIntegration.getStatistics();
	}
}