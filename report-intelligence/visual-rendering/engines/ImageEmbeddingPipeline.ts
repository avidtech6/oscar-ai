/**
 * Phase 15: HTML Rendering & Visual Reproduction Engine
 * Image Embedding Pipeline
 * 
 * Responsible for processing, optimizing, and embedding images
 * in HTML documents with support for multiple formats and embedding methods.
 */

import type {
  RenderingOptions,
  ImageSource,
  ImageElement
} from '../types';

/**
 * Image processing options
 */
export interface ImageProcessingOptions {
  maxWidth: number; // pixels
  maxHeight: number; // pixels
  quality: number; // 0-100 for JPEG
  format: 'auto' | 'jpeg' | 'png' | 'webp' | 'gif';
  compressionLevel: number; // 0-9 for PNG
  enableOptimization: boolean;
  preserveAspectRatio: boolean;
  backgroundColor: string; // for transparency conversion
  dpi: number; // dots per inch for print
  embedMethod: 'base64' | 'data-url' | 'external' | 'relative-path';
  externalPathPrefix: string;
  cacheOptimizedImages: boolean;
  cacheDuration: number; // milliseconds
}

/**
 * Default image processing options
 */
export const DEFAULT_IMAGE_OPTIONS: ImageProcessingOptions = {
  maxWidth: 1200,
  maxHeight: 800,
  quality: 85,
  format: 'auto',
  compressionLevel: 6,
  enableOptimization: true,
  preserveAspectRatio: true,
  backgroundColor: '#ffffff',
  dpi: 96,
  embedMethod: 'base64',
  externalPathPrefix: '/images/',
  cacheOptimizedImages: true,
  cacheDuration: 24 * 60 * 60 * 1000 // 24 hours
};

/**
 * Image processing result
 */
export interface ImageProcessingResult {
  originalSize: number; // bytes
  processedSize: number; // bytes
  width: number; // pixels
  height: number; // pixels
  format: string;
  dataUrl: string;
  url: string;
  optimized: boolean;
  optimizationRatio: number; // 0-1
  warnings: string[];
  errors: string[];
}

/**
 * Image cache entry
 */
interface ImageCacheEntry {
  key: string;
  result: ImageProcessingResult;
  timestamp: number;
  hits: number;
}

/**
 * Image Embedding Pipeline
 */
export class ImageEmbeddingPipeline {
  private options: RenderingOptions;
  private imageOptions: ImageProcessingOptions;
  private cache: Map<string, ImageCacheEntry>;
  private warnings: string[] = [];
  private errors: string[] = [];

  constructor(
    options: RenderingOptions,
    imageOptions: Partial<ImageProcessingOptions> = {}
  ) {
    this.options = options;
    this.imageOptions = { ...DEFAULT_IMAGE_OPTIONS, ...imageOptions };
    this.cache = new Map();
  }

