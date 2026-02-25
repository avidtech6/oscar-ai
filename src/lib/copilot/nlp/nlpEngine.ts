/**
 * Natural Language Processing Engine
 * 
 * Core engine for parsing natural language commands.
 * Handles intent detection, entity extraction, memory-aware interpretation,
 * and produces parsed commands ready for execution.
 */

import type {
	IntentType,
	ParsedIntent,
	ParsedCommand,
	CommandContext,
	NlpEngineConfig,
	ExtractedEntity
} from './nlpTypes';

import { EntityExtractor } from './entityExtractor';

/**
 * NLP Engine
 */
export class NlpEngine {
	private config: NlpEngineConfig;
	private entityExtractor: EntityExtractor;
	private memorySelectors: any;
	private orchestrator: any;
	private workflowEngine: any;
	private agentEngine: any;
	private isInitialized = false;
	private commandCache: Map<string, ParsedCommand> = new Map();
	
	constructor(config: Partial<NlpEngineConfig> = {}) {
		this.config = {
			minIntentConfidence: config.minIntentConfidence ?? 0.7,
			minEntityConfidence: config.minEntityConfidence ?? 0.7,
			useMemoryContext: config.useMemoryContext ?? true,
			useWorkflowContext: config.useWorkflowContext ?? true,
			useAgentContext: config.useAgentContext ?? true,
			maxClarificationAttempts: config.maxClarificationAttempts ?? 3,
			logProcessing: config.logProcessing ?? true,
			cacheParsedCommands: config.cacheParsedCommands ?? true,
			cacheTtlMs: config.cacheTtlMs ?? 5 * 60 * 1000, // 5 minutes
			defaultLanguage: config.defaultLanguage ?? 'en'
		};
		
		this.entityExtractor = new EntityExtractor({
			useRegexPatterns: true,
			useMemoryLookups: true,
			useWorkflowLookups: true,
			useProviderLookups: true,
			minEntityConfidence: this.config.minEntityConfidence
		});
	}
	
	/**
	 * Initialize the NLP engine
	 */
	async initialize(): Promise<void> {
		if (this.isInitialized) {
			return;
		}
		
		console.log('Initializing NLP Engine...');
		
		// Set up cache cleanup interval
		if (this.config.cacheParsedCommands) {
			setInterval(() => {
				this.cleanupExpiredCache();
			}, 60 * 1000); // Clean up every minute
		}
		
		this.isInitialized = true;
		console.log('NLP Engine initialized');
	}
	
	/**
	 * Set memory selectors
	 */
	setMemorySelectors(memorySelectors: any): void {
		this.memorySelectors = memorySelectors;
		this.entityExtractor.setMemorySelectors(memorySelectors);
	}
	
	/**
	 * Set orchestrator
	 */
	setOrchestrator(orchestrator: any): void {
		this.orchestrator = orchestrator;
	}
	
	/**
	 * Set workflow engine
	 */
	setWorkflowEngine(workflowEngine: any): void {
		this.workflowEngine = workflowEngine;
		this.entityExtractor.setWorkflowRegistry(workflowEngine?.getWorkflowRegistry?.());
	}
	
	/**
	 * Set agent engine
	 */
	setAgentEngine(agentEngine: any): void {
		this.agentEngine = agentEngine;
	}
	
	/**
	 * Set provider registry
	 */
	setProviderRegistry(providerRegistry: any): void {
		this.entityExtractor.setProviderRegistry(providerRegistry);
	}
	
	/**
	 * Parse natural language command
	 */
	async parseCommand(
		text: string,
		context?: CommandContext
	): Promise<ParsedCommand> {
		if (this.config.logProcessing) {
			console.log(`Parsing command: "${text}"`);
		}
		
		// Check cache first
		const cacheKey = this.getCacheKey(text, context);
		if (this.config.cacheParsedCommands) {
			const cachedCommand = this.commandCache.get(cacheKey);
			if (cachedCommand) {
				if (this.config.logProcessing) {
					console.log('Returning cached command');
				}
				return cachedCommand;
			}
		}
		
		try {
			// Get or create context
			const commandContext = await this.buildCommandContext(context);
			
			// Extract entities
			const entities = await this.entityExtractor.extractEntities(text, commandContext);
			
			// Detect intent
			const parsedIntent = await this.detectIntent(text, entities, commandContext);
			
			// Extract parameters
			const parameters = await this.extractParameters(text, parsedIntent, entities, commandContext);
			
			// Build parsed command
			const parsedCommand = await this.buildParsedCommand(
				text,
				parsedIntent,
				entities,
				parameters,
				commandContext
			);
			
			// Cache the command
			if (this.config.cacheParsedCommands) {
				this.commandCache.set(cacheKey, parsedCommand);
			}
			
			if (this.config.logProcessing) {
				console.log(`Command parsed successfully: ${parsedIntent.type} (confidence: ${parsedIntent.confidence})`);
			}
			
			return parsedCommand;
		} catch (error) {
			console.error('Error parsing command:', error);
			
			// Return fallback command
			return this.createFallbackCommand(text, context, error);
		}
	}
	
