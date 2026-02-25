/**
 * Copilot Orchestrator
 * 
 * Central coordinator for all copilot engines in the Communication Hub.
 * Manages context flow, engine coordination, and intelligent decision-making.
 */

import type { CopilotContext } from '../context/contextTypes';
import type { Hint } from '../hints/hintTypes';
import type { DeliverabilityScore } from '../deliverability/deliverabilityEngine';
import type { SurveyData, GeneratedDocument } from '../document/documentIntelligence';
import type { ActionDefinition, ActionResult } from '../actions/actionEngine';
import type { WorkflowDefinition, WorkflowInstance, WorkflowStatus } from '../workflows/workflowTypes';
import type { MemoryItem, MemoryCategory, MemorySource } from '../memory/memoryTypes';

// Import engine instances
import { contextEngine } from '../context/contextEngine';
import { hintEngine } from '../hints/hintEngine';
import { smartShareEngine } from '../smart-share/smartShareEngine';
import { providerIntelligence } from '../providers/providerIntelligence';
import { DeliverabilityEngine } from '../deliverability/deliverabilityEngine';
import { DocumentIntelligence } from '../document/documentIntelligence';
import { actionEngine } from '../actions/actionEngine';

// Import workflow engine
import { WorkflowEngine } from '../workflows/workflowEngine';
import { WorkflowRegistry } from '../workflows/workflowRegistry';
import { WorkflowStateManager } from '../workflows/workflowState';

// Import memory engines
import { MemoryEngine } from '../memory/memoryEngine';
import { MemorySelectors } from '../memory/memorySelectors';
import { StyleEngine } from '../memory/styleEngine';
import { ClientEngine } from '../memory/clientEngine';
import { ThreadEngine } from '../memory/threadEngine';
import { DocumentEngine } from '../memory/documentEngine';
import { ProviderEngine } from '../memory/providerEngine';
import { DeliverabilityEngine as DeliverabilityMemoryEngine } from '../memory/deliverabilityEngine';
import { WorkflowEngine as WorkflowMemoryEngine } from '../memory/workflowEngine';

// Import agent engines
import { AgentEngine } from '../agents/agentEngine';
import { AgentScheduler } from '../agents/agentScheduler';
import { AgentStateManager } from '../agents/agentState';
import { AgentRegistry, getAgentRegistry } from '../agents/agentRegistry';

// Create engine instances
const deliverabilityEngine = new DeliverabilityEngine();
const documentIntelligenceEngine = new DocumentIntelligence();

/**
 * Orchestrator state
 */
export interface OrchestratorState {
	/** Current context */
	context: CopilotContext;
	
	/** Active hints */
	hints: Hint[];
	
	/** Current deliverability score */
	deliverabilityScore?: DeliverabilityScore;
	
	/** Active documents */
	documents: GeneratedDocument[];
	
	/** Available actions */
	availableActions: ActionDefinition[];
	
	/** Last execution results */
	lastResults: ActionResult[];
	
	/** Orchestrator status */
	status: 'idle' | 'processing' | 'error' | 'paused';
	
	/** Last update timestamp */
	lastUpdated: Date;
	
	/** Processing queue */
	queue: Array<{
		type: 'context-update' | 'hint-generation' | 'action-execution' | 'document-processing' | 'workflow-execution' | 'memory-update';
		priority: number;
		data: any;
	}>;
	
	/** Active workflows */
	activeWorkflows: WorkflowInstance[];
	
	/** Suggested workflows */
	suggestedWorkflows: WorkflowDefinition[];
	
	/** Workflow engine status */
	workflowEngineStatus: 'idle' | 'running' | 'error';
	
	/** Memory system status */
	memorySystemStatus: 'idle' | 'running' | 'error';
	
	/** Recent memories */
	recentMemories: MemoryItem[];
	
	/** Memory statistics */
	memoryStats: {
		totalMemories: number;
		byCategory: Record<MemoryCategory, number>;
		bySource: Record<MemorySource, number>;
		lastUpdated: Date;
	};
	
	/** Agent system status */
	agentSystemStatus: 'idle' | 'running' | 'error';
	
	/** Active agents */
	activeAgents: Array<{
		id: string;
		name: string;
		type: string;
		status: string;
		lastExecutionTime?: Date;
		nextExecutionTime?: Date;
	}>;
	
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
}

/**
 * Orchestrator configuration
 */
export interface OrchestratorConfig {
	/** Enable hint generation */
	enableHints: boolean;
	
	/** Enable smart share */
	enableSmartShare: boolean;
	
	/** Enable provider intelligence */
	enableProviderIntelligence: boolean;
	
	/** Enable deliverability checks */
	enableDeliverability: boolean;
	
