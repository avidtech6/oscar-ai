/**
 * Media Intelligence Layer - PHASE 22
 * Type definitions for the Media Intelligence System
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
 * Media processing priority
 */
export enum MediaProcessingPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  URGENT = 4
}

/**
 * Media processing job
 */
export interface MediaProcessingJob {
  id: string;
  metadata: MediaMetadata;
  options: MediaProcessingOptions;
  priority: MediaProcessingPriority;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  status: MediaStatus;
  progress: number;
  error?: string;
}

/**
 * Media storage configuration
 */
export interface MediaStorageConfig {
  provider: 'local' | 's3' | 'azure' | 'google';
  bucket?: string;
  region?: string;
  endpoint?: string;
  accessKey?: string;
  secretKey?: string;
  baseUrl?: string;
  maxFileSize: number;
  allowedTypes: MediaType[];
  retentionPolicy: {
    default: number; // days
    archive: number; // days
    delete: number; // days
  };
}

/**
 * Media thumbnail configuration
 */
export interface MediaThumbnailConfig {
  enabled: boolean;
  sizes: Array<{
    name: string;
    width: number;
    height: number;
    quality: number;
    format: string;
  }>;
  generateFor: MediaType[];
}

/**
 * Media optimization options
 */
export interface MediaOptimizationOptions {
  images?: {
    formats: string[];
    quality: number;
    maxWidth?: number;
    maxHeight?: number;
  };
  videos?: {
    formats: string[];
    quality: string;
    maxWidth?: number;
    maxHeight?: number;
  };
  audio?: {
    formats: string[];
    quality: string;
    bitrate?: number;
  };
}

/**
 * Media validation result
 */
export interface MediaValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * Media event types
 */
export enum MediaEventType {
  UPLOADED = 'uploaded',
  PROCESSING_STARTED = 'processing_started',
  PROCESSING_COMPLETED = 'processing_completed',
  PROCESSING_FAILED = 'processing_failed',
  THUMBNAIL_GENERATED = 'thumbnail_generated',
  DELETED = 'deleted',
  ACCESS_CHANGED = 'access_changed'
}

/**
 * Media event
 */
export interface MediaEvent {
  type: MediaEventType;
  timestamp: Date;
  mediaId: string;
  userId?: string;
  data: Record<string, any>;
}

/**
 * Media event listener
 */
export type MediaEventListener = (event: MediaEvent) => void;

/**
 * Media manager configuration
 */
export interface MediaManagerConfig {
  storage: MediaStorageConfig;
  thumbnails: MediaThumbnailConfig;
  optimization: MediaOptimizationOptions;
  maxConcurrentProcessing: number;
  processingTimeout: number;
  enableCaching: boolean;
  cacheTTL: number;
  enableValidation: boolean;
  listeners?: MediaEventListener[];
}

/**
 * Media batch operation result
 */
export interface MediaBatchResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
  results: Array<{
    id: string;
    success: boolean;
    result?: any;
    error?: string;
  }>;
}

/**
 * Media import options
 */
export interface MediaImportOptions {
  folder: string;
  recursive: boolean;
  tags?: string[];
  accessLevel: 'public' | 'private' | 'restricted';
  skipExisting: boolean;
  generateThumbnails: boolean;
  validateFiles: boolean;
}