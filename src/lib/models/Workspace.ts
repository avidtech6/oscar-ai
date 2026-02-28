/**
 * Module 7: Workspace Data Models
 * 
 * This module handles tasks, notes, documents, reports, outlines, and mixed-media content.
 * Workspace is the system's thinking layer with card architecture, task states, due dates,
 * progress tracking, and structured writing.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// 7.1 Core Workspace Item Types
// ============================================================================

/**
 * Workspace Item Type - The type of workspace item
 */
export type WorkspaceItemType = 'task' | 'note' | 'document' | 'report' | 'outline' | 'mixed-media' | 'meeting-notes' | 'research-notes';

/**
 * Workspace Item Status - Status of a workspace item
 */
export type WorkspaceItemStatus = 'draft' | 'in-progress' | 'review' | 'completed' | 'archived' | 'cancelled';

/**
 * Workspace Item Priority - Priority level
 */
export type WorkspaceItemPriority = 'low' | 'medium' | 'high' | 'critical';

// ============================================================================
// 7.2 Card Identity System (Front + Back)
// ============================================================================

/**
 * Card Image - Image for card front/back
 */
export interface CardImage {
  id: string;
  workspaceItemId: string;
  
  // Image Details
  url: string;
  thumbnailUrl?: string;
  altText?: string;
  caption?: string;
  
  // Display Configuration
  fitMode: 'fill' | 'contain' | 'cover' | 'fit-width' | 'fit-height' | 'smart-crop' | 'center';
  showOnFront: boolean;
  showOnBack: boolean;
  
  // Ordering
  order: number;
  
  // Metadata
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Photostrip Layout - Layout configuration for multiple images
 */
export interface PhotostripLayout {
  id: string;
  workspaceItemId: string;
  
  // Layout Type
  layoutType: 'single' | 'strip' | 'grid-2x2' | 'collage' | 'carousel';
  
  // Configuration
  columns: number;
  rows: number;
  gap: number; // in pixels
  aspectRatio?: string; // e.g., "16:9"
  
  // Behaviour
  autoAdvance: boolean;
  advanceInterval?: number; // in milliseconds
  showControls: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Card Identity Configuration - How the card appears
 */
export interface CardIdentityConfiguration {
  id: string;
  workspaceItemId: string;
  
  // Card Appearance
  cornerRadius: number; // in pixels
  cardHeight: 'compact' | 'normal' | 'expanded';
  density: 'compact' | 'normal' | 'comfortable';
  
  // Image Configuration
  photostripLayoutId?: string;
  defaultFitMode: 'fill' | 'contain' | 'cover' | 'fit-width' | 'fit-height' | 'smart-crop' | 'center';
  
  // Metadata Display
  showTitleOnFront: boolean;
  showStatusOnFront: boolean;
  showDueDateOnFront: boolean;
  showPriorityOnFront: boolean;
  showTagsOnFront: boolean;
  
  // Field Ordering
  frontFieldOrder: string[]; // e.g., ['title', 'status', 'dueDate', 'priority']
  
  // Template
  cardFrontTemplate?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 7.3 Workspace Item Base
// ============================================================================

/**
 * Workspace Item - Base interface for all workspace items
 */
export interface WorkspaceItem {
  id: string;
  userId: string;
  
  // Core Identity
  title: string;
  type: WorkspaceItemType;
  status: WorkspaceItemStatus;
  priority: WorkspaceItemPriority;
  
  // Content
  content?: string;
  contentFormat: 'markdown' | 'rich-text' | 'plain' | 'outline';
  
  // Dates
  dueDate?: Date;
  startDate?: Date;
  completedDate?: Date;
  
  // Categorization
  tags: string[];
  category?: string;
  projectId?: string;
  
  // Location
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    placeName?: string;
  };
  
  // Card Identity
  cardImageIds: string[];
  photostripLayoutId?: string;
  cardIdentityConfigurationId?: string;
  
