/**
 * Memory UI Hooks
 * 
 * Svelte stores and hooks for accessing memory data in the UI.
 * Provides reactive access to memory state, client profiles, style profiles, etc.
 */

import { writable, derived, get } from 'svelte/store';
import type { MemoryItem, ClientProfile, StyleProfile, ThreadSummary, DocumentSummary } from './memoryTypes';
import { MemoryEngine } from './memoryEngine';
import { MemorySelectors } from './memorySelectors';
import { StyleEngine } from './styleEngine';
import { ClientEngine } from './clientEngine';
import { ThreadEngine } from './threadEngine';
import { DocumentEngine } from './documentEngine';

// Create singleton instances
const memoryEngine = new MemoryEngine();
const memorySelectors = new MemorySelectors({ memoryEngine });
const styleEngine = new StyleEngine({ memoryEngine });
const clientEngine = new ClientEngine({ memoryEngine });
const threadEngine = new ThreadEngine({ memoryEngine });
const documentEngine = new DocumentEngine({ memoryEngine });

/**
 * Memory UI State
 */
interface MemoryUIState {
	/** Recent memories */
	recentMemories: MemoryItem[];
	
	/** Loading state */
	loading: boolean;
	
	/** Error state */
	error: string | null;
	
	/** Last updated timestamp */
	lastUpdated: Date | null;
	
	/** Memory statistics */
	stats: {
		totalMemories: number;
		byCategory: Record<string, number>;
		bySource: Record<string, number>;
	};
}

/**
 * Create memory UI store
 */
function createMemoryUIStore() {
	const { subscribe, set, update } = writable<MemoryUIState>({
		recentMemories: [],
		loading: false,
		error: null,
		lastUpdated: null,
		stats: {
			totalMemories: 0,
			byCategory: {},
			bySource: {}
		}
	});
	
	/**
	 * Load recent memories
	 */
	async function loadRecentMemories(limit: number = 20): Promise<void> {
		update(state => ({ ...state, loading: true, error: null }));
		
		try {
			const memories = await memorySelectors.getRecentMemories(limit);
			
			// Calculate statistics
			const byCategory: Record<string, number> = {};
			const bySource: Record<string, number> = {};
			
			for (const memory of memories) {
				byCategory[memory.category] = (byCategory[memory.category] || 0) + 1;
				bySource[memory.source] = (bySource[memory.source] || 0) + 1;
			}
			
			update(state => ({
				...state,
				recentMemories: memories,
				loading: false,
				lastUpdated: new Date(),
				stats: {
					totalMemories: memories.length,
					byCategory,
					bySource
				}
			}));
		} catch (error) {
			update(state => ({
				...state,
				loading: false,
				error: error instanceof Error ? error.message : 'Failed to load memories'
			}));
		}
	}
	
	/**
	 * Search memories
	 */
	async function searchMemories(query: string, limit: number = 20): Promise<MemoryItem[]> {
		update(state => ({ ...state, loading: true, error: null }));
		
		try {
			const results = await memorySelectors.searchMemory(query, limit);
			update(state => ({ ...state, loading: false, lastUpdated: new Date() }));
			return results;
		} catch (error) {
			update(state => ({
				...state,
				loading: false,
				error: error instanceof Error ? error.message : 'Search failed'
			}));
			return [];
		}
	}
	
	/**
	 * Clear error
	 */
	function clearError(): void {
		update(state => ({ ...state, error: null }));
	}
	
	/**
	 * Refresh memories
	 */
	async function refresh(): Promise<void> {
		const state = get({ subscribe });
		await loadRecentMemories(state.recentMemories.length || 20);
	}
	
	return {
		subscribe,
		loadRecentMemories,
		searchMemories,
		clearError,
		refresh
	};
}

/**
 * Client Profile Store
 */
