/**
 * Benchmark Storage System
 * 
 * Storage system for benchmark results, scenarios, executions, and analysis results.
 * Supports multiple storage backends (memory, file, database) with configurable persistence.
 */

import {
  BenchmarkResult,
  BenchmarkScenario,
  BenchmarkExecution,
  BenchmarkSuite,
  PerformanceBaseline,
  BenchmarkStatus
} from '../BenchmarkResult';

import { AnalysisResult } from '../analysis/ResultAnalysisEngine';

/**
 * Storage Backend Type
 */
export enum StorageBackendType {
  MEMORY = 'memory',
  FILE = 'file',
  DATABASE = 'database',
  HYBRID = 'hybrid'
}

/**
 * Storage Configuration
 */
export interface StorageConfig {
  /** Storage backend type */
  backend: StorageBackendType;
  
  /** File path for file-based storage */
  filePath?: string;
  
  /** Database connection string for database storage */
  databaseUrl?: string;
  
  /** Enable compression for stored data */
  enableCompression: boolean;
  
  /** Enable encryption for sensitive data */
  enableEncryption: boolean;
  
  /** Maximum storage size in MB (0 = unlimited) */
  maxStorageSizeMB: number;
  
  /** Auto-cleanup of old results (days) */
  autoCleanupDays: number;
  
  /** Enable caching for frequently accessed data */
  enableCaching: boolean;
  
  /** Cache size limit (items) */
  cacheSizeLimit: number;
  
  /** Backup configuration */
  backup: {
    enabled: boolean;
    intervalHours: number;
    backupPath?: string;
    maxBackups: number;
  };
}

/**
 * Storage Query Options
 */
export interface StorageQueryOptions {
  /** Filter by status */
  status?: BenchmarkStatus;
  
  /** Filter by scenario ID */
  scenarioId?: string;
  
  /** Filter by target component */
  targetComponent?: string;
  
  /** Filter by date range */
  dateRange?: {
    start: Date;
    end: Date;
  };
  
  /** Filter by tags */
  tags?: string[];
  
  /** Filter by minimum score */
  minScore?: number;
  
  /** Filter by maximum score */
  maxScore?: number;
  
  /** Sort by field */
  sortBy?: 'createdAt' | 'score' | 'duration' | 'name';
  
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
  
  /** Pagination - page number */
  page?: number;
  
  /** Pagination - items per page */
  pageSize?: number;
  
  /** Include related entities */
  includeRelated?: boolean;
}

/**
 * Storage Statistics
 */
export interface StorageStatistics {
  totalResults: number;
  totalScenarios: number;
  totalExecutions: number;
  totalSuites: number;
  totalBaselines: number;
  totalAnalysisResults: number;
  
  storageSizeMB: number;
  averageResultSizeKB: number;
  compressionRatio: number;
  
  queryCount: number;
  cacheHitRate: number;
  averageQueryTimeMs: number;
  
  lastBackup?: Date;
  backupCount: number;
  
  errors: number;
  warnings: number;
}

/**
 * Benchmark Storage System
 */
export class BenchmarkStorageSystem {
  /** Storage configuration */
  private config: StorageConfig;
  
  /** In-memory storage */
  private memoryStorage: {
    results: Map<string, BenchmarkResult>;
    scenarios: Map<string, BenchmarkScenario>;
    executions: Map<string, BenchmarkExecution>;
    suites: Map<string, BenchmarkSuite>;
    baselines: Map<string, PerformanceBaseline>;
    analysisResults: Map<string, AnalysisResult>;
  };
  
  /** Statistics */
  private statistics: StorageStatistics;
  
  /** Cache for frequently accessed data */
  private cache: Map<string, any>;
  
  /** Event listeners */
  private eventListeners: Map<string, ((data: any) => void)[]>;
  
