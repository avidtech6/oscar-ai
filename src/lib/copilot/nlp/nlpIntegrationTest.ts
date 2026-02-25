/**
 * NLP Integration Test
 * 
 * Comprehensive integration tests for the Natural Language Command Layer.
 * Tests the complete NLP pipeline from command parsing to execution.
 */

import { NlpEngine } from './nlpEngine';
import { EntityExtractor } from './entityExtractor';
import { IntentRouter } from './intentRouter';
import { CommandRegistry } from './commandRegistry';
import { ClarificationEngine } from './clarificationEngine';
import { NlpOrchestratorIntegration } from './nlpOrchestratorIntegration';
import { CommandPaletteHooks } from './uiHooks';

import type { 
	IntentType,
	EntityType,
	ParsedCommand,
	CommandContext,
	CommandResult,
	CommandRegistration
} from './nlpTypes';

// Mock orchestrator for testing
const mockOrchestrator = {
	getState: () => ({
		context: { ui: { currentScreen: 'dashboard' } },
		hints: [],
		deliverabilityScore: { riskLevel: 'low', score: 85 },
		documents: [],
		availableActions: [],
		lastResults: [],
		status: 'idle',
		lastUpdated: new Date(),
		queue: [],
		activeWorkflows: [],
		suggestedWorkflows: [],
		workflowEngineStatus: 'idle',
		memorySystemStatus: 'idle',
		recentMemories: [],
		memoryStats: {
			totalMemories: 0,
			byCategory: {} as any,
			bySource: {} as any,
			lastUpdated: new Date()
		},
		agentSystemStatus: 'idle',
		activeAgents: [],
		agentStats: {
			totalAgents: 0,
			activeAgents: 0,
			pausedAgents: 0,
			errorAgents: 0,
			totalExecutions: 0,
			successfulExecutions: 0,
			failedExecutions: 0,
			lastUpdated: new Date()
		}
	}),
	startWorkflow: async (workflowId: string) => ({ id: workflowId, name: workflowId }),
	executeRecommendedAction: async (actionId: string) => ({ success: true, actionId }),
	onEvent: (listener: any) => { /* mock */ }
};

/**
 * Test suite for NLP Engine
 */
async function testNlpEngine(): Promise<boolean> {
	console.log('Testing NLP Engine...');
	
	try {
		const nlpEngine = new NlpEngine();
		await nlpEngine.initialize();
		
		// Test basic command parsing
		const testContext: CommandContext = {
			user: { id: 'test-user', name: 'Test User' },
			workspace: { id: 'test-workspace', name: 'Test Workspace', type: 'communication' }
		};
		
		const parsedCommand = await nlpEngine.parseCommand('Check email deliverability', testContext);
		
		if (!parsedCommand || !parsedCommand.intent) {
			console.error('❌ NLP Engine failed to parse command');
			return false;
		}
		
		if (parsedCommand.intent.type !== 'show_recommendations') {
			console.error(`❌ NLP Engine detected wrong intent: ${parsedCommand.intent.type}`);
			return false;
		}
		
		console.log('✅ NLP Engine test passed');
		return true;
	} catch (error) {
		console.error('❌ NLP Engine test failed:', error);
		return false;
	}
}

/**
 * Test suite for Entity Extractor
 */
async function testEntityExtractor(): Promise<boolean> {
	console.log('Testing Entity Extractor...');
	
	try {
		const entityExtractor = new EntityExtractor();
		
		// Test entity extraction
		const text = 'Fix deliverability for example.com';
		const entities = await entityExtractor.extractEntities(text);
		
		if (!Array.isArray(entities)) {
			console.error('❌ Entity Extractor returned non-array result');
			return false;
		}
		
		// Check if domain entity was extracted
		const domainEntity = entities.find(e => e.type === 'domain');
		if (!domainEntity || domainEntity.value !== 'example.com') {
			console.error('❌ Entity Extractor failed to extract domain entity');
			return false;
		}
		
		console.log('✅ Entity Extractor test passed');
		return true;
	} catch (error) {
		console.error('❌ Entity Extractor test failed:', error);
		return false;
	}
}

/**
 * Test suite for Intent Router
 */
async function testIntentRouter(): Promise<boolean> {
	console.log('Testing Intent Router...');
	
	try {
		const intentRouter = new IntentRouter();
		await intentRouter.initialize();
		
		// Create a test parsed command
		const parsedCommand: ParsedCommand = {
			id: 'test-command',
			intent: {
				type: 'fix_deliverability',
				confidence: 0.9,
				originalText: 'Fix deliverability issues',
				entities: [],
				parameters: {},
				needsClarification: false
			},
			executionParams: {},
			timestamp: new Date()
		};
		
		// Test intent routing
		const result = await intentRouter.routeIntent(parsedCommand);
		
		if (!result) {
			console.error('❌ Intent Router returned null result');
			return false;
		}
		
		console.log('✅ Intent Router test passed');
		return true;
	} catch (error) {
		console.error('❌ Intent Router test failed:', error);
		return false;
	}
}

