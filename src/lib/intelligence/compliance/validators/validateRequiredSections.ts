/**
 * Validate Required Sections (Phase 9)
 * 
 * Checks that all required sections are present.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';

/**
 * Validate required sections
 */
export function validateRequiredSections(
	decompiledReport: DecompiledReport,
	reportType: ReportTypeDefinition
): string[] {
	const missing: string[] = [];
	const presentSections = decompiledReport.sections.map(s => s.title.toLowerCase());

	for (const requiredSection of reportType.requiredSections) {
		const lower = requiredSection.toLowerCase();
		if (!presentSections.some(s => s.includes(lower) || lower.includes(s))) {
			missing.push(requiredSection);
		}
	}

	return missing;
}