	/** Enable document intelligence */
	enableDocumentIntelligence: boolean;
	
	/** Enable action suggestions */
	enableActionSuggestions: boolean;
	
	/** Enable workflow automation */
	enableWorkflowAutomation: boolean;
	
	/** Auto-start matching workflows */
	autoStartMatchingWorkflows: boolean;
	
	/** Auto-execute low-risk actions */
	autoExecuteLowRiskActions: boolean;
	
	/** Maximum concurrent operations */
	maxConcurrentOperations: number;
	
	/** Maximum concurrent workflows */
	maxConcurrentWorkflows: number;
	
	/** Processing interval (ms) */
	processingInterval: number;
	
	/** Log level */
	logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Orchestrator event
 */
export interface OrchestratorEvent {
	type: 'context-updated' | 'hints-generated' | 'action-suggested' | 'action-executed' |
	       'document-processed' | 'workflow-started' | 'workflow-completed' | 'workflow-failed' |
	       'workflow-suggested' | 'error' | 'warning' | 'info';
	data: any;
	timestamp: Date;
	severity: 'info' | 'warning' | 'error' | 'critical';
}

/**
 * Orchestrator
 */
export class CopilotOrchestrator {
	private state: OrchestratorState;
	private config: OrchestratorConfig;
	private eventListeners: Array<(event: OrchestratorEvent) => void> = [];
	private processingIntervalId?: NodeJS.Timeout;
	
	// Workflow engines
	private workflowEngine?: WorkflowEngine;
	private workflowRegistry?: WorkflowRegistry;
	private workflowStateManager?: WorkflowStateManager;
	
	// Memory engines
	private memoryEngine?: MemoryEngine;
	private memorySelectors?: MemorySelectors;
	private styleEngine?: StyleEngine;
	private clientEngine?: ClientEngine;
	private threadEngine?: ThreadEngine;
	private documentEngine?: DocumentEngine;
	private providerEngine?: ProviderEngine;
	private deliverabilityMemoryEngine?: DeliverabilityMemoryEngine;
	private workflowMemoryEngine?: WorkflowMemoryEngine;
	
	// Agent engines
	private agentEngine?: AgentEngine;
	private agentScheduler?: AgentScheduler;
	private agentStateManager?: AgentStateManager;
	private agentRegistry?: AgentRegistry;
	
	constructor(config?: Partial<OrchestratorConfig>) {
		this.config = {
			enableHints: true,
			enableSmartShare: true,
			enableProviderIntelligence: true,
			enableDeliverability: true,
			enableDocumentIntelligence: true,
			enableActionSuggestions: true,
			enableWorkflowAutomation: true,
			autoStartMatchingWorkflows: true,
			autoExecuteLowRiskActions: false,
			maxConcurrentOperations: 3,
			maxConcurrentWorkflows: 5,
			processingInterval: 5000,
			logLevel: 'info',
			...config
		};
		
		// Initialize memory stats with empty defaults
		const emptyCategoryStats: Record<MemoryCategory, number> = {
			'client': 0,
			'provider': 0,
			'deliverability': 0,
			'document': 0,
			'workflow': 0,
			'style': 0,
			'preferences': 0,
			'thread': 0,
			'summary': 0,
			'email': 0,
			'campaign': 0,
			'report': 0,
			'survey': 0,
			'pdf': 0,
			'note': 0
		};
		
		const emptySourceStats: Record<MemorySource, number> = {
			'email': 0,
			'document': 0,
			'workflow': 0,
			'smart-share': 0,
			'provider-setup': 0,
			'deliverability-fix': 0,
			'user-action': 0,
			'ai-action': 0,
			'system': 0,
			'manual': 0
		};
		
		this.state = {
			context: contextEngine.getCurrentContext(),
			hints: [],
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
				byCategory: emptyCategoryStats,
				bySource: emptySourceStats,
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
		};
		
		this.initializeEngines();
	}
	
	/**
	 * Initialize engines
	 */
	private initializeEngines(): void {
		// Initialize context engine
		contextEngine.addListener((event) => {
			this.handleContextUpdate(event.newContext as CopilotContext);
		});
		
		// Initialize hint engine
		if (this.config.enableHints) {
			// Note: hintEngine doesn't have onHintsUpdated method
			// We'll poll for hints instead
			setInterval(() => {
				const hints = hintEngine.getCurrentHints();
				this.handleHintsUpdated(hints);
			}, 5000);
		}
		
		// Initialize workflow engines
		if (this.config.enableWorkflowAutomation) {
			this.initializeWorkflowEngines();
		}
		
		// Initialize memory engines
		this.initializeMemoryEngines();
		
		// Initialize agent engines
		this.initializeAgentEngines();
		
		this.log('info', 'Orchestrator initialized with all engines');
	}
	
