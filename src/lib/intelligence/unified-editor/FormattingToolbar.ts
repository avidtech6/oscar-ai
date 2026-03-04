/**
 * Formatting Toolbar – UI‑agnostic toolbar for block formatting.
 */

import type { EditorBlock } from './types/EditorContent';

export interface FormattingAction {
	id: string;
	label: string;
	icon?: string;
	keyboardShortcut?: string;
	enabled: (block: EditorBlock) => boolean;
	execute: (block: EditorBlock) => Partial<EditorBlock>;
}

/**
 * Formatting Toolbar – provides formatting actions for blocks.
 */
export class FormattingToolbar {
	protected actions: FormattingAction[] = [];

	constructor() {
		this.registerDefaultActions();
	}

	/**
	 * Register a formatting action.
	 */
	registerAction(action: FormattingAction) {
		this.actions.push(action);
	}

	/**
	 * Get actions applicable to a block.
	 */
	getActionsForBlock(block: EditorBlock): FormattingAction[] {
		return this.actions.filter(action => action.enabled(block));
	}

	/**
	 * Execute an action on a block.
	 */
	executeAction(actionId: string, block: EditorBlock): EditorBlock {
		const action = this.actions.find(a => a.id === actionId);
		if (!action) return block;
		const updates = action.execute(block);
		// Merge updates into block (type‑safe because updates are partial and compatible)
		const merged = { ...block, ...updates } as EditorBlock;
		return merged;
	}

	/**
	 * Register default formatting actions.
	 */
	private registerDefaultActions() {
		this.actions = [
			{
				id: 'bold',
				label: 'Bold',
				keyboardShortcut: 'Ctrl+B',
				enabled: (block) => block.type === 'paragraph' || block.type === 'heading' || block.type === 'quote',
				execute: (block) => {
					if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'quote') {
						return { content: `<strong>${block.content}</strong>` };
					}
					return {};
				},
			},
			{
				id: 'italic',
				label: 'Italic',
				keyboardShortcut: 'Ctrl+I',
				enabled: (block) => block.type === 'paragraph' || block.type === 'heading' || block.type === 'quote',
				execute: (block) => {
					if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'quote') {
						return { content: `<em>${block.content}</em>` };
					}
					return {};
				},
			},
			{
				id: 'underline',
				label: 'Underline',
				keyboardShortcut: 'Ctrl+U',
				enabled: (block) => block.type === 'paragraph' || block.type === 'heading' || block.type === 'quote',
				execute: (block) => {
					if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'quote') {
						return { content: `<u>${block.content}</u>` };
					}
					return {};
				},
			},
			{
				id: 'link',
				label: 'Insert Link',
				keyboardShortcut: 'Ctrl+K',
				enabled: (block) => block.type === 'paragraph' || block.type === 'heading' || block.type === 'quote',
				execute: (block) => {
					if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'quote') {
						return { content: `<a href="#">${block.content}</a>` };
					}
					return {};
				},
			},
			{
				id: 'align-left',
				label: 'Align Left',
				enabled: (block) => block.type === 'paragraph' || block.type === 'heading' || block.type === 'quote',
				execute: () => ({ style: 'normal' }),
			},
			{
				id: 'align-center',
				label: 'Align Center',
				enabled: (block) => block.type === 'paragraph' || block.type === 'heading' || block.type === 'quote',
				execute: () => ({ style: 'lead' }),
			},
			{
				id: 'align-right',
				label: 'Align Right',
				enabled: (block) => block.type === 'paragraph' || block.type === 'heading' || block.type === 'quote',
				execute: () => ({ style: 'small' }),
			},
			{
				id: 'increase-heading',
				label: 'Increase Heading Level',
				enabled: (block) => block.type === 'heading' && block.level > 1,
				execute: (block) => {
					if (block.type === 'heading') {
						return { level: Math.max(1, block.level - 1) as any };
					}
					return {};
				},
			},
			{
				id: 'decrease-heading',
				label: 'Decrease Heading Level',
				enabled: (block) => block.type === 'heading' && block.level < 6,
				execute: (block) => {
					if (block.type === 'heading') {
						return { level: Math.min(6, block.level + 1) as any };
					}
					return {};
				},
			},
			{
				id: 'toggle-list',
				label: 'Toggle List',
				enabled: (block) => block.type === 'list',
				execute: (block) => {
					if (block.type === 'list') {
						return { ordered: !block.ordered };
					}
					return {};
				},
			},
		];
	}
}