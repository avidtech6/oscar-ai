/**
 * Command Palette UI Hooks
 * 
 * Provides React/Svelte hooks for integrating the Natural Language Command Layer
 * with the UI, specifically the Command Palette.
 */

import type {
	IntentType,
	EntityType,
	ParsedCommand,
	CommandContext,
	CommandResult,
	CommandRegistration
} from './nlpTypes';

import type { NlpOrchestratorIntegration } from './nlpOrchestratorIntegration';
import type { CopilotOrchestrator } from '../orchestrator/orchestrator';

/**
 * Command Palette State
 */
export interface CommandPaletteState {
	/** Whether the command palette is visible */
	isVisible: boolean;
	
	/** Current search query */
	searchQuery: string;
	
	/** Filtered command suggestions */
	suggestedCommands: Array<{
		command: string;
		description: string;
		intentType: IntentType;
		confidence: number;
	}>;
	
	/** Selected command index */
	selectedIndex: number;
	
	/** Whether commands are loading */
	isLoading: boolean;
	
	/** Error message if any */
	error?: string;
	
	/** Recent commands history */
	recentCommands: ParsedCommand[];
	
	/** Whether clarification is needed */
	needsClarification: boolean;
	
	/** Clarification questions if needed */
	clarificationQuestions: string[];
	
	/** Current clarification responses */
	clarificationResponses: string[];
}

/**
 * Command Palette Configuration
 */
export interface CommandPaletteConfig {
	/** Maximum number of suggestions to show */
	maxSuggestions: number;
	
	/** Minimum confidence for suggestions (0-1) */
	minConfidence: number;
	
	/** Whether to show recent commands */
	showRecentCommands: boolean;
	
	/** Whether to auto-execute high-confidence commands */
	autoExecuteHighConfidence: boolean;
	
	/** Confidence threshold for auto-execution (0-1) */
	autoExecuteConfidenceThreshold: number;
	
	/** Whether to show command descriptions */
	showDescriptions: boolean;
	
	/** Whether to group commands by category */
	groupByCategory: boolean;
	
	/** Whether to enable keyboard shortcuts */
	enableKeyboardShortcuts: boolean;
	
	/** Whether to log UI interactions */
	logInteractions: boolean;
	
	/** Whether to animate transitions */
	animateTransitions: boolean;
}

/**
 * Command Palette UI Hooks
 */
export class CommandPaletteHooks {
	private nlpIntegration: NlpOrchestratorIntegration;
	private config: CommandPaletteConfig;
	
	private state: CommandPaletteState;
	private stateListeners: Array<(state: CommandPaletteState) => void> = [];
	
	private commandHistory: Array<{
		command: string;
		timestamp: Date;
		result: CommandResult;
	}> = [];
	
	private keyboardShortcuts: Map<string, () => void> = new Map();
	
	constructor(
		nlpIntegration: NlpOrchestratorIntegration,
		config: Partial<CommandPaletteConfig> = {}
	) {
		this.nlpIntegration = nlpIntegration;
		
		this.config = {
			maxSuggestions: config.maxSuggestions ?? 10,
			minConfidence: config.minConfidence ?? 0.3,
			showRecentCommands: config.showRecentCommands ?? true,
			autoExecuteHighConfidence: config.autoExecuteHighConfidence ?? false,
			autoExecuteConfidenceThreshold: config.autoExecuteConfidenceThreshold ?? 0.9,
			showDescriptions: config.showDescriptions ?? true,
			groupByCategory: config.groupByCategory ?? false,
			enableKeyboardShortcuts: config.enableKeyboardShortcuts ?? true,
			logInteractions: config.logInteractions ?? true,
			animateTransitions: config.animateTransitions ?? true,
			...config
		};
		
		this.state = {
			isVisible: false,
			searchQuery: '',
			suggestedCommands: [],
			selectedIndex: 0,
			isLoading: false,
			recentCommands: [],
			needsClarification: false,
			clarificationQuestions: [],
			clarificationResponses: []
		};
		
		this.setupKeyboardShortcuts();
	}
	
	/**
	 * Initialize the command palette
	 */
	async initialize(): Promise<void> {
		// Ensure NLP integration is initialized
		await this.nlpIntegration.initialize();
		
		// Load recent commands from storage
		await this.loadRecentCommands();
		
		if (this.config.logInteractions) {
			console.log('Command palette initialized');
		}
	}
	
