/**
 * UI Integration Hooks
 * 
 * Svelte stores and hooks for integrating workflow automation with the UI.
 * Provides reactive state, actions, and components for workflow management.
 */

import { writable, derived, get } from 'svelte/store';
import type { Writable, Readable } from 'svelte/store';

import type {
	WorkflowDefinition,
	WorkflowInstance,
	WorkflowStatus,
	WorkflowStep,
	StepStatus
} from './workflowTypes';

import type { CopilotContext } from '../context/contextTypes';
import type { CopilotOrchestrator, OrchestratorEvent } from '../orchestrator/orchestrator';

// Import orchestrator instance (would be initialized elsewhere)
import { orchestrator } from '../orchestrator/orchestratorInstance';

/**
 * Workflow UI state
 */
export interface WorkflowUIState {
	/** Suggested workflows */
	suggestedWorkflows: WorkflowDefinition[];
	
	/** Active workflows */
	activeWorkflows: WorkflowInstance[];
	
	/** Completed workflows */
	completedWorkflows: WorkflowInstance[];
	
	/** Selected workflow */
	selectedWorkflow: WorkflowInstance | null;
	
	/** Current step details */
	currentStepDetails: {
		workflowInstanceId: string;
		step: WorkflowStep;
		progress: number;
		estimatedTimeRemaining: number; // seconds
	} | null;
	
	/** UI loading states */
	loading: {
		suggestions: boolean;
		starting: boolean;
		pausing: boolean;
		resuming: boolean;
		cancelling: boolean;
	};
	
	/** UI errors */
	errors: {
		start: string | null;
		pause: string | null;
		resume: string | null;
		cancel: string | null;
	};
	
	/** UI visibility */
	visible: {
		suggestionsPanel: boolean;
		workflowDetails: boolean;
		stepProgress: boolean;
	};
}

/**
 * Workflow UI store
 */
