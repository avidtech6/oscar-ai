/**
 * Semantic Search Engine for Oscar AI Phase Compliance Package
 * 
 * This file implements the SemanticSearchEngine class for the Semantic Search Layer.
 * It implements Phase 31.5: Semantic Search Layer from the Search Intelligence System.
 * 
 * File: src/lib/search-intelligence/semantic-search.ts
 * Generated as part of Oscar AI Phase Compliance Package implementation
 */

import type {
  SearchQuery,
  SearchResult,
  SearchResultItem,
  VectorEmbedding,
  ContentDocument,
  IndexingResult,
  VectorIndex,
  SearchConfig,
  SearchStatistics,
  HybridSearchResult
} from './search-types.js';

/**
 * Semantic Search Engine for intelligent content search
 * 
 * Features:
 * - Vector embeddings for semantic understanding
 * - Hybrid search combining semantic and keyword search
 * - Content indexing and management
 * - Caching for performance
 * - Search statistics tracking
 */
export class SemanticSearchEngine {
  private config: SearchConfig;
  private index: VectorIndex;
  private documents: Map<string, ContentDocument> = new Map();
  private embeddingCache: Map<string, VectorEmbedding> = new Map();
  private searchCache: Map<string, SearchResult> = new Map();
  private statistics: SearchStatistics;
  private cacheTTL: number;

  constructor(config: SearchConfig = {}) {
    this.config = this.normalizeConfig(config);
    this.cacheTTL = this.config.cacheTTL || 5 * 60 * 1000; // 5 minutes default

    this.index = {
      id: `index_${Date.now()}`,
      dimensions: this.config.vectorDimensions || 768,
      totalVectors: 0,
      size: 0,
      model: 'default-embedding-model',
      type: 'flat',
      timestamp: new Date(),
      statistics: {
        avgVectorLength: 768,
        minVectorLength: 768,
        maxVectorLength: 768,
        sparsity: 0.95
      }
    };

    this.statistics = {
      totalSearches: 0,
      avgSearchTime: 0,
      totalDocuments: 0,
      cacheHitRate: 0,
      lastSearchTime: new Date()
    };
  }

  /**
   * Normalize and validate configuration
   */
  private normalizeConfig(config: SearchConfig): SearchConfig {
    return {
      vectorDimensions: config.vectorDimensions || 768,
      similarityThreshold: config.similarityThreshold || 0.7,
      enableHybridSearch: config.enableHybridSearch ?? true,
      hybridSearchWeight: config.hybridSearchWeight || 0.7,
      enableKeywordSearch: config.enableKeywordSearch ?? true,
      enableSemanticSearch: config.enableSemanticSearch ?? true,
      indexStoragePath: config.indexStoragePath || './search-index',
      useInMemoryIndex: config.useInMemoryIndex ?? true,
      cacheResults: config.cacheResults ?? true,
      cacheTTL: config.cacheTTL || 5 * 60 * 1000
    };
  }

