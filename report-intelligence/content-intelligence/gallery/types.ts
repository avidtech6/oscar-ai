/**
 * Gallery Integration Types
 * 
 * Type definitions for image gallery and media management
 */

// ==================== MEDIA TYPES ====================

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'document' | 'audio';
  url: string;
  thumbnailUrl?: string;
  filename: string;
  fileSize: number;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // For video/audio
  metadata: {
    title?: string;
    description?: string;
    altText?: string;
    tags: string[];
    uploadedAt: Date;
    uploadedBy?: string;
    source?: string;
    format: string;
    colorProfile?: string;
    resolution?: string;
  };
}

export interface Gallery {
  id: string;
  name: string;
  description?: string;
  mediaItems: MediaItem[];
  layout: 'grid' | 'masonry' | 'carousel' | 'slideshow';
  settings: GallerySettings;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    itemCount: number;
    totalSize: number;
    visibility: 'public' | 'private' | 'shared';
  };
}

export interface GallerySettings {
  columns: number;
  spacing: number;
  showTitles: boolean;
  showDescriptions: boolean;
  showMetadata: boolean;
  enableLightbox: boolean;
  enableDownload: boolean;
  enableSharing: boolean;
  autoPlay: boolean;
  loop: boolean;
  transitionSpeed: number;
  maxItems: number;
  sortBy: 'date' | 'name' | 'size' | 'type' | 'custom';
  sortOrder: 'asc' | 'desc';
  filterByType?: ('image' | 'video' | 'document' | 'audio')[];
  filterByTag?: string[];
}

// ==================== MEDIA PROCESSING ====================

export interface MediaProcessingOptions {
  resize?: {
    width?: number;
    height?: number;
    maintainAspectRatio: boolean;
  };
  compress?: {
    quality: number;
    format: 'jpeg' | 'png' | 'webp';
  };
  watermark?: {
    text?: string;
    imageUrl?: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity: number;
  };
  optimizeForWeb: boolean;
  generateThumbnails: boolean;
  extractMetadata: boolean;
}

export interface MediaProcessingResult {
  original: MediaItem;
  processed: MediaItem[];
  processingTime: number;
  success: boolean;
  errors: string[];
}

// ==================== GALLERY INTEGRATION ====================

export interface GalleryIntegrationConfig {
  storageProvider: 'local' | 'cloudinary' | 's3' | 'supabase';
  maxFileSize: number;
  allowedFormats: string[];
  autoProcess: boolean;
  generateThumbnails: boolean;
  optimizeImages: boolean;
  watermarkEnabled: boolean;
  watermarkText?: string;
  defaultGallerySettings: GallerySettings;
}

export const DEFAULT_GALLERY_INTEGRATION_CONFIG: GalleryIntegrationConfig = {
  storageProvider: 'local',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'pdf', 'docx'],
  autoProcess: true,
  generateThumbnails: true,
  optimizeImages: true,
  watermarkEnabled: false,
  defaultGallerySettings: {
    columns: 3,
    spacing: 10,
    showTitles: true,
    showDescriptions: false,
    showMetadata: false,
    enableLightbox: true,
    enableDownload: true,
    enableSharing: false,
    autoPlay: false,
    loop: true,
    transitionSpeed: 500,
    maxItems: 50,
    sortBy: 'date',
    sortOrder: 'desc',
  },
};

// ==================== MEDIA UPLOAD ====================

export interface MediaUpload {
  file: File;
  galleryId?: string;
  tags?: string[];
  title?: string;
  description?: string;
  altText?: string;
  processingOptions?: MediaProcessingOptions;
}

export interface MediaUploadResult {
  mediaItem: MediaItem;
  gallery?: Gallery;
  processingResults?: MediaProcessingResult;
  uploadTime: number;
  success: boolean;
  message?: string;
}

// ==================== GALLERY RENDERING ====================

export interface GalleryRenderOptions {
  containerId: string;
  layout: 'grid' | 'masonry' | 'carousel' | 'slideshow';
  responsive: boolean;
  lazyLoad: boolean;
  preload: number;
  showControls: boolean;
  showPagination: boolean;
  showThumbnails: boolean;
  theme: 'light' | 'dark' | 'custom';
  customStyles?: Record<string, string>;
}

export interface GalleryRenderResult {
  html: string;
  css: string;
  javascript: string;
  mediaItems: MediaItem[];
  renderTime: number;
}

// ==================== MEDIA SEARCH ====================

export interface MediaSearchQuery {
  query?: string;
  tags?: string[];
  types?: ('image' | 'video' | 'document' | 'audio')[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sizeRange?: {
    min: number;
    max: number;
  };
  galleryId?: string;
  sortBy: 'relevance' | 'date' | 'name' | 'size';
  sortOrder: 'asc' | 'desc';
  limit: number;
  offset: number;
}

export interface MediaSearchResult {
  items: MediaItem[];
  total: number;
  query: MediaSearchQuery;
  searchTime: number;
}

// ==================== EXPORTS ====================

export type {
  // Re-export from parent types if needed
};