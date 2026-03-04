/**
 * Multi‑Document Workflow Engine (Phase 25)
 * 
 * Supports workflows like:
 * - notes → report
 * - report → blog post
 * - notes → tasks
 * - tasks → project plan
 * 
 * Orchestrates conversion between document types using existing engines.
 */

import type { WorkflowNode, WorkflowEdge, MultiDocumentWorkflow, WorkflowEdgeType } from './WorkflowTypes';
import { WorkflowGraphEngine } from './WorkflowGraphEngine';
import { CrossDocumentIntelligenceEngine } from './CrossDocumentIntelligenceEngine';
import { AutomaticTaskGenerationEngine } from './AutomaticTaskGenerationEngine';
import { ProjectLevelReasoningEngine } from './ProjectLevelReasoningEngine';

export interface WorkflowTemplate {
	id: string;
	name: string;
	description: string;
	/** Source node types */
	sourceTypes: string[];
	/** Target node types */
	targetTypes: string[];
	/** Steps to execute */
	steps: WorkflowTemplateStep[];
	/** Conditions for applicability */
	condition?: (sourceNodes: WorkflowNode[]) => boolean;
}

export interface WorkflowTemplateStep {
	id: string;
	action: 'convert' | 'enrich' | 'link' | 'create' | 'notify';
	/** Engine to use */
	engine: 'crossDoc' | 'taskGen' | 'projectReasoning' | 'graph';
	/** Parameters */
	params: Record<string, any>;
	/** Expected output */
	outputType: string;
}

export class MultiDocumentWorkflowEngine {
	private graph: WorkflowGraphEngine;
	private crossDoc: CrossDocumentIntelligenceEngine;
	private taskGen: AutomaticTaskGenerationEngine;
	private projectReasoning: ProjectLevelReasoningEngine;
	private templates: WorkflowTemplate[];

	constructor(
		graph?: WorkflowGraphEngine,
		crossDoc?: CrossDocumentIntelligenceEngine,
		taskGen?: AutomaticTaskGenerationEngine,
		projectReasoning?: ProjectLevelReasoningEngine
	) {
		this.graph = graph ?? new WorkflowGraphEngine();
		this.crossDoc = crossDoc ?? new CrossDocumentIntelligenceEngine(this.graph);
		this.taskGen = taskGen ?? new AutomaticTaskGenerationEngine(this.graph, this.crossDoc);
		this.projectReasoning = projectReasoning ?? new ProjectLevelReasoningEngine(this.graph);
		this.templates = this.buildDefaultTemplates();
	}

	// ==================== Default Templates ====================

	private buildDefaultTemplates(): WorkflowTemplate[] {
		return [
			{
				id: 'note_to_report',
				name: 'Note → Report',
				description: 'Convert a note into a structured report',
				sourceTypes: ['note'],
				targetTypes: ['report'],
				steps: [
					{
						id: 'detect_report_candidate',
						action: 'convert',
						engine: 'crossDoc',
						params: { operation: 'detectNoteShouldBecomeReport' },
						outputType: 'detectionResult',
					},
					{
						id: 'create_report_node',
						action: 'create',
						engine: 'graph',
						params: { nodeType: 'report', labelPrefix: 'Report from note' },
						outputType: 'node',
					},
					{
						id: 'link_source',
						action: 'link',
						engine: 'graph',
						params: { edgeType: 'becomesReport' },
						outputType: 'edge',
					},
					{
						id: 'enrich_with_project_context',
						action: 'enrich',
						engine: 'projectReasoning',
						params: { operation: 'getProjectContext' },
						outputType: 'enrichedMetadata',
					},
				],
				condition: (sourceNodes) => {
					if (sourceNodes.length !== 1) return false;
					const node = sourceNodes[0];
					return node.type === 'note' && node.metadata.content?.length > 100;
				},
			},
			{
				id: 'report_to_blog',
				name: 'Report → Blog Post',
				description: 'Transform a completed report into a blog post',
				sourceTypes: ['report'],
				targetTypes: ['blogPost'],
				steps: [
					{
						id: 'check_report_complete',
						action: 'convert',
						engine: 'crossDoc',
						params: { operation: 'detectReportShouldBecomeBlogPost' },
						outputType: 'detectionResult',
					},
					{
						id: 'create_blog_node',
						action: 'create',
						engine: 'graph',
						params: { nodeType: 'blogPost', labelPrefix: 'Blog: ' },
						outputType: 'node',
					},
					{
						id: 'link_source',
						action: 'link',
						engine: 'graph',
						params: { edgeType: 'becomesBlogPost' },
						outputType: 'edge',
					},
				],
				condition: (sourceNodes) => {
					if (sourceNodes.length !== 1) return false;
					const node = sourceNodes[0];
					return node.type === 'report' && node.metadata.status === 'completed';
				},
			},
			{
				id: 'notes_to_tasks',
				name: 'Notes → Tasks',
				description: 'Generate tasks from a collection of notes',
				sourceTypes: ['note'],
				targetTypes: ['task'],
				steps: [
					{
						id: 'generate_tasks',
						action: 'create',
						engine: 'taskGen',
						params: { operation: 'generateTasksFromNodes' },
						outputType: 'tasks',
					},
					{
						id: 'link_tasks',
						action: 'link',
						engine: 'graph',
						params: { edgeType: 'generatesTask' },
						outputType: 'edges',
					},
				],
				condition: (sourceNodes) => {
					return sourceNodes.length >= 1 && sourceNodes.every(n => n.type === 'note');
				},
			},
			{
				id: 'tasks_to_project_plan',
				name: 'Tasks → Project Plan',
				description: 'Group related tasks into a project plan',
				sourceTypes: ['task'],
				targetTypes: ['project'],
				steps: [
					{
						id: 'cluster_tasks',
						action: 'enrich',
						engine: 'projectReasoning',
						params: { operation: 'clusterTasksIntoProject' },
						outputType: 'projectPlan',
					},
					{
						id: 'create_project_node',
						action: 'create',
						engine: 'graph',
						params: { nodeType: 'project', labelPrefix: 'Project: ' },
						outputType: 'node',
					},
					{
						id: 'link_tasks',
						action: 'link',
						engine: 'graph',
						params: { edgeType: 'belongsToProject' },
						outputType: 'edges',
					},
				],
				condition: (sourceNodes) => {
					return sourceNodes.length >= 2 && sourceNodes.every(n => n.type === 'task');
				},
			},
			{
				id: 'note_to_task',
				name: 'Single Note → Task',
				description: 'Convert a single note into a task',
				sourceTypes: ['note'],
				targetTypes: ['task'],
				steps: [
					{
						id: 'detect_task_candidate',
						action: 'convert',
						engine: 'crossDoc',
						params: { operation: 'detectNoteShouldBecomeTask' },
						outputType: 'detectionResult',
					},
					{
						id: 'generate_task',
						action: 'create',
						engine: 'taskGen',
						params: { operation: 'generateTasksForNode' },
						outputType: 'task',
					},
					{
						id: 'link_source',
						action: 'link',
						engine: 'graph',
						params: { edgeType: 'becomesTask' },
						outputType: 'edge',
					},
				],
				condition: (sourceNodes) => {
					if (sourceNodes.length !== 1) return false;
					const node = sourceNodes[0];
					return node.type === 'note' && node.tags.includes('actionable');
				},
			},
		];
	}

