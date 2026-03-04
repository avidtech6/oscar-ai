/**
 * User Workflow Learning for Reports (Phase 13)
 * 
 * Exports the main engine, types, analyzers, generators, and storage.
 */

export { UserWorkflowLearningEngine } from './UserWorkflowLearningEngine';
export type { UserInteractionEvent } from './UserWorkflowLearningEngine';

export { createWorkflowProfile, updateWorkflowProfile } from './WorkflowProfile';
export type { WorkflowProfile } from './WorkflowProfile';

// Analyzers
export { analyzeSectionOrder } from './analyzers/analyzeSectionOrder';
export type { SectionOrderObservation } from './analyzers/analyzeSectionOrder';

export { analyzeOmissions } from './analyzers/analyzeOmissions';
export type { OmissionObservation } from './analyzers/analyzeOmissions';

export { analyzeCorrections } from './analyzers/analyzeCorrections';
export type { CorrectionObservation } from './analyzers/analyzeCorrections';

export { analyzeInteractionPatterns } from './analyzers/analyzeInteractionPatterns';
export type { InteractionObservation } from './analyzers/analyzeInteractionPatterns';

export { analyzeDataSources } from './analyzers/analyzeDataSources';
export type { DataSourceObservation } from './analyzers/analyzeDataSources';

// Generators
export { generateWorkflowProfile } from './generators/generateWorkflowProfile';
export type { WorkflowObservationBatch } from './generators/generateWorkflowProfile';

export { updateWorkflowProfile as updateWorkflowProfileGenerator } from './generators/updateWorkflowProfile';
export { mergeWorkflowProfiles } from './generators/mergeWorkflowProfiles';
export { computeWorkflowConfidence, computeConfidenceFactors } from './generators/computeWorkflowConfidence';

// Storage
export {
	loadWorkflowProfiles,
	saveWorkflowProfile,
	deleteWorkflowProfile,
	getWorkflowProfilesForUser,
	getWorkflowProfilesForReportType,
} from './storage';
export type { StoredWorkflowProfile } from './storage';