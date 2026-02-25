/**
 * AppFlowy Store
 * State management for AppFlowy document collaboration
 */

import { writable, derived } from 'svelte/store';
import {
	isAppFlowyEnabled,
	fetchWorkspaces,
	fetchDocuments,
	fetchDocument,
	createDocument,
	updateDocument,
	deleteDocument,
	createWorkspace,
	updateWorkspace,
	deleteWorkspace
} from '../services/appflowyService';
import type { AppFlowyDocument, AppFlowyWorkspace } from '../types';

// Store state interface
interface AppFlowyState {
	workspaces: AppFlowyWorkspace[];
	documents: AppFlowyDocument[];
	currentWorkspace: AppFlowyWorkspace | null;
	currentDocument: AppFlowyDocument | null;
	loading: boolean;
	error: string | null;
}

// Initial state
const initialState: AppFlowyState = {
	workspaces: [],
	documents: [],
	currentWorkspace: null,
	currentDocument: null,
	loading: false,
	error: null
};

// Create store
const { subscribe, set, update } = writable<AppFlowyState>(initialState);

// Store actions
const appflowyStore = {
	subscribe,
	
	/**
	 * Load all workspaces
	 */
	async loadWorkspaces(): Promise<void> {
		update(state => ({ ...state, loading: true, error: null }));
		
		const result = await fetchWorkspaces();
		
		if (result.success && result.data) {
			update(state => ({
				...state,
				workspaces: result.data!,
				loading: false
			}));
		} else {
			update(state => ({
				...state,
				loading: false,
				error: result.error || 'Failed to load workspaces'
			}));
		}
	},
	
	/**
	 * Load documents for a workspace
	 */
	async loadDocuments(workspaceId: string): Promise<void> {
		update(state => ({ ...state, loading: true, error: null }));
		
		const result = await fetchDocuments(workspaceId);
		
		if (result.success && result.data) {
			update(state => ({
				...state,
				documents: result.data!,
				loading: false
			}));
		} else {
			update(state => ({
				...state,
				loading: false,
				error: result.error || 'Failed to load documents'
			}));
		}
	},
	
	/**
	 * Load a specific document
	 */
	async loadDocument(documentId: string): Promise<boolean> {
		update(state => ({ ...state, loading: true, error: null }));
		
		const result = await fetchDocument(documentId);
		
		if (result.success && result.data) {
			update(state => ({
				...state,
				currentDocument: result.data!,
				loading: false
			}));
			return true;
		} else {
			update(state => ({
				...state,
				loading: false,
				error: result.error || 'Failed to load document'
			}));
			return false;
		}
	},
	
	/**
	 * Set current workspace
	 */
	setCurrentWorkspace(workspace: AppFlowyWorkspace | null): void {
		update(state => ({
			...state,
			currentWorkspace: workspace
		}));
	},
	
	/**
	 * Set current document
	 */
	setCurrentDocument(document: AppFlowyDocument | null): void {
		update(state => ({
			...state,
			currentDocument: document
		}));
	},
	
	/**
	 * Create a new document
	 */
	async createDocument(document: Omit<AppFlowyDocument, 'id' | 'lastModified' | 'version'>): Promise<boolean> {
		update(state => ({ ...state, loading: true, error: null }));
		
		const result = await createDocument(document);
		
		if (result.success && result.data) {
			update(state => ({
				...state,
				documents: [...state.documents, result.data!],
				currentDocument: result.data!,
				loading: false
			}));
			return true;
		} else {
			update(state => ({
				...state,
				loading: false,
				error: result.error || 'Failed to create document'
			}));
			return false;
		}
	},
	
	/**
	 * Update a document
	 */
	async updateDocument(documentId: string, updates: Partial<AppFlowyDocument>): Promise<boolean> {
		update(state => ({ ...state, loading: true, error: null }));
		
		const result = await updateDocument(documentId, updates);
		
		if (result.success && result.data) {
			update(state => {
				const updatedDocuments = state.documents.map(doc =>
					doc.id === documentId ? result.data! : doc
				);
				
				const updatedCurrentDocument = state.currentDocument?.id === documentId
					? result.data!
					: state.currentDocument;
				
				return {
					...state,
					documents: updatedDocuments,
					currentDocument: updatedCurrentDocument,
					loading: false
				};
			});
			return true;
		} else {
			update(state => ({
				...state,
				loading: false,
				error: result.error || 'Failed to update document'
			}));
			return false;
		}
	},
	
	/**
	 * Delete a document
	 */
	async deleteDocument(documentId: string): Promise<boolean> {
		update(state => ({ ...state, loading: true, error: null }));
		
		const result = await deleteDocument(documentId);
		
		if (result.success) {
			update(state => {
				const updatedDocuments = state.documents.filter(doc => doc.id !== documentId);
				
				const updatedCurrentDocument = state.currentDocument?.id === documentId
					? null
					: state.currentDocument;
				
				return {
					...state,
					documents: updatedDocuments,
					currentDocument: updatedCurrentDocument,
					loading: false
				};
			});
			return true;
		} else {
			update(state => ({
				...state,
				loading: false,
				error: result.error || 'Failed to delete document'
			}));
			return false;
		}
	},
	
	/**
	 * Create a new workspace
	 */
	async createWorkspace(workspace: Omit<AppFlowyWorkspace, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
		update(state => ({ ...state, loading: true, error: null }));
		
		const result = await createWorkspace(workspace);
		
		if (result.success && result.data) {
			update(state => ({
				...state,
				workspaces: [...state.workspaces, result.data!],
				currentWorkspace: result.data!,
				loading: false
			}));
			return true;
		} else {
			update(state => ({
				...state,
				loading: false,
				error: result.error || 'Failed to create workspace'
			}));
			return false;
		}
	},
	
	/**
	 * Update a workspace
	 */
	async updateWorkspace(workspaceId: string, updates: Partial<AppFlowyWorkspace>): Promise<boolean> {
		update(state => ({ ...state, loading: true, error: null }));
		
		const result = await updateWorkspace(workspaceId, updates);
		
		if (result.success && result.data) {
			update(state => {
				const updatedWorkspaces = state.workspaces.map(ws =>
					ws.id === workspaceId ? result.data! : ws
				);
				
				const updatedCurrentWorkspace = state.currentWorkspace?.id === workspaceId
					? result.data!
					: state.currentWorkspace;
				
				return {
					...state,
					workspaces: updatedWorkspaces,
					currentWorkspace: updatedCurrentWorkspace,
					loading: false
				};
			});
			return true;
		} else {
			update(state => ({
				...state,
				loading: false,
				error: result.error || 'Failed to update workspace'
			}));
			return false;
		}
	},
	
	/**
	 * Delete a workspace
	 */
	async deleteWorkspace(workspaceId: string): Promise<boolean> {
		update(state => ({ ...state, loading: true, error: null }));
		
		const result = await deleteWorkspace(workspaceId);
		
		if (result.success) {
			update(state => {
				const updatedWorkspaces = state.workspaces.filter(ws => ws.id !== workspaceId);
				
				const updatedCurrentWorkspace = state.currentWorkspace?.id === workspaceId
					? null
					: state.currentWorkspace;
				
				return {
					...state,
					workspaces: updatedWorkspaces,
					currentWorkspace: updatedCurrentWorkspace,
					loading: false
				};
			});
			return true;
		} else {
			update(state => ({
				...state,
				loading: false,
				error: result.error || 'Failed to delete workspace'
			}));
			return false;
		}
	},
	
	/**
	 * Clear error
	 */
	clearError(): void {
		update(state => ({ ...state, error: null }));
	},
	
	/**
	 * Reset store to initial state
	 */
	reset(): void {
		set(initialState);
	}
};

// Derived stores
export const appflowyEnabled = derived(
	appflowyStore,
	$store => isAppFlowyEnabled()
);

export const workspaces = derived(
	appflowyStore,
	$store => $store.workspaces
);

export const documents = derived(
	appflowyStore,
	$store => $store.documents
);

export const currentWorkspace = derived(
	appflowyStore,
	$store => $store.currentWorkspace
);

export const currentDocument = derived(
	appflowyStore,
	$store => $store.currentDocument
);

export const loading = derived(
	appflowyStore,
	$store => $store.loading
);

export const error = derived(
	appflowyStore,
	$store => $store.error
);

export default appflowyStore;