	// ==================== Core Workflow Execution ====================

	/**
	 * Find applicable templates for a set of source nodes.
	 */
	findApplicableTemplates(sourceNodeIds: string[]): WorkflowTemplate[] {
		const sourceNodes = sourceNodeIds.map(id => this.graph.getNode(id)).filter(Boolean) as WorkflowNode[];
		if (sourceNodes.length === 0) return [];

		return this.templates.filter(template => {
			// Check source types match
			const sourceTypes = sourceNodes.map(n => n.type);
			const requiredTypes = template.sourceTypes;
			if (sourceTypes.length !== requiredTypes.length) return false;
			for (let i = 0; i < sourceTypes.length; i++) {
				if (sourceTypes[i] !== requiredTypes[i]) return false;
			}
			// Check custom condition if present
			if (template.condition) {
				return template.condition(sourceNodes);
			}
			return true;
		});
	}

	/**
	 * Execute a workflow template.
	 * Returns the created target nodes and edges.
	 */
	executeTemplate(templateId: string, sourceNodeIds: string[]): {
		success: boolean;
		targetNodes: WorkflowNode[];
		edges: WorkflowEdge[];
		errors: string[];
	} {
		const template = this.templates.find(t => t.id === templateId);
		if (!template) {
			return { success: false, targetNodes: [], edges: [], errors: [`Template ${templateId} not found`] };
		}

		const sourceNodes = sourceNodeIds.map(id => this.graph.getNode(id)).filter(Boolean) as WorkflowNode[];
		if (sourceNodes.length === 0) {
			return { success: false, targetNodes: [], edges: [], errors: ['No valid source nodes'] };
		}

		const targetNodes: WorkflowNode[] = [];
		const edges: WorkflowEdge[] = [];
		const errors: string[] = [];

		// Execute each step
		for (const step of template.steps) {
			try {
				const result = this.executeStep(step, sourceNodes, targetNodes);
				if (result.success) {
					if (result.node) targetNodes.push(result.node);
					if (result.nodes) targetNodes.push(...result.nodes);
					if (result.edge) edges.push(result.edge);
					if (result.edges) edges.push(...result.edges);
				} else {
					errors.push(`Step ${step.id} failed: ${result.error}`);
				}
			} catch (err) {
				errors.push(`Step ${step.id} threw: ${err}`);
			}
		}

		return {
			success: errors.length === 0,
			targetNodes,
			edges,
			errors,
		};
	}

