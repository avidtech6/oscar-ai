/**
 * Module 14: Notifications Data Models
 * 
 * This module handles activity persistence, notification management,
 * and user alert systems across all domains.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// 14.1 Core Notification Types & Categories
// ============================================================================

/**
 * Notification Type - The type of notification
 */
export type NotificationType = 'system' | 'user' | 'activity' | 'alert' | 'reminder' | 'update' | 'mention' | 'comment' | 'share' | 'invitation' | 'approval' | 'error' | 'warning' | 'success' | 'info';

/**
 * Notification Priority - Priority level
 */
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Notification Status - Status of a notification
 */
export type NotificationStatus = 'unread' | 'read' | 'archived' | 'deleted' | 'dismissed' | 'actioned';

/**
 * Notification Channel - Delivery channel
 */
export type NotificationChannel = 'in-app' | 'email' | 'push' | 'sms' | 'desktop' | 'webhook';

// ============================================================================
// 14.2 Notification Management
// ============================================================================

/**
 * Notification - A notification message
 */
export interface Notification {
  id: string;
  userId: string;
  
  // Core Identity
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  
  // Content
  content?: any;
  htmlContent?: string;
  markdownContent?: string;
  
  // Action
  actionLabel?: string;
  actionUrl?: string;
  actionData?: any;
  actionType?: string;
  
  // Source
  sourceType: string;
  sourceId?: string;
  sourceName?: string;
  sourceIcon?: string;
  
  // Context
  contextModule?: string;
  contextFeature?: string;
  contextData?: any;
  
  // Delivery
  channels: NotificationChannel[];
  deliveredAt?: Date;
  readAt?: Date;
  actionedAt?: Date;
  dismissedAt?: Date;
  archivedAt?: Date;
  
  // Expiry
  expiresAt?: Date;
  ttl?: number; // time to live in seconds
  
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
  linkedTimelineIds: string[];
  linkedContactIds: string[];
  linkedCompanyIds: string[];
  
  // Metadata
  tags: string[];
  labels: string[];
  category: string;
  subcategory?: string;
  
  // Settings
  isSilent: boolean;
  isPersistent: boolean;
  requiresAck: boolean;
  canDismiss: boolean;
  canArchive: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 14.3 Notification Group Management
// ============================================================================

/**
 * Notification Group - A group of related notifications
 */
export interface NotificationGroup {
  id: string;
  userId: string;
  
  // Core Identity
  name: string;
  description?: string;
  type: 'daily-digest' | 'weekly-summary' | 'project-updates' | 'team-activity' | 'system-alerts' | 'personal';
  
  // Notifications
  notificationIds: string[];
  
  // Statistics
  totalNotifications: number;
  unreadNotifications: number;
  readNotifications: number;
  
  // Delivery
  deliverySchedule: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  lastDeliveredAt?: Date;
  nextDeliveryAt?: Date;
  
  // Configuration
  isEnabled: boolean;
  isCollapsed: boolean;
  autoArchive: boolean;
  archiveAfterDays: number;
  
  // Metadata
  tags: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 14.4 Notification Preference Management
// ============================================================================

/**
 * Notification Preference - User preferences for notifications
 */
export interface NotificationPreference {
  id: string;
  userId: string;
  
  // Channel Preferences
  channelPreferences: Record<NotificationChannel, boolean>;
  
  // Type Preferences
  typePreferences: Record<NotificationType, boolean>;
  
  // Module Preferences
  modulePreferences: Record<string, boolean>;
  
  // Time Preferences
  quietHoursEnabled: boolean;
  quietHoursStart: string; // e.g., "22:00"
  quietHoursEnd: string; // e.g., "08:00"
  timezone: string;
  
  // Frequency Preferences
  digestFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  maxNotificationsPerDay: number;
  
  // Content Preferences
  includePreview: boolean;
  includeActions: boolean;
  includeImages: boolean;
  
