/**
 * Agent UI Hooks
 * 
 * UI hooks for the background intelligence layer.
 * Provides React/Svelte hooks for agent monitoring, control, and integration.
 */

import { writable, derived, get } from 'svelte/store';
import type { Readable, Writable } from 'svelte/store';
import type {
	Agent,
	AgentConfig,
	AgentState,
	AgentStatus,
	AgentResult,
	AgentEvent,
	AgentRegistryEntry,
	AgentType
} from './agentTypes';

import { AgentEngine } from './agentEngine';
import { AgentScheduler } from './agentScheduler';
import { AgentStateManager } from './agentState';
import { getAgentRegistry } from './agentRegistry';

/**
 * Agent UI Store
 * 
 * Central store for agent UI state and controls.
 */
export interface AgentUIStore {
	/** Agent engine instance */
	agentEngine: AgentEngine | null;
	
	/** Agent scheduler instance */
	agentScheduler: AgentScheduler | null;
	
	/** Agent state manager instance */
	agentStateManager: AgentStateManager | null;
	
	/** Agent registry */
	agentRegistry: ReturnType<typeof getAgentRegistry> | null;
	
	/** All registered agents */
	agents: AgentRegistryEntry[];
	
	/** Active agents (running or starting) */
	activeAgents: Agent[];
	
	/** Agent states by ID */
	agentStates: Map<string, AgentState>;
	
	/** Agent suggestions by ID */
	agentSuggestions: Map<string, any[]>;
	
	/** Agent events */
	agentEvents: AgentEvent[];
	
	/** Agent statistics */
	agentStats: {
		totalAgents: number;
		activeAgents: number;
		pausedAgents: number;
		errorAgents: number;
		totalExecutions: number;
		successfulExecutions: number;
		failedExecutions: number;
		lastUpdated: Date;
	};
	
	/** UI loading state */
	isLoading: boolean;
	
	/** UI error state */
	error: string | null;
}

/**
 * Create agent UI store
 */
