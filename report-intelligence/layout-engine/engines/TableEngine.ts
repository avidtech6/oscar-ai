/**
 * Phase 23: AI Layout Engine - Table Generation Engine
 * 
 * Handles converting text/lists to tables, reformatting tables,
 * table styling, and column alignments.
 */

import type {
  LayoutBlock,
  TableBlock,
  ListBlock,
  ParagraphBlock,
  ColumnAlignment,
  LayoutConfig,
  TableGenerationOptions,
  LayoutOperationResult
} from '../types';
import { createLayoutBlock, createParagraphBlock, isListBlock, isParagraphBlock } from '../types';

/**
 * Table engine configuration
 */
export interface TableEngineConfig {
  /** Default table style */
  defaultTableStyle: 'bordered' | 'striped' | 'plain';
  /** Default column alignment */
  defaultColumnAlignment: ColumnAlignment;
  /** Whether to include headers by default */
  includeHeaders: boolean;
  /** Maximum number of columns */
  maxColumns: number;
  /** Maximum number of rows */
  maxRows: number;
  /** Minimum rows for table conversion */
  minRowsForConversion: number;
}

/**
 * Default table engine configuration
 */
export const DEFAULT_TABLE_ENGINE_CONFIG: TableEngineConfig = {
  defaultTableStyle: 'bordered',
  defaultColumnAlignment: 'left',
  includeHeaders: true,
  maxColumns: 10,
  maxRows: 100,
  minRowsForConversion: 3
};

/**
 * Table engine for managing table generation and formatting
 */
export class TableEngine {
  private config: TableEngineConfig;

  constructor(config: Partial<TableEngineConfig> = {}) {
    this.config = { ...DEFAULT_TABLE_ENGINE_CONFIG, ...config };
  }

