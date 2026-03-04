/**
 * Analyze Interaction Patterns
 * 
 * Detects how the user interacts with the editor (e.g., keyboard shortcuts, mouse clicks,
 * drag‑and‑drop, voice commands, AI suggestions acceptance).
 */

import type { WorkflowProfile } from '../WorkflowProfile';

export interface InteractionObservation {
	reportId: string;
	reportTypeId: string;
	interactionType: string; // e.g., 'keyboard', 'mouse', 'drag', 'voice', 'ai_suggestion'
	interactionDetail: string; // e.g., 'ctrl+s', 'click_section', 'drag_image'
	timestamp: Date;
}

/**
 * Analyze observed interaction patterns to update the profile's preferredInteractionPatterns.
 */
export function analyzeInteractionPatterns(
	observations: InteractionObservation[],
	existingProfile: WorkflowProfile
): WorkflowProfile {
	if (observations.length === 0) {
		return existingProfile;
	}

	const relevantObservations = existingProfile.reportTypeId
		? observations.filter(o => o.reportTypeId === existingProfile.reportTypeId)
		: observations;

	if (relevantObservations.length === 0) {
		return existingProfile;
	}

	// Count frequencies of each interaction pattern
	const patternCount: Record<string, number> = {};

	for (const obs of relevantObservations) {
		const key = `${obs.interactionType}:${obs.interactionDetail}`;
		patternCount[key] = (patternCount[key] || 0) + 1;
	}

	// Determine which patterns are "preferred" (appear in >40% of observations)
	const preferredPatterns = Object.entries(patternCount)
		.filter(([_, count]) => count / relevantObservations.length > 0.4)
		.map(([pattern]) => pattern);

	// Combine with existing patterns (union)
	const existingPatterns = existingProfile.preferredInteractionPatterns;
	const mergedPatterns = [...new Set([...existingPatterns, ...preferredPatterns])];

	// Update confidence score based on detection strength
	const detectionStrength = preferredPatterns.length / 5;
	const confidenceBoost = Math.min(0.1, detectionStrength);
	const newConfidence = Math.min(1.0, existingProfile.confidenceScore + confidenceBoost);

	return {
		...existingProfile,
		preferredInteractionPatterns: mergedPatterns,
		confidenceScore: newConfidence,
	};
}