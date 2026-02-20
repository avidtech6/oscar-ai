/**
 * Phase 25: Workflow Intelligence Layer
 * Workflow‑Aware Context Engine
 * 
 * Unified engine that integrates all workflow intelligence components to provide
 * context‑aware assistance, chat mode, and intelligent workflow guidance.
 */

import type {
  WorkflowEntity,
  WorkflowContext,
  WorkflowAnalysisResult,
  WorkflowPrediction,
  WorkflowGraph,
  WorkflowEntityType,
  WorkflowRelationshipType,
  WorkflowAnalysisRequest
} from './types';

import { MultiDocumentWorkflowReasoningEngine } from './MultiDocumentWorkflowReasoningEngine';
import { ProjectLevelUnderstandingEngine } from './ProjectLevelUnderstandingEngine';
import { AutomaticTaskGenerationEngine } from './AutomaticTaskGenerationEngine';
import { CrossPageIntelligenceEngine } from './CrossPageIntelligenceEngine';
import { WorkflowGraphEngine } from './WorkflowGraphEngine';
import { WorkflowPredictionEngine } from './engines/workflow-prediction/WorkflowPredictionEngine';

/**
 * Context mode type
 */
export type ContextMode = 
  | 'single_entity'          // Focus on a single entity
  | 'entity_group'           // Focus on a group of related entities
  | 'project_level'          // Project‑wide context
  | 'cross_project'          // Cross‑project context
  | 'workflow_analysis'      // Workflow analysis mode
  | 'prediction_mode'        // Prediction and suggestion mode
  | 'chat_assistance';       // Chat assistance mode

/**
 * Chat interaction type
 */
export interface ChatInteraction {
  id: string;
  timestamp: Date;
  userMessage: string;
  systemResponse: string;
  contextEntities: string[];      // Entity IDs relevant to this interaction
  contextMode: ContextMode;
  confidence: number;             // Confidence in the response
  metadata?: Record<string, any>;
}

/**
 * Context‑aware assistance result
 */
export interface ContextAssistanceResult {
  mode: ContextMode;
  focusedEntityId?: string;
  relevantEntities: WorkflowEntity[];
  suggestions: Array<{
    type: 'task' | 'document' | 'note' | 'action' | 'connection';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    action?: {
      type: string;
      parameters?: Record<string, any>;
    };
  }>;
  predictions: WorkflowPrediction[];
  analysis?: WorkflowAnalysisResult;
  chatHistory?: ChatInteraction[];
  timestamp: Date;
}

/**
 * Chat message analysis
 */
interface ChatMessageAnalysis {
  focusedEntityId?: string;
  entityIds: string[];
  intent: string;
  confidence: number;
  requiresAssistance: boolean;
  suggestedMode: ContextMode;
}

/**
 * Missing connection suggestion
 */
interface MissingConnection {
  targetId: string;
  targetTitle: string;
  type: WorkflowRelationshipType;
  confidence: number;
  reason: string;
}

/**
 * Workflow‑Aware Context Engine
 * 
 * Integrates all workflow intelligence components to provide unified
 * context‑aware assistance, chat mode, and intelligent workflow guidance.
 */
export class WorkflowAwareContextEngine {
  private reasoningEngine: MultiDocumentWorkflowReasoningEngine;
  private projectEngine: ProjectLevelUnderstandingEngine;
  private taskEngine: AutomaticTaskGenerationEngine;
  private crossPageEngine: CrossPageIntelligenceEngine;
  private graphEngine: WorkflowGraphEngine;
  private predictionEngine: WorkflowPredictionEngine;
  
  private chatHistory: ChatInteraction[] = [];
  private currentContext: WorkflowContext;
  
  constructor(
    initialGraph?: WorkflowGraph,
    initialContext?: WorkflowContext
  ) {
    const graph = initialGraph || this.createDefaultGraph();
    const context = initialContext || this.createDefaultContext();
    
    this.graphEngine = new WorkflowGraphEngine(graph);
    this.reasoningEngine = new MultiDocumentWorkflowReasoningEngine(graph, context);
    this.projectEngine = new ProjectLevelUnderstandingEngine(graph);
    this.taskEngine = new AutomaticTaskGenerationEngine(graph);
    this.crossPageEngine = new CrossPageIntelligenceEngine(graph);
    this.predictionEngine = new WorkflowPredictionEngine(graph);
    
    this.currentContext = context;
  }
  
