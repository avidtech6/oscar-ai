import { supabase } from '$lib/supabase/client';
import { HAS_VALID_SUPABASE } from '$lib/config/keys';
import type {
  LayoutConfiguration,
  DeviceRule,
  DomainDefinition,
  ComponentPrimitive,
  InteractionRule,
  CrossDomainConsistencyRule,
  AskOscarBarConfiguration,
  SheetTooltipLayeringRule
} from '$lib/models/GlobalSystemRules';
import {
  defaultLayoutConfigurations,
  defaultDeviceRules,
  defaultDomainDefinitions
} from '$lib/models/GlobalSystemRules';

// Supabase interfaces for Module 1 tables
export interface SupabaseLayoutConfiguration {
  id: string;
  name: 'desktop' | 'tablet-landscape' | 'tablet-portrait' | 'mobile';
  description: string;
  has_sidebar: boolean;
  has_mini_sidebar: boolean;
  has_right_panel: boolean;
  has_persistent_ask_oscar_bar: boolean;
  has_bottom_bar_navigation: boolean;
  ask_oscar_bar_includes_mic: boolean;
  ask_oscar_bar_includes_voice_record: boolean;
  ask_oscar_bar_includes_camera: boolean;
  sheet_close_method: 'chevron' | 'swipe-down' | 'both';
  sheet_appears_above_bar: boolean;
  z_index_content: number;
  z_index_right_panel: number;
  z_index_ask_oscar_bar: number;
  z_index_tooltip: number;
  z_index_sheet: number;
  created_at: string;
  updated_at: string;
}

export interface SupabaseDeviceRule {
  id: string;
  device_type: 'desktop' | 'tablet' | 'mobile';
  orientation: 'landscape' | 'portrait' | 'any';
  min_width: number;
  max_width: number;
  layout_configuration_id: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface SupabaseDomainDefinition {
  id: string;
  name: 'home' | 'workspace' | 'files' | 'connect' | 'map' | 'dashboard' | 'documents' | 'recent';
  display_name: string;
  description: string;
  icon: string;
  route: string;
  order: number;
  enabled: boolean;
  supports_cards: boolean;
  supports_grid: boolean;
  supports_list: boolean;
  supports_search: boolean;
  supports_filters: boolean;
  supports_actions: boolean;
  default_view: 'cards' | 'grid' | 'list';
  card_structure_type: 'standard' | 'compact' | 'visual';
  created_at: string;
  updated_at: string;
}

// Mapping functions
function mapSupabaseLayoutConfigurationToLayoutConfiguration(supabaseConfig: SupabaseLayoutConfiguration): LayoutConfiguration {
  return {
    id: supabaseConfig.id,
    name: supabaseConfig.name,
    description: supabaseConfig.description,
    hasSidebar: supabaseConfig.has_sidebar,
    hasMiniSidebar: supabaseConfig.has_mini_sidebar,
    hasRightPanel: supabaseConfig.has_right_panel,
    hasPersistentAskOscarBar: supabaseConfig.has_persistent_ask_oscar_bar,
    hasBottomBarNavigation: supabaseConfig.has_bottom_bar_navigation,
    askOscarBarIncludesMic: supabaseConfig.ask_oscar_bar_includes_mic,
    askOscarBarIncludesVoiceRecord: supabaseConfig.ask_oscar_bar_includes_voice_record,
    askOscarBarIncludesCamera: supabaseConfig.ask_oscar_bar_includes_camera,
    sheetCloseMethod: supabaseConfig.sheet_close_method,
    sheetAppearsAboveBar: supabaseConfig.sheet_appears_above_bar,
    zIndexContent: supabaseConfig.z_index_content,
    zIndexRightPanel: supabaseConfig.z_index_right_panel,
    zIndexAskOscarBar: supabaseConfig.z_index_ask_oscar_bar,
    zIndexTooltip: supabaseConfig.z_index_tooltip,
    zIndexSheet: supabaseConfig.z_index_sheet,
    createdAt: new Date(supabaseConfig.created_at),
    updatedAt: new Date(supabaseConfig.updated_at)
  };
}

function mapSupabaseDeviceRuleToDeviceRule(supabaseRule: SupabaseDeviceRule): DeviceRule {
  return {
    id: supabaseRule.id,
    deviceType: supabaseRule.device_type,
    orientation: supabaseRule.orientation,
    minWidth: supabaseRule.min_width,
    maxWidth: supabaseRule.max_width,
    layoutConfigurationId: supabaseRule.layout_configuration_id,
    priority: supabaseRule.priority,
    createdAt: new Date(supabaseRule.created_at),
    updatedAt: new Date(supabaseRule.updated_at)
  };
}

function mapSupabaseDomainDefinitionToDomainDefinition(supabaseDomain: SupabaseDomainDefinition): DomainDefinition {
  return {
    id: supabaseDomain.id,
    name: supabaseDomain.name,
    displayName: supabaseDomain.display_name,
    description: supabaseDomain.description,
    icon: supabaseDomain.icon,
    route: supabaseDomain.route,
    order: supabaseDomain.order,
    enabled: supabaseDomain.enabled,
    supportsCards: supabaseDomain.supports_cards,
    supportsGrid: supabaseDomain.supports_grid,
    supportsList: supabaseDomain.supports_list,
    supportsSearch: supabaseDomain.supports_search,
    supportsFilters: supabaseDomain.supports_filters,
    supportsActions: supabaseDomain.supports_actions,
    defaultView: supabaseDomain.default_view,
    cardStructureType: supabaseDomain.card_structure_type,
    createdAt: new Date(supabaseDomain.created_at),
    updatedAt: new Date(supabaseDomain.updated_at)
  };
}

// ==================== Layout Configurations ====================

export async function getLayoutConfigurations(): Promise<LayoutConfiguration[]> {
  // If Supabase is not configured, return default data
  if (!HAS_VALID_SUPABASE) {
    console.warn('Supabase not configured, returning default layout configurations');
    return defaultLayoutConfigurations;
  }

  try {
    const { data, error } = await supabase
      .from('layout_configurations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching layout configurations:', error);
      return defaultLayoutConfigurations;
    }

    return (data as SupabaseLayoutConfiguration[]).map(mapSupabaseLayoutConfigurationToLayoutConfiguration);
  } catch (error) {
    console.error('Error in getLayoutConfigurations:', error);
    return defaultLayoutConfigurations;
  }
}

