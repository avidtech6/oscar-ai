/**
 * Generate Template (Phase 8)
 * 
 * Orchestrates the generation of a complete report template.
 */

import { reportTypeRegistry } from '../../registry/ReportTypeRegistry';
import { buildSectionScaffold } from '../builders/buildSectionScaffold';
import { buildPlaceholders } from '../builders/buildPlaceholders';
import { buildAIGuidance } from '../builders/buildAIGuidance';
import { buildStyleIntegration } from '../builders/buildStyleIntegration';
import { buildComplianceIntegration } from '../builders/buildComplianceIntegration';
import { createReportTemplate, incrementVersion } from '../ReportTemplate';
import type { StyleProfile } from '../../style-learner/StyleProfile';

/**
 * Generate a template for a report type
 */
export function generateTemplate(
	reportTypeId: string,
	styleProfile: StyleProfile | null = null
) {
	const reportType = reportTypeRegistry.getType(reportTypeId);
	if (!reportType) {
		throw new Error(`Report type "${reportTypeId}" not found`);
	}

	// Build sections
	const sections = buildSectionScaffold(reportType);

	// Build placeholders
	const placeholders = buildPlaceholders(reportType, sections);

	// Build AI guidance
	const aiGuidance = buildAIGuidance(reportType, sections);

	// Build compliance rules
	const complianceRules = buildComplianceIntegration(reportType, sections);

	// Apply style integration
	const styledSections = buildStyleIntegration(sections, styleProfile);

	// Create template
	const template = createReportTemplate(
		reportTypeId,
		styledSections,
		placeholders,
		aiGuidance,
		styleProfile?.id || null,
		complianceRules
	);

	return template;
}