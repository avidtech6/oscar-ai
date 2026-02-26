/**
 * Intelligence Layer Intent Classifier
 * 
 * Higher-level intent classification that integrates:
 * 1. Context mismatch detection
 * 2. Unified intent engine classification
 * 3. Media action routing detection
 * 4. Decision sheet requirement analysis
 * 
 * This provides the foundation for:
 * - Decision sheet reasoning
 * - Acknowledgement bubbles
 * - Media action routing
 * - History pollution prevention
 * - Global Copilot routing
 */

import { detectContextMismatch, type DetectionResult } from '../contextMismatchDetector';
import { unifiedIntentEngine, type IntentResult as UnifiedIntentResult } from '../unified/UnifiedIntentEngine';

export type IntelligenceIntent =
  | 'task_action'
  | 'note_action'
  | 'media_action'
  | 'navigation_action'
  | 'query_action'
  | 'command_action'
  | 'smalltalk'
  | 'ambiguous'
  | 'requires_decision_sheet';

export type MediaActionType =
  | 'photo_capture'
  | 'photo_upload'
  | 'voice_recording'
  | 'voice_transcription'
  | 'file_upload'
  | 'file_download'
  | 'camera_scan';

export interface IntelligenceIntentResult {
  // Core classification
  intelligenceIntent: IntelligenceIntent;
  unifiedIntent: UnifiedIntentResult;
  contextDetection: DetectionResult;
  
  // Media action details (if applicable)
  mediaAction?: MediaActionType;
  mediaTarget?: string; // e.g., 'gallery', 'notes', 'projects'
  
  // Decision sheet requirements
  requiresDecisionSheet: boolean;
  decisionSheetOptions: string[];
  
  // Acknowledgement requirements
  requiresAcknowledgement: boolean;
  acknowledgementMessage?: string;
  
  // Routing information
  shouldRouteToGlobalCopilot: boolean;
  shouldPreventHistoryPollution: boolean;
  
  // Confidence and metadata
  confidence: number;
  explanation: string;
}

export class IntentClassifier {
  /**
   * Classify a prompt using the full intelligence layer
   */
  async classify(prompt: string, options?: {
    isVoice?: boolean;
    currentPage?: string;
    currentItem?: any;
  }): Promise<IntelligenceIntentResult> {
    console.log('[IntentClassifier] Classifying prompt:', prompt.substring(0, 100));
    
    // Step 1: Get context mismatch detection
    const contextDetection = detectContextMismatch(prompt);
    
    // Step 2: Get unified intent classification
    const unifiedIntent = await unifiedIntentEngine.detectIntent(prompt, {
      isVoice: options?.isVoice,
    });
    
    // Step 3: Determine intelligence intent
    const intelligenceIntent = this.determineIntelligenceIntent(
      prompt,
      unifiedIntent,
      contextDetection
    );
    
    // Step 4: Detect media actions
    const mediaAction = this.detectMediaAction(prompt, unifiedIntent);
    
    // Step 5: Determine decision sheet requirements
    const requiresDecisionSheet = this.determineDecisionSheetRequirement(
      contextDetection,
      unifiedIntent,
      intelligenceIntent,
      mediaAction
    );
    
    // Step 6: Determine acknowledgement requirements
    const requiresAcknowledgement = this.determineAcknowledgementRequirement(
      unifiedIntent,
      intelligenceIntent
    );
    
    // Step 7: Determine routing decisions
    const shouldRouteToGlobalCopilot = this.shouldRouteToGlobalCopilot(
      contextDetection,
      intelligenceIntent
    );
    
    const shouldPreventHistoryPollution = this.shouldPreventHistoryPollution(
      intelligenceIntent,
      requiresDecisionSheet
    );
    
    // Step 8: Generate decision sheet options
    const decisionSheetOptions = this.generateDecisionSheetOptions(
      intelligenceIntent,
      contextDetection,
      mediaAction
    );
    
    // Step 9: Generate acknowledgement message
    const acknowledgementMessage = this.generateAcknowledgementMessage(
      intelligenceIntent,
      unifiedIntent
    );
    
    // Step 10: Calculate overall confidence
    const confidence = this.calculateOverallConfidence(
      unifiedIntent.confidence,
      contextDetection.confidence
    );
    
    // Step 11: Generate explanation
    const explanation = this.generateExplanation(
      intelligenceIntent,
      contextDetection,
      unifiedIntent
    );
    
    const result: IntelligenceIntentResult = {
      intelligenceIntent,
      unifiedIntent,
      contextDetection,
      mediaAction,
      requiresDecisionSheet,
      decisionSheetOptions,
      requiresAcknowledgement,
      acknowledgementMessage,
      shouldRouteToGlobalCopilot,
      shouldPreventHistoryPollution,
      confidence,
      explanation,
    };
    
    console.log('[IntentClassifier] Classification result:', result);
    return result;
  }
  
