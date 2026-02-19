/**
 * AI Reasoning Storage and Context Management - Phase 12.10
 * 
 * Service for storing, retrieving, and managing AI reasoning results,
 * context data, and historical reasoning patterns.
 */

import { AIReasoningResult } from '../AIReasoningResult';
import { KnowledgeGraph } from '../knowledge/KnowledgeGraph';

/**
 * Storage Configuration
 */
export interface ReasoningStorageConfiguration {
  /** Enable persistent storage */
  enablePersistentStorage: boolean;
  
  /** Storage backend type (memory, indexeddb, filesystem, api) */
  storageBackend: 'memory' | 'indexeddb' | 'filesystem' | 'api';
  
  /** Maximum stored results */
  maxStoredResults: number;
  
  /** Enable result compression */
  enableCompression: boolean;
  
  /** Enable encryption */
  enableEncryption: boolean;
  
  /** Retention period in days (0 = infinite) */
  retentionDays: number;
  
  /** Enable automatic cleanup */
  enableAutoCleanup: boolean;
  
  /** Enable context caching */
  enableContextCaching: boolean;
  
  /** Cache size limit in MB */
  cacheSizeLimitMb: number;
  
  /** Enable versioning */
  enableVersioning: boolean;
  
  /** Storage timeout in milliseconds */
  storageTimeoutMs: number;
}

/**
 * Default Storage Configuration
 */
export const DEFAULT_STORAGE_CONFIG: ReasoningStorageConfiguration = {
  enablePersistentStorage: true,
  storageBackend: 'memory',
  maxStoredResults: 1000,
  enableCompression: true,
  enableEncryption: false,
  retentionDays: 30,
  enableAutoCleanup: true,
  enableContextCaching: true,
  cacheSizeLimitMb: 100,
  enableVersioning: true,
  storageTimeoutMs: 3000
};

/**
 * Stored Reasoning Result
 */
export interface StoredReasoningResult {
  /** Storage ID */
  storageId: string;
  
  /** Original reasoning result */
  reasoningResult: AIReasoningResult;
  
  /** Storage timestamp */
  storedAt: Date;
  
  /** Access count */
  accessCount: number;
  
  /** Last accessed timestamp */
  lastAccessed: Date;
  
  /** Storage metadata */
  metadata: {
    sizeBytes: number;
    compressed: boolean;
    encrypted: boolean;
    version: string;
  };
  
  /** Tags for categorization */
  tags: string[];
  
  /** Related context IDs */
  relatedContextIds: string[];
}

/**
 * Reasoning Context
 */
export interface ReasoningContext {
  /** Context ID */
  id: string;
  
  /** Context name */
  name: string;
  
  /** Context description */
  description: string;
  
  /** Context type (project, report, user, session, domain) */
  type: string;
  
  /** Context data */
  data: Record<string, any>;
  
  /** Created timestamp */
  createdAt: Date;
  
  /** Updated timestamp */
  updatedAt: Date;
  
  /** Expiration timestamp (optional) */
  expiresAt?: Date;
  
  /** Parent context ID (for hierarchical contexts) */
  parentContextId?: string;
  
  /** Child context IDs */
  childContextIds: string[];
  
  /** Associated reasoning result IDs */
  reasoningResultIds: string[];
}

/**
 * Storage Statistics
 */
export interface StorageStatistics {
  /** Total stored results */
  totalResults: number;
  
  /** Total storage size in bytes */
  totalSizeBytes: number;
  
  /** Average result size in bytes */
  averageResultSize: number;
  
  /** Oldest result timestamp */
  oldestResult: Date | null;
  
  /** Newest result timestamp */
  newestResult: Date | null;
  
  /** Most accessed result ID */
  mostAccessedResultId: string | null;
  
  /** Access distribution by hour */
  accessDistribution: Record<string, number>;
  
  /** Storage utilization percentage */
  utilizationPercentage: number;
}

/**
 * Reasoning Storage Service
 */
export class ReasoningStorageService {
  private configuration: ReasoningStorageConfiguration;
  private knowledgeGraph: KnowledgeGraph | null;
  private memoryStorage: Map<string, StoredReasoningResult>;
  private contextStorage: Map<string, ReasoningContext>;
  private statistics: StorageStatistics;
  
  constructor(
    config: Partial<ReasoningStorageConfiguration> = {},
    knowledgeGraph: KnowledgeGraph | null = null
  ) {
    this.configuration = { ...DEFAULT_STORAGE_CONFIG, ...config };
    this.knowledgeGraph = knowledgeGraph;
    this.memoryStorage = new Map();
    this.contextStorage = new Map();
    this.statistics = this.initializeStatistics();
    
    // Initialize with sample data
    this.initializeSampleData();
  }
  
