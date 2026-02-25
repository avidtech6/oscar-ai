/**
 * Command Registry
 * 
 * Registers, manages, and provides access to available commands.
 * Supports command discovery, registration, and metadata management.
 */

import type {
	IntentType,
	EntityType,
	CommandRegistration,
	CommandContext,
	CommandRegistryConfig
} from './nlpTypes';

/**
 * Command Metadata
 */
export interface CommandMetadata {
	/** Usage count */
	usageCount: number;
	
	/** Last used timestamp */
	lastUsed: Date | null;
	
	/** Success rate (0-1) */
	successRate: number;
	
	/** Average execution time in milliseconds */
	averageExecutionTimeMs: number;
	
	/** Tags for categorization */
	tags?: string[];
	
	/** Custom metadata */
	customData?: Record<string, any>;
}

/**
 * Command Definition (extends CommandRegistration with metadata)
 */
export interface CommandDefinition extends CommandRegistration {
	/** Command metadata */
	metadata?: CommandMetadata;
	
	/** Command aliases */
	aliases?: string[];
	
	/** Command examples */
	examples?: string[];
	
	/** Command category */
	category?: string;
}

/**
 * Command Registry
 */
export class CommandRegistry {
	private commands: Map<string, CommandDefinition> = new Map();
	private categories: Map<string, Set<string>> = new Map();
	private aliases: Map<string, string> = new Map();
	private config: CommandRegistryConfig;
	private isInitialized = false;
	
	constructor(config: Partial<CommandRegistryConfig> = {}) {
		this.config = {
			autoRegisterBuiltInCommands: config.autoRegisterBuiltInCommands ?? true,
			persistRegistrations: config.persistRegistrations ?? false,
			loadRegistrationsOnStartup: config.loadRegistrationsOnStartup ?? true,
			storageKeyPrefix: config.storageKeyPrefix ?? 'command_registry_',
			maxRegisteredCommands: config.maxRegisteredCommands ?? 1000
		};
	}
	
	/**
	 * Initialize the command registry
	 */
	async initialize(): Promise<void> {
		if (this.isInitialized) {
			return;
		}
		
		console.log('Initializing Command Registry...');
		
		if (this.config.autoRegisterBuiltInCommands) {
			await this.registerBuiltInCommands();
		}
		
		if (this.config.loadRegistrationsOnStartup && this.config.persistRegistrations) {
			await this.loadFromStorage();
		}
		
		this.isInitialized = true;
		console.log(`Command Registry initialized with ${this.commands.size} commands`);
	}
	
	/**
	 * Register a command
	 */
	registerCommand(command: CommandDefinition): boolean {
		const commandId = command.id;
		
		// Check if command already exists
		if (this.commands.has(commandId)) {
			console.warn(`Command "${commandId}" already exists`);
			return false;
		}
		
		// Check max registered commands
		if (this.commands.size >= this.config.maxRegisteredCommands) {
			console.warn(`Maximum registered commands (${this.config.maxRegisteredCommands}) reached`);
			return false;
		}
		
		// Register the command
		this.commands.set(commandId, command);
		
		// Register category
		const category = command.category || 'general';
		if (!this.categories.has(category)) {
			this.categories.set(category, new Set());
		}
		this.categories.get(category)!.add(commandId);
		
		// Register aliases
		if (command.aliases) {
			for (const alias of command.aliases) {
				this.aliases.set(alias.toLowerCase(), commandId);
			}
		}
		
		console.log(`Registered command: ${commandId} (${command.intentType})`);
		
		// Persist if configured
		if (this.config.persistRegistrations) {
			this.saveToStorage();
		}
		
		return true;
	}
	
	/**
	 * Get command by ID or alias
	 */
	getCommand(commandIdOrAlias: string): CommandDefinition | null {
		// Try direct lookup
		let command = this.commands.get(commandIdOrAlias);
		
		// Try alias lookup
		if (!command) {
			const resolvedId = this.aliases.get(commandIdOrAlias.toLowerCase());
			if (resolvedId) {
				command = this.commands.get(resolvedId);
			}
		}
		
		return command || null;
	}
	
