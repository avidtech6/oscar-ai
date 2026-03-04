/**
 * Build AI Guidance (Phase 8)
 * 
 * Creates AI guidance prompts for each section and field.
 */

import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';
import type { AIGuidance, TemplateSection } from '../ReportTemplate';

/**
 * Build AI guidance for a report type
 */
export function buildAIGuidance(
	reportType: ReportTypeDefinition,
	sections: TemplateSection[]
): AIGuidance[] {
	const guidance: AIGuidance[] = [];

	// Section‑level guidance
	for (const section of sections) {
		guidance.push(createSectionGuidance(section));
	}

	// Report‑type‑specific guidance
	if (reportType.aiGuidance) {
		for (const guidanceItem of reportType.aiGuidance) {
			guidance.push({
				id: `guidance_${guidanceItem.replace(/\s+/g, '_').toLowerCase()}`,
				sectionId: 'general',
				prompt: guidanceItem,
				examples: [],
				styleHints: []
			});
		}
	}

	// Compliance guidance
	if (reportType.complianceRules) {
		for (const rule of reportType.complianceRules) {
			guidance.push({
				id: `compliance_${rule.replace(/\s+/g, '_').toLowerCase()}`,
				sectionId: 'compliance',
				prompt: `Ensure the report adheres to: ${rule}`,
				examples: [],
				styleHints: []
			});
		}
	}

	return guidance;
}

/**
 * Create AI guidance for a single section
 */
function createSectionGuidance(section: TemplateSection): AIGuidance {
	const id = `section_guidance_${section.id}`;
	let prompt = '';
	let examples: string[] = [];
	let styleHints: string[] = [];

	switch (section.type) {
		case 'required':
			prompt = `Write a comprehensive ${section.title} section that covers all required elements.`;
			examples = [
				`The ${section.title} should begin with a clear statement of purpose.`,
				`Include relevant data and observations to support the findings.`
			];
			styleHints = ['formal', 'structured', 'concise'];
			break;
		case 'optional':
			prompt = `If included, the ${section.title} section should provide supplementary information.`;
			examples = [
				`This section can be omitted if not applicable.`,
				`Use bullet points for clarity.`
			];
			styleHints = ['flexible', 'informative'];
			break;
		case 'conditional':
			prompt = `Include the ${section.title} section only if the specified conditions are met.`;
			examples = [
				`Check the project requirements before including this section.`,
				`Provide clear justification for inclusion.`
			];
			styleHints = ['conditional', 'justified'];
			break;
		default:
			prompt = `Provide content for the ${section.title} section.`;
			examples = [];
			styleHints = [];
	}

	return {
		id,
		sectionId: section.id,
		prompt,
		examples,
		styleHints
	};
}