  /**
   * Initialize storage statistics
   */
  private initializeStatistics(): StorageStatistics {
    return {
      totalResults: 0,
      totalSizeBytes: 0,
      averageResultSize: 0,
      oldestResult: null,
      newestResult: null,
      mostAccessedResultId: null,
      accessDistribution: {},
      utilizationPercentage: 0
    };
  }
  
  /**
   * Initialize with sample data
   */
  private initializeSampleData(): void {
    // Create sample contexts
    const sampleContexts: ReasoningContext[] = [
      {
        id: 'context-project-001',
        name: 'Oak Tree Assessment Project',
        description: 'Assessment of mature oak tree near residential property',
        type: 'project',
        data: {
          projectId: 'proj-001',
          location: 'London, UK',
          client: 'Residential Client',
          priority: 'high'
        },
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-20'),
        childContextIds: [],
        reasoningResultIds: []
      },
      {
        id: 'context-report-bs5837',
        name: 'BS5837 Compliance Report',
        description: 'Tree survey report for planning application',
        type: 'report',
        data: {
          reportType: 'BS5837',
          standardVersion: '2012',
          purpose: 'planning_application'
        },
        createdAt: new Date('2025-02-10'),
        updatedAt: new Date('2025-02-12'),
        childContextIds: [],
        reasoningResultIds: []
      }
    ];
    
    for (const context of sampleContexts) {
      this.contextStorage.set(context.id, context);
    }
  }
  
  /**
   * Store a reasoning result
   */
  async storeReasoningResult(
    reasoningResult: AIReasoningResult,
    contextIds: string[] = [],
    tags: string[] = []
  ): Promise<string> {
    const startTime = Date.now();
    
    // Generate storage ID
    const storageId = `storage-${reasoningResult.id}-${Date.now()}`;
    
    // Calculate size (simplified)
    const resultJson = JSON.stringify(reasoningResult);
    const sizeBytes = new Blob([resultJson]).size;
    
    // Create stored result
    const storedResult: StoredReasoningResult = {
      storageId,
      reasoningResult,
      storedAt: new Date(),
      accessCount: 0,
      lastAccessed: new Date(),
      metadata: {
        sizeBytes,
        compressed: this.configuration.enableCompression,
        encrypted: this.configuration.enableEncryption,
        version: '1.0.0'
      },
      tags: [...tags, reasoningResult.sourceType, `confidence-${reasoningResult.confidenceScores.overall}`],
      relatedContextIds: contextIds
    };
    
    // Store in memory
    this.memoryStorage.set(storageId, storedResult);
    
    // Update contexts
    for (const contextId of contextIds) {
      const context = this.contextStorage.get(contextId);
      if (context) {
        context.reasoningResultIds.push(storageId);
        context.updatedAt = new Date();
      }
    }
    
    // Update statistics
    this.updateStatistics(storedResult);
    
    // Apply retention policy if enabled
    if (this.configuration.enableAutoCleanup) {
      this.applyRetentionPolicy();
    }
    
    const processingTime = Date.now() - startTime;
    console.log(`Stored reasoning result ${storageId} in ${processingTime}ms, size: ${sizeBytes} bytes`);
    
    return storageId;
  }
  
  /**
   * Retrieve a reasoning result by ID
   */
  async retrieveReasoningResult(storageId: string): Promise<StoredReasoningResult | null> {
    const storedResult = this.memoryStorage.get(storageId);
    
    if (!storedResult) {
      return null;
    }
    
    // Update access statistics
    storedResult.accessCount++;
    storedResult.lastAccessed = new Date();
    
    // Update statistics
    this.updateAccessStatistics(storageId);
    
    return { ...storedResult };
  }
  
