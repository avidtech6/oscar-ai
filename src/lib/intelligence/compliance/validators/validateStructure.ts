/**
 * Validate Structure (Phase 9)
 * 
 * Checks that the report follows the correct structural hierarchy.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';
import type { StructuralIssue } from '../ComplianceResult';

/**
 * Validate structure
 */
export function validateStructure(
	decompiledReport: DecompiledReport,
	reportType: ReportTypeDefinition
): StructuralIssue[] {
	const issues: StructuralIssue[] = [];

	// Check that sections have at least one subsection or content
	for (const section of decompiledReport.sections) {
		if (section.subsections.length === 0 && section.content.trim() === '') {
			issues.push({
				sectionId: section.id,
				issue: `Section "${section.title}" is empty (no subsections or content).`,
				severity: 'low'
			});
		}
	}

	// Check that required sections appear before optional ones (simplified)
	const requiredSections = reportType.requiredSections.map(s => s.toLowerCase());
	const optionalSections = reportType.optionalSections.map(s => s.toLowerCase());

	// In a real implementation, we would check ordering.
	// For now, we'll just note if required sections are missing (already covered by validateRequiredSections).

	return issues;
}