/**
 * Map decompiled sections to known schema fields.
 * 
 * Uses fuzzy matching of section titles to known required/optional/conditional sections.
 */

import type { DecompiledSection } from '../../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../../types';

export interface SectionMapping {
	sectionTitle: string;
	mappedField: string;
	confidence: number;
	content: string;
}

export function mapSectionsToSchema(
	sections: DecompiledSection[],
	reportTypeDefinition: ReportTypeDefinition
): SectionMapping[] {
	const mappings: SectionMapping[] = [];
	const knownSections = [
		...reportTypeDefinition.requiredSections,
		...reportTypeDefinition.optionalSections,
		...reportTypeDefinition.conditionalSections
	];

	// Flatten sections for mapping
	const flatten = (sec: DecompiledSection): DecompiledSection[] => {
		return [sec, ...sec.subsections.flatMap(flatten)];
	};
	const flatSections = sections.flatMap(flatten);

	for (const section of flatSections) {
		const title = section.title.trim();
		if (!title) continue;

		// Find best match among known sections
		let bestMatch = '';
		let bestScore = 0;

		for (const known of knownSections) {
			const score = computeSimilarity(title.toLowerCase(), known.toLowerCase());
			if (score > bestScore && score > 0.5) {
				bestScore = score;
				bestMatch = known;
			}
		}

		if (bestMatch) {
			mappings.push({
				sectionTitle: title,
				mappedField: bestMatch,
				confidence: bestScore,
				content: section.content
			});
		}
	}

	return mappings;
}

/**
 * Simple similarity score (0‑1) based on token overlap
 */
function computeSimilarity(a: string, b: string): number {
	const tokensA = a.split(/\W+/).filter(t => t.length > 0);
	const tokensB = b.split(/\W+/).filter(t => t.length > 0);
	if (tokensA.length === 0 || tokensB.length === 0) return 0;

	const intersection = tokensA.filter(t => tokensB.includes(t)).length;
	const union = new Set([...tokensA, ...tokensB]).size;
	return intersection / union;
}