/**
 * Confidence scoring and accuracy calculation
 */

import type {
  WorkflowPrediction,
  WorkflowEntityType
} from '../../../types';

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

export class ConfidenceScoring {
  
  /**
   * Calculate overall confidence from predictions and suggestions
   */
  calculateOverallConfidence(
    predictions: WorkflowPrediction[],
    suggestions: Suggestion[]
  ): number {
    if (predictions.length === 0 && suggestions.length === 0) {
      return 0;
    }
    
    // Calculate weighted average of prediction confidences
    let totalPredictionConfidence = 0;
    for (const prediction of predictions) {
      totalPredictionConfidence += prediction.confidence;
    }
    const avgPredictionConfidence = predictions.length > 0 
      ? totalPredictionConfidence / predictions.length 
      : 0;
    
    // Calculate weighted average of suggestion confidences
    let totalSuggestionConfidence = 0;
    for (const suggestion of suggestions) {
      totalSuggestionConfidence += suggestion.confidence;
    }
    const avgSuggestionConfidence = suggestions.length > 0 
      ? totalSuggestionConfidence / suggestions.length 
      : 0;
    
    // Weight predictions slightly higher than suggestions
    const predictionWeight = 0.6;
    const suggestionWeight = 0.4;
    
    return (avgPredictionConfidence * predictionWeight) + (avgSuggestionConfidence * suggestionWeight);
  }
  
  /**
   * Calculate prediction accuracy based on actual action
   */
  calculatePredictionAccuracy(
    prediction: WorkflowPrediction,
    actualAction: string,
    actualEntityId?: string
  ): number {
    let accuracy = 0;
    
    // Check if predicted action matches actual action
    const actionMatch = this.calculateStringSimilarity(prediction.predictedAction, actualAction);
    accuracy += actionMatch * 0.7; // 70% weight to action match
    
    // Check if predicted impact aligns with actual outcome
    // (This would need actual outcome data, using placeholder)
    const impactScore = 0.5; // Placeholder
    accuracy += impactScore * 0.2; // 20% weight to impact
    
    // Check if estimated time was reasonable
    // (This would need actual time data, using placeholder)
    const timeScore = 0.5; // Placeholder
    accuracy += timeScore * 0.1; // 10% weight to time
    
    return Math.min(1, Math.max(0, accuracy));
  }
  
  /**
   * Generate feedback based on accuracy
   */
  generateAccuracyFeedback(
    prediction: WorkflowPrediction,
    accuracy: number
  ): string {
    if (accuracy >= 0.8) {
      return `Excellent prediction! The suggested action "${prediction.predictedAction}" was highly accurate.`;
    } else if (accuracy >= 0.6) {
      return `Good prediction. The suggested action "${prediction.predictedAction}" was reasonably accurate.`;
    } else if (accuracy >= 0.4) {
      return `Fair prediction. The suggested action "${prediction.predictedAction}" had some relevance.`;
    } else {
      return `Prediction needs improvement. The suggested action "${prediction.predictedAction}" was not very accurate.`;
    }
  }
  
  /**
   * Adjust predictions based on accuracy feedback
   */
  adjustPredictionsBasedOnAccuracy(
    predictions: WorkflowPrediction[],
    predictionId: string,
    accuracy: number
  ): WorkflowPrediction[] {
    return predictions.map(prediction => {
      if (prediction.id === predictionId) {
        // Adjust confidence based on accuracy
        const adjustedConfidence = prediction.confidence * (0.7 + (accuracy * 0.3));
        
        return {
          ...prediction,
          confidence: Math.min(1, Math.max(0.1, adjustedConfidence)),
          evidence: [
            ...prediction.evidence,
            `Accuracy feedback: ${accuracy.toFixed(2)}`
          ]
        };
      }
      return prediction;
    });
  }
  
  /**
   * Update confidence scores based on learned patterns
   */
  updateConfidenceScores(patterns: any[]): Record<string, number> {
    const updatedScores: Record<string, number> = {};
    
    for (const pattern of patterns) {
      if (pattern.type && pattern.frequency) {
        // Increase confidence for frequent patterns
        const baseConfidence = 0.5;
        const frequencyBoost = Math.min(0.4, pattern.frequency * 0.1);
        updatedScores[pattern.type] = baseConfidence + frequencyBoost;
      }
    }
    
    return updatedScores;
  }
  
  /**
   * Calculate string similarity (simple implementation)
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1;
    
    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);
    
    let matchingWords = 0;
    for (const word1 of words1) {
      if (words2.includes(word1)) {
        matchingWords++;
      }
    }
    
    const totalWords = Math.max(words1.length, words2.length);
    return matchingWords / totalWords;
  }
}