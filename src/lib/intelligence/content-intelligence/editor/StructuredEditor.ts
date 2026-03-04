/**
 * Structured Editor – core editor logic for Phase 17.
 */

import type { Block, BlockType } from './BlockModel';
import { createBlock, blockToHTML, blocksToHTML, htmlToBlocks } from './BlockModel';

export class StructuredEditor {
	private blocks: Block[] = [];
	private currentBlockIndex: number = -1;
	private onChangeCallbacks: ((blocks: Block[]) => void)[] = [];

	/**
	 * Initialise the editor with HTML content.
	 */
	initialise(html: string) {
		this.blocks = htmlToBlocks(html);
		if (this.blocks.length === 0) {
			this.blocks.push(createBlock('paragraph', ''));
		}
		this.currentBlockIndex = 0;
		this.notifyChange();
	}

	/**
	 * Get all blocks.
	 */
	getBlocks(): Block[] {
		return this.blocks;
	}

	/**
	 * Get the current block.
	 */
	getCurrentBlock(): Block | null {
		if (this.currentBlockIndex >= 0 && this.currentBlockIndex < this.blocks.length) {
			return this.blocks[this.currentBlockIndex];
		}
		return null;
	}

	/**
	 * Set the current block by index.
	 */
	setCurrentBlock(index: number) {
		if (index >= 0 && index < this.blocks.length) {
			this.blocks.forEach((block, i) => {
				block.selected = i === index;
				block.focused = i === index;
			});
			this.currentBlockIndex = index;
			this.notifyChange();
		}
	}

	/**
	 * Insert a new block after the current block.
	 */
	insertBlock(type: BlockType, text = '') {
		const newBlock = createBlock(type, text);
		const insertIndex = this.currentBlockIndex + 1;
		this.blocks.splice(insertIndex, 0, newBlock);
		this.currentBlockIndex = insertIndex;
		this.notifyChange();
	}

	/**
	 * Delete the current block.
	 */
	deleteCurrentBlock() {
		if (this.blocks.length <= 1) return; // keep at least one block
		this.blocks.splice(this.currentBlockIndex, 1);
		if (this.currentBlockIndex >= this.blocks.length) {
			this.currentBlockIndex = this.blocks.length - 1;
		}
		this.notifyChange();
	}

	/**
	 * Update the text of the current block.
	 */
	updateCurrentBlockText(text: string) {
		const block = this.getCurrentBlock();
		if (block) {
			block.text = text;
			this.notifyChange();
		}
	}

	/**
	 * Update the type of the current block.
	 */
	updateCurrentBlockType(type: BlockType) {
		const block = this.getCurrentBlock();
		if (block) {
			block.type = type;
			this.notifyChange();
		}
	}

	/**
	 * Move the current block up.
	 */
	moveBlockUp() {
		if (this.currentBlockIndex > 0) {
			const block = this.blocks[this.currentBlockIndex];
			this.blocks.splice(this.currentBlockIndex, 1);
			this.blocks.splice(this.currentBlockIndex - 1, 0, block);
			this.currentBlockIndex--;
			this.notifyChange();
		}
	}

	/**
	 * Move the current block down.
	 */
	moveBlockDown() {
		if (this.currentBlockIndex < this.blocks.length - 1) {
			const block = this.blocks[this.currentBlockIndex];
			this.blocks.splice(this.currentBlockIndex, 1);
			this.blocks.splice(this.currentBlockIndex + 1, 0, block);
			this.currentBlockIndex++;
			this.notifyChange();
		}
	}

	/**
	 * Increase indentation of the current block.
	 */
	indentBlock() {
		const block = this.getCurrentBlock();
		if (block && block.indent < 5) {
			block.indent++;
			this.notifyChange();
		}
	}

	/**
	 * Decrease indentation of the current block.
	 */
	outdentBlock() {
		const block = this.getCurrentBlock();
		if (block && block.indent > 0) {
			block.indent--;
			this.notifyChange();
		}
	}

	/**
	 * Convert the editor content to HTML.
	 */
	toHTML(): string {
		return blocksToHTML(this.blocks);
	}

	/**
	 * Register a change callback.
	 */
	onChange(callback: (blocks: Block[]) => void) {
		this.onChangeCallbacks.push(callback);
	}

	/**
	 * Notify all change callbacks.
	 */
	private notifyChange() {
		const blocks = this.blocks.slice(); // shallow copy
		this.onChangeCallbacks.forEach(callback => callback(blocks));
	}
}