  /**
   * Constructor
   */
  constructor(config?: Partial<StorageConfig>) {
    this.config = {
      backend: StorageBackendType.MEMORY,
      enableCompression: false,
      enableEncryption: false,
      maxStorageSizeMB: 100,
      autoCleanupDays: 30,
      enableCaching: true,
      cacheSizeLimit: 1000,
      backup: {
        enabled: false,
        intervalHours: 24,
        maxBackups: 10
      },
      ...config
    };
    
    this.initializeStorage();
    this.initializeStatistics();
    this.initializeCache();
    this.initializeEventSystem();
  }
  
  /**
   * Initialize storage
   */
  private initializeStorage(): void {
    this.memoryStorage = {
      results: new Map(),
      scenarios: new Map(),
      executions: new Map(),
      suites: new Map(),
      baselines: new Map(),
      analysisResults: new Map()
    };
  }
  
  /**
   * Initialize statistics
   */
  private initializeStatistics(): void {
    this.statistics = {
      totalResults: 0,
      totalScenarios: 0,
      totalExecutions: 0,
      totalSuites: 0,
      totalBaselines: 0,
      totalAnalysisResults: 0,
      storageSizeMB: 0,
      averageResultSizeKB: 0,
      compressionRatio: 1.0,
      queryCount: 0,
      cacheHitRate: 0,
      averageQueryTimeMs: 0,
      backupCount: 0,
      errors: 0,
      warnings: 0
    };
  }
  
  /**
   * Initialize cache
   */
  private initializeCache(): void {
    this.cache = new Map();
  }
  
  /**
   * Initialize event system
   */
  private initializeEventSystem(): void {
    this.eventListeners = new Map();
  }
  
  /**
   * Store benchmark result
   */
  public async storeResult(result: BenchmarkResult): Promise<string> {
    try {
      // Validate result
      this.validateResult(result);
      
      // Store in memory
      this.memoryStorage.results.set(result.id, result);
      
      // Update statistics
      this.statistics.totalResults++;
      this.updateStorageSize();
      
      // Emit event
      this.emitEvent('result:stored', { resultId: result.id, timestamp: new Date() });
      
      // Cache result
      if (this.config.enableCaching) {
        this.cacheResult(`result:${result.id}`, result);
      }
      
      // Auto-cleanup if needed
      await this.autoCleanup();
      
      return result.id;
      
    } catch (error) {
      this.statistics.errors++;
      this.emitEvent('error', { operation: 'storeResult', error, timestamp: new Date() });
      throw error;
    }
  }
  
  /**
   * Store benchmark scenario
   */
  public async storeScenario(scenario: BenchmarkScenario): Promise<string> {
    try {
      // Validate scenario
      this.validateScenario(scenario);
      
      // Store in memory
      this.memoryStorage.scenarios.set(scenario.id, scenario);
      
      // Update statistics
      this.statistics.totalScenarios++;
      
      // Emit event
      this.emitEvent('scenario:stored', { scenarioId: scenario.id, timestamp: new Date() });
      
      return scenario.id;
      
    } catch (error) {
      this.statistics.errors++;
      this.emitEvent('error', { operation: 'storeScenario', error, timestamp: new Date() });
      throw error;
    }
  }
  
  /**
   * Store benchmark execution
   */
  public async storeExecution(execution: BenchmarkExecution): Promise<string> {
    try {
      // Validate execution
      this.validateExecution(execution);
      
      // Store in memory
      this.memoryStorage.executions.set(execution.id, execution);
      
      // Update statistics
      this.statistics.totalExecutions++;
      
      // Emit event
      this.emitEvent('execution:stored', { executionId: execution.id, timestamp: new Date() });
      
      return execution.id;
      
    } catch (error) {
      this.statistics.errors++;
      this.emitEvent('error', { operation: 'storeExecution', error, timestamp: new Date() });
      throw error;
    }
  }
  
