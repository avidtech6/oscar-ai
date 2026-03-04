/**
 * Mobile Toolbar – adaptive toolbar for touch devices.
 */

import { FormattingToolbar, type FormattingAction } from './FormattingToolbar';
import type { EditorBlock } from './types/EditorContent';

export interface MobileToolbarOptions {
	compact: boolean;
	floating: boolean;
	position: 'top' | 'bottom';
}

/**
 * Mobile Toolbar – adapts formatting actions for touch screens.
 */
export class MobileToolbar extends FormattingToolbar {
	private options: MobileToolbarOptions;

	constructor(options: Partial<MobileToolbarOptions> = {}) {
		super();
		this.options = {
			compact: options.compact ?? true,
			floating: options.floating ?? true,
			position: options.position ?? 'bottom',
		};
	}

	/**
	 * Get actions suitable for mobile (limited set).
	 */
	getActionsForBlock(block: EditorBlock): FormattingAction[] {
		const allActions = super.getActionsForBlock(block);
		// Filter to essential actions for mobile
		return allActions.filter(action => 
			['bold', 'italic', 'underline', 'link', 'toggle-list'].includes(action.id)
		);
	}

	/**
	 * Get toolbar configuration.
	 */
	getToolbarConfig() {
		return {
			...this.options,
			actions: this.actions.length,
		};
	}
}