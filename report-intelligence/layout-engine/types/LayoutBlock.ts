/**
 * Phase 23: AI Layout Engine
 * Layout Block Type Definitions
 */

/**
 * Supported block types as specified in Phase 23
 */
export type LayoutBlockType = 
  | 'paragraph'
  | 'heading'
  | 'columns'
  | 'image'
  | 'figure'
  | 'table'
  | 'quote'
  | 'list'
  | 'code';

/**
 * Column alignment options
 */
export type ColumnAlignment = 'left' | 'right' | 'center' | 'justify';

/**
 * Layout configuration for blocks
 */
export interface LayoutConfig {
  /** Number of columns (for column blocks) */
  columns?: number;
  /** Alignment of content within block */
  alignment?: ColumnAlignment;
  /** Width percentage (0-100) */
  width?: number;
  /** Whether block is floating */
  float?: 'left' | 'right' | 'none';
  /** Margin in pixels */
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  /** Padding in pixels */
  padding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

/**
 * Base layout block interface
 */
export interface LayoutBlock {
  /** Unique identifier for the block */
  id: string;
  /** Type of layout block */
  type: LayoutBlockType;
  /** Content of the block (type-specific) */
  content: any;
  /** Layout configuration */
  layout?: LayoutConfig;
  /** Metadata for the block */
  metadata?: {
    /** When the block was created */
    createdAt: Date;
    /** When the block was last modified */
    updatedAt: Date;
    /** User who created the block */
    createdBy?: string;
    /** Tags for categorization */
    tags?: string[];
    /** Custom metadata */
    custom?: Record<string, any>;
  };
}

/**
 * Paragraph block
 */
export interface ParagraphBlock extends LayoutBlock {
  type: 'paragraph';
  content: string;
  layout?: LayoutConfig & {
    /** Font size in pixels */
    fontSize?: number;
    /** Line height multiplier */
    lineHeight?: number;
    /** Text color */
    color?: string;
  };
}

/**
 * Heading block
 */
export interface HeadingBlock extends LayoutBlock {
  type: 'heading';
  content: string;
  /** Heading level (1-6) */
  level: 1 | 2 | 3 | 4 | 5 | 6;
  layout?: LayoutConfig & {
    /** Font size in pixels */
    fontSize?: number;
    /** Font weight */
    fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
    /** Text color */
    color?: string;
  };
}

/**
 * Column block - contains multiple sub-blocks arranged in columns
 */
export interface ColumnBlock extends LayoutBlock {
  type: 'columns';
  /** Array of column content blocks */
  content: LayoutBlock[][];
  layout?: LayoutConfig & {
    /** Number of columns */
    columns: number;
    /** Gap between columns in pixels */
    columnGap?: number;
    /** Whether columns have equal width */
    equalWidth?: boolean;
    /** Column widths as percentages */
    columnWidths?: number[];
  };
}

/**
 * Image block
 */
export interface ImageBlock extends LayoutBlock {
  type: 'image';
  content: {
    /** Image source URL or data URI */
    src: string;
    /** Alt text for accessibility */
    alt?: string;
    /** Image width in pixels */
    width?: number;
    /** Image height in pixels */
    height?: number;
    /** Image title */
    title?: string;
  };
  layout?: LayoutConfig & {
    /** Maximum width in pixels */
    maxWidth?: number;
    /** Maximum height in pixels */
    maxHeight?: number;
    /** Whether to maintain aspect ratio */
    maintainAspectRatio?: boolean;
    /** Border style */
    border?: {
      width?: number;
      color?: string;
      style?: 'solid' | 'dashed' | 'dotted';
    };
  };
}

/**
 * Figure block - image with caption
 */
export interface FigureBlock extends LayoutBlock {
  type: 'figure';
  content: {
    /** Image block */
    image: ImageBlock;
    /** Caption text */
    caption: string;
    /** Figure number/label */
    label?: string;
    /** Figure number (e.g., "Figure 3") */
    number?: string;
  };
  layout?: LayoutConfig & {
    /** Caption position */
    captionPosition?: 'above' | 'below' | 'left' | 'right';
    /** Caption alignment */
    captionAlignment?: ColumnAlignment;
    /** Whether to show label */
    showLabel?: boolean;
  };
}

/**
 * Table block
 */
export interface TableBlock extends LayoutBlock {
  type: 'table';
  content: {
    /** Table headers */
    headers?: string[];
    /** Table rows */
    rows: any[][];
    /** Table caption */
    caption?: string;
  };
  layout?: LayoutConfig & {
    /** Whether table has header row */
    hasHeader?: boolean;
    /** Whether table has borders */
    bordered?: boolean;
    /** Whether table is striped */
    striped?: boolean;
    /** Column alignments */
    columnAlignments?: ColumnAlignment[];
    /** Column widths as percentages */
    columnWidths?: number[];
  };
}

/**
 * Quote block
 */
export interface QuoteBlock extends LayoutBlock {
  type: 'quote';
  content: {
    /** Quote text */
    text: string;
    /** Quote attribution */
    attribution?: string;
    /** Source of quote */
    source?: string;
  };
  layout?: LayoutConfig & {
    /** Quote style */
    style?: 'blockquote' | 'pullquote' | 'inline';
    /** Border color for blockquote */
    borderColor?: string;
    /** Background color */
    backgroundColor?: string;
    /** Text alignment */
    textAlignment?: ColumnAlignment;
  };
}

/**
 * List block
 */
export interface ListBlock extends LayoutBlock {
  type: 'list';
  content: {
    /** List items */
    items: string[];
    /** List type */
    listType: 'ordered' | 'unordered' | 'checklist';
    /** Whether items are checked (for checklists) */
    checked?: boolean[];
  };
  layout?: LayoutConfig & {
    /** List style for unordered lists */
    listStyle?: 'disc' | 'circle' | 'square' | 'none';
    /** List style for ordered lists */
    listStyleType?: 'decimal' | 'lower-alpha' | 'upper-alpha' | 'lower-roman' | 'upper-roman';
    /** Indentation level */
    indentLevel?: number;
  };
}

/**
 * Code block
 */
export interface CodeBlock extends LayoutBlock {
  type: 'code';
  content: {
    /** Code content */
    code: string;
    /** Programming language */
    language?: string;
    /** Whether to show line numbers */
    showLineNumbers?: boolean;
    /** File name (optional) */
    fileName?: string;
  };
  layout?: LayoutConfig & {
    /** Syntax highlighting theme */
    theme?: 'light' | 'dark' | 'github' | 'monokai';
    /** Font family for code */
    fontFamily?: string;
    /** Font size for code */
    fontSize?: number;
    /** Whether to wrap long lines */
    wrapLines?: boolean;
  };
}

/**
 * Type guard functions
 */
export function isParagraphBlock(block: LayoutBlock): block is ParagraphBlock {
  return block.type === 'paragraph';
}

export function isHeadingBlock(block: LayoutBlock): block is HeadingBlock {
  return block.type === 'heading';
}

export function isColumnBlock(block: LayoutBlock): block is ColumnBlock {
  return block.type === 'columns';
}

export function isImageBlock(block: LayoutBlock): block is ImageBlock {
  return block.type === 'image';
}

export function isFigureBlock(block: LayoutBlock): block is FigureBlock {
  return block.type === 'figure';
}

export function isTableBlock(block: LayoutBlock): block is TableBlock {
  return block.type === 'table';
}

export function isQuoteBlock(block: LayoutBlock): block is QuoteBlock {
  return block.type === 'quote';
}

export function isListBlock(block: LayoutBlock): block is ListBlock {
  return block.type === 'list';
}

export function isCodeBlock(block: LayoutBlock): block is CodeBlock {
  return block.type === 'code';
}

/**
 * Create a layout block with default values
 */
export function createLayoutBlock<T extends LayoutBlockType>(
  type: T,
  content: any,
  options: Partial<LayoutBlock> = {}
): LayoutBlock {
  const id = options.id || `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date();
  
  const baseBlock: LayoutBlock = {
    id,
    type,
    content,
    layout: options.layout,
    metadata: {
      createdAt: now,
      updatedAt: now,
      createdBy: options.metadata?.createdBy,
      tags: options.metadata?.tags || [],
      custom: options.metadata?.custom || {}
    }
  };
  
  return baseBlock;
}

/**
 * Create a paragraph block
 */
export function createParagraphBlock(
  text: string,
  options: Partial<ParagraphBlock> = {}
): ParagraphBlock {
  return {
    ...createLayoutBlock('paragraph', text, options),
    type: 'paragraph',
    content: text,
    layout: options.layout
  } as ParagraphBlock;
}

/**
 * Create a heading block
 */
export function createHeadingBlock(
  text: string,
  level: 1 | 2 | 3 | 4 | 5 | 6,
  options: Partial<HeadingBlock> = {}
): HeadingBlock {
  return {
    ...createLayoutBlock('heading', text, options),
    type: 'heading',
    content: text,
    level,
    layout: options.layout
  } as HeadingBlock;
}

/**
 * Create a column block
 */
export function createColumnBlock(
  columns: LayoutBlock[][],
  options: Partial<ColumnBlock> = {}
): ColumnBlock {
  return {
    ...createLayoutBlock('columns', columns, options),
    type: 'columns',
    content: columns,
    layout: {
      columns: columns.length,
      equalWidth: true,
      columnGap: 20,
      ...options.layout
    }
  } as ColumnBlock;
}

/**
 * Create an image block
 */
export function createImageBlock(
  src: string,
  alt?: string,
  options: Partial<ImageBlock> = {}
): ImageBlock {
  return {
    ...createLayoutBlock('image', { src, alt }, options),
    type: 'image',
    content: { src, alt },
    layout: options.layout
  } as ImageBlock;
}

/**
 * Create a figure block
 */
export function createFigureBlock(
  image: ImageBlock,
  caption: string,
  label?: string,
  options: Partial<FigureBlock> = {}
): FigureBlock {
  return {
    ...createLayoutBlock('figure', { image, caption, label }, options),
    type: 'figure',
    content: { image, caption, label },
    layout: {
      captionPosition: 'below',
      captionAlignment: 'center',
      showLabel: true,
      ...options.layout
    }
  } as FigureBlock;
}

/**
 * Generate a unique block ID
 */
export function generateBlockId(prefix: string = 'block'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}_${timestamp}_${random}`;
}