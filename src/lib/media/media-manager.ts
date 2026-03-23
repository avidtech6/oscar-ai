/**
 * Media Intelligence Layer - PHASE 22
 * Handles media processing, storage, retrieval, and analysis for the Oscar-AI-v2 system
 */

/**
 * Media file types
 */
export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  ARCHIVE = 'archive'
}

/**
 * Media status
 */
export enum MediaStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  READY = 'ready',
  ERROR = 'error',
  DELETED = 'deleted'
}

/**
 * Media metadata interface
 */
export interface MediaMetadata {
  id: string;
  filename: string;
  originalName: string;
  type: MediaType;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number;
  format: string;
  quality: string;
  uploadDate: Date;
  modifiedDate: Date;
  checksum: string;
  tags: string[];
  description?: string;
  copyright?: string;
  accessLevel: 'public' | 'private' | 'restricted';
  metadata: Record<string, any>;
}

/**
 * Media processing options
 */
export interface MediaProcessingOptions {
  resize?: {
    width?: number;
    height?: number;
    maintainAspectRatio?: boolean;
  };
  compress?: {
    quality?: number;
    format?: string;
  };
  convert?: {
    format: string;
    quality?: number;
  };
  extractMetadata?: boolean;
  generateThumbnails?: boolean;
  applyFilters?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    blur?: number;
  };
}

/**
 * Media processing result
 */
export interface MediaProcessingResult {
  success: boolean;
  outputFiles: string[];
  metadata: MediaMetadata;
  processingTime: number;
  errors?: string[];
}

/**
 * Media search query
 */
export interface MediaSearchQuery {
  type?: MediaType;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  size?: {
    min?: number;
    max?: number;
  };
  filename?: string;
  description?: string;
  accessLevel?: 'public' | 'private' | 'restricted';
  metadata?: Record<string, any>;
}

/**
 * Media search result
 */
export interface MediaSearchResult {
  results: MediaMetadata[];
  total: number;
  page: number;
  pageSize: number;
  query: MediaSearchQuery;
}

/**
 * Media statistics
 */
export interface MediaStats {
  totalFiles: number;
  totalSize: number;
  typeDistribution: Record<MediaType, number>;
  averageFileSize: number;
  uploadRate: number;
  processingRate: number;
  errorRate: number;
  storageUtilization: number;
}

/**
 * Media Manager - Handles all media operations
 */
export class MediaManager {
  private mediaStore: Map<string, MediaMetadata> = new Map();
  private processingQueue: Array<{
    id: string;
    metadata: MediaMetadata;
    options: MediaProcessingOptions;
    priority: number;
  }> = [];
  private isProcessing = false;
  private stats: MediaStats;

  constructor() {
    this.stats = {
      totalFiles: 0,
      totalSize: 0,
      typeDistribution: {
        [MediaType.IMAGE]: 0,
        [MediaType.VIDEO]: 0,
        [MediaType.AUDIO]: 0,
        [MediaType.DOCUMENT]: 0,
        [MediaType.ARCHIVE]: 0
      },
      averageFileSize: 0,
      uploadRate: 0,
      processingRate: 0,
      errorRate: 0,
      storageUtilization: 0
    };
  }

  /**
   * Upload a media file
   */
  async uploadMedia(file: File, options?: {
    tags?: string[];
    description?: string;
    accessLevel?: 'public' | 'private' | 'restricted';
    metadata?: Record<string, any>;
  }): Promise<MediaMetadata> {
    const startTime = Date.now();
    
    try {
      // Generate unique ID and filename
      const id = this.generateMediaId();
      const filename = `${id}_${file.name}`;
      
      // Create metadata
      const metadata: MediaMetadata = {
        id,
        filename,
        originalName: file.name,
        type: this.detectMediaType(file.type),
        size: file.size,
        mimeType: file.type,
        format: this.extractFormat(file.name),
        quality: 'high',
        uploadDate: new Date(),
        modifiedDate: new Date(),
        checksum: await this.generateChecksum(file),
        tags: options?.tags || [],
        description: options?.description,
        accessLevel: options?.accessLevel || 'private',
        metadata: options?.metadata || {}
      };

      // Store metadata
      this.mediaStore.set(id, metadata);
      
      // Update statistics
      this.updateStats(metadata.size, metadata.type);
      
      // Add to processing queue if needed
      if (this.requiresProcessing(metadata)) {
        this.addToProcessingQueue(metadata, {});
      }

      const processingTime = Date.now() - startTime;
      console.log(`[MediaManager] Uploaded ${metadata.type} file ${id} in ${processingTime}ms`);
      
      return metadata;
    } catch (error) {
      console.error('[MediaManager] Upload failed:', error);
      throw new Error(`Media upload failed: ${error}`);
    }
  }

