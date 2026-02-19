/**
 * Knowledge Graph Integration - Phase 12
 * 
 * Exports for the Knowledge Graph module components.
 */

export * from './KnowledgeGraph';
export { DEFAULT_KNOWLEDGE_GRAPH_CONFIG } from './KnowledgeGraph';
export type {
  KnowledgeGraphConfiguration,
  KnowledgeGraphConcept,
  ConceptRelationship,
  InferenceRule,
  Condition,
  Conclusion
} from './KnowledgeGraph';

// Note: Additional knowledge graph components will be exported here as they are implemented
// - ArboriculturalOntology
// - ConceptMapper
// - RelationshipExtractor
// - etc.