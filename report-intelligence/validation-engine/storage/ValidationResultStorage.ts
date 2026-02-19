/**
 * Report Validation Engine - Phase 4
 * Validation Result Storage
 * 
 * Storage system for validation results with persistence and query capabilities.
 */

import type { ValidationResult } from '../ValidationResult';
import type { SchemaMappingResult } from '../../schema-mapper/SchemaMappingResult';

/**
 * Storage options
 */
export interface StorageOptions {
  maxResults?: number;
  autoPrune?: boolean;
  pruneThresholdDays?: number;
  persistToFile?: boolean;
  filePath?: string;
}

/**
 * Storage statistics
 */
export interface StorageStats {
  totalResults: number;
  resultsByStatus: Record<string, number>;
  resultsByReportType: Record<string, number>;
  averageProcessingTime: number;
  storageSizeBytes: number;
  oldestResultDate: Date | null;
  newestResultDate: Date | null;
}

/**
 * Query options for retrieving validation results
 */
export interface QueryOptions {
  reportTypeId?: string;
  schemaMappingResultId?: string;
  status?: string;
  minScore?: number;
  maxScore?: number;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'validatedAt' | 'scores.overallScore';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Validation result storage class
 */
export class ValidationResultStorage {
  private results: Map<string, ValidationResult> = new Map();
  private options: StorageOptions;
  private stats: StorageStats;
  private nextId = 1;

  constructor(options: StorageOptions = {}) {
    this.options = {
      maxResults: 1000,
      autoPrune: true,
      pruneThresholdDays: 30,
      persistToFile: false,
      filePath: './validation-results.json',
      ...options,
    };

    this.stats = {
      totalResults: 0,
      resultsByStatus: {},
      resultsByReportType: {},
      averageProcessingTime: 0,
      storageSizeBytes: 0,
      oldestResultDate: null,
      newestResultDate: null,
    };

    this.initializeStorage();
  }

  /**
   * Initialize storage
   */
  private initializeStorage(): void {
    if (this.options.persistToFile) {
      this.loadFromFile();
    }

    // Initial stats update
    this.updateStats();
  }

  /**
   * Store a validation result
   */
  store(result: ValidationResult): string {
    // Ensure ID is unique
    const id = result.id || `validation_${Date.now()}_${this.nextId++}`;
    const resultWithId = { ...result, id };

    // Check if we need to prune old results
    if (this.options.autoPrune && this.options.maxResults) {
      this.autoPrune();
    }

    // Store the result
    this.results.set(id, resultWithId);

    // Update statistics
    this.updateStats();

    // Persist if configured
    if (this.options.persistToFile) {
      this.saveToFile();
    }

    console.log(`[ValidationResultStorage] Stored validation result: ${id}`);
    return id;
  }

  /**
   * Retrieve a validation result by ID
   */
  retrieve(id: string): ValidationResult | null {
    const result = this.results.get(id);
    if (!result) {
      console.warn(`[ValidationResultStorage] Validation result not found: ${id}`);
      return null;
    }
    return result;
  }

  /**
   * Retrieve validation results by schema mapping result ID
   */
  retrieveBySchemaMappingResult(schemaMappingResultId: string): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    for (const result of Array.from(this.results.values())) {
      if (result.schemaMappingResultId === schemaMappingResultId) {
        results.push(result);
      }
    }
    
    return results.sort((a, b) =>
      b.validatedAt.getTime() - a.validatedAt.getTime()
    );
  }

  /**
   * Retrieve validation results by report type
   */
  retrieveByReportType(reportTypeId: string): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    for (const result of Array.from(this.results.values())) {
      if (result.reportTypeId === reportTypeId) {
        results.push(result);
      }
    }
    
