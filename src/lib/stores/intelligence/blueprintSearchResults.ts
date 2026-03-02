/**
 * Blueprint Search Results Store
 * 
 * Tracks search results across the Phase Files blueprint,
 * including relevance scoring, matching lines, and context.
 */

import { writable, derived } from 'svelte/store';
import type { BlueprintSearchResult, PhaseFile } from '../../intelligence/types';

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

const initialState: SearchState = {
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

function createBlueprintSearchResultsStore() {
	const { subscribe, set, update } = writable<SearchState>(initialState);

	return {
		subscribe,
		set,
		update,
		
		/** Set search query */
		setQuery: (query: string) => {
			update(state => ({
				...state,
				query,
				ui: {
					...state.ui,
					isSearching: query.length > 0
				}
			}));
		},
		
		/** Set search results */
		setResults: (results: BlueprintSearchResult[], searchTime: number = 0) => {
			const searchResults: SearchResult[] = results.map((result, index) => ({
				...result,
				id: `search_${Date.now()}_${index}`,
				score: calculateRelevanceScore(result, index),
				isSelected: false,
				isExpanded: false,
				userNotes: '',
				tags: extractTags(result)
			}));
			
			update(state => ({
				...state,
				results: searchResults,
				selectedIds: [],
				expandedIds: [],
				metadata: {
					searchTime,
					totalMatches: results.reduce((sum, r) => sum + r.matches.length, 0),
					phaseCount: new Set(results.map(r => {
						const phaseMatch = r.phaseFile.filename.match(/PHASE_(\d+)_/);
						return phaseMatch ? parseInt(phaseMatch[1]) : 0;
					})).size,
					executedAt: new Date()
				},
				ui: {
					...state.ui,
					isSearching: false
				}
			}));
		},
		
		/** Clear search results */
		clearResults: () => {
			update(state => ({
				...state,
				results: [],
				selectedIds: [],
				expandedIds: [],
				metadata: {
					...state.metadata,
					searchTime: 0,
					totalMatches: 0,
					phaseCount: 0,
					executedAt: new Date()
				}
			}));
		},
		
		/** Toggle result selection */
		toggleSelection: (resultId: string) => {
			update(state => {
				const isSelected = state.selectedIds.includes(resultId);
				const selectedIds = isSelected
					? state.selectedIds.filter(id => id !== resultId)
					: [...state.selectedIds, resultId];
				
				return {
					...state,
					selectedIds,
					results: state.results.map(result => 
						result.id === resultId 
							? { ...result, isSelected: !isSelected }
							: result
					)
				};
			});
		},
		
		/** Select all results */
		selectAll: () => {
			update(state => ({
				...state,
				selectedIds: state.results.map(r => r.id),
				results: state.results.map(result => ({ ...result, isSelected: true }))
			}));
		},
		
		/** Deselect all results */
		deselectAll: () => {
			update(state => ({
				...state,
				selectedIds: [],
				results: state.results.map(result => ({ ...result, isSelected: false }))
			}));
		},
		
		/** Toggle result expansion */
		toggleExpansion: (resultId: string) => {
			update(state => {
				const isExpanded = state.expandedIds.includes(resultId);
				const expandedIds = isExpanded
					? state.expandedIds.filter(id => id !== resultId)
					: [...state.expandedIds, resultId];
				
				return {
					...state,
					expandedIds,
					results: state.results.map(result => 
						result.id === resultId 
							? { ...result, isExpanded: !isExpanded }
							: result
					)
				};
			});
		},
		
		/** Expand all results */
		expandAll: () => {
			update(state => ({
				...state,
				expandedIds: state.results.map(r => r.id),
				results: state.results.map(result => ({ ...result, isExpanded: true }))
			}));
		},
		
		/** Collapse all results */
		collapseAll: () => {
			update(state => ({
				...state,
				expandedIds: [],
				results: state.results.map(result => ({ ...result, isExpanded: false }))
			}));
		},
		
		/** Update result notes */
		updateResultNotes: (resultId: string, notes: string) => {
			update(state => ({
				...state,
				results: state.results.map(result => 
					result.id === resultId 
						? { ...result, userNotes: notes }
						: result
				)
			}));
		},
		
		/** Add tag to result */
		addResultTag: (resultId: string, tag: string) => {
			update(state => ({
				...state,
				results: state.results.map(result => 
					result.id === resultId 
						? { 
							...result, 
							tags: [...new Set([...result.tags, tag])] 
						}
						: result
				)
			}));
		},
		
		/** Remove tag from result */
		removeResultTag: (resultId: string, tag: string) => {
			update(state => ({
				...state,
				results: state.results.map(result => 
					result.id === resultId 
						? { 
							...result, 
							tags: result.tags.filter(t => t !== tag) 
						}
						: result
				)
			}));
		},
		
		/** Set UI state */
		setUIState: (uiState: Partial<SearchState['ui']>) => {
			update(state => ({
				...state,
				ui: {
					...state.ui,
					...uiState
				}
			}));
		},
		
		/** Sort results */
		sortResults: (sortBy: SearchState['ui']['sortBy']) => {
			update(state => {
				const sortedResults = [...state.results].sort((a, b) => {
					switch (sortBy) {
						case 'phase':
							const phaseA = extractPhaseNumber(a.phaseFile.filename);
							const phaseB = extractPhaseNumber(b.phaseFile.filename);
							return phaseA - phaseB;
						case 'title':
							return a.phaseFile.filename.localeCompare(b.phaseFile.filename);
						case 'score':
							return b.score - a.score;
						case 'relevance':
						default:
							return b.score - a.score;
					}
				});
				
				return {
					...state,
					results: sortedResults,
					ui: {
						...state.ui,
						sortBy
					}
				};
			});
		},
		
		/** Filter by phase */
		filterByPhase: (phaseNumber?: number) => {
			update(state => ({
				...state,
				ui: {
					...state.ui,
					filterByPhase: phaseNumber
				}
			}));
		},
		
		/** Reset to initial state */
		reset: () => {
			set(initialState);
		}
	};
}

/** Calculate relevance score for a search result */
function calculateRelevanceScore(result: BlueprintSearchResult, index: number): number {
	let score = 50; // Base score
	
	// Boost score based on match count
	score += Math.min(result.matches.length * 10, 30);
	
	// Boost score for matches in title or early in content
	const hasTitleMatch = result.matches.some(match => 
		match.toLowerCase().includes('phase') || match.toLowerCase().includes('objective')
	);
	if (hasTitleMatch) score += 20;
	
	// Reduce score for later results
	score -= Math.min(index * 2, 20);
	
	// Ensure score is between 0 and 100
	return Math.max(0, Math.min(100, score));
}

/** Extract tags from search result */
function extractTags(result: BlueprintSearchResult): string[] {
	const tags: string[] = [];
	const filename = result.phaseFile.filename;
	
	// Extract phase number
	const phaseMatch = filename.match(/PHASE_(\d+)_/);
	if (phaseMatch) {
		tags.push(`phase-${phaseMatch[1]}`);
	}
	
	// Extract report type if mentioned
	if (filename.includes('REPORT')) {
		tags.push('report');
	}
	
	if (filename.includes('SCHEMA')) {
		tags.push('schema');
	}
	
	if (filename.includes('WORKFLOW')) {
		tags.push('workflow');
	}
	
	if (filename.includes('INTELLIGENCE')) {
		tags.push('intelligence');
	}
	
	if (filename.includes('INTEGRATION')) {
		tags.push('integration');
	}
	
	if (filename.includes('TEST')) {
		tags.push('testing');
	}
	
	// Add content-based tags
	const content = result.phaseFile.content.toLowerCase();
	if (content.includes('execution prompt') || content.includes('act-build')) {
		tags.push('execution-prompt');
	}
	
	if (content.includes('compliance')) {
		tags.push('compliance');
	}
	
	if (content.includes('validation')) {
		tags.push('validation');
	}
	
	return [...new Set(tags)]; // Remove duplicates
}

/** Extract phase number from filename */
function extractPhaseNumber(filename: string): number {
	const match = filename.match(/PHASE_(\d+)_/);
	return match ? parseInt(match[1]) : 0;
}

export const blueprintSearchResults = createBlueprintSearchResultsStore();

/** Derived store for filtered results */
export const filteredResults = derived(
	[blueprintSearchResults],
	([$search]) => {
		let results = $search.results;
		
		// Filter by phase if specified
		if ($search.ui.filterByPhase !== undefined) {
			results = results.filter(result => {
				const phaseNumber = extractPhaseNumber(result.phaseFile.filename);
				return phaseNumber === $search.ui.filterByPhase;
			});
		}
		
		// Filter by selected only if enabled
		if ($search.ui.showOnlySelected) {
			results = results.filter(result => result.isSelected);
		}
		
		// Sort results
		switch ($search.ui.sortBy) {
			case 'phase':
				results.sort((a, b) => {
					const phaseA = extractPhaseNumber(a.phaseFile.filename);
					const phaseB = extractPhaseNumber(b.phaseFile.filename);
					return phaseA - phaseB;
				});
				break;
			case 'title':
				results.sort((a, b) => 
					a.phaseFile.filename.localeCompare(b.phaseFile.filename)
				);
				break;
			case 'score':
				results.sort((a, b) => b.score - a.score);
				break;
			case 'relevance':
			default:
				results.sort((a, b) => b.score - a.score);
				break;
		}
		
		return results;
	}
);

/** Derived store for search statistics */
export const searchStatistics = derived(blueprintSearchResults, $search => ({
	totalResults: $search.results.length,
	selectedCount: $search.selectedIds.length,
	expandedCount: $search.expandedIds.length,
	totalMatches: $search.metadata.totalMatches,
	phaseCount: $search.metadata.phaseCount,
	searchTime: $search.metadata.searchTime,
	executedAt: $search.metadata.executedAt,
	hasResults: $search.results.length > 0,
	hasSelected: $search.selectedIds.length > 0,
	queryLength: $search.query.length
}));

/** Derived store for tag statistics */
export const tagStatistics = derived(blueprintSearchResults, $search => {
	const tagCounts: Record<string, number> = {};
	
	$search.results.forEach(result => {
		result.tags.forEach(tag => {
			tagCounts[tag] = (tagCounts[tag] || 0) + 1;
		});
	});
	
	return {
		tags: Object.entries(tagCounts)
			.map(([tag, count]) => ({ tag, count }))
			.sort((a, b) => b.count - a.count),
		totalTags: Object.keys(tagCounts).length,
		mostCommonTag: Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'none'
	};
});

/** Derived store for UI state */
export const searchUIState = derived(blueprintSearchResults, $search => $search.ui);