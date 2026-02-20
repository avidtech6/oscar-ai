/**
 * Next-step prediction logic
 */

import type {
  WorkflowEntity,
  WorkflowGraph,
  WorkflowPrediction,
  WorkflowEntityType
} from '../../../types';

interface PredictionContext {
  currentEntities: WorkflowEntity[];
  recentActions: string[];
  userIntent?: string;
  timeOfDay?: string;
  dayOfWeek?: string;
  availableTime?: number;
}

export class NextStepPredictor {
  private graph: WorkflowGraph;
  
  constructor(graph: WorkflowGraph) {
    this.graph = graph;
  }
  
  predictNextActions(
    context: PredictionContext,
    options?: any
  ): WorkflowPrediction[] {
    const predictions: WorkflowPrediction[] = [];
    
    // Predict based on entity types
    const entityTypePredictions = this.predictBasedOnEntityTypes(context);
    predictions.push(...entityTypePredictions);
    
    // Predict based on recent actions
    const actionPatternPredictions = this.predictBasedOnActionPatterns(context);
    predictions.push(...actionPatternPredictions);
    
    // Predict based on time context
    const timeBasedPredictions = this.predictBasedOnTimeContext(context);
    predictions.push(...timeBasedPredictions);
    
    // Predict based on user intent
    if (context.userIntent) {
      const intentBasedPredictions = this.predictBasedOnUserIntent(context);
      predictions.push(...intentBasedPredictions);
    }
    
    // Deduplicate and sort predictions
    const uniquePredictions = this.deduplicatePredictions(predictions);
    
    // Filter by confidence threshold
    const minConfidence = options?.minConfidence || 0.3;
    const filteredPredictions = uniquePredictions.filter(p => p.confidence >= minConfidence);
    
    // Limit number of predictions
    const maxPredictions = options?.maxPredictions || 5;
    return filteredPredictions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxPredictions);
  }
  
  private predictBasedOnEntityTypes(context: PredictionContext): WorkflowPrediction[] {
    const predictions: WorkflowPrediction[] = [];
    const entityTypes = new Set(context.currentEntities.map(e => e.type));
    
    // Common next steps based on entity types
    const typeNextSteps: Record<string, Array<{ action: string; confidence: number }>> = {
      note: [
        { action: 'Create task from note', confidence: 0.8 },
        { action: 'Expand note into document', confidence: 0.7 },
        { action: 'Add media to note', confidence: 0.5 },
        { action: 'Share note with team', confidence: 0.4 }
      ],
      task: [
        { action: 'Update task progress', confidence: 0.7 },
        { action: 'Create related tasks', confidence: 0.6 },
        { action: 'Document task completion', confidence: 0.5 },
        { action: 'Schedule follow-up', confidence: 0.4 }
      ],
      document: [
        { action: 'Review and edit document', confidence: 0.6 },
        { action: 'Share document for feedback', confidence: 0.5 },
        { action: 'Create summary from document', confidence: 0.4 },
        { action: 'Archive completed document', confidence: 0.3 }
      ],
      media: [
        { action: 'Review media content', confidence: 0.5 },
        { action: 'Add description to media', confidence: 0.4 },
        { action: 'Link media to related documents', confidence: 0.3 }
      ]
    };
    
    // Generate predictions for each entity type
    for (const entityType of entityTypes) {
      const nextSteps = typeNextSteps[entityType] || [];
      
      for (const step of nextSteps) {
        const prediction: WorkflowPrediction = {
          id: `prediction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          predictedAction: step.action,
          confidence: step.confidence,
          evidence: [`Based on entity type: ${entityType}`],
          expectedImpact: this.estimateImpact(step.action),
          estimatedTimeMinutes: this.estimateTime(step.action),
          priorityRecommendation: this.calculatePriority(step.action, context),
          alternatives: this.generateAlternatives(step.action, entityType),
          timestamp: new Date()
        };
        
        predictions.push(prediction);
      }
    }
    
    return predictions;
  }
  
  private predictBasedOnActionPatterns(context: PredictionContext): WorkflowPrediction[] {
    const predictions: WorkflowPrediction[] = [];
    
    if (context.recentActions.length === 0) return predictions;
    
    // Common action sequences
    const actionSequences: Record<string, Array<{ nextAction: string; confidence: number }>> = {
      'create_note': [
        { nextAction: 'Add details to note', confidence: 0.7 },
        { nextAction: 'Create task from note', confidence: 0.6 },
        { nextAction: 'Organize notes', confidence: 0.5 }
      ],
      'complete_task': [
        { nextAction: 'Document completion', confidence: 0.8 },
        { nextAction: 'Create follow-up task', confidence: 0.6 },
        { nextAction: 'Update project status', confidence: 0.5 }
      ],
      'edit_document': [
        { nextAction: 'Review changes', confidence: 0.7 },
        { nextAction: 'Share for feedback', confidence: 0.6 },
        { nextAction: 'Finalize document', confidence: 0.5 }
      ],
      'review_media': [
        { nextAction: 'Add annotations', confidence: 0.6 },
        { nextAction: 'Link to related content', confidence: 0.5 },
        { nextAction: 'Archive media', confidence: 0.4 }
      ]
    };
    
    // Use the most recent action
    const lastAction = context.recentActions[context.recentActions.length - 1];
    
    // Find matching action patterns
    for (const [pattern, nextActions] of Object.entries(actionSequences)) {
      if (lastAction.toLowerCase().includes(pattern) || pattern.includes(lastAction.toLowerCase())) {
        for (const nextAction of nextActions) {
          const prediction: WorkflowPrediction = {
            id: `prediction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            predictedAction: nextAction.nextAction,
            confidence: nextAction.confidence,
            evidence: [`Based on recent action: ${lastAction}`],
            expectedImpact: this.estimateImpact(nextAction.nextAction),
            estimatedTimeMinutes: this.estimateTime(nextAction.nextAction),
            priorityRecommendation: this.calculatePriority(nextAction.nextAction, context),
            alternatives: this.generateAlternatives(nextAction.nextAction, 'pattern'),
            timestamp: new Date()
          };
          
          predictions.push(prediction);
        }
      }
    }
    
    return predictions;
  }
  
  private predictBasedOnTimeContext(context: PredictionContext): WorkflowPrediction[] {
    const predictions: WorkflowPrediction[] = [];
    
    // Time-based suggestions
    const timeBasedSuggestions: Record<string, Array<{ action: string; confidence: number }>> = {
      morning: [
        { action: 'Plan day', confidence: 0.8 },
        { action: 'Review pending tasks', confidence: 0.7 },
        { action: 'Set daily goals', confidence: 0.6 }
      ],
      afternoon: [
        { action: 'Work on focused tasks', confidence: 0.7 },
        { action: 'Collaborate with team', confidence: 0.6 },
        { action: 'Review progress', confidence: 0.5 }
      ],
      evening: [
        { action: 'Wrap up work', confidence: 0.8 },
        { action: 'Plan for tomorrow', confidence: 0.7 },
        { action: 'Document accomplishments', confidence: 0.6 }
      ],
      weekend: [
        { action: 'Review weekly progress', confidence: 0.7 },
        { action: 'Plan next week', confidence: 0.6 },
        { action: 'Clean up workspace', confidence: 0.5 }
      ]
    };
    
    // Get time-based suggestions
    const timeKey = context.timeOfDay || 'afternoon';
    const dayKey = context.dayOfWeek === 'Saturday' || context.dayOfWeek === 'Sunday' ? 'weekend' : timeKey;
    
    const suggestions = timeBasedSuggestions[dayKey] || timeBasedSuggestions[timeKey] || [];
    
    for (const suggestion of suggestions) {
      const prediction: WorkflowPrediction = {
        id: `prediction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        predictedAction: suggestion.action,
        confidence: suggestion.confidence * 0.8, // Slightly lower confidence for time-based
        evidence: [`Time context: ${context.timeOfDay}, ${context.dayOfWeek}`],
        expectedImpact: 'medium',
        estimatedTimeMinutes: 15,
        priorityRecommendation: 3,
        alternatives: [],
        timestamp: new Date()
      };
      
      predictions.push(prediction);
    }
    
    return predictions;
  }
  
  private predictBasedOnUserIntent(context: PredictionContext): WorkflowPrediction[] {
    const predictions: WorkflowPrediction[] = [];
    
    if (!context.userIntent) return predictions;
    
    // Intent-based suggestions
    const intentSuggestions: Record<string, Array<{ action: string; confidence: number }>> = {
      'plan': [
        { action: 'Create project plan', confidence: 0.9 },
        { action: 'Define milestones', confidence: 0.8 },
        { action: 'Assign tasks', confidence: 0.7 }
      ],
      'execute': [
        { action: 'Start next task', confidence: 0.9 },
        { action: 'Focus on current task', confidence: 0.8 },
        { action: 'Complete pending items', confidence: 0.7 }
      ],
      'review': [
        { action: 'Review recent work', confidence: 0.8 },
        { action: 'Provide feedback', confidence: 0.7 },
        { action: 'Update documentation', confidence: 0.6 }
      ],
      'organize': [
        { action: 'Categorize content', confidence: 0.8 },
        { action: 'Create structure', confidence: 0.7 },
        { action: 'Clean up workspace', confidence: 0.6 }
      ]
    };
    
    // Find matching intent
    for (const [intent, suggestions] of Object.entries(intentSuggestions)) {
      if (context.userIntent.toLowerCase().includes(intent)) {
        for (const suggestion of suggestions) {
          const prediction: WorkflowPrediction = {
            id: `prediction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            predictedAction: suggestion.action,
            confidence: suggestion.confidence,
            evidence: [`Based on user intent: ${context.userIntent}`],
            expectedImpact: 'high',
            estimatedTimeMinutes: 30,
            priorityRecommendation: 1,
            alternatives: [],
            timestamp: new Date()
          };
          
          predictions.push(prediction);
        }
      }
    }
    
    return predictions;
  }
  
  private deduplicatePredictions(predictions: WorkflowPrediction[]): WorkflowPrediction[] {
    const seen = new Set<string>();
    const result: WorkflowPrediction[] = [];
    
    for (const prediction of predictions) {
      const key = `${prediction.predictedAction}-${prediction.expectedImpact}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(prediction);
      }
    }
    
    return result;
  }
  
  private estimateImpact(action: string): 'low' | 'medium' | 'high' {
    if (action.includes('plan') || action.includes('create') || action.includes('start')) {
      return 'high';
    }
    if (action.includes('review') || action.includes('update') || action.includes('edit')) {
      return 'medium';
    }
    return 'low';
  }
  
  private estimateTime(action: string): number {
    if (action.includes('plan') || action.includes('create')) {
      return 30;
    }
    if (action.includes('review') || action.includes('update')) {
      return 15;
    }
    if (action.includes('organize') || action.includes('clean')) {
      return 20;
    }
    return 10;
  }
  
  private calculatePriority(action: string, context: PredictionContext): number {
    // Simple priority calculation
    if (context.availableTime && context.availableTime < 15) {
      return 5; // High priority for short time windows
    }
    
    if (action.includes('urgent') || action.includes('critical')) {
      return 1;
    }
    if (action.includes('important') || action.includes('priority')) {
      return 2;
    }
    return 3;
  }
  
  private generateAlternatives(action: string, entityType: string): Array<{ action: string; confidence: number; reason: string }> {
    const alternatives: Array<{ action: string; confidence: number; reason: string }> = [];
    
    if (action.includes('create task')) {
      alternatives.push({ action: 'Add reminder instead', confidence: 0.6, reason: 'Less formal than a task' });
      alternatives.push({ action: 'Schedule for later', confidence: 0.5, reason: 'Defer to more appropriate time' });
    }
    
    if (action.includes('review document')) {
      alternatives.push({ action: 'Skim document quickly', confidence: 0.4, reason: 'Quick overview instead of detailed review' });
      alternatives.push({ action: 'Delegate review to team member', confidence: 0.3, reason: 'Share the workload' });
    }
    
    if (action.includes('organize notes')) {
      alternatives.push({ action: 'Use tags for organization', confidence: 0.7, reason: 'Flexible categorization system' });
      alternatives.push({ action: 'Create folder structure', confidence: 0.6, reason: 'Hierarchical organization' });
    }
    
    // Default alternatives
    if (alternatives.length === 0) {
      alternatives.push({ action: 'Do nothing for now', confidence: 0.2, reason: 'Wait for more context' });
      alternatives.push({ action: 'Ask for clarification', confidence: 0.3, reason: 'Seek additional information' });
    }
    
    return alternatives;
  }
}