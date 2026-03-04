/**
 * Compute Similarity Score (Phase 10)
 * 
 * Compute overall similarity score from structural, content, and style comparisons.
 */

import type { StructuralComparison } from './compareStructure';
import type { ContentComparison } from './compareContent';
import type { StyleComparison } from './compareStyle';

/**
 * Compute overall similarity score (0‑1)
 */
export function computeSimilarityScore(
	structural: StructuralComparison,
	content: ContentComparison,
	style: StyleComparison
): number {
	// Weighted average
	const weights = {
		structural: 0.4,
		content: 0.4,
		style: 0.2
	};

	let score = 0;
	score += structural.score * weights.structural;
	score += content.score * weights.content;
	score += style.score * weights.style;

	// Apply penalties for critical mismatches
	if (structural.missingSections.length > 0) {
		score -= structural.missingSections.length * 0.05;
	}
	if (content.mismatchedFields.length > 0) {
		score -= content.mismatchedFields.length * 0.02;
	}

	return Math.max(0, Math.min(1, score));
}