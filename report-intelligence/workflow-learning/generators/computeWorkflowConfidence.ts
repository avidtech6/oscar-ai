/**
 * Compute Workflow Confidence
 * 
 * Computes confidence scores for workflow profiles based on various factors.
 */

import { WorkflowProfile } from '../WorkflowProfile';

/**
 * Compute confidence score for a workflow profile
 */
export function computeWorkflowConfidence(profile: WorkflowProfile): number {
  // Base confidence from profile
  let confidence = profile.confidenceScore;
  
  // Adjust based on observation count
  const observationFactor = Math.min(profile.timestamps.observationCount / 100, 1.0);
  confidence = confidence * 0.7 + observationFactor * 0.3;
  
  // Adjust based on profile age (newer profiles are less confident)
  const profileAgeDays = (Date.now() - profile.timestamps.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const ageFactor = Math.min(profileAgeDays / 30, 1.0); // More confident after 30 days
  confidence = confidence * 0.8 + ageFactor * 0.2;
  
  // Adjust based on usage frequency
  const daysSinceLastUse = (Date.now() - profile.timestamps.lastUsedAt.getTime()) / (1000 * 60 * 60 * 24);
  const recencyFactor = Math.max(0, 1 - daysSinceLastUse / 7); // Decay after 7 days
  confidence = confidence * 0.9 + recencyFactor * 0.1;
  
  // Adjust based on data completeness
  const completenessFactor = computeCompletenessFactor(profile);
  confidence = confidence * 0.85 + completenessFactor * 0.15;
  
  // Adjust based on consistency
  const consistencyFactor = computeConsistencyFactor(profile);
  confidence = confidence * 0.9 + consistencyFactor * 0.1;
  
  return Math.min(Math.max(confidence, 0), 1);
}

/**
 * Compute completeness factor based on profile data
 */
function computeCompletenessFactor(profile: WorkflowProfile): number {
  let score = 0;
  let maxScore = 0;
  
  // Check common section order
  if (profile.commonSectionOrder.length > 0) {
    score += 1;
  }
  maxScore += 1;
  
  // Check common omissions
  if (profile.commonOmissions.length > 0) {
    score += 1;
  }
  maxScore += 1;
  
  // Check common corrections
  if (profile.commonCorrections.length > 0) {
    score += 1;
  }
  maxScore += 1;
  
  // Check preferred interaction patterns
  if (profile.preferredInteractionPatterns.length > 0) {
    score += 1;
  }
  maxScore += 1;
  
  // Check typical data sources
  if (profile.typicalDataSources.length > 0) {
    score += 1;
  }
  maxScore += 1;
  
  // Check workflow heuristics
  if (Object.keys(profile.workflowHeuristics.averageSectionTime).length > 0) {
    score += 1;
  }
  maxScore += 1;
  
  return maxScore > 0 ? score / maxScore : 0;
}

/**
 * Compute consistency factor based on profile data
 */
function computeConsistencyFactor(profile: WorkflowProfile): number {
  let consistency = 0;
  
  // Check order consistency from heuristics
  consistency += profile.workflowHeuristics.orderConsistency * 0.3;
  
  // Check if common section order is consistent with observations
  if (profile.commonSectionOrder.length > 1) {
    // Simple consistency check: longer sequences suggest more consistent patterns
    const sequenceLengthFactor = Math.min(profile.commonSectionOrder.length / 10, 1.0);
    consistency += sequenceLengthFactor * 0.2;
  }
  
  // Check correction frequency vs. total observations
  const totalCorrections = profile.commonCorrections.reduce((sum, c) => sum + c.frequency, 0);
  const correctionRate = totalCorrections / profile.timestamps.observationCount;
  
  // Lower correction rate suggests more consistent workflow
  const correctionConsistency = Math.max(0, 1 - correctionRate * 10); // Normalize
  consistency += correctionConsistency * 0.2;
  
  // Check interaction pattern diversity
  const uniquePatterns = new Set(profile.preferredInteractionPatterns.map(p => p.pattern));
  const patternDiversity = uniquePatterns.size / Math.max(profile.preferredInteractionPatterns.length, 1);
  
  // Moderate diversity suggests consistency (not too many different patterns)
  const diversityConsistency = 1 - Math.abs(patternDiversity - 0.5) * 2; // Peak at 0.5 diversity
  consistency += diversityConsistency * 0.3;
  
  return Math.min(Math.max(consistency, 0), 1);
}

/**
 * Compute confidence breakdown for detailed analysis
 */
export function computeConfidenceBreakdown(profile: WorkflowProfile): {
  baseConfidence: number;
  observationFactor: number;
  ageFactor: number;
  recencyFactor: number;
  completenessFactor: number;
  consistencyFactor: number;
  overall: number;
} {
  const observationFactor = Math.min(profile.timestamps.observationCount / 100, 1.0);
  
  const profileAgeDays = (Date.now() - profile.timestamps.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const ageFactor = Math.min(profileAgeDays / 30, 1.0);
  
  const daysSinceLastUse = (Date.now() - profile.timestamps.lastUsedAt.getTime()) / (1000 * 60 * 60 * 24);
  const recencyFactor = Math.max(0, 1 - daysSinceLastUse / 7);
  
  const completenessFactor = computeCompletenessFactor(profile);
  const consistencyFactor = computeConsistencyFactor(profile);
  
  // Weighted calculation
  const overall = 
    profile.confidenceScore * 0.4 +
    observationFactor * 0.15 +
    ageFactor * 0.1 +
    recencyFactor * 0.05 +
    completenessFactor * 0.15 +
    consistencyFactor * 0.15;
  
  return {
    baseConfidence: profile.confidenceScore,
    observationFactor,
    ageFactor,
    recencyFactor,
    completenessFactor,
    consistencyFactor,
    overall: Math.min(Math.max(overall, 0), 1)
  };
}

/**
 * Compare confidence between two profiles
 */
export function compareProfileConfidence(profile1: WorkflowProfile, profile2: WorkflowProfile): {
  profile1Confidence: number;
  profile2Confidence: number;
  difference: number;
  moreConfident: 'profile1' | 'profile2' | 'equal';
} {
  const confidence1 = computeWorkflowConfidence(profile1);
  const confidence2 = computeWorkflowConfidence(profile2);
  const difference = Math.abs(confidence1 - confidence2);
  
  let moreConfident: 'profile1' | 'profile2' | 'equal' = 'equal';
  if (confidence1 > confidence2 + 0.01) { // Small threshold for equality
    moreConfident = 'profile1';
  } else if (confidence2 > confidence1 + 0.01) {
    moreConfident = 'profile2';
  }
  
  return {
    profile1Confidence: confidence1,
    profile2Confidence: confidence2,
    difference,
    moreConfident
  };
}

/**
 * Determine if a profile has sufficient confidence for predictions
 */
export function hasSufficientConfidence(profile: WorkflowProfile, threshold: number = 0.7): boolean {
  const confidence = computeWorkflowConfidence(profile);
  return confidence >= threshold;
}

/**
 * Get confidence level category
 */
export function getConfidenceLevel(profile: WorkflowProfile): 'low' | 'medium' | 'high' {
  const confidence = computeWorkflowConfidence(profile);
  
  if (confidence >= 0.8) {
    return 'high';
  } else if (confidence >= 0.5) {
    return 'medium';
  } else {
    return 'low';
  }
}