/**
 * Current Workflow Store Types
 */

import type { WorkflowDefinition } from '../../intelligence/types';

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

export const initialState: CurrentWorkflow = {
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