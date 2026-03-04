/**
 * Automatic Task Generation Engine (Phase 25)
 * 
 * Generates tasks from notes, reports, voice notes, and user behaviour.
 * 
 * Uses the Workflow Graph Engine and Cross‑Document Intelligence Engine to detect
 * actionable content and propose tasks.
 */

import type { WorkflowNode, GeneratedTask } from './WorkflowTypes';
import { WorkflowGraphEngine } from './WorkflowGraphEngine';
import { CrossDocumentIntelligenceEngine } from './CrossDocumentIntelligenceEngine';

export interface TaskGenerationRule {
	/** Rule ID */
	id: string;
	/** Description */
	description: string;
	/** Condition function (returns true if rule applies) */
	condition: (node: WorkflowNode) => boolean;
	/** Generate task from node */
	generate: (node: WorkflowNode) => Omit<GeneratedTask, 'id' | 'createdAt' | 'updatedAt'>;
	/** Priority (1‑5) */
	priority: number;
	/** Confidence threshold (0‑1) */
	confidenceThreshold: number;
}

export class AutomaticTaskGenerationEngine {
	private graph: WorkflowGraphEngine;
	private crossDoc: CrossDocumentIntelligenceEngine;
	private rules: TaskGenerationRule[];

	constructor(graph?: WorkflowGraphEngine, crossDoc?: CrossDocumentIntelligenceEngine) {
		this.graph = graph ?? new WorkflowGraphEngine();
		this.crossDoc = crossDoc ?? new CrossDocumentIntelligenceEngine(this.graph);
		this.rules = this.buildDefaultRules();
	}

	// ==================== Rule Definitions ====================

	private buildDefaultRules(): TaskGenerationRule[] {
		return [
			{
				id: 'note_contains_action',
				description: 'Note contains action words (need to, must, should, todo)',
				condition: (node) => {
					if (node.type !== 'note') return false;
					const content = (node.metadata.content || '').toLowerCase();
					const actionWords = ['need to', 'must', 'should', 'todo', 'task', 'do', 'finish', 'complete'];
					return actionWords.some(word => content.includes(word));
				},
				generate: (node) => ({
					title: `Task from note: ${node.label.substring(0, 50)}`,
					description: `Generated from note "${node.label}".\n\nContent: ${node.metadata.content?.substring(0, 200) || ''}`,
					sourceNodeIds: [node.id],
					priority: 3,
					estimatedDuration: 60,
					deadline: undefined,
					assignedTo: undefined,
					status: 'pending',
				}),
				priority: 3,
				confidenceThreshold: 0.7,
			},
			{
				id: 'report_incomplete_section',
				description: 'Report has incomplete sections',
				condition: (node) => {
					if (node.type !== 'report') return false;
					return node.metadata.status !== 'completed' && node.metadata.sections?.some((s: any) => !s.completed);
				},
				generate: (node) => ({
					title: `Complete section in report: ${node.label}`,
					description: `Report "${node.label}" has incomplete sections that need attention.`,
					sourceNodeIds: [node.id],
					priority: 4,
					estimatedDuration: 120,
					deadline: node.metadata.deadline ? new Date(node.metadata.deadline) : undefined,
					assignedTo: undefined,
					status: 'pending',
				}),
				priority: 4,
				confidenceThreshold: 0.8,
			},
			{
				id: 'voice_note_transcribed',
				description: 'Voice note recently transcribed',
				condition: (node) => {
					if (node.type !== 'voiceNote') return false;
					// If transcribed within last 24 hours
					const transcribedAt = node.metadata.transcribedAt;
					if (!transcribedAt) return false;
					const age = Date.now() - new Date(transcribedAt).getTime();
					return age < 24 * 60 * 60 * 1000;
				},
				generate: (node) => ({
					title: `Review transcribed voice note: ${node.label}`,
					description: `Voice note "${node.label}" was recently transcribed. Review and create follow‑up actions.`,
					sourceNodeIds: [node.id],
					priority: 2,
					estimatedDuration: 15,
					deadline: undefined,
					assignedTo: undefined,
					status: 'pending',
				}),
				priority: 2,
				confidenceThreshold: 0.6,
			},
			{
				id: 'user_behavior_frequent_note',
				description: 'User frequently creates notes on a topic',
				condition: (node) => {
					if (node.type !== 'note') return false;
					// Simplified: if note has tags that appear often
					const tags = node.tags;
					if (tags.length === 0) return false;
					// For now, just a placeholder
					return tags.includes('urgent') || tags.includes('followup');
				},
				generate: (node) => ({
					title: `Follow up on topic: ${node.tags.join(', ')}`,
					description: `Multiple notes tagged with ${node.tags.join(', ')} suggest a need for a dedicated task.`,
					sourceNodeIds: [node.id],
					priority: 3,
					estimatedDuration: 90,
					deadline: undefined,
					assignedTo: undefined,
					status: 'pending',
				}),
				priority: 3,
				confidenceThreshold: 0.5,
			},
			{
				id: 'cross_doc_suggestion',
				description: 'Cross‑document intelligence suggests a task',
				condition: (node) => {
					if (node.type !== 'note') return false;
					const detection = this.crossDoc.detectNoteShouldBecomeTask(node.entityId);
					return detection.should && detection.confidence >= 0.7;
				},
				generate: (node) => ({
					title: `Task suggested by AI: ${node.label}`,
					description: `Cross‑document analysis indicates this note should become a task.`,
					sourceNodeIds: [node.id],
					priority: 3,
					estimatedDuration: 45,
					deadline: undefined,
					assignedTo: undefined,
					status: 'pending',
				}),
				priority: 3,
				confidenceThreshold: 0.7,
			},
		];
	}

	// ==================== Core Generation ====================

	/**
	 * Scan all nodes and generate tasks based on rules.
	 */
	scanAndGenerateTasks(confidenceThreshold = 0.5): GeneratedTask[] {
		const allNodes = Array.from((this.graph as any).nodes.values()) as WorkflowNode[];
		const generated: GeneratedTask[] = [];
		const now = new Date();

		for (const node of allNodes) {
			for (const rule of this.rules) {
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
	generateTasksForNode(nodeId: string): GeneratedTask[] {
		const node = this.graph.getNode(nodeId);
		if (!node) return [];

		const generated: GeneratedTask[] = [];
		const now = new Date();

		for (const rule of this.rules) {
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
	generateTasksFromNodes(nodeIds: string[]): GeneratedTask[] {
		const tasks: GeneratedTask[] = [];
		for (const id of nodeIds) {
			tasks.push(...this.generateTasksForNode(id));
		}
		return tasks;
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
			this.graph.addNode(taskNode);

			// Link to source nodes
			for (const sourceId of task.sourceNodeIds) {
				const sourceNode = this.graph.getNodeByEntityId(sourceId);
				if (sourceNode) {
					this.graph.linkEntities(
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
		// This would require storing history; for now return placeholder
		return {
			totalGenerated: 0,
			byRule: {},
			byNodeType: {},
			lastRun: null,
		};
	}
}