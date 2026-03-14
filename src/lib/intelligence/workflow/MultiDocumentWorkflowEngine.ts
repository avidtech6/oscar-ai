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
import type { WorkflowTemplate, WorkflowTemplateStep } from './MultiDocumentWorkflowTypes';
import { getDefaultTemplates } from './MultiDocumentWorkflowTypes';
import { executeWorkflowStep, type StepExecutionResult } from './MultiDocumentWorkflowStepExecutor';

export { type WorkflowTemplate, type WorkflowTemplateStep };

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
		this.templates = getDefaultTemplates();
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
	): StepExecutionResult {
		return executeWorkflowStep(
			step,
			sourceNodes,
			targetNodes,
			this.graph,
			this.crossDoc,
			this.taskGen,
			this.projectReasoning
		);
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