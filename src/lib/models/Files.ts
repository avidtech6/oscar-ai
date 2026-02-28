/**
 * Module 8: Files Data Models
 * 
 * This module handles file management with card identity system, gallery views,
 * context pills, and interactive media. Files is the system's universal content
 * explorer with context-aware, metadata-rich, AI-integrated knowledge layer.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// 8.1 Core File Types & Categories
// ============================================================================

/**
 * File Type - The type of file
 */
export type FileType = 'image' | 'audio' | 'video' | 'pdf' | 'markdown' | 'text' | 'scan' | 'gps-media' | 'workspace-attachment' | 'document' | 'archive' | 'spreadsheet' | 'presentation' | 'code';

/**
 * File Category - Category for organizing files
 */
export type FileCategory = 'personal' | 'work' | 'project' | 'reference' | 'archive' | 'shared' | 'temporary';

/**
 * File Status - Status of a file
 */
export type FileStatus = 'active' | 'archived' | 'deleted' | 'hidden';

// ============================================================================
// 8.2 File Metadata & Core File Interface
// ============================================================================

/**
 * File Metadata - Core metadata for files
 */
export interface FileMetadata {
  id: string;
  fileId: string;
  
  // Basic Information
  fileName: string;
  fileExtension: string;
  mimeType: string;
  fileSize: number; // in bytes
  
  // Creation & Modification
  createdDate: Date;
  modifiedDate: Date;
  accessedDate: Date;
  
  // Technical Details
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // in seconds for audio/video
  pageCount?: number; // for PDFs/documents
  resolution?: {
    horizontal: number;
    vertical: number;
  };
  
  // Content Analysis
  hasTextContent: boolean;
  textContent?: string;
  hasEmbeddedMedia: boolean;
  embeddedMediaIds: string[];
  
  // Security
  isEncrypted: boolean;
  encryptionAlgorithm?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * File - Core file interface
 */
export interface File {
  id: string;
  userId: string;
  
  // Core Identity
  name: string;
  type: FileType;
  category: FileCategory;
  status: FileStatus;
  
  // Storage
  storagePath: string;
  storageProvider: 'local' | 'cloud' | 'external';
  storageUrl?: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  
  // Content
  description?: string;
  tags: string[];
  keywords: string[];
  
  // Location
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
    placeName?: string;
  };
  
  // Card Identity
  cardImageIds: string[];
  photostripLayoutId?: string;
  cardIdentityConfigurationId?: string;
  
  // Cross-domain links
  linkedWorkspaceItemIds: string[];
  linkedMapPinIds: string[];
  linkedMapShapeIds: string[];
  linkedContactIds: string[];
  linkedCompanyIds: string[];
  linkedFileIds: string[]; // related files
  
  // Usage Statistics
  viewCount: number;
  lastViewed: Date;
  downloadCount: number;
  lastDownloaded?: Date;
  shareCount: number;
  lastShared?: Date;
  
  // Permissions
  isPublic: boolean;
  sharedWith: string[]; // user IDs
  permissionLevel: 'view' | 'comment' | 'edit' | 'manage';
  
  // Versioning
  version: number;
  versionHistory: FileVersion[];
  isLatestVersion: boolean;
  
  // System Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy?: string;
}

// ============================================================================
// 8.3 Card Identity System (Shared with Workspace)
// ============================================================================

/**
 * File Card Image - Image for file card front/back
 */
export interface FileCardImage {
  id: string;
  fileId: string;
  
  // Image Details
  url: string;
  thumbnailUrl?: string;
  altText?: string;
  caption?: string;
  
  // Display Configuration
  fitMode: 'fill' | 'contain' | 'cover' | 'fit-width' | 'fit-height' | 'smart-crop' | 'center' | 'tile';
  showOnFront: boolean;
  showOnBack: boolean;
  
  // Ordering
  order: number;
  
  // Source
  sourceType: 'file' | 'preview' | 'thumbnail' | 'custom';
  sourceFileId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * File Photostrip Layout - Layout configuration for multiple images
 */
export interface FilePhotostripLayout {
  id: string;
  fileId: string;
  