  /**
   * Index a document for search
   */
  public async indexDocument(
    document: ContentDocument,
    embedding?: VectorEmbedding
  ): Promise<IndexingResult> {
    const startTime = performance.now();

    try {
      // Generate embedding if not provided
      if (!embedding) {
        embedding = await this.generateEmbedding(document.content);
      }

      // Store document
      this.documents.set(document.id, document);

      // Store embedding in cache
      this.embeddingCache.set(document.id, embedding);

      // Update index
      this.index.totalVectors++;
      this.index.size += embedding.vector.length * 4; // 4 bytes per float32

      // Update statistics
      this.statistics.totalDocuments++;

      const indexingTime = performance.now() - startTime;

      return {
        indexId: this.index.id,
        documentId: document.id,
        status: 'success',
        embedding,
        indexingTime,
        metadata: {
          dimensions: embedding.dimensions,
          model: embedding.model
        }
      };

    } catch (error) {
      const indexingTime = performance.now() - startTime;

      return {
        indexId: this.index.id,
        documentId: document.id,
        status: 'failed',
        indexingTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Index multiple documents
   */
  public async indexDocuments(
    documents: ContentDocument[]
  ): Promise<IndexingResult[]> {
    const results: IndexingResult[] = [];

    for (const document of documents) {
      const result = await this.indexDocument(document);
      results.push(result);
    }

    return results;
  }

  /**
   * Search for documents using a query
   */
  public async search(query: SearchQuery): Promise<SearchResult> {
    const startTime = performance.now();
    const queryId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check cache
    if (this.config.cacheResults && query.query) {
      const cached = this.searchCache.get(query.query);
      if (cached) {
        const cacheHitRate = this.calculateCacheHitRate();
        return {
          ...cached,
          id: queryId,
          metadata: {
            ...cached.metadata,
            cacheHit: true,
            cacheHitRate
          }
        };
      }
    }

    try {
      const mode = query.mode || 'semantic';
      let results: SearchResultItem[] = [];

      // Perform search based on mode
      if (mode === 'semantic') {
        results = await this.semanticSearch(query);
      } else if (mode === 'keyword') {
        results = await this.keywordSearch(query);
      } else if (mode === 'hybrid') {
        results = await this.hybridSearch(query);
      } else {
        // Default to semantic
        results = await this.semanticSearch(query);
      }

      // Apply filters and sorting
      results = this.applyFilters(results, query.filters);
      results = this.applySorting(results, query.sort);

      // Apply limit
      const limit = query.limit || 10;
      results = results.slice(0, limit);

      const executionTime = performance.now() - startTime;

      const result: SearchResult = {
        id: queryId,
        query: query.query,
        results,
        total: results.length,
        executionTime,
        metadata: {
          mode,
          vectorDimensions: this.index.dimensions,
          indexSize: this.index.size,
          timestamp: new Date()
        }
      };

      // Cache result
      if (this.config.cacheResults && query.query) {
        this.searchCache.set(query.query, result);
      }

      // Update statistics
      this.statistics.totalSearches++;
      this.statistics.avgSearchTime = this.calculateAvgSearchTime(executionTime);
      this.statistics.lastSearchTime = new Date();

      return result;

    } catch (error) {
      const executionTime = performance.now() - startTime;

      return {
        id: queryId,
        query: query.query,
        results: [],
        total: 0,
        executionTime,
        metadata: {
          mode: query.mode || 'semantic',
          vectorDimensions: this.index.dimensions,
          timestamp: new Date()
        }
      };
    }
  }

  /**
   * Semantic search using vector embeddings
   */
  private async semanticSearch(
    query: SearchQuery
  ): Promise<SearchResultItem[]> {
    const results: SearchResultItem[] = [];

    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query.query);

    // Find similar documents
    for (const [docId, document] of Array.from(this.documents.entries())) {
      const docEmbedding = this.embeddingCache.get(docId);
      if (!docEmbedding) {
        continue;
      }

      // Calculate cosine similarity
      const similarity = this.cosineSimilarity(queryEmbedding.vector, docEmbedding.vector);

      if (similarity >= (this.config.similarityThreshold || 0.7)) {
        results.push({
          documentId: docId,
          sectionId: document.sectionId,
          score: similarity,
          title: document.title,
          excerpt: this.generateExcerpt(document.content),
          highlights: this.extractHighlights(query.query, document.content),
          metadata: document.metadata,
          type: document.type,
          url: document.url
        });
      }
    }

    // Sort by score
    results.sort((a, b) => b.score - a.score);

    return results;
  }

  /**
   * Keyword search
   */
  private async keywordSearch(
    query: SearchQuery
  ): Promise<SearchResultItem[]> {
    const results: SearchResultItem[] = [];
    const queryTerms = this.tokenize(query.query.toLowerCase());

    for (const [docId, document] of Array.from(this.documents.entries())) {
      const content = document.content.toLowerCase();
      let matches = 0;
      const highlights: string[] = [];

      // Count keyword matches
      for (const term of queryTerms) {
        const regex = new RegExp(term, 'gi');
        const matchesInContent = content.match(regex);
        if (matchesInContent) {
          matches += matchesInContent.length;
          // Extract first few highlights
          const highlight = content.match(regex)?.[0];
          if (highlight && highlights.length < 3) {
            highlights.push(highlight);
          }
        }
      }

      if (matches > 0) {
        // Calculate score based on matches
        const score = Math.min(1, matches / queryTerms.length);
        results.push({
          documentId: docId,
          sectionId: document.sectionId,
          score,
          title: document.title,
          excerpt: this.generateExcerpt(document.content),
          highlights,
          metadata: document.metadata,
          type: document.type,
          url: document.url
        });
      }
    }

    // Sort by score
    results.sort((a, b) => b.score - a.score);

    return results;
  }

  /**
   * Hybrid search combining semantic and keyword search
   */
  private async hybridSearch(
    query: SearchQuery
  ): Promise<SearchResultItem[]> {
    const semanticResults = await this.semanticSearch(query);
    const keywordResults = await this.keywordSearch(query);

    // Combine results
    const combinedResults = this.combineResults(
      semanticResults,
      keywordResults,
      this.config.hybridSearchWeight || 0.7
    );

    return combinedResults;
  }

  /**
   * Combine semantic and keyword search results
   */
  private combineResults(
    semantic: SearchResultItem[],
    keyword: SearchResultItem[],
    weight: number
  ): SearchResultItem[] {
    const resultMap = new Map<string, SearchResultItem>();

    // Add semantic results
    for (const result of semantic) {
      const existing = resultMap.get(result.documentId);
      if (existing) {
        existing.score = existing.score * (1 - weight) + result.score * weight;
      } else {
        resultMap.set(result.documentId, { ...result, score: result.score * weight });
      }
    }

    // Add keyword results
    for (const result of keyword) {
      const existing = resultMap.get(result.documentId);
      if (existing) {
        existing.score = existing.score * (1 - weight) + result.score * weight;
      } else {
        resultMap.set(result.documentId, { ...result, score: result.score * weight });
      }
    }

    // Convert back to array and sort
    return Array.from(resultMap.values()).sort((a, b) => b.score - a.score);
  }

  /**
   * Generate embedding for text
   * In production, this would use a real embedding model like OpenAI, HuggingFace, etc.
   */
  private async generateEmbedding(text: string): Promise<VectorEmbedding> {
    // Simulate embedding generation
    await this.delay(50);

    // Generate a deterministic pseudo-random embedding
    const vector = this.generatePseudoRandomVector(text, this.index.dimensions);

    return {
      vector,
      dimensions: this.index.dimensions,
      model: 'simulated-embedding',
      timestamp: new Date()
    };
  }

  /**
   * Generate pseudo-random vector for demonstration
   */
  private generatePseudoRandomVector(text: string, dimensions: number): number[] {
    const vector: number[] = [];
    let hash = 0;

    // Simple hash function
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    // Generate deterministic values
    const seed = Math.abs(hash);
    for (let i = 0; i < dimensions; i++) {
      const value = Math.sin(seed + i) * 10000;
      vector.push(value - Math.floor(value));
    }

    return vector;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Tokenize text into terms
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 2);
  }

  /**
   * Generate excerpt from content
   */
  private generateExcerpt(content: string, maxLength: number = 150): string {
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength) + '...';
  }