	/**
	 * Show the command palette
	 */
	show(): void {
		this.setState({
			isVisible: true,
			searchQuery: '',
			suggestedCommands: [],
			selectedIndex: 0,
			isLoading: false,
			needsClarification: false,
			clarificationQuestions: [],
			clarificationResponses: []
		});
		
		// Focus the search input
		this.focusSearchInput();
		
		if (this.config.logInteractions) {
			console.log('Command palette shown');
		}
	}
	
	/**
	 * Hide the command palette
	 */
	hide(): void {
		this.setState({
			isVisible: false,
			searchQuery: '',
			suggestedCommands: [],
			selectedIndex: 0,
			isLoading: false,
			needsClarification: false,
			clarificationQuestions: [],
			clarificationResponses: []
		});
		
		if (this.config.logInteractions) {
			console.log('Command palette hidden');
		}
	}
	
	/**
	 * Toggle the command palette visibility
	 */
	toggle(): void {
		if (this.state.isVisible) {
			this.hide();
		} else {
			this.show();
		}
	}
	
	/**
	 * Update search query
	 */
	async updateSearchQuery(query: string): Promise<void> {
		this.setState({
			searchQuery: query,
			selectedIndex: 0,
			isLoading: true
		});
		
		try {
			// Get command suggestions based on query
			const suggestions = await this.getCommandSuggestions(query);
			
			this.setState({
				suggestedCommands: suggestions,
				isLoading: false
			});
			
			// Auto-execute if high confidence and enabled
			if (this.config.autoExecuteHighConfidence && suggestions.length > 0) {
				const topSuggestion = suggestions[0];
				if (topSuggestion.confidence >= this.config.autoExecuteConfidenceThreshold) {
					await this.executeCommand(topSuggestion.command);
					return;
				}
			}
		} catch (error) {
			this.setState({
				error: error instanceof Error ? error.message : 'Failed to get suggestions',
				isLoading: false
			});
		}
	}
	
	/**
	 * Execute a command
	 */
	async executeCommand(command: string): Promise<void> {
		if (!command.trim()) {
			return;
		}
		
		this.setState({
			isLoading: true,
			error: undefined
		});
		
		try {
			let result: CommandResult;
			
			if (this.state.needsClarification) {
				// Process command with clarification responses
				const clarificationResponses = [...this.state.clarificationResponses, command];
				result = await this.nlpIntegration.processCommandWithClarification(
					this.state.searchQuery,
					clarificationResponses
				);
				
				if (result.success) {
					// Clarification complete
					this.setState({
						needsClarification: false,
						clarificationQuestions: [],
						clarificationResponses: []
					});
				} else if (result.followUpQuestions && result.followUpQuestions.length > 0) {
					// More clarification needed
					this.setState({
						needsClarification: true,
						clarificationQuestions: result.followUpQuestions,
						clarificationResponses: clarificationResponses
					});
				}
			} else {
				// Process regular command
				result = await this.nlpIntegration.processCommand(command);
				
				// Check if clarification is needed
				if (!result.success && result.followUpQuestions && result.followUpQuestions.length > 0) {
					this.setState({
						needsClarification: true,
						clarificationQuestions: result.followUpQuestions,
						clarificationResponses: []
					});
				}
			}
			
			// Add to history
			this.addToHistory(command, result);
			
			// Update recent commands - we don't have parsedCommand in result
			// Instead, we'll create a simple parsed command from the executed command
			const mockParsedCommand: ParsedCommand = {
				id: `cmd_${Date.now()}`,
				intent: {
					type: 'unknown',
					confidence: 1.0,
					originalText: command,
					entities: [],
					parameters: {},
					needsClarification: false
				},
				executionParams: {},
				timestamp: new Date()
			};
			this.updateRecentCommands(mockParsedCommand);
			
			// Hide palette if command was successful and no clarification needed
			if (result.success && !this.state.needsClarification) {
				this.hide();
			}
			
			this.setState({
				isLoading: false,
				error: result.success ? undefined : result.error
			});
			
			if (this.config.logInteractions) {
				console.log(`Command executed: "${command}" - ${result.success ? 'success' : 'error'}`);
			}
		} catch (error) {
			this.setState({
				isLoading: false,
				error: error instanceof Error ? error.message : 'Failed to execute command'
			});
			
			if (this.config.logInteractions) {
				console.error(`Failed to execute command "${command}":`, error);
			}
		}
	}
	
	/**
	 * Execute selected command
	 */
	async executeSelectedCommand(): Promise<void> {
		if (this.state.suggestedCommands.length === 0) {
			// Execute the search query as a command
			await this.executeCommand(this.state.searchQuery);
			return;
		}
		
		const selectedCommand = this.state.suggestedCommands[this.state.selectedIndex];
		if (selectedCommand) {
			await this.executeCommand(selectedCommand.command);
		}
	}
	
