/**
 * NLP Orchestrator Integration
 * 
 * Integrates the Natural Language Command Layer with the Copilot Orchestrator.
 * Provides methods for the orchestrator to use NLP capabilities and for NLP
 * to access orchestrator state and services.
 */

import type { CopilotOrchestrator, OrchestratorState, OrchestratorEvent } from '../orchestrator/orchestrator';
import type { CopilotContext } from '../context/contextTypes';
import type { 
	IntentType,
	EntityType,
	ExtractedEntity,
	ParsedIntent,
	ParsedCommand,
	CommandContext,
	CommandResult,
	CommandHandler,
	CommandRegistration
} from './nlpTypes';

import { NlpEngine } from './nlpEngine';
import { EntityExtractor } from './entityExtractor';
import { IntentRouter } from './intentRouter';
import { CommandRegistry } from './commandRegistry';
import { ClarificationEngine } from './clarificationEngine';

/**
 * NLP Orchestrator Integration Configuration
 */
export interface NlpOrchestratorIntegrationConfig {
	/** Whether to enable NLP processing */
	enableNlpProcessing: boolean;
	
	/** Whether to auto-register orchestrator commands */
	autoRegisterOrchestratorCommands: boolean;
	
	/** Whether to auto-trigger workflows from NLP commands */
	autoTriggerWorkflowsFromCommands: boolean;
	
	/** Whether to auto-execute low-risk commands */
	autoExecuteLowRiskCommands: boolean;
	
	/** Minimum confidence for auto-execution (0-1) */
	minAutoExecutionConfidence: number;
	
	/** Whether to use orchestrator context for NLP */
	useOrchestratorContext: boolean;
	
	/** Whether to log NLP processing */
	logNlpProcessing: boolean;
	
	/** Maximum concurrent NLP operations */
	maxConcurrentNlpOperations: number;
}

/**
 * NLP Orchestrator Integration
 */
export class NlpOrchestratorIntegration {
	private orchestrator: CopilotOrchestrator;
	private nlpEngine: NlpEngine;
	private entityExtractor: EntityExtractor;
	private intentRouter: IntentRouter;
	private commandRegistry: CommandRegistry;
	private clarificationEngine: ClarificationEngine;
	
	private config: NlpOrchestratorIntegrationConfig;
	private isInitialized = false;
	private nlpQueue: Array<{
		command: string;
		context: CommandContext;
		resolve: (result: CommandResult) => void;
		reject: (error: Error) => void;
	}> = [];
	private processingQueue = false;
	
	constructor(
		orchestrator: CopilotOrchestrator,
		config: Partial<NlpOrchestratorIntegrationConfig> = {}
	) {
		this.orchestrator = orchestrator;
		
		this.config = {
			enableNlpProcessing: config.enableNlpProcessing ?? true,
			autoRegisterOrchestratorCommands: config.autoRegisterOrchestratorCommands ?? true,
			autoTriggerWorkflowsFromCommands: config.autoTriggerWorkflowsFromCommands ?? true,
			autoExecuteLowRiskCommands: config.autoExecuteLowRiskCommands ?? false,
			minAutoExecutionConfidence: config.minAutoExecutionConfidence ?? 0.8,
			useOrchestratorContext: config.useOrchestratorContext ?? true,
			logNlpProcessing: config.logNlpProcessing ?? true,
			maxConcurrentNlpOperations: config.maxConcurrentNlpOperations ?? 3
		};
		
		// Initialize NLP engines
		this.nlpEngine = new NlpEngine();
		this.entityExtractor = new EntityExtractor();
		this.intentRouter = new IntentRouter();
		this.commandRegistry = new CommandRegistry();
		this.clarificationEngine = new ClarificationEngine();
	}
	
