/**
 * Agent State Management
 * 
 * Manages agent state persistence, restoration, and history.
 * Provides state snapshots, rollback capabilities, and state analytics.
 */

import type {
	AgentState,
	AgentStateManagerConfig,
	AgentStatus,
	AgentResult
} from './agentTypes';

/**
 * Agent state history entry
 */
interface AgentStateHistoryEntry {
	/** Timestamp */
	timestamp: Date;
	
	/** Agent state snapshot */
	state: AgentState;
	
	/** Change description */
	changeDescription?: string;
	
	/** Trigger that caused the state change */
	trigger?: string;
}

/**
 * Agent state analytics
 */
interface AgentStateAnalytics {
	/** Agent ID */
	agentId: string;
	
	/** Total execution time in milliseconds */
	totalExecutionTimeMs: number;
	
	/** Average execution time in milliseconds */
	averageExecutionTimeMs: number;
	
	/** Success rate (0-1) */
	successRate: number;
	
	/** Error rate (0-1) */
	errorRate: number;
	
	/** Most common error */
	mostCommonError?: string;
	
	/** Busiest time of day (hour 0-23) */
	busiestHour?: number;
	
	/** Execution trend (increasing, decreasing, stable) */
	executionTrend: 'increasing' | 'decreasing' | 'stable';
	
	/** Last 7 days execution count */
	last7DaysExecutions: number[];
	
	/** Last 7 days success count */
	last7DaysSuccesses: number[];
	
	/** Last 7 days error count */
	last7DaysErrors: number[];
}

/**
 * Agent State Manager
 */
export class AgentStateManager {
	private config: AgentStateManagerConfig;
	private stateHistory: Map<string, AgentStateHistoryEntry[]> = new Map();
	private stateAnalytics: Map<string, AgentStateAnalytics> = new Map();
	private isInitialized = false;
	private persistenceInterval?: NodeJS.Timeout;
	
	constructor(config: Partial<AgentStateManagerConfig> = {}) {
		this.config = {
			persistToStorage: config.persistToStorage ?? true,
			storageKeyPrefix: config.storageKeyPrefix ?? 'agent-state-',
			maxStateHistoryEntries: config.maxStateHistoryEntries ?? 100,
			persistenceIntervalMs: config.persistenceIntervalMs ?? 30 * 1000, // 30 seconds
			compressStateData: config.compressStateData ?? false
		};
	}
	
	/**
	 * Initialize the state manager
	 */
	async initialize(): Promise<void> {
		if (this.isInitialized) {
			return;
		}
		
		console.log('Initializing Agent State Manager...');
		
		// Load persisted states if enabled
		if (this.config.persistToStorage) {
			await this.loadPersistedStates();
		}
		
		// Start persistence interval if enabled
		if (this.config.persistToStorage) {
			this.persistenceInterval = setInterval(() => {
				this.persistStates().catch((error: any) => {
					console.error('Failed to persist agent states:', error);
				});
			}, this.config.persistenceIntervalMs);
		}
		
		this.isInitialized = true;
		console.log('Agent State Manager initialized');
	}
	
	/**
	 * Save agent state
	 */
	saveAgentState(agentId: string, state: AgentState, changeDescription?: string, trigger?: string): void {
		// Create history entry
		const historyEntry: AgentStateHistoryEntry = {
			timestamp: new Date(),
			state: this.cloneState(state),
			changeDescription,
			trigger
		};
		
		// Get or create history array
		if (!this.stateHistory.has(agentId)) {
			this.stateHistory.set(agentId, []);
		}
		
		const history = this.stateHistory.get(agentId)!;
		
		// Add to history
		history.push(historyEntry);
		
		// Trim history if needed
		if (history.length > this.config.maxStateHistoryEntries) {
			history.splice(0, history.length - this.config.maxStateHistoryEntries);
		}
		
		// Update analytics
		this.updateAnalytics(agentId, state);
		
		console.log(`Saved state for agent ${agentId} (history size: ${history.length})`);
	}
	
	/**
	 * Get agent state history
	 */
	getAgentStateHistory(agentId: string, limit?: number): AgentStateHistoryEntry[] {
		const history = this.stateHistory.get(agentId);
		if (!history) {
			return [];
		}
		
		if (limit && limit > 0) {
			return history.slice(-limit);
		}
		
		return [...history];
	}
	
