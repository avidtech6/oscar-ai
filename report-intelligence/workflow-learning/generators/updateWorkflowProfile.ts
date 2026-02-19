/**
 * Update Workflow Profile
 * 
 * Updates an existing workflow profile with new analysis results.
 */

import { WorkflowProfile, WorkflowAnalysisResult } from '../WorkflowProfile';

/**
 * Update an existing workflow profile with new analysis results
 */
export function updateWorkflowProfile(
  profile: WorkflowProfile,
  analysisResult: WorkflowAnalysisResult
): WorkflowProfile {
  // Update profile with new analysis
  const updatedProfile: WorkflowProfile = {
    ...profile,
    commonSectionOrder: mergeArrays(profile.commonSectionOrder, analysisResult.patterns.sectionOrder[0]?.pattern || []),
    commonOmissions: mergeArrays(profile.commonOmissions, analysisResult.patterns.omissions.map(o => o.section)),
    commonCorrections: mergeCorrections(profile.commonCorrections, analysisResult.patterns.corrections),
    preferredInteractionPatterns: mergeInteractionPatterns(profile.preferredInteractionPatterns, analysisResult.patterns.interactions),
    typicalDataSources: mergeArrays(profile.typicalDataSources, analysisResult.patterns.dataSources.map(d => d.source)),
    workflowHeuristics: updateHeuristics(profile.workflowHeuristics, analysisResult),
    confidenceScore: (profile.confidenceScore + analysisResult.confidenceScores.overall) / 2,
    timestamps: {
      ...profile.timestamps,
      updatedAt: new Date(),
      lastUsedAt: new Date(),
      observationCount: profile.timestamps.observationCount + countObservationsFromAnalysis(analysisResult)
    },
    metadata: {
      ...profile.metadata,
      version: profile.metadata.version + 1
    }
  };
  
  return updatedProfile;
}

/**
 * Merge two arrays, removing duplicates
 */
function mergeArrays<T>(arr1: T[], arr2: T[]): T[] {
  return Array.from(new Set([...arr1, ...arr2]));
}

/**
 * Merge corrections
 */
function mergeCorrections(
  existing: Array<{ from: string; to: string; frequency: number; lastObserved: Date }>,
  newCorrections: Array<{ from: string; to: string; frequency: number; context: string }>
): Array<{ from: string; to: string; frequency: number; lastObserved: Date }> {
  const merged = new Map<string, { from: string; to: string; frequency: number; lastObserved: Date }>();
  
  // Add existing corrections
  existing.forEach(correction => {
    const key = `${correction.from}->${correction.to}`;
    merged.set(key, correction);
  });
  
  // Add or update with new corrections
  newCorrections.forEach(correction => {
    const key = `${correction.from}->${correction.to}`;
    const existingCorrection = merged.get(key);
    
    if (existingCorrection) {
      // Update frequency and timestamp
      existingCorrection.frequency += correction.frequency;
      existingCorrection.lastObserved = new Date();
    } else {
      // Add new correction
      merged.set(key, {
        from: correction.from,
        to: correction.to,
        frequency: correction.frequency,
        lastObserved: new Date()
      });
    }
  });
  
  return Array.from(merged.values());
}

/**
 * Merge interaction patterns
 */
function mergeInteractionPatterns(
  existing: Array<{ pattern: string; frequency: number; confidence: number }>,
  newPatterns: Array<{ pattern: string; frequency: number; averageDuration: number }>
): Array<{ pattern: string; frequency: number; confidence: number }> {
  const merged = new Map<string, { pattern: string; frequency: number; confidence: number }>();
  
  // Add existing patterns
  existing.forEach(pattern => {
    merged.set(pattern.pattern, pattern);
  });
  
  // Add or update with new patterns
  newPatterns.forEach(pattern => {
    const existingPattern = merged.get(pattern.pattern);
    
    if (existingPattern) {
      // Update frequency and confidence
      existingPattern.frequency += pattern.frequency;
      existingPattern.confidence = (existingPattern.confidence + (pattern.averageDuration > 0 ? 0.8 : 0.5)) / 2;
    } else {
      // Add new pattern
      merged.set(pattern.pattern, {
        pattern: pattern.pattern,
        frequency: pattern.frequency,
        confidence: pattern.averageDuration > 0 ? 0.8 : 0.5
      });
    }
  });
  
  return Array.from(merged.values());
}

/**
 * Update workflow heuristics
 */
