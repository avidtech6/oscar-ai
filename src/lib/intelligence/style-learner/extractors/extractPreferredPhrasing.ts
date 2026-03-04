/**
 * Extract preferred phrasing from decompiled report content.
 * 
 * Detects phrases that the user prefers over synonyms.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';

export function extractPreferredPhrasing(decompiledReport: DecompiledReport): string[] {
	const phrases: string[] = [];
	const content = decompiledReport.sections.map(s => s.content).join(' ').toLowerCase();

	// Common phrase pairs (preferred → alternative)
	const phrasePairs = [
		{ preferred: 'it is recommended that', alternative: 'we recommend' },
		{ preferred: 'should be', alternative: 'must be' },
		{ preferred: 'in order to', alternative: 'to' },
		{ preferred: 'due to the fact that', alternative: 'because' },
		{ preferred: 'with regard to', alternative: 'regarding' },
		{ preferred: 'at this point in time', alternative: 'now' },
		{ preferred: 'in the event that', alternative: 'if' },
		{ preferred: 'prior to', alternative: 'before' },
		{ preferred: 'subsequent to', alternative: 'after' },
	];

	for (const pair of phrasePairs) {
		if (content.includes(pair.preferred)) {
			phrases.push(pair.preferred);
		}
	}

	// Also detect any repeated phrases (simple n‑gram detection)
	const words = content.split(/\W+/).filter(w => w.length > 3);
	const bigrams: string[] = [];
	for (let i = 0; i < words.length - 1; i++) {
		bigrams.push(`${words[i]} ${words[i + 1]}`);
	}
	const freq: Record<string, number> = {};
	for (const bg of bigrams) {
		freq[bg] = (freq[bg] || 0) + 1;
	}
	// Add bigrams that appear at least twice
	for (const [bg, count] of Object.entries(freq)) {
		if (count >= 2) {
			phrases.push(bg);
		}
	}

	return Array.from(new Set(phrases)).slice(0, 10); // limit to top 10
}