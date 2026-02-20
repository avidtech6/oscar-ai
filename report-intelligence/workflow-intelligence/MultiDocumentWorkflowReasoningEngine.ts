/**
 * Phase 25: Workflow Intelligence Layer
 * Multi‑Document Workflow Reasoning Engine
 * 
 * Implements reasoning across multiple documents, tasks, notes, and media
 * to understand workflow patterns, generate insights, and predict next steps.
 */

import type {
  WorkflowEntity,
  WorkflowRelationship,
  WorkflowGraph,
  WorkflowContext,
  WorkflowPrediction,
  WorkflowAnalysisRequest,
  WorkflowAnalysisResult,
  CrossPageAnalysis,
  WorkflowAwareContext,
  EntitySummary,
  EntityRelationship,
  EntityIssue,
  EntityOpportunity,
  WorkflowPattern,
  WorkflowBottleneck,
  WorkflowEfficiency,
  WorkflowRisk,
  KeyInsight,
  StrategicRecommendation,
  TacticalRecommendation,
  PredictiveInsight,
  NextActionPrediction,
  OutcomePrediction,
  RiskPrediction,
  TimelinePrediction
} from './types';

/**
 * Multi‑Document Workflow Reasoning Engine
 */
export class MultiDocumentWorkflowReasoningEngine {
  private graph: WorkflowGraph;
  private context: WorkflowContext;
  private analysisCache: Map<string, WorkflowAnalysisResult>;
  
  constructor(graph: WorkflowGraph, context: WorkflowContext) {
    this.graph = graph;
    this.context = context;
    this.analysisCache = new Map();
  }
  
  async analyzeWorkflow(request: WorkflowAnalysisRequest): Promise<WorkflowAnalysisResult> {
    const cacheKey = `${request.scope}-${request.depth}-${request.entityIds.join(',')}`;
    
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!;
    }
    
    const startTime = Date.now();
    const entities = this.getEntitiesForAnalysis(request);
    const relationships = this.getRelationshipsForEntities(entities);
    
    const result: WorkflowAnalysisResult = {
      metadata: {
        timestamp: new Date(),
        scope: request.scope,
        depth: request.depth,
        processingTimeMs: Date.now() - startTime,
        statistics: {
          entityCount: entities.length,
          relationshipCount: relationships.length,
          averageComplexity: this.calculateAverageComplexity(entities)
        }
      },
      entities: {
        summaries: this.generateEntitySummaries(entities),
        relationships: this.generateEntityRelationships(relationships),
        issues: this.detectEntityIssues(entities, relationships),
        opportunities: this.detectEntityOpportunities(entities, relationships)
      },
      workflow: {
        patterns: this.detectWorkflowPatterns(entities, relationships),
        bottlenecks: this.detectWorkflowBottlenecks(entities, relationships),
        efficiencies: this.detectWorkflowEfficiencies(entities, relationships),
        risks: this.detectWorkflowRisks(entities, relationships)
      },
      insights: {
        keyInsights: this.generateKeyInsights(entities, relationships),
        strategicRecommendations: this.generateStrategicRecommendations(entities, relationships),
        tacticalRecommendations: this.generateTacticalRecommendations(entities, relationships),
        predictiveInsights: this.generatePredictiveInsights(entities, relationships)
      },
      predictions: request.includePredictions ? {
        nextActions: this.generateNextActionPredictions(entities, relationships),
        outcomePredictions: this.generateOutcomePredictions(entities, relationships),
        riskPredictions: this.generateRiskPredictions(entities, relationships),
        timelinePredictions: this.generateTimelinePredictions(entities, relationships)
      } : {
        nextActions: [],
        outcomePredictions: [],
        riskPredictions: [],
        timelinePredictions: []
      },
      assessment: {
        healthScore: this.calculateHealthScore(entities, relationships),
        maturityLevel: this.assessMaturityLevel(entities, relationships),
        strengths: this.identifyStrengths(entities, relationships),
        areasForImprovement: this.identifyAreasForImprovement(entities, relationships),
        improvementUrgency: this.determineImprovementUrgency(entities, relationships),
        confidence: this.calculateAnalysisConfidence(entities, relationships)
      }
    };
    
