/**
 * Module 12: Dashboard Data Models
 * 
 * This module handles widget persistence, layout management, and dashboard
 * configuration for visualising data across all domains.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// 12.1 Core Dashboard Types & Categories
// ============================================================================

/**
 * Dashboard Widget Type - The type of widget
 */
export type DashboardWidgetType = 'metric' | 'chart' | 'table' | 'list' | 'calendar' | 'timeline' | 'map' | 'gallery' | 'activity' | 'progress' | 'status' | 'summary' | 'custom';

/**
 * Dashboard Layout Type - How widgets are arranged
 */
export type DashboardLayoutType = 'grid' | 'freeform' | 'single-column' | 'two-column' | 'three-column' | 'masonry' | 'kanban';

/**
 * Dashboard Widget Size - Size of a widget
 */
export type DashboardWidgetSize = 'small' | 'medium' | 'large' | 'extra-large' | 'full-width';

/**
 * Dashboard Widget Refresh Rate - How often data refreshes
 */
export type DashboardWidgetRefreshRate = 'realtime' | 'minute' | '5-minutes' | '15-minutes' | 'hourly' | 'daily' | 'weekly' | 'manual';

// ============================================================================
// 12.2 Dashboard Structure & Configuration
// ============================================================================

/**
 * Dashboard - A dashboard container
 */
export interface Dashboard {
  id: string;
  userId: string;
  
  // Core Identity
  name: string;
  description?: string;
  layoutType: DashboardLayoutType;
  
  // Configuration
  isDefault: boolean;
  isShared: boolean;
  sharedWith: string[];
  isTemplate: boolean;
  templateId?: string;
  
  // Layout
  columns: number;
  rowHeight: number; // in pixels
  gap: number; // in pixels
  padding: number; // in pixels
  
  // Widgets
  widgetIds: string[];
  sectionIds: string[];
  
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
  
  // Metadata
  tags: string[];
  categories: string[];
  
  // Settings
  autoRefresh: boolean;
  refreshInterval: number; // in minutes
  showEmptyWidgets: boolean;
  showWidgetTitles: boolean;
  showWidgetControls: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastViewed: Date;
}

// ============================================================================
// 12.3 Dashboard Widget Management
// ============================================================================

/**
 * Dashboard Widget - A widget on a dashboard
 */
export interface DashboardWidget {
  id: string;
  dashboardId: string;
  userId: string;
  
  // Core Identity
  title: string;
  description?: string;
  type: DashboardWidgetType;
  size: DashboardWidgetSize;
  
  // Position & Layout
  column: number;
  row: number;
  width: number; // in grid units
  height: number; // in grid units
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  isResizable: boolean;
  isDraggable: boolean;
  isCollapsible: boolean;
  isCollapsed: boolean;
  
  // Data Source
  dataSourceType: 'static' | 'dynamic' | 'query' | 'api' | 'function';
  dataSourceConfig: Record<string, any>;
  dataQuery?: string;
  dataApiEndpoint?: string;
  dataFunctionName?: string;
  
  // Refresh
  refreshRate: DashboardWidgetRefreshRate;
  lastRefreshedAt?: Date;
  nextRefreshAt?: Date;
  autoRefresh: boolean;
  
  // Visual Configuration
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderRadius: number; // in pixels
  showHeader: boolean;
  showFooter: boolean;
  showControls: boolean;
  
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
  icon?: string;
  
  // State
  isVisible: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  
  // Data
  data: any;
  dataUpdatedAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastModifiedAt: Date;
}

// ============================================================================
// 12.4 Dashboard Section Management
// ============================================================================

/**
 * Dashboard Section - A section grouping widgets
 */
export interface DashboardSection {
  id: string;
  dashboardId: string;
  userId: string;
  
  // Core Identity
  title: string;
  description?: string;
  type: 'header' | 'group' | 'tab' | 'accordion' | 'carousel';
  
  // Widgets
  widgetIds: string[];
  subsectionIds: string[];
  
  // Configuration
  isCollapsed: boolean;
  isVisible: boolean;
  showTitle: boolean;
  showBorder: boolean;
  backgroundColor?: string;
  
  // Layout
  columns: number;
  gap: number;
  padding: number;
  
