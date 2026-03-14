/**
 * Assistant Event Bus Orchestrator - Layer 1
 * Orchestrates core event bus functionality with state management.
 */
import type { AssistantEvent } from './AssistantTypes';
import { AssistantEventBusCore } from './AssistantEventBusCore';
import { AssistantEventBusState } from './AssistantEventBusState';
import { assistantActions } from './AssistantStore';

export class AssistantEventBusOrchestrator {
  private core: AssistantEventBusCore;
  private state: AssistantEventBusState;

  constructor() {
    this.core = new AssistantEventBusCore();
    this.state = new AssistantEventBusState();
  }

  // Public API: emit events
  emit(event: AssistantEvent) {
    this.core.emit(event);
    this.handleStoreUpdate(event);
  }

  // Public API: subscribe to events
  on(eventType: string, handler: (event: AssistantEvent) => void) {
    return this.core.on(eventType, handler);
  }

  // Public API: unsubscribe
  off(eventType: string, handler: (event: AssistantEvent) => void) {
    this.core.off(eventType, handler);
  }

  // Handle store updates based on events
  private handleStoreUpdate(event: AssistantEvent) {
    switch (event.type) {
      case 'pageChange':
        assistantActions.setPageContext(event.context);
        this.state.updateContextChips(event.context);
        this.state.updateSmartHints(event.context);
        break;
      case 'itemOpen':
        assistantActions.setPageContext({
          page: 'unknown',
          itemId: event.itemId,
          itemType: event.itemType,
        });
        this.state.updateContextChipsForItem(event.itemId, event.itemType);
        break;
      case 'itemClose':
        assistantActions.setPageContext(null);
        assistantActions.setContextChips([]);
        break;
      case 'selectionChange':
        assistantActions.setSelectionContext({
          selectedIds: event.selectedIds,
          itemType: event.itemType,
        });
        this.state.updateContextChipsForSelection(event.selectedIds, event.itemType);
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
        // These are actions that the assistant can perform; they may trigger micro-cues
        this.state.showOneBubbleConfirmation(event.type);
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
}