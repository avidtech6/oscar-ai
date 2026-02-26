/**
 * Semantic Intelligence Integration Hooks
 *
 * Provides comprehensive integration between intelligence layer and semantic routing:
 * 1. Semantic event generation from resolved intents
 * 2. Context-aware summarization engine
 * 3. Zoom-aware AI behaviour patterns
 * 4. Semantic debugging and logging
 */

import { get } from 'svelte/store';
import { semanticContext, type SemanticEvent as StoreSemanticEvent, type EventType } from '$lib/stores/semanticContext';
import { debugStore } from '$lib/stores/debugStore';
import { intentClassifier, type IntelligenceIntentResult, type IntelligenceIntent } from './IntentClassifier';
import { globalCopilotRouter, type RoutingDecision } from './GlobalCopilotRouter';
import { mediaActionRouter } from './MediaActionRouter';
import { historyPollutionPrevention } from './HistoryPollutionPrevention';
import { behaviourGrammar } from './BehaviourGrammar';

export interface IntelligenceSemanticEvent {
  type: string;
  timestamp: number;
  data: Record<string, any>;
  source: 'intelligence-layer' | 'user' | 'ai' | 'system';
  metadata?: Record<string, any>;
}

export interface ContextSummary {
  currentContext: string;
  zoomLevel: 'global' | 'collection' | 'item';
  activeItemId?: string;
  activeCollectionId?: string;
  subsystem?: string;
  intelligenceIntent?: string;
  confidence?: number;
}

export interface SemanticSummary {
  itemId?: string;
  collectionId?: string;
  summaryType: 'short_term' | 'long_term' | 'activity';
  content: string;
  timestamp: number;
  eventCount: number;
  confidence: number;
}

export interface ZoomAwareBehaviour {
  zoomLevel: 'item' | 'collection' | 'global';
  suggestions: string[];
  actions: string[];
  patterns: string[];
  confidence: number;
}

export class SemanticIntegrationHooks {
  /**
   * Generate structured semantic events from resolved intents
   * Event types: task_created, task_completed, note_added, item_updated, media_extracted, context_switched
   */
  generateStructuredSemanticEvents(
    intelligenceIntent: IntelligenceIntentResult,
    routingDecision: RoutingDecision,
    originalPrompt: string,
    resolvedAction?: string
  ): StoreSemanticEvent[] {
    const events: Omit<StoreSemanticEvent, 'id' | 'timestamp'>[] = [];
    const timestamp = Date.now();
    const state = get(semanticContext);
    
    // Determine target based on context
    const target = state.activeContextId || 'global';
    
    // Map intelligence intent to semantic event type
    const eventType = this.mapIntentToEventType(intelligenceIntent, resolvedAction);
    
    // Generate summary based on intent and prompt
    const summary = this.generateEventSummary(intelligenceIntent, originalPrompt, resolvedAction);
    
    // Base event metadata
    const baseMetadata = {
      zoomLevel: state.zoomLevel,
      confidence: intelligenceIntent.confidence,
      source: 'intelligence-layer',
      intelligenceIntent: intelligenceIntent.intelligenceIntent,
      unifiedIntent: intelligenceIntent.unifiedIntent.intent,
      originalPrompt: originalPrompt.substring(0, 200),
      requiresDecisionSheet: intelligenceIntent.requiresDecisionSheet,
      shouldPreventHistoryPollution: intelligenceIntent.shouldPreventHistoryPollution,
      routingDestination: routingDecision.destination,
      routingConfidence: routingDecision.confidence,
    };
    
    // Create the main semantic event
    const mainEvent: Omit<StoreSemanticEvent, 'id' | 'timestamp'> = {
      type: eventType,
      target,
      summary,
      metadata: baseMetadata,
    };
    
    events.push(mainEvent);
    
    // Add context switch event if context changed (not current_item)
    if (intelligenceIntent.contextDetection.intent !== 'current_item') {
      const contextEvent: Omit<StoreSemanticEvent, 'id' | 'timestamp'> = {
        type: 'other' as EventType, // Using 'other' for context_switched since not in EventType enum
        target: 'context',
        summary: `Context switched: ${intelligenceIntent.contextDetection.intent}`,
        metadata: {
          ...baseMetadata,
          fromContext: state.activeContextId,
          toContext: intelligenceIntent.contextDetection.suggestedActions[0] || 'unknown',
          contextDetection: intelligenceIntent.contextDetection,
        },
      };
      events.push(contextEvent);
    }
    
    // Add media extraction event if media action detected
    if (intelligenceIntent.mediaAction) {
      const mediaEvent: Omit<StoreSemanticEvent, 'id' | 'timestamp'> = {
        type: 'extract_metadata' as EventType, // Closest match for media_extracted
        target: target,
        summary: `Media extracted: ${intelligenceIntent.mediaAction}`,
        metadata: {
          ...baseMetadata,
          mediaAction: intelligenceIntent.mediaAction,
          mediaTarget: intelligenceIntent.mediaTarget,
        },
      };
      events.push(mediaEvent);
    }
    
    // Add to semantic context store and log
    const createdEvents: StoreSemanticEvent[] = [];
    events.forEach(event => {
      // semanticContext.addSemanticEvent returns void, not the created event
      semanticContext.addSemanticEvent(event);
      
      // Create a mock event for return (in real implementation would get from store)
      const mockEvent: StoreSemanticEvent = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        ...event
      };
      createdEvents.push(mockEvent);
      
      // Log semantic event
      this.logSemanticEvent('generateStructuredSemanticEvents', {
        eventType: event.type,
        target: event.target,
        summary: event.summary,
        timestamp,
        confidence: intelligenceIntent.confidence,
      });
    });
    
