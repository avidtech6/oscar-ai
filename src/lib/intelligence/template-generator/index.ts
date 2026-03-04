/**
 * Template Generator Module (Phase 8)
 * 
 * Generates structured templates for consistent, compliant reports.
 */

export { ReportTemplateGenerator } from './ReportTemplateGenerator';
export * from './ReportTemplate';

// Builders
export { buildSectionScaffold } from './builders/buildSectionScaffold';
export { buildPlaceholders } from './builders/buildPlaceholders';
export { buildAIGuidance } from './builders/buildAIGuidance';
export { buildStyleIntegration } from './builders/buildStyleIntegration';
export { buildComplianceIntegration } from './builders/buildComplianceIntegration';

// Generators
export { generateTemplate } from './generators/generateTemplate';
export { regenerateTemplate } from './generators/regenerateTemplate';
export { versionTemplate } from './generators/versionTemplate';