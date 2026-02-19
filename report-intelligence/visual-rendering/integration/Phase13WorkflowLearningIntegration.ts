/**
 * Phase 13 Workflow Learning Integration
 * 
 * Integrates Phase 15 Visual Rendering Engine with Phase 13 User Workflow Learning Engine.
 * Captures user interactions with rendering system and feeds them into workflow learning.
 */

import { UserWorkflowLearningEngine } from '../../workflow-learning/UserWorkflowLearningEngine';
import { UserInteractionEvent, WorkflowProfile } from '../../workflow-learning/WorkflowProfile';
import { VisualRenderingEngine } from '../engines/VisualRenderingEngine';
import type { RenderingOptions, RenderingResult, RenderingProgress } from '../types';
import { DEFAULT_RENDERING_OPTIONS } from '../types/RenderingOptions';

/**
 * Extended event types for rendering interactions
 */
type RenderingEventType = 
  | 'rendering_started'
  | 'rendering_completed'
  | 'preview_opened'
  | 'preview_interaction'
  | 'export_started'
  | 'export_completed'
  | 'settings_changed'
  | 'rendering_error';

/**
 * Integration service for connecting visual rendering with workflow learning
 */
export class Phase13WorkflowLearningIntegration {
  private workflowEngine: UserWorkflowLearningEngine;
  private renderingEngine: VisualRenderingEngine;
  private userId: string = 'default-user';
  private sessionId: string;
  private eventListeners: Map<string, Array<(data: any) => void>> = new Map();
  
  /**
   * Constructor
   */
  constructor(workflowEngine: UserWorkflowLearningEngine, renderingEngine: VisualRenderingEngine) {
    this.workflowEngine = workflowEngine;
    this.renderingEngine = renderingEngine;
    this.sessionId = `session_${Date.now()}`;
    
    this.initializeEventSystem();
    this.setupEventListeners();
  }
  
  /**
   * Initialize the event system
   */
  private initializeEventSystem(): void {
    const eventTypes: RenderingEventType[] = [
      'rendering_started',
      'rendering_completed',
      'preview_opened',
      'preview_interaction',
      'export_started',
      'export_completed',
      'settings_changed',
      'rendering_error'
    ];
    
    eventTypes.forEach(eventType => {
      this.eventListeners.set(eventType, []);
    });
  }
  
  /**
   * Set up event listeners on the rendering engine
   */
  private setupEventListeners(): void {
    // Listen to rendering engine progress events
    this.renderingEngine.addProgressListener('*', (progress: RenderingProgress) => {
      if (progress.progress === 0) {
        this.captureRenderingStarted({
          jobId: progress.jobId,
          step: progress.currentStep
        });
      } else if (progress.progress === 100) {
        this.captureRenderingCompleted({
          jobId: progress.jobId,
          step: progress.currentStep
        });
      }
    });
    
    // Listen to rendering engine completion events
    this.renderingEngine.addCompletionListener('*', (result: RenderingResult) => {
      this.captureRenderingResult(result);
    });
    
    // Listen to rendering engine error events
    this.renderingEngine.addErrorListener('*', (error: Error) => {
      this.captureRenderingError(error);
    });
  }
  
  /**
   * Emit an event to registered listeners
   */
  private emitEvent(eventType: RenderingEventType, data: any): void {
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
   * Add event listener for rendering events
   */
  addEventListener(eventType: RenderingEventType, listener: (data: any) => void): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.push(listener);
    this.eventListeners.set(eventType, listeners);
  }
  