  /**
   * Determine high-level intelligence intent
   */
  private determineIntelligenceIntent(
    prompt: string,
    unifiedIntent: UnifiedIntentResult,
    contextDetection: DetectionResult
  ): IntelligenceIntent {
    const normalizedPrompt = prompt.toLowerCase().trim();
    
    // Check for smalltalk
    const smalltalkPatterns = [
      /^(hello|hi|hey|greetings|good morning|good afternoon|good evening)/i,
      /^(how are you|how's it going|what's up)/i,
      /^(thanks|thank you|cheers|appreciate it)/i,
      /^(bye|goodbye|see you|farewell)/i,
    ];
    
    if (smalltalkPatterns.some(pattern => pattern.test(normalizedPrompt))) {
      return 'smalltalk';
    }
    
    // Check for ambiguous references
    if (contextDetection.intent === 'ambiguous') {
      return 'ambiguous';
    }
    
    // Check for decision sheet requirement from context detection
    if (contextDetection.requiresDecisionSheet) {
      return 'requires_decision_sheet';
    }
    
    // Map unified intents to intelligence intents
    const intentMap: Record<string, IntelligenceIntent> = {
      'task': 'task_action',
      'subtask': 'task_action',
      'note': 'note_action',
      'project': 'task_action', // Projects are task-like
      'blog': 'note_action', // Blog posts are note-like
      'report': 'note_action', // Reports are note-like
      'diagram': 'media_action', // Diagrams are visual media
      'tree': 'task_action', // Tree records are task-like
      'query': 'query_action',
      'update': 'command_action',
      'voice_note': 'media_action',
      'dictation': 'media_action',
      'transcription': 'media_action',
      'voice_command': 'command_action',
      'compile': 'command_action',
      'chat': 'query_action', // General chat is query-like
    };
    
    const mappedIntent = intentMap[unifiedIntent.intent] || 'query_action';
    
    // Override based on prompt content
    if (this.isMediaActionPrompt(normalizedPrompt)) {
      return 'media_action';
    }
    
    if (this.isNavigationPrompt(normalizedPrompt)) {
      return 'navigation_action';
    }
    
    return mappedIntent;
  }
  
  /**
   * Detect specific media actions
   */
  private detectMediaAction(
    prompt: string,
    unifiedIntent: UnifiedIntentResult
  ): MediaActionType | undefined {
    const normalizedPrompt = prompt.toLowerCase().trim();
    
    // Photo capture/upload
    if (/(take|capture|shoot)\s+(a\s+)?(photo|picture|image)/i.test(normalizedPrompt)) {
      return 'photo_capture';
    }
    
    if (/(upload|add|attach)\s+(a\s+)?(photo|picture|image)/i.test(normalizedPrompt)) {
      return 'photo_upload';
    }
    
    // Voice recording/transcription
    if (/(record|make|create)\s+(a\s+)?(voice|audio)\s+(note|memo|message)/i.test(normalizedPrompt)) {
      return 'voice_recording';
    }
    
    if (/(transcribe|convert)\s+(voice|audio|recording)/i.test(normalizedPrompt)) {
      return 'voice_transcription';
    }
    
    // File operations
    if (/(upload|add|attach)\s+(a\s+)?(file|document|pdf)/i.test(normalizedPrompt)) {
      return 'file_upload';
    }
    
    if (/(download|save|export)\s+(a\s+)?(file|document|pdf)/i.test(normalizedPrompt)) {
      return 'file_download';
    }
    
    // Camera scan
    if (/(scan|read)\s+(with\s+)?(camera)/i.test(normalizedPrompt)) {
      return 'camera_scan';
    }
    
    // Unified intent based detection
    if (unifiedIntent.intent === 'voice_note') {
      return 'voice_recording';
    }
    
    if (unifiedIntent.intent === 'transcription') {
      return 'voice_transcription';
    }
    
    if (unifiedIntent.intent === 'diagram') {
      return 'photo_upload'; // Diagrams are visual uploads
    }
    
    return undefined;
  }
  
