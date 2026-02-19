/**
 * Workflow Event System
 * 
 * Manages events for workflow learning and analysis.
 */

import { UserInteractionEvent, WorkflowAnalysisResult, WorkflowProfile, WorkflowPrediction } from '../WorkflowProfile';

export type WorkflowEventType = 
  | 'workflow:interactionObserved'
  | 'workflow:analysisStarted'
  | 'workflow:analysisComplete'
  | 'workflow:profileCreated'
  | 'workflow:profileUpdated'
  | 'workflow:profileMerged'
  | 'workflow:profileArchived'
  | 'workflow:predictionGenerated'
  | 'workflow:suggestionGenerated'
  | 'workflow:warningGenerated'
  | 'workflow:storageLoaded'
  | 'workflow:storageSaved'
  | 'workflow:error'
  | 'workflow:completed';

export interface WorkflowEvent {
  type: WorkflowEventType;
  timestamp: Date;
  correlationId?: string;
  data: any;
  metadata?: {
    userId?: string;
    profileId?: string;
    sessionId?: string;
    source?: string;
  };
}

export type WorkflowEventListener = (event: WorkflowEvent) => void;

export class WorkflowEventSystem {
  private listeners: Map<WorkflowEventType, Set<WorkflowEventListener>> = new Map();
  private eventHistory: WorkflowEvent[] = [];
  private maxHistorySize: number = 1000;
  
  /**
   * Constructor
   */
  constructor() {
    // Initialize listener sets for all event types
    const eventTypes: WorkflowEventType[] = [
      'workflow:interactionObserved',
      'workflow:analysisStarted',
      'workflow:analysisComplete',
      'workflow:profileCreated',
      'workflow:profileUpdated',
      'workflow:profileMerged',
      'workflow:profileArchived',
      'workflow:predictionGenerated',
      'workflow:suggestionGenerated',
      'workflow:warningGenerated',
      'workflow:storageLoaded',
      'workflow:storageSaved',
      'workflow:error',
      'workflow:completed'
    ];
    
    eventTypes.forEach(type => {
      this.listeners.set(type, new Set());
    });
  }
  