	/**
	 * Build command context
	 */
	private async buildCommandContext(
		providedContext?: CommandContext
	): Promise<CommandContext> {
		const context: CommandContext = providedContext || {};
		
		// Add memory context if available
		if (this.config.useMemoryContext && this.memorySelectors) {
			try {
				context.memoryContext = {
					clientMemories: await this.memorySelectors.getRecentClientMemories?.(10),
					threadMemories: await this.memorySelectors.getRecentThreadMemories?.(10),
					documentMemories: await this.memorySelectors.getRecentDocumentMemories?.(10),
					styleMemories: await this.memorySelectors.getRecentStyleMemories?.(10),
					providerMemories: await this.memorySelectors.getRecentProviderMemories?.(10)
				};
			} catch (error) {
				console.error('Error building memory context:', error);
			}
		}
		
		// Add workflow context if available
		if (this.config.useWorkflowContext && this.workflowEngine) {
			try {
				context.workflowContext = {
					activeWorkflows: this.workflowEngine.getActiveWorkflows?.(),
					recentWorkflows: this.workflowEngine.getRecentWorkflows?.(10),
					availableWorkflows: this.workflowEngine.getAvailableWorkflows?.()
				};
			} catch (error) {
				console.error('Error building workflow context:', error);
			}
		}
		
		// Add agent context if available
		if (this.config.useAgentContext && this.agentEngine) {
			try {
				context.agentContext = {
					activeAgents: this.agentEngine.getActiveAgents?.(),
					recentAgentResults: this.agentEngine.getRecentAgentResults?.(10)
				};
			} catch (error) {
				console.error('Error building agent context:', error);
			}
		}
		
		// Add system state if orchestrator is available
		if (this.orchestrator) {
			try {
				const state = this.orchestrator.getState?.();
				context.systemState = {
					deliverabilityStatus: state?.deliverabilityStatus,
					providerStatus: state?.providerStatus,
					inboxStatus: state?.inboxStatus,
					documentStatus: state?.documentStatus
				};
			} catch (error) {
				console.error('Error building system state context:', error);
			}
		}
		
		return context;
	}
	
