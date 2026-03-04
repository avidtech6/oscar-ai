/**
 * Extract Terminology Patterns (Phase 11)
 * 
 * Analyses a decompiled report to identify domain‑specific terminology.
 * 
 * Uses the decompiled report's `terminology` array and also extracts unique capitalized
 * multi‑word phrases that appear repeatedly.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';

/**
 * Extract terminology patterns from a decompiled report.
 * 
 * Returns an array of terminology strings.
 */
export function extractTerminologyPatterns(decompiledReport: DecompiledReport): string[] {
	const terms: string[] = [];

	// Add existing terminology
	terms.push(...decompiledReport.terminology);

	// Simple heuristic: extract words that are all‑caps or Title Case and appear more than once
	const words = decompiledReport.rawText.split(/\s+/);
	const wordCount: Record<string, number> = {};
	words.forEach(word => {
		const clean = word.replace(/[^a-zA-Z]/g, '');
		if (clean.length > 3) {
			// Check if it's Title Case or ALL CAPS
			const isTitleCase = /^[A-Z][a-z]+$/.test(clean);
			const isAllCaps = /^[A-Z]{2,}$/.test(clean);
			if (isTitleCase || isAllCaps) {
				wordCount[clean] = (wordCount[clean] || 0) + 1;
			}
		}
	});

	// Add terms that appear at least twice
	Object.entries(wordCount).forEach(([term, count]) => {
		if (count >= 2 && !terms.includes(term)) {
			terms.push(term);
		}
	});

	// Deduplicate
	return [...new Set(terms)];
}