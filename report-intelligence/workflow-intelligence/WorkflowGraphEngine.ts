/**
 * Phase 25: Workflow Intelligence Layer
 * Workflow Graph Engine
 * 
 * Manages documents, tasks, notes, media, and projects as a graph structure.
 * Provides graph operations, traversal, analysis, and context-aware workflow management.
 */

import type {
  WorkflowEntity,
  WorkflowRelationship,
  WorkflowGraph,
  WorkflowContext,
  WorkflowEntityType,
  WorkflowRelationshipType
} from './types';

/**
 * Graph traversal direction
 */
export type GraphTraversalDirection = 'forward' | 'backward' | 'bidirectional';

/**
 * Graph traversal algorithm
 */
export type GraphTraversalAlgorithm = 'breadth_first' | 'depth_first' | 'shortest_path';

/**
 * Graph analysis type
 */
export type GraphAnalysisType = 
  | 'connectivity'
  | 'centrality'
  | 'community_detection'
  | 'path_analysis'
  | 'dependency_analysis';

/**
 * Graph operation type
 */
export type GraphOperationType = 
  | 'add_entity'
  | 'update_entity'
  | 'remove_entity'
  | 'add_relationship'
  | 'update_relationship'
  | 'remove_relationship'
  | 'merge_graphs'
  | 'extract_subgraph';

/**
 * Workflow Graph Engine
 * 
 * Core engine for managing workflow entities and relationships as a graph.
 * Provides comprehensive graph operations, analysis, and traversal capabilities.
 */
export class WorkflowGraphEngine {
  private graph: WorkflowGraph;
  
  constructor(graph?: WorkflowGraph) {
    this.graph = graph || this.createDefaultGraph();
  }
  
  /**
   * Get the current graph
   */
  getGraph(): WorkflowGraph {
    return this.graph;
  }
  
  /**
   * Update the graph
   */
  updateGraph(graph: WorkflowGraph): void {
    this.graph = graph;
    this.updateGraphStatistics();
  }
  
  /**
   * Add entity to graph
   */
  addEntity(entity: WorkflowEntity): void {
    this.graph.entities.set(entity.id, entity);
    this.updateGraphStatistics();
  }
  
  /**
   * Update entity in graph
   */
  updateEntity(entityId: string, updates: Partial<WorkflowEntity>): boolean {
    const entity = this.graph.entities.get(entityId);
    if (!entity) return false;
    
    const updatedEntity = { ...entity, ...updates, updatedAt: new Date() };
    this.graph.entities.set(entityId, updatedEntity);
    this.updateGraphStatistics();
    return true;
  }
  
  /**
   * Remove entity from graph
   */
  removeEntity(entityId: string): boolean {
    const entity = this.graph.entities.get(entityId);
    if (!entity) return false;
    
    // Remove entity
    this.graph.entities.delete(entityId);
    
    // Remove relationships involving this entity
    for (const [relId, relationship] of this.graph.relationships) {
      if (relationship.sourceId === entityId || relationship.targetId === entityId) {
        this.graph.relationships.delete(relId);
      }
    }
    
    // Update child references in parent entities
    for (const otherEntity of this.graph.entities.values()) {
      const childIndex = otherEntity.childIds.indexOf(entityId);
      if (childIndex !== -1) {
        otherEntity.childIds.splice(childIndex, 1);
      }
    }
    
    // Remove from root entity IDs if present
    const rootIndex = this.graph.rootEntityIds.indexOf(entityId);
    if (rootIndex !== -1) {
      this.graph.rootEntityIds.splice(rootIndex, 1);
    }
    
    this.updateGraphStatistics();
    return true;
  }
  
  /**
   * Add relationship to graph
   */
  addRelationship(relationship: WorkflowRelationship): void {
    this.graph.relationships.set(relationship.id, relationship);
    this.updateGraphStatistics();
  }
  
  /**
   * Update relationship in graph
   */
  updateRelationship(relationshipId: string, updates: Partial<WorkflowRelationship>): boolean {
    const relationship = this.graph.relationships.get(relationshipId);
    if (!relationship) return false;
    
    const updatedRelationship = { ...relationship, ...updates };
    this.graph.relationships.set(relationshipId, updatedRelationship);
    this.updateGraphStatistics();
    return true;
  }
  
