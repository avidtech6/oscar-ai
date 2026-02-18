/**
 * Intent Feedback Service
 * 
 * Unified UI feedback system for intent detection and action execution.
 * Provides consistent user feedback across all intent types and modes.
 */

import { writable, derived } from 'svelte/store';
import { unifiedIntentEngine, type IntentResult } from './UnifiedIntentEngine';
import { actionExecutorService, type ActionResult } from './ActionExecutorService';
import { projectContextStore } from './ProjectContextStore';

export type FeedbackType = 
  | 'intent_detected'
  | 'action_required'
  | 'execution_result'
  | 'context_switch'
  | 'voice_recording'
  | 'error';

export interface FeedbackMessage {
  id: string;
  type: FeedbackType;
  title: string;
  message: string;
  intent?: string;
  confidence?: number;
  requiresConfirmation?: boolean;
  conversionOptions?: string[];
  data?: any;
  timestamp: Date;
  autoDismiss?: boolean;
  dismissAfter?: number; // milliseconds
}

export interface FeedbackState {
  messages: FeedbackMessage[];
  activeIntent: IntentResult | null;
  pendingAction: {
    intent: IntentResult;
    data: any;
    conversionOptions?: string[];
  } | null;
  isShowingFeedback: boolean;
  lastVoiceRecordingState: 'idle' | 'recording' | 'processing' | 'error';
}

const defaultState: FeedbackState = {
  messages: [],
  activeIntent: null,
  pendingAction: null,
  isShowingFeedback: false,
  lastVoiceRecordingState: 'idle',
};

