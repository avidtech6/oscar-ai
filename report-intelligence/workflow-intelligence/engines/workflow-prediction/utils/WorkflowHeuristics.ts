/**
 * Heuristic utilities for workflow analysis
 */

import type {
  WorkflowEntity,
  WorkflowEntityType
} from '../../../types';

interface GoalAnalysis {
  keywords: string[];
  complexity: 'simple' | 'medium' | 'complex';
  estimatedSteps: number;
  requiredEntityTypes: WorkflowEntityType[];
}

interface Suggestion {
  action: string;
  entityId?: string;
  entityType?: WorkflowEntityType;
  confidence: number;
  reasoning: string[];
  estimatedTimeMinutes?: number;
  priority: number;
  impact: 'low' | 'medium' | 'high';
}

export class WorkflowHeuristics {
  
  /**
   * Analyze goal description
   */
  analyzeGoal(goalDescription: string): GoalAnalysis {
    const keywords = this.extractKeywords(goalDescription);
    const complexity = this.estimateComplexity(goalDescription);
    const estimatedSteps = this.estimateSteps(goalDescription, complexity);
    const requiredEntityTypes = this.extractRequiredEntityTypes(goalDescription);
    
    return {
      keywords,
      complexity,
      estimatedSteps,
      requiredEntityTypes
    };
  }
  
  /**
   * Find workflow paths
   */
  findWorkflowPaths(
    startEntities: WorkflowEntity[],
    goalAnalysis: GoalAnalysis,
    options?: any
  ): any[] {
    // Simple path generation based on entity types
    const paths: any[] = [];
    
    // Generate a few sample paths
    if (startEntities.length > 0) {
      // Path 1: Direct approach
      paths.push([
        { type: 'analysis', entityType: startEntities[0].type },
        { type: 'execution', entityType: 'task' },
        { type: 'documentation', entityType: 'document' }
      ]);
      
      // Path 2: Comprehensive approach
      paths.push([
        { type: 'research', entityType: 'note' },
        { type: 'planning', entityType: 'document' },
        { type: 'execution', entityType: 'task' },
        { type: 'review', entityType: 'document' },
        { type: 'finalization', entityType: 'document' }
      ]);
      
      // Path 3: Quick approach
      paths.push([
        { type: 'quick_action', entityType: 'task' },
        { type: 'brief_documentation', entityType: 'note' }
      ]);
    }
    
    return paths;
  }
  
  /**
   * Select optimal path
   */
  selectOptimalPath(
    paths: any[],
    options?: any
  ): any {
    if (paths.length === 0) return [];
    
    // Simple selection: prefer shorter paths unless completeness is preferred
    if (options?.preferCompleteness) {
      // Return the longest path (most comprehensive)
      return paths.reduce((longest, current) => 
        current.length > longest.length ? current : longest, paths[0]);
    } else if (options?.preferEfficiency) {
      // Return the shortest path (most efficient)
      return paths.reduce((shortest, current) => 
        current.length < shortest.length ? current : shortest, paths[0]);
    } else {
      // Return middle-length path (balanced)
      const sortedPaths = [...paths].sort((a, b) => a.length - b.length);
      const middleIndex = Math.floor(sortedPaths.length / 2);
      return sortedPaths[middleIndex];
    }
  }
  
  /**
   * Convert path to steps
   */
  convertPathToSteps(
    path: any[],
    goalAnalysis: GoalAnalysis
  ): Array<{
    action: string;
    entityType: WorkflowEntityType;
    description: string;
    estimatedTimeMinutes: number;
    confidence: number;
  }> {
    return path.map((step, index) => {
      const stepType = step.type || 'action';
      const entityType = step.entityType || 'task';
      
      return {
        action: this.generateActionName(stepType, entityType),
        entityType,
        description: this.generateStepDescription(stepType, entityType, goalAnalysis),
        estimatedTimeMinutes: this.estimateStepTime(stepType, entityType),
        confidence: this.calculateStepConfidence(stepType, entityType, index, path.length)
      };
    });
  }
  
  /**
   * Identify differences between paths
   */
  identifyPathDifferences(path1: any[], path2: any[]): string[] {
    const differences: string[] = [];
    
    if (path1.length !== path2.length) {
      differences.push(`Path lengths differ: ${path1.length} vs ${path2.length} steps`);
    }
    
    // Compare step types
    const types1 = path1.map(step => step.type).filter(Boolean);
    const types2 = path2.map(step => step.type).filter(Boolean);
    
    if (JSON.stringify(types1) !== JSON.stringify(types2)) {
      differences.push('Step sequences differ');
    }
    
    // Compare entity types
    const entityTypes1 = path1.map(step => step.entityType).filter(Boolean);
    const entityTypes2 = path2.map(step => step.entityType).filter(Boolean);
    
    const uniqueEntityTypes1 = [...new Set(entityTypes1)];
    const uniqueEntityTypes2 = [...new Set(entityTypes2)];
    
    if (JSON.stringify(uniqueEntityTypes1.sort()) !== JSON.stringify(uniqueEntityTypes2.sort())) {
      differences.push('Different entity types used');
    }
    
    return differences;
  }
  