  // Cross-domain links
  linkedFileIds: string[];
  linkedMapPinIds: string[];
  linkedMapShapeIds: string[];
  linkedContactIds: string[];
  linkedCompanyIds: string[];
  linkedWorkspaceItemIds: string[];
  
  // Statistics
  viewCount: number;
  lastViewed: Date;
  editCount: number;
  lastEdited: Date;
  
  // System Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  assignedTo?: string;
}

// ============================================================================
// 7.4 Task-specific Data Models
// ============================================================================

/**
 * Task - A specific type of workspace item for tracking work
 */
export interface Task extends WorkspaceItem {
  // Task-specific fields
  type: 'task';
  
  // Task Details
  estimatedHours?: number;
  actualHours?: number;
  progress: number; // 0-100
  
  // Dependencies
  parentTaskId?: string;
  childTaskIds: string[];
  blockedByTaskIds: string[];
  blockingTaskIds: string[];
  
  // Recurrence
  isRecurring: boolean;
  recurrencePattern?: string; // e.g., "daily", "weekly", "monthly"
  recurrenceEndDate?: Date;
  
  // Reminders
  reminderIds: string[];
  
  // Checklist
  checklistItems: ChecklistItem[];
  
  // Time Tracking
  timeEntries: TimeEntry[];
}

/**
 * Checklist Item - An item in a task checklist
 */
export interface ChecklistItem {
  id: string;
  taskId: string;
  description: string;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
  order: number;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Time Entry - Time spent on a task
 */
export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  
  // Time Tracking
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  
  // Description
  description?: string;
  billable: boolean;
  rate?: number; // hourly rate
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 7.5 Note-specific Data Models
// ============================================================================

/**
 * Note - A note workspace item
 */
export interface Note extends WorkspaceItem {
  type: 'note' | 'meeting-notes' | 'research-notes';
  
  // Note-specific fields
  summary?: string;
  isPinned: boolean;
  isPrivate: boolean;
  
  // Formatting
  formattingOptions: {
    fontSize?: number;
    fontFamily?: string;
    lineHeight?: number;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
  };
  
  // Attachments
  attachmentIds: string[];
}

// ============================================================================
// 7.6 Document-specific Data Models
// ============================================================================

/**
 * Document - A document workspace item
 */
export interface Document extends WorkspaceItem {
  type: 'document' | 'report';
  
  // Document-specific fields
  abstract?: string;
  version: number;
  versionHistory: DocumentVersion[];
  
  // Structure
  tableOfContents?: TableOfContentsItem[];
  sections: DocumentSection[];
  
  // Publishing
  isPublished: boolean;
  publishedAt?: Date;
  publishedVersion?: number;
  
  // Collaboration
  collaborators: string[];
  lastEditedBy?: string;
}

/**
 * Document Version - Version history of a document
 */
export interface DocumentVersion {
  version: number;
  content: string;
  changes?: string;
  createdBy: string;
  createdAt: Date;
}

/**
 * Document Section - A section within a document
 */
export interface DocumentSection {
  id: string;
  documentId: string;
  
  // Section Details
  title: string;
  level: number; // heading level: 1, 2, 3, etc.
  order: number;
  
  // Content
  content?: string;
  contentFormat: 'markdown' | 'rich-text' | 'plain';
  
  // Metadata
  wordCount?: number;
  readingTime?: number; // in minutes
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Table of Contents Item - Item in table of contents
 */
export interface TableOfContentsItem {
  id: string;
  documentId: string;
  sectionId: string;
  
  // Display
  title: string;
  level: number;
  pageNumber?: number;
  
  // Navigation
  anchorId: string;
  
  order: number;
}

// ============================================================================
// 7.7 Outline-specific Data Models
// ============================================================================

/**
 * Outline - An outline workspace item
 */
export interface Outline extends WorkspaceItem {
  type: 'outline';
  
  // Outline-specific fields
  nodes: OutlineNode[];
  connections: OutlineConnection[];
  
