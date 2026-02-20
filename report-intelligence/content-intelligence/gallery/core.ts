/**
 * Gallery Integration Core
 * 
 * Core gallery management and media handling
 */

import {
  MediaItem,
  Gallery,
  GallerySettings,
  GalleryIntegrationConfig,
  DEFAULT_GALLERY_INTEGRATION_CONFIG,
  MediaUpload,
  MediaUploadResult,
  MediaSearchQuery,
  MediaSearchResult,
} from './types';

export class GalleryManager {
  private galleries: Gallery[] = [];
  private mediaItems: MediaItem[] = [];
  private config: GalleryIntegrationConfig;

  constructor(config: Partial<GalleryIntegrationConfig> = {}) {
    this.config = { ...DEFAULT_GALLERY_INTEGRATION_CONFIG, ...config };
    this.loadSampleGalleries();
  }

  // ==================== GALLERY MANAGEMENT ====================

  /**
   * Load sample galleries for demonstration
   */
  private loadSampleGalleries(): void {
    // Sample project gallery
    this.createGallery({
      id: 'project-gallery',
      name: 'Project Gallery',
      description: 'Gallery for project images and documents',
      mediaItems: [],
      layout: 'grid',
      settings: this.config.defaultGallerySettings,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        itemCount: 0,
        totalSize: 0,
        visibility: 'public',
      },
    });

    // Sample report gallery
    this.createGallery({
      id: 'report-gallery',
      name: 'Report Gallery',
      description: 'Gallery for report images and visualizations',
      mediaItems: [],
      layout: 'masonry',
      settings: {
        ...this.config.defaultGallerySettings,
        columns: 4,
        showDescriptions: true,
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        itemCount: 0,
        totalSize: 0,
        visibility: 'shared',
      },
    });

