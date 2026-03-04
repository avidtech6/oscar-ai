import type { LayoutBlock, LayoutCommand, LayoutEvent } from './LayoutTypes';
import { LayoutBlockSystem } from './LayoutBlockSystem';
import { ColumnEngine } from './ColumnEngine';
import { FigureCaptionEngine } from './FigureCaptionEngine';
import { TableGenerationEngine } from './TableGenerationEngine';
import { SectionReorderingEngine } from './SectionReorderingEngine';
import { LayoutAwareMediaPlacement } from './LayoutAwareMediaPlacement';
import { LayoutAwareContextMode } from './LayoutAwareContextMode';
import { LayoutAwareChatMode } from './LayoutAwareChatMode';
import { LayoutEventModel } from './LayoutEventModel';

/**
 * AI Layout Engine – main orchestrator for all layout intelligence.
 */
export class AILayoutEngine {
  private blockSystem: LayoutBlockSystem;
  private columnEngine: ColumnEngine;
  private figureEngine: FigureCaptionEngine;
  private tableEngine: TableGenerationEngine;
  private reorderingEngine: SectionReorderingEngine;
  private mediaPlacement: LayoutAwareMediaPlacement;
  private contextMode: LayoutAwareContextMode;
  private chatMode: LayoutAwareChatMode;
  private eventModel: LayoutEventModel;

  constructor() {
    this.blockSystem = new LayoutBlockSystem();
    this.columnEngine = new ColumnEngine(this.blockSystem);
    this.figureEngine = new FigureCaptionEngine(this.blockSystem);
    this.tableEngine = new TableGenerationEngine(this.blockSystem);
    this.reorderingEngine = new SectionReorderingEngine();
    this.mediaPlacement = new LayoutAwareMediaPlacement(this.blockSystem);
    this.contextMode = new LayoutAwareContextMode();
    this.chatMode = new LayoutAwareChatMode(this.contextMode);
    this.eventModel = new LayoutEventModel();

    // Forward events from context mode to event model
    this.contextMode.addEventListener(event => this.eventModel.emit(event));
  }

  /**
   * Get the event model for external subscription.
   */
  getEventModel(): LayoutEventModel {
    return this.eventModel;
  }

  /**
   * Get the context mode for direct manipulation.
   */
  getContextMode(): LayoutAwareContextMode {
    return this.contextMode;
  }

  /**
   * Get the chat mode for conversational layout.
   */
  getChatMode(): LayoutAwareChatMode {
    return this.chatMode;
  }

  /**
   * Create a layout block.
   */
  createBlock(type: any, content: any, layout?: any): LayoutBlock {
    return this.blockSystem.createBlock(type, content, layout);
  }

  /**
   * Create a two‑column layout from two blocks.
   */
  createTwoColumn(leftBlock: LayoutBlock, rightBlock: LayoutBlock, layout?: any): LayoutBlock {
    return this.columnEngine.createTwoColumnBlock(leftBlock, rightBlock, layout);
  }

  /**
   * Create a figure block with automatic numbering.
   */
  createFigure(mediaId: string, caption: string, layout?: any): LayoutBlock {
    return this.figureEngine.createFigureBlock(mediaId, caption, layout);
  }

  /**
   * Create a table from headers and rows.
   */
  createTable(headers: string[], rows: string[][], caption?: string, layout?: any): LayoutBlock {
    return this.tableEngine.createTable(headers, rows, caption, layout);
  }

  /**
   * Move a block within a list of blocks.
   */
  moveBlock(blocks: LayoutBlock[], blockId: string, newIndex: number): LayoutBlock[] {
    return this.reorderingEngine.moveBlock(blocks, blockId, newIndex);
  }

  /**
   * Insert media into a block.
   */
  insertMediaIntoBlock(block: LayoutBlock, media: any, caption?: string): LayoutBlock {
    return this.mediaPlacement.insertMediaIntoBlock(block, media, caption);
  }

  /**
   * Process a chat message and return layout suggestions.
   */
  processChatMessage(message: string, currentBlocks: LayoutBlock[]): {
    response: string;
    commands?: LayoutCommand[];
    askToApply: boolean;
  } {
    return this.chatMode.processMessage(message, currentBlocks);
  }

  /**
   * Apply layout commands to the current document.
   */
  applyCommands(commands: LayoutCommand[]): LayoutBlock[] {
    return this.contextMode.executeCommands(commands);
  }

  /**
   * Export current layout as a structured object (for debugging).
   */
  exportLayout(blocks: LayoutBlock[]): any {
    return {
      blockCount: blocks.length,
      blocks: blocks.map(b => ({
        id: b.id,
        type: b.type,
        layout: b.layout,
        metadata: b.metadata,
      })),
    };
  }

  /**
   * Validate all blocks in a layout.
   */
  validateLayout(blocks: LayoutBlock[]): Array<{ blockId: string; errors: string[] }> {
    const results: Array<{ blockId: string; errors: string[] }> = [];
    blocks.forEach(block => {
      const validation = this.blockSystem.validateBlock(block);
      if (!validation.valid) {
        results.push({ blockId: block.id, errors: validation.errors });
      }
    });
    return results;
  }

  /**
   * Reset the figure counter.
   */
  resetFigureCounter(start: number = 1): void {
    this.figureEngine.resetCounter(start);
  }

  /**
   * Subscribe to layout events.
   */
  on(eventType: LayoutEvent['type'], callback: (event: LayoutEvent) => void): void {
    this.eventModel.on(eventType, callback);
  }

  /**
   * Unsubscribe from layout events.
   */
  off(eventType: LayoutEvent['type'], callback: (event: LayoutEvent) => void): void {
    this.eventModel.off(eventType, callback);
  }
}