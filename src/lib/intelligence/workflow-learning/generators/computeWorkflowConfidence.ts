/**
 * Compute Workflow Confidence
 * 
 * Computes a confidence score for a workflow profile based on:
 * - Number of observations
 * - Consistency of patterns
 * - Recency of observations
 * - Coverage of profile fields
 */

import type { WorkflowProfile } from '../WorkflowProfile';

export interface ConfidenceFactors {
	observationCount: number;
	patternConsistency: number; // 0‑1, how consistent the observed patterns are
	recencyScore: number; // 0‑1, based on last observation time
	fieldCoverage: number; // 0‑1, how many profile fields have data
}

/**
 * Compute a confidence score for a workflow profile.
 */
export function computeWorkflowConfidence(
	profile: WorkflowProfile,
	factors: ConfidenceFactors
): number {
	const {
		observationCount,
		patternConsistency,
		recencyScore,
		fieldCoverage,
	} = factors;

	// Normalize observation count (log scale, max at 100 observations)
	const observationFactor = Math.min(1, Math.log10(observationCount + 1) / 2);

	// Weighted average of factors
	const weights = {
		observation: 0.3,
		consistency: 0.3,
		recency: 0.2,
		coverage: 0.2,
	};

	const score =
		observationFactor * weights.observation +
		patternConsistency * weights.consistency +
		recencyScore * weights.recency +
		fieldCoverage * weights.coverage;

	// Ensure score is between 0 and 1
	return Math.max(0, Math.min(1, score));
}

/**
 * Helper to compute confidence factors from raw observation data.
 */
export function computeConfidenceFactors(
	profile: WorkflowProfile,
	observationCount: number,
	lastObservationTime: Date,
	patternConsistency: number
): ConfidenceFactors {
	const now = new Date();
	const hoursSinceLastObservation = (now.getTime() - lastObservationTime.getTime()) / (1000 * 60 * 60);
	// Recency score decays after 7 days
	const recencyScore = Math.max(0, 1 - hoursSinceLastObservation / (7 * 24));

	// Field coverage: proportion of profile fields that have non‑empty data
	const fields = [
		profile.commonSectionOrder.length > 0,
		profile.commonOmissions.length > 0,
		profile.commonCorrections.length > 0,
		profile.preferredInteractionPatterns.length > 0,
		profile.typicalDataSources.length > 0,
		Object.keys(profile.workflowHeuristics).length > 0,
	];
	const fieldCoverage = fields.filter(Boolean).length / fields.length;

	return {
		observationCount,
		patternConsistency,
		recencyScore,
		fieldCoverage,
	};
}