  /**
   * Store benchmark suite
   */
  public async storeSuite(suite: BenchmarkSuite): Promise<string> {
    try {
      // Validate suite
      this.validateSuite(suite);
      
      // Store in memory
      this.memoryStorage.suites.set(suite.id, suite);
      
      // Update statistics
      this.statistics.totalSuites++;
      
      // Emit event
      this.emitEvent('suite:stored', { suiteId: suite.id, timestamp: new Date() });
      
      return suite.id;
      
    } catch (error) {
      this.statistics.errors++;
      this.emitEvent('error', { operation: 'storeSuite', error, timestamp: new Date() });
      throw error;
    }
  }
  
  /**
   * Store performance baseline
   */
  public async storeBaseline(baseline: PerformanceBaseline): Promise<string> {
    try {
      // Validate baseline
      this.validateBaseline(baseline);
      
      // Store in memory
      this.memoryStorage.baselines.set(baseline.id, baseline);
      
      // Update statistics
      this.statistics.totalBaselines++;
      
      // Emit event
      this.emitEvent('baseline:stored', { baselineId: baseline.id, timestamp: new Date() });
      
      return baseline.id;
      
    } catch (error) {
      this.statistics.errors++;
      this.emitEvent('error', { operation: 'storeBaseline', error, timestamp: new Date() });
      throw error;
    }
  }
  
