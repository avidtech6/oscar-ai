/**
 * Phase 25: Workflow Intelligence Layer
 * Cross‑Page Intelligence Engine
 * 
 * Analyzes connections between entities across different pages/documents:
 * 1. Notes → Tasks → Reports → Blog posts
 * 2. Cross‑document relationships and dependencies
 * 3. Content flow and transformation patterns
 * 4. Multi‑page workflow intelligence
 */

import type {
  WorkflowEntity,
  WorkflowRelationship,
  WorkflowGraph,
  WorkflowContext,
  WorkflowEntityType
} from './types';

/**
 * Cross‑Page Analysis Types
 */

interface CrossPageAnalysis {
  sourceEntity: WorkflowEntity;
  targetEntity: WorkflowEntity;
  connectionStrength: number;
  relationshipTypes: string[];
  evidence: string[];
  transformationPattern?: string;
  confidence: number;
}

interface ContentFlowAnalysis {
  sourceType: WorkflowEntityType;
  targetType: WorkflowEntityType;
  commonPatterns: string[];
  transformationRules: Array<{
    sourcePattern: string;
    targetPattern: string;
    confidence: number;
  }>;
  flowStrength: number;
}

interface MultiPageWorkflow {
  pages: WorkflowEntity[];
  connections: WorkflowRelationship[];
  flowPattern: string;
  completeness: number;
  bottlenecks: string[];
  opportunities: string[];
}

/**
 * Cross‑Page Intelligence Engine
 * 
 * Analyzes how content flows between different types of pages/documents
 * and identifies intelligent connections, transformations, and workflow patterns.
 */
export class CrossPageIntelligenceEngine {
  private graph: WorkflowGraph;
  
  constructor(graph: WorkflowGraph) {
    this.graph = graph;
  }
  
  /**
   * Analyze connections between two specific entities across pages
   */
  async analyzeCrossPageConnection(
    sourceEntityId: string,
    targetEntityId: string
  ): Promise<CrossPageAnalysis> {
    const sourceEntity = this.graph.entities.get(sourceEntityId);
    const targetEntity = this.graph.entities.get(targetEntityId);
    
    if (!sourceEntity || !targetEntity) {
      throw new Error('Source or target entity not found');
    }
    
    // Find direct relationships
    const directRelationships = Array.from(this.graph.relationships.values())
      .filter(rel => 
        (rel.sourceId === sourceEntityId && rel.targetId === targetEntityId) ||
        (rel.sourceId === targetEntityId && rel.targetId === sourceEntityId)
      );
    
    // Find indirect relationships (through other entities)
    const indirectRelationships = this.findIndirectRelationships(sourceEntityId, targetEntityId);
    
    // Analyze content similarity
    const contentSimilarity = this.analyzeContentSimilarity(sourceEntity, targetEntity);
    
    // Analyze transformation patterns
    const transformationPattern = this.analyzeTransformationPattern(sourceEntity, targetEntity);
    
    // Calculate connection strength
    const connectionStrength = this.calculateConnectionStrength(
      directRelationships,
      indirectRelationships,
      contentSimilarity
    );
    
    // Collect evidence
    const evidence = this.collectEvidence(
      sourceEntity,
      targetEntity,
      directRelationships,
      indirectRelationships
    );
    
    return {
      sourceEntity,
      targetEntity,
      connectionStrength,
      relationshipTypes: [...new Set(directRelationships.map(r => r.type))],
      evidence,
      transformationPattern,
      confidence: Math.min(connectionStrength * 0.8 + contentSimilarity * 0.2, 1)
    };
  }
  