  /**
   * Determine if decision sheet is required
   */
  private determineDecisionSheetRequirement(
    contextDetection: DetectionResult,
    unifiedIntent: UnifiedIntentResult,
    intelligenceIntent: IntelligenceIntent,
    mediaAction?: MediaActionType
  ): boolean {
    // Always require decision sheet for ambiguous context
    if (contextDetection.intent === 'ambiguous') {
      return true;
    }
    
    // Require decision sheet for context mismatches
    if (contextDetection.requiresDecisionSheet) {
      return true;
    }
    
    // Require decision sheet for media actions with multiple possible targets
    if (mediaAction && this.hasMultipleMediaTargets(mediaAction)) {
      return true;
    }
    
    // Require decision sheet for unified intents that need confirmation
    if (unifiedIntent.requiresConfirmation) {
      return true;
    }
    
    // Require decision sheet for navigation actions
    if (intelligenceIntent === 'navigation_action') {
      return true;
    }
    
    return false;
  }
  
  /**
   * Determine if acknowledgement is required
   */
  private determineAcknowledgementRequirement(
    unifiedIntent: UnifiedIntentResult,
    intelligenceIntent: IntelligenceIntent
  ): boolean {
    // Acknowledgements for smalltalk
    if (intelligenceIntent === 'smalltalk') {
      return true;
    }
    
    // Acknowledgements for successful commands
    if (intelligenceIntent === 'command_action' && unifiedIntent.confidence > 70) {
      return true;
    }
    
    // Acknowledgements for media actions
    if (intelligenceIntent === 'media_action') {
      return true;
    }
    
    return false;
  }
  
  /**
   * Determine if should route to global Copilot
   */
  private shouldRouteToGlobalCopilot(
    contextDetection: DetectionResult,
    intelligenceIntent: IntelligenceIntent
  ): boolean {
    // Route general queries to global Copilot
    if (contextDetection.intent === 'general') {
      return true;
    }
    
    // Route smalltalk to global Copilot
    if (intelligenceIntent === 'smalltalk') {
      return true;
    }
    
    // Route ambiguous queries to global Copilot
    if (intelligenceIntent === 'ambiguous') {
      return true;
    }
    
    return false;
  }
  
  /**
   * Determine if should prevent history pollution
   */
  private shouldPreventHistoryPollution(
    intelligenceIntent: IntelligenceIntent,
    requiresDecisionSheet: boolean
  ): boolean {
    // Prevent pollution for decision sheet interactions
    if (requiresDecisionSheet) {
      return true;
    }
    
    // Prevent pollution for acknowledgements
    if (intelligenceIntent === 'smalltalk') {
      return true;
    }
    
    // Prevent pollution for navigation actions
    if (intelligenceIntent === 'navigation_action') {
      return true;
    }
    
    return false;
  }
  