	/**
	 * Select next command
	 */
	selectNextCommand(): void {
		if (this.state.suggestedCommands.length === 0) {
			return;
		}
		
		const newIndex = (this.state.selectedIndex + 1) % this.state.suggestedCommands.length;
		this.setState({
			selectedIndex: newIndex
		});
	}
	
	/**
	 * Select previous command
	 */
	selectPreviousCommand(): void {
		if (this.state.suggestedCommands.length === 0) {
			return;
		}
		
		const newIndex = this.state.selectedIndex === 0 
			? this.state.suggestedCommands.length - 1 
			: this.state.selectedIndex - 1;
		
		this.setState({
			selectedIndex: newIndex
		});
	}
	
	/**
	 * Clear search query
	 */
	clearSearchQuery(): void {
		this.setState({
			searchQuery: '',
			suggestedCommands: [],
			selectedIndex: 0,
			needsClarification: false,
			clarificationQuestions: [],
			clarificationResponses: []
		});
	}
	
	/**
	 * Get command suggestions
	 */
	private async getCommandSuggestions(query: string): Promise<CommandPaletteState['suggestedCommands']> {
		if (!query.trim()) {
			// Get context-based suggestions when query is empty
			return await this.nlpIntegration.getSuggestedCommands();
		}
		
		// Get suggestions from NLP integration
		const suggestions = await this.nlpIntegration.getSuggestedCommands({
			recentCommands: this.state.recentCommands
		});
		
		// Filter by query
		const filteredSuggestions = suggestions.filter(suggestion => {
			const searchText = `${suggestion.command} ${suggestion.description}`.toLowerCase();
			return searchText.includes(query.toLowerCase());
		});
		
		// Apply confidence filter
		const confidentSuggestions = filteredSuggestions.filter(
			suggestion => suggestion.confidence >= this.config.minConfidence
		);
		
		// Limit to max suggestions
		return confidentSuggestions.slice(0, this.config.maxSuggestions);
	}
	
	/**
	 * Add command to history
	 */
	private addToHistory(command: string, result: CommandResult): void {
		this.commandHistory.unshift({
			command,
			timestamp: new Date(),
			result
		});
		
		// Limit history size
		if (this.commandHistory.length > 50) {
			this.commandHistory = this.commandHistory.slice(0, 50);
		}
		
		// Save to storage
		this.saveCommandHistory();
	}
	
	/**
	 * Update recent commands
	 */
	private updateRecentCommands(parsedCommand: ParsedCommand): void {
		this.state.recentCommands.unshift(parsedCommand);
		
		// Limit to 10 recent commands
		if (this.state.recentCommands.length > 10) {
			this.state.recentCommands = this.state.recentCommands.slice(0, 10);
		}
		
		// Save to storage
		this.saveRecentCommands();
	}
	
	/**
	 * Load recent commands from storage
	 */
	private async loadRecentCommands(): Promise<void> {
		try {
			// In a real implementation, this would load from localStorage or a database
			// For now, we'll just initialize with empty array
			this.state.recentCommands = [];
		} catch (error) {
			console.error('Failed to load recent commands:', error);
		}
	}
	
	/**
	 * Save recent commands to storage
	 */
	private async saveRecentCommands(): Promise<void> {
		try {
			// In a real implementation, this would save to localStorage or a database
			// For now, we'll just log it
			if (this.config.logInteractions) {
				console.log('Recent commands saved:', this.state.recentCommands.length);
			}
		} catch (error) {
			console.error('Failed to save recent commands:', error);
		}
	}
	
	/**
	 * Save command history to storage
	 */
	private async saveCommandHistory(): Promise<void> {
		try {
			// In a real implementation, this would save to localStorage or a database
			// For now, we'll just log it
			if (this.config.logInteractions) {
				console.log('Command history saved:', this.commandHistory.length);
			}
		} catch (error) {
			console.error('Failed to save command history:', error);
		}
	}
	
	/**
	 * Set up keyboard shortcuts
	 */
	private setupKeyboardShortcuts(): void {
		if (!this.config.enableKeyboardShortcuts) {
			return;
		}
		
		// Global keyboard shortcut to show command palette (Ctrl/Cmd + K)
		const handleKeyDown = (event: KeyboardEvent) => {
			// Check for Ctrl+K or Cmd+K
			if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
				event.preventDefault();
				this.toggle();
			}
			
			// Handle Escape to hide palette
			if (event.key === 'Escape' && this.state.isVisible) {
				event.preventDefault();
				this.hide();
			}
			
			// Handle arrow keys when palette is visible
			if (this.state.isVisible) {
				switch (event.key) {
					case 'ArrowDown':
						event.preventDefault();
						this.selectNextCommand();
						break;
						
					case 'ArrowUp':
						event.preventDefault();
						this.selectPreviousCommand();
						break;
						
					case 'Enter':
						event.preventDefault();
						this.executeSelectedCommand();
						break;
				}
			}
		};
		
