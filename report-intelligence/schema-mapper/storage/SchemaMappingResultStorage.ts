/**
 * Report Schema Mapper - Phase 3
 * SchemaMappingResultStorage Class
 * 
 * Storage service for schema mapping results.
 */

import type { SchemaMappingResult } from '../SchemaMappingResult';
import fs from 'fs/promises';
import path from 'path';

export interface StorageOptions {
  storagePath: string;
  maxEntries: number;
  autoPrune: boolean;
  pruneThreshold: number; // Days after which to prune old entries
}

const DEFAULT_OPTIONS: StorageOptions = {
  storagePath: 'workspace/schema-mapping-results.json',
  maxEntries: 1000,
  autoPrune: true,
  pruneThreshold: 30, // 30 days
};

export class SchemaMappingResultStorage {
  private options: StorageOptions;
  private storagePath: string;
  
  constructor(options?: Partial<StorageOptions>) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.storagePath = path.resolve(process.cwd(), this.options.storagePath);
  }

  /**
   * Store a schema mapping result
   */
  async storeMappingResult(result: SchemaMappingResult): Promise<void> {
    try {
      // Ensure directory exists
      await this.ensureStorageDirectory();
      
      // Load existing results
      const existingResults = await this.loadAllResults();
      
      // Check for duplicates (by ID)
      const existingIndex = existingResults.findIndex(r => r.id === result.id);
      if (existingIndex !== -1) {
        // Update existing entry
        existingResults[existingIndex] = result;
      } else {
        // Add new entry
        existingResults.push(result);
      }
      
      // Auto-prune if enabled
      const resultsToSave = this.options.autoPrune 
        ? await this.pruneOldResults(existingResults)
        : existingResults;
      
      // Limit to max entries
      const limitedResults = resultsToSave.slice(-this.options.maxEntries);
      
      // Save to file
      await this.saveResultsToFile(limitedResults);
      
      console.log(`[SchemaMappingResultStorage] Stored mapping result: ${result.id}`);
      
    } catch (error) {
      console.error('[SchemaMappingResultStorage] Error storing mapping result:', error);
      throw error;
    }
  }

  /**
   * Get a schema mapping result by ID
   */
  async getMappingResult(id: string): Promise<SchemaMappingResult | null> {
    try {
      const results = await this.loadAllResults();
      return results.find(result => result.id === id) || null;
    } catch (error) {
      console.error('[SchemaMappingResultStorage] Error getting mapping result:', error);
      return null;
    }
  }

  /**
   * Get all schema mapping results
   */
  async getAllResults(): Promise<SchemaMappingResult[]> {
    try {
      return await this.loadAllResults();
    } catch (error) {
      console.error('[SchemaMappingResultStorage] Error getting all results:', error);
      return [];
    }
  }

  /**
   * Get mapping results by decompiled report ID
   */
  async getResultsByDecompiledReportId(decompiledReportId: string): Promise<SchemaMappingResult[]> {
    try {
      const results = await this.loadAllResults();
      return results.filter(result => result.decompiledReportId === decompiledReportId);
    } catch (error) {
      console.error('[SchemaMappingResultStorage] Error getting results by decompiled report ID:', error);
      return [];
    }
  }

  /**
   * Get mapping results by report type ID
   */
  async getResultsByReportTypeId(reportTypeId: string): Promise<SchemaMappingResult[]> {
    try {
      const results = await this.loadAllResults();
      return results.filter(result => result.reportTypeId === reportTypeId);
    } catch (error) {
      console.error('[SchemaMappingResultStorage] Error getting results by report type ID:', error);
      return [];
    }
  }

  /**
   * Delete a mapping result by ID
   */
  async deleteMappingResult(id: string): Promise<boolean> {
    try {
      const results = await this.loadAllResults();
      const filteredResults = results.filter(result => result.id !== id);
      
      if (filteredResults.length < results.length) {
        await this.saveResultsToFile(filteredResults);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[SchemaMappingResultStorage] Error deleting mapping result:', error);
      return false;
    }
  }

  /**
   * Clear all mapping results
   */
  async clearAllResults(): Promise<void> {
    try {
      await this.saveResultsToFile([]);
      console.log('[SchemaMappingResultStorage] Cleared all mapping results');
    } catch (error) {
      console.error('[SchemaMappingResultStorage] Error clearing all results:', error);
      throw error;
    }
  }

  /**
   * Get statistics about stored mapping results
   */
  async getStatistics(): Promise<{
    totalResults: number;
    byReportType: Record<string, number>;
    byConfidence: { high: number; medium: number; low: number };
    oldestResult: Date | null;
    newestResult: Date | null;
  }> {
    try {
      const results = await this.loadAllResults();
      
      if (results.length === 0) {
        return {
          totalResults: 0,
          byReportType: {},
          byConfidence: { high: 0, medium: 0, low: 0 },
          oldestResult: null,
          newestResult: null,
        };
      }
      
      // Group by report type
      const byReportType: Record<string, number> = {};
      for (const result of results) {
        const type = result.reportTypeId || 'unknown';
        byReportType[type] = (byReportType[type] || 0) + 1;
      }
      
      // Group by confidence
      const byConfidence = {
        high: results.filter(r => r.confidenceScore >= 0.8).length,
        medium: results.filter(r => r.confidenceScore >= 0.5 && r.confidenceScore < 0.8).length,
        low: results.filter(r => r.confidenceScore < 0.5).length,
      };
      
      // Find oldest and newest
      const dates = results.map(r => new Date(r.createdAt)).filter(d => !isNaN(d.getTime()));
      const oldestResult = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
      const newestResult = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;
      
      return {
        totalResults: results.length,
        byReportType,
        byConfidence,
        oldestResult,
        newestResult,
      };
    } catch (error) {
      console.error('[SchemaMappingResultStorage] Error getting statistics:', error);
      return {
        totalResults: 0,
        byReportType: {},
        byConfidence: { high: 0, medium: 0, low: 0 },
        oldestResult: null,
        newestResult: null,
      };
    }
  }

  /**
   * Prune old results based on age threshold
   */
  private async pruneOldResults(results: SchemaMappingResult[]): Promise<SchemaMappingResult[]> {
    if (!this.options.autoPrune || this.options.pruneThreshold <= 0) {
      return results;
    }
    
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - this.options.pruneThreshold);
    
    return results.filter(result => {
      const resultDate = new Date(result.createdAt);
      return resultDate >= thresholdDate;
    });
  }

  /**
   * Load all results from storage file
   */
  private async loadAllResults(): Promise<SchemaMappingResult[]> {
    try {
      await this.ensureStorageDirectory();
      
      const fileExists = await this.fileExists(this.storagePath);
      if (!fileExists) {
        return [];
      }
      
      const fileContent = await fs.readFile(this.storagePath, 'utf-8');
      const parsed = JSON.parse(fileContent);
      
      // Convert date strings back to Date objects
      return parsed.map((result: any) => ({
        ...result,
        createdAt: new Date(result.createdAt),
        processedAt: new Date(result.processedAt),
      }));
    } catch (error) {
      console.error('[SchemaMappingResultStorage] Error loading results:', error);
      return [];
    }
  }

  /**
   * Save results to storage file
   */
  private async saveResultsToFile(results: SchemaMappingResult[]): Promise<void> {
    try {
      await this.ensureStorageDirectory();
      
      // Convert to JSON (Date objects will be serialized to ISO strings)
      const jsonContent = JSON.stringify(results, null, 2);
      await fs.writeFile(this.storagePath, jsonContent, 'utf-8');
    } catch (error) {
      console.error('[SchemaMappingResultStorage] Error saving results:', error);
      throw error;
    }
  }

  /**
   * Ensure storage directory exists
   */
  private async ensureStorageDirectory(): Promise<void> {
    const dirPath = path.dirname(this.storagePath);
    
    try {
      await fs.access(dirPath);
    } catch {
      // Directory doesn't exist, create it
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Check if a file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}