  /**
   * Generate decision sheet options
   */
  private generateDecisionSheetOptions(
    intelligenceIntent: IntelligenceIntent,
    contextDetection: DetectionResult,
    mediaAction?: MediaActionType
  ): string[] {
    const options: string[] = [];
    
    // Add context detection options
    if (contextDetection.suggestedActions.length > 0) {
      options.push(...contextDetection.suggestedActions);
    }
    
    // Add media action options
    if (mediaAction) {
      const mediaOptions = this.getMediaActionOptions(mediaAction);
      options.push(...mediaOptions);
    }
    
    // Add intent-specific options
    switch (intelligenceIntent) {
      case 'ambiguous':
        options.push('Clarify which item you mean', 'Show me all items', 'Continue with current context');
        break;
      case 'navigation_action':
        options.push('Switch to target subsystem', 'Stay in current context', 'Open in new tab');
        break;
      case 'requires_decision_sheet':
        options.push('Proceed with action', 'Cancel action', 'Modify parameters');
        break;
    }
    
    // Ensure unique options
    return [...new Set(options)].slice(0, 5); // Limit to 5 options
  }
  
  /**
   * Generate acknowledgement message
   */
  private generateAcknowledgementMessage(
    intelligenceIntent: IntelligenceIntent,
    unifiedIntent: UnifiedIntentResult
  ): string | undefined {
    switch (intelligenceIntent) {
      case 'smalltalk':
        return 'Hello! How can I help you today?';
      case 'media_action':
        return 'Ready to handle your media request.';
      case 'command_action':
        return `Processing your ${unifiedIntent.intent} request...`;
      default:
        return undefined;
    }
  }
  
  /**
   * Calculate overall confidence
   */
  private calculateOverallConfidence(
    unifiedConfidence: number,
    contextConfidence: number
  ): number {
    // Weighted average: 60% unified intent confidence, 40% context confidence
    return Math.round((unifiedConfidence * 0.6) + (contextConfidence * 100 * 0.4));
  }
  
  /**
   * Generate explanation for classification
   */
  private generateExplanation(
    intelligenceIntent: IntelligenceIntent,
    contextDetection: DetectionResult,
    unifiedIntent: UnifiedIntentResult
  ): string {
    const parts: string[] = [];
    
    parts.push(`Classified as ${intelligenceIntent}`);
    
    if (contextDetection.intent !== 'current_item') {
      parts.push(`Context: ${contextDetection.intent}`);
    }
    
    if (contextDetection.subsystem) {
      parts.push(`Subsystem: ${contextDetection.subsystem}`);
    }
    
    parts.push(`Unified intent: ${unifiedIntent.intent} (${unifiedIntent.confidence}% confidence)`);
    
    return parts.join('. ');
  }
  
  // Helper methods
  
  private isMediaActionPrompt(prompt: string): boolean {
    const mediaPatterns = [
      /(photo|image|picture|camera|voice|audio|file|document|upload|download|record|scan)/i,
    ];
    return mediaPatterns.some(pattern => pattern.test(prompt));
  }
  
  private isNavigationPrompt(prompt: string): boolean {
    const navigationPatterns = [
      /(go to|switch to|open|navigate to|show me|take me to)/i,
      /(email|gallery|tasks|calendar|files|notes|projects|reports|voice|camera)/i,
    ];
    return navigationPatterns.some(pattern => pattern.test(prompt));
  }
  
  private hasMultipleMediaTargets(mediaAction: MediaActionType): boolean {
    // Media actions that could target multiple subsystems
    const multiTargetActions: MediaActionType[] = [
      'photo_upload',
      'file_upload',
      'voice_recording',
    ];
    return multiTargetActions.includes(mediaAction);
  }
  
  private getMediaActionOptions(mediaAction: MediaActionType): string[] {
    const optionsMap: Record<MediaActionType, string[]> = {
      'photo_capture': ['Open camera', 'Use existing photo', 'Cancel'],
      'photo_upload': ['Upload to gallery', 'Attach to note', 'Add to project', 'Cancel'],
      'voice_recording': ['Record new note', 'Transcribe existing', 'Cancel'],
      'voice_transcription': ['Transcribe now', 'Upload audio file', 'Cancel'],
      'file_upload': ['Upload to files', 'Attach to project', 'Add to note', 'Cancel'],
      'file_download': ['Download now', 'Save to cloud', 'Cancel'],
      'camera_scan': ['Scan document', 'Scan QR code', 'Cancel'],
    };
    
    return optionsMap[mediaAction] || ['Proceed', 'Cancel'];
  }
}

// Singleton instance
export const intentClassifier = new IntentClassifier();