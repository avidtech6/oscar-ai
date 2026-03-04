/**
 * Update Workflow Profile
 * 
 * Updates an existing workflow profile with new observations.
 */

import type { WorkflowProfile } from '../WorkflowProfile';
import { updateWorkflowProfile as updateProfile } from '../WorkflowProfile';
import { analyzeSectionOrder, type SectionOrderObservation } from '../analyzers/analyzeSectionOrder';
import { analyzeOmissions, type OmissionObservation } from '../analyzers/analyzeOmissions';
import { analyzeCorrections, type CorrectionObservation } from '../analyzers/analyzeCorrections';
import { analyzeInteractionPatterns, type InteractionObservation } from '../analyzers/analyzeInteractionPatterns';
import { analyzeDataSources, type DataSourceObservation } from '../analyzers/analyzeDataSources';

export interface WorkflowObservationBatch {
	sectionOrders: SectionOrderObservation[];
	omissions: OmissionObservation[];
	corrections: CorrectionObservation[];
	interactions: InteractionObservation[];
	dataSources: DataSourceObservation[];
}

/**
 * Update an existing workflow profile with a batch of new observations.
 */
export function updateWorkflowProfile(
	existingProfile: WorkflowProfile,
	observations: WorkflowObservationBatch
): WorkflowProfile {
	let profile = existingProfile;

	// Apply each analyzer in sequence
	profile = analyzeSectionOrder(observations.sectionOrders, profile);
	profile = analyzeOmissions(observations.omissions, profile);
	profile = analyzeCorrections(observations.corrections, profile);
	profile = analyzeInteractionPatterns(observations.interactions, profile);
	profile = analyzeDataSources(observations.dataSources, profile);

	// Update timestamps and version via the generic update function
	profile = updateProfile(profile, {
		commonSectionOrder: profile.commonSectionOrder,
		commonOmissions: profile.commonOmissions,
		commonCorrections: profile.commonCorrections,
		preferredInteractionPatterns: profile.preferredInteractionPatterns,
		typicalDataSources: profile.typicalDataSources,
		confidenceScore: profile.confidenceScore,
	});

	return profile;
}