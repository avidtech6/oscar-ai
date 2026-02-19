/**
 * Knowledge Graph Integration - Phase 12
 * 
 * Domain knowledge representation for arboricultural concepts.
 * Provides concept hierarchy, relationship types, inference rules,
 * and integration with existing data.
 */

import { Entity, Relationship, KnowledgeGraphLink } from '../AIReasoningResult';

/**
 * Knowledge Graph Concept
 */
export interface KnowledgeGraphConcept {
  /** Unique concept ID */
  id: string;
  
  /** Concept name */
  name: string;
  
  /** Concept type (e.g., 'species', 'disease', 'technique', 'standard', 'location') */
  type: string;
  
  /** Concept description */
  description: string;
  
  /** Parent concepts (broader concepts) */
  parents: string[];
  
  /** Child concepts (narrower concepts) */
  children: string[];
  
  /** Properties of the concept */
  properties: Record<string, any>;
  
  /** Relationships to other concepts */
  relationships: ConceptRelationship[];
  
  /** Inference rules associated with this concept */
  inferenceRules: InferenceRule[];
  
  /** Confidence in concept definition (0-100) */
  confidence: number;
  
  /** Source of concept definition */
  source: string;
  
  /** Last updated timestamp */
  updatedAt: Date;
}

/**
 * Concept Relationship
 */
export interface ConceptRelationship {
  /** Relationship type (e.g., 'part_of', 'causes', 'treats', 'requires', 'conflicts_with') */
  type: string;
  
  /** Target concept ID */
  targetConceptId: string;
  
  /** Relationship strength (0-1) */
  strength: number;
  
  /** Evidence for relationship */
  evidence: string[];
  
  /** Confidence in relationship (0-100) */
  confidence: number;
}

/**
 * Inference Rule
 */
export interface InferenceRule {
  /** Rule ID */
  id: string;
  
  /** Rule name */
  name: string;
  
  /** Rule pattern (in logical form) */
  pattern: string;
  
  /** Rule type (e.g., 'logical', 'temporal', 'spatial', 'causal') */
  type: string;
  
  /** Conditions for rule application */
  conditions: Condition[];
  
  /** Conclusions from rule application */
  conclusions: Conclusion[];
  
  /** Confidence in rule (0-100) */
  confidence: number;
}

/**
 * Condition for inference rule
 */
export interface Condition {
  /** Condition type (e.g., 'concept_present', 'property_value', 'relationship_exists') */
  type: string;
  
  /** Condition parameters */
  parameters: Record<string, any>;
  
  /** Required confidence for condition (0-100) */
  requiredConfidence: number;
}

/**
 * Conclusion from inference rule
 */
export interface Conclusion {
  /** Conclusion type (e.g., 'new_concept', 'new_relationship', 'property_inference') */
  type: string;
  
  /** Conclusion parameters */
  parameters: Record<string, any>;
  
  /** Confidence in conclusion (0-100) */
  confidence: number;
}

/**
 * Knowledge Graph Configuration
 */
export interface KnowledgeGraphConfiguration {
  /** Enable automatic concept learning */
  enableConceptLearning: boolean;
  
  /** Enable relationship inference */
  enableRelationshipInference: boolean;
  
  /** Enable rule-based reasoning */
  enableRuleBasedReasoning: boolean;
  
  /** Maximum concepts to store */
  maxConcepts: number;
  
  /** Maximum relationships per concept */
  maxRelationshipsPerConcept: number;
  
  /** Confidence threshold for concepts (0-100) */
  conceptConfidenceThreshold: number;
  
  /** Confidence threshold for relationships (0-100) */
  relationshipConfidenceThreshold: number;
  
  /** Domain-specific ontologies to load */
  ontologies: string[];
}

/**
 * Default Knowledge Graph Configuration
 */
export const DEFAULT_KNOWLEDGE_GRAPH_CONFIG: KnowledgeGraphConfiguration = {
  enableConceptLearning: true,
  enableRelationshipInference: true,
  enableRuleBasedReasoning: true,
  maxConcepts: 1000,
  maxRelationshipsPerConcept: 20,
  conceptConfidenceThreshold: 70,
  relationshipConfidenceThreshold: 65,
  ontologies: ['arboriculture', 'tree_species', 'compliance_standards']
};