  // Advanced
  allowExternalNotifications: boolean;
  allowSystemNotifications: boolean;
  allowMarketingNotifications: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 14.5 Notification Template Management
// ============================================================================

/**
 * Notification Template - A template for creating notifications
 */
export interface NotificationTemplate {
  id: string;
  
  // Core Identity
  name: string;
  description?: string;
  type: NotificationType;
  category: string;
  
  // Content Template
  titleTemplate: string;
  messageTemplate: string;
  htmlTemplate?: string;
  markdownTemplate?: string;
  
  // Variables
  variables: string[];
  variableDefaults: Record<string, any>;
  
  // Actions
  defaultActionLabel?: string;
  defaultActionUrl?: string;
  defaultActionType?: string;
  
  // Delivery
  defaultChannels: NotificationChannel[];
  defaultPriority: NotificationPriority;
  defaultTtl?: number;
  
  // Usage
  usageCount: number;
  isSystem: boolean;
  isEditable: boolean;
  
  // Metadata
  tags: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 14.6 Notification Delivery Log
// ============================================================================

/**
 * Notification Delivery Log - Log of notification deliveries
 */
export interface NotificationDeliveryLog {
  id: string;
  notificationId: string;
  userId: string;
  
  // Delivery Details
  channel: NotificationChannel;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'opened' | 'clicked';
  statusMessage?: string;
  
  // Timing
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  failedAt?: Date;
  
  // Provider Details
  provider: string;
  providerMessageId?: string;
  providerResponse?: any;
  
  // Error Details
  errorCode?: string;
  errorMessage?: string;
  errorDetails?: any;
  retryCount: number;
  
  // Metadata
  userAgent?: string;
  ipAddress?: string;
  deviceId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 14.7 Activity Stream Management
// ============================================================================

/**
 * Activity - An activity event
 */
export interface Activity {
  id: string;
  userId: string;
  actorId?: string;
  
  // Core Identity
  action: string;
  objectType: string;
  objectId?: string;
  objectName?: string;
  
  // Content
  summary: string;
  details?: any;
  
  // Context
  contextModule: string;
  contextFeature: string;
  contextData?: any;
  
  // Location
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  location?: string;
  
  // Cross-domain links
  linkedProjectIds: string[];
  linkedCampaignIds: string[];
  linkedWorkspaceItemIds: string[];
  linkedFileIds: string[];
  linkedMapPinIds: string[];
  linkedTimelineIds: string[];
  linkedContactIds: string[];
  linkedCompanyIds: string[];
  
  // Metadata
  tags: string[];
  labels: string[];
  
  // Privacy
  isPublic: boolean;
  isSensitive: boolean;
  
  // Timestamps
  occurredAt: Date;
  recordedAt: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 14.8 Activity Feed Management
// ============================================================================

/**
 * Activity Feed - A feed of activities
 */
export interface ActivityFeed {
  id: string;
  userId: string;
  
  // Core Identity
  name: string;
  description?: string;
  type: 'personal' | 'team' | 'project' | 'global' | 'custom';
  
  // Activities
  activityIds: string[];
  
  // Filtering
  filters: ActivityFilter[];
  
  // Sorting
  sortBy: 'date-desc' | 'date-asc' | 'priority' | 'relevance';
  
  // Pagination
  pageSize: number;
  currentPage: number;
  totalActivities: number;
  
  // Configuration
  autoRefresh: boolean;
  refreshInterval: number; // in minutes
  showReadActivities: boolean;
  showSensitiveActivities: boolean;
  
  // Metadata
  tags: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Activity Filter - A filter for activities
 */
export interface ActivityFilter {
  field: string;
  operator: 'equals' | 'not-equals' | 'contains' | 'starts-with' | 'ends-with' | 'greater-than' | 'less-than' | 'in' | 'not-in';
  value: any;
}

// ============================================================================
// 14.9 Card Identity System (Shared with other domains)
// ============================================================================

/**
 * Notification Card Image - Image for notification card front/back
 */
export interface NotificationCardImage {
  id: string;
  notificationId: string;
  
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
 * Notification Photostrip Layout - Layout configuration for multiple images
 */
export interface NotificationPhotostripLayout {
  id: string;
  notificationId: string;
  
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
 * Notification Card Identity Configuration - How the notification card appears
 */
export interface NotificationCardIdentityConfiguration {
  id: string;
  notificationId: string;
  
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
  showPriorityOnFront: boolean;
  showTimestampOnFront: boolean;
  showSourceOnFront: boolean;
  
