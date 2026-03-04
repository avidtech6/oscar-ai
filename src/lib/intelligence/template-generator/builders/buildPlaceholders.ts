/**
 * Build Placeholders (Phase 8)
 * 
 * Creates placeholder definitions for required, optional, and conditional fields.
 */

import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';
import type { PlaceholderDefinition, TemplateSection } from '../ReportTemplate';

/**
 * Build placeholders for a report type
 */
export function buildPlaceholders(
	reportType: ReportTypeDefinition,
	sections: TemplateSection[]
): Record<string, PlaceholderDefinition> {
	const placeholders: Record<string, PlaceholderDefinition> = {};

	// For each section, create placeholders for its fields
	for (const section of sections) {
		// Determine field names based on section type
		const fieldNames = getDefaultFieldNames(section.title, section.type);
		for (const fieldName of fieldNames) {
			const placeholder = createPlaceholder(section.id, fieldName);
			placeholders[placeholder.id] = placeholder;
		}
	}

	// Add placeholders for metadata fields
	const metadataFields = ['author', 'date', 'client', 'projectReference', 'version'];
	for (const field of metadataFields) {
		const placeholder = createPlaceholder('metadata', field);
		placeholders[placeholder.id] = placeholder;
	}

	return placeholders;
}

/**
 * Get default field names for a section
 */
function getDefaultFieldNames(sectionTitle: string, sectionType: string): string[] {
	const lower = sectionTitle.toLowerCase();
	if (lower.includes('introduction') || lower.includes('executive summary')) {
		return ['background', 'objectives', 'scope'];
	}
	if (lower.includes('methodology')) {
		return ['approach', 'tools', 'standards', 'limitations'];
	}
	if (lower.includes('findings') || lower.includes('results')) {
		return ['observation', 'data', 'analysis', 'interpretation'];
	}
	if (lower.includes('recommendation') || lower.includes('conclusion')) {
		return ['recommendation', 'priority', 'timeline', 'responsibleParty'];
	}
	if (lower.includes('appendix') || lower.includes('attachment')) {
		return ['document', 'reference', 'notes'];
	}
	// Generic fields
	return ['content'];
}

/**
 * Create a single placeholder definition
 */
function createPlaceholder(sectionId: string, fieldName: string): PlaceholderDefinition {
	const id = `placeholder_${sectionId}_${fieldName.toLowerCase().replace(/\s+/g, '_')}`;
	return {
		id,
		fieldId: `${sectionId}_${fieldName}`,
		description: `Provide ${fieldName} for ${sectionId}`,
		example: getExample(fieldName),
		aiPrompt: getAIPrompt(fieldName)
	};
}

/**
 * Provide an example value for a field
 */
function getExample(fieldName: string): string {
	switch (fieldName) {
		case 'author':
			return 'John Smith, Arboricultural Consultant';
		case 'date':
			return '2025-03-03';
		case 'client':
			return 'Acme Development Ltd';
		case 'projectReference':
			return 'PRJ-2025-001';
		case 'background':
			return 'The site is located within a conservation area with mature trees.';
		case 'objectives':
			return 'Assess tree health, identify risks, and provide recommendations.';
		case 'approach':
			return 'Visual tree assessment following BS5837:2012 guidelines.';
		case 'observation':
			return 'Tree T1 shows signs of decay at the base.';
		case 'recommendation':
			return 'Carry out crown reduction by 20% within the next 12 months.';
		default:
			return 'Enter appropriate content here.';
	}
}

/**
 * Provide an AI prompt for a field
 */
function getAIPrompt(fieldName: string): string {
	return `Generate concise, professional content for the ${fieldName} field.`;
}