	/**
	 * Initialize workflow engines
	 */
	private initializeWorkflowEngines(): void {
		try {
			this.workflowEngine = new WorkflowEngine({
				maxConcurrentWorkflows: this.config.maxConcurrentWorkflows,
				autoStartMatchingWorkflows: this.config.autoStartMatchingWorkflows
			});
			
			this.workflowRegistry = new WorkflowRegistry();
			this.workflowStateManager = new WorkflowStateManager();
			
			// Listen to workflow events
			if (this.workflowEngine) {
				this.workflowEngine.onEvent((event) => {
					this.handleWorkflowEvent(event);
				});
			}
			
			this.state.workflowEngineStatus = 'running';
			this.log('info', 'Workflow engines initialized');
		} catch (error) {
			this.state.workflowEngineStatus = 'error';
			this.log('error', `Failed to initialize workflow engines: ${error}`);
		}
	}
	
	/**
	 * Initialize memory engines
	 */
	private initializeMemoryEngines(): void {
		try {
			// Initialize core memory engine
			this.memoryEngine = new MemoryEngine();
			this.memorySelectors = new MemorySelectors({ memoryEngine: this.memoryEngine });
			
			// Initialize specialized memory engines
			this.styleEngine = new StyleEngine({ memoryEngine: this.memoryEngine });
			this.clientEngine = new ClientEngine({ memoryEngine: this.memoryEngine });
			this.threadEngine = new ThreadEngine({ memoryEngine: this.memoryEngine });
			this.documentEngine = new DocumentEngine({ memoryEngine: this.memoryEngine });
			this.providerEngine = new ProviderEngine({ memoryEngine: this.memoryEngine });
			this.deliverabilityMemoryEngine = new DeliverabilityMemoryEngine({ memoryEngine: this.memoryEngine });
			this.workflowMemoryEngine = new WorkflowMemoryEngine({ memoryEngine: this.memoryEngine });
			
			// Set up memory update polling
			setInterval(async () => {
				await this.updateMemoryState();
			}, 10000); // Update every 10 seconds
			
			this.state.memorySystemStatus = 'running';
			this.log('info', 'Memory engines initialized');
		} catch (error) {
			this.state.memorySystemStatus = 'error';
			this.log('error', `Failed to initialize memory engines: ${error}`);
		}
	}
	
	/**
	 * Initialize agent engines
	 */
	private initializeAgentEngines(): void {
		try {
			// Initialize agent registry
			this.agentRegistry = getAgentRegistry();
			
			// Initialize agent state manager
			this.agentStateManager = new AgentStateManager({
				persistToStorage: true,
				storageKeyPrefix: 'copilot-agents',
				maxStateHistoryEntries: 100,
				persistenceIntervalMs: 30000,
				compressStateData: true
			});
			
			// Initialize agent scheduler
			this.agentScheduler = new AgentScheduler({
				maxScheduledAgents: 20,
				schedulerTickIntervalMs: 1000,
				useRequestAnimationFrame: false,
				useWebWorkers: false,
				maxRetryAttempts: 3,
				retryDelayMs: 5000
			});
			
			// Initialize agent engine
			this.agentEngine = new AgentEngine({
				autoStartEnabledAgents: true,
				persistAgentState: true,
				restoreAgentState: true,
				maxConcurrentAgents: 5,
				statePersistenceIntervalMs: 30000,
				emitAgentEvents: true,
				logAgentActivity: true,
				defaultAgentPriority: 50,
				defaultMaxExecutionTimeMs: 30000
			});
			
			// Set up agent state polling
			setInterval(async () => {
				await this.updateAgentState();
			}, 5000); // Update every 5 seconds
			
			this.state.agentSystemStatus = 'running';
			this.log('info', 'Agent engines initialized');
		} catch (error) {
			this.state.agentSystemStatus = 'error';
			this.log('error', `Failed to initialize agent engines: ${error}`);
		}
	}
	
