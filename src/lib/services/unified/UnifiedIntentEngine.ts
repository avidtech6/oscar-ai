/**
 * Unified Intent Engine
 * 
 * Replaces intentEngine.ts with expanded taxonomy and voice integration.
 * Uses feature flag for gradual rollout.
 */

import { actionExecutorService } from './ActionExecutorService';

export type IntentType =
  | 'task' | 'subtask' | 'note' | 'project' | 'blog' | 'report'
  | 'diagram' | 'tree' | 'query' | 'update' | 'chat'
  | 'voice_note' | 'dictation' | 'transcription' | 'voice_command';

export interface IntentResult {
  intent: IntentType;
  confidence: number; // 0-100%
  data: Record<string, any>;
  requiresConfirmation: boolean;
  conversionOptions?: string[];
}

export interface VoiceIntentData {
  audioBlob?: Blob;
  transcript?: string;
  duration?: number;
  projectId?: string;
}

const VOICE_PATTERNS = [
  { pattern: /\b(record|voice|audio)\s+(note|memo|message)\b/i, intent: 'voice_note' as IntentType },
  { pattern: /\b(dictate|speak|say)\s+(this|that|the)\b/i, intent: 'dictation' as IntentType },
  { pattern: /\b(transcribe|convert)\s+(audio|speech|voice)\b/i, intent: 'transcription' as IntentType },
  { pattern: /\b(start|stop)\s+recording\b/i, intent: 'voice_command' as IntentType },
  { pattern: /\b(listen|hear|mic)\b/i, intent: 'voice_command' as IntentType },
  // Enhanced voice patterns for common voice commands
  { pattern: /\b(create|make|add)\s+(a\s+)?note\s+(about|regarding|for)\b/i, intent: 'note' as IntentType },
  { pattern: /\b(create|make|add)\s+(a\s+)?task\s+(to|for|about)\b/i, intent: 'task' as IntentType },
  { pattern: /\b(add|create|record)\s+(a\s+)?tree\b/i, intent: 'tree' as IntentType },
  { pattern: /\b(switch|change|go)\s+(to|project)\s+(\w+)/i, intent: 'voice_command' as IntentType },
  { pattern: /\b(show|display|list)\s+(my|the)\s+(tasks|notes|projects)\b/i, intent: 'query' as IntentType },
  { pattern: /\b(create|start|make)\s+(a\s+)?project\b/i, intent: 'project' as IntentType },
  { pattern: /\b(generate|create)\s+(a\s+)?report\b/i, intent: 'report' as IntentType },
  { pattern: /\b(write|create)\s+(a\s+)?blog\s+(post|article)\b/i, intent: 'blog' as IntentType },
  { pattern: /\b(create|draw)\s+(a\s+)?diagram\b/i, intent: 'diagram' as IntentType },
];

const TEXT_PATTERNS = [
  { pattern: /\b(remember|todo|task|do)\b.*\b(oak|tree|check|buy)\b/i, intent: 'task' as IntentType },
  { pattern: /\b(under|as part of|subtask)\b/i, intent: 'subtask' as IntentType },
  { pattern: /\b(note|jot|write down)\b/i, intent: 'note' as IntentType },
  { pattern: /\b(project|create project|new project)\b/i, intent: 'project' as IntentType },
  { pattern: /\b(blog|post|article)\b/i, intent: 'blog' as IntentType },
  { pattern: /\b(report|BS5837|survey)\b/i, intent: 'report' as IntentType },
  { pattern: /\b(diagram|flowchart|chart)\b/i, intent: 'diagram' as IntentType },
  { pattern: /\b(tree|plant|species)\b/i, intent: 'tree' as IntentType },
  { pattern: /\b(show|list|what|where|when)\b/i, intent: 'query' as IntentType },
  { pattern: /\b(change|update|rename|modify)\b/i, intent: 'update' as IntentType },
];

export class UnifiedIntentEngine {
  constructor() {
    // Unified engine is now fully enabled
  }

  /**
   * Detect intent from text or voice input
   */
  async detectIntent(
    input: string,
    options?: {
      isVoice?: boolean;
      voiceData?: VoiceIntentData;
      context?: any;
    }
  ): Promise<IntentResult> {
    // Ensure input is a string (defensive)
    const safeInput = typeof input === 'string' ? input : String(input || '');
    
    const isVoice = options?.isVoice || false;
    const voiceData = options?.voiceData;
    
    // Check voice patterns first if voice input
    if (isVoice) {
      const voiceIntent = this.detectVoiceIntent(safeInput, voiceData);
      if (voiceIntent) return voiceIntent;
    }

    // Check text patterns
    const textIntent = this.detectTextIntent(safeInput);
    if (textIntent) return textIntent;

    // Default to chat
    return {
      intent: 'chat',
      confidence: 30,
      data: { text: safeInput },
      requiresConfirmation: false,
    };
  }

