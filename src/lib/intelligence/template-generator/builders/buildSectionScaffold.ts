/**
 * Build Section Scaffold (Phase 8)
 * 
 * Creates section scaffolds based on report type definitions.
 */

import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';
import type { TemplateSection } from '../ReportTemplate';

/**
 * Build section scaffold from a report type definition
 */
export function buildSectionScaffold(reportType: ReportTypeDefinition): TemplateSection[] {
	const sections: TemplateSection[] = [];

	// Required sections
	for (const section of reportType.requiredSections) {
		sections.push(createTemplateSection(section, 'required', sections.length));
	}

	// Optional sections
	for (const section of reportType.optionalSections) {
		sections.push(createTemplateSection(section, 'optional', sections.length));
	}

	// Conditional sections (if any)
	if (reportType.conditionalSections) {
		for (const section of reportType.conditionalSections) {
			sections.push(createTemplateSection(section, 'conditional', sections.length));
		}
	}

	// Sort by order (if any)
	return sections.sort((a, b) => a.order - b.order);
}

/**
 * Create a single template section
 */
function createTemplateSection(
	sectionName: string,
	type: 'required' | 'optional' | 'conditional',
	order: number
): TemplateSection {
	const id = `section_${sectionName.toLowerCase().replace(/\s+/g, '_')}`;
	return {
		id,
		title: sectionName,
		type,
		order,
		fields: [], // fields will be added by another builder
		guidance: getDefaultGuidance(sectionName, type)
	};
}

/**
 * Provide default guidance for a section
 */
function getDefaultGuidance(sectionName: string, type: string): string {
	switch (type) {
		case 'required':
			return `This ${sectionName} section is required. Ensure all required fields are completed.`;
		case 'optional':
			return `This ${sectionName} section is optional. Include if relevant to the report.`;
		case 'conditional':
			return `This ${sectionName} section is conditional. Include only if the specified conditions are met.`;
		default:
			return `Provide content for the ${sectionName} section.`;
	}
}