	/**
	 * Get agent state at specific time
	 */
	getAgentStateAtTime(agentId: string, timestamp: Date): AgentState | null {
		const history = this.stateHistory.get(agentId);
		if (!history || history.length === 0) {
			return null;
		}
		
		// Find the state entry closest to the given timestamp
		let closestEntry: AgentStateHistoryEntry | null = null;
		let closestDiff = Infinity;
		
		for (const entry of history) {
			const diff = Math.abs(entry.timestamp.getTime() - timestamp.getTime());
			if (diff < closestDiff) {
				closestDiff = diff;
				closestEntry = entry;
			}
		}
		
		return closestEntry ? this.cloneState(closestEntry.state) : null;
	}
	
	/**
	 * Rollback agent state to previous version
	 */
	rollbackAgentState(agentId: string, stepsBack: number = 1): AgentState | null {
		const history = this.stateHistory.get(agentId);
		if (!history || history.length < 2) {
			return null;
		}
		
		const targetIndex = Math.max(0, history.length - 1 - stepsBack);
		const targetEntry = history[targetIndex];
		
		if (!targetEntry) {
			return null;
		}
		
		// Create a new history entry for the rollback
		const rollbackEntry: AgentStateHistoryEntry = {
			timestamp: new Date(),
			state: this.cloneState(targetEntry.state),
			changeDescription: `Rollback ${stepsBack} step(s)`,
			trigger: 'rollback'
		};
		
		history.push(rollbackEntry);
		
		console.log(`Rolled back agent ${agentId} state ${stepsBack} step(s) to ${targetEntry.timestamp.toISOString()}`);
		
		return this.cloneState(targetEntry.state);
	}
	
	/**
	 * Get agent state analytics
	 */
	getAgentStateAnalytics(agentId: string): AgentStateAnalytics | null {
		return this.stateAnalytics.get(agentId) || null;
	}
	
	/**
	 * Get all agent state analytics
	 */
	getAllAgentStateAnalytics(): Map<string, AgentStateAnalytics> {
		return new Map(this.stateAnalytics);
	}
	
	/**
	 * Update agent state analytics
	 */
	private updateAnalytics(agentId: string, state: AgentState): void {
		if (!this.stateAnalytics.has(agentId)) {
			// Initialize analytics
			this.stateAnalytics.set(agentId, {
				agentId,
				totalExecutionTimeMs: 0,
				averageExecutionTimeMs: 0,
				successRate: 0,
				errorRate: 0,
				executionTrend: 'stable',
				last7DaysExecutions: [0, 0, 0, 0, 0, 0, 0],
				last7DaysSuccesses: [0, 0, 0, 0, 0, 0, 0],
				last7DaysErrors: [0, 0, 0, 0, 0, 0, 0]
			});
		}
		
		const analytics = this.stateAnalytics.get(agentId)!;
		
		// Update execution counts
		const today = new Date().getDay(); // 0 = Sunday, 6 = Saturday
		analytics.last7DaysExecutions[today] = state.executionCount;
		analytics.last7DaysSuccesses[today] = state.successCount;
		analytics.last7DaysErrors[today] = state.errorCount;
		
		// Update success and error rates
		if (state.executionCount > 0) {
			analytics.successRate = state.successCount / state.executionCount;
			analytics.errorRate = state.errorCount / state.executionCount;
		}
		
		// Update execution time metrics
		analytics.totalExecutionTimeMs = state.averageExecutionTimeMs * state.executionCount;
		analytics.averageExecutionTimeMs = state.averageExecutionTimeMs;
		
		// Update execution trend (simplified)
		const history = this.stateHistory.get(agentId);
		if (history && history.length >= 2) {
			const recentExecutions = history.slice(-2);
			const currentCount = recentExecutions[1]?.state.executionCount || 0;
			const previousCount = recentExecutions[0]?.state.executionCount || 0;
			
			if (currentCount > previousCount) {
				analytics.executionTrend = 'increasing';
			} else if (currentCount < previousCount) {
				analytics.executionTrend = 'decreasing';
			} else {
				analytics.executionTrend = 'stable';
			}
		}
		
		// Update busiest hour
		const now = new Date();
		const currentHour = now.getHours();
		analytics.busiestHour = currentHour; // Simplified - in reality would track over time
		
		// Update most common error
		if (state.lastError) {
			analytics.mostCommonError = state.lastError;
		}
	}
	
	/**
	 * Clone agent state (deep copy)
	 */
	private cloneState(state: AgentState): AgentState {
		return JSON.parse(JSON.stringify(state));
	}
	
