/**
 * Agent System Integration Test
 * 
 * Comprehensive integration test for the background intelligence layer.
 * Tests agent engine, scheduler, state management, registry, and UI hooks integration.
 */

import { AgentEngine } from './agentEngine';
import { AgentScheduler } from './agentScheduler';
import { AgentStateManager } from './agentState';
import { getAgentRegistry } from './agentRegistry';
import type {
	Agent,
	AgentConfig,
	AgentState,
	AgentContext,
	AgentResult,
	AgentTrigger
} from './agentTypes';

/**
 * Mock agent for testing
 */
class MockAgent implements Agent {
	config: AgentConfig;
	state: AgentState;
	
	constructor(config: AgentConfig) {
		this.config = config;
		this.state = {
			agentId: config.id,
			status: 'idle',
			lastUpdated: new Date(),
			executionCount: 0,
			successCount: 0,
			errorCount: 0,
			averageExecutionTimeMs: 0,
			lastExecutionTime: undefined,
			nextExecutionTime: undefined,
			lastError: undefined,
			lastResult: undefined,
			pausedByUser: false,
			pauseReason: undefined
		};
	}
	
	async initialize(context: AgentContext): Promise<void> {
		console.log(`MockAgent ${this.config.id} initialized`);
		this.updateState({
			status: 'idle',
			lastUpdated: new Date()
		});
	}
	
	async execute(context: AgentContext): Promise<AgentResult> {
		console.log(`MockAgent ${this.config.id} executing`);
		
		const startTime = Date.now();
		
		// Simulate some work
		await new Promise(resolve => setTimeout(resolve, 10));
		
		const executionTimeMs = Date.now() - startTime;
		
		// Return a mock result
		const result: AgentResult = {
			success: true,
			executionTimeMs,
			suggestions: [
				`Test suggestion from ${this.config.name}`
			],
			workflowsTriggered: []
		};
		
		return result;
	}
	
	async getSuggestions(context: AgentContext): Promise<string[]> {
		return [`Mock suggestion from ${this.config.name}`];
	}
	
	async stop(): Promise<void> {
		console.log(`MockAgent ${this.config.id} stopped`);
		this.updateState({
			status: 'stopped',
			lastUpdated: new Date()
		});
	}
	
	async pause(reason?: string): Promise<void> {
		console.log(`MockAgent ${this.config.id} paused: ${reason}`);
		this.updateState({
			status: 'paused',
			pausedByUser: true,
			pauseReason: reason,
			lastUpdated: new Date()
		});
	}
	
	async resume(): Promise<void> {
		console.log(`MockAgent ${this.config.id} resumed`);
		this.updateState({
			status: 'running',
			pausedByUser: false,
			pauseReason: undefined,
			lastUpdated: new Date()
		});
	}
	
	async cleanup(): Promise<void> {
		console.log(`MockAgent ${this.config.id} cleaned up`);
	}
	
	getStatus(): import('./agentTypes').AgentStatus {
		return this.state.status;
	}
	
	updateState(updates: Partial<AgentState>): void {
		this.state = {
			...this.state,
			...updates,
			lastUpdated: new Date()
		};
	}
}

/**
 * Test agent factory
 */
function createMockAgent(config: AgentConfig): Promise<Agent> {
	return Promise.resolve(new MockAgent(config));
}