  /**
   * Analyze content flow between different entity types
   */
  async analyzeContentFlow(
    sourceType: WorkflowEntityType,
    targetType: WorkflowEntityType
  ): Promise<ContentFlowAnalysis> {
    // Get all entities of source and target types
    const sourceEntities = Array.from(this.graph.entities.values())
      .filter(e => e.type === sourceType);
    const targetEntities = Array.from(this.graph.entities.values())
      .filter(e => e.type === targetType);
    
    if (sourceEntities.length === 0 || targetEntities.length === 0) {
      throw new Error(`Insufficient entities of types ${sourceType} → ${targetType}`);
    }
    
    // Find relationships between these types
    const relationships = Array.from(this.graph.relationships.values())
      .filter(rel => {
        const source = this.graph.entities.get(rel.sourceId);
        const target = this.graph.entities.get(rel.targetId);
        return source?.type === sourceType && target?.type === targetType;
      });
    
    // Analyze common patterns
    const commonPatterns = this.analyzeCommonPatterns(sourceEntities, targetEntities, relationships);
    
    // Analyze transformation rules
    const transformationRules = this.analyzeTransformationRules(sourceEntities, targetEntities);
    
    // Calculate flow strength
    const flowStrength = this.calculateFlowStrength(relationships, sourceEntities.length, targetEntities.length);
    
    return {
      sourceType,
      targetType,
      commonPatterns,
      transformationRules,
      flowStrength
    };
  }
  
  /**
   * Analyze multi‑page workflow patterns
   */
  async analyzeMultiPageWorkflow(
    pageIds: string[]
  ): Promise<MultiPageWorkflow> {
    const pages = pageIds
      .map(id => this.graph.entities.get(id))
      .filter((page): page is WorkflowEntity => page !== undefined);
    
    if (pages.length < 2) {
      throw new Error('At least 2 pages required for multi‑page analysis');
    }
    
    // Find connections between pages
    const connections = Array.from(this.graph.relationships.values())
      .filter(rel => 
        pageIds.includes(rel.sourceId) && pageIds.includes(rel.targetId)
      );
    
    // Analyze flow pattern
    const flowPattern = this.analyzeFlowPattern(pages, connections);
    
    // Calculate completeness
    const completeness = this.calculateWorkflowCompleteness(pages, connections);
    
    // Identify bottlenecks
    const bottlenecks = this.identifyBottlenecks(pages, connections);
    
    // Identify opportunities
    const opportunities = this.identifyOpportunities(pages, connections);
    
    return {
      pages,
      connections,
      flowPattern,
      completeness,
      bottlenecks,
      opportunities
    };
  }
  