	private executeStep(
		step: WorkflowTemplateStep,
		sourceNodes: WorkflowNode[],
		targetNodes: WorkflowNode[]
	): { success: boolean; node?: WorkflowNode; nodes?: WorkflowNode[]; edge?: WorkflowEdge; edges?: WorkflowEdge[]; error?: string } {
		const { engine, action, params } = step;

		switch (engine) {
			case 'crossDoc': {
				if (action === 'convert') {
					const sourceNode = sourceNodes[0];
					if (!sourceNode) return { success: false, error: 'No source node' };
					// Placeholder detection – always succeed for note → report
					const detection = { should: true, reason: 'Placeholder detection' };
					return { success: detection.should, error: detection.reason };
				}
				break;
			}
			case 'taskGen': {
				if (action === 'create') {
					const sourceNode = sourceNodes[0];
					if (!sourceNode) return { success: false, error: 'No source node' };
					const tasks = this.taskGen.generateTasksForNode(sourceNode.id);
					if (tasks.length === 0) {
						return { success: false, error: 'No tasks generated' };
					}
					// For simplicity, we just return the first task as a node (task nodes are created later)
					const taskNode: WorkflowNode = {
						id: tasks[0].id,
						type: 'task',
						entityId: tasks[0].id,
						entityType: 'task',
						label: tasks[0].title,
						metadata: tasks[0],
						createdAt: tasks[0].createdAt,
						updatedAt: tasks[0].updatedAt,
						tags: ['auto‑generated'],
						confidence: 1.0,
					};
					return { success: true, node: taskNode };
				}
				break;
			}
			case 'projectReasoning': {
				if (action === 'enrich') {
					// Placeholder: just return success
					return { success: true };
				}
				break;
			}
			case 'graph': {
				if (action === 'create') {
					const nodeType = params.nodeType as string;
					const labelPrefix = params.labelPrefix as string;
					const sourceNode = sourceNodes[0];
					const label = labelPrefix + (sourceNode?.label || '');
					const newNode: WorkflowNode = {
						id: `generated_${nodeType}_${Date.now()}`,
						type: nodeType as any,
						entityId: `entity_${Date.now()}`,
						entityType: nodeType,
						label,
						metadata: {},
						createdAt: new Date(),
						updatedAt: new Date(),
						tags: ['workflow‑generated'],
						confidence: 0.9,
					};
					this.graph.addNode(newNode);
					return { success: true, node: newNode };
				}
				if (action === 'link') {
					const sourceNode = sourceNodes[0];
					const targetNode = targetNodes[0];
					if (!sourceNode || !targetNode) {
						return { success: false, error: 'Missing source/target node' };
					}
					const edgeType = params.edgeType as WorkflowEdgeType;
					// linkEntities creates the edge internally
					this.graph.linkEntities(
						sourceNode.entityId,
						sourceNode.type,
						sourceNode.label,
						targetNode.entityId,
						targetNode.type,
						targetNode.label,
						edgeType,
						['MultiDocumentWorkflowEngine']
					);
					// Retrieve the created edge
					const edges = this.graph.findEdgesBetween(sourceNode.id, targetNode.id);
					const edge = edges.find(e => e.type === edgeType);
					return { success: true, edge };
				}
				break;
			}
		}

		return { success: false, error: `Unsupported engine/action: ${engine}/${action}` };
	}

	// ==================== Workflow Discovery ====================

	/**
	 * Discover potential workflows in the graph.
	 */
	discoverWorkflows(): MultiDocumentWorkflow[] {
		const allNodes = Array.from((this.graph as any).nodes.values()) as WorkflowNode[];
		const workflows: MultiDocumentWorkflow[] = [];

		// For each node, see if it can be a source for any template
		for (const node of allNodes) {
			const templates = this.findApplicableTemplates([node.id]);
			for (const template of templates) {
				workflows.push({
					id: `discovered_${template.id}_${node.id}`,
					name: template.name,
					description: template.description,
					steps: [], // placeholder
					inputTypes: template.sourceTypes as any,
					outputTypes: template.targetTypes as any,
					example: '',
					successCriteria: [],
					createdAt: new Date(),
					updatedAt: new Date(),
				});
			}
		}

		return workflows;
	}

	/**
	 * Suggest workflows for a given node.
	 */
	suggestWorkflows(nodeId: string): WorkflowTemplate[] {
		return this.findApplicableTemplates([nodeId]);
	}

	// ==================== Template Management ====================

	/**
	 * Add a custom template.
	 */
	addTemplate(template: WorkflowTemplate): void {
		this.templates.push(template);
	}

	/**
	 * Remove a template by ID.
	 */
	removeTemplate(templateId: string): void {
		this.templates = this.templates.filter(t => t.id !== templateId);
	}

	/**
	 * Get all templates.
	 */
	getTemplates(): WorkflowTemplate[] {
		return [...this.templates];
	}

	// ==================== Statistics ====================

	/**
	 * Get execution statistics.
	 */
	getStatistics(): {
		totalExecutions: number;
		successful: number;
		failed: number;
		byTemplate: Record<string, number>;
	} {
		// Placeholder – would require tracking executions
		return {
			totalExecutions: 0,
			successful: 0,
			failed: 0,
			byTemplate: {},
		};
	}
}