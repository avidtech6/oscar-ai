/**
 * Workflow‑Aware Context Mode (Phase 25)
 * 
 * Provides project‑aware suggestions:
 * - Surface relevant notes, tasks, media, reports
 * - Show project‑aware suggestions
 * - Refresh at intervals
 */

import type { WorkflowNode, WorkflowAwareContextConfig } from './WorkflowTypes';
import { WorkflowGraphEngine } from './WorkflowGraphEngine';
import { ProjectLevelReasoningEngine } from './ProjectLevelReasoningEngine';

export interface ContextSuggestion {
	id: string;
	type: 'note' | 'task' | 'report' | 'media' | 'blogPost' | 'project';
	nodeId: string;
	title: string;
	description: string;
	relevanceScore: number; // 0‑1
	action?: 'open' | 'edit' | 'complete' | 'link' | 'ignore';
	metadata: Record<string, any>;
}

export class WorkflowAwareContextMode {
	private graph: WorkflowGraphEngine;
	private projectReasoning: ProjectLevelReasoningEngine;
	private config: WorkflowAwareContextConfig;
	private refreshIntervalId: NodeJS.Timeout | null = null;

	constructor(
		graph?: WorkflowGraphEngine,
		projectReasoning?: ProjectLevelReasoningEngine,
		config?: Partial<WorkflowAwareContextConfig>
	) {
		this.graph = graph ?? new WorkflowGraphEngine();
		this.projectReasoning = projectReasoning ?? new ProjectLevelReasoningEngine(this.graph);
		this.config = {
			showProjectSuggestions: true,
			surfaceRelevantNotes: true,
			surfaceRelevantTasks: true,
			surfaceRelevantMedia: true,
			surfaceRelevantReports: true,
			maxSuggestions: 10,
			refreshInterval: 30, // seconds
			...config,
		};
	}

	// ==================== Core Suggestions ====================

	/**
	 * Get suggestions for the current context (e.g., based on active project, recent nodes).
	 */
	getSuggestions(projectId?: string): ContextSuggestion[] {
		const suggestions: ContextSuggestion[] = [];

		if (this.config.showProjectSuggestions && projectId) {
			suggestions.push(...this.getProjectSuggestions(projectId));
		}

		if (this.config.surfaceRelevantNotes) {
			suggestions.push(...this.getNoteSuggestions(projectId));
		}

		if (this.config.surfaceRelevantTasks) {
			suggestions.push(...this.getTaskSuggestions(projectId));
		}

		if (this.config.surfaceRelevantMedia) {
			suggestions.push(...this.getMediaSuggestions(projectId));
		}

		if (this.config.surfaceRelevantReports) {
			suggestions.push(...this.getReportSuggestions(projectId));
		}

		// Sort by relevance and limit
		suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
		return suggestions.slice(0, this.config.maxSuggestions);
	}

	private getProjectSuggestions(projectId: string): ContextSuggestion[] {
		const context = this.projectReasoning.getProjectContext(projectId);
		if (!context) return [];

		const suggestions: ContextSuggestion[] = [];

		// Suggest completing the project if many pending tasks
		const pendingTasks = context.nodeIds
			.map(id => this.graph.getNode(id))
			.filter((node): node is WorkflowNode => !!node && node.type === 'task' && node.metadata.status !== 'completed');
		if (pendingTasks.length > 0) {
			suggestions.push({
				id: `project_${projectId}_complete`,
				type: 'project',
				nodeId: projectId,
				title: `Complete project: ${context.name}`,
				description: `${pendingTasks.length} pending tasks. Consider marking as completed.`,
				relevanceScore: 0.8,
				action: 'complete',
				metadata: { pendingTasks: pendingTasks.length },
			});
		}

		// Suggest linking missing nodes
		const missingLinks = this.projectReasoning.analyseProjectGaps(projectId);
		if (missingLinks.length > 0) {
			suggestions.push({
				id: `project_${projectId}_gaps`,
				type: 'project',
				nodeId: projectId,
				title: `Fill gaps in project: ${context.name}`,
				description: `${missingLinks.length} gaps detected (e.g., missing notes, incomplete sections).`,
				relevanceScore: 0.7,
				action: 'link',
				metadata: { gaps: missingLinks.length },
			});
		}

		return suggestions;
	}

	private getNoteSuggestions(projectId?: string): ContextSuggestion[] {
		const notes = this.graph.findNodesByType('note');
		const suggestions: ContextSuggestion[] = [];

		for (const note of notes) {
			// Filter by project if needed
			if (projectId) {
				const context = this.projectReasoning.getProjectContext(projectId);
				if (!context?.nodeIds.includes(note.id)) continue;
			}

			// Suggest if note is old and not linked
			const age = Date.now() - note.createdAt.getTime();
			const daysOld = age / (1000 * 60 * 60 * 24);
			const outgoing = this.graph.getOutgoingEdges(note.id);
			const hasLinks = outgoing.length > 0;

			if (daysOld > 7 && !hasLinks) {
				suggestions.push({
					id: `note_${note.id}_unlinked`,
					type: 'note',
					nodeId: note.id,
					title: `Unlinked note: ${note.label}`,
					description: 'This note has not been linked to any report or task for over a week.',
					relevanceScore: 0.6,
					action: 'link',
					metadata: { daysOld: Math.floor(daysOld) },
				});
			}
		}

		return suggestions;
	}

