/**
 * Phase 9: Report Compliance Validator
 * Compliance Result Storage
 * 
 * Provides storage and retrieval for compliance validation results.
 */

import type { ComplianceResult } from '../ComplianceResult';
import { generateComplianceResultId } from '../ComplianceResult';

/**
 * Storage configuration
 */
export interface ComplianceStorageConfig {
  // Storage type
  storageType: 'memory' | 'indexeddb' | 'localstorage' | 'api';
  
  // Storage-specific options
  options: {
    // For memory storage
    maxResults?: number;
    
    // For IndexedDB/localStorage
    databaseName?: string;
    storeName?: string;
    
    // For API storage
    apiEndpoint?: string;
    apiKey?: string;
  };
  
  // Retention policy
  retention: {
    keepResultsForDays: number;
    autoCleanup: boolean;
  };
}

/**
 * Default storage configuration
 */
export const DEFAULT_STORAGE_CONFIG: ComplianceStorageConfig = {
  storageType: 'memory',
  options: {
    maxResults: 1000,
  },
  retention: {
    keepResultsForDays: 30,
    autoCleanup: true,
  },
};

/**
 * Storage query options
 */
export interface StorageQueryOptions {
  // Filter by report type
  reportTypeId?: string;
  
  // Filter by status
  status?: string;
  
  // Filter by date range
  startDate?: Date;
  endDate?: Date;
  
  // Filter by score range
  minScore?: number;
  maxScore?: number;
  
  // Pagination
  limit?: number;
  offset?: number;
  
  // Sorting
  sortBy?: 'createdAt' | 'validatedAt' | 'overallScore';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Storage statistics
 */
export interface StorageStatistics {
  totalResults: number;
  byReportType: Record<string, number>;
  byStatus: Record<string, number>;
  averageScore: number;
  oldestResult: Date | null;
  newestResult: Date | null;
}

/**
 * Compliance Result Storage Service
 */
export class ComplianceResultStorage {
  private config: ComplianceStorageConfig;
  private results: Map<string, ComplianceResult>;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(config: Partial<ComplianceStorageConfig> = {}) {
    this.config = { ...DEFAULT_STORAGE_CONFIG, ...config };
    this.results = new Map();
    
    // Initialize based on storage type
    this.initializeStorage();
    
    // Setup auto-cleanup if enabled
    if (this.config.retention.autoCleanup) {
      this.setupAutoCleanup();
    }
  }

  /**
   * Initialize storage based on type
   */
  private async initializeStorage(): Promise<void> {
    switch (this.config.storageType) {
      case 'memory':
        // Memory storage is already initialized
        console.log('[ComplianceResultStorage] Using in-memory storage');
        break;
        
      case 'localstorage':
        await this.initializeLocalStorage();
        break;
        
      case 'indexeddb':
        await this.initializeIndexedDB();
        break;
        
      case 'api':
        // API storage doesn't need local initialization
        console.log('[ComplianceResultStorage] Using API storage');
        break;
        
      default:
        console.warn(`[ComplianceResultStorage] Unknown storage type: ${this.config.storageType}, falling back to memory`);
        this.config.storageType = 'memory';
    }
  }

