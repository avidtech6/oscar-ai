/**
 * Module 4: Sheet System Data Models
 * 
 * Defines the core data structures for the Sheet System including:
 * - Sheet types and configurations
 * - Sheet positioning and layering rules
 * - Sheet transitions and behaviours
 * - Cross-domain sheet consistency
 */

export interface SheetConfiguration {
  id: string;
  
  // Sheet type
  type: 'conversation' | 'suggestions' | 'actions' | 'context' | 'settings' | 'custom';
  title: string;
  subtitle?: string;
  
  // Device-specific configuration
  deviceType: 'desktop' | 'tablet' | 'mobile';
  orientation: 'landscape' | 'portrait';
  
  // Positioning
  position: 'bottom' | 'top' | 'left' | 'right' | 'center';
  anchorElement: 'ask-oscar-bar' | 'content-area' | 'screen-bottom' | 'screen-top';
  offsetX: number;
  offsetY: number;
  
  // Sizing
  height: 'partial' | 'full' | 'auto' | 'custom';
  width: 'full' | 'partial' | 'auto' | 'custom';
  maxHeight: number;
  minHeight: number;
  maxWidth: number;
  minWidth: number;
  
  // Behaviour
  canSwipeDown: boolean;
  canSwipeUp: boolean;
  canSwipeLeft: boolean;
  canSwipeRight: boolean;
  showChevron: boolean;
  showCloseButton: boolean;
  showHeader: boolean;
  autoOpen: boolean;
  autoClose: boolean;
  closeOnOutsideClick: boolean;
  closeOnEscape: boolean;
  
  // Transitions
  openAnimation: 'slide-up' | 'slide-down' | 'fade' | 'scale' | 'none';
  closeAnimation: 'slide-down' | 'slide-up' | 'fade' | 'scale' | 'none';
  animationDuration: number; // milliseconds
  animationEasing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier';
  
  // Z-index and layering
  zIndex: number;
  overlayBackground: boolean;
  overlayOpacity: number; // 0-1
  overlayColor: string;
  
  // Content
  contentData?: Record<string, any>;
  templateName?: string;
  componentName?: string;
  
  // State
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  isPinned: boolean;
  