	/**
	 * Update agent state in orchestrator
	 */
	private async updateAgentState(): Promise<void> {
		if (!this.agentEngine || !this.agentRegistry) return;
		
		try {
			// Get active agents from agent engine
			const activeAgents = this.agentEngine.getActiveAgents();
			
			// Update orchestrator state
			this.state.activeAgents = activeAgents.map(agent => ({
				id: agent.config.id,
				name: agent.config.name,
				type: agent.config.type,
				status: agent.getStatus(),
				lastExecutionTime: agent.state.lastExecutionTime,
				nextExecutionTime: agent.state.nextExecutionTime
			}));
			
			// Update agent statistics
			const allAgents = this.agentRegistry.getAllRegisteredAgents();
			const allAgentInstances = this.agentEngine.getAllAgents();
			
			// Calculate statistics from agent instances
			let pausedAgents = 0;
			let errorAgents = 0;
			let totalExecutions = 0;
			let successfulExecutions = 0;
			let failedExecutions = 0;
			
			for (const agent of allAgentInstances) {
				const status = agent.getStatus();
				if (status === 'paused') pausedAgents++;
				if (status === 'error') errorAgents++;
				
				totalExecutions += agent.state.executionCount;
				successfulExecutions += agent.state.successCount;
				failedExecutions += agent.state.errorCount;
			}
			
			this.state.agentStats = {
				totalAgents: allAgents.length,
				activeAgents: activeAgents.length,
				pausedAgents,
				errorAgents,
				totalExecutions,
				successfulExecutions,
				failedExecutions,
				lastUpdated: new Date()
			};
			
			this.log('debug', `Agent state updated: ${activeAgents.length} active agents`);
		} catch (error) {
			this.log('error', `Failed to update agent state: ${error}`);
		}
	}
	
	/**
	 * Update memory state
	 */
	private async updateMemoryState(): Promise<void> {
		if (!this.memorySelectors || !this.memoryEngine) return;
		
		try {
			// Get recent memories
			const recentMemories = await this.memorySelectors.getRecentMemories(20);
			this.state.recentMemories = recentMemories;
			
			// Calculate memory statistics from recent memories
			const byCategory: Record<MemoryCategory, number> = {
				'client': 0,
				'provider': 0,
				'deliverability': 0,
				'document': 0,
				'workflow': 0,
				'style': 0,
				'preferences': 0,
				'thread': 0,
				'summary': 0,
				'email': 0,
				'campaign': 0,
				'report': 0,
				'survey': 0,
				'pdf': 0,
				'note': 0
			};
			
			const bySource: Record<MemorySource, number> = {
				'email': 0,
				'document': 0,
				'workflow': 0,
				'smart-share': 0,
				'provider-setup': 0,
				'deliverability-fix': 0,
				'user-action': 0,
				'ai-action': 0,
				'system': 0,
				'manual': 0
			};
			
			// Count categories and sources from recent memories
			for (const memory of recentMemories) {
				byCategory[memory.category] = (byCategory[memory.category] || 0) + 1;
				bySource[memory.source] = (bySource[memory.source] || 0) + 1;
			}
			
			// Update state
			this.state.memoryStats = {
				totalMemories: recentMemories.length,
				byCategory,
				bySource,
				lastUpdated: new Date()
			};
			
			this.log('debug', `Memory state updated: ${recentMemories.length} recent memories`);
		} catch (error) {
			this.log('error', `Failed to update memory state: ${error}`);
		}
	}
	
	/**
	 * Start orchestrator
	 */
	start(): void {
		if (this.state.status !== 'idle') {
			this.log('warn', 'Orchestrator already running');
			return;
		}
		
		this.state.status = 'processing';
		this.processingIntervalId = setInterval(() => {
			this.processQueue();
		}, this.config.processingInterval);
		
		this.log('info', 'Orchestrator started');
		this.emitEvent({
			type: 'info',
			data: { message: 'Orchestrator started' },
			timestamp: new Date(),
			severity: 'info'
		});
	}
	
	/**
	 * Stop orchestrator
	 */
	stop(): void {
		if (this.processingIntervalId) {
			clearInterval(this.processingIntervalId);
			this.processingIntervalId = undefined;
		}
		
		this.state.status = 'idle';
		this.log('info', 'Orchestrator stopped');
		this.emitEvent({
			type: 'info',
			data: { message: 'Orchestrator stopped' },
			timestamp: new Date(),
			severity: 'info'
		});
	}
	
	/**
	 * Pause orchestrator
	 */
	pause(): void {
		if (this.processingIntervalId) {
			clearInterval(this.processingIntervalId);
			this.processingIntervalId = undefined;
		}
		
		this.state.status = 'paused';
		this.log('info', 'Orchestrator paused');
	}
	
	/**
	 * Resume orchestrator
	 */
	resume(): void {
		if (this.state.status === 'paused') {
			this.start();
		}
	}
	
