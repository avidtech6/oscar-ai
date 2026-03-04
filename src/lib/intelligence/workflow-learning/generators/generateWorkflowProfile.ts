/**
 * Generate Workflow Profile
 * 
 * Orchestrates the analysis of observed user interactions and creates a new workflow profile.
 */

import type { WorkflowProfile } from '../WorkflowProfile';
import { createWorkflowProfile } from '../WorkflowProfile';
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
 * Generate a new workflow profile from a batch of observations.
 */
export function generateWorkflowProfile(
	userId: string,
	reportTypeId: string | null,
	observations: WorkflowObservationBatch
): WorkflowProfile {
	// Start with a fresh profile
	let profile = createWorkflowProfile(userId, reportTypeId);

	// Apply each analyzer in sequence
	profile = analyzeSectionOrder(observations.sectionOrders, profile);
	profile = analyzeOmissions(observations.omissions, profile);
	profile = analyzeCorrections(observations.corrections, profile);
	profile = analyzeInteractionPatterns(observations.interactions, profile);
	profile = analyzeDataSources(observations.dataSources, profile);

	// Compute overall confidence as average of sub‑confidence boosts (already applied)
	// No further adjustment needed.

	return profile;
}