export function createAgentUIStore(): {
	store: Writable<AgentUIStore>;
	initialize: () => Promise<void>;
	startAgent: (agentId: string) => Promise<boolean>;
	stopAgent: (agentId: string) => Promise<boolean>;
	pauseAgent: (agentId: string, reason?: string) => Promise<boolean>;
	resumeAgent: (agentId: string) => Promise<boolean>;
	executeAgent: (agentId: string) => Promise<AgentResult | null>;
	getAgentSuggestions: (agentId: string) => any[];
	getAllAgentSuggestions: () => Array<{ agentId: string; suggestions: any[] }>;
	clearAgentEvents: () => void;
	cleanup: () => Promise<void>;
} {
	// Create writable store
	const store = writable<AgentUIStore>({
		agentEngine: null,
		agentScheduler: null,
		agentStateManager: null,
		agentRegistry: null,
		agents: [],
		activeAgents: [],
		agentStates: new Map(),
		agentSuggestions: new Map(),
		agentEvents: [],
		agentStats: {
			totalAgents: 0,
			activeAgents: 0,
			pausedAgents: 0,
			errorAgents: 0,
			totalExecutions: 0,
			successfulExecutions: 0,
			failedExecutions: 0,
			lastUpdated: new Date()
		},
		isLoading: false,
		error: null
	});
	
	// Event listener for agent events
	let eventListener: ((event: AgentEvent) => void) | null = null;
	
	/**
	 * Initialize the agent UI store
	 */
	async function initialize(): Promise<void> {
		try {
			store.update(state => ({ ...state, isLoading: true, error: null }));
			
			// Initialize agent registry
			const agentRegistry = getAgentRegistry();
			
			// Initialize agent state manager
			const agentStateManager = new AgentStateManager({
				persistToStorage: true,
				storageKeyPrefix: 'copilot-agents-ui',
				maxStateHistoryEntries: 50,
				persistenceIntervalMs: 15000,
				compressStateData: true
			});
			
			// Initialize agent scheduler
			const agentScheduler = new AgentScheduler({
				maxScheduledAgents: 15,
				schedulerTickIntervalMs: 1000,
				useRequestAnimationFrame: false,
				useWebWorkers: false,
				maxRetryAttempts: 3,
				retryDelayMs: 3000
			});
			
			// Initialize agent engine
			const agentEngine = new AgentEngine({
				autoStartEnabledAgents: false, // Don't auto-start in UI mode
				persistAgentState: true,
				restoreAgentState: true,
				maxConcurrentAgents: 3,
				statePersistenceIntervalMs: 20000,
				emitAgentEvents: true,
				logAgentActivity: true,
				defaultAgentPriority: 50,
				defaultMaxExecutionTimeMs: 15000
			});
			
			// Initialize components
			await agentStateManager.initialize();
			await agentEngine.initialize();
			
			// Register all agents from registry
			const agents: Agent[] = [];
			const allRegistryEntries = agentRegistry.getAllRegisteredAgents();
			
			for (const registryEntry of allRegistryEntries) {
				try {
					const agent = await agentEngine.registerAgent(
						registryEntry.config,
						registryEntry.factory
					);
					agents.push(agent);
				} catch (error) {
					console.error(`Failed to register agent ${registryEntry.config.id}:`, error);
				}
			}
			
			// Set up event listener
			eventListener = (event: AgentEvent) => {
				store.update(state => {
					// Add event to events list (limit to 100 events)
					const newEvents = [event, ...state.agentEvents].slice(0, 100);
					
					// Update agent states if event contains state info
					if (event.type === 'agent_result' || event.type === 'agent_error') {
						const agentId = event.agentId;
						const agent = agentEngine.getAgent(agentId);
						if (agent) {
							const newAgentStates = new Map(state.agentStates);
							newAgentStates.set(agentId, agent.state);
							
							// Update suggestions if result has suggestions
							if (event.type === 'agent_result' && event.data?.result?.suggestions) {
								const newAgentSuggestions = new Map(state.agentSuggestions);
								newAgentSuggestions.set(agentId, event.data.result.suggestions);
								return {
									...state,
									agentEvents: newEvents,
									agentStates: newAgentStates,
									agentSuggestions: newAgentSuggestions
								};
							}
							
							return {
								...state,
								agentEvents: newEvents,
								agentStates: newAgentStates
							};
						}
					}
					
					return { ...state, agentEvents: newEvents };
				});
			};
			
			agentEngine.addEventListener(eventListener);
			
			// Set up periodic state updates
			const updateInterval = setInterval(() => {
				updateAgentState();
			}, 3000); // Update every 3 seconds
			
			// Store interval ID for cleanup
			let intervalId = updateInterval;
			
			// Initial state update
			updateAgentState();
			
			// Update store with initialized components
			store.update(state => ({
				...state,
				agentEngine,
				agentScheduler,
				agentStateManager,
				agentRegistry,
				agents: allRegistryEntries,
				isLoading: false,
				error: null
			}));
			
			console.log('Agent UI store initialized');
		} catch (error) {
			console.error('Failed to initialize agent UI store:', error);
			store.update(state => ({
				...state,
				isLoading: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			}));
		}
	}
	
	/**
	 * Update agent state in store
	 */
	function updateAgentState(): void {
		const currentState = get(store);
		const agentEngine = currentState.agentEngine;
		
		if (!agentEngine) return;
		
		try {
			// Get active agents
			const activeAgents = agentEngine.getActiveAgents();
			
			// Update agent states
			const agentStates = new Map<string, AgentState>();
			const allAgents = agentEngine.getAllAgents();
			
			let pausedAgents = 0;
			let errorAgents = 0;
			let totalExecutions = 0;
			let successfulExecutions = 0;
			let failedExecutions = 0;
			
			for (const agent of allAgents) {
				const agentId = agent.config.id;
				agentStates.set(agentId, agent.state);
				
				const status = agent.getStatus();
				if (status === 'paused') pausedAgents++;
				if (status === 'error') errorAgents++;
				
				totalExecutions += agent.state.executionCount;
				successfulExecutions += agent.state.successCount;
				failedExecutions += agent.state.errorCount;
			}
			
			// Update agent suggestions
			const agentSuggestions = new Map<string, any[]>();
			const allSuggestions = agentEngine.getAllAgentSuggestions();
			
			for (const { agentId, suggestions } of allSuggestions) {
				agentSuggestions.set(agentId, suggestions);
			}
			
			// Update store
			store.update(state => ({
				...state,
				activeAgents,
				agentStates,
				agentSuggestions,
				agentStats: {
					totalAgents: state.agents.length,
					activeAgents: activeAgents.length,
					pausedAgents,
					errorAgents,
					totalExecutions,
					successfulExecutions,
					failedExecutions,
					lastUpdated: new Date()
				}
			}));
		} catch (error) {
			console.error('Failed to update agent state:', error);
		}
	}
	
	/**
	 * Start an agent
	 */
	async function startAgent(agentId: string): Promise<boolean> {
		const currentState = get(store);
		const agentEngine = currentState.agentEngine;
		
		if (!agentEngine) {
			console.error('Agent engine not initialized');
			return false;
		}
		
		try {
			const success = await agentEngine.startAgent(agentId);
			
			if (success) {
				// Update state immediately
				updateAgentState();
			}
			
			return success;
		} catch (error) {
			console.error(`Failed to start agent ${agentId}:`, error);
			return false;
		}
	}
	
	/**
	 * Stop an agent
	 */
	async function stopAgent(agentId: string): Promise<boolean> {
		const currentState = get(store);
		const agentEngine = currentState.agentEngine;
		
		if (!agentEngine) {
			console.error('Agent engine not initialized');
			return false;
		}
		
		try {
			const success = await agentEngine.stopAgent(agentId);
			
			if (success) {
				// Update state immediately
				updateAgentState();
			}
			
			return success;
		} catch (error) {
			console.error(`Failed to stop agent ${agentId}:`, error);
			return false;
		}
	}
	
	/**
	 * Pause an agent
	 */
	async function pauseAgent(agentId: string, reason?: string): Promise<boolean> {
		const currentState = get(store);
		const agentEngine = currentState.agentEngine;
		
		if (!agentEngine) {
			console.error('Agent engine not initialized');
			return false;
		}
		
		try {
			const success = await agentEngine.pauseAgent(agentId, reason);
			
			if (success) {
				// Update state immediately
				updateAgentState();
			}
			
			return success;
		} catch (error) {
			console.error(`Failed to pause agent ${agentId}:`, error);
			return false;
		}
	}
	
	/**
	 * Resume an agent
	 */
	async function resumeAgent(agentId: string): Promise<boolean> {
		const currentState = get(store);
		const agentEngine = currentState.agentEngine;
		
		if (!agentEngine) {
			console.error('Agent engine not initialized');
			return false;
		}
		
		try {
			const success = await agentEngine.resumeAgent(agentId);
			
			if (success) {
				// Update state immediately
				updateAgentState();
			}
			
			return success;
		} catch (error) {
			console.error(`Failed to resume agent ${agentId}:`, error);
			return false;
		}
	}
	
	/**
	 * Execute an agent immediately
	 */
	async function executeAgent(agentId: string): Promise<AgentResult | null> {
		const currentState = get(store);
		const agentEngine = currentState.agentEngine;
		
		if (!agentEngine) {
			console.error('Agent engine not initialized');
			return null;
		}
		
		try {
			const result = await agentEngine.executeAgent(agentId);
			
			if (result) {
				// Update state immediately
				updateAgentState();
			}
			
			return result;
		} catch (error) {
			console.error(`Failed to execute agent ${agentId}:`, error);
			return null;
		}
	}
	
	/**
	 * Get agent suggestions
	 */
	function getAgentSuggestions(agentId: string): any[] {
		const currentState = get(store);
		return currentState.agentSuggestions.get(agentId) || [];
	}
	
	/**
	 * Get all agent suggestions
	 */
	function getAllAgentSuggestions(): Array<{ agentId: string; suggestions: any[] }> {
		const currentState = get(store);
		const result: Array<{ agentId: string; suggestions: any[] }> = [];
		
		for (const [agentId, suggestions] of currentState.agentSuggestions) {
			if (suggestions.length > 0) {
				result.push({ agentId, suggestions });
			}
		}
		
		return result;
	}
	
	/**
	 * Clear agent events
	 */
	function clearAgentEvents(): void {
		store.update(state => ({
			...state,
			agentEvents: []
		}));
	}
	
	/**
	 * Clean up resources
	 */
	async function cleanup(): Promise<void> {
		const currentState = get(store);
		const agentEngine = currentState.agentEngine;
		
		if (agentEngine) {
			// Remove event listener
			if (eventListener) {
				agentEngine.removeEventListener(eventListener);
				eventListener = null;
			}
			
			// Clean up agent engine
			await agentEngine.cleanup();
		}
		
		// Reset store
		store.set({
			agentEngine: null,
			agentScheduler: null,
			agentStateManager: null,
			agentRegistry: null,
			agents: [],
			activeAgents: [],
			agentStates: new Map(),
			agentSuggestions: new Map(),
			agentEvents: [],
			agentStats: {
				totalAgents: 0,
				activeAgents: 0,
				pausedAgents: 0,
				errorAgents: 0,
				totalExecutions: 0,
				successfulExecutions: 0,
				failedExecutions: 0,
				lastUpdated: new Date()
			},
			isLoading: false,
			error: null
		});
		
		console.log('Agent UI store cleaned up');
	}
	
	return {
		store,
		initialize,
		startAgent,
		stopAgent,
		pauseAgent,
		resumeAgent,
		executeAgent,
		getAgentSuggestions,
		getAllAgentSuggestions,
		clearAgentEvents,
		cleanup
	};
}