	/**
	 * Initialize the integration
	 */
	async initialize(): Promise<void> {
		if (this.isInitialized) {
			return;
		}
		
		console.log('Initializing NLP Orchestrator Integration...');
		
		// Initialize NLP engines
		await this.nlpEngine.initialize();
		// EntityExtractor doesn't have initialize method, so we skip it
		await this.intentRouter.initialize();
		await this.commandRegistry.initialize();
		await this.clarificationEngine.initialize();
		
		// Set orchestrator on NLP engine
		this.nlpEngine.setOrchestrator(this.orchestrator);
		
		// Register orchestrator commands if enabled
		if (this.config.autoRegisterOrchestratorCommands) {
			await this.registerOrchestratorCommands();
		}
		
		// Set up orchestrator event listeners
		this.setupOrchestratorEventListeners();
		
		// Start queue processing
		this.startQueueProcessing();
		
		this.isInitialized = true;
		console.log('NLP Orchestrator Integration initialized');
	}
	
	/**
	 * Process natural language command
	 */
	async processCommand(
		command: string,
		userContext?: Partial<CommandContext>
	): Promise<CommandResult> {
		if (!this.isInitialized) {
			await this.initialize();
		}
		
		if (!this.config.enableNlpProcessing) {
			return {
				success: false,
				error: 'NLP processing is disabled',
				executionTimeMs: 0
			};
		}
		
		// Create command context
		const context = await this.buildCommandContext(userContext);
		
		// Log processing if enabled
		if (this.config.logNlpProcessing) {
			console.log(`Processing NLP command: "${command}"`);
		}
		
		// Parse the command
		const parsedCommand = await this.nlpEngine.parseCommand(command, context);
		
		// Check if clarification is needed
		const clarificationRequest = this.clarificationEngine.analyzeForClarification(parsedCommand.intent, context);
		
		if (clarificationRequest) {
			return {
				success: false,
				error: 'Clarification needed',
				suggestions: clarificationRequest.questions,
				followUpQuestions: clarificationRequest.questions,
				executionTimeMs: 0
			};
		}
		
		// Route the intent
		const routingResult = await this.intentRouter.routeIntent(parsedCommand);
		
		// Add execution time
		routingResult.executionTimeMs = routingResult.executionTimeMs || 0;
		
		// Log result if enabled
		if (this.config.logNlpProcessing) {
			console.log(`NLP command result: ${routingResult.success ? 'success' : 'error'} in ${routingResult.executionTimeMs}ms`);
		}
		
		return routingResult;
	}
	
	/**
	 * Process command with clarification
	 */
	async processCommandWithClarification(
		originalCommand: string,
		clarificationResponses: string[],
		userContext?: Partial<CommandContext>
	): Promise<CommandResult> {
		if (!this.isInitialized) {
			await this.initialize();
		}
		
		// Create command context
		const context = await this.buildCommandContext(userContext);
		
		// Parse the original command
		const parsedCommand = await this.nlpEngine.parseCommand(originalCommand, context);
		
		// Process clarification responses
		let currentIntent = parsedCommand.intent;
		
		for (const response of clarificationResponses) {
			// Create a mock clarification request for processing
			const mockRequest = {
				id: `clarification_${Date.now()}`,
				originalCommand: parsedCommand,
				questions: [],
				missingEntities: [],
				ambiguousParameters: [],
				timestamp: new Date()
			};
			
			const clarificationResult = this.clarificationEngine.processClarificationResponse(
				mockRequest,
				response,
				context
			);
			
			currentIntent = clarificationResult.updatedIntent;
			
			// If clarification is complete, break
			if (clarificationResult.complete) {
				break;
			}
		}
		
		// Create updated parsed command with clarified intent
		const updatedParsedCommand: ParsedCommand = {
			...parsedCommand,
			intent: currentIntent
		};
		
		// Now execute the clarified command
		const routingResult = await this.intentRouter.routeIntent(updatedParsedCommand);
		
		// Add execution time
		routingResult.executionTimeMs = routingResult.executionTimeMs || 0;
		
		return routingResult;
	}
	
	/**
	 * Queue command for processing
	 */
	async queueCommand(
		command: string,
		userContext?: Partial<CommandContext>
	): Promise<CommandResult> {
		return new Promise((resolve, reject) => {
			this.buildCommandContext(userContext).then(context => {
				this.nlpQueue.push({
					command,
					context,
					resolve,
					reject
				});
				
				// Start processing if not already running
				if (!this.processingQueue) {
					this.processQueue();
				}
			}).catch(reject);
		});
	}
	