function createClientProfileStore() {
	const { subscribe, set, update } = writable<{
		profiles: Map<string, ClientProfile>;
		loading: boolean;
		error: string | null;
	}>({
		profiles: new Map(),
		loading: false,
		error: null
	});
	
	/**
	 * Get client profile
	 */
	async function getClientProfile(clientId: string): Promise<ClientProfile | null> {
		update(state => ({ ...state, loading: true, error: null }));
		
		try {
			const profile = await clientEngine.getClientProfile(clientId);
			
			if (profile) {
				update(state => {
					const newProfiles = new Map(state.profiles);
					newProfiles.set(clientId, profile);
					return { ...state, profiles: newProfiles, loading: false };
				});
			} else {
				update(state => ({ ...state, loading: false }));
			}
			
			return profile;
		} catch (error) {
			update(state => ({
				...state,
				loading: false,
				error: error instanceof Error ? error.message : 'Failed to load client profile'
			}));
			return null;
		}
	}
	
	/**
	 * Update client profile with interaction
	 */
	async function updateClientProfile(
		clientId: string,
		interaction: {
			type: 'email' | 'document' | 'workflow' | 'meeting';
			content: any;
			summary: string;
			sentiment?: 'positive' | 'neutral' | 'negative';
		}
	): Promise<ClientProfile | null> {
		update(state => ({ ...state, loading: true, error: null }));
		
		try {
			const profile = await clientEngine.updateClientProfile(clientId, interaction);
			
			if (profile) {
				update(state => {
					const newProfiles = new Map(state.profiles);
					newProfiles.set(clientId, profile);
					return { ...state, profiles: newProfiles, loading: false };
				});
			} else {
				update(state => ({ ...state, loading: false }));
			}
			
			return profile;
		} catch (error) {
			update(state => ({
				...state,
				loading: false,
				error: error instanceof Error ? error.message : 'Failed to update client profile'
			}));
			return null;
		}
	}
	
	/**
	 * Get communication suggestions for client
	 */
	async function getCommunicationSuggestions(
		clientId: string,
		context: 'email' | 'document' | 'meeting' | 'general'
	): Promise<string[]> {
		try {
			return await clientEngine.suggestCommunicationApproach(clientId, context);
		} catch (error) {
			console.error('Failed to get communication suggestions:', error);
			return [];
		}
	}
	
	/**
	 * Clear client profile cache
	 */
	function clearCache(): void {
		update(state => ({ ...state, profiles: new Map() }));
	}
	
	return {
		subscribe,
		getClientProfile,
		updateClientProfile,
		getCommunicationSuggestions,
		clearCache
	};
}

/**
 * Style Profile Store
 */
function createStyleProfileStore() {
	const { subscribe, set, update } = writable<{
		profile: StyleProfile | null;
		loading: boolean;
		error: string | null;
	}>({
		profile: null,
		loading: false,
		error: null
	});
	
	/**
	 * Load style profile
	 */
	async function loadStyleProfile(userId: string = 'default'): Promise<void> {
		update(state => ({ ...state, loading: true, error: null }));
		
		try {
			const profile = await styleEngine.getStyleProfile(userId);
			update(state => ({ ...state, profile, loading: false }));
		} catch (error) {
			update(state => ({
				...state,
				loading: false,
				error: error instanceof Error ? error.message : 'Failed to load style profile'
			}));
		}
	}
	
	/**
	 * Analyze email content for style learning
	 */
	async function analyzeEmailContent(
		emailContent: string,
		context: string = 'general'
	): Promise<void> {
		try {
			// Use analyzeText to get style analysis
			const analysis = styleEngine.analyzeText(emailContent, context);
			// Update style profile with the analysis
			await styleEngine.updateStyleProfile('default', emailContent, context);
			// Reload profile after analysis
			await loadStyleProfile();
		} catch (error) {
			console.error('Failed to analyze email content:', error);
		}
	}
	
	/**
	 * Apply style to draft
	 */
	async function applyStyleToDraft(
		draft: string,
		context: 'client-communication' | 'internal' | 'reports' | 'proposals' = 'client-communication'
	): Promise<string> {
		try {
			// Get style profile first
			const profile = await styleEngine.getStyleProfile('default');
			if (!profile) {
				return draft;
			}
			return styleEngine.applyStyleToDraft(draft, profile);
		} catch (error) {
			console.error('Failed to apply style to draft:', error);
			return draft;
		}
	}
	
	/**
	 * Get style suggestions
	 */
	async function getStyleSuggestions(draft: string): Promise<string[]> {
		try {
			return styleEngine.suggestStyleImprovements(draft);
		} catch (error) {
			console.error('Failed to get style suggestions:', error);
			return [];
		}
	}
	
	return {
		subscribe,
		loadStyleProfile,
		analyzeEmailContent,
		applyStyleToDraft,
		getStyleSuggestions
	};
}