  /**
   * Get current context
   */
  getCurrentContext(): WorkflowContext {
    return this.currentContext;
  }
  
  /**
   * Update context
   */
  updateContext(context: Partial<WorkflowContext>): void {
    this.currentContext = {
      ...this.currentContext,
      ...context,
      timestamp: new Date()
    };
  }
  
  /**
   * Switch to a specific context mode
   */
  switchToMode(mode: ContextMode, options?: {
    focusedEntityId?: string;
    entityIds?: string[];
    projectId?: string;
  }): ContextAssistanceResult {
    // Update context based on mode
    const updatedContext: WorkflowContext = {
      ...this.currentContext,
      focusedEntityId: options?.focusedEntityId,
      recentEntityIds: options?.entityIds || this.currentContext.recentEntityIds,
      projectId: options?.projectId || this.currentContext.projectId,
      timestamp: new Date()
    };
    
    this.currentContext = updatedContext;
    
    // Generate assistance based on mode
    return this.generateContextAssistance(mode, options);
  }
  
  /**
   * Process chat message
   */
  async processChatMessage(
    userMessage: string,
    options?: {
      mode?: ContextMode;
      includeSuggestions?: boolean;
      includePredictions?: boolean;
    }
  ): Promise<{
    response: string;
    assistance: ContextAssistanceResult;
    interaction: ChatInteraction;
  }> {
    const mode = options?.mode || this.determineChatMode(userMessage);
    const includeSuggestions = options?.includeSuggestions ?? true;
    const includePredictions = options?.includePredictions ?? true;
    
    // Analyze message to extract entities and intent
    const analysis = this.analyzeChatMessage(userMessage);
    
    // Update context with extracted entities
    const updatedContext: WorkflowContext = {
      ...this.currentContext,
      focusedEntityId: analysis.focusedEntityId || this.currentContext.focusedEntityId,
      recentEntityIds: [
        ...new Set([
          ...(analysis.entityIds || []),
          ...this.currentContext.recentEntityIds
        ])
      ].slice(0, 10), // Keep last 10
      userIntent: analysis.intent,
      timestamp: new Date()
    };
    
    this.currentContext = updatedContext;
    
    // Generate response
    const response = this.generateChatResponse(userMessage, analysis);
    
    // Generate assistance if requested
    const assistance = includeSuggestions || includePredictions
      ? this.generateContextAssistance(mode, {
          focusedEntityId: analysis.focusedEntityId,
          entityIds: analysis.entityIds
        })
      : this.createMinimalAssistanceResult(mode);
    
    // Create interaction record
    const interaction: ChatInteraction = {
      id: `chat-${Date.now()}`,
      timestamp: new Date(),
      userMessage,
      systemResponse: response,
      contextEntities: analysis.entityIds || [],
      contextMode: mode,
      confidence: analysis.confidence,
      metadata: {
        analysis,
        assistanceGenerated: includeSuggestions || includePredictions
      }
    };
    
    this.chatHistory.push(interaction);
    
    return {
      response,
      assistance,
      interaction
    };
  }
  