  // Metadata
  domainId: string;
  contextId?: string;
  conversationId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface SheetTransition {
  id: string;
  
  // Transition definition
  fromSheetId?: string;
  fromSheetType?: string;
  toSheetId: string;
  toSheetType: string;
  
  // Trigger
  triggerType: 'user-action' | 'system' | 'timeout' | 'event' | 'condition';
  triggerData?: Record<string, any>;
  
  // Conditions
  conditions: SheetTransitionCondition[];
  
  // Behaviour
  hideTooltip: boolean;
  showTooltipAfterClose: boolean;
  preserveContext: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface SheetTransitionCondition {
  id: string;
  transitionId: string;
  
  // Condition type
  type: 'device-type' | 'orientation' | 'domain' | 'context' | 'time' | 'user-action' | 'sheet-state';
  
  // Condition parameters
  parameter: string;
  operator: 'equals' | 'not-equals' | 'contains' | 'greater-than' | 'less-than' | 'in' | 'not-in';
  value: any;
  
  // Logical grouping
  groupId?: string;
  logicalOperator: 'and' | 'or';
  
  createdAt: Date;
  updatedAt: Date;
}

export interface SheetLayeringRule {
  id: string;
  
  // Rule definition
  name: string;
  description?: string;
  
  // Target elements
  targetElement: 'sheet' | 'tooltip' | 'ask-oscar-bar' | 'right-panel' | 'content' | 'overlay';
  targetType?: string;
  
  // Z-index rules
  zIndex: number;
  zIndexRelativeTo?: string;
  zIndexOffset?: number;
  
  // Visibility rules
  hideWhenOtherVisible: string[]; // Element types to hide when this is visible
  showWhenOtherHidden: string[]; // Element types to show when this is hidden
  
  // Device constraints
  deviceTypes: ('desktop' | 'tablet' | 'mobile')[];
  orientations: ('landscape' | 'portrait')[];
  
  // Domain constraints
  domainIds: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface SheetContentTemplate {
  id: string;
  
  // Template definition
  name: string;
  description?: string;
  type: 'conversation' | 'suggestions' | 'actions' | 'context' | 'settings' | 'custom';
  
  // Layout
  layoutType: 'list' | 'grid' | 'carousel' | 'accordion' | 'tabs' | 'custom';
  columns: number;
  rows?: number;
  itemSpacing: number;
  padding: number;
  
  // Styling
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderRadius: number;
  shadow: string;
  
  // Content structure
  contentSchema: Record<string, any>;
  defaultData?: Record<string, any>;
  
  // Component reference
  componentName?: string;
  componentProps?: Record<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface SheetHistoryEntry {
  id: string;
  
  // Entry metadata
  sheetId: string;
  sheetType: string;
  action: 'open' | 'close' | 'minimize' | 'maximize' | 'pin' | 'unpin' | 'transition';
  
  // Context
  domainId: string;
  contextId?: string;
  userId?: string;
  
  // State before/after
  stateBefore?: Record<string, any>;
  stateAfter?: Record<string, any>;
  
  // Timing
  timestamp: Date;
  duration?: number; // milliseconds
  
  createdAt: Date;
}

export interface SheetDeviceBehaviour {
  id: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  orientation: 'landscape' | 'portrait';
  
  // Sheet visibility
  showPersistentBar: boolean;
  barPosition: 'bottom' | 'top';
  barHeight: number;
  
  // Sheet positioning
  sheetPosition: 'above-bar' | 'full-screen' | 'content-area';
  sheetHeight: 'partial' | 'full' | 'auto';
  sheetMaxHeight: number;
  sheetMinHeight: number;
  
  // Sheet behaviour
  sheetCanSwipeDown: boolean;
  sheetShowChevron: boolean;
  sheetShowCloseButton: boolean;
  sheetAutoFocus: boolean;
  
  // Tooltip behaviour
  tooltipEnabled: boolean;
  tooltipPosition: 'above' | 'below';
  tooltipOffset: number;
  tooltipHideWhenSheetOpen: boolean;
  
  // Transitions
  openAnimation: 'slide-up' | 'slide-down' | 'fade';
  closeAnimation: 'slide-down' | 'slide-up' | 'fade';
  animationDuration: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// Default sheet device behaviours based on Module 4 specification
export const defaultSheetDeviceBehaviours: SheetDeviceBehaviour[] = [
  // Desktop
  {
    id: 'sheet-desktop',
    deviceType: 'desktop',
    orientation: 'landscape',
    showPersistentBar: true,
    barPosition: 'bottom',
    barHeight: 56,
    sheetPosition: 'above-bar',
    sheetHeight: 'partial',
    sheetMaxHeight: 600,
    sheetMinHeight: 300,
    sheetCanSwipeDown: false,
    sheetShowChevron: true,
    sheetShowCloseButton: true,
    sheetAutoFocus: false,
    tooltipEnabled: true,
    tooltipPosition: 'above',
    tooltipOffset: 10,
    tooltipHideWhenSheetOpen: true,
    openAnimation: 'slide-up',
    closeAnimation: 'slide-down',
    animationDuration: 300,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Tablet Landscape
  {
    id: 'sheet-tablet-landscape',
    deviceType: 'tablet',
    orientation: 'landscape',
    showPersistentBar: true,
    barPosition: 'bottom',
    barHeight: 56,
    sheetPosition: 'above-bar',
    sheetHeight: 'partial',
    sheetMaxHeight: 500,
    sheetMinHeight: 250,
    sheetCanSwipeDown: false,
    sheetShowChevron: true,
    sheetShowCloseButton: true,
    sheetAutoFocus: false,
    tooltipEnabled: true,
    tooltipPosition: 'above',
    tooltipOffset: 10,
    tooltipHideWhenSheetOpen: true,
    openAnimation: 'slide-up',
    closeAnimation: 'slide-down',
    animationDuration: 300,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Tablet Portrait
  {
    id: 'sheet-tablet-portrait',
    deviceType: 'tablet',
    orientation: 'portrait',
    showPersistentBar: false,
    barPosition: 'bottom',
    barHeight: 56,
    sheetPosition: 'full-screen',
    sheetHeight: 'full',
    sheetMaxHeight: 800,
    sheetMinHeight: 400,
    sheetCanSwipeDown: true,
    sheetShowChevron: true,
    sheetShowCloseButton: true,
    sheetAutoFocus: true,
    tooltipEnabled: true,
    tooltipPosition: 'above',
    tooltipOffset: 10,
    tooltipHideWhenSheetOpen: true,
    openAnimation: 'slide-up',
    closeAnimation: 'slide-down',
    animationDuration: 300,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Mobile
  {
    id: 'sheet-mobile',
    deviceType: 'mobile',
    orientation: 'portrait',
    showPersistentBar: false,
    barPosition: 'bottom',
    barHeight: 56,
    sheetPosition: 'full-screen',
    sheetHeight: 'full',
    sheetMaxHeight: 700,
    sheetMinHeight: 350,
    sheetCanSwipeDown: true,
    sheetShowChevron: true,
    sheetShowCloseButton: true,
    sheetAutoFocus: true,
    tooltipEnabled: true,
    tooltipPosition: 'above',
    tooltipOffset: 10,
    tooltipHideWhenSheetOpen: true,
    openAnimation: 'slide-up',
    closeAnimation: 'slide-down',
    animationDuration: 300,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Default sheet layering rules based on Module 4 specification
export const defaultSheetLayeringRules: SheetLayeringRule[] = [
  {
    id: 'layering-content',
    name: 'Content Layer',
    description: 'Base content layer',
    targetElement: 'content',
    zIndex: 1,
    hideWhenOtherVisible: [],
    showWhenOtherHidden: [],
    deviceTypes: ['desktop', 'tablet', 'mobile'],
    orientations: ['landscape', 'portrait'],
    domainIds: ['*'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'layering-right-panel',
    name: 'Right Panel Layer',
    description: 'Right panel overlay',
    targetElement: 'right-panel',
    zIndex: 2,
    hideWhenOtherVisible: [],
    showWhenOtherHidden: [],
    deviceTypes: ['desktop', 'tablet'],
    orientations: ['landscape'],
    domainIds: ['*'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'layering-ask-oscar-bar',
    name: 'Ask Oscar Bar Layer',
    description: 'Persistent Ask Oscar bar',
    targetElement: 'ask-oscar-bar',
    zIndex: 3,
    hideWhenOtherVisible: [],
    showWhenOtherHidden: [],
    deviceTypes: ['desktop', 'tablet', 'mobile'],
    orientations: ['landscape', 'portrait'],
    domainIds: ['*'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'layering-tooltip',
    name: 'Tooltip Layer',
    description: 'Tooltip overlay',
    targetElement: 'tooltip',
    zIndex: 4,
    hideWhenOtherVisible: ['sheet'],
    showWhenOtherHidden: ['sheet'],
    deviceTypes: ['desktop', 'tablet', 'mobile'],
    orientations: ['landscape', 'portrait'],
    domainIds: ['*'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'layering-sheet',
    name: 'Sheet Layer',
    description: 'Sheet overlay',
    targetElement: 'sheet',
    zIndex: 5,
    hideWhenOtherVisible: [],
    showWhenOtherHidden: [],
    deviceTypes: ['desktop', 'tablet', 'mobile'],
    orientations: ['landscape', 'portrait'],
    domainIds: ['*'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Default sheet content templates
export const defaultSheetContentTemplates: SheetContentTemplate[] = [
  {
    id: 'template-conversation',
    name: 'Conversation Sheet',
    description: 'Full chat history with scrollable conversation',
    type: 'conversation',
    layoutType: 'list',
    columns: 1,
    itemSpacing: 16,
    padding: 20,
    backgroundColor: '#ffffff',
    textColor: '#333333',
    borderColor: '#e5e7eb',
    borderRadius: 12,
    shadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    contentSchema: {
      messages: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            role: { type: 'string', enum: ['user', 'oscar', 'system', 'action'] },
            content: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    componentName: 'ConversationSheet',
    componentProps: {
      showTimestamps: true,
      showAvatars: true,
      bubbleStyle: 'rounded'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'template-suggestions',
    name: 'Suggestions Sheet',
    description: 'Context-aware prompt suggestions',
    type: 'suggestions',
    layoutType: 'grid',
    columns: 2,
    rows: 4,
    itemSpacing: 12,
    padding: 16,
    backgroundColor: '#f8fafc',
    textColor: '#334155',
    borderColor: '#e2e8f0',
    borderRadius: 8,
    shadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    contentSchema: {
      suggestions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            text: { type: 'string' },
            icon: { type: 'string' },
            category: { type: 'string' },
            relevance: { type: 'number', minimum: 0, maximum: 100 }
          }
        }
      }
    },
    componentName: 'SuggestionsSheet',
    componentProps: {
      showCategories: true,
      showIcons: true,
      maxSuggestions: 8
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'template-actions',
    name: 'Actions Sheet',
    description: 'Context actions like attach, summarise, extract',
    type: 'actions',
    layoutType: 'grid',
    columns: 3,
    rows: 2,
    itemSpacing: 8,
    padding: 16,
    backgroundColor: '#ffffff',
    textColor: '#1e293b',
    borderColor: '#cbd5e1',
    borderRadius: 8,
    shadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    contentSchema: {
      actions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            icon: { type: 'string' },
            actionType: { type: 'string' },
            requiresConfirmation: { type: 'boolean' }
          }
        }
      }
    },
    componentName: 'ActionsSheet',
    componentProps: {
      compact: true,
      showDescriptions: false,
      maxActions: 6
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Utility functions
export function getSheetDeviceBehaviour(
  deviceType: 'desktop' | 'tablet' | 'mobile',
  orientation: 'landscape' | 'portrait'
): SheetDeviceBehaviour | undefined {
  return defaultSheetDeviceBehaviours.find(
    behaviour => behaviour.deviceType === deviceType && behaviour.orientation === orientation
  );
}

export function getSheetLayeringRulesForDevice(
  deviceType: 'desktop' | 'tablet' | 'mobile',
  orientation: 'landscape' | 'portrait'
): SheetLayeringRule[] {
  return defaultSheetLayeringRules.filter(rule =>
    rule.deviceTypes.includes(deviceType) &&
    rule.orientations.includes(orientation)
  );
}

export function getSheetContentTemplate(type: string): SheetContentTemplate | undefined {
  return defaultSheetContentTemplates.find(template => template.type === type);
}

export function shouldShowTooltipWithSheet(
  deviceType: 'desktop' | 'tablet' | 'mobile',
  orientation: 'landscape' | 'portrait',
  sheetOpen: boolean
): boolean {
  const behaviour = getSheetDeviceBehaviour(deviceType, orientation);
  if (!behaviour) return false;
  
  if (sheetOpen) {
    return !behaviour.tooltipHideWhenSheetOpen;
  }
  
  return behaviour.tooltipEnabled;
}

export function getSheetHeightForDevice(
  deviceType: 'desktop' | 'tablet' | 'mobile',
  orientation: 'landscape' | 'portrait',
  sheetType: string
): 'partial' | 'full' | 'auto' {
  const behaviour = getSheetDeviceBehaviour(deviceType, orientation);
  if (!behaviour) return 'auto';
  
  // Conversation sheets are full height on mobile/tablet portrait
  if (sheetType === 'conversation' && (deviceType === 'mobile' || (deviceType === 'tablet' && orientation === 'portrait'))) {
    return 'full';
  }
  
  // Action sheets are partial height
  if (sheetType === 'actions') {
    return 'partial';
  }
  
  return behaviour.sheetHeight;
}