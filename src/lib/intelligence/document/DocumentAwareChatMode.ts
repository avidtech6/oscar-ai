import type { LayoutBlock } from '../layout/LayoutTypes';
import type { DocumentCommand, DocumentEvent, DocumentTone, SummaryOptions, RewriteOptions } from './DocumentTypes';
import { DocumentAwareContextMode } from './DocumentAwareContextMode';

/**
 * Document‑aware chat mode – bridges general chat questions with document‑level actions.
 */
export class DocumentAwareChatMode {
  private contextMode: DocumentAwareContextMode;
  private pendingAction: {
    command: DocumentCommand;
    description: string;
  } | null = null;

  constructor() {
    this.contextMode = new DocumentAwareContextMode();
  }

  /**
   * Handle a user chat message that may contain a document‑level request.
   */
  handleMessage(
    message: string,
    currentBlocks: LayoutBlock[]
  ): {
    response: string;
    shouldApply: boolean;
    command?: DocumentCommand;
  } {
    const lower = message.toLowerCase();

    // Detect document‑level intents
    if (lower.includes('rewrite') && lower.includes('section')) {
      // Extract section ID (simplified)
      const sectionMatch = message.match(/section\s+(\w+)/i);
      const sectionId = sectionMatch ? sectionMatch[1] : 'unknown';
      const tone = this.detectToneFromMessage(message);
      const command: DocumentCommand = {
        type: 'rewriteSection',
        sectionId,
        blocks: currentBlocks,
        options: { tone },
      };
      this.pendingAction = { command, description: `Rewrite section ${sectionId} in ${tone} tone` };
      return {
        response: `I can rewrite section "${sectionId}" in a ${tone} tone. Would you like me to apply this change to the document?`,
        shouldApply: false,
        command,
      };
    }

    if (lower.includes('summarise') || lower.includes('summary')) {
      const format = lower.includes('bullet') ? 'bullet' : lower.includes('executive') ? 'executive' : 'paragraph';
      const length = lower.includes('short') ? 'short' : lower.includes('long') ? 'long' : 'medium';
      const command: DocumentCommand = {
        type: 'summariseDocument',
        blocks: currentBlocks,
        options: { length, format },
      };
      this.pendingAction = { command, description: `Generate ${length} ${format} summary` };
      return {
        response: `I can generate a ${length} ${format} summary of the document. Would you like me to apply this summary?`,
        shouldApply: false,
        command,
      };
    }

    if (lower.includes('improve flow') || lower.includes('optimise structure')) {
      const command: DocumentCommand = {
        type: 'optimiseStructure',
        blocks: currentBlocks,
      };
      this.pendingAction = { command, description: 'Optimise document structure' };
      return {
        response: 'I can analyse and optimise the document structure for better flow. Apply the suggested changes?',
        shouldApply: false,
        command,
      };
    }

    if (lower.includes('fix inconsistencies') || lower.includes('check consistency')) {
      const command: DocumentCommand = {
        type: 'fixInconsistencies',
        blocks: currentBlocks,
      };
      this.pendingAction = { command, description: 'Fix inconsistencies' };
      return {
        response: 'I can detect and fix inconsistencies across sections. Apply the fixes?',
        shouldApply: false,
        command,
      };
    }

    if (lower.includes('change tone') || lower.includes('make it more')) {
      const tone = this.detectToneFromMessage(message);
      const command: DocumentCommand = {
        type: 'applyTone',
        blocks: currentBlocks,
        tone,
      };
      this.pendingAction = { command, description: `Change tone to ${tone}` };
      return {
        response: `I can rewrite the document in a ${tone} tone. Apply this change?`,
        shouldApply: false,
        command,
      };
    }

    // No document‑level intent detected
    return {
      response: '',
      shouldApply: false,
    };
  }

  /**
   * Apply the pending action to the document.
   */
  applyPendingAction(currentBlocks: LayoutBlock[]): {
    blocks: LayoutBlock[];
    events: DocumentEvent[];
  } | null {
    if (!this.pendingAction) return null;
    const result = this.contextMode.execute(this.pendingAction.command, currentBlocks);
    this.pendingAction = null;
    return result;
  }

  /**
   * Clear any pending action.
   */
  clearPendingAction(): void {
    this.pendingAction = null;
  }

  /**
   * Get the current pending action description.
   */
  getPendingAction(): { description: string } | null {
    return this.pendingAction ? { description: this.pendingAction.description } : null;
  }

  /**
   * Detect tone from a chat message (simplified).
   */
  private detectToneFromMessage(message: string): DocumentTone {
    const lower = message.toLowerCase();
    if (lower.includes('professional')) return 'professional';
    if (lower.includes('friendly')) return 'friendly';
    if (lower.includes('technical')) return 'technical';
    if (lower.includes('formal')) return 'formal';
    if (lower.includes('simple')) return 'simplified';
    if (lower.includes('client')) return 'client-facing';
    if (lower.includes('regulatory')) return 'regulatory';
    // Default
    return 'professional';
  }

  /**
   * Suggest possible document‑level actions based on current blocks.
   */
  suggestActions(blocks: LayoutBlock[]): Array<{ description: string; command: DocumentCommand }> {
    const suggestions: Array<{ description: string; command: DocumentCommand }> = [];

    // Suggest summary if document is long
    if (blocks.length > 20) {
      suggestions.push({
        description: 'Generate a summary of this long document',
        command: {
          type: 'summariseDocument',
          blocks,
          options: { length: 'medium', format: 'bullet' },
        },
      });
    }

    // Suggest tone change if tone is informal (detection placeholder)
    const hasInformalWords = blocks.some(b =>
      b.type === 'paragraph' &&
      (b.content as any).text.toLowerCase().includes('got')
    );
    if (hasInformalWords) {
      suggestions.push({
        description: 'Rewrite in a more professional tone',
        command: {
          type: 'applyTone',
          blocks,
          tone: 'professional',
        },
      });
    }

    // Suggest structure optimisation if sections are unbalanced
    const headingCount = blocks.filter(b => b.type === 'heading').length;
    if (headingCount > 5) {
      suggestions.push({
        description: 'Optimise section structure',
        command: {
          type: 'optimiseStructure',
          blocks,
        },
      });
    }

    return suggestions;
  }
}