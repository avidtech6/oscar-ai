import { writable } from 'svelte/store';

export type PromptTooltipType = 'hint' | 'suggestion' | 'context' | 'error';

export interface PromptTooltip {
	id: number;
	message: string;
	type: PromptTooltipType;
	position?: 'above' | 'below';
	duration?: number;
}

const promptTooltipStore = writable<PromptTooltip | null>(null);

export const promptTooltip = {
	subscribe: promptTooltipStore.subscribe,
	
	show(message: string, type: PromptTooltipType = 'hint', duration = 5000) {
		const id = Date.now();
		promptTooltipStore.set({ id, message, type, position: 'above', duration });
		
		if (duration > 0) {
			setTimeout(() => {
				this.hide();
			}, duration);
		}
		return id;
	},
	
	hide() {
		promptTooltipStore.set(null);
	},
	
	updateMessage(message: string) {
		promptTooltipStore.update(current => {
			if (!current) return null;
			return { ...current, message };
		});
	},
	
	updateType(type: PromptTooltipType) {
		promptTooltipStore.update(current => {
			if (!current) return null;
			return { ...current, type };
		});
	}
};

// Convenience functions
export function showPromptTooltip(message: string, type: PromptTooltipType = 'hint', duration?: number) {
	return promptTooltip.show(message, type, duration);
}

export function showHint(message: string, duration?: number) {
	return promptTooltip.show(message, 'hint', duration);
}

export function showSuggestion(message: string, duration?: number) {
	return promptTooltip.show(message, 'suggestion', duration);
}

export function showContext(message: string, duration?: number) {
	return promptTooltip.show(message, 'context', duration);
}

export function showError(message: string, duration?: number) {
	return promptTooltip.show(message, 'error', duration);
}

export function hidePromptTooltip() {
	promptTooltip.hide();
}