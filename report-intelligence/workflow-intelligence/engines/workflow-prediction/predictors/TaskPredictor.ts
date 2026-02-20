/**
 * Task-specific prediction logic
 */

import type {
  WorkflowEntity,
  WorkflowGraph,
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

export class TaskPredictor {
  private graph: WorkflowGraph;
  
  constructor(graph: WorkflowGraph) {
    this.graph = graph;
  }
  
  generateSuggestions(
    context: PredictionContext,
    options?: any
  ): Suggestion[] {
    const suggestions: Suggestion[] = [];
    
    // Find task entities in current context
    const taskEntities = context.currentEntities.filter(e => e.type === 'task');
    
    // Generate suggestions based on task status
    for (const task of taskEntities) {
      const taskStatus = task.metadata?.status || 'pending';
      
      switch (taskStatus) {
        case 'pending':
          suggestions.push({
            action: 'Start working on task',
            entityId: task.id,
            entityType: 'task',
            confidence: 0.8,
            reasoning: ['Task is pending and ready to start', 'Based on task priority'],
            estimatedTimeMinutes: this.estimateTaskTime(task),
            priority: 1,
            impact: 'high'
          });
          break;
          
        case 'in_progress':
          suggestions.push({
            action: 'Update task progress',
            entityId: task.id,
            entityType: 'task',
            confidence: 0.7,
            reasoning: ['Task is in progress', 'Regular updates improve tracking'],
            estimatedTimeMinutes: 5,
            priority: 2,
            impact: 'medium'
          });
          break;
          
        case 'blocked':
          suggestions.push({
            action: 'Identify blocking issues',
            entityId: task.id,
            entityType: 'task',
            confidence: 0.9,
            reasoning: ['Task is blocked', 'Addressing blockers is critical'],
            estimatedTimeMinutes: 15,
            priority: 1,
            impact: 'high'
          });
          break;
          
        case 'completed':
          suggestions.push({
            action: 'Document task completion',
            entityId: task.id,
            entityType: 'task',
            confidence: 0.6,
            reasoning: ['Task is completed', 'Documentation ensures proper closure'],
            estimatedTimeMinutes: 10,
            priority: 3,
            impact: 'medium'
          });
          break;
      }
    }
    
    // Generate task creation suggestions based on other entities
    const nonTaskEntities = context.currentEntities.filter(e => e.type !== 'task');
    for (const entity of nonTaskEntities) {
      if (entity.type === 'note') {
        suggestions.push({
          action: 'Create task from note',
          entityId: entity.id,
          entityType: entity.type,
          confidence: 0.7,
          reasoning: ['Note contains actionable content', 'Converting to task improves execution'],
          estimatedTimeMinutes: 10,
          priority: 2,
          impact: 'medium'
        });
      }
      
      if (entity.type === 'document') {
        suggestions.push({
          action: 'Create review task for document',
          entityId: entity.id,
          entityType: entity.type,
          confidence: 0.6,
          reasoning: ['Document may need review', 'Task ensures follow-up'],
          estimatedTimeMinutes: 15,
          priority: 3,
          impact: 'low'
        });
      }
    }
    
    // Time-based task suggestions
    if (context.timeOfDay === 'morning') {
      suggestions.push({
        action: 'Plan daily tasks',
        confidence: 0.8,
        reasoning: ['Morning is ideal for planning', 'Sets direction for the day'],
        estimatedTimeMinutes: 15,
        priority: 1,
        impact: 'high'
      });
    }
    
    if (context.timeOfDay === 'evening') {
      suggestions.push({
        action: 'Review completed tasks',
        confidence: 0.7,
        reasoning: ['Evening is good for reflection', 'Helps track progress'],
        estimatedTimeMinutes: 10,
        priority: 2,
        impact: 'medium'
      });
    }
    
    return suggestions;
  }
  
  private estimateTaskTime(task: WorkflowEntity): number {
    // Simple estimation based on task metadata
    const estimatedTime = task.metadata?.estimatedTimeMinutes;
    if (estimatedTime && typeof estimatedTime === 'number') {
      return estimatedTime;
    }
    
    // Default estimation based on task complexity
    const complexity = task.metadata?.complexity || 'medium';
    switch (complexity) {
      case 'low': return 30;
      case 'medium': return 60;
      case 'high': return 120;
      default: return 45;
    }
  }
}