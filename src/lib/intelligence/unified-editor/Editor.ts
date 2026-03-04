/**
 * Unified Editor Core – block‑based editor for multi‑device content creation.
 */

import type { EditorContent, EditorBlock } from './types/EditorContent';

export interface EditorOptions {
	readonly: boolean;
	placeholder?: string;
	autofocus?: boolean;
	spellcheck?: boolean;
	allowedBlocks?: string[];
}

/**
 * Unified Editor – manages block‑based content editing.
 */
export class UnifiedEditor {
	private content: EditorContent = { blocks: [] };
	private options: EditorOptions;

	constructor(options: EditorOptions = { readonly: false }) {
		this.options = options;
	}

	/**
	 * Set editor content.
	 */
	setContent(content: EditorContent) {
		this.content = content;
	}

	/**
	 * Get editor content.
	 */
	getContent(): EditorContent {
		return this.content;
	}

	/**
	 * Insert a block at position.
	 */
	insertBlock(block: EditorBlock, index?: number) {
		const idx = index ?? this.content.blocks.length;
		this.content.blocks.splice(idx, 0, block);
	}

	/**
	 * Update a block.
	 */
	updateBlock(index: number, updates: Partial<EditorBlock>) {
		if (index < 0 || index >= this.content.blocks.length) return;
		this.content.blocks[index] = { ...this.content.blocks[index], ...updates };
	}

	/**
	 * Delete a block.
	 */
	deleteBlock(index: number) {
		if (index < 0 || index >= this.content.blocks.length) return;
		this.content.blocks.splice(index, 1);
	}

	/**
	 * Move a block.
	 */
	moveBlock(fromIndex: number, toIndex: number) {
		const block = this.content.blocks[fromIndex];
		this.content.blocks.splice(fromIndex, 1);
		this.content.blocks.splice(toIndex, 0, block);
	}

	/**
	 * Convert editor content to HTML.
	 */
	toHTML(): string {
		return this.content.blocks.map((block: EditorBlock) => this.renderBlock(block)).join('\n');
	}

	/**
	 * Render a single block as HTML.
	 */
	private renderBlock(block: EditorBlock): string {
		switch (block.type) {
			case 'paragraph':
				return `<p>${block.content}</p>`;
			case 'heading':
				return `<h${block.level}>${block.content}</h${block.level}>`;
			case 'list':
				const tag = block.ordered ? 'ol' : 'ul';
				const items = block.items.map((item: string) => `<li>${item}</li>`).join('');
				return `<${tag}>${items}</${tag}>`;
			case 'quote':
				return `<blockquote>${block.content}</blockquote>`;
			case 'image':
				return `<img src="${block.src}" alt="${block.alt}" />`;
			case 'code':
				return `<pre><code>${block.content}</code></pre>`;
			default:
				return '';
		}
	}

	/**
	 * Convert editor content to plain text.
	 */
	toPlainText(): string {
		return this.content.blocks.map((block: EditorBlock) => {
			switch (block.type) {
				case 'paragraph':
				case 'heading':
				case 'quote':
					return block.content;
				case 'list':
					return block.items.map((item: string) => `• ${item}`).join('\n');
				default:
					return '';
			}
		}).join('\n\n');
	}
}