  /**
   * Extract highlights from content
   */
  private extractHighlights(query: string, content: string): string[] {
    const queryTerms = this.tokenize(query);
    const highlights: string[] = [];
    const contentLower = content.toLowerCase();

    for (const term of queryTerms) {
      const regex = new RegExp(term, 'gi');
      const match = contentLower.match(regex);
      if (match) {
        const highlight = content.match(regex)?.[0];
        if (highlight && !highlights.includes(highlight)) {
          highlights.push(highlight);
        }
      }
    }

    return highlights.slice(0, 3);
  }

  /**
   * Apply filters to results
   */
  private applyFilters(
    results: SearchResultItem[],
    filters?: SearchQuery['filters']
  ): SearchResultItem[] {
    if (!filters) {
      return results;
    }

    return results.filter(result => {
      // Filter by document type
      if (filters.documentTypes && result.type) {
        if (!filters.documentTypes.includes(result.type)) {
          return false;
        }
      }

      // Filter by tags
      if (filters.tags && result.metadata?.tags) {
        const hasTag = filters.tags.some(tag => 
          result.metadata!.tags!.includes(tag)
        );
        if (!hasTag) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Apply sorting to results
   */
  private applySorting(
    results: SearchResultItem[],
    sort?: SearchQuery['sort']
  ): SearchResultItem[] {
    if (!sort) {
      return results;
    }

    const sorted = [...results];
    sorted.sort((a, b) => {
      const aValue = a[sort.field as keyof SearchResultItem];
      const bValue = b[sort.field as keyof SearchResultItem];

      if (aValue === undefined || bValue === undefined) {
        return 0;
      }

      if (aValue === bValue) {
        return 0;
      }

      return sort.direction === 'asc'
        ? (aValue > bValue ? 1 : -1)
        : (aValue < bValue ? 1 : -1);
    });

    return sorted;
  }

  /**
   * Get search statistics
   */
  public getStatistics(): SearchStatistics {
    return { ...this.statistics };
  }

  /**
   * Get vector index information
   */
  public getIndex(): VectorIndex {
    return { ...this.index };
  }

  /**
   * Clear the search cache
   */
  public clearCache(): void {
    this.embeddingCache.clear();
    this.searchCache.clear();
  }

  /**
   * Get document by ID
   */
  public getDocument(documentId: string): ContentDocument | undefined {
    return this.documents.get(documentId);
  }

  /**
   * Remove document from index
   */
  public async removeDocument(documentId: string): Promise<boolean> {
    const document = this.documents.get(documentId);
    if (!document) {
      return false;
    }

    this.documents.delete(documentId);
    this.embeddingCache.delete(documentId);
    this.index.totalVectors--;
    this.index.size -= documentId.length * 4;

    return true;
  }

  /**
   * Clear all indexed documents
   */
  public async clearIndex(): Promise<void> {
    this.documents.clear();
    this.embeddingCache.clear();
    this.index.totalVectors = 0;
    this.index.size = 0;
    this.statistics.totalDocuments = 0;
  }

  /**
   * Calculate cache hit rate
   */
  private calculateCacheHitRate(): number {
    const totalHits = this.statistics.totalSearches;
    const cacheHits = Array.from(this.searchCache.values()).filter(
      r => r.metadata?.cacheHit
    ).length;
    return totalHits > 0 ? cacheHits / totalHits : 0;
  }

  /**
   * Calculate average search time
   */
  private calculateAvgSearchTime(currentTime: number): number {
    if (this.statistics.totalSearches === 0) {
      return currentTime;
    }
    return (
      (this.statistics.avgSearchTime * (this.statistics.totalSearches - 1) + currentTime) /
      this.statistics.totalSearches
    );
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
