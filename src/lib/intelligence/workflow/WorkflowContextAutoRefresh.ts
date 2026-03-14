/**
 * Workflow Context Auto‑Refresh (extracted from WorkflowAwareContextMode)
 * 
 * Contains auto‑refresh logic for suggestions.
 */

import type { ContextSuggestion } from './WorkflowTypes';

export interface AutoRefreshStore {
	refreshIntervalId: NodeJS.Timeout | null;
	refreshInterval: number;
}

/**
 * Start automatic refresh of suggestions.
 */
export function startAutoRefresh(
	store: AutoRefreshStore,
	callback: (suggestions: ContextSuggestion[]) => void,
	getSuggestions: () => ContextSuggestion[]
): void {
	stopAutoRefresh(store);
	if (store.refreshInterval <= 0) return;

	store.refreshIntervalId = setInterval(() => {
		const suggestions = getSuggestions();
		callback(suggestions);
	}, store.refreshInterval * 1000);
}

/**
 * Stop automatic refresh.
 */
export function stopAutoRefresh(store: AutoRefreshStore): void {
	if (store.refreshIntervalId) {
		clearInterval(store.refreshIntervalId);
		store.refreshIntervalId = null;
	}
}