function createWorkflowUIStore() {
	const { subscribe, set, update } = writable<WorkflowUIState>({
		suggestedWorkflows: [],
		activeWorkflows: [],
		completedWorkflows: [],
		selectedWorkflow: null,
		currentStepDetails: null,
		loading: {
			suggestions: false,
			starting: false,
			pausing: false,
			resuming: false,
			cancelling: false
		},
		errors: {
			start: null,
			pause: null,
			resume: null,
			cancel: null
		},
		visible: {
			suggestionsPanel: false,
			workflowDetails: false,
			stepProgress: false
		}
	});
	
	return {
		subscribe,
		
		/**
		 * Load suggested workflows
		 */
		async loadSuggestedWorkflows(context?: CopilotContext): Promise<void> {
			update(state => ({ ...state, loading: { ...state.loading, suggestions: true } }));
			
			try {
				const workflows = orchestrator.getSuggestedWorkflows();
				update(state => ({ 
					...state, 
					suggestedWorkflows: workflows,
					loading: { ...state.loading, suggestions: false },
					errors: { ...state.errors, start: null }
				}));
			} catch (error) {
				update(state => ({ 
					...state, 
					loading: { ...state.loading, suggestions: false },
					errors: { ...state.errors, start: error instanceof Error ? error.message : 'Failed to load suggestions' }
				}));
			}
		},
		
		/**
		 * Load active workflows
		 */
		async loadActiveWorkflows(): Promise<void> {
			try {
				const workflows = orchestrator.getActiveWorkflows();
				update(state => ({ ...state, activeWorkflows: workflows }));
			} catch (error) {
				console.error('Failed to load active workflows:', error);
			}
		},
		
		/**
		 * Start workflow
		 */
		async startWorkflow(workflowId: string): Promise<WorkflowInstance | null> {
			update(state => ({ ...state, loading: { ...state.loading, starting: true } }));
			
			try {
				const workflowInstance = await orchestrator.startWorkflow(workflowId);
				
				// Update state
				update(state => ({
					...state,
					activeWorkflows: [...state.activeWorkflows, workflowInstance],
					loading: { ...state.loading, starting: false },
					errors: { ...state.errors, start: null },
					visible: { ...state.visible, workflowDetails: true }
				}));
				
				// Select the new workflow
				this.selectWorkflow(workflowInstance.id);
				
				return workflowInstance;
			} catch (error) {
				update(state => ({
					...state,
					loading: { ...state.loading, starting: false },
					errors: { ...state.errors, start: error instanceof Error ? error.message : 'Failed to start workflow' }
				}));
				return null;
			}
		},
		
		/**
		 * Pause workflow
		 */
		async pauseWorkflow(workflowInstanceId: string): Promise<void> {
			update(state => ({ ...state, loading: { ...state.loading, pausing: true } }));
			
			try {
				orchestrator.pauseWorkflow(workflowInstanceId);
				
				// Update state
				update(state => ({
					...state,
					loading: { ...state.loading, pausing: false },
					errors: { ...state.errors, pause: null }
				}));
				
				// Refresh active workflows
				await this.loadActiveWorkflows();
			} catch (error) {
				update(state => ({
					...state,
					loading: { ...state.loading, pausing: false },
					errors: { ...state.errors, pause: error instanceof Error ? error.message : 'Failed to pause workflow' }
				}));
			}
		},
		
		/**
		 * Resume workflow
		 */
		async resumeWorkflow(workflowInstanceId: string): Promise<void> {
			update(state => ({ ...state, loading: { ...state.loading, resuming: true } }));
			
			try {
				orchestrator.resumeWorkflow(workflowInstanceId);
				
				// Update state
				update(state => ({
					...state,
					loading: { ...state.loading, resuming: false },
					errors: { ...state.errors, resume: null }
				}));
				
				// Refresh active workflows
				await this.loadActiveWorkflows();
			} catch (error) {
				update(state => ({
					...state,
					loading: { ...state.loading, resuming: false },
					errors: { ...state.errors, resume: error instanceof Error ? error.message : 'Failed to resume workflow' }
				}));
			}
		},
		
		/**
		 * Cancel workflow
		 */
		async cancelWorkflow(workflowInstanceId: string): Promise<void> {
			update(state => ({ ...state, loading: { ...state.loading, cancelling: true } }));
			
			try {
				orchestrator.cancelWorkflow(workflowInstanceId);
				
				// Update state
				update(state => ({
					...state,
					loading: { ...state.loading, cancelling: false },
					errors: { ...state.errors, cancel: null },
					selectedWorkflow: state.selectedWorkflow?.id === workflowInstanceId ? null : state.selectedWorkflow
				}));
				
				// Refresh active workflows
				await this.loadActiveWorkflows();
			} catch (error) {
				update(state => ({
					...state,
					loading: { ...state.loading, cancelling: false },
					errors: { ...state.errors, cancel: error instanceof Error ? error.message : 'Failed to cancel workflow' }
				}));
			}
		},
		
		/**
		 * Select workflow
		 */
		selectWorkflow(workflowInstanceId: string | null): void {
			if (!workflowInstanceId) {
				update(state => ({ ...state, selectedWorkflow: null }));
				return;
			}
			
			const workflow = orchestrator.getWorkflow(workflowInstanceId);
			update(state => ({ 
				...state, 
				selectedWorkflow: workflow || null,
				visible: { ...state.visible, workflowDetails: true }
			}));
		},
		
		/**
		 * Toggle suggestions panel
		 */
		toggleSuggestionsPanel(): void {
			update(state => ({
				...state,
				visible: { ...state.visible, suggestionsPanel: !state.visible.suggestionsPanel }
			}));
		},
		
		/**
		 * Toggle workflow details
		 */
		toggleWorkflowDetails(): void {
			update(state => ({
				...state,
				visible: { ...state.visible, workflowDetails: !state.visible.workflowDetails }
			}));
		},
		
		/**
		 * Toggle step progress
		 */
		toggleStepProgress(): void {
			update(state => ({
				...state,
				visible: { ...state.visible, stepProgress: !state.visible.stepProgress }
			}));
		},
		
		/**
		 * Clear errors
		 */
		clearErrors(): void {
			update(state => ({
				...state,
				errors: {
					start: null,
					pause: null,
					resume: null,
					cancel: null
				}
			}));
		},
		
		/**
		 * Update current step details
		 */
		updateCurrentStepDetails(
			workflowInstanceId: string,
			step: WorkflowStep,
			progress: number,
			estimatedTimeRemaining: number
		): void {
			update(state => ({
				...state,
				currentStepDetails: {
					workflowInstanceId,
					step,
					progress,
					estimatedTimeRemaining
				}
			}));
		},
		
		/**
		 * Clear current step details
		 */
		clearCurrentStepDetails(): void {
			update(state => ({
				...state,
				currentStepDetails: null
			}));
		}
	};
}

export const workflowUI = createWorkflowUIStore();

/**
 * Derived stores
 */

/** Workflow progress for selected workflow */
export const selectedWorkflowProgress = derived(
	workflowUI,
	($workflowUI) => {
		const workflow = $workflowUI.selectedWorkflow;
		if (!workflow || !workflow.steps.length) return 0;
		
		const completedSteps = workflow.steps.filter(step => 
			step.status === 'completed' || step.status === 'skipped'
		).length;
		
		return Math.round((completedSteps / workflow.steps.length) * 100);
	}
);

/** Current step for selected workflow */
export const selectedWorkflowCurrentStep = derived(
	workflowUI,
	($workflowUI) => {
		const workflow = $workflowUI.selectedWorkflow;
		if (!workflow) return null;
		
		return workflow.steps.find(step => step.id === workflow.currentStepId) || null;
	}
);

