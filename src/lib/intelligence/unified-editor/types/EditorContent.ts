/**
 * Editor Content – structured block model for unified editor.
 */

export interface EditorContent {
	blocks: EditorBlock[];
}

export type EditorBlock =
	| ParagraphBlock
	| HeadingBlock
	| ListBlock
	| QuoteBlock
	| ImageBlock
	| CodeBlock
	| DividerBlock
	| TableBlock;

export interface ParagraphBlock {
	type: 'paragraph';
	content: string;
	style?: 'normal' | 'lead' | 'small';
}

export interface HeadingBlock {
	type: 'heading';
	level: 1 | 2 | 3 | 4 | 5 | 6;
	content: string;
}

export interface ListBlock {
	type: 'list';
	ordered: boolean;
	items: string[];
}

export interface QuoteBlock {
	type: 'quote';
	content: string;
	author?: string;
	source?: string;
}

export interface ImageBlock {
	type: 'image';
	src: string;
	alt: string;
	caption?: string;
	width?: number;
	height?: number;
}

export interface CodeBlock {
	type: 'code';
	language: string;
	content: string;
}

export interface DividerBlock {
	type: 'divider';
	style: 'solid' | 'dashed' | 'dotted';
}

export interface TableBlock {
	type: 'table';
	headers: string[];
	rows: string[][];
}

/**
 * Create an empty editor content.
 */
export function createEmptyContent(): EditorContent {
	return { blocks: [] };
}

/**
 * Create a paragraph block.
 */
export function createParagraph(content: string, style?: 'normal' | 'lead' | 'small'): ParagraphBlock {
	return { type: 'paragraph', content, style };
}

/**
 * Create a heading block.
 */
export function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6, content: string): HeadingBlock {
	return { type: 'heading', level, content };
}

/**
 * Create a list block.
 */
export function createList(ordered: boolean, items: string[]): ListBlock {
	return { type: 'list', ordered, items };
}

/**
 * Create a quote block.
 */
export function createQuote(content: string, author?: string, source?: string): QuoteBlock {
	return { type: 'quote', content, author, source };
}

/**
 * Create an image block.
 */
export function createImage(src: string, alt: string, caption?: string): ImageBlock {
	return { type: 'image', src, alt, caption };
}

/**
 * Create a code block.
 */
export function createCode(language: string, content: string): CodeBlock {
	return { type: 'code', language, content };
}

/**
 * Create a divider block.
 */
export function createDivider(style: 'solid' | 'dashed' | 'dotted' = 'solid'): DividerBlock {
	return { type: 'divider', style };
}

/**
 * Create a table block.
 */
export function createTable(headers: string[], rows: string[][]): TableBlock {
	return { type: 'table', headers, rows };
}