  /**
   * Search reasoning results
   */
  async searchReasoningResults(
    query: string,
    filters?: {
      minConfidence?: number;
      sourceType?: string;
      tags?: string[];
      dateRange?: { start: Date; end: Date };
      contextId?: string;
    },
    limit: number = 50
  ): Promise<StoredReasoningResult[]> {
    const results: StoredReasoningResult[] = [];
    const queryLower = query.toLowerCase();
    
    for (const storedResult of this.memoryStorage.values()) {
      const { reasoningResult } = storedResult;
      
      // Apply text search
      let matchesQuery = false;
      
      if (query) {
        // Search in entities
        const entityMatches = reasoningResult.entities.some(entity => 
          entity.text.toLowerCase().includes(queryLower)
        );
        
        // Search in inferences
        const inferenceMatches = reasoningResult.inferences.some(inference => 
          inference.statement.toLowerCase().includes(queryLower) ||
          inference.conclusion.toLowerCase().includes(queryLower)
        );
        
        // Search in recommendations
        const recommendationMatches = reasoningResult.recommendations.some(rec => 
          rec.title.toLowerCase().includes(queryLower) ||
          rec.description.toLowerCase().includes(queryLower)
        );
        
        matchesQuery = entityMatches || inferenceMatches || recommendationMatches;
      } else {
        matchesQuery = true; // No query means match all
      }
      
      // Apply filters
      let matchesFilters = true;
      
      if (filters) {
        if (filters.minConfidence !== undefined) {
          matchesFilters = matchesFilters && 
            reasoningResult.confidenceScores.overall >= filters.minConfidence;
        }
        
        if (filters.sourceType) {
          matchesFilters = matchesFilters && 
            reasoningResult.sourceType === filters.sourceType;
        }
        
        if (filters.tags && filters.tags.length > 0) {
          matchesFilters = matchesFilters &&
            filters.tags.some(tag => storedResult.tags.includes(tag));
        }
        
        if (filters.dateRange) {
          const resultDate = reasoningResult.timestamp;
          matchesFilters = matchesFilters &&
            resultDate >= filters.dateRange.start &&
            resultDate <= filters.dateRange.end;
        }
        
        if (filters.contextId) {
          matchesFilters = matchesFilters &&
            storedResult.relatedContextIds.includes(filters.contextId);
        }
      }
      
      if (matchesQuery && matchesFilters) {
        results.push({ ...storedResult });
      }
    }
    
    // Sort by confidence (highest first) and limit results
    results.sort((a, b) => 
      b.reasoningResult.confidenceScores.overall - a.reasoningResult.confidenceScores.overall
    );
    
    return results.slice(0, limit);
  }
  
