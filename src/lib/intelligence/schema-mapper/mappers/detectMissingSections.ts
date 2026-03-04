/**
 * Detect missing required sections in a decompiled report.
 */

import type { DecompiledSection } from '../../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../../types';

export function detectMissingSections(
	sections: DecompiledSection[],
	reportTypeDefinition: ReportTypeDefinition
): string[] {
	const missing: string[] = [];
	const required = reportTypeDefinition.requiredSections;

	// Flatten all section titles (including subsections)
	const flattenTitles = (sec: DecompiledSection): string[] => {
		const titles = [sec.title.trim()];
		for (const sub of sec.subsections) {
			titles.push(...flattenTitles(sub));
		}
		return titles;
	};
	const allTitles = sections.flatMap(flattenTitles).map(t => t.toLowerCase());

	for (const requiredSection of required) {
		const lowerRequired = requiredSection.toLowerCase();
		let found = false;

		// Simple exact or partial match
		for (const title of allTitles) {
			if (title.includes(lowerRequired) || lowerRequired.includes(title)) {
				found = true;
				break;
			}
		}

		if (!found) {
			missing.push(requiredSection);
		}
	}

	return missing;
}