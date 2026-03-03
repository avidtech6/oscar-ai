/**
 * Report Type Definition (Phase 1)
 * 
 * Type definition for report types in the registry.
 * This file exports the ReportTypeDefinition interface and related types.
 */

import type { ReportTypeDefinition as BaseReportTypeDefinition } from '../types';

/**
 * Report Type Definition
 * 
 * This interface matches the one in types.ts but is re‑exported here
 * for clarity and to satisfy Phase 1 file structure requirements.
 */
export interface ReportTypeDefinition extends BaseReportTypeDefinition {}

/**
 * Helper function to create a report type definition
 */
export function createReportTypeDefinition(
	id: string,
	name: string,
	description: string,
	requiredSections: string[],
	optionalSections: string[] = [],
	conditionalSections: string[] = [],
	dependencies: string[] = [],
	complianceRules: string[] = [],
	aiGuidance: string[] = [],
	version: string = '1.0.0'
): ReportTypeDefinition {
	const now = new Date();
	return {
		id,
		name,
		description,
		requiredSections,
		optionalSections,
		conditionalSections,
		dependencies,
		complianceRules,
		aiGuidance,
		version,
		createdAt: now,
		updatedAt: now
	};
}

/**
 * Validate a report type definition
 */
export function validateReportTypeDefinition(definition: ReportTypeDefinition): string[] {
	const errors: string[] = [];

	if (!definition.id) errors.push('Missing id');
	if (!definition.name) errors.push('Missing name');
	if (!definition.description) errors.push('Missing description');
	if (!definition.version) errors.push('Missing version');
	if (!definition.requiredSections || definition.requiredSections.length === 0) {
		errors.push('At least one required section is needed');
	}
	if (!definition.createdAt) errors.push('Missing createdAt');
	if (!definition.updatedAt) errors.push('Missing updatedAt');

	return errors;
}