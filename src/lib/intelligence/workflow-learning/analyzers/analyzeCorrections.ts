/**
 * Analyze Corrections
 * 
 * Detects sections or fields that the user frequently corrects after initial entry.
 */

import type { WorkflowProfile } from '../WorkflowProfile';

export interface CorrectionObservation {
	reportId: string;
	reportTypeId: string;
	correctedSections: string[];
	correctedFields: string[];
	correctionTypes: string[]; // e.g., 'typo', 'format', 'content', 'compliance'
	timestamp: Date;
}

/**
 * Analyze observed corrections to update the profile's commonCorrections.
 */
export function analyzeCorrections(
	observations: CorrectionObservation[],
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

	// Count frequencies of corrected sections and fields
	const sectionCount: Record<string, number> = {};
	const fieldCount: Record<string, number> = {};

	for (const obs of relevantObservations) {
		obs.correctedSections.forEach(section => {
			sectionCount[section] = (sectionCount[section] || 0) + 1;
		});
		obs.correctedFields.forEach(field => {
			fieldCount[field] = (fieldCount[field] || 0) + 1;
		});
	}

	// Determine which corrections are "common" (appear in >30% of observations)
	const commonSections = Object.entries(sectionCount)
		.filter(([_, count]) => count / relevantObservations.length > 0.3)
		.map(([section]) => section);

	const commonFields = Object.entries(fieldCount)
		.filter(([_, count]) => count / relevantObservations.length > 0.3)
		.map(([field]) => field);

	// Combine with existing corrections (union)
	const existingCorrections = existingProfile.commonCorrections;
	const mergedCorrections = [...new Set([...existingCorrections, ...commonSections, ...commonFields])];

	// Update confidence score based on detection strength
	const detectionStrength = (commonSections.length + commonFields.length) / 10;
	const confidenceBoost = Math.min(0.15, detectionStrength);
	const newConfidence = Math.min(1.0, existingProfile.confidenceScore + confidenceBoost);

	return {
		...existingProfile,
		commonCorrections: mergedCorrections,
		confidenceScore: newConfidence,
	};
}