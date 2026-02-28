/**
 * Module 1: Global System Rules Data Models
 * 
 * Defines the core data structures for the global system rules including:
 * - Layout configurations
 * - Device-specific rules
 * - Domain definitions
 * - Component primitives
 * - Interaction rules
 * - Cross-domain consistency rules
 */

export interface LayoutConfiguration {
  id: string;
  name: 'desktop' | 'tablet-landscape' | 'tablet-portrait' | 'mobile';
  description: string;
  
  // Layout structure
  hasSidebar: boolean;
  hasMiniSidebar: boolean;
  hasRightPanel: boolean;
  hasPersistentAskOscarBar: boolean;
  hasBottomBarNavigation: boolean;
  
  // Ask Oscar bar configuration
  askOscarBarIncludesMic: boolean;
  askOscarBarIncludesVoiceRecord: boolean;
  askOscarBarIncludesCamera: boolean;
  
  // Sheet behavior
  sheetCloseMethod: 'chevron' | 'swipe-down' | 'both';
  sheetAppearsAboveBar: boolean;
  
  // Z-index order (1 = lowest, 5 = highest)
  zIndexContent: number;
  zIndexRightPanel: number;
  zIndexAskOscarBar: number;
  zIndexTooltip: number;
  zIndexSheet: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceRule {
  id: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  orientation: 'landscape' | 'portrait' | 'any';
  minWidth: number;
  maxWidth: number;
  layoutConfigurationId: string;
  priority: number; // Higher priority = more specific rule
  createdAt: Date;
  updatedAt: Date;
}

export interface DomainDefinition {
  id: string;
  name: 'home' | 'workspace' | 'files' | 'connect' | 'map' | 'dashboard' | 'documents' | 'recent';
  displayName: string;
  description: string;
  icon: string;
  route: string;
  order: number;
  enabled: boolean;
  
  // Domain capabilities
  supportsCards: boolean;
  supportsGrid: boolean;
  supportsList: boolean;
  supportsSearch: boolean;
  supportsFilters: boolean;
  supportsActions: boolean;
  