  // Layout
  layoutType: 'tree' | 'mind-map' | 'flowchart' | 'timeline';
  zoomLevel: number;
  panX: number;
  panY: number;
}

/**
 * Outline Node - A node in an outline
 */
export interface OutlineNode {
  id: string;
  outlineId: string;
  
  // Content
  title: string;
  content?: string;
  color?: string;
  icon?: string;
  
  // Position
  x: number;
  y: number;
  width: number;
  height: number;
  
  // Hierarchy
  parentNodeId?: string;
  childNodeIds: string[];
  depth: number;
  
  // Metadata
  collapsed: boolean;
  isSelected: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Outline Connection - Connection between outline nodes
 */
export interface OutlineConnection {
  id: string;
  outlineId: string;
  
  // Connection
  sourceNodeId: string;
  targetNodeId: string;
  
  // Style
  lineType: 'straight' | 'curved' | 'stepped';
  color?: string;
  thickness: number;
  
  // Label
  label?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 7.8 Mixed-media Data Models
// ============================================================================

/**
 * MixedMedia - A mixed-media workspace item
 */
export interface MixedMedia extends WorkspaceItem {
  type: 'mixed-media';
  
  // Media Blocks
  blocks: MediaBlock[];
  
  // Layout
  layout: 'linear' | 'grid' | 'masonry' | 'freeform';
  columns?: number;
  gap: number;
}

/**
 * Media Block Type - Type of media block
 */
export type MediaBlockType = 'text' | 'image' | 'gallery' | 'video' | 'audio' | 'code' | 'file' | 'map' | 'divider' | 'quote';

/**
 * Media Block - A block of media in a mixed-media item
 */
export interface MediaBlock {
  id: string;
  mixedMediaId: string;
  type: MediaBlockType;
  
  // Content
  content?: string;
  mediaUrl?: string;
  mediaUrls?: string[]; // for galleries
  caption?: string;
  
  // Display
  width: number; // 1-12 grid columns
  height?: number; // in pixels or auto
  order: number;
  
  // Style
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
  padding?: number;
  
  // Gallery-specific
  galleryLayout?: 'grid' | 'masonry' | 'carousel';
  galleryColumns?: number;
  
  // Map-specific
  mapCenterLatitude?: number;
  mapCenterLongitude?: number;
  mapZoom?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 7.9 Gallery & Media Management
// ============================================================================

/**
 * Gallery - A collection of media items
 */
export interface Gallery {
  id: string;
  workspaceItemId: string;
  userId: string;
  
  // Gallery Details
  title: string;
  description?: string;
  
  // Layout
  layout: 'grid' | 'masonry' | 'carousel' | 'slideshow';
  columns: number;
  gap: number;
  
  // Media Items
  mediaItemIds: string[];
  selectedMediaItemIds: string[];
  
  // Behaviour
  autoAdvance: boolean;
  advanceInterval?: number;
  showCaptions: boolean;
  showControls: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Media Item - A media item in a gallery
 */
export interface MediaItem {
  id: string;
  galleryId: string;
  
  // Media Details
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video' | 'audio' | 'document';
  mimeType: string;
  
  // Display
  caption?: string;
  altText?: string;
  order: number;
  
  // Dimensions
  width?: number;
  height?: number;
  duration?: number; // for video/audio
  
  // Metadata
  fileSize?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 7.10 Workspace Views & Layouts
// ============================================================================

/**
 * Workspace View Mode - How workspace items are displayed
 */
export type WorkspaceViewMode = 'full-card' | 'minimal-card' | 'image-only' | 'compact-list' | 'data-first-list';

/**
 * Workspace Grouping - How workspace items are grouped
 */
export type WorkspaceGrouping = 'status' | 'due-date' | 'priority' | 'tag' | 'project' | 'type' | 'none';

/**
 * Workspace View Configuration - Configuration for viewing workspace items
 */
export interface WorkspaceViewConfiguration {
  id: string;
  userId: string;
  
  // View Settings
  viewMode: WorkspaceViewMode;
  grouping: WorkspaceGrouping;
  sortBy: 'title' | 'createdAt' | 'updatedAt' | 'dueDate' | 'priority';
  sortDirection: 'asc' | 'desc';
  
