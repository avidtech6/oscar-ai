/**
 * Detect sections that are not part of the known schema (extra sections).
 */

import type { DecompiledSection } from '../../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../../types';

export function detectExtraSections(
	sections: DecompiledSection[],
	reportTypeDefinition: ReportTypeDefinition
): string[] {
	const extra: string[] = [];
	const knownSections = [
		...reportTypeDefinition.requiredSections,
		...reportTypeDefinition.optionalSections,
		...reportTypeDefinition.conditionalSections
	].map(s => s.toLowerCase());

	// Flatten all section titles
	const flattenTitles = (sec: DecompiledSection): string[] => {
		const titles = [sec.title.trim()];
		for (const sub of sec.subsections) {
			titles.push(...flattenTitles(sub));
		}
		return titles;
	};
	const allTitles = sections.flatMap(flattenTitles).map(t => t.toLowerCase());

	for (const title of allTitles) {
		if (!title) continue;
		let isKnown = false;
		for (const known of knownSections) {
			// If title contains known section or known section contains title
			if (title.includes(known) || known.includes(title)) {
				isKnown = true;
				break;
			}
		}
		if (!isKnown) {
			extra.push(title);
		}
	}

	return extra;
}