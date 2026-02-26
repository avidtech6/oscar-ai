import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export type MessageRole = 'user' | 'assistant';

export interface Message {
	role: MessageRole;
	content: string;
	timestamp: number;
}

export type EventType =
	| 'update_note'
	| 'summarise_voice_note'
	| 'add_items_to_project'
	| 'create_new_note'
	| 'rewrite_text'
	| 'organise_collection'
	| 'tag_items'
	| 'rename_items'
	| 'delete_items'
	| 'move_items'
	| 'extract_key_points'
	| 'generate_report'
	| 'classify_items'
	| 'merge_items'
	| 'split_items'
	| 'translate_text'
	| 'format_document'
	| 'extract_metadata'
	| 'generate_title'
	| 'other';

export interface SemanticEvent {
	id: string;
	type: EventType;
	target: string; // itemId or collectionId
	summary: string;
	timestamp: number;
	metadata?: Record<string, any>;
}

export type ContextType = 'item' | 'collection';
export type ZoomLevel = 'item' | 'collection';

export interface SemanticContextState {
	// Histories
	itemHistories: Record<string, Message[]>;
	collectionHistories: Record<string, Message[]>;
	// Semantic events (for zoomed-out view)
	semanticEvents: SemanticEvent[];
	// Active context
	activeContextId: string | null;
	activeContextType: ContextType | null;
	zoomLevel: ZoomLevel;
}

function createSemanticContextStore() {
	const defaultValue: SemanticContextState = {
		itemHistories: {},
		collectionHistories: {},
		semanticEvents: [],
		activeContextId: null,
		activeContextType: null,
		zoomLevel: 'collection'
	};

	const { subscribe, set, update } = writable<SemanticContextState>(defaultValue);

	// Load from localStorage in browser
	if (browser) {
		const stored = localStorage.getItem('semanticContext');
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				// Ensure all required fields exist
				set({
					...defaultValue,
					...parsed,
					itemHistories: parsed.itemHistories || {},
					collectionHistories: parsed.collectionHistories || {},
					semanticEvents: parsed.semanticEvents || [],
					activeContextId: parsed.activeContextId || null,
					activeContextType: parsed.activeContextType || null,
					zoomLevel: parsed.zoomLevel || 'collection'
				});
			} catch (e) {
				console.error('Failed to parse semanticContext from localStorage', e);
			}
		}
	}

	function saveToStorage(state: SemanticContextState) {
		if (browser) {
			localStorage.setItem('semanticContext', JSON.stringify(state));
		}
	}

	// Add a message to an item's history
	function addItemMessage(itemId: string, message: Message) {
		update(state => {
			const itemHistory = state.itemHistories[itemId] || [];
			const updated = {
				...state,
				itemHistories: {
					...state.itemHistories,
					[itemId]: [...itemHistory, message]
				}
			};
			saveToStorage(updated);
			return updated;
		});
	}

	// Add a message to a collection's history
	function addCollectionMessage(collectionId: string, message: Message) {
		update(state => {
			const collectionHistory = state.collectionHistories[collectionId] || [];
			const updated = {
				...state,
				collectionHistories: {
					...state.collectionHistories,
					[collectionId]: [...collectionHistory, message]
				}
			};
			saveToStorage(updated);
			return updated;
		});
	}

	// Add a semantic event
	function addSemanticEvent(event: Omit<SemanticEvent, 'id' | 'timestamp'>) {
		const id = Math.random().toString(36).substring(2, 9);
		const timestamp = Date.now();
		const newEvent: SemanticEvent = { ...event, id, timestamp };
		update(state => {
			const updated = {
				...state,
				semanticEvents: [newEvent, ...state.semanticEvents].slice(0, 100) // keep last 100
			};
			saveToStorage(updated);
			return updated;
		});
	}

	// Set active context
	function setActiveContext(contextId: string, contextType: ContextType, zoomLevel: ZoomLevel) {
		update(state => {
			const updated = {
				...state,
				activeContextId: contextId,
				activeContextType: contextType,
				zoomLevel
			};
			saveToStorage(updated);
			return updated;
		});
	}

	// Zoom into an item
	function zoomIntoItem(itemId: string) {
		setActiveContext(itemId, 'item', 'item');
	}

	// Zoom out to a collection
	function zoomOutToCollection(collectionId: string) {
		setActiveContext(collectionId, 'collection', 'collection');
	}

	// Get events for a specific target
	function getEventsForTarget(target: string): SemanticEvent[] {
		let events: SemanticEvent[] = [];
		update(state => {
			events = state.semanticEvents.filter(e => e.target === target);
			return state;
		});
		return events;
	}

	// Clear all data (for debugging)
	function clearAll() {
		set(defaultValue);
		saveToStorage(defaultValue);
	}

	return {
		subscribe,
		addItemMessage,
		addCollectionMessage,
		addSemanticEvent,
		setActiveContext,
		zoomIntoItem,
		zoomOutToCollection,
		getEventsForTarget,
		clearAll
	};
}

export const semanticContext = createSemanticContextStore();

// Derived store for active history
export const activeHistory = derived(
	semanticContext,
	$state => {
		if (!$state.activeContextId || !$state.activeContextType) return [];
		if ($state.activeContextType === 'item') {
			return $state.itemHistories[$state.activeContextId] || [];
		} else {
			return $state.collectionHistories[$state.activeContextId] || [];
		}
	}
);