  // Metadata
  defaultView: 'cards' | 'grid' | 'list';
  cardStructureType: 'standard' | 'compact' | 'visual';
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ComponentPrimitive {
  id: string;
  name: 'card' | 'list-row' | 'grid-tile' | 'metadata-block' | 'action-menu' | 'search-bar' | 'button';
  type: 'layout' | 'interaction' | 'navigation' | 'data';
  description: string;
  
  // Styling properties
  defaultWidth: number | string;
  defaultHeight: number | string;
  padding: string;
  margin: string;
  borderRadius: string;
  backgroundColor: string;
  borderColor: string;
  
  // Interaction properties
  hoverEffect: 'scale' | 'shadow' | 'color' | 'none';
  activeEffect: 'opacity' | 'translate' | 'none';
  
  // Variants
  variants: Record<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface InteractionRule {
  id: string;
  interactionType: 'tap' | 'long-press' | 'swipe-down' | 'chevron' | 'drag' | 'pinch' | 'rotate';
  description: string;
  
  // Context
  appliesTo: string[]; // Component types or specific components
  deviceTypes: ('desktop' | 'tablet' | 'mobile')[];
  
  // Behavior
  action: 'open' | 'close' | 'reorder' | 'zoom' | 'pan' | 'context-menu';
  target: 'sheet' | 'card' | 'panel' | 'map' | 'item';
  
  // Parameters
  parameters: Record<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CrossDomainConsistencyRule {
  id: string;
  name: string;
  description: string;
  
  // Scope
  appliesToDomains: string[];
  appliesToComponents: string[];
  
  // Rule definition
  property: string;
  expectedValue: any;
  tolerance: 'exact' | 'similar' | 'consistent';
  
  // Validation
  validationFunction?: string; // Optional JS function for complex validation
  errorMessage: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface AskOscarBarConfiguration {
  id: string;
  name: string;
  description: string;
  
  // Layout
  height: number; // pixels
  backgroundColor: string;
  borderTopColor: string;
  borderTopWidth: number;
  
  // Elements
  elements: Array<{
    type: 'tree-icon' | 'label' | 'input' | 'help' | 'mic' | 'voice-record' | 'camera' | 'send';
    position: number;
    visible: boolean;
    deviceTypes: ('desktop' | 'tablet' | 'mobile')[];
    properties: Record<string, any>;
  }>;
  
  // Behavior
  alwaysVisible: boolean;
  resizesHorizontally: boolean;
  fixedVerticalPosition: boolean;
  zIndex: number;
  
  // Tooltip relationship
  tooltipAppearsAbove: boolean;
  tooltipOffset: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface SheetTooltipLayeringRule {
  id: string;
  name: string;
  description: string;
  
  // Z-index hierarchy (from bottom to top)
  layers: Array<{
    element: 'content' | 'right-panel' | 'ask-oscar-bar' | 'tooltip' | 'sheet';
    zIndex: number;
    stackingContext: boolean;
  }>;
  
  // Visual order rules
  visualOrder: string[]; // Array of element names in visual order
  
  // Overlap rules
  allowedOverlaps: Array<{
    topElement: string;
    bottomElement: string;
    maxOverlapPercentage: number;
  }>;
  
  // Device-specific variations
  deviceVariations: Record<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

// Default configurations
export const defaultLayoutConfigurations: LayoutConfiguration[] = [
  {
    id: 'desktop-default',
    name: 'desktop',
    description: 'Desktop layout with persistent sidebar, right panel, and Ask Oscar bar',
    hasSidebar: true,
    hasMiniSidebar: false,
    hasRightPanel: true,
    hasPersistentAskOscarBar: true,
    hasBottomBarNavigation: false,
    askOscarBarIncludesMic: true,
    askOscarBarIncludesVoiceRecord: true,
    askOscarBarIncludesCamera: false,
    sheetCloseMethod: 'chevron',
    sheetAppearsAboveBar: true,
    zIndexContent: 1,
    zIndexRightPanel: 2,
    zIndexAskOscarBar: 3,
    zIndexTooltip: 4,
    zIndexSheet: 5,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'tablet-landscape-default',
    name: 'tablet-landscape',
    description: 'Tablet landscape layout (same as desktop but with camera in Ask Oscar bar)',
    hasSidebar: true,
    hasMiniSidebar: false,
    hasRightPanel: true,
    hasPersistentAskOscarBar: true,
    hasBottomBarNavigation: false,
    askOscarBarIncludesMic: true,
    askOscarBarIncludesVoiceRecord: true,
    askOscarBarIncludesCamera: true,
    sheetCloseMethod: 'chevron',
    sheetAppearsAboveBar: true,
    zIndexContent: 1,
    zIndexRightPanel: 2,
    zIndexAskOscarBar: 3,
    zIndexTooltip: 4,
    zIndexSheet: 5,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'tablet-portrait-default',
    name: 'tablet-portrait',
    description: 'Tablet portrait layout (mobile layout with bottom bar navigation)',
    hasSidebar: false,
    hasMiniSidebar: false,
    hasRightPanel: false,
    hasPersistentAskOscarBar: false,
    hasBottomBarNavigation: true,
    askOscarBarIncludesMic: true,
    askOscarBarIncludesVoiceRecord: true,
    askOscarBarIncludesCamera: false,
    sheetCloseMethod: 'swipe-down',
    sheetAppearsAboveBar: true,
    zIndexContent: 1,
    zIndexRightPanel: 2,
    zIndexAskOscarBar: 3,
    zIndexTooltip: 4,
    zIndexSheet: 5,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mobile-default',
    name: 'mobile',
    description: 'Mobile layout with bottom bar navigation',
    hasSidebar: false,
    hasMiniSidebar: false,
    hasRightPanel: false,
    hasPersistentAskOscarBar: false,
    hasBottomBarNavigation: true,
    askOscarBarIncludesMic: true,
    askOscarBarIncludesVoiceRecord: true,
    askOscarBarIncludesCamera: false,
    sheetCloseMethod: 'swipe-down',
    sheetAppearsAboveBar: true,
    zIndexContent: 1,
    zIndexRightPanel: 2,
    zIndexAskOscarBar: 3,
    zIndexTooltip: 4,
    zIndexSheet: 5,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const defaultDeviceRules: DeviceRule[] = [
  {
    id: 'desktop-rule',
    deviceType: 'desktop',
    orientation: 'any',
    minWidth: 1024,
    maxWidth: 9999,
    layoutConfigurationId: 'desktop-default',
    priority: 10,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'tablet-landscape-rule',
    deviceType: 'tablet',
    orientation: 'landscape',
    minWidth: 768,
    maxWidth: 1023,
    layoutConfigurationId: 'tablet-landscape-default',
    priority: 20,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'tablet-portrait-rule',
    deviceType: 'tablet',
    orientation: 'portrait',
    minWidth: 768,
    maxWidth: 1023,
    layoutConfigurationId: 'tablet-portrait-default',
    priority: 30,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mobile-rule',
    deviceType: 'mobile',
    orientation: 'any',
    minWidth: 0,
    maxWidth: 767,
    layoutConfigurationId: 'mobile-default',
    priority: 40,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const defaultDomainDefinitions: DomainDefinition[] = [
  {
    id: 'home',
    name: 'home',
    displayName: 'Home',
    description: 'Overview, capture entry, recents',
    icon: 'home',
    route: '/',
    order: 1,
    enabled: true,
    supportsCards: true,
    supportsGrid: true,
    supportsList: true,
    supportsSearch: true,
    supportsFilters: true,
    supportsActions: true,
    defaultView: 'cards',
    cardStructureType: 'standard',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'workspace',
    name: 'workspace',
    displayName: 'Workspace',
    description: 'Projects, tasks, notes, reports, calendar',
    icon: 'workspace',
    route: '/workspace',
    order: 2,
    enabled: true,
    supportsCards: true,
    supportsGrid: true,
    supportsList: true,
    supportsSearch: true,
    supportsFilters: true,
    supportsActions: true,
    defaultView: 'cards',
    cardStructureType: 'standard',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'files',
    name: 'files',
    displayName: 'Files',
    description: 'Universal explorer with metadata',
    icon: 'files',
    route: '/files',
    order: 3,
    enabled: true,
    supportsCards: true,
    supportsGrid: true,
    supportsList: true,
    supportsSearch: true,
    supportsFilters: true,
    supportsActions: true,
    defaultView: 'grid',
    cardStructureType: 'visual',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'connect',
    name: 'connect',
    displayName: 'Connect',
    description: 'Inbox, campaigns, comms intelligence',
    icon: 'connect',
    route: '/connect',
    order: 4,
    enabled: true,
    supportsCards: true,
    supportsGrid: true,
    supportsList: true,
    supportsSearch: true,
    supportsFilters: true,
    supportsActions: true,
    defaultView: 'list',
    cardStructureType: 'compact',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'map',
    name: 'map',
    displayName: 'Map',
    description: 'Boundaries, markers, spatial linking',
    icon: 'map',
    route: '/map',
    order: 5,
    enabled: true,
    supportsCards: false,
    supportsGrid: false,
    supportsList: false,
    supportsSearch: true,
    supportsFilters: true,
    supportsActions: true,
    defaultView: 'cards',
    cardStructureType: 'standard',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'dashboard',
    name: 'dashboard',
    displayName: 'Dashboard',
    description: 'Settings, support, documents',
    icon: 'dashboard',
    route: '/dashboard',
    order: 6,
    enabled: true,
    supportsCards: true,
    supportsGrid: true,
    supportsList: true,
    supportsSearch: true,
    supportsFilters: true,
    supportsActions: true,
    defaultView: 'grid',
    cardStructureType: 'visual',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'documents',
    name: 'documents',
    displayName: 'Documents',
    description: 'Markdown help system',
    icon: 'documents',
    route: '/documents',
    order: 7,
    enabled: true,
    supportsCards: true,
    supportsGrid: false,
    supportsList: true,
    supportsSearch: true,
    supportsFilters: true,
    supportsActions: true,
    defaultView: 'list',
    cardStructureType: 'compact',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'recent',
    name: 'recent',
    displayName: 'Recent',
    description: 'Dynamic 3–4 items',
    icon: 'recent',
    route: '/recent',
    order: 8,
    enabled: true,
    supportsCards: true,
    supportsGrid: false,
    supportsList: true,
    supportsSearch: false,
    supportsFilters: false,
    supportsActions: true,
    defaultView: 'list',
    cardStructureType: 'compact',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];