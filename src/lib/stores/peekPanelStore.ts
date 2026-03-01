import { writable, derived } from 'svelte/store';

// Peek Panel content types from Module 4
export type PeekContentType = 'pdf' | 'task' | 'card' | 'document' | 'note' | 'metadata' | 'related' | 'actions';

export interface PeekPanelState {
	isOpen: boolean;
	contentType: PeekContentType;
	contentData: Record<string, any>;
	width: number; // in pixels
}

const initialState: PeekPanelState = {
	isOpen: false,
	contentType: 'note',
	contentData: {},
	width: 400 // Default width
};

function createPeekPanelStore() {
	const { subscribe, set, update } = writable<PeekPanelState>(initialState);

	return {
		subscribe,
		
		// Open the peek panel with content
		open: (type: PeekContentType, data?: Record<string, any>, width?: number) => {
			update(state => ({
				...state,
				isOpen: true,
				contentType: type,
				contentData: data || {},
				width: width || state.width
			}));
		},
		
		// Close the peek panel
		close: () => {
			update(state => ({
				...state,
				isOpen: false
			}));
		},
		
		// Toggle panel visibility
		toggle: () => {
			update(state => ({
				...state,
				isOpen: !state.isOpen
			}));
		},
		
		// Set panel width
		setWidth: (width: number) => {
			update(state => ({
				...state,
				width: Math.max(300, Math.min(600, width)) // Constrain between 300-600px
			}));
		},
		
		// Update content data
		updateContent: (data: Record<string, any>) => {
			update(state => ({
				...state,
				contentData: { ...state.contentData, ...data }
			}));
		},
		
		// Open PDF viewer
		openPdf: (pdfData: { filename: string; url?: string; pages?: number }) => {
			update(state => ({
				...state,
				isOpen: true,
				contentType: 'pdf',
				contentData: pdfData
			}));
		},
		
		// Open task details
		openTask: (taskData: { title: string; description?: string; status?: string; dueDate?: Date }) => {
			update(state => ({
				...state,
				isOpen: true,
				contentType: 'task',
				contentData: taskData
			}));
		},
		
		// Open card back
		openCard: (cardData: { title: string; content?: string; type?: string }) => {
			update(state => ({
				...state,
				isOpen: true,
				contentType: 'card',
				contentData: cardData
			}));
		},
		
		// Open document viewer
		openDocument: (docData: { title: string; content?: string; type?: string }) => {
			update(state => ({
				...state,
				isOpen: true,
				contentType: 'document',
				contentData: docData
			}));
		},
		
		// Open note viewer
		openNote: (noteData: { title: string; content?: string; tags?: string[] }) => {
			update(state => ({
				...state,
				isOpen: true,
				contentType: 'note',
				contentData: noteData
			}));
		},
		
		// Open metadata viewer
		openMetadata: (metadata: Record<string, any>) => {
			update(state => ({
				...state,
				isOpen: true,
				contentType: 'metadata',
				contentData: metadata
			}));
		},
		
		// Open related items viewer
		openRelated: (relatedItems: any[]) => {
			update(state => ({
				...state,
				isOpen: true,
				contentType: 'related',
				contentData: { items: relatedItems }
			}));
		},
		
		// Open actions panel
		openActions: (actions: any[]) => {
			update(state => ({
				...state,
				isOpen: true,
				contentType: 'actions',
				contentData: { actions }
			}));
		},
		
		// Reset to initial state
		reset: () => {
			set(initialState);
		}
	};
}

export const peekPanelStore = createPeekPanelStore();

// Derived stores
export const isPeekPanelOpen = derived(peekPanelStore, $store => $store.isOpen);
export const peekContentType = derived(peekPanelStore, $store => $store.contentType);
export const peekContentData = derived(peekPanelStore, $store => $store.contentData);
export const peekPanelWidth = derived(peekPanelStore, $store => $store.width);