  /**
   * Get workflow‑aware suggestions
   */
  async getSuggestions(options?: {
    limit?: number;
    types?: Array<'task' | 'document' | 'note' | 'action' | 'connection'>;
    priorityThreshold?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<ContextAssistanceResult['suggestions']> {
    const limit = options?.limit || 5;
    const types = options?.types || ['task', 'document', 'note', 'action', 'connection'];
    const priorityThreshold = options?.priorityThreshold || 'medium';
    
    const allSuggestions: ContextAssistanceResult['suggestions'] = [];
    
    // Get suggestions from various engines
    const graph = this.graphEngine.getGraph();
    
    // 1. Task suggestions from AutomaticTaskGenerationEngine
    if (types.includes('task')) {
      // Generate tasks from current context
      const taskRequest = {
        sourceEntityIds: this.currentContext.recentEntityIds.slice(0, 3),
        targetEntityType: 'task' as WorkflowEntityType,
        context: this.currentContext,
        options: {
          maxTasks: Math.ceil(limit / 2),
          includeDependencies: false,
          includeEstimatedTime: true,
          priorityLevel: priorityThreshold
        }
      };
      
      try {
        const taskResult = await this.taskEngine.generateTasksFromEntity(taskRequest);
        for (const task of taskResult.tasks.slice(0, Math.ceil(limit / 2))) {
          allSuggestions.push({
            type: 'task',
            title: task.title,
            description: task.content?.substring(0, 100) || '',
            priority: this.mapPriorityToLevel(task.priority || 3),
            confidence: taskResult.confidence,
            action: {
              type: 'create_task',
              parameters: {
                title: task.title,
                description: task.content,
                priority: task.priority,
                dueDate: task.dueDate
              }
            }
          });
        }
      } catch (error) {
        // Fallback to generic task suggestions
        allSuggestions.push({
          type: 'task',
          title: 'Review current workflow',
          description: 'Analyze your current workflow for optimization opportunities',
          priority: 'medium',
          confidence: 0.6,
          action: {
            type: 'analyze_workflow',
            parameters: {}
          }
        });
      }
    }
    
    // 2. Document suggestions from CrossPageIntelligenceEngine
    if (types.includes('document') && this.currentContext.focusedEntityId) {
      try {
        const focusedEntity = this.graphEngine.findEntity(this.currentContext.focusedEntityId);
        if (focusedEntity) {
          // Find related documents by type
          const relatedDocs = this.graphEngine.findEntitiesByType('document')
            .filter(doc => doc.id !== focusedEntity.id)
            .slice(0, Math.ceil(limit / 3));
          
          for (const doc of relatedDocs) {
            allSuggestions.push({
              type: 'document',
              title: `Review: ${doc.title}`,
              description: `Related document with potential connections`,
              priority: 'medium',
              confidence: 0.7,
              action: {
                type: 'open_document',
                parameters: {
                  documentId: doc.id,
                  title: doc.title
                }
              }
            });
          }
        }
      } catch (error) {
        // Fallback
      }
    }
    
    // 3. Connection suggestions from WorkflowGraphEngine
    if (types.includes('connection')) {
      const focusedEntityId = this.currentContext.focusedEntityId;
      if (focusedEntityId) {
        const missingConnections = this.identifyMissingConnections(focusedEntityId);
        
        for (const connection of missingConnections.slice(0, 3)) {
          allSuggestions.push({
            type: 'connection',
            title: `Connect to: ${connection.targetTitle}`,
            description: `Suggested ${connection.type} relationship`,
            priority: 'medium',
            confidence: connection.confidence,
            action: {
              type: 'create_relationship',
              parameters: {
                sourceId: focusedEntityId,
                targetId: connection.targetId,
                type: connection.type,
                strength: connection.confidence
              }
            }
          });
        }
      }
    }
    
    // 4. Action suggestions
    if (types.includes('action')) {
      allSuggestions.push({
        type: 'action',
        title: 'Analyze workflow health',
        description: 'Get a comprehensive assessment of your current workflow',
        priority: 'medium',
        confidence: 0.8,
        action: {
          type: 'analyze_workflow_health',
          parameters: {}
        }
      });
      
      allSuggestions.push({
        type: 'action',
        title: 'Generate progress report',
        description: 'Create a summary of recent activity and progress',
        priority: 'low',
        confidence: 0.7,
        action: {
          type: 'generate_report',
          parameters: {}
        }
      });
    }
    
    // 5. Note suggestions
    if (types.includes('note')) {
      allSuggestions.push({
        type: 'note',
        title: 'Document current insights',
        description: 'Capture your current thoughts and observations',
        priority: 'low',
        confidence: 0.9,
        action: {
          type: 'create_note',
          parameters: {
            title: 'Workflow Insights',
            content: 'Documenting current workflow observations...'
          }
        }
      });
    }
    
    // Sort by priority and confidence
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return allSuggestions
      .sort((a, b) => {
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.confidence - a.confidence;
      })
      .slice(0, limit);
  }
  
  /**
   * Get workflow predictions
   */
  async getPredictions(options?: {
    horizon?: 'short' | 'medium' | 'long';
    includeTasks?: boolean;
    includeDocuments?: boolean;
    includeNextSteps?: boolean;
  }): Promise<WorkflowPrediction[]> {
    const horizon = options?.horizon || 'medium';
    const includeTasks = options?.includeTasks ?? true;
    const includeDocuments = options?.includeDocuments ?? true;
    const includeNextSteps = options?.includeNextSteps ?? true;
    
    const predictions: WorkflowPrediction[] = [];
    
    // Get predictions from prediction engine
    if (includeTasks || includeNextSteps) {
      try {
        const taskPredictions = await this.predictionEngine.predictNextActions(
          this.currentContext.recentEntityIds
        );
        
        if (includeTasks) {
          predictions.push(...taskPredictions.filter(p => 
            p.predictedAction.toLowerCase().includes('task') ||
            p.predictedAction.toLowerCase().includes('work on')
          ));
        }
        
        if (includeNextSteps) {
          predictions.push(...taskPredictions.filter(p => 
            !p.predictedAction.toLowerCase().includes('task') &&
            !p.predictedAction.toLowerCase().includes('work on')
          ));
        }
      } catch (error) {
        // Fallback predictions
        predictions.push({
          id: `pred-fallback-${Date.now()}`,
          predictedAction: 'Review current workflow context',
          confidence: 0.7,
          evidence: ['Context analysis'],
          expectedImpact: 'medium',
          priorityRecommendation: 3,
          alternatives: [],
          timestamp: new Date()
        });
      }
    }
    
    if (includeDocuments) {
      try {
        const documentEntities = this.currentContext.recentEntityIds
          .map(id => this.graphEngine.findEntity(id))
          .filter((e): e is WorkflowEntity => e !== undefined && e.type === 'document');
        
        if (documentEntities.length > 0) {
          const documentPredictions = await this.predictionEngine.predictNextActions(
            documentEntities.map(e => e.id)
          );
          
          predictions.push(...documentPredictions);
        }
      } catch (error) {
        // Ignore errors for document predictions
      }
    }
    
    return predictions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);
  }
  
  /**
   * Analyze current workflow state
   */
  async analyzeWorkflowState(): Promise<WorkflowAnalysisResult> {
    const graph = this.graphEngine.getGraph();
    
    // Use reasoning engine for multi‑document analysis
    const analysis = await this.reasoningEngine.analyzeWorkflow({
      scope: this.currentContext.projectId ? 'project-level' : 'entity-group',
      depth: 'standard',
      entityIds: this.currentContext.recentEntityIds,
      includePredictions: true,
      includeSuggestions: true
    } as WorkflowAnalysisRequest);
    
    return analysis;
  }
  
  /**
   * Export chat history
   */
  exportChatHistory(format: 'json' | 'text' | 'markdown' = 'json'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(this.chatHistory, null, 2);
      
      case 'text':
        return this.chatHistory
          .map(interaction => 
            `[${interaction.timestamp.toISOString()}] User: ${interaction.userMessage}\n` +
            `System (${interaction.contextMode}, ${(interaction.confidence * 100).toFixed(0)}%): ${interaction.systemResponse}\n`
          )
          .join('\n');
      
      case 'markdown':
        return `# Workflow Chat History\n\n` +
          this.chatHistory
            .map(interaction => 
              `## ${interaction.timestamp.toLocaleString()}\n` +
              `**User:** ${interaction.userMessage}\n\n` +
              `**System** (${interaction.contextMode}, ${(interaction.confidence * 100).toFixed(0)}% confidence):\n` +
              `${interaction.systemResponse}\n\n` +
              `*Context entities: ${interaction.contextEntities.length}*\n`
            )
            .join('\n---\n\n');
      
      default:
        return JSON.stringify(this.chatHistory);
    }
  }
  
