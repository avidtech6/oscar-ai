/**
 * Report Classification Engine - Phase 6
 * Candidate Ranker
 * 
 * Ranks classification candidates based on scores and additional factors.
 */

import type { ClassificationCandidate } from '../ClassificationResult';

/**
 * Ranking configuration
 */
export interface RankingConfig {
  scoreWeight: number; // 0-1 weight for composite score
  confidenceWeight: number; // 0-1 weight for score confidence
  breakdownWeight: number; // 0-1 weight for score breakdown consistency
  ambiguityPenalty: number; // Penalty for ambiguous scores
}

/**
 * Default ranking configuration
 */
export const DEFAULT_RANKING_CONFIG: RankingConfig = {
  scoreWeight: 0.6,
  confidenceWeight: 0.2,
  breakdownWeight: 0.15,
  ambiguityPenalty: 0.05
};

/**
 * Ranking result for a candidate
 */
export interface RankingResult {
  candidate: ClassificationCandidate;
  rankingScore: number; // 0-1
  rank: number;
  rankingFactors: {
    compositeScore: number;
    scoreConfidence: number;
    breakdownConsistency: number;
    ambiguityPenalty: number;
  };
  reasons: string[];
}

/**
 * Rank classification candidates
 */
export function rankCandidates(
  candidates: ClassificationCandidate[],
  config: Partial<RankingConfig> = {}
): ClassificationCandidate[] {
  if (candidates.length === 0) {
    return [];
  }
  
  // Use provided config or defaults
  const rankingConfig: RankingConfig = { ...DEFAULT_RANKING_CONFIG, ...config };
  
  // Calculate ranking scores for each candidate
  const rankingResults: RankingResult[] = candidates.map((candidate, index) => {
    return calculateRankingScore(candidate, index, rankingConfig);
  });
  
  // Sort by ranking score (highest first)
  rankingResults.sort((a, b) => b.rankingScore - a.rankingScore);
  
  // Assign ranks
  rankingResults.forEach((result, index) => {
    result.rank = index + 1;
  });
  
  // Return candidates in ranked order
  return rankingResults.map(result => result.candidate);
}

/**
 * Calculate ranking score for a candidate
 */
function calculateRankingScore(
  candidate: ClassificationCandidate,
  originalIndex: number,
  config: RankingConfig
): RankingResult {
  const reasons: string[] = [];
  
  // 1. Composite score (primary factor)
  const compositeScore = candidate.score;
  
  if (compositeScore >= 0.8) {
    reasons.push('High composite score');
  } else if (compositeScore >= 0.6) {
    reasons.push('Moderate composite score');
  } else {
    reasons.push('Low composite score');
  }
  
  // 2. Score confidence (based on score breakdown consistency)
  const scoreConfidence = calculateScoreConfidence(candidate);
  
  if (scoreConfidence >= 0.8) {
    reasons.push('High score confidence (consistent breakdown)');
  } else if (scoreConfidence >= 0.6) {
    reasons.push('Moderate score confidence');
  } else {
    reasons.push('Low score confidence (inconsistent breakdown)');
  }
  
  // 3. Breakdown consistency
  const breakdownConsistency = calculateBreakdownConsistency(candidate);
  
  if (breakdownConsistency >= 0.8) {
    reasons.push('High breakdown consistency');
  } else if (breakdownConsistency >= 0.6) {
    reasons.push('Moderate breakdown consistency');
  } else {
    reasons.push('Low breakdown consistency');
  }
  
  // 4. Ambiguity penalty (penalize candidates with ambiguous breakdown)
  const ambiguityPenalty = calculateAmbiguityPenalty(candidate);
  
  if (ambiguityPenalty > 0.1) {
    reasons.push(`Ambiguity penalty applied: ${ambiguityPenalty.toFixed(2)}`);
  }
  
  // Calculate weighted ranking score
  const rankingScore = 
    (compositeScore * config.scoreWeight) +
    (scoreConfidence * config.confidenceWeight) +
    (breakdownConsistency * config.breakdownWeight) -
    (ambiguityPenalty * config.ambiguityPenalty);
  
  // Ensure score is between 0 and 1
  const clampedScore = Math.min(Math.max(rankingScore, 0), 1);
  
  return {
    candidate,
    rankingScore: clampedScore,
    rank: originalIndex + 1, // Temporary rank
    rankingFactors: {
      compositeScore,
      scoreConfidence,
      breakdownConsistency,
      ambiguityPenalty
    },
    reasons
  };
}

/**
 * Calculate score confidence based on breakdown consistency
 */