	/**
	 * Detect intent from text and entities
	 */
	private async detectIntent(
		text: string,
		entities: ExtractedEntity[],
		context: CommandContext
	): Promise<ParsedIntent> {
		const textLower = text.toLowerCase();
		
		// Intent patterns
		const intentPatterns: Array<{
			type: IntentType;
			patterns: RegExp[];
			confidence: number;
			requiredEntities?: string[];
		}> = [
			{
				type: 'fix_deliverability',
				patterns: [
					/\bfix\s+(deliverability|email\s+delivery)\b/gi,
					/\bimprove\s+(deliverability|email\s+delivery)\b/gi,
					/\b(deliverability|email\s+delivery)\s+(issue|problem|broken)\b/gi
				],
				confidence: 0.9
			},
			{
				type: 'setup_provider',
				patterns: [
					/\bsetup\s+(email\s+)?provider\b/gi,
					/\bconfigure\s+(email\s+)?provider\b/gi,
					/\badd\s+(new\s+)?(email\s+)?provider\b/gi,
					/\bconnect\s+(email\s+)?provider\b/gi
				],
				confidence: 0.9
			},
			{
				type: 'summarise_thread',
				patterns: [
					/\bsummar(?:ise|ize|y)\s+(thread|conversation|email\s+thread)\b/gi,
					/\bwhat('s| is)\s+this\s+(thread|conversation)\s+about\b/gi,
					/\bgive\s+me\s+a\s+summary\s+of\s+this\s+(thread|conversation)\b/gi
				],
				confidence: 0.85,
				requiredEntities: ['thread_id']
			},
			{
				type: 'summarise_client',
				patterns: [
					/\bsummar(?:ise|ize|y)\s+(client|customer|account)\b/gi,
					/\bwhat('s| is)\s+the\s+history\s+with\s+(client|customer|account)\b/gi,
					/\btell\s+me\s+about\s+(client|customer|account)\b/gi
				],
				confidence: 0.85,
				requiredEntities: ['client_name']
			},
			{
				type: 'generate_document',
				patterns: [
					/\bgenerate\s+(document|report|pdf)\b/gi,
					/\bcreate\s+(document|report|pdf)\b/gi,
					/\bmake\s+a\s+(document|report|pdf)\b/gi
				],
				confidence: 0.8
			},
			{
				type: 'draft_email',
				patterns: [
					/\bdraft\s+(an\s+)?email\b/gi,
					/\bwrite\s+(an\s+)?email\b/gi,
					/\bcompose\s+(an\s+)?email\b/gi,
					/\bcreate\s+(an\s+)?email\b/gi
				],
				confidence: 0.9
			},
			{
				type: 'clean_inbox',
				patterns: [
					/\bclean\s+(up\s+)?(inbox|email\s+inbox)\b/gi,
					/\borganize\s+(inbox|email\s+inbox)\b/gi,
					/\btidy\s+(up\s+)?(inbox|email\s+inbox)\b/gi
				],
				confidence: 0.85
			},
			{
				type: 'run_workflow',
				patterns: [
					/\brun\s+workflow\b/gi,
					/\bstart\s+workflow\b/gi,
					/\bexecute\s+workflow\b/gi,
					/\btrigger\s+workflow\b/gi
				],
				confidence: 0.8,
				requiredEntities: ['workflow_name']
			},
			{
				type: 'ask_question',
				patterns: [
					/\bwhat('s| is)\b/gi,
					/\bhow\s+(do|to|can)\b/gi,
					/\bwhy\b/gi,
					/\bexplain\b/gi,
					/\btell\s+me\b/gi
				],
				confidence: 0.7
			},
			{
				type: 'search_memory',
				patterns: [
					/\bsearch\s+(memory|memories)\b/gi,
					/\bfind\s+in\s+memory\b/gi,
					/\blook\s+up\s+in\s+memory\b/gi
				],
				confidence: 0.8
			},
			{
				type: 'improve_style',
				patterns: [
					/\bimprove\s+(writing\s+)?style\b/gi,
					/\bmake\s+(this|it)\s+better\b/gi,
					/\brewrite\s+(this|it)\b/gi,
					/\bedit\s+(this|it)\b/gi
				],
				confidence: 0.8
			},
			{
				type: 'explain_issue',
				patterns: [
					/\bexplain\s+(issue|problem|error)\b/gi,
					/\bwhat('s| is)\s+wrong\b/gi,
					/\bwhy\s+(is|are)\s+(this|it)\s+(not\s+)?working\b/gi
				],
				confidence: 0.8
			},
			{
				type: 'show_recommendations',
				patterns: [
					/\bshow\s+recommendations\b/gi,
					/\bwhat\s+should\s+I\s+do\b/gi,
					/\bsuggest\s+(something|actions)\b/gi,
					/\brecommend\s+(something|actions)\b/gi
				],
				confidence: 0.8
			}
		];
		
		// Find matching intents
		const matchingIntents: Array<{
			type: IntentType;
			confidence: number;
			patternMatch: boolean;
			entitiesMatch: boolean;
		}> = [];
		
		for (const intentPattern of intentPatterns) {
			let patternMatch = false;
			let confidence = intentPattern.confidence;
			
			// Check pattern matches
			for (const pattern of intentPattern.patterns) {
				if (pattern.test(textLower)) {
					patternMatch = true;
					
					// Adjust confidence based on match quality
					const match = textLower.match(pattern);
					if (match && match[0].length > 10) {
						confidence += 0.05; // Longer matches are more specific
					}
					
					break;
				}
			}
			
			// Check entity requirements
			let entitiesMatch = true;
			if (intentPattern.requiredEntities) {
				const entityTypes = entities.map(e => e.type);
				for (const requiredEntity of intentPattern.requiredEntities) {
					if (!entityTypes.includes(requiredEntity as any)) {
						entitiesMatch = false;
						confidence -= 0.2; // Penalty for missing required entities
					}
				}
			}
			
			if (patternMatch || entitiesMatch) {
				matchingIntents.push({
					type: intentPattern.type,
					confidence: Math.min(confidence, 0.99), // Cap at 0.99
					patternMatch,
					entitiesMatch
				});
			}
		}
		
		// Sort by confidence
		matchingIntents.sort((a, b) => b.confidence - a.confidence);
		
		// Determine if clarification is needed
		let needsClarification = false;
		const clarificationQuestions: string[] = [];
		
		if (matchingIntents.length === 0) {
			// No intent detected
			return {
				type: 'unknown',
				confidence: 0.1,
				originalText: text,
				entities,
				parameters: {},
				needsClarification: true,
				clarificationQuestions: ['What would you like me to do?']
			};
		}
		
		const bestIntent = matchingIntents[0];
		
		// Check if we need clarification
		if (bestIntent.confidence < this.config.minIntentConfidence) {
			needsClarification = true;
			clarificationQuestions.push(`Did you mean to ${bestIntent.type.replace('_', ' ')}?`);
		}
		
		// Check for ambiguous intents
		if (matchingIntents.length > 1) {
			const secondBest = matchingIntents[1];
			if (bestIntent.confidence - secondBest.confidence < 0.1) {
				needsClarification = true;
				clarificationQuestions.push(
					`Did you mean to ${bestIntent.type.replace('_', ' ')} or ${secondBest.type.replace('_', ' ')}?`
				);
			}
		}
		
		return {
			type: bestIntent.type,
			confidence: bestIntent.confidence,
			originalText: text,
			entities,
			parameters: {},
			context,
			needsClarification,
			clarificationQuestions: needsClarification ? clarificationQuestions : undefined
		};
	}
	
	/**
	 * Extract parameters from text and entities
	 */
	private async extractParameters(
		text: string,
		intent: ParsedIntent,
		entities: ExtractedEntity[],
		context: CommandContext
	): Promise<Record<string, any>> {
		const parameters: Record<string, any> = {};
		
		// Extract parameters based on intent type
		switch (intent.type) {
			case 'fix_deliverability':
				// Extract deliverability-related parameters
				const deliverabilityEntities = entities.filter(e =>
					e.type === 'domain' || e.type === 'provider_name'
				);
				if (deliverabilityEntities.length > 0) {
					parameters.domains = deliverabilityEntities
						.filter(e => e.type === 'domain')
						.map(e => e.value);
					parameters.providers = deliverabilityEntities
						.filter(e => e.type === 'provider_name')
						.map(e => e.value);
				}
				break;
				
			case 'setup_provider':
				// Extract provider setup parameters
				const providerEntities = entities.filter(e =>
					e.type === 'provider_name' || e.type === 'email_address'
				);
				if (providerEntities.length > 0) {
					parameters.provider = providerEntities
						.find(e => e.type === 'provider_name')?.value;
					parameters.email = providerEntities
						.find(e => e.type === 'email_address')?.value;
				}
				break;
				
			case 'summarise_thread':
				// Extract thread parameters
				const threadEntity = entities.find(e => e.type === 'thread_id');
				if (threadEntity) {
					parameters.threadId = threadEntity.value;
				}
				break;
				
			case 'summarise_client':
				// Extract client parameters
				const clientEntity = entities.find(e => e.type === 'client_name');
				if (clientEntity) {
					parameters.clientName = clientEntity.value;
				}
				break;
				
			case 'generate_document':
				// Extract document parameters
				const documentEntities = entities.filter(e =>
					e.type === 'document_name' || e.type === 'file_type'
				);
				if (documentEntities.length > 0) {
					parameters.documentName = documentEntities
						.find(e => e.type === 'document_name')?.value;
					parameters.fileType = documentEntities
						.find(e => e.type === 'file_type')?.value || 'PDF';
				}
				break;
				
			case 'draft_email':
				// Extract email drafting parameters
				const emailEntities = entities.filter(e =>
					e.type === 'client_name' || e.type === 'subject' ||
					e.type === 'tone_preference' || e.type === 'priority'
				);
				if (emailEntities.length > 0) {
					parameters.to = emailEntities
						.find(e => e.type === 'client_name')?.value;
					parameters.subject = emailEntities
						.find(e => e.type === 'subject')?.value;
					parameters.tone = emailEntities
						.find(e => e.type === 'tone_preference')?.value;
					parameters.priority = emailEntities
						.find(e => e.type === 'priority')?.value;
				}
				break;
				
			case 'run_workflow':
				// Extract workflow parameters
				const workflowEntity = entities.find(e => e.type === 'workflow_name');
				if (workflowEntity) {
					parameters.workflowName = workflowEntity.value;
				}
				break;
				
			case 'improve_style':
				// Extract style improvement parameters
				const styleEntities = entities.filter(e =>
					e.type === 'tone_preference' || e.type === 'document_name'
				);
				if (styleEntities.length > 0) {
					parameters.tone = styleEntities
						.find(e => e.type === 'tone_preference')?.value;
					parameters.documentName = styleEntities
						.find(e => e.type === 'document_name')?.value;
				}
				break;
		}
		
		// Add time-related parameters
		const timeEntity = entities.find(e => e.type === 'time_period');
		if (timeEntity) {
			parameters.timePeriod = timeEntity.value;
		}
		
		// Add count parameters
		const countEntity = entities.find(e => e.type === 'count');
		if (countEntity) {
			parameters.count = parseInt(countEntity.value, 10) || 1;
		}
		
		return parameters;
	}
	
	/**
	 * Build parsed command object
	 */
	private async buildParsedCommand(
		text: string,
		intent: ParsedIntent,
		entities: ExtractedEntity[],
		parameters: Record<string, any>,
		context: CommandContext
	): Promise<ParsedCommand> {
		// Generate command ID
		const commandId = `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		
		// Determine target based on intent
		let workflowId: string | undefined;
		let actionId: string | undefined;
		let agentId: string | undefined;
		let memoryQuery: string | undefined;
		
		switch (intent.type) {
			case 'run_workflow':
				workflowId = parameters.workflowName;
				break;
			case 'search_memory':
				memoryQuery = text;
				break;
			case 'fix_deliverability':
				agentId = 'deliverability-monitor';
				break;
			case 'clean_inbox':
				agentId = 'inbox-scanner';
				break;
		}
		
		return {
			id: commandId,
			intent,
			workflowId,
			actionId,
			agentId,
			memoryQuery,
			executionParams: parameters,
			timestamp: new Date(),
			userId: context.user?.id
		};
	}
	
	/**
	 * Create fallback command for errors
	 */
	private createFallbackCommand(
		text: string,
		context?: CommandContext,
		error?: any
	): ParsedCommand {
		const commandId = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		
		return {
			id: commandId,
			intent: {
				type: 'unknown',
				confidence: 0.1,
				originalText: text,
				entities: [],
				parameters: {},
				needsClarification: true,
				clarificationQuestions: [
					'I had trouble understanding that. Could you rephrase?',
					'What would you like me to help with?'
				]
			},
			executionParams: {
				error: error?.message || 'Unknown error',
				originalText: text
			},
			timestamp: new Date(),
			userId: context?.user?.id
		};
	}
	
	/**
	 * Get cache key for command
	 */
	private getCacheKey(text: string, context?: CommandContext): string {
		const contextKey = context?.user?.id || 'anonymous';
		const textKey = text.toLowerCase().replace(/\s+/g, '_').substring(0, 100);
		return `${contextKey}_${textKey}`;
	}
	
	/**
	 * Clean up expired cache entries
	 */
	private cleanupExpiredCache(): void {
		const now = Date.now();
		const expiredKeys: string[] = [];
		
		for (const [key, command] of this.commandCache) {
			const age = now - command.timestamp.getTime();
			if (age > this.config.cacheTtlMs) {
				expiredKeys.push(key);
			}
		}
		
		for (const key of expiredKeys) {
			this.commandCache.delete(key);
		}
		
		if (expiredKeys.length > 0 && this.config.logProcessing) {
			console.log(`Cleaned up ${expiredKeys.length} expired cache entries`);
		}
	}
	
	/**
	 * Clear command cache
	 */
	clearCache(): void {
		this.commandCache.clear();
		if (this.config.logProcessing) {
			console.log('Command cache cleared');
		}
	}
	
	/**
	 * Get cache statistics
	 */
	getCacheStats(): {
		size: number;
		hits: number;
		misses: number;
		hitRate: number;
	} {
		// In a real implementation, track hits and misses
		return {
			size: this.commandCache.size,
			hits: 0,
			misses: 0,
			hitRate: 0
		};
	}
	
	/**
	 * Clean up resources
	 */
	async cleanup(): Promise<void> {
		await this.entityExtractor.cleanup();
		this.commandCache.clear();
		this.isInitialized = false;
		console.log('NLP Engine cleaned up');
	}
}
	