	/**
	 * Get agent state summary
	 */
	getAgentStateSummary(agentId: string): {
		currentState: AgentState | null;
		historySize: number;
		lastExecutionTime: Date | null;
		nextExecutionTime: Date | null;
		successRate: number;
		errorRate: number;
	} {
		const history = this.stateHistory.get(agentId);
		const analytics = this.stateAnalytics.get(agentId);
		
		if (!history || history.length === 0) {
			return {
				currentState: null,
				historySize: 0,
				lastExecutionTime: null,
				nextExecutionTime: null,
				successRate: 0,
				errorRate: 0
			};
		}
		
		const currentState = history[history.length - 1].state;
		
		return {
			currentState: this.cloneState(currentState),
			historySize: history.length,
			lastExecutionTime: currentState.lastExecutionTime || null,
			nextExecutionTime: currentState.nextExecutionTime || null,
			successRate: analytics?.successRate || 0,
			errorRate: analytics?.errorRate || 0
		};
	}
	
	/**
	 * Get agent state trends
	 */
	getAgentStateTrends(agentId: string, days: number = 7): {
		executionCounts: number[];
		successCounts: number[];
		errorCounts: number[];
		averageExecutionTimes: number[];
	} {
		const history = this.stateHistory.get(agentId);
		if (!history || history.length === 0) {
			return {
				executionCounts: [],
				successCounts: [],
				errorCounts: [],
				averageExecutionTimes: []
			};
		}
		
		// Group by day
		const now = new Date();
		const dayStart = new Date(now);
		dayStart.setDate(dayStart.getDate() - days + 1);
		dayStart.setHours(0, 0, 0, 0);
		
		const executionCounts: number[] = new Array(days).fill(0);
		const successCounts: number[] = new Array(days).fill(0);
		const errorCounts: number[] = new Array(days).fill(0);
		const averageExecutionTimes: number[] = new Array(days).fill(0);
		
		for (const entry of history) {
			const entryDate = new Date(entry.timestamp);
			if (entryDate < dayStart) {
				continue;
			}
			
			const dayIndex = Math.floor((entryDate.getTime() - dayStart.getTime()) / (24 * 60 * 60 * 1000));
			if (dayIndex >= 0 && dayIndex < days) {
				executionCounts[dayIndex] = entry.state.executionCount;
				successCounts[dayIndex] = entry.state.successCount;
				errorCounts[dayIndex] = entry.state.errorCount;
				averageExecutionTimes[dayIndex] = entry.state.averageExecutionTimeMs;
			}
		}
		
		return {
			executionCounts,
			successCounts,
			errorCounts,
			averageExecutionTimes
		};
	}
	
	/**
	 * Persist states to storage
	 */
	private async persistStates(): Promise<void> {
		if (!this.config.persistToStorage) {
			return;
		}
		
		try {
			const statesToPersist: Record<string, any> = {};
			
			// Collect all state histories
			for (const [agentId, history] of this.stateHistory) {
				if (history.length > 0) {
					const latestState = history[history.length - 1].state;
					statesToPersist[agentId] = {
						latestState,
						historySize: history.length,
						lastUpdated: new Date()
					};
				}
			}
			
			// In a real implementation, this would save to AppFlowy/storage
			// For now, we'll just log it
			if (Object.keys(statesToPersist).length > 0) {
				console.log(`Persisted ${Object.keys(statesToPersist).length} agent states to storage`);
			}
			
			// TODO: Implement actual persistence to AppFlowy/storage
			// const storageKey = `${this.config.storageKeyPrefix}${Date.now()}`;
			// await appFlowyStorage.set(storageKey, statesToPersist);
		} catch (error) {
			console.error('Failed to persist agent states:', error);
		}
	}
	
	/**
	 * Load persisted states from storage
	 */
	private async loadPersistedStates(): Promise<void> {
		if (!this.config.persistToStorage) {
			return;
		}
		
		try {
			// TODO: Implement actual loading from AppFlowy/storage
			// const storageKey = `${this.config.storageKeyPrefix}latest`;
			// const persistedStates = await appFlowyStorage.get(storageKey);
			const persistedStates: Record<string, any> = {};
			
			if (persistedStates) {
				let loadedCount = 0;
				
				for (const [agentId, data] of Object.entries(persistedStates)) {
					if (data.latestState) {
						// Create initial history entry
						const historyEntry: AgentStateHistoryEntry = {
							timestamp: new Date(),
							state: data.latestState,
							changeDescription: 'Loaded from persisted storage',
							trigger: 'persistence_restore'
						};
						
						this.stateHistory.set(agentId, [historyEntry]);
						loadedCount++;
					}
				}
				
				console.log(`Loaded ${loadedCount} agent states from persisted storage`);
			}
		} catch (error) {
			console.error('Failed to load persisted agent states:', error);
		}
	}
	
