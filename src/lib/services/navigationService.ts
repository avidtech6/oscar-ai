import { supabase } from '$lib/supabase/client';
import { HAS_VALID_SUPABASE } from '$lib/config/keys';
import type {
  NavigationItem,
  NavigationState,
  RecentItem,
  BottomBarItem,
  DomainScrollPosition,
  NavigationPreference,
  NavigationEvent
} from '$lib/models/Navigation';
import {
  defaultNavigationItems,
  defaultBottomBarItems,
  defaultNavigationPreferences,
  getNavigationItemsForDevice,
  getBottomBarItemsForDevice
} from '$lib/models/Navigation';

// Supabase interfaces for Module 2 tables
export interface SupabaseNavigationItem {
  id: string;
  domain_id: string;
  label: string;
  icon: string;
  route: string;
  order: number;
  enabled: boolean;
  parent_id?: string;
  is_expandable: boolean;
  expanded: boolean;
  visible_on_desktop: boolean;
  visible_on_tablet_landscape: boolean;
  visible_on_tablet_portrait: boolean;
  visible_on_mobile: boolean;
  opens_in_new_tab: boolean;
  requires_authentication: boolean;
  permission_level: 'none' | 'view' | 'edit' | 'admin';
  badge_count?: number;
  badge_type?: 'number' | 'dot' | 'text';
  tooltip?: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseNavigationState {
  id: string;
  user_id?: string;
  device_type: 'desktop' | 'tablet' | 'mobile';
  orientation: 'landscape' | 'portrait';
  current_domain_id: string;
  current_route: string;
  sidebar_collapsed: boolean;
  right_panel_open: boolean;
  right_panel_width: number;
  ask_oscar_bar_visible: boolean;
  scroll_positions: Record<string, number>;
  navigation_history: Array<{
    timestamp: string;
    from_domain_id: string;
    from_route: string;
    to_domain_id: string;
    to_route: string;
    navigation_type: 'click' | 'back' | 'forward' | 'direct'
  }>;
  session_start_time: string;
  last_activity_time: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseRecentItem {
  id: string;
  user_id?: string;
  item_id: string;
  item_type: 'project' | 'note' | 'report' | 'file' | 'thread' | 'document' | 'task' | 'campaign' | 'email';
  item_title: string;
  item_subtitle?: string;
  item_icon?: string;
  item_route: string;
  last_interaction_time: string;
  interaction_type: 'view' | 'edit' | 'create' | 'share' | 'comment';
  interaction_count: number;
  domain_id: string;
  project_id?: string;
  display_order: number;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupabaseBottomBarItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  order: number;
  enabled: boolean;
  visible_on_tablet_portrait: boolean;
  visible_on_mobile: boolean;
  opens_ask_oscar: boolean;
  shows_notification_badge: boolean;
  icon_size: number;
  active_color: string;
  inactive_color: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseDomainScrollPosition {
  id: string;
  user_id?: string;
  domain_id: string;
  route: string;
  scroll_position: number;
  viewport_height: number;
  content_height: number;
  timestamp: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseNavigationPreference {
  id: string;
  user_id?: string;
  sidebar_default_collapsed: boolean;
  sidebar_width: number;
  sidebar_mini_width: number;
  sidebar_animation_enabled: boolean;
  bottom_bar_always_visible: boolean;
  bottom_bar_height: number;
  bottom_bar_hide_on_scroll: boolean;
  enable_smooth_scrolling: boolean;
  enable_scroll_restoration: boolean;
  enable_navigation_animations: boolean;
  navigation_animation_speed: 'fast' | 'normal' | 'slow';
  recent_items_count: number;
  recent_items_max_age: number;
  show_pinned_items_first: boolean;
  ask_oscar_bar_auto_focus: boolean;
  ask_oscar_bar_show_tooltip: boolean;
  ask_oscar_bar_tooltip_delay: number;
  created_at: string;
  updated_at: string;
}

export interface SupabaseNavigationEvent {
  id: string;
  user_id?: string;
  event_type: 'navigation' | 'domain_switch' | 'sidebar_toggle' | 'right_panel_toggle' | 'recent_item_click' | 'bottom_bar_click';
  timestamp: string;
  source_domain_id?: string;
  source_route?: string;
  source_element?: string;
  target_domain_id?: string;
  target_route?: string;
  target_element?: string;
  device_type: 'desktop' | 'tablet' | 'mobile';
  orientation: 'landscape' | 'portrait';
  viewport_width: number;
  viewport_height: number;
  load_time?: number;
  render_time?: number;
  navigation_delay?: number;
  error?: string;
  error_stack?: string;
  created_at: string;
}

// Mapping functions
function mapSupabaseNavigationItemToNavigationItem(supabaseItem: SupabaseNavigationItem): NavigationItem {
  return {
    id: supabaseItem.id,
    domainId: supabaseItem.domain_id,
    label: supabaseItem.label,
    icon: supabaseItem.icon,
    route: supabaseItem.route,
    order: supabaseItem.order,
    enabled: supabaseItem.enabled,
    parentId: supabaseItem.parent_id,
    isExpandable: supabaseItem.is_expandable,
    expanded: supabaseItem.expanded,
    visibleOnDesktop: supabaseItem.visible_on_desktop,
    visibleOnTabletLandscape: supabaseItem.visible_on_tablet_landscape,
    visibleOnTabletPortrait: supabaseItem.visible_on_tablet_portrait,
    visibleOnMobile: supabaseItem.visible_on_mobile,
    opensInNewTab: supabaseItem.opens_in_new_tab,
    requiresAuthentication: supabaseItem.requires_authentication,
    permissionLevel: supabaseItem.permission_level,
    badgeCount: supabaseItem.badge_count,
    badgeType: supabaseItem.badge_type,
    tooltip: supabaseItem.tooltip,
    createdAt: new Date(supabaseItem.created_at),
    updatedAt: new Date(supabaseItem.updated_at)
  };
}

function mapSupabaseNavigationStateToNavigationState(supabaseState: SupabaseNavigationState): NavigationState {
  return {
    id: supabaseState.id,
    userId: supabaseState.user_id,
    deviceType: supabaseState.device_type,
    orientation: supabaseState.orientation,
    currentDomainId: supabaseState.current_domain_id,
    currentRoute: supabaseState.current_route,
    sidebarCollapsed: supabaseState.sidebar_collapsed,
    rightPanelOpen: supabaseState.right_panel_open,
    rightPanelWidth: supabaseState.right_panel_width,
    askOscarBarVisible: supabaseState.ask_oscar_bar_visible,
    scrollPositions: supabaseState.scroll_positions,
    navigationHistory: supabaseState.navigation_history.map(history => ({
      timestamp: new Date(history.timestamp),
      fromDomainId: history.from_domain_id,
      fromRoute: history.from_route,
      toDomainId: history.to_domain_id,
      toRoute: history.to_route,
      navigationType: history.navigation_type
    })),
    sessionStartTime: new Date(supabaseState.session_start_time),
    lastActivityTime: new Date(supabaseState.last_activity_time),
    createdAt: new Date(supabaseState.created_at),
    updatedAt: new Date(supabaseState.updated_at)
  };
}

function mapSupabaseRecentItemToRecentItem(supabaseItem: SupabaseRecentItem): RecentItem {
  return {
    id: supabaseItem.id,
    userId: supabaseItem.user_id,
    itemId: supabaseItem.item_id,
    itemType: supabaseItem.item_type,
    itemTitle: supabaseItem.item_title,
    itemSubtitle: supabaseItem.item_subtitle,
    itemIcon: supabaseItem.item_icon,
    itemRoute: supabaseItem.item_route,
    lastInteractionTime: new Date(supabaseItem.last_interaction_time),
    interactionType: supabaseItem.interaction_type,
    interactionCount: supabaseItem.interaction_count,
    domainId: supabaseItem.domain_id,
    projectId: supabaseItem.project_id,
    displayOrder: supabaseItem.display_order,
    pinned: supabaseItem.pinned,
    createdAt: new Date(supabaseItem.created_at),
    updatedAt: new Date(supabaseItem.updated_at)
  };
}

function mapSupabaseBottomBarItemToBottomBarItem(supabaseItem: SupabaseBottomBarItem): BottomBarItem {
  return {
    id: supabaseItem.id,
    label: supabaseItem.label,
    icon: supabaseItem.icon,
    route: supabaseItem.route,
    order: supabaseItem.order,
    enabled: supabaseItem.enabled,
    visibleOnTabletPortrait: supabaseItem.visible_on_tablet_portrait,
    visibleOnMobile: supabaseItem.visible_on_mobile,
    opensAskOscar: supabaseItem.opens_ask_oscar,
    showsNotificationBadge: supabaseItem.shows_notification_badge,
    iconSize: supabaseItem.icon_size,
    activeColor: supabaseItem.active_color,
    inactiveColor: supabaseItem.inactive_color,
    createdAt: new Date(supabaseItem.created_at),
    updatedAt: new Date(supabaseItem.updated_at)
  };
}

function mapSupabaseDomainScrollPositionToDomainScrollPosition(supabasePosition: SupabaseDomainScrollPosition): DomainScrollPosition {
  return {
    id: supabasePosition.id,
    userId: supabasePosition.user_id,
    domainId: supabasePosition.domain_id,
    route: supabasePosition.route,
    scrollPosition: supabasePosition.scroll_position,
    viewportHeight: supabasePosition.viewport_height,
    contentHeight: supabasePosition.content_height,
    timestamp: new Date(supabasePosition.timestamp),
    createdAt: new Date(supabasePosition.created_at),
    updatedAt: new Date(supabasePosition.updated_at)
  };
}

function mapSupabaseNavigationPreferenceToNavigationPreference(supabasePref: SupabaseNavigationPreference): NavigationPreference {
  return {
    id: supabasePref.id,
    userId: supabasePref.user_id,
    sidebarDefaultCollapsed: supabasePref.sidebar_default_collapsed,
    sidebarWidth: supabasePref.sidebar_width,
    sidebarMiniWidth: supabasePref.sidebar_mini_width,
    sidebarAnimationEnabled: supabasePref.sidebar_animation_enabled,
    bottomBarAlwaysVisible: supabasePref.bottom_bar_always_visible,
    bottomBarHeight: supabasePref.bottom_bar_height,
    bottomBarHideOnScroll: supabasePref.bottom_bar_hide_on_scroll,
    enableSmoothScrolling: supabasePref.enable_smooth_scrolling,
    enableScrollRestoration: supabasePref.enable_scroll_restoration,
    enableNavigationAnimations: supabasePref.enable_navigation_animations,
    navigationAnimationSpeed: supabasePref.navigation_animation_speed,
    recentItemsCount: supabasePref.recent_items_count,
    recentItemsMaxAge: supabasePref.recent_items_max_age,
    showPinnedItemsFirst: supabasePref.show_pinned_items_first,
    askOscarBarAutoFocus: supabasePref.ask_oscar_bar_auto_focus,
    askOscarBarShowTooltip: supabasePref.ask_oscar_bar_show_tooltip,
    askOscarBarTooltipDelay: supabasePref.ask_oscar_bar_tooltip_delay,
    createdAt: new Date(supabasePref.created_at),
    updatedAt: new Date(supabasePref.updated_at)
  };
}

function mapSupabaseNavigationEventToNavigationEvent(supabaseEvent: SupabaseNavigationEvent): NavigationEvent {
  return {
    id: supabaseEvent.id,
    userId: supabaseEvent.user_id,
    eventType: supabaseEvent.event_type,
    timestamp: new Date(supabaseEvent.timestamp),
    sourceDomainId: supabaseEvent.source_domain_id,
    sourceRoute: supabaseEvent.source_route,
    sourceElement: supabaseEvent.source_element,
    targetDomainId: supabaseEvent.target_domain_id,
    targetRoute: supabaseEvent.target_route,
    targetElement: supabaseEvent.target_element,
    deviceType: supabaseEvent.device_type,
    orientation: supabaseEvent.orientation,
    viewportWidth: supabaseEvent.viewport_width,
    viewportHeight: supabaseEvent.viewport_height,
    loadTime: supabaseEvent.load_time,
    renderTime: supabaseEvent.render_time,
    navigationDelay: supabaseEvent.navigation_delay,
    error: supabaseEvent.error,
    errorStack: supabaseEvent.error_stack,
    createdAt: new Date(supabaseEvent.created_at)
  };
}

// ==================== Navigation Items ====================

export async function getNavigationItems(): Promise<NavigationItem[]> {
  if (!HAS_VALID_SUPABASE) {
    return defaultNavigationItems;
  }

  try {
    const { data, error } = await (supabase as any)
      .from('navigation_items')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      return defaultNavigationItems;
    }

    return (data as SupabaseNavigationItem[]).map(mapSupabaseNavigationItemToNavigationItem);
  } catch (error) {
    return defaultNavigationItems;
  }
}

export async function getNavigationItemsForCurrentDevice(
  deviceType: 'desktop' | 'tablet' | 'mobile',
  orientation: 'landscape' | 'portrait'
): Promise<NavigationItem[]> {
  try {
    const items = await getNavigationItems();
    
    return items.filter(item => {
      if (deviceType === 'desktop') return item.visibleOnDesktop;
      if (deviceType === 'tablet' && orientation === 'landscape') return item.visibleOnTabletLandscape;
      if (deviceType === 'tablet' && orientation === 'portrait') return item.visibleOnTabletPortrait;
      if (deviceType === 'mobile') return item.visibleOnMobile;
      return false;
    }).filter(item => item.enabled);
  } catch (error) {
    return getNavigationItemsForDevice(deviceType, orientation);
  }
}

export async function getNavigationItemById(id: string): Promise<NavigationItem | null> {
  try {
    const { data, error } = await (supabase as any)
      .from('navigation_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return null;
    }

    return mapSupabaseNavigationItemToNavigationItem(data as SupabaseNavigationItem);
  } catch (error) {
    return null;
  }
}

export async function createNavigationItem(item: Omit<NavigationItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const supabaseItem: Omit<SupabaseNavigationItem, 'id' | 'created_at' | 'updated_at'> = {
      domain_id: item.domainId,
      label: item.label,
      icon: item.icon,
      route: item.route,
      order: item.order,
      enabled: item.enabled,
      parent_id: item.parentId,
      is_expandable: item.isExpandable,
      expanded: item.expanded,
      visible_on_desktop: item.visibleOnDesktop,
      visible_on_tablet_landscape: item.visibleOnTabletLandscape,
      visible_on_tablet_portrait: item.visibleOnTabletPortrait,
      visible_on_mobile: item.visibleOnMobile,
      opens_in_new_tab: item.opensInNewTab,
      requires_authentication: item.requiresAuthentication,
      permission_level: item.permissionLevel,
      badge_count: item.badgeCount,
      badge_type: item.badgeType,
      tooltip: item.tooltip
    };

    const { data, error } = await (supabase as any)
      .from('navigation_items')
      .insert(supabaseItem)
      .select()
      .single();

    if (error) {
      return null;
    }

    return (data as SupabaseNavigationItem).id;
  } catch (error) {
    return null;
  }
}

export async function updateNavigationItem(id: string, updates: Partial<NavigationItem>): Promise<boolean> {
  try {
    const supabaseUpdates: Partial<SupabaseNavigationItem> = {};

    if (updates.domainId !== undefined) supabaseUpdates.domain_id = updates.domainId;
    if (updates.label !== undefined) supabaseUpdates.label = updates.label;
    if (updates.icon !== undefined) supabaseUpdates.icon = updates.icon;
    if (updates.route !== undefined) supabaseUpdates.route = updates.route;
    if (updates.order !== undefined) supabaseUpdates.order = updates.order;
    if (updates.enabled !== undefined) supabaseUpdates.enabled = updates.enabled;
    if (updates.parentId !== undefined) supabaseUpdates.parent_id = updates.parentId;
    if (updates.isExpandable !== undefined) supabaseUpdates.is_expandable = updates.isExpandable;
    if (updates.expanded !== undefined) supabaseUpdates.expanded = updates.expanded;
    if (updates.visibleOnDesktop !== undefined) supabaseUpdates.visible_on_desktop = updates.visibleOnDesktop;
    if (updates.visibleOnTabletLandscape !== undefined) supabaseUpdates.visible_on_tablet_landscape = updates.visibleOnTabletLandscape;
    if (updates.visibleOnTabletPortrait !== undefined) supabaseUpdates.visible_on_tablet_portrait = updates.visibleOnTabletPortrait;
    if (updates.visibleOnMobile !== undefined) supabaseUpdates.visible_on_mobile = updates.visibleOnMobile;
    if (updates.opensInNewTab !== undefined) supabaseUpdates.opens_in_new_tab = updates.opensInNewTab;
    if (updates.requiresAuthentication !== undefined) supabaseUpdates.requires_authentication = updates.requiresAuthentication;
    if (updates.permissionLevel !== undefined) supabaseUpdates.permission_level = updates.permissionLevel;
    if (updates.badgeCount !== undefined) supabaseUpdates.badge_count = updates.badgeCount;
    if (updates.badgeType !== undefined) supabaseUpdates.badge_type = updates.badgeType;
    if (updates.tooltip !== undefined) supabaseUpdates.tooltip = updates.tooltip;

    const { error } = await (supabase as any)
      .from('navigation_items')
      .update(supabaseUpdates)
      .eq('id', id);

    return !error;
  } catch (error) {
    return false;
  }
}
