/**
 * Knowledge Graph Layer
 * 
 * This module provides entity extraction and consistency detection capabilities
 * for building knowledge graphs from text content.
 * 
 * @module knowledge-graph
 */

import type {
  KnowledgeGraphConfig,
  KnowledgeGraphStatistics,
  KnowledgeEntity,
  KnowledgeRelationship,
  KnowledgeGraph,
  EntityExtractionResult,
  ConsistencyDetectionResult,
  ConsistencyIssue,
  EntityType,
  RelationshipType
} from './knowledge-graph-types';

import { EntityExtractor } from './entity-extractor';
import { ConsistencyDetector } from './consistency-detector';

/**
 * Knowledge Graph Layer - Main Entry Point
 * 
 * Provides high-level utilities for building and maintaining knowledge graphs
 * including entity extraction, relationship detection, and consistency checking.
 */
export class KnowledgeGraphLayer {
  private extractor: EntityExtractor;
  private detector: ConsistencyDetector;
  private config: KnowledgeGraphConfig;

  constructor(config: KnowledgeGraphConfig = {}) {
    this.config = this.normalizeConfig(config);
    this.extractor = new EntityExtractor();
    this.detector = new ConsistencyDetector();
  }

  /**
   * Normalize and validate configuration
   */
  private normalizeConfig(config: KnowledgeGraphConfig): KnowledgeGraphConfig {
    const defaults: KnowledgeGraphConfig = {
      entityTypes: ['person', 'organization', 'location', 'concept', 'event', 'document', 'project', 'technology', 'financial_metric', 'regulation'],
      minEntityConfidence: 0.5,
      minRelationshipStrength: 0.3,
      maxAliases: 5,
      enableDeduplication: true,
      enableConsistencyChecking: true,
      relationshipTypes: ['mentions', 'part_of', 'located_in', 'related_to', 'causes', 'precedes', 'follows', 'contains', 'owned_by', 'funded_by', 'regulated_by', 'competing_with', 'collaborates_with', 'other']
    };

    return {
      ...defaults,
      ...config,
      entityTypes: config.entityTypes || defaults.entityTypes,
      minEntityConfidence: config.minEntityConfidence ?? defaults.minEntityConfidence,
      minRelationshipStrength: config.minRelationshipStrength ?? defaults.minRelationshipStrength,
      maxAliases: config.maxAliases ?? defaults.maxAliases,
      enableDeduplication: config.enableDeduplication ?? defaults.enableDeduplication,
      enableConsistencyChecking: config.enableConsistencyChecking ?? defaults.enableConsistencyChecking,
      relationshipTypes: config.relationshipTypes || defaults.relationshipTypes
    };
  }

  /**
   * Extract entities and relationships from text
   * 
   * @param text - The text content to extract entities from
   * @param documentId - Optional document identifier for tracking
   * @returns Entity extraction result with entities and relationships
   */
  public extract(text: string, documentId?: string): EntityExtractionResult {
    return this.extractor.extract(text, documentId);
  }

  /**
   * Get all entities from the extractor
   * 
   * @returns Array of all extracted entities
   */
  public getEntities(): KnowledgeEntity[] {
    return this.extractor.getEntities();
  }

  /**
   * Get all relationships from the extractor
   * 
   * @returns Array of all extracted relationships
   */
  public getRelationships(): KnowledgeRelationship[] {
    return this.extractor.getRelationships();
  }

  /**
   * Detect consistency issues in the knowledge graph
   * 
   * @param entities - Array of entities to check
   * @param relationships - Array of relationships to check
   * @returns Consistency detection result
   */
  public detectIssues(
    entities: KnowledgeEntity[],
    relationships: KnowledgeRelationship[]
  ): ConsistencyDetectionResult {
    return this.detector.detectIssues(entities, relationships);
  }

  /**
   * Clear all extracted entities and relationships
   */
  public clear(): void {
    this.extractor.clear();
  }

  /**
   * Get statistics about the knowledge graph
   * 
   * @returns Knowledge graph statistics
   */
  public getStatistics(): KnowledgeGraphStatistics {
    const entities = this.getEntities();
    const relationships = this.getRelationships();

    return {
      totalEntities: entities.length,
      entitiesByType: this.groupEntitiesByType(entities),
      totalRelationships: relationships.length,
      relationshipsByType: this.groupRelationshipsByType(relationships),
      avgEntityConfidence: this.calculateAvgEntityConfidence(entities),
      avgRelationshipStrength: this.calculateAvgRelationshipStrength(relationships),
      density: this.calculateDensity(entities.length, relationships.length)
    };
  }

  /**
   * Get the underlying entity extractor
   */
  public getExtractor(): EntityExtractor {
    return this.extractor;
  }

  /**
   * Get the underlying consistency detector
   */
  public getDetector(): ConsistencyDetector {
    return this.detector;
  }

  /**
   * Group entities by their type
   */
  private groupEntitiesByType(entities: KnowledgeEntity[]): Record<EntityType, number> {
    const groups: Record<string, number> = {} as Record<string, number>;
    for (const entity of entities) {
      const type = entity.type || 'other' as EntityType;
      groups[type] = (groups[type] || 0) + 1;
    }
    return groups as Record<EntityType, number>;
  }

  /**
   * Group relationships by their type
   */
  private groupRelationshipsByType(relationships: KnowledgeRelationship[]): Record<RelationshipType, number> {
    const groups: Record<string, number> = {} as Record<string, number>;
    for (const rel of relationships) {
      const type = rel.type || 'other' as RelationshipType;
      groups[type] = (groups[type] || 0) + 1;
    }
    return groups as Record<RelationshipType, number>;
  }

  /**
   * Calculate average entity confidence
   */
  private calculateAvgEntityConfidence(entities: KnowledgeEntity[]): number {
    if (entities.length === 0) return 0;
    let totalConfidence = 0;
    for (const entity of entities) {
      if (entity.confidence !== undefined && entity.confidence !== null) {
        totalConfidence += entity.confidence;
      }
    }
    return totalConfidence / entities.length;
  }

  /**
   * Calculate average relationship strength
   */
  private calculateAvgRelationshipStrength(relationships: KnowledgeRelationship[]): number {
    if (relationships.length === 0) return 0;
    let totalStrength = 0;
    for (const rel of relationships) {
      if (rel.strength !== undefined && rel.strength !== null) {
        totalStrength += rel.strength;
      }
    }
    return totalStrength / relationships.length;
  }

  /**
   * Calculate graph density
   */
  private calculateDensity(entityCount: number, relationshipCount: number): number {
    if (entityCount < 2) return 0;
    const maxPossibleRelationships = entityCount * (entityCount - 1);
    return relationshipCount / maxPossibleRelationships;
  }
}

// Export individual classes for direct usage
export { EntityExtractor } from './entity-extractor';
export { ConsistencyDetector } from './consistency-detector';

// Export type definitions
export type {
  KnowledgeGraphConfig,
  KnowledgeGraphStatistics,
  KnowledgeEntity,
  KnowledgeRelationship,
  KnowledgeGraph,
  EntityExtractionResult,
  ConsistencyDetectionResult,
  ConsistencyIssue,
  EntityType,
  RelationshipType
} from './knowledge-graph-types';

/**
 * Create a new knowledge graph layer instance
 * 
 * @param config - Configuration for the knowledge graph layer
 * @returns KnowledgeGraphLayer instance
 */
export function createKnowledgeGraphLayer(config?: KnowledgeGraphConfig): KnowledgeGraphLayer {
  return new KnowledgeGraphLayer(config);
}
