/**
 * Module 11: Timeline Data Models
 * 
 * This module handles time-based intelligence layer for visualising, scheduling,
 * and coordinating tasks, milestones, events, project phases, campaign steps,
 * automation triggers, content schedules, deadlines, and reminders.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// 11.1 Core Timeline Types & Categories
// ============================================================================

/**
 * Timeline Item Type - The type of timeline item
 */
export type TimelineItemType = 'task' | 'milestone' | 'project-section' | 'deliverable' | 'campaign-step' | 'email-send' | 'social-post' | 'blog-publish' | 'automation-trigger' | 'event' | 'reminder' | 'meeting' | 'deadline' | 'phase' | 'checkpoint';

/**
 * Timeline View Mode - How the timeline is displayed
 */
export type TimelineViewMode = 'horizontal' | 'vertical' | 'calendar-grid' | 'gantt' | 'campaign' | 'project';

/**
 * Timeline Status - Status of a timeline item
 */
export type TimelineStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'delayed' | 'on-hold';

/**
 * Timeline Priority - Priority level
 */
export type TimelinePriority = 'low' | 'medium' | 'high' | 'critical';

// ============================================================================
// 11.2 Timeline Structure & Configuration
// ============================================================================

/**
 * Timeline - A timeline container
 */
export interface Timeline {
  id: string;
  userId: string;
  
  // Core Identity
  name: string;
  description?: string;
  viewMode: TimelineViewMode;
  
  // Time Range
  startDate: Date;
  endDate: Date;
  timezone: string;
  
  // Configuration
  workingHours: WorkingHours;
  workingDays: WorkingDay[];
  autoRollup: boolean;
  showCriticalPath: boolean;
  showDependencies: boolean;
  showConflicts: boolean;
  
  // Items
  itemIds: string[];
  groupIds: string[];
  
  // Card Identity
  cardImageIds: string[];
  photostripLayoutId?: string;
  cardIdentityConfigurationId?: string;
  
  // Cross-domain links
  linkedProjectIds: string[];
  linkedCampaignIds: string[];
  linkedWorkspaceItemIds: string[];
  linkedFileIds: string[];
  linkedMapPinIds: string[];
  
  // Metadata
  tags: string[];
  categories: string[];
  
  // Settings
  isShared: boolean;
  sharedWith: string[];
  isTemplate: boolean;
  templateId?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastViewed: Date;
}

/**
 * Working Hours - Working hours configuration
 */
export interface WorkingHours {
  startHour: number; // 0-23
  endHour: number; // 0-23
  includeWeekends: boolean;
}

/**
 * Working Day - Working day configuration
 */
export type WorkingDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// ============================================================================
// 11.3 Timeline Item Management
// ============================================================================

/**
 * Timeline Item - An item on a timeline
 */
export interface TimelineItem {
  id: string;
  timelineId: string;
  userId: string;
  
  // Core Identity
  title: string;
  description?: string;
  type: TimelineItemType;
  status: TimelineStatus;
  priority: TimelinePriority;
  
  // Timing
  startDate: Date;
  endDate: Date;
  duration: number; // in hours
  allDay: boolean;
  
  // References
  referencedItemId?: string;
  referencedItemType?: string;
  referencedDomain?: 'project' | 'campaign' | 'workspace' | 'file' | 'map' | 'connect';
  
  // Dependencies
  dependsOnItemIds: string[];
  blocksItemIds: string[];
  dependencyType?: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
  
  // Assignment
  assignedToId?: string;
  assignedById?: string;
  assignedAt?: Date;
  
  // Card Identity
  cardImageIds: string[];
  photostripLayoutId?: string;
  cardIdentityConfigurationId?: string;
  
  // Cross-domain links
  linkedProjectIds: string[];
  linkedCampaignIds: string[];
  linkedWorkspaceItemIds: string[];
  linkedFileIds: string[];
  linkedMapPinIds: string[];
  linkedContactIds: string[];
  linkedCompanyIds: string[];
  
