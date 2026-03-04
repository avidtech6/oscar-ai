/**
 * Classification Result (Phase 6)
 * 
 * Represents the result of classifying a decompiled report.
 */

export interface ClassificationCandidate {
	reportTypeId: string;
	score: number; // 0‑1
	reasons: string[]; // why this candidate scored as it did
}

export enum AmbiguityLevel {
	LOW = 'low',      // clear winner
	MEDIUM = 'medium', // two candidates close
	HIGH = 'high',     // multiple candidates with similar scores
	INCONCLUSIVE = 'inconclusive' // insufficient data
}

export interface ClassificationResult {
	id: string;
	decompiledReportId: string;
	detectedReportTypeId: string | null; // null if ambiguous/inconclusive
	rankedCandidates: ClassificationCandidate[];
	confidenceScore: number; // 0‑1
	ambiguityLevel: AmbiguityLevel;
	reasons: string[]; // overall classification reasoning
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Create a new classification result
 */
export function createClassificationResult(
	decompiledReportId: string,
	rankedCandidates: ClassificationCandidate[],
	confidenceScore: number,
	ambiguityLevel: AmbiguityLevel,
	reasons: string[]
): ClassificationResult {
	const id = `classification_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
	const now = new Date();

	// Determine detected report type (top candidate if confidence > 0.5 and ambiguity low)
	let detectedReportTypeId: string | null = null;
	if (rankedCandidates.length > 0 && confidenceScore >= 0.5 && ambiguityLevel === AmbiguityLevel.LOW) {
		detectedReportTypeId = rankedCandidates[0].reportTypeId;
	}

	return {
		id,
		decompiledReportId,
		detectedReportTypeId,
		rankedCandidates,
		confidenceScore,
		ambiguityLevel,
		reasons,
		createdAt: now,
		updatedAt: now
	};
}