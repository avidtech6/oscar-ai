/**
 * Desktop Toolbar – full‑featured toolbar for desktop.
 */

import { FormattingToolbar, type FormattingAction } from './FormattingToolbar';
import type { EditorBlock } from './types/EditorContent';

export interface DesktopToolbarOptions {
	showIcons: boolean;
	showLabels: boolean;
	grouped: boolean;
}

/**
 * Desktop Toolbar – provides all formatting actions with grouping.
 */
export class DesktopToolbar extends FormattingToolbar {
	private options: DesktopToolbarOptions;

	constructor(options: Partial<DesktopToolbarOptions> = {}) {
		super();
		this.options = {
			showIcons: options.showIcons ?? true,
			showLabels: options.showLabels ?? true,
			grouped: options.grouped ?? true,
		};
	}

	/**
	 * Get actions grouped by category.
	 */
	getGroupedActionsForBlock(block: EditorBlock): Record<string, FormattingAction[]> {
		const actions = super.getActionsForBlock(block);
		const groups: Record<string, FormattingAction[]> = {
			text: [],
			alignment: [],
			lists: [],
			headings: [],
			other: [],
		};

		for (const action of actions) {
			if (['bold', 'italic', 'underline', 'link'].includes(action.id)) {
				groups.text.push(action);
			} else if (action.id.includes('align')) {
				groups.alignment.push(action);
			} else if (action.id.includes('list') || action.id.includes('toggle')) {
				groups.lists.push(action);
			} else if (action.id.includes('heading')) {
				groups.headings.push(action);
			} else {
				groups.other.push(action);
			}
		}

		// Remove empty groups
		Object.keys(groups).forEach(key => {
			if (groups[key].length === 0) delete groups[key];
		});

		return groups;
	}

	/**
	 * Get toolbar configuration.
	 */
	getToolbarConfig() {
		return {
			...this.options,
			totalActions: this.actions.length,
		};
	}
}