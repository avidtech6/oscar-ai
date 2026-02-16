import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { db } from '$lib/db';
import { settings } from './settings';

export type ChatMode = 'general' | 'global' | 'project';

export interface ChatContext {
	mode: ChatMode;
	selectedProjectId: string;
	lastAIMessage: string;
	lastReferencedItem: any;
	lastCreatedItem: any;
	requiresConfirmation: boolean;
	pendingAction: {
		type: string;
		data: any;
		projectId?: string;
	} | null;
}

const CHAT_CONTEXT_STORAGE = 'oscar_chat_context';

// Create the store with default values
const createChatContextStore = () => {
	const { subscribe, set, update } = writable<ChatContext>({
		mode: 'general',
		selectedProjectId: '',
		lastAIMessage: '',
		lastReferencedItem: null,
		lastCreatedItem: null,
		requiresConfirmation: false,
		pendingAction: null
	});

	// Initialize from localStorage
	const init = () => {
		if (!browser) return;

		const stored = localStorage.getItem(CHAT_CONTEXT_STORAGE);
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				set({
					...parsed,
					requiresConfirmation: false,
					pendingAction: null
				});
			} catch (e) {
				console.error('Failed to parse stored chat context:', e);
			}
		}

		// Subscribe to changes and persist to localStorage
		subscribe(value => {
			// Don't store temporary state
			const toStore = {
				mode: value.mode,
				selectedProjectId: value.selectedProjectId,
				lastAIMessage: value.lastAIMessage,
				lastReferencedItem: value.lastReferencedItem,
				lastCreatedItem: value.lastCreatedItem
			};
			localStorage.setItem(CHAT_CONTEXT_STORAGE, JSON.stringify(toStore));
		});
	};

	// Helper methods
	const setMode = (mode: ChatMode, projectId?: string) => {
		update(ctx => ({
			...ctx,
			mode,
			selectedProjectId: projectId || (mode === 'project' ? ctx.selectedProjectId : ''),
			requiresConfirmation: false
		}));
	};

	const setProject = (projectId: string) => {
		update(ctx => ({
			...ctx,
			mode: 'project',
			selectedProjectId: projectId,
			requiresConfirmation: false
		}));
	};

	const setGeneralChat = () => {
		update(ctx => ({
			...ctx,
			mode: 'general',
			selectedProjectId: '',
			requiresConfirmation: false
		}));
	};

	const setGlobalWorkspace = () => {
		update(ctx => ({
			...ctx,
			mode: 'global',
			selectedProjectId: '',
			requiresConfirmation: false
		}));
	};

	const setLastAIMessage = (message: string) => {
		update(ctx => ({
			...ctx,
			lastAIMessage: message
		}));
	};

	const setLastReferencedItem = (item: any) => {
		update(ctx => ({
			...ctx,
			lastReferencedItem: item
		}));
	};

	const setLastCreatedItem = (item: any) => {
		update(ctx => ({
			...ctx,
			lastCreatedItem: item
		}));
	};

	const setPendingAction = (action: ChatContext['pendingAction']) => {
		update(ctx => ({
			...ctx,
			pendingAction: action,
			requiresConfirmation: !!action
		}));
	};

	const clearPendingAction = () => {
		update(ctx => ({
			...ctx,
			pendingAction: null,
			requiresConfirmation: false
		}));
	};

	const confirmPendingAction = () => {
		update(ctx => ({
			...ctx,
			pendingAction: null,
			requiresConfirmation: false
		}));
	};

	return {
		subscribe,
		set,
		update,
		init,
		setMode,
		setProject,
		setGeneralChat,
		setGlobalWorkspace,
		setLastAIMessage,
		setLastReferencedItem,
		setLastCreatedItem,
		setPendingAction,
		clearPendingAction,
		confirmPendingAction
	};
};

export const chatContext = createChatContextStore();

// Derived store for current project info
export const currentProject = derived(
	[chatContext, settings],
	([$chatContext, $settings]) => {
		if ($chatContext.mode === 'project' && $chatContext.selectedProjectId) {
			return $chatContext.selectedProjectId;
		}
		// Fall back to settings current project for backward compatibility
		return $settings.currentProjectId || '';
	}
);

// Get top projects (most active/recent)
export async function getTopProjects(limit: number = 3) {
	if (!browser) return [];
	
	try {
		const projects = await db.projects
			.orderBy('updatedAt')
			.reverse()
			.limit(limit)
			.toArray();
		return projects;
	} catch (error) {
		console.error('Error fetching top projects:', error);
		return [];
	}
}

// Check if we should auto-execute actions based on mode
export function shouldAutoExecute(mode: ChatMode): boolean {
	return mode === 'project' || mode === 'global';
}

// Check if we need confirmation for action
export function needsConfirmation(mode: ChatMode, actionType: string): boolean {
	if (mode === 'general') {
		// General chat requires confirmation for all DB writes
		const writeActions = ['createTask', 'createNote', 'createProject', 'createBlogPost', 'createReport', 'createDiagram', 'createTree', 'updateObject'];
		return writeActions.includes(actionType);
	}
	return false;
}

// Initialize on module load
if (browser) {
	chatContext.init();
}