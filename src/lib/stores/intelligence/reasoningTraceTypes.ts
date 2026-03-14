/**
 * Types and initial state for reasoning trace store
 */

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

export const initialState: ReasoningTraceState = {
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