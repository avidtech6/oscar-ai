/**
 * Current Report Store
 * 
 * Tracks the current report being worked on, including its type,
 * content, validation status, and intelligence layer references.
 */

import { writable, derived } from 'svelte/store';
import type { ReportTypeDefinition } from '../../intelligence/types';

export interface CurrentReport {
	/** Report ID */
	id: string;
	/** Report type name */
	type: string;
	/** Report title */
	title: string;
	/** Report content by section */
	content: Record<string, any>;
	/** Report type definition from intelligence layer */
	definition?: ReportTypeDefinition;
	/** Validation status */
	validation: {
		valid: boolean;
		errors: string[];
		warnings: string[];
		missingSections: string[];
		extraSections: string[];
	};
	/** Intelligence layer references */
	intelligence: {
		phaseReferences: number[];
		schemaMappings: string[];
		complianceRules: string[];
		workflowStep: number;
	};
	/** Metadata */
	metadata: {
		createdAt: Date;
		updatedAt: Date;
		author: string;
		version: string;
	};
	/** UI state */
	ui: {
		isGenerating: boolean;
		isValidating: boolean;
		activeSection: string;
		hasUnsavedChanges: boolean;
	};
}

const initialState: CurrentReport = {
	id: '',
	type: '',
	title: '',
	content: {},
	definition: undefined,
	validation: {
		valid: false,
		errors: [],
		warnings: [],
		missingSections: [],
		extraSections: []
	},
	intelligence: {
		phaseReferences: [],
		schemaMappings: [],
		complianceRules: [],
		workflowStep: 0
	},
	metadata: {
		createdAt: new Date(),
		updatedAt: new Date(),
		author: '',
		version: '1.0.0'
	},
	ui: {
		isGenerating: false,
		isValidating: false,
		activeSection: '',
		hasUnsavedChanges: false
	}
};

function createCurrentReportStore() {
	const { subscribe, set, update } = writable<CurrentReport>(initialState);

	return {
		subscribe,
		set,
		update,
		
		/** Initialize a new report */
		initialize: (type: string, title: string) => {
			const id = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			set({
				...initialState,
				id,
				type,
				title,
				metadata: {
					...initialState.metadata,
					createdAt: new Date(),
					updatedAt: new Date()
				}
			});
		},
		
		/** Update report content */
		updateContent: (section: string, content: any) => {
			update(state => ({
				...state,
				content: {
					...state.content,
					[section]: content
				},
				metadata: {
					...state.metadata,
					updatedAt: new Date()
				},
				ui: {
					...state.ui,
					hasUnsavedChanges: true
				}
			}));
		},
		
		/** Set report type definition from intelligence layer */
		setDefinition: (definition: ReportTypeDefinition) => {
			update(state => ({
				...state,
				definition,
				intelligence: {
					...state.intelligence,
					phaseReferences: [1], // Phase 1: Report Type Registry
					complianceRules: definition.complianceRules
				}
			}));
		},
		
		/** Update validation status */
		setValidation: (validation: CurrentReport['validation']) => {
			update(state => ({
				...state,
				validation,
				ui: {
					...state.ui,
					isValidating: false
				}
			}));
		},
		
		/** Set intelligence phase references */
		setPhaseReferences: (phaseNumbers: number[]) => {
			update(state => ({
				...state,
				intelligence: {
					...state.intelligence,
					phaseReferences: [...new Set([...state.intelligence.phaseReferences, ...phaseNumbers])]
				}
			}));
		},
		
		/** Update workflow step */
		setWorkflowStep: (step: number) => {
			update(state => ({
				...state,
				intelligence: {
					...state.intelligence,
					workflowStep: step
				}
			}));
		},
		
		/** Set UI state */
		setUIState: (uiState: Partial<CurrentReport['ui']>) => {
			update(state => ({
				...state,
				ui: {
					...state.ui,
					...uiState
				}
			}));
		},
		
		/** Reset to initial state */
		reset: () => {
			set(initialState);
		},
		
		/** Save report (mark as saved) */
		save: () => {
			update(state => ({
				...state,
				ui: {
					...state.ui,
					hasUnsavedChanges: false
				}
			}));
		}
	};
}

export const currentReport = createCurrentReportStore();

/** Derived store for validation summary */
export const validationSummary = derived(currentReport, $report => ({
	isValid: $report.validation.valid,
	errorCount: $report.validation.errors.length,
	warningCount: $report.validation.warnings.length,
	missingCount: $report.validation.missingSections.length,
	extraCount: $report.validation.extraSections.length,
	hasIssues: $report.validation.errors.length > 0 || $report.validation.warnings.length > 0
}));

/** Derived store for intelligence references */
export const intelligenceReferences = derived(currentReport, $report => ({
	phaseCount: $report.intelligence.phaseReferences.length,
	hasPhase1: $report.intelligence.phaseReferences.includes(1),
	hasPhase3: $report.intelligence.phaseReferences.includes(3),
	hasPhase9: $report.intelligence.phaseReferences.includes(9),
	workflowProgress: $report.intelligence.workflowStep,
	complianceRules: $report.intelligence.complianceRules.length
}));

/** Derived store for UI state */
export const reportUIState = derived(currentReport, $report => $report.ui);