		// Add event listener
		if (typeof window !== 'undefined') {
			window.addEventListener('keydown', handleKeyDown);
			
			// Store reference for cleanup
			this.keyboardShortcuts.set('global', () => {
				window.removeEventListener('keydown', handleKeyDown);
			});
		}
	}
	
	/**
	 * Focus search input
	 */
	private focusSearchInput(): void {
		// In a real implementation, this would focus the search input element
		// For now, we'll just log it
		if (this.config.logInteractions) {
			console.log('Search input focused');
		}
	}
	
	/**
	 * Get current state
	 */
	getState(): CommandPaletteState {
		return { ...this.state };
	}
	
	/**
	 * Get configuration
	 */
	getConfig(): CommandPaletteConfig {
		return { ...this.config };
	}
	
	/**
	 * Update configuration
	 */
	updateConfig(config: Partial<CommandPaletteConfig>): void {
		this.config = { ...this.config, ...config };
		
		if (this.config.logInteractions) {
			console.log('Command palette configuration updated');
		}
	}
	
	/**
	 * Add state listener
	 */
	addStateListener(listener: (state: CommandPaletteState) => void): void {
		this.stateListeners.push(listener);
	}
	
	/**
	 * Remove state listener
	 */
	removeStateListener(listener: (state: CommandPaletteState) => void): void {
		const index = this.stateListeners.indexOf(listener);
		if (index !== -1) {
			this.stateListeners.splice(index, 1);
		}
	}
	
	/**
	 * Set state and notify listeners
	 */
	private setState(updates: Partial<CommandPaletteState>): void {
		const oldState = this.state;
		this.state = { ...this.state, ...updates };
		
		// Notify listeners if state changed
		if (JSON.stringify(oldState) !== JSON.stringify(this.state)) {
			this.notifyStateListeners();
		}
	}
	
	/**
	 * Notify all state listeners
	 */
	private notifyStateListeners(): void {
		const state = this.getState();
		for (const listener of this.stateListeners) {
			try {
				listener(state);
			} catch (error) {
				console.error('Error in state listener:', error);
			}
		}
	}
	
	/**
	 * Clean up resources
	 */
	cleanup(): void {
		// Remove keyboard shortcuts
		for (const cleanup of this.keyboardShortcuts.values()) {
			cleanup();
		}
		
		this.keyboardShortcuts.clear();
		this.stateListeners = [];
		
		if (this.config.logInteractions) {
			console.log('Command palette cleaned up');
		}
	}
	
	/**
	 * Get command history
	 */
	getCommandHistory(): Array<{
		command: string;
		timestamp: Date;
		result: CommandResult;
	}> {
		return [...this.commandHistory];
	}
	
	/**
	 * Clear command history
	 */
	clearCommandHistory(): void {
		this.commandHistory = [];
		
		if (this.config.logInteractions) {
			console.log('Command history cleared');
		}
	}
	
	/**
	 * Get command statistics
	 */
	getCommandStatistics(): {
		totalCommands: number;
		successfulCommands: number;
		failedCommands: number;
		averageExecutionTimeMs: number;
		mostUsedCommands: Array<{command: string; count: number}>;
	} {
		const totalCommands = this.commandHistory.length;
		const successfulCommands = this.commandHistory.filter(cmd => cmd.result.success).length;
		const failedCommands = totalCommands - successfulCommands;
		
		const totalExecutionTime = this.commandHistory.reduce((sum, cmd) =>
			sum + (cmd.result.executionTimeMs || 0), 0);
		const averageExecutionTimeMs = totalCommands > 0 ? totalExecutionTime / totalCommands : 0;
		
		// Count command usage
		const commandCounts = new Map<string, number>();
		for (const cmd of this.commandHistory) {
			const count = commandCounts.get(cmd.command) || 0;
			commandCounts.set(cmd.command, count + 1);
		}
		
		const mostUsedCommands = Array.from(commandCounts.entries())
			.map(([command, count]) => ({ command, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 10);
		
		return {
			totalCommands,
			successfulCommands,
			failedCommands,
			averageExecutionTimeMs,
			mostUsedCommands
		};
	}
}