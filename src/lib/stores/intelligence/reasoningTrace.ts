/**
 * Reasoning Trace Store
 *
 * Tracks the reasoning trace for decisions, including decision points,
 * options considered, selected options, and phase references.
 */

import { writable } from 'svelte/store';
import type { ReasoningTraceEntry } from '../../intelligence/types';
import type { EnhancedReasoningTraceEntry, ReasoningTraceState } from './reasoningTraceTypes';
import { initialState } from './reasoningTraceTypes';
export {
	filteredTraceEntries,
	traceStatistics,
	phaseStatistics,
	confidenceDistribution,
	traceUIState
} from './reasoningTraceDerived';

function createReasoningTraceStore() {
	const { subscribe, set, update } = writable<ReasoningTraceState>(initialState);

	return {
		subscribe,
		set,
		update,
		
		/** Add a new reasoning trace entry */
		addEntry: (entry: ReasoningTraceEntry) => {
			const enhancedEntry: EnhancedReasoningTraceEntry = {
				...entry,
				id: `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				isSelected: false,
				isExpanded: false,
				userNotes: '',
				confidence: entry.confidence || 75,
				relatedIds: []
			};
			
			update(state => ({
				...state,
				entries: [enhancedEntry, ...state.entries], // Newest first
				currentDecisionPath: entry.decisionPoint
			}));
		},
		
		/** Set current decision path */
		setCurrentDecisionPath: (path: string) => {
			update(state => ({
				...state,
				currentDecisionPath: path
			}));
		},
		
		/** Toggle entry selection */
		toggleSelection: (entryId: string) => {
			update(state => {
				const isSelected = state.selectedIds.includes(entryId);
				const selectedIds = isSelected
					? state.selectedIds.filter(id => id !== entryId)
					: [...state.selectedIds, entryId];
				
				return {
					...state,
					selectedIds,
					entries: state.entries.map(entry => 
						entry.id === entryId 
							? { ...entry, isSelected: !isSelected }
							: entry
					)
				};
			});
		},
		
		/** Select all entries */
		selectAll: () => {
			update(state => ({
				...state,
				selectedIds: state.entries.map(e => e.id),
				entries: state.entries.map(entry => ({ ...entry, isSelected: true }))
			}));
		},
		
		/** Deselect all entries */
		deselectAll: () => {
			update(state => ({
				...state,
				selectedIds: [],
				entries: state.entries.map(entry => ({ ...entry, isSelected: false }))
			}));
		},
		
		/** Toggle entry expansion */
		toggleExpansion: (entryId: string) => {
			update(state => {
				const isExpanded = state.expandedIds.includes(entryId);
				const expandedIds = isExpanded
					? state.expandedIds.filter(id => id !== entryId)
					: [...state.expandedIds, entryId];
				
				return {
					...state,
					expandedIds,
					entries: state.entries.map(entry => 
						entry.id === entryId 
							? { ...entry, isExpanded: !isExpanded }
							: entry
					)
				};
			});
		},
		
		/** Expand all entries */
		expandAll: () => {
			update(state => ({
				...state,
				expandedIds: state.entries.map(e => e.id),
				entries: state.entries.map(entry => ({ ...entry, isExpanded: true }))
			}));
		},
		
		/** Collapse all entries */
		collapseAll: () => {
			update(state => ({
				...state,
				expandedIds: [],
				entries: state.entries.map(entry => ({ ...entry, isExpanded: false }))
			}));
		},
		
		/** Update entry notes */
		updateEntryNotes: (entryId: string, notes: string) => {
			update(state => ({
				...state,
				entries: state.entries.map(entry => 
					entry.id === entryId 
						? { ...entry, userNotes: notes }
						: entry
				)
			}));
		},
		
		/** Update entry confidence */
		updateEntryConfidence: (entryId: string, confidence: number) => {
			update(state => ({
				...state,
				entries: state.entries.map(entry => 
					entry.id === entryId 
						? { ...entry, confidence: Math.max(0, Math.min(100, confidence)) }
						: entry
				)
			}));
		},
		
		/** Add related entry */
		addRelatedEntry: (entryId: string, relatedId: string) => {
			update(state => ({
				...state,
				entries: state.entries.map(entry => 
					entry.id === entryId 
						? { 
							...entry, 
							relatedIds: [...new Set([...entry.relatedIds, relatedId])] 
						}
						: entry
				)
			}));
		},
		
		/** Remove related entry */
		removeRelatedEntry: (entryId: string, relatedId: string) => {
			update(state => ({
				...state,
				entries: state.entries.map(entry => 
					entry.id === entryId 
						? { 
							...entry, 
							relatedIds: entry.relatedIds.filter(id => id !== relatedId) 
						}
						: entry
				)
			}));
		},
		
		/** Update filters */
		updateFilters: (filters: Partial<ReasoningTraceState['filters']>) => {
			update(state => ({
				...state,
				filters: {
					...state.filters,
					...filters
				}
			}));
		},
		
		/** Set UI state */
		setUIState: (uiState: Partial<ReasoningTraceState['ui']>) => {
			update(state => ({
				...state,
				ui: {
					...state.ui,
					...uiState
				}
			}));
		},
		
		/** Sort entries */
		sortEntries: (sortBy: ReasoningTraceState['ui']['sortBy']) => {
			update(state => {
				const sortedEntries = [...state.entries].sort((a, b) => {
					switch (sortBy) {
						case 'confidence':
							return b.confidence - a.confidence;
						case 'phase':
							const phaseA = a.phaseReferences.length > 0 ? Math.min(...a.phaseReferences) : 0;
							const phaseB = b.phaseReferences.length > 0 ? Math.min(...b.phaseReferences) : 0;
							return phaseA - phaseB;
						case 'timestamp':
						default:
							return b.timestamp.getTime() - a.timestamp.getTime(); // Newest first
					}
				});
				
				return {
					...state,
					entries: sortedEntries,
					ui: {
						...state.ui,
						sortBy
					}
				};
			});
		},
		
		/** Clear all entries */
		clear: () => {
			update(state => ({
				...state,
				entries: [],
				selectedIds: [],
				expandedIds: [],
				currentDecisionPath: undefined
			}));
		},
		
		/** Reset to initial state */
		reset: () => {
			set(initialState);
		},
		
		/** Start tracing mode */
		startTracing: () => {
			update(state => ({
				...state,
				ui: {
					...state.ui,
					isTracing: true
				}
			}));
		},
		
		/** Stop tracing mode */
		stopTracing: () => {
			update(state => ({
				...state,
				ui: {
					...state.ui,
					isTracing: false
				}
			}));
		}
	};
}

export const reasoningTrace = createReasoningTraceStore();