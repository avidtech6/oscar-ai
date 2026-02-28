/**
 * Module 10: Projects Data Models
 * 
 * This module handles project coordination and orchestration layer, bringing together
 * tasks, notes, documents, files, map locations, conversations, timelines, milestones,
 * deliverables, campaigns, and automations. A project is a context that binds items
 * across all domains into a single, navigable cockpit.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// 10.1 Core Project Types & Categories
// ============================================================================

/**
 * Project Item Type - The type of project item
 */
export type ProjectItemType = 'project' | 'section' | 'milestone' | 'deliverable' | 'task' | 'note' | 'document' | 'file' | 'map-location' | 'thread' | 'campaign' | 'automation' | 'timeline' | 'checklist' | 'outline' | 'table' | 'gallery';

/**
 * Project Status - Status of a project item
 */
export type ProjectStatus = 'not-started' | 'planning' | 'in-progress' | 'review' | 'completed' | 'on-hold' | 'cancelled' | 'archived';

/**
 * Project Priority - Priority level
 */
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Project Visibility - Visibility level
 */
export type ProjectVisibility = 'private' | 'team' | 'organization' | 'public';

// ============================================================================
// 10.2 Project Structure & Hierarchy
// ============================================================================

/**
 * Project - A project container
 */
export interface Project {
  id: string;
  userId: string;
  
  // Core Identity
  name: string;
  description?: string;
  type: ProjectItemType;
  status: ProjectStatus;
  priority: ProjectPriority;
  visibility: ProjectVisibility;
  
  // Timeline
  startDate?: Date;
  endDate?: Date;
  dueDate?: Date;
  
  // Structure
  parentProjectId?: string;
  childProjectIds: string[];
  sectionIds: string[];
  milestoneIds: string[];
  deliverableIds: string[];
  
  // Content
  taskIds: string[];
  noteIds: string[];
  documentIds: string[];
  fileIds: string[];
  mapLocationIds: string[];
  threadIds: string[];
  campaignIds: string[];
  automationIds: string[];
  timelineIds: string[];
  
  // Card Identity
  cardImageIds: string[];
  photostripLayoutId?: string;
  cardIdentityConfigurationId?: string;
  
  // Cross-domain links
  linkedWorkspaceItemIds: string[];
  linkedFileIds: string[];
  linkedMapPinIds: string[];
  linkedMapShapeIds: string[];
  linkedContactIds: string[];
  linkedCompanyIds: string[];
  linkedConversationIds: string[];
  linkedCampaignIds: string[];
  linkedAutomationIds: string[];
  
  // Team
  ownerId: string;
  contributorIds: string[];
  teamIds: string[];
  
  // Metadata
  tags: string[];
  categories: string[];
  labels: string[];
  
  // Progress
  progress: number; // 0-100
  completedItems: number;
  totalItems: number;
  
  // Settings
  isTemplate: boolean;
  templateId?: string;
  isArchived: boolean;
  isPinned: boolean;
  isStarred: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
  completedAt?: Date;
}

/**
 * Project Section - A section within a project
 */
export interface ProjectSection {
  id: string;
  projectId: string;
  userId: string;
  
  // Core Identity
  name: string;
  description?: string;
  type: ProjectItemType;
  status: ProjectStatus;
  priority: ProjectPriority;
  
  // Structure
  order: number;
  parentSectionId?: string;
  childSectionIds: string[];
  
  // Content
  taskIds: string[];
  noteIds: string[];
  documentIds: string[];
  fileIds: string[];
  
  // Card Identity
  cardImageIds: string[];
  photostripLayoutId?: string;
  cardIdentityConfigurationId?: string;
  
  // Metadata
  tags: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project Milestone - A milestone within a project
 */
export interface ProjectMilestone {
  id: string;
  projectId: string;
  userId: string;
  
  // Core Identity
  name: string;
  description?: string;
  type: ProjectItemType;
  status: ProjectStatus;
  
  // Timeline
  targetDate?: Date;
  completedDate?: Date;
  
  // Dependencies
  dependsOnMilestoneIds: string[];
  blocksMilestoneIds: string[];
  
  // Deliverables
  deliverableIds: string[];
  
  // Card Identity
  cardImageIds: string[];
  photostripLayoutId?: string;
  cardIdentityConfigurationId?: string;
  
