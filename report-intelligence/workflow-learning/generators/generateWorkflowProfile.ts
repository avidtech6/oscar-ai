/**
 * Generate Workflow Profile
 * 
 * Creates a new workflow profile from analysis results.
 */

import { WorkflowProfile, WorkflowAnalysisResult } from '../WorkflowProfile';

/**
 * Generate a workflow profile from analysis results
 */
export function generateWorkflowProfile(
  userId: string,
  analysisResult: WorkflowAnalysisResult,
  existingProfile: WorkflowProfile | null = null
): WorkflowProfile {
  if (existingProfile) {
    // Update existing profile
    return updateWorkflowProfile(existingProfile, analysisResult);
  }
  
  // Create new profile
  const profileId = `profile_${Date.now()}_${userId}`;
  const reportTypeId = inferReportTypeId(analysisResult);
  
  const newProfile: WorkflowProfile = {
    id: profileId,
    userId,
    reportTypeId,
    commonSectionOrder: analysisResult.patterns.sectionOrder[0]?.pattern || [],
    commonOmissions: analysisResult.patterns.omissions.map(o => o.section),
    commonCorrections: analysisResult.patterns.corrections.map(c => ({
      from: c.from,
      to: c.to,
      frequency: c.frequency,
      lastObserved: new Date()
    })),
    preferredInteractionPatterns: analysisResult.patterns.interactions.map(i => ({
      pattern: i.pattern,
      frequency: i.frequency,
      confidence: i.averageDuration > 0 ? 0.8 : 0.5
    })),
    typicalDataSources: analysisResult.patterns.dataSources.map(d => d.source),
    workflowHeuristics: {
      averageSectionTime: computeAverageSectionTimes(analysisResult),
      orderConsistency: analysisResult.confidenceScores.sectionOrder,
      templateUsageFrequency: computeTemplateUsage(analysisResult),
      commonStartingPoints: extractCommonStartingPoints(analysisResult),
      validationPatterns: extractValidationPatterns(analysisResult),
      revisionPatterns: extractRevisionPatterns(analysisResult)
    },
    confidenceScore: analysisResult.confidenceScores.overall,
    timestamps: {
      createdAt: new Date(),
      updatedAt: new Date(),
      lastUsedAt: new Date(),
      observationCount: countObservationsForUser(userId, analysisResult)
    },
    metadata: {
      version: 1,
      isActive: true,
      tags: ['auto-learned'],
      source: 'auto-learned'
    }
  };
  
  return newProfile;
}

/**
 * Infer report type ID from analysis
 */
function inferReportTypeId(analysisResult: WorkflowAnalysisResult): string | null {
  // Simplified implementation - would integrate with Phase 1 (Report Type Registry)
  // For now, return null or a default
  return null;
}

/**
 * Compute average section times
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
 * Compute template usage frequency
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
 * Extract common starting points
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
 * Extract validation patterns
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
 * Extract revision patterns
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
 * Count observations for a user
 */
function countObservationsForUser(userId: string, analysisResult: WorkflowAnalysisResult): number {
  // Simplified - would count actual events
  // For now, estimate based on analysis
  const totalEvents = analysisResult.patterns.interactions
    .reduce((sum, p) => sum + p.frequency, 0);
  
  return totalEvents;
}

// Re-export updateWorkflowProfile for convenience
import { updateWorkflowProfile } from './updateWorkflowProfile';
export { updateWorkflowProfile };