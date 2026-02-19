/**
 * Phase 10: Report Reproduction Tester
 * TestStorageSystem Class
 * 
 * Storage system for test results, test cases, and consistency measurements.
 */

import type { TestCase } from '../TestResult';
import type { TestResult } from '../TestResult';
import type { ConsistencyMeasurement } from '../TestResult';

/**
 * Storage configuration
 */
export interface StorageConfig {
  storageType: 'memory' | 'file' | 'database';
  filePath?: string;
  maxResultsPerTestCase: number;
  autoCleanup: boolean;
  cleanupAgeDays: number;
  compressionEnabled: boolean;
  backupEnabled: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: StorageConfig = {
  storageType: 'memory',
  filePath: './test-results',
  maxResultsPerTestCase: 100,
  autoCleanup: true,
  cleanupAgeDays: 30,
  compressionEnabled: false,
  backupEnabled: true,
};

/**
 * Storage statistics
 */
export interface StorageStatistics {
  totalTestCases: number;
  totalTestResults: number;
  totalConsistencyMeasurements: number;
  storageSizeBytes: number;
  oldestResultDate?: Date;
  newestResultDate?: Date;
  byTestCase: Record<string, {
    resultsCount: number;
    consistencyMeasurementsCount: number;
  }>;
}

/**
 * Query options for retrieving test results
 */
export interface QueryOptions {
  testCaseId?: string;
  startDate?: Date;
  endDate?: Date;
  minScore?: number;
  maxScore?: number;
  status?: string[];
  limit?: number;
  offset?: number;
  sortBy?: 'date' | 'score' | 'testCaseId';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Main TestStorageSystem class
 */
export class TestStorageSystem {
  private config: StorageConfig;
  private testCases: Map<string, TestCase> = new Map();
  private testResults: Map<string, TestResult> = new Map();
  private consistencyMeasurements: Map<string, ConsistencyMeasurement> = new Map();
  private testCaseResults: Map<string, Set<string>> = new Map(); // testCaseId -> resultIds
  