  // Filtering
  filterByStatus?: WorkspaceItemStatus[];
  filterByType?: WorkspaceItemType[];
  filterByPriority?: WorkspaceItemPriority[];
  filterByTag?: string[];
  filterByProject?: string[];
  
  // Display
  showCompleted: boolean;
  showArchived: boolean;
  itemsPerPage: number;
  
  // Context
  contextPill: 'workspace' | 'files' | 'map' | 'connect' | 'project';
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 7.11 Editor & Preview States
// ============================================================================

/**
 * Editor State - State of the editor
 */
export type EditorState = 'collapsed' | 'normal' | 'full-page' | 'full-screen';

/**
 * Editor Configuration - Configuration for the editor
 */
export interface EditorConfiguration {
  id: string;
  userId: string;
  
  // Editor Settings
  defaultState: EditorState;
  autoSave: boolean;
  autoSaveInterval: number; // in seconds
  spellCheck: boolean;
  grammarCheck: boolean;
  
  // Formatting
  defaultFontSize: number;
  defaultFontFamily: string;
  defaultLineHeight: number;
  
  // Features
  showLineNumbers: boolean;
  showWordCount: boolean;
  showReadingTime: boolean;
  showFormattingToolbar: boolean;
  
  // Help
  showHelpMarkers: boolean;
  helpPeekEnabled: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 7.12 Context Pills & Navigation
// ============================================================================

/**
 * Context Pill - A context for viewing workspace items
 */
export interface ContextPill {
  id: string;
  userId: string;
  
  // Pill Details
  name: string;
  icon: string;
  color: string;
  
  // Context
  domain: 'workspace' | 'files' | 'map' | 'connect' | 'project';
  filter?: Record<string, any>;
  
  // Order
  order: number;
  isDefault: boolean;
  isVisible: boolean;
  
  // Metadata
  itemCount: number;
  lastAccessed: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Navigation Rail - Navigation rail configuration
 */
export interface NavigationRail {
  id: string;
  userId: string;
  
  // Rail Configuration
  isVisible: boolean;
  width: number; // in pixels
  position: 'left' | 'right';
  
  // Content
  showSiblings: boolean;
  showHierarchy: boolean;
  showRelated: boolean;
  
  // Grouping
  siblingGrouping: WorkspaceGrouping;
  
  // Context
  activeContextPillId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 7.13 Help & Documentation
// ============================================================================

/**
 * Help Marker - A help marker in the editor
 */
export interface HelpMarker {
  id: string;
  workspaceItemId: string;
  userId: string;
  
  // Marker Details
  blockId: string;
  blockType: string;
  sectionTitle?: string;
  
  // Position
  lineNumber?: number;
  characterPosition?: number;
  
  // Help Content
  preMadeQuestions: string[];
  documentationLink?: string;
  
