/**
 * Natural Language Command Layer Types
 * 
 * Defines the natural language interface for Oscar AI's Communication Hub.
 * Supports intent detection, entity extraction, memory-aware reasoning,
 * workflow routing, and conversational clarification.
 */

/**
 * Intent Type - determines what action the user wants to perform
 */
export type IntentType =
	| 'fix_deliverability'       // Fix email deliverability issues
	| 'setup_provider'           // Setup email provider
	| 'summarise_thread'         // Summarise email thread
	| 'summarise_client'         // Summarise client history
	| 'generate_document'        // Generate PDF/report/document
	| 'draft_email'             // Draft email
	| 'clean_inbox'             // Clean inbox
	| 'run_workflow'            // Run workflow by name
	| 'ask_question'            // Ask question about system
	| 'search_memory'           // Search memory
	| 'improve_style'           // Improve writing style
	| 'explain_issue'           // Explain deliverability/provider issue
	| 'show_recommendations'    // Show recommendations
	| 'unknown'                 // Unknown intent

/**
 * Entity Type - types of entities that can be extracted from text
 */
export type EntityType =
	| 'client_name'             // Client name
	| 'domain'                  // Email domain
	| 'thread_id'               // Thread identifier
	| 'provider_name'           // Email provider name
	| 'document_name'           // Document name
	| 'workflow_name'          // Workflow name
	| 'date'                   // Date reference
	| 'count'                  // Numerical count
	| 'tone_preference'        // Tone/style preference
	| 'email_address'          // Email address
	| 'subject'                // Email subject
	| 'priority'               // Priority level
	| 'time_period'            // Time period (e.g., "last week")
	| 'file_type'              // File type (PDF, DOCX, etc.)

/**
 * Extracted Entity - an entity found in the user's command
 */
export interface ExtractedEntity {
	/** Entity type */
	type: EntityType;
	
	/** Entity value */
	value: string;
	
	/** Confidence score (0-1) */
	confidence: number;
	
	/** Start position in original text */
	start: number;
	
	/** End position in original text */
	end: number;
	
	/** Additional metadata */
	metadata?: Record<string, any>;
}

/**
 * Parsed Intent - the detected intent from user command
 */
export interface ParsedIntent {
	/** Intent type */
	type: IntentType;
	
	/** Confidence score (0-1) */
	confidence: number;
	
	/** Original text */
	originalText: string;
	
	/** Extracted entities */
	entities: ExtractedEntity[];
	
	/** Intent-specific parameters */
	parameters: Record<string, any>;
	
	/** Context from memory/previous interactions */
	context?: CommandContext;
	
	/** Whether clarification is needed */
	needsClarification: boolean;
	
	/** Clarification questions if needed */
	clarificationQuestions?: string[];
}

/**
 * Parsed Command - complete parsed command ready for execution
 */
export interface ParsedCommand {
	/** Unique command ID */
	id: string;
	
	/** Parsed intent */
	intent: ParsedIntent;
	
	/** Target workflow ID (if applicable) */
	workflowId?: string;
	
	/** Target action ID (if applicable) */
	actionId?: string;
	
	/** Target agent ID (if applicable) */
	agentId?: string;
	
	/** Memory query (if applicable) */
	memoryQuery?: string;
	
	/** Execution parameters */
	executionParams: Record<string, any>;
	
	/** Timestamp */
	timestamp: Date;
	
	/** User ID */
	userId?: string;
	
	/** Session ID */
	sessionId?: string;
}

/**
 * Clarification Request - request for more information from user
 */
export interface ClarificationRequest {
	/** Request ID */
	id: string;
	
	/** Original parsed command */
	originalCommand: ParsedCommand;
	
	/** Questions to ask */
	questions: string[];
	
	/** Missing entities */
	missingEntities: EntityType[];
	
	/** Ambiguous parameters */
	ambiguousParameters: string[];
	
	/** Suggested values for clarification */
	suggestedValues?: Record<string, any[]>;
	
	/** Timestamp */
	timestamp: Date;
}

/**
 * Command Result - result of command execution
 */
export interface CommandResult {
	/** Success status */
	success: boolean;
	
	/** Result data */
	data?: any;
	
	/** Error message if failed */
	error?: string;
	
	/** Suggestions generated */
	suggestions?: string[];
	
	/** Workflows triggered */
	workflowsTriggered?: string[];
	
	/** Actions taken */
	actionsTaken?: Array<{
		action: string;
		target: string;
		result: 'success' | 'partial' | 'failure';
	}>;
	
	/** Execution time in milliseconds */
	executionTimeMs: number;
	
	/** Follow-up questions (if any) */
	followUpQuestions?: string[];
	
	/** Next suggested commands */
	nextSuggestedCommands?: ParsedCommand[];
}

/**
 * Command Context - context for command interpretation
 */
export interface CommandContext {
	/** Current user */
	user?: {
		id: string;
		name: string;
		preferences?: Record<string, any>;
	};
	
	/** Current workspace */
	workspace?: {
		id: string;
		name: string;
		type: string;
	};
	
	/** Recent commands */
	recentCommands?: ParsedCommand[];
	