  // Metadata
  tags: string[];
  labels: string[];
  color?: string;
  icon?: string;
  
  // Progress
  progress: number; // 0-100
  completedAt?: Date;
  
  // Recurrence
  isRecurring: boolean;
  recurrencePattern?: string;
  recurrenceEndDate?: Date;
  nextOccurrence?: Date;
  
  // Conflicts
  hasConflicts: boolean;
  conflictIds: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastModifiedAt: Date;
}

// ============================================================================
// 11.4 Timeline Group Management
// ============================================================================

/**
 * Timeline Group - A group of timeline items
 */
export interface TimelineGroup {
  id: string;
  timelineId: string;
  userId: string;
  
  // Core Identity
  name: string;
  description?: string;
  type: 'project' | 'campaign' | 'team' | 'category' | 'status' | 'priority' | 'channel';
  
  // Items
  itemIds: string[];
  subgroupIds: string[];
  
  // Configuration
  isCollapsed: boolean;
  isVisible: boolean;
  color?: string;
  icon?: string;
  
  // Metadata
  tags: string[];
  
  // Progress
  progress: number; // 0-100
  completedItems: number;
  totalItems: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 11.5 Dependency Management
// ============================================================================

/**
 * Timeline Dependency - A dependency between timeline items
 */
export interface TimelineDependency {
  id: string;
  timelineId: string;
  
  // Dependency Details
  fromItemId: string;
  toItemId: string;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
  lag?: number; // in hours
  
  // Status
  isActive: boolean;
  isCritical: boolean;
  
  // Metadata
  description?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 11.6 Conflict Management
// ============================================================================

/**
 * Timeline Conflict - A conflict between timeline items
 */
export interface TimelineConflict {
  id: string;
  timelineId: string;
  
  // Conflict Details
  conflictingItemIds: string[];
  conflictType: 'overlap' | 'resource' | 'dependency' | 'deadline' | 'capacity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Resolution
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedById?: string;
  resolution?: string;
  
  // Detection
  detectedAt: Date;
  detectionRule?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 11.7 Timeline View Configuration
// ============================================================================

/**
 * Timeline View Configuration - Configuration for timeline display
 */
export interface TimelineViewConfiguration {
  id: string;
  userId: string;
  timelineId?: string;
  
  // View Settings
  viewMode: TimelineViewMode;
  zoomLevel: number; // 1-100
  showGrid: boolean;
  showLabels: boolean;
  showMilestones: boolean;
  showDependencies: boolean;
  showConflicts: boolean;
  
  // Grouping
  groupBy: 'none' | 'project' | 'campaign' | 'team' | 'category' | 'status' | 'priority' | 'channel' | 'assignee';
  subgroupBy?: 'none' | 'type' | 'status' | 'priority';
  
  // Filtering
  filterByType?: TimelineItemType[];
  filterByStatus?: TimelineStatus[];
  filterByPriority?: TimelinePriority[];
  filterByProject?: string[];
  filterByCampaign?: string[];
  filterByAssignee?: string[];
  
  // Colour Coding
  colorBy: 'none' | 'status' | 'priority' | 'type' | 'project' | 'campaign' | 'assignee';
  
  // Date Range
  visibleStartDate?: Date;
  visibleEndDate?: Date;
  
  // Card Display
  cardDisplayMode: 'full' | 'compact' | 'minimal' | 'icon';
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 11.8 Timeline Sync Configuration
// ============================================================================

/**
 * Timeline Sync Configuration - Configuration for syncing with other domains
 */
export interface TimelineSyncConfiguration {
  id: string;
  userId: string;
  timelineId: string;
  
  // Project Sync
  syncProjects: boolean;
  syncProjectIds: string[];
  syncProjectTypes: string[];
  autoAddProjectMilestones: boolean;
  autoAddProjectTasks: boolean;
  
