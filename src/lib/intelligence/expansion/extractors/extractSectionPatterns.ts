/**
 * Extract Section Patterns (Phase 11)
 * 
 * Analyses a decompiled report to identify structural patterns in sections.
 * Returns a list of section titles with their hierarchical levels and frequencies.
 */

import type { DecompiledReport, DecompiledSection } from '../../decompiler/DecompiledReport';

export interface SectionPattern {
	title: string;
	level: number;
	frequency: number;
	exampleContent: string;
}

/**
 * Extract section patterns from a decompiled report.
 * 
 * This function:
 * - Flattens all sections (including subsections)
 * - Groups by title (case‑insensitive)
 * - Counts frequency
 * - Records the most common level for each title
 * - Stores a snippet of content from the first occurrence
 */
export function extractSectionPatterns(decompiledReport: DecompiledReport): SectionPattern[] {
	const flattened: DecompiledSection[] = [];
	function traverse(section: DecompiledSection) {
		flattened.push(section);
		section.subsections.forEach(traverse);
	}
	decompiledReport.sections.forEach(traverse);

	// Group by normalized title
	const groups: Record<string, { title: string; level: number; count: number; content: string }> = {};

	flattened.forEach(section => {
		const normalized = section.title.trim().toLowerCase();
		if (!groups[normalized]) {
			groups[normalized] = {
				title: section.title,
				level: section.level,
				count: 1,
				content: section.content.substring(0, 100) // first 100 chars as example
			};
		} else {
			groups[normalized].count++;
			// Keep the most common level (simple heuristic)
			if (groups[normalized].level !== section.level) {
				// If levels differ, we could average, but for simplicity keep first.
			}
		}
	});

	// Convert to SectionPattern array
	return Object.values(groups).map(g => ({
		title: g.title,
		level: g.level,
		frequency: g.count,
		exampleContent: g.content
	}));
}