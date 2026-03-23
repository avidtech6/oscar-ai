import { writable } from 'svelte/store';

export interface PeekItem {
	id: string;
	content: string;
	type: 'phase' | 'document' | 'task' | 'user' | 'system' | 'other';
	metadata?: Record<string, any>;
	timestamp: number;
}

export interface PeekState {
	currentPeek: PeekItem | null;
	peekHistory: PeekItem[];
	isActive: boolean;
	maxHistory: number;
}

function createPeek(content: string, type: PeekItem['type'] = 'other', metadata?: Record<string, any>): PeekItem {
	return {
		id: `peek_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
		content,
		type,
		metadata,
		timestamp: Date.now()
	};
}

const initialState: PeekState = {
	currentPeek: null,
	peekHistory: [],
	isActive: false,
	maxHistory: 50
};

const peekStore = writable<PeekState>(initialState);

export function setCurrentPeek(content: string, type: PeekItem['type'] = 'other', metadata?: Record<string, any>) {
	const newPeek = createPeek(content, type, metadata);
	
	peekStore.update(state => ({
		...state,
		currentPeek: newPeek,
		peekHistory: [newPeek, ...state.peekHistory].slice(0, state.maxHistory),
		isActive: true
	}));
}

export function clearCurrentPeek() {
	peekStore.update(state => ({
		...state,
		currentPeek: null,
		isActive: false
	}));
}

export function togglePeek() {
	peekStore.update(state => ({
		...state,
		isActive: !state.isActive
	}));
}

export function removeFromHistory(id: string) {
	peekStore.update(state => ({
		...state,
		peekHistory: state.peekHistory.filter(item => item.id !== id)
	}));
}

export function clearHistory() {
	peekStore.update(state => ({
		...state,
		peekHistory: []
	}));
}

export function setMaxHistory(max: number) {
	peekStore.update(state => ({
		...state,
		maxHistory: Math.max(1, max)
	}));
}

export const peek = {
	subscribe: peekStore.subscribe,
	setCurrentPeek,
	clearCurrentPeek,
	togglePeek,
	removeFromHistory,
	clearHistory,
	setMaxHistory
};

export { peekStore };