  /**
   * Generate intelligent connections between notes, tasks, reports, and blog posts
   */
  async generateIntelligentConnections(
    sourceEntityIds: string[],
    targetType: WorkflowEntityType,
    options?: {
      maxConnections?: number;
      minConfidence?: number;
      includeIndirect?: boolean;
    }
  ): Promise<Array<{
    sourceEntity: WorkflowEntity;
    targetEntity: WorkflowEntity;
    relationshipType: string;
    strength: number;
    confidence: number;
    evidence: string[];
  }>> {
    const sourceEntities = sourceEntityIds
      .map(id => this.graph.entities.get(id))
      .filter((entity): entity is WorkflowEntity => entity !== undefined);
    
    const targetEntities = Array.from(this.graph.entities.values())
      .filter(e => e.type === targetType);
    
    if (sourceEntities.length === 0 || targetEntities.length === 0) {
      throw new Error('No valid source or target entities found');
    }
    
    const connections: Array<{
      sourceEntity: WorkflowEntity;
      targetEntity: WorkflowEntity;
      relationshipType: string;
      strength: number;
      confidence: number;
      evidence: string[];
    }> = [];
    
    // Generate connections between source and target entities
    for (const source of sourceEntities) {
      for (const target of targetEntities) {
        // Skip self-connections
        if (source.id === target.id) continue;
        
        // Analyze potential connection
        const analysis = await this.analyzeCrossPageConnection(source.id, target.id);
        
        if (analysis.confidence >= (options?.minConfidence || 0.3)) {
          // Determine relationship type based on entity types
          const relationshipType = this.determineRelationshipType(source.type, target.type);
          
          connections.push({
            sourceEntity: source,
            targetEntity: target,
            relationshipType,
            strength: analysis.connectionStrength,
            confidence: analysis.confidence,
            evidence: analysis.evidence.slice(0, 3) // Limit to top 3 evidence items
          });
        }
      }
    }
    
    // Sort by confidence and limit results
    return connections
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, options?.maxConnections || 10);
  }
  
  /**
   * Predict next logical page/document based on current workflow
   */
  async predictNextPage(
    currentEntityIds: string[],
    options?: {
      preferredType?: WorkflowEntityType;
      includeRelated?: boolean;
      depth?: number;
    }
  ): Promise<Array<{
    entity: WorkflowEntity;
    type: WorkflowEntityType;
    confidence: number;
    reasoning: string[];
  }>> {
    const currentEntities = currentEntityIds
      .map(id => this.graph.entities.get(id))
      .filter((entity): entity is WorkflowEntity => entity !== undefined);
    
    if (currentEntities.length === 0) {
      throw new Error('No valid current entities found');
    }
    
    const predictions: Array<{
      entity: WorkflowEntity;
      type: WorkflowEntityType;
      confidence: number;
      reasoning: string[];
    }> = [];
    
    // Find related entities
    const relatedEntities = this.findRelatedEntities(currentEntities, options?.depth || 2);
    
    // Filter by preferred type if specified
    const filteredEntities = options?.preferredType
      ? relatedEntities.filter(e => e.type === options.preferredType)
      : relatedEntities;
    
    // Generate predictions for each entity
    for (const entity of filteredEntities) {
      // Skip current entities
      if (currentEntityIds.includes(entity.id)) continue;
      
      // Calculate prediction confidence
      const confidence = this.calculatePredictionConfidence(currentEntities, entity);
      
      // Generate reasoning
      const reasoning = this.generatePredictionReasoning(currentEntities, entity);
      
      predictions.push({
        entity,
        type: entity.type,
        confidence,
        reasoning
      });
    }
    
    // Sort by confidence and return top predictions
    return predictions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }
  
  /**
   * Private helper methods
   */
  
  private findIndirectRelationships(sourceId: string, targetId: string): WorkflowRelationship[] {
    const indirectRelationships: WorkflowRelationship[] = [];
    const visited = new Set<string>();
    const queue: Array<{ entityId: string; path: WorkflowRelationship[] }> = [
      { entityId: sourceId, path: [] }
    ];
    
    // Breadth‑first search for indirect paths (max depth 3)
    while (queue.length > 0 && indirectRelationships.length < 10) {
      const current = queue.shift()!;
      
      if (visited.has(current.entityId)) continue;
      visited.add(current.entityId);
      
      // Find relationships from current entity
      const relationships = Array.from(this.graph.relationships.values())
        .filter(rel => rel.sourceId === current.entityId);
      
      for (const rel of relationships) {
        const newPath = [...current.path, rel];
        
        if (rel.targetId === targetId) {
          // Found a path to target
          indirectRelationships.push(...newPath);
        } else if (newPath.length < 3) {
          // Continue searching
          queue.push({ entityId: rel.targetId, path: newPath });
        }
      }
    }
    
    return indirectRelationships;
  }
  
  private analyzeContentSimilarity(entity1: WorkflowEntity, entity2: WorkflowEntity): number {
    let similarity = 0;
    
    // Compare titles
    if (entity1.title && entity2.title) {
      const titleWords1 = new Set(entity1.title.toLowerCase().split(/\W+/));
      const titleWords2 = new Set(entity2.title.toLowerCase().split(/\W+/));
      const commonTitleWords = Array.from(titleWords1).filter(word => titleWords2.has(word));
      
      similarity += (commonTitleWords.length / Math.max(titleWords1.size, titleWords2.size)) * 0.3;
    }
    
    // Compare tags
    const tags1 = new Set(entity1.tags || []);
    const tags2 = new Set(entity2.tags || []);
    const commonTags = Array.from(tags1).filter(tag => tags2.has(tag));
    
    similarity += (commonTags.length / Math.max(tags1.size, tags2.size, 1)) * 0.3;
    
    // Compare content (if available)
    if (entity1.content && entity2.content) {
      const contentWords1 = new Set(entity1.content.toLowerCase().split(/\W+/).filter(w => w.length > 3));
      const contentWords2 = new Set(entity2.content.toLowerCase().split(/\W+/).filter(w => w.length > 3));
      const commonContentWords = Array.from(contentWords1).filter(word => contentWords2.has(word));
      
      similarity += (commonContentWords.length / Math.max(contentWords1.size, contentWords2.size, 1)) * 0.4;
    }
    
    return Math.min(similarity, 1);
  }
  
  private analyzeTransformationPattern(sourceEntity: WorkflowEntity, targetEntity: WorkflowEntity): string | undefined {
    const sourceType = sourceEntity.type;
    const targetType = targetEntity.type;
    
    // Common transformation patterns
    const patterns: Record<string, Record<string, string>> = {
      note: {
        task: 'Note → Task: Action item extraction',
        document: 'Note → Document: Formal documentation',
        media: 'Note → Media: Visual reference'
      },
      task: {
        document: 'Task → Document: Progress documentation',
        media: 'Task → Media: Evidence collection',
        note: 'Task → Note: Reflection'
      },
      document: {
        media: 'Document → Media: Illustration',
        task: 'Document → Task: Follow‑up actions',
        note: 'Document → Note: Key takeaways'
      },
      media: {
        document: 'Media → Document: Analysis',
        task: 'Media → Task: Implementation',
        note: 'Media → Note: Inspiration'
      }
    };
    
    return patterns[sourceType]?.[targetType];
  }
  
  private calculateConnectionStrength(
    directRelationships: WorkflowRelationship[],
    indirectRelationships: WorkflowRelationship[],
    contentSimilarity: number
  ): number {
    let strength = 0;
    
    // Direct relationships contribute most
    strength += Math.min(directRelationships.length * 0.3, 0.6);
    
    // Indirect relationships contribute less
    strength += Math.min(indirectRelationships.length * 0.1, 0.2);
    
    // Content similarity contributes
    strength += contentSimilarity * 0.2;
    
    return Math.min(strength, 1);
  }
  
  private collectEvidence(
    sourceEntity: WorkflowEntity,
    targetEntity: WorkflowEntity,
    directRelationships: WorkflowRelationship[],
    indirectRelationships: WorkflowRelationship[]
  ): string[] {
    const evidence: string[] = [];
    
    // Direct relationship evidence
    if (directRelationships.length > 0) {
      evidence.push(`${directRelationships.length} direct relationship(s)`);
    }
    
    // Indirect relationship evidence
    if (indirectRelationships.length > 0) {
      evidence.push(`${indirectRelationships.length} indirect relationship(s) through ${new Set(indirectRelationships.map(r => r.type)).size} type(s)`);
    }
    
    // Content similarity evidence
    const similarity = this.analyzeContentSimilarity(sourceEntity, targetEntity);
    if (similarity > 0.3) {
      evidence.push(`Content similarity: ${Math.round(similarity * 100)}%`);
    }
    
    // Tag overlap evidence
    const tags1 = new Set(sourceEntity.tags || []);
    const tags2 = new Set(targetEntity.tags || []);
    const commonTags = Array.from(tags1).filter(tag => tags2.has(tag));
    if (commonTags.length > 0) {
      evidence.push(`Shared tags: ${commonTags.join(', ')}`);
    }
    
    // Project context evidence
    if (sourceEntity.projectId && targetEntity.projectId && sourceEntity.projectId === targetEntity.projectId) {
      evidence.push('Same project context');
    }
    
    return evidence;
  }
  
  private analyzeCommonPatterns(
    sourceEntities: WorkflowEntity[],
    targetEntities: WorkflowEntity[],
    relationships: WorkflowRelationship[]
  ): string[] {
    const patterns: string[] = [];
    
    // Analyze relationship types
    const relationshipTypes = new Set(relationships.map(r => r.type));
    if (relationshipTypes.size > 0) {
      patterns.push(`Common relationship types: ${Array.from(relationshipTypes).join(', ')}`);
    }
    
    // Analyze temporal patterns
    const timeDiffs: number[] = [];
    for (const rel of relationships) {
      const source = this.graph.entities.get(rel.sourceId);
      const target = this.graph.entities.get(rel.targetId);
      if (source?.createdAt && target?.createdAt) {
        const diff = target.createdAt.getTime() - source.createdAt.getTime();
        timeDiffs.push(diff);
      }
    }
    
    if (timeDiffs.length > 0) {
      const avgDiff = timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length;
      const avgDays = Math.round(avgDiff / (1000 * 60 * 60 * 24));
      patterns.push(`Average time between creation: ${avgDays} days`);
    }
    
    // Analyze content patterns
    const contentPatterns = this.analyzeContentPatterns(sourceEntities, targetEntities);
    patterns.push(...contentPatterns);
    
    return patterns;
  }
  
  private analyzeTransformationRules(
    sourceEntities: WorkflowEntity[],
    targetEntities: WorkflowEntity[]
  ): Array<{ sourcePattern: string; targetPattern: string; confidence: number }> {
    const rules: Array<{ sourcePattern: string; targetPattern: string; confidence: number }> = [];
    
    // Common transformation patterns based on entity types
    const typePatterns = [
      { sourcePattern: 'note with action items', targetPattern: 'task list', confidence: 0.8 },
      { sourcePattern: 'research notes', targetPattern: 'report sections', confidence: 0.7 },
      { sourcePattern: 'completed tasks', targetPattern: 'progress report', confidence: 0.6 },
      { sourcePattern: 'report findings', targetPattern: 'blog post', confidence: 0.5 },
      { sourcePattern: 'meeting notes', targetPattern: 'action items', confidence: 0.7 }
    ];
    
    return typePatterns;
  }
  
  private calculateFlowStrength(
    relationships: WorkflowRelationship[],
    sourceCount: number,
    targetCount: number
  ): number {
    if (sourceCount === 0 || targetCount === 0) return 0;
    
    // Calculate relationship density
    const maxPossibleRelationships = sourceCount * targetCount;
    const relationshipDensity = relationships.length / maxPossibleRelationships;
    
    // Calculate average relationship strength
    const avgStrength = relationships.length > 0
      ? relationships.reduce((sum, rel) => sum + rel.strength, 0) / relationships.length
      : 0;
    
    // Combine metrics
    return Math.min(relationshipDensity * 0.6 + avgStrength * 0.4, 1);
  }
  
  private analyzeFlowPattern(pages: WorkflowEntity[], connections: WorkflowRelationship[]): string {
    if (connections.length === 0) return 'isolated';
    
    // Check for linear flow
    const linearConnections = connections.filter(rel => rel.type === 'depends_on' || rel.type === 'follows');
    if (linearConnections.length >= pages.length - 1) {
      return 'linear';
    }
    
    // Check for hub-and-spoke
    const connectionCounts = new Map<string, number>();
    for (const rel of connections) {
      connectionCounts.set(rel.sourceId, (connectionCounts.get(rel.sourceId) || 0) + 1);
      connectionCounts.set(rel.targetId, (connectionCounts.get(rel.targetId) || 0) + 1);
    }
    
    const maxConnections = Math.max(...Array.from(connectionCounts.values()));
    if (maxConnections >= pages.length - 1) {
      return 'hub-and-spoke';
    }
    
    // Check for网状 (network)
    const avgConnections = connections.length / pages.length;
    if (avgConnections > 1.5) {
      return 'network';
    }
    
    return 'mixed';
  }
  
  private calculateWorkflowCompleteness(pages: WorkflowEntity[], connections: WorkflowRelationship[]): number {
    if (pages.length < 2) return 1;
    
    // Calculate theoretical maximum connections
    const maxConnections = pages.length * (pages.length - 1);
    
    // Calculate actual connections
    const actualConnections = connections.length;
    
    // Calculate completeness based on connections
    const connectionCompleteness = Math.min(actualConnections / (pages.length - 1), 1);
    
    // Consider page types
    const typeDiversity = new Set(pages.map(p => p.type)).size;
    const typeCompleteness = typeDiversity / Math.min(typeDiversity, 4); // Normalize to 4 types
    
    return (connectionCompleteness * 0.6 + typeCompleteness * 0.4);
  }
  
  private identifyBottlenecks(pages: WorkflowEntity[], connections: WorkflowRelationship[]): string[] {
    const bottlenecks: string[] = [];
    
    if (pages.length < 3) return bottlenecks;
    
    // Find pages with many incoming connections (potential bottlenecks)
    const incomingCounts = new Map<string, number>();
    const outgoingCounts = new Map<string, number>();
    
    for (const rel of connections) {
      incomingCounts.set(rel.targetId, (incomingCounts.get(rel.targetId) || 0) + 1);
      outgoingCounts.set(rel.sourceId, (outgoingCounts.get(rel.sourceId) || 0) + 1);
    }
    
    // Identify potential bottlenecks (high incoming, low outgoing)
    for (const page of pages) {
      const incoming = incomingCounts.get(page.id) || 0;
      const outgoing = outgoingCounts.get(page.id) || 0;
      
      if (incoming > 2 && outgoing < 1) {
        bottlenecks.push(`${page.title} (${incoming} dependencies, ${outgoing} outputs)`);
      }
    }
    
    // Check for missing connections between important page types
    const documentPages = pages.filter(p => p.type === 'document');
    const taskPages = pages.filter(p => p.type === 'task');
    
    if (documentPages.length > 0 && taskPages.length > 0) {
      const hasDocumentTaskConnections = connections.some(rel =>
        (documentPages.some(r => r.id === rel.sourceId) && taskPages.some(t => t.id === rel.targetId)) ||
        (documentPages.some(r => r.id === rel.targetId) && taskPages.some(t => t.id === rel.sourceId))
      );
      
      if (!hasDocumentTaskConnections) {
        bottlenecks.push('Missing connections between documents and tasks');
      }
    }
    
    return bottlenecks;
  }
  
  private identifyOpportunities(pages: WorkflowEntity[], connections: WorkflowRelationship[]): string[] {
    const opportunities: string[] = [];
    
    // Identify missing page types
    const existingTypes = new Set(pages.map(p => p.type));
    const commonTypes: WorkflowEntityType[] = ['note', 'task', 'document', 'media'];
    const missingTypes = commonTypes.filter(type => !existingTypes.has(type));
    
    if (missingTypes.length > 0) {
      opportunities.push(`Add missing page types: ${missingTypes.join(', ')}`);
    }
    
    // Identify potential content transformations
    const notePages = pages.filter(p => p.type === 'note');
    const documentPages = pages.filter(p => p.type === 'document');
    
    if (notePages.length > 2 && documentPages.length === 0) {
      opportunities.push('Transform notes into a comprehensive document');
    }
    
    const taskPages = pages.filter(p => p.type === 'task');
    const mediaPages = pages.filter(p => p.type === 'media');
    
    if (taskPages.length > 3 && mediaPages.length === 0) {
      opportunities.push('Add media to document task completion process');
    }
    
    // Identify connection opportunities
    if (connections.length < pages.length * 0.5) {
      opportunities.push(`Increase connections (currently ${connections.length} for ${pages.length} pages)`);
    }
    
    return opportunities;
  }
  
  private determineRelationshipType(sourceType: WorkflowEntityType, targetType: WorkflowEntityType): string {
    const relationshipMap: Record<string, Record<string, string>> = {
      note: {
        task: 'generates',
        document: 'documents',
        media: 'references',
        note: 'relates_to'
      },
      task: {
        document: 'reports_on',
        media: 'documented_by',
        note: 'documented_in',
        task: 'depends_on'
      },
      document: {
        media: 'contains',
        task: 'recommends',
        note: 'referenced_in',
        document: 'extends'
      },
      media: {
        document: 'illustrates',
        task: 'supports',
        note: 'referenced_from',
        media: 'related_to'
      }
    };
    
    return relationshipMap[sourceType]?.[targetType] || 'related_to';
  }
  
  private findRelatedEntities(currentEntities: WorkflowEntity[], depth: number): WorkflowEntity[] {
    const relatedEntities: WorkflowEntity[] = [];
    const visited = new Set<string>(currentEntities.map(e => e.id));
    
    // Start with current entities
    let currentLevel = [...currentEntities];
    
    for (let i = 0; i < depth; i++) {
      const nextLevel: WorkflowEntity[] = [];
      
      for (const entity of currentLevel) {
        // Find relationships from this entity
        const relationships = Array.from(this.graph.relationships.values())
          .filter(rel => rel.sourceId === entity.id || rel.targetId === entity.id);
        
        for (const rel of relationships) {
          const otherId = rel.sourceId === entity.id ? rel.targetId : rel.sourceId;
          
          if (!visited.has(otherId)) {
            const otherEntity = this.graph.entities.get(otherId);
            if (otherEntity) {
              relatedEntities.push(otherEntity);
              nextLevel.push(otherEntity);
              visited.add(otherId);
            }
          }
        }
      }
      
      currentLevel = nextLevel;
    }
    
    return relatedEntities;
  }
  
  private calculatePredictionConfidence(currentEntities: WorkflowEntity[], predictedEntity: WorkflowEntity): number {
    let confidence = 0;
    
    // Check direct relationships
    const directRelationships = Array.from(this.graph.relationships.values())
      .filter(rel =>
        (currentEntities.some(e => e.id === rel.sourceId) && rel.targetId === predictedEntity.id) ||
        (currentEntities.some(e => e.id === rel.targetId) && rel.sourceId === predictedEntity.id)
      );
    
    confidence += Math.min(directRelationships.length * 0.2, 0.4);
    
    // Check content similarity
    const avgSimilarity = currentEntities.reduce((sum, entity) =>
      sum + this.analyzeContentSimilarity(entity, predictedEntity), 0) / currentEntities.length;
    
    confidence += avgSimilarity * 0.3;
    
    // Check type compatibility
    const currentTypes = new Set(currentEntities.map(e => e.type));
    const typeCompatibility = this.calculateTypeCompatibility(currentTypes, predictedEntity.type);
    confidence += typeCompatibility * 0.3;
    
    return Math.min(confidence, 1);
  }
  
  private generatePredictionReasoning(currentEntities: WorkflowEntity[], predictedEntity: WorkflowEntity): string[] {
    const reasoning: string[] = [];
    
    // Direct relationship reasoning
    const directRelationships = Array.from(this.graph.relationships.values())
      .filter(rel =>
        (currentEntities.some(e => e.id === rel.sourceId) && rel.targetId === predictedEntity.id) ||
        (currentEntities.some(e => e.id === rel.targetId) && rel.sourceId === predictedEntity.id)
      );
    
    if (directRelationships.length > 0) {
      reasoning.push(`Directly connected via ${directRelationships.length} relationship(s)`);
    }
    
    // Content similarity reasoning
    const similarities = currentEntities.map(entity =>
      this.analyzeContentSimilarity(entity, predictedEntity)
    );
    const maxSimilarity = Math.max(...similarities);
    
    if (maxSimilarity > 0.4) {
      reasoning.push(`High content similarity (${Math.round(maxSimilarity * 100)}%)`);
    }
    
    // Type flow reasoning
    const currentTypes = currentEntities.map(e => e.type).join(' → ');
    reasoning.push(`Natural flow: ${currentTypes} → ${predictedEntity.type}`);
    
    // Temporal reasoning
    const latestCurrent = currentEntities.reduce((latest, entity) =>
      entity.createdAt > latest.createdAt ? entity : latest
    );
    
    if (predictedEntity.createdAt > latestCurrent.createdAt) {
      const timeDiff = predictedEntity.createdAt.getTime() - latestCurrent.createdAt.getTime();
      const daysDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));
      
      if (daysDiff < 7) {
        reasoning.push(`Recently created (${daysDiff} days after current work)`);
      }
    }
    
    return reasoning.slice(0, 3); // Limit to top 3 reasoning items
  }
  
  private calculateTypeCompatibility(currentTypes: Set<WorkflowEntityType>, predictedType: WorkflowEntityType): number {
    // Define compatibility scores
    const compatibilityScores: Record<WorkflowEntityType, Record<WorkflowEntityType, number>> = {
      note: { task: 0.9, document: 0.7, media: 0.6, note: 0.5, project: 0.4, conversation: 0.3, email: 0.2, calendar: 0.2, reference: 0.3 },
      task: { document: 0.8, media: 0.5, note: 0.4, task: 0.3, project: 0.7, conversation: 0.4, email: 0.3, calendar: 0.6, reference: 0.3 },
      document: { media: 0.7, task: 0.6, note: 0.5, document: 0.4, project: 0.8, conversation: 0.5, email: 0.4, calendar: 0.3, reference: 0.6 },
      media: { document: 0.6, task: 0.4, note: 0.5, media: 0.3, project: 0.5, conversation: 0.3, email: 0.2, calendar: 0.2, reference: 0.7 },
      project: { document: 0.8, task: 0.7, note: 0.6, media: 0.5, project: 0.4, conversation: 0.5, email: 0.4, calendar: 0.6, reference: 0.5 },
      conversation: { note: 0.7, task: 0.5, document: 0.4, media: 0.3, project: 0.5, conversation: 0.3, email: 0.8, calendar: 0.4, reference: 0.3 },
      email: { conversation: 0.8, task: 0.4, document: 0.3, note: 0.5, project: 0.4, media: 0.2, email: 0.3, calendar: 0.7, reference: 0.4 },
      calendar: { task: 0.6, email: 0.7, project: 0.5, document: 0.3, note: 0.4, media: 0.2, conversation: 0.4, calendar: 0.3, reference: 0.3 },
      reference: { document: 0.6, media: 0.7, note: 0.5, task: 0.3, project: 0.5, conversation: 0.3, email: 0.4, calendar: 0.3, reference: 0.4 }
    };
    
    // Calculate average compatibility
    let totalCompatibility = 0;
    let count = 0;
    
    for (const currentType of currentTypes) {
      const score = compatibilityScores[currentType]?.[predictedType] || 0.3;
      totalCompatibility += score;
      count++;
    }
    
    return count > 0 ? totalCompatibility / count : 0.3;
  }
  
  private analyzeContentPatterns(sourceEntities: WorkflowEntity[], targetEntities: WorkflowEntity[]): string[] {
    const patterns: string[] = [];
    
    // Check for common keywords
    const sourceKeywords = new Set<string>();
    const targetKeywords = new Set<string>();
    
    for (const entity of sourceEntities) {
      if (entity.content) {
        const words = entity.content.toLowerCase().split(/\W+/).filter(w => w.length > 4);
        words.forEach(word => sourceKeywords.add(word));
      }
    }
    
    for (const entity of targetEntities) {
      if (entity.content) {
        const words = entity.content.toLowerCase().split(/\W+/).filter(w => w.length > 4);
        words.forEach(word => targetKeywords.add(word));
      }
    }
    
    const commonKeywords = Array.from(sourceKeywords).filter(keyword => targetKeywords.has(keyword));
    if (commonKeywords.length > 0) {
      patterns.push(`Common keywords: ${commonKeywords.slice(0, 5).join(', ')}${commonKeywords.length > 5 ? '...' : ''}`);
    }
    
    // Check for structural patterns
    const sourceHasTasks = sourceEntities.some(e => e.content?.includes('- [ ]') || e.content?.includes('TODO'));
    const targetHasStructure = targetEntities.some(e =>
      e.content?.includes('# ') || e.content?.includes('## ')
    );
    
    if (sourceHasTasks && targetHasStructure) {
      patterns.push('Task lists → Structured documents');
    }
    
    return patterns;
  }
}