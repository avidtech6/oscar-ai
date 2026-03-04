/**
 * Global Assistant Intelligence Layer – Store (Svelte writable)
 */
import { writable, derived } from 'svelte/store';
import type { AssistantState, AssistantMode, PageContext, SelectionContext, ContextChip, SmartHint, MicroCue } from './AssistantTypes';

const initialAssistantState: AssistantState = {
  barVisible: true,
  panelExpanded: false,
  mode: 'context',
  pageContext: null,
  selectionContext: null,
  contextChips: [],
  smartHints: [],
  currentHintIndex: 0,
  microCue: null,
  contextualChatHistory: new Map(),
  isAttachedToModal: false,
  modalItemId: undefined,
};

// Main store
export const assistantStore = writable<AssistantState>(initialAssistantState);

// Derived stores
export const barVisible = derived(assistantStore, $store => $store.barVisible);
export const panelExpanded = derived(assistantStore, $store => $store.panelExpanded);
export const mode = derived(assistantStore, $store => $store.mode);
export const pageContext = derived(assistantStore, $store => $store.pageContext);
export const selectionContext = derived(assistantStore, $store => $store.selectionContext);
export const contextChips = derived(assistantStore, $store => $store.contextChips);
export const smartHints = derived(assistantStore, $store => $store.smartHints);
export const currentHint = derived(
  assistantStore,
  $store => $store.smartHints[$store.currentHintIndex] || null
);
export const microCue = derived(assistantStore, $store => $store.microCue);
export const isAttachedToModal = derived(assistantStore, $store => $store.isAttachedToModal);
export const modalItemId = derived(assistantStore, $store => $store.modalItemId);

// Actions
export const assistantActions = {
  setBarVisible(visible: boolean) {
    assistantStore.update(state => ({ ...state, barVisible: visible }));
  },
  setPanelExpanded(expanded: boolean) {
    console.log('[Assistant] setPanelExpanded', expanded);
    assistantStore.update(state => ({ ...state, panelExpanded: expanded }));
  },
  setMode(mode: AssistantMode) {
    assistantStore.update(state => ({ ...state, mode }));
  },
  setPageContext(context: PageContext | null) {
    assistantStore.update(state => ({ ...state, pageContext: context }));
  },
  setSelectionContext(context: SelectionContext | null) {
    assistantStore.update(state => ({ ...state, selectionContext: context }));
  },
  setContextChips(chips: ContextChip[]) {
    assistantStore.update(state => ({ ...state, contextChips: chips }));
  },
  setSmartHints(hints: SmartHint[]) {
    assistantStore.update(state => ({ ...state, smartHints: hints, currentHintIndex: 0 }));
  },
  rotateHint() {
    assistantStore.update(state => {
      if (state.smartHints.length === 0) return state;
      const nextIndex = (state.currentHintIndex + 1) % state.smartHints.length;
      return { ...state, currentHintIndex: nextIndex };
    });
  },
  setMicroCue(cue: MicroCue | null) {
    assistantStore.update(state => ({ ...state, microCue: cue }));
  },
  addContextualChatMessage(itemId: string, message: string) {
    assistantStore.update(state => {
      const history = new Map(state.contextualChatHistory);
      const messages = history.get(itemId) || [];
      messages.push(message);
      history.set(itemId, messages);
      return { ...state, contextualChatHistory: history };
    });
  },
  clearContextualChatHistory(itemId?: string) {
    assistantStore.update(state => {
      const history = new Map(state.contextualChatHistory);
      if (itemId) {
        history.delete(itemId);
      } else {
        history.clear();
      }
      return { ...state, contextualChatHistory: history };
    });
  },
  attachToModal(itemId: string) {
    assistantStore.update(state => ({
      ...state,
      isAttachedToModal: true,
      modalItemId: itemId,
    }));
  },
  detachFromModal() {
    assistantStore.update(state => ({
      ...state,
      isAttachedToModal: false,
      modalItemId: undefined,
    }));
  },
};

// Export store instance
export default {
  store: assistantStore,
  barVisible,
  panelExpanded,
  mode,
  pageContext,
  selectionContext,
  contextChips,
  smartHints,
  currentHint,
  microCue,
  isAttachedToModal,
  modalItemId,
  ...assistantActions,
};