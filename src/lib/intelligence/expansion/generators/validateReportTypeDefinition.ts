/**
 * Validate Report Type Definition (Phase 11)
 * 
 * Validates a generated report type definition against the existing registry
 * and basic schema rules.
 */

import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';
import { validateReportTypeDefinition as validateSchema } from '../../registry/ReportTypeDefinition';

export interface ValidationResult {
	isValid: boolean;
	errors: string[];
	warnings: string[];
}

/**
 * Validate a report type definition.
 * 
 * Performs:
 * - Schema validation (required fields, etc.)
 * - Duplicate detection (if a similar report type already exists)
 * - Logical validation (e.g., required sections not empty)
 */
export function validateReportTypeDefinition(
	definition: ReportTypeDefinition,
	existingDefinitions: ReportTypeDefinition[]
): ValidationResult {
	const errors: string[] = [];
	const warnings: string[] = [];

	// Schema validation
	const schemaErrors = validateSchema(definition);
	errors.push(...schemaErrors);

	// Check for duplicate ID
	const duplicateId = existingDefinitions.find(def => def.id === definition.id);
	if (duplicateId) {
		errors.push(`Duplicate report type ID: ${definition.id}`);
	}

	// Check for duplicate name (case‑insensitive)
	const duplicateName = existingDefinitions.find(def => def.name.toLowerCase() === definition.name.toLowerCase());
	if (duplicateName) {
		warnings.push(`Report type name "${definition.name}" is similar to existing type "${duplicateName.name}". Consider renaming.`);
	}

	// Ensure required sections are not empty
	if (definition.requiredSections.length === 0) {
		warnings.push('No required sections defined. This may cause validation failures.');
	}

	// Ensure version follows semver pattern (simple check)
	if (!/^\d+\.\d+\.\d+$/.test(definition.version)) {
		warnings.push(`Version "${definition.version}" does not follow strict semver (x.y.z).`);
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings
	};
}