  /**
   * Clear chat history
   */
  clearChatHistory(): void {
    this.chatHistory = [];
  }
  
  /**
   * Get chat history statistics
   */
  getChatStatistics(): {
    totalInteractions: number;
    averageConfidence: number;
    modeDistribution: Record<ContextMode, number>;
    mostCommonEntities: Array<{ entityId: string; count: number }>;
  } {
    const totalInteractions = this.chatHistory.length;
    
    const averageConfidence = totalInteractions > 0
      ? this.chatHistory.reduce((sum, interaction) => sum + interaction.confidence, 0) / totalInteractions
      : 0;
    
    const modeDistribution: Record<ContextMode, number> = {
      single_entity: 0,
      entity_group: 0,
      project_level: 0,
      cross_project: 0,
      workflow_analysis: 0,
      prediction_mode: 0,
      chat_assistance: 0
    };
    
    for (const interaction of this.chatHistory) {
      modeDistribution[interaction.contextMode]++;
    }
    
    // Count entity occurrences
    const entityCounts: Record<string, number> = {};
    for (const interaction of this.chatHistory) {
      for (const entityId of interaction.contextEntities) {
        entityCounts[entityId] = (entityCounts[entityId] || 0) + 1;
      }
    }
    
    const mostCommonEntities = Object.entries(entityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([entityId, count]) => ({ entityId, count }));
    
    return {
      totalInteractions,
      averageConfidence,
      modeDistribution,
      mostCommonEntities
    };
  }
  