function createIntentFeedbackService() {
  const { subscribe, set, update } = writable<FeedbackState>(defaultState);

  // Auto-dismiss old messages
  setInterval(() => {
    update(state => {
      const now = new Date();
      const filteredMessages = state.messages.filter(msg => {
        if (!msg.autoDismiss) return true;
        const age = now.getTime() - msg.timestamp.getTime();
        return age < (msg.dismissAfter || 5000);
      });
      
      if (filteredMessages.length === state.messages.length) {
        return state;
      }
      
      return {
        ...state,
        messages: filteredMessages,
        isShowingFeedback: filteredMessages.length > 0,
      };
    });
  }, 1000);

  return {
    subscribe,
    
    /**
     * Show intent detection feedback
     */
    showIntentDetected(intentResult: IntentResult): void {
      const message: FeedbackMessage = {
        id: crypto.randomUUID(),
        type: 'intent_detected',
        title: `Detected: ${this.formatIntentName(intentResult.intent)}`,
        message: this.getIntentDescription(intentResult),
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        requiresConfirmation: intentResult.requiresConfirmation,
        conversionOptions: intentResult.conversionOptions,
        data: intentResult.data,
        timestamp: new Date(),
        autoDismiss: intentResult.confidence >= 80 && !intentResult.requiresConfirmation,
        dismissAfter: 3000,
      };
      
      update(state => ({
        ...state,
        messages: [message, ...state.messages].slice(0, 5), // Keep last 5 messages
        activeIntent: intentResult,
        isShowingFeedback: true,
      }));
    },
    
    /**
     * Show action required feedback (confirmation needed)
     */
    showActionRequired(
      intentResult: IntentResult, 
      data: any,
      conversionOptions?: string[]
    ): void {
      const message: FeedbackMessage = {
        id: crypto.randomUUID(),
        type: 'action_required',
        title: 'Action Required',
        message: this.getConfirmationMessage(intentResult),
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        requiresConfirmation: true,
        conversionOptions: conversionOptions || intentResult.conversionOptions,
        data,
        timestamp: new Date(),
        autoDismiss: false,
      };
      
      update(state => ({
        ...state,
        messages: [message, ...state.messages].slice(0, 5),
        activeIntent: intentResult,
        pendingAction: { intent: intentResult, data, conversionOptions },
        isShowingFeedback: true,
      }));
    },
    
    /**
     * Show execution result feedback
     */
    showExecutionResult(result: ActionResult): void {
      const message: FeedbackMessage = {
        id: crypto.randomUUID(),
        type: 'execution_result',
        title: result.success ? 'Success' : 'Failed',
        message: result.message,
        data: result.data,
        timestamp: new Date(),
        autoDismiss: true,
        dismissAfter: 5000,
      };
      
      update(state => ({
        ...state,
        messages: [message, ...state.messages].slice(0, 5),
        activeIntent: null,
        pendingAction: null,
        isShowingFeedback: true,
      }));
    },
    
    /**
     * Show context switch feedback
     */
    showContextSwitch(
      projectName: string | null, 
      oldProjectName: string | null,
      reason: 'auto_inference' | 'user_selection' | 'intent_detection'
    ): void {
      let title = 'Context Changed';
      let message = '';
      
      if (projectName) {
        if (oldProjectName) {
          message = `Switched from "${oldProjectName}" to "${projectName}"`;
        } else {
          message = `Set context to "${projectName}"`;
        }
      } else {
        message = 'Cleared project context';
      }
      
      if (reason === 'auto_inference') {
        title = 'Auto Context Detection';
        message += ' (auto-detected from message)';
      }
      
      const feedback: FeedbackMessage = {
        id: crypto.randomUUID(),
        type: 'context_switch',
        title,
        message,
        timestamp: new Date(),
        autoDismiss: true,
        dismissAfter: 4000,
      };
      
      update(state => ({
        ...state,
        messages: [feedback, ...state.messages].slice(0, 5),
        isShowingFeedback: true,
      }));
    },
    
    /**
     * Show voice recording feedback
     */
    showVoiceRecording(state: 'started' | 'stopped' | 'processing' | 'error', details?: string): void {
      const titles = {
        started: 'Voice Recording Started',
        stopped: 'Voice Recording Stopped',
        processing: 'Processing Audio',
        error: 'Recording Error',
      };
      
      const messages = {
        started: 'Recording audio... Speak now.',
        stopped: 'Recording complete. Processing...',
        processing: 'Transcribing audio...',
        error: details || 'Failed to record audio',
      };
      
      const feedback: FeedbackMessage = {
        id: crypto.randomUUID(),
        type: 'voice_recording',
        title: titles[state],
        message: messages[state],
        timestamp: new Date(),
        autoDismiss: state !== 'started',
        dismissAfter: state === 'error' ? 5000 : 3000,
      };
      
      update(currentState => ({
        ...currentState,
        messages: [feedback, ...currentState.messages].slice(0, 5),
        lastVoiceRecordingState: state === 'started' ? 'recording' : 
                               state === 'processing' ? 'processing' : 
                               state === 'error' ? 'error' : 'idle',
        isShowingFeedback: true,
      }));
    },
    
    /**
     * Show error feedback
     */
    showError(title: string, message: string, details?: any): void {
      const feedback: FeedbackMessage = {
        id: crypto.randomUUID(),
        type: 'error',
        title,
        message,
        data: details,
        timestamp: new Date(),
        autoDismiss: true,
        dismissAfter: 7000,
      };
      
      update(state => ({
        ...state,
        messages: [feedback, ...state.messages].slice(0, 5),
        isShowingFeedback: true,
      }));
    },
    
    /**
     * Clear pending action
     */
    clearPendingAction(): void {
      update(state => ({
        ...state,
        pendingAction: null,
        activeIntent: null,
      }));
    },
    
    /**
     * Dismiss a specific message
     */
    dismissMessage(id: string): void {
      update(state => {
        const filtered = state.messages.filter(msg => msg.id !== id);
        return {
          ...state,
          messages: filtered,
          isShowingFeedback: filtered.length > 0,
        };
      });
    },
    
    /**
     * Get feedback message for an intent result (used by UI components)
     */
    getFeedback(intentResult: IntentResult): { message: string; type: FeedbackType } {
      if (intentResult.requiresConfirmation) {
        return {
          message: this.getConfirmationMessage(intentResult),
          type: 'action_required'
        };
      }
      
      return {
        message: this.getIntentDescription(intentResult),
        type: 'intent_detected'
      };
    },

    /**
     * Clear all messages
     */
    clearAllMessages(): void {
      update(state => ({
        ...state,
        messages: [],
        isShowingFeedback: false,
        activeIntent: null,
        pendingAction: null,
      }));
    },
    
    /**
     * Get current pending action
     */
    getPendingAction() {
      let pendingAction: any = null;
      subscribe(state => {
        pendingAction = state.pendingAction;
      })();
      return pendingAction;
    },
    
    /**
     * Check if there's a pending action requiring confirmation
     */
    hasPendingAction(): boolean {
      let hasAction = false;
      subscribe(state => {
        hasAction = state.pendingAction !== null;
      })();
      return hasAction;
    },
    
    /**
     * Format intent name for display
     */
    formatIntentName(intent: string): string {
      const nameMap: Record<string, string> = {
        task: 'Task',
        subtask: 'Subtask',
        note: 'Note',
        project: 'Project',
        blog: 'Blog Post',
        report: 'Report',
        diagram: 'Diagram',
        tree: 'Tree Record',
        query: 'Query',
        update: 'Update',
        chat: 'Chat',
        voice_note: 'Voice Note',
        dictation: 'Dictation',
        transcription: 'Transcription',
        voice_command: 'Voice Command',
      };
      
      return nameMap[intent] || intent.replace('_', ' ').toUpperCase();
    },
    
    /**
     * Get intent description for feedback
     */
    getIntentDescription(intentResult: IntentResult): string {
      const { intent, confidence } = intentResult;
      
      let description = '';
      
      switch (intent) {
        case 'task':
          description = 'Create a new task';
          break;
        case 'note':
          description = 'Create a new note';
          break;
        case 'project':
          description = 'Create a new project';
          break;
        case 'voice_note':
          description = 'Save a voice recording';
          break;
        case 'dictation':
          description = 'Transcribe speech to text';
          break;
        case 'query':
          description = 'Search or list items';
          break;
        default:
          description = `Process as ${this.formatIntentName(intent)}`;
      }
      
      if (confidence >= 80) {
        description += ' (High confidence)';
      } else if (confidence >= 60) {
        description += ' (Medium confidence)';
      } else {
        description += ' (Low confidence - needs clarification)';
      }
      
      return description;
    },
    
    /**
     * Get confirmation message for action
     */
    getConfirmationMessage(intentResult: IntentResult): string {
      const { intent, confidence } = intentResult;
      
      if (confidence < 60) {
        return 'I\'m not sure what you meant. Could you clarify?';
      }
      
      if (confidence < 80) {
        return `I think you want to ${this.formatIntentName(intent).toLowerCase()}. Is that correct?`;
      }
      
      // High confidence but in General Chat mode
      return `Create ${this.formatIntentName(intent).toLowerCase()} in General Chat mode?`;
    },
  };
}

