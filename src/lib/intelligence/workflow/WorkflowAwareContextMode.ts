/**
 * Workflow‑Aware Context Mode (Phase 25)
 * 
 * Provides project‑aware suggestions:
 * - Surface relevant notes, tasks, media, reports
 * - Show project‑aware suggestions
 * - Refresh at intervals
 * 
 * This is a thin wrapper delegating to extracted modules.
 */

import type { WorkflowNode, WorkflowAwareContextConfig, ContextSuggestion } from './WorkflowTypes';
import { WorkflowGraphEngine } from './WorkflowGraphEngine';
import { ProjectLevelReasoningEngine } from './ProjectLevelReasoningEngine';
import * as SuggestionSources from './WorkflowContextSuggestionSources';
import * as AutoRefresh from './WorkflowContextAutoRefresh';

export { type ContextSuggestion } from './WorkflowTypes';

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

	private getStore(): SuggestionSources.SuggestionSourceStore {
		return { graph: this.graph, projectReasoning: this.projectReasoning };
	}

	private getAutoRefreshStore(): AutoRefresh.AutoRefreshStore {
		return { refreshIntervalId: this.refreshIntervalId, refreshInterval: this.config.refreshInterval };
	}

	// ==================== Core Suggestions ====================

	/**
	 * Get suggestions for the current context (e.g., based on active project, recent nodes).
	 */
	getSuggestions(projectId?: string): ContextSuggestion[] {
		const suggestions: ContextSuggestion[] = [];

		if (this.config.showProjectSuggestions && projectId) {
			suggestions.push(...SuggestionSources.getProjectSuggestions(this.getStore(), projectId));
		}

		if (this.config.surfaceRelevantNotes) {
			suggestions.push(...SuggestionSources.getNoteSuggestions(this.getStore(), projectId));
		}

		if (this.config.surfaceRelevantTasks) {
			suggestions.push(...SuggestionSources.getTaskSuggestions(this.getStore(), projectId));
		}

		if (this.config.surfaceRelevantMedia) {
			suggestions.push(...SuggestionSources.getMediaSuggestions(this.getStore(), projectId));
		}

		if (this.config.surfaceRelevantReports) {
			suggestions.push(...SuggestionSources.getReportSuggestions(this.getStore(), projectId));
		}

		// Sort by relevance and limit
		suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
		return suggestions.slice(0, this.config.maxSuggestions);
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
		AutoRefresh.stopAutoRefresh(this.getAutoRefreshStore());
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