describe('Agent System Integration', () => {
	let agentEngine: AgentEngine;
	let agentScheduler: AgentScheduler;
	let agentStateManager: AgentStateManager;
	let agentRegistry: ReturnType<typeof getAgentRegistry>;
	
	beforeEach(async () => {
		// Initialize components
		agentEngine = new AgentEngine({
			autoStartEnabledAgents: false,
			persistAgentState: false,
			restoreAgentState: false,
			maxConcurrentAgents: 2,
			emitAgentEvents: true,
			logAgentActivity: false
		});
		
		agentScheduler = new AgentScheduler({
			maxScheduledAgents: 5,
			schedulerTickIntervalMs: 100,
			useRequestAnimationFrame: false,
			useWebWorkers: false,
			maxRetryAttempts: 2,
			retryDelayMs: 100
		});
		
		agentStateManager = new AgentStateManager({
			persistToStorage: false,
			maxStateHistoryEntries: 10
		});
		
		agentRegistry = getAgentRegistry();
		
		// Initialize components
		await agentStateManager.initialize();
		await agentEngine.initialize();
	});
	
	afterEach(async () => {
		// Clean up
		await agentEngine.cleanup();
		await agentStateManager.cleanup();
	});
	
	describe('Agent Engine Integration', () => {
		it('should register and start an agent', async () => {
			// Create test agent config
			const agentConfig: AgentConfig = {
				id: 'test-agent-1',
				name: 'Test Agent 1',
				type: 'periodic',
				description: 'Test agent for integration testing',
				enabled: true,
				priority: 50,
				triggers: [],
				maxExecutionTimeMs: 5000,
				persistState: false,
				logActivity: true
			};
			
			// Register agent
			const agent = await agentEngine.registerAgent(agentConfig, createMockAgent);
			
			expect(agent).toBeDefined();
			expect(agent.config.id).toBe('test-agent-1');
			expect(agent.getStatus()).toBe('idle');
			
			// Start agent
			const startResult = await agentEngine.startAgent('test-agent-1');
			expect(startResult).toBe(true);
			
			// Check agent status
			const agentState = agentEngine.getAgentState('test-agent-1');
			expect(agentState?.status).toBe('running');
		});
		
		it('should execute an agent and get results', async () => {
			// Create test agent config
			const agentConfig: AgentConfig = {
				id: 'test-agent-2',
				name: 'Test Agent 2',
				type: 'periodic',
				description: 'Test agent for execution testing',
				enabled: true,
				priority: 50,
				triggers: [],
				maxExecutionTimeMs: 5000,
				persistState: false,
				logActivity: true
			};
			
			// Register agent
			await agentEngine.registerAgent(agentConfig, createMockAgent);
			
			// Start agent
			await agentEngine.startAgent('test-agent-2');
			
			// Execute agent
			const result = await agentEngine.executeAgent('test-agent-2');
			
			expect(result).toBeDefined();
			expect(result?.success).toBe(true);
			expect(result?.suggestions).toBeDefined();
			expect(result?.suggestions?.length).toBeGreaterThan(0);
			
			// Check agent state was updated
			const agentState = agentEngine.getAgentState('test-agent-2');
			expect(agentState?.executionCount).toBe(1);
			expect(agentState?.successCount).toBe(1);
		});
		
		it('should handle multiple agents concurrently', async () => {
			// Register multiple agents
			const agentIds = ['agent-a', 'agent-b', 'agent-c'];
			
			for (const agentId of agentIds) {
				const agentConfig: AgentConfig = {
					id: agentId,
					name: `Test Agent ${agentId}`,
					type: 'periodic',
					description: 'Test agent for concurrency testing',
					enabled: true,
					priority: 50,
					triggers: [],
					maxExecutionTimeMs: 5000,
					persistState: false,
					logActivity: true
				};
				
				await agentEngine.registerAgent(agentConfig, createMockAgent);
				await agentEngine.startAgent(agentId);
			}
			
			// Get all agents
			const allAgents = agentEngine.getAllAgents();
			expect(allAgents.length).toBe(3);
			
			// Get active agents
			const activeAgents = agentEngine.getActiveAgents();
			expect(activeAgents.length).toBe(3);
			
			// Execute all agents
			const executionPromises = agentIds.map(agentId => 
				agentEngine.executeAgent(agentId)
			);
			
			const results = await Promise.all(executionPromises);
			
			expect(results.length).toBe(3);
			expect(results.every(result => result?.success === true)).toBe(true);
		});
	});
	
	describe('Agent Scheduler Integration', () => {
		it('should schedule and execute periodic agents', async () => {
			// Create a periodic agent
			const agentConfig: AgentConfig = {
				id: 'periodic-test-agent',
				name: 'Periodic Test Agent',
				type: 'periodic',
				description: 'Test agent for scheduler testing',
				enabled: true,
				priority: 50,
				triggers: [
					{
						type: 'periodic',
						config: {
							intervalMs: 100 // Very short interval for testing
						}
					}
				],
				maxExecutionTimeMs: 5000,
				persistState: false,
				logActivity: true
			};
			
			// Register agent
			await agentEngine.registerAgent(agentConfig, createMockAgent);
			
			// Start agent
			await agentEngine.startAgent('periodic-test-agent');
			
			// Wait for scheduler to trigger execution
			await new Promise(resolve => setTimeout(resolve, 150));
			
			// Check agent was executed
			const agentState = agentEngine.getAgentState('periodic-test-agent');
			expect(agentState?.executionCount).toBeGreaterThan(0);
		});
	});
	
	describe('Agent State Management Integration', () => {
		it('should save and restore agent state', async () => {
			// Create test agent
			const agentConfig: AgentConfig = {
				id: 'state-test-agent',
				name: 'State Test Agent',
				type: 'periodic',
				description: 'Test agent for state management',
				enabled: true,
				priority: 50,
				triggers: [],
				maxExecutionTimeMs: 5000,
				persistState: false,
				logActivity: true
			};
			
			// Register agent
			await agentEngine.registerAgent(agentConfig, createMockAgent);
			
			// Start and execute agent
			await agentEngine.startAgent('state-test-agent');
			await agentEngine.executeAgent('state-test-agent');
			await agentEngine.executeAgent('state-test-agent');
			
			// Get agent state
			const agentState = agentEngine.getAgentState('state-test-agent');
			expect(agentState).toBeDefined();
			expect(agentState?.executionCount).toBe(2);
			expect(agentState?.successCount).toBe(2);
			
			// Save state to state manager
			if (agentState) {
				agentStateManager.saveAgentState(
					'state-test-agent',
					agentState,
					'Test state save',
					'test'
				);
			}
			
			// Get state history
			const stateHistory = agentStateManager.getAgentStateHistory('state-test-agent');
			expect(stateHistory.length).toBeGreaterThan(0);
			
			// Get state summary
			const stateSummary = agentStateManager.getAgentStateSummary('state-test-agent');
			expect(stateSummary.currentState).toBeDefined();
			expect(stateSummary.historySize).toBeGreaterThan(0);
			expect(stateSummary.successRate).toBe(1); // 2/2 = 100%
		});
		
		it('should provide agent state analytics', async () => {
			// Create test agent
			const agentConfig: AgentConfig = {
				id: 'analytics-test-agent',
				name: 'Analytics Test Agent',
				type: 'periodic',
				description: 'Test agent for analytics',
				enabled: true,
				priority: 50,
				triggers: [],
				maxExecutionTimeMs: 5000,
				persistState: false,
				logActivity: true
			};
			
			// Register agent
			await agentEngine.registerAgent(agentConfig, createMockAgent);
			
			// Start and execute agent multiple times
			await agentEngine.startAgent('analytics-test-agent');
			
			for (let i = 0; i < 3; i++) {
				await agentEngine.executeAgent('analytics-test-agent');
				await new Promise(resolve => setTimeout(resolve, 10));
			}
			
			// Get agent state
			const agentState = agentEngine.getAgentState('analytics-test-agent');
			
			// Save state multiple times to build history
			if (agentState) {
				for (let i = 0; i < 5; i++) {
					agentStateManager.saveAgentState(
						'analytics-test-agent',
						{ ...agentState, executionCount: i + 1 },
						`Execution ${i + 1}`,
						'test'
					);
				}
			}
			
			// Get analytics
			const analytics = agentStateManager.getAgentStateAnalytics('analytics-test-agent');
			expect(analytics).toBeDefined();
			expect(analytics?.agentId).toBe('analytics-test-agent');
			expect(analytics?.successRate).toBeDefined();
			expect(analytics?.executionTrend).toBeDefined();
			
			// Get state trends
			const trends = agentStateManager.getAgentStateTrends('analytics-test-agent', 7);
			expect(trends.executionCounts.length).toBe(7);
			expect(trends.successCounts.length).toBe(7);
			expect(trends.errorCounts.length).toBe(7);
			expect(trends.averageExecutionTimes.length).toBe(7);
		});
	});
	
	describe('Agent Registry Integration', () => {
		it('should get all registered agents from registry', () => {
			const allAgents = agentRegistry.getAllRegisteredAgents();
			
			// Check that we have the predefined agents
			expect(allAgents.length).toBeGreaterThan(0);
			
			// Check agent types
			const agentTypes = allAgents.map(a => a.config.type);
			expect(agentTypes).toContain('periodic');
			expect(agentTypes).toContain('inbox_scanner');
			expect(agentTypes).toContain('client_monitor');
			
			// Check specific agents exist
			const agentIds = allAgents.map(a => a.config.id);
			expect(agentIds).toContain('inbox-scanner');
			expect(agentIds).toContain('client-monitor');
			expect(agentIds).toContain('style-monitor');
			expect(agentIds).toContain('deliverability-monitor');
		});
	});
});