    // Sample blog gallery
    this.createGallery({
      id: 'blog-gallery',
      name: 'Blog Gallery',
      description: 'Gallery for blog post images and media',
      mediaItems: [],
      layout: 'carousel',
      settings: {
        ...this.config.defaultGallerySettings,
        columns: 1,
        autoPlay: true,
        transitionSpeed: 1000,
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        itemCount: 0,
        totalSize: 0,
        visibility: 'public',
      },
    });
  }

  /**
   * Create a new gallery
   */
  createGallery(gallery: Omit<Gallery, 'metadata'> & { metadata?: Partial<Gallery['metadata']> }): Gallery {
    const fullGallery: Gallery = {
      ...gallery,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        itemCount: gallery.mediaItems.length,
        totalSize: gallery.mediaItems.reduce((sum, item) => sum + item.fileSize, 0),
        visibility: 'public',
        ...gallery.metadata,
      },
    };

    this.galleries.push(fullGallery);
    this.mediaItems.push(...fullGallery.mediaItems);
    
    return fullGallery;
  }

  /**
   * Get gallery by ID
   */
  getGallery(id: string): Gallery | undefined {
    return this.galleries.find(gallery => gallery.id === id);
  }

  /**
   * Get all galleries
   */
  getAllGalleries(): Gallery[] {
    return [...this.galleries];
  }

  /**
   * Update gallery
   */
  updateGallery(id: string, updates: Partial<Omit<Gallery, 'id' | 'metadata'>>): Gallery | undefined {
    const galleryIndex = this.galleries.findIndex(g => g.id === id);
    if (galleryIndex === -1) return undefined;

    const gallery = this.galleries[galleryIndex];
    const updatedGallery = {
      ...gallery,
      ...updates,
      metadata: {
        ...gallery.metadata,
        updatedAt: new Date(),
      },
    };

    this.galleries[galleryIndex] = updatedGallery;
    return updatedGallery;
  }

  /**
   * Delete gallery
   */
  deleteGallery(id: string): boolean {
    const galleryIndex = this.galleries.findIndex(g => g.id === id);
    if (galleryIndex === -1) return false;

    const gallery = this.galleries[galleryIndex];
    
    // Remove gallery media items from global list
    this.mediaItems = this.mediaItems.filter(item => 
      !gallery.mediaItems.some(galleryItem => galleryItem.id === item.id)
    );

    // Remove the gallery
    this.galleries.splice(galleryIndex, 1);
    return true;
  }

  // ==================== MEDIA MANAGEMENT ====================

  /**
   * Add media item to gallery
   */
  addMediaToGallery(galleryId: string, mediaItem: MediaItem): Gallery | undefined {
    const gallery = this.getGallery(galleryId);
    if (!gallery) return undefined;

    // Check if media item already exists
    const existingItemIndex = gallery.mediaItems.findIndex(item => item.id === mediaItem.id);
    if (existingItemIndex !== -1) {
      gallery.mediaItems[existingItemIndex] = mediaItem;
    } else {
      gallery.mediaItems.push(mediaItem);
    }

    // Update gallery metadata
    gallery.metadata.itemCount = gallery.mediaItems.length;
    gallery.metadata.totalSize = gallery.mediaItems.reduce((sum, item) => sum + item.fileSize, 0);
    gallery.metadata.updatedAt = new Date();

    // Add to global media items if not already there
    const globalItemIndex = this.mediaItems.findIndex(item => item.id === mediaItem.id);
    if (globalItemIndex === -1) {
      this.mediaItems.push(mediaItem);
    } else {
      this.mediaItems[globalItemIndex] = mediaItem;
    }

    return gallery;
  }

  /**
   * Remove media item from gallery
   */
  removeMediaFromGallery(galleryId: string, mediaItemId: string): Gallery | undefined {
    const gallery = this.getGallery(galleryId);
    if (!gallery) return undefined;

    const initialLength = gallery.mediaItems.length;
    gallery.mediaItems = gallery.mediaItems.filter(item => item.id !== mediaItemId);

    if (gallery.mediaItems.length < initialLength) {
      // Update gallery metadata
      gallery.metadata.itemCount = gallery.mediaItems.length;
      gallery.metadata.totalSize = gallery.mediaItems.reduce((sum, item) => sum + item.fileSize, 0);
      gallery.metadata.updatedAt = new Date();

      // Check if media item is used in other galleries
      const usedInOtherGalleries = this.galleries.some(g => 
        g.id !== galleryId && g.mediaItems.some(item => item.id === mediaItemId)
      );

      // Remove from global media items if not used elsewhere
      if (!usedInOtherGalleries) {
        this.mediaItems = this.mediaItems.filter(item => item.id !== mediaItemId);
      }

      return gallery;
    }

    return undefined;
  }

  /**
   * Get media item by ID
   */
  getMediaItem(id: string): MediaItem | undefined {
    return this.mediaItems.find(item => item.id === id);
  }

  /**
   * Get all media items
   */
  getAllMediaItems(): MediaItem[] {
    return [...this.mediaItems];
  }

  /**
   * Update media item
   */
  updateMediaItem(id: string, updates: Partial<Omit<MediaItem, 'id'>>): MediaItem | undefined {
    const itemIndex = this.mediaItems.findIndex(item => item.id === id);
    if (itemIndex === -1) return undefined;

    const item = this.mediaItems[itemIndex];
    const updatedItem = {
      ...item,
      ...updates,
      metadata: {
        ...item.metadata,
        ...updates.metadata,
      },
    };

    this.mediaItems[itemIndex] = updatedItem;

    // Update in all galleries
    for (const gallery of this.galleries) {
      const galleryItemIndex = gallery.mediaItems.findIndex(gItem => gItem.id === id);
      if (galleryItemIndex !== -1) {
        gallery.mediaItems[galleryItemIndex] = updatedItem;
        gallery.metadata.updatedAt = new Date();
      }
    }

    return updatedItem;
  }

  /**
   * Delete media item
   */
  deleteMediaItem(id: string): boolean {
    // Remove from all galleries
    for (const gallery of this.galleries) {
      gallery.mediaItems = gallery.mediaItems.filter(item => item.id !== id);
      if (gallery.mediaItems.length < gallery.metadata.itemCount) {
        gallery.metadata.itemCount = gallery.mediaItems.length;
        gallery.metadata.totalSize = gallery.mediaItems.reduce((sum, item) => sum + item.fileSize, 0);
        gallery.metadata.updatedAt = new Date();
      }
    }

    // Remove from global list
    const initialLength = this.mediaItems.length;
    this.mediaItems = this.mediaItems.filter(item => item.id !== id);
    return this.mediaItems.length < initialLength;
  }

  // ==================== MEDIA SEARCH ====================

  /**
   * Search media items
   */
  searchMedia(query: MediaSearchQuery): MediaSearchResult {
    let results = [...this.mediaItems];

    // Apply filters
    if (query.query) {
      const searchTerm = query.query.toLowerCase();
      results = results.filter(item => 
        item.filename.toLowerCase().includes(searchTerm) ||
        item.metadata.title?.toLowerCase().includes(searchTerm) ||
        item.metadata.description?.toLowerCase().includes(searchTerm) ||
        item.metadata.altText?.toLowerCase().includes(searchTerm) ||
        item.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    if (query.tags && query.tags.length > 0) {
      results = results.filter(item =>
        query.tags!.some(tag => item.metadata.tags.includes(tag))
      );
    }

    if (query.types && query.types.length > 0) {
      results = results.filter(item => query.types!.includes(item.type));
    }

    if (query.dateRange) {
      results = results.filter(item =>
        item.metadata.uploadedAt >= query.dateRange!.start &&
        item.metadata.uploadedAt <= query.dateRange!.end
      );
    }

    if (query.sizeRange) {
      results = results.filter(item =>
        item.fileSize >= query.sizeRange!.min &&
        item.fileSize <= query.sizeRange!.max
      );
    }

    if (query.galleryId) {
      const gallery = this.getGallery(query.galleryId);
      if (gallery) {
        const galleryItemIds = new Set(gallery.mediaItems.map(item => item.id));
        results = results.filter(item => galleryItemIds.has(item.id));
      }
    }

    // Apply sorting
    results.sort((a, b) => {
      let comparison = 0;
      
      switch (query.sortBy) {
        case 'date':
          comparison = a.metadata.uploadedAt.getTime() - b.metadata.uploadedAt.getTime();
          break;
        case 'name':
          comparison = a.filename.localeCompare(b.filename);
          break;
        case 'size':
          comparison = a.fileSize - b.fileSize;
          break;
        case 'relevance':
          // For relevance, we could implement scoring
          // For now, use date as fallback
          comparison = a.metadata.uploadedAt.getTime() - b.metadata.uploadedAt.getTime();
          break;
      }

      return query.sortOrder === 'asc' ? comparison : -comparison;
    });

    // Apply pagination
    const total = results.length;
    const start = query.offset || 0;
    const end = start + (query.limit || total);
    const paginatedResults = results.slice(start, end);

    return {
      items: paginatedResults,
      total,
      query,
      searchTime: 0, // Would be calculated in real implementation
    };
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
    const mediaByType: Record<string, number> = {};
    const galleriesByVisibility: Record<string, number> = {};

    for (const item of this.mediaItems) {
      mediaByType[item.type] = (mediaByType[item.type] || 0) + 1;
    }

    for (const gallery of this.galleries) {
      galleriesByVisibility[gallery.metadata.visibility] = 
        (galleriesByVisibility[gallery.metadata.visibility] || 0) + 1;
    }

    return {
      totalGalleries: this.galleries.length,
      totalMediaItems: this.mediaItems.length,
      totalStorageSize: this.mediaItems.reduce((sum, item) => sum + item.fileSize, 0),
      mediaByType,
      galleriesByVisibility,
    };
  }

  // ==================== CONFIGURATION ====================

  /**
   * Get configuration
   */
  getConfig(): GalleryIntegrationConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<GalleryIntegrationConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Validate gallery
   */
  validateGallery(gallery: Gallery): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!gallery.id || gallery.id.trim().length === 0) {
      errors.push('Gallery ID is required');
    }

    if (!gallery.name || gallery.name.trim().length === 0) {
      errors.push('Gallery name is required');
    }

    if (!['grid', 'masonry', 'carousel', 'slideshow'].includes(gallery.layout)) {
      errors.push('Invalid layout type');
    }

    if (gallery.settings.columns < 1 || gallery.settings.columns > 12) {
      errors.push('Columns must be between 1 and 12');
    }

    if (gallery.settings.spacing < 0 || gallery.settings.spacing > 100) {
      errors.push('Spacing must be between 0 and 100');
    }

    if (gallery.settings.transitionSpeed < 0 || gallery.settings.transitionSpeed > 5000) {
      errors.push('Transition speed must be between 0 and 5000ms');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}