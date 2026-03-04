import type { LayoutBlock, LayoutConfig } from './LayoutTypes';
import { LayoutBlockSystem } from './LayoutBlockSystem';

/**
 * Column engine – creates and manipulates column layouts.
 */
export class ColumnEngine {
  private blockSystem: LayoutBlockSystem;

  constructor(blockSystem?: LayoutBlockSystem) {
    this.blockSystem = blockSystem ?? new LayoutBlockSystem();
  }

  /**
   * Create a two‑column layout block with the given left and right blocks.
   */
  createTwoColumnBlock(
    leftBlock: LayoutBlock,
    rightBlock: LayoutBlock,
    layout?: LayoutConfig
  ): LayoutBlock {
    return this.blockSystem.createColumnBlock(
      [[leftBlock], [rightBlock]],
      { ...layout, columns: 2 }
    );
  }

  /**
   * Create a multi‑column layout block with the given columns.
   * Each column is an array of blocks.
   */
  createMultiColumnBlock(
    columns: LayoutBlock[][],
    layout?: LayoutConfig
  ): LayoutBlock {
    return this.blockSystem.createColumnBlock(columns, {
      ...layout,
      columns: columns.length,
    });
  }

  /**
   * Convert a single block into a two‑column block by splitting its content.
   * This is a placeholder – real implementation would need content analysis.
   */
  splitBlockIntoColumns(
    block: LayoutBlock,
    splitStrategy: 'equal' | 'leftHeavy' | 'rightHeavy' = 'equal'
  ): LayoutBlock {
    // For now, create two placeholder blocks
    const left = this.blockSystem.createParagraphBlock('Left column content');
    const right = this.blockSystem.createParagraphBlock('Right column content');
    return this.createTwoColumnBlock(left, right);
  }

  /**
   * Merge a column block back into a single‑column layout.
   * Flattens all column blocks into a single sequential list.
   */
  mergeColumnsToSingleColumn(columnBlock: LayoutBlock): LayoutBlock[] {
    if (columnBlock.type !== 'columns') {
      throw new Error('Block is not a column block');
    }
    const columns = (columnBlock.content as any).columns as LayoutBlock[][];
    // Flatten columns preserving order (left‑to‑right, top‑to‑bottom)
    const flattened: LayoutBlock[] = [];
    for (const col of columns) {
      flattened.push(...col);
    }
    return flattened;
  }

  /**
   * Add a block to a specific column in a column block.
   */
  addBlockToColumn(
    columnBlock: LayoutBlock,
    columnIndex: number,
    block: LayoutBlock
  ): LayoutBlock {
    if (columnBlock.type !== 'columns') {
      throw new Error('Block is not a column block');
    }
    const content = columnBlock.content as any;
    const columns = [...content.columns];
    if (columnIndex < 0 || columnIndex >= columns.length) {
      throw new Error('Column index out of bounds');
    }
    columns[columnIndex] = [...columns[columnIndex], block];
    return this.blockSystem.updateBlock(columnBlock, { columns });
  }

  /**
   * Move a block from one column to another.
   */
  moveBlockBetweenColumns(
    columnBlock: LayoutBlock,
    sourceColumnIndex: number,
    sourceBlockIndex: number,
    targetColumnIndex: number,
    targetBlockIndex?: number
  ): LayoutBlock {
    if (columnBlock.type !== 'columns') {
      throw new Error('Block is not a column block');
    }
    const content = columnBlock.content as any;
    const columns = [...content.columns];
    const sourceCol = columns[sourceColumnIndex];
    const targetCol = columns[targetColumnIndex];
    if (!sourceCol || !targetCol) {
      throw new Error('Invalid column index');
    }
    const [movedBlock] = sourceCol.splice(sourceBlockIndex, 1);
    if (targetBlockIndex !== undefined) {
      targetCol.splice(targetBlockIndex, 0, movedBlock);
    } else {
      targetCol.push(movedBlock);
    }
    return this.blockSystem.updateBlock(columnBlock, { columns });
  }

  /**
   * Adjust column widths (for future CSS grid integration).
   */
  setColumnWidths(
    columnBlock: LayoutBlock,
    widths: number[] // percentages
  ): LayoutBlock {
    if (columnBlock.type !== 'columns') {
      throw new Error('Block is not a column block');
    }
    const content = columnBlock.content as any;
    if (widths.length !== content.columns.length) {
      throw new Error('Widths array length must match column count');
    }
    const layout: LayoutConfig = {
      ...columnBlock.layout,
      columnWidths: widths,
    };
    return this.blockSystem.updateBlockLayout(columnBlock, layout);
  }
}