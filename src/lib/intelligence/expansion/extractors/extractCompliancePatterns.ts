/**
 * Extract Compliance Patterns (Phase 11)
 * 
 * Analyses a decompiled report to identify compliance‑related patterns.
 * 
 * Uses the decompiled report's `complianceMarkers` array and also scans section content
 * for known compliance keywords (e.g., "BS5837", "AIA", "AMS", "regulation", "standard").
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';

const COMPLIANCE_KEYWORDS = [
	'bs5837',
	'bs 5837',
	'aia',
	'ams',
	'regulation',
	'standard',
	'compliance',
	'requirement',
	'guideline',
	'code of practice',
	'legislation',
	'statutory',
	'legal',
	'mandatory'
];

/**
 * Extract compliance patterns from a decompiled report.
 * 
 * Returns an array of compliance rule strings.
 */
export function extractCompliancePatterns(decompiledReport: DecompiledReport): string[] {
	const rules: string[] = [];

	// Add existing compliance markers
	rules.push(...decompiledReport.complianceMarkers);

	// Scan raw text for compliance keywords (case‑insensitive)
	const lowerText = decompiledReport.rawText.toLowerCase();
	COMPLIANCE_KEYWORDS.forEach(keyword => {
		if (lowerText.includes(keyword)) {
			rules.push(`References ${keyword}`);
		}
	});

	// Deduplicate
	return [...new Set(rules)];
}