	private getTaskSuggestions(projectId?: string): ContextSuggestion[] {
		const tasks = this.graph.findNodesByType('task');
		const suggestions: ContextSuggestion[] = [];

		for (const task of tasks) {
			if (projectId) {
				const context = this.projectReasoning.getProjectContext(projectId);
				if (!context?.nodeIds.includes(task.id)) continue;
			}

			const status = task.metadata.status;
			if (status === 'pending') {
				const deadline = task.metadata.deadline;
				if (deadline) {
					const dueIn = new Date(deadline).getTime() - Date.now();
					const daysDue = dueIn / (1000 * 60 * 60 * 24);
					if (daysDue < 2) {
						suggestions.push({
							id: `task_${task.id}_deadline`,
							type: 'task',
							nodeId: task.id,
							title: `Upcoming deadline: ${task.label}`,
							description: `Due in ${Math.ceil(daysDue * 24)} hours.`,
							relevanceScore: 0.9,
							action: 'complete',
							metadata: { dueInHours: Math.ceil(daysDue * 24) },
						});
					}
				}
			}
		}

		return suggestions;
	}

	private getMediaSuggestions(projectId?: string): ContextSuggestion[] {
		const media = this.graph.findNodesByType('media');
		const suggestions: ContextSuggestion[] = [];

		for (const item of media) {
			if (projectId) {
				const context = this.projectReasoning.getProjectContext(projectId);
				if (!context?.nodeIds.includes(item.id)) continue;
			}

			// Suggest if media is not linked to any note/report
			const outgoing = this.graph.getOutgoingEdges(item.id);
			const hasLinks = outgoing.length > 0;
			if (!hasLinks) {
				suggestions.push({
					id: `media_${item.id}_unlinked`,
					type: 'media',
					nodeId: item.id,
					title: `Unlinked media: ${item.label}`,
					description: 'This media item is not linked to any note or report.',
					relevanceScore: 0.5,
					action: 'link',
					metadata: {},
				});
			}
		}

		return suggestions;
	}

	private getReportSuggestions(projectId?: string): ContextSuggestion[] {
		const reports = this.graph.findNodesByType('report');
		const suggestions: ContextSuggestion[] = [];

		for (const report of reports) {
			if (projectId) {
				const context = this.projectReasoning.getProjectContext(projectId);
				if (!context?.nodeIds.includes(report.id)) continue;
			}

			const status = report.metadata.status;
			if (status === 'draft' || status === 'inProgress') {
				suggestions.push({
					id: `report_${report.id}_incomplete`,
					type: 'report',
					nodeId: report.id,
					title: `Incomplete report: ${report.label}`,
					description: 'This report is still in draft or in‑progress.',
					relevanceScore: 0.7,
					action: 'edit',
					metadata: { status },
				});
			}
		}

		return suggestions;
	}

	// ==================== Configuration ====================

	/**
	 * Update configuration.
	 */
	updateConfig(config: Partial<WorkflowAwareContextConfig>): void {
		this.config = { ...this.config, ...config };
		this.restartRefreshInterval();
	}

	/**
	 * Get current configuration.
	 */
	getConfig(): WorkflowAwareContextConfig {
		return { ...this.config };
	}

	// ==================== Auto‑Refresh ====================

	/**
	 * Start automatic refresh of suggestions.
	 */
	startAutoRefresh(callback: (suggestions: ContextSuggestion[]) => void): void {
		this.stopAutoRefresh();
		if (this.config.refreshInterval <= 0) return;

		this.refreshIntervalId = setInterval(() => {
			const suggestions = this.getSuggestions();
			callback(suggestions);
		}, this.config.refreshInterval * 1000);
	}

	/**
	 * Stop automatic refresh.
	 */
	stopAutoRefresh(): void {
		if (this.refreshIntervalId) {
			clearInterval(this.refreshIntervalId);
			this.refreshIntervalId = null;
		}
	}

	private restartRefreshInterval(): void {
		// If there's an active callback, we would need to re‑start; for simplicity, just stop.
		this.stopAutoRefresh();
	}

	// ==================== Integration ====================

	/**
	 * Register a node as "active" (e.g., user is viewing it) to influence suggestions.
	 */
	setActiveNode(nodeId: string): void {
		// Could adjust relevance scores based on active node
		// For now, just a placeholder
	}

	/**
	 * Dismiss a suggestion (so it doesn't appear again).
	 */
	dismissSuggestion(suggestionId: string): void {
		// Could store dismissed IDs in localStorage or a set
		// For now, just a placeholder
	}

	// ==================== Statistics ====================

	/**
	 * Get statistics about suggestions.
	 */
	getStatistics(): {
		totalGenerated: number;
		totalDismissed: number;
		byType: Record<string, number>;
		lastRefresh: Date | null;
	} {
		// Placeholder
		return {
			totalGenerated: 0,
			totalDismissed: 0,
			byType: {},
			lastRefresh: null,
		};
	}
}