/**
 * Module 13: Integrations & Help Data Models
 * 
 * This module handles settings, integrations, help documentation, and
 * user assistance across all domains.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// 13.1 Core Integration Types & Categories
// ============================================================================

/**
 * Integration Type - The type of integration
 */
export type IntegrationType = 'api' | 'oauth' | 'webhook' | 'sdk' | 'plugin' | 'extension' | 'connector' | 'bridge';

/**
 * Integration Status - Status of an integration
 */
export type IntegrationStatus = 'not-configured' | 'configured' | 'connected' | 'disconnected' | 'error' | 'disabled';

/**
 * Integration Category - Category of integration
 */
export type IntegrationCategory = 'communication' | 'storage' | 'productivity' | 'development' | 'analytics' | 'marketing' | 'crm' | 'project-management' | 'file-storage' | 'social-media' | 'payment' | 'authentication';

/**
 * Help Article Type - Type of help article
 */
export type HelpArticleType = 'tutorial' | 'guide' | 'reference' | 'faq' | 'troubleshooting' | 'best-practice' | 'release-notes' | 'api-docs';

// ============================================================================
// 13.2 Integration Management
// ============================================================================

/**
 * Integration - An external integration
 */
export interface Integration {
  id: string;
  userId: string;
  
  // Core Identity
  name: string;
  description?: string;
  type: IntegrationType;
  category: IntegrationCategory;
  status: IntegrationStatus;
  
  // Provider Details
  providerName: string;
  providerWebsite?: string;
  providerLogoUrl?: string;
  
  // Configuration
  configuration: Record<string, any>;
  credentials: Record<string, any>;
  webhookUrl?: string;
  apiKey?: string;
  apiSecret?: string;
  oauthToken?: string;
  oauthRefreshToken?: string;
  oauthExpiresAt?: Date;
  
  // Connection Details
  connectedAt?: Date;
  disconnectedAt?: Date;
  lastSyncAt?: Date;
  nextSyncAt?: Date;
  
  // Sync Configuration
  syncEnabled: boolean;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual';
  syncDirection: 'inbound' | 'outbound' | 'bidirectional';
  
  // Capabilities
  capabilities: string[];
  supportedOperations: string[];
  
  // Limits
  rateLimit?: number;
  rateLimitPeriod?: number; // in seconds
  usageCount: number;
  usageLimit?: number;
  
  // Error Handling
  lastError?: string;
  lastErrorAt?: Date;
  errorCount: number;
  autoRetry: boolean;
  retryCount: number;
  maxRetries: number;
  
  // Card Identity
  cardImageIds: string[];
  photostripLayoutId?: string;
  cardIdentityConfigurationId?: string;
  
  // Cross-domain links
  linkedProjectIds: string[];
  linkedCampaignIds: string[];
  linkedWorkspaceItemIds: string[];
  linkedFileIds: string[];
  
  // Metadata
  tags: string[];
  labels: string[];
  
  // Settings
  isEnabled: boolean;
  isVisible: boolean;
  isShared: boolean;
  sharedWith: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastAccessed: Date;
}

// ============================================================================
// 13.3 Integration Connection Management
// ============================================================================

/**
 * Integration Connection - A connection between Oscar and an external service
 */
export interface IntegrationConnection {
  id: string;
  userId: string;
  integrationId: string;
  
  // Connection Details
  connectionName: string;
  connectionType: 'api' | 'oauth' | 'webhook' | 'sdk';
  connectionStatus: 'active' | 'inactive' | 'error' | 'pending';
  
  // Authentication
  authMethod: 'api-key' | 'oauth2' | 'basic' | 'bearer' | 'custom';
  authCredentials: Record<string, any>;
  authExpiresAt?: Date;
  
  // Endpoints
  baseUrl?: string;
  apiVersion?: string;
  endpoints: Record<string, string>;
  
  // Webhook Configuration
  webhookUrl?: string;
  webhookSecret?: string;
  webhookVerified: boolean;
  webhookVerifiedAt?: Date;
  
  // Rate Limiting
  rateLimitRemaining?: number;
  rateLimitResetAt?: Date;
  