	/**
	 * Handle context update
	 */
	private handleContextUpdate(context: CopilotContext): void {
		this.state.context = context;
		this.state.lastUpdated = new Date();
		
		// Update all engines with new context
		if (this.config.enableHints) {
			// hintEngine automatically updates via context engine listener
		}
		
		if (this.config.enableSmartShare) {
			// smartShareEngine automatically updates via context engine listener
		}
		
		if (this.config.enableProviderIntelligence) {
			// providerIntelligence automatically updates via context engine listener
		}
		
		if (this.config.enableDeliverability) {
			// Queue deliverability analysis
			this.queueOperation('context-update', 2, { context });
		}
		
		if (this.config.enableDocumentIntelligence) {
			// documentIntelligenceEngine automatically updates via context engine listener
		}
		
		// Update action suggestions
		if (this.config.enableActionSuggestions) {
			this.queueOperation('action-execution', 3, { context });
		}
		
		// Update workflow suggestions
		if (this.config.enableWorkflowAutomation && this.workflowRegistry) {
			this.queueOperation('workflow-execution', 4, { context });
		}
		
		// Queue memory update for context
		this.queueOperation('memory-update', 5, { context });
		
		this.emitEvent({
			type: 'context-updated',
			data: { context },
			timestamp: new Date(),
			severity: 'info'
		});
		
		this.log('debug', 'Context updated');
	}
	
	/**
	 * Handle workflow event
	 */
	private handleWorkflowEvent(event: any): void {
		// Update state based on workflow event
		if (this.workflowEngine) {
			this.state.activeWorkflows = this.workflowEngine.getActiveWorkflows();
		}
		
		// Emit orchestrator event
		let eventType: OrchestratorEvent['type'] = 'info';
		let severity: OrchestratorEvent['severity'] = 'info';
		
		switch (event.type) {
			case 'workflow_started':
				eventType = 'workflow-started';
				break;
			case 'workflow_completed':
				eventType = 'workflow-completed';
				break;
			case 'workflow_failed':
				eventType = 'workflow-failed';
				severity = 'error';
				break;
		}
		
		this.emitEvent({
			type: eventType,
			data: event,
			timestamp: new Date(),
			severity
		});
	}
	
	/**
	 * Handle hints updated
	 */
	private handleHintsUpdated(hints: Hint[]): void {
		this.state.hints = hints;
		
		// Convert high-priority hints to actions
		const highPriorityHints = hints.filter(hint => 
			hint.priority === 'critical' || hint.priority === 'high'
		);
		
		for (const hint of highPriorityHints) {
			const action = actionEngine.createActionFromHint(hint);
			if (action) {
				this.queueOperation('action-execution', 1, { action, hint });
			}
		}
		
		this.emitEvent({
			type: 'hints-generated',
			data: { hints },
			timestamp: new Date(),
			severity: 'info'
		});
		
		this.log('debug', `Hints updated: ${hints.length} hints`);
	}
	
	/**
	 * Queue operation
	 */
	private queueOperation(
		type: OrchestratorState['queue'][0]['type'],
		priority: number,
		data: any
	): void {
		this.state.queue.push({ type, priority, data });
		
		// Sort queue by priority (lower number = higher priority)
		this.state.queue.sort((a, b) => a.priority - b.priority);
		
		// Limit queue size
		if (this.state.queue.length > 20) {
			this.state.queue = this.state.queue.slice(0, 20);
			this.log('warn', 'Queue size limited to 20 items');
		}
	}
	
	/**
	 * Process queue
	 */
	private async processQueue(): Promise<void> {
		if (this.state.queue.length === 0) return;
		
		const operations = this.state.queue.splice(0, this.config.maxConcurrentOperations);
		
		for (const operation of operations) {
			try {
				await this.processOperation(operation);
			} catch (error) {
				this.log('error', `Failed to process operation ${operation.type}: ${error}`);
				this.emitEvent({
					type: 'error',
					data: { operation, error: error instanceof Error ? error.message : 'Unknown error' },
					timestamp: new Date(),
					severity: 'error'
				});
			}
		}
	}
	
	/**
	 * Process single operation
	 */
	private async processOperation(operation: OrchestratorState['queue'][0]): Promise<void> {
		switch (operation.type) {
			case 'context-update':
				await this.processContextUpdate(operation.data);
				break;
				
			case 'hint-generation':
				await this.processHintGeneration(operation.data);
				break;
				
			case 'action-execution':
				await this.processActionExecution(operation.data);
				break;
				
			case 'document-processing':
				await this.processDocumentProcessing(operation.data);
				break;
				
			case 'workflow-execution':
				await this.processWorkflowExecution(operation.data);
				break;
				
			case 'memory-update':
				await this.processMemoryUpdate(operation.data);
				break;
		}
	}
	
