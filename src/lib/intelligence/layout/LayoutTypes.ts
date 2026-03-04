/**
 * Layout block types supported by the AI Layout Engine.
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
 * Layout alignment options.
 */
export type LayoutAlignment = 'left' | 'right' | 'center';

/**
 * Layout configuration for a block.
 */
export interface LayoutConfig {
  /** Number of columns (for column blocks) */
  columns?: number;
  /** Horizontal alignment */
  alignment?: LayoutAlignment;
  /** Width percentage (0‑100) */
  width?: number;
  /** Custom CSS class */
  className?: string;
  /** Column width percentages (for column blocks) */
  columnWidths?: number[];
}

/**
 * Base layout block.
 */
export interface LayoutBlock {
  /** Unique identifier */
  id: string;
  /** Block type */
  type: LayoutBlockType;
  /** Block content (type‑specific) */
  content: any;
  /** Layout configuration */
  layout?: LayoutConfig;
  /** Metadata (creation time, author, etc.) */
  metadata?: Record<string, any>;
}

/**
 * Paragraph block content.
 */
export interface ParagraphBlockContent {
  text: string;
  style?: 'normal' | 'lead' | 'small';
}

/**
 * Heading block content.
 */
export interface HeadingBlockContent {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Column block content.
 */
export interface ColumnBlockContent {
  /** Array of child blocks inside each column */
  columns: LayoutBlock[][];
}

/**
 * Image block content.
 */
export interface ImageBlockContent {
  /** Media ID (from media layer) */
  mediaId: string;
  /** Alt text */
  alt?: string;
  /** Caption (optional) */
  caption?: string;
}

/**
 * Figure block content (image + caption + label).
 */
export interface FigureBlockContent {
  /** Media ID */
  mediaId: string;
  /** Figure label (e.g., "Figure 3") */
  label: string;
  /** Caption text */
  caption: string;
}

/**
 * Table block content.
 */
export interface TableBlockContent {
  /** Table headers */
  headers: string[];
  /** Table rows */
  rows: string[][];
  /** Table caption */
  caption?: string;
}

/**
 * Quote block content.
 */
export interface QuoteBlockContent {
  text: string;
  author?: string;
  source?: string;
}

/**
 * List block content.
 */
export interface ListBlockContent {
  items: string[];
  ordered: boolean;
}

/**
 * Code block content.
 */
export interface CodeBlockContent {
  code: string;
  language?: string;
}

/**
 * Union of all block content types for type‑safe narrowing.
 */
export type BlockContent =
  | ParagraphBlockContent
  | HeadingBlockContent
  | ColumnBlockContent
  | ImageBlockContent
  | FigureBlockContent
  | TableBlockContent
  | QuoteBlockContent
  | ListBlockContent
  | CodeBlockContent;

/**
 * Layout event types.
 */
export type LayoutEventType =
  | 'blockAdded'
  | 'blockMoved'
  | 'blockDeleted'
  | 'layoutChanged'
  | 'mediaAdded';

/**
 * Layout event payloads.
 */
export interface BlockAddedEvent {
  type: 'blockAdded';
  block: LayoutBlock;
}

export interface BlockMovedEvent {
  type: 'blockMoved';
  blockId: string;
  newIndex: number;
}

export interface BlockDeletedEvent {
  type: 'blockDeleted';
  blockId: string;
}

export interface LayoutChangedEvent {
  type: 'layoutChanged';
  blockId: string;
  layout: LayoutConfig;
}

export interface MediaAddedEvent {
  type: 'mediaAdded';
  media: any; // Media type from media layer
}

export type LayoutEvent =
  | BlockAddedEvent
  | BlockMovedEvent
  | BlockDeletedEvent
  | LayoutChangedEvent
  | MediaAddedEvent;

/**
 * Assistant layout commands.
 */
export type LayoutCommand =
  | { type: 'createBlock'; blockType: LayoutBlockType; content: any }
  | { type: 'updateBlock'; blockId: string; content: any }
  | { type: 'moveBlock'; blockId: string; newIndex: number }
  | { type: 'setLayout'; blockId: string; layout: LayoutConfig }
  | { type: 'createColumns'; blockId: string; count: number }
  | { type: 'insertMediaIntoBlock'; blockId: string; mediaId: string };