  // Metadata
  tags: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 12.5 Widget Template Management
// ============================================================================

/**
 * Dashboard Widget Template - A template for creating widgets
 */
export interface DashboardWidgetTemplate {
  id: string;
  userId: string;
  
  // Core Identity
  name: string;
  description?: string;
  type: DashboardWidgetType;
  category: string;
  
  // Configuration
  defaultSize: DashboardWidgetSize;
  defaultWidth: number;
  defaultHeight: number;
  defaultDataSourceConfig: Record<string, any>;
  defaultVisualConfig: Record<string, any>;
  
  // Preview
  previewImageUrl?: string;
  previewData?: any;
  
  // Usage
  usageCount: number;
  isPublic: boolean;
  isFeatured: boolean;
  
  // Metadata
  tags: string[];
  categories: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 12.6 Dashboard Layout Configuration
// ============================================================================

/**
 * Dashboard Layout Configuration - Configuration for dashboard layout
 */
export interface DashboardLayoutConfiguration {
  id: string;
  userId: string;
  dashboardId?: string;
  
  // Layout Settings
  layoutType: DashboardLayoutType;
  columns: number;
  rowHeight: number;
  gap: number;
  padding: number;
  
  // Responsive Settings
  breakpoints: Record<string, any>; // e.g., { 'mobile': { columns: 1 }, 'tablet': { columns: 2 } }
  
  // Widget Settings
  defaultWidgetWidth: number;
  defaultWidgetHeight: number;
  minWidgetWidth: number;
  minWidgetHeight: number;
  maxWidgetWidth: number;
  maxWidgetHeight: number;
  
  // Visual Settings
  backgroundColor?: string;
  backgroundImageUrl?: string;
  backgroundOpacity: number; // 0-1
  showGrid: boolean;
  gridColor?: string;
  gridOpacity: number; // 0-1
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 12.7 Dashboard Data Source Configuration
// ============================================================================

/**
 * Dashboard Data Source Configuration - Configuration for data sources
 */
export interface DashboardDataSourceConfiguration {
  id: string;
  userId: string;
  dashboardId: string;
  
  // Data Source Types
  enabledDataSourceTypes: string[];
  
  // API Configuration
  apiEndpoints: Record<string, string>;
  apiHeaders: Record<string, string>;
  apiAuthentication: Record<string, any>;
  
  // Database Configuration
  databaseConnections: Record<string, any>;
  
  // Query Configuration
  queryTemplates: Record<string, string>;
  
  // Cache Configuration
  cacheEnabled: boolean;
  cacheDuration: number; // in seconds
  cacheStrategy: 'memory' | 'local-storage' | 'indexed-db';
  
  // Rate Limiting
  rateLimitEnabled: boolean;
  rateLimitRequests: number;
  rateLimitPeriod: number; // in seconds
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 12.8 Card Identity System (Shared with other domains)
// ============================================================================

/**
 * Dashboard Card Image - Image for dashboard card front/back
 */
export interface DashboardCardImage {
  id: string;
  dashboardId: string;
  dashboardType: 'dashboard' | 'widget' | 'section';
  
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
 * Dashboard Photostrip Layout - Layout configuration for multiple images
 */
export interface DashboardPhotostripLayout {
  id: string;
  dashboardId: string;
  dashboardType: 'dashboard' | 'widget' | 'section';
  
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
 * Dashboard Card Identity Configuration - How the dashboard card appears
 */
export interface DashboardCardIdentityConfiguration {
  id: string;
  dashboardId: string;
  dashboardType: 'dashboard' | 'widget' | 'section';
  
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
  showDescriptionOnFront: boolean;
  showTagsOnFront: boolean;
  showStatsOnFront: boolean;
  
  // Field Ordering
  frontFieldOrder: string[]; // e.g., ['title', 'type', 'description', 'tags', 'stats']
  
