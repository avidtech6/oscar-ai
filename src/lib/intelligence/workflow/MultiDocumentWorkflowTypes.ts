/**
 * Types and default templates for Multi‑Document Workflow Engine
 */

import type { WorkflowNode } from './WorkflowTypes';

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

/**
 * Default workflow templates.
 */
export function getDefaultTemplates(): WorkflowTemplate[] {
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