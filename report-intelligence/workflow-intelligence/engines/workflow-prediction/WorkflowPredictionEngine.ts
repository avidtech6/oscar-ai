/**
 * Phase 25: Workflow Intelligence Layer
 * Workflow Prediction and Next‑Step Suggestions Engine
 * 
 * Orchestrator that delegates to specialized predictor modules.
 */

import type {
  WorkflowEntity,
  WorkflowRelationship,
  WorkflowGraph,
  WorkflowContext,
  WorkflowPrediction,
  WorkflowEntityType
} from '../../types';

import { TaskPredictor } from './predictors/TaskPredictor';
import { DocumentPredictor } from './predictors/DocumentPredictor';
import { NextStepPredictor } from './predictors/NextStepPredictor';
import { ConfidenceScoring } from './predictors/ConfidenceScoring';
import { WorkflowMath } from './utils/WorkflowMath';
import { WorkflowHeuristics } from './utils/WorkflowHeuristics';

/**
 * Prediction Types
 */

interface PredictionContext {
  currentEntities: WorkflowEntity[];
  recentActions: string[];
  userIntent?: string;
  timeOfDay?: string;
  dayOfWeek?: string;
  availableTime?: number; // minutes
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

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: Array<{
    action: string;
    entityType: WorkflowEntityType;
    description: string;
    estimatedTimeMinutes: number;
  }>;
  suitabilityScore: number;
  matchReasons: string[];
}

/**
 * Workflow Prediction Engine
 * 
 * Analyzes current workflow state and predicts optimal next steps,
 * suggests workflow templates, and provides intelligent recommendations.
 */
export class WorkflowPredictionEngine {
  private graph: WorkflowGraph;
  private predictionHistory: Array<{
    timestamp: Date;
    context: PredictionContext;
    predictions: WorkflowPrediction[];
    actualAction?: string;
    accuracy?: number;
  }> = [];
  
  private taskPredictor: TaskPredictor;
  private documentPredictor: DocumentPredictor;
  private nextStepPredictor: NextStepPredictor;
  private confidenceScoring: ConfidenceScoring;
  private workflowMath: WorkflowMath;
  private workflowHeuristics: WorkflowHeuristics;
  
  constructor(graph: WorkflowGraph) {
    this.graph = graph;
    this.taskPredictor = new TaskPredictor(graph);
    this.documentPredictor = new DocumentPredictor(graph);
    this.nextStepPredictor = new NextStepPredictor(graph);
    this.confidenceScoring = new ConfidenceScoring();
    this.workflowMath = new WorkflowMath();
    this.workflowHeuristics = new WorkflowHeuristics();
  }
  
  /**
   * Generate predictions for next actions based on current context
   */
  async generatePredictions(
    context: WorkflowContext,
    options?: {
      maxPredictions?: number;
      minConfidence?: number;
      includeTemplates?: boolean;
      timeHorizon?: 'short' | 'medium' | 'long';
    }
  ): Promise<{
    predictions: WorkflowPrediction[];
    suggestions: Suggestion[];
    templates?: WorkflowTemplate[];
    overallConfidence: number;
  }> {
    const predictionContext = this.buildPredictionContext(context);
    
    // Generate action predictions
    const actionPredictions = this.nextStepPredictor.predictNextActions(predictionContext, options);
    
    // Generate suggestions
    const suggestions = this.generateSuggestions(predictionContext, options);
    
    // Generate workflow templates if requested
    const templates = options?.includeTemplates
      ? this.matchWorkflowTemplates(predictionContext)
      : undefined;
    
    // Calculate overall confidence
    const overallConfidence = this.confidenceScoring.calculateOverallConfidence(actionPredictions, suggestions);
    
    // Store in history
    this.predictionHistory.push({
      timestamp: new Date(),
      context: predictionContext,
      predictions: actionPredictions,
      accuracy: undefined // Will be updated when actual action is known
    });
    
    return {
      predictions: actionPredictions,
      suggestions,
      templates,
      overallConfidence
    };
  }
  