/**
 * Knowledge Graph
 */
export class KnowledgeGraph {
  private configuration: KnowledgeGraphConfiguration;
  private concepts: Map<string, KnowledgeGraphConcept>;
  private conceptIndex: Map<string, string[]>; // Type to concept IDs
  private relationshipIndex: Map<string, ConceptRelationship[]>; // Concept ID to relationships
  
  /**
   * Create a new Knowledge Graph
   */
  constructor(configuration: Partial<KnowledgeGraphConfiguration> = {}) {
    this.configuration = { ...DEFAULT_KNOWLEDGE_GRAPH_CONFIG, ...configuration };
    this.concepts = new Map();
    this.conceptIndex = new Map();
    this.relationshipIndex = new Map();
    
    // Initialize with built-in concepts
    this.initializeBuiltInConcepts();
  }
  
  /**
   * Initialize with built-in arboricultural concepts
   */
  private initializeBuiltInConcepts(): void {
    // Tree species concepts
    const treeSpecies = [
      { id: 'concept-tree-species-oak', name: 'Oak', type: 'species', scientificName: 'Quercus robur' },
      { id: 'concept-tree-species-maple', name: 'Maple', type: 'species', scientificName: 'Acer pseudoplatanus' },
      { id: 'concept-tree-species-pine', name: 'Pine', type: 'species', scientificName: 'Pinus sylvestris' },
      { id: 'concept-tree-species-birch', name: 'Birch', type: 'species', scientificName: 'Betula pendula' },
      { id: 'concept-tree-species-ash', name: 'Ash', type: 'species', scientificName: 'Fraxinus excelsior' },
      { id: 'concept-tree-species-beech', name: 'Beech', type: 'species', scientificName: 'Fagus sylvatica' }
    ];
    
    // Arboricultural technique concepts
    const techniques = [
      { id: 'concept-technique-pruning', name: 'Pruning', type: 'technique' },
      { id: 'concept-technique-felling', name: 'Felling', type: 'technique' },
      { id: 'concept-technique-pollarding', name: 'Pollarding', type: 'technique' },
      { id: 'concept-technique-crown-reduction', name: 'Crown Reduction', type: 'technique' },
      { id: 'concept-technique-crown-lifting', name: 'Crown Lifting', type: 'technique' },
      { id: 'concept-technique-crown-thinning', name: 'Crown Thinning', type: 'technique' }
    ];
    
    // Compliance standard concepts
    const standards = [
      { id: 'concept-standard-bs5837', name: 'BS5837:2012', type: 'standard' },
      { id: 'concept-standard-bs3998', name: 'BS3998', type: 'standard' },
      { id: 'concept-standard-aia', name: 'Arboricultural Impact Assessment', type: 'standard' },
      { id: 'concept-standard-ams', name: 'Arboricultural Method Statement', type: 'standard' }
    ];
    
    // Tree condition concepts
    const conditions = [
      { id: 'concept-condition-decay', name: 'Decay', type: 'condition' },
      { id: 'concept-condition-fungus', name: 'Fungus', type: 'condition' },
      { id: 'concept-condition-cavity', name: 'Cavity', type: 'condition' },
      { id: 'concept-condition-crack', name: 'Crack', type: 'condition' },
      { id: 'concept-condition-split', name: 'Split', type: 'condition' },
      { id: 'concept-condition-lean', name: 'Lean', type: 'condition' },
      { id: 'concept-condition-deadwood', name: 'Deadwood', type: 'condition' }
    ];
    
    // Add all concepts
    const allConcepts = [...treeSpecies, ...techniques, ...standards, ...conditions];
    
    for (const conceptData of allConcepts) {
      const concept: KnowledgeGraphConcept = {
        id: conceptData.id,
        name: conceptData.name,
        type: conceptData.type,
        description: this.generateConceptDescription(conceptData),
        parents: this.getParentConcepts(conceptData),
        children: [],
        properties: { ...conceptData },
        relationships: this.getInitialRelationships(conceptData),
        inferenceRules: this.getInferenceRules(conceptData),
        confidence: 95,
        source: 'built-in',
        updatedAt: new Date()
      };
      
      this.addConcept(concept);
    }
    
    // Build parent-child relationships
    this.buildHierarchy();
  }
  
