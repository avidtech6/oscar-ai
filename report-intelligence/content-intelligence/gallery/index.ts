/**
 * Gallery Integration - Main Export
 * 
 * Modular implementation of image gallery and media management
 */

// Export all types
export * from './types';

// Export core classes
export { GalleryManager } from './core';
export { MediaProcessor } from './processing';
export { GalleryRenderer } from './rendering';

// Export default config
export { DEFAULT_GALLERY_INTEGRATION_CONFIG } from './types';

/**
 * Main GalleryIntegration class that combines all modules
 * This is the primary interface for external usage
 */
export class GalleryIntegration {
  private manager: import('./core').GalleryManager;
  private processor: import('./processing').MediaProcessor;
  private renderer: import('./rendering').GalleryRenderer;

  constructor(config?: import('./types').GalleryIntegrationConfig) {
    this.manager = new (require('./core').GalleryManager)(config);
    this.processor = new (require('./processing').MediaProcessor)();
    this.renderer = new (require('./rendering').GalleryRenderer)();
  }

  // ==================== GALLERY MANAGEMENT ====================

  /**
   * Create a new gallery
   */
  createGallery(gallery: Omit<import('./types').Gallery, 'metadata'> & { metadata?: Partial<import('./types').Gallery['metadata']> }): import('./types').Gallery {
    return this.manager.createGallery(gallery);
  }

  /**
   * Get gallery by ID
   */
  getGallery(id: string): import('./types').Gallery | undefined {
    return this.manager.getGallery(id);
  }

  /**
   * Get all galleries
   */
  getAllGalleries(): import('./types').Gallery[] {
    return this.manager.getAllGalleries();
  }

  /**
   * Update gallery
   */
  updateGallery(id: string, updates: Partial<Omit<import('./types').Gallery, 'id' | 'metadata'>>): import('./types').Gallery | undefined {
    return this.manager.updateGallery(id, updates);
  }

  /**
   * Delete gallery
   */
  deleteGallery(id: string): boolean {
    return this.manager.deleteGallery(id);
  }

  // ==================== MEDIA MANAGEMENT ====================

  /**
   * Add media item to gallery
   */
  addMediaToGallery(galleryId: string, mediaItem: import('./types').MediaItem): import('./types').Gallery | undefined {
    return this.manager.addMediaToGallery(galleryId, mediaItem);
  }

  /**
   * Remove media item from gallery
   */
  removeMediaFromGallery(galleryId: string, mediaItemId: string): import('./types').Gallery | undefined {
    return this.manager.removeMediaFromGallery(galleryId, mediaItemId);
  }

  /**
   * Get media item by ID
   */
  getMediaItem(id: string): import('./types').MediaItem | undefined {
    return this.manager.getMediaItem(id);
  }

  /**
   * Get all media items
   */
  getAllMediaItems(): import('./types').MediaItem[] {
    return this.manager.getAllMediaItems();
  }

  /**
   * Update media item
   */
  updateMediaItem(id: string, updates: Partial<Omit<import('./types').MediaItem, 'id'>>): import('./types').MediaItem | undefined {
    return this.manager.updateMediaItem(id, updates);
  }

  /**
   * Delete media item
   */
  deleteMediaItem(id: string): boolean {
    return this.manager.deleteMediaItem(id);
  }

  // ==================== MEDIA PROCESSING ====================

  /**
   * Process media file
   */
  async processMedia(
    file: File,
    options: import('./types').MediaProcessingOptions
  ): Promise<import('./types').MediaProcessingResult> {
    return this.processor.processMedia(file, options);
  }

  /**
   * Handle media upload
   */
  async handleUpload(upload: import('./types').MediaUpload): Promise<import('./types').MediaUploadResult> {
    return this.processor.handleUpload(upload);
  }

  /**
   * Validate file
   */
  validateFile(file: File): { isValid: boolean; errors: string[] } {
    return this.processor.validateFile(file);
  }

  // ==================== GALLERY RENDERING ====================

  /**
   * Render gallery to HTML
   */
  renderGallery(gallery: import('./types').Gallery, options: import('./types').GalleryRenderOptions): import('./types').GalleryRenderResult {
    return this.renderer.renderGallery(gallery, options);
  }

  // ==================== MEDIA SEARCH ====================

  /**
   * Search media items
   */
  searchMedia(query: import('./types').MediaSearchQuery): import('./types').MediaSearchResult {
    return this.manager.searchMedia(query);
  }

  // ==================== STATISTICS ====================

  /**
   * Get gallery statistics
   */
  getStatistics(): {
    totalGalleries: number;
    totalMediaItems: number;
    totalStorageSize: number;
    mediaByType: Record<string, number>;
    galleriesByVisibility: Record<string, number>;
  } {
    return this.manager.getStatistics();
  }

  // ==================== CONFIGURATION ====================

  /**
   * Get configuration
   */
  getConfig(): import('./types').GalleryIntegrationConfig {
    return this.manager.getConfig();
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<import('./types').GalleryIntegrationConfig>): void {
    this.manager.updateConfig(updates);
  }

  /**
   * Validate gallery
   */
  validateGallery(gallery: import('./types').Gallery): { isValid: boolean; errors: string[] } {
    return this.manager.validateGallery(gallery);
  }
}

// Default export for convenience
export default GalleryIntegration;