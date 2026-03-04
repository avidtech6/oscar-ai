/**
 * Project‑Level Reasoning Engine (Phase 25)
 * 
 * Understands project context, pending tasks, incomplete reports,
 * relevant notes/media, and produces prioritised answers.
 */

import type { WorkflowGraphEngine } from './WorkflowGraphEngine';
import type { WorkflowNode, ProjectContext, WorkflowGap, PredictedNextStep } from './WorkflowTypes';

export class ProjectLevelReasoningEngine {
	private graph: WorkflowGraphEngine;

	constructor(graph: WorkflowGraphEngine) {
		this.graph = graph;
	}

	/**
	 * Get all projects (nodes of type 'project').
	 */
	getAllProjects(): WorkflowNode[] {
		return this.graph.findNodesByType('project');
	}

	/**
	 * Get a project by its entity ID.
	 */
	getProject(projectEntityId: string): WorkflowNode | undefined {
		return this.graph.getNodeByEntityId(projectEntityId);
	}

	/**
	 * Get project context (including related nodes).
	 */
	getProjectContext(projectEntityId: string): ProjectContext | null {
		const projectNode = this.getProject(projectEntityId);
		if (!projectNode) return null;

		// Find all nodes linked to this project (via 'belongsToProject' edges)
		const outgoing = this.graph.getOutgoingEdges(projectNode.id);
		const incoming = this.graph.getIncomingEdges(projectNode.id);
		const allEdges = [...outgoing, ...incoming];

		const nodeIds = new Set<string>();
		for (const edge of allEdges) {
			if (edge.type === 'belongsToProject' || edge.type === 'contains') {
				nodeIds.add(edge.sourceId === projectNode.id ? edge.targetId : edge.sourceId);
			}
		}

		// Also include nodes that are reachable within 2 steps (optional)
		const reachable = this.graph.getReachableNodes(projectNode.id, 2);
		reachable.forEach(node => nodeIds.add(node.id));

		// Determine status based on tasks and deadlines
		const status = this.determineProjectStatus(projectNode, Array.from(nodeIds));

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
	private determineProjectStatus(projectNode: WorkflowNode, relatedNodeIds: string[]): ProjectContext['status'] {
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
			.map(id => this.graph.getNode(id))
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

	/**
	 * Analyse project gaps (missing tasks, incomplete reports, stale content).
	 */
	analyseProjectGaps(projectEntityId: string): WorkflowGap[] {
		const context = this.getProjectContext(projectEntityId);
		if (!context) return [];

		const gaps: WorkflowGap[] = [];
		const now = new Date();

		// 1. Missing tasks (no task nodes linked)
		const taskNodes = context.nodeIds
			.map(id => this.graph.getNode(id))
			.filter((node): node is WorkflowNode => !!node && node.type === 'task');
		if (taskNodes.length === 0) {
			gaps.push({
				id: `gap_${Date.now()}_1`,
				type: 'missingTask',
				description: 'No tasks defined for this project.',
				severity: 3,
				suggestedAction: 'Create at least one task to track progress.',
				relatedNodeIds: [],
				detectedAt: now,
				resolved: false,
			});
		}

		// 2. Incomplete reports (report nodes with status not 'completed')
		const reportNodes = context.nodeIds
			.map(id => this.graph.getNode(id))
			.filter((node): node is WorkflowNode => !!node && node.type === 'report');
		for (const report of reportNodes) {
			if (report.metadata.status !== 'completed') {
				gaps.push({
					id: `gap_${Date.now()}_2`,
					type: 'incompleteSection',
					description: `Report "${report.label}" is incomplete.`,
					severity: 4,
					suggestedAction: `Finish writing the report or update its status.`,
					relatedNodeIds: [report.id],
					detectedAt: now,
					resolved: false,
				});
			}
		}

		// 3. Stale content (notes/media older than 30 days without updates)
		const staleThreshold = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
		const contentNodes = context.nodeIds
			.map(id => this.graph.getNode(id))
			.filter((node): node is WorkflowNode => !!node && (node.type === 'note' || node.type === 'media'));
		for (const node of contentNodes) {
			const age = now.getTime() - node.updatedAt.getTime();
			if (age > staleThreshold) {
				gaps.push({
					id: `gap_${Date.now()}_3`,
					type: 'staleContent',
					description: `${node.type} "${node.label}" hasn't been updated in over 30 days.`,
					severity: 2,
					suggestedAction: 'Review and update or archive.',
					relatedNodeIds: [node.id],
					detectedAt: now,
					resolved: false,
				});
			}
		}

		// 4. Deadline approaching (within 7 days)
		if (context.deadline) {
			const daysUntilDeadline = (context.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
			if (daysUntilDeadline > 0 && daysUntilDeadline <= 7) {
				gaps.push({
					id: `gap_${Date.now()}_4`,
					type: 'deadlineApproaching',
					description: `Project deadline is in ${Math.ceil(daysUntilDeadline)} day(s).`,
					severity: 5,
					suggestedAction: 'Prioritise remaining tasks and send reminders.',
					relatedNodeIds: [],
					detectedAt: now,
					resolved: false,
				});
			}
		}

		return gaps;
	}

	/**
	 * Predict next steps for a project.
	 */
	predictNextSteps(projectEntityId: string): PredictedNextStep[] {
		const context = this.getProjectContext(projectEntityId);
		if (!context) return [];

		const steps: PredictedNextStep[] = [];
		const now = new Date();

		// 1. If there are incomplete tasks, suggest completing the highest priority one
		const taskNodes = context.nodeIds
			.map(id => this.graph.getNode(id))
			.filter((node): node is WorkflowNode => !!node && node.type === 'task' && node.metadata.status !== 'completed');
		if (taskNodes.length > 0) {
			const highestPriority = taskNodes.reduce((prev, curr) =>
				(curr.metadata.priority || 3) > (prev.metadata.priority || 3) ? curr : prev
			);
			steps.push({
				id: `pred_${Date.now()}_1`,
				description: `Complete task: ${highestPriority.label}`,
				confidence: 0.8,
				expectedEffort: highestPriority.metadata.estimatedDuration || 60,
				priority: highestPriority.metadata.priority || 3,
				relatedNodeIds: [highestPriority.id],
				trigger: 'user opens project',
				predictedAt: now,
			});
		}

		// 2. If there are notes without linked reports, suggest creating a report section
		const noteNodes = context.nodeIds
			.map(id => this.graph.getNode(id))
			.filter((node): node is WorkflowNode => !!node && node.type === 'note');
		for (const note of noteNodes) {
			const outgoing = this.graph.getOutgoingEdges(note.id);
			const hasReportLink = outgoing.some(edge => edge.type === 'usedAsSource' || edge.type === 'generatesReportSection');
			if (!hasReportLink) {
				steps.push({
					id: `pred_${Date.now()}_2`,
					description: `Create a report section from note: ${note.label}`,
					confidence: 0.6,
					expectedEffort: 30,
					priority: 2,
					relatedNodeIds: [note.id],
					trigger: 'note viewed',
					predictedAt: now,
				});
				break; // only suggest one
			}
		}

		// 3. If there are reports without blog posts, suggest generating a blog post
		const reportNodes = context.nodeIds
			.map(id => this.graph.getNode(id))
			.filter((node): node is WorkflowNode => !!node && node.type === 'report');
		for (const report of reportNodes) {
			const outgoing = this.graph.getOutgoingEdges(report.id);
			const hasBlogLink = outgoing.some(edge => edge.type === 'generatesBlogPost');
			if (!hasBlogLink && report.metadata.status === 'completed') {
				steps.push({
					id: `pred_${Date.now()}_3`,
					description: `Generate a blog post from report: ${report.label}`,
					confidence: 0.7,
					expectedEffort: 45,
					priority: 2,
					relatedNodeIds: [report.id],
					trigger: 'report published',
					predictedAt: now,
				});
				break;
			}
		}

		// 4. If project has no recent activity, suggest reviewing
		const lastActivity = this.getLastActivityDate(context.nodeIds);
		const daysInactive = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
		if (daysInactive > 14) {
			steps.push({
				id: `pred_${Date.now()}_4`,
				description: 'Review project progress and update plan',
				confidence: 0.9,
				expectedEffort: 20,
				priority: 1,
				relatedNodeIds: [],
				trigger: 'project opened',
				predictedAt: now,
			});
		}

		// Sort by priority (desc) and confidence (desc)
		return steps.sort((a, b) => {
			if (a.priority !== b.priority) return b.priority - a.priority;
			return b.confidence - a.confidence;
		});
	}

	/**
	 * Get the date of the most recent activity among a set of nodes.
	 */
	private getLastActivityDate(nodeIds: string[]): Date {
		let latest = new Date(0);
		for (const id of nodeIds) {
			const node = this.graph.getNode(id);
			if (node && node.updatedAt > latest) {
				latest = node.updatedAt;
			}
		}
		return latest;
	}

	/**
	 * Answer a natural‑language question about the project.
	 */
	answerQuestion(projectEntityId: string, question: string): string {
		const context = this.getProjectContext(projectEntityId);
		if (!context) return "I couldn't find that project.";

		const q = question.toLowerCase();
		if (q.includes('what') && q.includes('next')) {
			const steps = this.predictNextSteps(projectEntityId);
			if (steps.length === 0) return "No next steps predicted. The project seems up‑to‑date.";
			return `Next steps:\n${steps.map(s => `• ${s.description} (priority ${s.priority})`).join('\n')}`;
		}

		if (q.includes('gap') || q.includes('missing') || q.includes('incomplete')) {
			const gaps = this.analyseProjectGaps(projectEntityId);
			if (gaps.length === 0) return "No significant gaps detected.";
			return `Gaps detected:\n${gaps.map(g => `• ${g.description} (severity ${g.severity})`).join('\n')}`;
		}

		if (q.includes('status')) {
			return `Project "${context.name}" is ${context.status}. Priority ${context.priority}. ${context.deadline ? `Deadline: ${context.deadline.toLocaleDateString()}` : 'No deadline set.'}`;
		}

		if (q.includes('task') || q.includes('todo')) {
			const taskNodes = context.nodeIds
				.map(id => this.graph.getNode(id))
				.filter((node): node is WorkflowNode => !!node && node.type === 'task');
			const incomplete = taskNodes.filter(t => t.metadata.status !== 'completed');
			if (incomplete.length === 0) return "No pending tasks.";
			return `Pending tasks:\n${incomplete.map(t => `• ${t.label} (priority ${t.metadata.priority || 3})`).join('\n')}`;
		}

		if (q.includes('report')) {
			const reportNodes = context.nodeIds
				.map(id => this.graph.getNode(id))
				.filter((node): node is WorkflowNode => !!node && node.type === 'report');
			const incomplete = reportNodes.filter(r => r.metadata.status !== 'completed');
			if (incomplete.length === 0) return "All reports are complete.";
			return `Incomplete reports:\n${incomplete.map(r => `• ${r.label}`).join('\n')}`;
		}

		// Default answer
		return `Project "${context.name}" has ${context.nodeIds.length} linked items, status is ${context.status}. Use more specific questions about tasks, reports, gaps, or next steps.`;
	}

	/**
	 * Generate a summary of the project.
	 */
	generateSummary(projectEntityId: string): string {
		const context = this.getProjectContext(projectEntityId);
		if (!context) return 'Project not found.';

		const tasks = context.nodeIds
			.map(id => this.graph.getNode(id))
			.filter((node): node is WorkflowNode => !!node && node.type === 'task');
		const reports = context.nodeIds
			.map(id => this.graph.getNode(id))
			.filter((node): node is WorkflowNode => !!node && node.type === 'report');
		const notes = context.nodeIds
			.map(id => this.graph.getNode(id))
			.filter((node): node is WorkflowNode => !!node && node.type === 'note');
		const media = context.nodeIds
			.map(id => this.graph.getNode(id))
			.filter((node): node is WorkflowNode => !!node && node.type === 'media');

		const completedTasks = tasks.filter(t => t.metadata.status === 'completed').length;
		const completedReports = reports.filter(r => r.metadata.status === 'completed').length;

		return `
Project: ${context.name}
Status: ${context.status}
Priority: ${context.priority}
Deadline: ${context.deadline ? context.deadline.toLocaleDateString() : 'None'}
Linked items: ${tasks.length} tasks, ${reports.length} reports, ${notes.length} notes, ${media.length} media
Progress: ${completedTasks}/${tasks.length} tasks completed, ${completedReports}/${reports.length} reports completed
Last updated: ${context.updatedAt.toLocaleDateString()}
		`.trim();
	}
}