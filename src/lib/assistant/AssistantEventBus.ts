/**
 * Global Assistant Intelligence Layer – Event Bus (Orchestrator)
 * Orchestrates Layer 1 (core event logic) and Layer 2 (presentation logic).
 */
import { AssistantEventCore } from './AssistantEventCore';
import { AssistantEventPresentation } from './AssistantEventPresentation';
import type { AssistantEvent } from './AssistantTypes';

class AssistantEventBus {
  private core: AssistantEventCore;
  private presentation: AssistantEventPresentation;

  constructor() {
    this.core = new AssistantEventCore();
    this.presentation = new AssistantEventPresentation();
    this.setupInternalListeners();
  }

  // Public API: emit events (delegated to Layer 1)
  emit(event: AssistantEvent) {
    this.core.emit(event);
    this.handleStoreUpdate(event);
  }

  // Public API: subscribe to events (delegated to Layer 1)
  on(eventType: string, handler: (event: AssistantEvent) => void) {
    return this.core.on(eventType, handler);
  }

  // Public API: unsubscribe (delegated to Layer 1)
  off(eventType: string, handler: (event: AssistantEvent) => void) {
    this.core.off(eventType, handler);
  }

  // Internal: update store based on event (delegated to Layer 2)
  private handleStoreUpdate(event: AssistantEvent) {
    switch (event.type) {
      case 'pageChange':
        this.presentation.updateContextChips(event.context);
        this.presentation.updateSmartHints(event.context);
        break;
      case 'itemOpen':
        this.presentation.updateContextChipsForItem(event.itemId, event.itemType);
        break;
      case 'itemClose':
        // handled by core logic
        break;
      case 'selectionChange':
        this.presentation.updateContextChipsForSelection(event.selectedIds, event.itemType);
        break;
      case 'modalOpen':
      case 'modalClose':
        // handled by core logic
        break;
      case 'applyContent':
      case 'rewriteSection':
      case 'insertImage':
      case 'createNote':
      case 'createTask':
        this.presentation.showOneBubbleConfirmation(event.type);
        break;
      case 'nudge':
        // handled by core logic
        break;
    }
  }

  // Internal: set up listeners for store changes
  private setupInternalListeners() {
    // In a real implementation, you'd listen to router changes, selection changes, etc.
    // This is a placeholder for integration points.
  }
}

// Singleton instance
export const assistantEventBus = new AssistantEventBus();

// Convenience functions for common events
export const emitPageChange = (context: any) =>
  assistantEventBus.emit({ type: 'pageChange', context });

export const emitItemOpen = (itemId: string, itemType: any) =>
  assistantEventBus.emit({ type: 'itemOpen', itemId, itemType });

export const emitItemClose = () =>
  assistantEventBus.emit({ type: 'itemClose' });

export const emitSelectionChange = (selectedIds: string[], itemType: any) =>
  assistantEventBus.emit({ type: 'selectionChange', selectedIds, itemType });

export const emitModalOpen = (itemId: string, itemType: any) =>
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

export const emitNudge = (message: string) =>
  assistantEventBus.emit({ type: 'nudge', message });

export default assistantEventBus;