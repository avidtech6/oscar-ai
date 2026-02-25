/**
 * Conversational Clarification Engine
 * 
 * Handles ambiguous commands, missing entities, and conversational clarification.
 * Provides intelligent questioning to gather missing information.
 */

import type {
	IntentType,
	EntityType,
	ExtractedEntity,
	ParsedIntent,
	ParsedCommand,
	ClarificationRequest,
	CommandContext,
	ClarificationEngineConfig
} from './nlpTypes';

/**
 * Clarification Engine
 */
export class ClarificationEngine {
	private config: ClarificationEngineConfig;
	private clarificationHistory: Map<string, ClarificationRequest[]> = new Map();
	private isInitialized = false;
	
	constructor(config: Partial<ClarificationEngineConfig> = {}) {
		this.config = {
			askClarifyingQuestions: config.askClarifyingQuestions ?? true,
			maxQuestionsPerCommand: config.maxQuestionsPerCommand ?? 3,
			suggestValues: config.suggestValues ?? true,
			useMemoryForSuggestions: config.useMemoryForSuggestions ?? true,
			useWorkflowRegistryForSuggestions: config.useWorkflowRegistryForSuggestions ?? true,
			useProviderRegistryForSuggestions: config.useProviderRegistryForSuggestions ?? true,
			clarificationTimeoutMs: config.clarificationTimeoutMs ?? 30000 // 30 seconds
		};
	}
	
	/**
	 * Initialize the clarification engine
	 */
	async initialize(): Promise<void> {
		if (this.isInitialized) {
			return;
		}
		
		console.log('Initializing Clarification Engine...');
		this.isInitialized = true;
		console.log('Clarification Engine initialized');
	}
	
	/**
	 * Analyze parsed intent for missing information
	 */
	analyzeForClarification(
		parsedIntent: ParsedIntent,
		context: CommandContext
	): ClarificationRequest | null {
		if (!this.config.askClarifyingQuestions) {
			return null;
		}
		
		console.log(`Analyzing intent "${parsedIntent.type}" for clarification needs`);
		
		// Check if clarification is already needed
		if (parsedIntent.needsClarification && parsedIntent.clarificationQuestions) {
			return this.createClarificationRequest(parsedIntent, context);
		}
		
		// Analyze for missing entities based on intent type
		const missingEntities = this.determineMissingEntities(parsedIntent, context);
		const ambiguousParameters = this.detectAmbiguousParameters(parsedIntent);
		
		// If no missing entities or ambiguous parameters, no clarification needed
		if (missingEntities.length === 0 && ambiguousParameters.length === 0) {
			return null;
		}
		
		// Create clarification request
		const clarificationRequest = this.createClarificationRequest(
			parsedIntent,
			context,
			missingEntities,
			ambiguousParameters
		);
		
		return clarificationRequest;
	}
	
	/**
	 * Generate clarification questions
	 */
	generateClarificationQuestions(
		parsedIntent: ParsedIntent,
		missingEntities: EntityType[],
		ambiguousParameters: string[],
		context: CommandContext
	): string[] {
		const questions: string[] = [];
		
		// Generate questions for missing entities
		for (const entityType of missingEntities) {
			const question = this.generateEntityQuestion(entityType, parsedIntent, context);
			if (question) {
				questions.push(question);
			}
		}
		
		// Generate questions for ambiguous parameters
		for (const parameter of ambiguousParameters) {
			const question = this.generateParameterQuestion(parameter, parsedIntent, context);
			if (question) {
				questions.push(question);
			}
		}
		
		// Limit number of questions
		if (questions.length > this.config.maxQuestionsPerCommand) {
			return questions.slice(0, this.config.maxQuestionsPerCommand);
		}
		
		return questions;
	}
	
