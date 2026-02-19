/**
 * Workflow Profile Interface
 * 
 * Represents a learned user workflow pattern for report creation.
 * Captures how a user typically creates reports, including section order,
 * common omissions, corrections, interaction patterns, and data sources.
 */

export interface WorkflowProfile {
  /** Unique identifier for this workflow profile */
  id: string;
  
  /** User ID this profile belongs to */
  userId: string;
  
  /** Report type ID this profile is associated with (nullable) */
  reportTypeId: string | null;
  
  /** Common section order observed in user's workflow */
  commonSectionOrder: string[];
  
  /** Sections commonly omitted by the user */
  commonOmissions: string[];
  
  /** Common corrections made by the user */
  commonCorrections: Array<{
    from: string;
    to: string;
    frequency: number;
    lastObserved: Date;
  }>;
  
  /** Preferred interaction patterns */
  preferredInteractionPatterns: Array<{
    pattern: string;
    frequency: number;
    confidence: number;
  }>;
  
  /** Typical data sources used by the user */
  typicalDataSources: string[];
  
  /** Workflow heuristics and patterns */
  workflowHeuristics: {
    /** Average time spent per section (in milliseconds) */
    averageSectionTime: Record<string, number>;
    
    /** Likelihood of completing sections in observed order (0-1) */
    orderConsistency: number;
    
    /** Frequency of using templates vs. starting from scratch */
    templateUsageFrequency: number;
    
    /** Common starting points for report creation */
    commonStartingPoints: string[];
    
    /** Common validation patterns */
    validationPatterns: string[];
    
    /** Revision patterns and frequency */
    revisionPatterns: Array<{
      pattern: string;
      frequency: number;
    }>;
  };
  
  /** Overall confidence score for this profile (0-1) */
  confidenceScore: number;
  
  /** Timestamps for tracking profile evolution */
  timestamps: {
    /** When this profile was first created */
    createdAt: Date;
    
    /** When this profile was last updated */
    updatedAt: Date;
    
    /** When this profile was last used for prediction */
    lastUsedAt: Date;
    
    /** Number of observations contributing to this profile */
    observationCount: number;
  };
  
  /** Metadata about the profile */
  metadata: {
    /** Profile version for evolution tracking */
    version: number;
    
    /** Whether this profile is active */
    isActive: boolean;
    
    /** Tags for categorizing workflow types */
    tags: string[];
    
    /** Source of this profile (e.g., 'auto-learned', 'manual', 'imported') */
    source: string;
  };
}

/**
 * User Interaction Event
 * 
 * Represents a single user interaction that can be observed and analyzed
 * for workflow learning.
 */
export interface UserInteractionEvent {
  /** Event ID */
  id: string;
  
  /** User ID */
  userId: string;
  
  /** Report ID (if applicable) */
  reportId: string | null;
  
  /** Report type ID (if applicable) */
  reportTypeId: string | null;
  
  /** Event type */
  eventType: 
    | 'section_created'
    | 'section_edited'
    | 'section_deleted'
    | 'section_reordered'
    | 'field_edited'
    | 'field_corrected'
    | 'template_applied'
    | 'validation_performed'
    | 'report_saved'
    | 'report_published'
    | 'data_source_used'
    | 'navigation'
    | 'search_performed'
    | 'help_requested';
  
  /** Event data (type-specific) */
  data: Record<string, any>;
  
  /** Timestamp of the event */
  timestamp: Date;
  
  /** Session ID for grouping related events */
  sessionId: string;
  
  /** Context information */
  context: {
    /** Current section (if applicable) */
    currentSection: string | null;
    
    /** Previous section (if applicable) */
    previousSection: string | null;
    
    /** Next section (if applicable) */
    nextSection: string | null;
    
    /** Time spent in previous state (ms) */
    timeSpent: number | null;
    
    /** User agent or platform */
    platform: string;
  };
}

/**
 * Workflow Analysis Result
 * 
 * Result of analyzing user interactions to detect workflow patterns.
 */
export interface WorkflowAnalysisResult {
  /** Analysis ID */
  id: string;
  
  /** User ID */
  userId: string;
  
  /** Time range of analyzed interactions */
  timeRange: {
    start: Date;
    end: Date;
  };
  
  /** Detected patterns */
  patterns: {
    /** Section order patterns */
    sectionOrder: Array<{
      pattern: string[];
      frequency: number;
      confidence: number;
    }>;
    
    /** Omission patterns */
    omissions: Array<{
      section: string;
      frequency: number;
      context: string[];
    }>;
    
    /** Correction patterns */
    corrections: Array<{
      from: string;
      to: string;
      frequency: number;
      context: string;
    }>;
    
    /** Interaction patterns */
    interactions: Array<{
      pattern: string;
      frequency: number;
      averageDuration: number;
    }>;
    
    /** Data source patterns */
    dataSources: Array<{
      source: string;
      frequency: number;
      context: string[];
    }>;
  };
  
  /** Confidence scores for each pattern type */
  confidenceScores: {
    sectionOrder: number;
    omissions: number;
    corrections: number;
    interactions: number;
    dataSources: number;
    overall: number;
  };
  
  /** Recommendations for workflow improvement */
  recommendations: Array<{
    type: 'suggestion' | 'warning' | 'optimization';
    message: string;
    priority: 'low' | 'medium' | 'high';
    action?: string;
  }>;
  
  /** Timestamp of analysis */
  analyzedAt: Date;
}

/**
 * Workflow Prediction
 * 
 * Prediction of user's next likely action based on learned workflow.
 */
export interface WorkflowPrediction {
  /** Prediction ID */
  id: string;
  
  /** User ID */
  userId: string;
  
  /** Current context */
  context: {
    currentSection: string | null;
    completedSections: string[];
    pendingSections: string[];
    recentActions: string[];
  };
  
  /** Predicted next actions */
  predictedActions: Array<{
    action: string;
    confidence: number;
    reason: string;
    estimatedTime?: number;
  }>;
  
  /** Suggested optimizations */
  suggestions: Array<{
    type: 'missing_section' | 'common_omission' | 'efficiency' | 'quality';
    message: string;
    section?: string;
    action?: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  
  /** Warnings about common mistakes */
  warnings: Array<{
    type: 'common_mistake' | 'frequent_correction' | 'omission_risk';
    message: string;
    section?: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  
  /** Timestamp of prediction */
  predictedAt: Date;
  
  /** Expiry time for this prediction */
  expiresAt: Date;
}