    this.analysisCache.set(cacheKey, result);
    return result;
  }
  
  async generateCrossPageAnalysis(sourcePageIds: string[]): Promise<CrossPageAnalysis> {
    const sourceEntities = sourcePageIds
      .map(id => this.graph.entities.get(id))
      .filter((e): e is WorkflowEntity => e !== undefined);
    
    if (sourceEntities.length === 0) {
      throw new Error('No valid source entities found');
    }
    
    const connections = this.analyzeEntityConnections(sourceEntities);
    const insights = this.generateCrossPageInsights(sourceEntities, connections);
    const recommendedActions = this.generateCrossPageRecommendations(sourceEntities, insights);
    
    return {
      id: `cross-page-${Date.now()}`,
      sourcePageIds,
      connections,
      insights,
      recommendedActions,
      confidence: this.calculateCrossPageConfidence(sourceEntities, connections),
      timestamp: new Date()
    };
  }
  
  async predictNextActions(entityIds: string[]): Promise<WorkflowPrediction[]> {
    const entities = entityIds
      .map(id => this.graph.entities.get(id))
      .filter((e): e is WorkflowEntity => e !== undefined);
    
    return entities.flatMap(entity => this.generateEntityPredictions(entity));
  }
  
  createWorkflowAwareContext(modeType: WorkflowAwareContext['modeType'], entityIds: string[]): WorkflowAwareContext {
    return {
      id: `context-${Date.now()}`,
      modeType,
      entityIds,
      availableOperations: this.determineAvailableOperations(modeType, entityIds),
      history: [],
      metadata: {
        createdBy: 'MultiDocumentWorkflowReasoningEngine',
        timestamp: new Date().toISOString()
      }
    };
  }
  
  updateGraph(entities: WorkflowEntity[], relationships: WorkflowRelationship[]): void {
    entities.forEach(e => this.graph.entities.set(e.id, e));
    relationships.forEach(r => this.graph.relationships.set(r.id, r));
    this.updateGraphStatistics();
    this.analysisCache.clear();
  }
  
  getEntityInsights(entityId: string): string[] {
    const entity = this.graph.entities.get(entityId);
    if (!entity) return [];
    
    const relationships = this.getEntityRelationships(entityId);
    return this.generateEntityInsights(entity, relationships);
  }
  
  // Private helper methods
  
  private getEntitiesForAnalysis(request: WorkflowAnalysisRequest): WorkflowEntity[] {
    return request.entityIds
      .map(id => this.graph.entities.get(id))
      .filter((e): e is WorkflowEntity => e !== undefined);
  }
  
  private getRelationshipsForEntities(entities: WorkflowEntity[]): WorkflowRelationship[] {
    const entityIds = new Set(entities.map(e => e.id));
    return Array.from(this.graph.relationships.values()).filter(rel =>
      entityIds.has(rel.sourceId) || entityIds.has(rel.targetId)
    );
  }
  
  private getEntityRelationships(entityId: string): WorkflowRelationship[] {
    return Array.from(this.graph.relationships.values()).filter(rel =>
      rel.sourceId === entityId || rel.targetId === entityId
    );
  }
  
  private calculateAverageComplexity(entities: WorkflowEntity[]): number {
    if (entities.length === 0) return 0;
    const total = entities.reduce((sum, e) => sum + this.calculateEntityComplexity(e), 0);
    return total / entities.length;
  }
  
  private calculateEntityComplexity(entity: WorkflowEntity): number {
    let score = 0;
    if (entity.content) score += Math.min(entity.content.length / 1000, 0.3);
    score += Math.min(entity.childIds.length / 10, 0.3);
    score += Math.min(entity.tags.length / 5, 0.2);
    if (entity.priority) score += entity.priority * 0.05;
    return Math.min(score, 1);
  }
  
  private generateEntitySummaries(entities: WorkflowEntity[]): EntitySummary[] {
    return entities.map(entity => ({
      entityId: entity.id,
      entityType: entity.type,
      summary: `${entity.type}: ${entity.title}`,
      keyAttributes: {
        title: entity.title,
        status: entity.status,
        priority: entity.priority,
        tags: entity.tags
      },
      statusAssessment: this.assessEntityStatus(entity),
      complexityScore: this.calculateEntityComplexity(entity),
      importanceScore: this.calculateEntityImportance(entity)
    }));
  }
  
  private assessEntityStatus(entity: WorkflowEntity): EntitySummary['statusAssessment'] {
    if (entity.status === 'completed' || entity.status === 'done') return 'healthy';
    if (entity.dueDate && new Date(entity.dueDate) < new Date()) return 'critical';
    if (entity.priority && entity.priority >= 4) return 'warning';
    return 'unknown';
  }
  
  private calculateEntityImportance(entity: WorkflowEntity): number {
    let score = 0;
    if (entity.priority) score += (6 - entity.priority) * 0.15;
    score += Math.min(this.getEntityRelationships(entity.id).length / 5, 0.3);
    if (entity.type === 'project') score += 0.2;
    return Math.min(score, 1);
  }
  
  private generateEntityRelationships(relationships: WorkflowRelationship[]): EntityRelationship[] {
    return relationships.map(rel => ({
      relationshipId: rel.id,
      sourceId: rel.sourceId,
      targetId: rel.targetId,
      relationshipType: rel.type,
      strength: rel.strength,
      direction: rel.bidirectional ? 'bidirectional' : 'forward',
      evidence: rel.evidence || [],
      confidence: rel.confidence
    }));
  }
  
  private detectEntityIssues(entities: WorkflowEntity[], relationships: WorkflowRelationship[]): EntityIssue[] {
    const issues: EntityIssue[] = [];
    
    entities.forEach(entity => {
      // Check for missing due dates on high priority tasks
      if (entity.type === 'task' && entity.priority && entity.priority <= 2 && !entity.dueDate) {
        issues.push({
          type: 'missing-information',
          description: `High priority task "${entity.title}" has no due date`,
          entityId: entity.id,
          severity: 'medium',
          impact: 'moderate',
          suggestedFix: 'Add a due date to ensure timely completion',
          priority: 3
        });
      }
      
      // Check for outdated entities
      const daysSinceUpdate = (Date.now() - entity.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate > 90) {
        issues.push({
          type: 'outdated',
          description: `Entity "${entity.title}" hasn't been updated in ${Math.floor(daysSinceUpdate)} days`,
          entityId: entity.id,
          severity: 'low',
          impact: 'minor',
          suggestedFix: 'Review and update the entity',
          priority: 4
        });
      }
      
      // Check for isolated entities
      const entityRels = relationships.filter(r => r.sourceId === entity.id || r.targetId === entity.id);
      if (entityRels.length === 0 && entities.length > 1) {
        issues.push({
          type: 'orphaned',
          description: `Entity "${entity.title}" is not connected to any other entities`,
          entityId: entity.id,
          severity: 'low',
          impact: 'minor',
          suggestedFix: 'Add relationships to connect with other entities',
          priority: 4
        });
      }
    });
    
    return issues;
  }
  
  private detectEntityOpportunities(entities: WorkflowEntity[], relationships: WorkflowRelationship[]): EntityOpportunity[] {
    const opportunities: EntityOpportunity[] = [];
    
    entities.forEach(entity => {
      // Check for automation opportunities
      if (entity.type === 'task' && entity.content && entity.content.includes('manual')) {
        opportunities.push({
          type: 'automation',
          description: `Task "${entity.title}" appears to be manual and could be automated`,
          entityId: entity.id,
          potentialBenefit: 'moderate',
          effortRequired: 'medium',
          implementationComplexity: 'medium',
          expectedROI: 150
        });
      }
      
      // Check for content expansion opportunities
      if (entity.type === 'document' && (!entity.content || entity.content.length < 200)) {
        opportunities.push({
          type: 'enhancement',
          description: `Document "${entity.title}" has minimal content and could be expanded`,
          entityId: entity.id,
          potentialBenefit: 'minor',
          effortRequired: 'low',
          implementationComplexity: 'low',
          expectedROI: 80
        });
      }
    });
    
    return opportunities;
  }
  
  private detectWorkflowPatterns(entities: WorkflowEntity[], relationships: WorkflowRelationship[]): WorkflowPattern[] {
    const patterns: WorkflowPattern[] = [];
    
    // Detect linear patterns (A -> B -> C)
    const linearChains = this.detectLinearChains(relationships);
    if (linearChains.length > 0) {
      patterns.push({
        type: 'linear',
        description: `Found ${linearChains.length} linear chains in the workflow`,
        entityIds: linearChains.flat(),
        strength: 0.7,
        efficiency: 'efficient',
        optimizationRecommendations: ['Consider parallelizing some steps for faster execution']
      });
    }
    
    return patterns;
  }
  
  private detectLinearChains(relationships: WorkflowRelationship[]): string[][] {
    const chains: string[][] = [];
    const dependsOnRels = relationships.filter(r => r.type === 'depends_on');
    
    // Simple chain detection
    const visited = new Set<string>();
    
    dependsOnRels.forEach(rel => {
      if (!visited.has(rel.sourceId) && !visited.has(rel.targetId)) {
        const chain = [rel.sourceId, rel.targetId];
        visited.add(rel.sourceId);
        visited.add(rel.targetId);
        chains.push(chain);
      }
    });
    
    return chains;
  }
  
  private detectWorkflowBottlenecks(entities: WorkflowEntity[], relationships: WorkflowRelationship[]): WorkflowBottleneck[] {
    const bottlenecks: WorkflowBottleneck[] = [];
    
    // Find entities with many dependencies
    entities.forEach(entity => {
      const incoming = relationships.filter(r => r.targetId === entity.id && r.type === 'depends_on');
      if (incoming.length > 3) {
        bottlenecks.push({
          type: 'dependency-wait',
          description: `Entity "${entity.title}" has ${incoming.length} dependencies, creating a bottleneck`,
          location: [entity.id],
          impact: 'moderate',
          rootCause: 'Too many dependencies on a single entity',
          suggestedResolution: 'Break down the entity or parallelize dependencies',
          estimatedResolutionTime: 'days'
        });
      }
    });
    
    return bottlenecks;
  }
  
  private detectWorkflowEfficiencies(entities: WorkflowEntity[], relationships: WorkflowRelationship[]): WorkflowEfficiency[] {
    const efficiencies: WorkflowEfficiency[] = [];
    
    // Find well-structured entities
    entities.forEach(entity => {
      if (entity.type === 'project' && entity.childIds.length > 5) {
        efficiencies.push({
          type: 'standardization',
          description: `Project "${entity.title}" is well-structured with ${entity.childIds.length} child entities`,
          location: [entity.id],
          efficiencyScore: 0.8,
          bestPractices: ['Clear hierarchy', 'Organized child entities'],
          replicationPotential: 'high'
        });
      }
    });
    
    return efficiencies;
  }
  
  private detectWorkflowRisks(entities: WorkflowEntity[], relationships: WorkflowRelationship[]): WorkflowRisk[] {
    const risks: WorkflowRisk[] = [];
    
    // Find single points of failure
    entities.forEach(entity => {
      const outgoing = relationships.filter(r => r.sourceId === entity.id && r.type === 'depends_on');
      if (outgoing.length > 5) {
        risks.push({
          type: 'single-point-of-failure',
          description: `Entity "${entity.title}" is a critical dependency for ${outgoing.length} other entities`,
          location: [entity.id],
          likelihood: 'possible',
          impact: 'major',
          riskLevel: 'high',
          mitigationStrategies: ['Create backups', 'Document procedures', 'Train multiple people']
        });
      }
    });
    
    return risks;
  }
  
  private generateKeyInsights(entities: WorkflowEntity[], relationships: WorkflowRelationship[]): KeyInsight[] {
    const insights: KeyInsight[] = [];
    
    if (entities.length > 0) {
      insights.push({
        type: 'pattern-recognition',
        insight: `Analyzed ${entities.length} entities with ${relationships.length} relationships`,
        evidence: ['Entity count', 'Relationship count'],
        confidence: 1.0,
        impact: 'medium',
        actionability: 'actionable'
      });
    }
    
    const completed = entities.filter(e => e.status === 'completed' || e.status === 'done');
    if (completed.length > 0) {
      insights.push({
        type: 'trend-identification',
        insight: `${completed.length} of ${entities.length} entities (${Math.round(completed.length / entities.length * 100)}%) are completed`,
        evidence: ['Completion status analysis'],
        confidence: 0.9,
        impact: 'low',
        actionability: 'theoretical'
      });
    }
    
    return insights;
  }
  
  private generateStrategicRecommendations(entities: WorkflowEntity[], relationships: WorkflowRelationship[]): StrategicRecommendation[] {
    const recommendations: StrategicRecommendation[] = [];
    
    if (entities.length > 10) {
      recommendations.push({
        type: 'process-redesign',
        recommendation: 'Consider implementing a more structured workflow management system',
        rationale: 'Large number of entities suggests need for better organization',
        expectedBenefits: ['Improved efficiency', 'Better tracking', 'Reduced errors'],
        implementationTimeline: 'medium-term',
        resourceRequirements: 'medium',
        riskAssessment: 'low'
      });
    }
    
    return recommendations;
  }
  
  private generateTacticalRecommendations(entities: WorkflowEntity[], relationships: WorkflowRelationship[]): TacticalRecommendation[] {
    const recommendations: TacticalRecommendation[] = [];
    
    entities.forEach(entity => {
      if (entity.type === 'task' && !entity.dueDate) {
        recommendations.push({
          type: 'process-adjustment',
          recommendation: `Add a due date to task "${entity.title}"`,
          specificAction: 'Set due date in task properties',
          priority: 'medium',
          estimatedEffort: 'minutes'
        });
      }
      
      if (entity.type === 'document' && (!entity.content || entity.content.length < 100)) {
        recommendations.push({
          type: 'quality-check',
          recommendation: `Expand content for document "${entity.title}"`,
          specificAction: 'Add more detailed content',
          priority: 'low',
          estimatedEffort: 'hours'
        });
      }
    });
    
    return recommendations;
  }
  
  private generatePredictiveInsights(entities: WorkflowEntity[], relationships: WorkflowRelationship[]): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];
    
    if (entities.length > 5) {
      insights.push({
        type: 'outcome-prediction',
        prediction: 'Workflow analysis will identify 2-3 key optimization opportunities',
        confidence: 0.7,
        timeHorizon: 'immediate',
        keyFactors: ['Entity count', 'Relationship complexity'],
        alternativeScenarios: ['Minimal improvements identified', 'Major restructuring needed']
      });
    }
    
    return insights;
  }
  
  private generateNextActionPredictions(entities: WorkflowEntity[], relationships: WorkflowRelationship[]): NextActionPrediction[] {
    return entities.slice(0, 3).map(entity => ({
      action: `Review ${entity.type}: ${entity.title}`,
      entityId: entity.id,
      confidence: 0.6,
      expectedValue: 'medium',
      estimatedTimeMinutes: 15,
      dependencies: [],
      alternatives: []
    }));
  }
  
  private generateOutcomePredictions(entities: WorkflowEntity[], relationships: WorkflowRelationship[]): OutcomePrediction[] {
    return [{
      outcome: 'Improved workflow efficiency through identified optimizations',
      probability: 0.8,
      impact: 'positive',
      timeframe: 'short-term',
      keyDrivers: ['Analysis quality', 'Implementation follow-through']
    }];
  }
  
  private generateRiskPredictions(entities: WorkflowEntity[], relationships: WorkflowRelationship[]): RiskPrediction[] {
    return [{
      risk: 'Analysis may overlook subtle workflow dependencies',
      likelihood: 0.3,
      impact: 'medium',
      riskLevel: 'medium',
      timeframe: 'short-term',
      earlyWarningSigns: ['Incomplete entity data', 'Missing relationship types'],
      mitigationStrategies: ['Manual review of critical paths', 'Cross-validation with users']
    }];
  }
  
  private generateTimelinePredictions(entities: WorkflowEntity[], relationships: WorkflowRelationship[]): TimelinePrediction[] {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return [{
      event: 'Workflow optimization implementation',
      predictedDate: nextWeek,
      confidenceInterval: {
        earliest: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        latest: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
      },
      confidence: 0.6,
      keyDependencies: ['Stakeholder approval', 'Resource availability']
    }];
  }
  
  private calculateHealthScore(entities: WorkflowEntity[], relationships: WorkflowRelationship[]): number {
    if (entities.length === 0) return 0;
    
    let score = 50; // Base score
    
    // Completed entities increase score
    const completed = entities.filter(e => e.status === 'completed' || e.status === 'done');
    score += (completed.length / entities.length) * 30;
    
    // Entities with due dates increase score
    const withDueDates = entities.filter(e => e.dueDate);
    score += (withDueDates.length / entities.length) * 10;
    
    // Connected entities increase score
    const connected = entities.filter(e => {
      const rels = relationships.filter(r => r.sourceId === e.id || r.targetId === e.id);
      return rels.length > 0;
    });
    score += (connected.length / entities.length) * 10;
    
    return Math.min(score, 100);
  }
  
  private assessMaturityLevel(entities: WorkflowEntity[], relationships: WorkflowRelationship[]): WorkflowAnalysisResult['assessment']['maturityLevel'] {
    if (entities.length === 0) return 'initial';
    
    const hasStructure = entities.some(e => e.type === 'project');
    const hasTracking = entities.some(e => e.dueDate || e.priority);
    const hasRelationships = relationships.length > 0;
    
    if (hasStructure && hasTracking && hasRelationships) return 'managed';
    if (hasTracking || hasRelationships) return 'defined';
    if (entities.length > 1) return 'developing';
    return 'initial';
  }
  
  private identifyStrengths(entities: WorkflowEntity[], relationships: WorkflowRelationship[]): string[] {
    const strengths: string[] = [];
    
    if (entities.length > 0) strengths.push('Workflow has defined entities');
    if (relationships.length > 0) strengths.push('Entities are connected through relationships');
    
    const completed = entities.filter(e => e.status === 'completed' || e.status === 'done');
    if (completed.length > 0) strengths.push('Some entities are already completed');
    
    return strengths;
  }
  
  private identifyAreasForImprovement(entities: WorkflowEntity[], relationships: WorkflowRelationship[]): string[] {
    const areas: string[] = [];
    
    const noDueDate = entities.filter(e => !e.dueDate && e.type === 'task');
    if (noDueDate.length > 0) areas.push('Tasks without due dates');
    
    const isolated = entities.filter(e => {
      const rels = relationships.filter(r => r.sourceId === e.id || r.targetId === e.id);
      return rels.length === 0;
    });
    if (isolated.length > 0) areas.push('Isolated entities not connected to workflow');
    
    const outdated = entities.filter(e => {
      const daysSinceUpdate = (Date.now() - e.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate > 30;
    });
    if (outdated.length > 0) areas.push('Outdated entities needing review');
    
    return areas;
  }
  
  private determineImprovementUrgency(entities: WorkflowEntity[], relationships: WorkflowRelationship[]): WorkflowAnalysisResult['assessment']['improvementUrgency'] {
    const overdue = entities.filter(e => e.dueDate && new Date(e.dueDate) < new Date());
    const highPriority = entities.filter(e => e.priority && e.priority <= 2);
    
    if (overdue.length > 0 || highPriority.length > 3) return 'high';
    if (entities.length > 10 && relationships.length === 0) return 'medium';
    return 'low';
  }
  
  private calculateAnalysisConfidence(entities: WorkflowEntity[], relationships: WorkflowRelationship[]): number {
    if (entities.length === 0) return 0;
    
    let confidence = 0.5;
    confidence += Math.min(entities.length / 20, 0.3);
    confidence += Math.min(relationships.length / 10, 0.2);
    
    const withContent = entities.filter(e => e.content && e.content.length > 50);
    confidence += (withContent.length / entities.length) * 0.1;
    
    return Math.min(confidence, 1);
  }
  
  private analyzeEntityConnections(entities: WorkflowEntity[]): CrossPageAnalysis['connections'] {
    const connections: CrossPageAnalysis['connections'] = [];
    
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const source = entities[i];
        const target = entities[j];
        
        // Find existing relationships
        const existingRels = Array.from(this.graph.relationships.values()).filter(rel =>
          (rel.sourceId === source.id && rel.targetId === target.id) ||
          (rel.bidirectional && rel.sourceId === target.id && rel.targetId === source.id)
        );
        
        for (const rel of existingRels) {
          connections.push({
            sourceId: source.id,
            targetId: target.id,
            connectionType: rel.type,
            strength: rel.strength,
            evidence: rel.evidence || []
          });
        }
      }
    }
    
    return connections;
  }
  
  private generateCrossPageInsights(entities: WorkflowEntity[], connections: CrossPageAnalysis['connections']): string[] {
    const insights: string[] = [];
    
    if (entities.length > 0) {
      insights.push(`Analyzed ${entities.length} entities across pages`);
    }
    
    if (connections.length > 0) {
      insights.push(`Found ${connections.length} connections between entities`);
    }
    
    const typeCounts = new Map<string, number>();
    entities.forEach(e => typeCounts.set(e.type, (typeCounts.get(e.type) || 0) + 1));
    
    if (typeCounts.size > 1) {
      const types = Array.from(typeCounts.entries()).map(([t, c]) => `${t}: ${c}`).join(', ');
      insights.push(`Entity types: ${types}`);
    }
    
    return insights;
  }
  
  private generateCrossPageRecommendations(entities: WorkflowEntity[], insights: string[]): string[] {
    const recommendations: string[] = [];
    
    if (entities.length > 5) {
      recommendations.push('Consider creating a project to group related entities');
    }
    
    const noContent = entities.filter(e => !e.content || e.content.trim() === '');
    if (noContent.length > 0) {
      recommendations.push(`Add content to ${noContent.length} empty entities`);
    }
    
    return recommendations;
  }
  
  private calculateCrossPageConfidence(entities: WorkflowEntity[], connections: CrossPageAnalysis['connections']): number {
    if (entities.length === 0) return 0;
    
    let confidence = 0.6;
    confidence += Math.min(entities.length / 10, 0.2);
    confidence += Math.min(connections.length / 5, 0.2);
    
    return Math.min(confidence, 1);
  }
  
  private generateEntityPredictions(entity: WorkflowEntity): WorkflowPrediction[] {
    const predictions: WorkflowPrediction[] = [];
    
    predictions.push({
      id: `pred-${Date.now()}`,
      predictedAction: `Review ${entity.type}: ${entity.title}`,
      confidence: 0.7,
      evidence: [`${entity.type} needs periodic review`],
      expectedImpact: 'medium',
      priorityRecommendation: entity.priority || 3,
      alternatives: [],
      timestamp: new Date()
    });
    
    if (entity.type === 'task' && entity.status !== 'completed' && entity.status !== 'done') {
      predictions.push({
        id: `pred-${Date.now()}-1`,
        predictedAction: `Work on task: ${entity.title}`,
        confidence: 0.8,
        evidence: ['Task is pending completion'],
        expectedImpact: 'high',
        priorityRecommendation: entity.priority || 3,
        alternatives: [],
        timestamp: new Date()
      });
    }
    
    return predictions;
  }
  
  private determineAvailableOperations(modeType: string, entityIds: string[]): string[] {
    const operations = ['view', 'edit', 'delete'];
    
    switch (modeType) {
      case 'chat':
        operations.push('ask', 'summarize', 'extract');
        break;
      case 'edit':
        operations.push('format', 'restructure', 'add');
        break;
      case 'review':
        operations.push('approve', 'comment', 'suggest');
        break;
      case 'plan':
        operations.push('schedule', 'prioritize', 'delegate');
        break;
      case 'execute':
        operations.push('start', 'pause', 'complete');
        break;
    }
    
    return operations;
  }
  
  private updateGraphStatistics(): void {
    const entityCount = this.graph.entities.size;
    const relationshipCount = this.graph.relationships.size;
    
    this.graph.statistics = {
      entityCount,
      relationshipCount,
      averageDegree: relationshipCount > 0 ? (2 * relationshipCount) / entityCount : 0,
      density: entityCount > 1 ? relationshipCount / (entityCount * (entityCount - 1)) : 0,
      connectedComponents: 1 // Simplified
    };
    
    this.graph.updatedAt = new Date();
  }
  
  private generateEntityInsights(entity: WorkflowEntity, relationships: WorkflowRelationship[]): string[] {
    const insights: string[] = [];
    
    if (!entity.content || entity.content.trim().length < 50) {
      insights.push('Entity has minimal content');
    }
    
    if (entity.tags.length === 0) {
      insights.push('Entity has no tags for categorization');
    }
    
    if (relationships.length === 0) {
      insights.push('Entity is not connected to other entities');
    } else {
      insights.push(`Entity has ${relationships.length} relationships`);
    }
    
    return insights;
  }
}