export const intentFeedbackService = createIntentFeedbackService();

// Derived stores for convenience
export const feedbackMessages = derived(
  intentFeedbackService,
  ($service) => $service.messages
);

export const pendingAction = derived(
  intentFeedbackService,
  ($service) => $service.pendingAction
);

export const hasPendingAction = derived(
  intentFeedbackService,
  ($service) => $service.pendingAction !== null
);

export const isShowingFeedback = derived(
  intentFeedbackService,
  ($service) => $service.isShowingFeedback
);

export const lastVoiceRecordingState = derived(
  intentFeedbackService,
  ($service) => $service.lastVoiceRecordingState
);

/**
 * Helper function to process intent with automatic feedback
 */
export async function processIntentWithFeedback(
  input: string, 
  options?: { isVoice?: boolean; voiceData?: any }
): Promise<ActionResult | null> {
  try {
    // Detect intent
    const intentResult = await unifiedIntentEngine.detectIntent(input, options);
    
    // Show intent detection feedback
    intentFeedbackService.showIntentDetected(intentResult);
    
    // Check if action requires confirmation
    const context = {
      mode: 'general' as const, // Simplified for now
      projectId: null,
      timestamp: new Date(),
    };
    
    const needsConfirmation = intentResult.requiresConfirmation;
    
    if (needsConfirmation) {
      // Show action required feedback
      intentFeedbackService.showActionRequired(
        intentResult, 
        intentResult.data, 
        intentResult.conversionOptions
      );
      return null;
    }
    
    // Execute immediately
    const result = await actionExecutorService.execute(intentResult);
    
    // Show execution result
    intentFeedbackService.showExecutionResult(result);
    
    return result;
  } catch (error) {
    console.error('Error processing intent:', error);
    intentFeedbackService.showError(
      'Intent Processing Failed',
      error instanceof Error ? error.message : 'Unknown error',
      error
    );
    return null;
  }
}