	/**
	 * Export agent state data
	 */
	exportAgentStateData(agentId: string): {
		history: AgentStateHistoryEntry[];
		analytics: AgentStateAnalytics | null;
		summary: any;
		trends: any;
	} {
		const history = this.getAgentStateHistory(agentId);
		const analytics = this.getAgentStateAnalytics(agentId);
		const summary = this.getAgentStateSummary(agentId);
		const trends = this.getAgentStateTrends(agentId);
		
		return {
			history,
			analytics,
			summary,
			trends
		};
	}
	
	/**
	 * Import agent state data
	 */
	importAgentStateData(agentId: string, data: {
		history: AgentStateHistoryEntry[];
		analytics?: AgentStateAnalytics;
	}): boolean {
		try {
			// Import history
			if (data.history && Array.isArray(data.history)) {
				this.stateHistory.set(agentId, data.history.map(entry => ({
					...entry,
					timestamp: new Date(entry.timestamp),
					state: {
						...entry.state,
						lastExecutionTime: entry.state.lastExecutionTime ? new Date(entry.state.lastExecutionTime) : undefined,
						nextExecutionTime: entry.state.nextExecutionTime ? new Date(entry.state.nextExecutionTime) : undefined,
						lastUpdated: new Date(entry.state.lastUpdated)
					}
				})));
			}
			
			// Import analytics
			if (data.analytics) {
				this.stateAnalytics.set(agentId, data.analytics);
			}
			
			console.log(`Imported state data for agent ${agentId} (history size: ${data.history?.length || 0})`);
			return true;
		} catch (error) {
			console.error(`Failed to import state data for agent ${agentId}:`, error);
			return false;
		}
	}
	
	/**
	 * Clear agent state history
	 */
	clearAgentStateHistory(agentId: string): boolean {
		const hadHistory = this.stateHistory.has(agentId);
		
		if (hadHistory) {
			this.stateHistory.delete(agentId);
			console.log(`Cleared state history for agent ${agentId}`);
		}
		
		return hadHistory;
	}
	
	/**
	 * Clear all agent state history
	 */
	clearAllAgentStateHistory(): number {
		const count = this.stateHistory.size;
		
		this.stateHistory.clear();
		this.stateAnalytics.clear();
		
		console.log(`Cleared all agent state history (${count} agents)`);
		return count;
	}
	
	/**
	 * Get agent state health
	 */
	getAgentStateHealth(agentId: string): {
		status: 'healthy' | 'warning' | 'critical';
		issues: string[];
		recommendations: string[];
	} {
		const history = this.stateHistory.get(agentId);
		const analytics = this.stateAnalytics.get(agentId);
		
		if (!history || history.length === 0) {
			return {
				status: 'warning',
				issues: ['No state history available'],
				recommendations: ['Monitor agent execution to build state history']
			};
		}
		
		const currentState = history[history.length - 1].state;
		const issues: string[] = [];
		const recommendations: string[] = [];
		
		// Check for errors
		if (currentState.errorCount > 0) {
			if (currentState.errorCount > 10) {
				issues.push(`High error count: ${currentState.errorCount} errors`);
				recommendations.push('Investigate agent error patterns');
			} else {
				issues.push(`Some errors: ${currentState.errorCount} errors`);
				recommendations.push('Review recent agent executions');
			}
		}
		
		// Check execution count
		if (currentState.executionCount === 0) {
			issues.push('Agent has never executed');
			recommendations.push('Check agent triggers and schedule');
		}
		
		// Check success rate
		if (analytics && analytics.successRate < 0.5 && currentState.executionCount > 10) {
			issues.push(`Low success rate: ${(analytics.successRate * 100).toFixed(1)}%`);
			recommendations.push('Review agent logic and error handling');
		}
		
		// Check execution time
		if (currentState.averageExecutionTimeMs > 10000) { // 10 seconds
			issues.push(`Long execution time: ${currentState.averageExecutionTimeMs.toFixed(0)}ms average`);
			recommendations.push('Optimize agent performance');
		}
		
		// Determine status
		let status: 'healthy' | 'warning' | 'critical' = 'healthy';
		
		if (issues.length > 0) {
			status = 'warning';
			
			if (issues.some(issue => issue.includes('High error count') || issue.includes('never executed'))) {
				status = 'critical';
			}
		}
		
		return {
			status,
			issues,
			recommendations
		};
	}
	
	/**
	 * Clean up state manager resources
	 */
	async cleanup(): Promise<void> {
		// Clear persistence interval
		if (this.persistenceInterval) {
			clearInterval(this.persistenceInterval);
			this.persistenceInterval = undefined;
		}
		
		// Persist final states
		if (this.config.persistToStorage) {
			await this.persistStates();
		}
		
		this.isInitialized = false;
		
		console.log('Agent State Manager cleaned up');
	}
}