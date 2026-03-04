/**
 * Build Compliance Integration (Phase 8)
 * 
 * Integrates compliance rules into templates.
 */

import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';
import type { ComplianceRule, TemplateSection } from '../ReportTemplate';

/**
 * Build compliance rules for a report type
 */
export function buildComplianceIntegration(
	reportType: ReportTypeDefinition,
	sections: TemplateSection[]
): ComplianceRule[] {
	const rules: ComplianceRule[] = [];

	// Add report‑type‑specific compliance rules
	if (reportType.complianceRules) {
		for (const ruleText of reportType.complianceRules) {
			rules.push(createComplianceRule(ruleText, 'general'));
		}
	}

	// Add section‑specific compliance rules
	for (const section of sections) {
		const sectionRules = getSectionComplianceRules(section.title);
		for (const ruleText of sectionRules) {
			rules.push(createComplianceRule(ruleText, section.id));
		}
	}

	return rules;
}

/**
 * Create a single compliance rule
 */
function createComplianceRule(ruleText: string, sectionId: string): ComplianceRule {
	const id = `compliance_${ruleText.toLowerCase().replace(/\s+/g, '_').substring(0, 30)}`;
	return {
		id,
		ruleId: id,
		text: ruleText,
		required: true,
		sectionId: sectionId === 'general' ? undefined : sectionId
	};
}

/**
 * Get compliance rules for a specific section
 */
function getSectionComplianceRules(sectionTitle: string): string[] {
	const lower = sectionTitle.toLowerCase();
	if (lower.includes('methodology')) {
		return [
			'Follow BS5837:2012 guidelines for tree surveys.',
			'Include reference to relevant British Standards.'
		];
	}
	if (lower.includes('recommendation') || lower.includes('conclusion')) {
		return [
			'Recommendations must be justified by the findings.',
			'Prioritize recommendations by risk level.'
		];
	}
	if (lower.includes('executive summary')) {
		return [
			'Executive summary must include key findings and recommendations.',
			'Keep executive summary to one page.'
		];
	}
	if (lower.includes('appendix')) {
		return [
			'Appendices must be clearly labelled and referenced in the main text.'
		];
	}
	return [];
}