  // Template
  cardFrontTemplate?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 12.9 Helper Functions
// ============================================================================

/**
 * Create a new dashboard
 */
export function createDashboard(
  userId: string,
  name: string
): Dashboard {
  return {
    id: uuidv4(),
    userId,
    name,
    description: undefined,
    layoutType: 'grid',
    isDefault: false,
    isShared: false,
    sharedWith: [],
    isTemplate: false,
    columns: 12,
    rowHeight: 100,
    gap: 16,
    padding: 16,
    widgetIds: [],
    sectionIds: [],
    cardImageIds: [],
    linkedProjectIds: [],
    linkedCampaignIds: [],
    linkedWorkspaceItemIds: [],
    linkedFileIds: [],
    linkedMapPinIds: [],
    linkedTimelineIds: [],
    tags: [],
    categories: [],
    autoRefresh: true,
    refreshInterval: 5,
    showEmptyWidgets: false,
    showWidgetTitles: true,
    showWidgetControls: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastViewed: new Date(),
  };
}

/**
 * Create a new dashboard widget
 */
export function createDashboardWidget(
  dashboardId: string,
  userId: string,
  title: string,
  type: DashboardWidgetType,
  size: DashboardWidgetSize
): DashboardWidget {
  const defaultSizes: Record<DashboardWidgetSize, { width: number, height: number }> = {
    'small': { width: 2, height: 2 },
    'medium': { width: 4, height: 3 },
    'large': { width: 6, height: 4 },
    'extra-large': { width: 8, height: 5 },
    'full-width': { width: 12, height: 4 },
  };
  
  const defaultSize = defaultSizes[size] || { width: 4, height: 3 };
  
  return {
    id: uuidv4(),
    dashboardId,
    userId,
    title,
    description: undefined,
    type,
    size,
    column: 0,
    row: 0,
    width: defaultSize.width,
    height: defaultSize.height,
    isResizable: true,
    isDraggable: true,
    isCollapsible: true,
    isCollapsed: false,
    dataSourceType: 'static',
    dataSourceConfig: {},
    refreshRate: '15-minutes',
    autoRefresh: true,
    borderRadius: 8,
    showHeader: true,
    showFooter: false,
    showControls: true,
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
    isVisible: true,
    isLoading: false,
    hasError: false,
    data: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastModifiedAt: new Date(),
  };
}

/**
 * Create a new dashboard section
 */
export function createDashboardSection(
  dashboardId: string,
  userId: string,
  title: string,
  type: 'header' | 'group' | 'tab' | 'accordion' | 'carousel'
): DashboardSection {
  return {
    id: uuidv4(),
    dashboardId,
    userId,
    title,
    description: undefined,
    type,
    widgetIds: [],
    subsectionIds: [],
    isCollapsed: false,
    isVisible: true,
    showTitle: true,
    showBorder: true,
    columns: type === 'header' ? 1 : 2,
    gap: 16,
    padding: 16,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create a new dashboard widget template
 */
export function createDashboardWidgetTemplate(
  userId: string,
  name: string,
  type: DashboardWidgetType,
  category: string
): DashboardWidgetTemplate {
  return {
    id: uuidv4(),
    userId,
    name,
    description: undefined,
    type,
    category,
    defaultSize: 'medium',
    defaultWidth: 4,
    defaultHeight: 3,
    defaultDataSourceConfig: {},
    defaultVisualConfig: {},
    usageCount: 0,
    isPublic: false,
    isFeatured: false,
    tags: [],
    categories: [category],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Get dashboard widget type icon
 */
export function getDashboardWidgetTypeIcon(type: DashboardWidgetType): string {
  const icons: Record<DashboardWidgetType, string> = {
    'metric': '📊',
    'chart': '📈',
    'table': '📋',
    'list': '📝',
    'calendar': '📅',
    'timeline': '⏳',
    'map': '🗺️',
    'gallery': '🖼️',
    'activity': '📱',
    'progress': '📈',
    'status': '✅',
    'summary': '📋',
    'custom': '🔧',
  };
  return icons[type] || '📊';
}

/**
 * Get dashboard widget size dimensions
 */
export function getDashboardWidgetSizeDimensions(size: DashboardWidgetSize): { width: number, height: number } {
  const dimensions: Record<DashboardWidgetSize, { width: number, height: number }> = {
    'small': { width: 2, height: 2 },
    'medium': { width: 4, height: 3 },
    'large': { width: 6, height: 4 },
    'extra-large': { width: 8, height: 5 },
    'full-width': { width: 12, height: 4 },
  };
  return dimensions[size] || { width: 4, height: 3 };
}

/**
 * Get dashboard layout type label
 */
export function getDashboardLayoutTypeLabel(layoutType: DashboardLayoutType): string {
  const labels: Record<DashboardLayoutType, string> = {
    'grid': 'Grid Layout',
    'freeform': 'Freeform Layout',
    'single-column': 'Single Column',
    'two-column': 'Two Columns',
    'three-column': 'Three Columns',
    'masonry': 'Masonry Layout',
    'kanban': 'Kanban Board',
  };
  return labels[layoutType] || 'Dashboard Layout';
}

/**
 * Get dashboard widget refresh rate label
 */
export function getDashboardWidgetRefreshRateLabel(refreshRate: DashboardWidgetRefreshRate): string {
  const labels: Record<DashboardWidgetRefreshRate, string> = {
    'realtime': 'Realtime',
    'minute': 'Every Minute',
    '5-minutes': 'Every 5 Minutes',
    '15-minutes': 'Every 15 Minutes',
    'hourly': 'Hourly',
    'daily': 'Daily',
    'weekly': 'Weekly',
    'manual': 'Manual',
  };
  return labels[refreshRate] || 'Manual';
}

/**
 * Create default dashboard layout configuration
 */
export function createDefaultDashboardLayoutConfiguration(
  userId: string,
  dashboardId?: string
): DashboardLayoutConfiguration {
  return {
    id: uuidv4(),
    userId,
    dashboardId,
    layoutType: 'grid',
    columns: 12,
    rowHeight: 100,
    gap: 16,
    padding: 16,
    breakpoints: {
      'mobile': { columns: 1, gap: 8, padding: 8 },
      'tablet': { columns: 6, gap: 12, padding: 12 },
      'desktop': { columns: 12, gap: 16, padding: 16 },
    },
    defaultWidgetWidth: 4,
    defaultWidgetHeight: 3,
    minWidgetWidth: 1,
    minWidgetHeight: 1,
    maxWidgetWidth: 12,
    maxWidgetHeight: 8,
    backgroundColor: '#ffffff',
    backgroundImageUrl: undefined,
    backgroundOpacity: 1,
    showGrid: false,
    gridColor: '#e5e7eb',
    gridOpacity: 0.3,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create default dashboard data source configuration
 */
export function createDefaultDashboardDataSourceConfiguration(
  userId: string,
  dashboardId: string
): DashboardDataSourceConfiguration {
  return {
    id: uuidv4(),
    userId,
    dashboardId,
    enabledDataSourceTypes: ['static', 'api', 'query'],
    apiEndpoints: {},
    apiHeaders: {},
    apiAuthentication: {},
    databaseConnections: {},
    queryTemplates: {},
    cacheEnabled: true,
    cacheDuration: 300, // 5 minutes
    cacheStrategy: 'memory',
    rateLimitEnabled: true,
    rateLimitRequests: 60,
    rateLimitPeriod: 60, // 1 minute
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create dashboard card image
 */
export function createDashboardCardImage(
  dashboardId: string,
  dashboardType: 'dashboard' | 'widget' | 'section',
  url: string
): DashboardCardImage {
  return {
    id: uuidv4(),
    dashboardId,
    dashboardType,
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
 * Create dashboard photostrip layout
 */
export function createDashboardPhotostripLayout(
  dashboardId: string,
  dashboardType: 'dashboard' | 'widget' | 'section'
): DashboardPhotostripLayout {
  return {
    id: uuidv4(),
    dashboardId,
    dashboardType,
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
 * Create dashboard card identity configuration
 */
export function createDashboardCardIdentityConfiguration(
  dashboardId: string,
  dashboardType: 'dashboard' | 'widget' | 'section'
): DashboardCardIdentityConfiguration {
  return {
    id: uuidv4(),
    dashboardId,
    dashboardType,
    cornerRadius: 8,
    cardHeight: 'normal',
    density: 'normal',
    defaultFitMode: 'cover',
    showTitleOnFront: true,
    showTypeOnFront: true,
    showDescriptionOnFront: false,
    showTagsOnFront: false,
    showStatsOnFront: true,
    frontFieldOrder: ['title', 'type', 'stats'],
    cardFrontTemplate: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}