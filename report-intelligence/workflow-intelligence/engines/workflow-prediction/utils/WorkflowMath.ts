/**
 * Mathematical utilities for workflow calculations
 */

import type {
  WorkflowEntityType
} from '../../../types';

interface WorkflowStep {
  action: string;
  entityType: WorkflowEntityType;
  description: string;
  estimatedTimeMinutes: number;
  confidence: number;
}

interface GoalAnalysis {
  keywords: string[];
  complexity: 'simple' | 'medium' | 'complex';
  estimatedSteps: number;
  requiredEntityTypes: WorkflowEntityType[];
}

export class WorkflowMath {
  
  /**
   * Calculate total estimated time for workflow steps
   */
  calculateTotalEstimatedTime(steps: WorkflowStep[]): number {
    return steps.reduce((sum, step) => sum + step.estimatedTimeMinutes, 0);
  }
  
  /**
   * Calculate completeness score for workflow steps
   */
  calculateCompletenessScore(steps: WorkflowStep[], goalAnalysis: GoalAnalysis): number {
    if (goalAnalysis.estimatedSteps === 0) return 1;
    
    // Check coverage of required entity types
    const stepEntityTypes = new Set(steps.map(step => step.entityType));
    const requiredEntityTypes = new Set(goalAnalysis.requiredEntityTypes);
    
    let typeCoverage = 0;
    if (requiredEntityTypes.size > 0) {
      let coveredTypes = 0;
      for (const type of requiredEntityTypes) {
        if (stepEntityTypes.has(type)) {
          coveredTypes++;
        }
      }
      typeCoverage = coveredTypes / requiredEntityTypes.size;
    }
    
    // Check step count adequacy
    const stepCountRatio = Math.min(1, steps.length / goalAnalysis.estimatedSteps);
    
    // Weighted average
    return (typeCoverage * 0.6) + (stepCountRatio * 0.4);
  }
  
  /**
   * Calculate efficiency score for workflow steps
   */
  calculateEfficiencyScore(steps: WorkflowStep[], totalEstimatedTime: number): number {
    if (steps.length === 0) return 0;
    
    // Calculate average confidence
    const avgConfidence = steps.reduce((sum, step) => sum + step.confidence, 0) / steps.length;
    
    // Calculate time efficiency (shorter is better, but not too short)
    const idealTimePerStep = 30; // minutes
    const totalIdealTime = steps.length * idealTimePerStep;
    const timeEfficiency = totalIdealTime > 0 
      ? Math.min(1, totalIdealTime / Math.max(totalEstimatedTime, 1))
      : 0.5;
    
    // Weighted score
    return (avgConfidence * 0.7) + (timeEfficiency * 0.3);
  }
  
  /**
   * Calculate estimated time for a path
   */
  calculatePathEstimatedTime(path: any[]): number {
    // Simple estimation: each step takes 15 minutes
    return path.length * 15;
  }
  
  /**
   * Calculate confidence for a path
   */
  calculatePathConfidence(path: any[]): number {
    if (path.length === 0) return 0;
    
    // Simple confidence calculation based on path length
    // Shorter paths are generally more confident
    const baseConfidence = 0.7;
    const lengthPenalty = Math.min(0.3, (path.length - 1) * 0.05);
    
    return Math.max(0.1, baseConfidence - lengthPenalty);
  }
  
  /**
   * Calculate similarity between two paths
   */
  calculatePathSimilarity(path1: any[], path2: any[]): number {
    if (path1.length === 0 && path2.length === 0) return 1;
    if (path1.length === 0 || path2.length === 0) return 0;
    
    // Simple Jaccard similarity
    const set1 = new Set(path1.map(item => JSON.stringify(item)));
    const set2 = new Set(path2.map(item => JSON.stringify(item)));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }
  
  /**
   * Calculate optimal path score
   */
  calculateOptimalPathScore(
    path: any[],
    completeness: number,
    efficiency: number,
    options?: {
      preferEfficiency?: boolean;
      preferCompleteness?: boolean;
    }
  ): number {
    const pathLengthScore = Math.max(0, 1 - (path.length * 0.05)); // Penalize long paths
    
    let score = 0;
    
    if (options?.preferEfficiency) {
      score = (efficiency * 0.6) + (completeness * 0.3) + (pathLengthScore * 0.1);
    } else if (options?.preferCompleteness) {
      score = (completeness * 0.6) + (efficiency * 0.3) + (pathLengthScore * 0.1);
    } else {
      // Balanced approach
      score = (completeness * 0.4) + (efficiency * 0.4) + (pathLengthScore * 0.2);
    }
    
    return Math.min(1, Math.max(0, score));
  }
}