/** Workflow statistics */
export const workflowStatistics = derived(
	workflowUI,
	($workflowUI) => {
		const allWorkflows = [
			...$workflowUI.activeWorkflows,
			...$workflowUI.completedWorkflows
		];
		
		const byStatus: Record<WorkflowStatus, number> = {
			draft: 0,
			active: 0,
			paused: 0,
			completed: 0,
			failed: 0,
			cancelled: 0
		};
		
		const byCategory: Record<string, number> = {};
		let totalTimeSaved = 0; // minutes
		
		for (const workflow of allWorkflows) {
			byStatus[workflow.status] = (byStatus[workflow.status] || 0) + 1;
			
			// Extract category from workflow ID or metadata
			const category = workflow.metadata.category || 'unknown';
			byCategory[category] = (byCategory[category] || 0) + 1;
			
			// Estimate time saved (placeholder calculation)
			if (workflow.status === 'completed') {
				totalTimeSaved += 30; // Assume 30 minutes saved per completed workflow
			}
		}
		
		return {
			total: allWorkflows.length,
			byStatus,
			byCategory,
			totalTimeSaved,
			averageTimeSaved: allWorkflows.length > 0 ? Math.round(totalTimeSaved / allWorkflows.length) : 0
		};
	}
);

/**
 * UI hooks
 */

/**
 * Use workflow suggestions hook
 */
export function useWorkflowSuggestions(context?: CopilotContext) {
	const load = () => workflowUI.loadSuggestedWorkflows(context);
	const suggestions = derived(workflowUI, $state => $state.suggestedWorkflows);
	const loading = derived(workflowUI, $state => $state.loading.suggestions);
	const error = derived(workflowUI, $state => $state.errors.start);
	
	return {
		suggestions,
		loading,
		error,
		load,
		start: workflowUI.startWorkflow
	};
}

/**
 * Use active workflows hook
 */
export function useActiveWorkflows() {
	const load = () => workflowUI.loadActiveWorkflows();
	const workflows = derived(workflowUI, $state => $state.activeWorkflows);
	const selected = derived(workflowUI, $state => $state.selectedWorkflow);
	
	return {
		workflows,
		selected,
		load,
		select: workflowUI.selectWorkflow,
		pause: workflowUI.pauseWorkflow,
		resume: workflowUI.resumeWorkflow,
		cancel: workflowUI.cancelWorkflow
	};
}

/**
 * Use workflow progress hook
 */
export function useWorkflowProgress(workflowInstanceId?: string) {
	const progress = derived(
		workflowUI,
		($workflowUI) => {
			if (!workflowInstanceId) return 0;
			
			const workflow = $workflowUI.activeWorkflows.find(w => w.id === workflowInstanceId) ||
							$workflowUI.completedWorkflows.find(w => w.id === workflowInstanceId);
			
			if (!workflow || !workflow.steps.length) return 0;
			
			const completedSteps = workflow.steps.filter(step => 
				step.status === 'completed' || step.status === 'skipped'
			).length;
			
			return Math.round((completedSteps / workflow.steps.length) * 100);
		}
	);
	
	const currentStep = derived(
		workflowUI,
		($workflowUI) => {
			if (!workflowInstanceId) return null;
			
			const workflow = $workflowUI.activeWorkflows.find(w => w.id === workflowInstanceId) ||
							$workflowUI.completedWorkflows.find(w => w.id === workflowInstanceId);
			
			if (!workflow) return null;
			
			return workflow.steps.find(step => step.id === workflow.currentStepId) || null;
		}
	);
	
	const status = derived(
		workflowUI,
		($workflowUI) => {
			if (!workflowInstanceId) return null;
			
			const workflow = $workflowUI.activeWorkflows.find(w => w.id === workflowInstanceId) ||
							$workflowUI.completedWorkflows.find(w => w.id === workflowInstanceId);
			
			return workflow?.status || null;
		}
	);
	
	return {
		progress,
		currentStep,
		status
	};
}

/**
 * Use workflow automation hook
 */
export function useWorkflowAutomation() {
	const visible = derived(workflowUI, $state => $state.visible);
	const toggleSuggestions = () => workflowUI.toggleSuggestionsPanel();
	const toggleDetails = () => workflowUI.toggleWorkflowDetails();
	const toggleProgress = () => workflowUI.toggleStepProgress();
	
	return {
		visible,
		toggleSuggestions,
		toggleDetails,
		toggleProgress,
		clearErrors: workflowUI.clearErrors
	};
}

/**
 * Initialize workflow UI
 */
export function initializeWorkflowUI(): void {
	// Set up orchestrator event listeners
	orchestrator.onEvent((event: OrchestratorEvent) => {
		switch (event.type) {
			case 'workflow-started':
			case 'workflow-completed':
			case 'workflow-failed':
				// Refresh active workflows
				workflowUI.loadActiveWorkflows();
				break;
				
			case 'workflow-suggested':
				// Update suggested workflows
				workflowUI.loadSuggestedWorkflows();
				break;
		}
	});
	
	// Initial load
	workflowUI.loadSuggestedWorkflows();
	workflowUI.loadActiveWorkflows();
	
	console.log('Workflow UI initialized');
}