  // Campaign Sync
  syncCampaigns: boolean;
  syncCampaignIds: string[];
  syncCampaignTypes: string[];
  autoAddCampaignSteps: boolean;
  autoAddCampaignEmails: boolean;
  autoAddCampaignSocialPosts: boolean;
  
  // Workspace Sync
  syncWorkspace: boolean;
  syncWorkspaceTypes: string[];
  autoAddWorkspaceDeadlines: boolean;
  
  // Automation Sync
  syncAutomations: boolean;
  syncAutomationIds: string[];
  autoAddAutomationTriggers: boolean;
  
  // Sync Schedule
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual';
  lastSyncedAt?: Date;
  nextSyncAt?: Date;
  
  // Conflict Resolution
  conflictResolution: 'manual' | 'auto-keep-newest' | 'auto-keep-oldest' | 'auto-merge';
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 11.9 Card Identity System (Shared with other domains)
// ============================================================================

/**
 * Timeline Card Image - Image for timeline card front/back
 */
export interface TimelineCardImage {
  id: string;
  timelineItemId: string;
  timelineItemType: TimelineItemType;
  
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
 * Timeline Photostrip Layout - Layout configuration for multiple images
 */
export interface TimelinePhotostripLayout {
  id: string;
  timelineItemId: string;
  timelineItemType: TimelineItemType;
  
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
 * Timeline Card Identity Configuration - How the timeline card appears
 */
export interface TimelineCardIdentityConfiguration {
  id: string;
  timelineItemId: string;
  timelineItemType: TimelineItemType;
  
  // Card Appearance
  cornerRadius: number; // in pixels
  cardHeight: 'compact' | 'normal' | 'expanded';
  density: 'compact' | 'normal' | 'comfortable';
  
  // Image Configuration
  photostripLayoutId?: string;
  defaultFitMode: 'fill' | 'contain' | 'cover' | 'fit-width' | 'fit-height' | 'smart-crop' | 'center' | 'tile';
  
  // Metadata Display
  showTitleOnFront: boolean;
  showTypeOnFront: boolean;
  showStatusOnFront: boolean;
  showDatesOnFront: boolean;
  showTagsOnFront: boolean;
  showProgressOnFront: boolean;
  
  // Field Ordering
  frontFieldOrder: string[]; // e.g., ['title', 'type', 'status', 'dates', 'tags', 'progress']
  
  // Template
  cardFrontTemplate?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 11.10 Helper Functions
// ============================================================================

/**
 * Create a new timeline
 */
export function createTimeline(
  userId: string,
  name: string,
  startDate: Date,
  endDate: Date
): Timeline {
  return {
    id: uuidv4(),
    userId,
    name,
    description: undefined,
    viewMode: 'horizontal',
    startDate,
    endDate,
    timezone: 'UTC',
    workingHours: {
      startHour: 9,
      endHour: 17,
      includeWeekends: false,
    },
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    autoRollup: true,
    showCriticalPath: false,
    showDependencies: true,
    showConflicts: true,
    itemIds: [],
    groupIds: [],
    cardImageIds: [],
    linkedProjectIds: [],
    linkedCampaignIds: [],
    linkedWorkspaceItemIds: [],
    linkedFileIds: [],
    linkedMapPinIds: [],
    tags: [],
    categories: [],
    isShared: false,
    sharedWith: [],
    isTemplate: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastViewed: new Date(),
  };
}

/**
 * Create a new timeline item
 */
export function createTimelineItem(
  timelineId: string,
  userId: string,
  title: string,
  startDate: Date,
  endDate: Date,
  type: TimelineItemType
): TimelineItem {
  const duration = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60))); // hours
  