  /**
   * Generate concept description
   */
  private generateConceptDescription(conceptData: any): string {
    switch (conceptData.type) {
      case 'species':
        return `${conceptData.name} (${conceptData.scientificName}) - A tree species commonly found in arboricultural surveys.`;
      case 'technique':
        return `${conceptData.name} - An arboricultural technique used in tree management.`;
      case 'standard':
        return `${conceptData.name} - A compliance standard for arboricultural work.`;
      case 'condition':
        return `${conceptData.name} - A tree condition that may require assessment or intervention.`;
      default:
        return `${conceptData.name} - An arboricultural concept.`;
    }
  }
  
  /**
   * Get parent concepts for a concept
   */
  private getParentConcepts(conceptData: any): string[] {
    switch (conceptData.type) {
      case 'species':
        return ['concept-category-tree-species'];
      case 'technique':
        return ['concept-category-technique'];
      case 'standard':
        return ['concept-category-standard'];
      case 'condition':
        return ['concept-category-condition'];
      default:
        return [];
    }
  }
  
  /**
   * Get initial relationships for a concept
   */
  private getInitialRelationships(conceptData: any): ConceptRelationship[] {
    const relationships: ConceptRelationship[] = [];
    
    // Add type-specific relationships
    switch (conceptData.type) {
      case 'species':
        // Tree species relationships
        relationships.push({
          type: 'instance_of',
          targetConceptId: 'concept-category-tree-species',
          strength: 1.0,
          evidence: ['built-in ontology'],
          confidence: 100
        });
        
        // Add relationships between specific species
        if (conceptData.name === 'Oak') {
          relationships.push({
            type: 'commonly_requires',
            targetConceptId: 'concept-technique-pruning',
            strength: 0.8,
            evidence: ['expert knowledge'],
            confidence: 85
          });
        }
        break;
        
      case 'technique':
        // Technique relationships
        relationships.push({
          type: 'instance_of',
          targetConceptId: 'concept-category-technique',
          strength: 1.0,
          evidence: ['built-in ontology'],
          confidence: 100
        });
        
        // Pruning requires assessment
        if (conceptData.name === 'Pruning') {
          relationships.push({
            type: 'requires',
            targetConceptId: 'concept-condition-assessment',
            strength: 0.9,
            evidence: ['best practice'],
            confidence: 90
          });
        }
        break;
        
      case 'condition':
        // Condition relationships
        relationships.push({
          type: 'instance_of',
          targetConceptId: 'concept-category-condition',
          strength: 1.0,
          evidence: ['built-in ontology'],
          confidence: 100
        });
        
        // Decay may require intervention
        if (conceptData.name === 'Decay') {
          relationships.push({
            type: 'may_require',
            targetConceptId: 'concept-technique-felling',
            strength: 0.7,
            evidence: ['risk assessment'],
            confidence: 80
          });
        }
        break;
    }
    
    return relationships;
  }
  
  /**
   * Get inference rules for a concept
   */
  private getInferenceRules(conceptData: any): InferenceRule[] {
    const rules: InferenceRule[] = [];
    
    // Add type-specific inference rules
    switch (conceptData.type) {
      case 'condition':
        if (conceptData.name === 'Decay') {
          rules.push({
            id: `rule-${conceptData.id}-risk`,
            name: 'Decay Risk Inference',
            pattern: 'IF tree has decay AND decay is extensive THEN risk is high',
            type: 'causal',
            conditions: [
              {
                type: 'concept_present',
                parameters: { conceptId: conceptData.id },
                requiredConfidence: 80
              },
              {
                type: 'property_value',
                parameters: { property: 'extent', operator: '>', value: 'moderate' },
                requiredConfidence: 70
              }
            ],
            conclusions: [
              {
                type: 'property_inference',
                parameters: { property: 'risk_level', value: 'high' },
                confidence: 85
              }
            ],
            confidence: 80
          });
        }
        break;
        
      case 'species':
        if (conceptData.name === 'Oak') {
          rules.push({
            id: `rule-${conceptData.id}-protection`,
            name: 'Oak Tree Protection',
            pattern: 'IF tree is oak AND in conservation area THEN protection required',
            type: 'logical',
            conditions: [
              {
                type: 'concept_present',
                parameters: { conceptId: conceptData.id },
                requiredConfidence: 90
              },
              {
                type: 'property_value',
                parameters: { property: 'location_type', value: 'conservation_area' },
                requiredConfidence: 80
              }
            ],
            conclusions: [
              {
                type: 'new_concept',
                parameters: { conceptId: 'concept-requirement-protection' },
                confidence: 95
              }
            ],
            confidence: 90
          });
        }
        break;
    }
    
    return rules;
  }
  