	/**
	 * Process clarification response
	 */
	processClarificationResponse(
		originalRequest: ClarificationRequest,
		userResponse: string,
		context: CommandContext
	): {
		updatedIntent: ParsedIntent;
		remainingQuestions: string[];
		complete: boolean;
	} {
		console.log('Processing clarification response');
		
		// Extract entities from user response
		const extractedEntities = this.extractEntitiesFromResponse(userResponse, originalRequest);
		
		// Update the original intent with new entities
		const updatedIntent = this.updateIntentWithEntities(
			originalRequest.originalCommand.intent,
			extractedEntities
		);
		
		// Check if we still need more information
		const remainingMissingEntities = this.determineMissingEntities(updatedIntent, context);
		const remainingAmbiguousParameters = this.detectAmbiguousParameters(updatedIntent);
		
		// Generate remaining questions if any
		let remainingQuestions: string[] = [];
		let complete = false;
		
		if (remainingMissingEntities.length === 0 && remainingAmbiguousParameters.length === 0) {
			complete = true;
			console.log('Clarification complete');
		} else {
			remainingQuestions = this.generateClarificationQuestions(
				updatedIntent,
				remainingMissingEntities,
				remainingAmbiguousParameters,
				context
			);
			
			if (remainingQuestions.length === 0) {
				complete = true;
			}
		}
		
		return {
			updatedIntent,
			remainingQuestions,
			complete
		};
	}
	
	/**
	 * Get suggested values for missing entities
	 */
	getSuggestedValues(
		entityType: EntityType,
		parsedIntent: ParsedIntent,
		context: CommandContext
	): any[] {
		const suggestions: any[] = [];
		
		// Get suggestions from memory if enabled
		if (this.config.useMemoryForSuggestions && context.memoryContext) {
			const memorySuggestions = this.getSuggestionsFromMemory(entityType, context);
			suggestions.push(...memorySuggestions);
		}
		
		// Get suggestions from workflow registry if enabled
		if (this.config.useWorkflowRegistryForSuggestions && context.workflowContext) {
			const workflowSuggestions = this.getSuggestionsFromWorkflows(entityType, context);
			suggestions.push(...workflowSuggestions);
		}
		
		// Get suggestions from provider registry if enabled
		if (this.config.useProviderRegistryForSuggestions) {
			const providerSuggestions = this.getSuggestionsFromProviders(entityType);
			suggestions.push(...providerSuggestions);
		}
		
		// Add default suggestions based on entity type
		const defaultSuggestions = this.getDefaultSuggestions(entityType);
		suggestions.push(...defaultSuggestions);
		
		// Remove duplicates
		const uniqueSuggestions = Array.from(new Set(suggestions));
		
		return uniqueSuggestions.slice(0, 5); // Return top 5 suggestions
	}
	
	/**
	 * Record clarification in history
	 */
	recordClarification(request: ClarificationRequest): void {
		const sessionId = request.originalCommand.sessionId || 'default';
		
		if (!this.clarificationHistory.has(sessionId)) {
			this.clarificationHistory.set(sessionId, []);
		}
		
		const sessionHistory = this.clarificationHistory.get(sessionId)!;
		sessionHistory.push(request);
		
		// Keep only recent history (last 10 requests)
		if (sessionHistory.length > 10) {
			sessionHistory.shift();
		}
	}
	
	/**
	 * Get clarification history for session
	 */
	getClarificationHistory(sessionId: string): ClarificationRequest[] {
		return this.clarificationHistory.get(sessionId) || [];
	}
	
	/**
	 * Clear clarification history for session
	 */
	clearClarificationHistory(sessionId: string): void {
		this.clarificationHistory.delete(sessionId);
	}
	
	/**
	 * Determine missing entities based on intent type
	 */
	private determineMissingEntities(
		parsedIntent: ParsedIntent,
		context: CommandContext
	): EntityType[] {
		const missingEntities: EntityType[] = [];
		const extractedEntityTypes = parsedIntent.entities.map(e => e.type);
		
		// Define required entities for each intent type
		const requiredEntities: Record<IntentType, EntityType[]> = {
			'fix_deliverability': ['domain'],
			'setup_provider': ['provider_name', 'email_address'],
			'summarise_thread': ['thread_id'],
			'summarise_client': ['client_name'],
			'generate_document': ['document_name'],
			'draft_email': ['email_address', 'subject'],
			'clean_inbox': [],
			'run_workflow': ['workflow_name'],
			'ask_question': [],
			'search_memory': [],
			'improve_style': [],
			'explain_issue': [],
			'show_recommendations': [],
			'unknown': []
		};
		
		// Check for missing required entities
		const required = requiredEntities[parsedIntent.type] || [];
		for (const requiredEntity of required) {
			if (!extractedEntityTypes.includes(requiredEntity)) {
				missingEntities.push(requiredEntity);
			}
		}
		
		return missingEntities;
	}
	