  // Layout Type
  layoutType: 'single' | 'strip' | 'grid-2x2' | 'collage' | 'carousel' | 'mixed';
  
  // Configuration
  columns: number;
  rows: number;
  gap: number; // in pixels
  aspectRatio?: string; // e.g., "16:9"
  
  // Behaviour
  autoAdvance: boolean;
  advanceInterval?: number; // in milliseconds
  showControls: boolean;
  loop: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * File Card Identity Configuration - How the file card appears
 */
export interface FileCardIdentityConfiguration {
  id: string;
  fileId: string;
  
  // Card Appearance
  cornerRadius: number; // in pixels
  cardHeight: 'compact' | 'normal' | 'expanded';
  density: 'compact' | 'normal' | 'comfortable';
  
  // Image Configuration
  photostripLayoutId?: string;
  defaultFitMode: 'fill' | 'contain' | 'cover' | 'fit-width' | 'fit-height' | 'smart-crop' | 'center' | 'tile';
  
  // Metadata Display
  showNameOnFront: boolean;
  showTypeOnFront: boolean;
  showSizeOnFront: boolean;
  showDateOnFront: boolean;
  showTagsOnFront: boolean;
  
  // Field Ordering
  frontFieldOrder: string[]; // e.g., ['name', 'type', 'size', 'date', 'tags']
  
  // Template
  cardFrontTemplate?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 8.4 File Versioning
// ============================================================================

/**
 * File Version - Version history of a file
 */
export interface FileVersion {
  version: number;
  fileId: string;
  
  // Version Details
  name: string;
  storagePath: string;
  fileSize: number;
  mimeType: string;
  
  // Changes
  changes?: string;
  changeType: 'created' | 'modified' | 'renamed' | 'moved' | 'deleted' | 'restored';
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  
  // Rollback
  canRollback: boolean;
  rollbackPath?: string;
}

// ============================================================================
// 8.5 File Collections & Organization
// ============================================================================

/**
 * File Collection - A collection of files
 */
export interface FileCollection {
  id: string;
  userId: string;
  
  // Collection Details
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  
  // Organization
  parentCollectionId?: string;
  childCollectionIds: string[];
  depth: number;
  
  // Contents
  fileIds: string[];
  collectionIds: string[]; // nested collections
  
  // Display
  sortOrder: 'name' | 'date' | 'size' | 'type' | 'custom';
  sortDirection: 'asc' | 'desc';
  viewMode: 'grid' | 'list' | 'gallery';
  
  // Sharing
  isShared: boolean;
  sharedWith: string[];
  permissionLevel: 'view' | 'comment' | 'edit' | 'manage';
  
  // Metadata
  itemCount: number;
  totalSize: number; // in bytes
  lastUpdated: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * File Tag - Tag for organizing files
 */
export interface FileTag {
  id: string;
  userId: string;
  
  // Tag Details
  name: string;
  color?: string;
  icon?: string;
  
  // Usage
  fileCount: number;
  lastUsed: Date;
  
