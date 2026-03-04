import type { LayoutBlock, LayoutCommand, LayoutEvent } from './LayoutTypes';
import { LayoutBlockSystem } from './LayoutBlockSystem';
import { SectionReorderingEngine } from './SectionReorderingEngine';
import { ColumnEngine } from './ColumnEngine';
import { FigureCaptionEngine } from './FigureCaptionEngine';
import { TableGenerationEngine } from './TableGenerationEngine';
import { LayoutAwareMediaPlacement } from './LayoutAwareMediaPlacement';

/**
 * Layout‑aware context mode – applies AI layout commands directly to a document.
 */
export class LayoutAwareContextMode {
  private blockSystem: LayoutBlockSystem;
  private reorderingEngine: SectionReorderingEngine;
  private columnEngine: ColumnEngine;
  private figureEngine: FigureCaptionEngine;
  private tableEngine: TableGenerationEngine;
  private mediaPlacement: LayoutAwareMediaPlacement;

  private blocks: LayoutBlock[] = [];
  private eventListeners: Array<(event: LayoutEvent) => void> = [];

  constructor(initialBlocks: LayoutBlock[] = []) {
    this.blockSystem = new LayoutBlockSystem();
    this.reorderingEngine = new SectionReorderingEngine();
    this.columnEngine = new ColumnEngine(this.blockSystem);
    this.figureEngine = new FigureCaptionEngine(this.blockSystem);
    this.tableEngine = new TableGenerationEngine(this.blockSystem);
    this.mediaPlacement = new LayoutAwareMediaPlacement(this.blockSystem);
    this.blocks = initialBlocks;
  }

  /**
   * Get current blocks.
   */
  getBlocks(): LayoutBlock[] {
    return this.blocks;
  }

  /**
   * Set blocks.
   */
  setBlocks(blocks: LayoutBlock[]): void {
    this.blocks = blocks;
  }

  /**
   * Execute a layout command.
   */
  executeCommand(command: LayoutCommand): LayoutBlock[] {
    let updatedBlocks = [...this.blocks];
    switch (command.type) {
      case 'createBlock':
        const newBlock = this.blockSystem.createBlock(
          command.blockType,
          command.content
        );
        updatedBlocks.push(newBlock);
        this.emitEvent({ type: 'blockAdded', block: newBlock });
        break;

      case 'updateBlock':
        const blockToUpdate = updatedBlocks.find(b => b.id === command.blockId);
        if (!blockToUpdate) {
          throw new Error(`Block ${command.blockId} not found`);
        }
        const updatedBlock = this.blockSystem.updateBlock(
          blockToUpdate,
          command.content
        );
        updatedBlocks = updatedBlocks.map(b =>
          b.id === command.blockId ? updatedBlock : b
        );
        this.emitEvent({
          type: 'layoutChanged',
          blockId: command.blockId,
          layout: updatedBlock.layout || {},
        });
        break;

      case 'moveBlock':
        updatedBlocks = this.reorderingEngine.moveBlock(
          updatedBlocks,
          command.blockId,
          command.newIndex
        );
        this.emitEvent({
          type: 'blockMoved',
          blockId: command.blockId,
          newIndex: command.newIndex,
        });
        break;

      case 'setLayout':
        const blockToLayout = updatedBlocks.find(b => b.id === command.blockId);
        if (!blockToLayout) {
          throw new Error(`Block ${command.blockId} not found`);
        }
        const layoutBlock = this.blockSystem.updateBlockLayout(
          blockToLayout,
          command.layout
        );
        updatedBlocks = updatedBlocks.map(b =>
          b.id === command.blockId ? layoutBlock : b
        );
        this.emitEvent({
          type: 'layoutChanged',
          blockId: command.blockId,
          layout: command.layout,
        });
        break;

      case 'createColumns':
        const blockToColumn = updatedBlocks.find(b => b.id === command.blockId);
        if (!blockToColumn) {
          throw new Error(`Block ${command.blockId} not found`);
        }
        // Convert block to column block (placeholder)
        const columnBlock = this.columnEngine.createMultiColumnBlock(
          [[blockToColumn], []],
          { columns: command.count }
        );
        updatedBlocks = updatedBlocks.map(b =>
          b.id === command.blockId ? columnBlock : b
        );
        this.emitEvent({
          type: 'layoutChanged',
          blockId: command.blockId,
          layout: columnBlock.layout || {},
        });
        break;

      case 'insertMediaIntoBlock':
        // This would require media item; for now just log
        console.warn('insertMediaIntoBlock not fully implemented');
        break;

      default:
        console.warn('Unknown command', command);
    }
    this.blocks = updatedBlocks;
    return updatedBlocks;
  }

  /**
   * Apply a batch of commands.
   */
  executeCommands(commands: LayoutCommand[]): LayoutBlock[] {
    commands.forEach(cmd => this.executeCommand(cmd));
    return this.blocks;
  }

  /**
   * Undo last command (simplified – just reverts to previous state).
   */
  undo(): LayoutBlock[] {
    // In a real implementation, you'd have a command history.
    console.warn('Undo not implemented');
    return this.blocks;
  }

  /**
   * Redo last undone command.
   */
  redo(): LayoutBlock[] {
    console.warn('Redo not implemented');
    return this.blocks;
  }

  /**
   * Add an event listener.
   */
  addEventListener(listener: (event: LayoutEvent) => void): void {
    this.eventListeners.push(listener);
  }

  /**
   * Remove an event listener.
   */
  removeEventListener(listener: (event: LayoutEvent) => void): void {
    this.eventListeners = this.eventListeners.filter(l => l !== listener);
  }

  private emitEvent(event: LayoutEvent): void {
    this.eventListeners.forEach(listener => listener(event));
  }

  /**
   * Helper to create a paragraph block and add it.
   */
  addParagraph(text: string): LayoutBlock {
    const block = this.blockSystem.createParagraphBlock(text);
    this.blocks.push(block);
    this.emitEvent({ type: 'blockAdded', block });
    return block;
  }

  /**
   * Helper to create a heading block and add it.
   */
  addHeading(text: string, level: 1 | 2 | 3 | 4 | 5 | 6): LayoutBlock {
    const block = this.blockSystem.createHeadingBlock(text, level);
    this.blocks.push(block);
    this.emitEvent({ type: 'blockAdded', block });
    return block;
  }

  /**
   * Helper to create a two‑column layout from two existing blocks.
   */
  createTwoColumn(leftBlockId: string, rightBlockId: string): LayoutBlock {
    const left = this.blocks.find(b => b.id === leftBlockId);
    const right = this.blocks.find(b => b.id === rightBlockId);
    if (!left || !right) {
      throw new Error('One or both blocks not found');
    }
    const columnBlock = this.columnEngine.createTwoColumnBlock(left, right);
    // Replace left and right with column block
    this.blocks = this.blocks.filter(
      b => b.id !== leftBlockId && b.id !== rightBlockId
    );
    this.blocks.push(columnBlock);
    this.emitEvent({ type: 'blockAdded', block: columnBlock });
    return columnBlock;
  }
}