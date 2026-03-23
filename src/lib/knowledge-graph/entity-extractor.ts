/**
 * Entity Extractor for Knowledge Graph
 * 
 * PHASE 32.5 — Knowledge Graph Layer
 * Extracts entities and relationships from text using pattern matching and NLP techniques.
 */

import type {
  KnowledgeEntity,
  KnowledgeRelationship,
  EntityExtractionResult,
  EntityType,
  RelationshipType,
  KnowledgeGraphConfig
} from './knowledge-graph-types.js';

/**
 * Entity Extractor for knowledge graph construction
 * 
 * Features:
 * - Named entity recognition (person, organization, location)
 * - Relationship extraction
 * - Entity deduplication
 * - Confidence scoring
 * - Pattern-based extraction
 */
export class EntityExtractor {
  private config: KnowledgeGraphConfig;
  private entityRegistry: Map<string, KnowledgeEntity> = new Map();
  private relationshipRegistry: Map<string, KnowledgeRelationship> = new Map();

  constructor(config: KnowledgeGraphConfig = {}) {
    this.config = this.normalizeConfig(config);
  }

  /**
   * Normalize and validate configuration
   */
  private normalizeConfig(config: KnowledgeGraphConfig): KnowledgeGraphConfig {
    return {
      minEntityConfidence: config.minEntityConfidence || 0.5,
      minRelationshipStrength: config.minRelationshipStrength || 0.3,
      maxAliases: config.maxAliases || 5,
      enableDeduplication: config.enableDeduplication ?? true,
      enableConsistencyChecking: config.enableConsistencyChecking ?? true,
      entityTypes: config.entityTypes || [
        'person', 'organization', 'location', 'concept', 'event',
        'document', 'project', 'technology', 'financial_metric', 'regulation'
      ],
      relationshipTypes: config.relationshipTypes || [
        'mentions', 'part_of', 'located_in', 'related_to', 'causes',
        'precedes', 'follows', 'contains', 'owned_by', 'funded_by',
        'regulated_by', 'competing_with', 'collaborates_with', 'other'
      ]
    };
  }

  /**
   * Extract entities and relationships from text
   */
  public extract(text: string, documentId?: string): EntityExtractionResult {
    const startTime = performance.now();

    try {
      // Extract entities
      const entities = this.extractEntities(text, documentId);

      // Extract relationships
      const relationships = this.extractRelationships(entities, text, documentId);

      // Deduplicate entities if enabled
      if (this.config.enableDeduplication) {
        this.deduplicateEntities(entities);
      }

      // Calculate confidence scores
      const confidence = this.calculateConfidence(entities, relationships);

      const processingTime = performance.now() - startTime;

      return {
        entities,
        relationships,
        totalEntities: entities.length,
        totalRelationships: relationships.length,
        processingTime,
        confidence
      };
    } catch (error) {
      const processingTime = performance.now() - startTime;

      return {
        entities: [],
        relationships: [],
        totalEntities: 0,
        totalRelationships: 0,
        processingTime,
        confidence: {
          entityExtraction: 0,
          relationshipExtraction: 0,
          overall: 0
        }
      };
    }
  }

  /**
   * Extract entities from text
   */
  private extractEntities(text: string, documentId?: string): KnowledgeEntity[] {
    const entities: KnowledgeEntity[] = [];

    // Extract person entities
    if (this.config.entityTypes?.includes('person')) {
      entities.push(...this.extractPersonEntities(text, documentId));
    }

    // Extract organization entities
    if (this.config.entityTypes?.includes('organization')) {
      entities.push(...this.extractOrganizationEntities(text, documentId));
    }

    // Extract location entities
    if (this.config.entityTypes?.includes('location')) {
      entities.push(...this.extractLocationEntities(text, documentId));
    }

    // Extract concept entities
    if (this.config.entityTypes?.includes('concept')) {
      entities.push(...this.extractConceptEntities(text, documentId));
    }

    // Extract event entities
    if (this.config.entityTypes?.includes('event')) {
      entities.push(...this.extractEventEntities(text, documentId));
    }

    // Extract document entities
    if (this.config.entityTypes?.includes('document')) {
      entities.push(...this.extractDocumentEntities(text, documentId));
    }

    // Extract project entities
    if (this.config.entityTypes?.includes('project')) {
      entities.push(...this.extractProjectEntities(text, documentId));
    }

    // Extract technology entities
    if (this.config.entityTypes?.includes('technology')) {
      entities.push(...this.extractTechnologyEntities(text, documentId));
    }

    // Extract financial metric entities
    if (this.config.entityTypes?.includes('financial_metric')) {
      entities.push(...this.extractFinancialMetricEntities(text, documentId));
    }

    // Extract regulation entities
    if (this.config.entityTypes?.includes('regulation')) {
      entities.push(...this.extractRegulationEntities(text, documentId));
    }

    return entities;
  }

