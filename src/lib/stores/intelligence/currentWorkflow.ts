/**
 * Current Workflow Store
 *
 * Tracks the current workflow being executed, including steps,
 * progress, intelligence layer references, and state.
 */

import { writable } from 'svelte/store';
import type { WorkflowDefinition } from '../../intelligence/types';
import type { CurrentWorkflow, StepState } from './currentWorkflowTypes';
import { initialState } from './currentWorkflowTypes';
export { workflowProgress, stepStatus, workflowIntelligence, workflowUIState } from './currentWorkflowDerived';

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