	/**
	 * Get suggested commands based on context
	 */
	async getSuggestedCommands(
		userContext?: Partial<CommandContext>
	): Promise<Array<{
		command: string;
		description: string;
		intentType: IntentType;
		confidence: number;
	}>> {
		if (!this.isInitialized) {
			await this.initialize();
		}
		
		const context = await this.buildCommandContext(userContext);
		const orchestratorState = this.orchestrator.getState();
		
		// Get suggested commands from command registry
		const registeredCommands = this.commandRegistry.getCommandSuggestions(context);
		
		// Convert to suggested commands format
		const suggestedCommands = registeredCommands.map(cmd => ({
			command: cmd.name,
			description: cmd.description,
			intentType: cmd.intentType,
			confidence: 0.7 // Default confidence for registered commands
		}));
		
		// Add context-based suggestions
		const contextSuggestions = this.generateContextSuggestions(orchestratorState, context);
		suggestedCommands.push(...contextSuggestions);
		
		// Sort by confidence
		suggestedCommands.sort((a, b) => b.confidence - a.confidence);
		
		// Limit to top 10
		return suggestedCommands.slice(0, 10);
	}
	
	/**
	 * Get NLP engine instance
	 */
	getNlpEngine(): NlpEngine {
		return this.nlpEngine;
	}
	
	/**
	 * Get entity extractor instance
	 */
	getEntityExtractor(): EntityExtractor {
		return this.entityExtractor;
	}
	
	/**
	 * Get intent router instance
	 */
	getIntentRouter(): IntentRouter {
		return this.intentRouter;
	}
	
	/**
	 * Get command registry instance
	 */
	getCommandRegistry(): CommandRegistry {
		return this.commandRegistry;
	}
	
	/**
	 * Get clarification engine instance
	 */
	getClarificationEngine(): ClarificationEngine {
		return this.clarificationEngine;
	}
	
	/**
	 * Register a custom command handler
	 */
	registerCommand(registration: CommandRegistration): void {
		// Convert CommandRegistration to CommandDefinition for the registry
		const commandDefinition = {
			...registration,
			metadata: {
				usageCount: 0,
				lastUsed: null,
				successRate: 1.0,
				averageExecutionTimeMs: 0
			}
		};
		this.commandRegistry.registerCommand(commandDefinition);
	}
	
	/**
	 * Remove a command
	 */
	removeCommand(commandId: string): void {
		this.commandRegistry.removeCommand(commandId);
	}
	
	/**
	 * Build command context from orchestrator state
	 */
	private async buildCommandContext(userContext?: Partial<CommandContext>): Promise<CommandContext> {
		const orchestratorState = this.orchestrator.getState();
		
		// Base context from orchestrator
		const baseContext: CommandContext = {
			user: userContext?.user || {
				id: 'anonymous',
				name: 'User'
			},
			workspace: userContext?.workspace || {
				id: 'default',
				name: 'Default Workspace',
				type: 'communication'
			},
			recentCommands: userContext?.recentCommands || [],
			memoryContext: {
				clientMemories: [],
				threadMemories: [],
				documentMemories: [],
				styleMemories: [],
				providerMemories: []
			},
			workflowContext: {
				activeWorkflows: orchestratorState.activeWorkflows,
				recentWorkflows: [],
				availableWorkflows: orchestratorState.suggestedWorkflows
			},
			agentContext: {
				activeAgents: orchestratorState.activeAgents,
				recentAgentResults: []
			},
			systemState: {
				deliverabilityStatus: orchestratorState.deliverabilityScore?.riskLevel || 'unknown',
				providerStatus: 'unknown',
				inboxStatus: 'unknown',
				documentStatus: 'unknown'
			},
			conversationHistory: userContext?.conversationHistory || []
		};
		
		// Merge with user context
		const mergedContext: CommandContext = {
			...baseContext,
			...userContext
		};
		
		return mergedContext;
	}
	