  // Organization
  parentTagId?: string;
  childTagIds: string[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 8.6 Gallery Views & Display Modes
// ============================================================================

/**
 * Gallery View Mode - How files are displayed
 */
export type GalleryViewMode = 'full-card' | 'minimal-card' | 'image-only' | 'compact-list' | 'data-first-list';

/**
 * Gallery Display Configuration - Configuration for gallery display
 */
export interface GalleryDisplayConfiguration {
  id: string;
  userId: string;
  
  // View Settings
  viewMode: GalleryViewMode;
  sortBy: 'name' | 'createdAt' | 'updatedAt' | 'size' | 'type';
  sortDirection: 'asc' | 'desc';
  grouping: 'none' | 'type' | 'category' | 'tag' | 'collection' | 'date';
  
  // Filtering
  filterByType?: FileType[];
  filterByCategory?: FileCategory[];
  filterByTag?: string[];
  filterByCollection?: string[];
  
  // Display
  showHidden: boolean;
  showArchived: boolean;
  showDeleted: boolean;
  itemsPerPage: number;
  
  // Grid Settings
  gridColumns: number;
  gridGap: number; // in pixels
  cardAspectRatio?: string; // e.g., "4:3"
  
  // Context
  contextPill: 'files' | 'workspace' | 'map' | 'connect' | 'project';
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 8.7 Context Pills & Navigation
// ============================================================================

/**
 * File Context Pill - A context for viewing files
 */
export interface FileContextPill {
  id: string;
  userId: string;
  
  // Pill Details
  name: string;
  icon: string;
  color: string;
  
  // Context
  domain: 'files' | 'workspace' | 'map' | 'connect' | 'project';
  filter?: Record<string, any>;
  
  // Order
  order: number;
  isDefault: boolean;
  isVisible: boolean;
  
  // Metadata
  fileCount: number;
  lastAccessed: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * File Navigation Rail - Navigation rail configuration for files
 */
export interface FileNavigationRail {
  id: string;
  userId: string;
  
  // Rail Configuration
  isVisible: boolean;
  width: number; // in pixels
  position: 'left' | 'right';
  
  // Content
  showSiblings: boolean;
  showRelated: boolean;
  showCollections: boolean;
  showTags: boolean;
  
  // Grouping
  siblingGrouping: 'none' | 'type' | 'category' | 'tag' | 'collection' | 'date';
  
  // Context
  activeContextPillId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 8.8 Preview & Editor States
// ============================================================================

/**
 * File Preview State - State of the file preview
 */
export type FilePreviewState = 'collapsed' | 'normal' | 'full-page' | 'full-screen';

/**
 * File Preview Configuration - Configuration for file preview
 */
export interface FilePreviewConfiguration {
  id: string;
  userId: string;
  
  // Preview Settings
  defaultState: FilePreviewState;
  autoPlayMedia: boolean;
  autoAdvanceSlides: boolean;
  showControls: boolean;
  
  // Image Settings
  imageZoomEnabled: boolean;
  imagePanEnabled: boolean;
  imageFitMode: 'contain' | 'cover' | 'fill' | 'none';
  
  // Document Settings
  showPageNumbers: boolean;
  showThumbnails: boolean;
  defaultZoom: number; // percentage
  
  // Media Settings
  volume: number; // 0-100
  playbackRate: number; // e.g., 1.0, 1.5, 2.0
  subtitleEnabled: boolean;
  
  // Editor Settings
  editorEnabled: boolean;
  autoSave: boolean;
  autoSaveInterval: number; // in seconds
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 8.9 Interactive Media & Embedded Content
// ============================================================================

/**
 * Embedded Media - Media embedded in a file
 */
export interface EmbeddedMedia {
  id: string;
  fileId: string;
  
  // Media Details
  type: 'image' | 'video' | 'audio' | 'document' | 'map' | 'code';
  url: string;
  thumbnailUrl?: string;
  
  // Position
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  
  // Metadata
  caption?: string;
  altText?: string;
  sourceFileId?: string;
  
  // Interactive Actions
  actions: EmbeddedMediaAction[];
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Embedded Media Action - Action for embedded media
 */
export interface EmbeddedMediaAction {
  id: string;
  embeddedMediaId: string;
  
  // Action Details
  type: 'open-peek' | 'open-gallery' | 'select-for-gallery' | 'add-to-photostrip' | 'replace-card-image' | 'set-fit-mode' | 'view-on-map' | 'return-to-document';
  label: string;
  icon: string;
  
  // Configuration
  requiresSelection: boolean;
  multiSelect: boolean;
  
  // Target
  targetType: 'file' | 'gallery' | 'card' | 'map' | 'document';
  targetId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 8.10 Gallery Management
// ============================================================================

/**
 * File Gallery - A gallery of files
 */
export interface FileGallery {
  id: string;
  userId: string;
  
  // Gallery Details
  name: string;
  description?: string;
  
  // Layout
  layout: 'grid' | 'masonry' | 'carousel' | 'slideshow';
  columns: number;
  gap: number;
  
  // Contents
  fileIds: string[];
  selectedFileIds: string[];
  
  // Behaviour
  autoAdvance: boolean;
  advanceInterval?: number;
  showCaptions: boolean;
  showControls: boolean;
  loop: boolean;
  
  // Display
  showMetadata: boolean;
  showTags: boolean;
  showDates: boolean;
  
  // Navigation
  currentIndex: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 8.11 File Actions & Operations
// ============================================================================

/**
 * File Action - Action that can be performed on a file
 */
export interface FileAction {
  id: string;
  
  // Action Details
  name: string;
  description: string;
  icon: string;
  
  // Operation
  operation: 'rename' | 'edit-metadata' | 'add-tags' | 'link-to-workspace' | 'link-to-map' | 'summarize' | 'extract-text' | 'transcribe' | 'convert-to-note' | 'delete' | 'move' | 'copy' | 'share' | 'download' | 'preview';
  
  // Requirements
  requiredFileTypes: FileType[];
  requiredPermissions: string[];
  
  // Configuration
  isDestructive: boolean;
  requiresConfirmation: boolean;
  confirmationMessage?: string;
  
  // Availability
  availableInStates: FilePreviewState[];
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * File Operation - Record of a file operation
 */
export interface FileOperation {
  id: string;
  fileId: string;
  userId: string;
  
  // Operation Details
  action: string;
  operationType: FileAction['operation'];
  
  // Parameters
  parameters: Record<string, any>;
  
  // Result
  success: boolean;
  result?: any;
  error?: string;
  
  // Timestamps
  startedAt: Date;
  completedAt: Date;
  duration: number; // in milliseconds
  
  createdAt: Date;
}

// ============================================================================
// 8.12 GPS Integration
// ============================================================================

/**
 * File GPS Data - GPS data for files
 */
export interface FileGPSData {
  id: string;
  fileId: string;
  
  // Location
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  
  // Timestamps
  captureTime?: Date;
  gpsTime?: Date;
  
  // Additional Data
  heading?: number;
  speed?: number;
  satelliteCount?: number;
  
  // Map Integration
  mapPinId?: string;
  mapShapeId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 8.13 Default Configurations
// ============================================================================

/**
 * Default gallery display configurations
 */
export const DEFAULT_GALLERY_DISPLAY_CONFIGURATIONS: GalleryDisplayConfiguration[] = [
  {
    id: uuidv4(),
    userId: 'system',
    viewMode: 'full-card',
    sortBy: 'updatedAt',
    sortDirection: 'desc',
    grouping: 'none',
    filterByType: undefined,
    filterByCategory: undefined,
    filterByTag: undefined,
    filterByCollection: undefined,
    showHidden: false,
    showArchived: false,
    showDeleted: false,
    itemsPerPage: 20,
    gridColumns: 3,
    gridGap: 16,
    cardAspectRatio: '4:3',
    contextPill: 'files',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Default file context pills
 */
export const DEFAULT_FILE_CONTEXT_PILLS: FileContextPill[] = [
  {
    id: uuidv4(),
    userId: 'system',
    name: 'Files',
    icon: 'folder',
    color: '#3b82f6',
    domain: 'files',
    order: 0,
    isDefault: true,
    isVisible: true,
    fileCount: 0,
    lastAccessed: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    userId: 'system',
    name: 'Workspace',
    icon: 'layout',
    color: '#10b981',
    domain: 'workspace',
    order: 1,
    isDefault: false,
    isVisible: true,
    fileCount: 0,
    lastAccessed: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    userId: 'system',
    name: 'Map',
    icon: 'map',
    color: '#ef4444',
    domain: 'map',
    order: 2,
    isDefault: false,
    isVisible: true,
    fileCount: 0,
    lastAccessed: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    userId: 'system',
    name: 'Connect',
    icon: 'users',
    color: '#8b5cf6',
    domain: 'connect',
    order: 3,
    isDefault: false,
    isVisible: true,
    fileCount: 0,
    lastAccessed: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    userId: 'system',
    name: 'Project',
    icon: 'briefcase',
    color: '#f59e0b',
    domain: 'project',
    order: 4,
    isDefault: false,
    isVisible: true,
    fileCount: 0,
    lastAccessed: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Default file navigation rail configuration
 */
export const DEFAULT_FILE_NAVIGATION_RAIL: FileNavigationRail = {
  id: uuidv4(),
  userId: 'system',
  isVisible: true,
  width: 280,
  position: 'left',
  showSiblings: true,
  showRelated: true,
  showCollections: true,
  showTags: true,
  siblingGrouping: 'none',
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Default file preview configuration
 */
export const DEFAULT_FILE_PREVIEW_CONFIGURATION: FilePreviewConfiguration = {
  id: uuidv4(),
  userId: 'system',
  defaultState: 'normal',
  autoPlayMedia: true,
  autoAdvanceSlides: false,
  showControls: true,
  imageZoomEnabled: true,
  imagePanEnabled: true,
  imageFitMode: 'contain',
  showPageNumbers: true,
  showThumbnails: true,
  defaultZoom: 100,
  volume: 80,
  playbackRate: 1.0,
  subtitleEnabled: false,
  editorEnabled: true,
  autoSave: true,
  autoSaveInterval: 30,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ============================================================================
// 8.14 Helper Functions
// ============================================================================

/**
 * Create a new file
 */
export function createFile(
  userId: string,
  name: string,
  type: FileType,
  storagePath: string,
  createdBy: string
): File {
  return {
    id: uuidv4(),
    userId,
    name,
    type,
    category: 'personal',
    status: 'active',
    storagePath,
    storageProvider: 'local',
    tags: [],
    keywords: [],
    cardImageIds: [],
    linkedWorkspaceItemIds: [],
    linkedMapPinIds: [],
    linkedMapShapeIds: [],
    linkedContactIds: [],
    linkedCompanyIds: [],
    linkedFileIds: [],
    viewCount: 0,
    lastViewed: new Date(),
    downloadCount: 0,
    shareCount: 0,
    isPublic: false,
    sharedWith: [],
    permissionLevel: 'view',
    version: 1,
    versionHistory: [],
    isLatestVersion: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy,
  };
}

/**
 * Create a new file collection
 */
export function createFileCollection(
  userId: string,
  name: string
): FileCollection {
  return {
    id: uuidv4(),
    userId,
    name,
    childCollectionIds: [],
    depth: 0,
    fileIds: [],
    collectionIds: [],
    sortOrder: 'name',
    sortDirection: 'asc',
    viewMode: 'grid',
    isShared: false,
    sharedWith: [],
    permissionLevel: 'view',
    itemCount: 0,
    totalSize: 0,
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create a new file tag
 */
export function createFileTag(
  userId: string,
  name: string
): FileTag {
  return {
    id: uuidv4(),
    userId,
    name,
    fileCount: 0,
    lastUsed: new Date(),
    childTagIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create a new file card image
 */
export function createFileCardImage(
  fileId: string,
  url: string
): FileCardImage {
  return {
    id: uuidv4(),
    fileId,
    url,
    fitMode: 'cover',
    showOnFront: true,
    showOnBack: true,
    order: 0,
    sourceType: 'file',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create a new file photostrip layout
 */
export function createFilePhotostripLayout(
  fileId: string
): FilePhotostripLayout {
  return {
    id: uuidv4(),
    fileId,
    layoutType: 'single',
    columns: 1,
    rows: 1,
    gap: 8,
    autoAdvance: false,
    showControls: true,
    loop: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create a new file card identity configuration
 */
export function createFileCardIdentityConfiguration(
  fileId: string
): FileCardIdentityConfiguration {
  return {
    id: uuidv4(),
    fileId,
    cornerRadius: 8,
    cardHeight: 'normal',
    density: 'normal',
    defaultFitMode: 'cover',
    showNameOnFront: true,
    showTypeOnFront: true,
    showSizeOnFront: false,
    showDateOnFront: true,
    showTagsOnFront: false,
    frontFieldOrder: ['name', 'type', 'date'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create a new file version
 */
export function createFileVersion(
  fileId: string,
  version: number,
  name: string,
  storagePath: string,
  fileSize: number,
  mimeType: string,
  createdBy: string
): FileVersion {
  return {
    version,
    fileId,
    name,
    storagePath,
    fileSize,
    mimeType,
    changeType: 'modified',
    createdBy,
    createdAt: new Date(),
    canRollback: true,
  };
}

/**
 * Create a new embedded media
 */
export function createEmbeddedMedia(
  fileId: string,
  type: 'image' | 'video' | 'audio' | 'document' | 'map' | 'code',
  url: string
): EmbeddedMedia {
  return {
    id: uuidv4(),
    fileId,
    type,
    url,
    position: {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    },
    actions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create a new file gallery
 */
export function createFileGallery(
  userId: string,
  name: string
): FileGallery {
  return {
    id: uuidv4(),
    userId,
    name,
    layout: 'grid',
    columns: 3,
    gap: 16,
    fileIds: [],
    selectedFileIds: [],
    autoAdvance: false,
    showCaptions: true,
    showControls: true,
    loop: true,
    showMetadata: true,
    showTags: true,
    showDates: true,
    currentIndex: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create a new file GPS data
 */
export function createFileGPSData(
  fileId: string,
  latitude: number,
  longitude: number
): FileGPSData {
  return {
    id: uuidv4(),
    fileId,
    latitude,
    longitude,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Get file type icon
 */
export function getFileTypeIcon(fileType: FileType): string {
  const icons: Record<FileType, string> = {
    'image': 'image',
    'audio': 'music',
    'video': 'video',
    'pdf': 'file-text',
    'markdown': 'file-text',
    'text': 'file-text',
    'scan': 'scan',
    'gps-media': 'map-pin',
    'workspace-attachment': 'paperclip',
    'document': 'file',
    'archive': 'archive',
    'spreadsheet': 'table',
    'presentation': 'presentation',
    'code': 'code',
  };
  return icons[fileType] || 'file';
}

/**
 * Get file type color
 */
export function getFileTypeColor(fileType: FileType): string {
  const colors: Record<FileType, string> = {
    'image': '#3b82f6',
    'audio': '#8b5cf6',
    'video': '#ef4444',
    'pdf': '#dc2626',
    'markdown': '#10b981',
    'text': '#6b7280',
    'scan': '#f59e0b',
    'gps-media': '#06b6d4',
    'workspace-attachment': '#8b5cf6',
    'document': '#3b82f6',
    'archive': '#6b7280',
    'spreadsheet': '#10b981',
    'presentation': '#f59e0b',
    'code': '#6366f1',
  };
  return colors[fileType] || '#6b7280';
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if file is previewable
 */
export function isFilePreviewable(fileType: FileType): boolean {
  const previewableTypes: FileType[] = ['image', 'pdf', 'markdown', 'text', 'document', 'spreadsheet', 'presentation'];
  return previewableTypes.includes(fileType);
}

/**
 * Check if file is editable
 */
export function isFileEditable(fileType: FileType): boolean {
  const editableTypes: FileType[] = ['markdown', 'text', 'document'];
  return editableTypes.includes(fileType);
}

/**
 * Get file preview state label
 */
export function getFilePreviewStateLabel(state: FilePreviewState): string {
  const labels: Record<FilePreviewState, string> = {
    'collapsed': 'Collapsed',
    'normal': 'Normal',
    'full-page': 'Full Page',
    'full-screen': 'Full Screen',
  };
  return labels[state] || 'Normal';
}

/**
 * Calculate total size of files
 */
export function calculateTotalFileSize(files: File[]): number {
  return files.reduce((total, file) => {
    // We need to get file size from metadata, but for simplicity:
    return total + 0; // Placeholder
  }, 0);
}

/**
 * Filter files by type
 */
export function filterFilesByType(files: File[], fileType: FileType): File[] {
  return files.filter(file => file.type === fileType);
}

/**
 * Sort files by criteria
 */
export function sortFiles(files: File[], sortBy: 'name' | 'createdAt' | 'updatedAt' | 'size' | 'type', sortDirection: 'asc' | 'desc'): File[] {
  return [...files].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'createdAt':
        aValue = a.createdAt.getTime();
        bValue = b.createdAt.getTime();
        break;
      case 'updatedAt':
        aValue = a.updatedAt.getTime();
        bValue = b.updatedAt.getTime();
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      case 'size':
        // Placeholder - would need actual file size
        aValue = 0;
        bValue = 0;
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
}