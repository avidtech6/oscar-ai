/**
 * Generate Report Type Definition (Phase 11)
 * 
 * Generates a new report type definition based on extracted patterns.
 */

import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';
import { createReportTypeDefinition } from '../../registry/ReportTypeDefinition';

export interface ExpansionData {
	requiredSections: string[];
	optionalSections: string[];
	conditionalSections: string[];
	complianceRules: string[];
	terminology: string[];
	methodologyBlocks: string[];
	confidenceScore: number;
}

/**
 * Generate a report type definition from expansion data.
 * 
 * The definition includes:
 * - A generated ID (e.g., "custom-{timestamp}")
 * - A name derived from the first required section
 * - A description summarizing the report type
 * - Required, optional, conditional sections
 * - Compliance rules
 * - Terminology
 * - AI guidance placeholder
 * - Version "1.0.0"
 */
export function generateReportTypeDefinition(data: ExpansionData): ReportTypeDefinition {
	const id = `custom-${Date.now()}`;
	const name = data.requiredSections.length > 0
		? `${data.requiredSections[0]} Report`
		: 'Custom Report Type';
	const description = `A custom report type with ${data.requiredSections.length} required sections, ${data.optionalSections.length} optional sections, and ${data.conditionalSections.length} conditional sections.`;

	return createReportTypeDefinition(
		id,
		name,
		description,
		data.requiredSections,
		data.optionalSections,
		data.conditionalSections,
		[], // dependencies
		data.complianceRules,
		['Use the extracted terminology and methodology blocks.'], // AI guidance
		'1.0.0'
	);
}