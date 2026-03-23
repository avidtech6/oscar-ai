/**
 * Voice Interaction Engine for Phase 34.5
 * Orchestrates speech recognition and command parsing
 */

import type {
  VoiceIntentType,
  VoiceCommand,
  VoiceIntent,
  VoiceCommandParameters,
  VoiceInteractionContext,
  VoiceInteractionEngineConfig,
  VoiceInteractionResult,
  VoiceFeedback,
  SpeechRecognitionStats,
  VoiceCommandHistory,
  CommandParserConfig,
  ParsedCommand,
  SpeechRecognitionConfig
} from './voice-interaction-types';

export class VoiceInteractionEngine {
  private recognizer: SpeechRecognizer;
  private parser: CommandParser;
  private context: VoiceInteractionContext;
  private config: VoiceInteractionEngineConfig;
  private commandHistory: VoiceCommandHistory = {
    commands: [],
    limit: 100
  };
  private isListening: boolean = false;
  private isProcessing: boolean = false;
  private lastFeedback: VoiceFeedback | null = null;
  private commandQueue: VoiceCommand[] = [];

  constructor(config: Partial<VoiceInteractionEngineConfig> = {}) {
    this.config = this.normalizeConfig(config);
    this.recognizer = new SpeechRecognizer(this.config);
    this.parser = new CommandParser(this.config);
    this.context = this.createInitialContext();
  }

  /**
   * Normalize and validate configuration
   */
  private normalizeConfig(config: Partial<VoiceInteractionEngineConfig>): VoiceInteractionEngineConfig {
    return {
      language: config.language || 'en-US',
      enableContinuousListening: config.enableContinuousListening ?? true,
      enableInterimResults: config.enableInterimResults ?? true,
      enableContextAwareness: config.enableContextAwareness ?? true,
      enableFeedback: config.enableFeedback ?? true,
      enableErrorHandling: config.enableErrorHandling ?? true,
      noiseThreshold: config.noiseThreshold ?? 0,
      silenceThreshold: config.silenceThreshold ?? 5000,
      maxCommandQueue: config.maxCommandQueue ?? 10,
      defaultTimeout: config.defaultTimeout ?? 30000
    };
  }

  /**
   * Create initial interaction context
   */
  private createInitialContext(): VoiceInteractionContext {
    return {
      id: `ctx-${Date.now()}`,
      timestamp: Date.now(),
      userId: undefined,
      sessionId: undefined,
      currentSelection: undefined,
      currentDocument: undefined,
      currentView: undefined,
      systemState: {}
    };
  }

  /**
   * Start listening for voice input
   */
  public async start(): Promise<void> {
    if (this.isListening) {
      throw new Error('Voice engine is already listening');
    }

    if (this.isProcessing) {
      throw new Error('Cannot start while processing a command');
    }

    this.isListening = true;
    await this.recognizer.start();
    
    this.emitFeedback({
      type: 'info',
      message: 'Listening for voice commands...',
      timestamp: Date.now()
    });
  }

  /**
   * Stop listening for voice input
   */
  public async stop(): Promise<void> {
    if (!this.isListening) {
      return;
    }

    this.isListening = false;
    await this.recognizer.stop();

    this.emitFeedback({
      type: 'info',
      message: 'Voice input stopped',
      timestamp: Date.now()
    });
  }

