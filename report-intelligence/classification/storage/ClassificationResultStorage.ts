/**
 * Report Classification Engine - Phase 6
 * Classification Result Storage
 * 
 * Storage service for classification results using JSON file storage.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type { ClassificationResult } from '../ClassificationResult';

/**
 * Storage configuration
 */
export interface ClassificationResultStorageConfig {
  storagePath: string;
  maxEntries: number;
  autoPrune: boolean;
  backupInterval: number; // hours
}

/**
 * Storage entry format
 */
export interface ClassificationResultStorageEntry {
  id: string;
  result: ClassificationResult;
  createdAt: string;
  accessedAt: string;
  accessCount: number;
}

/**
 * Classification Result Storage Service
 */
export class ClassificationResultStorage {
  private config: ClassificationResultStorageConfig;
  private storagePath: string;
  private isInitialized: boolean = false;
  
  /**
   * Constructor
   */
  constructor(config: Partial<ClassificationResultStorageConfig> = {}) {
    this.config = {
      storagePath: 'workspace/classification-results.json',
      maxEntries: 1000,
      autoPrune: true,
      backupInterval: 24,
      ...config
    };
    
    this.storagePath = this.config.storagePath;
  }
  
  /**
   * Initialize storage
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Ensure directory exists
      const dir = path.dirname(this.storagePath);
      await fs.mkdir(dir, { recursive: true });
      
      // Create storage file if it doesn't exist
      try {
        await fs.access(this.storagePath);
      } catch {
        await this.saveStorage({ entries: [], metadata: this.createMetadata() });
      }
      
      this.isInitialized = true;
      console.log(`Classification result storage initialized at ${this.storagePath}`);
      
    } catch (error) {
      console.error('Failed to initialize classification result storage:', error);
      throw error;
    }
  }
  
  /**
   * Save a classification result
   */
  public async saveResult(result: ClassificationResult): Promise<void> {
    await this.initialize();
    
    try {
      const storage = await this.loadStorage();
      const now = new Date().toISOString();
      
      // Check if result already exists
      const existingIndex = storage.entries.findIndex(e => e.id === result.id);
      
      const entry: ClassificationResultStorageEntry = {
        id: result.id,
        result,
        createdAt: existingIndex >= 0 ? storage.entries[existingIndex].createdAt : now,
        accessedAt: now,
        accessCount: existingIndex >= 0 ? storage.entries[existingIndex].accessCount : 0
      };
      
      if (existingIndex >= 0) {
        // Update existing entry
        storage.entries[existingIndex] = entry;
      } else {
        // Add new entry
        storage.entries.push(entry);
      }
      
      // Auto-prune if configured
      if (this.config.autoPrune && storage.entries.length > this.config.maxEntries) {
        await this.pruneEntries();
      }
      
      // Update metadata
      storage.metadata = this.updateMetadata(storage.metadata, existingIndex >= 0 ? 'updated' : 'created');
      
      await this.saveStorage(storage);
      
      console.log(`Classification result ${result.id} saved to storage`);
      
    } catch (error) {
      console.error('Failed to save classification result:', error);
      throw error;
    }
  }
  
  /**
   * Load a classification result by ID
   */
  public async loadResult(resultId: string): Promise<ClassificationResult | null> {
    await this.initialize();
    
    try {
      const storage = await this.loadStorage();
      const entry = storage.entries.find(e => e.id === resultId);
      
      if (!entry) {
        return null;
      }
      
      // Update access statistics
      entry.accessCount++;
      entry.accessedAt = new Date().toISOString();
      storage.metadata = this.updateMetadata(storage.metadata, 'accessed');
      
      await this.saveStorage(storage);
      
      return entry.result;
      
    } catch (error) {
      console.error('Failed to load classification result:', error);
      return null;
    }
  }
  
