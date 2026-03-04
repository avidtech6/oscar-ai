/**
 * Extract section ordering preferences from decompiled report.
 * 
 * Detects the order of sections as they appear in the report.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';

export function extractSectionOrdering(decompiledReport: DecompiledReport): string[] {
	// Return section titles in order they appear (flattened)
	const flatten = (sections: typeof decompiledReport.sections): string[] => {
		const titles: string[] = [];
		for (const sec of sections) {
			titles.push(sec.title);
			titles.push(...flatten(sec.subsections));
		}
		return titles;
	};

	return flatten(decompiledReport.sections).filter(t => t.trim().length > 0);
}