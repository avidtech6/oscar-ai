/**
 * Step executor for Multi‑Document Workflow Engine
 */

import type { WorkflowNode, WorkflowEdge, WorkflowEdgeType } from './WorkflowTypes';
import type { WorkflowTemplateStep } from './MultiDocumentWorkflowTypes';
import type { WorkflowGraphEngine } from './WorkflowGraphEngine';
import type { CrossDocumentIntelligenceEngine } from './CrossDocumentIntelligenceEngine';
import type { AutomaticTaskGenerationEngine } from './AutomaticTaskGenerationEngine';
import type { ProjectLevelReasoningEngine } from './ProjectLevelReasoningEngine';

export interface StepExecutionResult {
	success: boolean;
	node?: WorkflowNode;
	nodes?: WorkflowNode[];
	edge?: WorkflowEdge;
	edges?: WorkflowEdge[];
	error?: string;
}

/**
 * Execute a single workflow step.
 */
export function executeWorkflowStep(
	step: WorkflowTemplateStep,
	sourceNodes: WorkflowNode[],
	targetNodes: WorkflowNode[],
	graph: WorkflowGraphEngine,
	crossDoc: CrossDocumentIntelligenceEngine,
	taskGen: AutomaticTaskGenerationEngine,
	projectReasoning: ProjectLevelReasoningEngine
): StepExecutionResult {
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
				const tasks = taskGen.generateTasksForNode(sourceNode.id);
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
				graph.addNode(newNode);
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
				graph.linkEntities(
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
				const edges = graph.findEdgesBetween(sourceNode.id, targetNode.id);
				const edge = edges.find(e => e.type === edgeType);
				return { success: true, edge };
			}
			break;
		}
	}

	return { success: false, error: `Unsupported engine/action: ${engine}/${action}` };
}