  /**
   * Extract person entities using regex patterns
   */
  private extractPersonEntities(text: string, documentId?: string): KnowledgeEntity[] {
    const entities: KnowledgeEntity[] = [];

    // Pattern for full names (e.g., "John Smith", "Dr. Jane Doe")
    const personPatterns = [
      /\b([A-Z][a-z]+)\s+([A-Z][a-z]+)\b/g, // First Last
      /\b([A-Z][a-z]+)\s+(?:Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.|Rev\.|Sr\.|Jr\.)\s+([A-Z][a-z]+)\b/g, // Title First Last
      /\b(?:Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.|Rev\.|Sr\.|Jr\.)\s+([A-Z][a-z]+)\b/g // Title Last
    ];

    for (const pattern of personPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const name = match[1] || match[2];
        if (name && name.length > 1) {
          entities.push(this.createEntity(
            name,
            'person',
            documentId,
            this.calculateConfidenceScore(0.7)
          ));
        }
      }
    }

    return entities;
  }

  /**
   * Extract organization entities
   */
  private extractOrganizationEntities(text: string, documentId?: string): KnowledgeEntity[] {
    const entities: KnowledgeEntity[] = [];

    // Pattern for company names (e.g., "Acme Corp", "ABC Inc.")
    const orgPatterns = [
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:Corp\.|Corporation|Inc\.|Inc|Ltd\.|Limited|LLC|PLC|Group|Co\.|Company|Systems|Technologies|Solutions)\b/g,
      /\b(?:The\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g
    ];

    for (const pattern of orgPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const name = match[1];
        if (name && name.length > 2) {
          entities.push(this.createEntity(
            name,
            'organization',
            documentId,
            this.calculateConfidenceScore(0.6)
          ));
        }
      }
    }

    return entities;
  }

  /**
   * Extract location entities
   */
  private extractLocationEntities(text: string, documentId?: string): KnowledgeEntity[] {
    const entities: KnowledgeEntity[] = [];

    // Common locations
    const locationPatterns = [
      /\b(?:in|at|from|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/gi,
      /\b(?:city|town|village|country|region|state|province)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/gi
    ];

    for (const pattern of locationPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const name = match[1];
        if (name && name.length > 1) {
          entities.push(this.createEntity(
            name,
            'location',
            documentId,
            this.calculateConfidenceScore(0.5)
          ));
        }
      }
    }

    return entities;
  }

  /**
   * Extract concept entities
   */
  private extractConceptEntities(text: string, documentId?: string): KnowledgeEntity[] {
    const entities: KnowledgeEntity[] = [];

    // Capitalized phrases that are likely concepts
    const conceptPatterns = [
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g
    ];

    for (const pattern of conceptPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const name = match[1];
        // Filter out common words that aren't entities
        const commonWords = ['The', 'This', 'That', 'These', 'Those', 'What', 'When', 'Where', 'Who', 'Which', 'How', 'All', 'Each', 'Every', 'Some', 'Any', 'Both', 'Neither', 'Either', 'None', 'Many', 'Several', 'Few'];
        
        if (name && name.length > 2 && !commonWords.includes(name)) {
          entities.push(this.createEntity(
            name,
            'concept',
            documentId,
            this.calculateConfidenceScore(0.4)
          ));
        }
      }
    }

    return entities;
  }

  /**
   * Extract event entities
   */
  private extractEventEntities(text: string, documentId?: string): KnowledgeEntity[] {
    const entities: KnowledgeEntity[] = [];

    // Event patterns
    const eventPatterns = [
      /\b(?:in|on)\s+(?:the\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:year|decade|century|period|era)\b/gi,
      /\b(?:the\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:war|conflict|battle|conference|summit|meeting|conference|exhibition|festival|celebration|anniversary)\b/gi
    ];

    for (const pattern of eventPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const name = match[1];
        if (name && name.length > 2) {
          entities.push(this.createEntity(
            name,
            'event',
            documentId,
            this.calculateConfidenceScore(0.6)
          ));
        }
      }
    }

    return entities;
  }

  /**
   * Extract document entities
   */
  private extractDocumentEntities(text: string, documentId?: string): KnowledgeEntity[] {
    const entities: KnowledgeEntity[] = [];

    // Document references
    const docPatterns = [
      /\b(?:document|report|paper|article|publication|study|thesis|dissertation|brief|memorandum|letter)\s+(?:of\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/gi,
      /\b(?:the\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:report|paper|article|study)\b/gi
    ];

    for (const pattern of docPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const name = match[1];
        if (name && name.length > 2) {
          entities.push(this.createEntity(
            name,
            'document',
            documentId,
            this.calculateConfidenceScore(0.7)
          ));
        }
      }
    }

    return entities;
  }

  /**
   * Extract project entities
   */
  private extractProjectEntities(text: string, documentId?: string): KnowledgeEntity[] {
    const entities: KnowledgeEntity[] = [];

    // Project patterns
    const projectPatterns = [
      /\b(?:project|initiative|program|campaign|venture)\s+(?:named\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/gi,
      /\b(?:the\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:project|initiative|program)\b/gi
    ];

    for (const pattern of projectPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const name = match[1];
        if (name && name.length > 2) {
          entities.push(this.createEntity(
            name,
            'project',
            documentId,
            this.calculateConfidenceScore(0.65)
          ));
        }
      }
    }

    return entities;
  }

  /**
   * Extract technology entities
   */
  private extractTechnologyEntities(text: string, documentId?: string): KnowledgeEntity[] {
    const entities: KnowledgeEntity[] = [];

    // Technology patterns
    const techPatterns = [
      /\b(?:technology|system|platform|framework|software|hardware|tool|application|service|protocol|standard|algorithm|method|approach)\s+(?:of\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/gi,
      /\b(?:the\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:technology|system|platform|framework)\b/gi
    ];

    for (const pattern of techPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const name = match[1];
        if (name && name.length > 2) {
          entities.push(this.createEntity(
            name,
            'technology',
            documentId,
            this.calculateConfidenceScore(0.6)
          ));
        }
      }
    }

    return entities;
  }

  /**
   * Extract financial metric entities
   */
  private extractFinancialMetricEntities(text: string, documentId?: string): KnowledgeEntity[] {
    const entities: KnowledgeEntity[] = [];

    // Financial patterns
    const financialPatterns = [
      /\b(?:revenue|profit|loss|earnings|margin|growth|debt|equity|stock|share|price|value|valuation|market cap|ROI|ROE|ROA)\s+(?:of\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/gi,
      /\b(?:the\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:revenue|profit|loss|earnings)\b/gi
    ];

    for (const pattern of financialPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const name = match[1];
        if (name && name.length > 2) {
          entities.push(this.createEntity(
            name,
            'financial_metric',
            documentId,
            this.calculateConfidenceScore(0.7)
          ));
        }
      }
    }

    return entities;
  }

  /**
   * Extract regulation entities
   */
  private extractRegulationEntities(text: string, documentId?: string): KnowledgeEntity[] {
    const entities: KnowledgeEntity[] = [];

    // Regulation patterns
    const regulationPatterns = [
      /\b(?:act|law|regulation|standard|rule|guideline|policy|directive|statute|code|ordinance|act|amendment)\s+(?:of\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/gi,
      /\b(?:the\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:act|law|regulation|standard)\b/gi
    ];

    for (const pattern of regulationPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const name = match[1];
        if (name && name.length > 2) {
          entities.push(this.createEntity(
            name,
            'regulation',
            documentId,
            this.calculateConfidenceScore(0.7)
          ));
        }
      }
    }

    return entities;
  }

  /**
   * Extract relationships between entities
   */
  private extractRelationships(
    entities: KnowledgeEntity[],
    text: string,
    documentId?: string
  ): KnowledgeRelationship[] {
    const relationships: KnowledgeRelationship[] = [];

    // Build entity lookup map
    const entityMap = new Map<string, KnowledgeEntity>();
    for (const entity of entities) {
      entityMap.set(entity.name.toLowerCase(), entity);
    }

    // Extract relationships using patterns
    for (const entity of entities) {
      // Extract relationships for this entity
      const entityRelationships = this.extractEntityRelationships(
        entity,
        entities,
        entityMap,
        text,
        documentId
      );
      relationships.push(...entityRelationships);
    }

    return relationships;
  }

  /**
   * Extract relationships for a specific entity
   */
  private extractEntityRelationships(
    entity: KnowledgeEntity,
    allEntities: KnowledgeEntity[],
    entityMap: Map<string, KnowledgeEntity>,
    text: string,
    documentId?: string
  ): KnowledgeRelationship[] {
    const relationships: KnowledgeRelationship[] = [];
    const entityNameLower = entity.name.toLowerCase();

    // Relationship patterns
    const relationshipPatterns = [
      // "mentions" - entity mentions another entity
      {
        pattern: new RegExp(`${entityNameLower}\\s+(?:mentions|refers to|talks about|discusses)\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)`, 'gi'),
        type: 'mentions',
        strength: 0.6
      },
      // "part_of" - entity is part of another
      {
        pattern: new RegExp(`${entityNameLower}\\s+(?:is part of|belongs to|is a member of|is included in)\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)`, 'gi'),
        type: 'part_of',
        strength: 0.8
      },
      // "located_in" - entity is located in another
      {
        pattern: new RegExp(`${entityNameLower}\\s+(?:is located in|based in|headquartered in|operates in)\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)`, 'gi'),
        type: 'located_in',
        strength: 0.7
      },
      // "related_to" - general relationship
      {
        pattern: new RegExp(`${entityNameLower}\\s+(?:is related to|is connected to|has a relationship with)\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)`, 'gi'),
        type: 'related_to',
        strength: 0.5
      },
      // "causes" - causal relationship
      {
        pattern: new RegExp(`${entityNameLower}\\s+(?:causes|leads to|results in|triggers)\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)`, 'gi'),
        type: 'causes',
        strength: 0.8
      },
      // "precedes" - temporal relationship
      {
        pattern: new RegExp(`${entityNameLower}\\s+(?:precedes|comes before|occurs before)\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)`, 'gi'),
        type: 'precedes',
        strength: 0.7
      },
      // "follows" - temporal relationship
      {
        pattern: new RegExp(`${entityNameLower}\\s+(?:follows|comes after|occurs after)\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)`, 'gi'),
        type: 'follows',
        strength: 0.7
      },
      // "contains" - containment relationship
      {
        pattern: new RegExp(`${entityNameLower}\\s+(?:contains|includes|has|features)\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)`, 'gi'),
        type: 'contains',
        strength: 0.6
      },
      // "owned_by" - ownership relationship
      {
        pattern: new RegExp(`${entityNameLower}\\s+(?:is owned by|belongs to|is a subsidiary of)\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)`, 'gi'),
        type: 'owned_by',
        strength: 0.8
      },
      // "funded_by" - funding relationship
      {
        pattern: new RegExp(`${entityNameLower}\\s+(?:is funded by|receives funding from|backed by)\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)`, 'gi'),
        type: 'funded_by',
        strength: 0.7
      },
      // "regulated_by" - regulatory relationship
      {
        pattern: new RegExp(`${entityNameLower}\\s+(?:is regulated by|subject to|governed by)\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)`, 'gi'),
        type: 'regulated_by',
        strength: 0.7
      },
      // "competing_with" - competitive relationship
      {
        pattern: new RegExp(`${entityNameLower}\\s+(?:competes with|rivals|is a competitor of)\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)`, 'gi'),
        type: 'competing_with',
        strength: 0.8
      },
      // "collaborates_with" - collaboration relationship
      {
        pattern: new RegExp(`${entityNameLower}\\s+(?:collaborates with|works with|partners with)\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)`, 'gi'),
        type: 'collaborates_with',
        strength: 0.6
      }
    ];

    for (const relPattern of relationshipPatterns) {
      let match;
      while ((match = relPattern.pattern.exec(text)) !== null) {
        const targetName = match[1];
        const targetEntity = entityMap.get(targetName.toLowerCase());

        if (targetEntity && targetEntity.id !== entity.id) {
          // Check if relationship strength meets threshold
          if (relPattern.strength >= (this.config.minRelationshipStrength || 0.3)) {
            const relationshipId = `${entity.id}-${targetEntity.id}-${relPattern.type}`;
            
            // Check if relationship already exists
            if (!this.relationshipRegistry.has(relationshipId)) {
              const relationship: KnowledgeRelationship = {
                id: relationshipId,
                sourceId: entity.id,
                targetId: targetEntity.id,
                type: relPattern.type as RelationshipType,
                strength: relPattern.strength,
                sourceDocuments: documentId ? [documentId] : undefined,
                createdAt: new Date()
              };
              
              relationships.push(relationship);
              this.relationshipRegistry.set(relationshipId, relationship);
            }
          }
        }
      }
    }

    return relationships;
  }

  /**
   * Create a new knowledge entity
   */
  private createEntity(
    name: string,
    type: EntityType,
    documentId?: string,
    confidence?: number
  ): KnowledgeEntity {
    const id = `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    return {
      id,
      name,
      type,
      description: undefined,
      properties: undefined,
      sourceDocuments: documentId ? [documentId] : undefined,
      confidence: confidence || 0.5,
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * Calculate confidence score based on pattern match
   */
  private calculateConfidenceScore(baseScore: number): number {
    return Math.min(1, Math.max(0, baseScore));
  }

  /**
   * Calculate overall confidence scores
   */
  private calculateConfidence(
    entities: KnowledgeEntity[],
    relationships: KnowledgeRelationship[]
  ): { entityExtraction: number; relationshipExtraction: number; overall: number } {
    const entityConfidence = entities.length > 0
      ? entities.reduce((sum, e) => sum + (e.confidence || 0), 0) / entities.length
      : 0;

    const relationshipConfidence = relationships.length > 0
      ? relationships.reduce((sum, r) => sum + (r.strength || 0), 0) / relationships.length
      : 0;

    return {
      entityExtraction: entityConfidence,
      relationshipExtraction: relationshipConfidence,
      overall: (entityConfidence + relationshipConfidence) / 2
    };
  }

  /**
   * Deduplicate entities
   */
  private deduplicateEntities(entities: KnowledgeEntity[]): void {
    const entityMap = new Map<string, KnowledgeEntity>();

    for (const entity of entities) {
      const key = `${entity.name.toLowerCase()}-${entity.type}`;
      
      if (entityMap.has(key)) {
        // Merge with existing entity
        const existing = entityMap.get(key)!;
        existing.sourceDocuments = [
          ...(existing.sourceDocuments || []),
          ...(entity.sourceDocuments || [])
        ];
        existing.updatedAt = new Date();
      } else {
        entityMap.set(key, entity);
      }
    }

    // Update entities array
    const entries = Array.from(entityMap.entries());
    const dedupedEntities: KnowledgeEntity[] = [];
    for (let i = 0; i < entries.length; i++) {
      const [_, entity] = entries[i];
      dedupedEntities.push(entity);
      // Update aliases if needed
      if (entity.aliases && entity.aliases.length > 0) {
        entity.aliases = entity.aliases.slice(0, this.config.maxAliases);
      }
    }
  }

  /**
   * Get entity registry
   */
  public getEntities(): KnowledgeEntity[] {
    const result: KnowledgeEntity[] = [];
    const values = Array.from(this.entityRegistry.values());
    for (let i = 0; i < values.length; i++) {
      result.push(values[i]);
    }
    return result;
  }

  /**
   * Get relationship registry
   */
  public getRelationships(): KnowledgeRelationship[] {
    const result: KnowledgeRelationship[] = [];
    const values = Array.from(this.relationshipRegistry.values());
    for (let i = 0; i < values.length; i++) {
      result.push(values[i]);
    }
    return result;
  }

  /**
   * Clear all extracted data
   */
  public clear(): void {
    this.entityRegistry.clear();
    this.relationshipRegistry.clear();
  }
}