/**
 * Agent status derived store
 */
export function createAgentStatusStore(uiStore: Writable<AgentUIStore>): Readable<{
	activeAgents: Agent[];
	agentStats: AgentUIStore['agentStats'];
	isLoading: boolean;
	error: string | null;
}> {
	return derived(uiStore, ($uiStore) => ({
		activeAgents: $uiStore.activeAgents,
		agentStats: $uiStore.agentStats,
		isLoading: $uiStore.isLoading,
		error: $uiStore.error
	}));
}

/**
 * Agent suggestions derived store
 */
export function createAgentSuggestionsStore(uiStore: Writable<AgentUIStore>): Readable<Array<{
	agentId: string;
	agentName: string;
	suggestions: any[];
}>> {
	return derived(uiStore, ($uiStore) => {
		const result: Array<{ agentId: string; agentName: string; suggestions: any[] }> = [];
		
		for (const [agentId, suggestions] of $uiStore.agentSuggestions) {
			if (suggestions.length > 0) {
				// Find agent name
				const agent = $uiStore.agents.find(a => a.config.id === agentId);
				const agentName = agent?.config.name || agentId;
				
				result.push({
					agentId,
					agentName,
					suggestions
				});
			}
		}
		
		return result;
	});
}

/**
 * Agent events derived store
 */
