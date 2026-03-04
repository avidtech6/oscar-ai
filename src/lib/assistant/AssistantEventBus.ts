/**
 * Global Assistant Intelligence Layer – Event Bus
 * Implements the event model for context switching and assistant actions.
 */
import { get } from 'svelte/store';
import assistantStore, { assistantActions } from './AssistantStore';
import type { AssistantEvent, PageContext } from './AssistantTypes';

type EventHandler = (event: AssistantEvent) => void;

class AssistantEventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  constructor() {
    // Subscribe to internal store changes to emit events
    this.setupInternalListeners();
  }

  // Public API: emit events
  emit(event: AssistantEvent) {
    const eventType = event.type;
    const handlers = this.handlers.get(eventType) || [];
    handlers.forEach(handler => handler(event));

    // Update store based on event
    this.handleStoreUpdate(event);
  }

  // Public API: subscribe to events
  on(eventType: string, handler: EventHandler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
    return () => this.off(eventType, handler);
  }

  // Public API: unsubscribe
  off(eventType: string, handler: EventHandler) {
    const handlers = this.handlers.get(eventType);
    if (!handlers) return;
    const index = handlers.indexOf(handler);
    if (index > -1) handlers.splice(index, 1);
  }

  // Internal: update store based on event
  private handleStoreUpdate(event: AssistantEvent) {
    switch (event.type) {
      case 'pageChange':
        assistantActions.setPageContext(event.context);
        this.updateContextChips(event.context);
        this.updateSmartHints(event.context);
        break;
      case 'itemOpen':
        assistantActions.setPageContext({
          page: 'unknown',
          itemId: event.itemId,
          itemType: event.itemType as any,
        });
        this.updateContextChipsForItem(event.itemId, event.itemType);
        break;
      case 'itemClose':
        assistantActions.setPageContext(null);
        assistantActions.setContextChips([]);
        break;
      case 'selectionChange':
        assistantActions.setSelectionContext({
          selectedIds: event.selectedIds,
          itemType: event.itemType as any,
        });
        this.updateContextChipsForSelection(event.selectedIds, event.itemType);
        break;
      case 'modalOpen':
        assistantActions.attachToModal(event.itemId);
        break;
      case 'modalClose':
        assistantActions.detachFromModal();
        break;
      case 'applyContent':
      case 'rewriteSection':
      case 'insertImage':
      case 'createNote':
      case 'createTask':
        // These are actions that the assistant can perform; they may trigger micro‑cues
        this.showOneBubbleConfirmation(event.type);
        break;
      case 'nudge':
        assistantActions.setMicroCue({
          type: 'nudge',
          message: event.message,
          visible: true,
        });
        break;
    }
  }

  // Internal: set up listeners for store changes (e.g., when page changes externally)
  private setupInternalListeners() {
    // In a real implementation, you'd listen to router changes, selection changes, etc.
    // This is a placeholder for integration points.
  }

  // Helper: update context chips based on page context
  private updateContextChips(context: PageContext) {
    const chips = [];
    if (context.page === 'notes') {
      chips.push({ label: 'Notes', count: undefined, color: 'blue', icon: 'note' });
    } else if (context.page === 'reports') {
      chips.push({ label: 'Reports', count: undefined, color: 'green', icon: 'report' });
    } else if (context.page === 'tasks') {
      chips.push({ label: 'Tasks', count: undefined, color: 'orange', icon: 'task' });
    } else if (context.page === 'blog') {
      chips.push({ label: 'Blog Writer', count: undefined, color: 'purple', icon: 'blog' });
    }
    if (context.itemId) {
      chips.push({ label: `Item: ${context.itemId.slice(0, 8)}`, count: undefined, color: 'gray', icon: 'item' });
    }
    assistantActions.setContextChips(chips);
  }

  // Helper: update context chips for item
  private updateContextChipsForItem(itemId: string, itemType: string) {
    const chips = [
      { label: itemType.charAt(0).toUpperCase() + itemType.slice(1), count: undefined, color: 'blue', icon: itemType },
      { label: `Item`, count: undefined, color: 'gray', icon: 'item' },
    ];
    assistantActions.setContextChips(chips);
  }

  // Helper: update context chips for selection
  private updateContextChipsForSelection(selectedIds: string[], itemType: string) {
    const chips = [
      { label: itemType.charAt(0).toUpperCase() + itemType.slice(1), count: selectedIds.length, color: 'green', icon: 'selection' },
    ];
    assistantActions.setContextChips(chips);
  }

  // Helper: update smart hints based on context
  private updateSmartHints(context: PageContext) {
    const hints = [];
    if (context.page === 'notes') {
      hints.push({ text: 'Summarise selected notes', priority: 1 });
      hints.push({ text: 'Tag all as BS5837', priority: 2 });
      hints.push({ text: 'Export to PDF', priority: 3 });
    } else if (context.page === 'reports') {
      hints.push({ text: 'Rewrite selected section', priority: 1 });
      hints.push({ text: 'Insert image from Gallery', priority: 2 });
      hints.push({ text: 'Generate compliance checklist', priority: 3 });
    } else if (context.page === 'tasks') {
      hints.push({ text: 'Mark all selected tasks as done', priority: 1 });
      hints.push({ text: 'Assign to team member', priority: 2 });
    } else {
      hints.push({ text: 'Ask Oscar AI anything', priority: 1 });
    }
    assistantActions.setSmartHints(hints);
  }

  // Helper: show one‑bubble confirmation
  private showOneBubbleConfirmation(actionType: string) {
    const messages: Record<string, string> = {
      applyContent: 'Content added.',
      rewriteSection: 'Section rewritten.',
      insertImage: 'Image inserted.',
      createNote: 'Note created.',
      createTask: 'Task created.',
    };
    const message = messages[actionType] || 'Action completed.';
    // In a real implementation, you'd show a transient bubble in the UI.
    console.log(`[Assistant] ${message}`);
  }
}

// Singleton instance
export const assistantEventBus = new AssistantEventBus();

// Convenience functions for common events
export const emitPageChange = (context: PageContext) =>
  assistantEventBus.emit({ type: 'pageChange', context });

export const emitItemOpen = (itemId: string, itemType: string) =>
  assistantEventBus.emit({ type: 'itemOpen', itemId, itemType });

export const emitItemClose = () =>
  assistantEventBus.emit({ type: 'itemClose' });

export const emitSelectionChange = (selectedIds: string[], itemType: string) =>
  assistantEventBus.emit({ type: 'selectionChange', selectedIds, itemType });

export const emitModalOpen = (itemId: string, itemType: string) =>
  assistantEventBus.emit({ type: 'modalOpen', itemId, itemType });

export const emitModalClose = () =>
  assistantEventBus.emit({ type: 'modalClose' });

export const emitApplyContent = (itemId: string, content: string) =>
  assistantEventBus.emit({ type: 'applyContent', itemId, content });

export const emitRewriteSection = (itemId: string, sectionId: string, content: string) =>
  assistantEventBus.emit({ type: 'rewriteSection', itemId, sectionId, content });

export const emitInsertImage = (itemId: string, imageId: string, position: number) =>
  assistantEventBus.emit({ type: 'insertImage', itemId, imageId, position });

export const emitCreateNote = (content: string) =>
  assistantEventBus.emit({ type: 'createNote', content });

export const emitCreateTask = (content: string) =>
  assistantEventBus.emit({ type: 'createTask', content });

export const emitNudge = (nudgeType: string, message: string) =>
  assistantEventBus.emit({ type: 'nudge', nudgeType, message });

export default assistantEventBus;