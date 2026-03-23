/**
 * Voice Interaction Layer Type Definitions
 * Phase 34.5 - Voice Interaction System
 */

export type VoiceIntentType = 'navigation' | 'editing' | 'search' | 'formatting' | 'document' | 'system' | 'unknown';

export type VoiceCommandStatus = 'pending' | 'recognized' | 'executed' | 'failed' | 'cancelled';

export type SpeechRecognitionState = 'idle' | 'listening' | 'processing' | 'error';

export interface VoiceCommand {
  id: string;
  text: string;
  intent: VoiceIntentType;
  confidence: number;
  status: VoiceCommandStatus;
  startTime: number;
  endTime?: number;
  duration?: number;
  parameters: Record<string, any>;
  error?: string;
}

export interface SpeechRecognitionConfig {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  sampleRate?: number;
  noiseThreshold?: number;
  silenceThreshold?: number;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives: Array<{ transcript: string; confidence: number }>;
  duration: number;
}

export interface VoiceIntent {
  type: VoiceIntentType;
  keywords: string[];
  pattern?: RegExp;
  description: string;
  parameters: Record<string, any>;
}

export interface VoiceCommandParameters {
  action?: string;
  target?: string;
  format?: string;
  style?: string;
  value?: string;
  text?: string;
  selection?: string;
  document?: string;
  searchQuery?: string;
  direction?: 'forward' | 'backward';
  level?: 'paragraph' | 'heading' | 'block';
  case?: 'sentence' | 'lowercase' | 'uppercase' | 'title';
}

export interface VoiceInteractionContext {
  id: string;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  currentSelection?: {
    text: string;
    position: number;
    length: number;
  };
  currentDocument?: {
    id: string;
    name: string;
  };
  currentView?: string;
  systemState: Record<string, any>;
}

export interface VoiceInteractionEngineConfig {
  language?: string;
  enableContinuousListening?: boolean;
  enableInterimResults?: boolean;
  enableContextAwareness?: boolean;
  enableFeedback?: boolean;
  enableErrorHandling?: boolean;
  noiseThreshold?: number;
  silenceThreshold?: number;
  maxCommandQueue?: number;
  defaultTimeout?: number;
}

export interface VoiceInteractionResult {
  success: boolean;
  command?: VoiceCommand;
  intent?: VoiceIntent;
  transcript?: string;
  error?: string;
  duration: number;
  metadata?: Record<string, any>;
}

export interface VoiceFeedback {
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  timestamp: number;
  duration?: number;
}

export interface SpeechRecognitionStats {
  totalRecognitions: number;
  successfulRecognitions: number;
  failedRecognitions: number;
  averageConfidence: number;
  totalDuration: number;
  averageDuration: number;
  recognitionErrors: string[];
  lastError?: string;
  lastErrorTime?: number;
}

export interface VoiceCommandHistory {
  commands: VoiceCommand[];
  limit: number;
}

export interface CommandParserConfig {
  enableContextualAnalysis?: boolean;
  enableEntityExtraction?: boolean;
  enablePatternMatching?: boolean;
  enableNaturalLanguageProcessing?: boolean;
}

export interface ParsedCommand {
  text: string;
  intent: VoiceIntentType;
  confidence: number;
  parameters: VoiceCommandParameters;
  entities: Record<string, any>;
  rawText: string;
}