  /**
   * Update prediction accuracy based on actual user action
   */
  async updatePredictionAccuracy(
    predictionId: string,
    actualAction: string,
    actualEntityId?: string
  ): Promise<{
    accuracy: number;
    feedback: string;
    updatedPredictions: WorkflowPrediction[];
  }> {
    // Find the prediction in history
    const historyEntry = this.predictionHistory.find(entry =>
      entry.predictions.some(p => p.id === predictionId)
    );
    
    if (!historyEntry) {
      throw new Error(`Prediction ${predictionId} not found in history`);
    }
    
    const prediction = historyEntry.predictions.find(p => p.id === predictionId)!;
    
    // Calculate accuracy
    const accuracy = this.confidenceScoring.calculatePredictionAccuracy(prediction, actualAction, actualEntityId);
    
    // Update history
    historyEntry.actualAction = actualAction;
    historyEntry.accuracy = accuracy;
    
    // Generate feedback
    const feedback = this.confidenceScoring.generateAccuracyFeedback(prediction, accuracy);
    
    // Update predictions based on feedback
    const updatedPredictions = this.confidenceScoring.adjustPredictionsBasedOnAccuracy(
      historyEntry.predictions,
      predictionId,
      accuracy
    );
    
    return {
      accuracy,
      feedback,
      updatedPredictions
    };
  }
  
  /**
   * Suggest optimal workflow based on current state and goals
   */
  async suggestOptimalWorkflow(
    startEntityIds: string[],
    goalDescription: string,
    options?: {
      maxSteps?: number;
      preferEfficiency?: boolean;
      preferCompleteness?: boolean;
      timeLimitMinutes?: number;
    }
  ): Promise<{
    steps: Array<{
      action: string;
      entityType: WorkflowEntityType;
      description: string;
      estimatedTimeMinutes: number;
      confidence: number;
    }>;
    totalEstimatedTime: number;
    completenessScore: number;
    efficiencyScore: number;
    alternativePaths: Array<{
      steps: number;
      estimatedTime: number;
      confidence: number;
      differences: string[];
    }>;
  }> {
    const startEntities = startEntityIds
      .map(id => this.graph.entities.get(id))
      .filter((entity): entity is WorkflowEntity => entity !== undefined);
    
    if (startEntities.length === 0) {
      throw new Error('No valid start entities found');
    }
    
    // Analyze goal
    const goalAnalysis = this.workflowHeuristics.analyzeGoal(goalDescription);
    
    // Find potential paths
    const paths = this.workflowHeuristics.findWorkflowPaths(startEntities, goalAnalysis, options);
    
    // Select optimal path
    const optimalPath = this.workflowHeuristics.selectOptimalPath(paths, options);
    
    // Generate steps
    const steps = this.workflowHeuristics.convertPathToSteps(optimalPath, goalAnalysis);
    
    // Calculate metrics
    const totalEstimatedTime = this.workflowMath.calculateTotalEstimatedTime(steps);
    const completenessScore = this.workflowMath.calculateCompletenessScore(steps, goalAnalysis);
    const efficiencyScore = this.workflowMath.calculateEfficiencyScore(steps, totalEstimatedTime);
    
    // Generate alternative paths
    const alternativePaths = paths
      .filter((path: any) => path !== optimalPath)
      .slice(0, 3)
      .map((path: any) => ({
        steps: path.length,
        estimatedTime: this.workflowMath.calculatePathEstimatedTime(path),
        confidence: this.workflowMath.calculatePathConfidence(path),
        differences: this.workflowHeuristics.identifyPathDifferences(path, optimalPath)
      }));
    
    return {
      steps,
      totalEstimatedTime,
      completenessScore,
      efficiencyScore,
      alternativePaths
    };
  }
  
