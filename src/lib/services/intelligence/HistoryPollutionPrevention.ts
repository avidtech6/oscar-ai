/**
 * History Pollution Prevention
 * 
 * Prevents temporary interactions (tooltips, decision sheets, acknowledgements)
 * from polluting the conversation history.
 * 
 * Rules:
 * 1. Tooltip hints are not saved to history
 * 2. Decision sheet interactions are not saved to history  
 * 3. Acknowledgement bubbles are not saved to history
 * 4. Navigation actions may create context markers but not full messages
 * 5. Only user prompts and AI responses are saved to history
 */

import { addMessage as originalAddMessage } from '$lib/copilot/copilotStore';
import { debugStore } from '$lib/stores/debugStore';
import type { IntelligenceIntentResult } from './IntentClassifier';

export type HistoryItemType = 
  | 'user-prompt'
  | 'ai-response'
  | 'tooltip-hint'
  | 'decision-sheet-interaction'
  | 'acknowledgement-bubble'
  | 'navigation-action'
  | 'context-marker'
  | 'system-notification';

export interface HistoryItem {
  id: string;
  type: HistoryItemType;
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
  shouldSaveToHistory: boolean;
}

export class HistoryPollutionPrevention {
  private historyBuffer: HistoryItem[] = [];
  private readonly MAX_BUFFER_SIZE = 100;
  
  /**
   * Check if an item should be saved to conversation history
   */
  shouldSaveToHistory(
    type: HistoryItemType,
    intelligenceIntent?: IntelligenceIntentResult
  ): boolean {
    // Default rules
    const saveRules: Record<HistoryItemType, boolean> = {
      'user-prompt': true,
      'ai-response': true,
      'tooltip-hint': false,
      'decision-sheet-interaction': false,
      'acknowledgement-bubble': false,
      'navigation-action': false,
      'context-marker': false,
      'system-notification': false,
    };
    
    // Override based on intelligence intent
    if (intelligenceIntent) {
      // Check if intelligence layer says to prevent pollution
      if (intelligenceIntent.shouldPreventHistoryPollution) {
        return false;
      }
      
      // Special cases
      if (intelligenceIntent.intelligenceIntent === 'smalltalk') {
        // Smalltalk should be saved (it's part of conversation)
        return true;
      }
      
      if (intelligenceIntent.intelligenceIntent === 'ambiguous') {
        // Ambiguous prompts should be saved after clarification
        return true;
      }
    }
    
    return saveRules[type] || false;
  }
  
  /**
   * Add a message with pollution prevention
   */
  addMessage(
    type: 'user' | 'ai' | 'system',
    text: string,
    options?: {
      intelligenceIntent?: IntelligenceIntentResult;
      forceSave?: boolean;
      metadata?: Record<string, any>;
    }
  ): void {
    const historyItemType = this.mapMessageTypeToHistoryType(type);
    const shouldSave = options?.forceSave || this.shouldSaveToHistory(
      historyItemType,
      options?.intelligenceIntent
    );
    
    const historyItem: HistoryItem = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: historyItemType,
      content: text,
      timestamp: Date.now(),
      metadata: options?.metadata,
      shouldSaveToHistory: shouldSave,
    };
    
    // Add to buffer for tracking
    this.addToBuffer(historyItem);
    
    // Log for debugging
    debugStore.log('HistoryPollutionPrevention', 'addMessage', {
      type: historyItemType,
      shouldSave,
      contentLength: text.length,
      intelligenceIntent: options?.intelligenceIntent?.intelligenceIntent,
    });
    
