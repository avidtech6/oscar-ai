/**
 * Global Assistant Intelligence Layer – Contextual Chat History
 * Manages chat history per item (note, report, task, blog post) and provides filtered views.
 */
import { get } from 'svelte/store';
import { assistantStore, assistantActions } from './AssistantStore';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  contextItemId?: string;
  contextItemType?: string;
}

class ContextualChatHistory {
  // Get chat history for a specific item
  getHistory(itemId: string): ChatMessage[] {
    const store = get(assistantStore);
    const rawMessages = store.contextualChatHistory.get(itemId) || [];
    // Convert raw strings to ChatMessage objects (simplified)
    return rawMessages.map((msg, index) => ({
      id: `${itemId}-${index}`,
      role: index % 2 === 0 ? 'user' : 'assistant', // naive assumption
      content: msg,
      timestamp: new Date(),
      contextItemId: itemId,
    }));
  }

  // Add a message to an item's history
  addMessage(itemId: string, message: string, role: 'user' | 'assistant' = 'user') {
    // Store as plain string (simplified)
    assistantActions.addContextualChatMessage(itemId, `[${role}] ${message}`);
  }

  // Clear history for an item or all items
  clearHistory(itemId?: string) {
    assistantActions.clearContextualChatHistory(itemId);
  }

  // Get all items that have chat history
  getItemsWithHistory(): string[] {
    const store = get(assistantStore);
    return Array.from(store.contextualChatHistory.keys());
  }

  // Merge two item histories (e.g., when merging notes)
  mergeHistories(sourceItemId: string, targetItemId: string) {
    const sourceHistory = this.getHistory(sourceItemId);
    const targetHistory = this.getHistory(targetItemId);
    const merged = [...targetHistory, ...sourceHistory];
    // Clear both and set merged history on target
    this.clearHistory(sourceItemId);
    this.clearHistory(targetItemId);
    merged.forEach(msg => {
      this.addMessage(targetItemId, msg.content, msg.role);
    });
  }

  // Export history for an item as plain text
  exportAsText(itemId: string): string {
    const history = this.getHistory(itemId);
    return history.map(msg => `${msg.role}: ${msg.content}`).join('\n');
  }

  // Export history for an item as JSON
  exportAsJson(itemId: string): string {
    const history = this.getHistory(itemId);
    return JSON.stringify(history, null, 2);
  }

  // Search across all histories for a keyword
  search(keyword: string): { itemId: string; message: ChatMessage }[] {
    const results: { itemId: string; message: ChatMessage }[] = [];
    const store = get(assistantStore);
    for (const [itemId, messages] of store.contextualChatHistory.entries()) {
      messages.forEach((msg, index) => {
        if (msg.toLowerCase().includes(keyword.toLowerCase())) {
          results.push({
            itemId,
            message: {
              id: `${itemId}-${index}`,
              role: index % 2 === 0 ? 'user' : 'assistant',
              content: msg,
              timestamp: new Date(),
              contextItemId: itemId,
            },
          });
        }
      });
    }
    return results;
  }

  // Get the most recent conversation across all items
  getMostRecentConversation(): { itemId: string; messages: ChatMessage[] } | null {
    const items = this.getItemsWithHistory();
    if (items.length === 0) return null;
    // Simple implementation: pick the first item
    const itemId = items[0];
    return { itemId, messages: this.getHistory(itemId) };
  }
}

// Singleton instance
export const contextualChatHistory = new ContextualChatHistory();

export default contextualChatHistory;