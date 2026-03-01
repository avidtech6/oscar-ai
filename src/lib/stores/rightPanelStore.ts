import { writable, derived } from 'svelte/store';

// Right Panel content types from Module 1
export type RightPanelContentType = 'pdf' | 'card' | 'document' | 'metadata' | 'task' | 'note' | 'default';

export interface RightPanelState {
	isOpen: boolean;
	contentType: RightPanelContentType;
	contentData: Record<string, any>;
	width: number; // in pixels
	title: string;
}

const initialState: RightPanelState = {
	isOpen: true, // Right panel is open by default (persistent)
	contentType: 'default',
	contentData: {},
	width: 400, // Default width
	title: 'Details'
};

function createRightPanelStore() {
	const { subscribe, set, update } = writable<RightPanelState>(initialState);

	return {
		subscribe,
		
		// Open the right panel with content
		open: (type: RightPanelContentType, data?: Record<string, any>, width?: number, title?: string) => {
			update(state => ({
				...state,
				isOpen: true,
				contentType: type,
				contentData: data || {},
				width: width || state.width,
				title: title || state.title
			}));
		},
		
		// Close the right panel
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
				width: Math.max(300, Math.min(800, width)) // Constrain between 300-800px
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
				contentData: pdfData,
				title: 'PDF Viewer'
			}));
		},
		
		// Open card back
		openCard: (cardData: { title: string; content?: string; type?: string }) => {
			update(state => ({
				...state,
				isOpen: true,
				contentType: 'card',
				contentData: cardData,
				title: 'Card Back'
			}));
		},
		
		// Open document viewer
		openDocument: (docData: { title: string; content?: string; type?: string }) => {
			update(state => ({
				...state,
				isOpen: true,
				contentType: 'document',
				contentData: docData,
				title: 'Document'
			}));
		},
		
		// Open metadata viewer
		openMetadata: (metadata: Record<string, any>) => {
			update(state => ({
				...state,
				isOpen: true,
				contentType: 'metadata',
				contentData: metadata,
				title: 'Metadata'
			}));
		},
		
		// Open task details
		openTask: (taskData: { title: string; description?: string; status?: string; dueDate?: Date }) => {
			update(state => ({
				...state,
				isOpen: true,
				contentType: 'task',
				contentData: taskData,
				title: 'Task Details'
			}));
		},
		
		// Open note viewer
		openNote: (noteData: { title: string; content?: string; tags?: string[] }) => {
			update(state => ({
				...state,
				isOpen: true,
				contentType: 'note',
				contentData: noteData,
				title: 'Note'
			}));
		},
		
		// Reset to default state
		resetToDefault: () => {
			update(state => ({
				...state,
				contentType: 'default',
				contentData: {},
				title: 'Details'
			}));
		},
		
		// Reset to initial state
		reset: () => {
			set(initialState);
		}
	};
}

export const rightPanelStore = createRightPanelStore();

// Derived stores
export const isRightPanelOpen = derived(rightPanelStore, $store => $store.isOpen);
export const rightPanelContentType = derived(rightPanelStore, $store => $store.contentType);
export const rightPanelContentData = derived(rightPanelStore, $store => $store.contentData);
export const rightPanelWidth = derived(rightPanelStore, $store => $store.width);
export const rightPanelTitle = derived(rightPanelStore, $store => $store.title);