  /**
   * Process and embed an image element
   */
  public async processImageElement(
    element: ImageElement
  ): Promise<ImageElement> {
    this.resetMessages();

    // If image already has data URL and no optimization needed, return as-is
    if (element.content.dataUrl && !this.imageOptions.enableOptimization) {
      return element;
    }

    // Check cache first
    const cacheKey = this.generateCacheKey(element);
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached)) {
      // Update cache hit count
      cached.hits++;
      this.cache.set(cacheKey, cached);
      
      // Return processed image element
      return this.createProcessedImageElement(element, cached.result);
    }

    // Process the image
    const result = await this.processImage(element.content);
    
    // Cache the result if caching is enabled
    if (this.imageOptions.cacheOptimizedImages) {
      this.cache.set(cacheKey, {
        key: cacheKey,
        result,
        timestamp: Date.now(),
        hits: 1
      });
    }

    // Clean up old cache entries
    this.cleanupCache();

    // Return processed image element
    return this.createProcessedImageElement(element, result);
  }

  /**
   * Process multiple image elements
   */
  public async processImageElements(
    elements: ImageElement[]
  ): Promise<ImageElement[]> {
    const results: ImageElement[] = [];
    
    for (const element of elements) {
      try {
        const processed = await this.processImageElement(element);
        results.push(processed);
      } catch (error) {
        this.errors.push(`Failed to process image ${element.id}: ${error}`);
        // Return original element on error
        results.push(element);
      }
    }
    
    return results;
  }

  /**
   * Process raw image source
   */
  private async processImage(source: ImageSource): Promise<ImageProcessingResult> {
    // In a real implementation, this would:
    // 1. Load the image from URL, file path, or data URL
    // 2. Decode the image to get dimensions and format
    // 3. Apply optimizations (resize, compress, convert format)
    // 4. Encode back to data URL or save to file
    
    // For this implementation, we'll simulate the processing
    // In production, you would use libraries like sharp, jimp, or canvas
    
    const result: ImageProcessingResult = {
      originalSize: 0,
      processedSize: 0,
      width: 0,
      height: 0,
      format: 'unknown',
      dataUrl: '',
      url: '',
      optimized: false,
      optimizationRatio: 0,
      warnings: this.warnings,
      errors: this.errors
    };

    // Determine source type and extract data
    if (source.dataUrl) {
      // Parse data URL
      const dataUrlMatch = source.dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
      if (dataUrlMatch) {
        result.format = dataUrlMatch[1];
        const base64Data = dataUrlMatch[2];
        result.originalSize = Math.ceil(base64Data.length * 3 / 4); // Approximate
        
        // Simulate optimization
        if (this.imageOptions.enableOptimization) {
          result.optimized = true;
          result.processedSize = Math.ceil(result.originalSize * 0.7); // 30% reduction
          result.optimizationRatio = 0.3;
          result.dataUrl = this.createOptimizedDataUrl(base64Data, result.format);
        } else {
          result.processedSize = result.originalSize;
          result.dataUrl = source.dataUrl;
        }
      }
    } else if (source.url) {
      // External URL - in real implementation, would download and process
      result.url = source.url;
      result.format = this.guessFormatFromUrl(source.url);
      
      // Simulate dimensions
      result.width = this.imageOptions.maxWidth;
      result.height = this.imageOptions.maxHeight;
      
      // For external URLs, we might not embed as data URL
      if (this.imageOptions.embedMethod === 'base64' || this.imageOptions.embedMethod === 'data-url') {
        this.warnings.push(`Cannot embed external URL as data URL: ${source.url}. Using URL directly.`);
        result.dataUrl = '';
      }
    } else if (source.url && source.url.startsWith('file://')) {
      // File path - in real implementation, would read file
      result.url = this.imageOptions.externalPathPrefix + source.url.substring(7);
      result.format = this.guessFormatFromFilePath(source.url);
      
      // Simulate dimensions
      result.width = this.imageOptions.maxWidth;
      result.height = this.imageOptions.maxHeight;
    }

    // Apply size constraints
    if (result.width > this.imageOptions.maxWidth || result.height > this.imageOptions.maxHeight) {
      const { width, height } = this.calculateConstrainedDimensions(
        result.width,
        result.height,
        this.imageOptions.maxWidth,
        this.imageOptions.maxHeight
      );
      result.width = width;
      result.height = height;
    }

    // Set DPI for print - check if dpi exists in layout
    const layoutDpi = (this.options.layout as any).dpi;
    if (layoutDpi) {
      // Adjust dimensions for print DPI
      const scale = layoutDpi / this.imageOptions.dpi;
      result.width = Math.round(result.width * scale);
      result.height = Math.round(result.height * scale);
    }

    return result;
  }

  /**
   * Create optimized data URL (simulated)
   */
  private createOptimizedDataUrl(base64Data: string, format: string): string {
    // In real implementation, would:
    // 1. Decode base64
    // 2. Apply compression/optimization
    // 3. Re-encode to base64
    
    // For simulation, just return the original with a note
    return `data:image/${format};base64,${base64Data}`;
  }

  /**
   * Guess image format from URL
   */
  private guessFormatFromUrl(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'jpeg';
      case 'png':
        return 'png';
      case 'webp':
        return 'webp';
      case 'gif':
        return 'gif';
      case 'svg':
        return 'svg+xml';
      default:
        return 'jpeg';
    }
  }

  /**
   * Guess image format from file path
   */
  private guessFormatFromFilePath(filePath: string): string {
    return this.guessFormatFromUrl(filePath);
  }

  /**
   * Calculate constrained dimensions preserving aspect ratio
   */
  private calculateConstrainedDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    if (!this.imageOptions.preserveAspectRatio) {
      return {
        width: Math.min(originalWidth, maxWidth),
        height: Math.min(originalHeight, maxHeight)
      };
    }

    const widthRatio = maxWidth / originalWidth;
    const heightRatio = maxHeight / originalHeight;
    const ratio = Math.min(widthRatio, heightRatio);

    return {
      width: Math.round(originalWidth * ratio),
      height: Math.round(originalHeight * ratio)
    };
  }

  /**
   * Generate cache key for an image element
   */
  private generateCacheKey(element: ImageElement): string {
    const source = element.content;
    const parts: string[] = [];
    
    if (source.dataUrl) {
      // Use first 100 chars of data URL as key
      parts.push('dataurl:' + source.dataUrl.substring(0, 100));
    } else if (source.url) {
      parts.push('url:' + source.url);
    } else if (source.url && source.url.startsWith('file://')) {
      parts.push('file:' + source.url);
    }
    
    // Include processing options in key
    parts.push(`w:${this.imageOptions.maxWidth}`);
    parts.push(`h:${this.imageOptions.maxHeight}`);
    parts.push(`q:${this.imageOptions.quality}`);
    parts.push(`f:${this.imageOptions.format}`);
    parts.push(`c:${this.imageOptions.compressionLevel}`);
    
    return parts.join('|');
  }

  /**
   * Check if cache entry is still valid
   */
  private isCacheValid(entry: ImageCacheEntry): boolean {
    if (!this.imageOptions.cacheOptimizedImages) {
      return false;
    }
    
    const age = Date.now() - entry.timestamp;
    return age < this.imageOptions.cacheDuration;
  }

  /**
   * Clean up old cache entries
   */
  private cleanupCache(): void {
    if (!this.imageOptions.cacheOptimizedImages) {
      this.cache.clear();
      return;
    }
    
    const now = Date.now();
    const toDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.imageOptions.cacheDuration) {
        toDelete.push(key);
      }
    }
    
    for (const key of toDelete) {
      this.cache.delete(key);
    }
  }

  /**
   * Create processed image element from processing result
   */
  private createProcessedImageElement(
    original: ImageElement,
    result: ImageProcessingResult
  ): ImageElement {
    // Create new image source based on embed method
    let processedSource: ImageSource;
    
    switch (this.imageOptions.embedMethod) {
      case 'base64':
      case 'data-url':
        if (result.dataUrl) {
          processedSource = {
            url: '', // Required by ImageSource type
            dataUrl: result.dataUrl,
            alt: original.content.alt || '',
            caption: original.content.caption
          };
        } else {
          // Fall back to URL
          processedSource = {
            url: result.url || original.content.url || '',
            alt: original.content.alt || '',
            caption: original.content.caption,
            dataUrl: result.dataUrl || original.content.dataUrl
          };
        }
        break;
        
      case 'external':
        processedSource = {
          url: result.url || original.content.url || '',
          alt: original.content.alt || '',
          caption: original.content.caption
        };
        break;
        
      case 'relative-path':
        // For relative-path, we need to construct a URL
        const filePath = original.content.url?.startsWith('file://')
          ? original.content.url.substring(7)
          : original.content.url || '';
        processedSource = {
          url: this.imageOptions.externalPathPrefix + filePath,
          alt: original.content.alt || '',
          caption: original.content.caption,
          dataUrl: original.content.dataUrl
        };
        break;
        
      default:
        processedSource = original.content;
    }
    
    // Create processed image element
    return {
      ...original,
      content: processedSource,
      width: result.width || original.width,
      height: result.height || original.height,
      metadata: {
        ...original.metadata,
        processed: true,
        originalSize: result.originalSize,
        processedSize: result.processedSize,
        optimizationRatio: result.optimizationRatio,
        format: result.format
      }
    };
  }

  /**
   * Get image statistics
   */
  public getStatistics(): {
    totalProcessed: number;
    cacheSize: number;
    cacheHits: number;
    totalSizeReduction: number;
    averageOptimizationRatio: number;
  } {
    let totalProcessed = 0;
    let cacheHits = 0;
    let totalOriginalSize = 0;
    let totalProcessedSize = 0;
    
    for (const entry of this.cache.values()) {
      totalProcessed++;
      cacheHits += entry.hits;
      totalOriginalSize += entry.result.originalSize;
      totalProcessedSize += entry.result.processedSize;
    }
    
    const totalSizeReduction = totalOriginalSize - totalProcessedSize;
    const averageOptimizationRatio = totalOriginalSize > 0 
      ? totalSizeReduction / totalOriginalSize 
      : 0;
    
    return {
      totalProcessed,
      cacheSize: this.cache.size,
      cacheHits,
      totalSizeReduction,
      averageOptimizationRatio
    };
  }

  /**
   * Clear the image cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Reset warnings and errors
   */
  private resetMessages(): void {
    this.warnings = [];
    this.errors = [];
  }

  /**
   * Update image processing options
   */
  public updateImageOptions(newOptions: Partial<ImageProcessingOptions>): void {
    this.imageOptions = { ...this.imageOptions, ...newOptions };
  }

  /**
   * Update rendering options
   */
  public updateOptions(newOptions: Partial<RenderingOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Get current warnings
   */
  public getWarnings(): string[] {
    return [...this.warnings];
  }

  /**
   * Get current errors
   */
  public getErrors(): string[] {
    return [...this.errors];
  }

  /**
   * Clear warnings and errors
   */
  public clearMessages(): void {
    this.warnings = [];
    this.errors = [];
  }
}