  /**
   * Remove relationship from graph
   */
  removeRelationship(relationshipId: string): boolean {
    const relationship = this.graph.relationships.get(relationshipId);
    if (!relationship) return false;
    
    this.graph.relationships.delete(relationshipId);
    this.updateGraphStatistics();
    return true;
  }
  
  /**
   * Find entity by ID
   */
  findEntity(entityId: string): WorkflowEntity | undefined {
    return this.graph.entities.get(entityId);
  }
  
  /**
   * Find entities by type
   */
  findEntitiesByType(entityType: WorkflowEntityType): WorkflowEntity[] {
    const result: WorkflowEntity[] = [];
    
    for (const entity of this.graph.entities.values()) {
      if (entity.type === entityType) {
        result.push(entity);
      }
    }
    
    return result;
  }
  
  /**
   * Find relationships involving entity
   */
  findEntityRelationships(entityId: string): WorkflowRelationship[] {
    const result: WorkflowRelationship[] = [];
    
    for (const relationship of this.graph.relationships.values()) {
      if (relationship.sourceId === entityId || relationship.targetId === entityId) {
        result.push(relationship);
      }
    }
    
    return result;
  }
  
  /**
   * Find relationships between two entities
   */
  findRelationshipsBetween(
    sourceId: string,
    targetId: string,
    relationshipType?: WorkflowRelationshipType
  ): WorkflowRelationship[] {
    const result: WorkflowRelationship[] = [];
    
    for (const relationship of this.graph.relationships.values()) {
      const matchesSourceTarget = 
        (relationship.sourceId === sourceId && relationship.targetId === targetId) ||
        (relationship.bidirectional && relationship.sourceId === targetId && relationship.targetId === sourceId);
      
      if (matchesSourceTarget && (!relationshipType || relationship.type === relationshipType)) {
        result.push(relationship);
      }
    }
    
    return result;
  }
  
  /**
   * Traverse graph from starting entity
   */
  traverseGraph(
    startEntityId: string,
    options: {
      direction?: GraphTraversalDirection;
      algorithm?: GraphTraversalAlgorithm;
      maxDepth?: number;
      filterEntityTypes?: WorkflowEntityType[];
      filterRelationshipTypes?: WorkflowRelationshipType[];
    } = {}
  ): {
    path: string[];
    entities: WorkflowEntity[];
    relationships: WorkflowRelationship[];
  } {
    const {
      direction = 'forward',
      algorithm = 'breadth_first',
      maxDepth = 3,
      filterEntityTypes,
      filterRelationshipTypes
    } = options;
    
    const visited = new Set<string>();
    const queue: Array<{ entityId: string; depth: number; path: string[] }> = [];
    const resultEntities: WorkflowEntity[] = [];
    const resultRelationships: WorkflowRelationship[] = [];
    
    queue.push({ entityId: startEntityId, depth: 0, path: [startEntityId] });
    
    while (queue.length > 0) {
      const current = algorithm === 'depth_first' ? queue.pop()! : queue.shift()!;
      const { entityId, depth, path } = current;
      
      if (visited.has(entityId) || depth > maxDepth) continue;
      
      visited.add(entityId);
      
      // Add entity to results if it passes filters
      const entity = this.findEntity(entityId);
      if (entity) {
        if (!filterEntityTypes || filterEntityTypes.includes(entity.type)) {
          resultEntities.push(entity);
        }
      }
      
      // Find relationships from this entity
      const relationships = this.findEntityRelationships(entityId);
      
      for (const relationship of relationships) {
        // Apply relationship type filter
        if (filterRelationshipTypes && !filterRelationshipTypes.includes(relationship.type)) {
          continue;
        }
        
        // Determine next entity based on direction
        let nextEntityId: string | null = null;
        
        if (direction === 'forward' && relationship.sourceId === entityId) {
          nextEntityId = relationship.targetId;
        } else if (direction === 'backward' && relationship.targetId === entityId) {
          nextEntityId = relationship.sourceId;
        } else if (direction === 'bidirectional') {
          nextEntityId = relationship.sourceId === entityId ? relationship.targetId : relationship.sourceId;
        }
        
        if (nextEntityId && !visited.has(nextEntityId)) {
          resultRelationships.push(relationship);
          queue.push({
            entityId: nextEntityId,
            depth: depth + 1,
            path: [...path, nextEntityId]
          });
        }
      }
    }
    
    return {
      path: Array.from(visited),
      entities: resultEntities,
      relationships: resultRelationships
    };
  }
  
