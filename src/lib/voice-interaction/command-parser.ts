/**
 * Command Parser Engine for Phase 34.5
 * Parses voice commands into structured intents and parameters
 */

import type {
  VoiceIntent,
  VoiceIntentType,
  VoiceCommandParameters,
  ParsedCommand,
  CommandParserConfig
} from './voice-interaction-types';

export class CommandParser {
  private config: CommandParserConfig;
  private intents: VoiceIntent[] = [];

  constructor(config: CommandParserConfig = {}) {
    this.config = this.normalizeConfig(config);
    this.initializeIntents();
  }

  /**
   * Normalize and validate configuration
   */
  private normalizeConfig(config: CommandParserConfig): CommandParserConfig {
    return {
      enableContextualAnalysis: config.enableContextualAnalysis ?? true,
      enableEntityExtraction: config.enableEntityExtraction ?? true,
      enablePatternMatching: config.enablePatternMatching ?? true,
      enableNaturalLanguageProcessing: config.enableNaturalLanguageProcessing ?? false
    };
  }

  /**
   * Initialize voice intents
   */
  private initializeIntents(): void {
    this.intents = [
      // Navigation intents
      {
        type: 'navigation',
        keywords: ['open', 'navigate', 'go to', 'move to', 'jump to'],
        description: 'Navigate to a document, section, or location',
        parameters: {
          action: 'navigate',
          target: 'document|section|location',
          level: 'paragraph|heading|block'
        }
      },
      // Editing intents
      {
        type: 'editing',
        keywords: ['edit', 'change', 'modify', 'update', 'replace', 'delete', 'remove', 'insert'],
        description: 'Perform editing operations on text or content',
        parameters: {
          action: 'edit',
          target: 'text|selection|content',
          value: 'string',
          case: 'sentence|lowercase|uppercase|title'
        }
      },
      // Search intents
      {
        type: 'search',
        keywords: ['search', 'find', 'look for', 'locate', 'discover'],
        description: 'Search for content in documents',
        parameters: {
          action: 'search',
          searchQuery: 'string',
          target: 'document|all',
          direction: 'forward|backward'
        }
      },
      // Formatting intents
      {
        type: 'formatting',
        keywords: ['format', 'style', 'make', 'set', 'apply', 'change', 'convert'],
        description: 'Apply formatting styles to content',
        parameters: {
          action: 'format',
          target: 'text|selection|content',
          format: 'bold|italic|underline|heading|list|code|quote'
        }
      },
      // Document intents
      {
        type: 'document',
        keywords: ['document', 'save', 'create', 'new', 'close', 'export', 'print', 'open'],
        description: 'Perform document operations',
        parameters: {
          action: 'document',
          document: 'string',
          text: 'string',
          selection: 'string'
        }
      },
      // System intents
      {
        type: 'system',
        keywords: ['system', 'settings', 'preferences', 'help', 'info', 'about', 'status'],
        description: 'System-level operations',
        parameters: {
          action: 'system',
          target: 'settings|help|info|status'
        }
      }
    ];
  }

  /**
   * Parse voice command text into structured command
   */
  public parse(text: string): ParsedCommand {
    const startTime = Date.now();
    const normalizedText = this.normalizeText(text);
    const intent = this.detectIntent(normalizedText);
    const parameters = this.extractParameters(normalizedText, intent);
    const entities = this.extractEntities(normalizedText);
    const confidence = this.calculateConfidence(text, intent);

    return {
      text: normalizedText,
      intent: intent.type,
      confidence,
      parameters,
      entities,
      rawText: text
    };
  }

  /**
   * Normalize text for parsing
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:()]/g, '')
      .replace(/\s+/g, ' ');
  }

  /**
   * Detect intent from text
   */
  private detectIntent(text: string): VoiceIntent {
    let bestIntent = this.intents[0];
    let bestScore = 0;

    for (const intent of this.intents) {
      const score = this.calculateIntentScore(text, intent);
      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent;
      }
    }

    // If no intent matches well, return unknown
    if (bestScore < 0.3) {
      return {
        type: 'unknown',
        keywords: [],
        description: 'Unknown command',
        parameters: {}
      };
    }