  /**
   * Build concept hierarchy
   */
  private buildHierarchy(): void {
    // Add category concepts
    const categories = [
      {
        id: 'concept-category-tree-species',
        name: 'Tree Species',
        type: 'category',
        description: 'Category for tree species concepts'
      },
      {
        id: 'concept-category-technique',
        name: 'Arboricultural Techniques',
        type: 'category',
        description: 'Category for arboricultural technique concepts'
      },
      {
        id: 'concept-category-standard',
        name: 'Compliance Standards',
        type: 'category',
        description: 'Category for compliance standard concepts'
      },
      {
        id: 'concept-category-condition',
        name: 'Tree Conditions',
        type: 'category',
        description: 'Category for tree condition concepts'
      }
    ];
    
    for (const categoryData of categories) {
      const concept: KnowledgeGraphConcept = {
        id: categoryData.id,
        name: categoryData.name,
        type: 'category',
        description: categoryData.description,
        parents: [],
        children: [],
        properties: { ...categoryData },
        relationships: [],
        inferenceRules: [],
        confidence: 100,
        source: 'built-in',
        updatedAt: new Date()
      };
      
      this.addConcept(concept);
    }
    
    // Update child relationships for all concepts
    for (const [conceptId, concept] of this.concepts) {
      for (const parentId of concept.parents) {
        const parent = this.concepts.get(parentId);
        if (parent && !parent.children.includes(conceptId)) {
          parent.children.push(conceptId);
        }
      }
    }
  }
  
  /**
   * Add a concept to the knowledge graph
   */
  addConcept(concept: KnowledgeGraphConcept): boolean {
    if (this.concepts.has(concept.id)) {
      return false; // Concept already exists
    }
    
    // Check confidence threshold
    if (concept.confidence < this.configuration.conceptConfidenceThreshold) {
      return false;
    }
    
    // Add to concepts map
    this.concepts.set(concept.id, concept);
    
    // Add to type index
    if (!this.conceptIndex.has(concept.type)) {
      this.conceptIndex.set(concept.type, []);
    }
    this.conceptIndex.get(concept.type)!.push(concept.id);
    
    // Add to relationship index
    this.relationshipIndex.set(concept.id, concept.relationships);
    
    // Prune if exceeding maximum concepts
    if (this.concepts.size > this.configuration.maxConcepts) {
      this.pruneConcepts();
    }
    
    return true;
  }
  
  /**
   * Prune low-confidence concepts when exceeding maximum
   */
  private pruneConcepts(): void {
    // Convert to array and sort by confidence
    const conceptsArray = Array.from(this.concepts.entries());
    conceptsArray.sort((a, b) => a[1].confidence - b[1].confidence);
    
    // Remove lowest confidence concepts
    const toRemove = conceptsArray.slice(0, this.concepts.size - this.configuration.maxConcepts);
    
    for (const [conceptId] of toRemove) {
      this.removeConcept(conceptId);
    }
  }
  
