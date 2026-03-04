import type {
  LayoutBlock,
  LayoutBlockType,
  BlockContent,
  LayoutConfig,
  ParagraphBlockContent,
  HeadingBlockContent,
  ColumnBlockContent,
  ImageBlockContent,
  FigureBlockContent,
  TableBlockContent,
  QuoteBlockContent,
  ListBlockContent,
  CodeBlockContent,
} from './LayoutTypes';

/**
 * Layout block system – creates, validates, and manipulates layout blocks.
 */
export class LayoutBlockSystem {
  /**
   * Create a new layout block.
   */
  createBlock(
    type: LayoutBlockType,
    content: BlockContent,
    layout?: LayoutConfig
  ): LayoutBlock {
    const id = crypto.randomUUID();
    return {
      id,
      type,
      content,
      layout,
      metadata: {
        createdAt: new Date().toISOString(),
        version: 1,
      },
    };
  }

  /**
   * Create a paragraph block.
   */
  createParagraphBlock(
    text: string,
    style: 'normal' | 'lead' | 'small' = 'normal',
    layout?: LayoutConfig
  ): LayoutBlock {
    const content: ParagraphBlockContent = { text, style };
    return this.createBlock('paragraph', content, layout);
  }

  /**
   * Create a heading block.
   */
  createHeadingBlock(
    text: string,
    level: 1 | 2 | 3 | 4 | 5 | 6,
    layout?: LayoutConfig
  ): LayoutBlock {
    const content: HeadingBlockContent = { text, level };
    return this.createBlock('heading', content, layout);
  }

  /**
   * Create a column block with the given number of columns.
   */
  createColumnBlock(
    columns: LayoutBlock[][],
    layout?: LayoutConfig
  ): LayoutBlock {
    const content: ColumnBlockContent = { columns };
    return this.createBlock('columns', content, layout);
  }

  /**
   * Create an image block.
   */
  createImageBlock(
    mediaId: string,
    alt?: string,
    caption?: string,
    layout?: LayoutConfig
  ): LayoutBlock {
    const content: ImageBlockContent = { mediaId, alt, caption };
    return this.createBlock('image', content, layout);
  }

  /**
   * Create a figure block (image + caption + label).
   */
  createFigureBlock(
    mediaId: string,
    label: string,
    caption: string,
    layout?: LayoutConfig
  ): LayoutBlock {
    const content: FigureBlockContent = { mediaId, label, caption };
    return this.createBlock('figure', content, layout);
  }

  /**
   * Create a table block.
   */
  createTableBlock(
    headers: string[],
    rows: string[][],
    caption?: string,
    layout?: LayoutConfig
  ): LayoutBlock {
    const content: TableBlockContent = { headers, rows, caption };
    return this.createBlock('table', content, layout);
  }

  /**
   * Create a quote block.
   */
  createQuoteBlock(
    text: string,
    author?: string,
    source?: string,
    layout?: LayoutConfig
  ): LayoutBlock {
    const content: QuoteBlockContent = { text, author, source };
    return this.createBlock('quote', content, layout);
  }

  /**
   * Create a list block.
   */
  createListBlock(
    items: string[],
    ordered: boolean = false,
    layout?: LayoutConfig
  ): LayoutBlock {
    const content: ListBlockContent = { items, ordered };
    return this.createBlock('list', content, layout);
  }

  /**
   * Create a code block.
   */
  createCodeBlock(
    code: string,
    language?: string,
    layout?: LayoutConfig
  ): LayoutBlock {
    const content: CodeBlockContent = { code, language };
    return this.createBlock('code', content, layout);
  }

  /**
   * Update an existing block's content.
   */
  updateBlock(block: LayoutBlock, newContent: BlockContent): LayoutBlock {
    return {
      ...block,
      content: newContent,
      metadata: {
        ...block.metadata,
        updatedAt: new Date().toISOString(),
        version: (block.metadata?.version ?? 1) + 1,
      },
    };
  }

  /**
   * Update a block's layout configuration.
   */
  updateBlockLayout(block: LayoutBlock, layout: LayoutConfig): LayoutBlock {
    return {
      ...block,
      layout,
      metadata: {
        ...block.metadata,
        updatedAt: new Date().toISOString(),
        version: (block.metadata?.version ?? 1) + 1,
      },
    };
  }

  /**
   * Validate a block's structure.
   */
  validateBlock(block: LayoutBlock): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!block.id) errors.push('Block missing ID');
    if (!block.type) errors.push('Block missing type');
    if (!block.content) errors.push('Block missing content');

    // Type‑specific validation
    switch (block.type) {
      case 'paragraph':
        if (typeof (block.content as ParagraphBlockContent).text !== 'string') {
          errors.push('Paragraph block content.text must be a string');
        }
        break;
      case 'heading':
        const heading = block.content as HeadingBlockContent;
        if (typeof heading.text !== 'string') errors.push('Heading text must be a string');
        if (![1, 2, 3, 4, 5, 6].includes(heading.level)) {
          errors.push('Heading level must be 1‑6');
        }
        break;
      case 'columns':
        const cols = block.content as ColumnBlockContent;
        if (!Array.isArray(cols.columns)) errors.push('Columns must be an array');
        break;
      case 'image':
        const img = block.content as ImageBlockContent;
        if (!img.mediaId) errors.push('Image block missing mediaId');
        break;
      case 'figure':
        const fig = block.content as FigureBlockContent;
        if (!fig.mediaId) errors.push('Figure block missing mediaId');
        if (!fig.label) errors.push('Figure block missing label');
        if (!fig.caption) errors.push('Figure block missing caption');
        break;
      case 'table':
        const tbl = block.content as TableBlockContent;
        if (!Array.isArray(tbl.headers)) errors.push('Table headers must be an array');
        if (!Array.isArray(tbl.rows)) errors.push('Table rows must be an array');
        break;
      case 'quote':
        if (typeof (block.content as QuoteBlockContent).text !== 'string') {
          errors.push('Quote block text must be a string');
        }
        break;
      case 'list':
        const lst = block.content as ListBlockContent;
        if (!Array.isArray(lst.items)) errors.push('List items must be an array');
        if (typeof lst.ordered !== 'boolean') errors.push('List ordered must be boolean');
        break;
      case 'code':
        if (typeof (block.content as CodeBlockContent).code !== 'string') {
          errors.push('Code block code must be a string');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}