/**
 * Semantic Search Types
 * 
 * PHASE 31.5 — Semantic Search Layer
 * Type definitions for semantic search, vector embeddings, and content indexing.
 */

/**
 * Search query configuration
 */
export interface SearchQuery {
  /**
   * Query text
   */
  query: string;

  /**
   * Search mode
   */
  mode?: 'semantic' | 'keyword' | 'hybrid' | 'vector';

  /**
   * Number of results to return
   */
  limit?: number;

  /**
   * Minimum relevance score
   */
  minScore?: number;

  /**
   * Filters
   */
  filters?: SearchFilters;

  /**
   * Sort options
   */
  sort?: SearchSort;

  /**
   * Context window
   */
  context?: {
    documentId?: string;
    sectionId?: string;
    maxDistance?: number;
  };
}

/**
 * Search filters
 */
export interface SearchFilters {
  /**
   * Document types
   */
  documentTypes?: string[];

  /**
   * Date range
   */
  dateRange?: {
    from?: Date;
    to?: Date;
  };

  /**
   * Metadata filters
   */
  metadata?: Record<string, any>;

  /**
   * Tag filters
   */
  tags?: string[];
}

/**
 * Search sort options
 */
export interface SearchSort {
  /**
   * Sort field
   */
  field: string;

  /**
   * Sort direction
   */
  direction: 'asc' | 'desc';
}

/**
 * Search result item
 */
export interface SearchResultItem {
  /**
   * Document ID
   */
  documentId: string;

  /**
   * Section ID
   */
  sectionId?: string;

  /**
   * Relevance score (0-1)
   */
  score: number;

  /**
   * Title
   */
  title?: string;

  /**
   * Excerpt
   */
  excerpt?: string;

  /**
   * Highlighted text
   */
  highlights?: string[];

  /**
   * Metadata
   */
  metadata?: Record<string, any>;

  /**
   * Type
   */
  type?: 'document' | 'section' | 'attachment' | 'annotation';

  /**
   * URL
   */
  url?: string;
}

/**
 * Search result
 */
export interface SearchResult {
  /**
   * Query ID
   */
  id: string;

  /**
   * Query text
   */
  query: string;

  /**
   * Results
   */
  results: SearchResultItem[];

  /**
   * Total count
   */
  total: number;

  /**
   * Execution time
   */
  executionTime: number;

  /**
   * Query metadata
   */
  metadata: {
    mode: string;
    vectorDimensions?: number;
    indexSize?: number;
    cacheHit?: boolean;
    cacheHitRate?: number;
    timestamp: Date;
  };
}

/**
 * Vector embedding
 */
export interface VectorEmbedding {
  /**
   * Vector data (array of numbers)
   */
  vector: number[];

  /**
   * Dimensions
   */
  dimensions: number;

  /**
   * Model used
   */
  model?: string;

  /**
   * Timestamp
   */
  timestamp?: Date;
}

/**
 * Content document for indexing
 */
export interface ContentDocument {
  /**
   * Document ID
   */
  id: string;

  /**
   * Title
   */
  title: string;

  /**
   * Content text
   */
  content: string;

  /**
   * Document type
   */
  type: 'document' | 'section' | 'attachment' | 'annotation';

  /**
   * Metadata
   */
  metadata?: {
    author?: string;
    date?: Date;
    tags?: string[];
    category?: string;
    language?: string;
    [key: string]: any;
  };

  /**
   * URL
   */
  url?: string;

  /**
   * Section ID (for sections)
   */
  sectionId?: string;

  /**
   * Parent document ID
   */
  parentId?: string;
}

/**
 * Indexing result
 */
export interface IndexingResult {
  /**
   * Index ID
   */
  indexId: string;

  /**
   * Document ID
   */
  documentId: string;

  /**
   * Status
   */
  status: 'success' | 'partial' | 'failed';

  /**
   * Vector embedding
   */
  embedding?: VectorEmbedding;

  /**
   * Indexing time
   */
  indexingTime: number;

  /**
   * Error message if failed
   */
  error?: string;

  /**
   * Metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Query result
 */
export interface QueryResult {
  /**
   * Query ID
   */
  id: string;

  /**
   * Query text
   */
  query: string;

  /**
   * Results
   */
  results: SearchResultItem[];

  /**
   * Query time
   */
  queryTime: number;

  /**
   * Vector distance
   */
  vectorDistance?: number;

  /**
   * Keyword matches
   */
  keywordMatches?: string[];

  /**
   * Metadata
   */
  metadata?: {
    mode: string;
    vectorDimensions?: number;
    timestamp: Date;
  };
}

/**
 * Search configuration
 */
export interface SearchConfig {
  /**
   * Vector dimensions
   */
  vectorDimensions?: number;

  /**
   * Similarity threshold
   */
  similarityThreshold?: number;

  /**
   * Enable hybrid search
   */
  enableHybridSearch?: boolean;

  /**
   * Hybrid search weight
   */
  hybridSearchWeight?: number;

  /**
   * Enable keyword search
   */
  enableKeywordSearch?: boolean;

  /**
   * Enable semantic search
   */
  enableSemanticSearch?: boolean;

  /**
   * Index storage path
   */
  indexStoragePath?: string;

  /**
   * Use in-memory index
   */
  useInMemoryIndex?: boolean;

  /**
   * Cache results
   */
  cacheResults?: boolean;

  /**
   * Cache TTL in milliseconds
   */
  cacheTTL?: number;
}

/**
 * Vector index structure
 */
export interface VectorIndex {
  /**
   * Index ID
   */
  id: string;

  /**
   * Vector dimensions
   */
  dimensions: number;

  /**
   * Total vectors
   */
  totalVectors: number;

  /**
   * Index size in bytes
   */
  size: number;

  /**
   * Model used
   */
  model: string;

  /**
   * Index type
   */
  type: 'flat' | 'hnsw' | 'ivf';

  /**
   * Index timestamp
   */
  timestamp: Date;

  /**
   * Statistics
   */
  statistics?: {
    avgVectorLength: number;
    minVectorLength: number;
    maxVectorLength: number;
    sparsity: number;
  };
}

/**
 * Hybrid search result combining semantic and keyword results
 */
export interface HybridSearchResult {
  /**
   * Query ID
   */
  id: string;

  /**
   * Query text
   */
  query: string;

  /**
   * Semantic results
   */
  semanticResults: SearchResultItem[];

  /**
   * Keyword results
   */
  keywordResults: SearchResultItem[];

  /**
   * Combined results
   */
  combinedResults: SearchResultItem[];

  /**
   * Scores
   */
  scores: {
    semantic: number;
    keyword: number;
    combined: number;
  };

  /**
   * Execution time
   */
  executionTime: number;
}

/**
 * Search statistics
 */
export interface SearchStatistics {
  /**
   * Total searches performed
   */
  totalSearches: number;

  /**
   * Average search time
   */
  avgSearchTime: number;

  /**
   * Total documents indexed
   */
  totalDocuments: number;

  /**
   * Cache hit rate
   */
  cacheHitRate: number;

  /**
   * Last search time
   */
  lastSearchTime: Date;
}