/**
 * Thread Memory Store
 */
function createThreadMemoryStore() {
	const { subscribe, set, update } = writable<{
		threads: Map<string, ThreadSummary>;
		loading: boolean;
		error: string | null;
	}>({
		threads: new Map(),
		loading: false,
		error: null
	});
	
	/**
	 * Get thread summary
	 */
	async function getThreadSummary(threadId: string): Promise<ThreadSummary | null> {
		update(state => ({ ...state, loading: true, error: null }));
		
		try {
			const summary = await threadEngine.getThreadSummary(threadId);
			
			if (summary) {
				update(state => {
					const newThreads = new Map(state.threads);
					newThreads.set(threadId, summary);
					return { ...state, threads: newThreads, loading: false };
				});
			} else {
				update(state => ({ ...state, loading: false }));
			}
			
			return summary;
		} catch (error) {
			update(state => ({
				...state,
				loading: false,
				error: error instanceof Error ? error.message : 'Failed to load thread summary'
			}));
			return null;
		}
	}
	
	/**
	 * Record thread activity
	 */
	async function recordThreadActivity(
		threadId: string,
		activity: {
			activity: string;
			summary: string;
			timestamp: Date;
		}
	): Promise<void> {
		try {
			// Use updateThread to record activity
			await threadEngine.updateThread(threadId, {
				type: 'note',
				content: { activity: activity.activity },
				summary: activity.summary,
				sender: 'system'
			});
			// Refresh thread summary
			await getThreadSummary(threadId);
		} catch (error) {
			console.error('Failed to record thread activity:', error);
		}
	}
	
	/**
	 * Get thread suggestions
	 */
	async function getThreadSuggestions(threadId: string): Promise<string[]> {
		try {
			return await threadEngine.suggestThreadContinuation(threadId, 'general');
		} catch (error) {
			console.error('Failed to get thread suggestions:', error);
			return [];
		}
	}
	
	return {
		subscribe,
		getThreadSummary,
		recordThreadActivity,
		getThreadSuggestions
	};
}

/**
 * Document Memory Store
 */
