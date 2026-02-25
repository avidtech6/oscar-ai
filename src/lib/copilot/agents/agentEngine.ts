/**
 * Agent Engine
 * 
 * Core engine for the background intelligence layer.
 * Manages agent lifecycle, execution, and integration with other systems.
 */

import type {
	Agent,
	AgentConfig,
	AgentState,
	AgentStatus,
	AgentContext,
	AgentResult,
	AgentEvent,
	AgentEngineConfig,
	AgentRegistryEntry,
	AgentType
} from './agentTypes';

/**
 * Agent Engine
 */
export class AgentEngine {
	private config: AgentEngineConfig;
	private agents: Map<string, Agent> = new Map();
	private agentRegistry: Map<string, AgentRegistryEntry> = new Map();
	private eventListeners: Array<(event: AgentEvent) => void> = [];
	private isInitialized = false;
	private executionQueue: Array<{ agentId: string; context: AgentContext }> = [];
	private isProcessingQueue = false;
	
	constructor(config: Partial<AgentEngineConfig> = {}) {
		this.config = {
			autoStartEnabledAgents: config.autoStartEnabledAgents ?? true,
			persistAgentState: config.persistAgentState ?? true,
			restoreAgentState: config.restoreAgentState ?? true,
			maxConcurrentAgents: config.maxConcurrentAgents ?? 5,
			statePersistenceIntervalMs: config.statePersistenceIntervalMs ?? 60 * 1000, // 1 minute
			emitAgentEvents: config.emitAgentEvents ?? true,
			logAgentActivity: config.logAgentActivity ?? true,
			defaultAgentPriority: config.defaultAgentPriority ?? 50,
			defaultMaxExecutionTimeMs: config.defaultMaxExecutionTimeMs ?? 30 * 1000 // 30 seconds
		};
	}
	
	/**
	 * Initialize the agent engine
	 */
	async initialize(): Promise<void> {
		if (this.isInitialized) {
			return;
		}
		
		console.log('Initializing Agent Engine...');
		
		// Start state persistence interval if enabled
		if (this.config.persistAgentState) {
			setInterval(() => {
				this.persistAgentStates().catch((error: any) => {
					console.error('Failed to persist agent states:', error);
				});
			}, this.config.statePersistenceIntervalMs);
		}
		
		// Restore agent states if enabled
		if (this.config.restoreAgentState) {
			await this.restoreAgentStates();
		}
		
		// Auto-start enabled agents if configured
		if (this.config.autoStartEnabledAgents) {
			await this.autoStartEnabledAgents();
		}
		
		this.isInitialized = true;
		console.log('Agent Engine initialized');
		
		this.emitEvent({
			type: 'agent_start',
			agentId: 'agent-engine',
			timestamp: new Date(),
			data: { message: 'Agent Engine initialized' }
		});
	}
	
	/**
	 * Register an agent
	 */
	async registerAgent(config: AgentConfig, factory: (config: AgentConfig) => Promise<Agent>): Promise<Agent> {
		if (this.agents.has(config.id)) {
			throw new Error(`Agent with ID ${config.id} is already registered`);
		}
		
		console.log(`Registering agent: ${config.name} (${config.id})`);
		
		// Create agent instance
		const agent = await factory(config);
		
		// Store agent
		this.agents.set(config.id, agent);
		
		// Create registry entry
		const registryEntry: AgentRegistryEntry = {
			id: config.id,
			config,
			factory,
			registered: true,
			registeredAt: new Date()
		};
		
		this.agentRegistry.set(config.id, registryEntry);
		
		// Emit event
		this.emitEvent({
			type: 'agent_start',
			agentId: config.id,
			timestamp: new Date(),
			data: { action: 'registered', config }
		});
		
		// Auto-start if enabled
		if (this.config.autoStartEnabledAgents && config.enabled) {
			await this.startAgent(config.id);
		}
		
		return agent;
	}
	
	/**
	 * Unregister an agent
	 */
	async unregisterAgent(agentId: string): Promise<boolean> {
		const agent = this.agents.get(agentId);
		if (!agent) {
			return false;
		}
		
		console.log(`Unregistering agent: ${agentId}`);
		
		// Stop agent if running
		if (agent.getStatus() === 'running') {
			await agent.stop();
		}
		
		// Clean up agent resources
		await agent.cleanup();
		
		// Remove from maps
		this.agents.delete(agentId);
		this.agentRegistry.delete(agentId);
		
		// Emit event
		this.emitEvent({
			type: 'agent_stop',
			agentId,
			timestamp: new Date(),
			data: { action: 'unregistered' }
		});
		
		return true;
	}
	