  // Metadata
  tags: string[];
  
  // Progress
  isCompleted: boolean;
  completionPercentage: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project Deliverable - A deliverable within a project
 */
export interface ProjectDeliverable {
  id: string;
  projectId: string;
  milestoneId?: string;
  userId: string;
  
  // Core Identity
  name: string;
  description?: string;
  type: ProjectItemType;
  status: ProjectStatus;
  priority: ProjectPriority;
  
  // Content
  requirements?: string;
  acceptanceCriteria: string[];
  
  // Dependencies
  dependsOnDeliverableIds: string[];
  blocksDeliverableIds: string[];
  
  // Resources
  assignedToIds: string[];
  reviewerIds: string[];
  
  // Card Identity
  cardImageIds: string[];
  photostripLayoutId?: string;
  cardIdentityConfigurationId?: string;
  
  // Metadata
  tags: string[];
  
  // Progress
  isCompleted: boolean;
  completionPercentage: number;
  isApproved: boolean;
  approvedAt?: Date;
  approvedById?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  completedAt?: Date;
}

// ============================================================================
// 10.3 Task Management
// ============================================================================

/**
 * Project Task - A task within a project
 */
export interface ProjectTask {
  id: string;
  projectId: string;
  sectionId?: string;
  milestoneId?: string;
  deliverableId?: string;
  userId: string;
  
  // Core Identity
  title: string;
  description?: string;
  type: ProjectItemType;
  status: ProjectStatus;
  priority: ProjectPriority;
  
  // Assignment
  assignedToId?: string;
  assignedById?: string;
  assignedAt?: Date;
  
  // Timeline
  startDate?: Date;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  completedAt?: Date;
  
  // Dependencies
  dependsOnTaskIds: string[];
  blocksTaskIds: string[];
  
  // Subtasks
  subtaskIds: string[];
  parentTaskId?: string;
  
  // Card Identity
  cardImageIds: string[];
  photostripLayoutId?: string;
  cardIdentityConfigurationId?: string;
  
  // Cross-domain links
  linkedWorkspaceItemIds: string[];
  linkedFileIds: string[];
  linkedMapPinIds: string[];
  linkedContactIds: string[];
  linkedConversationIds: string[];
  
  // Metadata
  tags: string[];
  labels: string[];
  
  // Progress
  isCompleted: boolean;
  completionPercentage: number;
  
  // Recurrence
  isRecurring: boolean;
  recurrencePattern?: string;
  nextOccurrence?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 10.4 Note & Document Management
// ============================================================================

/**
 * Project Note - A note within a project
 */
export interface ProjectNote {
  id: string;
  projectId: string;
  sectionId?: string;
  userId: string;
  
  // Core Identity
  title: string;
  content: string;
  type: ProjectItemType;
  status: ProjectStatus;
  
  // Format
  format: 'markdown' | 'rich-text' | 'plain-text';
  
  // Card Identity
  cardImageIds: string[];
  photostripLayoutId?: string;
  cardIdentityConfigurationId?: string;
  
  // Cross-domain links
  linkedWorkspaceItemIds: string[];
  linkedFileIds: string[];
  linkedMapPinIds: string[];
  linkedContactIds: string[];
  linkedConversationIds: string[];
  
  // Metadata
  tags: string[];
  
