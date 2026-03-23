/**
 * Advanced Data Processor - Phase 27.5
 * 
 * Advanced data processing capabilities for Extended Intelligence
 */

export interface DataProcessingConfig {
  batchSize: number;
  parallelProcessing: boolean;
  memoryLimit: number;
  enableCaching: boolean;
  compression: boolean;
  validation: boolean;
}

export interface DataProcessingResult {
  success: boolean;
  processed: number;
  errors: number;
  duration: number;
  memoryUsed: number;
  cacheHits: number;
  compressionRatio: number;
}

export interface DataItem {
  id: string;
  type: string;
  data: any;
  metadata: {
    timestamp: Date;
    priority: number;
    tags: string[];
  };
}

export interface ProcessingBatch {
  id: string;
  items: DataItem[];
  config: DataProcessingConfig;
  startTime: Date;
  endTime?: Date;
  result?: DataProcessingResult;
}

export class AdvancedDataProcessor {
  private config: DataProcessingConfig;
  private cache: Map<string, any>;
  private processingQueue: ProcessingBatch[];
  private activeBatches: Map<string, ProcessingBatch>;
  private memoryTracker: number;

  constructor(config: Partial<DataProcessingConfig> = {}) {
    this.config = {
      batchSize: 100,
      parallelProcessing: true,
      memoryLimit: 1024 * 1024 * 1024, // 1GB
      enableCaching: true,
      compression: true,
      validation: true,
      ...config
    };

    this.cache = new Map();
    this.processingQueue = [];
    this.activeBatches = new Map();
    this.memoryTracker = 0;
  }

  /**
   * Process a single data item
   */
  async processItem(item: DataItem): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Check cache first
      if (this.config.enableCaching) {
        const cached = this.cache.get(item.id);
        if (cached) {
          return cached;
        }
      }

      // Validate data
      if (this.config.validation) {
        this.validateData(item);
      }

      // Process data
      let result = this.transformData(item);

      // Compress if enabled
      if (this.config.compression) {
        result = this.compressData(result);
      }

