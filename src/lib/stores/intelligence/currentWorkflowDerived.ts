/**
 * Derived stores for current workflow
 */

import { derived } from 'svelte/store';
import { currentWorkflow } from './currentWorkflow';

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