/**
 * Formatting Toolbar – UI component for formatting blocks in the structured editor.
 */

import type { Block, BlockType } from './BlockModel';

export interface FormattingToolbarState {
	bold: boolean;
	italic: boolean;
	underline: boolean;
	strikethrough: boolean;
	headingLevel: 0 | 1 | 2 | 3; // 0 = paragraph
	alignment: 'left' | 'center' | 'right' | 'justify';
	listType: 'none' | 'bullet' | 'numbered';
	linkUrl: string | null;
	imageUrl: string | null;
}

export class FormattingToolbar {
	private state: FormattingToolbarState = {
		bold: false,
		italic: false,
		underline: false,
		strikethrough: false,
		headingLevel: 0,
		alignment: 'left',
		listType: 'none',
		linkUrl: null,
		imageUrl: null,
	};

	private listeners: ((state: FormattingToolbarState) => void)[] = [];

	/**
	 * Update toolbar state based on the current block.
	 */
	updateFromBlock(block: Block | null) {
		if (!block) {
			this.state = {
				bold: false,
				italic: false,
				underline: false,
				strikethrough: false,
				headingLevel: 0,
				alignment: 'left',
				listType: 'none',
				linkUrl: null,
				imageUrl: null,
			};
		} else {
			// Simplified mapping
			this.state.headingLevel = block.type === 'heading1' ? 1 : block.type === 'heading2' ? 2 : block.type === 'heading3' ? 3 : 0;
			this.state.listType = block.type === 'bulletList' ? 'bullet' : block.type === 'numberedList' ? 'numbered' : 'none';
			// Detect formatting from block text (mock)
			this.state.bold = block.text.includes('**') || block.html.includes('<strong>');
			this.state.italic = block.text.includes('*') || block.html.includes('<em>');
			this.state.underline = block.html.includes('<u>');
			this.state.strikethrough = block.html.includes('<s>');
		}
		this.notify();
	}

	/**
	 * Apply formatting to a block.
	 */
	applyFormatting(block: Block): Block {
		// This is a mock implementation; a real one would modify block's HTML/content.
		return { ...block };
	}

	/**
	 * Toggle bold.
	 */
	toggleBold() {
		this.state.bold = !this.state.bold;
		this.notify();
	}

	/**
	 * Toggle italic.
	 */
	toggleItalic() {
		this.state.italic = !this.state.italic;
		this.notify();
	}

	/**
	 * Toggle underline.
	 */
	toggleUnderline() {
		this.state.underline = !this.state.underline;
		this.notify();
	}

	/**
	 * Set heading level.
	 */
	setHeadingLevel(level: 0 | 1 | 2 | 3) {
		this.state.headingLevel = level;
		this.notify();
	}

	/**
	 * Set alignment.
	 */
	setAlignment(alignment: 'left' | 'center' | 'right' | 'justify') {
		this.state.alignment = alignment;
		this.notify();
	}

	/**
	 * Set list type.
	 */
	setListType(type: 'none' | 'bullet' | 'numbered') {
		this.state.listType = type;
		this.notify();
	}

	/**
	 * Set link URL.
	 */
	setLinkUrl(url: string | null) {
		this.state.linkUrl = url;
		this.notify();
	}

	/**
	 * Set image URL.
	 */
	setImageUrl(url: string | null) {
		this.state.imageUrl = url;
		this.notify();
	}

	/**
	 * Get current state.
	 */
	getState(): FormattingToolbarState {
		return { ...this.state };
	}

	/**
	 * Subscribe to state changes.
	 */
	subscribe(listener: (state: FormattingToolbarState) => void) {
		this.listeners.push(listener);
		return () => {
			this.listeners = this.listeners.filter(l => l !== listener);
		};
	}

	private notify() {
		const state = this.getState();
		this.listeners.forEach(listener => listener(state));
	}
}