  return {
    id: uuidv4(),
    timelineId,
    userId,
    title,
    description: undefined,
    type,
    status: 'scheduled',
    priority: 'medium',
    startDate,
    endDate,
    duration,
    allDay: duration >= 24,
    referencedItemId: undefined,
    referencedItemType: undefined,
    referencedDomain: undefined,
    dependsOnItemIds: [],
    blocksItemIds: [],
    assignedToId: undefined,
    assignedById: undefined,
    assignedAt: undefined,
    cardImageIds: [],
    linkedProjectIds: [],
    linkedCampaignIds: [],
    linkedWorkspaceItemIds: [],
    linkedFileIds: [],
    linkedMapPinIds: [],
    linkedContactIds: [],
    linkedCompanyIds: [],
    tags: [],
    labels: [],
    progress: 0,
    isRecurring: false,
    hasConflicts: false,
    conflictIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastModifiedAt: new Date(),
  };
}

/**
 * Create a new timeline group
 */
export function createTimelineGroup(
  timelineId: string,
  userId: string,
  name: string,
  type: 'project' | 'campaign' | 'team' | 'category' | 'status' | 'priority' | 'channel'
): TimelineGroup {
  return {
    id: uuidv4(),
    timelineId,
    userId,
    name,
    description: undefined,
    type,
    itemIds: [],
    subgroupIds: [],
    isCollapsed: false,
    isVisible: true,
    tags: [],
    progress: 0,
    completedItems: 0,
    totalItems: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Get timeline status color
 */
export function getTimelineStatusColor(status: TimelineStatus): string {
  const colors: Record<TimelineStatus, string> = {
    'scheduled': '#3b82f6',
    'in-progress': '#f59e0b',
    'completed': '#10b981',
    'cancelled': '#6b7280',
    'delayed': '#ef4444',
    'on-hold': '#8b5cf6',
  };
  return colors[status] || '#6b7280';
}

/**
 * Get timeline priority color
 */
export function getTimelinePriorityColor(priority: TimelinePriority): string {
  const colors: Record<TimelinePriority, string> = {
    'low': '#10b981',
    'medium': '#f59e0b',
    'high': '#ef4444',
    'critical': '#dc2626',
  };
  return colors[priority] || '#6b7280';
}

/**
 * Check if two timeline items overlap
 */
export function checkTimelineOverlap(
  item1: TimelineItem,
  item2: TimelineItem
): boolean {
  return (
    item1.startDate < item2.endDate &&
    item2.startDate < item1.endDate
  );
}

/**
 * Calculate timeline item progress
 */
export function calculateTimelineItemProgress(item: TimelineItem): number {
  if (item.status === 'completed') return 100;
  if (item.status === 'cancelled') return 0;
  if (item.status === 'delayed') return Math.min(item.progress, 50);
  if (item.status === 'on-hold') return Math.min(item.progress, 30);
  
  // For in-progress or scheduled, return the stored progress
  return item.progress;
}

/**
 * Calculate timeline group progress
 */
export function calculateTimelineGroupProgress(group: TimelineGroup): number {
  if (group.totalItems === 0) return 0;
  return Math.round((group.completedItems / group.totalItems) * 100);
}

/**
 * Get timeline item type icon
 */
export function getTimelineItemTypeIcon(type: TimelineItemType): string {
  const icons: Record<TimelineItemType, string> = {
    'task': '📝',
    'milestone': '🎯',
    'project-section': '📁',
    'deliverable': '📦',
    'campaign-step': '📢',
    'email-send': '📧',
    'social-post': '📱',
    'blog-publish': '📰',
    'automation-trigger': '⚙️',
    'event': '📅',
    'reminder': '⏰',
    'meeting': '👥',
    'deadline': '⏳',
    'phase': '📊',
    'checkpoint': '✅',
  };
  return icons[type] || '📋';
}

/**
 * Get timeline view mode label
 */
export function getTimelineViewModeLabel(viewMode: TimelineViewMode): string {
  const labels: Record<TimelineViewMode, string> = {
    'horizontal': 'Horizontal Timeline',
    'vertical': 'Vertical Timeline',
    'calendar-grid': 'Calendar Grid',
    'gantt': 'Gantt Chart',
    'campaign': 'Campaign View',
    'project': 'Project View',
  };
  return labels[viewMode] || 'Timeline';
}

/**
 * Check if timeline item is overdue
 */
export function isTimelineItemOverdue(item: TimelineItem): boolean {
  if (item.status === 'completed' || item.status === 'cancelled') return false;
  return new Date() > item.endDate;
}

/**
 * Get days until timeline item deadline
 */
export function getDaysUntilDeadline(item: TimelineItem): number {
  const now = new Date();
  const end = item.endDate;
  const diffTime = end.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get timeline item duration in days
 */
export function getTimelineItemDurationInDays(item: TimelineItem): number {
  const diffTime = item.endDate.getTime() - item.startDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Create default timeline view configuration
 */
export function createDefaultTimelineViewConfiguration(
  userId: string,
  timelineId?: string
): TimelineViewConfiguration {
  return {
    id: uuidv4(),
    userId,
    timelineId,
    viewMode: 'horizontal',
    zoomLevel: 50,
    showGrid: true,
    showLabels: true,
    showMilestones: true,
    showDependencies: true,
    showConflicts: true,
    groupBy: 'project',
    subgroupBy: 'none',
    colorBy: 'status',
    cardDisplayMode: 'full',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create default timeline sync configuration
 */
export function createDefaultTimelineSyncConfiguration(
  userId: string,
  timelineId: string
): TimelineSyncConfiguration {
  return {
    id: uuidv4(),
    userId,
    timelineId,
    syncProjects: true,
    syncProjectIds: [],
    syncProjectTypes: ['project', 'section', 'milestone', 'deliverable'],
    autoAddProjectMilestones: true,
    autoAddProjectTasks: false,
    syncCampaigns: true,
    syncCampaignIds: [],
    syncCampaignTypes: ['campaign', 'step', 'email', 'social-post', 'blog'],
    autoAddCampaignSteps: true,
    autoAddCampaignEmails: false,
    autoAddCampaignSocialPosts: false,
    syncWorkspace: true,
    syncWorkspaceTypes: ['task', 'note', 'document', 'report', 'deadline'],
    autoAddWorkspaceDeadlines: true,
    syncAutomations: false,
    syncAutomationIds: [],
    autoAddAutomationTriggers: false,
    syncFrequency: 'daily',
    conflictResolution: 'manual',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create timeline card image
 */
export function createTimelineCardImage(
  timelineItemId: string,
  timelineItemType: TimelineItemType,
  url: string
): TimelineCardImage {
  return {
    id: uuidv4(),
    timelineItemId,
    timelineItemType,
    url,
    thumbnailUrl: undefined,
    altText: undefined,
    caption: undefined,
    fitMode: 'cover',
    showOnFront: true,
    showOnBack: false,
    order: 0,
    sourceType: 'file',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create timeline photostrip layout
 */
export function createTimelinePhotostripLayout(
  timelineItemId: string,
  timelineItemType: TimelineItemType
): TimelinePhotostripLayout {
  return {
    id: uuidv4(),
    timelineItemId,
    timelineItemType,
    layoutType: 'single',
    columns: 1,
    rows: 1,
    gap: 4,
    autoAdvance: false,
    showControls: false,
    loop: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create timeline card identity configuration
 */
export function createTimelineCardIdentityConfiguration(
  timelineItemId: string,
  timelineItemType: TimelineItemType
): TimelineCardIdentityConfiguration {
  return {
    id: uuidv4(),
    timelineItemId,
    timelineItemType,
    cornerRadius: 8,
    cardHeight: 'normal',
    density: 'normal',
    defaultFitMode: 'cover',
    showTitleOnFront: true,
    showTypeOnFront: true,
    showStatusOnFront: true,
    showDatesOnFront: true,
    showTagsOnFront: false,
    showProgressOnFront: true,
    frontFieldOrder: ['title', 'type', 'status', 'dates', 'progress'],
    cardFrontTemplate: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}