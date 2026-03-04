/**
 * Compliance Module (Phase 9)
 * 
 * Validates that reports comply with all requirements.
 */

export { ReportComplianceValidator } from './ReportComplianceValidator';
export * from './ComplianceResult';

// Validators
export { validateRequiredSections } from './validators/validateRequiredSections';
export { validateRequiredFields } from './validators/validateRequiredFields';
export { validateComplianceRules } from './validators/validateComplianceRules';
export { validateStructure } from './validators/validateStructure';
export { validateTerminology } from './validators/validateTerminology';
export { detectContradictions } from './validators/detectContradictions';
export { computeComplianceScore } from './validators/computeComplianceScore';