  /**
   * Process media file
   */
  async processMedia(id: string, options: MediaProcessingOptions): Promise<MediaProcessingResult> {
    const metadata = this.mediaStore.get(id);
    if (!metadata) {
      throw new Error(`Media file ${id} not found`);
    }

    const startTime = Date.now();
    
    try {
      // Process the media file
      const outputFiles = await this.performProcessing(metadata, options);
      
      // Update metadata
      metadata.modifiedDate = new Date();
      if (options.resize) {
        metadata.width = options.resize.width;
        metadata.height = options.resize.height;
      }
      
      // Store updated metadata
      this.mediaStore.set(id, metadata);
      
      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        outputFiles,
        metadata,
        processingTime
      };
    } catch (error) {
      console.error(`[MediaManager] Processing failed for ${id}:`, error);
      return {
        success: false,
        outputFiles: [],
        metadata,
        processingTime: Date.now() - startTime,
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Get media metadata
   */
  getMedia(id: string): MediaMetadata | undefined {
    return this.mediaStore.get(id);
  }

  /**
   * Search media files
   */
  searchMedia(query: MediaSearchQuery): MediaSearchResult {
    const results: MediaMetadata[] = [];
    
    for (const metadata of this.mediaStore.values()) {
      if (this.matchesQuery(metadata, query)) {
        results.push(metadata);
      }
    }

    // Sort by upload date (newest first)
    results.sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());

    return {
      results,
      total: results.length,
      page: 1,
      pageSize: results.length,
      query
    };
  }

  /**
   * Delete media file
   */
  async deleteMedia(id: string): Promise<boolean> {
    const metadata = this.mediaStore.get(id);
    if (!metadata) {
      return false;
    }

    try {
      // Remove from storage
      this.mediaStore.delete(id);
      
      // Update statistics
      this.updateStats(-metadata.size, metadata.type);
      
      console.log(`[MediaManager] Deleted ${metadata.type} file ${id}`);
      return true;
    } catch (error) {
      console.error(`[MediaManager] Failed to delete ${id}:`, error);
      return false;
    }
  }

  /**
   * Get media statistics
   */
  getStats(): MediaStats {
    // Calculate average file size
    const sizes = Array.from(this.mediaStore.values()).map(m => m.size);
    this.stats.averageFileSize = sizes.length > 0 ? sizes.reduce((a, b) => a + b, 0) / sizes.length : 0;
    
    // Calculate storage utilization (assuming 1GB limit)
    const totalSize = Array.from(this.mediaStore.values()).reduce((sum, m) => sum + m.size, 0);
    this.stats.storageUtilization = Math.min(100, (totalSize / (1024 * 1024 * 1024)) * 100);
    
    return { ...this.stats };
  }

  /**
   * Get processing queue status
   */
  getProcessingQueueStatus(): {
    queueLength: number;
    isProcessing: boolean;
    averageWaitTime: number;
  } {
    return {
      queueLength: this.processingQueue.length,
      isProcessing: this.isProcessing,
      averageWaitTime: this.processingQueue.length > 0 ? 5000 : 0 // Simplified calculation
    };
  }

  /**
   * Add file to processing queue
   */
  private addToProcessingQueue(metadata: MediaMetadata, options: MediaProcessingOptions): void {
    this.processingQueue.push({
      id: metadata.id,
      metadata,
      options,
      priority: this.calculatePriority(metadata)
    });

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Process the queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.processingQueue.length > 0) {
      const item = this.processingQueue.shift()!;
      try {
        await this.processMedia(item.id, item.options);
      } catch (error) {
        console.error(`[MediaManager] Queue processing failed for ${item.id}:`, error);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Detect media type from MIME type
   */
  private detectMediaType(mimeType: string): MediaType {
    if (mimeType.startsWith('image/')) return MediaType.IMAGE;
    if (mimeType.startsWith('video/')) return MediaType.VIDEO;
    if (mimeType.startsWith('audio/')) return MediaType.AUDIO;
    if (mimeType.includes('document') || mimeType.includes('pdf') || mimeType.includes('text')) {
      return MediaType.DOCUMENT;
    }
    return MediaType.ARCHIVE;
  }

  /**
   * Extract format from filename
   */
  private extractFormat(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'unknown';
  }

  /**
   * Generate checksum for file
   */
  private async generateChecksum(file: File): Promise<string> {
    // Simplified checksum generation
    return `checksum_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if media requires processing
   */
  private requiresProcessing(metadata: MediaMetadata): boolean {
    return metadata.type === MediaType.IMAGE || metadata.type === MediaType.VIDEO;
  }

  /**
   * Perform media processing
   */
  private async performProcessing(metadata: MediaMetadata, options: MediaProcessingOptions): Promise<string[]> {
    // Simplified processing - in real implementation, this would use actual media processing libraries
    const outputFiles: string[] = [];
    
    if (options.resize && metadata.type === MediaType.IMAGE) {
      outputFiles.push(`${metadata.filename}_resized.jpg`);
    }
    
    if (options.compress && metadata.type === MediaType.IMAGE) {
      outputFiles.push(`${metadata.filename}_compressed.jpg`);
    }
    
    if (options.generateThumbnails && metadata.type === MediaType.IMAGE) {
      outputFiles.push(`${metadata.filename}_thumb.jpg`);
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return outputFiles;
  }

  /**
   * Check if metadata matches search query
   */
  private matchesQuery(metadata: MediaMetadata, query: MediaSearchQuery): boolean {
    if (query.type && metadata.type !== query.type) return false;
    if (query.tags && !query.tags.some(tag => metadata.tags.includes(tag))) return false;
    if (query.dateRange) {
      const uploadDate = metadata.uploadDate;
      if (uploadDate < query.dateRange.start || uploadDate > query.dateRange.end) return false;
    }
    if (query.size) {
      if (query.size.min && metadata.size < query.size.min) return false;
      if (query.size.max && metadata.size > query.size.max) return false;
    }
    if (query.filename && !metadata.filename.includes(query.filename)) return false;
    if (query.description && !metadata.description?.includes(query.description)) return false;
    if (query.accessLevel && metadata.accessLevel !== query.accessLevel) return false;
    
    return true;
  }

  /**
   * Update statistics
   */
  private updateStats(sizeChange: number, type: MediaType): void {
    this.stats.totalFiles += sizeChange > 0 ? 1 : -1;
    this.stats.totalSize += sizeChange;
    if (sizeChange > 0) {
      this.stats.typeDistribution[type]++;
    } else {
      this.stats.typeDistribution[type] = Math.max(0, this.stats.typeDistribution[type] - 1);
    }
  }

  /**
   * Calculate processing priority
   */
  private calculatePriority(metadata: MediaMetadata): number {
    // Higher priority for smaller files and images
    let priority = 100;
    
    if (metadata.type === MediaType.IMAGE) priority += 50;
    if (metadata.size < 1024 * 1024) priority += 30; // < 1MB
    if (metadata.size > 10 * 1024 * 1024) priority -= 20; // > 10MB
    
    return priority;
  }

  /**
   * Generate unique media ID
   */
  private generateMediaId(): string {
    return `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}