  /**
   * Learn from user behavior and improve predictions
   */
  async learnFromBehavior(
    userId: string,
    behaviorData: Array<{
      timestamp: Date;
      action: string;
      entityId?: string;
      context: WorkflowContext;
      durationMinutes?: number;
      success: boolean;
    }>
  ): Promise<{
    learnedPatterns: string[];
    updatedConfidenceScores: Record<string, number>;
    personalizedRecommendations: Suggestion[];
  }> {
    // Analyze behavior patterns
    const patterns = this.workflowHeuristics.analyzeBehaviorPatterns(behaviorData);
    
    // Update prediction models
    const updatedConfidenceScores = this.confidenceScoring.updateConfidenceScores(patterns);
    
    // Generate personalized recommendations
    const personalizedRecommendations = this.workflowHeuristics.generatePersonalizedRecommendations(
      userId,
      patterns,
      behaviorData
    );
    
    return {
      learnedPatterns: patterns.map((p: any) => p.description),
      updatedConfidenceScores,
      personalizedRecommendations
    };
  }
  
  /**
   * Private helper methods
   */
  
  private buildPredictionContext(context: WorkflowContext): PredictionContext {
    const currentEntities = context.recentEntityIds
      .map(id => this.graph.entities.get(id))
      .filter((entity): entity is WorkflowEntity => entity !== undefined);
    
    // Extract recent actions from context metadata
    const recentActions = context.metadata?.recentActions || [];
    
    // Determine time context
    const now = new Date();
    const timeOfDay = this.workflowHeuristics.getTimeOfDay(now);
    const dayOfWeek = this.workflowHeuristics.getDayOfWeek(now);
    
    return {
      currentEntities,
      recentActions,
      userIntent: context.userIntent,
      timeOfDay,
      dayOfWeek,
      availableTime: context.metadata?.availableTime
    };
  }
  
  private generateSuggestions(
    context: PredictionContext,
    options?: any
  ): Suggestion[] {
    // Delegate to specialized predictors
    const taskSuggestions = this.taskPredictor.generateSuggestions(context, options);
    const documentSuggestions = this.documentPredictor.generateSuggestions(context, options);
    
    // Combine and deduplicate
    const allSuggestions = [...taskSuggestions, ...documentSuggestions];
    return this.deduplicateSuggestions(allSuggestions);
  }
  
  private matchWorkflowTemplates(context: PredictionContext): WorkflowTemplate[] {
    // Simple template matching based on entity types
    const templates: WorkflowTemplate[] = [];
    
    const entityTypes = context.currentEntities.map(e => e.type);
    const uniqueTypes = [...new Set(entityTypes)];
    
    if (uniqueTypes.includes('note') && uniqueTypes.includes('task')) {
      templates.push({
        id: 'note-to-task-workflow',
        name: 'Note to Task Conversion',
        description: 'Convert notes into actionable tasks with follow-ups',
        steps: [
          { action: 'Review note content', entityType: 'note', description: 'Extract actionable items', estimatedTimeMinutes: 5 },
          { action: 'Create tasks', entityType: 'task', description: 'Create tasks from extracted items', estimatedTimeMinutes: 10 },
          { action: 'Assign priorities', entityType: 'task', description: 'Set task priorities and deadlines', estimatedTimeMinutes: 5 }
        ],
        suitabilityScore: 0.8,
        matchReasons: ['Contains both notes and tasks', 'Common workflow pattern']
      });
    }
    
    if (uniqueTypes.includes('document') && uniqueTypes.includes('media')) {
      templates.push({
        id: 'document-media-integration',
        name: 'Document with Media Integration',
        description: 'Enhance documents with related media content',
        steps: [
          { action: 'Review document', entityType: 'document', description: 'Identify sections needing media', estimatedTimeMinutes: 10 },
          { action: 'Link media', entityType: 'media', description: 'Link relevant media to document sections', estimatedTimeMinutes: 15 },
          { action: 'Update document', entityType: 'document', description: 'Integrate media references', estimatedTimeMinutes: 10 }
        ],
        suitabilityScore: 0.7,
        matchReasons: ['Contains documents and media', 'Media integration workflow']
      });
    }
    
    return templates;
  }
  
  private deduplicateSuggestions(suggestions: Suggestion[]): Suggestion[] {
    const seen = new Set<string>();
    const result: Suggestion[] = [];
    
    for (const suggestion of suggestions) {
      const key = `${suggestion.action}-${suggestion.entityType || ''}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(suggestion);
      }
    }
    
    return result;
  }
}