    console.log('[SemanticIntegrationHooks] Generated', events.length, 'structured semantic events');
    return createdEvents;
  }
  
  /**
   * Map intelligence intent to semantic event type
   */
  private mapIntentToEventType(
    intelligenceIntent: IntelligenceIntentResult,
    resolvedAction?: string
  ): EventType {
    const intent = intelligenceIntent.intelligenceIntent;
    const unifiedIntent = intelligenceIntent.unifiedIntent.intent;
    
    // Map based on intelligence intent
    switch (intent) {
      case 'task_action':
        if (resolvedAction?.includes('complete') || resolvedAction?.includes('done')) {
          return 'generate_report' as EventType; // Closest to task_completed
        }
        return 'add_items_to_project' as EventType; // Closest to task_created
        
      case 'note_action':
        // Check if it's an update action based on unified intent or keywords
        const isUpdate = unifiedIntent === 'update' ||
                        resolvedAction?.includes('update') ||
                        resolvedAction?.includes('edit') ||
                        resolvedAction?.includes('modify');
        if (isUpdate) {
          return 'update_note' as EventType;
        }
        return 'create_new_note' as EventType; // Closest to note_added
        
      case 'media_action':
        return 'extract_metadata' as EventType; // Closest to media_extracted
        
      case 'navigation_action':
        return 'organise_collection' as EventType; // Closest to context_switched
        
      default:
        return 'other' as EventType;
    }
  }
  
  /**
   * Generate event summary based on intent and prompt
   */
  private generateEventSummary(
    intelligenceIntent: IntelligenceIntentResult,
    originalPrompt: string,
    resolvedAction?: string
  ): string {
    const intent = intelligenceIntent.intelligenceIntent;
    const promptPreview = originalPrompt.substring(0, 80) + (originalPrompt.length > 80 ? '...' : '');
    
    switch (intent) {
      case 'task_action':
        if (resolvedAction?.includes('complete')) {
          return `Task completed: ${promptPreview}`;
        }
        return `Task created: ${promptPreview}`;
        
      case 'note_action':
        if (intelligenceIntent.unifiedIntent.intent === 'update') {
          return `Note updated: ${promptPreview}`;
        }
        return `Note added: ${promptPreview}`;
        
      case 'media_action':
        return `Media extracted: ${intelligenceIntent.mediaAction || 'media'} - ${promptPreview}`;
        
      case 'navigation_action':
        return `Context switched: ${promptPreview}`;
        
      case 'query_action':
        return `Query processed: ${promptPreview}`;
        
      case 'command_action':
        return `Command executed: ${promptPreview}`;
        
      case 'smalltalk':
        return `Smalltalk: ${promptPreview}`;
        
      default:
        return `Action performed: ${promptPreview}`;
    }
  }
  
  /**
   * Log semantic event for debugging
   */
  private logSemanticEvent(method: string, event: any) {
    debugStore.log('SemanticIntegrationHooks', method, event);
    console.log(`[SemanticDebug] ${method}:`, event);
  }
  
  /**
   * Integrate semantic hooks with intelligence layer
   * Ensures proper flow: Intelligence → SemanticEvents → Summaries → UI
   */
  async integrateWithIntelligenceLayer(
    prompt: string,
    intelligenceIntent: IntelligenceIntentResult,
    routingDecision: RoutingDecision
  ): Promise<{
    semanticEvents: StoreSemanticEvent[];
    semanticSummary?: SemanticSummary;
    zoomBehaviour?: ZoomAwareBehaviour;
    enhancedPrompt: string;
  }> {
    console.log('[SemanticIntegrationHooks] Integrating with intelligence layer for prompt:', prompt.substring(0, 100));
    
    // Step 1: Generate semantic events from intelligence decisions
    const semanticEvents = this.generateStructuredSemanticEvents(
      intelligenceIntent,
      routingDecision,
      prompt
    );
    
    // Step 2: Get context for summary generation
    const contextSummary = this.getContextSummary();
    let semanticSummary: SemanticSummary | undefined;
    
    // Step 3: Generate semantic summary based on context
    if (contextSummary.activeItemId && contextSummary.zoomLevel === 'item') {
      semanticSummary = this.generateSemanticSummary(
        contextSummary.activeItemId,
        'item',
        'short_term'
      );
    } else if (contextSummary.activeCollectionId && contextSummary.zoomLevel === 'collection') {
      semanticSummary = this.generateSemanticSummary(
        contextSummary.activeCollectionId,
        'collection',
        'short_term'
      );
    } else {
      semanticSummary = this.generateSemanticSummary(
        undefined,
        'global',
        'short_term'
      );
    }
    
    // Step 4: Update summary incrementally with new events
    if (semanticSummary && semanticEvents.length > 0) {
      semanticSummary = this.updateSummaryIncrementally(semanticEvents[0], semanticSummary);
    }
    
    // Step 5: Generate zoom-aware behaviour
    const zoomBehaviour = this.getZoomAwareBehaviour(
      contextSummary.zoomLevel as 'item' | 'collection' | 'global',
      intelligenceIntent,
      semanticSummary
    );
    
    // Step 6: Enhance prompt with zoom context and behaviour
    const basePrompt = `User prompt: ${prompt}`;
    const enhancedPrompt = this.integrateZoomIntoPrompt(
      basePrompt,
      contextSummary.zoomLevel as 'item' | 'collection' | 'global',
      zoomBehaviour
    );
    
    // Step 7: Apply history pollution prevention if needed
    if (intelligenceIntent.shouldPreventHistoryPollution) {
      this.logSemanticEvent('integrateWithIntelligenceLayer', {
        note: 'History pollution prevention active - semantic events will not pollute conversation history',
        promptPreview: prompt.substring(0, 50),
      });
    }
    
    // Step 8: Log integration completion
    this.logSemanticEvent('integrateWithIntelligenceLayer', {
      eventCount: semanticEvents.length,
      hasSummary: !!semanticSummary,
      zoomLevel: contextSummary.zoomLevel,
      enhancedPromptLength: enhancedPrompt.length,
      integrationComplete: true,
    });
    
    return {
      semanticEvents,
      semanticSummary,
      zoomBehaviour,
      enhancedPrompt,
    };
  }
  
  /**
   * Process intelligence result with full semantic integration
   * Main entry point for intelligence layer to use semantic hooks
   */
  async processIntelligenceResult(
    prompt: string,
    intelligenceIntent: IntelligenceIntentResult,
    routingDecision: RoutingDecision
  ): Promise<{
    semanticIntegrationResult: any;
    shouldUpdateUI: boolean;
    uiUpdates: {
      showSemanticSummary?: boolean;
      showZoomContext?: boolean;
      updateSemanticEvents?: boolean;
    };
  }> {
    try {
      // Perform integration
      const integrationResult = await this.integrateWithIntelligenceLayer(
        prompt,
        intelligenceIntent,
        routingDecision
      );
      
      // Determine UI updates based on integration result
      const uiUpdates = {
        showSemanticSummary: integrationResult.semanticSummary !== undefined,
        showZoomContext: integrationResult.zoomBehaviour !== undefined,
        updateSemanticEvents: integrationResult.semanticEvents.length > 0,
      };
      
      // Determine if UI should be updated
      const shouldUpdateUI =
        uiUpdates.showSemanticSummary ||
        uiUpdates.showZoomContext ||
        uiUpdates.updateSemanticEvents;
      
      // Log processing completion
      this.logSemanticEvent('processIntelligenceResult', {
        promptLength: prompt.length,
        intent: intelligenceIntent.intelligenceIntent,
        shouldUpdateUI,
        uiUpdates,
        integrationSuccessful: true,
      });
      
      return {
        semanticIntegrationResult: integrationResult,
        shouldUpdateUI,
        uiUpdates,
      };
      
    } catch (error) {
      console.error('[SemanticIntegrationHooks] Error processing intelligence result:', error);
      
      // Log error but don't break the flow
      this.logSemanticEvent('processIntelligenceResult', {
        error: error instanceof Error ? error.message : String(error),
        integrationSuccessful: false,
        fallbackToBasic: true,
      });
      
      // Return fallback result
      return {
        semanticIntegrationResult: { fallback: true },
        shouldUpdateUI: false,
        uiUpdates: {},
      };
    }
  }
  
  /**
   * Check for circular dependencies and ensure clean integration
   */
  validateIntegrationHealth(): {
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Check 1: Ensure intelligence layer doesn't directly depend on semantic hooks for core classification
    // (This is a design check - we assume proper architecture)
    
    // Check 2: Ensure semantic events don't create infinite loops
    const state = get(semanticContext);
    const recentEvents = state.semanticEvents.slice(0, 10);
    const eventTypes = recentEvents.map(e => e.type);
    
    // Detect potential loops (same event type repeating rapidly)
    const now = Date.now();
    const oneMinuteAgo = now - (60 * 1000);
    const recentEventCount = recentEvents.filter(e => e.timestamp > oneMinuteAgo).length;
    
    if (recentEventCount > 20) {
      issues.push('High volume of semantic events in last minute - potential loop detected');
      recommendations.push('Add rate limiting to semantic event generation');
      recommendations.push('Implement event deduplication logic');
    }
    
    // Check 3: Ensure history pollution prevention still applies
    if (!historyPollutionPrevention) {
      issues.push('History pollution prevention service not available');
      recommendations.push('Ensure historyPollutionPrevention service is properly initialized');
    }
    
    // Check 4: Validate zoom level consistency
    const contextSummary = this.getContextSummary();
    if (contextSummary.zoomLevel === 'item' && !contextSummary.activeItemId) {
      issues.push('Zoom level is item but no active item ID');
      recommendations.push('Ensure semantic context store properly tracks active item');
    }
    
    const isValid = issues.length === 0;
    
    this.logSemanticEvent('validateIntegrationHealth', {
      isValid,
      issueCount: issues.length,
      recommendationCount: recommendations.length,
      recentEventCount,
      zoomLevel: contextSummary.zoomLevel,
    });
    
    return {
      isValid,
      issues,
      recommendations,
    };
  }
  
  /**
   * Comprehensive semantic debugging - logs all semantic activities
   */
  logSemanticDebugSummary(): {
    timestamp: number;
    eventStats: {
      totalEvents: number;
      recentEvents: number;
      eventTypes: Record<string, number>;
    };
    summaryStats: {
      hasItemSummaries: boolean;
      hasCollectionSummaries: boolean;
      hasGlobalSummary: boolean;
    };
    zoomStats: {
      currentZoomLevel: string;
      zoomBehaviourConfidence: number;
    };
    integrationHealth: {
      isValid: boolean;
      issueCount: number;
    };
  } {
    const state = get(semanticContext);
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    // Event statistics
    const totalEvents = state.semanticEvents.length;
    const recentEvents = state.semanticEvents.filter(e => e.timestamp > oneHourAgo).length;
    
    const eventTypes: Record<string, number> = {};
    state.semanticEvents.forEach(event => {
      eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
    });
    
    // Summary statistics
    const contextSummary = this.getContextSummary();
    const hasItemSummaries = !!contextSummary.activeItemId;
    const hasCollectionSummaries = !!contextSummary.activeCollectionId;
    const hasGlobalSummary = totalEvents > 0;
    
    // Zoom statistics
    const zoomBehaviour = this.getZoomAwareBehaviour(
      contextSummary.zoomLevel as 'item' | 'collection' | 'global',
      undefined,
      undefined
    );
    
    // Integration health
    const health = this.validateIntegrationHealth();
    
    const debugSummary = {
      timestamp: now,
      eventStats: {
        totalEvents,
        recentEvents,
        eventTypes,
      },
      summaryStats: {
        hasItemSummaries,
        hasCollectionSummaries,
        hasGlobalSummary,
      },
      zoomStats: {
        currentZoomLevel: contextSummary.zoomLevel,
        zoomBehaviourConfidence: zoomBehaviour.confidence,
      },
      integrationHealth: {
        isValid: health.isValid,
        issueCount: health.issues.length,
      },
    };
    
    // Log the comprehensive debug summary
    console.log('[SemanticDebug] Comprehensive Debug Summary:', debugSummary);
    debugStore.log('SemanticIntegrationHooks', 'logSemanticDebugSummary', debugSummary);
    
    return debugSummary;
  }
  
  /**
   * Log semantic event with detailed context
   * Enhanced version for comprehensive debugging
   */
  logDetailedSemanticEvent(
    eventType: string,
    data: any,
    context?: {
      zoomLevel?: string;
      intelligenceIntent?: string;
      confidence?: number;
    }
  ): void {
    const timestamp = Date.now();
    const state = get(semanticContext);
    
    const detailedLog = {
      eventType,
      timestamp,
      data,
      context: {
        zoomLevel: context?.zoomLevel || state.zoomLevel,
        intelligenceIntent: context?.intelligenceIntent,
        confidence: context?.confidence,
        activeContextId: state.activeContextId,
        activeContextType: state.activeContextType,
        totalSemanticEvents: state.semanticEvents.length,
      },
      callStack: new Error().stack?.split('\n').slice(2, 6).join('\n'), // Capture call stack for debugging
    };
    
    console.log(`[SemanticDebug] ${eventType}:`, detailedLog);
    debugStore.log('SemanticIntegrationHooks', 'logDetailedSemanticEvent', detailedLog);
    
    // Also trigger summary update logging if this is a significant event
    if (eventType.includes('created') || eventType.includes('updated') || eventType.includes('extracted')) {
      this.logSemanticEvent('significantEventTriggered', {
        eventType,
        timestamp,
        willTriggerSummaryUpdate: true,
      });
    }
  }
  
  /**
   * Log zoom-aware behaviour triggers
   */
  logZoomBehaviourTrigger(
    zoomLevel: 'item' | 'collection' | 'global',
    trigger: string,
    data?: any
  ): void {
    const timestamp = Date.now();
    const behaviour = this.getZoomAwareBehaviour(zoomLevel);
    
    const zoomLog = {
      trigger,
      timestamp,
      zoomLevel,
      behaviour: {
        suggestionCount: behaviour.suggestions.length,
        actionCount: behaviour.actions.length,
        patternCount: behaviour.patterns.length,
        confidence: behaviour.confidence,
      },
      triggerData: data,
      context: this.getContextSummary(),
    };
    
    console.log(`[SemanticDebug] Zoom Behaviour Trigger (${zoomLevel}):`, zoomLog);
    debugStore.log('SemanticIntegrationHooks', 'logZoomBehaviourTrigger', zoomLog);
  }
  
  /**
   * Log summary updates
   */
  logSummaryUpdate(
    summaryType: 'short_term' | 'long_term' | 'activity',
    targetType: 'item' | 'collection' | 'global',
    targetId?: string,
    changes?: {
      eventCountChange?: number;
      confidenceChange?: number;
      contentLengthChange?: number;
    }
  ): void {
    const timestamp = Date.now();
    const summary = this.generateSemanticSummary(targetId, targetType, summaryType);
    
    const updateLog = {
      summaryType,
      targetType,
      targetId,
      timestamp,
      summary: {
        eventCount: summary.eventCount,
        confidence: summary.confidence,
        contentLength: summary.content.length,
        summaryType: summary.summaryType,
      },
      changes,
      note: `Summary updated for ${targetType}${targetId ? ` (${targetId.substring(0, 8)}...)` : ''}`,
    };
    
    console.log(`[SemanticDebug] Summary Update:`, updateLog);
    debugStore.log('SemanticIntegrationHooks', 'logSummaryUpdate', updateLog);
  }
  
  /**
   * Get context summary for AI system prompt
   */
  getContextSummary(): ContextSummary {
    // Get current state from semantic context using get()
    const state = get(semanticContext);
    
    // Determine zoom level
    let zoomLevel: 'global' | 'collection' | 'item' = 'global';
    if (state.zoomLevel === 'item' && state.activeContextType === 'item') {
      zoomLevel = 'item';
    } else if (state.zoomLevel === 'collection' && state.activeContextType === 'collection') {
      zoomLevel = 'collection';
    }
    
    const summary: ContextSummary = {
      currentContext: state.activeContextId || 'global',
      zoomLevel,
      activeItemId: state.activeContextType === 'item' ? (state.activeContextId || undefined) : undefined,
      activeCollectionId: state.activeContextType === 'collection' ? (state.activeContextId || undefined) : undefined,
    };
    
    return summary;
  }
  
  /**
   * Enhance AI system prompt with intelligence context
   */
  enhanceSystemPrompt(
    baseSystemPrompt: string,
    intelligenceIntent?: IntelligenceIntentResult,
    routingDecision?: RoutingDecision
  ): string {
    let enhancedPrompt = baseSystemPrompt;
    
    // Add intelligence layer context
    if (intelligenceIntent) {
      enhancedPrompt += `\n\n## Intelligence Layer Context`;
      enhancedPrompt += `\nDetected intent: ${intelligenceIntent.intelligenceIntent}`;
      enhancedPrompt += `\nConfidence: ${intelligenceIntent.confidence}%`;
      enhancedPrompt += `\nExplanation: ${intelligenceIntent.explanation}`;
      
      if (intelligenceIntent.mediaAction) {
        enhancedPrompt += `\nMedia action: ${intelligenceIntent.mediaAction}`;
      }
      
      if (intelligenceIntent.requiresDecisionSheet) {
        enhancedPrompt += `\nNote: User may need to confirm action via decision sheet`;
      }
      
      if (intelligenceIntent.shouldPreventHistoryPollution) {
        enhancedPrompt += `\nNote: This interaction should not pollute conversation history`;
      }
    }
    
    // Add routing context
    if (routingDecision) {
      enhancedPrompt += `\n\n## Routing Decision`;
      enhancedPrompt += `\nDestination: ${globalCopilotRouter.getDestinationDescription(routingDecision.destination)}`;
      enhancedPrompt += `\nConfidence: ${routingDecision.confidence}%`;
      enhancedPrompt += `\nReason: ${routingDecision.reason}`;
      
      if (routingDecision.requiresConfirmation) {
        enhancedPrompt += `\nNote: This routing requires user confirmation`;
      }
    }
    
    // Add behaviour grammar context
    enhancedPrompt += `\n\n## Behaviour Guidelines`;
    enhancedPrompt += `\n- Tooltips appear above prompt bar for hints`;
    enhancedPrompt += `\n- Decision sheets slide up from bottom for confirmation`;
    enhancedPrompt += `\n- Acknowledgement bubbles auto-dismiss after 2 seconds`;
    enhancedPrompt += `\n- Media actions route to appropriate subsystems`;
    enhancedPrompt += `\n- Temporary interactions do not pollute history`;
    
    return enhancedPrompt;
  }
  
  /**
   * Generate zoom-aware AI behaviour hints
   */
  getZoomAwareBehaviourHints(
    zoomLevel: 'global' | 'collection' | 'item',
    intelligenceIntent?: IntelligenceIntentResult
  ): string[] {
    const hints: string[] = [];
    
    switch (zoomLevel) {
      case 'item':
        hints.push('You are focused on a specific item');
        hints.push('Reference the item directly in responses');
        hints.push('Suggest item-specific actions (update, tag, relate)');
        if (intelligenceIntent?.intelligenceIntent === 'media_action') {
          hints.push('Media can be attached to this item');
        }
        break;
        
      case 'collection':
        hints.push('You are focused on a collection of items');
        hints.push('Reference the collection context');
        hints.push('Suggest collection-level actions (filter, sort, summarize)');
        if (intelligenceIntent?.intelligenceIntent === 'media_action') {
          hints.push('Media can be added to this collection');
        }
        break;
        
      case 'global':
        hints.push('You are in global workspace context');
        hints.push('Provide general assistance or route to subsystems');
        hints.push('Smalltalk and general queries are appropriate here');
        if (intelligenceIntent?.intelligenceIntent === 'media_action') {
          hints.push('Media actions will route to appropriate subsystems');
        }
        break;
    }
    
    // Add intent-specific hints
    if (intelligenceIntent) {
      switch (intelligenceIntent.intelligenceIntent) {
        case 'task_action':
          hints.push('Task actions should be specific and actionable');
          hints.push('Include priority and deadline if mentioned');
          break;
        case 'note_action':
          hints.push('Note actions should capture key information');
          hints.push('Consider adding tags or categories');
          break;
        case 'media_action':
          hints.push('Media actions require clear destination');
          hints.push('Acknowledge media type and intended use');
          break;
        case 'smalltalk':
          hints.push('Keep responses friendly and concise');
          hints.push('Offer help with specific tasks');
          break;
      }
    }
    
    return hints;
  }
  
  /**
   * Generate comprehensive zoom-aware AI behaviour
   * Includes fine-grained suggestions, pattern detection, and cross-item reasoning
   */
  getZoomAwareBehaviour(
    zoomLevel: 'item' | 'collection' | 'global',
    intelligenceIntent?: IntelligenceIntentResult,
    semanticSummary?: SemanticSummary
  ): ZoomAwareBehaviour {
    const suggestions: string[] = [];
    const actions: string[] = [];
    const patterns: string[] = [];
    
    // Base behaviour based on zoom level
    switch (zoomLevel) {
      case 'item':
        suggestions.push(
          'Provide detailed analysis of this specific item',
          'Reference item properties and metadata',
          'Suggest micro-actions specific to this item'
        );
        actions.push(
          'update_item',
          'tag_item',
          'relate_to_other_items',
          'extract_metadata_from_item'
        );
        patterns.push(
          'item_update_pattern',
          'metadata_extraction_pattern',
          'single_item_focus_pattern'
        );
        break;
        
      case 'collection':
        suggestions.push(
          'Identify patterns across items in this collection',
          'Suggest grouping and categorization strategies',
          'Provide collection-level insights and trends'
        );
        actions.push(
          'filter_collection',
          'sort_collection',
          'summarize_collection',
          'detect_patterns_in_collection'
        );
        patterns.push(
          'collection_analysis_pattern',
          'cross_item_pattern_detection',
          'grouping_and_categorization_pattern'
        );
        break;
        
      case 'global':
        suggestions.push(
          'Provide high-level insights across the entire workspace',
          'Suggest connections between different collections and items',
          'Offer strategic recommendations and workflow optimizations'
        );
        actions.push(
          'cross_collection_analysis',
          'workflow_optimization',
          'strategic_planning',
          'system_wide_insights'
        );
        patterns.push(
          'global_insight_pattern',
          'cross_boundary_reasoning_pattern',
          'strategic_planning_pattern'
        );
        break;
    }
    
    // Enhance with intent-specific behaviour
    if (intelligenceIntent) {
      this.enhanceWithIntentBehaviour(intelligenceIntent, suggestions, actions, patterns);
    }
    
    // Enhance with semantic summary insights
    if (semanticSummary) {
      this.enhanceWithSummaryInsights(semanticSummary, suggestions, patterns);
    }
    
    // Calculate confidence based on available data
    const confidence = this.calculateZoomBehaviourConfidence(
      zoomLevel,
      intelligenceIntent,
      semanticSummary
    );
    
    const behaviour: ZoomAwareBehaviour = {
      zoomLevel,
      suggestions,
      actions,
      patterns,
      confidence,
    };
    
    // Log zoom-aware behaviour generation
    this.logSemanticEvent('getZoomAwareBehaviour', {
      zoomLevel,
      suggestionCount: suggestions.length,
      actionCount: actions.length,
      patternCount: patterns.length,
      confidence,
    });
    
    return behaviour;
  }
  
  /**
   * Enhance behaviour with intent-specific insights
   */
  private enhanceWithIntentBehaviour(
    intelligenceIntent: IntelligenceIntentResult,
    suggestions: string[],
    actions: string[],
    patterns: string[]
  ): void {
    const intent = intelligenceIntent.intelligenceIntent;
    
    switch (intent) {
      case 'task_action':
        suggestions.push('Break down complex tasks into actionable steps');
        suggestions.push('Suggest dependencies and prerequisites');
        actions.push('create_task_hierarchy', 'assign_task_priority', 'estimate_task_duration');
        patterns.push('task_decomposition_pattern', 'priority_assignment_pattern');
        break;
        
      case 'note_action':
        suggestions.push('Structure notes with clear headings and sections');
        suggestions.push('Suggest linking related notes together');
        actions.push('organize_note_structure', 'link_related_notes', 'extract_key_points');
        patterns.push('note_organization_pattern', 'knowledge_graph_pattern');
        break;
        
      case 'media_action':
        suggestions.push('Suggest optimal media organization strategies');
        suggestions.push('Recommend metadata extraction approaches');
        actions.push('organize_media_collection', 'extract_media_metadata', 'generate_media_previews');
        patterns.push('media_organization_pattern', 'metadata_extraction_pattern');
        break;
        
      case 'query_action':
        suggestions.push('Provide comprehensive search strategies');
        suggestions.push('Suggest alternative query formulations');
        actions.push('refine_search_query', 'expand_search_scope', 'filter_search_results');
        patterns.push('query_refinement_pattern', 'search_strategy_pattern');
        break;
    }
  }
  
  /**
   * Enhance behaviour with semantic summary insights
   */
  private enhanceWithSummaryInsights(
    summary: SemanticSummary,
    suggestions: string[],
    patterns: string[]
  ): void {
    if (summary.eventCount > 0) {
      suggestions.push(`Based on ${summary.eventCount} semantic events, adapt to user's workflow patterns`);
      
      if (summary.confidence > 70) {
        suggestions.push('High-confidence patterns detected in user behaviour');
        patterns.push('high_confidence_workflow_pattern');
      }
      
      if (summary.summaryType === 'short_term' && summary.eventCount >= 3) {
        suggestions.push('Recent activity suggests active engagement with this context');
      }
    }
  }
  
  /**
   * Calculate confidence for zoom-aware behaviour
   */
  private calculateZoomBehaviourConfidence(
    zoomLevel: 'item' | 'collection' | 'global',
    intelligenceIntent?: IntelligenceIntentResult,
    semanticSummary?: SemanticSummary
  ): number {
    let confidence = 60; // Base confidence
    
    // Adjust based on zoom level
    switch (zoomLevel) {
      case 'item':
        confidence += 10; // Item context is most specific
        break;
      case 'collection':
        confidence += 5; // Collection context has moderate specificity
        break;
      case 'global':
        // Global context is least specific
        break;
    }
    
    // Adjust based on intent clarity
    if (intelligenceIntent) {
      confidence += Math.min(intelligenceIntent.confidence / 10, 20); // Add up to 20 points
    }
    
    // Adjust based on semantic summary
    if (semanticSummary) {
      confidence += Math.min(semanticSummary.confidence / 10, 15); // Add up to 15 points
    }
    
    return Math.min(confidence, 100);
  }
  
  /**
   * Integrate zoom level into semantic prompts for AI
   */
  integrateZoomIntoPrompt(
    basePrompt: string,
    zoomLevel: 'item' | 'collection' | 'global',
    behaviour?: ZoomAwareBehaviour
  ): string {
    let enhancedPrompt = basePrompt;
    
    enhancedPrompt += `\n\n## Zoom Context: ${zoomLevel.toUpperCase()}`;
    
    switch (zoomLevel) {
      case 'item':
        enhancedPrompt += `\nYou are focused on a specific item. Provide detailed, item-specific responses.`;
        enhancedPrompt += `\nReference the item directly and suggest item-specific actions.`;
        break;
        
      case 'collection':
        enhancedPrompt += `\nYou are focused on a collection of items. Look for patterns and provide collection-level insights.`;
        enhancedPrompt += `\nSuggest organization, filtering, and summarization strategies.`;
        break;
        
      case 'global':
        enhancedPrompt += `\nYou are in global workspace context. Provide high-level insights and cross-system recommendations.`;
        enhancedPrompt += `\nConnect different domains and suggest strategic optimizations.`;
        break;
    }
    
    // Add behaviour suggestions if available
    if (behaviour && behaviour.suggestions.length > 0) {
      enhancedPrompt += `\n\n## Behaviour Suggestions:`;
      behaviour.suggestions.slice(0, 3).forEach(suggestion => {
        enhancedPrompt += `\n- ${suggestion}`;
      });
    }
    
    // Add confidence indicator
    if (behaviour) {
      enhancedPrompt += `\n\n## Confidence: ${behaviour.confidence}%`;
      if (behaviour.confidence >= 80) {
        enhancedPrompt += ` (High confidence - reliable patterns detected)`;
      } else if (behaviour.confidence >= 60) {
        enhancedPrompt += ` (Moderate confidence - some patterns detected)`;
      } else {
        enhancedPrompt += ` (Low confidence - limited pattern data)`;
      }
    }
    
    return enhancedPrompt;
  }
  
  /**
   * Generate context-aware summarization using semantic events
   * Creates summaries for items, collections, and global context
   */
  generateContextAwareSummary(
    prompt: string,
    aiResponse: string,
    intelligenceIntent?: IntelligenceIntentResult
  ): string {
    const contextSummary = this.getContextSummary();
    const timestamp = new Date().toLocaleTimeString();
    
    let summary = `[${timestamp}] `;
    
    // Add context
    summary += `Context: ${contextSummary.zoomLevel}`;
    if (contextSummary.activeItemId) {
      summary += ` (Item: ${contextSummary.activeItemId.substring(0, 8)}...)`;
    } else if (contextSummary.activeCollectionId) {
      summary += ` (Collection: ${contextSummary.activeCollectionId.substring(0, 8)}...)`;
    }
    
    // Add intent
    if (intelligenceIntent) {
      summary += ` | Intent: ${intelligenceIntent.intelligenceIntent}`;
      summary += ` (${intelligenceIntent.confidence}%)`;
    }
    
    // Add prompt summary
    summary += `\nPrompt: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`;
    
    // Add response summary
    summary += `\nResponse: ${aiResponse.substring(0, 150)}${aiResponse.length > 150 ? '...' : ''}`;
    
    return summary;
  }
  
  /**
   * Generate semantic summary for a specific item, collection, or global context
   * Uses semantic events, not raw chat history
   */
  generateSemanticSummary(
    targetId?: string,
    targetType: 'item' | 'collection' | 'global' = 'global',
    summaryType: 'short_term' | 'long_term' | 'activity' = 'short_term'
  ): SemanticSummary {
    const state = get(semanticContext);
    const timestamp = Date.now();
    
    // Get relevant semantic events
    let relevantEvents: StoreSemanticEvent[] = [];
    
    if (targetType === 'item' && targetId) {
      relevantEvents = state.semanticEvents.filter(event =>
        event.target === targetId ||
        (event.metadata?.zoomLevel === 'item' && event.metadata?.activeItemId === targetId)
      );
    } else if (targetType === 'collection' && targetId) {
      relevantEvents = state.semanticEvents.filter(event =>
        event.target === targetId ||
        (event.metadata?.zoomLevel === 'collection' && event.metadata?.activeCollectionId === targetId)
      );
    } else if (targetType === 'global') {
      relevantEvents = state.semanticEvents.slice(0, 20); // Last 20 events for global context
    }
    
    // Filter by recency based on summary type
    const now = Date.now();
    let filteredEvents = relevantEvents;
    
    if (summaryType === 'short_term') {
      // Last 1 hour
      const oneHourAgo = now - (60 * 60 * 1000);
      filteredEvents = relevantEvents.filter(event => event.timestamp > oneHourAgo);
    } else if (summaryType === 'activity') {
      // Last 24 hours
      const oneDayAgo = now - (24 * 60 * 60 * 1000);
      filteredEvents = relevantEvents.filter(event => event.timestamp > oneDayAgo);
    }
    // long_term uses all filtered events
    
    // Generate summary content based on events
    const content = this.generateSummaryContent(filteredEvents, targetType, summaryType);
    
    // Calculate confidence based on event count and recency
    const confidence = this.calculateSummaryConfidence(filteredEvents.length, summaryType);
    
    const summary: SemanticSummary = {
      itemId: targetType === 'item' ? targetId : undefined,
      collectionId: targetType === 'collection' ? targetId : undefined,
      summaryType,
      content,
      timestamp,
      eventCount: filteredEvents.length,
      confidence,
    };
    
    // Log summary generation
    this.logSemanticEvent('generateSemanticSummary', {
      targetType,
      targetId,
      summaryType,
      eventCount: filteredEvents.length,
      confidence,
      timestamp,
    });
    
    return summary;
  }
  
  /**
   * Generate summary content from semantic events
   */
  private generateSummaryContent(
    events: StoreSemanticEvent[],
    targetType: 'item' | 'collection' | 'global',
    summaryType: 'short_term' | 'long_term' | 'activity'
  ): string {
    if (events.length === 0) {
      return `No semantic events recorded for this ${targetType} context.`;
    }
    
    // Group events by type
    const eventCounts: Record<string, number> = {};
    const recentEvents = events.slice(0, 5).map(event => ({
      type: event.type,
      summary: event.summary,
      timestamp: new Date(event.timestamp).toLocaleTimeString(),
    }));
    
    events.forEach(event => {
      eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;
    });
    
    // Build summary content
    let content = '';
    
    if (summaryType === 'short_term') {
      content = `Recent activity (${events.length} events in last hour):\n`;
      content += recentEvents.map(e => `• ${e.timestamp}: ${e.summary}`).join('\n');
    } else if (summaryType === 'activity') {
      content = `Daily activity (${events.length} events in last 24 hours):\n`;
      content += Object.entries(eventCounts)
        .map(([type, count]) => `• ${count} ${type.replace('_', ' ')} events`)
        .join('\n');
    } else { // long_term
      content = `Historical summary (${events.length} total events):\n`;
      content += `Most common actions:\n`;
      const sortedTypes = Object.entries(eventCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      content += sortedTypes.map(([type, count]) => `• ${count} ${type.replace('_', ' ')}`).join('\n');
    }
    
    // Add context-specific insights
    if (targetType === 'item') {
      content += `\n\nItem context: Focused on specific item details and updates.`;
    } else if (targetType === 'collection') {
      content += `\n\nCollection context: Pattern detection across multiple items.`;
    } else {
      content += `\n\nGlobal context: Cross-item reasoning and high-level insights.`;
    }
    
    return content;
  }
  
  /**
   * Calculate summary confidence based on event count and recency
   */
  private calculateSummaryConfidence(
    eventCount: number,
    summaryType: 'short_term' | 'long_term' | 'activity'
  ): number {
    let baseConfidence = 50; // Base confidence
    
    // Adjust based on event count
    if (eventCount >= 10) baseConfidence += 30;
    else if (eventCount >= 5) baseConfidence += 20;
    else if (eventCount >= 2) baseConfidence += 10;
    else if (eventCount === 0) baseConfidence = 10;
    
    // Adjust based on summary type
    if (summaryType === 'short_term') {
      // Short-term summaries are more reliable with recent data
      baseConfidence += 10;
    } else if (summaryType === 'activity') {
      // Activity summaries have moderate reliability
      baseConfidence += 5;
    }
    // long_term summaries keep base confidence
    
    return Math.min(baseConfidence, 100);
  }
  
  /**
   * Update summary incrementally when new semantic events are added
   */
  updateSummaryIncrementally(
    event: StoreSemanticEvent,
    existingSummary?: SemanticSummary
  ): SemanticSummary {
    const timestamp = Date.now();
    
    if (!existingSummary) {
      // Create new summary
      const targetType = event.metadata?.zoomLevel === 'item' ? 'item' :
                        event.metadata?.zoomLevel === 'collection' ? 'collection' : 'global';
      const targetId = event.target !== 'global' ? event.target : undefined;
      
      return this.generateSemanticSummary(targetId, targetType, 'short_term');
    }
    
    // Update existing summary
    const updatedContent = this.updateSummaryContent(existingSummary.content, event);
    const updatedEventCount = existingSummary.eventCount + 1;
    
    // Recalculate confidence
    const updatedConfidence = this.calculateSummaryConfidence(
      updatedEventCount,
      existingSummary.summaryType
    );
    
    const updatedSummary: SemanticSummary = {
      ...existingSummary,
      content: updatedContent,
      timestamp,
      eventCount: updatedEventCount,
      confidence: updatedConfidence,
    };
    
    // Log incremental update
    this.logSemanticEvent('updateSummaryIncrementally', {
      summaryType: existingSummary.summaryType,
      eventType: event.type,
      previousEventCount: existingSummary.eventCount,
      updatedEventCount,
      confidenceChange: updatedConfidence - existingSummary.confidence,
    });
    
    return updatedSummary;
  }
  
  /**
   * Update summary content with new event
   */
  private updateSummaryContent(
    existingContent: string,
    newEvent: StoreSemanticEvent
  ): string {
    // Simple incremental update: prepend new event to recent activity
    const eventTime = new Date(newEvent.timestamp).toLocaleTimeString();
    const newEntry = `• ${eventTime}: ${newEvent.summary}`;
    
    // For short-term summaries, prepend new event
    if (existingContent.includes('Recent activity')) {
      const lines = existingContent.split('\n');
      if (lines.length > 1) {
        // Insert after the header line
        lines.splice(1, 0, newEntry);
        // Keep only top 5 events
        const recentEvents = lines.filter(line => line.startsWith('•')).slice(0, 5);
        lines.splice(1, lines.length - 1, ...recentEvents);
        return lines.join('\n');
      }
    }
    
    // For other summary types, append to content
    return `${existingContent}\n${newEntry}`;
  }
  
  /**
   * Hook for processing user prompt with full intelligence integration
   */
  async processWithIntelligenceIntegration(
    prompt: string,
    options?: {
      skipIntelligenceLayer?: boolean;
      forceDestination?: string;
    }
  ): Promise<{
    aiResponse: string;
    intelligenceIntent?: IntelligenceIntentResult;
    routingDecision?: RoutingDecision;
    semanticEvents: IntelligenceSemanticEvent[];
    contextSummary: ContextSummary;
  }> {
    console.log('[SemanticIntegrationHooks] Processing with intelligence integration:', prompt.substring(0, 100));
    
    // Step 1: Get intelligence intent classification
    let intelligenceIntent: IntelligenceIntentResult | undefined;
    if (!options?.skipIntelligenceLayer) {
      intelligenceIntent = await intentClassifier.classify(prompt);
      console.log('[SemanticIntegrationHooks] Intelligence intent:', intelligenceIntent.intelligenceIntent);
    }
    
    // Step 2: Determine routing
    let routingDecision: RoutingDecision | undefined;
    if (intelligenceIntent) {
      routingDecision = globalCopilotRouter.determineRouting(prompt, intelligenceIntent);
      console.log('[SemanticIntegrationHooks] Routing decision:', routingDecision.destination);
    }
    
    // Step 3: Generate semantic events
    const semanticEvents: IntelligenceSemanticEvent[] = [];
    if (intelligenceIntent && routingDecision) {
      // Generate structured semantic events and convert to IntelligenceSemanticEvent format
      const structuredEvents = this.generateStructuredSemanticEvents(intelligenceIntent, routingDecision, prompt);
      
      // Convert StoreSemanticEvent to IntelligenceSemanticEvent
      const convertedEvents: IntelligenceSemanticEvent[] = structuredEvents.map(event => ({
        type: event.type,
        timestamp: event.timestamp,
        data: {
          target: event.target,
          summary: event.summary,
          ...event.metadata
        },
        source: 'intelligence-layer',
        metadata: {
          id: event.id,
          originalEvent: event
        }
      }));
      
      semanticEvents.push(...convertedEvents);
    }
    
    // Step 4: Get context summary
    const contextSummary = this.getContextSummary();
    
    // Step 5: Apply history pollution prevention
    if (intelligenceIntent) {
      const shouldPrevent = historyPollutionPrevention.shouldPreventPollutionForPrompt(
        prompt,
        intelligenceIntent
      );
      
      if (shouldPrevent) {
        console.log('[SemanticIntegrationHooks] History pollution prevention active for this prompt');
        // In a full implementation, we would modify how the prompt is stored
      }
    }
    
    // Step 6: Apply behaviour grammar
    if (intelligenceIntent?.requiresAcknowledgement && intelligenceIntent.acknowledgementMessage) {
      behaviourGrammar.applyToAcknowledgement(
        intelligenceIntent.acknowledgementMessage,
        'info',
        1500
      );
    }
    
    // Step 7: In a real implementation, we would now:
    // - Route to appropriate subsystem
    // - Process prompt in that context
    // - Get AI response
    // - Apply appropriate UI patterns
    
    // For now, return mock response
    const mockResponse = this.generateMockAIResponse(prompt, intelligenceIntent, routingDecision);
    
    return {
      aiResponse: mockResponse,
      intelligenceIntent,
      routingDecision,
      semanticEvents,
      contextSummary,
    };
  }
  
  /**
   * Generate mock AI response for demonstration
   */
  private generateMockAIResponse(
    prompt: string,
    intelligenceIntent?: IntelligenceIntentResult,
    routingDecision?: RoutingDecision
  ): string {
    if (!intelligenceIntent) {
      return `I received your message: "${prompt}". I'm processing it now.`;
    }
    
    const intent = intelligenceIntent.intelligenceIntent;
    const confidence = intelligenceIntent.confidence;
    
    switch (intent) {
      case 'smalltalk':
        return `Hello! I'm Oscar AI. How can I help you today?`;
        
      case 'task_action':
        return `I'll create a task for you. Based on your prompt "${prompt.substring(0, 50)}...", I'll add it to your task list.`;
        
      case 'note_action':
        return `I'll create a note from your input. I've saved: "${prompt.substring(0, 80)}..."`;
        
      case 'media_action':
        const mediaType = intelligenceIntent.mediaAction || 'media';
        return `I'll handle your ${mediaType} request. ${routingDecision ? `Routing to ${routingDecision.destination}.` : ''}`;
        
      case 'navigation_action':
        return `I'll help you navigate. ${routingDecision ? `Taking you to ${routingDecision.destination}.` : ''}`;
        
      case 'query_action':
        return `I'll search for information related to your query: "${prompt.substring(0, 60)}..."`;
        
      case 'command_action':
        return `Executing your command. ${intelligenceIntent.unifiedIntent.requiresConfirmation ? 'Please confirm to proceed.' : 'Processing now.'}`;
        
      case 'ambiguous':
        return `I'm not sure what you mean by "${prompt.substring(0, 50)}...". Could you clarify?`;
        
      case 'requires_decision_sheet':
        return `I need more information to proceed. Please select an option from the decision sheet.`;
        
      default:
        return `I understand your request (${intent}, ${confidence}% confidence). Processing now.`;
    }
  }
}

// Singleton instance
export const semanticIntegrationHooks = new SemanticIntegrationHooks();