  // Field Ordering
  frontFieldOrder: string[]; // e.g., ['title', 'type', 'priority', 'timestamp', 'source']
  
  // Template
  cardFrontTemplate?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 14.10 Helper Functions
// ============================================================================

/**
 * Create a new notification
 */
export function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType
): Notification {
  return {
    id: uuidv4(),
    userId,
    title,
    message,
    type,
    priority: 'medium',
    status: 'unread',
    sourceType: 'system',
    channels: ['in-app'],
    cardImageIds: [],
    linkedProjectIds: [],
    linkedCampaignIds: [],
    linkedWorkspaceItemIds: [],
    linkedFileIds: [],
    linkedMapPinIds: [],
    linkedTimelineIds: [],
    linkedContactIds: [],
    linkedCompanyIds: [],
    tags: [],
    labels: [],
    category: 'general',
    isSilent: false,
    isPersistent: false,
    requiresAck: false,
    canDismiss: true,
    canArchive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create a new notification group
 */
export function createNotificationGroup(
  userId: string,
  name: string,
  type: 'daily-digest' | 'weekly-summary' | 'project-updates' | 'team-activity' | 'system-alerts' | 'personal'
): NotificationGroup {
  return {
    id: uuidv4(),
    userId,
    name,
    description: undefined,
    type,
    notificationIds: [],
    totalNotifications: 0,
    unreadNotifications: 0,
    readNotifications: 0,
    deliverySchedule: 'daily',
    isEnabled: true,
    isCollapsed: false,
    autoArchive: true,
    archiveAfterDays: 30,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create default notification preferences
 */
export function createDefaultNotificationPreferences(userId: string): NotificationPreference {
  return {
    id: uuidv4(),
    userId,
    channelPreferences: {
      'in-app': true,
      'email': true,
      'push': true,
      'sms': false,
      'desktop': true,
      'webhook': false,
    },
    typePreferences: {
      'system': true,
      'user': true,
      'activity': true,
      'alert': true,
      'reminder': true,
      'update': true,
      'mention': true,
      'comment': true,
      'share': true,
      'invitation': true,
      'approval': true,
      'error': true,
      'warning': true,
      'success': true,
      'info': true,
    },
    modulePreferences: {},
    quietHoursEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    timezone: 'UTC',
    digestFrequency: 'daily',
    maxNotificationsPerDay: 50,
    includePreview: true,
    includeActions: true,
    includeImages: true,
    allowExternalNotifications: false,
    allowSystemNotifications: true,
    allowMarketingNotifications: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create a new activity
 */
export function createActivity(
  userId: string,
  action: string,
  objectType: string,
  summary: string,
  contextModule: string,
  contextFeature: string
): Activity {
  return {
    id: uuidv4(),
    userId,
    action,
    objectType,
    summary,
    contextModule,
    contextFeature,
    linkedProjectIds: [],
    linkedCampaignIds: [],
    linkedWorkspaceItemIds: [],
    linkedFileIds: [],
    linkedMapPinIds: [],
    linkedTimelineIds: [],
    linkedContactIds: [],
    linkedCompanyIds: [],
    tags: [],
    labels: [],
    isPublic: false,
    isSensitive: false,
    occurredAt: new Date(),
    recordedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create a new activity feed
 */
export function createActivityFeed(
  userId: string,
  name: string,
  type: 'personal' | 'team' | 'project' | 'global' | 'custom'
): ActivityFeed {
  return {
    id: uuidv4(),
    userId,
    name,
    description: undefined,
    type,
    activityIds: [],
    filters: [],
    sortBy: 'date-desc',
    pageSize: 20,
    currentPage: 1,
    totalActivities: 0,
    autoRefresh: true,
    refreshInterval: 5,
    showReadActivities: true,
    showSensitiveActivities: false,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Get notification type color
 */
export function getNotificationTypeColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    'system': '#3b82f6',
    'user': '#8b5cf6',
    'activity': '#10b981',
    'alert': '#f59e0b',
    'reminder': '#3b82f6',
    'update': '#8b5cf6',
    'mention': '#ef4444',
    'comment': '#10b981',
    'share': '#3b82f6',
    'invitation': '#8b5cf6',
    'approval': '#10b981',
    'error': '#dc2626',
    'warning': '#f59e0b',
    'success': '#10b981',
    'info': '#3b82f6',
  };
  return colors[type] || '#3b82f6';
}

/**
 * Get notification priority color
 */
export function getNotificationPriorityColor(priority: NotificationPriority): string {
  const colors: Record<NotificationPriority, string> = {
    'low': '#10b981',
    'medium': '#f59e0b',
    'high': '#ef4444',
    'critical': '#dc2626',
  };
  return colors[priority] || '#f59e0b';
}

/**
 * Get notification type icon
 */
export function getNotificationTypeIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    'system': '⚙️',
    'user': '👤',
    'activity': '📱',
    'alert': '🚨',
    'reminder': '⏰',
    'update': '🔄',
    'mention': '@',
    'comment': '💬',
    'share': '📤',
    'invitation': '📨',
    'approval': '✅',
    'error': '❌',
    'warning': '⚠️',
    'success': '✅',
    'info': 'ℹ️',
  };
  return icons[type] || '📋';
}

/**
 * Get notification status icon
 */
export function getNotificationStatusIcon(status: NotificationStatus): string {
  const icons: Record<NotificationStatus, string> = {
    'unread': '🔵',
    'read': '⚪',
    'archived': '📁',
    'deleted': '🗑️',
    'dismissed': '❌',
    'actioned': '✅',
  };
  return icons[status] || '🔵';
}

/**
 * Create notification card image
 */
export function createNotificationCardImage(
  notificationId: string,
  url: string
): NotificationCardImage {
  return {
    id: uuidv4(),
    notificationId,
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
 * Create notification photostrip layout
 */
export function createNotificationPhotostripLayout(
  notificationId: string
): NotificationPhotostripLayout {
  return {
    id: uuidv4(),
    notificationId,
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
 * Create notification card identity configuration
 */
export function createNotificationCardIdentityConfiguration(
  notificationId: string
): NotificationCardIdentityConfiguration {
  return {
    id: uuidv4(),
    notificationId,
    cornerRadius: 8,
    cardHeight: 'normal',
    density: 'normal',
    defaultFitMode: 'cover',
    showTitleOnFront: true,
    showTypeOnFront: true,
    showPriorityOnFront: true,
    showTimestampOnFront: true,
    showSourceOnFront: true,
    frontFieldOrder: ['title', 'type', 'priority', 'timestamp', 'source'],
    cardFrontTemplate: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Check if notification is expired
 */
export function isNotificationExpired(notification: Notification): boolean {
  if (!notification.expiresAt) return false;
  return new Date() > notification.expiresAt;
}

/**
 * Check if notification should be shown during quiet hours
 */
export function shouldShowDuringQuietHours(
  notification: Notification,
  quietHoursStart: string,
  quietHoursEnd: string,
  timezone: string
): boolean {
  if (!notification.priority || notification.priority === 'low') return false;
  return notification.priority === 'critical' || notification.priority === 'high';
}

/**
 * Calculate notification group statistics
 */
export function calculateNotificationGroupStatistics(group: NotificationGroup): {
  total: number;
  unread: number;
  read: number;
} {
  return {
    total: group.totalNotifications,
    unread: group.unreadNotifications,
    read: group.readNotifications,
  };
}