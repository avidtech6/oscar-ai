/**
 * Phase 23: AI Layout Engine
 * Type Definitions Index
 */

// Import all types from LayoutBlock
import type {
  LayoutBlockType,
  ColumnAlignment,
  LayoutConfig,
  LayoutBlock,
  ParagraphBlock,
  HeadingBlock,
  ColumnBlock,
  ImageBlock,
  FigureBlock,
  TableBlock,
  QuoteBlock,
  ListBlock,
  CodeBlock
} from './LayoutBlock';

import {
  isParagraphBlock as isParagraphBlockOriginal,
  isHeadingBlock as isHeadingBlockOriginal,
  isColumnBlock as isColumnBlockOriginal,
  isImageBlock as isImageBlockOriginal,
  isFigureBlock as isFigureBlockOriginal,
  isTableBlock as isTableBlockOriginal,
  isQuoteBlock as isQuoteBlockOriginal,
  isListBlock as isListBlockOriginal,
  isCodeBlock as isCodeBlockOriginal,
  createLayoutBlock,
  createParagraphBlock,
  createHeadingBlock,
  createColumnBlock,
  createImageBlock,
  createFigureBlock,
  generateBlockId
} from './LayoutBlock';

// Re-export all from LayoutBlock
export * from './LayoutBlock';

/**
 * Layout engine event types
 */
export interface LayoutEvent {
  type: string;
  blockId: string;
  timestamp: Date;
  data?: any;
}

export interface BlockAddedEvent extends LayoutEvent {
  type: 'blockAdded';
  data: {
    block: LayoutBlock;
    position?: number;
  };
}

export interface BlockMovedEvent extends LayoutEvent {
  type: 'blockMoved';
  data: {
    fromIndex: number;
    toIndex: number;
  };
}

export interface BlockDeletedEvent extends LayoutEvent {
  type: 'blockDeleted';
  data: {
    blockId: string;
  };
}

export interface LayoutChangedEvent extends LayoutEvent {
  type: 'layoutChanged';
  data: {
    oldLayout: LayoutConfig;
    newLayout: LayoutConfig;
  };
}

export interface MediaAddedEvent extends LayoutEvent {
  type: 'mediaAdded';
  data: {
    mediaId: string;
    blockId: string;
  };
}

/**
 * Layout engine configuration
 */
export interface LayoutEngineConfig {
  /** Whether to enable automatic layout suggestions */
  enableSuggestions: boolean;
  /** Maximum number of columns allowed */
  maxColumns: number;
  /** Default column gap in pixels */
  defaultColumnGap: number;
  /** Whether to maintain aspect ratio for images */
  maintainImageAspectRatio: boolean;
  /** Default figure caption position */
  defaultCaptionPosition: 'above' | 'below' | 'left' | 'right';
  /** Whether to show figure labels by default */
  showFigureLabels: boolean;
}

/**
 * Default layout engine configuration
 */
export const DEFAULT_LAYOUT_ENGINE_CONFIG: LayoutEngineConfig = {
  enableSuggestions: true,
  maxColumns: 4,
  defaultColumnGap: 20,
  maintainImageAspectRatio: true,
  defaultCaptionPosition: 'below',
  showFigureLabels: true
};

/**
 * Layout operation result
 */
export interface LayoutOperationResult {
  success: boolean;
  message: string;
  block?: LayoutBlock;
  blocks?: LayoutBlock[];
  error?: string;
}

/**
 * Column layout options
 */
export interface ColumnLayoutOptions {
  /** Number of columns */
  columns: number;
  /** Whether columns have equal width */
  equalWidth: boolean;
  /** Gap between columns in pixels */
  columnGap: number;
  /** Column widths as percentages (if not equal width) */
  columnWidths?: number[];
  /** Minimum column width in pixels */
  minColumnWidth?: number;
}

/**
 * Table generation options
 */
export interface TableGenerationOptions {
  /** Whether to include headers */
  includeHeaders: boolean;
  /** Whether to make table bordered */
  bordered: boolean;
  /** Whether to make table striped */
  striped: boolean;
  /** Column alignments */
  columnAlignments?: ColumnAlignment[];
}

/**
 * Figure generation options
 */
export interface FigureGenerationOptions {
  /** Whether to include caption */
  includeCaption: boolean;
  /** Whether to include label/number */
  includeLabel: boolean;
  /** Caption position */
  captionPosition: 'above' | 'below' | 'left' | 'right';
  /** Label format (e.g., "Figure {n}") */
  labelFormat: string;
}

/**
 * Type utilities
 */

/**
 * Check if value is a LayoutBlock
 */
export function isLayoutBlock(value: any): value is LayoutBlock {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.type === 'string' &&
    'content' in value
  );
}

/**
 * Create a default layout configuration
 */
export function createDefaultLayoutConfig(): LayoutConfig {
  return {
    alignment: 'left',
    width: 100,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    padding: { top: 0, right: 0, bottom: 0, left: 0 }
  };
}

/**
 * Merge multiple layout configurations
 */
export function mergeLayoutConfigs(
  ...configs: (LayoutConfig | undefined)[]
): LayoutConfig {
  const result: LayoutConfig = createDefaultLayoutConfig();
  
  for (const config of configs) {
    if (!config) continue;
    
    if (config.columns !== undefined) result.columns = config.columns;
    if (config.alignment !== undefined) result.alignment = config.alignment;
    if (config.width !== undefined) result.width = config.width;
    if (config.float !== undefined) result.float = config.float;
    
    if (config.margin) {
      result.margin = {
        ...result.margin,
        ...config.margin
      };
    }
    
    if (config.padding) {
      result.padding = {
        ...result.padding,
        ...config.padding
      };
    }
  }
  
  return result;
}

/**
 * Calculate column widths for a given number of columns
 */
export function calculateColumnWidths(
  columns: number,
  equalWidth: boolean = true,
  customWidths?: number[]
): number[] {
  if (customWidths && customWidths.length === columns) {
    return customWidths;
  }
  
  if (equalWidth) {
    const width = 100 / columns;
    return Array(columns).fill(width);
  }
  
  // Default unequal widths (first column wider)
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