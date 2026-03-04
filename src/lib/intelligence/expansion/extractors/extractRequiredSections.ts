/**
 * Extract Required Sections (Phase 11)
 * 
 * Analyses a decompiled report to identify sections that appear to be required.
 * 
 * Heuristic: top‑level sections (level 1) that appear in the report are considered required.
 * In a multi‑report analysis, required sections would be those present in every instance.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';

/**
 * Extract required sections from a decompiled report.
 * 
 * Returns an array of section titles that are deemed required.
 */
export function extractRequiredSections(decompiledReport: DecompiledReport): string[] {
	const required: string[] = [];

	// For now, treat all top‑level sections as required.
	decompiledReport.sections.forEach(section => {
		if (section.level === 1) {
			required.push(section.title);
		}
	});

	// Deduplicate
	return [...new Set(required)];
}