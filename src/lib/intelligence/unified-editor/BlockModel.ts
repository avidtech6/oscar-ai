/**
 * Block Model – defines the structured block data model.
 */

import type { EditorBlock, EditorContent } from './types/EditorContent';

/**
 * Block Model – utilities for manipulating blocks.
 */
export class BlockModel {
	/**
	 * Validate a block.
	 */
	static validateBlock(block: EditorBlock): boolean {
		switch (block.type) {
			case 'paragraph':
				return typeof block.content === 'string' && block.content.length > 0;
			case 'heading':
				return typeof block.content === 'string' && block.content.length > 0 && block.level >= 1 && block.level <= 6;
			case 'list':
				return Array.isArray(block.items) && block.items.every(item => typeof item === 'string');
			case 'quote':
				return typeof block.content === 'string' && block.content.length > 0;
			case 'image':
				return typeof block.src === 'string' && block.src.length > 0 && typeof block.alt === 'string';
			case 'code':
				return typeof block.content === 'string' && typeof block.language === 'string';
			case 'divider':
				return ['solid', 'dashed', 'dotted'].includes(block.style);
			case 'table':
				return Array.isArray(block.headers) && Array.isArray(block.rows);
			default:
				return false;
		}
	}

	/**
	 * Get block type label.
	 */
	static getBlockTypeLabel(block: EditorBlock): string {
		switch (block.type) {
			case 'paragraph': return 'Paragraph';
			case 'heading': return `Heading ${block.level}`;
			case 'list': return block.ordered ? 'Ordered List' : 'Bulleted List';
			case 'quote': return 'Quote';
			case 'image': return 'Image';
			case 'code': return 'Code Block';
			case 'divider': return 'Divider';
			case 'table': return 'Table';
			default: return 'Unknown';
		}
	}

	/**
	 * Extract plain text from a block.
	 */
	static extractText(block: EditorBlock): string {
		switch (block.type) {
			case 'paragraph':
			case 'heading':
			case 'quote':
				return block.content;
			case 'list':
				return block.items.join('\n');
			case 'code':
				return block.content;
			case 'table':
				return [...block.headers, ...block.rows.flat()].join('\t');
			default:
				return '';
		}
	}

	/**
	 * Extract keywords from a block.
	 */
	static extractKeywords(block: EditorBlock): string[] {
		const text = this.extractText(block);
		const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 3);
		return [...new Set(words)].slice(0, 10);
	}

	/**
	 * Calculate block size (approximate).
	 */
	static calculateSize(block: EditorBlock): number {
		const text = this.extractText(block);
		return text.length;
	}

	/**
	 * Check if block is empty.
	 */
	static isEmpty(block: EditorBlock): boolean {
		return this.calculateSize(block) === 0;
	}

	/**
	 * Merge two blocks of same type (if possible).
	 */
	static mergeBlocks(a: EditorBlock, b: EditorBlock): EditorBlock | null {
		if (a.type !== b.type) return null;

		switch (a.type) {
			case 'paragraph':
				if (b.type !== 'paragraph') return null;
				return { ...a, content: a.content + ' ' + b.content };
			case 'list':
				if (b.type !== 'list' || a.ordered !== b.ordered) return null;
				return { ...a, items: [...a.items, ...b.items] };
			default:
				return null;
		}
	}
}