  /**
   * Analyze graph structure
   */
  analyzeGraph(analysisType: GraphAnalysisType): any {
    switch (analysisType) {
      case 'connectivity':
        return this.analyzeConnectivity();
      case 'centrality':
        return this.analyzeCentrality();
      case 'community_detection':
        return this.detectCommunities();
      case 'path_analysis':
        return this.analyzePaths();
      case 'dependency_analysis':
        return this.analyzeDependencies();
      default:
        throw new Error(`Unknown analysis type: ${analysisType}`);
    }
  }
  
  /**
   * Create context-aware subgraph
   */
  createContextAwareSubgraph(context: WorkflowContext): WorkflowGraph {
    const subgraphEntities = new Map<string, WorkflowEntity>();
    const subgraphRelationships = new Map<string, WorkflowRelationship>();
    
    // Include focused entity
    if (context.focusedEntityId) {
      const focusedEntity = this.findEntity(context.focusedEntityId);
      if (focusedEntity) {
        subgraphEntities.set(focusedEntity.id, focusedEntity);
        
        // Include relationships from focused entity
        const relationships = this.findEntityRelationships(context.focusedEntityId);
        for (const relationship of relationships) {
          subgraphRelationships.set(relationship.id, relationship);
          
          // Include connected entities
          const otherEntityId = relationship.sourceId === context.focusedEntityId 
            ? relationship.targetId 
            : relationship.sourceId;
          
          const otherEntity = this.findEntity(otherEntityId);
          if (otherEntity) {
            subgraphEntities.set(otherEntity.id, otherEntity);
          }
        }
      }
    }
    
    // Include recent entities
    for (const entityId of context.recentEntityIds) {
      if (!subgraphEntities.has(entityId)) {
        const entity = this.findEntity(entityId);
        if (entity) {
          subgraphEntities.set(entity.id, entity);
        }
      }
    }
    
    // Create subgraph
    const subgraph: WorkflowGraph = {
      id: `subgraph-${Date.now()}`,
      name: `Context Subgraph for ${context.focusedEntityId || 'unknown'}`,
      entities: subgraphEntities,
      relationships: subgraphRelationships,
      rootEntityIds: context.focusedEntityId ? [context.focusedEntityId] : [],
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        context,
        generatedAt: new Date().toISOString()
      },
      statistics: this.calculateGraphStatistics(subgraphEntities, subgraphRelationships)
    };
    
