/**
 * Self‑Healing Module (Phase 7)
 * 
 * Detects missing components, contradictions, and generates healing actions.
 */

export { SelfHealingActionType, Severity, createSelfHealingAction } from './SelfHealingAction';
export { ReportSelfHealingEngine } from './ReportSelfHealingEngine';

// Detectors
export { detectMissingSections } from './detectors/detectMissingSections';
export { detectMissingFields } from './detectors/detectMissingFields';
export { detectMissingComplianceRules } from './detectors/detectMissingComplianceRules';
export { detectMissingTerminology } from './detectors/detectMissingTerminology';
export { detectMissingTemplates } from './detectors/detectMissingTemplates';
export { detectMissingAIGuidance } from './detectors/detectMissingAIGuidance';
export { detectSchemaContradictions } from './detectors/detectSchemaContradictions';
export { detectStructuralContradictions } from './detectors/detectStructuralContradictions';
export { detectMetadataContradictions } from './detectors/detectMetadataContradictions';

// Generator
export { generateHealingActions } from './generators/generateHealingActions';