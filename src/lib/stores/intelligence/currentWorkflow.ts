/**
 * Current Workflow Store
 * 
 * Tracks the current workflow being executed, including steps,
 * progress, intelligence layer references, and state.
 */

import { writable, derived } from 'svelte/store';
import type { WorkflowDefinition, WorkflowStep } from '../../intelligence/types';

export interface CurrentWorkflow {
	/** Workflow ID */
	id: string;
	/** Workflow name */
	name: string;
	/** Workflow definition from intelligence layer */
	definition?: WorkflowDefinition;
	/** Current step number */
	currentStep: number;
	/** Steps completed */
	completedSteps: number[];
	/** Step states */
	stepStates: Record<number, StepState>;
	/** Input data */
	inputs: Record<string, any>;
	/** Output data */
	outputs: Record<string, any>;
	/** Intelligence layer references */
	intelligence: {
		phaseReferences: number[];
		workflowType: string;
		reasoningTrace: string[];
	};
	/** Metadata */
	metadata: {
		startedAt: Date;
		lastUpdated: Date;
		estimatedCompletion: Date;
		duration: number; // in seconds
	};
	/** UI state */
	ui: {
		isRunning: boolean;
		isPaused: boolean;
		hasErrors: boolean;
		showDetails: boolean;
		activeTab: 'steps' | 'inputs' | 'outputs' | 'intelligence';
	};
}

export interface StepState {
	/** Step number */
	step: number;
	/** Status */
	status: 'pending' | 'running' | 'completed' | 'error' | 'skipped';
	/** Start time */
	startedAt?: Date;
	/** Completion time */
	completedAt?: Date;
	/** Error message if any */
	error?: string;
	/** Output from step */
	output?: any;
	/** Intelligence references */
	intelligenceReferences: number[];
}

const initialState: CurrentWorkflow = {
	id: '',
	name: '',
	definition: undefined,
	currentStep: 0,
	completedSteps: [],
	stepStates: {},
	inputs: {},
	outputs: {},
	intelligence: {
		phaseReferences: [],
		workflowType: '',
		reasoningTrace: []
	},
	metadata: {
		startedAt: new Date(),
		lastUpdated: new Date(),
		estimatedCompletion: new Date(Date.now() + 3600000), // 1 hour from now
		duration: 0
	},
	ui: {
		isRunning: false,
		isPaused: false,
		hasErrors: false,
		showDetails: false,
		activeTab: 'steps'
	}
};