export function createAgentEventsStore(uiStore: Writable<AgentUIStore>): Readable<AgentEvent[]> {
	return derived(uiStore, ($uiStore) => $uiStore.agentEvents);
}

/**
 * Agent control hooks
 */
export function useAgentControls(
	uiStore: ReturnType<typeof createAgentUIStore>
): {
	startAgent: (agentId: string) => Promise<boolean>;
	stopAgent: (agentId: string) => Promise<boolean>;
	pauseAgent: (agentId: string, reason?: string) => Promise<boolean>;
	resumeAgent: (agentId: string) => Promise<boolean>;
	executeAgent: (agentId: string) => Promise<AgentResult | null>;
	getAgentState: (agentId: string) => AgentState | null;
	getAgentStatus: (agentId: string) => AgentStatus | null;
} {
	return {
		startAgent: uiStore.startAgent,
		stopAgent: uiStore.stopAgent,
		pauseAgent: uiStore.pauseAgent,
		resumeAgent: uiStore.resumeAgent,
		executeAgent: uiStore.executeAgent,
		getAgentState: (agentId: string) => {
			const store = get(uiStore.store);
			return store.agentStates.get(agentId) || null;
		},
		getAgentStatus: (agentId: string) => {
			const store = get(uiStore.store);
			const agentState = store.agentStates.get(agentId);
			return agentState?.status || null;
		}
	};
}

