/**
 * Blueprint Search Results Store Types
 */

import type { BlueprintSearchResult } from '../../intelligence/types';

export interface SearchResult extends BlueprintSearchResult {
	/** Unique ID for the result */
	id: string;
	/** Relevance score (0-100) */
	score: number;
	/** Whether this result is selected */
	isSelected: boolean;
	/** Whether this result is expanded */
	isExpanded: boolean;
	/** User notes on this result */
	userNotes: string;
	/** Tags for categorization */
	tags: string[];
}

export interface SearchState {
	/** Current search query */
	query: string;
	/** All search results */
	results: SearchResult[];
	/** Selected result IDs */
	selectedIds: string[];
	/** Expanded result IDs */
	expandedIds: string[];
	/** Search metadata */
	metadata: {
		searchTime: number; // in milliseconds
		totalMatches: number;
		phaseCount: number;
		executedAt: Date;
	};
	/** UI state */
	ui: {
		isSearching: boolean;
		viewMode: 'list' | 'grid' | 'detailed';
		sortBy: 'relevance' | 'phase' | 'title' | 'score';
		filterByPhase?: number;
		showOnlySelected: boolean;
	};
}

export const initialState: SearchState = {
	query: '',
	results: [],
	selectedIds: [],
	expandedIds: [],
	metadata: {
		searchTime: 0,
		totalMatches: 0,
		phaseCount: 0,
		executedAt: new Date()
	},
	ui: {
		isSearching: false,
		viewMode: 'list',
		sortBy: 'relevance',
		filterByPhase: undefined,
		showOnlySelected: false
	}
};