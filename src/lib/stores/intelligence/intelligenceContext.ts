/**
 * Intelligence Context Store
 * 
 * Tracks the overall intelligence context, including current phase,
 * search state, reasoning trace, and user preferences.
 */

import { writable, derived } from 'svelte/store';
import type { IntelligenceContext, PhaseMetadata } from '../../intelligence/types';

export interface ExtendedIntelligenceContext extends IntelligenceContext {
	/** Current phase being referenced */
	currentPhase?: number;
	/** Current phase metadata */
	currentPhaseMetadata?: PhaseMetadata;
	/** Search query */
	searchQuery?: string;
	/** Search results */
	searchResults: any[];
	/** Selected decision path */
	decisionPath?: string;
	/** Reasoning trace */
	reasoningTrace: string[];
	/** Last action timestamp */
	lastAction: Date;
	/** User preferences */
	preferences: {
		showTechnicalDetails: boolean;
		autoSearch: boolean;
		highlightPhaseReferences: boolean;
		showReasoningTrace: boolean;
		mockData: boolean;
		defaultView: 'dashboard' | 'reports' | 'notes' | 'intelligence';
		theme: 'light' | 'dark' | 'system';
	};
	/** Intelligence engine status */
	engineStatus: {
		initialized: boolean;
		phaseCount: number;
		lastUpdated: Date;
		error?: string;
	};
	/** Navigation history */
	history: {
		phase: number;
		timestamp: Date;
		action: string;
	}[];
}

const initialState: ExtendedIntelligenceContext = {
	currentPhase: undefined,
	currentPhaseMetadata: undefined,
	searchQuery: '',
	searchResults: [],
	decisionPath: '',
	reasoningTrace: [],
	lastAction: new Date(),
	preferences: {
		showTechnicalDetails: true,
		autoSearch: true,
		highlightPhaseReferences: true,
		showReasoningTrace: true,
		mockData: false,
		defaultView: 'dashboard',
		theme: 'system'
	},
	engineStatus: {
		initialized: false,
		phaseCount: 0,
		lastUpdated: new Date(),
		error: undefined
	},
	history: []
};

function createIntelligenceContextStore() {
	const { subscribe, set, update } = writable<ExtendedIntelligenceContext>(initialState);

	return {
		subscribe,
		set,
		update,
		
		/** Set current phase */
		setCurrentPhase: (phaseNumber: number, metadata?: PhaseMetadata) => {
			update(state => {
				const historyEntry = {
					phase: phaseNumber,
					timestamp: new Date(),
					action: 'phase_navigation'
				};
				
				return {
					...state,
					currentPhase: phaseNumber,
					currentPhaseMetadata: metadata,
					lastAction: new Date(),
					history: [...state.history, historyEntry].slice(-10) // Keep last 10 entries
				};
			});
		},
		
		/** Set search query and results */
		setSearch: (query: string, results: any[]) => {
			update(state => ({
				...state,
				searchQuery: query,
				searchResults: results,
				lastAction: new Date()
			}));
		},
		
		/** Clear search */
		clearSearch: () => {
			update(state => ({
				...state,
				searchQuery: '',
				searchResults: [],
				lastAction: new Date()
			}));
		},
		
		/** Set decision path */
		setDecisionPath: (path: string) => {
			update(state => ({
				...state,
				decisionPath: path,
				lastAction: new Date()
			}));
		},
		
		/** Add to reasoning trace */
		addReasoningTrace: (entry: string) => {
			update(state => ({
				...state,
				reasoningTrace: [...state.reasoningTrace, `${new Date().toISOString()}: ${entry}`],
				lastAction: new Date()
			}));
		},
		
		/** Clear reasoning trace */
		clearReasoningTrace: () => {
			update(state => ({
				...state,
				reasoningTrace: [],
				lastAction: new Date()
			}));
		},
		
		/** Update preferences */
		updatePreferences: (preferences: Partial<ExtendedIntelligenceContext['preferences']>) => {
			update(state => ({
				...state,
				preferences: {
					...state.preferences,
					...preferences
				},
				lastAction: new Date()
			}));
		},
		
		/** Update engine status */
		updateEngineStatus: (status: Partial<ExtendedIntelligenceContext['engineStatus']>) => {
			update(state => ({
				...state,
				engineStatus: {
					...state.engineStatus,
					...status,
					lastUpdated: new Date()
				},
				lastAction: new Date()
			}));
		},
		
		/** Add history entry */
		addHistory: (action: string, phase?: number) => {
			update(state => ({
				...state,
				history: [...state.history, {
					phase: phase || state.currentPhase || 0,
					timestamp: new Date(),
					action
				}].slice(-10), // Keep last 10 entries
				lastAction: new Date()
			}));
		},
		
		/** Clear history */
		clearHistory: () => {
			update(state => ({
				...state,
				history: [],
				lastAction: new Date()
			}));
		},
		
		/** Reset to initial state */
		reset: () => {
			set(initialState);
		},
		
		/** Initialize engine status */
		initializeEngine: (phaseCount: number) => {
			update(state => ({
				...state,
				engineStatus: {
					initialized: true,
					phaseCount,
					lastUpdated: new Date(),
					error: undefined
				},
				lastAction: new Date()
			}));
		},
		
		/** Set engine error */
		setEngineError: (error: string) => {
			update(state => ({
				...state,
				engineStatus: {
					...state.engineStatus,
					error,
					lastUpdated: new Date()
				},
				lastAction: new Date()
			}));
		}
	};
}

export const intelligenceContext = createIntelligenceContextStore();

/** Derived store for search state */
export const searchState = derived(intelligenceContext, $context => ({
	hasQuery: !!$context.searchQuery,
	resultCount: $context.searchResults.length,
	isSearching: ($context.searchQuery ?? '').length > 0 && $context.searchResults.length === 0,
	hasResults: $context.searchResults.length > 0,
	query: $context.searchQuery ?? ''
}));

/** Derived store for reasoning trace */
export const reasoningTraceState = derived(intelligenceContext, $context => ({
	entries: $context.reasoningTrace,
	count: $context.reasoningTrace.length,
	lastEntry: $context.reasoningTrace[$context.reasoningTrace.length - 1] || 'No reasoning yet',
	hasEntries: $context.reasoningTrace.length > 0
}));

/** Derived store for engine status */
export const engineStatusState = derived(intelligenceContext, $context => ({
	isInitialized: $context.engineStatus.initialized,
	phaseCount: $context.engineStatus.phaseCount,
	lastUpdated: $context.engineStatus.lastUpdated,
	hasError: !!$context.engineStatus.error,
	error: $context.engineStatus.error,
	status: $context.engineStatus.initialized ? 'ready' : 'initializing'
}));

/** Derived store for navigation history */
export const navigationHistory = derived(intelligenceContext, $context => ({
	entries: $context.history,
	count: $context.history.length,
	lastEntry: $context.history[$context.history.length - 1],
	hasHistory: $context.history.length > 0,
	recentPhases: [...new Set($context.history.map(h => h.phase).filter(p => p > 0))]
}));

/** Derived store for preferences */
export const userPreferences = derived(intelligenceContext, $context => $context.preferences);