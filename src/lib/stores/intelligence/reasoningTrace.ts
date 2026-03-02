/**
 * Reasoning Trace Store
 * 
 * Tracks the reasoning trace for decisions, including decision points,
 * options considered, selected options, and phase references.
 */

import { writable, derived } from 'svelte/store';
import type { ReasoningTraceEntry } from '../../intelligence/types';

export interface EnhancedReasoningTraceEntry extends ReasoningTraceEntry {
	/** Unique ID for the trace entry */
	id: string;
	/** Whether this entry is selected */
	isSelected: boolean;
	/** Whether this entry is expanded */
	isExpanded: boolean;
	/** User notes on this decision */
	userNotes: string;
	/** Confidence level (0-100) */
	confidence: number;
	/** Related trace entry IDs */
	relatedIds: string[];
}

export interface ReasoningTraceState {
	/** All trace entries */
	entries: EnhancedReasoningTraceEntry[];
	/** Current decision path */
	currentDecisionPath?: string;
	/** Selected entry IDs */
	selectedIds: string[];
	/** Expanded entry IDs */
	expandedIds: string[];
	/** Filter criteria */
	filters: {
		minConfidence: number;
		maxConfidence: number;
		phaseFilter?: number;
		decisionPointFilter?: string;
		dateRange?: {
			start: Date;
			end: Date;
		};
	};
	/** UI state */
	ui: {
		viewMode: 'timeline' | 'list' | 'graph';
		sortBy: 'timestamp' | 'confidence' | 'phase';
		showOnlySelected: boolean;
		showConfidence: boolean;
		showPhaseReferences: boolean;
		isTracing: boolean;
	};
}

const initialState: ReasoningTraceState = {
	entries: [],
	currentDecisionPath: undefined,
	selectedIds: [],
	expandedIds: [],
	filters: {
		minConfidence: 0,
		maxConfidence: 100,
		phaseFilter: undefined,
		decisionPointFilter: undefined,
		dateRange: undefined
	},
	ui: {
		viewMode: 'timeline',
		sortBy: 'timestamp',
		showOnlySelected: false,
		showConfidence: true,
		showPhaseReferences: true,
		isTracing: false
	}
};

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

/** Derived store for filtered entries */
export const filteredTraceEntries = derived(
	[reasoningTrace],
	([$trace]) => {
		let entries = $trace.entries;
		
		// Apply confidence filter
		entries = entries.filter(entry => 
			entry.confidence >= $trace.filters.minConfidence && 
			entry.confidence <= $trace.filters.maxConfidence
		);
		
		// Apply phase filter
		if ($trace.filters.phaseFilter !== undefined) {
			entries = entries.filter(entry => 
				entry.phaseReferences.includes($trace.filters.phaseFilter!)
			);
		}
		
		// Apply decision point filter
		if ($trace.filters.decisionPointFilter) {
			const filter = $trace.filters.decisionPointFilter.toLowerCase();
			entries = entries.filter(entry => 
				entry.decisionPoint.toLowerCase().includes(filter)
			);
		}
		
		// Apply date range filter
		if ($trace.filters.dateRange) {
			const { start, end } = $trace.filters.dateRange;
			entries = entries.filter(entry => 
				entry.timestamp >= start && entry.timestamp <= end
			);
		}
		
		// Filter by selected only if enabled
		if ($trace.ui.showOnlySelected) {
			entries = entries.filter(entry => entry.isSelected);
		}
		
		// Sort entries
		switch ($trace.ui.sortBy) {
			case 'confidence':
				entries.sort((a, b) => b.confidence - a.confidence);
				break;
			case 'phase':
				entries.sort((a, b) => {
					const phaseA = a.phaseReferences.length > 0 ? Math.min(...a.phaseReferences) : 0;
					const phaseB = b.phaseReferences.length > 0 ? Math.min(...b.phaseReferences) : 0;
					return phaseA - phaseB;
				});
				break;
			case 'timestamp':
			default:
				entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Newest first
				break;
		}
		
		return entries;
	}
);