	/**
	 * Register orchestrator commands
	 */
	private async registerOrchestratorCommands(): Promise<void> {
		console.log('Registering orchestrator commands...');
		
		// Register workflow commands
		this.registerCommand({
			id: 'start_workflow',
			name: 'Start Workflow',
			description: 'Start a workflow by name',
			intentType: 'run_workflow',
			requiredEntities: ['workflow_name'],
			handler: async (parsedCommand, context) => {
				const workflowName = parsedCommand.intent.entities.find(e => e.type === 'workflow_name')?.value;
				if (!workflowName) {
					return {
						success: false,
						error: 'Workflow name not specified',
						executionTimeMs: 0
					};
				}
				
				try {
					const workflowInstance = await this.orchestrator.startWorkflow(workflowName);
					return {
						success: true,
						data: { workflowInstance },
						workflowsTriggered: [workflowName],
						executionTimeMs: 1000
					};
				} catch (error) {
					return {
						success: false,
						error: error instanceof Error ? error.message : 'Failed to start workflow',
						executionTimeMs: 0
					};
				}
			},
			enabled: true,
			priority: 80
		});
		
		// Register action commands
		this.registerCommand({
			id: 'execute_action',
			name: 'Execute Action',
			description: 'Execute an action by name',
			intentType: 'run_workflow',
			requiredEntities: ['workflow_name'],
			handler: async (parsedCommand, context) => {
				const actionName = parsedCommand.intent.entities.find(e => e.type === 'workflow_name')?.value;
				if (!actionName) {
					return {
						success: false,
						error: 'Action name not specified',
						executionTimeMs: 0
					};
				}
				
				try {
					const result = await this.orchestrator.executeRecommendedAction(actionName);
					return {
						success: true,
						data: { result },
						actionsTaken: [{
							action: actionName,
							target: 'system',
							result: 'success'
						}],
						executionTimeMs: 1000
					};
				} catch (error) {
					return {
						success: false,
						error: error instanceof Error ? error.message : 'Failed to execute action',
						executionTimeMs: 0
					};
				}
			},
			enabled: true,
			priority: 70
		});
		
		// Register status commands
		this.registerCommand({
			id: 'check_status',
			name: 'Check Status',
			description: 'Check system status',
			intentType: 'ask_question',
			handler: async (parsedCommand, context) => {
				const state = this.orchestrator.getState();
				return {
					success: true,
					data: {
						status: state.status,
						activeWorkflows: state.activeWorkflows.length,
						activeAgents: state.activeAgents.length,
						memoryCount: state.memoryStats.totalMemories,
						lastUpdated: state.lastUpdated
					},
					executionTimeMs: 0
				};
			},
			enabled: true,
			priority: 60
		});
		
		console.log('Registered orchestrator commands');
	}
	
	/**
	 * Set up orchestrator event listeners
	 */
	private setupOrchestratorEventListeners(): void {
		this.orchestrator.onEvent((event: OrchestratorEvent) => {
			// Handle orchestrator events that might affect NLP
			switch (event.type) {
				case 'context-updated':
					// Context updated, might affect command suggestions
					if (this.config.logNlpProcessing) {
						console.log('Orchestrator context updated, refreshing NLP context');
					}
					break;
					
				case 'workflow-started':
				case 'workflow-completed':
					// Workflow events might trigger follow-up commands
					if (this.config.logNlpProcessing) {
						console.log(`Orchestrator workflow event: ${event.type}`);
					}
					break;
					
				case 'action-executed':
					// Action executed, update command registry metadata
					if (this.config.logNlpProcessing) {
						console.log('Orchestrator action executed');
					}
					break;
					
				case 'action-suggested':
					// Action suggested, might be relevant for NLP commands
					if (this.config.logNlpProcessing) {
						console.log('Orchestrator action suggested');
					}
					break;
					
				case 'document-processed':
					// Document processed, update NLP context
					if (this.config.logNlpProcessing) {
						console.log('Orchestrator document processed');
					}
					break;
					
				case 'workflow-suggested':
					// Workflow suggested, update command suggestions
					if (this.config.logNlpProcessing) {
						console.log('Orchestrator workflow suggested');
					}
					break;
					
				default:
					break;
			}
		});
	}
	
	/**
		* Start queue processing
		*/
	private startQueueProcessing(): void {
		if (!this.config.enableNlpProcessing) {
			return;
		}
		
		// Start processing queue if there are items
		if (this.nlpQueue.length > 0 && !this.processingQueue) {
			this.processQueue();
		}
	}
	