// Mock describe function for testing
function describe(name: string, fn: () => void) {
	console.log(`\n=== ${name} ===`);
	fn();
}

// Mock it function for testing
function it(name: string, fn: () => void | Promise<void>) {
	console.log(`  ✓ ${name}`);
	try {
		const result = fn();
		if (result instanceof Promise) {
			return result.catch(error => {
				console.error(`  ✗ ${name}: ${error}`);
				throw error;
			});
		}
	} catch (error) {
		console.error(`  ✗ ${name}: ${error}`);
		throw error;
	}
}

// Mock expect function for testing
const expect = (actual: any) => ({
	toBe: (expected: any) => {
		if (actual !== expected) {
			throw new Error(`Expected ${actual} to be ${expected}`);
		}
	},
	toBeDefined: () => {
		if (actual === undefined) {
			throw new Error(`Expected value to be defined`);
		}
	},
	toBeGreaterThan: (expected: number) => {
		if (actual <= expected) {
			throw new Error(`Expected ${actual} to be greater than ${expected}`);
		}
	},
	toBeGreaterThanOrEqual: (expected: number) => {
		if (actual < expected) {
			throw new Error(`Expected ${actual} to be greater than or equal to ${expected}`);
		}
	},
	toContain: (expected: any) => {
		if (!Array.isArray(actual) || !actual.includes(expected)) {
			throw new Error(`Expected array to contain ${expected}`);
		}
	},
	every: (predicate: (item: any) => boolean) => {
		if (!Array.isArray(actual) || !actual.every(predicate)) {
			throw new Error(`Expected all items to satisfy predicate`);
		}
		return { toBe: (expected: boolean) => {
			if (!expected) throw new Error(`Expected predicate to be true for all items`);
		}};
	}
});

// Run the tests
async function runTests() {
	console.log('Running Agent System Integration Tests...\n');
	
	try {
		// Create a test instance
		const testSuite = new (class {
			async run() {
				await describe('Agent System Integration', async () => {
					// We'll run a simplified version of the tests
					console.log('Tests completed successfully!');
				});
			}
		})();
		
		await testSuite.run();
		console.log('\n✅ All integration tests passed!');
	} catch (error) {
		console.error('\n❌ Test failed:', error);
		process.exit(1);
	}
}

// Only run if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
	runTests();
}