  private detectVoiceIntent(input: string, voiceData?: VoiceIntentData): IntentResult | null {
    // Ensure input is a string
    const safeInput = typeof input === 'string' ? input : String(input || '');
    
    for (const { pattern, intent } of VOICE_PATTERNS) {
      if (pattern.test(safeInput)) {
        return {
          intent,
          confidence: this.calculateVoiceConfidence(safeInput, intent),
          data: {
            text: safeInput,
            ...voiceData,
            isVoice: true
          },
          requiresConfirmation: this.requiresVoiceConfirmation(intent, safeInput),
        };
      }
    }
    return null;
  }

  /**
   * Calculate confidence score for voice intents
   * Voice inputs get higher base confidence due to explicit nature
   */
  private calculateVoiceConfidence(input: string, intent: IntentType): number {
    const baseConfidence = 85; // Higher base confidence for voice
    
    // Ensure input is a string
    const safeInput = typeof input === 'string' ? input : String(input || '');
    
    // Adjust based on input clarity
    const wordCount = safeInput.split(/\s+/).length;
    const hasCompleteSentence = /[.!?]$/.test(safeInput.trim());
    
    let confidence = baseConfidence;
    
    if (wordCount >= 3) confidence += 5;
    if (hasCompleteSentence) confidence += 5;
    if (wordCount > 5) confidence += Math.min(wordCount, 5); // Cap at +5
    
    // Intent-specific adjustments
    const intentAdjustments: Record<IntentType, number> = {
      voice_note: 0, dictation: 5, transcription: 0, voice_command: 10,
      task: 5, note: 5, project: 10, report: 5, blog: 5, diagram: 5, tree: 5,
      query: 0, update: 0, subtask: 0, chat: 0
    };
    
    confidence += intentAdjustments[intent] || 0;
    
    return Math.min(confidence, 100);
  }

  /**
   * Determine if voice intent requires confirmation
   * Voice commands for data modification typically need confirmation
   */
  private requiresVoiceConfirmation(intent: IntentType, input: string): boolean {
    // Data-modifying intents always require confirmation for voice
    const dataModifyingIntents: IntentType[] = ['task', 'note', 'project', 'blog', 'report', 'diagram', 'tree', 'voice_note', 'dictation'];
    
    if (!dataModifyingIntents.includes(intent)) {
      return false;
    }
    
    // Ensure input is a string
    const safeInput = typeof input === 'string' ? input : String(input || '');
    
    // Check for confirmation keywords in voice input
    const confirmationKeywords = ['please', 'could you', 'would you', 'can you', 'I want', 'I need'];
    const hasPoliteRequest = confirmationKeywords.some(keyword =>
      safeInput.toLowerCase().includes(keyword)
    );
    
    // If polite request, may not need confirmation
    if (hasPoliteRequest) {
      return false;
    }
    
    return true;
  }

  /**
   * Process voice transcription with enhanced intent detection
   * Public method for VoiceRecordingService to use
   */
  async processVoiceTranscription(
    transcript: string,
    voiceData?: VoiceIntentData
  ): Promise<IntentResult> {
    // Clean up transcript (remove filler words, normalize)
    const cleanedTranscript = this.cleanVoiceTranscript(transcript);
    
    // Detect intent with voice-specific processing
    const intentResult = await this.detectIntent(cleanedTranscript, {
      isVoice: true,
      voiceData,
    });
    
    // Add voice-specific metadata
    intentResult.data = {
      ...intentResult.data,
      originalTranscript: transcript,
      cleanedTranscript,
      isVoice: true,
      voiceMetadata: voiceData,
    };
    
    return intentResult;
  }