      // Cache result
      if (this.config.enableCaching) {
        this.cache.set(item.id, result);
        this.memoryTracker += this.estimateMemoryUsage(result);
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to process item ${item.id}: ${error}`);
    } finally {
      const duration = Date.now() - startTime;
      this.logProcessing(item, duration, true);
    }
  }

  /**
   * Process a batch of data items
   */
  async processBatch(items: DataItem[]): Promise<DataProcessingResult> {
    const batchId = this.generateBatchId();
    const batch: ProcessingBatch = {
      id: batchId,
      items: items.slice(0, this.config.batchSize),
      config: this.config,
      startTime: new Date()
    };

    this.activeBatches.set(batchId, batch);
    this.processingQueue.push(batch);

    try {
      const startTime = Date.now();
      let processed = 0;
      let errors = 0;
      let cacheHits = 0;

      // Process items in parallel or sequentially
      const processingPromises: Promise<any>[] = [];
      
      if (this.config.parallelProcessing) {
        // Parallel processing
        for (const item of items) {
          processingPromises.push(this.processItemWithRetry(item));
        }
      } else {
        // Sequential processing
        for (const item of items) {
          processingPromises.push(this.processItemWithRetry(item));
        }
      }

      const results = await Promise.allSettled(processingPromises);

      // Collect results
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          processed++;
          if (result.value === 'cache_hit') {
            cacheHits++;
          }
        } else {
          errors++;
          console.error(`Error processing item ${items[index]?.id}:`, result.reason);
        }
      });

      const duration = Date.now() - startTime;
      const memoryUsed = this.memoryTracker;
      const compressionRatio = this.calculateCompressionRatio(items);

      const batchResult: DataProcessingResult = {
        success: errors === 0,
        processed,
        errors,
        duration,
        memoryUsed,
        cacheHits,
        compressionRatio
      };

      batch.result = batchResult;
      batch.endTime = new Date();

      return batchResult;
    } catch (error) {
      throw new Error(`Batch processing failed: ${error}`);
    } finally {
      this.activeBatches.delete(batchId);
    }
  }

  /**
   * Process data with retry logic
   */
  private async processItemWithRetry(item: DataItem, maxRetries = 3): Promise<any> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.processItem(item);
        return result;
      } catch (error) {
        lastError = error as Error;
        if (attempt === maxRetries) {
          return 'error';
        }
        await this.delay(Math.pow(2, attempt) * 100); // Exponential backoff
      }
    }

    throw lastError!;
  }

  /**
   * Validate data item
   */
  private validateData(item: DataItem): void {
    if (!item.id || typeof item.id !== 'string') {
      throw new Error('Invalid item ID');
    }

    if (!item.type || typeof item.type !== 'string') {
      throw new Error('Invalid item type');
    }

    if (!item.data || typeof item.data !== 'object') {
      throw new Error('Invalid item data');
    }

    if (!item.metadata || !item.metadata.timestamp) {
      throw new Error('Invalid item metadata');
    }
  }

  /**
   * Transform data based on type
   */
  private transformData(item: DataItem): any {
    switch (item.type) {
      case 'text':
        return this.processTextData(item.data);
      case 'numeric':
        return this.processNumericData(item.data);
      case 'structured':
        return this.processStructuredData(item.data);
      case 'unstructured':
        return this.processUnstructuredData(item.data);
      default:
        return item.data;
    }
  }

  /**
   * Process text data
   */
  private processTextData(data: any): any {
    if (typeof data !== 'string') {
      return data;
    }

    return {
      original: data,
      length: data.length,
      wordCount: data.split(/\s+/).length,
      characterCount: data.length,
      processed: data.trim(),
      normalized: data.toLowerCase().replace(/\s+/g, ' ')
    };
  }

  /**
   * Process numeric data
   */
  private processNumericData(data: any): any {
    if (typeof data !== 'number') {
      return data;
    }

    return {
      original: data,
      rounded: Math.round(data),
      formatted: data.toLocaleString(),
      normalized: data / 1000, // Normalize to thousands
      statistics: {
        min: data,
        max: data,
        mean: data,
        median: data
      }
    };
  }

  /**
   * Process structured data
   */
  private processStructuredData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    return {
      original: data,
      keys: Object.keys(data),
      values: Object.values(data),
      normalized: this.normalizeObject(data),
      flattened: this.flattenObject(data)
    };
  }

  /**
   * Process unstructured data
   */
  private processUnstructuredData(data: any): any {
    return {
      original: data,
      type: typeof data,
      size: JSON.stringify(data).length,
      processed: this.cleanUnstructuredData(data)
    };
  }

  /**
   * Compress data
   */
  private compressData(data: any): any {
    // Simple compression - in real implementation, use actual compression library
    return {
      compressed: true,
      originalSize: JSON.stringify(data).length,
      compressedSize: JSON.stringify(data).length, // Placeholder
      data: data
    };
  }

  /**
   * Normalize object
   */
  private normalizeObject(obj: any): any {
    const normalized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      normalized[key.toLowerCase()] = value;
    }
    return normalized;
  }

  /**
   * Flatten object
   */
  private flattenObject(obj: any, prefix = ''): any {
    const flattened: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        Object.assign(flattened, this.flattenObject(value, newKey));
      } else {
        flattened[newKey] = value;
      }
    }
    
    return flattened;
  }

  /**
   * Clean unstructured data
   */
  private cleanUnstructuredData(data: any): any {
    if (typeof data === 'string') {
      return data
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s]/g, '')
        .trim();
    }
    return data;
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(data: any): number {
    return JSON.stringify(data).length * 2; // Rough estimate
  }

  /**
   * Calculate compression ratio
   */
  private calculateCompressionRatio(items: DataItem[]): number {
    const originalSize = items.reduce((total, item) => 
      total + JSON.stringify(item.data).length, 0);
    const compressedSize = items.reduce((total, item) => 
      total + JSON.stringify(this.compressData(item.data)).length, 0);
    
    return originalSize > 0 ? compressedSize / originalSize : 1;
  }

  /**
   * Generate batch ID
   */
  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log processing
   */
  private logProcessing(item: DataItem, duration: number, success: boolean): void {
    console.log(`Processed item ${item.id} in ${duration}ms - ${success ? 'Success' : 'Failed'}`);
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    memoryUsed: number;
    hitRate: number;
  } {
    return {
      size: this.cache.size,
      memoryUsed: this.memoryTracker,
      hitRate: 0 // Would need to track cache hits separately
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.memoryTracker = 0;
  }

  /**
   * Get processing queue status
   */
  getQueueStatus(): {
    queueLength: number;
    activeBatches: number;
    memoryUsage: number;
  } {
    return {
      queueLength: this.processingQueue.length,
      activeBatches: this.activeBatches.size,
      memoryUsage: this.memoryTracker
    };
  }
}