export async function getLayoutConfigurationById(id: string): Promise<LayoutConfiguration | null> {
  try {
    const { data, error } = await supabase
      .from('layout_configurations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching layout configuration:', error);
      return null;
    }

    return mapSupabaseLayoutConfigurationToLayoutConfiguration(data as SupabaseLayoutConfiguration);
  } catch (error) {
    console.error('Error in getLayoutConfigurationById:', error);
    return null;
  }
}

export async function createLayoutConfiguration(config: Omit<LayoutConfiguration, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const supabaseConfig: any = {
      name: config.name,
      description: config.description,
      has_sidebar: config.hasSidebar,
      has_mini_sidebar: config.hasMiniSidebar,
      has_right_panel: config.hasRightPanel,
      has_persistent_ask_oscar_bar: config.hasPersistentAskOscarBar,
      has_bottom_bar_navigation: config.hasBottomBarNavigation,
      ask_oscar_bar_includes_mic: config.askOscarBarIncludesMic,
      ask_oscar_bar_includes_voice_record: config.askOscarBarIncludesVoiceRecord,
      ask_oscar_bar_includes_camera: config.askOscarBarIncludesCamera,
      sheet_close_method: config.sheetCloseMethod,
      sheet_appears_above_bar: config.sheetAppearsAboveBar,
      z_index_content: config.zIndexContent,
      z_index_right_panel: config.zIndexRightPanel,
      z_index_ask_oscar_bar: config.zIndexAskOscarBar,
      z_index_tooltip: config.zIndexTooltip,
      z_index_sheet: config.zIndexSheet
    };

    const { data, error } = await supabase
      .from('layout_configurations')
      .insert(supabaseConfig)
      .select()
      .single();

    if (error) {
      console.error('Error creating layout configuration:', error);
      return null;
    }

    return (data as SupabaseLayoutConfiguration).id;
  } catch (error) {
    console.error('Error in createLayoutConfiguration:', error);
    return null;
  }
}