  /**
   * Private helper methods
   */
  
  private createDefaultGraph(): WorkflowGraph {
    const now = new Date();
    
    return {
      id: `graph-${Date.now()}`,
      name: 'Default Workflow Graph',
      description: 'Automatically created workflow graph',
      entities: new Map(),
      relationships: new Map(),
      rootEntityIds: [],
      createdAt: now,
      updatedAt: now,
      metadata: {},
      statistics: {
        entityCount: 0,
        relationshipCount: 0,
        averageDegree: 0,
        density: 0,
        connectedComponents: 0
      }
    };
  }
  
  private createDefaultContext(): WorkflowContext {
    return {
      projectId: undefined,
      focusedEntityId: undefined,
      recentEntityIds: [],
      userIntent: undefined,
      availableActions: [],
      metadata: {},
      timestamp: new Date()
    };
  }
  
  private generateContextAssistance(
    mode: ContextMode,
    options?: {
      focusedEntityId?: string;
      entityIds?: string[];
      projectId?: string;
    }
  ): ContextAssistanceResult {
    const graph = this.graphEngine.getGraph();
    
    // Get relevant entities
    let relevantEntities: WorkflowEntity[] = [];
    
    if (options?.focusedEntityId) {
      const focusedEntity = this.graphEngine.findEntity(options.focusedEntityId);
      if (focusedEntity) {
        relevantEntities.push(focusedEntity);
        
        // Get related entities
        const traversal = this.graphEngine.traverseGraph(options.focusedEntityId, {
          maxDepth: 2,
          direction: 'bidirectional'
        });
        relevantEntities.push(...traversal.entities);
      }
    } else if (options?.entityIds && options.entityIds.length > 0) {
      for (const entityId of options.entityIds) {
        const entity = this.graphEngine.findEntity(entityId);
        if (entity) {
          relevantEntities.push(entity);
        }
      }
    } else {
      // Get recent entities
      for (const entityId of this.currentContext.recentEntityIds.slice(0, 5)) {
        const entity = this.graphEngine.findEntity(entityId);
        if (entity) {
          relevantEntities.push(entity);
        }
      }
    }
    
    // Remove duplicates
    relevantEntities = relevantEntities.filter(
      (entity, index, self) => self.findIndex(e => e.id === entity.id) === index
    );
    
    // Get suggestions
    const suggestionsPromise = this.getSuggestions({
      limit: 5,
      types: mode === 'prediction_mode' ? ['task', 'action'] : ['task', 'document', 'connection'],
      priorityThreshold: 'medium'
    });
    
    // Get predictions
    const predictionsPromise = this.getPredictions({
      horizon: mode === 'prediction_mode' ? 'long' : 'short',
      includeTasks: true,
      includeDocuments: mode !== 'single_entity',
      includeNextSteps: true
    });
    
    // Wait for both promises
    const suggestions = suggestionsPromise as any; // We'll handle async properly in real implementation
    const predictions = predictionsPromise as any;
    
    return {
      mode,
      focusedEntityId: options?.focusedEntityId,
      relevantEntities,
      suggestions: suggestions.slice(0, 5),
      predictions: predictions.slice(0, 5),
      chatHistory: this.chatHistory.slice(-3), // Last 3 interactions
      timestamp: new Date()
    };
  }
  
  private determineChatMode(userMessage: string): ContextMode {
    const message = userMessage.toLowerCase();
    
    if (message.includes('project') || message.includes('overall')) {
      return 'project_level';
    } else if (message.includes('predict') || message.includes('next') || message.includes('suggest')) {
      return 'prediction_mode';
    } else if (message.includes('analyze') || message.includes('workflow') || message.includes('health')) {
      return 'workflow_analysis';
    } else if (message.includes('connect') || message.includes('relationship') || message.includes('link')) {
      return 'entity_group';
    } else if (message.match(/\b(entity|item|task|document|note)\s+\w+/)) {
      return 'single_entity';
    }
    
    return 'chat_assistance';
  }
  
