/**
 * Merge Workflow Profiles
 * 
 * Merges multiple workflow profiles into a single consolidated profile.
 */

import { WorkflowProfile } from '../WorkflowProfile';

/**
 * Merge multiple workflow profiles into a single profile
 */
export function mergeWorkflowProfiles(profiles: WorkflowProfile[]): WorkflowProfile {
  if (profiles.length === 0) {
    throw new Error('Cannot merge empty profile list');
  }
  
  if (profiles.length === 1) {
    return profiles[0];
  }
  
  const baseProfile = profiles[0];
  
  const mergedProfile: WorkflowProfile = {
    ...baseProfile,
    id: `merged_${Date.now()}_${baseProfile.userId}`,
    commonSectionOrder: mergeMultipleArrays(profiles.map(p => p.commonSectionOrder)),
    commonOmissions: mergeMultipleArrays(profiles.map(p => p.commonOmissions)),
    commonCorrections: mergeMultipleCorrections(profiles.map(p => p.commonCorrections)),
    preferredInteractionPatterns: mergeMultipleInteractionPatterns(profiles.map(p => p.preferredInteractionPatterns)),
    typicalDataSources: mergeMultipleArrays(profiles.map(p => p.typicalDataSources)),
    workflowHeuristics: mergeHeuristics(profiles.map(p => p.workflowHeuristics)),
    confidenceScore: profiles.reduce((sum, p) => sum + p.confidenceScore, 0) / profiles.length,
    timestamps: {
      createdAt: new Date(Math.min(...profiles.map(p => p.timestamps.createdAt.getTime()))),
      updatedAt: new Date(),
      lastUsedAt: new Date(Math.max(...profiles.map(p => p.timestamps.lastUsedAt.getTime()))),
      observationCount: profiles.reduce((sum, p) => sum + p.timestamps.observationCount, 0)
    },
    metadata: {
      ...baseProfile.metadata,
      version: Math.max(...profiles.map(p => p.metadata.version)) + 1,
      tags: Array.from(new Set(profiles.flatMap(p => p.metadata.tags))),
      source: 'merged'
    }
  };
  
  return mergedProfile;
}

/**
 * Merge multiple arrays
 */
function mergeMultipleArrays<T>(arrays: T[][]): T[] {
  const merged = new Set<T>();
  arrays.forEach(arr => {
    arr.forEach(item => merged.add(item));
  });
  return Array.from(merged);
}

/**
 * Merge multiple corrections arrays
 */
function mergeMultipleCorrections(
  correctionsArrays: Array<Array<{ from: string; to: string; frequency: number; lastObserved: Date }>>
): Array<{ from: string; to: string; frequency: number; lastObserved: Date }> {
  const merged = new Map<string, { from: string; to: string; frequency: number; lastObserved: Date }>();
  
  correctionsArrays.forEach(corrections => {
    corrections.forEach(correction => {
      const key = `${correction.from}->${correction.to}`;
      const existing = merged.get(key);
      
      if (existing) {
        existing.frequency += correction.frequency;
        if (correction.lastObserved > existing.lastObserved) {
          existing.lastObserved = correction.lastObserved;
        }
      } else {
        merged.set(key, { ...correction });
      }
    });
  });
  
  return Array.from(merged.values());
}

/**
 * Merge multiple interaction patterns arrays
 */
function mergeMultipleInteractionPatterns(
  patternsArrays: Array<Array<{ pattern: string; frequency: number; confidence: number }>>
): Array<{ pattern: string; frequency: number; confidence: number }> {
  const merged = new Map<string, { pattern: string; frequency: number; confidence: number }>();
  
  patternsArrays.forEach(patterns => {
    patterns.forEach(pattern => {
      const existing = merged.get(pattern.pattern);
      
      if (existing) {
        existing.frequency += pattern.frequency;
        existing.confidence = (existing.confidence + pattern.confidence) / 2;
      } else {
        merged.set(pattern.pattern, { ...pattern });
      }
    });
  });
  
  return Array.from(merged.values());
}

/**
 * Merge multiple heuristics
 */
function mergeHeuristics(
  heuristicsArray: WorkflowProfile['workflowHeuristics'][]
): WorkflowProfile['workflowHeuristics'] {
  if (heuristicsArray.length === 0) {
    return {
      averageSectionTime: {},
      orderConsistency: 0,
      templateUsageFrequency: 0,
      commonStartingPoints: [],
      validationPatterns: [],
      revisionPatterns: []
    };
  }
  
  const base = heuristicsArray[0];
  
  return {
    averageSectionTime: mergeAverageSectionTimes(heuristicsArray.map(h => h.averageSectionTime)),
    orderConsistency: heuristicsArray.reduce((sum, h) => sum + h.orderConsistency, 0) / heuristicsArray.length,
    templateUsageFrequency: heuristicsArray.reduce((sum, h) => sum + h.templateUsageFrequency, 0) / heuristicsArray.length,
    commonStartingPoints: mergeMultipleArrays(heuristicsArray.map(h => h.commonStartingPoints)),
    validationPatterns: mergeMultipleArrays(heuristicsArray.map(h => h.validationPatterns)),
    revisionPatterns: mergeMultipleRevisionPatterns(heuristicsArray.map(h => h.revisionPatterns))
  };
}

/**
 * Merge average section times
 */
function mergeAverageSectionTimes(
  timesArray: Array<Record<string, number>>
): Record<string, number> {
  const merged: Record<string, number> = {};
  const counts: Record<string, number> = {};
  
  timesArray.forEach(times => {
    Object.entries(times).forEach(([section, time]) => {
      if (!merged[section]) {
        merged[section] = 0;
        counts[section] = 0;
      }
      merged[section] += time;
      counts[section] += 1;
    });
  });
  
  // Calculate averages
  Object.keys(merged).forEach(section => {
    if (counts[section] > 0) {
      merged[section] = merged[section] / counts[section];
    }
  });
  
  return merged;
}

/**
 * Merge multiple revision patterns arrays
 */
function mergeMultipleRevisionPatterns(
  patternsArrays: Array<Array<{ pattern: string; frequency: number }>>
): Array<{ pattern: string; frequency: number }> {
  const merged = new Map<string, { pattern: string; frequency: number }>();
  
  patternsArrays.forEach(patterns => {
    patterns.forEach(pattern => {
      const existing = merged.get(pattern.pattern);
      
      if (existing) {
        existing.frequency += pattern.frequency;
      } else {
        merged.set(pattern.pattern, { ...pattern });
      }
    });
  });
  
  return Array.from(merged.values());
}