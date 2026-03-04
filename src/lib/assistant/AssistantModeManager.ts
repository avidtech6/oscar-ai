/**
 * Global Assistant Intelligence Layer – Mode Manager
 * Handles Chat Mode vs Context Mode switching and contextual chat history.
 */
import { get } from 'svelte/store';
import { assistantStore, assistantActions } from './AssistantStore';
import type { AssistantMode, PageContext } from './AssistantTypes';

class AssistantModeManager {
  // Switch between Chat Mode and Context Mode
  switchMode(mode: AssistantMode) {
    assistantActions.setMode(mode);
    if (mode === 'chat') {
      // When entering chat mode, we may want to slide the page into background
      this.enterChatMode();
    } else {
      // When returning to context mode, restore the page
      this.exitChatMode();
    }
  }

  // Enter Chat Mode: page slides into background, chat window becomes primary
  private enterChatMode() {
    // In a real implementation, you'd trigger a UI transition
    console.log('[Assistant] Entering Chat Mode');
    // For now, we just update the store
    assistantActions.setPanelExpanded(true);
  }

  // Exit Chat Mode: return to context mode
  private exitChatMode() {
    console.log('[Assistant] Exiting Chat Mode');
    assistantActions.setPanelExpanded(false);
  }

  // Determine if we should switch to chat mode based on user input
  shouldSwitchToChatMode(userInput: string): boolean {
    // Simple heuristic: if the input is a general question (doesn't contain context‑specific keywords)
    const contextKeywords = ['rewrite', 'insert', 'summarise', 'tag', 'mark', 'export', 'generate'];
    const hasContextKeyword = contextKeywords.some(keyword => userInput.toLowerCase().includes(keyword));
    return !hasContextKeyword && userInput.trim().length > 0;
  }

  // Handle a user message: decide whether to stay in context mode or switch to chat
  handleUserMessage(message: string, currentContext: PageContext | null): AssistantMode {
    const shouldChat = this.shouldSwitchToChatMode(message);
    if (shouldChat && currentContext) {
      // We have context but the question is general → switch to chat mode
      this.switchMode('chat');
      return 'chat';
    } else if (!shouldChat && currentContext) {
      // Context‑specific action → stay in context mode
      this.switchMode('context');
      return 'context';
    } else {
      // No context, general question → chat mode
      this.switchMode('chat');
      return 'chat';
    }
  }

  // After a chat conversation, ask if the user wants to apply the result to the current item
  async promptApplyToItem(itemId: string, conversationSummary: string): Promise<boolean> {
    // In a real implementation, this would show a UI prompt
    console.log(`[Assistant] Apply this to item ${itemId}? Summary: ${conversationSummary}`);
    // Mock: assume user says yes for now
    return true;
  }

  // Apply chat result to the current item
  applyChatResultToItem(itemId: string, content: string) {
    // Emit an event to apply content
    import('./AssistantEventBus').then(({ emitApplyContent }) => {
      emitApplyContent(itemId, content);
    });
    // Show one‑bubble confirmation
    console.log('[Assistant] Content added.');
  }

  // Get contextual chat history for a specific item
  getContextualChatHistory(itemId: string): string[] {
    const store = get(assistantStore);
    return store.contextualChatHistory.get(itemId) || [];
  }

  // Clear contextual chat history for a specific item
  clearContextualChatHistory(itemId?: string) {
    assistantActions.clearContextualChatHistory(itemId);
  }

  // Add a message to contextual chat history
  addContextualMessage(itemId: string, message: string) {
    assistantActions.addContextualChatMessage(itemId, message);
  }
}

// Singleton instance
export const assistantModeManager = new AssistantModeManager();

export default assistantModeManager;