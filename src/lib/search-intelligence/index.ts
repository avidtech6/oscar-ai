/**
 * Semantic Search System Index
 * 
 * PHASE 31.5 — Semantic Search Layer
 * Required Systems: Search Intelligence System
 * 
 * This module provides semantic search capabilities using vector embeddings,
 * hybrid search, and AI-driven search enhancements.
 */

export { SemanticSearchEngine } from './semantic-search.js';
export type {
  SearchQuery,
  SearchResult,
  SearchResultItem,
  VectorEmbedding,
  ContentDocument,
  IndexingResult,
  QueryResult,
  SearchConfig,
  VectorIndex,
  HybridSearchResult
} from './search-types.js';