/**
 * Test suite for Command Registry
 */
async function testCommandRegistry(): Promise<boolean> {
	console.log('Testing Command Registry...');
	
	try {
		const commandRegistry = new CommandRegistry();
		await commandRegistry.initialize();
		
		// Test command registration
		const testCommand: CommandRegistration = {
			id: 'test_command',
			name: 'Test Command',
			description: 'A test command for integration testing',
			intentType: 'ask_question',
			handler: async (parsedCommand, context) => ({
				success: true,
				data: { message: 'Test command executed' },
				executionTimeMs: 100
			}),
			enabled: true,
			priority: 50
		};
		
		commandRegistry.registerCommand(testCommand);
		
		// Test command retrieval
		const commands = commandRegistry.getCommandSuggestions({
			user: { id: 'test', name: 'Test' }
		});
		
		if (!Array.isArray(commands)) {
			console.error('❌ Command Registry returned non-array suggestions');
			return false;
		}
		
		// Check if our test command is in the suggestions
		const testCommandFound = commands.some(cmd => cmd.id === 'test_command');
		if (!testCommandFound) {
			console.error('❌ Command Registry failed to include registered command');
			return false;
		}
		
		console.log('✅ Command Registry test passed');
		return true;
	} catch (error) {
		console.error('❌ Command Registry test failed:', error);
		return false;
	}
}

/**
 * Test suite for Clarification Engine
 */
async function testClarificationEngine(): Promise<boolean> {
	console.log('Testing Clarification Engine...');
	
	try {
		const clarificationEngine = new ClarificationEngine();
		await clarificationEngine.initialize();
		
		// Create a test intent that needs clarification
		const testIntent = {
			type: 'summarise_client' as IntentType,
			confidence: 0.8,
			originalText: 'Summarise client activity',
			entities: [], // Missing client_name entity
			parameters: {},
			needsClarification: false
		};
		
		const testContext: CommandContext = {
			user: { id: 'test', name: 'Test' }
		};
		
		// Test clarification analysis
		const clarificationRequest = clarificationEngine.analyzeForClarification(testIntent, testContext);
		
		if (!clarificationRequest) {
			console.error('❌ Clarification Engine failed to detect missing entity');
			return false;
		}
		
		if (!clarificationRequest.questions || clarificationRequest.questions.length === 0) {
			console.error('❌ Clarification Engine failed to generate questions');
			return false;
		}
		
		console.log('✅ Clarification Engine test passed');
		return true;
	} catch (error) {
		console.error('❌ Clarification Engine test failed:', error);
		return false;
	}
}

/**
 * Test suite for NLP Orchestrator Integration
 */
async function testNlpOrchestratorIntegration(): Promise<boolean> {
	console.log('Testing NLP Orchestrator Integration...');
	
	try {
		const nlpIntegration = new NlpOrchestratorIntegration(mockOrchestrator as any);
		await nlpIntegration.initialize();
		
		// Test command processing
		const result = await nlpIntegration.processCommand('Check system status');
		
		if (!result) {
			console.error('❌ NLP Orchestrator Integration returned null result');
			return false;
		}
		
		// Test command suggestions
		const suggestions = await nlpIntegration.getSuggestedCommands();
		
		if (!Array.isArray(suggestions)) {
			console.error('❌ NLP Orchestrator Integration returned non-array suggestions');
			return false;
		}
		
		console.log('✅ NLP Orchestrator Integration test passed');
		return true;
	} catch (error) {
		console.error('❌ NLP Orchestrator Integration test failed:', error);
		return false;
	}
}

/**
 * Test suite for Command Palette UI Hooks
 */
async function testCommandPaletteHooks(): Promise<boolean> {
	console.log('Testing Command Palette UI Hooks...');
	
	try {
		// Create NLP integration first
		const nlpIntegration = new NlpOrchestratorIntegration(mockOrchestrator as any);
		await nlpIntegration.initialize();
		
		// Create command palette hooks
		const commandPalette = new CommandPaletteHooks(nlpIntegration);
		await commandPalette.initialize();
		
		// Test state management
		const initialState = commandPalette.getState();
		
		if (initialState.isVisible !== false) {
			console.error('❌ Command Palette should start hidden');
			return false;
		}
		
		// Test showing the palette
		commandPalette.show();
		const shownState = commandPalette.getState();
		
		if (shownState.isVisible !== true) {
			console.error('❌ Command Palette failed to show');
			return false;
		}
		
		// Test search query update
		await commandPalette.updateSearchQuery('check');
		const searchState = commandPalette.getState();
		
		if (searchState.searchQuery !== 'check') {
			console.error('❌ Command Palette failed to update search query');
			return false;
		}
		
		// Test hiding the palette
		commandPalette.hide();
		const hiddenState = commandPalette.getState();
		
		if (hiddenState.isVisible !== false) {
			console.error('❌ Command Palette failed to hide');
			return false;
		}
		
		console.log('✅ Command Palette UI Hooks test passed');
		return true;
	} catch (error) {
		console.error('❌ Command Palette UI Hooks test failed:', error);
		return false;
	}
}