  /**
   * Find results by decompiled report ID
   */
  public async findResultsByReportId(
    decompiledReportId: string
  ): Promise<ClassificationResult[]> {
    await this.initialize();
    
    try {
      const storage = await this.loadStorage();
      const entries = storage.entries.filter(e => e.result.decompiledReportId === decompiledReportId);
      
      // Sort by timestamp (newest first)
      entries.sort((a, b) => 
        new Date(b.result.timestamps.completed).getTime() - new Date(a.result.timestamps.completed).getTime()
      );
      
      return entries.map(entry => entry.result);
      
    } catch (error) {
      console.error('Failed to find results by report ID:', error);
      return [];
    }
  }
  
  /**
   * Find results by detected report type
   */
  public async findResultsByReportType(
    reportTypeId: string
  ): Promise<ClassificationResult[]> {
    await this.initialize();
    
    try {
      const storage = await this.loadStorage();
      const entries = storage.entries.filter(e => 
        e.result.detectedReportTypeId === reportTypeId
      );
      
      // Sort by confidence score (highest first)
      entries.sort((a, b) => b.result.confidenceScore - a.result.confidenceScore);
      
      return entries.map(entry => entry.result);
      
    } catch (error) {
      console.error('Failed to find results by report type:', error);
      return [];
    }
  }
  
  /**
   * Get all results
   */
  public async getAllResults(): Promise<ClassificationResult[]> {
    await this.initialize();
    
    try {
      const storage = await this.loadStorage();
      return storage.entries.map(entry => entry.result);
      
    } catch (error) {
      console.error('Failed to get all results:', error);
      return [];
    }
  }
  
