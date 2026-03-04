/**
 * Report Type Expansion Result (Phase 11)
 * 
 * Result of analysing a decompiled report to propose a new report type.
 */

import type { ReportTypeDefinition } from '../registry/ReportTypeDefinition';

export interface ReportTypeExpansionResult {
	id: string;
	proposedReportTypeDefinition: ReportTypeDefinition;
	requiredSections: string[];
	optionalSections: string[];
	conditionalSections: string[];
	complianceRules: string[];
	terminology: string[];
	methodologyBlocks: string[];
	confidenceScore: number; // 0–1
	warnings: string[];
	timestamps: {
		createdAt: Date;
		updatedAt: Date;
		analysedAt: Date;
	};
}

/**
 * Create a new expansion result.
 */
export function createReportTypeExpansionResult(
	proposedReportTypeDefinition: ReportTypeDefinition,
	requiredSections: string[],
	optionalSections: string[],
	conditionalSections: string[],
	complianceRules: string[],
	terminology: string[],
	methodologyBlocks: string[],
	confidenceScore: number,
	warnings: string[] = []
): ReportTypeExpansionResult {
	const now = new Date();
	return {
		id: `expansion-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
		proposedReportTypeDefinition,
		requiredSections,
		optionalSections,
		conditionalSections,
		complianceRules,
		terminology,
		methodologyBlocks,
		confidenceScore,
		warnings,
		timestamps: {
			createdAt: now,
			updatedAt: now,
			analysedAt: now
		}
	};
}

/**
 * Validate an expansion result.
 */
export function validateReportTypeExpansionResult(result: ReportTypeExpansionResult): string[] {
	const errors: string[] = [];

	if (!result.id) errors.push('Missing id');
	if (!result.proposedReportTypeDefinition) errors.push('Missing proposed report type definition');
	if (!result.requiredSections) errors.push('Missing requiredSections');
	if (!result.optionalSections) errors.push('Missing optionalSections');
	if (!result.conditionalSections) errors.push('Missing conditionalSections');
	if (!result.complianceRules) errors.push('Missing complianceRules');
	if (!result.terminology) errors.push('Missing terminology');
	if (!result.methodologyBlocks) errors.push('Missing methodologyBlocks');
	if (result.confidenceScore < 0 || result.confidenceScore > 1) errors.push('Confidence score must be between 0 and 1');
	if (!result.timestamps) errors.push('Missing timestamps');
	if (!result.timestamps.createdAt) errors.push('Missing createdAt');
	if (!result.timestamps.updatedAt) errors.push('Missing updatedAt');
	if (!result.timestamps.analysedAt) errors.push('Missing analysedAt');

	return errors;
}