export async function updateLayoutConfiguration(id: string, updates: Partial<LayoutConfiguration>): Promise<boolean> {
  try {
    const supabaseUpdates: any = {};

    if (updates.name !== undefined) supabaseUpdates.name = updates.name;
    if (updates.description !== undefined) supabaseUpdates.description = updates.description;
    if (updates.hasSidebar !== undefined) supabaseUpdates.has_sidebar = updates.hasSidebar;
    if (updates.hasMiniSidebar !== undefined) supabaseUpdates.has_mini_sidebar = updates.hasMiniSidebar;
    if (updates.hasRightPanel !== undefined) supabaseUpdates.has_right_panel = updates.hasRightPanel;
    if (updates.hasPersistentAskOscarBar !== undefined) supabaseUpdates.has_persistent_ask_oscar_bar = updates.hasPersistentAskOscarBar;
    if (updates.hasBottomBarNavigation !== undefined) supabaseUpdates.has_bottom_bar_navigation = updates.hasBottomBarNavigation;
    if (updates.askOscarBarIncludesMic !== undefined) supabaseUpdates.ask_oscar_bar_includes_mic = updates.askOscarBarIncludesMic;
    if (updates.askOscarBarIncludesVoiceRecord !== undefined) supabaseUpdates.ask_oscar_bar_includes_voice_record = updates.askOscarBarIncludesVoiceRecord;
    if (updates.askOscarBarIncludesCamera !== undefined) supabaseUpdates.ask_oscar_bar_includes_camera = updates.askOscarBarIncludesCamera;
    if (updates.sheetCloseMethod !== undefined) supabaseUpdates.sheet_close_method = updates.sheetCloseMethod;
    if (updates.sheetAppearsAboveBar !== undefined) supabaseUpdates.sheet_appears_above_bar = updates.sheetAppearsAboveBar;
    if (updates.zIndexContent !== undefined) supabaseUpdates.z_index_content = updates.zIndexContent;
    if (updates.zIndexRightPanel !== undefined) supabaseUpdates.z_index_right_panel = updates.zIndexRightPanel;
    if (updates.zIndexAskOscarBar !== undefined) supabaseUpdates.z_index_ask_oscar_bar = updates.zIndexAskOscarBar;
    if (updates.zIndexTooltip !== undefined) supabaseUpdates.z_index_tooltip = updates.zIndexTooltip;
    if (updates.zIndexSheet !== undefined) supabaseUpdates.z_index_sheet = updates.zIndexSheet;

    // Always update updated_at
    supabaseUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('layout_configurations')
      .update(supabaseUpdates as never)
      .eq('id', id);

    if (error) {
      console.error('Error updating layout configuration:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateLayoutConfiguration:', error);
    return false;
  }
}

export async function deleteLayoutConfiguration(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('layout_configurations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting layout configuration:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteLayoutConfiguration:', error);
    return false;
  }
}

// ==================== Device Rules ====================

export async function getDeviceRules(): Promise<DeviceRule[]> {
  // If Supabase is not configured, return default data
  if (!HAS_VALID_SUPABASE) {
    console.warn('Supabase not configured, returning default device rules');
    return defaultDeviceRules;
  }

  try {
    const { data, error } = await supabase
      .from('device_rules')
      .select('*')
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error fetching device rules:', error);
      return defaultDeviceRules;
    }

    return (data as SupabaseDeviceRule[]).map(mapSupabaseDeviceRuleToDeviceRule);
  } catch (error) {
    console.error('Error in getDeviceRules:', error);
    return defaultDeviceRules;
  }
}

export async function getDeviceRuleById(id: string): Promise<DeviceRule | null> {
  try {
    const { data, error } = await supabase
      .from('device_rules')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching device rule:', error);
      return null;
    }

    return mapSupabaseDeviceRuleToDeviceRule(data as SupabaseDeviceRule);
  } catch (error) {
    console.error('Error in getDeviceRuleById:', error);
    return null;
  }
}