/** Derived store for trace statistics */
export const traceStatistics = derived(reasoningTrace, $trace => {
	const entries = $trace.entries;
	const totalEntries = entries.length;
	
	if (totalEntries === 0) {
		return {
			totalEntries: 0,
			averageConfidence: 0,
			phaseCoverage: 0,
			decisionPoints: 0,
			timeSpan: 0,
			hasEntries: false
		};
	}
	
	// Calculate average confidence
	const totalConfidence = entries.reduce((sum, entry) => sum + entry.confidence, 0);
	const averageConfidence = totalConfidence / totalEntries;
	
	// Calculate phase coverage
	const allPhaseReferences = entries.flatMap(entry => entry.phaseReferences);
	const uniquePhases = new Set(allPhaseReferences).size;
	const phaseCoverage = uniquePhases;
	
	// Count unique decision points
	const uniqueDecisionPoints = new Set(entries.map(entry => entry.decisionPoint)).size;
	
	// Calculate time span
	const timestamps = entries.map(entry => entry.timestamp.getTime());
	const minTime = Math.min(...timestamps);
	const maxTime = Math.max(...timestamps);
	const timeSpan = maxTime - minTime; // in milliseconds
	
	return {
		totalEntries,
		averageConfidence: Math.round(averageConfidence * 10) / 10,
		phaseCoverage,
		decisionPoints: uniqueDecisionPoints,
		timeSpan,
		hasEntries: true,
		selectedCount: $trace.selectedIds.length,
		expandedCount: $trace.expandedIds.length
	};
});

/** Derived store for phase statistics */
export const phaseStatistics = derived(reasoningTrace, $trace => {
	const phaseCounts: Record<number, number> = {};
	const phaseConfidences: Record<number, number[]> = {};
	
	$trace.entries.forEach(entry => {
		entry.phaseReferences.forEach(phase => {
			phaseCounts[phase] = (phaseCounts[phase] || 0) + 1;
			if (!phaseConfidences[phase]) {
				phaseConfidences[phase] = [];
			}
			phaseConfidences[phase].push(entry.confidence);
		});
	});
	
	const phaseStats = Object.entries(phaseCounts).map(([phase, count]) => {
		const phaseNum = parseInt(phase);
		const confidences = phaseConfidences[phaseNum] || [];
		const avgConfidence = confidences.length > 0 
			? confidences.reduce((sum, c) => sum + c, 0) / confidences.length
			: 0;
		
		return {
			phase: phaseNum,
			count,
			averageConfidence: Math.round(avgConfidence * 10) / 10,
			percentage: Math.round((count / $trace.entries.length) * 1000) / 10
		};
	}).sort((a, b) => b.count - a.count);
	
	return {
		phases: phaseStats,
		totalPhases: phaseStats.length,
		mostReferencedPhase: phaseStats[0]?.phase || 0,
		leastReferencedPhase: phaseStats[phaseStats.length - 1]?.phase || 0
	};
});

/** Derived store for confidence distribution */
export const confidenceDistribution = derived(reasoningTrace, $trace => {
	const distribution: Record<string, number> = {
		'0-20': 0,
		'21-40': 0,
		'41-60': 0,
		'61-80': 0,
		'81-100': 0
	};
	
	$trace.entries.forEach(entry => {
		if (entry.confidence <= 20) distribution['0-20']++;
		else if (entry.confidence <= 40) distribution['21-40']++;
		else if (entry.confidence <= 60) distribution['41-60']++;
		else if (entry.confidence <= 80) distribution['61-80']++;
		else distribution['81-100']++;
	});
	
	return {
		distribution,
		total: $trace.entries.length,
		hasHighConfidence: distribution['81-100'] > 0,
		hasLowConfidence: distribution['0-20'] > 0
	};
});

/** Derived store for UI state */
export const traceUIState = derived(reasoningTrace, $trace => $trace.ui);