  /**
   * Convert text content to a table
   */
  convertTextToTable(
    text: string,
    options: Partial<TableGenerationOptions> = {}
  ): LayoutOperationResult {
    try {
      if (!text || text.trim().length === 0) {
        return {
          success: false,
          message: 'Text cannot be empty'
        };
      }

      // Parse text into rows and columns
      const { headers, rows } = this.parseTextToTableData(text, options);
      
      // Validate table data
      if (rows.length < this.config.minRowsForConversion) {
        return {
          success: false,
          message: `Insufficient data for table conversion. Need at least ${this.config.minRowsForConversion} rows, got ${rows.length}`
        };
      }

      // Create table block
      const tableBlock = this.createTableBlock(
        {
          headers: options.includeHeaders !== false ? headers : undefined,
          rows,
          caption: undefined
        },
        {
          layout: {
            hasHeader: options.includeHeaders !== false,
            bordered: options.bordered ?? (this.config.defaultTableStyle === 'bordered'),
            striped: options.striped ?? (this.config.defaultTableStyle === 'striped'),
            columnAlignments: options.columnAlignments || this.generateColumnAlignments(rows[0]?.length || 0),
            ...this.getTableLayoutOptions(options)
          }
        }
      );

      return {
        success: true,
        message: `Successfully converted text to table with ${rows.length} rows`,
        block: tableBlock
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to convert text to table: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Convert a list block to a table
   */
  convertListToTable(
    listBlock: ListBlock,
    options: Partial<TableGenerationOptions> = {}
  ): LayoutOperationResult {
    try {
      if (!listBlock || listBlock.type !== 'list') {
        return {
          success: false,
          message: 'Invalid list block'
        };
      }

      const listItems = listBlock.content.items;
      if (!listItems || listItems.length === 0) {
        return {
          success: false,
          message: 'List block has no items'
        };
      }

      // Convert list items to table rows
      const rows = listItems.map(item => [item]);
      const headers = options.includeHeaders !== false ? ['Item'] : undefined;

      // Create table block
      const tableBlock = this.createTableBlock(
        {
          headers,
          rows,
          caption: undefined
        },
        {
          layout: {
            hasHeader: options.includeHeaders !== false,
            bordered: options.bordered ?? (this.config.defaultTableStyle === 'bordered'),
            striped: options.striped ?? (this.config.defaultTableStyle === 'striped'),
            columnAlignments: options.columnAlignments || [this.config.defaultColumnAlignment],
            ...this.getTableLayoutOptions(options)
          }
        }
      );

      return {
        success: true,
        message: `Successfully converted list to table with ${rows.length} rows`,
        block: tableBlock
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to convert list to table: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Convert multiple paragraph blocks to a table
   */
  convertParagraphsToTable(
    paragraphBlocks: ParagraphBlock[],
    options: Partial<TableGenerationOptions> = {}
  ): LayoutOperationResult {
    try {
      if (!paragraphBlocks || paragraphBlocks.length === 0) {
        return {
          success: false,
          message: 'No paragraph blocks provided'
        };
      }

      // Validate all blocks are paragraphs
      const invalidBlocks = paragraphBlocks.filter(block => !isParagraphBlock(block));
      if (invalidBlocks.length > 0) {
        return {
          success: false,
          message: `Found ${invalidBlocks.length} non-paragraph blocks`
        };
      }

      // Extract text from paragraphs
      const rows = paragraphBlocks.map(block => [block.content]);
      const headers = options.includeHeaders !== false ? ['Content'] : undefined;

      // Create table block
      const tableBlock = this.createTableBlock(
        {
          headers,
          rows,
          caption: undefined
        },
        {
          layout: {
            hasHeader: options.includeHeaders !== false,
            bordered: options.bordered ?? (this.config.defaultTableStyle === 'bordered'),
            striped: options.striped ?? (this.config.defaultTableStyle === 'striped'),
            columnAlignments: options.columnAlignments || [this.config.defaultColumnAlignment],
            ...this.getTableLayoutOptions(options)
          }
        }
      );

      return {
        success: true,
        message: `Successfully converted ${paragraphBlocks.length} paragraphs to table`,
        block: tableBlock
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to convert paragraphs to table: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Reformat an existing table block
   */
  reformatTable(
    tableBlock: TableBlock,
    options: Partial<TableGenerationOptions> = {}
  ): LayoutOperationResult {
    try {
      if (!tableBlock || tableBlock.type !== 'table') {
        return {
          success: false,
          message: 'Invalid table block'
        };
      }

      // Apply new formatting options
      const updatedTableBlock: TableBlock = {
        ...tableBlock,
        layout: {
          ...tableBlock.layout,
          hasHeader: options.includeHeaders !== undefined ? options.includeHeaders : tableBlock.layout?.hasHeader,
          bordered: options.bordered !== undefined ? options.bordered : tableBlock.layout?.bordered,
          striped: options.striped !== undefined ? options.striped : tableBlock.layout?.striped,
          columnAlignments: options.columnAlignments || tableBlock.layout?.columnAlignments,
          ...this.getTableLayoutOptions(options)
        }
      };

      return {
        success: true,
        message: 'Successfully reformatted table',
        block: updatedTableBlock
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to reformat table: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Check if content is suitable for table conversion
   */
  isSuitableForTableConversion(content: string): boolean {
    if (!content || content.trim().length === 0) {
      return false;
    }

    // Check for tabular patterns
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    if (lines.length < this.config.minRowsForConversion) {
      return false;
    }

    // Check for consistent delimiter patterns
    const delimiters = [',', ';', '\t', '|'];
    for (const delimiter of delimiters) {
      const columnCounts = lines.map(line => line.split(delimiter).length);
      const firstCount = columnCounts[0];
      const consistentColumns = columnCounts.every(count => count === firstCount && count > 1);
      
      if (consistentColumns && firstCount <= this.config.maxColumns) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get table statistics
   */
  getTableStatistics(tableBlock: TableBlock): {
    rowCount: number;
    columnCount: number;
    hasHeaders: boolean;
    cellCount: number;
  } {
    if (!tableBlock || tableBlock.type !== 'table') {
      return { rowCount: 0, columnCount: 0, hasHeaders: false, cellCount: 0 };
    }

    const rows = tableBlock.content.rows || [];
    const rowCount = rows.length;
    const columnCount = rows[0]?.length || 0;
    const hasHeaders = !!(tableBlock.content.headers && tableBlock.content.headers.length > 0);
    const cellCount = rowCount * columnCount;

    return { rowCount, columnCount, hasHeaders, cellCount };
  }

  /**
   * Private helper methods
   */

  private createTableBlock(
    content: { headers?: string[], rows: any[][], caption?: string },
    options: Partial<TableBlock> = {}
  ): TableBlock {
    const baseBlock = createLayoutBlock('table', content, options);
    
    return {
      ...baseBlock,
      type: 'table',
      content,
      layout: {
        hasHeader: !!(content.headers && content.headers.length > 0),
        bordered: true,
        striped: false,
        ...options.layout
      }
    } as TableBlock;
  }

  private parseTextToTableData(
    text: string,
    options: Partial<TableGenerationOptions>
  ): { headers: string[], rows: any[][] } {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // Try to detect delimiter
    const delimiter = this.detectDelimiter(lines[0] || '');
    
    // Parse headers (first line if includeHeaders is true)
    let headers: string[] = [];
    let dataLines = lines;
    
    if (options.includeHeaders !== false && lines.length > 1) {
      headers = lines[0].split(delimiter).map(h => h.trim());
      dataLines = lines.slice(1);
    }
    
    // Parse rows
    const rows = dataLines.map(line => 
      line.split(delimiter).map(cell => {
        const trimmed = cell.trim();
        // Try to convert to number if possible
        const num = Number(trimmed);
        return isNaN(num) ? trimmed : num;
      })
    );

    return { headers, rows };
  }

  private detectDelimiter(line: string): string {
    const delimiters = [',', ';', '\t', '|'];
    
    for (const delimiter of delimiters) {
      const parts = line.split(delimiter);
      if (parts.length > 1) {
        return delimiter;
      }
    }
    
    // Default to comma if no delimiter found
    return ',';
  }

  private generateColumnAlignments(columnCount: number): ColumnAlignment[] {
    return Array(columnCount).fill(this.config.defaultColumnAlignment);
  }

  private getTableLayoutOptions(options: Partial<TableGenerationOptions>): Partial<LayoutConfig> {
    return {
      alignment: 'left',
      width: 100,
      margin: { top: 10, right: 0, bottom: 10, left: 0 },
      padding: { top: 5, right: 5, bottom: 5, left: 5 }
    };
  }
}

/**
 * Create a default table engine instance
 */
export function createTableEngine(config: Partial<TableEngineConfig> = {}): TableEngine {
  return new TableEngine(config);
}