	/**
	 * Detect ambiguous parameters in intent
	 */
	private detectAmbiguousParameters(parsedIntent: ParsedIntent): string[] {
		const ambiguousParameters: string[] = [];
		
		// Check for ambiguous entity values
		for (const entity of parsedIntent.entities) {
			if (entity.confidence < 0.7) {
				ambiguousParameters.push(entity.type);
			}
		}
		
		// Check for ambiguous intent parameters
		const parameters = parsedIntent.parameters;
		for (const [key, value] of Object.entries(parameters)) {
			if (value === undefined || value === null || value === '') {
				ambiguousParameters.push(key);
			} else if (Array.isArray(value) && value.length === 0) {
				ambiguousParameters.push(key);
			} else if (typeof value === 'string' && value.trim() === '') {
				ambiguousParameters.push(key);
			}
		}
		
		return ambiguousParameters;
	}
	
	/**
	 * Create clarification request
	 */
	private createClarificationRequest(
		parsedIntent: ParsedIntent,
		context: CommandContext,
		missingEntities: EntityType[] = [],
		ambiguousParameters: string[] = []
	): ClarificationRequest {
		// Generate questions
		const questions = this.generateClarificationQuestions(
			parsedIntent,
			missingEntities,
			ambiguousParameters,
			context
		);
		
		// Get suggested values if enabled
		let suggestedValues: Record<string, any[]> | undefined;
		if (this.config.suggestValues) {
			suggestedValues = {};
			
			for (const entityType of missingEntities) {
				const suggestions = this.getSuggestedValues(entityType, parsedIntent, context);
				if (suggestions.length > 0) {
					suggestedValues[entityType] = suggestions;
				}
			}
		}
		
		// Create a mock parsed command for the request
		const mockCommand: ParsedCommand = {
			id: `clarification_${Date.now()}`,
			intent: parsedIntent,
			executionParams: parsedIntent.parameters,
			timestamp: new Date(),
			sessionId: context.user?.id ? `user_${context.user.id}` : 'anonymous'
		};
		
		const request: ClarificationRequest = {
			id: `clarification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			originalCommand: mockCommand,
			questions,
			missingEntities,
			ambiguousParameters,
			suggestedValues,
			timestamp: new Date()
		};
		
		// Record the clarification
		this.recordClarification(request);
		
		return request;
	}
	
	/**
	 * Generate question for missing entity
	 */
	private generateEntityQuestion(
		entityType: EntityType,
		parsedIntent: ParsedIntent,
		context: CommandContext
	): string | null {
		const intentText = parsedIntent.originalText;
		
		switch (entityType) {
			case 'client_name':
				return 'Which client are you referring to?';
				
			case 'domain':
				return 'Which domain would you like to fix deliverability for?';
				
			case 'thread_id':
				return 'Which email thread would you like me to summarise?';
				
			case 'provider_name':
				return 'Which email provider would you like to set up?';
				
			case 'document_name':
				return 'What would you like to name this document?';
				
			case 'workflow_name':
				return 'Which workflow would you like to run?';
				
			case 'email_address':
				return 'Who should I send this email to?';
				
			case 'subject':
				return 'What should the subject of the email be?';
				
			case 'tone_preference':
				return 'What tone would you like me to use? (e.g., professional, casual, friendly)';
				
			case 'file_type':
				return 'What file type would you like? (e.g., PDF, DOCX, HTML)';
				
			case 'priority':
				return 'What priority level should this have? (e.g., high, medium, low)';
				
			case 'time_period':
				return 'For what time period? (e.g., last week, this month, all time)';
				
			case 'count':
				return 'How many?';
				
			case 'date':
				return 'For which date?';
				
			default:
				// TypeScript needs help here - cast to string
				const entityTypeStr = entityType as string;
				return `What ${entityTypeStr.replace('_', ' ')} are you referring to?`;
		}
	}
	
	/**
	 * Generate question for ambiguous parameter
	 */
	private generateParameterQuestion(
		parameter: string,
		parsedIntent: ParsedIntent,
		context: CommandContext
	): string | null {
		switch (parameter) {
			case 'domain':
				return 'I\'m not sure which domain you mean. Could you specify?';
				
			case 'provider':
				return 'Which provider are you referring to?';
				
			case 'client':
				return 'Which client are you talking about?';
				
			case 'workflow':
				return 'Which workflow should I run?';
				
			default:
				return `I need more information about "${parameter}". Could you clarify?`;
		}
	}
	
	/**
	 * Extract entities from user response
	 */
	private extractEntitiesFromResponse(
		response: string,
		originalRequest: ClarificationRequest
	): ExtractedEntity[] {
		// This is a simplified implementation
		// In a real implementation, this would use the entity extractor
		
		const entities: ExtractedEntity[] = [];
		const missingEntities = originalRequest.missingEntities;
		
		// Simple keyword matching for demonstration
		for (const entityType of missingEntities) {
			// Look for common patterns based on entity type
			const patterns: Record<EntityType, RegExp[]> = {
				'client_name': [/\b(client|customer)\s+(\w+)/i, /\b(\w+)\s+(corp|inc|llc|co\.)/i],
				'domain': [/\b(\w+\.(com|org|net|io|co\.uk))\b/i],
				'thread_id': [/\b(thread|conversation)\s+(\w+)/i],
				'provider_name': [/\b(gmail|outlook|yahoo|icloud|brevo|sendgrid|mailgun)\b/i],
				'document_name': [/\b(report|proposal|document|file)\s+(\w+)/i],
				'workflow_name': [/\b(workflow|campaign|sequence|newsletter)\s+(\w+)/i],
				'date': [/\b(today|tomorrow|yesterday|next week|last month)\b/i, /\b(\d{1,2}\/\d{1,2}\/\d{4})\b/],
				'count': [/\b(\d+)\b/],
				'tone_preference': [/\b(professional|casual|friendly|formal|informal)\b/i],
				'email_address': [/\b[\w\.-]+@[\w\.-]+\.\w+\b/i],
				'subject': [/\b(subject|about|regarding)\s+(.+)/i],
				'priority': [/\b(high|medium|low|urgent|important)\b/i],
				'time_period': [/\b(last week|this month|all time|recent|past)\b/i],
				'file_type': [/\b(PDF|DOCX|HTML|TXT|MD)\b/i]
			};
			
			const entityPatterns = patterns[entityType] || [];
			for (const pattern of entityPatterns) {
				const match = response.match(pattern);
				if (match) {
					const value = match[1] || match[0];
					entities.push({
						type: entityType,
						value,
						confidence: 0.8,
						start: match.index || 0,
						end: (match.index || 0) + value.length
					});
					break;
				}
			}
		}
		
		return entities;
	}
	/**
	 * Update intent with new entities
	 */
	private updateIntentWithEntities(
		intent: ParsedIntent,
		newEntities: ExtractedEntity[]
	): ParsedIntent {
		// Combine existing entities with new ones
		const updatedEntities = [...intent.entities];
		
		for (const newEntity of newEntities) {
			// Check if entity of same type already exists
			const existingIndex = updatedEntities.findIndex(e => e.type === newEntity.type);
			
			if (existingIndex >= 0) {
				// Replace existing entity with higher confidence
				if (newEntity.confidence > updatedEntities[existingIndex].confidence) {
					updatedEntities[existingIndex] = newEntity;
				}
			} else {
				// Add new entity
				updatedEntities.push(newEntity);
			}
		}
		
		// Update the intent with new entities
		const updatedIntent: ParsedIntent = {
			...intent,
			entities: updatedEntities,
			needsClarification: false, // Clarification has been addressed
			clarificationQuestions: undefined
		};
		
		return updatedIntent;
	}
	
	/**
	 * Get suggestions from memory context
	 */
	private getSuggestionsFromMemory(entityType: EntityType, context: CommandContext): any[] {
		const suggestions: any[] = [];
		
		if (!context.memoryContext) {
			return suggestions;
		}
		
		// Query memory based on entity type using the correct properties from nlpTypes
		switch (entityType) {
			case 'client_name':
				// Look for client memories
				if (context.memoryContext.clientMemories) {
					// Extract client names from client memories
					const clientNames = context.memoryContext.clientMemories
						.filter((memory: any) => memory.name)
						.map((memory: any) => memory.name);
					suggestions.push(...clientNames);
				}
				break;
				
			case 'domain':
				// Look for domains from provider memories
				if (context.memoryContext.providerMemories) {
					const domains = context.memoryContext.providerMemories
						.filter((memory: any) => memory.domain)
						.map((memory: any) => memory.domain);
					suggestions.push(...domains);
				}
				break;
				
			case 'provider_name':
				// Look for provider names from provider memories
				if (context.memoryContext.providerMemories) {
					const providerNames = context.memoryContext.providerMemories
						.filter((memory: any) => memory.providerName)
						.map((memory: any) => memory.providerName);
					suggestions.push(...providerNames);
				}
				break;
				
			case 'workflow_name':
				// Workflow names might be in document memories or we need to use workflow context
				if (context.memoryContext.documentMemories) {
					const workflowNames = context.memoryContext.documentMemories
						.filter((memory: any) => memory.type === 'workflow')
						.map((memory: any) => memory.name);
					suggestions.push(...workflowNames);
				}
				break;
				
			case 'email_address':
				// Email addresses might be in thread memories or client memories
				if (context.memoryContext.threadMemories) {
					const emails = context.memoryContext.threadMemories
						.filter((memory: any) => memory.participants)
						.flatMap((memory: any) => memory.participants)
						.filter((email: any) => typeof email === 'string' && email.includes('@'));
					suggestions.push(...emails);
				}
				break;
		}
		
		return suggestions;
	}
	
	/**
	 * Get suggestions from workflow registry
	 */
	private getSuggestionsFromWorkflows(entityType: EntityType, context: CommandContext): any[] {
		const suggestions: any[] = [];
		
		if (!context.workflowContext || entityType !== 'workflow_name') {
			return suggestions;
		}
		
		// Get available workflows from workflow registry
		if (context.workflowContext.availableWorkflows) {
			suggestions.push(...context.workflowContext.availableWorkflows);
		}
		
		return suggestions;
	}
	
	/**
	 * Get suggestions from provider registry
	 */
	private getSuggestionsFromProviders(entityType: EntityType): any[] {
		const suggestions: any[] = [];
		
		if (entityType !== 'provider_name') {
			return suggestions;
		}
		
		// Common email providers
		const commonProviders = [
			'Gmail',
			'Outlook',
			'Yahoo',
			'iCloud',
			'Brevo',
			'SendGrid',
			'Mailgun',
			'Postmark',
			'Amazon SES',
			'Custom SMTP'
		];
		
		suggestions.push(...commonProviders);
		
		return suggestions;
	}
	
	/**
	 * Get default suggestions based on entity type
	 */
	private getDefaultSuggestions(entityType: EntityType): any[] {
		const suggestions: any[] = [];
		
		switch (entityType) {
			case 'tone_preference':
				suggestions.push('professional', 'casual', 'friendly', 'formal', 'informal');
				break;
				
			case 'priority':
				suggestions.push('high', 'medium', 'low', 'urgent');
				break;
				
			case 'time_period':
				suggestions.push('today', 'yesterday', 'this week', 'last week', 'this month', 'last month', 'all time');
				break;
				
			case 'file_type':
				suggestions.push('PDF', 'DOCX', 'HTML', 'TXT', 'MD');
				break;
				case 'count':
					suggestions.push('5', '10', '20', '50', '100');
					break;
			}
			
			return suggestions;
		}
	}
			