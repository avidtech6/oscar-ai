/**
 * Report Type Expansion Framework (Phase 11)
 * 
 * Exports for the expansion engine and related utilities.
 */

export { ReportTypeExpansionEngine } from './ReportTypeExpansionEngine';
export type { ReportTypeExpansionResult } from './ReportTypeExpansionResult';
export { createReportTypeExpansionResult, validateReportTypeExpansionResult } from './ReportTypeExpansionResult';

// Export extractors
export { extractSectionPatterns } from './extractors/extractSectionPatterns';
export { extractRequiredSections } from './extractors/extractRequiredSections';
export { extractOptionalSections } from './extractors/extractOptionalSections';
export { extractConditionalSections } from './extractors/extractConditionalSections';
export { extractCompliancePatterns } from './extractors/extractCompliancePatterns';
export { extractTerminologyPatterns } from './extractors/extractTerminologyPatterns';
export { extractMethodologyBlocks } from './extractors/extractMethodologyBlocks';

// Export generators
export { generateReportTypeDefinition } from './generators/generateReportTypeDefinition';
export { validateReportTypeDefinition } from './generators/validateReportTypeDefinition';
export { mergeWithExistingTypes } from './generators/mergeWithExistingTypes';

// Export storage
export { reportTypeExpansionStorage } from './storage';