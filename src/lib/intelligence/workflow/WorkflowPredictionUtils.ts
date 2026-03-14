/**
 * Workflow Prediction Utilities (extracted from WorkflowPredictionEngine)
 * 
 * Contains deduplication, sorting, summary, and explanation helpers.
 */

import type { PredictedNextStep } from './WorkflowTypes';

/**
 * Deduplicate predictions (by description) and sort by priority then confidence.
 */
export function deduplicateAndSort(steps: PredictedNextStep[]): PredictedNextStep[] {
	const seen = new Set<string>();
	const unique: PredictedNextStep[] = [];

	for (const step of steps) {
		const key = step.description;
		if (!seen.has(key)) {
			seen.add(key);
			unique.push(step);
		}
	}

	return unique.sort((a, b) => {
		if (a.priority !== b.priority) return b.priority - a.priority; // higher priority first
		return b.confidence - a.confidence;
	});
}

/**
 * Get a summary of predictions for a given context.
 */
export function getPredictionSummary(predictions: PredictedNextStep[]): {
	totalPredictions: number;
	highPriority: number;
	byCategory: Record<string, number>;
	nextSuggestedStep: PredictedNextStep | null;
} {
	const highPriority = predictions.filter(p => p.priority >= 4).length;
	const byCategory: Record<string, number> = {};

	// Simple categorization by trigger
	for (const p of predictions) {
		const cat = p.trigger;
		byCategory[cat] = (byCategory[cat] || 0) + 1;
	}

	return {
		totalPredictions: predictions.length,
		highPriority,
		byCategory,
		nextSuggestedStep: predictions.length > 0 ? predictions[0] : null,
	};
}

/**
 * Generate a natural‑language explanation of the predictions.
 */
export function explainPredictions(predictions: PredictedNextStep[]): string {
	if (predictions.length === 0) {
		return "No predictions at this time. Your workflow seems up‑to‑date.";
	}

	const lines = predictions.map((p, idx) => {
		return `${idx + 1}. ${p.description} (priority ${p.priority}, confidence ${Math.round(p.confidence * 100)}%)`;
	});

	return `I predict you should:\n${lines.join('\n')}`;
}