	/**
	 * Start an agent
	 */
	async startAgent(agentId: string, context?: Partial<AgentContext>): Promise<boolean> {
		const agent = this.agents.get(agentId);
		if (!agent) {
			console.error(`Agent not found: ${agentId}`);
			return false;
		}
		
		const currentStatus = agent.getStatus();
		if (currentStatus === 'running' || currentStatus === 'starting') {
			console.log(`Agent ${agentId} is already ${currentStatus}`);
			return true;
		}
		
		if (currentStatus === 'paused') {
			return await this.resumeAgent(agentId);
		}
		
		console.log(`Starting agent: ${agentId}`);
		
		// Update agent state
		agent.updateState({
			status: 'starting',
			lastUpdated: new Date()
		});
		
		// Create execution context
		const executionContext: AgentContext = {
			timestamp: new Date(),
			agentState: agent.state,
			...context
		};
		
		try {
			// Initialize agent
			await agent.initialize(executionContext);
			
			// Update state to running
			agent.updateState({
				status: 'running',
				lastUpdated: new Date()
			});
			
			// Emit event
			this.emitEvent({
				type: 'agent_start',
				agentId,
				timestamp: new Date(),
				data: { context: executionContext }
			});
			
			// Queue execution if agent has triggers
			if (agent.config.triggers.length > 0) {
				this.queueAgentExecution(agentId, executionContext);
			}
			
			return true;
		} catch (error) {
			console.error(`Failed to start agent ${agentId}:`, error);
			
			agent.updateState({
				status: 'error',
				lastError: error instanceof Error ? error.message : 'Unknown error',
				lastUpdated: new Date()
			});
			
			this.emitEvent({
				type: 'agent_error',
				agentId,
				timestamp: new Date(),
				error: error instanceof Error ? error.message : 'Unknown error',
				data: { context: executionContext }
			});
			
			return false;
		}
	}
	
	/**
	 * Stop an agent
	 */
	async stopAgent(agentId: string): Promise<boolean> {
		const agent = this.agents.get(agentId);
		if (!agent) {
			return false;
		}
		
		const currentStatus = agent.getStatus();
		if (currentStatus === 'stopped' || currentStatus === 'stopping') {
			return true;
		}
		
		console.log(`Stopping agent: ${agentId}`);
		
		// Update agent state
		agent.updateState({
			status: 'stopping',
			lastUpdated: new Date()
		});
		
		try {
			await agent.stop();
			
			agent.updateState({
				status: 'stopped',
				lastUpdated: new Date()
			});
			
			this.emitEvent({
				type: 'agent_stop',
				agentId,
				timestamp: new Date(),
				data: { previousStatus: currentStatus }
			});
			
			return true;
		} catch (error) {
			console.error(`Failed to stop agent ${agentId}:`, error);
			
			agent.updateState({
				status: 'error',
				lastError: error instanceof Error ? error.message : 'Unknown error',
				lastUpdated: new Date()
			});
			
			this.emitEvent({
				type: 'agent_error',
				agentId,
				timestamp: new Date(),
				error: error instanceof Error ? error.message : 'Unknown error',
				data: { action: 'stop' }
			});
			
			return false;
		}
	}
	
	/**
	 * Pause an agent
	 */
	async pauseAgent(agentId: string, reason?: string): Promise<boolean> {
		const agent = this.agents.get(agentId);
		if (!agent) {
			return false;
		}
		
		const currentStatus = agent.getStatus();
		if (currentStatus !== 'running') {
			console.log(`Agent ${agentId} is not running (status: ${currentStatus})`);
			return false;
		}
		
		console.log(`Pausing agent: ${agentId}${reason ? ` - ${reason}` : ''}`);
		
		try {
			await agent.pause(reason);
			
			agent.updateState({
				status: 'paused',
				pausedByUser: true,
				pauseReason: reason,
				lastUpdated: new Date()
			});
			
			this.emitEvent({
				type: 'agent_pause',
				agentId,
				timestamp: new Date(),
				data: { reason }
			});
			
			return true;
		} catch (error) {
			console.error(`Failed to pause agent ${agentId}:`, error);
			
			this.emitEvent({
				type: 'agent_error',
				agentId,
				timestamp: new Date(),
				error: error instanceof Error ? error.message : 'Unknown error',
				data: { action: 'pause', reason }
			});
			
			return false;
		}
	}
	