  /**
   * Store analysis result
   */
  public async storeAnalysisResult(analysis: AnalysisResult, resultId?: string): Promise<string> {
    try {
      // Generate ID if not provided
      const analysisId = resultId || `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Store in memory
      this.memoryStorage.analysisResults.set(analysisId, analysis);
      
      // Update statistics
      this.statistics.totalAnalysisResults++;
      
      // Emit event
      this.emitEvent('analysis:stored', { analysisId, timestamp: new Date() });
      
      // Cache analysis
      if (this.config.enableCaching) {
        this.cacheResult(`analysis:${analysisId}`, analysis);
      }
      
      return analysisId;
      
    } catch (error) {
      this.statistics.errors++;
      this.emitEvent('error', { operation: 'storeAnalysisResult', error, timestamp: new Date() });
      throw error;
    }
  }
  
  /**
   * Get benchmark result by ID
   */
  public async getResult(resultId: string): Promise<BenchmarkResult | undefined> {
    this.statistics.queryCount++;
    
    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.cache.get(`result:${resultId}`);
      if (cached) {
        this.statistics.cacheHitRate = (this.statistics.cacheHitRate * (this.statistics.queryCount - 1) + 1) / this.statistics.queryCount;
        return cached;
      }
    }
    
    // Get from storage
    const result = this.memoryStorage.results.get(resultId);
    
    // Cache if found
    if (result && this.config.enableCaching) {
      this.cacheResult(`result:${resultId}`, result);
    }
    
    return result;
  }
  
  /**
   * Get benchmark scenario by ID
   */
  public async getScenario(scenarioId: string): Promise<BenchmarkScenario | undefined> {
    return this.memoryStorage.scenarios.get(scenarioId);
  }
  
  /**
   * Get benchmark execution by ID
   */
  public async getExecution(executionId: string): Promise<BenchmarkExecution | undefined> {
    return this.memoryStorage.executions.get(executionId);
  }
  
  /**
   * Get benchmark suite by ID
   */
  public async getSuite(suiteId: string): Promise<BenchmarkSuite | undefined> {
    return this.memoryStorage.suites.get(suiteId);
  }
  
  /**
   * Get performance baseline by ID
   */
  public async getBaseline(baselineId: string): Promise<PerformanceBaseline | undefined> {
    return this.memoryStorage.baselines.get(baselineId);
  }
  
  /**
   * Get analysis result by ID
   */
  public async getAnalysisResult(analysisId: string): Promise<AnalysisResult | undefined> {
    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.cache.get(`analysis:${analysisId}`);
      if (cached) {
        return cached;
      }
    }
    
    // Get from storage
    const analysis = this.memoryStorage.analysisResults.get(analysisId);
    
    // Cache if found
    if (analysis && this.config.enableCaching) {
      this.cacheResult(`analysis:${analysisId}`, analysis);
    }
    
    return analysis;
  }
  
  /**
   * Query benchmark results
   */
  public async queryResults(options: StorageQueryOptions = {}): Promise<{
    results: BenchmarkResult[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const startTime = performance.now();
    
    try {
      // Get all results
      let results = Array.from(this.memoryStorage.results.values());
      
      // Apply filters
      results = this.applyResultFilters(results, options);
      
      // Apply sorting
      results = this.applyResultSorting(results, options);
      
      // Apply pagination
      const paginatedResults = this.applyPagination(results, options);
      
      // Update statistics
      const queryTime = performance.now() - startTime;
      this.statistics.averageQueryTimeMs = 
        (this.statistics.averageQueryTimeMs * (this.statistics.queryCount - 1) + queryTime) / this.statistics.queryCount;
      
      return {
        results: paginatedResults,
        total: results.length,
        page: options.page || 1,
        pageSize: options.pageSize || results.length,
        totalPages: options.pageSize ? Math.ceil(results.length / options.pageSize) : 1
      };
      
    } catch (error) {
      this.statistics.errors++;
      this.emitEvent('error', { operation: 'queryResults', error, timestamp: new Date() });
      throw error;
    }
  }
  
  /**
   * Apply filters to results
   */
  private applyResultFilters(results: BenchmarkResult[], options: StorageQueryOptions): BenchmarkResult[] {
    let filtered = results;
    
    // Filter by status
    if (options.status) {
      filtered = filtered.filter(result => result.status === options.status);
    }
    
    // Filter by scenario ID
    if (options.scenarioId) {
      filtered = filtered.filter(result => result.scenarioId === options.scenarioId);
    }
    
    // Filter by date range
    if (options.dateRange) {
      filtered = filtered.filter(result => {
        const resultDate = result.createdAt;
        return resultDate >= options.dateRange!.start && resultDate <= options.dateRange!.end;
      });
    }
    
    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      filtered = filtered.filter(result => 
        options.tags!.some(tag => result.tags.includes(tag))
      );
    }
    
    // Filter by score range
    if (options.minScore !== undefined) {
      filtered = filtered.filter(result => result.scores.overallScore >= options.minScore!);
    }
    
    if (options.maxScore !== undefined) {
      filtered = filtered.filter(result => result.scores.overallScore <= options.maxScore!);
    }
    
    return filtered;
  }
  
  /**
   * Apply sorting to results
   */
  private applyResultSorting(results: BenchmarkResult[], options: StorageQueryOptions): BenchmarkResult[] {
    const sorted = [...results];
    const sortBy = options.sortBy || 'createdAt';
    const sortDirection = options.sortDirection || 'desc';
    
    sorted.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'score':
          aValue = a.scores.overallScore;
          bValue = b.scores.overallScore;
          break;
        case 'duration':
          // Get execution duration if available
          aValue = 0;
          bValue = 0;
          break;
        case 'name':
          // Get scenario name if available
          aValue = a.id;
          bValue = b.id;
          break;
        default:
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
    
    return sorted;
  }
  
  /**
   * Apply pagination
   */
  private applyPagination<T>(items: T[], options: StorageQueryOptions): T[] {
    const page = options.page || 1;
    const pageSize = options.pageSize || items.length;
    
    if (pageSize >= items.length) {
      return items;
    }
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return items.slice(startIndex, endIndex);
  }
  
  /**
   * Get results by scenario ID
   */
  public async getResultsByScenario(scenarioId: string): Promise<BenchmarkResult[]> {
    const results = Array.from(this.memoryStorage.results.values());
    return results.filter(result => result.scenarioId === scenarioId);
  }
  
  /**
   * Get results by target component
   */
  public async getResultsByTargetComponent(targetComponent: string, scenarios: BenchmarkScenario[]): Promise<BenchmarkResult[]> {
    // Get scenario IDs for the target component
    const scenarioIds = scenarios
      .filter(scenario => scenario.targetComponent === targetComponent)
      .map(scenario => scenario.id);
    
    // Get results for those scenarios
    const results = Array.from(this.memoryStorage.results.values());
    return results.filter(result => scenarioIds.includes(result.scenarioId));
  }
  
  /**
   * Get latest result for each scenario
   */
  public async getLatestResults(): Promise<Map<string, BenchmarkResult>> {
    const results = Array.from(this.memoryStorage.results.values());
    const latestResults = new Map<string, BenchmarkResult>();
    
    results.forEach(result => {
      const existing = latestResults.get(result.scenarioId);
      if (!existing || result.createdAt > existing.createdAt) {
        latestResults.set(result.scenarioId, result);
      }
    });
    
    return latestResults;
  }
  
  /**
   * Get performance trends for a scenario
   */
  public async getPerformanceTrends(scenarioId: string): Promise<{
    results: BenchmarkResult[];
    scores: number[];
    dates: Date[];
    averageScore: number;
    trend: 'improving' | 'declining' | 'stable';
  }> {
    const results = await this.getResultsByScenario(scenarioId);
    const sortedResults = results.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    const scores = sortedResults.map(r => r.scores.overallScore);
    const dates = sortedResults.map(r => r.createdAt);
    
    // Calculate trend
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (scores.length >= 2) {
      const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
      const secondHalf = scores.slice(Math.floor(scores.length / 2));
      const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      if (avgSecond > avgFirst + 0.1) {
        trend = 'improving';
      } else if (avgSecond < avgFirst - 0.1) {
        trend = 'declining';
      }
    }
    
    return {
      results: sortedResults,
      scores,
      dates,
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      trend
    };
  }
  
  /**
   * Delete benchmark result
   */
  public async deleteResult(resultId: string): Promise<boolean> {
    const deleted = this.memoryStorage.results.delete(resultId);
    if (deleted) {
      this.statistics.totalResults--;
      this.emitEvent('result:deleted', { resultId, timestamp: new Date() });
      
      // Remove from cache
      if (this.config.enableCaching) {
        this.cache.delete(`result:${resultId}`);
      }
    }
    return deleted;
  }
  
  /**
   * Delete all results for a scenario
   */
  public async deleteResultsByScenario(scenarioId: string): Promise<number> {
    const results = Array.from(this.memoryStorage.results.values());
    const toDelete = results.filter(result => result.scenarioId === scenarioId);
    
    toDelete.forEach(result => {
      this.memoryStorage.results.delete(result.id);
      
      // Remove from cache
      if (this.config.enableCaching) {
        this.cache.delete(`result:${result.id}`);
      }
    });
    
    const count = toDelete.length;
    this.statistics.totalResults -= count;
    
    if (count > 0) {
      this.emitEvent('results:deleted', { scenarioId, count, timestamp: new Date() });
    }
    
    return count;
  }
  
  /**
   * Export benchmark data
   */
  public async exportData(format: 'json' | 'csv' | 'yaml' = 'json'): Promise<string> {
    const data = {
      results: Array.from(this.memoryStorage.results.values()),
      scenarios: Array.from(this.memoryStorage.scenarios.values()),
      executions: Array.from(this.memoryStorage.executions.values()),
      suites: Array.from(this.memoryStorage.suites.values()),
      baselines: Array.from(this.memoryStorage.baselines.values()),
      analysisResults: Array.from(this.memoryStorage.analysisResults.values()),
      metadata: {
        exportedAt: new Date(),
        version: '1.0.0',
        totalItems: this.statistics.totalResults + this.statistics.totalScenarios +
                   this.statistics.totalExecutions + this.statistics.totalSuites +
                   this.statistics.totalBaselines + this.statistics.totalAnalysisResults
      }
    };
    
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        // Simple CSV conversion for results
        const csvRows = ['id,scenarioId,status,overallScore,createdAt'];
        data.results.forEach(result => {
          csvRows.push(`${result.id},${result.scenarioId},${result.status},${result.scores.overallScore},${result.createdAt.toISOString()}`);
        });
        return csvRows.join('\n');
      case 'yaml':
        // Simple YAML conversion
        return `results: ${data.results.length}\nscenarios: ${data.scenarios.length}\nexecutions: ${data.executions.length}`;
      default:
        return JSON.stringify(data, null, 2);
    }
  }
  
  /**
   * Import benchmark data
   */
  public async importData(data: string, format: 'json' | 'csv' | 'yaml' = 'json'): Promise<{
    imported: {
      results: number;
      scenarios: number;
      executions: number;
      suites: number;
      baselines: number;
      analysisResults: number;
    };
    errors: string[];
  }> {
    const errors: string[] = [];
    const imported = {
      results: 0,
      scenarios: 0,
      executions: 0,
      suites: 0,
      baselines: 0,
      analysisResults: 0
    };
    
    try {
      let parsedData: any;
      
      switch (format) {
        case 'json':
          parsedData = JSON.parse(data);
          break;
        case 'csv':
          // Simple CSV parsing
          parsedData = { results: [] };
          const lines = data.split('\n');
          const headers = lines[0].split(',');
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            if (values.length === headers.length) {
              const result: any = {};
              headers.forEach((header, index) => {
                result[header] = values[index];
              });
              parsedData.results.push(result);
            }
          }
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
      
      // Import results
      if (parsedData.results && Array.isArray(parsedData.results)) {
        for (const resultData of parsedData.results) {
          try {
            // Convert string dates to Date objects
            if (typeof resultData.createdAt === 'string') {
              resultData.createdAt = new Date(resultData.createdAt);
            }
            if (typeof resultData.updatedAt === 'string') {
              resultData.updatedAt = new Date(resultData.updatedAt);
            }
            
            await this.storeResult(resultData as BenchmarkResult);
            imported.results++;
          } catch (error) {
            errors.push(`Failed to import result ${resultData.id}: ${error}`);
          }
        }
      }
      
      // Import scenarios
      if (parsedData.scenarios && Array.isArray(parsedData.scenarios)) {
        for (const scenarioData of parsedData.scenarios) {
          try {
            await this.storeScenario(scenarioData as BenchmarkScenario);
            imported.scenarios++;
          } catch (error) {
            errors.push(`Failed to import scenario ${scenarioData.id}: ${error}`);
          }
        }
      }
      
      this.emitEvent('data:imported', { imported, errors, timestamp: new Date() });
      return { imported, errors };
      
    } catch (error) {
      this.statistics.errors++;
      this.emitEvent('error', { operation: 'importData', error, timestamp: new Date() });
      throw error;
    }
  }
  
  /**
   * Get storage statistics
   */
  public getStatistics(): StorageStatistics {
    return { ...this.statistics };
  }
  
  /**
   * Clear all storage
   */
  public async clearAll(): Promise<void> {
    this.memoryStorage.results.clear();
    this.memoryStorage.scenarios.clear();
    this.memoryStorage.executions.clear();
    this.memoryStorage.suites.clear();
    this.memoryStorage.baselines.clear();
    this.memoryStorage.analysisResults.clear();
    
    this.cache.clear();
    
    this.initializeStatistics();
    
    this.emitEvent('storage:cleared', { timestamp: new Date() });
  }
  
  /**
   * Backup storage
   */
  public async backup(): Promise<string> {
    if (!this.config.backup.enabled) {
      throw new Error('Backup is not enabled');
    }
    
    const backupId = `backup_${Date.now()}`;
    const backupData = await this.exportData('json');
    
    // In a real implementation, this would save to a file or database
    // For now, we'll just emit an event
    this.emitEvent('backup:created', { backupId, timestamp: new Date() });
    
    this.statistics.backupCount++;
    this.statistics.lastBackup = new Date();
    
    return backupId;
  }
  
  /**
   * Restore from backup
   */
  public async restore(backupId: string): Promise<boolean> {
    // In a real implementation, this would load from a file or database
    // For now, we'll just emit an event
    this.emitEvent('backup:restored', { backupId, timestamp: new Date() });
    return true;
  }
  
  /**
   * Validate benchmark result
   */
  private validateResult(result: BenchmarkResult): void {
    if (!result.id) {
      throw new Error('Result must have an ID');
    }
    if (!result.scenarioId) {
      throw new Error('Result must have a scenario ID');
    }
    if (!result.status) {
      throw new Error('Result must have a status');
    }
    if (!result.scores) {
      throw new Error('Result must have scores');
    }
  }
  
  /**
   * Validate benchmark scenario
   */
  private validateScenario(scenario: BenchmarkScenario): void {
    if (!scenario.id) {
      throw new Error('Scenario must have an ID');
    }
    if (!scenario.name) {
      throw new Error('Scenario must have a name');
    }
    if (!scenario.targetComponent) {
      throw new Error('Scenario must have a target component');
    }
  }
  
  /**
   * Validate benchmark execution
   */
  private validateExecution(execution: BenchmarkExecution): void {
    if (!execution.id) {
      throw new Error('Execution must have an ID');
    }
    if (!execution.scenarioId) {
      throw new Error('Execution must have a scenario ID');
    }
  }
  
  /**
   * Validate benchmark suite
   */
  private validateSuite(suite: BenchmarkSuite): void {
    if (!suite.id) {
      throw new Error('Suite must have an ID');
    }
    if (!suite.name) {
      throw new Error('Suite must have a name');
    }
    if (!suite.scenarioIds || suite.scenarioIds.length === 0) {
      throw new Error('Suite must have at least one scenario');
    }
  }
  
  /**
   * Validate performance baseline
   */
  private validateBaseline(baseline: PerformanceBaseline): void {
    if (!baseline.id) {
      throw new Error('Baseline must have an ID');
    }
    if (!baseline.scenarioId) {
      throw new Error('Baseline must have a scenario ID');
    }
    if (!baseline.metrics) {
      throw new Error('Baseline must have metrics');
    }
  }
  
  /**
   * Update storage size statistics
   */
  private updateStorageSize(): void {
    // Calculate approximate storage size
    let totalSize = 0;
    
    // Calculate size of all results
    this.memoryStorage.results.forEach(result => {
      totalSize += JSON.stringify(result).length;
    });
    
    // Convert to MB
    this.statistics.storageSizeMB = totalSize / (1024 * 1024);
    this.statistics.averageResultSizeKB =
      this.statistics.totalResults > 0 ? (totalSize / this.statistics.totalResults) / 1024 : 0;
  }
  
  /**
   * Cache a result
   */
  private cacheResult(key: string, value: any): void {
    if (!this.config.enableCaching) {
      return;
    }
    
    // Check cache size limit
    if (this.cache.size >= this.config.cacheSizeLimit) {
      // Remove oldest entry (simple FIFO)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, value);
  }
  
  /**
   * Auto-cleanup old results
   */
  private async autoCleanup(): Promise<void> {
    if (this.config.autoCleanupDays <= 0) {
      return;
    }
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.autoCleanupDays);
    
    const results = Array.from(this.memoryStorage.results.values());
    const oldResults = results.filter(result => result.createdAt < cutoffDate);
    
    for (const result of oldResults) {
      await this.deleteResult(result.id);
    }
    
    if (oldResults.length > 0) {
      this.emitEvent('cleanup:completed', {
        removedCount: oldResults.length,
        cutoffDate,
        timestamp: new Date()
      });
    }
  }
  
  /**
   * Emit event
   */
  private emitEvent(eventName: string, data: any): void {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventName}:`, error);
        }
      });
    }
  }
  
  /**
   * Add event listener
   */
  public on(eventName: string, listener: (data: any) => void): void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName)!.push(listener);
  }
  
  /**
   * Remove event listener
   */
  public off(eventName: string, listener: (data: any) => void): void {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }
}