  /**
   * Delete a result
   */
  public async deleteResult(resultId: string): Promise<boolean> {
    await this.initialize();
    
    try {
      const storage = await this.loadStorage();
      const initialLength = storage.entries.length;
      
      storage.entries = storage.entries.filter(e => e.id !== resultId);
      
      if (storage.entries.length < initialLength) {
        storage.metadata = this.updateMetadata(storage.metadata, 'deleted');
        await this.saveStorage(storage);
        console.log(`Classification result ${resultId} deleted from storage`);
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('Failed to delete classification result:', error);
      return false;
    }
  }
  
  /**
   * Get storage statistics
   */
  public async getStatistics(): Promise<{
    totalResults: number;
    uniqueReports: number;
    storageSize: number;
    mostRecentResult: string | null;
    mostAccessedResult: string | null;
    confidenceDistribution: {
      high: number; // >= 0.8
      medium: number; // 0.6-0.79
      low: number; // < 0.6
    };
  }> {
    await this.initialize();
    
    try {
      const storage = await this.loadStorage();
      
      // Count unique reports
      const uniqueReports = new Set(storage.entries.map(e => e.result.decompiledReportId));
      
      // Find most recent result
      let mostRecentResult: string | null = null;
      let mostRecentTime = 0;
      
      // Find most accessed result
      let mostAccessedResult: string | null = null;
      let maxAccessCount = 0;
      
      // Calculate confidence distribution
      let highConfidence = 0;
      let mediumConfidence = 0;
      let lowConfidence = 0;
      
      for (const entry of storage.entries) {
        const confidence = entry.result.confidenceScore;
        if (confidence >= 0.8) highConfidence++;
        else if (confidence >= 0.6) mediumConfidence++;
        else lowConfidence++;
        
        // Check for most recent
        const resultTime = new Date(entry.result.timestamps.completed).getTime();
        if (resultTime > mostRecentTime) {
          mostRecentTime = resultTime;
          mostRecentResult = entry.id;
        }
        
        // Check for most accessed
        if (entry.accessCount > maxAccessCount) {
          maxAccessCount = entry.accessCount;
          mostAccessedResult = entry.id;
        }
      }
      
      // Get storage file size
      let storageSize = 0;
      try {
        const stats = await fs.stat(this.storagePath);
        storageSize = stats.size;
      } catch {
        // File doesn't exist or can't be accessed
      }
      
      const totalResults = storage.entries.length;
      
      return {
        totalResults,
        uniqueReports: uniqueReports.size,
        storageSize,
        mostRecentResult,
        mostAccessedResult,
        confidenceDistribution: {
          high: totalResults > 0 ? highConfidence / totalResults : 0,
          medium: totalResults > 0 ? mediumConfidence / totalResults : 0,
          low: totalResults > 0 ? lowConfidence / totalResults : 0
        }
      };
      
    } catch (error) {
      console.error('Failed to get storage statistics:', error);
      return {
        totalResults: 0,
        uniqueReports: 0,
        storageSize: 0,
        mostRecentResult: null,
        mostAccessedResult: null,
        confidenceDistribution: { high: 0, medium: 0, low: 0 }
      };
    }
  }
  
  /**
   * Prune old entries
   */
  public async pruneEntries(maxEntries?: number): Promise<number> {
    await this.initialize();
    
    try {
      const storage = await this.loadStorage();
      const limit = maxEntries || this.config.maxEntries;
      
      if (storage.entries.length <= limit) {
        return 0;
      }
      
      // Sort by accessed date (oldest first)
      storage.entries.sort((a, b) => 
        new Date(a.accessedAt).getTime() - new Date(b.accessedAt).getTime()
      );
      
      const entriesToRemove = storage.entries.length - limit;
      storage.entries = storage.entries.slice(entriesToRemove);
      
      storage.metadata = this.updateMetadata(storage.metadata, 'pruned');
      await this.saveStorage(storage);
      
      console.log(`Pruned ${entriesToRemove} old classification results`);
      return entriesToRemove;
      
    } catch (error) {
      console.error('Failed to prune entries:', error);
      return 0;
    }
  }
  
  /**
   * Backup storage
   */
  public async backup(): Promise<string> {
    await this.initialize();
    
    try {
      const backupPath = `${this.storagePath}.backup.${Date.now()}`;
      const storage = await this.loadStorage();
      
      await fs.writeFile(backupPath, JSON.stringify(storage, null, 2));
      
      console.log(`Storage backed up to ${backupPath}`);
      return backupPath;
      
    } catch (error) {
      console.error('Failed to backup storage:', error);
      throw error;
    }
  }
  
  /**
   * Clear all results
   */
  public async clear(): Promise<void> {
    await this.initialize();
    
    try {
      await this.saveStorage({ entries: [], metadata: this.createMetadata() });
      console.log('Classification result storage cleared');
      
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }
  
  /**
   * Private helper methods
   */
  private async loadStorage(): Promise<{
    entries: ClassificationResultStorageEntry[];
    metadata: any;
  }> {
    try {
      const data = await fs.readFile(this.storagePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // Return empty storage if file doesn't exist or is corrupted
      return { entries: [], metadata: this.createMetadata() };
    }
  }
  
  private async saveStorage(storage: {
    entries: ClassificationResultStorageEntry[];
    metadata: any;
  }): Promise<void> {
    await fs.writeFile(this.storagePath, JSON.stringify(storage, null, 2));
  }
  
  private createMetadata(): any {
    const now = new Date().toISOString();
    
    return {
      version: '1.0.0',
      created: now,
      lastUpdated: now,
      totalOperations: 0,
      operationCounts: {
        created: 0,
        updated: 0,
        accessed: 0,
        deleted: 0,
        pruned: 0
      }
    };
  }
  
  private updateMetadata(metadata: any, operation: 'created' | 'updated' | 'accessed' | 'deleted' | 'pruned'): any {
    const updated = { ...metadata };
    updated.lastUpdated = new Date().toISOString();
    updated.totalOperations = (updated.totalOperations || 0) + 1;
    updated.operationCounts = updated.operationCounts || {};
    updated.operationCounts[operation] = (updated.operationCounts[operation] || 0) + 1;
    
    return updated;
  }
}