function calculateScoreConfidence(candidate: ClassificationCandidate): number {
  const breakdown = candidate.breakdown;
  const values = [
    breakdown.structure,
    breakdown.terminology,
    breakdown.compliance,
    breakdown.metadata,
    breakdown.ordering
  ];
  
  // Calculate standard deviation (lower = more consistent)
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  // Convert to confidence (0-1), lower stdDev = higher confidence
  const maxStdDev = 0.5; // Maximum expected standard deviation
  const confidence = 1 - Math.min(stdDev / maxStdDev, 1);
  
  return confidence;
}

/**
 * Calculate breakdown consistency
 */
function calculateBreakdownConsistency(candidate: ClassificationCandidate): number {
  const breakdown = candidate.breakdown;
  const values = [
    breakdown.structure,
    breakdown.terminology,
    breakdown.compliance,
    breakdown.metadata,
    breakdown.ordering
  ];
  
  // Check if all scores are above threshold or all below
  const threshold = 0.5;
  const aboveThreshold = values.filter(v => v >= threshold).length;
  const belowThreshold = values.filter(v => v < threshold).length;
  
  // Consistency is high when scores are either mostly above or mostly below threshold
  const total = values.length;
  const consistency = Math.max(aboveThreshold, belowThreshold) / total;
  
  return consistency;
}

/**
 * Calculate ambiguity penalty
 */
function calculateAmbiguityPenalty(candidate: ClassificationCandidate): number {
  const breakdown = candidate.breakdown;
  const values = [
    breakdown.structure,
    breakdown.terminology,
    breakdown.compliance,
    breakdown.metadata,
    breakdown.ordering
  ];
  
  // Penalize when some scores are high and others are very low (ambiguous pattern)
  const maxScore = Math.max(...values);
  const minScore = Math.min(...values);
  const range = maxScore - minScore;
  
  // High range indicates some aspects are strong while others are weak = ambiguous
  let penalty = 0;
  
  if (range > 0.6) {
    penalty = 0.3; // High ambiguity penalty
  } else if (range > 0.4) {
    penalty = 0.15; // Moderate ambiguity penalty
  } else if (range > 0.2) {
    penalty = 0.05; // Low ambiguity penalty
  }
  
  // Additional penalty if composite score is moderate but breakdown is inconsistent
  if (candidate.score > 0.5 && candidate.score < 0.7 && range > 0.5) {
    penalty += 0.1;
  }
  
  return Math.min(penalty, 0.5); // Cap penalty at 0.5
}

/**
 * Get ranking analysis for candidates
 */
export function getRankingAnalysis(
  candidates: ClassificationCandidate[],
  config: Partial<RankingConfig> = {}
): {
  rankedCandidates: ClassificationCandidate[];
  rankingResults: RankingResult[];
  summary: {
    topCandidate: ClassificationCandidate | null;
    scoreRange: { min: number; max: number; average: number };
    confidenceLevel: 'high' | 'medium' | 'low';
    ambiguityLevel: 'low' | 'medium' | 'high';
  };
} {
  if (candidates.length === 0) {
    return {
      rankedCandidates: [],
      rankingResults: [],
      summary: {
        topCandidate: null,
        scoreRange: { min: 0, max: 0, average: 0 },
        confidenceLevel: 'low',
        ambiguityLevel: 'high'
      }
    };
  }
  
  // Rank candidates
  const rankingConfig: RankingConfig = { ...DEFAULT_RANKING_CONFIG, ...config };
  const rankingResults: RankingResult[] = candidates.map((candidate, index) => {
    return calculateRankingScore(candidate, index, rankingConfig);
  });
  
  // Sort by ranking score
  rankingResults.sort((a, b) => b.rankingScore - a.rankingScore);
  
  // Assign ranks
  rankingResults.forEach((result, index) => {
    result.rank = index + 1;
  });
  
  // Get ranked candidates
  const rankedCandidates = rankingResults.map(result => result.candidate);
  
  // Calculate summary statistics
  const scores = candidates.map(c => c.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  // Determine confidence level
  const topResult = rankingResults[0];
  const confidenceScore = topResult.rankingFactors.scoreConfidence;
  let confidenceLevel: 'high' | 'medium' | 'low' = 'medium';
  if (confidenceScore >= 0.8) confidenceLevel = 'high';
  else if (confidenceScore >= 0.6) confidenceLevel = 'medium';
  else confidenceLevel = 'low';
  
  // Determine ambiguity level
  const ambiguityPenalty = topResult.rankingFactors.ambiguityPenalty;
  let ambiguityLevel: 'low' | 'medium' | 'high' = 'low';
  if (ambiguityPenalty >= 0.2) ambiguityLevel = 'high';
  else if (ambiguityPenalty >= 0.1) ambiguityLevel = 'medium';
  else ambiguityLevel = 'low';
  
  return {
    rankedCandidates,
    rankingResults,
    summary: {
      topCandidate: rankedCandidates[0] || null,
      scoreRange: { min: minScore, max: maxScore, average: avgScore },
      confidenceLevel,
      ambiguityLevel
    }
  };
}