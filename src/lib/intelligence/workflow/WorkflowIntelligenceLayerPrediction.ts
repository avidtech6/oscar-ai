/**
 * Workflow Intelligence Layer – prediction
 */

import type { PredictedNextStep } from './WorkflowTypes';
import { WorkflowPredictionEngine } from './WorkflowPredictionEngine';
import type { PredictionContext } from './WorkflowPredictionEngine';
import * as Delegates from './WorkflowIntelligenceLayerDelegates';

export class WorkflowIntelligenceLayerPrediction {
	private prediction: WorkflowPredictionEngine;

	constructor(prediction: WorkflowPredictionEngine) {
		this.prediction = prediction;
	}

	/**
	 * Predict next steps for a given context.
	 */
	predictNextSteps(context: PredictionContext): PredictedNextStep[] {
		return Delegates.predictNextSteps(this.prediction, context);
	}

	/**
	 * Get a summary of predictions.
	 */
	getPredictionSummary(context: PredictionContext) {
		return Delegates.getPredictionSummary(this.prediction, context);
	}

	/**
	 * Explain predictions in natural language.
	 */
	explainPredictions(context: PredictionContext): string {
		return Delegates.explainPredictions(this.prediction, context);
	}
}