	/**
	 * Get all commands
	 */
	getAllCommands(): CommandDefinition[] {
		return Array.from(this.commands.values());
	}
	
	/**
	 * Get commands by category
	 */
	getCommandsByCategory(category: string): CommandDefinition[] {
		const commandIds = this.categories.get(category);
		if (!commandIds) {
			return [];
		}
		
		const commands: CommandDefinition[] = [];
		for (const commandId of commandIds) {
			const command = this.commands.get(commandId);
			if (command) {
				commands.push(command);
			}
		}
		
		return commands;
	}
	
	/**
	 * Get commands by intent type
	 */
	getCommandsByIntent(intent: IntentType): CommandDefinition[] {
		const commands: CommandDefinition[] = [];
		
		for (const command of this.commands.values()) {
			if (command.intentType === intent) {
				commands.push(command);
			}
		}
		
		return commands;
	}
	
	/**
	 * Search commands by keyword
	 */
	searchCommands(keyword: string, limit = 10): CommandDefinition[] {
		const searchTerm = keyword.toLowerCase();
		const results: CommandDefinition[] = [];
		
		for (const command of this.commands.values()) {
			// Search in command ID
			if (command.id.toLowerCase().includes(searchTerm)) {
				results.push(command);
				continue;
			}
			
			// Search in name
			if (command.name.toLowerCase().includes(searchTerm)) {
				results.push(command);
				continue;
			}
			
			// Search in description
			if (command.description.toLowerCase().includes(searchTerm)) {
				results.push(command);
				continue;
			}
			
			// Search in examples
			if (command.examples) {
				for (const example of command.examples) {
					if (example.toLowerCase().includes(searchTerm)) {
						results.push(command);
						break;
					}
				}
			}
		}
		
		// Sort by relevance (simple scoring)
		results.sort((a, b) => {
			const aScore = this.calculateRelevanceScore(a, searchTerm);
			const bScore = this.calculateRelevanceScore(b, searchTerm);
			return bScore - aScore;
		});
		
		return results.slice(0, limit);
	}
	
	/**
	 * Get command suggestions for context
	 */
	getCommandSuggestions(context: CommandContext): CommandDefinition[] {
		const suggestions: CommandDefinition[] = [];
		
		// Filter commands based on context
		for (const command of this.commands.values()) {
			if (this.isCommandRelevant(command, context)) {
				suggestions.push(command);
			}
		}
		
		// Sort by priority and relevance
		suggestions.sort((a, b) => {
			// First by priority
			if (a.priority !== b.priority) {
				return b.priority - a.priority;
			}
			
			// Then by usage count
			const aUsage = a.metadata?.usageCount || 0;
			const bUsage = b.metadata?.usageCount || 0;
			return bUsage - aUsage;
		});
		
		return suggestions.slice(0, 10); // Return top 10 suggestions
	}
	
	/**
	 * Update command metadata (usage count, last used, etc.)
	 */
	updateCommandMetadata(commandId: string, updates: Partial<CommandMetadata>): boolean {
		const command = this.commands.get(commandId);
		if (!command) {
			return false;
		}
		
		// Initialize metadata if not present
		if (!command.metadata) {
			command.metadata = {
				usageCount: 0,
				lastUsed: null,
				successRate: 1.0,
				averageExecutionTimeMs: 0
			};
		}
		
		// Apply updates
		if (updates.usageCount !== undefined) {
			command.metadata.usageCount = updates.usageCount;
		}
		
		if (updates.lastUsed !== undefined) {
			command.metadata.lastUsed = updates.lastUsed;
		}
		
		if (updates.successRate !== undefined) {
			command.metadata.successRate = updates.successRate;
		}
		
		if (updates.averageExecutionTimeMs !== undefined) {
			command.metadata.averageExecutionTimeMs = updates.averageExecutionTimeMs;
		}
		
		if (updates.tags) {
			command.metadata.tags = updates.tags;
		}
		
		if (updates.customData) {
			command.metadata.customData = {
				...command.metadata.customData,
				...updates.customData
			};
		}
		
		// Persist if configured
		if (this.config.persistRegistrations) {
			this.saveToStorage();
		}
		
		return true;
	}
	