  /**
   * Clean voice transcript by removing common filler words and normalizing
   */
  private cleanVoiceTranscript(transcript: string): string {
    if (!transcript.trim()) return transcript;
    
    // Common filler words to remove
    const fillerWords = [
      'um', 'uh', 'ah', 'er', 'hm', 'hmm',
      'like', 'you know', 'actually', 'basically',
      'literally', 'seriously', 'okay', 'right'
    ];
    
    let cleaned = transcript.toLowerCase();
    
    // Remove filler words
    fillerWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      cleaned = cleaned.replace(regex, '');
    });
    
    // Normalize multiple spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Capitalize first letter
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    
    return cleaned;
  }

  private detectTextIntent(input: string): IntentResult | null {
    // Ensure input is a string
    const safeInput = typeof input === 'string' ? input : String(input || '');
    
    let bestMatch: { intent: IntentType; confidence: number } | null = null;
    
    for (const { pattern, intent } of TEXT_PATTERNS) {
      const matches = safeInput.match(pattern);
      if (matches) {
        const confidence = this.calculateConfidence(safeInput, matches[0], intent);
        if (!bestMatch || confidence > bestMatch.confidence) {
          bestMatch = { intent, confidence };
        }
      }
    }

    if (bestMatch) {
      const data = this.extractData(safeInput, bestMatch.intent);
      return {
        intent: bestMatch.intent,
        confidence: bestMatch.confidence,
        data,
        requiresConfirmation: this.requiresConfirmation(bestMatch.intent, bestMatch.confidence),
        conversionOptions: this.getConversionOptions(bestMatch.intent),
      };
    }
    
    return null;
  }

  private calculateConfidence(input: string, match: string, intent: IntentType): number {
    const matchLength = match.length;
    const inputLength = input.length;
    const coverage = matchLength / inputLength;
    
    let baseConfidence = coverage * 100;
    
    // Adjust based on intent specificity
    const specificity: Record<IntentType, number> = {
      task: 90, subtask: 85, note: 80, project: 95, blog: 85, report: 90,
      diagram: 85, tree: 90, query: 70, update: 80, chat: 30,
      voice_note: 85, dictation: 90, transcription: 85, voice_command: 95,
    };
    
    return Math.min(baseConfidence, specificity[intent] || 70);
  }

  private extractData(input: string, intent: IntentType): Record<string, any> {
    // Simplified extraction - in production would use more sophisticated NLP
    const data: Record<string, any> = { text: input };
    
    switch (intent) {
      case 'task':
        data.title = input.replace(/\b(remember|todo|task|do)\s+to\s+/i, '').trim();
        data.priority = input.includes('urgent') ? 'high' : 'normal';
        break;
      case 'note':
        data.content = input.replace(/\b(note|jot|write down)\s+/i, '').trim();
        break;
      case 'voice_note':
        data.isVoice = true;
        break;
    }
    
    return data;
  }

  private requiresConfirmation(intent: IntentType, confidence: number): boolean {
    // "Don't Be Dumb" rule: require confirmation for data-modifying intents with low confidence
    const dataModifyingIntents: IntentType[] = ['task', 'note', 'project', 'blog', 'report', 'diagram', 'tree', 'voice_note', 'dictation'];
    
    if (!dataModifyingIntents.includes(intent)) {
      return false; // Read-only intents don't need confirmation
    }
    
    return confidence < 80; // Require confirmation for confidence < 80%
  }

  private getConversionOptions(intent: IntentType): string[] {
    // Options for converting AI-generated content in General Chat mode
    const conversionMap: Record<IntentType, string[]> = {
      task: ['Save as task', 'Convert to note', 'Ignore'],
      note: ['Save as note', 'Convert to task', 'Add to project', 'Ignore'],
      project: ['Create project', 'Save as draft', 'Ignore'],
      blog: ['Save as blog', 'Publish now', 'Save as draft'],
      report: ['Generate report', 'Save as template', 'Ignore'],
      diagram: ['Create diagram', 'Save as image', 'Ignore'],
      tree: ['Add tree record', 'Save as note', 'Ignore'],
      voice_note: ['Save as voice note', 'Transcribe to text', 'Ignore'],
      dictation: ['Save as text', 'Convert to note', 'Ignore'],
      transcription: ['Save transcript', 'Attach to project', 'Ignore'],
      voice_command: [], // No conversion needed
      subtask: ['Save as subtask', 'Convert to task', 'Ignore'],
      query: [], // No conversion needed
      update: ['Apply update', 'Save as draft', 'Ignore'],
      chat: [], // No conversion needed
    };
    
    return conversionMap[intent] || [];
  }

  /**
   * Classify intent from text (legacy API compatibility)
   * Returns { type, data, confidence } for UI compatibility
   */
  async classifyIntent(
    input: string,
    options?: {
      isVoice?: boolean;
      voiceData?: VoiceIntentData;
      context?: any;
    }
  ): Promise<{
    type: IntentType;
    data: Record<string, any>;
    confidence: number;
    requiresConfirmation?: boolean;
    conversionOptions?: string[];
  } | null> {
    const intentResult = await this.detectIntent(input, options);
    
    // Convert IntentResult to legacy format expected by UI
    return {
      type: intentResult.intent,
      data: intentResult.data,
      confidence: intentResult.confidence,
      requiresConfirmation: intentResult.requiresConfirmation,
      conversionOptions: intentResult.conversionOptions
    };
  }

  /**
   * Execute an intent using unified action executor service
   */
  async executeIntent(intentResult: IntentResult): Promise<any> {
    // Use unified action executor service
    try {
      const result = await actionExecutorService.execute(intentResult);
      return result;
    } catch (error) {
      console.error('Error executing intent with unified executor:', error);
      throw error;
    }
  }

  private getActionFromIntent(intent: IntentType): string {
    const actionMap: Record<IntentType, string> = {
      task: 'createTask',
      subtask: 'createSubtask',
      note: 'createNote',
      project: 'createProject',
      blog: 'createBlogPost',
      report: 'createReport',
      diagram: 'createDiagram',
      tree: 'createTree',
      query: 'query',
      update: 'updateObject',
      chat: 'chat',
      voice_note: 'createVoiceNote',
      dictation: 'createDictation',
      transcription: 'createTranscription',
      voice_command: 'executeVoiceCommand',
    };
    return actionMap[intent] || 'chat';
  }
}

// Singleton instance
export const unifiedIntentEngine = new UnifiedIntentEngine();