	/**
	 * Process workflow execution
	 */
	private async processWorkflowExecution(data: { context: CopilotContext }): Promise<void> {
		if (!this.workflowRegistry || !this.workflowEngine) {
			return;
		}
		
		// Get suggested workflows for current context
		const suggestedWorkflows = this.workflowRegistry.getSuggestedWorkflows(data.context);
		this.state.suggestedWorkflows = suggestedWorkflows;
		
		// Auto-start matching workflows if enabled
		if (this.config.autoStartMatchingWorkflows) {
			for (const workflow of suggestedWorkflows) {
				if (this.workflowRegistry.canAutomateWorkflow(workflow.id)) {
					try {
						await this.workflowEngine.startWorkflow(workflow.id, data.context);
						this.log('info', `Auto-started workflow: ${workflow.name}`);
					} catch (error) {
						this.log('error', `Failed to auto-start workflow ${workflow.name}: ${error}`);
					}
				}
			}
		}
		
		// Update active workflows
		this.state.activeWorkflows = this.workflowEngine.getActiveWorkflows();
		
		// Emit workflow suggested event
		if (suggestedWorkflows.length > 0) {
			this.emitEvent({
				type: 'workflow-suggested',
				data: { workflows: suggestedWorkflows },
				timestamp: new Date(),
				severity: 'info'
			});
		}
		
		this.log('debug', `Workflow execution processed: ${suggestedWorkflows.length} suggested workflows`);
	}
	
	/**
	 * Process context update
	 */
	private async processContextUpdate(data: { context: CopilotContext }): Promise<void> {
		// Update deliverability score
		if (this.config.enableDeliverability) {
			const score = deliverabilityEngine.analyzeEmail(data.context);
			this.state.deliverabilityScore = score;
			
			// Generate actions from deliverability issues
			if (score.riskLevel === 'critical' || score.riskLevel === 'high') {
				const actions = actionEngine.getActionSuggestionsFromDeliverability(score);
				this.state.availableActions.push(...actions);
			}
		}
		
		// Update available actions
		const discoveredActions = actionEngine.discoverActions(data.context);
		this.state.availableActions = discoveredActions;
		
		this.log('debug', 'Context processed');
	}
	
	/**
	 * Process hint generation
	 */
	private async processHintGeneration(data: any): Promise<void> {
		// Hint generation is handled by hint engine automatically
		// This is a placeholder for future hint processing logic
		await new Promise(resolve => setTimeout(resolve, 100));
	}
	
	/**
	 * Process action execution
	 */
	private async processActionExecution(data: { action?: ActionDefinition, hint?: Hint }): Promise<void> {
		if (!data.action) {
			// Generate actions from hints
			if (data.hint) {
				const action = actionEngine.createActionFromHint(data.hint);
				if (action) {
					await this.executeAction(action);
				}
			}
			return;
		}
		
		await this.executeAction(data.action);
	}
	
	/**
	 * Execute action
	 */
	private async executeAction(action: ActionDefinition): Promise<void> {
		// Check if action should be auto-executed
		const shouldAutoExecute = this.config.autoExecuteLowRiskActions && 
			action.riskLevel === 'low' && 
			action.automationLevel === 'full-auto';
		
		if (shouldAutoExecute) {
			try {
				const result = await actionEngine.executeAction(action.id, this.state.context);
				this.state.lastResults.push(result);
				
				this.emitEvent({
					type: 'action-executed',
					data: { action, result },
					timestamp: new Date(),
					severity: 'info'
				});
				
				this.log('info', `Auto-executed action: ${action.title}`);
			} catch (error) {
				this.log('error', `Failed to auto-execute action ${action.title}: ${error}`);
			}
		} else {
			// Just add to available actions
			if (!this.state.availableActions.some(a => a.id === action.id)) {
				this.state.availableActions.push(action);
			}
		}
	}
	
	/**
	 * Process document processing
	 */
	private async processDocumentProcessing(data: any): Promise<void> {
		// Document processing is handled by document intelligence engine
		// This is a placeholder for future document processing logic
		await new Promise(resolve => setTimeout(resolve, 100));
	}
	