	/**
	 * Increment command usage count
	 */
	incrementCommandUsage(commandId: string): boolean {
		const command = this.commands.get(commandId);
		if (!command) {
			return false;
		}
		
		// Initialize metadata if not present
		if (!command.metadata) {
			command.metadata = {
				usageCount: 0,
				lastUsed: null,
				successRate: 1.0,
				averageExecutionTimeMs: 0
			};
		}
		
		// Update usage count and last used
		command.metadata.usageCount = (command.metadata.usageCount || 0) + 1;
		command.metadata.lastUsed = new Date();
		
		// Persist if configured
		if (this.config.persistRegistrations) {
			this.saveToStorage();
		}
		
		return true;
	}
	
	/**
	 * Remove a command
	 */
	removeCommand(commandId: string): boolean {
		const command = this.commands.get(commandId);
		if (!command) {
			return false;
		}
		
		// Remove from categories
		const category = command.category || 'general';
		const categorySet = this.categories.get(category);
		if (categorySet) {
			categorySet.delete(commandId);
			if (categorySet.size === 0) {
				this.categories.delete(category);
			}
		}
		
		// Remove aliases
		if (command.aliases) {
			for (const alias of command.aliases) {
				this.aliases.delete(alias.toLowerCase());
			}
		}
		
		// Remove command
		this.commands.delete(commandId);
		
		console.log(`Removed command: ${commandId}`);
		
		// Persist if configured
		if (this.config.persistRegistrations) {
			this.saveToStorage();
		}
		
		return true;
	}
	
	/**
	 * Clear all commands
	 */
	clear(): void {
		this.commands.clear();
		this.categories.clear();
		this.aliases.clear();
		console.log('Command Registry cleared');
		
		// Persist if configured
		if (this.config.persistRegistrations) {
			this.saveToStorage();
		}
	}
	
	/**
	 * Get command statistics
	 */
	getStatistics(): {
		totalCommands: number;
		categories: number;
		aliases: number;
		mostUsedCommands: Array<{ commandId: string; usageCount: number }>;
	} {
		const totalCommands = this.commands.size;
		const categories = this.categories.size;
		const aliases = this.aliases.size;
		
		// Get most used commands
		const commandsWithUsage = Array.from(this.commands.entries())
			.map(([commandId, command]) => ({
				commandId,
				usageCount: command.metadata?.usageCount || 0
			}))
			.sort((a, b) => b.usageCount - a.usageCount)
			.slice(0, 5);
		
		return {
			totalCommands,
			categories,
			aliases,
			mostUsedCommands: commandsWithUsage
		};
	}
	
	/**
	 * Export commands to JSON
	 */
	exportCommands(): string {
		const exportData = {
			config: this.config,
			commands: Array.from(this.commands.values()),
			timestamp: new Date().toISOString()
		};
		
		return JSON.stringify(exportData, null, 2);
	}
	
	/**
	 * Import commands from JSON
	 */
	importCommands(jsonData: string): { success: boolean; imported: number; errors: string[] } {
		try {
			const data = JSON.parse(jsonData);
			const errors: string[] = [];
			let imported = 0;
			
			if (data.commands && Array.isArray(data.commands)) {
				for (const commandData of data.commands) {
					try {
						const success = this.registerCommand(commandData);
						if (success) {
							imported++;
						}
					} catch (error) {
						errors.push(`Failed to import command: ${error}`);
					}
				}
			}
			
			return {
				success: errors.length === 0,
				imported,
				errors
			};
			
		} catch (error) {
			return {
				success: false,
				imported: 0,
				errors: [`Invalid JSON data: ${error}`]
			};
		}
	}
	