  /**
   * Process voice command
   */
  public async processCommand(command: VoiceCommand): Promise<VoiceInteractionResult> {
    if (!this.isListening && !this.isProcessing) {
      throw new Error('Voice engine is not listening or processing');
    }

    this.isProcessing = true;
    const startTime = Date.now();

    try {
      // Update command status
      command.status = 'recognized';
      command.startTime = startTime;

      // Extract text from command
      const text = command.text || '';
      
      // Parse the command
      const parsedCommand = this.parser.parse(text);
      
      // Update command with parsed data
      command.intent = parsedCommand.intent;
      command.parameters = parsedCommand.parameters;
      command.confidence = parsedCommand.confidence;
      
      // Execute the command based on intent
      const result = await this.executeCommand(parsedCommand);
      
      // Update command status
      command.status = result.success ? 'executed' : 'failed';
      command.endTime = Date.now();
      command.duration = command.endTime - command.startTime;

      // Add to command history
      this.addToCommandHistory(command);

      // Emit feedback
      if (this.config.enableFeedback) {
        this.emitFeedback({
          type: result.success ? 'success' : 'error',
          message: result.success 
            ? `Command executed: ${parsedCommand.intent}`
            : `Error executing command: ${result.error || 'Unknown error'}`,
          timestamp: Date.now()
        });
      }

      return {
        success: result.success,
        command,
        transcript: text,
        error: result.error,
        duration: Date.now() - startTime,
        metadata: result.metadata
      };
    } catch (error) {
      // Handle errors
      command.status = 'failed';
      command.error = error instanceof Error ? error.message : 'Unknown error';
      command.endTime = Date.now();
      command.duration = command.endTime - command.startTime;

      this.addToCommandHistory(command);

      if (this.config.enableFeedback) {
        this.emitFeedback({
          type: 'error',
          message: `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: Date.now()
        });
      }

      return {
        success: false,
        command,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Execute command based on parsed intent
   */
  private async executeCommand(parsedCommand: ParsedCommand): Promise<{ success: boolean; result?: any; error?: string; metadata?: Record<string, any> }> {
    const { intent, parameters } = parsedCommand;

    switch (intent) {
      case 'navigation':
        return await this.executeNavigation(parameters);

      case 'editing':
        return await this.executeEditing(parameters);

      case 'search':
        return await this.executeSearch(parameters);

      case 'formatting':
        return await this.executeFormatting(parameters);

      case 'document':
        return await this.executeDocument(parameters);

      case 'system':
        return await this.executeSystem(parameters);

      case 'unknown':
        return {
          success: false,
          error: 'Unknown command',
          metadata: { message: 'Unknown command' }
        };
    }

    return {
      success: false,
      error: 'Command not supported in current mode',
      metadata: { message: 'Command not supported in current mode' }
    };
  }

  /**
   * Execute navigation command
   */
  private async executeNavigation(parameters: VoiceCommandParameters): Promise<{ success: boolean; result?: any; error?: string; metadata?: Record<string, any> }> {
    const { target } = parameters;
    
    // Navigate to target
    if (target) {
      this.context.currentDocument = {
        id: target,
        name: target
      };
    }

    return {
      success: true,
      metadata: { message: `Navigated to ${target || 'current location'}` }
    };
  }

  /**
   * Execute editing command
   */
  private async executeEditing(parameters: VoiceCommandParameters): Promise<{ success: boolean; result?: any; error?: string; metadata?: Record<string, any> }> {
    const { action, value, case: caseValue } = parameters;
    
    // Apply editing action
    if (action && value) {
      this.context.currentSelection = {
        text: value,
        position: 0,
        length: value.length
      };
    }

    // Apply case transformation
    if (caseValue && this.context.currentSelection) {
      this.context.currentSelection.text = this.applyCaseTransformation(this.context.currentSelection.text, caseValue);
    }

    return {
      success: true,
      metadata: { message: `Edited content: ${action || caseValue}` }
    };
  }

  /**
   * Execute search command
   */
  private async executeSearch(parameters: VoiceCommandParameters): Promise<{ success: boolean; result?: any; error?: string; metadata?: Record<string, any> }> {
    const { searchQuery, direction } = parameters;
    
    // Perform search
    if (searchQuery) {
      this.context.systemState.searchQuery = searchQuery;
      this.context.systemState.searchResults = await this.performSearch(searchQuery);
    }

    // Navigate in direction
    if (direction) {
      this.context.systemState.currentPosition = this.navigateInDirection(direction);
    }

    return {
      success: true,
      metadata: {
        message: `Searched for "${searchQuery || 'content'}"`,
        results: this.context.systemState.searchResults?.length || 0
      }
    };
  }

  /**
   * Execute formatting command
   */
  private async executeFormatting(parameters: VoiceCommandParameters): Promise<{ success: boolean; result?: any; error?: string; metadata?: Record<string, any> }> {
    const { format, target } = parameters;
    
    // Apply formatting
    if (format) {
      this.context.systemState.format = format;
    }

    return {
      success: true,
      metadata: { message: `Applied format: ${format || target}` }
    };
  }

  /**
   * Execute document command
   */
  private async executeDocument(parameters: VoiceCommandParameters): Promise<{ success: boolean; result?: any; error?: string; metadata?: Record<string, any> }> {
    const { document, action, text } = parameters;
    
    // Handle document operations
    if (action === 'save' || action === 'create') {
      this.context.currentDocument = {
        id: document || 'current',
        name: document || 'current'
      };
    }

    if (text) {
      this.context.currentSelection = {
        text,
        position: 0,
        length: text.length
      };
    }

    return {
      success: true,
      metadata: { message: `Document ${action || 'operation'} completed` }
    };
  }

  /**
   * Execute system command
   */
  private async executeSystem(parameters: VoiceCommandParameters): Promise<{ success: boolean; result?: any; error?: string; metadata?: Record<string, any> }> {
    const { target } = parameters;

    switch (target) {
      case 'settings':
        this.context.currentView = 'settings';
        return {
          success: true,
          metadata: { message: 'Opening settings' }
        };

      case 'help':
        return {
          success: true,
          metadata: { 
            message: 'Available commands: navigation, editing, search, formatting, document, system',
            commands: ['navigation', 'editing', 'search', 'formatting', 'document', 'system']
          }
        };

      case 'info':
        return {
          success: true,
          metadata: { 
            message: 'Voice Interaction Engine v1.0',
            version: '1.0.0',
            engine: 'VoiceInteractionEngine'
          }
        };

      case 'status':
        return {
          success: true,
          metadata: { 
            message: 'Voice engine status',
            isListening: this.isListening,
            isProcessing: this.isProcessing,
            commandsProcessed: this.commandHistory.commands.length
          }
        };

      default:
        return {
          success: false,
          error: `Unknown system command: ${target}`,
          metadata: { message: `Unknown system command: ${target}` }
        };
    }
  }

  /**
   * Get recognition results
   */
  public getResults(): any[] {
    return this.recognizer.getResults();
  }

  /**
   * Get current state
   */
  public getState(): 'idle' | 'listening' | 'processing' | 'error' {
    if (this.isProcessing) return 'processing';
    if (this.isListening) return 'listening';
    return 'idle';
  }

  /**
   * Get statistics
   */
  public getStats(): SpeechRecognitionStats {
    return this.recognizer.getStats();
  }

  /**
   * Get command history
   */
  public getCommandHistory(): VoiceCommandHistory {
    return { ...this.commandHistory };
  }

  /**
   * Get current context
   */
  public getContext(): VoiceInteractionContext {
    return { ...this.context };
  }

  /**
   * Set context
   */
  public setContext(context: Partial<VoiceInteractionContext>): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear results
   */
  public clearResults(): void {
    this.recognizer.clearResults();
  }

  /**
   * Reset statistics
   */
  public resetStats(): void {
    this.recognizer.resetStats();
  }

  /**
   * Register intent
   */
  public registerIntent(intent: VoiceIntent): void {
    this.parser.registerIntent(intent);
  }

  /**
   * Unregister intent
   */
  public unregisterIntent(intentType: VoiceIntentType): boolean {
    return this.parser.unregisterIntent(intentType);
  }

  /**
   * Get available intents
   */
  public getIntents(): VoiceIntent[] {
    return this.parser.getIntents();
  }

  /**
   * Get configuration
   */
  public getConfig(): VoiceInteractionEngineConfig {
    return { ...this.config };
  }

  /**
   * Add command to history
   */
  private addToCommandHistory(command: VoiceCommand): void {
    this.commandHistory.commands.unshift(command);
    
    // Limit the number of commands in history
    if (this.commandHistory.commands.length > this.commandHistory.limit) {
      this.commandHistory.commands = this.commandHistory.commands.slice(0, this.commandHistory.limit);
    }
  }

  /**
   * Emit feedback
   */
  private emitFeedback(feedback: VoiceFeedback): void {
    this.lastFeedback = feedback;
  }

  /**
   * Apply case transformation
   */
  private applyCaseTransformation(text: string, caseValue: string): string {
    switch (caseValue) {
      case 'lowercase':
        return text.toLowerCase();
      case 'uppercase':
        return text.toUpperCase();
      case 'title':
        return text.replace(/\b\w/g, c => c.toUpperCase());
      case 'sentence':
      default:
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
  }

  /**
   * Navigate in direction
   */
  private navigateInDirection(direction: 'forward' | 'backward'): number {
    const currentPosition = this.context.systemState.currentPosition || 0;
    const directions: Record<string, number> = {
      forward: 100,
      backward: -100
    };
    return currentPosition + (directions[direction] || 0);
  }

  /**
   * Perform search
   */
  private async performSearch(query: string): Promise<any[]> {
    // This would integrate with the semantic search engine
    // For now, return a mock result
    return [];
  }
}

/**
 * SpeechRecognizer class wrapper
 */
export class SpeechRecognizer {
  constructor(config: VoiceInteractionEngineConfig) {}

  async start(): Promise<void> {
    // Implementation from speech-recognizer.ts
  }

  async stop(): Promise<void> {
    // Implementation from speech-recognizer.ts
  }

  getResults(): any[] {
    // Implementation from speech-recognizer.ts
    return [];
  }

  clearResults(): void {
    // Implementation from speech-recognizer.ts
  }

  getStats(): SpeechRecognitionStats {
    // Implementation from speech-recognizer.ts
    return {
      totalRecognitions: 0,
      successfulRecognitions: 0,
      failedRecognitions: 0,
      averageConfidence: 0,
      totalDuration: 0,
      averageDuration: 0,
      recognitionErrors: []
    };
  }

  resetStats(): void {
    // Implementation from speech-recognizer.ts
  }
}

/**
 * CommandParser class wrapper
 */
export class CommandParser {
  constructor(config: VoiceInteractionEngineConfig) {}

  parse(text: string): ParsedCommand {
    // Implementation from command-parser.ts
    return {
      text,
      intent: 'unknown',
      confidence: 0,
      parameters: {},
      entities: {},
      rawText: text
    };
  }

  getIntents(): VoiceIntent[] {
    // Implementation from command-parser.ts
    return [];
  }

  registerIntent(intent: VoiceIntent): void {
    // Implementation from command-parser.ts
  }

  unregisterIntent(intentType: VoiceIntentType): boolean {
    // Implementation from command-parser.ts
    return false;
  }

  getConfig(): CommandParserConfig {
    // Implementation from command-parser.ts
    return {};
  }

  isContextualAnalysisEnabled(): boolean {
    // Implementation from command-parser.ts
    return true;
  }

  isEntityExtractionEnabled(): boolean {
    // Implementation from command-parser.ts
    return true;
  }

  isPatternMatchingEnabled(): boolean {
    // Implementation from command-parser.ts
    return true;
  }

  isNaturalLanguageProcessingEnabled(): boolean {
    // Implementation from command-parser.ts
    return false;
  }
}