  /**
   * Remove a concept from the knowledge graph
   */
  removeConcept(conceptId: string): boolean {
    const concept = this.concepts.get(conceptId);
    if (!concept) {
      return false;
    }
    
    // Remove from concepts map
    this.concepts.delete(conceptId);
    
    // Remove from type index
    const typeIndex = this.conceptIndex.get(concept.type);
    if (typeIndex) {
      const index = typeIndex.indexOf(conceptId);
      if (index > -1) {
        typeIndex.splice(index, 1);
      }
    }
    
    // Remove from relationship index
    this.relationshipIndex.delete(conceptId);
    
    // Remove from parent's children lists
    for (const parentId of concept.parents) {
      const parent = this.concepts.get(parentId);
      if (parent) {
        const childIndex = parent.children.indexOf(conceptId);
        if (childIndex > -1) {
          parent.children.splice(childIndex, 1);
        }
      }
    }
    
    // Remove from children's parent lists
    for (const childId of concept.children) {
      const child = this.concepts.get(childId);
      if (child) {
        const parentIndex = child.parents.indexOf(conceptId);
        if (parentIndex > -1) {
          child.parents.splice(parentIndex, 1);
        }
      }
    }
    
    return true;
  }
  
  /**
   * Get a concept by ID
   */
  getConcept(conceptId: string): KnowledgeGraphConcept | null {
    return this.concepts.get(conceptId) || null;
  }
  
  /**
   * Get concepts by type
   */
  getConceptsByType(type: string): KnowledgeGraphConcept[] {
    const conceptIds = this.conceptIndex.get(type) || [];
    return conceptIds.map(id => this.concepts.get(id)!).filter(Boolean);
  }
  