	/**
	 * Calculate relevance score for search
	 */
	private calculateRelevanceScore(command: CommandDefinition, searchTerm: string): number {
		let score = 0;
		
		// Exact match in ID
		if (command.id.toLowerCase() === searchTerm) {
			score += 100;
		}
		
		// Exact match in name
		if (command.name.toLowerCase() === searchTerm) {
			score += 90;
		}
		
		// ID contains search term
		if (command.id.toLowerCase().includes(searchTerm)) {
			score += 80;
		}
		
		// Name contains search term
		if (command.name.toLowerCase().includes(searchTerm)) {
			score += 70;
		}
		
		// Description contains search term
		if (command.description.toLowerCase().includes(searchTerm)) {
			score += 60;
		}
		
		// Examples contain search term
		if (command.examples) {
			for (const example of command.examples) {
				if (example.toLowerCase().includes(searchTerm)) {
					score += 50;
					break;
				}
			}
		}
		
		// Boost by usage count
		const usageCount = command.metadata?.usageCount || 0;
		score += Math.min(usageCount, 40); // Max 40 points for usage
		
		return score;
	}
	
	/**
	 * Check if command is relevant to context
	 */
	private isCommandRelevant(command: CommandDefinition, context: CommandContext): boolean {
		// Check if command is enabled
		if (!command.enabled) {
			return false;
		}
		
		// Check system state relevance
		if (context.systemState) {
			// Deliverability commands when deliverability issues exist
			if (command.intentType === 'fix_deliverability' &&
				context.systemState.deliverabilityStatus === 'needs_attention') {
				return true;
			}
			
			// Provider commands when provider issues exist
			if (command.intentType === 'setup_provider' &&
				context.systemState.providerStatus === 'needs_setup') {
				return true;
			}
			
			// Inbox commands when inbox needs cleaning
			if (command.intentType === 'clean_inbox' &&
				context.systemState.inboxStatus === 'needs_cleaning') {
				return true;
			}
		}
		
		// Check workflow context
		if (context.workflowContext && context.workflowContext.availableWorkflows) {
			// Workflow commands when workflows are available
			if (command.intentType === 'run_workflow' &&
				context.workflowContext.availableWorkflows.length > 0) {
				return true;
			}
		}
		
		// Check memory context
		if (context.memoryContext) {
			const clientMemoriesLength = context.memoryContext.clientMemories?.length || 0;
			const threadMemoriesLength = context.memoryContext.threadMemories?.length || 0;
			
			// Memory commands when memories exist
			if (command.intentType === 'search_memory' &&
				(clientMemoriesLength > 0 || threadMemoriesLength > 0)) {
				return true;
			}
			
			// Client commands when client memories exist
			if (command.intentType === 'summarise_client' &&
				clientMemoriesLength > 0) {
				return true;
			}
			
			// Thread commands when thread memories exist
			if (command.intentType === 'summarise_thread' &&
				threadMemoriesLength > 0) {
				return true;
			}
		}
		
		// Default: return true for general commands
		return command.priority >= 50; // Only high priority commands by default
	}
	
	/**
	 * Save to storage
	 */
	private async saveToStorage(): Promise<void> {
		if (!this.config.persistRegistrations) {
			return;
		}
		
		try {
			const storageKey = `${this.config.storageKeyPrefix}commands`;
			const data = this.exportCommands();
			// In a real implementation, this would save to localStorage or a database
			// localStorage.setItem(storageKey, data);
			console.log(`Saved ${this.commands.size} commands to storage`);
		} catch (error) {
			console.error('Failed to save commands to storage:', error);
		}
	}
	
	/**
		* Load from storage
		*/
	private async loadFromStorage(): Promise<void> {
		if (!this.config.persistRegistrations) {
			return;
		}
		
		try {
			const storageKey = `${this.config.storageKeyPrefix}commands`;
			// In a real implementation, this would load from localStorage or a database
			// const data = localStorage.getItem(storageKey);
			const data = null; // Placeholder
			
			if (data) {
				const result = this.importCommands(data);
				if (result.success) {
					console.log(`Loaded ${result.imported} commands from storage`);
				} else {
					console.warn('Failed to load commands from storage:', result.errors);
				}
			}
		} catch (error) {
			console.error('Failed to load commands from storage:', error);
		}
	}
	
