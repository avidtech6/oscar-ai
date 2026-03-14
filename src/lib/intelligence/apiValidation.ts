/**
 * Intelligence API: Validation
 * 
 * Validate report structure against definitions.
 */

import { getReportTypeDefinition } from './apiDefinitions';

/**
 * Validate if a report structure is compliant
 */
export async function validateReportStructure(
	reportType: string,
	structure: Record<string, any>
): Promise<{
	valid: boolean;
	errors: string[];
	warnings: string[];
	missingSections: string[];
	extraSections: string[];
}> {
	const definition = await getReportTypeDefinition(reportType);
	if (!definition) {
		return {
			valid: false,
			errors: [`Report type "${reportType}" not found`],
			warnings: [],
			missingSections: [],
			extraSections: []
		};
	}
	
	const errors: string[] = [];
	const warnings: string[] = [];
	const missingSections: string[] = [];
	const extraSections: string[] = [];
	
	// Check required sections
	for (const requiredSection of definition.requiredSections) {
		if (!structure[requiredSection]) {
			missingSections.push(requiredSection);
			errors.push(`Missing required section: ${requiredSection}`);
		}
	}
	
	// Check for extra sections (not in required, optional, or conditional)
	const allAllowedSections = [
		...definition.requiredSections,
		...definition.optionalSections,
		...definition.conditionalSections
	];
	
	for (const section in structure) {
		if (!allAllowedSections.includes(section)) {
			extraSections.push(section);
			warnings.push(`Extra section found: ${section}`);
		}
	}
	
	return {
		valid: errors.length === 0,
		errors,
		warnings,
		missingSections,
		extraSections
	};
}