  /**
   * Search concepts by name or description
   */
  searchConcepts(query: string, limit: number = 10): KnowledgeGraphConcept[] {
    const results: Array<{ concept: KnowledgeGraphConcept; score: number }> = [];
    const queryLower = query.toLowerCase();
    
    for (const concept of this.concepts.values()) {
      let score = 0;
      
      // Name match (highest weight)
      if (concept.name.toLowerCase().includes(queryLower)) {
        score += 100;
      }
      
      // Description match
      if (concept.description.toLowerCase().includes(queryLower)) {
        score += 50;
      }
      
      // Property match
      for (const [key, value] of Object.entries(concept.properties)) {
        if (typeof value === 'string' && value.toLowerCase().includes(queryLower)) {
          score += 30;
        }
      }
      
      if (score > 0) {
        results.push({ concept, score });
      }
    }
    
    // Sort by score and limit results
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit).map(r => r.concept);
  }
  
  /**
   * Get relationships for a concept
   */
  getConceptRelationships(conceptId: string): ConceptRelationship[] {
    return this.relationshipIndex.get(conceptId) || [];
  }
  
  /**
   * Add a relationship between concepts
   */
  addRelationship(sourceConceptId: string, relationship: ConceptRelationship): boolean {
    const sourceConcept = this.concepts.get(sourceConceptId);
    const targetConcept = this.concepts.get(relationship.targetConceptId);
    
    if (!sourceConcept || !targetConcept) {
      return false;
    }
    
    // Check confidence threshold
    if (relationship.confidence < this.configuration.relationshipConfidenceThreshold) {
      return false;
    }
    
    // Check if relationship already exists
    const existingRelationships = this.relationshipIndex.get(sourceConceptId) || [];
    const existing = existingRelationships.find(
      rel => rel.type === relationship.type && rel.targetConceptId === relationship.targetConceptId
    );
    
    if (existing) {
      // Update existing relationship
      Object.assign(existing, relationship);
      return true;
    }
    
    // Add new relationship
    existingRelationships.push(relationship);
    this.relationshipIndex.set(sourceConceptId, existingRelationships);
    
    // Update concept's relationships
    sourceConcept.relationships = existingRelationships;
    
    // Prune if exceeding maximum relationships per concept
    if (existingRelationships.length > this.configuration.maxRelationshipsPerConcept) {
      this.pruneRelationships(sourceConceptId);
    }
    
    return true;
  }
  
  /**
   * Prune low-confidence relationships for a concept
   */
  private pruneRelationships(conceptId: string): void {
    const relationships = this.relationshipIndex.get(conceptId);
    if (!relationships) return;
    
    // Sort by confidence
    relationships.sort((a, b) => a.confidence - b.confidence);
    
    // Remove lowest confidence relationships
    const toRemove = relationships.slice(0, relationships.length - this.configuration.maxRelationshipsPerConcept);
    for (const relationship of toRemove) {
      const index = relationships.indexOf(relationship);
      if (index > -1) {
        relationships.splice(index, 1);
      }
    }
    
    // Update concept
    const concept = this.concepts.get(conceptId);
    if (concept) {
      concept.relationships = relationships;
    }
  }
  
  /**
   * Remove a relationship between concepts
   */
  removeRelationship(sourceConceptId: string, relationshipType: string, targetConceptId: string): boolean {
    const relationships = this.relationshipIndex.get(sourceConceptId);
    if (!relationships) return false;
    
    const index = relationships.findIndex(
      rel => rel.type === relationshipType && rel.targetConceptId === targetConceptId
    );
    
    if (index === -1) return false;
    
    relationships.splice(index, 1);
    
    // Update concept
    const concept = this.concepts.get(sourceConceptId);
    if (concept) {
      concept.relationships = relationships;
    }
    
    return true;
  }
  
  /**
   * Find concepts related to a given concept
   */
  findRelatedConcepts(conceptId: string, relationshipType?: string, limit: number = 10): KnowledgeGraphConcept[] {
    const relationships = this.relationshipIndex.get(conceptId) || [];
    const filteredRelationships = relationshipType
      ? relationships.filter(rel => rel.type === relationshipType)
      : relationships;
    
    // Sort by relationship strength
    filteredRelationships.sort((a, b) => b.strength - a.strength);
    
    // Get related concepts
    const relatedConcepts: KnowledgeGraphConcept[] = [];
    for (const relationship of filteredRelationships.slice(0, limit)) {
      const concept = this.concepts.get(relationship.targetConceptId);
      if (concept) {
        relatedConcepts.push(concept);
      }
    }
    
    return relatedConcepts;
  }
  
  /**
   * Infer new concepts based on existing data and rules
   */
  inferConcepts(entities: Entity[], context?: any): KnowledgeGraphConcept[] {
    if (!this.configuration.enableRuleBasedReasoning) {
      return [];
    }
    
    const inferredConcepts: KnowledgeGraphConcept[] = [];
    
    // Apply inference rules from all concepts
    for (const concept of this.concepts.values()) {
      for (const rule of concept.inferenceRules) {
        const inferred = this.applyInferenceRule(rule, entities, context);
        if (inferred) {
          inferredConcepts.push(inferred);
        }
      }
    }
    
    return inferredConcepts;
  }
  
  /**
   * Apply an inference rule to entities
   */
  private applyInferenceRule(rule: InferenceRule, entities: Entity[], context?: any): KnowledgeGraphConcept | null {
    // Check all conditions are met
    for (const condition of rule.conditions) {
      if (!this.checkCondition(condition, entities, context)) {
        return null; // Condition not met
      }
    }
    
    // All conditions met, apply conclusions
    // For simplicity, we'll create a new concept based on the first conclusion
    if (rule.conclusions.length === 0) {
      return null;
    }
    
    const conclusion = rule.conclusions[0];
    
    // Create inferred concept
    const inferredConcept: KnowledgeGraphConcept = {
      id: `inferred-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `Inferred from ${rule.name}`,
      type: 'inferred',
      description: `Concept inferred by rule: ${rule.name}`,
      parents: [],
      children: [],
      properties: {
        ruleId: rule.id,
        sourceEntities: entities.map(e => e.id),
        ...conclusion.parameters
      },
      relationships: [],
      inferenceRules: [],
      confidence: conclusion.confidence,
      source: 'inference',
      updatedAt: new Date()
    };
    
    // Add to knowledge graph
    if (this.addConcept(inferredConcept)) {
      return inferredConcept;
    }
    
    return null;
  }
  
  /**
   * Check if a condition is met
   */
  private checkCondition(condition: Condition, entities: Entity[], context?: any): boolean {
    switch (condition.type) {
      case 'concept_present':
        // Check if a specific concept is represented in entities
        const conceptId = condition.parameters.conceptId;
        // Simplified check - in reality would map entities to concepts
        return Math.random() > 0.3; // Simulated check
        
      case 'property_value':
        // Check if entities have specific property values
        // Simplified implementation
        return Math.random() > 0.4;
        
      default:
        return false;
    }
  }
  
  /**
   * Link entities to knowledge graph concepts
   */
  linkEntitiesToConcepts(entities: Entity[]): KnowledgeGraphLink[] {
    const links: KnowledgeGraphLink[] = [];
    
    for (const entity of entities) {
      // Search for matching concepts
      const matchingConcepts = this.searchConcepts(entity.text, 3);
      
      for (const concept of matchingConcepts) {
        // Calculate match confidence
        let confidence = 70; // Base confidence
        
        // Increase confidence based on entity type and concept type match
        if (entity.type === 'species' && concept.type === 'species') {
          confidence += 20;
        } else if (entity.type === 'arboricultural_term' && concept.type === 'technique') {
          confidence += 15;
        } else if (entity.type === 'compliance_term' && concept.type === 'standard') {
          confidence += 25;
        }
        
        // Add link if confidence meets threshold
        if (confidence >= this.configuration.conceptConfidenceThreshold) {
          links.push({
            conceptId: concept.id,
            type: 'instance_of',
            confidence
          });
          
          // Add to entity's knowledge graph links
          entity.knowledgeGraphLinks.push({
            conceptId: concept.id,
            type: 'instance_of',
            confidence
          });
        }
      }
    }
    
    return links;
  }
  
  /**
   * Update configuration
   */
  updateConfiguration(newConfig: Partial<KnowledgeGraphConfiguration>): void {
    this.configuration = { ...this.configuration, ...newConfig };
  }
  
  /**
   * Get current configuration
   */
  getConfiguration(): KnowledgeGraphConfiguration {
    return { ...this.configuration };
  }
  
  /**
   * Get statistics about the knowledge graph
   */
  getStatistics(): {
    totalConcepts: number;
    conceptsByType: Record<string, number>;
    totalRelationships: number;
    averageRelationshipsPerConcept: number;
    mostConnectedConcepts: Array<{ conceptId: string; name: string; relationshipCount: number }>;
  } {
    const conceptsByType: Record<string, number> = {};
    let totalRelationships = 0;
    
    // Count concepts by type
    for (const concept of this.concepts.values()) {
      conceptsByType[concept.type] = (conceptsByType[concept.type] || 0) + 1;
      totalRelationships += concept.relationships.length;
    }
    
    // Find most connected concepts
    const conceptConnections = Array.from(this.concepts.values())
      .map(concept => ({
        conceptId: concept.id,
        name: concept.name,
        relationshipCount: concept.relationships.length
      }))
      .sort((a, b) => b.relationshipCount - a.relationshipCount)
      .slice(0, 5);
    
    return {
      totalConcepts: this.concepts.size,
      conceptsByType,
      totalRelationships,
      averageRelationshipsPerConcept: this.concepts.size > 0 ? totalRelationships / this.concepts.size : 0,
      mostConnectedConcepts: conceptConnections
    };
  }
  
  /**
   * Export knowledge graph to JSON
   */
  exportToJson(): string {
    const exportData = {
      configuration: this.configuration,
      concepts: Array.from(this.concepts.values()),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    
    return JSON.stringify(exportData, null, 2);
  }
  
  /**
   * Import knowledge graph from JSON
   */
  importFromJson(json: string): boolean {
    try {
      const importData = JSON.parse(json);
      
      // Clear existing data
      this.concepts.clear();
      this.conceptIndex.clear();
      this.relationshipIndex.clear();
      
      // Import concepts
      if (Array.isArray(importData.concepts)) {
        for (const conceptData of importData.concepts) {
          // Convert string dates back to Date objects
          const concept: KnowledgeGraphConcept = {
            ...conceptData,
            updatedAt: new Date(conceptData.updatedAt)
          };
          this.addConcept(concept);
        }
      }
      
      // Update configuration if provided
      if (importData.configuration) {
        this.configuration = { ...this.configuration, ...importData.configuration };
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import knowledge graph:', error);
      return false;
    }
  }
}
