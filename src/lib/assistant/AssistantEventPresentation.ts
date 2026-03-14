/**
 * Global Assistant Intelligence Layer – Event Presentation (Layer 2)
 * UI-facing event handlers, context chip updates, smart hint updates, bubble confirmations, and presentation-state logic.
 */
import type { PageContext } from './AssistantTypes';
import { assistantActions } from './AssistantStore';

export class AssistantEventPresentation {
  // Helper: update context chips based on page context
  updateContextChips(context: PageContext) {
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
  updateContextChipsForItem(itemId: string, itemType: string) {
    const chips = [
      { label: itemType.charAt(0).toUpperCase() + itemType.slice(1), count: undefined, color: 'blue', icon: itemType },
      { label: `Item`, count: undefined, color: 'gray', icon: 'item' },
    ];
    assistantActions.setContextChips(chips);
  }

  // Helper: update context chips for selection
  updateContextChipsForSelection(selectedIds: string[], itemType: string) {
    const chips = [
      { label: itemType.charAt(0).toUpperCase() + itemType.slice(1), count: selectedIds.length, color: 'green', icon: 'selection' },
    ];
    assistantActions.setContextChips(chips);
  }

  // Helper: update smart hints based on context
  updateSmartHints(context: PageContext) {
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

  // Helper: show one-bubble confirmation
  showOneBubbleConfirmation(actionType: string) {
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