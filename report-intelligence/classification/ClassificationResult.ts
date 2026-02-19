/**
 * Report Classification Engine - Phase 6
 * ClassificationResult Interface
 * 
 * Defines the structure for classification results from the Report Classification Engine.
 */

/**
 * Classification candidate with score
 */
export interface ClassificationCandidate {
  reportTypeId: string;
  score: number; // 0-1
  breakdown: {
    structure: number;
    terminology: number;
    compliance: number;
    metadata: number;
    ordering: number;
  };
  reasons: string[];
}

/**
 * Ambiguity levels for classification results
 */
export type AmbiguityLevel = 
  | 'none'        // Clear classification
  | 'low'         // Minor ambiguity
  | 'medium'      // Moderate ambiguity
  | 'high'        // High ambiguity
  | 'very-high';  // Very high ambiguity, manual review needed

/**
 * Classification result
 */
export interface ClassificationResult {
  id: string;
  decompiledReportId: string;
  detectedReportTypeId: string | null;
  rankedCandidates: ClassificationCandidate[];
  confidenceScore: number; // 0-1
  ambiguityLevel: AmbiguityLevel;
  reasons: string[];
  timestamps: {
    started: string;
    completed: string;
  };
  metadata: {
    totalReportTypesConsidered: number;
    scoringMethod: string;
    version: string;
  };
}

/**
 * Create a classification result
 */
export function createClassificationResult(
  decompiledReportId: string,
  candidates: ClassificationCandidate[],
  options?: {
    confidenceScore?: number;
    ambiguityLevel?: AmbiguityLevel;
    reasons?: string[];
  }
): ClassificationResult {
  // Sort candidates by score (highest first)
  const sortedCandidates = [...candidates].sort((a, b) => b.score - a.score);
  
  // Determine detected report type (if confidence is high enough)
  const topCandidate = sortedCandidates[0];
  const confidenceScore = options?.confidenceScore ?? (topCandidate ? topCandidate.score : 0);
  
  let detectedReportTypeId: string | null = null;
  if (confidenceScore >= 0.7) {
    detectedReportTypeId = topCandidate?.reportTypeId ?? null;
  }
  
  // Determine ambiguity level if not provided
  let ambiguityLevel = options?.ambiguityLevel;
  if (!ambiguityLevel) {
    if (sortedCandidates.length === 0) {
      ambiguityLevel = 'very-high';
    } else if (sortedCandidates.length === 1) {
      ambiguityLevel = 'none';
    } else {
      const scoreDifference = topCandidate.score - (sortedCandidates[1]?.score || 0);
      if (scoreDifference > 0.3) ambiguityLevel = 'none';
      else if (scoreDifference > 0.2) ambiguityLevel = 'low';
      else if (scoreDifference > 0.1) ambiguityLevel = 'medium';
      else ambiguityLevel = 'high';
    }
  }
  
  const now = new Date().toISOString();
  
  return {
    id: `classification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    decompiledReportId,
    detectedReportTypeId,
    rankedCandidates: sortedCandidates,
    confidenceScore,
    ambiguityLevel,
    reasons: options?.reasons ?? [],
    timestamps: {
      started: now,
      completed: now
    },
    metadata: {
      totalReportTypesConsidered: candidates.length,
      scoringMethod: 'weighted-composite',
      version: '1.0.0'
    }
  };
}

/**
 * Validate a classification result
 */
export function validateClassificationResult(
  result: ClassificationResult
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!result.id) errors.push('Missing id');
  if (!result.decompiledReportId) errors.push('Missing decompiledReportId');
  if (result.confidenceScore < 0 || result.confidenceScore > 1) {
    errors.push('confidenceScore must be between 0 and 1');
  }
  if (!result.rankedCandidates || !Array.isArray(result.rankedCandidates)) {
    errors.push('rankedCandidates must be an array');
  }
  if (!result.timestamps?.started || !result.timestamps?.completed) {
    errors.push('Missing timestamps');
  }
  
  // Validate candidates
  if (result.rankedCandidates) {
    result.rankedCandidates.forEach((candidate, index) => {
      if (!candidate.reportTypeId) {
        errors.push(`Candidate ${index} missing reportTypeId`);
      }
      if (candidate.score < 0 || candidate.score > 1) {
        errors.push(`Candidate ${index} score must be between 0 and 1`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get classification summary
 */
export function getClassificationSummary(result: ClassificationResult): {
  status: 'clear' | 'ambiguous' | 'uncertain' | 'failed';
  topCandidate: ClassificationCandidate | null;
  confidence: string;
  recommendation: string;
} {
  if (result.rankedCandidates.length === 0) {
    return {
      status: 'failed',
      topCandidate: null,
      confidence: 'none',
      recommendation: 'No report types matched. Consider adding new report type.'
    };
  }
  
  const topCandidate = result.rankedCandidates[0];
  
  if (result.confidenceScore >= 0.8 && result.ambiguityLevel === 'none') {
    return {
      status: 'clear',
      topCandidate,
      confidence: 'high',
      recommendation: `Use report type: ${topCandidate.reportTypeId}`
    };
  }
  
  if (result.confidenceScore >= 0.6) {
    return {
      status: 'ambiguous',
      topCandidate,
      confidence: 'medium',
      recommendation: `Consider ${topCandidate.reportTypeId} but review alternatives`
    };
  }
  
  return {
    status: 'uncertain',
    topCandidate,
    confidence: 'low',
    recommendation: 'Manual review required. Consider multiple report types.'
  };
}