function createDocumentMemoryStore() {
	const { subscribe, set, update } = writable<{
		documents: Map<string, DocumentSummary>;
		loading: boolean;
		error: string | null;
	}>({
		documents: new Map(),
		loading: false,
		error: null
	});
	
	/**
	 * Get document summary
	 */
	async function getDocumentSummary(documentId: string): Promise<DocumentSummary | null> {
		update(state => ({ ...state, loading: true, error: null }));
		
		try {
			const summary = await documentEngine.getDocumentSummary(documentId);
			
			if (summary) {
				update(state => {
					const newDocuments = new Map(state.documents);
					newDocuments.set(documentId, summary);
					return { ...state, documents: newDocuments, loading: false };
				});
			} else {
				update(state => ({ ...state, loading: false }));
			}
			
			return summary;
		} catch (error) {
			update(state => ({
				...state,
				loading: false,
				error: error instanceof Error ? error.message : 'Failed to load document summary'
			}));
			return null;
		}
	}
	
	/**
	 * Analyze document content
	 */
	async function analyzeDocumentContent(
		documentId: string,
		content: string,
		title: string,
		type: 'report' | 'survey' | 'proposal' | 'contract' | 'pdf' | 'note' | 'other'
	): Promise<void> {
		try {
			// Use updateDocument to analyze content
			await documentEngine.updateDocument(documentId, {
				type,
				title,
				content: { body: content },
				summary: `Document analysis: ${title}`
			});
			// Refresh document summary
			await getDocumentSummary(documentId);
		} catch (error) {
			console.error('Failed to analyze document:', error);
		}
	}
	
	/**
	 * Get document recommendations
	 */
	async function getDocumentRecommendations(documentId: string): Promise<string[]> {
		try {
			return await documentEngine.suggestDocumentImprovements(documentId, 'all');
		} catch (error) {
			console.error('Failed to get document recommendations:', error);
			return [];
		}
	}
	
	return {
		subscribe,
		getDocumentSummary,
		analyzeDocumentContent,
		getDocumentRecommendations
	};
}

/**
 * Memory Statistics Store
 */
function createMemoryStatsStore() {
	const { subscribe, set, update } = writable<{
		totalMemories: number;
		byCategory: Record<string, number>;
		bySource: Record<string, number>;
		loading: boolean;
		error: string | null;
	}>({
		totalMemories: 0,
		byCategory: {},
		bySource: {},
		loading: false,
		error: null
	});
	
	/**
	 * Load memory statistics
	 */
	async function loadStats(): Promise<void> {
		update(state => ({ ...state, loading: true, error: null }));
		
		try {
			// Get recent memories to calculate stats
			const memories = await memorySelectors.getRecentMemories(100);
			
			const byCategory: Record<string, number> = {};
			const bySource: Record<string, number> = {};
			
			for (const memory of memories) {
				byCategory[memory.category] = (byCategory[memory.category] || 0) + 1;
				bySource[memory.source] = (bySource[memory.source] || 0) + 1;
			}
			
			update(state => ({
				...state,
				totalMemories: memories.length,
				byCategory,
				bySource,
				loading: false
			}));
		} catch (error) {
			update(state => ({
				...state,
				loading: false,
				error: error instanceof Error ? error.message : 'Failed to load memory statistics'
			}));
		}
	}
	
	return {
		subscribe,
		loadStats
	};
}

// Export stores
export const memoryUI = createMemoryUIStore();
export const clientProfileStore = createClientProfileStore();
export const styleProfileStore = createStyleProfileStore();
export const threadMemoryStore = createThreadMemoryStore();
export const documentMemoryStore = createDocumentMemoryStore();
export const memoryStatsStore = createMemoryStatsStore();

// Export derived stores
export const recentMemories = derived(memoryUI, $memoryUI => $memoryUI.recentMemories);
export const memoryLoading = derived(memoryUI, $memoryUI => $memoryUI.loading);
export const memoryError = derived(memoryUI, $memoryUI => $memoryUI.error);

export const clientProfiles = derived(clientProfileStore, $store => $store.profiles);
export const styleProfile = derived(styleProfileStore, $store => $store.profile);

export const threadSummaries = derived(threadMemoryStore, $store => $store.threads);
export const documentSummaries = derived(documentMemoryStore, $store => $store.documents);

// Export helper functions
export async function initializeMemoryUI(): Promise<void> {
	// Load initial data
	await Promise.all([
		memoryUI.loadRecentMemories(20),
		memoryStatsStore.loadStats(),
		styleProfileStore.loadStyleProfile()
	]);
}

export function clearMemoryCache(): void {
	memoryUI.refresh();
	clientProfileStore.clearCache();
	memoryStatsStore.loadStats();
}

// Export types
export type { MemoryUIState };