  // Usage
  requestCount: number;
  lastRequestAt?: Date;
  lastResponseAt?: Date;
  
  // Error Tracking
  errorCount: number;
  lastError?: string;
  lastErrorAt?: Date;
  
  // Sync State
  lastSyncAt?: Date;
  syncInProgress: boolean;
  syncProgress: number; // 0-100
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 13.4 Integration Sync Job Management
// ============================================================================

/**
 * Integration Sync Job - A sync job for an integration
 */
export interface IntegrationSyncJob {
  id: string;
  userId: string;
  integrationId: string;
  connectionId: string;
  
  // Job Details
  jobType: 'full-sync' | 'incremental' | 'webhook' | 'manual' | 'scheduled';
  direction: 'import' | 'export' | 'bidirectional';
  
  // Status
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  failedAt?: Date;
  
  // Progress
  progress: number; // 0-100
  totalItems: number;
  processedItems: number;
  failedItems: number;
  
  // Data
  dataType: string;
  dataCount: number;
  dataSize?: number; // in bytes
  
  // Error Handling
  errorMessage?: string;
  errorDetails?: any;
  retryCount: number;
  maxRetries: number;
  
  // Results
  results: Record<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 13.5 Help & Documentation Management
// ============================================================================

/**
 * Help Article - A help article or documentation page
 */
export interface HelpArticle {
  id: string;
  
  // Core Identity
  title: string;
  subtitle?: string;
  type: HelpArticleType;
  category: string;
  subcategory?: string;
  
  // Content
  content: string;
  excerpt?: string;
  keywords: string[];
  
  // Metadata
  author?: string;
  authorId?: string;
  version: string;
  language: string;
  
  // Related Content
  relatedArticleIds: string[];
  relatedIntegrationIds: string[];
  relatedModuleIds: string[];
  
  // Usage
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  lastViewedAt?: Date;
  
  // Status
  isPublished: boolean;
  publishedAt?: Date;
  isFeatured: boolean;
  isArchived: boolean;
  
  // SEO
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  
  // Card Identity
  cardImageIds: string[];
  photostripLayoutId?: string;
  cardIdentityConfigurationId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Help Category - A category for help articles
 */
export interface HelpCategory {
  id: string;
  
  // Core Identity
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  
  // Structure
  parentCategoryId?: string;
  subcategoryIds: string[];
  articleIds: string[];
  
  // Ordering
  order: number;
  isVisible: boolean;
  
  // Metadata
  tags: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 13.6 User Assistance & Onboarding
// ============================================================================

/**
 * User Assistance Session - A user assistance session
 */
export interface UserAssistanceSession {
  id: string;
  userId: string;
  
  // Session Details
  sessionType: 'onboarding' | 'tutorial' | 'guided-tour' | 'help-request' | 'support-chat';
  status: 'active' | 'completed' | 'cancelled' | 'paused';
  
  // Content
  currentStep: number;
  totalSteps: number;
  steps: UserAssistanceStep[];
  
  // Context
  contextModule?: string;
  contextFeature?: string;
  contextData?: any;
  
  // Progress
  progress: number; // 0-100
  completedSteps: number[];
  
  // Timing
  startedAt: Date;
  completedAt?: Date;
  lastActivityAt: Date;
  duration?: number; // in seconds
  
  // Feedback
  feedbackRating?: number; // 1-5
  feedbackComment?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Assistance Step - A step in a user assistance session
 */
export interface UserAssistanceStep {
  id: string;
  sessionId: string;
  
  // Step Details
  stepNumber: number;
  title: string;
  description?: string;
  instructions: string;
  
  // Interaction
  interactionType: 'info' | 'click' | 'type' | 'select' | 'drag' | 'complete';
  interactionTarget?: string;
  interactionData?: any;
  
  // Completion
  isCompleted: boolean;
  completedAt?: Date;
  completionData?: any;
  
  // Help
  helpText?: string;
  helpArticleId?: string;
  helpVideoUrl?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 13.7 Settings Management
// ============================================================================

/**
 * User Settings - User-specific settings
 */
export interface UserSettings {
  id: string;
  userId: string;
  
