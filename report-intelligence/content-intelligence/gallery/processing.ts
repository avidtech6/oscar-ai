/**
 * Gallery Media Processing
 * 
 * Media processing, optimization, and transformation
 */

import {
  MediaItem,
  MediaProcessingOptions,
  MediaProcessingResult,
  MediaUpload,
  MediaUploadResult,
} from './types';

export class MediaProcessor {
  /**
   * Process media file
   */
  async processMedia(
    file: File,
    options: MediaProcessingOptions
  ): Promise<MediaProcessingResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const processedItems: MediaItem[] = [];

    try {
      // Create base media item
      const baseItem = await this.createMediaItem(file);
      const originalItem: MediaItem = baseItem;

      // Apply processing based on options
      if (options.resize) {
        const resized = await this.resizeMedia(baseItem, options.resize);
        processedItems.push(resized);
      }

      if (options.compress) {
        const compressed = await this.compressMedia(baseItem, options.compress);
        processedItems.push(compressed);
      }

      if (options.watermark) {
        const watermarked = await this.applyWatermark(baseItem, options.watermark);
        processedItems.push(watermarked);
      }

      if (options.generateThumbnails) {
        const thumbnail = await this.generateThumbnail(baseItem);
        processedItems.push(thumbnail);
      }

      if (options.optimizeForWeb) {
        const optimized = await this.optimizeForWeb(baseItem);
        processedItems.push(optimized);
      }

      // If no specific processing was requested, just return the original
      if (processedItems.length === 0) {
        processedItems.push(originalItem);
      }

      const processingTime = Date.now() - startTime;

      return {
        original: originalItem,
        processed: processedItems,
        processingTime,
        success: true,
        errors,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      errors.push(error instanceof Error ? error.message : 'Unknown processing error');

      return {
        original: await this.createMediaItem(file),
        processed: [],
        processingTime,
        success: false,
        errors,
      };
    }
  }

