/**
 * Analyze Omissions
 * 
 * Detects sections or fields that the user frequently forgets to fill.
 */

import type { WorkflowProfile } from '../WorkflowProfile';

export interface OmissionObservation {
	reportId: string;
	reportTypeId: string;
	missingSections: string[];
	missingFields: string[];
	timestamp: Date;
}

/**
 * Analyze observed omissions to update the profile's commonOmissions.
 */
export function analyzeOmissions(
	observations: OmissionObservation[],
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

	// Count frequencies of missing sections and fields
	const sectionCount: Record<string, number> = {};
	const fieldCount: Record<string, number> = {};

	for (const obs of relevantObservations) {
		obs.missingSections.forEach(section => {
			sectionCount[section] = (sectionCount[section] || 0) + 1;
		});
		obs.missingFields.forEach(field => {
			fieldCount[field] = (fieldCount[field] || 0) + 1;
		});
	}

	// Determine which omissions are "common" (appear in >50% of observations)
	const commonSections = Object.entries(sectionCount)
		.filter(([_, count]) => count / relevantObservations.length > 0.5)
		.map(([section]) => section);

	const commonFields = Object.entries(fieldCount)
		.filter(([_, count]) => count / relevantObservations.length > 0.5)
		.map(([field]) => field);

	// Combine with existing omissions (union)
	const existingOmissions = existingProfile.commonOmissions;
	const mergedOmissions = [...new Set([...existingOmissions, ...commonSections, ...commonFields])];

	// Update confidence score based on detection strength
	const detectionStrength = (commonSections.length + commonFields.length) / 10;
	const confidenceBoost = Math.min(0.2, detectionStrength);
	const newConfidence = Math.min(1.0, existingProfile.confidenceScore + confidenceBoost);

	return {
		...existingProfile,
		commonOmissions: mergedOmissions,
		confidenceScore: newConfidence,
	};
}