function updateHeuristics(
  existing: WorkflowProfile['workflowHeuristics'],
  analysisResult: WorkflowAnalysisResult
): WorkflowProfile['workflowHeuristics'] {
  return {
    ...existing,
    averageSectionTime: {
      ...existing.averageSectionTime,
      ...computeAverageSectionTimes(analysisResult)
    },
    orderConsistency: (existing.orderConsistency + analysisResult.confidenceScores.sectionOrder) / 2,
    templateUsageFrequency: (existing.templateUsageFrequency + computeTemplateUsage(analysisResult)) / 2,
    commonStartingPoints: mergeArrays(existing.commonStartingPoints, extractCommonStartingPoints(analysisResult)),
    validationPatterns: mergeArrays(existing.validationPatterns, extractValidationPatterns(analysisResult)),
    revisionPatterns: mergeRevisionPatterns(existing.revisionPatterns, extractRevisionPatterns(analysisResult))
  };
}

/**
 * Merge revision patterns
 */
function mergeRevisionPatterns(
  existing: Array<{ pattern: string; frequency: number }>,
  newPatterns: Array<{ pattern: string; frequency: number }>
): Array<{ pattern: string; frequency: number }> {
  const merged = new Map<string, { pattern: string; frequency: number }>();
  
  existing.forEach(pattern => {
    merged.set(pattern.pattern, pattern);
  });
  
  newPatterns.forEach(pattern => {
    const existingPattern = merged.get(pattern.pattern);
    
    if (existingPattern) {
      existingPattern.frequency += pattern.frequency;
    } else {
      merged.set(pattern.pattern, pattern);
    }
  });
  
  return Array.from(merged.values());
}

/**
 * Compute average section times (reused from generateWorkflowProfile)
 */
function computeAverageSectionTimes(analysisResult: WorkflowAnalysisResult): Record<string, number> {
  const times: Record<string, number> = {};
  
  analysisResult.patterns.interactions.forEach(pattern => {
    if (pattern.averageDuration > 0) {
      times[pattern.pattern] = pattern.averageDuration;
    }
  });
  
  return times;
}

/**
 * Compute template usage frequency (reused from generateWorkflowProfile)
 */
function computeTemplateUsage(analysisResult: WorkflowAnalysisResult): number {
  const templateEvents = analysisResult.patterns.interactions
    .filter(p => p.pattern === 'template_applied')
    .reduce((sum, p) => sum + p.frequency, 0);
  
  const totalEvents = analysisResult.patterns.interactions
    .reduce((sum, p) => sum + p.frequency, 0);
  
  return totalEvents > 0 ? templateEvents / totalEvents : 0;
}

/**
 * Extract common starting points (reused from generateWorkflowProfile)
 */
function extractCommonStartingPoints(analysisResult: WorkflowAnalysisResult): string[] {
  const startingPoints: string[] = [];
  
  analysisResult.patterns.sectionOrder.forEach(pattern => {
    if (pattern.pattern.length > 0) {
      const firstSection = pattern.pattern[0];
      if (!startingPoints.includes(firstSection)) {
        startingPoints.push(firstSection);
      }
    }
  });
  
  return startingPoints;
}

/**
 * Extract validation patterns (reused from generateWorkflowProfile)
 */
function extractValidationPatterns(analysisResult: WorkflowAnalysisResult): string[] {
  const validationPatterns: string[] = [];
  
  analysisResult.patterns.interactions.forEach(pattern => {
    if (pattern.pattern.includes('validation') || pattern.pattern.includes('check')) {
      validationPatterns.push(pattern.pattern);
    }
  });
  
  return validationPatterns;
}

/**
 * Extract revision patterns (reused from generateWorkflowProfile)
 */
function extractRevisionPatterns(analysisResult: WorkflowAnalysisResult): Array<{ pattern: string; frequency: number }> {
  const revisionPatterns: Array<{ pattern: string; frequency: number }> = [];
  
  analysisResult.patterns.interactions.forEach(pattern => {
    if (pattern.pattern.includes('edit') || pattern.pattern.includes('revise') || pattern.pattern.includes('correct')) {
      revisionPatterns.push({
        pattern: pattern.pattern,
        frequency: pattern.frequency
      });
    }
  });
  
  return revisionPatterns;
}

/**
 * Count observations from analysis
 */
function countObservationsFromAnalysis(analysisResult: WorkflowAnalysisResult): number {
  const totalEvents = analysisResult.patterns.interactions
    .reduce((sum, p) => sum + p.frequency, 0);
  
  return totalEvents;
}