  /**
   * Initialize localStorage storage
   */
  private async initializeLocalStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem('compliance_results');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach(result => {
            // Convert date strings back to Date objects
            result.createdAt = new Date(result.createdAt);
            result.validatedAt = new Date(result.validatedAt);
            if (result.reviewedAt) result.reviewedAt = new Date(result.reviewedAt);
            if (result.nextReviewDate) result.nextReviewDate = new Date(result.nextReviewDate);
            if (result.expiresAt) result.expiresAt = new Date(result.expiresAt);
            
            this.results.set(result.id, result);
          });
        }
      }
      console.log(`[ComplianceResultStorage] Loaded ${this.results.size} results from localStorage`);
    } catch (error) {
      console.error('[ComplianceResultStorage] Error loading from localStorage:', error);
    }
  }

  /**
   * Initialize IndexedDB storage
   */
  private async initializeIndexedDB(): Promise<void> {
    // Simplified IndexedDB implementation
    console.log('[ComplianceResultStorage] IndexedDB storage not fully implemented, falling back to memory');
    this.config.storageType = 'memory';
  }

  /**
   * Save results to persistent storage
   */
  private async persistResults(): Promise<void> {
    if (this.config.storageType === 'localstorage') {
      try {
        const resultsArray = Array.from(this.results.values());
        localStorage.setItem('compliance_results', JSON.stringify(resultsArray));
      } catch (error) {
        console.error('[ComplianceResultStorage] Error saving to localStorage:', error);
      }
    }
    // IndexedDB and API persistence would be implemented here
  }

  /**
   * Setup automatic cleanup of old results
   */
  private setupAutoCleanup(): void {
    // Run cleanup every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldResults();
    }, 60 * 60 * 1000); // 1 hour
    
    // Also run cleanup now
    this.cleanupOldResults();
  }

  /**
   * Cleanup old results based on retention policy
   */
  private cleanupOldResults(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retention.keepResultsForDays);
    
    let removedCount = 0;
    
    for (const [id, result] of this.results.entries()) {
      if (result.createdAt < cutoffDate) {
        this.results.delete(id);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      console.log(`[ComplianceResultStorage] Cleaned up ${removedCount} old results`);
      this.persistResults();
    }
  }

  /**
   * Store a compliance result
   */
  async storeResult(result: ComplianceResult): Promise<string> {
    try {
      // Ensure the result has an ID
      if (!result.id) {
        result.id = generateComplianceResultId();
      }
      
      // Ensure timestamps
      if (!result.createdAt) {
        result.createdAt = new Date();
      }
      if (!result.validatedAt) {
        result.validatedAt = new Date();
      }
      
      // Store in memory
      this.results.set(result.id, result);
      
      // Persist if needed
      await this.persistResults();
      
      // Apply max results limit for memory storage
      if (this.config.storageType === 'memory' && this.config.options.maxResults) {
        if (this.results.size > this.config.options.maxResults) {
          // Remove oldest results
          const sorted = Array.from(this.results.entries())
            .sort(([, a], [, b]) => a.createdAt.getTime() - b.createdAt.getTime());
          
          const toRemove = sorted.slice(0, this.results.size - this.config.options.maxResults);
          toRemove.forEach(([id]) => this.results.delete(id));
          
          console.log(`[ComplianceResultStorage] Trimmed ${toRemove.length} results to stay within limit`);
          await this.persistResults();
        }
      }
      
      return result.id;
      
    } catch (error) {
      console.error('[ComplianceResultStorage] Error storing result:', error);
      throw error;
    }
  }

  /**
   * Retrieve a compliance result by ID
   */
  async getResult(id: string): Promise<ComplianceResult | null> {
    try {
      const result = this.results.get(id);
      return result || null;
    } catch (error) {
      console.error('[ComplianceResultStorage] Error retrieving result:', error);
      throw error;
    }
  }

  /**
   * Query compliance results
   */
  async queryResults(options: StorageQueryOptions = {}): Promise<ComplianceResult[]> {
    try {
      let results = Array.from(this.results.values());
      
      // Apply filters
      if (options.reportTypeId) {
        results = results.filter(r => r.reportTypeId === options.reportTypeId);
      }
      
      if (options.status) {
        results = results.filter(r => r.status === options.status);
      }
      
      if (options.startDate) {
        results = results.filter(r => r.createdAt >= options.startDate!);
      }
      
      if (options.endDate) {
        results = results.filter(r => r.createdAt <= options.endDate!);
      }
      
      if (options.minScore !== undefined) {
        results = results.filter(r => r.scores.overallScore >= options.minScore!);
      }
      
      if (options.maxScore !== undefined) {
        results = results.filter(r => r.scores.overallScore <= options.maxScore!);
      }
      
      // Apply sorting
      if (options.sortBy) {
        results.sort((a, b) => {
          let aValue: any, bValue: any;
          
          switch (options.sortBy) {
            case 'createdAt':
              aValue = a.createdAt.getTime();
              bValue = b.createdAt.getTime();
              break;
            case 'validatedAt':
              aValue = a.validatedAt.getTime();
              bValue = b.validatedAt.getTime();
              break;
            case 'overallScore':
              aValue = a.scores.overallScore;
              bValue = b.scores.overallScore;
              break;
            default:
              return 0;
          }
          
          const order = options.sortOrder === 'desc' ? -1 : 1;
          return (aValue - bValue) * order;
        });
      }
      
      // Apply pagination
      if (options.offset !== undefined) {
        results = results.slice(options.offset);
      }
      
      if (options.limit !== undefined) {
        results = results.slice(0, options.limit);
      }
      
      return results;
      
    } catch (error) {
      console.error('[ComplianceResultStorage] Error querying results:', error);
      throw error;
    }
  }

  /**
   * Update a compliance result
   */
  async updateResult(id: string, updates: Partial<ComplianceResult>): Promise<boolean> {
    try {
      const existing = this.results.get(id);
      if (!existing) {
        return false;
      }
      
      // Merge updates
      const updated = { ...existing, ...updates };
      this.results.set(id, updated);
      
      // Persist if needed
      await this.persistResults();
      
      return true;
      
    } catch (error) {
      console.error('[ComplianceResultStorage] Error updating result:', error);
      throw error;
    }
  }

  /**
   * Delete a compliance result
   */
  async deleteResult(id: string): Promise<boolean> {
    try {
      const existed = this.results.delete(id);
      
      if (existed) {
        await this.persistResults();
      }
      
      return existed;
      
    } catch (error) {
      console.error('[ComplianceResultStorage] Error deleting result:', error);
      throw error;
    }
  }

  /**
   * Get storage statistics
   */
  async getStatistics(): Promise<StorageStatistics> {
    const results = Array.from(this.results.values());
    
    if (results.length === 0) {
      return {
        totalResults: 0,
        byReportType: {},
        byStatus: {},
        averageScore: 0,
        oldestResult: null,
        newestResult: null,
      };
    }
    
    // Calculate statistics
    const byReportType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let totalScore = 0;
    let oldestDate: Date | null = null;
    let newestDate: Date | null = null;
    
    for (const result of results) {
      // Count by report type
      byReportType[result.reportTypeId] = (byReportType[result.reportTypeId] || 0) + 1;
      
      // Count by status
      byStatus[result.status] = (byStatus[result.status] || 0) + 1;
      
      // Sum scores
      totalScore += result.scores.overallScore;
      
      // Track dates
      if (!oldestDate || result.createdAt < oldestDate) {
        oldestDate = result.createdAt;
      }
      if (!newestDate || result.createdAt > newestDate) {
        newestDate = result.createdAt;
      }
    }
    
    return {
      totalResults: results.length,
      byReportType,
      byStatus,
      averageScore: totalScore / results.length,
      oldestResult: oldestDate,
      newestResult: newestDate,
    };
  }

  /**
   * Clear all results
   */
  async clearAll(): Promise<void> {
    try {
      this.results.clear();
      await this.persistResults();
    } catch (error) {
      console.error('[ComplianceResultStorage] Error clearing results:', error);
      throw error;
    }
  }

  /**
   * Export results to JSON
   */
  async exportResults(): Promise<string> {
    const results = Array.from(this.results.values());
    return JSON.stringify(results, null, 2);
  }

  /**
   * Import results from JSON
   */
  async importResults(json: string): Promise<number> {
    try {
      const results = JSON.parse(json);
      
      if (!Array.isArray(results)) {
        throw new Error('Invalid import format: expected array of results');
      }
      
      let importedCount = 0;
      
      for (const result of results) {
        // Validate basic structure
        if (!result.id || !result.reportTypeId || !result.createdAt) {
          console.warn('[ComplianceResultStorage] Skipping invalid result in import');
          continue;
        }
        
        // Convert date strings
        result.createdAt = new Date(result.createdAt);
        result.validatedAt = new Date(result.validatedAt);
        if (result.reviewedAt) result.reviewedAt = new Date(result.reviewedAt);
        if (result.nextReviewDate) result.nextReviewDate = new Date(result.nextReviewDate);
        if (result.expiresAt) result.expiresAt = new Date(result.expiresAt);
        
        // Store result
        this.results.set(result.id, result);
        importedCount++;
      }
      
      await this.persistResults();
      return importedCount;
      
    } catch (error) {
      console.error('[ComplianceResultStorage] Error importing results:', error);
      throw error;
    }
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}