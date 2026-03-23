/**
 * Intelligence API: Validation - Layer 2 Presentation
 *
 * Validate report structure against definitions.
 *
 * NOTE: Core implementation has been extracted to Layer 1 Core for purity.
 * This file now re-exports the Layer 1 implementation to maintain compatibility.
 */

import { getReportTypeDefinition } from './apiDefinitions';
import { createIntelligenceValidationCore, type IntelligenceValidationCore } from './layer1/intelligenceValidationCore';

// Create core validation instance
const validationCore: IntelligenceValidationCore = createIntelligenceValidationCore();

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
	return validationCore.validateReportStructure(definition, structure);
}