    return subgraph;
  }
  
  /**
   * Merge another graph into this graph
   */
  mergeGraph(otherGraph: WorkflowGraph, options?: {
    conflictResolution?: 'prefer_existing' | 'prefer_new' | 'merge';
  }): {
    mergedGraph: WorkflowGraph;
    statistics: {
      entitiesAdded: number;
      entitiesUpdated: number;
      relationshipsAdded: number;
      relationshipsUpdated: number;
    };
  } {
    const conflictResolution = options?.conflictResolution || 'prefer_existing';
    const stats = {
      entitiesAdded: 0,
      entitiesUpdated: 0,
      relationshipsAdded: 0,
      relationshipsUpdated: 0
    };
    
    // Merge entities
    for (const [entityId, entity] of otherGraph.entities) {
      const existingEntity = this.graph.entities.get(entityId);
      
      if (!existingEntity) {
        this.graph.entities.set(entityId, entity);
        stats.entitiesAdded++;
      } else if (conflictResolution === 'prefer_new') {
        this.graph.entities.set(entityId, entity);
        stats.entitiesUpdated++;
      } else if (conflictResolution === 'merge') {
        // Merge entity properties (simplified)
        const mergedEntity = {
          ...existingEntity,
          ...entity,
          updatedAt: new Date()
        };
        this.graph.entities.set(entityId, mergedEntity);
        stats.entitiesUpdated++;
      }
      // else 'prefer_existing' - do nothing
    }
    
    // Merge relationships
    for (const [relId, relationship] of otherGraph.relationships) {
      const existingRelationship = this.graph.relationships.get(relId);
      
      if (!existingRelationship) {
        this.graph.relationships.set(relId, relationship);
        stats.relationshipsAdded++;
      } else if (conflictResolution === 'prefer_new') {
        this.graph.relationships.set(relId, relationship);
        stats.relationshipsUpdated++;
      } else if (conflictResolution === 'merge') {
        // Merge relationship properties (simplified)
        const mergedRelationship = {
          ...existingRelationship,
          ...relationship
        };
        this.graph.relationships.set(relId, mergedRelationship);
        stats.relationshipsUpdated++;
      }
      // else 'prefer_existing' - do nothing
    }
    
    // Merge root entity IDs
    for (const rootId of otherGraph.rootEntityIds) {
      if (!this.graph.rootEntityIds.includes(rootId)) {
        this.graph.rootEntityIds.push(rootId);
      }
    }
    
    this.updateGraphStatistics();
    
    return {
      mergedGraph: this.graph,
      statistics: stats
    };
  }
  
  /**
   * Export graph to JSON
   */
  exportToJson(): string {
    const exportData = {
      id: this.graph.id,
      name: this.graph.name,
      description: this.graph.description,
      entities: Array.from(this.graph.entities.values()).map(entity => ({
        ...entity,
        createdAt: entity.createdAt.toISOString(),
        updatedAt: entity.updatedAt.toISOString(),
        dueDate: entity.dueDate?.toISOString(),
        completedAt: entity.completedAt?.toISOString()
      })),
      relationships: Array.from(this.graph.relationships.values()).map(rel => ({
        ...rel,
        createdAt: rel.createdAt.toISOString()
      })),
      rootEntityIds: this.graph.rootEntityIds,
      createdAt: this.graph.createdAt.toISOString(),
      updatedAt: this.graph.updatedAt.toISOString(),
      metadata: this.graph.metadata,
      statistics: this.graph.statistics
    };
    
    return JSON.stringify(exportData, null, 2);
  }
  
  /**
   * Import graph from JSON
   */
  importFromJson(json: string): WorkflowGraph {
    const importData = JSON.parse(json);
    
    const entities = new Map<string, WorkflowEntity>();
    for (const entityData of importData.entities) {
      const entity: WorkflowEntity = {
        ...entityData,
        createdAt: new Date(entityData.createdAt),
        updatedAt: new Date(entityData.updatedAt),
        dueDate: entityData.dueDate ? new Date(entityData.dueDate) : undefined,
        completedAt: entityData.completedAt ? new Date(entityData.completedAt) : undefined
      };
      entities.set(entity.id, entity);
    }
    
    const relationships = new Map<string, WorkflowRelationship>();
    for (const relData of importData.relationships) {
      const relationship: WorkflowRelationship = {
        ...relData,
        createdAt: new Date(relData.createdAt)
      };
      relationships.set(relationship.id, relationship);
    }
    
    const graph: WorkflowGraph = {
      id: importData.id,
      name: importData.name,
      description: importData.description,
      entities,
      relationships,
      rootEntityIds: importData.rootEntityIds,
      createdAt: new Date(importData.createdAt),
      updatedAt: new Date(importData.updatedAt),
      metadata: importData.metadata,
      statistics: importData.statistics
    };
    
    this.graph = graph;
    return graph;
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
  
  private updateGraphStatistics(): void {
    this.graph.statistics = this.calculateGraphStatistics(this.graph.entities, this.graph.relationships);
    this.graph.updatedAt = new Date();
  }
  
  private calculateGraphStatistics(
    entities: Map<string, WorkflowEntity>,
    relationships: Map<string, WorkflowRelationship>
  ): WorkflowGraph['statistics'] {
    const entityCount = entities.size;
    const relationshipCount = relationships.size;
    
    // Calculate average degree
    const degreeSum = Array.from(relationships.values()).reduce((sum, rel) => {
      return sum + (rel.bidirectional ? 2 : 1);
    }, 0);
    
    const averageDegree = entityCount > 0 ? degreeSum / entityCount : 0;
    
    // Calculate density
    const maxPossibleRelationships = entityCount * (entityCount - 1);
    const density = maxPossibleRelationships > 0 ? relationshipCount / maxPossibleRelationships : 0;
    
    // Calculate connected components (simplified)
    const visited = new Set<string>();
    let connectedComponents = 0;
    
    for (const entityId of entities.keys()) {
      if (!visited.has(entityId)) {
        connectedComponents++;
        // Simple DFS to mark connected component
        const stack = [entityId];
        while (stack.length > 0) {
          const currentId = stack.pop()!;
          if (!visited.has(currentId)) {
            visited.add(currentId);
            // Find connected entities
            for (const relationship of relationships.values()) {
              if (relationship.sourceId === currentId && !visited.has(relationship.targetId)) {
                stack.push(relationship.targetId);
              }
              if (relationship.bidirectional && relationship.targetId === currentId && !visited.has(relationship.sourceId)) {
                stack.push(relationship.sourceId);
              }
            }
          }
        }
      }
    }
    
    return {
      entityCount,
      relationshipCount,
      averageDegree,
      density,
      connectedComponents
    };
  }
  
  /**
   * Analyze graph connectivity
   */
  private analyzeConnectivity(): any {
    const entities = Array.from(this.graph.entities.keys());
    const visited = new Set<string>();
    const components: string[][] = [];
    
    for (const entityId of entities) {
      if (!visited.has(entityId)) {
        const component: string[] = [];
        const stack = [entityId];
        
        while (stack.length > 0) {
          const currentId = stack.pop()!;
          if (!visited.has(currentId)) {
            visited.add(currentId);
            component.push(currentId);
            
            // Find connected entities
            for (const relationship of this.graph.relationships.values()) {
              if (relationship.sourceId === currentId && !visited.has(relationship.targetId)) {
                stack.push(relationship.targetId);
              }
              if (relationship.bidirectional && relationship.targetId === currentId && !visited.has(relationship.sourceId)) {
                stack.push(relationship.sourceId);
              }
            }
          }
        }
        
        components.push(component);
      }
    }
    
    return {
      connectedComponents: components.length,
      componentSizes: components.map(c => c.length),
      isFullyConnected: components.length === 1,
      largestComponentSize: components.length > 0 ? Math.max(...components.map(c => c.length)) : 0
    };
  }
  
  /**
   * Analyze entity centrality
   */
  private analyzeCentrality(): any {
    const entities = Array.from(this.graph.entities.keys());
    const centrality: Record<string, number> = {};
    
    // Simple degree centrality
    for (const entityId of entities) {
      let degree = 0;
      
      for (const relationship of this.graph.relationships.values()) {
        if (relationship.sourceId === entityId || relationship.targetId === entityId) {
          degree += relationship.bidirectional ? 2 : 1;
        }
      }
      
      centrality[entityId] = degree;
    }
    
    // Find most central entities
    const sortedEntities = Object.entries(centrality)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    
    return {
      centrality,
      mostCentralEntities: sortedEntities.map(([id, score]) => ({
        entityId: id,
        score,
        entity: this.findEntity(id)
      })),
      averageCentrality: entities.length > 0
        ? Object.values(centrality).reduce((sum, val) => sum + val, 0) / entities.length
        : 0
    };
  }
  
  /**
   * Detect communities in the graph
   */
  private detectCommunities(): any {
    // Simplified community detection based on relationship strength
    const communities: Array<{
      id: string;
      entities: string[];
      averageRelationshipStrength: number;
      dominantEntityType?: WorkflowEntityType;
    }> = [];
    
    const visited = new Set<string>();
    
    for (const entityId of this.graph.entities.keys()) {
      if (!visited.has(entityId)) {
        const communityEntities: string[] = [];
        let totalStrength = 0;
        let relationshipCount = 0;
        const entityTypeCounts: Record<string, number> = {};
        
        const stack = [entityId];
        while (stack.length > 0) {
          const currentId = stack.pop()!;
          if (!visited.has(currentId)) {
            visited.add(currentId);
            communityEntities.push(currentId);
            
            // Count entity type
            const entity = this.findEntity(currentId);
            if (entity) {
              entityTypeCounts[entity.type] = (entityTypeCounts[entity.type] || 0) + 1;
            }
            
            // Explore relationships
            for (const relationship of this.graph.relationships.values()) {
              if (relationship.sourceId === currentId || relationship.targetId === currentId) {
                totalStrength += relationship.strength;
                relationshipCount++;
                
                const otherId = relationship.sourceId === currentId ? relationship.targetId : relationship.sourceId;
                if (!visited.has(otherId)) {
                  stack.push(otherId);
                }
              }
            }
          }
        }
        
        if (communityEntities.length > 0) {
          // Find dominant entity type
          let dominantType: WorkflowEntityType | undefined;
          let maxCount = 0;
          for (const [type, count] of Object.entries(entityTypeCounts)) {
            if (count > maxCount) {
              maxCount = count;
              dominantType = type as WorkflowEntityType;
            }
          }
          
          communities.push({
            id: `community-${communities.length + 1}`,
            entities: communityEntities,
            averageRelationshipStrength: relationshipCount > 0 ? totalStrength / relationshipCount : 0,
            dominantEntityType: dominantType
          });
        }
      }
    }
    
    return {
      communities,
      communityCount: communities.length,
      averageCommunitySize: communities.length > 0
        ? communities.reduce((sum, c) => sum + c.entities.length, 0) / communities.length
        : 0
    };
  }
  
  /**
   * Analyze paths in the graph
   */
  private analyzePaths(): any {
    // Analyze shortest paths between entities
    const entities = Array.from(this.graph.entities.keys());
    const pathAnalysis: Array<{
      sourceId: string;
      targetId: string;
      pathLength: number;
      relationshipTypes: string[];
    }> = [];
    
    // Sample analysis between first few entities
    const sampleEntities = entities.slice(0, Math.min(5, entities.length));
    
    for (let i = 0; i < sampleEntities.length; i++) {
      for (let j = i + 1; j < sampleEntities.length; j++) {
        const sourceId = sampleEntities[i];
        const targetId = sampleEntities[j];
        
        // Simple BFS to find path length
        const queue: Array<{ id: string; distance: number; path: string[] }> = [];
        const visited = new Set<string>();
        
        queue.push({ id: sourceId, distance: 0, path: [sourceId] });
        
        while (queue.length > 0) {
          const current = queue.shift()!;
          
          if (current.id === targetId) {
            pathAnalysis.push({
              sourceId,
              targetId,
              pathLength: current.distance,
              relationshipTypes: [] // Simplified
            });
            break;
          }
          
          if (!visited.has(current.id)) {
            visited.add(current.id);
            
            // Find neighbors
            for (const relationship of this.graph.relationships.values()) {
              if (relationship.sourceId === current.id && !visited.has(relationship.targetId)) {
                queue.push({
                  id: relationship.targetId,
                  distance: current.distance + 1,
                  path: [...current.path, relationship.targetId]
                });
              }
              if (relationship.bidirectional && relationship.targetId === current.id && !visited.has(relationship.sourceId)) {
                queue.push({
                  id: relationship.sourceId,
                  distance: current.distance + 1,
                  path: [...current.path, relationship.sourceId]
                });
              }
            }
          }
        }
      }
    }
    
    return {
      pathAnalysis,
      averagePathLength: pathAnalysis.length > 0
        ? pathAnalysis.reduce((sum, p) => sum + p.pathLength, 0) / pathAnalysis.length
        : 0,
      maxPathLength: pathAnalysis.length > 0
        ? Math.max(...pathAnalysis.map(p => p.pathLength))
        : 0
    };
  }
  
  /**
   * Analyze dependencies in the graph
   */
  private analyzeDependencies(): any {
    const dependencies: Array<{
      sourceId: string;
      targetId: string;
      type: WorkflowRelationshipType;
      strength: number;
      isCritical: boolean;
    }> = [];
    
    // Find dependency relationships
    for (const relationship of this.graph.relationships.values()) {
      if (relationship.type === 'depends_on' || relationship.type === 'references') {
        const sourceEntity = this.findEntity(relationship.sourceId);
        const targetEntity = this.findEntity(relationship.targetId);
        
        if (sourceEntity && targetEntity) {
          dependencies.push({
            sourceId: relationship.sourceId,
            targetId: relationship.targetId,
            type: relationship.type,
            strength: relationship.strength,
            isCritical: relationship.strength > 0.7 // High strength dependencies are critical
          });
        }
      }
    }
    
    // Find circular dependencies
    const circularDependencies: string[][] = [];
    // Simplified circular dependency detection
    for (const dep of dependencies) {
      // Check if reverse dependency exists
      const reverseDep = dependencies.find(d =>
        d.sourceId === dep.targetId && d.targetId === dep.sourceId
      );
      
      if (reverseDep) {
        circularDependencies.push([dep.sourceId, dep.targetId]);
      }
    }
    
    return {
      dependencies,
      dependencyCount: dependencies.length,
      criticalDependencies: dependencies.filter(d => d.isCritical),
      circularDependencies,
      hasCircularDependencies: circularDependencies.length > 0
    };
  }
}