/**
 * Test complete NLP pipeline
 */
async function testCompletePipeline(): Promise<boolean> {
	console.log('Testing Complete NLP Pipeline...');
	
	try {
		// Create all components
		const nlpEngine = new NlpEngine();
		const entityExtractor = new EntityExtractor();
		const intentRouter = new IntentRouter();
		const commandRegistry = new CommandRegistry();
		const clarificationEngine = new ClarificationEngine();
		
		// Initialize components
		await Promise.all([
			nlpEngine.initialize(),
			intentRouter.initialize(),
			commandRegistry.initialize(),
			clarificationEngine.initialize()
		]);
		
		// Test a complete command flow
		const testCommand = 'Fix deliverability for gmail.com';
		const testContext: CommandContext = {
			user: { id: 'test-user', name: 'Test User' },
			workspace: { id: 'test-workspace', name: 'Test Workspace', type: 'communication' }
		};
		
		// Step 1: Parse command
		const parsedCommand = await nlpEngine.parseCommand(testCommand, testContext);
		
		if (!parsedCommand) {
			console.error('❌ Pipeline failed to parse command');
			return false;
		}
		
		// Step 2: Check for clarification
		const clarificationRequest = clarificationEngine.analyzeForClarification(parsedCommand.intent, testContext);
		
		if (clarificationRequest) {
			console.log('⚠️  Pipeline would ask for clarification:', clarificationRequest.questions[0]);
			// In a real test, we would simulate clarification response
		}
		
		// Step 3: Route intent
		const routingResult = await intentRouter.routeIntent(parsedCommand);
		
		if (!routingResult) {
			console.error('❌ Pipeline failed to route intent');
			return false;
		}
		
		console.log('✅ Complete NLP Pipeline test passed');
		return true;
	} catch (error) {
		console.error('❌ Complete NLP Pipeline test failed:', error);
		return false;
	}
}

/**
 * Run all integration tests
 */
export async function runNlpIntegrationTests(): Promise<{
	success: boolean;
	results: Record<string, boolean>;
	summary: string;
}> {
	console.log('🚀 Starting NLP Integration Tests...\n');
	
	const testResults: Record<string, boolean> = {};
	
	// Run individual component tests
	testResults.nlpEngine = await testNlpEngine();
	testResults.entityExtractor = await testEntityExtractor();
	testResults.intentRouter = await testIntentRouter();
	testResults.commandRegistry = await testCommandRegistry();
	testResults.clarificationEngine = await testClarificationEngine();
	testResults.nlpOrchestratorIntegration = await testNlpOrchestratorIntegration();
	testResults.commandPaletteHooks = await testCommandPaletteHooks();
	testResults.completePipeline = await testCompletePipeline();
	
	// Calculate overall success
	const allPassed = Object.values(testResults).every(result => result === true);
	const passedCount = Object.values(testResults).filter(result => result === true).length;
	const totalCount = Object.keys(testResults).length;
	
	console.log('\n📊 Test Results:');
	console.log('================');
	
	for (const [testName, result] of Object.entries(testResults)) {
		console.log(`${result ? '✅' : '❌'} ${testName}: ${result ? 'PASSED' : 'FAILED'}`);
	}
	
	console.log('\n📈 Summary:');
	console.log('===========');
	console.log(`Total Tests: ${totalCount}`);
	console.log(`Passed: ${passedCount}`);
	console.log(`Failed: ${totalCount - passedCount}`);
	console.log(`Success Rate: ${Math.round((passedCount / totalCount) * 100)}%`);
	
	if (allPassed) {
		console.log('\n🎉 All NLP integration tests passed!');
	} else {
		console.log('\n⚠️  Some NLP integration tests failed. Check the logs above for details.');
	}
	
	return {
		success: allPassed,
		results: testResults,
		summary: `Passed ${passedCount}/${totalCount} tests`
	};
}

/**
 * Export test utilities for external use
 */
export const nlpTestUtils = {
	testNlpEngine,
	testEntityExtractor,
	testIntentRouter,
	testCommandRegistry,
	testClarificationEngine,
	testNlpOrchestratorIntegration,
	testCommandPaletteHooks,
	testCompletePipeline,
	runNlpIntegrationTests
};

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
	runNlpIntegrationTests().then(result => {
		if (result.success) {
			process.exit(0);
		} else {
			process.exit(1);
		}
	}).catch(error => {
		console.error('Test runner error:', error);
		process.exit(1);
	});
}