	/**
	 * Process memory update
	 */
	private async processMemoryUpdate(data: { context: CopilotContext }): Promise<void> {
		if (!this.memoryEngine) return;
		
		try {
			// Extract relevant information from context for memory storage
			const context = data.context;
			const screen = context.ui.currentScreen;
			
			// Store context as memory
			await this.memoryEngine.writeMemory(
				'preferences',
				'system',
				context,
				`Context update: ${screen}`,
				{
					tags: ['context-update', screen],
					importance: 50,
					confidence: 80
				}
			);
			
			// If there's a selected email, store it as email memory
			if (context.ui.selectedEmailId) {
				await this.memoryEngine.writeMemory(
					'email',
					'system',
					{
						emailId: context.ui.selectedEmailId,
						screen,
						timestamp: new Date()
					},
					`Email selected: ${context.ui.selectedEmailId}`,
					{
						tags: ['email-selected', screen],
						importance: 60,
						confidence: 90
					}
				);
			}
			
			// If there's a current provider, store provider memory
			if (context.provider?.providerId) {
				await this.memoryEngine.writeMemory(
					'provider',
					'system',
					{
						providerId: context.provider.providerId,
						configStatus: context.provider.configStatus,
						screen,
						timestamp: new Date()
					},
					`Provider context: ${context.provider.providerId}`,
					{
						tags: ['provider-context', context.provider.providerId, screen],
						importance: 70,
						confidence: 85
					}
				);
			}
			
			// Update deliverability memory if there are issues
			if (context.deliverability) {
				const issues = context.deliverability.recentIssues;
				if (issues.length > 0) {
					await this.memoryEngine.writeMemory(
						'deliverability',
						'system',
						{
							messageId: issues[0].messageId,
							score: issues[0].score,
							issues: issues[0].issues,
							timestamp: new Date()
						},
						`Deliverability issue: score ${issues[0].score}`,
						{
							tags: ['deliverability-issue', `score-${issues[0].score}`],
							importance: issues[0].score > 50 ? 80 : 60,
							confidence: 85
						}
					);
				}
			}
			
			// Update workflow memory if there's workflow activity
			if (context.ui.providerSetupProgress !== undefined) {
				await this.memoryEngine.writeMemory(
					'workflow',
					'system',
					{
						workflowId: 'provider_setup',
						progress: context.ui.providerSetupProgress,
						screen,
						timestamp: new Date()
					},
					`Provider setup progress: ${context.ui.providerSetupProgress}%`,
					{
						tags: ['workflow-progress', 'provider-setup', screen],
						importance: 60,
						confidence: 90
					}
				);
			}
			
			this.log('debug', 'Memory updated for context');
		} catch (error) {
			this.log('error', `Failed to process memory update: ${error}`);
		}
	}
	
	/**
	 * Process survey data
	 */
	async processSurveyData(surveyData: SurveyData): Promise<GeneratedDocument> {
		if (!this.config.enableDocumentIntelligence) {
			throw new Error('Document intelligence is disabled');
		}
		
		try {
			const document = await documentIntelligenceEngine.generateReportFromSurvey(surveyData);
			this.state.documents.push(document);
			
			// Generate actions from document
			const actions = actionEngine.getActionSuggestionsFromDocument(document);
			this.state.availableActions.push(...actions);
			
			this.emitEvent({
				type: 'document-processed',
				data: { document },
				timestamp: new Date(),
				severity: 'info'
			});
			
			this.log('info', `Survey processed into document: ${document.title}`);
			
			return document;
		} catch (error) {
			this.log('error', `Failed to process survey: ${error}`);
			throw error;
		}
	}
	
	/**
	 * Get orchestrator state
	 */
	getState(): OrchestratorState {
		return { ...this.state };
	}
	
	/**
	 * Get orchestrator configuration
	 */
	getConfig(): OrchestratorConfig {
		return { ...this.config };
	}
	
	/**
	 * Update configuration
	 */
	updateConfig(config: Partial<OrchestratorConfig>): void {
		this.config = { ...this.config, ...config };
		this.log('info', 'Configuration updated');
	}
	
	/**
	 * Get recommended actions
	 */
	getRecommendedActions(): ActionDefinition[] {
		// Filter and sort available actions
		const recommendedActions = this.state.availableActions
			.filter(action => {
				// Filter out actions that don't match current context
				const contextValid = actionEngine['isContextValidForAction'](
					this.state.context,
					action.requiredContext
				);
				return contextValid;
			})
			.sort((a, b) => {
				// Sort by priority and risk
				const priorityOrder: Record<string, number> = {
					'critical': 0,
					'high': 1,
					'medium': 2,
					'low': 3
				};
				
				const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
				if (priorityDiff !== 0) return priorityDiff;
				
				// Then by risk (lower risk first)
				const riskOrder: Record<string, number> = {
					'low': 0,
					'medium': 1,
					'high': 2
				};
				
				return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
			})
			.slice(0, 10); // Limit to 10 recommendations
		
		return recommendedActions;
	}
	
	/**
	 * Execute recommended action
	 */
	async executeRecommendedAction(actionId: string, params?: any): Promise<ActionResult> {
		const action = this.state.availableActions.find(a => a.id === actionId);
		if (!action) {
			throw new Error(`Action not found: ${actionId}`);
		}
		
		try {
			const result = await actionEngine.executeAction(actionId, this.state.context, params);
			this.state.lastResults.push(result);
			
			this.emitEvent({
				type: 'action-executed',
				data: { action, result },
				timestamp: new Date(),
				severity: 'info'
			});
			
			this.log('info', `Executed action: ${action.title}`);
			
			return result;
		} catch (error) {
			this.log('error', `Failed to execute action ${action.title}: ${error}`);
			throw error;
		}
	}
	