  /**
   * Remove event listener
   */
  removeEventListener(eventType: RenderingEventType, listener: (data: any) => void): void {
    const listeners = this.eventListeners.get(eventType) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
      this.eventListeners.set(eventType, listeners);
    }
  }
  
  /**
   * Set the current user ID for workflow tracking
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }
  
  /**
   * Set the current session ID for workflow tracking
   */
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }
  
  /**
   * Capture rendering started event
   */
  private captureRenderingStarted(data: any): void {
    const event: UserInteractionEvent = {
      id: `event_${Date.now()}_rendering_started`,
      userId: this.userId,
      reportId: null,
      reportTypeId: null,
      sessionId: this.sessionId,
      eventType: 'report_saved', // Using existing event type
      timestamp: new Date(),
      context: {
        currentSection: null,
        previousSection: null,
        nextSection: null,
        timeSpent: null,
        platform: 'visual_rendering_engine'
      },
      data: {
        action: 'rendering_started',
        jobId: data.jobId,
        step: data.step,
        engine: 'phase15_visual_rendering'
      }
    };
    
    this.workflowEngine.observeInteraction(event);
    this.emitEvent('rendering_started', event);
  }
  
  /**
   * Capture rendering completed event
   */
  private captureRenderingCompleted(data: any): void {
    const event: UserInteractionEvent = {
      id: `event_${Date.now()}_rendering_completed`,
      userId: this.userId,
      reportId: null,
      reportTypeId: null,
      sessionId: this.sessionId,
      eventType: 'report_published', // Using existing event type
      timestamp: new Date(),
      context: {
        currentSection: null,
        previousSection: null,
        nextSection: null,
        timeSpent: null,
        platform: 'visual_rendering_engine'
      },
      data: {
        action: 'rendering_completed',
        jobId: data.jobId,
        step: data.step,
        engine: 'phase15_visual_rendering',
        success: true
      }
    };
    
    this.workflowEngine.observeInteraction(event);
    this.emitEvent('rendering_completed', event);
  }
  
  /**
   * Capture rendering result
   */
  private captureRenderingResult(result: RenderingResult): void {
    const event: UserInteractionEvent = {
      id: `event_${Date.now()}_rendering_result`,
      userId: this.userId,
      reportId: null,
      reportTypeId: null,
      sessionId: this.sessionId,
      eventType: 'validation_performed', // Using existing event type
      timestamp: new Date(),
      context: {
        currentSection: null,
        previousSection: null,
        nextSection: null,
        timeSpent: result.metrics?.duration || null,
        platform: 'visual_rendering_engine'
      },
      data: {
        action: 'rendering_result',
        jobId: result.jobId,
        status: result.status,
        warnings: result.warnings?.length || 0,
        errors: result.errors?.length || 0,
        snapshots: result.snapshots?.length || 0,
        hasPDFExport: !!result.pdfExport
      }
    };
    
    this.workflowEngine.observeInteraction(event);
  }
  
  /**
   * Capture rendering error
   */
  private captureRenderingError(error: Error): void {
    const event: UserInteractionEvent = {
      id: `event_${Date.now()}_rendering_error`,
      userId: this.userId,
      reportId: null,
      reportTypeId: null,
      sessionId: this.sessionId,
      eventType: 'help_requested', // Using existing event type
      timestamp: new Date(),
      context: {
        currentSection: null,
        previousSection: null,
        nextSection: null,
        timeSpent: null,
        platform: 'visual_rendering_engine'
      },
      data: {
        action: 'rendering_error',
        error: error.message,
        stack: error.stack,
        engine: 'phase15_visual_rendering'
      }
    };
    
    this.workflowEngine.observeInteraction(event);
    this.emitEvent('rendering_error', event);
  }
  
  /**
   * Capture preview interaction
   */
  capturePreviewInteraction(interactionType: string, data: any): void {
    const event: UserInteractionEvent = {
      id: `event_${Date.now()}_preview_interaction`,
      userId: this.userId,
      reportId: null,
      reportTypeId: null,
      sessionId: this.sessionId,
      eventType: 'navigation', // Using existing event type
      timestamp: new Date(),
      context: {
        currentSection: null,
        previousSection: null,
        nextSection: null,
        timeSpent: null,
        platform: 'visual_rendering_engine'
      },
      data: {
        action: 'preview_interaction',
        interactionType,
        ...data
      }
    };
    
    this.workflowEngine.observeInteraction(event);
    this.emitEvent('preview_interaction', event);
  }
  
  /**
   * Capture export interaction
   */
  captureExportInteraction(format: string, data: any): void {
    const event: UserInteractionEvent = {
      id: `event_${Date.now()}_export_interaction`,
      userId: this.userId,
      reportId: null,
      reportTypeId: null,
      sessionId: this.sessionId,
      eventType: 'data_source_used', // Using existing event type
      timestamp: new Date(),
      context: {
        currentSection: null,
        previousSection: null,
        nextSection: null,
        timeSpent: null,
        platform: 'visual_rendering_engine'
      },
      data: {
        action: 'export_interaction',
        format,
        ...data
      }
    };
    
    this.workflowEngine.observeInteraction(event);
    this.emitEvent('export_completed', event);
  }
  
  /**
   * Capture settings interaction
   */
  captureSettingsInteraction(settingType: string, oldValue: any, newValue: any): void {
    const event: UserInteractionEvent = {
      id: `event_${Date.now()}_settings_interaction`,
      userId: this.userId,
      reportId: null,
      reportTypeId: null,
      sessionId: this.sessionId,
      eventType: 'field_corrected', // Using existing event type
      timestamp: new Date(),
      context: {
        currentSection: null,
        previousSection: null,
        nextSection: null,
        timeSpent: null,
        platform: 'visual_rendering_engine'
      },
      data: {
        action: 'settings_interaction',
        settingType,
        from: oldValue,
        to: newValue,
        engine: 'phase15_visual_rendering'
      }
    };
    
    this.workflowEngine.observeInteraction(event);
    this.emitEvent('settings_changed', event);
  }
  
  /**
   * Get workflow predictions for rendering
   */
  getRenderingPredictions(reportType: string): {
    preferredFormat: 'pdf' | 'html' | 'image';
    likelySettings: Partial<RenderingOptions>;
    suggestions: string[];
    confidence: number;
  } {
    const profile = this.workflowEngine.getWorkflowProfile(this.userId, reportType);
    
    if (!profile) {
      return {
        preferredFormat: 'pdf',
        likelySettings: {},
        suggestions: [],
        confidence: 0
      };
    }
    
    // Analyze user's rendering preferences from workflow profile
    const predictions = this.analyzeRenderingPreferences(profile);
    
    return predictions;
  }
  
  /**
   * Analyze rendering preferences from workflow profile
   */
  private analyzeRenderingPreferences(profile: WorkflowProfile): {
    preferredFormat: 'pdf' | 'html' | 'image';
    likelySettings: Partial<RenderingOptions>;
    suggestions: string[];
    confidence: number;
  } {
    // Default values
    const defaultSettings: Partial<RenderingOptions> = {};
    
    // Extract preferences from profile patterns
    const exportPatterns = profile.preferredInteractionPatterns?.filter(
      (p) => p.pattern.includes('export') || p.pattern.includes('pdf')
    ) || [];
    
    // Determine preferred format based on patterns
    let preferredFormat: 'pdf' | 'html' | 'image' = 'pdf';
    if (exportPatterns.length > 0) {
      const mostCommon = exportPatterns.reduce((prev, current) => 
        prev.frequency > current.frequency ? prev : current
      );
      
      if (mostCommon.pattern.includes('html')) {
        preferredFormat = 'html';
      } else if (mostCommon.pattern.includes('image')) {
        preferredFormat = 'image';
      }
    }
    
    // Analyze settings based on workflow heuristics
    const likelySettings: Partial<RenderingOptions> = {};
    
    // Set cover page preference
    if (profile.workflowHeuristics?.templateUsageFrequency > 0.7) {
      likelySettings.coverPage = {
        ...DEFAULT_RENDERING_OPTIONS.coverPage,
        enabled: true
      };
    }
    
    // Set header/footer preference
    if (profile.workflowHeuristics?.orderConsistency > 0.8) {
      likelySettings.header = {
        ...DEFAULT_RENDERING_OPTIONS.header,
        enabled: true,
        showPageNumbers: true
      };
      likelySettings.footer = {
        ...DEFAULT_RENDERING_OPTIONS.footer,
        enabled: true,
        showPageNumbers: true
      };
    }
    
    // Generate suggestions based on patterns
    const suggestions: string[] = [];
    
    // Check for common omissions
    if (profile.commonOmissions.length > 0) {
      suggestions.push(`Commonly omitted sections: ${profile.commonOmissions.join(', ')}. Consider adding these to your templates.`);
    }
    
    // Check for time spent
    const avgSectionTime = Object.values(profile.workflowHeuristics?.averageSectionTime || {}).reduce((a, b) => a + b, 0);
    if (avgSectionTime > 300000) { // 5 minutes per section
      suggestions.push('Long section completion times detected. Consider using templates to speed up report creation.');
    }
    
    // Check for corrections
    if (profile.commonCorrections.length > 3) {
      suggestions.push('Frequent corrections detected. Consider reviewing your data entry process or using validation templates.');
    }
    
    return {
      preferredFormat,
      likelySettings,
      suggestions,
      confidence: profile.confidenceScore
    };
  }
  
  /**
   * Apply learned preferences to rendering options
   */
  applyLearnedPreferences(options: RenderingOptions, reportType: string): RenderingOptions {
    const predictions = this.getRenderingPredictions(reportType);
    
    // Only apply preferences if confidence is high enough
    if (predictions.confidence > 0.6) {
      // Create a deep copy of options
      const enhancedOptions = JSON.parse(JSON.stringify(options));
      
      // Apply format preference to PDF export settings
      if (predictions.preferredFormat === 'pdf') {
        enhancedOptions.pdf = {
          ...enhancedOptions.pdf,
          quality: 'high' as const
        };
      }
      
      // Apply cover page preference
      if (predictions.likelySettings.coverPage?.enabled !== undefined) {
        enhancedOptions.coverPage.enabled = predictions.likelySettings.coverPage.enabled;
      }
      
      // Apply header/footer preferences
      if (predictions.likelySettings.header?.enabled !== undefined) {
        enhancedOptions.header.enabled = predictions.likelySettings.header.enabled;
      }
      if (predictions.likelySettings.footer?.enabled !== undefined) {
        enhancedOptions.footer.enabled = predictions.likelySettings.footer.enabled;
      }
      
      return enhancedOptions;
    }
    
    return options;
  }
  
  /**
   * Get workflow suggestions for current rendering session
   */
  getWorkflowSuggestions(): Array<{
    type: 'suggestion' | 'warning' | 'optimization';
    message: string;
    priority: 'low' | 'medium' | 'high';
    action?: string;
  }> {
    // Get the user's workflow profile
    const profile = this.workflowEngine.getWorkflowProfile(this.userId);
    
    if (!profile) {
      return [];
    }
    
    // Generate suggestions based on profile
    const suggestions: Array<{
      type: 'suggestion' | 'warning' | 'optimization';
      message: string;
      priority: 'low' | 'medium' | 'high';
      action?: string;
    }> = [];
    
    // Check for common omissions
    if (profile.commonOmissions.length > 0) {
      suggestions.push({
        type: 'warning',
        message: `You often omit these sections: ${profile.commonOmissions.slice(0, 3).join(', ')}`,
        priority: 'medium',
        action: 'review_sections'
      });
    }
    
    // Check for template usage
    if (profile.workflowHeuristics.templateUsageFrequency < 0.3) {
      suggestions.push({
        type: 'suggestion',
        message: 'Consider using templates more frequently to speed up report creation',
        priority: 'low',
        action: 'use_template'
      });
    }
    
    // Check for section order consistency
    if (profile.workflowHeuristics.orderConsistency > 0.9) {
      suggestions.push({
        type: 'optimization',
        message: 'High section order consistency detected. Consider creating a custom template with your preferred order',
        priority: 'low',
        action: 'create_template'
      });
    }
    
    // Check for common corrections
    if (profile.commonCorrections.length > 2) {
      suggestions.push({
        type: 'warning',
        message: `Frequent corrections detected (${profile.commonCorrections.length} patterns). Consider using validation templates.`,
        priority: 'medium',
        action: 'use_validation'
      });
    }
    
    // Check for data source patterns
    if (profile.typicalDataSources.length > 0) {
      suggestions.push({
        type: 'suggestion',
        message: `You frequently use these data sources: ${profile.typicalDataSources.slice(0, 3).join(', ')}`,
        priority: 'low',
        action: 'configure_data_sources'
      });
    }
    
    return suggestions;
  }
  
  /**
   * Get rendering statistics for the current user
   */
  getRenderingStatistics(): {
    totalRenders: number;
    averageTime: number;
    preferredFormat: string;
    commonErrors: Array<{ error: string; count: number }>;
    successRate: number;
  } {
    // This would integrate with the workflow engine's event storage
    // For now, return placeholder statistics
    return {
      totalRenders: 0,
      averageTime: 0,
      preferredFormat: 'pdf',
      commonErrors: [],
      successRate: 1.0
    };
  }
  
  /**
   * Record a custom rendering interaction
   */
  recordCustomInteraction(
    eventType: string,
    data: any,
    context: any = {}
  ): void {
    const event: UserInteractionEvent = {
      id: `event_${Date.now()}_${eventType}`,
      userId: this.userId,
      reportId: null,
      reportTypeId: null,
      sessionId: this.sessionId,
      eventType: 'search_performed', // Using existing event type
      timestamp: new Date(),
      context: {
        currentSection: null,
        previousSection: null,
        nextSection: null,
        timeSpent: null,
        platform: 'visual_rendering_engine',
        ...context
      },
      data: {
        action: eventType,
        ...data
      }
    };
    
    this.workflowEngine.observeInteraction(event);
  }
}

/**
 * Create and initialize the Phase 13 integration
 */
export function createPhase13WorkflowLearningIntegration(
  workflowEngine?: UserWorkflowLearningEngine,
  renderingEngine?: VisualRenderingEngine
): Phase13WorkflowLearningIntegration {
  // Create instances if not provided
  const wfEngine = workflowEngine || new UserWorkflowLearningEngine();
  
  // Create default rendering options
  const defaultOptions = DEFAULT_RENDERING_OPTIONS;
  const renderEngine = renderingEngine || new VisualRenderingEngine(defaultOptions);
  
  // Create integration
  const integration = new Phase13WorkflowLearningIntegration(wfEngine, renderEngine);
  
  return integration;
}