	/** Memory context */
	memoryContext?: {
		clientMemories?: any[];
		threadMemories?: any[];
		documentMemories?: any[];
		styleMemories?: any[];
		providerMemories?: any[];
	};
	
	/** Workflow context */
	workflowContext?: {
		activeWorkflows?: any[];
		recentWorkflows?: any[];
		availableWorkflows?: any[];
	};
	
	/** Agent context */
	agentContext?: {
		activeAgents?: any[];
		recentAgentResults?: any[];
	};
	
	/** System state */
	systemState?: {
		deliverabilityStatus?: string;
		providerStatus?: string;
		inboxStatus?: string;
		documentStatus?: string;
	};
	
	/** Conversation history */
	conversationHistory?: Array<{
		role: 'user' | 'assistant' | 'system';
		content: string;
		timestamp: Date;
	}>;
}

/**
 * Command Handler - function that handles a command
 */
export type CommandHandler = (
	parsedCommand: ParsedCommand,
	context: CommandContext
) => Promise<CommandResult>;

/**
 * Command Registration - registration for a command
 */
export interface CommandRegistration {
	/** Command ID */
	id: string;
	
	/** Command name */
	name: string;
	
	/** Command description */
	description: string;
	
	/** Intent type */
	intentType: IntentType;
	
	/** Required entities */
	requiredEntities?: EntityType[];
	
	/** Optional entities */
	optionalEntities?: EntityType[];
	
	/** Handler function */
	handler: CommandHandler;
	
	/** Whether command is enabled */
	enabled: boolean;
	
	/** Priority (0-100) */
	priority: number;
	
	/** Command-specific configuration */
	config?: Record<string, any>;
}

/**
 * NLP Engine Configuration
 */
export interface NlpEngineConfig {
	/** Minimum confidence for intent detection (0-1) */
	minIntentConfidence: number;
	
	/** Minimum confidence for entity extraction (0-1) */
	minEntityConfidence: number;
	
	/** Whether to use memory for context */
	useMemoryContext: boolean;
	
	/** Whether to use workflow context */
	useWorkflowContext: boolean;
	
	/** Whether to use agent context */
	useAgentContext: boolean;
	
	/** Maximum clarification attempts */
	maxClarificationAttempts: number;
	
	/** Whether to log NLP processing */
	logProcessing: boolean;
	
	/** Whether to cache parsed commands */
	cacheParsedCommands: boolean;
	
	/** Cache TTL in milliseconds */
	cacheTtlMs: number;
	
	/** Default language */
	defaultLanguage: string;
}

/**
 * Entity Extractor Configuration
 */
export interface EntityExtractorConfig {
	/** Whether to use regex patterns */
	useRegexPatterns: boolean;
	
	/** Whether to use ML models */
	useMlModels: boolean;
	
	/** Whether to use memory lookups */
	useMemoryLookups: boolean;
	
	/** Whether to use workflow registry lookups */
	useWorkflowLookups: boolean;
	
	/** Whether to use provider registry lookups */
	useProviderLookups: boolean;
	
	/** Minimum entity confidence (0-1) */
	minEntityConfidence: number;
	
	/** Maximum entities to extract */
	maxEntities: number;
}

/**
 * Intent Router Configuration
 */
export interface IntentRouterConfig {
	/** Whether to auto-trigger workflows */
	autoTriggerWorkflows: boolean;
	
	/** Whether to auto-trigger actions */
	autoTriggerActions: boolean;
	
	/** Whether to auto-trigger memory queries */
	autoTriggerMemoryQueries: boolean;
	
	/** Whether to auto-trigger document intelligence */
	autoTriggerDocumentIntelligence: boolean;
	
	/** Whether to auto-trigger deliverability intelligence */
	autoTriggerDeliverabilityIntelligence: boolean;
	
	/** Whether to auto-trigger provider intelligence */
	autoTriggerProviderIntelligence: boolean;
	
	/** Default fallback intent */
	defaultFallbackIntent: IntentType;
	
	/** Maximum routing attempts */
	maxRoutingAttempts: number;
}

/**
 * Clarification Engine Configuration
 */
export interface ClarificationEngineConfig {
	/** Whether to ask clarifying questions */
	askClarifyingQuestions: boolean;
	
	/** Maximum clarification questions per command */
	maxQuestionsPerCommand: number;
	
	/** Whether to suggest values */
	suggestValues: boolean;
	
	/** Whether to use memory for suggestions */
	useMemoryForSuggestions: boolean;
	
	/** Whether to use workflow registry for suggestions */
	useWorkflowRegistryForSuggestions: boolean;
	
	/** Whether to use provider registry for suggestions */
	useProviderRegistryForSuggestions: boolean;
	
	/** Clarification timeout in milliseconds */
	clarificationTimeoutMs: number;
}

/**
 * Command Registry Configuration
 */
export interface CommandRegistryConfig {
	/** Whether to auto-register built-in commands */
	autoRegisterBuiltInCommands: boolean;
	
	/** Whether to persist command registrations */
	persistRegistrations: boolean;
	
	/** Whether to load registrations on startup */
	loadRegistrationsOnStartup: boolean;
	
	/** Storage key prefix */
	storageKeyPrefix: string;
	
	/** Maximum registered commands */
	maxRegisteredCommands: number;
}