/**
 * Global Assistant Intelligence Layer – TypeScript definitions
 */

export type AssistantMode = 'context' | 'chat';

export interface PageContext {
  page: 'notes' | 'reports' | 'tasks' | 'blog' | 'dashboard' | 'intelligence' | 'unknown';
  itemId?: string;
  itemType?: 'note' | 'report' | 'task' | 'blogPost';
  sectionId?: string;
}

export interface SelectionContext {
  selectedIds: string[];
  itemType: 'note' | 'report' | 'task' | 'blogPost';
}

export interface ContextChip {
  label: string;
  count?: number;
  color: string;
  icon?: string;
}

export interface SmartHint {
  text: string;
  action?: () => void;
  priority: number;
}

export interface MicroCue {
  type: 'nudge' | 'clarification' | 'glow' | 'pulse';
  message?: string;
  visible: boolean;
}

export interface AssistantState {
  // Bar visibility
  barVisible: boolean;
  panelExpanded: boolean;
  // Mode
  mode: AssistantMode;
  // Context
  pageContext: PageContext | null;
  selectionContext: SelectionContext | null;
  contextChips: ContextChip[];
  // Hints & cues
  smartHints: SmartHint[];
  currentHintIndex: number;
  microCue: MicroCue | null;
  // Chat history
  contextualChatHistory: Map<string, string[]>; // itemId → messages
  // UI state
  isAttachedToModal: boolean;
  modalItemId?: string;
}

export type AssistantEvent =
  | { type: 'pageChange'; context: PageContext }
  | { type: 'itemOpen'; itemId: string; itemType: string }
  | { type: 'itemClose' }
  | { type: 'selectionChange'; selectedIds: string[]; itemType: string }
  | { type: 'modalOpen'; itemId: string; itemType: string }
  | { type: 'modalClose' }
  | { type: 'applyContent'; itemId: string; content: string }
  | { type: 'rewriteSection'; itemId: string; sectionId: string; content: string }
  | { type: 'insertImage'; itemId: string; imageId: string; position: number }
  | { type: 'createNote'; content: string }
  | { type: 'createTask'; content: string }
  | { type: 'nudge'; nudgeType: string; message: string };

export interface AssistantAction {
  name: string;
  description: string;
  handler: (context: AssistantState) => Promise<void> | void;
  multiSelect?: boolean;
}