/**
 * Agent configuration hooks
 */
export function useAgentConfiguration(
	uiStore: ReturnType<typeof createAgentUIStore>
): {
	getAgentConfig: (agentId: string) => AgentConfig | null;
	updateAgentConfig: (agentId: string, updates: Partial<AgentConfig>) => Promise<boolean>;
	getAllAgentConfigs: () => AgentConfig[];
} {
	return {
		getAgentConfig: (agentId: string) => {
			const store = get(uiStore.store);
			const agent = store.agents.find(a => a.config.id === agentId);
			return agent?.config || null;
		},
		updateAgentConfig: async (agentId: string, updates: Partial<AgentConfig>) => {
			// In a real implementation, this would update the agent configuration
			// For now, we'll just log it
			console.log(`Updating agent ${agentId} config:`, updates);
			
			// TODO: Implement actual configuration update
			// This would involve:
			// 1. Getting the agent from the engine
			// 2. Updating its configuration
			// 3. Persisting the updated configuration
			// 4. Restarting the agent if needed
			
			return true;
		},
		getAllAgentConfigs: () => {
			const store = get(uiStore.store);
			return store.agents.map(a => a.config);
		}
	};
}

/**
 * Agent monitoring hooks
 */
export function useAgentMonitoring(
	uiStore: ReturnType<typeof createAgentUIStore>
): {
	getAgentEvents: () => AgentEvent[];
	clearAgentEvents: () => void;
	getAgentSuggestions: () => Array<{ agentId: string; agentName: string; suggestions: any[] }>;
	getAgentStatistics: () => AgentUIStore['agentStats'];
} {
	return {
		getAgentEvents: () => {
			const store = get(uiStore.store);
			return store.agentEvents;
		},
		clearAgentEvents: uiStore.clearAgentEvents,
		getAgentSuggestions: () => {
			const store = get(uiStore.store);
			const result: Array<{ agentId: string; agentName: string; suggestions: any[] }> = [];
			
			for (const [agentId, suggestions] of store.agentSuggestions) {
				if (suggestions.length > 0) {
					const agent = store.agents.find(a => a.config.id === agentId);
					const agentName = agent?.config.name || agentId;
					
					result.push({
						agentId,
						agentName,
						suggestions
					});
				}
			}
			
			return result;
		},
		getAgentStatistics: () => {
			const store = get(uiStore.store);
			return store.agentStats;
		}
	};
}

/**
 * Pre-configured UI store instance
 *
 * This provides a singleton instance of the agent UI store
 * that can be used throughout the application.
 */
let globalAgentUIStore: ReturnType<typeof createAgentUIStore> | null = null;

export function getGlobalAgentUIStore(): ReturnType<typeof createAgentUIStore> {
	if (!globalAgentUIStore) {
		globalAgentUIStore = createAgentUIStore();
	}
	return globalAgentUIStore;
}

export function initializeGlobalAgentUIStore(): Promise<void> {
	const store = getGlobalAgentUIStore();
	return store.initialize();
}

export function cleanupGlobalAgentUIStore(): Promise<void> {
	if (globalAgentUIStore) {
		return globalAgentUIStore.cleanup();
	}
	return Promise.resolve();
}