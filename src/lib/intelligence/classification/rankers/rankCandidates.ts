/**
 * Rank classification candidates by weighted scores.
 */

import type { ClassificationCandidate } from '../ClassificationResult';

export interface ScoredCandidate {
	reportTypeId: string;
	scores: {
		structure: number;
		terminology: number;
		compliance: number;
		metadata: number;
		ordering: number;
	};
	reasons: string[];
}

export function rankCandidates(scoredCandidates: ScoredCandidate[]): ClassificationCandidate[] {
	// Weighted sum
	const weights = {
		structure: 0.35,
		terminology: 0.25,
		compliance: 0.15,
		metadata: 0.10,
		ordering: 0.15
	};

	const ranked = scoredCandidates.map(candidate => {
		const weightedScore =
			candidate.scores.structure * weights.structure +
			candidate.scores.terminology * weights.terminology +
			candidate.scores.compliance * weights.compliance +
			candidate.scores.metadata * weights.metadata +
			candidate.scores.ordering * weights.ordering;

		return {
			reportTypeId: candidate.reportTypeId,
			score: weightedScore,
			reasons: candidate.reasons
		};
	});

	// Sort descending
	ranked.sort((a, b) => b.score - a.score);

	return ranked;
}