	/**
	 * Resume an agent
	 */
	async resumeAgent(agentId: string): Promise<boolean> {
		const agent = this.agents.get(agentId);
		if (!agent) {
			return false;
		}
		
		const currentStatus = agent.getStatus();
		if (currentStatus !== 'paused') {
			console.log(`Agent ${agentId} is not paused (status: ${currentStatus})`);
			return false;
		}
		
		console.log(`Resuming agent: ${agentId}`);
		
		try {
			await agent.resume();
			
			agent.updateState({
				status: 'running',
				pausedByUser: false,
				pauseReason: undefined,
				lastUpdated: new Date()
			});
			
			this.emitEvent({
				type: 'agent_resume',
				agentId,
				timestamp: new Date(),
				data: { previousStatus: currentStatus }
			});
			
			return true;
		} catch (error) {
			console.error(`Failed to resume agent ${agentId}:`, error);
			
			this.emitEvent({
				type: 'agent_error',
				agentId,
				timestamp: new Date(),
				error: error instanceof Error ? error.message : 'Unknown error',
				data: { action: 'resume' }
			});
			
			return false;
		}
	}
	
	/**
	 * Execute an agent immediately
	 */
	async executeAgent(agentId: string, context?: Partial<AgentContext>): Promise<AgentResult | null> {
		const agent = this.agents.get(agentId);
		if (!agent) {
			console.error(`Agent not found: ${agentId}`);
			return null;
		}
		
		const currentStatus = agent.getStatus();
		if (currentStatus !== 'running' && currentStatus !== 'idle') {
			console.log(`Agent ${agentId} is not in executable state (status: ${currentStatus})`);
			return null;
		}
		
		console.log(`Executing agent: ${agentId}`);
		
		// Create execution context
		const executionContext: AgentContext = {
			timestamp: new Date(),
			agentState: agent.state,
			trigger: { type: 'manual', data: context },
			...context
		};
		
		// Emit trigger event
		this.emitEvent({
			type: 'agent_trigger',
			agentId,
			timestamp: new Date(),
			data: { context: executionContext }
		});
		
		const startTime = Date.now();
		
		try {
			// Execute agent
			const result = await agent.execute(executionContext);
			
			const executionTimeMs = Date.now() - startTime;
			result.executionTimeMs = executionTimeMs;
			
			// Update agent state
			const newErrorCount = result.success ? agent.state.errorCount : agent.state.errorCount + 1;
			const newSuccessCount = result.success ? agent.state.successCount + 1 : agent.state.successCount;
			const totalExecutions = agent.state.executionCount + 1;
			
			// Calculate average execution time
			const newAverageExecutionTimeMs = agent.state.averageExecutionTimeMs > 0
				? (agent.state.averageExecutionTimeMs * agent.state.executionCount + executionTimeMs) / totalExecutions
				: executionTimeMs;
			
			agent.updateState({
				lastExecutionTime: new Date(),
				executionCount: totalExecutions,
				successCount: newSuccessCount,
				errorCount: newErrorCount,
				lastResult: result,
				averageExecutionTimeMs: newAverageExecutionTimeMs,
				lastUpdated: new Date()
			});
			
			// Emit result event
			this.emitEvent({
				type: 'agent_result',
				agentId,
				timestamp: new Date(),
				data: { result, executionTimeMs }
			});
			
			// Emit suggestion events if any
			if (result.suggestions && result.suggestions.length > 0) {
				for (const suggestion of result.suggestions) {
					this.emitEvent({
						type: 'agent_suggestion',
						agentId,
						timestamp: new Date(),
						data: { suggestion }
					});
				}
			}
			
			// Emit workflow triggered events if any
			if (result.workflowsTriggered && result.workflowsTriggered.length > 0) {
				for (const workflowId of result.workflowsTriggered) {
					this.emitEvent({
						type: 'agent_workflow_triggered',
						agentId,
						timestamp: new Date(),
						data: { workflowId }
					});
				}
			}
			
			if (this.config.logAgentActivity) {
				console.log(`Agent ${agentId} executed successfully in ${executionTimeMs}ms`);
			}
			
			return result;
		} catch (error) {
			const executionTimeMs = Date.now() - startTime;
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			
			console.error(`Agent ${agentId} execution failed:`, error);
			
			// Update agent state
			agent.updateState({
				lastExecutionTime: new Date(),
				executionCount: agent.state.executionCount + 1,
				errorCount: agent.state.errorCount + 1,
				lastError: errorMessage,
				lastUpdated: new Date()
			});
			
			// Emit error event
			this.emitEvent({
				type: 'agent_error',
				agentId,
				timestamp: new Date(),
				error: errorMessage,
				data: { executionTimeMs, context: executionContext }
			});
			
			return {
				success: false,
				error: errorMessage,
				executionTimeMs
			};
		}
	}
	
