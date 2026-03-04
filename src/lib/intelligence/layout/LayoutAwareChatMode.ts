import type { LayoutBlock, LayoutCommand } from './LayoutTypes';
import { LayoutAwareContextMode } from './LayoutAwareContextMode';

/**
 * Layout‑aware chat mode – bridges chat suggestions with layout changes.
 */
export class LayoutAwareChatMode {
  private contextMode: LayoutAwareContextMode;
  private pendingSuggestions: Array<{
    suggestion: string;
    commands: LayoutCommand[];
  }> = [];

  constructor(contextMode?: LayoutAwareContextMode) {
    this.contextMode = contextMode ?? new LayoutAwareContextMode();
  }

  /**
   * Process a user chat message that may contain layout intent.
   * Returns a response and optionally a set of layout commands to apply.
   */
  processMessage(
    message: string,
    currentBlocks: LayoutBlock[]
  ): {
    response: string;
    commands?: LayoutCommand[];
    askToApply: boolean;
  } {
    this.contextMode.setBlocks(currentBlocks);

    // Simple intent detection (placeholder)
    const lower = message.toLowerCase();
    let commands: LayoutCommand[] = [];
    let askToApply = false;

    if (lower.includes('two column') || lower.includes('side by side')) {
      commands = this.generateTwoColumnCommand();
      askToApply = true;
    } else if (lower.includes('move') && lower.includes('above')) {
      commands = this.generateMoveCommand();
      askToApply = true;
    } else if (lower.includes('add a table')) {
      commands = this.generateTableCommand();
      askToApply = true;
    } else if (lower.includes('add a figure')) {
      commands = this.generateFigureCommand();
      askToApply = true;
    } else if (lower.includes('split')) {
      commands = this.generateSplitCommand();
      askToApply = true;
    }

    const response = this.buildResponse(message, commands.length > 0);
    return {
      response,
      commands: commands.length > 0 ? commands : undefined,
      askToApply,
    };
  }

  /**
   * Apply suggested commands to the document.
   */
  applyCommands(commands: LayoutCommand[]): LayoutBlock[] {
    return this.contextMode.executeCommands(commands);
  }

  /**
   * Store a suggestion for later.
   */
  storeSuggestion(suggestion: string, commands: LayoutCommand[]): void {
    this.pendingSuggestions.push({ suggestion, commands });
  }

  /**
   * Get pending suggestions.
   */
  getPendingSuggestions(): Array<{ suggestion: string; commands: LayoutCommand[] }> {
    return this.pendingSuggestions;
  }

  /**
   * Clear pending suggestions.
   */
  clearPendingSuggestions(): void {
    this.pendingSuggestions = [];
  }

  /**
   * Generate a two‑column layout command (placeholder).
   */
  private generateTwoColumnCommand(): LayoutCommand[] {
    // In reality, you'd need block IDs; this is a dummy command
    return [
      {
        type: 'createColumns',
        blockId: 'placeholder', // would be determined from context
        count: 2,
      },
    ];
  }

  /**
   * Generate a move block command (placeholder).
   */
  private generateMoveCommand(): LayoutCommand[] {
    return [
      {
        type: 'moveBlock',
        blockId: 'placeholder',
        newIndex: 0,
      },
    ];
  }

  /**
   * Generate a table creation command (placeholder).
   */
  private generateTableCommand(): LayoutCommand[] {
    return [
      {
        type: 'createBlock',
        blockType: 'table',
        content: {
          headers: ['Column 1', 'Column 2'],
          rows: [['Row 1 Cell 1', 'Row 1 Cell 2']],
        },
      },
    ];
  }

  /**
   * Generate a figure creation command (placeholder).
   */
  private generateFigureCommand(): LayoutCommand[] {
    return [
      {
        type: 'createBlock',
        blockType: 'figure',
        content: {
          mediaId: 'placeholder',
          label: 'Figure 1',
          caption: 'Caption text',
        },
      },
    ];
  }

  /**
   * Generate a split block command (placeholder).
   */
  private generateSplitCommand(): LayoutCommand[] {
    return [
      {
        type: 'createBlock',
        blockType: 'paragraph',
        content: { text: 'First part' },
      },
      {
        type: 'createBlock',
        blockType: 'paragraph',
        content: { text: 'Second part' },
      },
    ];
  }

  /**
   * Build a chat response.
   */
  private buildResponse(userMessage: string, hasCommands: boolean): string {
    if (hasCommands) {
      return `I can help with that. I suggest making the following layout changes:\n\n` +
        `- Create a two‑column layout\n` +
        `- Move the relevant sections\n\n` +
        `Would you like me to apply these changes to the document?`;
    }
    return `I understand you're talking about layout. If you'd like me to adjust the document structure, please be more specific (e.g., "make this section two columns", "move the conclusion above the recommendations").`;
  }
}