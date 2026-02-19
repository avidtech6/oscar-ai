/**
 * User Workflow Learning Engine
 * 
 * Observes user interactions, analyzes report creation sequences,
 * detects workflow patterns, and provides intelligent predictions
 * and suggestions based on learned user behavior.
 */

import { WorkflowProfile, UserInteractionEvent, WorkflowAnalysisResult, WorkflowPrediction } from './WorkflowProfile';

export class UserWorkflowLearningEngine {
  private observedEvents: UserInteractionEvent[] = [];
  private workflowProfiles: Map<string, WorkflowProfile> = new Map();
  private eventListeners: Map<string, Array<(data: any) => void>> = new Map();
  
  /**
   * Constructor
   */
  constructor() {
    this.initializeEventSystem();
  }
  
  /**
   * Initialize the event system
   */
  private initializeEventSystem(): void {
    const eventTypes = [
      'workflow:interactionObserved',
      'workflow:analysisComplete',
      'workflow:profileCreated',
      'workflow:profileUpdated',
      'workflow:merged',
      'workflow:completed'
    ];
    
    eventTypes.forEach(eventType => {
      this.eventListeners.set(eventType, []);
    });
  }
  
  /**
   * Emit an event to registered listeners
   */
  private emitEvent(eventType: string, data: any): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for ${eventType}:`, error);
      }
    });
  }
  
  /**
   * Add event listener
   */
  addEventListener(eventType: string, listener: (data: any) => void): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.push(listener);
    this.eventListeners.set(eventType, listeners);
  }
  
  /**
   * Remove event listener
   */
  removeEventListener(eventType: string, listener: (data: any) => void): void {
    const listeners = this.eventListeners.get(eventType) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
      this.eventListeners.set(eventType, listeners);
    }
  }
  
  /**
   * Observe a user interaction
   */
  observeInteraction(event: UserInteractionEvent): void {
    // Store the event
    this.observedEvents.push(event);
    
    // Emit event
    this.emitEvent('workflow:interactionObserved', event);
    
    // Trigger analysis if we have enough events
    if (this.shouldTriggerAnalysis(event.userId)) {
      this.analyseInteractions(event.userId);
    }
  }
  
  /**
   * Determine if we should trigger analysis for a user
   */
  private shouldTriggerAnalysis(userId: string): boolean {
    const userEvents = this.observedEvents.filter(e => e.userId === userId);
    
    // Trigger analysis if we have at least 10 events or if it's been a while
    if (userEvents.length >= 10) {
      return true;
    }
    
    // Check time-based triggering (not implemented in this basic version)
    return false;
  }
  
  /**
   * Analyze interactions for a user
   */
  analyseInteractions(userId: string): WorkflowAnalysisResult {
    const userEvents = this.observedEvents.filter(e => e.userId === userId);
    
    if (userEvents.length === 0) {
      throw new Error(`No events found for user ${userId}`);
    }
    
    // Perform analysis
    const analysisResult: WorkflowAnalysisResult = {
      id: `analysis_${Date.now()}_${userId}`,
      userId,
      timeRange: {
        start: userEvents[0].timestamp,
        end: userEvents[userEvents.length - 1].timestamp
      },
      patterns: {
        sectionOrder: this.analyzeSectionOrder(userEvents),
        omissions: this.analyzeOmissions(userEvents),
        corrections: this.analyzeCorrections(userEvents),
        interactions: this.analyzeInteractionPatterns(userEvents),
        dataSources: this.analyzeDataSources(userEvents)
      },
      confidenceScores: {
        sectionOrder: this.computeSectionOrderConfidence(userEvents),
        omissions: this.computeOmissionsConfidence(userEvents),
        corrections: this.computeCorrectionsConfidence(userEvents),
        interactions: this.computeInteractionsConfidence(userEvents),
        dataSources: this.computeDataSourcesConfidence(userEvents),
        overall: this.computeOverallConfidence(userEvents)
      },
      recommendations: this.generateRecommendations(userEvents),
      analyzedAt: new Date()
    };
    
    // Emit event
    this.emitEvent('workflow:analysisComplete', analysisResult);
    
    // Generate or update workflow profile
    this.generateWorkflowProfile(userId, analysisResult);
    
    return analysisResult;
  }
  
  /**
   * Analyze section order patterns
   */
  analyzeSectionOrder(events: UserInteractionEvent[]): Array<{ pattern: string[]; frequency: number; confidence: number }> {
    // Extract section creation events
    const sectionEvents = events.filter(e => 
      e.eventType === 'section_created' || e.eventType === 'section_reordered'
    );
    
    // Group by session and extract section sequences
    const sessions = new Map<string, string[]>();
    
    sectionEvents.forEach(event => {
      const sessionId = event.sessionId;
      if (!sessions.has(sessionId)) {
        sessions.set(sessionId, []);
      }
      
      const section = event.data?.section || event.context?.currentSection;
      if (section) {
        sessions.get(sessionId)!.push(section);
      }
    });
    
    // Count pattern frequencies
    const patternCounts = new Map<string, number>();
    sessions.forEach(sequence => {
      if (sequence.length > 1) {
        const patternKey = sequence.join('->');
        patternCounts.set(patternKey, (patternCounts.get(patternKey) || 0) + 1);
      }
    });
    
    // Convert to result format
    const results: Array<{ pattern: string[]; frequency: number; confidence: number }> = [];
    patternCounts.forEach((frequency, patternKey) => {
      const pattern = patternKey.split('->');
      const confidence = Math.min(frequency / sessions.size, 1.0);
      
      results.push({
        pattern,
        frequency,
        confidence
      });
    });
    
    // Sort by frequency (descending)
    return results.sort((a, b) => b.frequency - a.frequency);
  }
  
  /**
   * Analyze common omissions
   */
  analyzeOmissions(events: UserInteractionEvent[]): Array<{ section: string; frequency: number; context: string[] }> {
    // This is a simplified implementation
    // In a real system, we would compare against expected sections from report type
    
    const omissions: Array<{ section: string; frequency: number; context: string[] }> = [];
    
    // For now, return empty array - this would be implemented with report type integration
    return omissions;
  }
  
  /**
   * Analyze common corrections
   */
  analyzeCorrections(events: UserInteractionEvent[]): Array<{ from: string; to: string; frequency: number; context: string }> {
    const corrections: Array<{ from: string; to: string; frequency: number; context: string }> = [];
    
    // Look for field correction events
    const correctionEvents = events.filter(e => e.eventType === 'field_corrected');
    
    // Group similar corrections
    const correctionCounts = new Map<string, number>();
    const correctionContexts = new Map<string, string>();
    
    correctionEvents.forEach(event => {
      const from = event.data?.from;
      const to = event.data?.to;
      const context = event.context?.currentSection || 'unknown';
      
      if (from && to) {
        const key = `${from}->${to}`;
        correctionCounts.set(key, (correctionCounts.get(key) || 0) + 1);
        correctionContexts.set(key, context);
      }
    });
    
    // Convert to result format
    correctionCounts.forEach((frequency, key) => {
      const [from, to] = key.split('->');
      const context = correctionContexts.get(key) || 'unknown';
      
      corrections.push({
        from,
        to,
        frequency,
        context
      });
    });
    
    // Sort by frequency (descending)
    return corrections.sort((a, b) => b.frequency - a.frequency);
  }
  
  /**
   * Analyze interaction patterns
   */
  analyzeInteractionPatterns(events: UserInteractionEvent[]): Array<{ pattern: string; frequency: number; averageDuration: number }> {
    const patterns: Array<{ pattern: string; frequency: number; averageDuration: number }> = [];
    
    // Group events by type and calculate frequencies
    const eventTypeCounts = new Map<string, number>();
    const eventTypeDurations = new Map<string, number[]>();
    
    events.forEach(event => {
      const type = event.eventType;
      eventTypeCounts.set(type, (eventTypeCounts.get(type) || 0) + 1);
      
      if (event.context?.timeSpent) {
        if (!eventTypeDurations.has(type)) {
          eventTypeDurations.set(type, []);
        }
        eventTypeDurations.get(type)!.push(event.context.timeSpent);
      }
    });
    
    // Convert to result format
    eventTypeCounts.forEach((frequency, pattern) => {
      const durations = eventTypeDurations.get(pattern) || [];
      const averageDuration = durations.length > 0 
        ? durations.reduce((sum, dur) => sum + dur, 0) / durations.length 
        : 0;
      
      patterns.push({
        pattern,
        frequency,
        averageDuration
      });
    });
    
    // Sort by frequency (descending)
    return patterns.sort((a, b) => b.frequency - a.frequency);
  }
  
  /**
   * Analyze data sources
   */
  analyzeDataSources(events: UserInteractionEvent[]): Array<{ source: string; frequency: number; context: string[] }> {
    const dataSources: Array<{ source: string; frequency: number; context: string[] }> = [];
    
    // Extract data source events
    const sourceEvents = events.filter(e => e.eventType === 'data_source_used');
    
    // Group by source
    const sourceCounts = new Map<string, number>();
    const sourceContexts = new Map<string, Set<string>>();
    
    sourceEvents.forEach(event => {
      const source = event.data?.source || 'unknown';
      const context = event.context?.currentSection || 'unknown';
      
      sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
      
      if (!sourceContexts.has(source)) {
        sourceContexts.set(source, new Set());
      }
      sourceContexts.get(source)!.add(context);
    });
    
    // Convert to result format
    sourceCounts.forEach((frequency, source) => {
      const contexts = Array.from(sourceContexts.get(source) || []);
      
      dataSources.push({
        source,
        frequency,
        context: contexts
      });
    });
    
    // Sort by frequency (descending)
    return dataSources.sort((a, b) => b.frequency - a.frequency);
  }
  
  /**
   * Compute section order confidence
   */
  private computeSectionOrderConfidence(events: UserInteractionEvent[]): number {
    const sectionEvents = events.filter(e => 
      e.eventType === 'section_created' || e.eventType === 'section_reordered'
    );
    
    if (sectionEvents.length < 2) return 0;
    
    // Simple confidence based on consistency of patterns
    const patterns = this.analyzeSectionOrder(events);
    if (patterns.length === 0) return 0;
    
    // Use the confidence of the most frequent pattern
    return patterns[0].confidence;
  }
  
  /**
   * Compute omissions confidence
   */
  private computeOmissionsConfidence(events: UserInteractionEvent[]): number {
    // Simplified - would integrate with report type registry
    return 0.5;
  }
  
  /**
   * Compute corrections confidence
   */
  private computeCorrectionsConfidence(events: UserInteractionEvent[]): number {
    const correctionEvents = events.filter(e => e.eventType === 'field_corrected');
    
    if (correctionEvents.length === 0) return 0;
    
    // Confidence based on consistency of corrections
    const uniqueCorrections = new Set(
      correctionEvents.map(e => `${e.data?.from}->${e.data?.to}`).filter(Boolean)
    );
    
    const consistency = uniqueCorrections.size > 0 
      ? Math.min(correctionEvents.length / (uniqueCorrections.size * 2), 1.0)
      : 0;
    
    return consistency;
  }
  
  /**
   * Compute interactions confidence
   */
  private computeInteractionsConfidence(events: UserInteractionEvent[]): number {
    if (events.length === 0) return 0;
    
    // Confidence based on event diversity and frequency
    const eventTypes = new Set(events.map(e => e.eventType));
    const typeDiversity = eventTypes.size / 10; // Max 10 event types
    
    const totalEvents = events.length;
    const frequencyScore = Math.min(totalEvents / 50, 1.0); // Normalize to 50 events
    
    return (typeDiversity + frequencyScore) / 2;
  }
  
  /**
   * Compute data sources confidence
   */
  private computeDataSourcesConfidence(events: UserInteractionEvent[]): number {
    const sourceEvents = events.filter(e => e.eventType === 'data_source_used');
    
    if (sourceEvents.length === 0) return 0;
    
    const uniqueSources = new Set(
      sourceEvents.map(e => e.data?.source).filter(Boolean)
    );
    
    // Confidence based on source consistency
    const consistency = uniqueSources.size > 0 
      ? Math.min(sourceEvents.length / (uniqueSources.size * 3), 1.0)
      : 0;
    
    return consistency;
  }
  
  /**
   * Compute overall confidence
   */
  private computeOverallConfidence(events: UserInteractionEvent[]): number {
    const scores = [
      this.computeSectionOrderConfidence(events),
      this.computeOmissionsConfidence(events),
      this.computeCorrectionsConfidence(events),
      this.computeInteractionsConfidence(events),
      this.computeDataSourcesConfidence(events)
    ];
    
    // Weighted average (section order and interactions are more important)
    const weights = [0.3, 0.1, 0.2, 0.3, 0.1];
    
    let weightedSum = 0;
    let weightSum = 0;
    
    scores.forEach((score, index) => {
      weightedSum += score * weights[index];
      weightSum += weights[index];
    });
    
    return weightSum > 0 ? weightedSum / weightSum : 0;
  }
  
  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(events: UserInteractionEvent[]): Array<{
    type: 'suggestion' | 'warning' | 'optimization';
    message: string;
    priority: 'low' | 'medium' | 'high';
    action?: string;
  }> {
    const recommendations: Array<{
      type: 'suggestion' | 'warning' | 'optimization';
      message: string;
      priority: 'low' | 'medium' | 'high';
      action?: string;
    }> = [];
    
    // Example recommendations based on analysis
    const correctionEvents = events.filter(e => e.eventType === 'field_corrected');
    if (correctionEvents.length > 5) {
      recommendations.push({
        type: 'optimization',
        message: `You've made ${correctionEvents.length} corrections. Consider using templates to reduce errors.`,
        priority: 'medium',
        action: 'apply_template'
      });
    }
    
    const sectionEvents = events.filter(e => e.eventType === 'section_created');
    if (sectionEvents.length > 0) {
      const uniqueSections = new Set(sectionEvents.map(e => e.data?.section).filter(Boolean));
      if (uniqueSections.size > 3) {
        recommendations.push({
          type: 'suggestion',
          message: `You've created ${uniqueSections.size} unique sections. Consider saving this as a custom template.`,
          priority: 'low',
          action: 'save_template'
        });
      }
    }
    
    return recommendations;
  }
  
  /**
   * Get workflow profile for a user
   */
  getWorkflowProfile(userId: string, reportTypeId: string | null = null): WorkflowProfile | null {
    // Find profiles for this user
    const userProfiles = Array.from(this.workflowProfiles.values())
      .filter(p => p.userId === userId && p.metadata.isActive);
    
    if (userProfiles.length === 0) {
      return null;
    }
    
    // If reportTypeId is specified, try to find matching profile
    if (reportTypeId) {
      const matchingProfile = userProfiles.find(p => p.reportTypeId === reportTypeId);
      if (matchingProfile) {
        return matchingProfile;
      }
    }
    
    // Return the most confident profile
    return userProfiles.reduce((best, current) => {
      const bestConfidence = this.computeWorkflowConfidence(best);
      const currentConfidence = this.computeWorkflowConfidence(current);
      return currentConfidence > bestConfidence ? current : best;
    });
  }
  
  /**
   * Generate a workflow profile from analysis
   */
  generateWorkflowProfile(userId: string, analysisResult: WorkflowAnalysisResult): WorkflowProfile {
    const existingProfile = this.getWorkflowProfile(userId, analysisResult.patterns.sectionOrder[0]?.pattern[0] || null);
    
    if (existingProfile) {
      return this.updateWorkflowProfile(existingProfile, analysisResult);
    }
    
    // Create new profile
    const profileId = `profile_${Date.now()}_${userId}`;
    const reportTypeId = this.infer