    return results.sort((a, b) =>
      b.validatedAt.getTime() - a.validatedAt.getTime()
    );
  }

  /**
   * Query validation results with options
   */
  query(options: QueryOptions = {}): ValidationResult[] {
    let results = Array.from(this.results.values());
    
    // Apply filters
    if (options.reportTypeId) {
      results = results.filter(r => r.reportTypeId === options.reportTypeId);
    }
    
    if (options.schemaMappingResultId) {
      results = results.filter(r => r.schemaMappingResultId === options.schemaMappingResultId);
    }
    
    if (options.status) {
      results = results.filter(r => r.status === options.status);
    }
    
    if (options.minScore !== undefined) {
      results = results.filter(r => r.scores.overallScore >= options.minScore!);
    }
    
    if (options.maxScore !== undefined) {
      results = results.filter(r => r.scores.overallScore <= options.maxScore!);
    }
    
    if (options.startDate) {
      results = results.filter(r => r.validatedAt >= options.startDate!);
    }
    
    if (options.endDate) {
      results = results.filter(r => r.validatedAt <= options.endDate!);
    }
    
    // Apply sorting
    if (options.sortBy) {
      results.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (options.sortBy) {
          case 'createdAt':
            aValue = a.createdAt;
            bValue = b.createdAt;
            break;
          case 'validatedAt':
            aValue = a.validatedAt;
            bValue = b.validatedAt;
            break;
          case 'scores.overallScore':
            aValue = a.scores.overallScore;
            bValue = b.scores.overallScore;
            break;
          default:
            aValue = a.validatedAt;
            bValue = b.validatedAt;
        }
        
        const order = options.sortOrder === 'asc' ? 1 : -1;
        return (aValue < bValue ? -1 : aValue > bValue ? 1 : 0) * order;
      });
    }
    
    // Apply limit and offset
    if (options.offset) {
      results = results.slice(options.offset);
    }
    
    if (options.limit) {
      results = results.slice(0, options.limit);
    }
    
    return results;
  }

  /**
   * Update an existing validation result
   */
  update(id: string, updates: Partial<ValidationResult>): boolean {
    const existing = this.results.get(id);
    if (!existing) {
      console.warn(`[ValidationResultStorage] Cannot update non-existent result: ${id}`);
      return false;
    }
    
    // Create updated result
    const updatedResult = { ...existing, ...updates, id };
    this.results.set(id, updatedResult);
    
    // Update statistics
    this.updateStats();
    
    // Persist if configured
    if (this.options.persistToFile) {
      this.saveToFile();
    }
    
    console.log(`[ValidationResultStorage] Updated validation result: ${id}`);
    return true;
  }

  /**
   * Delete a validation result
   */
  delete(id: string): boolean {
    const deleted = this.results.delete(id);
    
    if (deleted) {
      // Update statistics
      this.updateStats();
      
      // Persist if configured
      if (this.options.persistToFile) {
        this.saveToFile();
      }
      
      console.log(`[ValidationResultStorage] Deleted validation result: ${id}`);
    } else {
      console.warn(`[ValidationResultStorage] Cannot delete non-existent result: ${id}`);
    }
    
    return deleted;
  }

  /**
   * Delete validation results older than threshold
   */
  pruneOldResults(thresholdDays: number = this.options.pruneThresholdDays || 30): number {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - thresholdDays);
    
    let deletedCount = 0;
    
    for (const [id, result] of Array.from(this.results.entries())) {
      if (result.validatedAt < thresholdDate) {
        this.results.delete(id);
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      this.updateStats();
      
      if (this.options.persistToFile) {
        this.saveToFile();
      }
      
      console.log(`[ValidationResultStorage] Pruned ${deletedCount} old validation results`);
    }
    
    return deletedCount;
  }

  /**
   * Auto-prune based on max results
   */
  private autoPrune(): void {
    if (!this.options.maxResults || this.results.size <= this.options.maxResults) {
      return;
    }
    
    // Sort by date (oldest first)
    const sortedResults = Array.from(this.results.entries())
      .sort(([, a], [, b]) => a.validatedAt.getTime() - b.validatedAt.getTime());
    
    // Delete oldest results until under limit
    const toDelete = sortedResults.slice(0, this.results.size - this.options.maxResults);
    
    for (const [id] of toDelete) {
      this.results.delete(id);
    }
    
    if (toDelete.length > 0) {
      console.log(`[ValidationResultStorage] Auto-pruned ${toDelete.length} validation results`);
    }
  }

  /**
   * Get storage statistics
   */
  getStats(): StorageStats {
    return { ...this.stats };
  }

  /**
   * Update storage statistics
   */
  private updateStats(): void {
    const results = Array.from(this.results.values());
    const totalResults = results.length;
    
    // Calculate statistics
    const resultsByStatus: Record<string, number> = {};
    const resultsByReportType: Record<string, number> = {};
    let totalProcessingTime = 0;
    let oldestDate: Date | null = null;
    let newestDate: Date | null = null;
    
    for (const result of results) {
      // Count by status
      resultsByStatus[result.status] = (resultsByStatus[result.status] || 0) + 1;
      
      // Count by report type
      const reportType = result.reportTypeId || 'unknown';
      resultsByReportType[reportType] = (resultsByReportType[reportType] || 0) + 1;
      
      // Sum processing time
      totalProcessingTime += result.processingTimeMs;
      
      // Track dates
      if (!oldestDate || result.validatedAt < oldestDate) {
        oldestDate = result.validatedAt;
      }
      if (!newestDate || result.validatedAt > newestDate) {
        newestDate = result.validatedAt;
      }
    }
    
    // Update stats object
    this.stats = {
      totalResults,
      resultsByStatus,
      resultsByReportType,
      averageProcessingTime: totalResults > 0 ? totalProcessingTime / totalResults : 0,
      storageSizeBytes: this.estimateStorageSize(),
      oldestResultDate: oldestDate,
      newestResultDate: newestDate,
    };
  }

  /**
   * Estimate storage size in bytes
   */
  private estimateStorageSize(): number {
    let totalSize = 0;
    
    for (const result of Array.from(this.results.values())) {
      // Rough estimation by JSON string length
      const jsonString = JSON.stringify(result);
      totalSize += new Blob([jsonString]).size;
    }
    
    return totalSize;
  }

  /**
   * Save results to file
   */
  private saveToFile(): void {
    if (!this.options.persistToFile || !this.options.filePath) {
      return;
    }
    
    try {
      const data = {
        metadata: {
          savedAt: new Date().toISOString(),
          version: '1.0.0',
          count: this.results.size,
        },
        results: Array.from(this.results.values()),
      };
      
      // In a real implementation, would write to filesystem
      // For now, just log
      console.log(`[ValidationResultStorage] Would save ${this.results.size} results to ${this.options.filePath}`);
    } catch (error) {
      console.error('[ValidationResultStorage] Error saving to file:', error);
    }
  }

  /**
   * Load results from file
   */
  private loadFromFile(): void {
    if (!this.options.persistToFile || !this.options.filePath) {
      return;
    }
    
    try {
      // In a real implementation, would read from filesystem
      // For now, just log
      console.log(`[ValidationResultStorage] Would load results from ${this.options.filePath}`);
    } catch (error) {
      console.error('[ValidationResultStorage] Error loading from file:', error);
    }
  }

  /**
   * Clear all results
   */
  clear(): void {
    const count = this.results.size;
    this.results.clear();
    this.updateStats();
    
    if (this.options.persistToFile) {
      this.saveToFile();
    }
    
    console.log(`[ValidationResultStorage] Cleared ${count} validation results`);
  }

  /**
   * Get all validation results
   */
  getAll(): ValidationResult[] {
    return Array.from(this.results.values());
  }

  /**
   * Get validation result count
   */
  getCount(): number {
    return this.results.size;
  }

  /**
   * Check if a validation result exists
   */
  exists(id: string): boolean {
    return this.results.has(id);
  }

  /**
   * Get validation results with high severity findings
   */
  getResultsWithHighSeverityFindings(severity: 'critical' | 'high' = 'high'): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    for (const result of Array.from(this.results.values())) {
      const hasHighSeverity = result.findings.some(finding =>
        finding.severity === severity ||
        (severity === 'high' && finding.severity === 'critical')
      );
      
      if (hasHighSeverity) {
        results.push(result);
      }
    }
    
    return results;
  }

  /**
   * Get validation results with compliance violations
   */
  getResultsWithComplianceViolations(): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    for (const result of Array.from(this.results.values())) {
      if (result.complianceViolations.length > 0) {
        results.push(result);
      }
    }
    
    return results;
  }

  /**
   * Get average scores by report type
   */
  getAverageScoresByReportType(): Record<string, {
    count: number;
    complianceScore: number;
    qualityScore: number;
    completenessScore: number;
    consistencyScore: number;
    overallScore: number;
  }> {
    const scoresByType: Record<string, {
      count: number;
      complianceScore: number;
      qualityScore: number;
      completenessScore: number;
      consistencyScore: number;
      overallScore: number;
    }> = {};
    
    for (const result of Array.from(this.results.values())) {
      const reportType = result.reportTypeId || 'unknown';
      
      if (!scoresByType[reportType]) {
        scoresByType[reportType] = {
          count: 0,
          complianceScore: 0,
          qualityScore: 0,
          completenessScore: 0,
          consistencyScore: 0,
          overallScore: 0,
        };
      }
      
      const typeScores = scoresByType[reportType];
      typeScores.count++;
      typeScores.complianceScore += result.scores.complianceScore;
      typeScores.qualityScore += result.scores.qualityScore;
      typeScores.completenessScore += result.scores.completenessScore;
      typeScores.consistencyScore += result.scores.consistencyScore;
      typeScores.overallScore += result.scores.overallScore;
    }
    
    // Calculate averages
    for (const reportType of Object.keys(scoresByType)) {
      const typeScores = scoresByType[reportType];
      const count = typeScores.count;
      
      if (count > 0) {
        typeScores.complianceScore /= count;
        typeScores.qualityScore /= count;
        typeScores.completenessScore /= count;
        typeScores.consistencyScore /= count;
        typeScores.overallScore /= count;
      }
    }
    
    return scoresByType;
  }
}