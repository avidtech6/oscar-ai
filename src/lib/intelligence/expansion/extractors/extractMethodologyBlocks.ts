/**
 * Extract Methodology Blocks (Phase 11)
 * 
 * Analyses a decompiled report to identify methodology‑related sections.
 * 
 * Heuristic: sections whose titles contain keywords like "methodology", "approach", "procedure",
 * "method", "process", "technique", "analysis", "evaluation", "assessment".
 */

import type { DecompiledReport, DecompiledSection } from '../../decompiler/DecompiledReport';

const METHODOLOGY_KEYWORDS = [
	'methodology',
	'approach',
	'procedure',
	'method',
	'process',
	'technique',
	'analysis',
	'evaluation',
	'assessment',
	'investigation',
	'study',
	'research',
	'methodology and approach',
	'methods'
];

/**
 * Extract methodology blocks from a decompiled report.
 * 
 * Returns an array of methodology block strings (section titles).
 */
export function extractMethodologyBlocks(decompiledReport: DecompiledReport): string[] {
	const blocks: string[] = [];

	function traverse(section: DecompiledSection) {
		const lowerTitle = section.title.toLowerCase();
		const isMethodology = METHODOLOGY_KEYWORDS.some(keyword => lowerTitle.includes(keyword));
		if (isMethodology) {
			blocks.push(section.title);
		}
		section.subsections.forEach(traverse);
	}

	decompiledReport.sections.forEach(traverse);

	// Deduplicate
	return [...new Set(blocks)];
}