export async function createDeviceRule(rule: Omit<DeviceRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const supabaseRule: any = {
      device_type: rule.deviceType,
      orientation: rule.orientation,
      min_width: rule.minWidth,
      max_width: rule.maxWidth,
      layout_configuration_id: rule.layoutConfigurationId,
      priority: rule.priority
    };

    const { data, error } = await supabase
      .from('device_rules')
      .insert(supabaseRule)
      .select()
      .single();

    if (error) {
      console.error('Error creating device rule:', error);
      return null;
    }

    return (data as SupabaseDeviceRule).id;
  } catch (error) {
    console.error('Error in createDeviceRule:', error);
    return null;
  }
}

export async function updateDeviceRule(id: string, updates: Partial<DeviceRule>): Promise<boolean> {
  try {
    const supabaseUpdates: any = {};

    if (updates.deviceType !== undefined) supabaseUpdates.device_type = updates.deviceType;
    if (updates.orientation !== undefined) supabaseUpdates.orientation = updates.orientation;
    if (updates.minWidth !== undefined) supabaseUpdates.min_width = updates.minWidth;
    if (updates.maxWidth !== undefined) supabaseUpdates.max_width = updates.maxWidth;
    if (updates.layoutConfigurationId !== undefined) supabaseUpdates.layout_configuration_id = updates.layoutConfigurationId;
    if (updates.priority !== undefined) supabaseUpdates.priority = updates.priority;

    // Always update updated_at
    supabaseUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('device_rules')
      .update(supabaseUpdates as never)
      .eq('id', id);

    if (error) {
      console.error('Error updating device rule:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateDeviceRule:', error);
    return false;
  }
}

export async function deleteDeviceRule(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('device_rules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting device rule:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteDeviceRule:', error);
    return false;
  }
}

// ==================== Domain Definitions ====================

export async function getDomainDefinitions(): Promise<DomainDefinition[]> {
  // If Supabase is not configured, return default data
  if (!HAS_VALID_SUPABASE) {
    console.warn('Supabase not configured, returning default domain definitions');
    return defaultDomainDefinitions;
  }

  try {
    const { data, error } = await supabase
      .from('domain_definitions')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching domain definitions:', error);
      return defaultDomainDefinitions;
    }

    return (data as SupabaseDomainDefinition[]).map(mapSupabaseDomainDefinitionToDomainDefinition);
  } catch (error) {
    console.error('Error in getDomainDefinitions:', error);
    return defaultDomainDefinitions;
  }
}

export async function getDomainDefinitionById(id: string): Promise<DomainDefinition | null> {
  try {
    const { data, error } = await supabase
      .from('domain_definitions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching domain definition:', error);
      return null;
    }

    return mapSupabaseDomainDefinitionToDomainDefinition(data as SupabaseDomainDefinition);
  } catch (error) {
    console.error('Error in getDomainDefinitionById:', error);
    return null;
  }
}

export async function createDomainDefinition(domain: Omit<DomainDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const supabaseDomain: any = {
      name: domain.name,
      display_name: domain.displayName,
      description: domain.description,
      icon: domain.icon,
      route: domain.route,
      order: domain.order,
      enabled: domain.enabled,
      supports_cards: domain.supportsCards,
      supports_grid: domain.supportsGrid,
      supports_list: domain.supportsList,
      supports_search: domain.supportsSearch,
      supports_filters: domain.supportsFilters,
      supports_actions: domain.supportsActions,
      default_view: domain.defaultView,
      card_structure_type: domain.cardStructureType
    };

    const { data, error } = await supabase
      .from('domain_definitions')
      .insert(supabaseDomain)
      .select()
      .single();

    if (error) {
      console.error('Error creating domain definition:', error);
      return null;
    }

    return (data as SupabaseDomainDefinition).id;
  } catch (error) {
    console.error('Error in createDomainDefinition:', error);
    return null;
  }
}

