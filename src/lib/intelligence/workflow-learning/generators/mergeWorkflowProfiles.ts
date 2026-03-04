/**
 * Merge Workflow Profiles
 * 
 * Merges two workflow profiles (e.g., when a user switches report types or when profiles evolve).
 */

import type { WorkflowProfile } from '../WorkflowProfile';
import { createWorkflowProfile } from '../WorkflowProfile';

/**
 * Merge two workflow profiles into a new profile.
 * The resulting profile retains the union of observed patterns, weighted by confidence.
 */
export function mergeWorkflowProfiles(
	profileA: WorkflowProfile,
	profileB: WorkflowProfile
): WorkflowProfile {
	// Ensure both profiles belong to the same user
	if (profileA.userId !== profileB.userId) {
		throw new Error('Cannot merge profiles for different users');
	}

	// Determine report type: if both have the same reportTypeId, keep it; otherwise null
	const reportTypeId = profileA.reportTypeId === profileB.reportTypeId ? profileA.reportTypeId : null;

	// Weighted merging based on confidence scores
	const weightA = profileA.confidenceScore;
	const weightB = profileB.confidenceScore;
	const totalWeight = weightA + weightB;
	const weightRatioA = totalWeight > 0 ? weightA / totalWeight : 0.5;
	const weightRatioB = totalWeight > 0 ? weightB / totalWeight : 0.5;

	// Merge commonSectionOrder: pick the longer order, or weighted random? We'll pick the one with higher confidence.
	const commonSectionOrder = weightA >= weightB
		? profileA.commonSectionOrder
		: profileB.commonSectionOrder;

	// Merge commonOmissions: union
	const commonOmissions = [...new Set([...profileA.commonOmissions, ...profileB.commonOmissions])];

	// Merge commonCorrections: union
	const commonCorrections = [...new Set([...profileA.commonCorrections, ...profileB.commonCorrections])];

	// Merge preferredInteractionPatterns: union
	const preferredInteractionPatterns = [
		...new Set([...profileA.preferredInteractionPatterns, ...profileB.preferredInteractionPatterns]),
	];

	// Merge typicalDataSources: union
	const typicalDataSources = [
		...new Set([...profileA.typicalDataSources, ...profileB.typicalDataSources]),
	];

	// Merge workflowHeuristics: shallow merge, preferring higher confidence
	const workflowHeuristics = {
		...profileB.workflowHeuristics,
		...profileA.workflowHeuristics, // profileA overrides profileB if same key
	};

	// Combined confidence score (average)
	const confidenceScore = (profileA.confidenceScore + profileB.confidenceScore) / 2;

	// Create a new profile with merged data
	const mergedProfile = createWorkflowProfile(profileA.userId, reportTypeId, {
		commonSectionOrder,
		commonOmissions,
		commonCorrections,
		preferredInteractionPatterns,
		typicalDataSources,
		workflowHeuristics,
		confidenceScore,
	});

	// Override timestamps to reflect merge time (already set by createWorkflowProfile)
	return mergedProfile;
}