	/**
		* Register built-in commands
		*/
	private async registerBuiltInCommands(): Promise<void> {
		console.log('Registering built-in commands...');
		
		const builtInCommands: CommandDefinition[] = [
			// Deliverability commands
			{
				id: 'fix_deliverability',
				name: 'Fix Deliverability',
				description: 'Fix email deliverability issues',
				intentType: 'fix_deliverability',
				requiredEntities: ['domain'],
				optionalEntities: ['provider_name'],
				handler: async () => ({ success: true, executionTimeMs: 0 }),
				enabled: true,
				priority: 90,
				category: 'deliverability',
				aliases: ['fix-deliverability', 'improve-deliverability', 'spam-fix'],
				examples: [
					'Fix deliverability for my domain',
					'Why are my emails going to spam?',
					'Improve email deliverability'
				]
			},
			{
				id: 'check_deliverability',
				name: 'Check Deliverability',
				description: 'Check email deliverability status',
				intentType: 'fix_deliverability',
				requiredEntities: ['domain'],
				handler: async () => ({ success: true, executionTimeMs: 0 }),
				enabled: true,
				priority: 80,
				category: 'deliverability',
				aliases: ['deliverability-check', 'spam-check'],
				examples: [
					'Check deliverability for example.com',
					'How is my email deliverability?',
					'Deliverability report'
				]
			},
			
			// Provider commands
			{
				id: 'setup_provider',
				name: 'Setup Provider',
				description: 'Set up email provider',
				intentType: 'setup_provider',
				requiredEntities: ['provider_name', 'email_address'],
				handler: async () => ({ success: true, executionTimeMs: 0 }),
				enabled: true,
				priority: 90,
				category: 'providers',
				aliases: ['configure-provider', 'connect-provider', 'add-provider'],
				examples: [
					'Set up Gmail',
					'Configure Outlook for email',
					'Connect my email provider'
				]
			},
			{
				id: 'test_provider',
				name: 'Test Provider',
				description: 'Test email provider connection',
				intentType: 'setup_provider',
				requiredEntities: ['provider_name'],
				handler: async () => ({ success: true, executionTimeMs: 0 }),
				enabled: true,
				priority: 80,
				category: 'providers',
				aliases: ['test-connection', 'verify-provider'],
				examples: [
					'Test Gmail connection',
					'Check if my provider is working',
					'Verify email settings'
				]
			},
			
			// Email commands
			{
				id: 'draft_email',
				name: 'Draft Email',
				description: 'Draft a new email',
				intentType: 'draft_email',
				requiredEntities: ['email_address', 'subject'],
				optionalEntities: ['tone_preference', 'priority'],
				handler: async () => ({ success: true, executionTimeMs: 0 }),
				enabled: true,
				priority: 85,
				category: 'email',
				aliases: ['compose-email', 'write-email', 'create-email'],
				examples: [
					'Draft an email to John',
					'Write email about project update',
					'Compose email to client'
				]
			},
			{
				id: 'summarise_thread',
				name: 'Summarise Thread',
				description: 'Summarise email thread',
				intentType: 'summarise_thread',
				requiredEntities: ['thread_id'],
				handler: async () => ({ success: true, executionTimeMs: 0 }),
				enabled: true,
				priority: 75,
				category: 'email',
				aliases: ['thread-summary', 'email-summary', 'conversation-summary'],
				examples: [
					'Summarise this email thread',
					'What is this thread about?',
					'Give me a summary of this conversation'
				]
			},
			
			// Client commands
			{
				id: 'summarise_client',
				name: 'Summarise Client',
				description: 'Summarise client interactions',
				intentType: 'summarise_client',
				requiredEntities: ['client_name'],
				handler: async () => ({ success: true, executionTimeMs: 0 }),
				enabled: true,
				priority: 80,
				category: 'clients',
				aliases: ['client-summary', 'client-history', 'interaction-summary'],
				examples: [
					'Summarise interactions with Acme Corp',
					'What is my history with this client?',
					'Client summary for John Doe'
				]
			},
			
			// Document commands
			{
				id: 'generate_document',
				name: 'Generate Document',
				description: 'Generate a document',
				intentType: 'generate_document',
				requiredEntities: ['document_name'],
				optionalEntities: ['file_type', 'tone_preference'],
				handler: async () => ({ success: true, executionTimeMs: 0 }),
				enabled: true,
				priority: 85,
				category: 'documents',
				aliases: ['create-document', 'make-document', 'produce-document'],
				examples: [
					'Generate a report',
					'Create a PDF document',
					'Make a proposal document'
				]
			},
			{
				id: 'improve_style',
				name: 'Improve Style',
				description: 'Improve writing style',
				intentType: 'improve_style',
				requiredEntities: [],
				optionalEntities: ['tone_preference'],
				handler: async () => ({ success: true, executionTimeMs: 0 }),
				enabled: true,
				priority: 70,
				category: 'documents',
				aliases: ['enhance-style', 'rewrite-better', 'improve-writing'],
				examples: [
					'Improve the style of this text',
					'Make this more professional',
					'Rewrite this in a better tone'
				]
			},
			
			// Workflow commands
			{
				id: 'run_workflow',
				name: 'Run Workflow',
				description: 'Run a workflow',
				intentType: 'run_workflow',
				requiredEntities: ['workflow_name'],
				handler: async () => ({ success: true, executionTimeMs: 0 }),
				enabled: true,
				priority: 90,
				category: 'workflows',
				aliases: ['execute-workflow', 'start-workflow', 'trigger-workflow'],
				examples: [
					'Run campaign workflow',
					'Start newsletter sequence',
					'Execute follow-up workflow'
				]
			},
			
			// Agent commands
			{
				id: 'clean_inbox',
				name: 'Clean Inbox',
				description: 'Clean and organize inbox',
				intentType: 'clean_inbox',
				requiredEntities: [],
				handler: async () => ({ success: true, executionTimeMs: 0 }),
				enabled: true,
				priority: 85,
				category: 'agents',
				aliases: ['organize-inbox', 'sort-emails', 'inbox-cleanup'],
				examples: [
					'Clean my inbox',
					'Organize emails',
					'Sort my inbox by priority'
				]
			},
			
			// Memory commands
			{
				id: 'search_memory',
				name: 'Search Memory',
				description: 'Search memory for information',
				intentType: 'search_memory',
				requiredEntities: [],
				handler: async () => ({ success: true, executionTimeMs: 0 }),
				enabled: true,
				priority: 75,
				category: 'memory',
				aliases: ['search-history', 'find-in-memory', 'memory-search'],
				examples: [
					'Search for client conversations',
					'Find emails about project X',
					'Search my memory for meeting notes'
				]
			},
			
			// Question commands
			{
				id: 'ask_question',
				name: 'Ask Question',
				description: 'Ask a question about the system',
				intentType: 'ask_question',
				requiredEntities: [],
				handler: async () => ({ success: true, executionTimeMs: 0 }),
				enabled: true,
				priority: 60,
				category: 'general',
				aliases: ['question', 'help', 'explain'],
				examples: [
					'How do I set up email?',
					'What can you do?',
					'Explain deliverability to me'
				]
			},
			
			// Explanation commands
			{
				id: 'explain_issue',
				name: 'Explain Issue',
				description: 'Explain a system issue',
				intentType: 'explain_issue',
				requiredEntities: [],
				handler: async () => ({ success: true, executionTimeMs: 0 }),
				enabled: true,
				priority: 65,
				category: 'general',
				aliases: ['explain-problem', 'issue-explanation'],
				examples: [
					'Explain why my emails are failing',
					'What does this error mean?',
					'Help me understand this issue'
				]
			},
			
			// Recommendation commands
			{
				id: 'show_recommendations',
				name: 'Show Recommendations',
				description: 'Show system recommendations',
				intentType: 'show_recommendations',
				requiredEntities: [],
				handler: async () => ({ success: true, executionTimeMs: 0 }),
				enabled: true,
				priority: 70,
				category: 'general',
				aliases: ['recommendations', 'suggestions', 'advice'],
				examples: [
					'What should I do next?',
					'Give me recommendations',
					'What improvements can I make?'
				]
			}
		];
		
		// Register all built-in commands
		for (const command of builtInCommands) {
			this.registerCommand(command);
		}
		
		console.log(`Registered ${builtInCommands.length} built-in commands`);
	}
}