  // Appearance
  theme: 'light' | 'dark' | 'auto';
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  density: 'compact' | 'normal' | 'comfortable';
  
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  desktopNotifications: boolean;
  notificationSound: boolean;
  
  // Privacy
  dataCollection: boolean;
  analytics: boolean;
  telemetry: boolean;
  
  // Language & Region
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  
  // Accessibility
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  
  // Performance
  cacheEnabled: boolean;
  cacheSize: number; // in MB
  autoRefresh: boolean;
  refreshInterval: number; // in minutes
  
  // Backup
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupLocation: 'local' | 'cloud' | 'both';
  
  // Advanced
  developerMode: boolean;
  experimentalFeatures: boolean;
  debugLogging: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Module Settings - Module-specific settings
 */
export interface ModuleSettings {
  id: string;
  userId: string;
  moduleId: string;
  
  // Module Configuration
  isEnabled: boolean;
  isVisible: boolean;
  position: number;
  
  // Permissions
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canShare: boolean;
  canExport: boolean;
  
  // Defaults
  defaultView: string;
  defaultSort: string;
  defaultFilter: string;
  
  // Limits
  itemLimit?: number;
  storageLimit?: number; // in MB
  bandwidthLimit?: number; // in MB
  
  // Custom Configuration
  configuration: Record<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 13.8 Card Identity System (Shared with other domains)
// ============================================================================

/**
 * Integration Card Image - Image for integration card front/back
 */
export interface IntegrationCardImage {
  id: string;
  integrationId: string;
  
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
 * Integration Photostrip Layout - Layout configuration for multiple images
 */
export interface IntegrationPhotostripLayout {
  id: string;
  integrationId: string;
  
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
 * Integration Card Identity Configuration - How the integration card appears
 */
export interface IntegrationCardIdentityConfiguration {
  id: string;
  integrationId: string;
  
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
  showProviderOnFront: boolean;
  showTagsOnFront: boolean;
  
  // Field Ordering
  frontFieldOrder: string[]; // e.g., ['name', 'type', 'status', 'provider', 'tags']
  