  /**
   * Create media item from file
   */
  private async createMediaItem(file: File): Promise<MediaItem> {
    const id = this.generateId();
    const fileSize = file.size;
    const filename = file.name;
    const fileExtension = filename.split('.').pop()?.toLowerCase() || '';
    
    // Determine media type
    let type: MediaItem['type'] = 'document';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension)) {
      type = 'image';
    } else if (['mp4', 'mov', 'avi', 'webm'].includes(fileExtension)) {
      type = 'video';
    } else if (['mp3', 'wav', 'ogg'].includes(fileExtension)) {
      type = 'audio';
    }

    // Extract dimensions for images (would be async in real implementation)
    let dimensions;
    if (type === 'image') {
      dimensions = await this.extractImageDimensions(file);
    }

    return {
      id,
      type,
      url: URL.createObjectURL(file),
      filename,
      fileSize,
      dimensions,
      metadata: {
        title: filename.replace(/\.[^/.]+$/, ''), // Remove extension
        description: '',
        altText: '',
        tags: [],
        uploadedAt: new Date(),
        uploadedBy: 'system',
        source: 'upload',
        format: fileExtension,
      },
    };
  }

  /**
   * Resize media
   */
  private async resizeMedia(
    item: MediaItem,
    resizeOptions: NonNullable<MediaProcessingOptions['resize']>
  ): Promise<MediaItem> {
    // In a real implementation, this would use canvas or image processing library
    // For now, return a modified item with updated dimensions
    const newDimensions = resizeOptions.maintainAspectRatio
      ? this.calculateAspectRatioDimensions(item.dimensions, resizeOptions)
      : { width: resizeOptions.width || 800, height: resizeOptions.height || 600 };

    return {
      ...item,
      id: `${item.id}-resized`,
      dimensions: newDimensions,
      metadata: {
        ...item.metadata,
        title: `${item.metadata.title} (Resized)`,
        resolution: `${newDimensions.width}x${newDimensions.height}`,
      },
    };
  }

  /**
   * Compress media
   */
  private async compressMedia(
    item: MediaItem,
    compressOptions: NonNullable<MediaProcessingOptions['compress']>
  ): Promise<MediaItem> {
    // In a real implementation, this would compress the image
    // For now, return a modified item
    const estimatedSize = Math.floor(item.fileSize * (compressOptions.quality / 100));

    return {
      ...item,
      id: `${item.id}-compressed`,
      fileSize: estimatedSize,
      metadata: {
        ...item.metadata,
        title: `${item.metadata.title} (Compressed)`,
        format: compressOptions.format,
      },
    };
  }

  /**
   * Apply watermark
   */
  private async applyWatermark(
    item: MediaItem,
    watermarkOptions: MediaProcessingOptions['watermark']
  ): Promise<MediaItem> {
    // In a real implementation, this would apply watermark to image
    // For now, return a modified item
    return {
      ...item,
      id: `${item.id}-watermarked`,
      metadata: {
        ...item.metadata,
        title: `${item.metadata.title} (Watermarked)`,
        description: watermarkOptions?.text 
          ? `Watermarked with: ${watermarkOptions.text}` 
          : item.metadata.description,
      },
    };
  }

  /**
   * Generate thumbnail
   */
  private async generateThumbnail(item: MediaItem): Promise<MediaItem> {
    // Generate thumbnail dimensions (max 200x200)
    const maxSize = 200;
    let thumbnailDimensions = { width: maxSize, height: maxSize };

    if (item.dimensions) {
      const { width, height } = item.dimensions;
      const ratio = width / height;
      
      if (width > height) {
        thumbnailDimensions = {
          width: maxSize,
          height: Math.floor(maxSize / ratio),
        };
      } else {
        thumbnailDimensions = {
          width: Math.floor(maxSize * ratio),
          height: maxSize,
        };
      }
    }

    return {
      ...item,
      id: `${item.id}-thumbnail`,
      thumbnailUrl: item.url, // In real implementation, this would be a different URL
      dimensions: thumbnailDimensions,
      fileSize: Math.floor(item.fileSize * 0.1), // Estimate 10% of original size
      metadata: {
        ...item.metadata,
        title: `${item.metadata.title} (Thumbnail)`,
        description: 'Thumbnail version',
        resolution: `${thumbnailDimensions.width}x${thumbnailDimensions.height}`,
      },
    };
  }

  /**
   * Optimize for web
   */
  private async optimizeForWeb(item: MediaItem): Promise<MediaItem> {
    // Apply web optimizations
    const optimizedSize = Math.floor(item.fileSize * 0.7); // Estimate 30% reduction
    const webFormat = item.type === 'image' ? 'webp' : item.metadata.format;

    return {
      ...item,
      id: `${item.id}-web-optimized`,
      fileSize: optimizedSize,
      metadata: {
        ...item.metadata,
        title: `${item.metadata.title} (Web Optimized)`,
        format: webFormat,
        colorProfile: 'sRGB',
        resolution: 'web-optimized',
      },
    };
  }

  /**
   * Handle media upload
   */
  async handleUpload(upload: MediaUpload): Promise<MediaUploadResult> {
    const startTime = Date.now();
    
    try {
      // Validate file
      const validation = this.validateFile(upload.file);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Process media
      const processingOptions = upload.processingOptions || {
        optimizeForWeb: true,
        generateThumbnails: true,
        extractMetadata: true,
      };

      const processingResult = await this.processMedia(upload.file, processingOptions);
      
      // Use the first processed item (or original if no processing)
      const mediaItem = processingResult.processed.length > 0 
        ? processingResult.processed[0] 
        : processingResult.original;

      // Update metadata with upload information
      mediaItem.metadata = {
        ...mediaItem.metadata,
        title: upload.title || mediaItem.metadata.title,
        description: upload.description || mediaItem.metadata.description,
        altText: upload.altText || mediaItem.metadata.altText,
        tags: upload.tags || mediaItem.metadata.tags,
      };

      const uploadTime = Date.now() - startTime;

      return {
        mediaItem,
        processingResults: processingResult,
        uploadTime,
        success: true,
        message: 'Upload successful',
      };
    } catch (error) {
      const uploadTime = Date.now() - startTime;
      
      return {
        mediaItem: await this.createMediaItem(upload.file),
        uploadTime,
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Validate file
   */
  validateFile(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'pdf', 'docx'];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size exceeds limit (${maxSize / 1024 / 1024}MB)`);
    }

    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      errors.push(`File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Extract image dimensions
   */
  private async extractImageDimensions(file: File): Promise<{ width: number; height: number }> {
    // In a real implementation, this would load the image and get dimensions
    // For now, return default dimensions
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        resolve({ width: 800, height: 600 }); // Default fallback
      };
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Calculate aspect ratio dimensions
   */
  private calculateAspectRatioDimensions(
    originalDimensions: { width: number; height: number } | undefined,
    resizeOptions: { width?: number; height?: number }
  ): { width: number; height: number } {
    if (!originalDimensions) {
      return { width: resizeOptions.width || 800, height: resizeOptions.height || 600 };
    }

    const { width: originalWidth, height: originalHeight } = originalDimensions;
    const aspectRatio = originalWidth / originalHeight;

    let newWidth = resizeOptions.width;
    let newHeight = resizeOptions.height;

    if (newWidth && !newHeight) {
      newHeight = Math.floor(newWidth / aspectRatio);
    } else if (newHeight && !newWidth) {
      newWidth = Math.floor(newHeight * aspectRatio);
    } else if (newWidth && newHeight) {
      // Both specified, maintain aspect ratio by cropping if needed
      const targetRatio = newWidth / newHeight;
      if (Math.abs(aspectRatio - targetRatio) > 0.01) {
        // Ratios don't match, adjust one dimension
        if (aspectRatio > targetRatio) {
          newWidth = Math.floor(newHeight * aspectRatio);
        } else {
          newHeight = Math.floor(newWidth / aspectRatio);
        }
      }
    } else {
      // No dimensions specified, use original
      newWidth = originalWidth;
      newHeight = originalHeight;
    }

    return { width: newWidth || 800, height: newHeight || 600 };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}