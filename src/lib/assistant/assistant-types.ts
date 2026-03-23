/**
 * Global Assistant Intelligence Layer - PHASE 21
 * Type definitions for the Assistant Intelligence System
 */

/**
 * Assistant configuration interface
 */
export interface AssistantConfig {
  model: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
  enableContext: boolean;
  enableMemory: boolean;
  maxContextLength: number;
}

/**
 * Conversation context interface
 */
export interface ConversationContext {
  sessionId: string;
  userId?: string;
  messages: AssistantMessage[];
  context: Record<string, any>;
  timestamp: Date;
}

/**
 * Assistant message interface
 */
export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Assistant response interface
 */
export interface AssistantResponse {
  id: string;
  content: string;
  confidence: number;
  suggestions: string[];
  actions: AssistantAction[];
  context: ConversationContext;
  timestamp: Date;
}

/**
 * Assistant action interface
 */
export interface AssistantAction {
  id: string;
  type: 'command' | 'navigation' | 'creation' | 'modification';
  description: string;
  parameters: Record<string, any>;
  confidence: number;
}

/**
 * Assistant memory interface
 */
export interface AssistantMemory {
  id: string;
  userId: string;
  content: string;
  type: 'preference' | 'context' | 'history';
  timestamp: Date;
  expiresAt?: Date;
}

/**
 * Assistant capabilities interface
 */
export interface AssistantCapabilities {
  contextUnderstanding: boolean;
  memoryManagement: boolean;
  actionGeneration: boolean;
  suggestionGeneration: boolean;
  multiSession: boolean;
  userPersonalization: boolean;
}

/**
 * Assistant session statistics
 */
export interface SessionStats {
  sessionId: string;
  messageCount: number;
  duration: number;
  averageResponseTime: number;
  satisfactionScore: number;
  errorRate: number;
}

/**
 * Assistant performance metrics
 */
export interface AssistantMetrics {
  totalSessions: number;
  activeSessions: number;
  averageSessionDuration: number;
  totalMessages: number;
  averageResponseTime: number;
  errorRate: number;
  satisfactionScore: number;
  memoryUsage: number;
}

/**
 * Assistant error types
 */
export enum AssistantErrorType {
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  INVALID_INPUT = 'INVALID_INPUT',
  MODEL_ERROR = 'MODEL_ERROR',
  MEMORY_ERROR = 'MEMORY_ERROR',
  CONTEXT_ERROR = 'CONTEXT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

/**
 * Assistant error interface
 */
export interface AssistantError {
  type: AssistantErrorType;
  message: string;
  timestamp: Date;
  sessionId?: string;
  code?: string;
  details?: Record<string, any>;
}

/**
 * Assistant event types
 */
export enum AssistantEventType {
  SESSION_STARTED = 'SESSION_STARTED',
  SESSION_ENDED = 'SESSION_ENDED',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  RESPONSE_GENERATED = 'RESPONSE_GENERATED',
  ACTION_EXECUTED = 'ACTION_EXECUTED',
  MEMORY_STORED = 'MEMORY_STORED',
  ERROR_OCCURRED = 'ERROR_OCCURRED'
}

/**
 * Assistant event interface
 */
export interface AssistantEvent {
  type: AssistantEventType;
  timestamp: Date;
  sessionId?: string;
  userId?: string;
  data: Record<string, any>;
}

/**
 * Assistant event listener
 */
export type AssistantEventListener = (event: AssistantEvent) => void;

/**
 * Assistant configuration options
 */
export interface AssistantOptions {
  config: AssistantConfig;
  listeners?: AssistantEventListener[];
  enableMetrics?: boolean;
  enableLogging?: boolean;
  maxConcurrentSessions?: number;
  sessionTimeout?: number;
}

/**
 * Assistant initialization result
 */
export interface AssistantInitResult {
  success: boolean;
  sessionId?: string;
  error?: AssistantError;
}