function createCurrentWorkflowStore() {
	const { subscribe, set, update } = writable<CurrentWorkflow>(initialState);

	return {
		subscribe,
		set,
		update,
		
		/** Initialize a new workflow */
		initialize: (name: string, definition?: WorkflowDefinition) => {
			const id = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			const now = new Date();
			
			set({
				...initialState,
				id,
				name,
				definition,
				metadata: {
					...initialState.metadata,
					startedAt: now,
					lastUpdated: now,
					estimatedCompletion: new Date(now.getTime() + (definition?.steps.length || 5) * 600000) // 10 minutes per step
				},
				intelligence: {
					...initialState.intelligence,
					phaseReferences: definition ? [definition.phaseReference] : [],
					workflowType: definition?.name || 'Unknown'
				}
			});
		},
		
		/** Start the workflow */
		start: () => {
			update(state => ({
				...state,
				ui: {
					...state.ui,
					isRunning: true,
					isPaused: false
				},
				metadata: {
					...state.metadata,
					startedAt: new Date()
				}
			}));
		},
		
		/** Pause the workflow */
		pause: () => {
			update(state => ({
				...state,
				ui: {
					...state.ui,
					isPaused: true
				}
			}));
		},
		
		/** Resume the workflow */
		resume: () => {
			update(state => ({
				...state,
				ui: {
					...state.ui,
					isPaused: false
				}
			}));
		},
		
		/** Stop the workflow */
		stop: () => {
			update(state => ({
				...state,
				ui: {
					...state.ui,
					isRunning: false,
					isPaused: false
				}
			}));
		},
		
		/** Move to next step */
		nextStep: () => {
			update(state => {
				const nextStep = state.currentStep + 1;
				const stepStates = {
					...state.stepStates,
					[state.currentStep]: {
						step: state.currentStep,
						status: 'completed' as const,
						completedAt: new Date(),
						intelligenceReferences: state.intelligence.phaseReferences
					}
				};
				
				return {
					...state,
					currentStep: nextStep,
					completedSteps: [...state.completedSteps, state.currentStep],
					stepStates,
					metadata: {
						...state.metadata,
						lastUpdated: new Date(),
						duration: (new Date().getTime() - state.metadata.startedAt.getTime()) / 1000
					}
				};
			});
		},
		
		/** Set step state */
		setStepState: (step: number, stateUpdate: Partial<StepState>) => {
			update(state => {
				const currentStepState = state.stepStates[step] || {
					step,
					status: 'pending',
					intelligenceReferences: []
				};
				
				return {
					...state,
					stepStates: {
						...state.stepStates,
						[step]: {
							...currentStepState,
							...stateUpdate
						}
					},
					metadata: {
						...state.metadata,
						lastUpdated: new Date()
					}
				};
			});
		},
		
		/** Update inputs */
		updateInputs: (inputs: Record<string, any>) => {
			update(state => ({
				...state,
				inputs: {
					...state.inputs,
					...inputs
				},
				metadata: {
					...state.metadata,
					lastUpdated: new Date()
				}
			}));
		},
		
		/** Update outputs */
		updateOutputs: (outputs: Record<string, any>) => {
			update(state => ({
				...state,
				outputs: {
					...state.outputs,
					...outputs
				},
				metadata: {
					...state.metadata,
					lastUpdated: new Date()
				}
			}));
		},
		
		/** Add intelligence phase reference */
		addPhaseReference: (phaseNumber: number) => {
			update(state => ({
				...state,
				intelligence: {
					...state.intelligence,
					phaseReferences: [...new Set([...state.intelligence.phaseReferences, phaseNumber])]
				}
			}));
		},
		
		/** Add to reasoning trace */
		addReasoningTrace: (entry: string) => {
			update(state => ({
				...state,
				intelligence: {
					...state.intelligence,
					reasoningTrace: [...state.intelligence.reasoningTrace, `${new Date().toISOString()}: ${entry}`]
				}
			}));
		},
		
		/** Set UI state */
		setUIState: (uiState: Partial<CurrentWorkflow['ui']>) => {
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
		
		/** Complete the workflow */
		complete: () => {
			update(state => ({
				...state,
				ui: {
					...state.ui,
					isRunning: false,
					isPaused: false
				},
				currentStep: state.definition?.steps.length || 0,
				completedSteps: Array.from({ length: state.definition?.steps.length || 0 }, (_, i) => i),
				metadata: {
					...state.metadata,
					lastUpdated: new Date(),
					duration: (new Date().getTime() - state.metadata.startedAt.getTime()) / 1000
				}
			}));
		}
	};
}

export const currentWorkflow = createCurrentWorkflowStore();

/** Derived store for workflow progress */
export const workflowProgress = derived(currentWorkflow, $workflow => {
	const totalSteps = $workflow.definition?.steps.length || 0;
	const completedSteps = $workflow.completedSteps.length;
	const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
	
	return {
		totalSteps,
		completedSteps,
		progress,
		currentStep: $workflow.currentStep,
		remainingSteps: totalSteps - completedSteps,
		isComplete: completedSteps === totalSteps && totalSteps > 0,
		estimatedTimeRemaining: totalSteps > 0 
			? ($workflow.metadata.duration / completedSteps) * (totalSteps - completedSteps)
			: 0
	};
});

/** Derived store for step status */
export const stepStatus = derived(currentWorkflow, $workflow => {
	const steps = $workflow.definition?.steps || [];
	return steps.map(step => ({
		step: step.step,
		action: step.action,
		status: $workflow.stepStates[step.step]?.status || 'pending',
		startedAt: $workflow.stepStates[step.step]?.startedAt,
		completedAt: $workflow.stepStates[step.step]?.completedAt,
		error: $workflow.stepStates[step.step]?.error,
		phaseReference: step.phaseReference
	}));
});

/** Derived store for intelligence references */
export const workflowIntelligence = derived(currentWorkflow, $workflow => ({
	phaseCount: $workflow.intelligence.phaseReferences.length,
	phases: $workflow.intelligence.phaseReferences,
	reasoningTraceLength: $workflow.intelligence.reasoningTrace.length,
	lastReasoning: $workflow.intelligence.reasoningTrace[$workflow.intelligence.reasoningTrace.length - 1] || 'No reasoning yet',
	workflowType: $workflow.intelligence.workflowType
}));

/** Derived store for UI state */
export const workflowUIState = derived(currentWorkflow, $workflow => $workflow.ui);