	/**
	 * Queue agent execution
	 */
	private queueAgentExecution(agentId: string, context: AgentContext): void {
		this.executionQueue.push({ agentId, context });
		
		if (!this.isProcessingQueue) {
			this.processExecutionQueue();
		}
	}
	
	/**
	 * Process execution queue
	 */
	private async processExecutionQueue(): Promise<void> {
		if (this.isProcessingQueue || this.executionQueue.length === 0) {
			return;
		}
		
		this.isProcessingQueue = true;
		
		try {
			// Process up to maxConcurrentAgents at a time
			const concurrentLimit = this.config.maxConcurrentAgents;
			const batch = this.executionQueue.splice(0, concurrentLimit);
			
			// Execute agents in parallel
			const executions = batch.map(async ({ agentId, context }) => {
				try {
					await this.executeAgent(agentId, context);
				} catch (error) {
					console.error(`Error executing agent ${agentId} from queue:`, error);
				}
			});
			
			await Promise.all(executions);
			
			// If there are more items in the queue, process them
			if (this.executionQueue.length > 0) {
				// Use setTimeout to avoid blocking
				setTimeout(() => {
					this.processExecutionQueue();
				}, 0);
			}
		} finally {
			this.isProcessingQueue = false;
		}
	}
	
	/**
	 * Get active agents
	 */
	getActiveAgents(): Agent[] {
		return Array.from(this.agents.values()).filter(agent => 
			agent.getStatus() === 'running' || agent.getStatus() === 'starting'
		);
	}
	
	/**
	 * Get agent state
	 */
	getAgentState(agentId: string): AgentState | null {
		const agent = this.agents.get(agentId);
		return agent ? agent.state : null;
	}
	
	/**
	 * Get all agents
	 */
	getAllAgents(): Agent[] {
		return Array.from(this.agents.values());
	}
	
	/**
	 * Get agent by ID
	 */
	getAgent(agentId: string): Agent | null {
		return this.agents.get(agentId) || null;
	}
	
	/**
	 * Get agent suggestions
	 */
	getAgentSuggestions(agentId: string): any[] {
		const agent = this.agents.get(agentId);
		if (!agent) {
			return [];
		}
		
		const state = agent.state;
		if (!state.lastResult || !state.lastResult.suggestions) {
			return [];
		}
		
		return state.lastResult.suggestions;
	}
	
	/**
	 * Get all agent suggestions
	 */
	getAllAgentSuggestions(): Array<{ agentId: string; suggestions: any[] }> {
		const results: Array<{ agentId: string; suggestions: any[] }> = [];
		
		for (const [agentId, agent] of this.agents) {
			const state = agent.state;
			if (state.lastResult && state.lastResult.suggestions && state.lastResult.suggestions.length > 0) {
				results.push({
					agentId,
					suggestions: state.lastResult.suggestions
				});
			}
		}
		
		return results;
	}
	
	/**
	 * Add event listener
	 */
	addEventListener(listener: (event: AgentEvent) => void): void {
		this.eventListeners.push(listener);
	}
	
	/**
	 * Remove event listener
	 */
	removeEventListener(listener: (event: AgentEvent) => void): void {
		const index = this.eventListeners.indexOf(listener);
		if (index !== -1) {
			this.eventListeners.splice(index, 1);
		}
	}
	
	/**
	 * Emit event
	 */
	private emitEvent(event: AgentEvent): void {
		if (!this.config.emitAgentEvents) {
			return;
		}
		
		for (const listener of this.eventListeners) {
			try {
				listener(event);
			} catch (error) {
				console.error('Error in agent event listener:', error);
			}
		}
	}
	
