/**
 * Document-specific prediction logic
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

export class DocumentPredictor {
  private graph: WorkflowGraph;
  
  constructor(graph: WorkflowGraph) {
    this.graph = graph;
  }
  
  generateSuggestions(
    context: PredictionContext,
    options?: any
  ): Suggestion[] {
    const suggestions: Suggestion[] = [];
    
    // Find document entities in current context
    const documentEntities = context.currentEntities.filter(e => e.type === 'document');
    
    // Generate suggestions based on document status
    for (const document of documentEntities) {
      const documentStatus = document.metadata?.status || 'draft';
      const documentType = document.metadata?.documentType || 'general';
      
      switch (documentStatus) {
        case 'draft':
          suggestions.push({
            action: 'Review and edit document',
            entityId: document.id,
            entityType: 'document',
            confidence: 0.8,
            reasoning: ['Document is in draft stage', 'Needs review and refinement'],
            estimatedTimeMinutes: 30,
            priority: 1,
            impact: 'high'
          });
          break;
          
        case 'in_review':
          suggestions.push({
            action: 'Share document for feedback',
            entityId: document.id,
            entityType: 'document',
            confidence: 0.7,
            reasoning: ['Document is in review', 'Sharing accelerates feedback cycle'],
            estimatedTimeMinutes: 10,
            priority: 2,
            impact: 'medium'
          });
          break;
          
        case 'finalized':
          suggestions.push({
            action: 'Archive completed document',
            entityId: document.id,
            entityType: 'document',
            confidence: 0.6,
            reasoning: ['Document is finalized', 'Archiving clears workspace'],
            estimatedTimeMinutes: 5,
            priority: 3,
            impact: 'low'
          });
          break;
      }
      
      // Document type specific suggestions
      if (documentType === 'report') {
        suggestions.push({
          action: 'Create summary from report',
          entityId: document.id,
          entityType: 'document',
          confidence: 0.7,
          reasoning: ['Reports often need summaries', 'Summaries improve accessibility'],
          estimatedTimeMinutes: 20,
          priority: 2,
          impact: 'medium'
        });
      }
      
      if (documentType === 'proposal') {
        suggestions.push({
          action: 'Review proposal completeness',
          entityId: document.id,
          entityType: 'document',
          confidence: 0.8,
          reasoning: ['Proposals need thorough review', 'Completeness ensures success'],
          estimatedTimeMinutes: 25,
          priority: 1,
          impact: 'high'
        });
      }
    }
    
    // Generate document creation suggestions based on other entities
    const nonDocumentEntities = context.currentEntities.filter(e => e.type !== 'document');
    for (const entity of nonDocumentEntities) {
      if (entity.type === 'note') {
        suggestions.push({
          action: 'Expand note into document',
          entityId: entity.id,
          entityType: entity.type,
          confidence: 0.6,
          reasoning: ['Note has substantial content', 'Expanding creates formal document'],
          estimatedTimeMinutes: 45,
          priority: 2,
          impact: 'medium'
        });
      }
      
      if (entity.type === 'task' && entity.metadata?.status === 'completed') {
        suggestions.push({
          action: 'Document task completion',
          entityId: entity.id,
          entityType: entity.type,
          confidence: 0.7,
          reasoning: ['Completed task needs documentation', 'Creates knowledge base'],
          estimatedTimeMinutes: 15,
          priority: 2,
          impact: 'medium'
        });
      }
    }
    
    // Time-based document suggestions
    if (context.timeOfDay === 'afternoon') {
      suggestions.push({
        action: 'Work on focused document editing',
        confidence: 0.7,
        reasoning: ['Afternoon is good for focused work', 'Document editing requires concentration'],
        estimatedTimeMinutes: 60,
        priority: 2,
        impact: 'medium'
      });
    }
    
    // User intent based suggestions
    if (context.userIntent?.includes('write') || context.userIntent?.includes('document')) {
      suggestions.push({
        action: 'Start new document',
        confidence: 0.8,
        reasoning: ['User intent indicates document work', 'Starting new document aligns with intent'],
        estimatedTimeMinutes: 30,
        priority: 1,
        impact: 'high'
      });
    }
    
    return suggestions;
  }
}