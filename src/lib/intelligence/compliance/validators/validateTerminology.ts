/**
 * Validate Terminology (Phase 9)
 * 
 * Checks that terminology matches the expected domain terminology.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';
import type { TerminologyIssue } from '../ComplianceResult';

/**
 * Validate terminology
 */
export function validateTerminology(
	decompiledReport: DecompiledReport,
	reportType: ReportTypeDefinition
): TerminologyIssue[] {
	const issues: TerminologyIssue[] = [];

	// Expected terminology (simplified)
	const expectedTerms = reportType.terminology || [];
	if (expectedTerms.length === 0) {
		return issues;
	}

	const text = decompiledReport.rawText.toLowerCase();

	for (const term of expectedTerms) {
		const lowerTerm = term.toLowerCase();
		if (!text.includes(lowerTerm)) {
			issues.push({
				term,
				expected: term,
				found: 'missing',
				severity: 'low'
			});
		}
	}

	return issues;
}