	/**
	 * Handle memory event
	 */
	async handleMemoryEvent(event: any): Promise<void> {
		// Check if any agents have memory triggers
		for (const [agentId, agent] of this.agents) {
			const triggers = agent.config.triggers;
			for (const trigger of triggers) {
				if (trigger.type === 'memory' && this.memoryEventMatchesTrigger(event, trigger)) {
					await this.executeAgent(agentId, {
						data: {
							memoryEvent: event,
							trigger
						}
					});
				}
			}
		}
	}
	
	/**
	 * Handle workflow event
	 */
	async handleWorkflowEvent(event: any): Promise<void> {
		// Check if any agents have workflow triggers
		for (const [agentId, agent] of this.agents) {
			const triggers = agent.config.triggers;
			for (const trigger of triggers) {
				if (trigger.type === 'workflow' && this.workflowEventMatchesTrigger(event, trigger)) {
					await this.executeAgent(agentId, {
						data: {
							workflowEvent: event,
							trigger
						}
					});
				}
			}
		}
	}
	
	/**
	 * Check if memory event matches trigger
	 */
	private memoryEventMatchesTrigger(event: any, trigger: any): boolean {
		if (!trigger.memoryType) {
			return true;
		}
		
		if (event.type !== trigger.memoryType) {
			return false;
		}
		
		if (trigger.memoryCategory && event.category !== trigger.memoryCategory) {
			return false;
		}
		
		if (trigger.memoryTags && trigger.memoryTags.length > 0) {
			if (!event.tags || !Array.isArray(event.tags)) {
				return false;
			}
			
			const hasMatchingTag = trigger.memoryTags.some((tag: string) =>
				event.tags.includes(tag)
			);
			
			if (!hasMatchingTag) {
				return false;
			}
		}
		
		return true;
	}
	
	/**
	 * Check if workflow event matches trigger
	 */
	private workflowEventMatchesTrigger(event: any, trigger: any): boolean {
		if (!trigger.workflowType) {
			return true;
		}
		
		if (event.type !== trigger.workflowType) {
			return false;
		}
		
		if (trigger.workflowId && event.workflowId !== trigger.workflowId) {
			return false;
		}
		
		if (trigger.workflowStatus && event.status !== trigger.workflowStatus) {
			return false;
		}
		
		return true;
	}
	
	/**
	 * Persist agent states
	 */
	private async persistAgentStates(): Promise<void> {
		if (!this.config.persistAgentState) {
			return;
		}
		
		try {
			const states: Record<string, AgentState> = {};
			
			for (const [agentId, agent] of this.agents) {
				states[agentId] = agent.state;
			}
			
			// In a real implementation, this would save to AppFlowy/storage
			// For now, we'll just log it
			if (this.config.logAgentActivity) {
				console.log('Persisting agent states:', Object.keys(states).length);
			}
			
			// TODO: Implement actual persistence to AppFlowy/storage
			// await appFlowyStorage.set('agent-states', states);
		} catch (error) {
			console.error('Failed to persist agent states:', error);
		}
	}
	
	/**
	 * Restore agent states
	 */
	private async restoreAgentStates(): Promise<void> {
		if (!this.config.restoreAgentState) {
			return;
		}
		
		try {
			// TODO: Implement actual restoration from AppFlowy/storage
			// const states = await appFlowyStorage.get('agent-states');
			const states: Record<string, AgentState> = {};
			
			if (states) {
				for (const [agentId, state] of Object.entries(states)) {
					const agent = this.agents.get(agentId);
					if (agent) {
						agent.updateState(state);
					}
				}
				
				if (this.config.logAgentActivity) {
					console.log('Restored agent states:', Object.keys(states).length);
				}
			}
		} catch (error) {
			console.error('Failed to restore agent states:', error);
		}
	}
	
	/**
	 * Auto-start enabled agents
	 */
	private async autoStartEnabledAgents(): Promise<void> {
		for (const [agentId, agent] of this.agents) {
			if (agent.config.enabled && agent.getStatus() === 'idle') {
				await this.startAgent(agentId);
			}
		}
	}
	
	/**
	 * Clean up resources
	 */
	async cleanup(): Promise<void> {
		// Stop all agents
		for (const [agentId, agent] of this.agents) {
			if (agent.getStatus() === 'running' || agent.getStatus() === 'starting') {
				await agent.stop();
			}
		}
		
		// Clear event listeners
		this.eventListeners = [];
		
		// Clear execution queue
		this.executionQueue = [];
		
		this.isInitialized = false;
		
		console.log('Agent Engine cleaned up');
	}
}