	/**
	 * Get suggested workflows
	 */
	getSuggestedWorkflows(): WorkflowDefinition[] {
		return [...this.state.suggestedWorkflows];
	}
	
	/**
	 * Get active workflows
	 */
	getActiveWorkflows(): WorkflowInstance[] {
		return [...this.state.activeWorkflows];
	}
	
	/**
	 * Start workflow
	 */
	async startWorkflow(workflowId: string): Promise<WorkflowInstance> {
		if (!this.workflowEngine) {
			throw new Error('Workflow engine not initialized');
		}
		
		try {
			const workflowInstance = await this.workflowEngine.startWorkflow(workflowId, this.state.context);
			
			// Update state
			this.state.activeWorkflows = this.workflowEngine.getActiveWorkflows();
			
			this.emitEvent({
				type: 'workflow-started',
				data: { workflowInstance },
				timestamp: new Date(),
				severity: 'info'
			});
			
			this.log('info', `Started workflow: ${workflowId}`);
			
			return workflowInstance;
		} catch (error) {
			this.log('error', `Failed to start workflow ${workflowId}: ${error}`);
			throw error;
		}
	}
	
	/**
	 * Pause workflow
	 */
	pauseWorkflow(workflowInstanceId: string): void {
		if (!this.workflowEngine) {
			throw new Error('Workflow engine not initialized');
		}
		
		try {
			this.workflowEngine.pauseWorkflow(workflowInstanceId);
			this.state.activeWorkflows = this.workflowEngine.getActiveWorkflows();
			
			this.log('info', `Paused workflow: ${workflowInstanceId}`);
		} catch (error) {
			this.log('error', `Failed to pause workflow ${workflowInstanceId}: ${error}`);
			throw error;
		}
	}
	
	/**
	 * Resume workflow
	 */
	resumeWorkflow(workflowInstanceId: string): void {
		if (!this.workflowEngine) {
			throw new Error('Workflow engine not initialized');
		}
		
		try {
			this.workflowEngine.resumeWorkflow(workflowInstanceId);
			this.state.activeWorkflows = this.workflowEngine.getActiveWorkflows();
			
			this.log('info', `Resumed workflow: ${workflowInstanceId}`);
		} catch (error) {
			this.log('error', `Failed to resume workflow ${workflowInstanceId}: ${error}`);
			throw error;
		}
	}
	
	/**
	 * Cancel workflow
	 */
	cancelWorkflow(workflowInstanceId: string): void {
		if (!this.workflowEngine) {
			throw new Error('Workflow engine not initialized');
		}
		
		try {
			this.workflowEngine.cancelWorkflow(workflowInstanceId);
			this.state.activeWorkflows = this.workflowEngine.getActiveWorkflows();
			
			this.log('info', `Cancelled workflow: ${workflowInstanceId}`);
		} catch (error) {
			this.log('error', `Failed to cancel workflow ${workflowInstanceId}: ${error}`);
			throw error;
		}
	}
	
	/**
	 * Get workflow by ID
	 */
	getWorkflow(workflowInstanceId: string): WorkflowInstance | undefined {
		if (!this.workflowEngine) {
			return undefined;
		}
		
		return this.workflowEngine.getWorkflow(workflowInstanceId);
	}
	
	/**
	 * Get workflow statistics
	 */
	getWorkflowStatistics(): any {
		if (!this.workflowRegistry) {
			return null;
		}
		
		return this.workflowRegistry.getStatistics();
	}
	
	/**
	 * Add event listener
	 */
	onEvent(listener: (event: OrchestratorEvent) => void): void {
		this.eventListeners.push(listener);
	}
	
	/**
	 * Remove event listener
	 */
	removeEventListener(listener: (event: OrchestratorEvent) => void): void {
		const index = this.eventListeners.indexOf(listener);
		if (index !== -1) {
			this.eventListeners.splice(index, 1);
		}
	}
	
	/**
	 * Emit event
	 */
	private emitEvent(event: OrchestratorEvent): void {
		for (const listener of this.eventListeners) {
			try {
				listener(event);
			} catch (error) {
				console.error('Error in event listener:', error);
			}
		}
	}
	
	/**
	 * Log message
	 */
	private log(level: 'debug' | 'info' | 'warn' | 'error', message: string): void {
		const logLevels = { debug: 0, info: 1, warn: 2, error: 3 };
		const currentLevel = logLevels[this.config.logLevel];
		const messageLevel = logLevels[level];
		
		if (messageLevel >= currentLevel) {
			const timestamp = new Date().toISOString();
			console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
		}
	}
}