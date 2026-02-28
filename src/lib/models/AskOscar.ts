/**
 * Module 3: Ask Oscar Data Models
 * 
 * Defines the core data structures for the Ask Oscar system including:
 * - Conversation history and messages
 * - Tooltip configurations and content
 * - Sheet configurations for Ask Oscar
 * - Action models and context
 * - Device-specific Ask Oscar behaviours
 */

export interface AskOscarMessage {
  id: string;
  conversationId: string;
  
  // Message content
  role: 'user' | 'oscar' | 'system' | 'action';
  content: string;
  contentType: 'text' | 'markdown' | 'html' | 'action';
  
  // Context
  domainId?: string;
  projectId?: string;
  itemId?: string;
  itemType?: string;
  
  // Actions
  actionType?: 'create' | 'summarise' | 'extract' | 'rewrite' | 'attach' | 'add' | 'generate' | 'navigate' | 'open';
  actionData?: Record<string, any>;
  actionResult?: Record<string, any>;
  actionStatus: 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled';
  
  // Metadata
  timestamp: Date;
  isEdited: boolean;
  editedAt?: Date;
  isPinned: boolean;
  
  // UI state
  isExpanded: boolean;
  showActions: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface AskOscarConversation {
  id: string;
  userId?: string;
  
  // Conversation metadata
  title: string;
  description?: string;
  tags: string[];
  
  // Context
  domainId: string;
  projectId?: string;
  itemId?: string;
  itemType?: string;
  
  // State
  isActive: boolean;
  isArchived: boolean;
  isPinned: boolean;
  
  // Statistics
  messageCount: number;
  lastMessageAt: Date;
  
  // UI state
  isExpanded: boolean;
  showInSidebar: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface AskOscarTooltip {
  id: string;
  
  // Content
  title: string;
  content: string;
  contentType: 'preview' | 'suggestion' | 'action' | 'context';
  
  // Positioning
  anchorElement: 'ask-oscar-bar' | 'input-field' | 'mic-button' | 'camera-button' | 'suggestions-button';
  position: 'above' | 'below' | 'left' | 'right';
  offsetX: number;
  offsetY: number;
  
  // Behaviour
  autoShow: boolean;
  autoHide: boolean;
  showDelay: number; // milliseconds
  hideDelay: number;
  maxWidth: number;
  
  // Context
  domainId?: string;
  contextData?: Record<string, any>;
  
  // State
  isVisible: boolean;
  isPinned: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface AskOscarSheet {
  id: string;
  
  // Sheet configuration
  type: 'conversation' | 'suggestions' | 'actions' | 'context' | 'settings';
  title: string;
  subtitle?: string;
  
  // Positioning and sizing
  deviceType: 'desktop' | 'tablet' | 'mobile';
  orientation: 'landscape' | 'portrait';
  height: 'partial' | 'full' | 'auto';
  maxHeight: number;
  minHeight: number;
  
  // Behaviour
  canSwipeDown: boolean;
  showChevron: boolean;
  showCloseButton: boolean;
  autoOpen: boolean;
  autoClose: boolean;
  
  // Content
  contentData?: Record<string, any>;
  conversationId?: string;
  
  // State
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface AskOscarAction {
  id: string;
  
  // Action definition
  type: 'create' | 'summarise' | 'extract' | 'rewrite' | 'attach' | 'add' | 'generate' | 'navigate' | 'open';
  title: string;
  description: string;
  icon: string;
  
  // Target
  targetType: 'project' | 'task' | 'note' | 'report' | 'file' | 'thread' | 'document' | 'campaign' | 'email' | 'location';
  targetId?: string;
  
  // Parameters
  parameters: Record<string, any>;
  requiredParameters: string[];
  
  // Execution
  handlerType: 'function' | 'api' | 'intent' | 'navigation';
  handlerName: string;
  handlerData?: Record<string, any>;
  
  // Context
  domainId: string;
  contextRules: string[];
  
  // State
  isEnabled: boolean;
  requiresConfirmation: boolean;
  confirmationMessage?: string;
  
  // Metadata
  usageCount: number;
  lastUsedAt?: Date;
  successRate: number; // 0-100
  
  createdAt: Date;
  updatedAt: Date;
}

export interface AskOscarContext {
  id: string;
  
  // Context source
  sourceType: 'domain' | 'item' | 'content' | 'metadata' | 'map' | 'recent';
  sourceId: string;
  
  // Context data
  data: Record<string, any>;
  dataType: 'json' | 'text' | 'html' | 'markdown' | 'geojson';
  
  // Relevance
  relevanceScore: number; // 0-100
  freshness: number; // milliseconds since last update
  confidence: number; // 0-100
  
  // Usage
  isActive: boolean;
  isReadOnly: boolean;
  canModify: boolean;
  
  // Relationships
  conversationId?: string;
  messageId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface AskOscarDeviceBehaviour {
  id: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  orientation: 'landscape' | 'portrait';
  
  // Bar visibility
  showPersistentBar: boolean;
  barPosition: 'bottom' | 'top' | 'floating';
  barHeight: number;
  barWidth: 'full' | 'auto' | 'fixed';
  barMaxWidth?: number;
  
  // Icons
  showCameraIcon: boolean;
  showMicIcon: boolean;
  showVoiceRecordIcon: boolean;
  showSuggestionsIcon: boolean;
  showSendIcon: boolean;
  
  // Tooltip behaviour
  tooltipEnabled: boolean;
  tooltipPosition: 'above' | 'below';
  tooltipOffset: number;
  
  // Sheet behaviour
  sheetHeight: 'partial' | 'full';
  sheetCanSwipeDown: boolean;
  sheetShowChevron: boolean;
  
  // Input behaviour
  inputAutoFocus: boolean;
  inputAutoExpand: boolean;
  inputMaxLines: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// Default Ask Oscar device behaviours based on Module 3 specification
export const defaultAskOscarDeviceBehaviours: AskOscarDeviceBehaviour[] = [
  // Desktop
  {
    id: 'ask-oscar-desktop',
    deviceType: 'desktop',
    orientation: 'landscape',
    showPersistentBar: true,
    barPosition: 'bottom',
    barHeight: 56,
    barWidth: 'full',
    showCameraIcon: false,
    showMicIcon: true,
    showVoiceRecordIcon: true,
    showSuggestionsIcon: true,
    showSendIcon: true,
    tooltipEnabled: true,
    tooltipPosition: 'above',
    tooltipOffset: 10,
    sheetHeight: 'partial',
    sheetCanSwipeDown: false,
    sheetShowChevron: true,
    inputAutoFocus: false,
    inputAutoExpand: true,
    inputMaxLines: 3,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Tablet Landscape
  {
    id: 'ask-oscar-tablet-landscape',
    deviceType: 'tablet',
    orientation: 'landscape',
    showPersistentBar: true,
    barPosition: 'bottom',
    barHeight: 56,
    barWidth: 'full',
    showCameraIcon: true,
    showMicIcon: true,
    showVoiceRecordIcon: true,
    showSuggestionsIcon: true,
    showSendIcon: true,
    tooltipEnabled: true,
    tooltipPosition: 'above',
    tooltipOffset: 10,
    sheetHeight: 'partial',
    sheetCanSwipeDown: false,
    sheetShowChevron: true,
    inputAutoFocus: false,
    inputAutoExpand: true,
    inputMaxLines: 3,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Tablet Portrait
  {
    id: 'ask-oscar-tablet-portrait',
    deviceType: 'tablet',
    orientation: 'portrait',
    showPersistentBar: false,
    barPosition: 'bottom',
    barHeight: 56,
    barWidth: 'full',
    showCameraIcon: false,
    showMicIcon: true,
    showVoiceRecordIcon: true,
    showSuggestionsIcon: true,
    showSendIcon: true,
    tooltipEnabled: true,
    tooltipPosition: 'above',
    tooltipOffset: 10,
    sheetHeight: 'full',
    sheetCanSwipeDown: true,
    sheetShowChevron: true,
    inputAutoFocus: true,
    inputAutoExpand: true,
    inputMaxLines: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Mobile
  {
    id: 'ask-oscar-mobile',
    deviceType: 'mobile',
    orientation: 'portrait',
    showPersistentBar: false,
    barPosition: 'bottom',
    barHeight: 56,
    barWidth: 'full',
    showCameraIcon: false,
    showMicIcon: true,
    showVoiceRecordIcon: true,
    showSuggestionsIcon: true,
    showSendIcon: true,
    tooltipEnabled: true,
    tooltipPosition: 'above',
    tooltipOffset: 10,
    sheetHeight: 'full',
    sheetCanSwipeDown: true,
    sheetShowChevron: true,
    inputAutoFocus: true,
    inputAutoExpand: true,
    inputMaxLines: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Default Ask Oscar actions based on Module 3 specification
export const defaultAskOscarActions: AskOscarAction[] = [
  {
    id: 'action-create-project',
    type: 'create',
    title: 'Create Project',
    description: 'Create a new project with the given details',
    icon: 'folder-plus',
    targetType: 'project',
    parameters: {
      name: { type: 'string', required: true },
      description: { type: 'string', required: false },
      client: { type: 'string', required: false },
      location: { type: 'string', required: false }
    },
    requiredParameters: ['name'],
    handlerType: 'function',
    handlerName: 'createProject',
    domainId: 'workspace',
    contextRules: ['workspace-context'],
    isEnabled: true,
    requiresConfirmation: true,
    confirmationMessage: 'Create a new project?',
    usageCount: 0,
    successRate: 100,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'action-create-task',
    type: 'create',
    title: 'Create Task',
    description: 'Create a new task with the given details',
    icon: 'check-circle',
    targetType: 'task',
    parameters: {
      title: { type: 'string', required: true },
      content: { type: 'string', required: false },
      priority: { type: 'string', enum: ['low', 'medium', 'high'], required: false },
      dueDate: { type: 'date', required: false }
    },
    requiredParameters: ['title'],
    handlerType: 'function',
    handlerName: 'createTask',
    domainId: 'workspace',
    contextRules: ['workspace-context', 'project-context'],
    isEnabled: true,
    requiresConfirmation: true,
    confirmationMessage: 'Create a new task?',
    usageCount: 0,
    successRate: 100,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'action-create-note',
    type: 'create',
    title: 'Create Note',
    description: 'Create a new note with the given content',
    icon: 'file-text',
    targetType: 'note',
    parameters: {
      title: { type: 'string', required: true },
      content: { type: 'string', required: true },
      tags: { type: 'array', required: false }
    },
    requiredParameters: ['title', 'content'],
    handlerType: 'function',
    handlerName: 'createNote',
    domainId: 'workspace',
    contextRules: ['workspace-context', 'project-context'],
    isEnabled: true,
    requiresConfirmation: true,
    confirmationMessage: 'Create a new note?',
    usageCount: 0,
    successRate: 100,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'action-summarise',
    type: 'summarise',
    title: 'Summarise',
    description: 'Summarise the selected content',
    icon: 'file-text',
    targetType: 'document',
    parameters: {
      content: { type: 'string', required: true },
      length: { type: 'string', enum: ['short', 'medium', 'long'], required: false }
    },
    requiredParameters: ['content'],
    handlerType: 'api',
    handlerName: 'summariseContent',
    domainId: 'workspace',
    contextRules: ['content-context'],
    isEnabled: true,
    requiresConfirmation: false,
    usageCount: 0,
    successRate: 100,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'action-extract-tasks',
    type: 'extract',
    title: 'Extract Tasks',
    description: 'Extract tasks from the selected content',
    icon: 'list',
    targetType: 'document',
    parameters: {
      content: { type: 'string', required: true }
    },
    requiredParameters: ['content'],
    handlerType: 'api',
    handlerName: 'extractTasks',
    domainId: 'workspace',
    contextRules: ['content-context'],
    isEnabled: true,
    requiresConfirmation: true,
    confirmationMessage: 'Extract tasks from this content?',
    usageCount: 0,
    successRate: 100,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'action-rewrite',
    type: 'rewrite',
    title: 'Rewrite',
    description: 'Rewrite the selected content',
    icon: 'edit',
    targetType: 'document',
    parameters: {
      content: { type: 'string', required: true },
      tone: { type: 'string', enum: ['formal', 'casual', 'professional', 'friendly'], required: false },
      length: { type: 'string', enum: ['shorter', 'same', 'longer'], required: false }
    },
    requiredParameters: ['content'],
    handlerType: 'api',
    handlerName: 'rewriteContent',
    domainId: 'workspace',
    contextRules: ['content-context'],
    isEnabled: true,
    requiresConfirmation: false,
    usageCount: 0,
    successRate: 100,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'action-attach-to-project',
    type: 'attach',
    title: 'Attach to Project',
    description: 'Attach the selected item to a project',
    icon: 'link',
    targetType: 'project',
    parameters: {
      itemId: { type: 'string', required: true },
      itemType: { type: 'string', required: true },
      projectId: { type: 'string', required: true }
    },
    requiredParameters: ['itemId', 'itemType', 'projectId'],
    handlerType: 'function',
    handlerName: 'attachToProject',
    domainId: 'workspace',
    contextRules: ['item-context', 'project-context'],
    isEnabled: true,
    requiresConfirmation: true,
    confirmationMessage: 'Attach this item to the project?',
    usageCount: 0,
    successRate: 100,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'action-add-to-report',
    type: 'add',
    title: 'Add to Report',
    description: 'Add the selected content to a report',
    icon: 'bar-chart',
    targetType: 'report',
    parameters: {
      content: { type: 'string', required: true },
      reportId: { type: 'string', required: true },
      section: { type: 'string', required: false }
    },
    requiredParameters: ['content', 'reportId'],
    handlerType: 'function',
    handlerName: 'addToReport',
    domainId: 'workspace',
    contextRules: ['content-context', 'report-context'],
    isEnabled: true,
    requiresConfirmation: true,
    confirmationMessage: 'Add this content to the report?',
    usageCount: 0,
    successRate: 100,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'action-generate-content',
    type: 'generate',
    title: 'Generate Content',
    description: 'Generate content based on the given prompt',
    icon: 'file-plus',
    targetType: 'document',
    parameters: {
      prompt: { type: 'string', required: true },
      length: { type: 'string', enum: ['short', 'medium', 'long'], required: false },
      format: { type: 'string', enum: ['paragraph', 'list', 'bullet', 'email'], required: false }
    },
    requiredParameters: ['prompt'],
    handlerType: 'api',
    handlerName: 'generateContent',
    domainId: 'workspace',
    contextRules: ['content-context'],
    isEnabled: true,
    requiresConfirmation: false,
    usageCount: 0,
    successRate: 100,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'action-navigate-to',
    type: 'navigate',
    title: 'Navigate To',
    description: 'Navigate to a specific location or item',
    icon: 'navigation',
    targetType: 'location',
    parameters: {
      destination: { type: 'string', required: true },
      itemId: { type: 'string', required: false },
      itemType: { type: 'string', required: false }
    },
    requiredParameters: ['destination'],
    handlerType: 'navigation',
    handlerName: 'navigateTo',
    domainId: 'navigation',
    contextRules: ['navigation-context'],
    isEnabled: true,
    requiresConfirmation: false,
    usageCount: 0,
    successRate: 100,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'action-open-item',
    type: 'open',
    title: 'Open Item',
    description: 'Open a specific item',
    icon: 'external-link',
    targetType: 'document',
    parameters: {
      itemId: { type: 'string', required: true },
      itemType: { type: 'string', required: true }
    },
    requiredParameters: ['itemId', 'itemType'],
    handlerType: 'function',
    handlerName: 'openItem',
    domainId: 'workspace',
    contextRules: ['item-context'],
    isEnabled: true,
    requiresConfirmation: false,
    usageCount: 0,
    successRate: 100,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];