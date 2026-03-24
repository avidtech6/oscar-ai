/**
 * Knowledge Graph Types

 * PHASE 32.5 — Knowledge Graph Layer
 * Type definitions for knowledge graph entities, relationships, and consistency detection.
 */

/**
 * Knowledge graph entity types
 */
export type EntityType = 
  | 'person' 
  | 'organization' 
  | 'location' 
  | 'concept' 
  | 'event' 
  | 'document' 
  | 'project' 
  | 'technology' 
  | 'financial_metric' 
  | 'regulation' 
  | 'other';

/**
 * Relationship types in knowledge graph
 */
export type RelationshipType = 
  | 'mentions' 
  | 'part_of' 
  | 'located_in' 
  | 'related_to' 
  | 'causes' 
  | 'precedes' 
  | 'follows' 
  | 'contains' 
  | 'owned_by' 
  | 'funded_by' 
  | 'regulated_by' 
  | 'competing_with' 
  | 'collaborates_with' 
  | 'other';

/**
 * Entity in knowledge graph
 */
export interface KnowledgeEntity {
  /**
   * Unique entity ID
   */
  id: string;

  /**
   * Entity name
   */
  name: string;

  /**
   * Entity type
   */
  type: EntityType;

  /**
   * Entity aliases
   */
  aliases?: string[];

  /**
   * Description
   */
  description?: string;

  /**
   * Properties
   */
  properties?: Record<string, any>;

  /**
   * Source document IDs
   */
  sourceDocuments?: string[];

  /**
   * Confidence score
   */
  confidence?: number;

  /**
   * Created timestamp
   */
  createdAt: Date;

  /**
   * Last updated timestamp
   */
  updatedAt: Date;
}

/**
 * Relationship between entities
 */
export interface KnowledgeRelationship {
  /**
   * Unique relationship ID
   */
  id: string;

  /**
   * Source entity ID
   */
  sourceId: string;

  /**
   * Target entity ID
   */
  targetId: string;

  /**
   * Relationship type
   */
  type: RelationshipType;

  /**
   * Relationship description
   */
  description?: string;

  /**
   * Strength of relationship (0-1)
   */
  strength?: number;

  /**
   * Source document IDs
   */
  sourceDocuments?: string[];

  /**
   * Created timestamp
   */
  createdAt: Date;
}

/**
 * Knowledge graph
 */
export interface KnowledgeGraph {
  /**
   * Graph ID
   */
  id: string;

  /**
   * Graph name
   */
  name: string;

  /**
   * Total entities
   */
  entityCount: number;

  /**
   * Total relationships
   */
  relationshipCount: number;

  /**
   * Graph metadata
   */
  metadata?: Record<string, any>;

  /**
   * Created timestamp
   */
  createdAt: Date;

  /**
   * Last updated timestamp
   */
  updatedAt: Date;
}

/**
 * Consistency issue detected
 */
export interface ConsistencyIssue {
  /**
   * Issue ID
   */
  id: string;

  /**
   * Issue type
   */
  type: 'conflict' | 'inconsistency' | 'ambiguity' | 'missing' | 'duplicate';

  /**
   * Severity level
   */
  severity: 'low' | 'medium' | 'high' | 'critical';

  /**
   * Description
   */
  description: string;

  /**
   * Affected entities
   */
  affectedEntities: string[];

  /**
   * Affected relationships
   */
  affectedRelationships?: string[];

  /**
   * Suggested resolution
   */
  suggestedResolution?: string;

  /**
   * Source document IDs
   */
  sourceDocuments?: string[];

  /**
   * Detected timestamp
   */
  detectedAt: Date;
}

/**
 * Entity extraction result
 */
export interface EntityExtractionResult {
  /**
   * Entities extracted
   */
  entities: KnowledgeEntity[];

  /**
   * Relationships extracted
   */
  relationships: KnowledgeRelationship[];

  /**
   * Total entities found
   */
  totalEntities: number;

  /**
   * Total relationships found
   */
  totalRelationships: number;

  /**
   * Processing time
   */
  processingTime: number;

  /**
   * Confidence metrics
   */
  confidence: {
    entityExtraction: number;
    relationshipExtraction: number;
    overall: number;
  };
}

/**
 * Consistency detection result
 */
export interface ConsistencyDetectionResult {
  /**
   * Issues found
   */
  issues: ConsistencyIssue[];

  /**
   * Total issues
   */
  totalIssues: number;

  /**
   * Issues by severity
   */
  issuesBySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };

  /**
   * Processing time
   */
  processingTime: number;

  /**
   * Graph health score (0-1)
   */
  healthScore: number;
}

/**
 * Knowledge graph configuration
 */
export interface KnowledgeGraphConfig {
  /**
   * Minimum entity confidence threshold
   */
  minEntityConfidence?: number;

  /**
   * Minimum relationship strength threshold
   */
  minRelationshipStrength?: number;

  /**
   * Maximum entity aliases per entity
   */
  maxAliases?: number;

  /**
   * Enable entity deduplication
   */
  enableDeduplication?: boolean;

  /**
   * Enable consistency checking
   */
  enableConsistencyChecking?: boolean;

  /**
   * Entity types to extract
   */
  entityTypes?: EntityType[];

  /**
   * Relationship types to extract
   */
  relationshipTypes?: RelationshipType[];
}

/**
 * Knowledge graph statistics
 */
export interface KnowledgeGraphStatistics {
  /**
   * Total entities
   */
  totalEntities: number;

  /**
   * Entities by type
   */
  entitiesByType: Record<EntityType, number>;

  /**
   * Total relationships
   */
  totalRelationships: number;

  /**
   * Relationships by type
   */
  relationshipsByType: Record<RelationshipType, number>;

  /**
   * Average entity confidence
   */
  avgEntityConfidence: number;

  /**
   * Average relationship strength
   */
  avgRelationshipStrength: number;

  /**
   * Graph density (0-1)
   */
  density: number;
}