  /**
   * Create or update a reasoning context
   */
  async saveContext(context: ReasoningContext): Promise<string> {
    const now = new Date();
    
    // Update timestamps
    if (!context.id) {
      // Create new context
      context.id = `context-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      context.createdAt = now;
    }
    
    context.updatedAt = now;
    
    // Store context
    this.contextStorage.set(context.id, { ...context });
    
    return context.id;
  }
  
  /**
   * Get a reasoning context by ID
   */
  async getContext(contextId: string): Promise<ReasoningContext | null> {
    const context = this.contextStorage.get(contextId);
    return context ? { ...context } : null;
  }
  
  /**
   * Get contexts by type
   */
  async getContextsByType(type: string): Promise<ReasoningContext[]> {
    const contexts: ReasoningContext[] = [];
    
    for (const context of this.contextStorage.values()) {
      if (context.type === type) {
        contexts.push({ ...context });
      }
    }
    
    return contexts;
  }
  
  /**
   * Get reasoning results for a context
   */
  async getContextResults(contextId: string): Promise<StoredReasoningResult[]> {
    const context = this.contextStorage.get(contextId);
    if (!context) {
      return [];
    }
    
    const results: StoredReasoningResult[] = [];
    
    for (const resultId of context.reasoningResultIds) {
      const result = this.memoryStorage.get(resultId);
      if (result) {
        results.push({ ...result });
      }
    }
    
    // Sort by timestamp (newest first)
    results.sort((a, b) => 
      b.reasoningResult.timestamp.getTime() - a.reasoningResult.timestamp.getTime()
    );
    
    return results;
  }
  
  /**
   * Delete a reasoning result
   */
  async deleteReasoningResult(storageId: string): Promise<boolean> {
    const storedResult = this.memoryStorage.get(storageId);
    
    if (!storedResult) {
      return false;
    }
    
    // Remove from contexts
    for (const contextId of storedResult.relatedContextIds) {
      const context = this.contextStorage.get(contextId);
      if (context) {
        const index = context.reasoningResultIds.indexOf(storageId);
        if (index > -1) {
          context.reasoningResultIds.splice(index, 1);
          context.updatedAt = new Date();
        }
      }
    }
    
    // Remove from storage
    this.memoryStorage.delete(storageId);
    
    // Update statistics
    this.updateStatisticsAfterDeletion(storedResult);
    
    console.log(`Deleted reasoning result ${storageId}`);
    return true;
  }
  
  /**
   * Delete a context and its associated results
   */
  async deleteContext(contextId: string, deleteResults: boolean = false): Promise<boolean> {
    const context = this.contextStorage.get(contextId);
    
    if (!context) {
      return false;
    }
    
    if (deleteResults) {
      // Delete all associated results
      for (const resultId of context.reasoningResultIds) {
        await this.deleteReasoningResult(resultId);
      }
    } else {
      // Remove context reference from results
      for (const resultId of context.reasoningResultIds) {
        const result = this.memoryStorage.get(resultId);
        if (result) {
          const index = result.relatedContextIds.indexOf(contextId);
          if (index > -1) {
            result.relatedContextIds.splice(index, 1);
          }
        }
      }
    }
    
    // Remove context from parent contexts
    for (const otherContext of this.contextStorage.values()) {
      const childIndex = otherContext.childContextIds.indexOf(contextId);
      if (childIndex > -1) {
        otherContext.childContextIds.splice(childIndex, 1);
        otherContext.updatedAt = new Date();
      }
    }
    
    // Delete the context
    this.contextStorage.delete(contextId);
    
    console.log(`Deleted context ${contextId}`);
    return true;
  }
  
  /**
   * Apply retention policy
   */
  private applyRetentionPolicy(): void {
    if (this.configuration.retentionDays === 0) {
      return; // Infinite retention
    }
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.configuration.retentionDays);
    
    const toDelete: string[] = [];
    
    for (const [storageId, storedResult] of this.memoryStorage.entries()) {
      if (storedResult.storedAt < cutoffDate) {
        toDelete.push(storageId);
      }
    }
    
    // Delete old results
    for (const storageId of toDelete) {
      this.memoryStorage.delete(storageId);
    }
    
    if (toDelete.length > 0) {
      console.log(`Retention policy deleted ${toDelete.length} old results`);
    }
  }
  
  /**
   * Update statistics after storing a result
   */
  private updateStatistics(storedResult: StoredReasoningResult): void {
    this.statistics.totalResults++;
    this.statistics.totalSizeBytes += storedResult.metadata.sizeBytes;
    
    // Update oldest/newest
    if (!this.statistics.oldestResult || storedResult.storedAt < this.statistics.oldestResult) {
      this.statistics.oldestResult = storedResult.storedAt;
    }
    
    if (!this.statistics.newestResult || storedResult.storedAt > this.statistics.newestResult) {
      this.statistics.newestResult = storedResult.storedAt;
    }
    
    // Update average
    this.statistics.averageResultSize = 
      this.statistics.totalSizeBytes / this.statistics.totalResults;
    
    // Update utilization
    const maxSizeBytes = this.configuration.maxStoredResults * this.statistics.averageResultSize;
    this.statistics.utilizationPercentage = maxSizeBytes > 0 ? 
      (this.statistics.totalSizeBytes / maxSizeBytes) * 100 : 0;
  }
  
  /**
   * Update access statistics
   */
  private updateAccessStatistics(storageId: string): void {
    // Update most accessed
    const storedResult = this.memoryStorage.get(storageId);
    if (!storedResult) return;
    
    const currentMostAccessed = this.memoryStorage.get(this.statistics.mostAccessedResultId || '');
    if (!currentMostAccessed || storedResult.accessCount > currentMostAccessed.accessCount) {
      this.statistics.mostAccessedResultId = storageId;
    }
    
    // Update access distribution by hour
    const hour = new Date().getHours().toString().padStart(2, '0');
    this.statistics.accessDistribution[hour] = (this.statistics.accessDistribution[hour] || 0) + 1;
  }
  
  /**
   * Update statistics after deletion
   */
  private updateStatisticsAfterDeletion(storedResult: StoredReasoningResult): void {
    this.statistics.totalResults = Math.max(0, this.statistics.totalResults - 1);
    this.statistics.totalSizeBytes = Math.max(0, this.statistics.totalSizeBytes - storedResult.metadata.sizeBytes);
    
    // Recalculate average if we have results
    if (this.statistics.totalResults > 0) {
      this.statistics.averageResultSize =
        this.statistics.totalSizeBytes / this.statistics.totalResults;
    } else {
      this.statistics.averageResultSize = 0;
      this.statistics.oldestResult = null;
      this.statistics.newestResult = null;
      this.statistics.mostAccessedResultId = null;
    }
    
    // Update utilization
    const maxSizeBytes = this.configuration.maxStoredResults * this.statistics.averageResultSize;
    this.statistics.utilizationPercentage = maxSizeBytes > 0 ?
      (this.statistics.totalSizeBytes / maxSizeBytes) * 100 : 0;
  }
  
  /**
   * Get storage statistics
   */
  getStatistics(): StorageStatistics {
    return { ...this.statistics };
  }
  
  /**
   * Get all stored result IDs
   */
  getAllResultIds(): string[] {
    return Array.from(this.memoryStorage.keys());
  }
  
  /**
   * Get all context IDs
   */
  getAllContextIds(): string[] {
    return Array.from(this.contextStorage.keys());
  }
  
  /**
   * Clear all storage (for testing/reset)
   */
  clearAll(): void {
    this.memoryStorage.clear();
    this.contextStorage.clear();
    this.statistics = this.initializeStatistics();
    console.log('Cleared all storage');
  }
  
  /**
   * Export storage data
   */
  async exportData(): Promise<{
    results: StoredReasoningResult[];
    contexts: ReasoningContext[];
    statistics: StorageStatistics;
    exportDate: Date;
  }> {
    const results = Array.from(this.memoryStorage.values());
    const contexts = Array.from(this.contextStorage.values());
    
    return {
      results: results.map(r => ({ ...r })),
      contexts: contexts.map(c => ({ ...c })),
      statistics: { ...this.statistics },
      exportDate: new Date()
    };
  }
  
  /**
   * Import storage data
   */
  async importData(data: {
    results: StoredReasoningResult[];
    contexts: ReasoningContext[];
  }): Promise<boolean> {
    try {
      // Clear existing data
      this.clearAll();
      
      // Import contexts
      for (const context of data.contexts) {
        this.contextStorage.set(context.id, { ...context });
      }
      
      // Import results
      for (const result of data.results) {
        this.memoryStorage.set(result.storageId, { ...result });
        
        // Update statistics
        this.updateStatistics(result);
      }
      
      console.log(`Imported ${data.results.length} results and ${data.contexts.length} contexts`);
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
  
  /**
   * Get storage utilization warning
   */
  getUtilizationWarning(): string | null {
    const utilization = this.statistics.utilizationPercentage;
    
    if (utilization >= 90) {
      return 'CRITICAL: Storage utilization at 90% or higher. Consider increasing storage limits or cleaning up old data.';
    } else if (utilization >= 75) {
      return 'WARNING: Storage utilization at 75% or higher. Monitor storage usage.';
    } else if (utilization >= 50) {
      return 'INFO: Storage utilization at 50% or higher.';
    }
    
    return null;
  }
  
  /**
   * Get recommendations for storage optimization
   */
  getStorageRecommendations(): string[] {
    const recommendations: string[] = [];
    const stats = this.statistics;
    
    // Check for old data
    if (stats.oldestResult) {
      const ageDays = Math.floor((Date.now() - stats.oldestResult.getTime()) / (1000 * 60 * 60 * 24));
      if (ageDays > 60) {
        recommendations.push(`Oldest data is ${ageDays} days old. Consider archiving or deleting old data.`);
      }
    }
    
    // Check for large results
    if (stats.averageResultSize > 1024 * 1024) { // > 1MB
      recommendations.push('Average result size is large (>1MB). Consider enabling compression.');
    }
    
    // Check for underutilization
    if (stats.utilizationPercentage < 10 && stats.totalResults > 0) {
      recommendations.push('Storage is underutilized. Consider reducing storage limits to save resources.');
    }
    
    // Check access patterns
    if (stats.mostAccessedResultId) {
      const mostAccessed = this.memoryStorage.get(stats.mostAccessedResultId);
      if (mostAccessed && mostAccessed.accessCount > 100) {
        recommendations.push('Some results are accessed frequently. Consider caching these results.');
      }
    }
    
    return recommendations;
  }
  
  /**
   * Update configuration
   */
  updateConfiguration(newConfig: Partial<ReasoningStorageConfiguration>): void {
    this.configuration = { ...this.configuration, ...newConfig };
  }
  
  /**
   * Get current configuration
   */
  getConfiguration(): ReasoningStorageConfiguration {
    return { ...this.configuration };
  }
  
  /**
   * Set knowledge graph
   */
  setKnowledgeGraph(knowledgeGraph: KnowledgeGraph): void {
    this.knowledgeGraph = knowledgeGraph;
  }
  
  /**
   * Get knowledge graph
   */
  getKnowledgeGraph(): KnowledgeGraph | null {
    return this.knowledgeGraph;
  }
  
  /**
   * Get total stored results count
   */
  getTotalResultsCount(): number {
    return this.statistics.totalResults;
  }
  
  /**
   * Get total contexts count
   */
  getTotalContextsCount(): number {
    return this.contextStorage.size;
  }
  
  /**
   * Check if storage is healthy
   */
  isStorageHealthy(): boolean {
    return (
      this.statistics.utilizationPercentage < 95 &&
      this.statistics.totalResults <= this.configuration.maxStoredResults &&
      this.memoryStorage.size === this.statistics.totalResults
    );
  }
}