	/**
		* Process the NLP queue
		*/
	private async processQueue(): Promise<void> {
		if (this.processingQueue || this.nlpQueue.length === 0) {
			return;
		}
		
		this.processingQueue = true;
		
		try {
			// Process up to maxConcurrentNlpOperations items
			const itemsToProcess = this.nlpQueue.splice(0, this.config.maxConcurrentNlpOperations);
			
			// Process items concurrently
			const processingPromises = itemsToProcess.map(async (item) => {
				try {
					const result = await this.processCommand(item.command, item.context);
					item.resolve(result);
				} catch (error) {
					item.reject(error instanceof Error ? error : new Error('Unknown error'));
				}
			});
			
			await Promise.all(processingPromises);
			
		} catch (error) {
			console.error('Error processing NLP queue:', error);
		} finally {
			this.processingQueue = false;
			
			// If there are more items, process them
			if (this.nlpQueue.length > 0) {
				setTimeout(() => this.processQueue(), 100);
			}
		}
	}
	
	/**
	 * Generate context-based suggestions
	 */
	private generateContextSuggestions(
		orchestratorState: OrchestratorState,
		context: CommandContext
	): Array<{
		command: string;
		description: string;
		intentType: IntentType;
		confidence: number;
	}> {
		const suggestions: Array<{
			command: string;
			description: string;
			intentType: IntentType;
			confidence: number;
		}> = [];
		
		// Add suggestions based on active workflows
		if (orchestratorState.activeWorkflows.length > 0) {
			const activeWorkflow = orchestratorState.activeWorkflows[0];
			// Use workflow ID if name is not available
			const workflowIdentifier = (activeWorkflow as any).name || activeWorkflow.id || 'active workflow';
			suggestions.push({
				command: `Check status of ${workflowIdentifier}`,
				description: `Check the status of the active workflow: ${workflowIdentifier}`,
				intentType: 'ask_question',
				confidence: 0.8
			});
		}
		
		// Add suggestions based on deliverability status
		if (orchestratorState.deliverabilityScore?.riskLevel === 'high') {
			suggestions.push({
				command: 'Fix deliverability issues',
				description: 'Address deliverability problems with your email setup',
				intentType: 'fix_deliverability',
				confidence: 0.9
			});
		}
		
		// Add suggestions based on memory context (with proper null checks)
		const memoryContext = context.memoryContext;
		if (memoryContext?.clientMemories && memoryContext.clientMemories.length > 0) {
			const recentClient = memoryContext.clientMemories[0];
			const clientName = (recentClient as any).name || 'client';
			suggestions.push({
				command: `Summarise recent activity with ${clientName}`,
				description: `Get a summary of recent communications with ${clientName}`,
				intentType: 'summarise_client',
				confidence: 0.7
			});
		}
		
		// Add suggestions based on system state (with proper null checks)
		const systemState = context.systemState;
		if (systemState?.deliverabilityStatus === 'warning') {
			suggestions.push({
				command: 'Check email deliverability',
				description: 'Review deliverability status and get recommendations',
				intentType: 'show_recommendations',
				confidence: 0.8
			});
		}
		
		// Add suggestions based on recent commands (with proper null checks)
		const recentCommands = context.recentCommands;
		if (recentCommands && recentCommands.length > 0) {
			const recentCommand = recentCommands[0];
			// Check if recent command has intent property
			if ((recentCommand as any).intent?.type === 'draft_email') {
				suggestions.push({
					command: 'Send the drafted email',
					description: 'Send the email you just drafted',
					intentType: 'draft_email',
					confidence: 0.6
				});
			}
		}
		
		// Add generic suggestions based on orchestrator state
		if (orchestratorState.status === 'processing') {
			suggestions.push({
				command: 'Check system status',
				description: 'Get current system status and processing information',
				intentType: 'ask_question',
				confidence: 0.7
			});
		}
		
		if (orchestratorState.activeAgents.length > 0) {
			suggestions.push({
				command: 'Check active agents',
				description: 'See what background agents are currently running',
				intentType: 'ask_question',
				confidence: 0.6
			});
		}
		
		return suggestions;
	}
}