  // Template
  cardFrontTemplate?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 13.9 Helper Functions
// ============================================================================

/**
 * Create a new integration
 */
export function createIntegration(
  userId: string,
  name: string,
  type: IntegrationType,
  category: IntegrationCategory,
  providerName: string
): Integration {
  return {
    id: uuidv4(),
    userId,
    name,
    description: undefined,
    type,
    category,
    status: 'not-configured',
    providerName,
    providerWebsite: undefined,
    providerLogoUrl: undefined,
    configuration: {},
    credentials: {},
    syncEnabled: false,
    syncFrequency: 'manual',
    syncDirection: 'inbound',
    capabilities: [],
    supportedOperations: [],
    usageCount: 0,
    errorCount: 0,
    autoRetry: true,
    retryCount: 0,
    maxRetries: 3,
    cardImageIds: [],
    linkedProjectIds: [],
    linkedCampaignIds: [],
    linkedWorkspaceItemIds: [],
    linkedFileIds: [],
    tags: [],
    labels: [],
    isEnabled: true,
    isVisible: true,
    isShared: false,
    sharedWith: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastAccessed: new Date(),
  };
}

/**
 * Create a new integration connection
 */
export function createIntegrationConnection(
  userId: string,
  integrationId: string,
  connectionName: string,
  connectionType: 'api' | 'oauth' | 'webhook' | 'sdk'
): IntegrationConnection {
  return {
    id: uuidv4(),
    userId,
    integrationId,
    connectionName,
    connectionType,
    connectionStatus: 'pending',
    authMethod: 'api-key',
    authCredentials: {},
    endpoints: {},
    webhookVerified: false,
    requestCount: 0,
    errorCount: 0,
    syncInProgress: false,
    syncProgress: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create a new help article
 */
export function createHelpArticle(
  title: string,
  type: HelpArticleType,
  category: string,
  content: string
): HelpArticle {
  return {
    id: uuidv4(),
    title,
    subtitle: undefined,
    type,
    category,
    subcategory: undefined,
    content,
    excerpt: undefined,
    keywords: [],
    author: undefined,
    authorId: undefined,
    version: '1.0.0',
    language: 'en',
    relatedArticleIds: [],
    relatedIntegrationIds: [],
    relatedModuleIds: [],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0,
    isPublished: true,
    publishedAt: new Date(),
    isFeatured: false,
    isArchived: false,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    cardImageIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create a new user assistance session
 */
export function createUserAssistanceSession(
  userId: string,
  sessionType: 'onboarding' | 'tutorial' | 'guided-tour' | 'help-request' | 'support-chat'
): UserAssistanceSession {
  return {
    id: uuidv4(),
    userId,
    sessionType,
    status: 'active',
    currentStep: 1,
    totalSteps: 1,
    steps: [],
    progress: 0,
    completedSteps: [],
    startedAt: new Date(),
    lastActivityAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create default user settings
 */
export function createDefaultUserSettings(userId: string): UserSettings {
  return {
    id: uuidv4(),
    userId,
    theme: 'auto',
    accentColor: '#3b82f6',
    fontSize: 'medium',
    density: 'normal',
    emailNotifications: true,
    pushNotifications: true,
    desktopNotifications: true,
    notificationSound: true,
    dataCollection: true,
    analytics: true,
    telemetry: false,
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    cacheEnabled: true,
    cacheSize: 100,
    autoRefresh: true,
    refreshInterval: 5,
    autoBackup: true,
    backupFrequency: 'weekly',
    backupLocation: 'local',
    developerMode: false,
    experimentalFeatures: false,
    debugLogging: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create default module settings
 */
export function createDefaultModuleSettings(
  userId: string,
  moduleId: string
): ModuleSettings {
  return {
    id: uuidv4(),
    userId,
    moduleId,
    isEnabled: true,
    isVisible: true,
    position: 0,
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
    canShare: true,
    canExport: true,
    defaultView: 'list',
    defaultSort: 'created-desc',
    defaultFilter: 'all',
    configuration: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Get integration status color
 */
export function getIntegrationStatusColor(status: IntegrationStatus): string {
  const colors: Record<IntegrationStatus, string> = {
    'not-configured': '#6b7280',
    'configured': '#3b82f6',
    'connected': '#10b981',
    'disconnected': '#ef4444',
    'error': '#dc2626',
    'disabled': '#9ca3af',
  };
  return colors[status] || '#6b7280';
}

/**
 * Get integration type icon
 */
export function getIntegrationTypeIcon(type: IntegrationType): string {
  const icons: Record<IntegrationType, string> = {
    'api': '🔌',
    'oauth': '🔑',
    'webhook': '🪝',
    'sdk': '📦',
    'plugin': '🧩',
    'extension': '🔧',
    'connector': '🔗',
    'bridge': '🌉',
  };
  return icons[type] || '🔌';
}

/**
 * Get help article type icon
 */
export function getHelpArticleTypeIcon(type: HelpArticleType): string {
  const icons: Record<HelpArticleType, string> = {
    'tutorial': '🎓',
    'guide': '📖',
    'reference': '📚',
    'faq': '❓',
    'troubleshooting': '🔧',
    'best-practice': '⭐',
    'release-notes': '📝',
    'api-docs': '📄',
  };
  return icons[type] || '📄';
}

/**
 * Create integration card image
 */
export function createIntegrationCardImage(
  integrationId: string,
  url: string
): IntegrationCardImage {
  return {
    id: uuidv4(),
    integrationId,
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
 * Create integration photostrip layout
 */
export function createIntegrationPhotostripLayout(
  integrationId: string
): IntegrationPhotostripLayout {
  return {
    id: uuidv4(),
    integrationId,
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
 * Create integration card identity configuration
 */
export function createIntegrationCardIdentityConfiguration(
  integrationId: string
): IntegrationCardIdentityConfiguration {
  return {
    id: uuidv4(),
    integrationId,
    cornerRadius: 8,
    cardHeight: 'normal',
    density: 'normal',
    defaultFitMode: 'cover',
    showNameOnFront: true,
    showTypeOnFront: true,
    showStatusOnFront: true,
    showProviderOnFront: true,
    showTagsOnFront: false,
    frontFieldOrder: ['name', 'type', 'status', 'provider'],
    cardFrontTemplate: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
