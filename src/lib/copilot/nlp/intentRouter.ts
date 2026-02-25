/**
 * Intent Router
 * 
 * Routes parsed intents to workflows, actions, memory queries, or agents.
 * Provides intelligent routing based on intent type and context.
 */

import type {
	ParsedCommand,
	CommandResult,
	IntentRouterConfig
} from './nlpTypes';

/**
 * Intent Router
 */
export class IntentRouter {
	private config: IntentRouterConfig;
	private workflowEngine: any;
	private memoryEngine: any;
	private agentEngine: any;
	private documentIntelligence: any;
	private deliverabilityIntelligence: any;
	private providerIntelligence: any;
	private isInitialized = false;
	
	constructor(config: Partial<IntentRouterConfig> = {}) {
		this.config = {
			autoTriggerWorkflows: config.autoTriggerWorkflows ?? true,
			autoTriggerActions: config.autoTriggerActions ?? true,
			autoTriggerMemoryQueries: config.autoTriggerMemoryQueries ?? true,
			autoTriggerDocumentIntelligence: config.autoTriggerDocumentIntelligence ?? true,
			autoTriggerDeliverabilityIntelligence: config.autoTriggerDeliverabilityIntelligence ?? true,
			autoTriggerProviderIntelligence: config.autoTriggerProviderIntelligence ?? true,
			defaultFallbackIntent: config.defaultFallbackIntent ?? 'ask_question',
			maxRoutingAttempts: config.maxRoutingAttempts ?? 3
		};
	}
	
	/**
	 * Initialize the intent router
	 */
	async initialize(): Promise<void> {
		if (this.isInitialized) {
			return;
		}
		
		console.log('Initializing Intent Router...');
		this.isInitialized = true;
		console.log('Intent Router initialized');
	}
	
	/**
	 * Set workflow engine
	 */
	setWorkflowEngine(workflowEngine: any): void {
		this.workflowEngine = workflowEngine;
	}
	
	/**
	 * Set memory engine
	 */
	setMemoryEngine(memoryEngine: any): void {
		this.memoryEngine = memoryEngine;
	}
	
	/**
	 * Set agent engine
	 */
	setAgentEngine(agentEngine: any): void {
		this.agentEngine = agentEngine;
	}
	
	/**
	 * Set document intelligence
	 */
	setDocumentIntelligence(documentIntelligence: any): void {
		this.documentIntelligence = documentIntelligence;
	}
	
	/**
	 * Set deliverability intelligence
	 */
	setDeliverabilityIntelligence(deliverabilityIntelligence: any): void {
		this.deliverabilityIntelligence = deliverabilityIntelligence;
	}
	
	/**
	 * Set provider intelligence
	 */
	setProviderIntelligence(providerIntelligence: any): void {
		this.providerIntelligence = providerIntelligence;
	}
	
