/**
 * Extract Optional Sections (Phase 11)
 * 
 * Analyses a decompiled report to identify sections that appear to be optional.
 * 
 * Heuristic: sections that are not top‑level (level > 1) are considered optional.
 * In a multi‑report analysis, optional sections would be those that appear in some but not all instances.
 */

import type { DecompiledReport, DecompiledSection } from '../../decompiler/DecompiledReport';

/**
 * Extract optional sections from a decompiled report.
 * 
 * Returns an array of section titles that are deemed optional.
 */
export function extractOptionalSections(decompiledReport: DecompiledReport): string[] {
	const optional: string[] = [];

	function traverse(section: DecompiledSection) {
		if (section.level > 1) {
			optional.push(section.title);
		}
		section.subsections.forEach(traverse);
	}

	decompiledReport.sections.forEach(traverse);

	// Deduplicate
	return [...new Set(optional)];
}