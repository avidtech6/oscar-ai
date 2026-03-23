import { writable } from 'svelte/store';

export interface PeekPanelState {
	isOpen: boolean;
	content?: 'card-back' | 'document-preview' | 'other';
}

function createPeekStore() {
	const { subscribe, set, update } = writable<PeekPanelState>({
		isOpen: false,
		content: undefined
	});

	function openPanel(content: 'card-back' | 'document-preview' | 'other' = 'card-back') {
		update(state => ({
			...state,
			isOpen: true,
			content
		}));
	}

	function closePanel() {
		update(state => ({
			...state,
			isOpen: false,
			content: undefined
		}));
	}

	function togglePanel() {
		update(state => ({
			...state,
			isOpen: !state.isOpen
		}));
	}

	return {
		subscribe,
		openPanel,
		closePanel,
		togglePanel
	};
}

export const peekStore = createPeekStore();