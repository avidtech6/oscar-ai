/**
 * Module 2: Navigation Data Models
 * 
 * Defines the core data structures for the navigation system including:
 * - Navigation structure (sidebar, bottom bar)
 * - Domain switching logic
 * - Recent items tracking
 * - Navigation state persistence
 * - Device-specific navigation rules
 */

export interface NavigationItem {
  id: string;
  domainId: string; // Reference to DomainDefinition.id
  label: string;
  icon: string;
  route: string;
  order: number;
  enabled: boolean;
  
  // Navigation context
  parentId?: string; // For nested items (e.g., Workspace → Projects)
  isExpandable: boolean;
  expanded: boolean;
  
  // Device visibility
  visibleOnDesktop: boolean;
  visibleOnTabletLandscape: boolean;
  visibleOnTabletPortrait: boolean;
  visibleOnMobile: boolean;
  
  // Navigation behavior
  opensInNewTab: boolean;
  requiresAuthentication: boolean;
  permissionLevel: 'none' | 'view' | 'edit' | 'admin';
  
  // Metadata
  badgeCount?: number;
  badgeType?: 'number' | 'dot' | 'text';
  tooltip?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface NavigationState {
  id: string;
  userId?: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  orientation: 'landscape' | 'portrait';
  
  // Current navigation state
  currentDomainId: string;
  currentRoute: string;
  sidebarCollapsed: boolean;
  rightPanelOpen: boolean;
  rightPanelWidth: number; // pixels or percentage
  askOscarBarVisible: boolean;
  
  // Scroll positions per domain
  scrollPositions: Record<string, number>; // domainId -> scroll position
  
  // Navigation history
  navigationHistory: Array<{
    timestamp: Date;
    fromDomainId: string;
    fromRoute: string;
    toDomainId: string;
    toRoute: string;
    navigationType: 'click' | 'back' | 'forward' | 'direct'
  }>;
  
  // Session data
  sessionStartTime: Date;
  lastActivityTime: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface RecentItem {
  id: string;
  userId?: string;
  
  // Item reference
  itemId: string;
  itemType: 'project' | 'note' | 'report' | 'file' | 'thread' | 'document' | 'task' | 'campaign' | 'email';
  itemTitle: string;
  itemSubtitle?: string;
  itemIcon?: string;
  itemRoute: string;
  
  // Interaction data
  lastInteractionTime: Date;
  interactionType: 'view' | 'edit' | 'create' | 'share' | 'comment';
  interactionCount: number;
  
  // Context
  domainId: string; // Which domain this item belongs to
  projectId?: string; // Optional project context
  
  // Display preferences
  displayOrder: number; // Lower = more recent
  pinned: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface BottomBarItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  order: number;
  enabled: boolean;
  
  // Device visibility
  visibleOnTabletPortrait: boolean;
  visibleOnMobile: boolean;
  
  // Behavior
  opensAskOscar: boolean; // If true, clicking opens Ask Oscar instead of navigating
  showsNotificationBadge: boolean;
  
  // Visual properties
  iconSize: number;
  activeColor: string;
  inactiveColor: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface DomainScrollPosition {
  id: string;
  userId?: string;
  domainId: string;
  route: string;
  scrollPosition: number; // pixels
  viewportHeight: number;
  contentHeight: number;
  timestamp: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface NavigationPreference {
  id: string;
  userId?: string;
  
  // Sidebar preferences
  sidebarDefaultCollapsed: boolean;
  sidebarWidth: number;
  sidebarMiniWidth: number;
  sidebarAnimationEnabled: boolean;
  
  // Bottom bar preferences
  bottomBarAlwaysVisible: boolean;
  bottomBarHeight: number;
  bottomBarHideOnScroll: boolean;
  
  // Navigation preferences
  enableSmoothScrolling: boolean;
  enableScrollRestoration: boolean;
  enableNavigationAnimations: boolean;
  navigationAnimationSpeed: 'fast' | 'normal' | 'slow';
  
  // Recent items preferences
  recentItemsCount: number; // 3-4 as per spec
  recentItemsMaxAge: number; // days
  showPinnedItemsFirst: boolean;
  
  // Ask Oscar bar preferences
  askOscarBarAutoFocus: boolean;
  askOscarBarShowTooltip: boolean;
  askOscarBarTooltipDelay: number; // milliseconds
  
  createdAt: Date;
  updatedAt: Date;
}

export interface NavigationEvent {
  id: string;
  userId?: string;
  
  // Event details
  eventType: 'navigation' | 'domain_switch' | 'sidebar_toggle' | 'right_panel_toggle' | 'recent_item_click' | 'bottom_bar_click';
  timestamp: Date;
  
  // Source context
  sourceDomainId?: string;
  sourceRoute?: string;
  sourceElement?: string;
  
  // Target context
  targetDomainId?: string;
  targetRoute?: string;
  targetElement?: string;
  
  // Device context
  deviceType: 'desktop' | 'tablet' | 'mobile';
  orientation: 'landscape' | 'portrait';
  viewportWidth: number;
  viewportHeight: number;
  
  // Performance metrics
  loadTime?: number; // milliseconds
  renderTime?: number;
  navigationDelay?: number;
  
  // Error tracking
  error?: string;
  errorStack?: string;
  
  createdAt: Date;
}

// Default navigation items based on Module 2 specification
export const defaultNavigationItems: NavigationItem[] = [
  // Home
  {
    id: 'nav-home',
    domainId: 'home',
    label: 'Home',
    icon: 'home',
    route: '/',
    order: 1,
    enabled: true,
    isExpandable: false,
    expanded: false,
    visibleOnDesktop: true,
    visibleOnTabletLandscape: true,
    visibleOnTabletPortrait: true,
    visibleOnMobile: true,
    opensInNewTab: false,
    requiresAuthentication: false,
    permissionLevel: 'view',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Workspace (with nested items)
  {
    id: 'nav-workspace',
    domainId: 'workspace',
    label: 'Workspace',
    icon: 'workspace',
    route: '/workspace',
    order: 2,
    enabled: true,
    isExpandable: true,
    expanded: false,
    visibleOnDesktop: true,
    visibleOnTabletLandscape: true,
    visibleOnTabletPortrait: true,
    visibleOnMobile: true,
    opensInNewTab: false,
    requiresAuthentication: true,
    permissionLevel: 'view',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'nav-workspace-projects',
    domainId: 'workspace',
    label: 'Projects',
    icon: 'folder',
    route: '/workspace/projects',
    order: 2.1,
    enabled: true,
    parentId: 'nav-workspace',
    isExpandable: false,
    expanded: false,
    visibleOnDesktop: true,
    visibleOnTabletLandscape: true,
    visibleOnTabletPortrait: false,
    visibleOnMobile: false,
    opensInNewTab: false,
    requiresAuthentication: true,
    permissionLevel: 'view',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'nav-workspace-tasks',
    domainId: 'workspace',
    label: 'Tasks',
    icon: 'check-circle',
    route: '/workspace/tasks',
    order: 2.2,
    enabled: true,
    parentId: 'nav-workspace',
    isExpandable: false,
    expanded: false,
    visibleOnDesktop: true,
    visibleOnTabletLandscape: true,
    visibleOnTabletPortrait: false,
    visibleOnMobile: false,
    opensInNewTab: false,
    requiresAuthentication: true,
    permissionLevel: 'view',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'nav-workspace-notes',
    domainId: 'workspace',
    label: 'Notes',
    icon: 'file-text',
    route: '/workspace/notes',
    order: 2.3,
    enabled: true,
    parentId: 'nav-workspace',
    isExpandable: false,
    expanded: false,
    visibleOnDesktop: true,
    visibleOnTabletLandscape: true,
    visibleOnTabletPortrait: false,
    visibleOnMobile: false,
    opensInNewTab: false,
    requiresAuthentication: true,
    permissionLevel: 'view',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'nav-workspace-reports',
    domainId: 'workspace',
    label: 'Reports',
    icon: 'bar-chart',
    route: '/workspace/reports',
    order: 2.4,
    enabled: true,
    parentId: 'nav-workspace',
    isExpandable: false,
    expanded: false,
    visibleOnDesktop: true,
    visibleOnTabletLandscape: true,
    visibleOnTabletPortrait: false,
    visibleOnMobile: false,
    opensInNewTab: false,
    requiresAuthentication: true,
    permissionLevel: 'view',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'nav-workspace-calendar',
    domainId: 'workspace',
    label: 'Calendar',
    icon: 'calendar',
    route: '/workspace/calendar',
    order: 2.5,
    enabled: true,
    parentId: 'nav-workspace',
    isExpandable: false,
    expanded: false,
    visibleOnDesktop: true,
    visibleOnTabletLandscape: true,
    visibleOnTabletPortrait: false,
    visibleOnMobile: false,
    opensInNewTab: false,
    requiresAuthentication: true,
    permissionLevel: 'view',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Files
  {
    id: 'nav-files',
    domainId: 'files',
    label: 'Files',
    icon: 'files',
    route: '/files',
    order: 3,
    enabled: true,
    isExpandable: false,
    expanded: false,
    visibleOnDesktop: true,
    visibleOnTabletLandscape: true,
    visibleOnTabletPortrait: true,
    visibleOnMobile: true,
    opensInNewTab: false,
    requiresAuthentication: true,
    permissionLevel: 'view',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Connect
  {
    id: 'nav-connect',
    domainId: 'connect',
    label: 'Connect',
    icon: 'connect',
    route: '/connect',
    order: 4,
    enabled: true,
    isExpandable: false,
    expanded: false,
    visibleOnDesktop: true,
    visibleOnTabletLandscape: true,
    visibleOnTabletPortrait: true,
    visibleOnMobile: true,
    opensInNewTab: false,
    requiresAuthentication: true,
    permissionLevel: 'view',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Map
  {
    id: 'nav-map',
    domainId: 'map',
    label: 'Map',
    icon: 'map',
    route: '/map',
    order: 5,
    enabled: true,
    isExpandable: false,
    expanded: false,
    visibleOnDesktop: true,
    visibleOnTabletLandscape: true,
    visibleOnTabletPortrait: true,
    visibleOnMobile: true,
    opensInNewTab: false,
    requiresAuthentication: true,
    permissionLevel: 'view',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Dashboard (with nested items)
  {
    id: 'nav-dashboard',
    domainId: 'dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    route: '/dashboard',
    order: 6,
    enabled: true,
    isExpandable: true,
    expanded: false,
    visibleOnDesktop: true,
    visibleOnTabletLandscape: true,
    visibleOnTabletPortrait: true,
    visibleOnMobile: true,
    opensInNewTab: false,
    requiresAuthentication: true,
    permissionLevel: 'view',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'nav-dashboard-settings',
    domainId: 'dashboard',
    label: 'Settings',
    icon: 'settings',
    route: '/dashboard/settings',
    order: 6.1,
    enabled: true,
    parentId: 'nav-dashboard',
    isExpandable: false,
    expanded: false,
    visibleOnDesktop: true,
    visibleOnTabletLandscape: true,
    visibleOnTabletPortrait: false,
    visibleOnMobile: false,
    opensInNewTab: false,
    requiresAuthentication: true,
    permissionLevel: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'nav-dashboard-support',
    domainId: 'dashboard',
    label: 'Support',
    icon: 'help-circle',
    route: '/dashboard/support',
    order: 6.2,
    enabled: true,
    parentId: 'nav-dashboard',
    isExpandable: false,
    expanded: false,
    visibleOnDesktop: true,
    visibleOnTabletLandscape: true,
    visibleOnTabletPortrait: false,
    visibleOnMobile: false,
    opensInNewTab: false,
    requiresAuthentication: true,
    permissionLevel: 'view',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'nav-dashboard-documents',
    domainId: 'dashboard',
    label: 'Documents',
    icon: 'book',
    route: '/dashboard/documents',
    order: 6.3,
    enabled: true,
    parentId: 'nav-dashboard',
    isExpandable: false,
    expanded: false,
    visibleOnDesktop: true,
    visibleOnTabletLandscape: true,
    visibleOnTabletPortrait: false,
    visibleOnMobile: false,
    opensInNewTab: false,
    requiresAuthentication: true,
    permissionLevel: 'view',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Recent (dynamic 3-4 items)
  {
    id: 'nav-recent',
    domainId: 'recent',
    label: 'Recent',
    icon: 'clock',
    route: '/recent',
    order: 7,
    enabled: true,
    isExpandable: false,
    expanded: false,
    visibleOnDesktop: true,
    visibleOnTabletLandscape: true,
    visibleOnTabletPortrait: false,
    visibleOnMobile: false,
    opensInNewTab: false,
    requiresAuthentication: true,
    permissionLevel: 'view',
    badgeType: 'dot',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Default bottom bar items for mobile/tablet portrait
export const defaultBottomBarItems: BottomBarItem[] = [
  {
    id: 'bottom-home',
    label: 'Home',
    icon: 'home',
    route: '/',
    order: 1,
    enabled: true,
    visibleOnTabletPortrait: true,
    visibleOnMobile: true,
    opensAskOscar: false,
    showsNotificationBadge: false,
    iconSize: 24,
    activeColor: '#007AFF',
    inactiveColor: '#8E8E93',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'bottom-camera',
    label: 'Camera',
    icon: 'camera',
    route: '/capture/camera',
    order: 2,
    enabled: true,
    visibleOnTabletPortrait: true,
    visibleOnMobile: true,
    opensAskOscar: false,
    showsNotificationBadge: false,
    iconSize: 24,
    activeColor: '#007AFF',
    inactiveColor: '#8E8E93',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'bottom-voice',
    label: 'Voice',
    icon: 'mic',
    route: '/capture/voice',
    order: 3,
    enabled: true,
    visibleOnTabletPortrait: true,
    visibleOnMobile: true,
    opensAskOscar: false,
    showsNotificationBadge: false,
    iconSize: 24,
    activeColor: '#007AFF',
    inactiveColor: '#8E8E93',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'bottom-notifications',
    label: 'Notifications',
    icon: 'bell',
    route: '/notifications',
    order: 4,
    enabled: true,
    visibleOnTabletPortrait: true,
    visibleOnMobile: true,
    opensAskOscar: false,
    showsNotificationBadge: true,
    iconSize: 24,
    activeColor: '#007AFF',
    inactiveColor: '#8E8E93',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'bottom-ask-oscar',
    label: 'Ask Oscar',
    icon: 'message-square',
    route: '/ask-oscar',
    order: 5,
    enabled: true,
    visibleOnTabletPortrait: true,
    visibleOnMobile: true,
    opensAskOscar: true,
    showsNotificationBadge: false,
    iconSize: 24,
    activeColor: '#007AFF',
    inactiveColor: '#8E8E93',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Default navigation preferences
export const defaultNavigationPreferences: NavigationPreference = {
  id: 'default-navigation-prefs',
  sidebarDefaultCollapsed: false,
  sidebarWidth: 240,
  sidebarMiniWidth: 64,
  sidebarAnimationEnabled: true,
  bottomBarAlwaysVisible: true,
  bottomBarHeight: 56,
  bottomBarHideOnScroll: false,
  enableSmoothScrolling: true,
  enableScrollRestoration: true,
  enableNavigationAnimations: true,
  navigationAnimationSpeed: 'normal',
  recentItemsCount: 4,
  recentItemsMaxAge: 7,
  showPinnedItemsFirst: true,
  askOscarBarAutoFocus: false,
  askOscarBarShowTooltip: true,
  askOscarBarTooltipDelay: 1000,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Utility functions
export function getNavigationItemsForDevice(
  deviceType: 'desktop' | 'tablet' | 'mobile',
  orientation: 'landscape' | 'portrait'
): NavigationItem[] {
  const isDesktop = deviceType === 'desktop';
  const isTabletLandscape = deviceType === 'tablet' && orientation === 'landscape';
  const isTabletPortrait = deviceType === 'tablet' && orientation === 'portrait';
  const isMobile = deviceType === 'mobile';
  
  return defaultNavigationItems.filter(item => {
    if (isDesktop) return item.visibleOnDesktop;
    if (isTabletLandscape) return item.visibleOnTabletLandscape;
    if (isTabletPortrait) return item.visibleOnTabletPortrait;
    if (isMobile) return item.visibleOnMobile;
    return false;
  });
}

export function getBottomBarItemsForDevice(
  deviceType: 'desktop' | 'tablet' | 'mobile',
  orientation: 'landscape' | 'portrait'
): BottomBarItem[] {
  const isTabletPortrait = deviceType === 'tablet' && orientation === 'portrait';
  const isMobile = deviceType === 'mobile';
  
  if (!isTabletPortrait && !isMobile) {
    return []; // Bottom bar only for tablet portrait and mobile
  }
  
  return defaultBottomBarItems.filter(item => {
    if (isTabletPortrait) return item.visibleOnTabletPortrait;
    if (isMobile) return item.visibleOnMobile;
    return false;
  });
}

export function getRecentItemsDisplayCount(): number {
  return defaultNavigationPreferences.recentItemsCount;
}

export function shouldShowSidebar(
  deviceType: 'desktop' | 'tablet' | 'mobile',
  orientation: 'landscape' | 'portrait'
): boolean {
  const isDesktop = deviceType === 'desktop';
  const isTabletLandscape = deviceType === 'tablet' && orientation === 'landscape';
  
  return isDesktop || isTabletLandscape;
}

export function shouldShowBottomBar(
  deviceType: 'desktop' | 'tablet' | 'mobile',
  orientation: 'landscape' | 'portrait'
): boolean {
  const isTabletPortrait = deviceType === 'tablet' && orientation === 'portrait';
  const isMobile = deviceType === 'mobile';
  
  return isTabletPortrait || isMobile;
}