  // Usage
  clickCount: number;
  lastClicked: Date;
  isPinned: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 7.14 Default Configurations
// ============================================================================

/**
 * Default workspace view configurations
 */
export const DEFAULT_WORKSPACE_VIEW_CONFIGURATIONS: WorkspaceViewConfiguration[] = [
  {
    id: uuidv4(),
    userId: 'system',
    viewMode: 'full-card',
    grouping: 'none',
    sortBy: 'updatedAt',
    sortDirection: 'desc',
    showCompleted: true,
    showArchived: false,
    itemsPerPage: 20,
    contextPill: 'workspace',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Default editor configurations
 */
export const DEFAULT_EDITOR_CONFIGURATIONS: EditorConfiguration[] = [
  {
    id: uuidv4(),
    userId: 'system',
    defaultState: 'normal',
    autoSave: true,
    autoSaveInterval: 30,
    spellCheck: true,
    grammarCheck: true,
    defaultFontSize: 16,
    defaultFontFamily: 'Inter, system-ui, sans-serif',
    defaultLineHeight: 1.6,
    showLineNumbers: false,
    showWordCount: true,
    showReadingTime: true,
    showFormattingToolbar: true,
    showHelpMarkers: true,
    helpPeekEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Default context pills
 */
export const DEFAULT_CONTEXT_PILLS: ContextPill[] = [
  {
    id: uuidv4(),
    userId: 'system',
    name: 'Workspace',
    icon: 'layout',
    color: '#3b82f6',
    domain: 'workspace',
    order: 0,
    isDefault: true,
    isVisible: true,
    itemCount: 0,
    lastAccessed: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    userId: 'system',
    name: 'Files',
    icon: 'folder',
    color: '#10b981',
    domain: 'files',
    order: 1,
    isDefault: false,
    isVisible: true,
    itemCount: 0,
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
    itemCount: 0,
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
    itemCount: 0,
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
    itemCount: 0,
    lastAccessed: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Default navigation rail configuration
 */
export const DEFAULT_NAVIGATION_RAIL: NavigationRail = {
  id: uuidv4(),
  userId: 'system',
  isVisible: true,
  width: 280,
  position: 'left',
  showSiblings: true,
  showHierarchy: true,
  showRelated: true,
  siblingGrouping: 'none',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ============================================================================
// 7.15 Helper Functions
// ============================================================================

/**
 * Create a new workspace item
 */
export function createWorkspaceItem(
  userId: string,
  title: string,
  type: WorkspaceItemType,
  createdBy: string
): WorkspaceItem {
  return {
    id: uuidv4(),
    userId,
    title,
    type,
    status: 'draft',
    priority: 'medium',
    contentFormat: 'markdown',
    tags: [],
    cardImageIds: [],
    linkedFileIds: [],
    linkedMapPinIds: [],
    linkedMapShapeIds: [],
    linkedContactIds: [],
    linkedCompanyIds: [],
    linkedWorkspaceItemIds: [],
    viewCount: 0,
    lastViewed: new Date(),
    editCount: 0,
    lastEdited: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy,
  };
}

/**
 * Create a new task
 */
export function createTask(
  userId: string,
  title: string,
  createdBy: string
): Task {
  const baseItem = createWorkspaceItem(userId, title, 'task', createdBy);
  
  return {
    ...baseItem,
    type: 'task',
    progress: 0,
    childTaskIds: [],
    blockedByTaskIds: [],
    blockingTaskIds: [],
    isRecurring: false,
    reminderIds: [],
    checklistItems: [],
    timeEntries: [],
  };
}

/**
 * Create a new note
 */
export function createNote(
  userId: string,
  title: string,
  noteType: 'note' | 'meeting-notes' | 'research-notes',
  createdBy: string
): Note {
  const baseItem = createWorkspaceItem(userId, title, noteType, createdBy);
  
  return {
    ...baseItem,
    type: noteType,
    isPinned: false,
    isPrivate: false,
    formattingOptions: {},
    attachmentIds: [],
  };
}

/**
 * Create a new document
 */
export function createDocument(
  userId: string,
  title: string,
  documentType: 'document' | 'report',
  createdBy: string
): Document {
  const baseItem = createWorkspaceItem(userId, title, documentType, createdBy);
  
  return {
    ...baseItem,
    type: documentType,
    version: 1,
    versionHistory: [],
    sections: [],
    isPublished: false,
    collaborators: [],
  };
}

/**
 * Create a new outline
 */
export function createOutline(
  userId: string,
  title: string,
  createdBy: string
): Outline {
  const baseItem = createWorkspaceItem(userId, title, 'outline', createdBy);
  
  return {
    ...baseItem,
    type: 'outline',
    nodes: [],
    connections: [],
    layoutType: 'mind-map',
    zoomLevel: 1,
    panX: 0,
    panY: 0,
  };
}

/**
 * Create a new mixed-media item
 */
export function createMixedMedia(
  userId: string,
  title: string,
  createdBy: string
): MixedMedia {
  const baseItem = createWorkspaceItem(userId, title, 'mixed-media', createdBy);
  
  return {
    ...baseItem,
    type: 'mixed-media',
    blocks: [],
    layout: 'linear',
    gap: 16,
  };
}

/**
 * Create a new checklist item
 */
export function createChecklistItem(
  taskId: string,
  description: string
): ChecklistItem {
  return {
    id: uuidv4(),
    taskId,
    description,
    isCompleted: false,
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create a new time entry
 */
export function createTimeEntry(
  taskId: string,
  userId: string
): TimeEntry {
  return {
    id: uuidv4(),
    taskId,
    userId,
    startTime: new Date(),
    billable: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create a new document section
 */
export function createDocumentSection(
  documentId: string,
  title: string,
  level: number,
  order: number
): DocumentSection {
  return {
    id: uuidv4(),
    documentId,
    title,
    level,
    order,
    contentFormat: 'markdown',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create a new outline node
 */
export function createOutlineNode(
  outlineId: string,
  title: string,
  x: number,
  y: number
): OutlineNode {
  return {
    id: uuidv4(),
    outlineId,
    title,
    x,
    y,
    width: 200,
    height: 100,
    childNodeIds: [],
    depth: 0,
    collapsed: false,
    isSelected: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create a new media block
 */
export function createMediaBlock(
  mixedMediaId: string,
  type: MediaBlockType,
  order: number
): MediaBlock {
  return {
    id: uuidv4(),
    mixedMediaId,
    type,
    width: 12, // Full width by default
    order,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create a new card image
 */
export function createCardImage(
  workspaceItemId: string,
  url: string
): CardImage {
  return {
    id: uuidv4(),
    workspaceItemId,
    url,
    fitMode: 'cover',
    showOnFront: true,
    showOnBack: true,
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create a new help marker
 */
export function createHelpMarker(
  workspaceItemId: string,
  userId: string,
  blockId: string,
  blockType: string
): HelpMarker {
  return {
    id: uuidv4(),
    workspaceItemId,
    userId,
    blockId,
    blockType,
    preMadeQuestions: [],
    clickCount: 0,
    lastClicked: new Date(),
    isPinned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Calculate reading time for content
 */
export function calculateReadingTime(content: string, wordsPerMinute: number = 200): number {
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Calculate word count for content
 */
export function calculateWordCount(content: string): number {
  return content.trim().split(/\s+/).length;
}

/**
 * Get status color for a workspace item
 */
export function getStatusColor(status: WorkspaceItemStatus): string {
  const colors: Record<WorkspaceItemStatus, string> = {
    'draft': '#6b7280',
    'in-progress': '#3b82f6',
    'review': '#f59e0b',
    'completed': '#10b981',
    'archived': '#9ca3af',
    'cancelled': '#ef4444',
  };
  return colors[status] || '#6b7280';
}

/**
 * Get priority color for a workspace item
 */
export function getPriorityColor(priority: WorkspaceItemPriority): string {
  const colors: Record<WorkspaceItemPriority, string> = {
    'low': '#6b7280',
    'medium': '#f59e0b',
    'high': '#ef4444',
    'critical': '#dc2626',
  };
  return colors[priority] || '#6b7280';
}

/**
 * Check if a workspace item is overdue
 */
export function isOverdue(item: WorkspaceItem): boolean {
  if (!item.dueDate || item.status === 'completed' || item.status === 'cancelled') {
    return false;
  }
  return new Date(item.dueDate) < new Date();
}

/**
 * Calculate progress percentage for a task
 */
export function calculateTaskProgress(task: Task): number {
  if (task.checklistItems.length === 0) {
    return task.progress;
  }
  
  const completedItems = task.checklistItems.filter(item => item.isCompleted).length;
  return Math.round((completedItems / task.checklistItems.length) * 100);
}

/**
 * Get due date status
 */
export function getDueDateStatus(dueDate?: Date): 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'none' {
  if (!dueDate) return 'none';
  
  const now = new Date();
  const due = new Date(dueDate);
  
  // Reset times to compare only dates
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  
  const diffDays = Math.floor((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  return 'upcoming';
}
