/**
 * Phase 23: AI Layout Engine - Column Engine
 * 
 * Handles two-column layouts, side-by-side placement, column conversion,
 * and column balancing for report content.
 */

import type {
  LayoutBlock,
  ParagraphBlock,
  HeadingBlock,
  ColumnBlock,
  LayoutConfig,
  ColumnLayoutOptions,
  LayoutOperationResult
} from '../types';
import { createColumnBlock, createParagraphBlock, createHeadingBlock } from '../types';

/**
 * Column engine configuration
 */
export interface ColumnEngineConfig {
  /** Default number of columns */
  defaultColumns: number;
  /** Default column gap in pixels */
  defaultColumnGap: number;
  /** Whether to balance column heights automatically */
  autoBalanceColumns: boolean;
  /** Minimum content length to consider for column conversion */
  minContentLengthForColumns: number;
  /** Maximum column width in pixels */
  maxColumnWidth: number;
}

/**
 * Default column engine configuration
 */
export const DEFAULT_COLUMN_ENGINE_CONFIG: ColumnEngineConfig = {
  defaultColumns: 2,
  defaultColumnGap: 20,
  autoBalanceColumns: true,
  minContentLengthForColumns: 500, // characters
  maxColumnWidth: 800
};

/**
 * Column engine for managing multi-column layouts
 */
export class ColumnEngine {
  private config: ColumnEngineConfig;

  constructor(config: Partial<ColumnEngineConfig> = {}) {
    this.config = { ...DEFAULT_COLUMN_ENGINE_CONFIG, ...config };
  }

