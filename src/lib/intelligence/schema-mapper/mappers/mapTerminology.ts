/**
 * Map terminology from decompiled report to known terminology of the report type.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../../types';

export interface TerminologyMapping {
	term: string;
	knownEquivalent: string | null;
	confidence: number;
}

export function mapTerminology(
	decompiledReport: DecompiledReport,
	reportTypeDefinition: ReportTypeDefinition
): TerminologyMapping[] {
	const mappings: TerminologyMapping[] = [];
	const knownTerms = (reportTypeDefinition.terminology || []).map(t => t.toLowerCase());

	// Extract terms from decompiled report (simplified: use detected terminology)
	const detectedTerms = decompiledReport.terminology || [];

	for (const term of detectedTerms) {
		const lowerTerm = term.toLowerCase();
		let bestMatch: string | null = null;
		let bestScore = 0;

		for (const known of knownTerms) {
			const score = computeSimilarity(lowerTerm, known);
			if (score > bestScore && score > 0.6) {
				bestScore = score;
				bestMatch = known;
			}
		}

		mappings.push({
			term,
			knownEquivalent: bestMatch,
			confidence: bestScore
		});
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