  constructor(config?: Partial<StorageConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Store a test case
   */
  storeTestCase(testCase: TestCase): void {
    this.testCases.set(testCase.id, testCase);
    
    // Initialize results set if not exists
    if (!this.testCaseResults.has(testCase.id)) {
      this.testCaseResults.set(testCase.id, new Set());
    }
  }

  /**
   * Store a test result
   */
  storeTestResult(testResult: TestResult): void {
    this.testResults.set(testResult.id, testResult);
    
    // Link to test case
    const resultSet = this.testCaseResults.get(testResult.testCaseId);
    if (resultSet) {
      resultSet.add(testResult.id);
    } else {
      // Create new set if test case doesn't exist
      this.testCaseResults.set(testResult.testCaseId, new Set([testResult.id]));
    }
    
    // Apply auto-cleanup if enabled
    if (this.config.autoCleanup) {
      this.cleanupOldResults(testResult.testCaseId);
    }
  }

  /**
   * Store a consistency measurement
   */
  storeConsistencyMeasurement(measurement: ConsistencyMeasurement): void {
    this.consistencyMeasurements.set(measurement.testCaseId, measurement);
  }

  /**
   * Get a test case by ID
   */
  getTestCase(testCaseId: string): TestCase | undefined {
    return this.testCases.get(testCaseId);
  }

  /**
   * Get a test result by ID
   */
  getTestResult(resultId: string): TestResult | undefined {
    return this.testResults.get(resultId);
  }

  /**
   * Get consistency measurement for a test case
   */
  getConsistencyMeasurement(testCaseId: string): ConsistencyMeasurement | undefined {
    return this.consistencyMeasurements.get(testCaseId);
  }

  /**
   * Get all test results for a test case
   */
  getTestResultsForTestCase(testCaseId: string, options?: QueryOptions): TestResult[] {
    const resultIds = this.testCaseResults.get(testCaseId);
    if (!resultIds) {
      return [];
    }
    
    let results = Array.from(resultIds)
      .map(id => this.testResults.get(id))
      .filter((result): result is TestResult => result !== undefined);
    
    // Apply filters
    results = this.applyQueryFilters(results, options);
    
    // Apply sorting
    results = this.applySorting(results, options);
    
    // Apply limit and offset
    return this.applyLimitOffset(results, options);
  }

  /**
   * Query test results with options
   */
  queryTestResults(options?: QueryOptions): TestResult[] {
    let results = Array.from(this.testResults.values());
    
    // Apply filters
    results = this.applyQueryFilters(results, options);
    
    // Apply sorting
    results = this.applySorting(results, options);
    
    // Apply limit and offset
    return this.applyLimitOffset(results, options);
  }

  /**
   * Get all test cases
   */
  getAllTestCases(): TestCase[] {
    return Array.from(this.testCases.values());
  }

  /**
   * Get storage statistics
   */
  getStatistics(): StorageStatistics {
    const statistics: StorageStatistics = {
      totalTestCases: this.testCases.size,
      totalTestResults: this.testResults.size,
      totalConsistencyMeasurements: this.consistencyMeasurements.size,
      storageSizeBytes: this.calculateStorageSize(),
      byTestCase: {},
    };
    
    // Calculate dates
    const allResults = Array.from(this.testResults.values());
    if (allResults.length > 0) {
      const dates = allResults.map(r => r.testedAt).filter((d): d is Date => d !== undefined);
      if (dates.length > 0) {
        statistics.oldestResultDate = new Date(Math.min(...dates.map(d => d.getTime())));
        statistics.newestResultDate = new Date(Math.max(...dates.map(d => d.getTime())));
      }
    }
    
    // Calculate by test case
    for (const [testCaseId, resultIds] of this.testCaseResults) {
      statistics.byTestCase[testCaseId] = {
        resultsCount: resultIds.size,
        consistencyMeasurementsCount: this.consistencyMeasurements.has(testCaseId) ? 1 : 0,
      };
    }
    
    return statistics;
  }

  /**
   * Export all data to JSON
   */
  exportToJson(): string {
    const exportData = {
      testCases: Array.from(this.testCases.values()),
      testResults: Array.from(this.testResults.values()),
      consistencyMeasurements: Array.from(this.consistencyMeasurements.values()),
      metadata: {
        exportedAt: new Date().toISOString(),
        totalItems: this.testCases.size + this.testResults.size + this.consistencyMeasurements.size,
        version: '1.0',
      },
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import data from JSON
   */
  importFromJson(json: string): { imported: number; errors: string[] } {
    const errors: string[] = [];
    let importedCount = 0;
    
    try {
      const data = JSON.parse(json);
      
      // Import test cases
      if (Array.isArray(data.testCases)) {
        for (const testCase of data.testCases) {
          try {
            this.storeTestCase(testCase);
            importedCount++;
          } catch (error) {
            errors.push(`Failed to import test case ${testCase.id}: ${error}`);
          }
        }
      }
      
      // Import test results
      if (Array.isArray(data.testResults)) {
        for (const testResult of data.testResults) {
          try {
            // Convert string dates back to Date objects
            if (testResult.createdAt && typeof testResult.createdAt === 'string') {
              testResult.createdAt = new Date(testResult.createdAt);
            }
            if (testResult.testedAt && typeof testResult.testedAt === 'string') {
              testResult.testedAt = new Date(testResult.testedAt);
            }
            if (testResult.execution?.startedAt && typeof testResult.execution.startedAt === 'string') {
              testResult.execution.startedAt = new Date(testResult.execution.startedAt);
            }
            if (testResult.execution?.completedAt && typeof testResult.execution.completedAt === 'string') {
              testResult.execution.completedAt = new Date(testResult.execution.completedAt);
            }
            
            this.storeTestResult(testResult);
            importedCount++;
          } catch (error) {
            errors.push(`Failed to import test result ${testResult.id}: ${error}`);
          }
        }
      }
      
      // Import consistency measurements
      if (Array.isArray(data.consistencyMeasurements)) {
        for (const measurement of data.consistencyMeasurements) {
          try {
            this.storeConsistencyMeasurement(measurement);
            importedCount++;
          } catch (error) {
            errors.push(`Failed to import consistency measurement ${measurement.testCaseId}: ${error}`);
          }
        }
      }
      
    } catch (error) {
      errors.push(`Failed to parse JSON: ${error}`);
    }
    
    return { imported: importedCount, errors };
  }

  /**
   * Cleanup old results for a test case
   */
  private cleanupOldResults(testCaseId: string): void {
    const resultIds = this.testCaseResults.get(testCaseId);
    if (!resultIds || resultIds.size <= this.config.maxResultsPerTestCase) {
      return;
    }
    
    // Get all results for this test case
    const results = Array.from(resultIds)
      .map(id => this.testResults.get(id))
      .filter((result): result is TestResult => result !== undefined);
    
    // Sort by date (oldest first)
    results.sort((a, b) => {
      const dateA = a.testedAt?.getTime() || a.createdAt.getTime();
      const dateB = b.testedAt?.getTime() || b.createdAt.getTime();
      return dateA - dateB;
    });
    
    // Remove oldest results
    const toRemove = results.slice(0, results.length - this.config.maxResultsPerTestCase);
    for (const result of toRemove) {
      this.testResults.delete(result.id);
      resultIds.delete(result.id);
    }
  }

  /**
   * Apply query filters to results
   */
  private applyQueryFilters(results: TestResult[], options?: QueryOptions): TestResult[] {
    if (!options) return results;
    
    let filtered = results;
    
    // Filter by test case ID
    if (options.testCaseId) {
      filtered = filtered.filter(r => r.testCaseId === options.testCaseId);
    }
    
    // Filter by date range
    if (options.startDate) {
      filtered = filtered.filter(r => {
        const testDate = r.testedAt || r.createdAt;
        return testDate >= options.startDate!;
      });
    }
    
    if (options.endDate) {
      filtered = filtered.filter(r => {
        const testDate = r.testedAt || r.createdAt;
        return testDate <= options.endDate!;
      });
    }
    
    // Filter by score
    if (options.minScore !== undefined) {
      filtered = filtered.filter(r => r.scores.overallReproducibilityScore >= options.minScore!);
    }
    
    if (options.maxScore !== undefined) {
      filtered = filtered.filter(r => r.scores.overallReproducibilityScore <= options.maxScore!);
    }
    
    // Filter by status
    if (options.status && options.status.length > 0) {
      filtered = filtered.filter(r => options.status!.includes(r.status));
    }
    
    return filtered;
  }

  /**
   * Apply sorting to results
   */
  private applySorting(results: TestResult[], options?: QueryOptions): TestResult[] {
    if (!options?.sortBy) return results;
    
    const sorted = [...results];
    
    sorted.sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      switch (options.sortBy) {
        case 'date':
          valueA = a.testedAt?.getTime() || a.createdAt.getTime();
          valueB = b.testedAt?.getTime() || b.createdAt.getTime();
          break;
        case 'score':
          valueA = a.scores.overallReproducibilityScore;
          valueB = b.scores.overallReproducibilityScore;
          break;
        case 'testCaseId':
          valueA = a.testCaseId;
          valueB = b.testCaseId;
          break;
        default:
          return 0;
      }
      
      if (valueA < valueB) return options.sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return options.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }

  /**
   * Apply limit and offset to results
   */
  private applyLimitOffset(results: TestResult[], options?: QueryOptions): TestResult[] {
    let limited = results;
    
    if (options?.offset !== undefined) {
      limited = limited.slice(options.offset);
    }
    
    if (options?.limit !== undefined) {
      limited = limited.slice(0, options.limit);
    }
    
    return limited;
  }

  /**
   * Calculate approximate storage size
   */
  private calculateStorageSize(): number {
    let size = 0;
    
    // Calculate size of test cases
    for (const testCase of this.testCases.values()) {
      size += JSON.stringify(testCase).length;
    }
    
    // Calculate size of test results
    for (const testResult of this.testResults.values()) {
      size += JSON.stringify(testResult).length;
    }
    
    // Calculate size of consistency measurements
    for (const measurement of this.consistencyMeasurements.values()) {
      size += JSON.stringify(measurement).length;
    }
    
    return size;
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.testCases.clear();
    this.testResults.clear();
    this.consistencyMeasurements.clear();
    this.testCaseResults.clear();
  }

  /**
   * Get configuration
   */
  getConfig(): StorageConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<StorageConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Generate storage report
   */
  generateStorageReport(): string {
    const stats = this.getStatistics();
    
    let report = `# Test Storage System Report\n\n`;
    report += `## Storage Statistics\n`;
    report += `- Total Test Cases: ${stats.totalTestCases}\n`;
    report += `- Total Test Results: ${stats.totalTestResults}\n`;
    report += `- Total Consistency Measurements: ${stats.totalConsistencyMeasurements}\n`;
    report += `- Storage Size: ${this.formatBytes(stats.storageSizeBytes)}\n`;
    
    if (stats.oldestResultDate) {
      report += `- Oldest Result: ${stats.oldestResultDate.toISOString()}\n`;
    }
    
    if (stats.newestResultDate) {
      report += `- Newest Result: ${stats.newestResultDate.toISOString()}\n`;
    }
    
    report += `\n## Configuration\n`;
    report += `- Storage Type: ${this.config.storageType}\n`;
    report += `- Max Results Per Test Case: ${this.config.maxResultsPerTestCase}\n`;
    report += `- Auto Cleanup: ${this.config.autoCleanup ? 'Enabled' : 'Disabled'}\n`;
    if (this.config.autoCleanup) {
      report += `- Cleanup Age: ${this.config.cleanupAgeDays} days\n`;
    }
    report += `- Compression: ${this.config.compressionEnabled ? 'Enabled' : 'Disabled'}\n`;
    report += `- Backup: ${this.config.backupEnabled ? 'Enabled' : 'Disabled'}\n`;
    
    if (Object.keys(stats.byTestCase).length > 0) {
      report += `\n## Test Case Breakdown\n`;
      for (const [testCaseId, caseStats] of Object.entries(stats.byTestCase)) {
        report += `- ${testCaseId}: ${caseStats.resultsCount} results, ${caseStats.consistencyMeasurementsCount} measurements\n`;
      }
    }
    
    return report;
  }

  /**
   * Format bytes to human readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