export async function updateDomainDefinition(id: string, updates: Partial<DomainDefinition>): Promise<boolean> {
  try {
    const supabaseUpdates: any = {};

    if (updates.name !== undefined) supabaseUpdates.name = updates.name;
    if (updates.displayName !== undefined) supabaseUpdates.display_name = updates.displayName;
    if (updates.description !== undefined) supabaseUpdates.description = updates.description;
    if (updates.icon !== undefined) supabaseUpdates.icon = updates.icon;
    if (updates.route !== undefined) supabaseUpdates.route = updates.route;
    if (updates.order !== undefined) supabaseUpdates.order = updates.order;
    if (updates.enabled !== undefined) supabaseUpdates.enabled = updates.enabled;
    if (updates.supportsCards !== undefined) supabaseUpdates.supports_cards = updates.supportsCards;
    if (updates.supportsGrid !== undefined) supabaseUpdates.supports_grid = updates.supportsGrid;
    if (updates.supportsList !== undefined) supabaseUpdates.supports_list = updates.supportsList;
    if (updates.supportsSearch !== undefined) supabaseUpdates.supports_search = updates.supportsSearch;
    if (updates.supportsFilters !== undefined) supabaseUpdates.supports_filters = updates.supportsFilters;
    if (updates.supportsActions !== undefined) supabaseUpdates.supports_actions = updates.supportsActions;
    if (updates.defaultView !== undefined) supabaseUpdates.default_view = updates.defaultView;
    if (updates.cardStructureType !== undefined) supabaseUpdates.card_structure_type = updates.cardStructureType;

    // Always update updated_at
    supabaseUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('domain_definitions')
      .update(supabaseUpdates as never)
      .eq('id', id);

    if (error) {
      console.error('Error updating domain definition:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateDomainDefinition:', error);
    return false;
  }
}

export async function deleteDomainDefinition(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('domain_definitions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting domain definition:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteDomainDefinition:', error);
    return false;
  }
}

// ==================== Helper Functions ====================

export async function getActiveLayoutForDevice(deviceType: 'desktop' | 'tablet' | 'mobile', width: number, orientation: 'landscape' | 'portrait'): Promise<LayoutConfiguration | null> {
  try {
    const deviceRules = await getDeviceRules();
    
    // Find matching device rule
    const matchingRule = deviceRules.find(rule => {
      if (rule.deviceType !== deviceType) return false;
      if (rule.orientation !== 'any' && rule.orientation !== orientation) return false;
      if (width < rule.minWidth || width > rule.maxWidth) return false;
      return true;
    });

    if (!matchingRule) {
      console.warn('No matching device rule found for', { deviceType, width, orientation });
      return null;
    }

    // Get the layout configuration
    return await getLayoutConfigurationById(matchingRule.layoutConfigurationId);
  } catch (error) {
    console.error('Error in getActiveLayoutForDevice:', error);
    return null;
  }
}

export async function getEnabledDomains(): Promise<DomainDefinition[]> {
  try {
    const domains = await getDomainDefinitions();
    return domains.filter(domain => domain.enabled);
  } catch (error) {
    console.error('Error in getEnabledDomains:', error);
    return [];
  }
}

export async function getDomainByRoute(route: string): Promise<DomainDefinition | null> {
  try {
    const domains = await getDomainDefinitions();
    return domains.find(domain => domain.route === route) || null;
  } catch (error) {
    console.error('Error in getDomainByRoute:', error);
    return null;
  }
}

// ==================== Initialization ====================

export async function initializeDefaultGlobalRules(): Promise<void> {
  if (!HAS_VALID_SUPABASE) {
    console.warn('Supabase not configured, skipping initialization of default global rules');
    return;
  }

  try {
    // Check if we already have data
    const existingLayouts = await getLayoutConfigurations();
    const existingDeviceRules = await getDeviceRules();
    const existingDomains = await getDomainDefinitions();

    // Only create defaults if tables are empty
    if (existingLayouts.length === 0) {
      console.log('Creating default layout configurations...');
      for (const config of defaultLayoutConfigurations) {
        await createLayoutConfiguration(config);
      }
    }

    if (existingDeviceRules.length === 0) {
      console.log('Creating default device rules...');
      for (const rule of defaultDeviceRules) {
        await createDeviceRule(rule);
      }
    }

    if (existingDomains.length === 0) {
      console.log('Creating default domain definitions...');
      for (const domain of defaultDomainDefinitions) {
        await createDomainDefinition(domain);
      }
    }

    console.log('Global system rules initialized successfully');
  } catch (error) {
    console.error('Error initializing default global rules:', error);
  }
}
