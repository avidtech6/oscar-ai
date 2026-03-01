import { writable, derived } from 'svelte/store';

// Sheet types from Module 4
export type SheetType = 'conversation' | 'suggestions' | 'contextAction';

export interface SheetMessage {
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp?: number;
}

export interface SheetSuggestion {
	title: string;
	description: string;
	action?: () => void;
}

export interface SheetAction {
	label: string;
	description?: string;
	icon?: string;
	handler: () => void;
}

export interface SheetState {
	isOpen: boolean;
	type: SheetType;
	title: string;
	content: {
		messages?: SheetMessage[];
		suggestions?: SheetSuggestion[];
		actions?: SheetAction[];
		[key: string]: any;
	};
}

const initialState: SheetState = {
	isOpen: false,
	type: 'conversation',
	title: 'Conversation',
	content: {}
};

function createSheetStore() {
	const { subscribe, set, update } = writable<SheetState>(initialState);

	return {
		subscribe,
		
		// Open a sheet
		open: (type: SheetType, title: string, content?: SheetState['content']) => {
			update(state => ({
				...state,
				isOpen: true,
				type,
				title,
				content: content || {}
			}));
		},
		
		// Close the sheet
		close: () => {
			update(state => ({
				...state,
				isOpen: false
			}));
		},
		
		// Toggle sheet visibility
		toggle: () => {
			update(state => ({
				...state,
				isOpen: !state.isOpen
			}));
		},
		
		// Open conversation sheet
		openConversation: (messages: SheetMessage[], title: string = 'Conversation') => {
			update(state => ({
				...state,
				isOpen: true,
				type: 'conversation',
				title,
				content: { messages }
			}));
		},
		
		// Open suggestions sheet (triggered by "?" in Ask Oscar bar)
		openSuggestions: (suggestions: SheetSuggestion[], title: string = 'Suggestions') => {
			update(state => ({
				...state,
				isOpen: true,
				type: 'suggestions',
				title,
				content: { suggestions }
			}));
		},
		
		// Open context action sheet
		openContextActions: (actions: SheetAction[], title: string = 'Actions') => {
			update(state => ({
				...state,
				isOpen: true,
				type: 'contextAction',
				title,
				content: { actions }
			}));
		},
		
		// Add a message to conversation
		addMessage: (message: SheetMessage) => {
			update(state => {
				if (state.type !== 'conversation') return state;
				
				const messages = [...(state.content.messages || []), message];
				return {
					...state,
					content: { ...state.content, messages }
				};
			});
		},
		
		// Select a suggestion (triggers action and closes sheet)
		selectSuggestion: (suggestion: SheetSuggestion) => {
			if (suggestion.action) {
				suggestion.action();
			}
			update(state => ({
				...state,
				isOpen: false
			}));
		},
		
		// Reset to initial state
		reset: () => {
			set(initialState);
		}
	};
}

export const sheetStore = createSheetStore();

// Derived stores
export const isSheetOpen = derived(sheetStore, $store => $store.isOpen);
export const currentSheetType = derived(sheetStore, $store => $store.type);
export const sheetTitle = derived(sheetStore, $store => $store.title);