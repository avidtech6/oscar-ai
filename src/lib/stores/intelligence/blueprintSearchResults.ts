/**
 * Blueprint Search Results Store
 *
 * Tracks search results across the Phase Files blueprint,
 * including relevance scoring, matching lines, and context.
 */

import { writable } from 'svelte/store';
import type { BlueprintSearchResult } from '../../intelligence/types';
import type { SearchState, SearchResult } from './blueprintSearchResultsTypes';
import { initialState } from './blueprintSearchResultsTypes';
import { calculateRelevanceScore, extractTags, extractPhaseNumber } from './blueprintSearchResultsHelpers';

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


export const blueprintSearchResults = createBlueprintSearchResultsStore();

// Re-export derived stores
export * from './blueprintSearchResultsDerived';