  /**
   * Emit an event
   */
  emit(eventType: WorkflowEventType, data: any, metadata?: WorkflowEvent['metadata']): void {
    const event: WorkflowEvent = {
      type: eventType,
      timestamp: new Date(),
      data,
      metadata
    };
    
    // Add to history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
    
    // Notify listeners
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in workflow event listener for ${eventType}:`, error);
        }
      });
    }
    
    // Also notify wildcard listeners
    const wildcardListeners = this.listeners.get('*' as WorkflowEventType);
    if (wildcardListeners) {
      wildcardListeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in wildcard workflow event listener:`, error);
        }
      });
    }
  }
  
  /**
   * Add event listener
   */
  on(eventType: WorkflowEventType, listener: WorkflowEventListener): () => void {
    let listeners = this.listeners.get(eventType);
    if (!listeners) {
      listeners = new Set();
      this.listeners.set(eventType, listeners);
    }
    
    listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.off(eventType, listener);
    };
  }
  
  /**
   * Remove event listener
   */
  off(eventType: WorkflowEventType, listener: WorkflowEventListener): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }
  
  /**
   * Add wildcard listener (listens to all events)
   */
  onAll(listener: WorkflowEventListener): () => void {
    return this.on('*' as WorkflowEventType, listener);
  }
  
  /**
   * Emit interaction observed event
   */
  emitInteractionObserved(event: UserInteractionEvent): void {
    this.emit('workflow:interactionObserved', event, {
      userId: event.userId,
      sessionId: event.sessionId,
      source: 'user_interaction'
    });
  }
  
  /**
   * Emit analysis started event
   */
  emitAnalysisStarted(userId: string, sessionId?: string): void {
    this.emit('workflow:analysisStarted', { userId, sessionId }, {
      userId,
      sessionId,
      source: 'analysis_engine'
    });
  }
  
  /**
   * Emit analysis complete event
   */
  emitAnalysisComplete(result: WorkflowAnalysisResult): void {
    this.emit('workflow:analysisComplete', result, {
      userId: result.userId,
      source: 'analysis_engine'
    });
  }
  
  /**
   * Emit profile created event
   */
  emitProfileCreated(profile: WorkflowProfile): void {
    this.emit('workflow:profileCreated', profile, {
      userId: profile.userId,
      profileId: profile.id,
      source: 'profile_generator'
    });
  }
  
  /**
   * Emit profile updated event
   */
  emitProfileUpdated(profile: WorkflowProfile): void {
    this.emit('workflow:profileUpdated', profile, {
      userId: profile.userId,
      profileId: profile.id,
      source: 'profile_updater'
    });
  }
  
  /**
   * Emit profile merged event
   */
  emitProfileMerged(profile: WorkflowProfile, sourceProfiles: WorkflowProfile[]): void {
    this.emit('workflow:profileMerged', { profile, sourceProfiles }, {
      userId: profile.userId,
      profileId: profile.id,
      source: 'profile_merger'
    });
  }
  
  /**
   * Emit prediction generated event
   */
  emitPredictionGenerated(prediction: WorkflowPrediction): void {
    this.emit('workflow:predictionGenerated', prediction, {
      userId: prediction.userId,
      source: 'prediction_engine'
    });
  }
  
  /**
   * Emit suggestion generated event
   */
  emitSuggestionGenerated(suggestion: any, userId: string): void {
    this.emit('workflow:suggestionGenerated', suggestion, {
      userId,
      source: 'suggestion_engine'
    });
  }
  
  /**
   * Emit warning generated event
   */
  emitWarningGenerated(warning: any, userId: string): void {
    this.emit('workflow:warningGenerated', warning, {
      userId,
      source: 'warning_engine'
    });
  }
  
  /**
   * Emit error event
   */
  emitError(error: Error, context: any): void {
    this.emit('workflow:error', { error, context }, {
      source: 'error_handler'
    });
  }
  
  /**
   * Get event history
   */
  getEventHistory(filter?: { type?: WorkflowEventType; userId?: string; startTime?: Date; endTime?: Date }): WorkflowEvent[] {
    let filtered = this.eventHistory;
    
    if (filter?.type) {
      filtered = filtered.filter(event => event.type === filter.type);
    }
    
    if (filter?.userId) {
      filtered = filtered.filter(event => event.metadata?.userId === filter.userId);
    }
    
    if (filter?.startTime) {
      filtered = filtered.filter(event => event.timestamp >= filter.startTime!);
    }
    
    if (filter?.endTime) {
      filtered = filtered.filter(event => event.timestamp <= filter.endTime!);
    }
    
    return filtered;
  }
  
  /**
   * Clear event history
   */
  clearEventHistory(): void {
    this.eventHistory = [];
  }
  
  /**
   * Get statistics about events
   */
  getEventStatistics(): {
    totalEvents: number;
    eventsByType: Record<WorkflowEventType, number>;
    eventsByUser: Record<string, number>;
    eventsByHour: Record<number, number>;
  } {
    const eventsByType: Record<WorkflowEventType, number> = {} as Record<WorkflowEventType, number>;
    const eventsByUser: Record<string, number> = {};
    const eventsByHour: Record<number, number> = {};
    
    this.eventHistory.forEach(event => {
      // Count by type
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      
      // Count by user
      const userId = event.metadata?.userId || 'unknown';
      eventsByUser[userId] = (eventsByUser[userId] || 0) + 1;
      
      // Count by hour
      const hour = event.timestamp.getHours();
      eventsByHour[hour] = (eventsByHour[hour] || 0) + 1;
    });
    
    return {
      totalEvents: this.eventHistory.length,
      eventsByType,
      eventsByUser,
      eventsByHour
    };
  }
  
  /**
   * Create a correlation ID for tracking related events
   */
  createCorrelationId(prefix: string = 'corr'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}