	/**
	 * Route intent to appropriate handler
	 */
	async routeIntent(
		parsedCommand: ParsedCommand
	): Promise<CommandResult> {
		const startTime = Date.now();
		
		try {
			console.log(`Routing intent: ${parsedCommand.intent.type}`);
			
			// Route based on intent type
			let result: CommandResult;
			
			switch (parsedCommand.intent.type) {
				case 'fix_deliverability':
					result = await this.routeToDeliverabilityIntelligence(parsedCommand);
					break;
					
				case 'setup_provider':
					result = await this.routeToProviderIntelligence(parsedCommand);
					break;
					
				case 'summarise_thread':
					result = await this.routeToMemoryQuery(parsedCommand);
					break;
					
				case 'summarise_client':
					result = await this.routeToMemoryQuery(parsedCommand);
					break;
					
				case 'generate_document':
					result = await this.routeToDocumentIntelligence(parsedCommand);
					break;
					
				case 'draft_email':
					result = await this.routeToWorkflow(parsedCommand);
					break;
					
				case 'clean_inbox':
					result = await this.routeToAgent(parsedCommand);
					break;
					
				case 'run_workflow':
					result = await this.routeToWorkflow(parsedCommand);
					break;
					
				case 'ask_question':
					result = await this.routeToQuestionAnswering(parsedCommand);
					break;
					
				case 'search_memory':
					result = await this.routeToMemoryQuery(parsedCommand);
					break;
					
				case 'improve_style':
					result = await this.routeToDocumentIntelligence(parsedCommand);
					break;
					
				case 'explain_issue':
					result = await this.routeToExplanation(parsedCommand);
					break;
					
				case 'show_recommendations':
					result = await this.routeToRecommendations(parsedCommand);
					break;
					
				default:
					result = await this.routeToFallback(parsedCommand);
			}
			
			const executionTimeMs = Date.now() - startTime;
			result.executionTimeMs = executionTimeMs;
			
			console.log(`Intent routed successfully in ${executionTimeMs}ms`);
			return result;
			
		} catch (error) {
			console.error('Error routing intent:', error);
			
			const executionTimeMs = Date.now() - startTime;
			
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
				executionTimeMs,
				followUpQuestions: [
					'Something went wrong while processing your request.',
					'Would you like to try again or ask something else?'
				]
			};
		}
	}
	
	/**
	 * Route to workflow engine
	 */
	private async routeToWorkflow(parsedCommand: ParsedCommand): Promise<CommandResult> {
		if (!this.workflowEngine || !this.config.autoTriggerWorkflows) {
			return this.createFallbackResult(parsedCommand, 'Workflow engine not available');
		}
		
		try {
			const workflowId = parsedCommand.workflowId || this.determineWorkflowId(parsedCommand);
			
			if (!workflowId) {
				return {
					success: false,
					error: 'No workflow specified',
					executionTimeMs: 0,
					followUpQuestions: [
						'Which workflow would you like to run?',
						'Available workflows: campaign, newsletter, follow-up, onboarding'
					]
				};
			}
			
			console.log(`Triggering workflow: ${workflowId}`);
			
			// In a real implementation, this would trigger the workflow
			// const workflowResult = await this.workflowEngine.triggerWorkflow(workflowId, parsedCommand.executionParams);
			
			return {
				success: true,
				data: {
					workflowId,
					message: `Workflow "${workflowId}" triggered successfully`,
					parameters: parsedCommand.executionParams
				},
				workflowsTriggered: [workflowId],
				executionTimeMs: 0
			};
			
		} catch (error) {
			console.error('Error routing to workflow:', error);
			return this.createFallbackResult(parsedCommand, `Workflow error: ${error}`);
		}
	}
	
	/**
	 * Route to memory query
	 */
	private async routeToMemoryQuery(parsedCommand: ParsedCommand): Promise<CommandResult> {
		if (!this.memoryEngine || !this.config.autoTriggerMemoryQueries) {
			return this.createFallbackResult(parsedCommand, 'Memory engine not available');
		}
		
		try {
			const query = parsedCommand.memoryQuery || this.buildMemoryQuery(parsedCommand);
			
			console.log(`Querying memory: ${query}`);
			
			// In a real implementation, this would query the memory engine
			// const memoryResults = await this.memoryEngine.query(query, parsedCommand.executionParams);
			
			let data: any;
			
			switch (parsedCommand.intent.type) {
				case 'summarise_thread':
					data = {
						summary: 'This is a summary of the email thread...',
						keyPoints: ['Point 1', 'Point 2', 'Point 3'],
						participants: ['user@example.com', 'client@example.com'],
						sentiment: 'positive'
					};
					break;
					
				case 'summarise_client':
					data = {
						clientName: parsedCommand.executionParams.clientName || 'Unknown Client',
						interactionCount: 15,
						lastInteraction: '2024-02-20',
						preferences: ['formal tone', 'detailed reports'],
						openIssues: 2
					};
					break;
					
				case 'search_memory':
					data = {
						query,
						results: [
							{ type: 'email', relevance: 0.9, snippet: 'Found relevant email...' },
							{ type: 'document', relevance: 0.7, snippet: 'Found relevant document...' },
							{ type: 'conversation', relevance: 0.6, snippet: 'Found relevant conversation...' }
						],
						totalResults: 3
					};
					break;
					
				default:
					data = { query, message: 'Memory query executed' };
			}
			
			return {
				success: true,
				data,
				executionTimeMs: 0,
				suggestions: this.generateMemorySuggestions(parsedCommand)
			};
			
		} catch (error) {
			console.error('Error routing to memory query:', error);
			return this.createFallbackResult(parsedCommand, `Memory query error: ${error}`);
		}
	}
	
	/**
	 * Route to document intelligence
	 */
	private async routeToDocumentIntelligence(parsedCommand: ParsedCommand): Promise<CommandResult> {
		if (!this.documentIntelligence || !this.config.autoTriggerDocumentIntelligence) {
			return this.createFallbackResult(parsedCommand, 'Document intelligence not available');
		}
		
		try {
			console.log(`Routing to document intelligence: ${parsedCommand.intent.type}`);
			
			let data: any;
			
			switch (parsedCommand.intent.type) {
				case 'generate_document':
					data = {
						documentType: parsedCommand.executionParams.fileType || 'PDF',
						documentName: parsedCommand.executionParams.documentName || 'New Document',
						status: 'generating',
						estimatedCompletion: '2 minutes'
					};
					break;
					
				case 'improve_style':
					data = {
						originalText: 'Sample text to improve...',
						improvedText: 'Improved version of the text...',
						changes: [
							{ type: 'tone', from: 'casual', to: parsedCommand.executionParams.tone || 'professional' },
							{ type: 'clarity', improvement: 'Made sentences more concise' },
							{ type: 'grammar', improvement: 'Fixed grammatical errors' }
						],
						suggestions: ['Consider adding more specific details', 'Use more active voice']
					};
					break;
					
				default:
					data = { message: 'Document intelligence processing complete' };
			}
			
			return {
				success: true,
				data,
				executionTimeMs: 0,
				suggestions: this.generateDocumentSuggestions(parsedCommand)
			};
			
		} catch (error) {
			console.error('Error routing to document intelligence:', error);
			return this.createFallbackResult(parsedCommand, `Document intelligence error: ${error}`);
		}
	}
	
	/**
	 * Route to deliverability intelligence
	 */
	private async routeToDeliverabilityIntelligence(parsedCommand: ParsedCommand): Promise<CommandResult> {
		if (!this.deliverabilityIntelligence || !this.config.autoTriggerDeliverabilityIntelligence) {
			return this.createFallbackResult(parsedCommand, 'Deliverability intelligence not available');
		}
		
		try {
			console.log('Routing to deliverability intelligence');
			
			// In a real implementation, this would analyze deliverability
			const data = {
				status: 'analyzing',
				domains: parsedCommand.executionParams.domains || ['example.com'],
				providers: parsedCommand.executionParams.providers || ['Gmail', 'Outlook'],
				issues: [
					{ type: 'spam_score', severity: 'medium', description: 'High spam score detected' },
					{ type: 'authentication', severity: 'low', description: 'DKIM not properly configured' }
				],
				recommendations: [
					'Configure DKIM and SPF records',
					'Reduce email sending frequency',
					'Warm up new IP addresses'
				],
				estimatedImprovement: '15-20% deliverability improvement possible'
			};
			
			return {
				success: true,
				data,
				executionTimeMs: 0,
				suggestions: ['Run deliverability test', 'Review authentication settings', 'Check spam complaints']
			};
			
		} catch (error) {
			console.error('Error routing to deliverability intelligence:', error);
			return this.createFallbackResult(parsedCommand, `Deliverability intelligence error: ${error}`);
		}
	}
	
	/**
	 * Route to provider intelligence
	 */
	private async routeToProviderIntelligence(parsedCommand: ParsedCommand): Promise<CommandResult> {
		if (!this.providerIntelligence || !this.config.autoTriggerProviderIntelligence) {
			return this.createFallbackResult(parsedCommand, 'Provider intelligence not available');
		}
		
		try {
			console.log('Routing to provider intelligence');
			
			const provider = parsedCommand.executionParams.provider || 'Gmail';
			const email = parsedCommand.executionParams.email || 'user@example.com';
			
			const data = {
				provider,
				email,
				setupSteps: [
					'Generate app password',
					'Configure IMAP/SMTP settings',
					'Set up OAuth credentials',
					'Test connection'
				],
				configuration: {
					imapHost: 'imap.gmail.com',
					imapPort: 993,
					smtpHost: 'smtp.gmail.com',
					smtpPort: 587,
					encryption: 'SSL/TLS'
				},
				status: 'ready_for_setup'
			};
			
			return {
				success: true,
				data,
				executionTimeMs: 0,
				suggestions: [
					'Use app password instead of regular password',
					'Enable 2-factor authentication',
					'Test sending before full integration'
				]
			};
			
		} catch (error) {
			console.error('Error routing to provider intelligence:', error);
			return this.createFallbackResult(parsedCommand, `Provider intelligence error: ${error}`);
		}
	}
	
	/**
	 * Route to agent
	 */
	private async routeToAgent(parsedCommand: ParsedCommand): Promise<CommandResult> {
		if (!this.agentEngine) {
			return this.createFallbackResult(parsedCommand, 'Agent engine not available');
		}
		
		try {
			const agentId = parsedCommand.agentId || this.determineAgentId(parsedCommand);
			
			if (!agentId) {
				return this.createFallbackResult(parsedCommand, 'No suitable agent found');
			}
			
			console.log(`Routing to agent: ${agentId}`);
			
			// In a real implementation, this would trigger the agent
			// const agentResult = await this.agentEngine.executeAgent(agentId, parsedCommand.executionParams);
			
			const data = {
				agentId,
				action: parsedCommand.intent.type === 'clean_inbox' ? 'inbox_cleaning' : 'monitoring',
				status: 'started',
				estimatedDuration: '5-10 minutes',
				expectedResults: [
					'Organize emails by priority',
					'Archive old conversations',
					'Flag important messages',
					'Create follow-up tasks'
				]
			};
			
			return {
				success: true,
				data,
				executionTimeMs: 0,
				actionsTaken: [
					{ action: 'start_agent', target: agentId, result: 'success' }
				]
			};
			
		} catch (error) {
			console.error('Error routing to agent:', error);
			return this.createFallbackResult(parsedCommand, `Agent error: ${error}`);
		}
	}
	
	/**
	 * Route to question answering
	 */
	private async routeToQuestionAnswering(parsedCommand: ParsedCommand): Promise<CommandResult> {
		console.log('Routing to question answering');
		
		const question = parsedCommand.intent.originalText;
		
		const data = {
			question,
			answer: 'This is a sample answer to your question. In a real implementation, this would use AI to generate a comprehensive response based on system knowledge and context.',
			sources: ['system documentation', 'user manual', 'best practices'],
			confidence: 0.85
		};
		
		return {
			success: true,
			data,
			executionTimeMs: 0,
			followUpQuestions: [
				'Would you like more details on any specific aspect?',
				'Is there anything else you would like to know?'
			]
		};
	}
	
	/**
	 * Route to explanation
	 */
	private async routeToExplanation(parsedCommand: ParsedCommand): Promise<CommandResult> {
		console.log('Routing to explanation');
		
		const issue = parsedCommand.intent.originalText;
		
		const data = {
			issue,
			explanation: 'This is a detailed explanation of the issue. It covers root causes, impact, and potential solutions.',
			causes: [
				'Configuration error',
				'Network issue',
				'Provider limitation',
				'User error'
			],
			solutions: [
				'Check configuration settings',
				'Verify network connectivity',
				'Contact provider support',
				'Review documentation'
			],
			prevention: 'Regular monitoring and proactive maintenance can prevent this issue.'
		};
		
		return {
			success: true,
			data,
			executionTimeMs: 0,
			suggestions: ['Review configuration', 'Check network settings', 'Contact support if issue persists']
		};
	}
	
	/**
		* Route to recommendations
		*/
	private async routeToRecommendations(parsedCommand: ParsedCommand): Promise<CommandResult> {
		console.log('Routing to recommendations');
		
		const context = parsedCommand.intent.originalText;
		
		const data = {
			context,
			recommendations: [
				{
					category: 'deliverability',
					priority: 'high',
					action: 'Configure DKIM and SPF records',
					impact: 'Improves email deliverability by 20-30%'
				},
				{
					category: 'workflow',
					priority: 'medium',
					action: 'Set up automated follow-up sequences',
					impact: 'Reduces manual work by 40%'
				},
				{
					category: 'memory',
					priority: 'low',
					action: 'Review client interaction history',
					impact: 'Improves personalization and client satisfaction'
				}
			],
			nextSteps: [
				'Implement high-priority recommendations first',
				'Schedule weekly review of recommendations',
				'Track improvement metrics'
			]
		};
		
		return {
			success: true,
			data,
			executionTimeMs: 0,
			suggestions: ['Start with deliverability improvements', 'Set up automation workflows', 'Review client history']
		};
	}
	
	/**
		* Route to fallback
		*/
	private async routeToFallback(parsedCommand: ParsedCommand): Promise<CommandResult> {
		console.log('Routing to fallback');
		
		return {
			success: false,
			error: `Intent "${parsedCommand.intent.type}" not recognized`,
			executionTimeMs: 0,
			followUpQuestions: [
				`I'm not sure how to handle "${parsedCommand.intent.originalText}"`,
				'Could you rephrase or try a different command?',
				'Available commands: fix deliverability, setup provider, summarise thread, draft email, etc.'
			]
		};
	}
	
	/**
		* Create fallback result
		*/
	private createFallbackResult(parsedCommand: ParsedCommand, error: string): CommandResult {
		return {
			success: false,
			error,
			executionTimeMs: 0,
			followUpQuestions: [
				`Unable to process: ${parsedCommand.intent.originalText}`,
				'Would you like to try a different approach?'
			]
		};
	}
	
	/**
		* Determine workflow ID from parsed command
		*/
	private determineWorkflowId(parsedCommand: ParsedCommand): string | null {
		// Extract workflow from intent text or parameters
		const text = parsedCommand.intent.originalText.toLowerCase();
		
		if (text.includes('campaign') || text.includes('newsletter')) {
			return 'campaign';
		} else if (text.includes('follow') || text.includes('sequence')) {
			return 'follow-up';
		} else if (text.includes('onboard') || text.includes('welcome')) {
			return 'onboarding';
		} else if (text.includes('draft') || text.includes('email')) {
			return 'email-draft';
		}
		
		return null;
	}
	
	/**
		* Build memory query from parsed command
		*/
	private buildMemoryQuery(parsedCommand: ParsedCommand): string {
		const intent = parsedCommand.intent;
		const params = parsedCommand.executionParams;
		
		switch (intent.type) {
			case 'summarise_thread':
				return `Summarise thread: ${params.threadId || 'latest thread'}`;
				
			case 'summarise_client':
				return `Summarise client: ${params.clientName || 'current client'}`;
				
			case 'search_memory':
				return `Search: ${intent.originalText}`;
				
			default:
				return intent.originalText;
		}
	}
	
	/**
		* Determine agent ID from parsed command
		*/
	private determineAgentId(parsedCommand: ParsedCommand): string | null {
		const intent = parsedCommand.intent;
		
		switch (intent.type) {
			case 'clean_inbox':
				return 'inbox-cleaner';
				
			default:
				// Check for agent mentions in text
				const text = intent.originalText.toLowerCase();
				
				if (text.includes('monitor') || text.includes('watch')) {
					return 'monitoring-agent';
				} else if (text.includes('analyze') || text.includes('analyse')) {
					return 'analytics-agent';
				} else if (text.includes('organize') || text.includes('organise')) {
					return 'organization-agent';
				}
				
				return null;
		}
	}
	
	/**
		* Generate memory suggestions
		*/
	private generateMemorySuggestions(parsedCommand: ParsedCommand): string[] {
		const suggestions: string[] = [];
		
		switch (parsedCommand.intent.type) {
			case 'summarise_thread':
				suggestions.push('View full thread', 'Export summary', 'Create follow-up task');
				break;
				
			case 'summarise_client':
				suggestions.push('View client history', 'Set up client alerts', 'Schedule check-in');
				break;
				
			case 'search_memory':
				suggestions.push('Refine search', 'Save search results', 'Create memory alert');
				break;
		}
		
		return suggestions;
	}
	
	/**
		* Generate document suggestions
		*/
	private generateDocumentSuggestions(parsedCommand: ParsedCommand): string[] {
		const suggestions: string[] = [];
		
		switch (parsedCommand.intent.type) {
			case 'generate_document':
				suggestions.push('Preview document', 'Customize template', 'Set up auto-generation');
				break;
				
			case 'improve_style':
				suggestions.push('Apply to all similar documents', 'Save as template', 'Create style guide');
				break;
		}
		
		return suggestions;
	}
	
	/**
		* Get intent suggestions based on context
		*/
	async getIntentSuggestions(context: any): Promise<any[]> {
		// In a real implementation, this would analyze context and return relevant intent suggestions
		const suggestions = [
			{
				intent: 'fix_deliverability',
				description: 'Fix email deliverability issues',
				confidence: 0.9,
				parameters: { domains: ['example.com'] }
			},
			{
				intent: 'setup_provider',
				description: 'Set up email provider',
				confidence: 0.8,
				parameters: { provider: 'Gmail' }
			},
			{
				intent: 'summarise_thread',
				description: 'Summarise email thread',
				confidence: 0.7,
				parameters: { threadId: 'latest' }
			},
			{
				intent: 'draft_email',
				description: 'Draft new email',
				confidence: 0.85,
				parameters: { subject: 'New email', recipient: 'client@example.com' }
			}
		];
		
		return suggestions;
	}
	
	/**
		* Validate routing configuration
		*/
	validateConfiguration(): { valid: boolean; errors: string[] } {
		const errors: string[] = [];
		
		if (!this.workflowEngine && this.config.autoTriggerWorkflows) {
			errors.push('Workflow engine not set but autoTriggerWorkflows is enabled');
		}
		
		if (!this.memoryEngine && this.config.autoTriggerMemoryQueries) {
			errors.push('Memory engine not set but autoTriggerMemoryQueries is enabled');
		}
		
		// Note: We don't have access to parsedCommand here, so we can't check agent-related intents
		// This is a simplified validation
		
		return {
			valid: errors.length === 0,
			errors
		};
	}
}