  /**
   * Convert a single block to a multi-column layout
   */
  convertToColumns(
    block: LayoutBlock,
    options: Partial<ColumnLayoutOptions> = {}
  ): LayoutOperationResult {
    try {
      // Validate input
      if (!block || !block.content) {
        return {
          success: false,
          message: 'Invalid block: block or content is missing'
        };
      }

      // Determine number of columns
      const columns = options.columns || this.config.defaultColumns;
      if (columns < 2 || columns > 4) {
        return {
          success: false,
          message: `Invalid column count: ${columns}. Must be between 2 and 4`
        };
      }

      // Split content for columns
      const columnContents = this.splitContentForColumns(block.content, columns);
      
      // Create column blocks (each column gets a paragraph block with its content)
      const columnBlocks: LayoutBlock[][] = columnContents.map(content => [
        createParagraphBlock(content)
      ]);

      // Create column block
      const columnBlock = createColumnBlock(
        columnBlocks,
        {
          layout: {
            columns,
            columnGap: options.columnGap || this.config.defaultColumnGap,
            equalWidth: options.equalWidth ?? true,
            columnWidths: options.columnWidths,
            alignment: 'left',
            width: 100,
            margin: { top: 0, right: 0, bottom: 20, left: 0 }
          }
        }
      );

      return {
        success: true,
        message: `Successfully converted to ${columns}-column layout`,
        block: columnBlock
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to convert to columns: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Split a block into side-by-side columns
   */
  splitIntoSideBySide(
    blocks: LayoutBlock[],
    options: Partial<ColumnLayoutOptions> = {}
  ): LayoutOperationResult {
    try {
      if (!blocks || blocks.length < 2) {
        return {
          success: false,
          message: 'Need at least 2 blocks for side-by-side layout'
        };
      }

      const columns = Math.min(blocks.length, options.columns || this.config.defaultColumns);
      
      // Group blocks into columns
      const columnGroups = this.groupBlocksIntoColumns(blocks, columns);

      // Create column block
      const columnBlock = createColumnBlock(
        columnGroups,
        {
          layout: {
            columns,
            columnGap: options.columnGap || this.config.defaultColumnGap,
            equalWidth: options.equalWidth ?? true,
            columnWidths: options.columnWidths,
            alignment: 'left',
            width: 100,
            margin: { top: 0, right: 0, bottom: 20, left: 0 }
          }
        }
      );

      return {
        success: true,
        message: `Successfully created ${columns}-column side-by-side layout`,
        block: columnBlock
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create side-by-side layout: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Balance column heights in a column block
   */
  balanceColumnHeights(columnBlock: ColumnBlock): LayoutOperationResult {
    try {
      if (!columnBlock || columnBlock.type !== 'columns') {
        return {
          success: false,
          message: 'Invalid column block'
        };
      }

      // Calculate content lengths by flattening all blocks in each column
      const contentLengths = columnBlock.content.map(columnBlocks =>
        columnBlocks.reduce((total, block) => total + (typeof block.content === 'string' ? block.content.length : 0), 0)
      );
      
      const maxLength = Math.max(...contentLengths);
      const minLength = Math.min(...contentLengths);
      
      // If heights are already balanced (within 20% tolerance), return as-is
      if (maxLength === 0 || (maxLength - minLength) / maxLength < 0.2) {
        return {
          success: true,
          message: 'Column heights are already balanced',
          block: columnBlock
        };
      }

      // Extract all text content from all columns
      const allTextContent: string[] = [];
      columnBlock.content.forEach(columnBlocks => {
        columnBlocks.forEach(block => {
          if (typeof block.content === 'string') {
            allTextContent.push(block.content);
          }
        });
      });

      // Redistribute text content evenly
      const balancedColumns = this.splitContentForColumns(
        allTextContent.join('\n\n'),
        columnBlock.content.length
      );

      // Create new column blocks with balanced content
      const balancedColumnBlocks: LayoutBlock[][] = balancedColumns.map(content => [
        createParagraphBlock(content)
      ]);

      const balancedBlock: ColumnBlock = {
        ...columnBlock,
        content: balancedColumnBlocks
      };

      return {
        success: true,
        message: 'Successfully balanced column heights',
        block: balancedBlock
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to balance column heights: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Convert a column block back to single column
   */
  convertToSingleColumn(columnBlock: ColumnBlock): LayoutOperationResult {
    try {
      if (!columnBlock || columnBlock.type !== 'columns') {
        return {
          success: false,
          message: 'Invalid column block'
        };
      }

      // Extract all text content from all columns
      const allTextContent: string[] = [];
      columnBlock.content.forEach(columnBlocks => {
        columnBlocks.forEach(block => {
          if (typeof block.content === 'string') {
            allTextContent.push(block.content);
          }
        });
      });

      // Combine all content
      const combinedContent = allTextContent.join('\n\n');

      // Create a paragraph block with the combined content
      const paragraphBlock = createParagraphBlock(
        combinedContent,
        {
          layout: columnBlock.layout
        }
      );

      return {
        success: true,
        message: 'Successfully converted to single column',
        block: paragraphBlock
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to convert to single column: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Check if content is suitable for column layout
   */
  isSuitableForColumns(content: string): boolean {
    if (!content || content.length < this.config.minContentLengthForColumns) {
      return false;
    }

    // Check if content has natural break points (paragraphs, headings)
    const paragraphCount = (content.match(/\n\s*\n/g) || []).length;
    const headingCount = (content.match(/^#{1,6}\s+.+$/gm) || []).length;
    
    return paragraphCount >= 2 || headingCount >= 2;
  }

  /**
   * Get suggested column layout for content
   */
  suggestColumnLayout(content: string): ColumnLayoutOptions {
    const length = content.length;
    let columns = 2;
    
    if (length > 2000) columns = 3;
    if (length > 4000) columns = 4;
    
    return {
      columns,
      equalWidth: true,
      columnGap: this.config.defaultColumnGap,
      minColumnWidth: 200
    };
  }

  /**
   * Private helper methods
   */

  private calculateColumnWidths(
    columns: number,
    equalWidth: boolean,
    customWidths?: number[]
  ): number[] {
    if (customWidths && customWidths.length === columns) {
      return customWidths;
    }

    if (equalWidth) {
      const width = 100 / columns;
      return Array(columns).fill(width);
    }

    // Default unequal widths (first column wider for emphasis)
    const widths: number[] = [];
    const firstColumnWidth = 60;
    const remainingWidth = 100 - firstColumnWidth;
    const otherColumnWidth = remainingWidth / (columns - 1);
    
    widths.push(firstColumnWidth);
    for (let i = 1; i < columns; i++) {
      widths.push(otherColumnWidth);
    }
    
    return widths;
  }

  private splitContentForColumns(content: string, columns: number): string[] {
    if (!content || columns < 1) {
      return Array(columns).fill('');
    }

    // Split by paragraphs
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());
    
    if (paragraphs.length === 0) {
      // No paragraphs, split by sentences
      const sentences = content.split(/[.!?]+/).filter(s => s.trim());
      return this.distributeItems(sentences, columns);
    }

    return this.distributeItems(paragraphs, columns);
  }

  private distributeItems(items: string[], columns: number): string[] {
    const result: string[] = Array(columns).fill('');
    const itemsPerColumn = Math.ceil(items.length / columns);
    
    for (let i = 0; i < columns; i++) {
      const start = i * itemsPerColumn;
      const end = Math.min(start + itemsPerColumn, items.length);
      const columnItems = items.slice(start, end);
      result[i] = columnItems.join('\n\n');
    }
    
    return result;
  }

  private groupBlocksIntoColumns(blocks: LayoutBlock[], columns: number): LayoutBlock[][] {
    const result: LayoutBlock[][] = Array(columns).fill(null).map(() => []);
    const blocksPerColumn = Math.ceil(blocks.length / columns);
    
    for (let i = 0; i < columns; i++) {
      const start = i * blocksPerColumn;
      const end = Math.min(start + blocksPerColumn, blocks.length);
      result[i] = blocks.slice(start, end);
    }
    
    return result;
  }
}

/**
 * Create a default column engine instance
 */
export function createColumnEngine(config: Partial<ColumnEngineConfig> = {}): ColumnEngine {
  return new ColumnEngine(config);
}