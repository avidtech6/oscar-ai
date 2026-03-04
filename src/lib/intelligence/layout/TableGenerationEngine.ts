import type { LayoutBlock, LayoutConfig } from './LayoutTypes';
import { LayoutBlockSystem } from './LayoutBlockSystem';

/**
 * Table generation engine – creates tables from text, converts lists to tables, etc.
 */
export class TableGenerationEngine {
  private blockSystem: LayoutBlockSystem;

  constructor(blockSystem?: LayoutBlockSystem) {
    this.blockSystem = blockSystem ?? new LayoutBlockSystem();
  }

  /**
   * Create a table block from headers and rows.
   */
  createTable(
    headers: string[],
    rows: string[][],
    caption?: string,
    layout?: LayoutConfig
  ): LayoutBlock {
    return this.blockSystem.createTableBlock(headers, rows, caption, layout);
  }

  /**
   * Convert a list block to a table block.
   * Each list item becomes a row with a single column.
   */
  listToTable(listBlock: LayoutBlock, headers?: string[]): LayoutBlock {
    if (listBlock.type !== 'list') {
      throw new Error('Block is not a list block');
    }
    const items = (listBlock.content as any).items as string[];
    const rows = items.map(item => [item]);
    const finalHeaders = headers ?? ['Item'];
    return this.createTable(finalHeaders, rows, undefined, listBlock.layout);
  }

  /**
   * Convert a table block to a list block.
   * Uses the first column as list items.
   */
  tableToList(tableBlock: LayoutBlock, ordered: boolean = false): LayoutBlock {
    if (tableBlock.type !== 'table') {
      throw new Error('Block is not a table block');
    }
    const content = tableBlock.content as any;
    const rows = content.rows as string[][];
    const items = rows.map(row => row[0] || '');
    return this.blockSystem.createListBlock(items, ordered, tableBlock.layout);
  }

  /**
   * Generate a table from structured text (placeholder).
   * Example: "Species: Oak, Height: 10m, Condition: Good"
   */
  generateTableFromText(
    text: string,
    columnNames: string[],
    layout?: LayoutConfig
  ): LayoutBlock {
    // Simple delimiter‑based parsing (for demonstration)
    const lines = text.split('\n').filter(line => line.trim());
    const rows: string[][] = lines.map(line => {
      // Assume comma‑separated values
      return line.split(',').map(cell => cell.trim());
    });
    // Ensure each row has same number of columns as columnNames
    const paddedRows = rows.map(row => {
      while (row.length < columnNames.length) row.push('');
      return row.slice(0, columnNames.length);
    });
    return this.createTable(columnNames, paddedRows, undefined, layout);
  }

  /**
   * Add a row to an existing table block.
   */
  addRow(tableBlock: LayoutBlock, row: string[]): LayoutBlock {
    if (tableBlock.type !== 'table') {
      throw new Error('Block is not a table block');
    }
    const content = { ...tableBlock.content };
    content.rows = [...content.rows, row];
    return this.blockSystem.updateBlock(tableBlock, content);
  }

  /**
   * Delete a row from a table block.
   */
  deleteRow(tableBlock: LayoutBlock, rowIndex: number): LayoutBlock {
    if (tableBlock.type !== 'table') {
      throw new Error('Block is not a table block');
    }
    const content = { ...tableBlock.content };
    if (rowIndex < 0 || rowIndex >= content.rows.length) {
      throw new Error('Row index out of bounds');
    }
    content.rows.splice(rowIndex, 1);
    return this.blockSystem.updateBlock(tableBlock, content);
  }

  /**
   * Update a cell in a table block.
   */
  updateCell(
    tableBlock: LayoutBlock,
    rowIndex: number,
    colIndex: number,
    value: string
  ): LayoutBlock {
    if (tableBlock.type !== 'table') {
      throw new Error('Block is not a table block');
    }
    const content = { ...tableBlock.content };
    if (
      rowIndex < 0 ||
      rowIndex >= content.rows.length ||
      colIndex < 0 ||
      colIndex >= content.headers.length
    ) {
      throw new Error('Indices out of bounds');
    }
    content.rows[rowIndex][colIndex] = value;
    return this.blockSystem.updateBlock(tableBlock, content);
  }

  /**
   * Sort table rows by a column.
   */
  sortTable(
    tableBlock: LayoutBlock,
    columnIndex: number,
    ascending: boolean = true
  ): LayoutBlock {
    if (tableBlock.type !== 'table') {
      throw new Error('Block is not a table block');
    }
    const content = { ...tableBlock.content };
    const rows = [...content.rows];
    rows.sort((a, b) => {
      const aVal = a[columnIndex] || '';
      const bVal = b[columnIndex] || '';
      return ascending
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
    content.rows = rows;
    return this.blockSystem.updateBlock(tableBlock, content);
  }

  /**
   * Transpose a table (swap rows and headers).
   */
  transposeTable(tableBlock: LayoutBlock): LayoutBlock {
    if (tableBlock.type !== 'table') {
      throw new Error('Block is not a table block');
    }
    const content = tableBlock.content as any;
    const oldHeaders = content.headers;
    const oldRows = content.rows;
    // New headers are the first column of old rows (or placeholder)
    const newHeaders = oldRows.map((row: string[], idx: number) => `Row ${idx + 1}`);
    // New rows: each old header becomes a row
    const newRows = oldHeaders.map((header: string, colIdx: number) =>
      [header, ...oldRows.map((row: string[]) => row[colIdx] || '')]
    );
    return this.createTable(newHeaders, newRows, content.caption, tableBlock.layout);
  }
}