  /**
   * Analyze behavior patterns
   */
  analyzeBehaviorPatterns(behaviorData: any[]): any[] {
    const patterns: any[] = [];
    
    // Group by action type
    const actionCounts: Record<string, number> = {};
    for (const behavior of behaviorData) {
      const action = behavior.action;
      actionCounts[action] = (actionCounts[action] || 0) + 1;
    }
    
    // Convert to patterns
    for (const [action, count] of Object.entries(actionCounts)) {
      const frequency = count / behaviorData.length;
      if (frequency > 0.1) { // Only include frequent patterns
        patterns.push({
          type: action,
          frequency,
          description: `User frequently performs: ${action}`
        });
      }
    }
    
    return patterns;
  }
  
  /**
   * Generate personalized recommendations
   */
  generatePersonalizedRecommendations(
    userId: string,
    patterns: any[],
    behaviorData: any[]
  ): Suggestion[] {
    const suggestions: Suggestion[] = [];
    
    // Generate suggestions based on frequent patterns
    for (const pattern of patterns) {
      if (pattern.frequency > 0.3) {
        suggestions.push({
          action: `Continue ${pattern.type} (frequent successful action)`,
          confidence: 0.8,
          reasoning: [`This is a frequently performed action`, `High success rate observed`],
          estimatedTimeMinutes: 15,
          priority: 2,
          impact: 'medium'
        });
      }
    }
    
    // Suggest complementary actions
    if (patterns.some(p => p.type.includes('create'))) {
      suggestions.push({
        action: 'Review and organize created content',
        confidence: 0.7,
        reasoning: ['You frequently create new content', 'Organization improves findability'],
        estimatedTimeMinutes: 20,
        priority: 3,
        impact: 'medium'
      });
    }
    
    return suggestions;
  }
  
  /**
   * Get time of day
   */
  getTimeOfDay(date: Date): string {
    const hour = date.getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }
  
  /**
   * Get day of week
   */
  getDayOfWeek(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }
  
  /**
   * Private helper methods
   */
  
  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    
    return words
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 10);
  }
  
  private estimateComplexity(text: string): 'simple' | 'medium' | 'complex' {
    const wordCount = text.split(/\s+/).length;
    
    if (wordCount < 10) return 'simple';
    if (wordCount < 30) return 'medium';
    return 'complex';
  }
  
  private estimateSteps(text: string, complexity: 'simple' | 'medium' | 'complex'): number {
    switch (complexity) {
      case 'simple': return 2;
      case 'medium': return 4;
      case 'complex': return 7;
    }
  }
  
  private extractRequiredEntityTypes(text: string): WorkflowEntityType[] {
    const types: WorkflowEntityType[] = [];
    const textLower = text.toLowerCase();
    
    if (textLower.includes('task') || textLower.includes('todo') || textLower.includes('action')) {
      types.push('task');
    }
    if (textLower.includes('document') || textLower.includes('report') || textLower.includes('write')) {
      types.push('document');
    }
    if (textLower.includes('note') || textLower.includes('idea') || textLower.includes('thought')) {
      types.push('note');
    }
    if (textLower.includes('media') || textLower.includes('image') || textLower.includes('pdf')) {
      types.push('media');
    }
    
    return types.length > 0 ? types : ['task', 'document']; // Default types
  }
  
  private generateActionName(stepType: string, entityType: WorkflowEntityType): string {
    const actions: Record<string, string> = {
      'analysis': 'Analyze',
      'research': 'Research',
      'planning': 'Plan',
      'execution': 'Execute',
      'documentation': 'Document',
      'review': 'Review',
      'finalization': 'Finalize',
      'quick_action': 'Quick action',
      'brief_documentation': 'Brief documentation'
    };
    
    const baseAction = actions[stepType] || 'Process';
    return `${baseAction} ${entityType}`;
  }
  
  private generateStepDescription(
    stepType: string,
    entityType: WorkflowEntityType,
    goalAnalysis: GoalAnalysis
  ): string {
    return `${stepType} step involving ${entityType} to achieve goal`;
  }
  
  private estimateStepTime(stepType: string, entityType: WorkflowEntityType): number {
    const baseTimes: Record<string, number> = {
      'analysis': 30,
      'research': 45,
      'planning': 25,
      'execution': 60,
      'documentation': 20,
      'review': 15,
      'finalization': 10,
      'quick_action': 10,
      'brief_documentation': 5
    };
    
    return baseTimes[stepType] || 15;
  }
  
  private calculateStepConfidence(
    stepType: string,
    entityType: WorkflowEntityType,
    stepIndex: number,
    totalSteps: number
  ): number {
    const baseConfidence = 0.7;
    const stepPositionFactor = 1 - (stepIndex / totalSteps) * 0.2; // Earlier steps more confident
    const typeConfidence = entityType === 'task' ? 0.8 : 0.6;
    
    return Math.min(1, baseConfidence * stepPositionFactor * typeConfidence);
  }
}