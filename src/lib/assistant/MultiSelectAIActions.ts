/**
 * Global Assistant Intelligence Layer – Multi‑Select AI Actions
 * Handles AI actions that apply to multiple selected items (notes, reports, tasks, blog posts).
 */
import { get } from 'svelte/store';
import { assistantStore } from './AssistantStore';
import { emitApplyContent, emitCreateNote, emitCreateTask } from './AssistantEventBus';
import type { SelectionContext } from './AssistantTypes';

export interface MultiSelectAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  handler: (selectedIds: string[], itemType: string) => Promise<void>;
  allowedItemTypes: ('note' | 'report' | 'task' | 'blogPost')[];
}

class MultiSelectAIActions {
  private actions: MultiSelectAction[] = [
    {
      id: 'mark-done',
      label: 'Mark as done',
      description: 'Mark all selected tasks as completed',
      icon: 'check',
      handler: async (selectedIds, itemType) => {
        console.log(`Marking ${selectedIds.length} ${itemType}(s) as done`);
        // In a real implementation, call an API to update tasks
      },
      allowedItemTypes: ['task'],
    },
    {
      id: 'tag-bs5837',
      label: 'Tag as BS5837',
      description: 'Apply BS5837 tag to selected notes/reports',
      icon: 'tag',
      handler: async (selectedIds, itemType) => {
        console.log(`Tagging ${selectedIds.length} ${itemType}(s) as BS5837`);
      },
      allowedItemTypes: ['note', 'report'],
    },
    {
      id: 'combine-report',
      label: 'Combine into report',
      description: 'Generate a combined report from selected projects',
      icon: 'merge',
      handler: async (selectedIds, itemType) => {
        console.log(`Combining ${selectedIds.length} ${itemType}(s) into a report`);
        // Emit an event to create a new report
        emitCreateTask(`Combined report from ${selectedIds.length} items`);
      },
      allowedItemTypes: ['report', 'note'],
    },
    {
      id: 'summarise',
      label: 'Summarise',
      description: 'Generate a summary of selected items',
      icon: 'summary',
      handler: async (selectedIds, itemType) => {
        console.log(`Summarising ${selectedIds.length} ${itemType}(s)`);
        // In a real implementation, call AI to generate summary
        const summary = `Summary of ${selectedIds.length} ${itemType}(s)`;
        // Apply summary to the first selected item (or create a new note)
        if (selectedIds.length > 0) {
          emitApplyContent(selectedIds[0], summary);
        }
      },
      allowedItemTypes: ['note', 'report', 'blogPost'],
    },
    {
      id: 'export-pdf',
      label: 'Export to PDF',
      description: 'Export selected items as a single PDF',
      icon: 'pdf',
      handler: async (selectedIds, itemType) => {
        console.log(`Exporting ${selectedIds.length} ${itemType}(s) to PDF`);
        // In a real implementation, trigger PDF export
      },
      allowedItemTypes: ['note', 'report', 'blogPost'],
    },
    {
      id: 'archive',
      label: 'Archive',
      description: 'Move selected items to archive',
      icon: 'archive',
      handler: async (selectedIds, itemType) => {
        console.log(`Archiving ${selectedIds.length} ${itemType}(s)`);
      },
      allowedItemTypes: ['note', 'report', 'task', 'blogPost'],
    },
  ];

  // Get available actions for the current selection
  getAvailableActions(): MultiSelectAction[] {
    const store = get(assistantStore);
    const selection = store.selectionContext;
    if (!selection || selection.selectedIds.length === 0) {
      return [];
    }
    return this.actions.filter(action =>
      action.allowedItemTypes.includes(selection.itemType as any)
    );
  }

  // Execute an action by ID
  async executeAction(actionId: string): Promise<{ success: boolean; message?: string }> {
    const store = get(assistantStore);
    const selection = store.selectionContext;
    if (!selection || selection.selectedIds.length === 0) {
      return { success: false, message: 'No selection' };
    }
    const action = this.actions.find(a => a.id === actionId);
    if (!action) {
      return { success: false, message: 'Action not found' };
    }
    if (!action.allowedItemTypes.includes(selection.itemType as any)) {
      return { success: false, message: `Action not allowed for ${selection.itemType}` };
    }
    try {
      await action.handler(selection.selectedIds, selection.itemType);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  // Suggest the most relevant action based on selection count and item type
  suggestAction(): MultiSelectAction | null {
    const available = this.getAvailableActions();
    if (available.length === 0) return null;
    // Simple heuristic: pick the first action that matches the item type
    return available[0];
  }

  // Register a custom action (for extensibility)
  registerAction(action: MultiSelectAction) {
    this.actions.push(action);
  }
}

// Singleton instance
export const multiSelectAIActions = new MultiSelectAIActions();

export default multiSelectAIActions;