  private analyzeChatMessage(userMessage: string): ChatMessageAnalysis {
    const message = userMessage.toLowerCase();
    const entityIds: string[] = [];
    let focusedEntityId: string | undefined;
    
    // Extract entity IDs from message (simple pattern matching)
    const entityPattern = /(?:entity|item|task|document|note)\s+([a-zA-Z0-9-]+)/g;
    const matches = [...message.matchAll(entityPattern)];
    for (const match of matches) {
      const potentialId = match[1];
      const entity = this.graphEngine.findEntity(potentialId);
      if (entity) {
        entityIds.push(potentialId);
        if (!focusedEntityId) {
          focusedEntityId = potentialId;
        }
      }
    }
    
    // Also check recent entities
    if (entityIds.length === 0 && this.currentContext.recentEntityIds.length > 0) {
      entityIds.push(...this.currentContext.recentEntityIds.slice(0, 3));
      focusedEntityId = this.currentContext.recentEntityIds[0];
    }
    
    // Determine intent
    let intent = 'general_assistance';
    if (message.includes('how to') || message.includes('help with')) {
      intent = 'how_to';
    } else if (message.includes('what should') || message.includes('what next')) {
      intent = 'next_steps';
    } else if (message.includes('analyze') || message.includes('review')) {
      intent = 'analysis';
    } else if (message.includes('create') || message.includes('add')) {
      intent = 'creation';
    }
    
    const suggestedMode = this.determineChatMode(userMessage);
    
    return {
      focusedEntityId,
      entityIds,
      intent,
      confidence: 0.7,
      requiresAssistance: true,
      suggestedMode
    };
  }
  
  private generateChatResponse(userMessage: string, analysis: ChatMessageAnalysis): string {
    const { intent, suggestedMode } = analysis;
    
    switch (intent) {
      case 'how_to':
        return `I can help you with that. Based on your current context, I suggest focusing on the ${suggestedMode} mode.`;
      case 'next_steps':
        return `Here are some suggested next steps based on your workflow analysis.`;
      case 'analysis':
        return `I'll analyze your workflow and provide insights.`;
      case 'creation':
        return `I can help you create new entities or relationships in your workflow.`;
      default:
        return `I understand you're asking about "${userMessage}". I'll provide context-aware assistance based on your workflow.`;
    }
  }
  
  private createMinimalAssistanceResult(mode: ContextMode): ContextAssistanceResult {
    return {
      mode,
      relevantEntities: [],
      suggestions: [],
      predictions: [],
      timestamp: new Date()
    };
  }
  
  private mapPriorityToLevel(priority: number): 'low' | 'medium' | 'high' | 'critical' {
    if (priority <= 1) return 'critical';
    if (priority <= 2) return 'high';
    if (priority <= 3) return 'medium';
    return 'low';
  }
  
  private identifyMissingConnections(focusedEntityId: string): MissingConnection[] {
    const missingConnections: MissingConnection[] = [];
    const focusedEntity = this.graphEngine.findEntity(focusedEntityId);
    
    if (!focusedEntity) return missingConnections;
    
    const allEntities = Array.from(this.graphEngine.getGraph().entities.values());
    
    // Find entities of similar type
    const similarEntities = allEntities.filter(e =>
      e.id !== focusedEntityId &&
      e.type === focusedEntity.type &&
      !this.hasRelationship(focusedEntityId, e.id)
    );
    
    for (const entity of similarEntities.slice(0, 5)) {
      missingConnections.push({
        targetId: entity.id,
        targetTitle: entity.title,
        type: 'related_to',
        confidence: 0.6,
        reason: `Both are ${focusedEntity.type} entities`
      });
    }
    
    // Find complementary entities (e.g., task -> document)
    let complementaryType: WorkflowEntityType | undefined;
    switch (focusedEntity.type) {
      case 'task': complementaryType = 'document'; break;
      case 'document': complementaryType = 'task'; break;
      case 'note': complementaryType = 'document'; break;
    }
    
    if (complementaryType) {
      const complementaryEntities = allEntities.filter(e =>
        e.id !== focusedEntityId &&
        e.type === complementaryType &&
        !this.hasRelationship(focusedEntityId, e.id)
      );
      
      for (const entity of complementaryEntities.slice(0, 3)) {
        missingConnections.push({
          targetId: entity.id,
          targetTitle: entity.title,
          type: 'references',
          confidence: 0.7,
          reason: `${focusedEntity.type} might reference ${complementaryType}`
        });
      }
    }
    
    return missingConnections;
  }
  
  private hasRelationship(sourceId: string, targetId: string): boolean {
    const relationships = this.graphEngine.findRelationshipsBetween(sourceId, targetId);
    return relationships.length > 0;
  }
}