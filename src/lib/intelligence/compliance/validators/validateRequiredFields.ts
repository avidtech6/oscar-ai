/**
 * Validate Required Fields (Phase 9)
 * 
 * Checks that all required fields within sections are present.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';

/**
 * Validate required fields
 */
export function validateRequiredFields(
	decompiledReport: DecompiledReport,
	reportType: ReportTypeDefinition
): string[] {
	const missing: string[] = [];

	// For simplicity, we assume each section has a list of required fields.
	// In a real implementation, we would have a mapping of section‑to‑required fields.
	// For now, we'll just check for common required fields.
	const requiredFields = [
		'author',
		'date',
		'client',
		'projectReference',
		'version'
	];

	const metadata = decompiledReport.metadata;
	for (const field of requiredFields) {
		if (!metadata[field]) {
			missing.push(field);
		}
	}

	return missing;
}