  // Versioning
  version: number;
  versionHistory: NoteVersion[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Note Version - Version history of a note
 */
export interface NoteVersion {
  version: number;
  noteId: string;
  content: string;
  changedBy: string;
  changeDescription?: string;
  createdAt: Date;
}

/**
 * Project Document - A document within a project
 */
export interface ProjectDocument {
  id: string;
  projectId: string;
  sectionId?: string;
  userId: string;
  
  // Core Identity
  title: string;
  content: string;
  type: ProjectItemType;
  status: ProjectStatus;
  
  // Format
  format: 'markdown' | 'rich-text' | 'html' | 'pdf' | 'word' | 'google-doc';
  
  // Structure
  outline: DocumentOutline[];
  sections: DocumentSection[];
  
  // Card Identity
  cardImageIds: string[];
  photostripLayoutId?: string;
  cardIdentityConfigurationId?: string;
  
  // Cross-domain links
  linkedWorkspaceItemIds: string[];
  linkedFileIds: string[];
  linkedMapPinIds: string[];
  linkedContactIds: string[];
  linkedConversationIds: string[];
  
  // Metadata
  tags: string[];
  categories: string[];
  
  // Versioning
  version: number;
  versionHistory: DocumentVersion[];
  
  // Collaboration
  collaboratorIds: string[];
  lastEditedById?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

/**
 * Document Outline - Outline item for a document
 */
export interface DocumentOutline {
  id: string;
  documentId: string;
  title: string;
  level: number; // 1 for h1, 2 for h2, etc.
  order: number;
  sectionId?: string;
}

/**
 * Document Section - A section within a document
 */
export interface DocumentSection {
  id: string;
  documentId: string;
  title: string;
  content: string;
  order: number;
  level: number;
  parentSectionId?: string;
}

/**
 * Document Version - Version history of a document
 */
export interface DocumentVersion {
  version: number;
  documentId: string;
  content: string;
  changedBy: string;
  changeDescription?: string;
  createdAt: Date;
}

// ============================================================================
// 10.5 Timeline Management
// ============================================================================

/**
 * Project Timeline - A timeline within a project
 */
export interface ProjectTimeline {
  id: string;
  projectId: string;
  userId: string;
  
  // Core Identity
  name: string;
  description?: string;
  type: ProjectItemType;
  status: ProjectStatus;
  
  // Timeline Configuration
  startDate: Date;
  endDate: Date;
  timeUnit: 'hours' | 'days' | 'weeks' | 'months' | 'quarters';
  
  // Events
  events: TimelineEvent[];
  
  // Card Identity
  cardImageIds: string[];
  photostripLayoutId?: string;
  cardIdentityConfigurationId?: string;
  
  // Metadata
  tags: string[];
  
  // Settings
  isShared: boolean;
  sharedWith: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Timeline Event - An event on a timeline
 */
export interface TimelineEvent {
  id: string;
  timelineId: string;
  
  // Core Identity
  title: string;
  description?: string;
  type: 'milestone' | 'task' | 'meeting' | 'deadline' | 'deliverable' | 'event';
  
  // Timing
  startDate: Date;
  endDate?: Date;
  allDay: boolean;
  
  // References
  referencedItemId?: string;
  referencedItemType?: ProjectItemType;
  
  // Style
  color?: string;
  icon?: string;
  
  // Metadata
  tags: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 10.6 Checklist Management
// ============================================================================

/**
 * Project Checklist - A checklist within a project
 */
export interface ProjectChecklist {
  id: string;
  projectId: string;
  sectionId?: string;
  userId: string;
  
  // Core Identity
  title: string;
  description?: string;
  type: ProjectItemType;
  status: ProjectStatus;
  
  // Items
  items: ChecklistItem[];
  
  // Card Identity
  cardImageIds: string[];
  photostripLayoutId?: string;
  cardIdentityConfigurationId?: string;
  
  // Metadata
  tags: string[];
  
  // Progress
  completedItems: number;
  totalItems: number;
  completionPercentage: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Checklist Item - An item in a checklist
 */
export interface ChecklistItem {
  id: string;
  checklistId: string;
  
  // Content
  title: string;
  description?: string;
  
  // Status
  isCompleted: boolean;
  completedAt?: Date;
  completedById?: string;
  
  // Assignment
  assignedToId?: string;
  
  // Order
  order: number;
  
  // Dependencies
  dependsOnItemIds: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 10.7 Gallery Management
// ============================================================================

/**
 * Project Gallery - A gallery within a project
 */
export interface ProjectGallery {
  id: string;
  projectId: string;
  sectionId?: string;
  userId: string;
  
  // Core Identity
  title: string;
  description?: string;
  type: ProjectItemType;
  status: ProjectStatus;
  
  // Layout
  layout: 'grid' | 'masonry' | 'carousel' | 'slideshow' | 'collage';
  columns: number;
  gap: number;
  
  // Items
  galleryItems: GalleryItem[];
  
  // Card Identity
  cardImageIds: string[];
  photostripLayoutId?: string;
  cardIdentityConfigurationId?: string;
  
  // Metadata
  tags: string[];
  
  // Settings
  autoAdvance: boolean;
  advanceInterval?: number;
  showCaptions: boolean;
  showControls: boolean;
  loop: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Gallery Item - An item in a gallery
 */
export interface GalleryItem {
  id: string;
  galleryId: string;
  
  // Content
  title?: string;
  description?: string;
  caption?: string;
  
  // Media
  mediaType: 'image' | 'video' | 'audio' | 'document' | 'map';
  mediaUrl: string;
  thumbnailUrl?: string;
  
  // Source
  sourceFileId?: string;
  sourceItemId?: string;
  sourceItemType?: ProjectItemType;
  
  // Display
  width?: number;
  height?: number;
  aspectRatio?: string;
  
  // Order
  order: number;
  
  // Metadata
  tags: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 10.8 Table Management
// ============================================================================

/**
 * Project Table - A table within a project
 */
export interface ProjectTable {
  id: string;
  projectId: string;
  sectionId?: string;
  userId: string;
  
  // Core Identity
  title: string;
  description?: string;
  type: ProjectItemType;
  status: ProjectStatus;
  
  // Structure
  columns: TableColumn[];
  rows: TableRow[];
  
  // Card Identity
  cardImageIds: string[];
  photostripLayoutId?: string;
  cardIdentityConfigurationId?: string;
  
  // Metadata
  tags: string[];
  
  // Settings
  isSortable: boolean;
  isFilterable: boolean;
  isEditable: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Table Column - A column in a table
 */
export interface TableColumn {
  id: string;
  tableId: string;
  
  // Identity
  name: string;
  key: string;
  
  // Type
  dataType: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multi-select' | 'file' | 'link' | 'person';
  
  // Configuration
  width?: number;
  isRequired: boolean;
  isSortable: boolean;
  isFilterable: boolean;
  
  // Options (for select/multi-select)
  options?: string[];
  
  // Order
  order: number;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Table Row - A row in a table
 */
export interface TableRow {
  id: string;
  tableId: string;
  
  // Data
  data: Record<string, any>;
  
  // Metadata
  tags: string[];
  
  // Order
  order: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 10.9 Card Identity System (Shared with Files/Workspace/Connect)
// ============================================================================

/**
 * Project Card Image - Image for project card front/back
 */
export interface ProjectCardImage {
  id: string;
  projectItemId: string;
  projectItemType: ProjectItemType;
  
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
  sourceType: 'file' | 'preview' | 'thumbnail' | 'custom' | 'generated';
  sourceFileId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project Photostrip Layout - Layout configuration for multiple images
 */
export interface ProjectPhotostripLayout {
  id: string;
  projectItemId: string;
  projectItemType: ProjectItemType;
  
  // Layout Type
  layoutType: 'single' | 'strip' | 'grid-2x2' | 'collage' | 'carousel' | 'mixed' | 'map-snapshot';
  
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
 * Project Card Identity Configuration - How the project card appears
 */
export interface ProjectCardIdentityConfiguration {
  id: string;
  projectItemId: string;
  projectItemType: ProjectItemType;
  
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
  showStatusOnFront: boolean;
  showDateOnFront: boolean;
  showTagsOnFront: boolean;
  showProgressOnFront: boolean;
  
  // Field Ordering
  frontFieldOrder: string[]; // e.g., ['name', 'type', 'status', 'date', 'tags', 'progress']
  
  // Template
  cardFrontTemplate?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 10.10 Gallery Views & Display Modes
// ============================================================================

/**
 * Project Gallery View Mode - How project items are displayed
 */
export type ProjectGalleryViewMode = 'full-card' | 'minimal-card' | 'image-only' | 'compact-list' | 'data-first-list';

/**
 * Project Gallery Display Configuration - Configuration for gallery display
 */
export interface ProjectGalleryDisplayConfiguration {
  id: string;
  userId: string;
  projectId?: string;
  
  // View Settings
  viewMode: ProjectGalleryViewMode;
  sortBy: 'name' | 'createdAt' | 'updatedAt' | 'status' | 'priority' | 'dueDate' | 'progress';
  sortDirection: 'asc' | 'desc';
  grouping: 'none' | 'type' | 'status' | 'section' | 'milestone' | 'priority' | 'dueDate';
  
  // Filtering
  filterByType?: ProjectItemType[];
  filterByStatus?: ProjectStatus[];
  filterByPriority?: ProjectPriority[];
  filterBySection?: string[];
  filterByMilestone?: string[];
  
  // Display
  showArchived: boolean;
  showCompleted: boolean;
  itemsPerPage: number;
  
  // Grid Settings
  gridColumns: number;
  gridGap: number; // in pixels
  cardAspectRatio?: string; // e.g., "4:3"
  
  // Context
  contextPill: 'project' | 'workspace' | 'files' | 'map' | 'connect';
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 10.11 Context Pills & Navigation
// ============================================================================

/**
 * Project Context Pill - A context for viewing project items
 */
export interface ProjectContextPill {
  id: string;
  userId: string;
  
  // Pill Details
  name: string;
  icon: string;
  color: string;
  
  // Context
  domain: 'project' | 'workspace' | 'files' | 'map' | 'connect';
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
 * Project Navigation Rail - Navigation rail configuration for projects
 */
export interface ProjectNavigationRail {
  id: string;
  userId: string;
  projectId?: string;
  
  // Rail Configuration
  isVisible: boolean;
  width: number; // in pixels
  position: 'left' | 'right';
  
  // Content
  showSiblings: boolean;
  showRelated: boolean;
  showSections: boolean;
  showMilestones: boolean;
  showTasks: boolean;
  
  // Grouping
  siblingGrouping: 'none' | 'type' | 'status' | 'section' | 'milestone' | 'priority' | 'dueDate';
  
  // Context
  activeContextPillId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 10.12 Preview/Editor States
// ============================================================================

/**
 * Project Preview State - State of the project preview
 */
export type ProjectPreviewState = 'collapsed' | 'normal' | 'full-page' | 'full-screen';

/**
 * Project Preview Configuration - Configuration for project preview
 */
export interface ProjectPreviewConfiguration {
  id: string;
  userId: string;
  
  // Preview Settings
  defaultState: ProjectPreviewState;
  autoPlayMedia: boolean;
  autoAdvanceSlides: boolean;
  showControls: boolean;
  
  // Editor Settings
  editorEnabled: boolean;
  autoSave: boolean;
  autoSaveInterval: number; // in seconds
  
  // Document Settings
  defaultFormat: 'markdown' | 'rich-text';
  showOutline: boolean;
  showWordCount: boolean;
  
  // Task Settings
  defaultTaskView: 'list' | 'board' | 'timeline';
  showCompletedTasks: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 10.13 Interactive Media & Embedded Content
// ============================================================================

/**
 * Project Embedded Media - Media embedded in project content
 */
export interface ProjectEmbeddedMedia {
  id: string;
  projectItemId: string;
  projectItemType: ProjectItemType;
  
  // Media Details
  type: 'image' | 'video' | 'audio' | 'document' | 'map' | 'code' | 'gallery' | 'table' | 'checklist' | 'timeline';
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
  actions: ProjectEmbeddedMediaAction[];
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project Embedded Media Action - Action for embedded media
 */
export interface ProjectEmbeddedMediaAction {
  id: string;
  embeddedMediaId: string;
  
  // Action Details
  type: 'open-peek' | 'open-gallery' | 'select-for-gallery' | 'add-to-photostrip' | 'replace-card-image' | 'set-fit-mode' | 'view-on-map' | 'return-to-project';
  label: string;
  icon: string;
  
  // Configuration
  requiresSelection: boolean;
  multiSelect: boolean;
  
  // Target
  targetType: 'project' | 'gallery' | 'card' | 'map' | 'document';
  targetId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 10.14 Helper Functions
// ============================================================================

/**
 * Create a new project
 */
export function createProject(
  userId: string,
  name: string,
  ownerId: string
): Project {
  return {
    id: uuidv4(),
    userId,
    name,
    description: undefined,
    type: 'project',
    status: 'not-started',
    priority: 'medium',
    visibility: 'private',
    startDate: undefined,
    endDate: undefined,
    dueDate: undefined,
    parentProjectId: undefined,
    childProjectIds: [],
    sectionIds: [],
    milestoneIds: [],
    deliverableIds: [],
    taskIds: [],
    noteIds: [],
    documentIds: [],
    fileIds: [],
    mapLocationIds: [],
    threadIds: [],
    campaignIds: [],
    automationIds: [],
    timelineIds: [],
    cardImageIds: [],
    linkedWorkspaceItemIds: [],
    linkedFileIds: [],
    linkedMapPinIds: [],
    linkedMapShapeIds: [],
    linkedContactIds: [],
    linkedCompanyIds: [],
    linkedConversationIds: [],
    linkedCampaignIds: [],
    linkedAutomationIds: [],
    ownerId,
    contributorIds: [],
    teamIds: [],
    tags: [],
    categories: [],
    labels: [],
    progress: 0,
    completedItems: 0,
    totalItems: 0,
    isTemplate: false,
    isArchived: false,
    isPinned: false,
    isStarred: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastActivityAt: new Date(),
  };
}

/**
 * Create a new project task
 */
export function createProjectTask(
  projectId: string,
  userId: string,
  title: string
): ProjectTask {
  return {
    id: uuidv4(),
    projectId,
    userId,
    title,
    description: undefined,
    type: 'task',
    status: 'not-started',
    priority: 'medium',
    assignedToId: undefined,
    assignedById: undefined,
    assignedAt: undefined,
    startDate: undefined,
    dueDate: undefined,
    estimatedHours: undefined,
    actualHours: undefined,
    completedAt: undefined,
    dependsOnTaskIds: [],
    blocksTaskIds: [],
    subtaskIds: [],
    parentTaskId: undefined,
    cardImageIds: [],
    linkedWorkspaceItemIds: [],
    linkedFileIds: [],
    linkedMapPinIds: [],
    linkedContactIds: [],
    linkedConversationIds: [],
    tags: [],
    labels: [],
    isCompleted: false,
    completionPercentage: 0,
    isRecurring: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create a new project note
 */
export function createProjectNote(
  projectId: string,
  userId: string,
  title: string,
  content: string
): ProjectNote {
  return {
    id: uuidv4(),
    projectId,
    userId,
    title,
    content,
    type: 'note',
    status: 'in-progress',
    format: 'markdown',
    cardImageIds: [],
    linkedWorkspaceItemIds: [],
    linkedFileIds: [],
    linkedMapPinIds: [],
    linkedContactIds: [],
    linkedConversationIds: [],
    tags: [],
    version: 1,
    versionHistory: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create a new project milestone
 */
export function createProjectMilestone(
  projectId: string,
  userId: string,
  name: string
): ProjectMilestone {
  return {
    id: uuidv4(),
    projectId,
    userId,
    name,
    description: undefined,
    type: 'milestone',
    status: 'not-started',
    targetDate: undefined,
    completedDate: undefined,
    dependsOnMilestoneIds: [],
    blocksMilestoneIds: [],
    deliverableIds: [],
    cardImageIds: [],
    tags: [],
    isCompleted: false,
    completionPercentage: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Get project status color
 */
export function getProjectStatusColor(status: ProjectStatus): string {
  const colors: Record<ProjectStatus, string> = {
    'not-started': '#6b7280',
    'planning': '#3b82f6',
    'in-progress': '#f59e0b',
    'review': '#8b5cf6',
    'completed': '#10b981',
    'on-hold': '#ef4444',
    'cancelled': '#6b7280',
    'archived': '#6b7280',
  };
  return colors[status] || '#6b7280';
}

/**
 * Get project priority color
 */
export function getProjectPriorityColor(priority: ProjectPriority): string {
  const colors: Record<ProjectPriority, string> = {
    'low': '#10b981',
    'medium': '#f59e0b',
    'high': '#ef4444',
    'critical': '#dc2626',
  };
  return colors[priority] || '#6b7280';
}

/**
 * Calculate project progress
 */
export function calculateProjectProgress(project: Project): number {
  if (project.totalItems === 0) return 0;
  return Math.round((project.completedItems / project.totalItems) * 100);
}

/**
 * Format project due date
 */
export function formatProjectDueDate(dueDate: Date | undefined): string {
  if (!dueDate) return 'No due date';
  
  const now = new Date();
  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
  if (diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 30) return `In ${Math.floor(diffDays / 7)} weeks`;
  return `In ${Math.floor(diffDays / 30)} months`;
}
