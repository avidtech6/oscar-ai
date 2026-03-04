/**
 * Extract Conditional Sections (Phase 11)
 * 
 * Analyses a decompiled report to identify sections that appear to be conditional.
 * 
 * Heuristic: sections whose titles contain keywords like "appendix", "glossary", "annex", "attachment",
 * or that appear after a certain marker (e.g., "if applicable") are considered conditional.
 */

import type { DecompiledReport, DecompiledSection } from '../../decompiler/DecompiledReport';

const CONDITIONAL_KEYWORDS = [
	'appendix',
	'appendices',
	'glossary',
	'annex',
	'attachment',
	'supplement',
	'addendum',
	'optional',
	'conditional',
	'if applicable',
	'if required'
];

/**
 * Extract conditional sections from a decompiled report.
 * 
 * Returns an array of section titles that are deemed conditional.
 */
export function extractConditionalSections(decompiledReport: DecompiledReport): string[] {
	const conditional: string[] = [];

	function traverse(section: DecompiledSection) {
		const lowerTitle = section.title.toLowerCase();
		const isConditional = CONDITIONAL_KEYWORDS.some(keyword => lowerTitle.includes(keyword));
		if (isConditional) {
			conditional.push(section.title);
		}
		section.subsections.forEach(traverse);
	}

	decompiledReport.sections.forEach(traverse);

	// Deduplicate
	return [...new Set(conditional)];
}