    return bestIntent;
  }

  /**
   * Calculate intent match score
   */
  private calculateIntentScore(text: string, intent: VoiceIntent): number {
    let score = 0;
    const words = text.split(' ');

    for (const keyword of intent.keywords) {
      if (text.includes(keyword)) {
        score += 0.5;
      }
      for (const word of words) {
        if (keyword.includes(word) || word.includes(keyword)) {
          score += 0.25;
        }
      }
    }

    return Math.min(score, 1.0);
  }

  /**
   * Extract parameters from text
   */
  private extractParameters(text: string, intent: VoiceIntent): VoiceCommandParameters {
    const parameters: VoiceCommandParameters = {};

    if (intent.type === 'navigation') {
      // Extract target (document, section, etc.)
      const targetMatch = text.match(/(?:go to|navigate to|open)\s+(.+?)(?:\s+for|$)/i);
      if (targetMatch) {
        parameters.target = targetMatch[1].trim();
      }

      // Extract level
      const levelMatch = text.match(/(?:at|as|as a|to a)\s+(paragraph|heading|block)/i);
      if (levelMatch) {
        parameters.level = levelMatch[1].trim() as 'paragraph' | 'heading' | 'block';
      }
    } else if (intent.type === 'editing') {
      // Extract action
      const actionMatch = text.match(/(?:edit|change|modify|update|replace|delete|remove|insert)\s+(.+?)(?:\s+as|$)/i);
      if (actionMatch) {
        parameters.action = actionMatch[1].trim();
      }

      // Extract text/value
      const valueMatch = text.match(/(?:edit|change|modify|update|replace|delete|remove|insert)\s+(.+?)(?:\s+as|$)/i);
      if (valueMatch) {
        parameters.value = valueMatch[1].trim();
      }

      // Extract case
      const caseMatch = text.match(/(?:as|in)\s+(sentence|lowercase|uppercase|title)/i);
      if (caseMatch) {
        parameters.case = caseMatch[1].trim() as 'sentence' | 'lowercase' | 'uppercase' | 'title';
      }
    } else if (intent.type === 'search') {
      // Extract search query
      const queryMatch = text.match(/(?:search|find|look for|locate|discover)\s+(.+?)(?:\s+in|$)/i);
      if (queryMatch) {
        parameters.searchQuery = queryMatch[1].trim();
      }

      // Extract direction
      const directionMatch = text.match(/(?:go|move)\s+(?:to|in)\s+(?:the|a)?\s*(forward|backward)/i);
      if (directionMatch) {
        parameters.direction = directionMatch[1].trim() as 'forward' | 'backward';
      }
    } else if (intent.type === 'formatting') {
      // Extract format
      const formatMatch = text.match(/(?:format|style|make|set|apply|change|convert)\s+(.+?)(?:\s+to|$)/i);
      if (formatMatch) {
        parameters.format = formatMatch[1].trim();
      }

      // Extract target
      const targetMatch = text.match(/(?:format|style|make|set|apply|change|convert)\s+(.+?)(?:\s+to|$)/i);
      if (targetMatch) {
        parameters.target = targetMatch[1].trim();
      }
    } else if (intent.type === 'document') {
      // Extract document name
      const docMatch = text.match(/(?:open|create|new)\s+(.+?)(?:\s+document|$)/i);
      if (docMatch) {
        parameters.document = docMatch[1].trim();
      }

      // Extract save operation
      if (text.includes('save')) {
        parameters.action = 'save';
      }
    } else if (intent.type === 'system') {
      // Extract system action
      const targetMatch = text.match(/(?:system|settings|preferences|help|info|about|status)\s+(.+?)(?:\s+for|$)/i);
      if (targetMatch) {
        parameters.target = targetMatch[1].trim();
      }
    }

    return parameters;
  }

  /**
   * Extract entities from text
   */
  private extractEntities(text: string): Record<string, any> {
    const entities: Record<string, any> = {};

    // Extract potential document names (alphanumeric strings)
    const docMatch = text.match(/(?:open|create|new|save|close|document)\s+(.+?)(?:\s+document|$)/i);
    if (docMatch) {
      entities.document = docMatch[1].trim();
    }

    // Extract search terms
    const searchMatch = text.match(/(?:search|find|look for|locate|discover)\s+(.+?)(?:\s+in|$)/i);
    if (searchMatch) {
      entities.searchQuery = searchMatch[1].trim();
    }

    // Extract text content
    const textMatch = text.match(/(?:edit|change|modify|update|replace|delete|remove|insert)\s+(.+?)(?:\s+as|$)/i);
    if (textMatch) {
      entities.text = textMatch[1].trim();
    }

    return entities;
  }

  /**
   * Calculate confidence score for the parsed command
   */
  private calculateConfidence(text: string, intent: VoiceIntent): number {
    let confidence = 0.5; // Base confidence

    // Adjust based on intent match score
    confidence += this.calculateIntentScore(text, intent) * 0.4;

    // Adjust based on parameter extraction
    confidence += this.calculateParameterConfidence(text, intent) * 0.1;

    return Math.min(confidence, 1.0);
  }

  /**
   * Calculate parameter extraction confidence
   */
  private calculateParameterConfidence(text: string, intent: VoiceIntent): number {
    let confidence = 0;

    for (const [key, value] of Object.entries(intent.parameters)) {
      if (typeof value === 'string' && value.includes('|')) {
        // Check if text contains any of the valid values
        const validValues = value.split('|').map(v => v.trim().toLowerCase());
        for (const validValue of validValues) {
          if (text.includes(validValue)) {
            confidence += 0.5;
            break;
          }
        }
      }
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Get all registered intents
   */
  public getIntents(): VoiceIntent[] {
    return [...this.intents];
  }

  /**
   * Register a new intent
   */
  public registerIntent(intent: VoiceIntent): void {
    this.intents.push(intent);
  }

  /**
   * Unregister an intent
   */
  public unregisterIntent(intentType: VoiceIntentType): boolean {
    const index = this.intents.findIndex(i => i.type === intentType);
    if (index !== -1) {
      this.intents.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get configuration
   */
  public getConfig(): CommandParserConfig {
    return { ...this.config };
  }

  /**
   * Check if contextual analysis is enabled
   */
  public isContextualAnalysisEnabled(): boolean {
    return this.config.enableContextualAnalysis ?? true;
  }

  /**
   * Check if entity extraction is enabled
   */
  public isEntityExtractionEnabled(): boolean {
    return this.config.enableEntityExtraction ?? true;
  }

  /**
   * Check if pattern matching is enabled
   */
  public isPatternMatchingEnabled(): boolean {
    return this.config.enablePatternMatching ?? true;
  }

  /**
   * Check if NLP is enabled
   */
  public isNaturalLanguageProcessingEnabled(): boolean {
    return this.config.enableNaturalLanguageProcessing ?? false;
  }
}