    // Only save to actual conversation history if allowed
    if (shouldSave) {
      // Map history type to message type for copilotStore
      let messageType = 'user';
      if (type === 'ai') messageType = 'ai';
      if (type === 'system') messageType = 'system';
      
      originalAddMessage(messageType, text);
      console.log('[HistoryPollutionPrevention] Saved to history:', text.substring(0, 50));
    } else {
      console.log('[HistoryPollutionPrevention] Prevented history pollution:', text.substring(0, 50));
    }
  }
  
  /**
   * Add a tooltip hint (never saved to history)
   */
  addTooltipHint(text: string, metadata?: Record<string, any>): void {
    this.addMessage('system', text, {
      metadata: { ...metadata, isTooltip: true },
      forceSave: false,
    });
  }
  
  /**
   * Add a decision sheet interaction (never saved to history)
   */
  addDecisionSheetInteraction(
    actionLabel: string,
    originalPrompt: string,
    metadata?: Record<string, any>
  ): void {
    this.addMessage('system', `Decision: ${actionLabel} for "${originalPrompt}"`, {
      metadata: { ...metadata, isDecisionSheet: true, originalPrompt },
      forceSave: false,
    });
  }
  
  /**
   * Add an acknowledgement bubble (never saved to history)
   */
  addAcknowledgementBubble(text: string, metadata?: Record<string, any>): void {
    this.addMessage('system', `Ack: ${text}`, {
      metadata: { ...metadata, isAcknowledgement: true },
      forceSave: false,
    });
  }
  
  /**
   * Add a navigation action (may create context marker)
   */
  addNavigationAction(
    fromSubsystem: string,
    toSubsystem: string,
    metadata?: Record<string, any>
  ): void {
    this.addMessage('system', `Navigated from ${fromSubsystem} to ${toSubsystem}`, {
      metadata: { ...metadata, isNavigation: true, fromSubsystem, toSubsystem },
      forceSave: false,
    });
  }
  
  /**
   * Get recent history items (including non-saved items for debugging)
   */
  getRecentHistory(limit: number = 20): HistoryItem[] {
    return this.historyBuffer
      .slice(-limit)
      .sort((a, b) => b.timestamp - a.timestamp);
  }
  
  /**
   * Get only items saved to conversation history
   */
  getSavedHistory(): HistoryItem[] {
    return this.historyBuffer.filter(item => item.shouldSaveToHistory);
  }
  
  /**
   * Clear history buffer
   */
  clearBuffer(): void {
    this.historyBuffer = [];
    debugStore.log('HistoryPollutionPrevention', 'clearBuffer');
  }
  
  /**
   * Get statistics about history pollution prevention
   */
  getStatistics(): {
    totalItems: number;
    savedItems: number;
    preventedItems: number;
    byType: Record<HistoryItemType, number>;
  } {
    const byType: Record<HistoryItemType, number> = {} as any;
    
    this.historyBuffer.forEach(item => {
      byType[item.type] = (byType[item.type] || 0) + 1;
    });
    
    const savedItems = this.historyBuffer.filter(item => item.shouldSaveToHistory).length;
    
    return {
      totalItems: this.historyBuffer.length,
      savedItems,
      preventedItems: this.historyBuffer.length - savedItems,
      byType,
    };
  }
  
  /**
   * Check if a prompt should be processed with pollution prevention
   */
  shouldPreventPollutionForPrompt(
    prompt: string,
    intelligenceIntent?: IntelligenceIntentResult
  ): boolean {
    if (!intelligenceIntent) {
      // Default: save user prompts
      return false;
    }
    
    return intelligenceIntent.shouldPreventHistoryPollution;
  }
  
  // Private methods
  
  private mapMessageTypeToHistoryType(type: 'user' | 'ai' | 'system'): HistoryItemType {
    const map = {
      'user': 'user-prompt' as HistoryItemType,
      'ai': 'ai-response' as HistoryItemType,
      'system': 'system-notification' as HistoryItemType,
    };
    
    return map[type];
  }
  
  private addToBuffer(item: HistoryItem): void {
    this.historyBuffer.push(item);
    
    // Limit buffer size
    if (this.historyBuffer.length > this.MAX_BUFFER_SIZE) {
      this.historyBuffer = this.historyBuffer.slice(-this.MAX_BUFFER_SIZE);
    }
  }
}

// Singleton instance
export const historyPollutionPrevention = new HistoryPollutionPrevention();