/**
 * Analyze Data Sources
 * 
 * Detects where the user typically gets data for reports (e.g., file uploads, database queries,
 * external APIs, manual entry, AI generation).
 */

import type { WorkflowProfile } from '../WorkflowProfile';

export interface DataSourceObservation {
	reportId: string;
	reportTypeId: string;
	dataSourceType: string; // e.g., 'file_upload', 'database', 'api', 'manual', 'ai_generated'
	dataSourceDetail: string; // e.g., 'PDF', 'CSV', 'Supabase', 'Google Sheets'
	timestamp: Date;
}

/**
 * Analyze observed data sources to update the profile's typicalDataSources.
 */
export function analyzeDataSources(
	observations: DataSourceObservation[],
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

	// Count frequencies of each data source
	const sourceCount: Record<string, number> = {};

	for (const obs of relevantObservations) {
		const key = `${obs.dataSourceType}:${obs.dataSourceDetail}`;
		sourceCount[key] = (sourceCount[key] || 0) + 1;
	}

	// Determine which data sources are "typical" (appear in >30% of observations)
	const typicalSources = Object.entries(sourceCount)
		.filter(([_, count]) => count / relevantObservations.length > 0.3)
		.map(([source]) => source);

	// Combine with existing data sources (union)
	const existingSources = existingProfile.typicalDataSources;
	const mergedSources = [...new Set([...existingSources, ...typicalSources])];

	// Update confidence score based on detection strength
	const detectionStrength = typicalSources.length / 5;
	const confidenceBoost = Math.min(0.1, detectionStrength);
	const newConfidence = Math.min(1.0, existingProfile.confidenceScore + confidenceBoost);

	return {
		...existingProfile,
		typicalDataSources: mergedSources,
		confidenceScore: newConfidence,
	};
}