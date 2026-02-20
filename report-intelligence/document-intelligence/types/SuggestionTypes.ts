/**
 * Phase 24: Document Intelligence Layer
 * Suggestion Type Definitions
 */

/**
 * Structural suggestion for document improvement
 */
export interface StructuralSuggestion {
  /** Suggestion type */
  type: 
    | 'add-section'
    | 'remove-section'
    | 'merge-sections'
    | 'split-section'
    | 'reorder-sections'
    | 'add-heading'
    | 'remove-heading'
    | 'change-heading-level'
    | 'improve-transition'
    | 'add-introduction'
    | 'add-conclusion'
    | 'balance-section-lengths'
    | 'improve-hierarchy';
  
  /** Description of suggestion */
  description: string;
  
  /** Location in document */
  location: {
    sectionId?: string;
    startIndex?: number;
    endIndex?: number;
    targetIndex?: number;
  };
  
  /** Detailed explanation */
  explanation: string;
  
  /** Expected impact */
  expectedImpact: 'low' | 'medium' | 'high' | 'transformative';
  
  /** Implementation difficulty */
  difficulty: 'easy' | 'moderate' | 'difficult';
  
  /** Priority */
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  /** Alternative suggestions */
  alternatives?: StructuralSuggestion[];
  
  /** Confidence in suggestion (0-1) */
  confidence: number;
}

/**
 * Content suggestion for document improvement
 */
export interface ContentSuggestion {
  /** Suggestion type */
  type: 
    | 'add-content'
    | 'remove-content'
    | 'rewrite-content'
    | 'clarify-content'
    | 'add-example'
    | 'add-evidence'
    | 'add-explanation'
    | 'strengthen-argument'
    | 'address-counterargument'
    | 'improve-specificity'
    | 'reduce-redundancy'
    | 'improve-coherence';
  
  /** Description */
  description: string;
  
  /** Location */
  location: {
    startIndex: number;
    endIndex: number;
    sectionId?: string;
  };
  
  /** Current content (excerpt) */
  currentContent: string;
  
  /** Suggested content */
  suggestedContent: string;
  
  /** Reasoning for change */
  reasoning: string;
  
  /** Expected impact */
  expectedImpact: 'low' | 'medium' | 'high';
  
  /** Priority */
  priority: 'low' | 'medium' | 'high';
  
  /** Confidence in suggestion (0-1) */
  confidence: number;
}

/**
 * Style suggestion for document improvement
 */
export interface StyleSuggestion {
  /** Suggestion type */
  type: 
    | 'improve-tone'
    | 'adjust-formality'
    | 'improve-clarity'
    | 'reduce-jargon'
    | 'improve-sentence-structure'
    | 'reduce-passive-voice'
    | 'improve-word-choice'
    | 'improve-conciseness'
    | 'improve-variety'
    | 'adjust-pacing'
    | 'improve-imagery'
    | 'strengthen-voice';
  
  /** Description */
  description: string;
  
  /** Location */
  location: {
    startIndex: number;
    endIndex: number;
    sectionId?: string;
  };
  
  /** Current text (excerpt) */
  currentText: string;
  
  /** Suggested revision */
  suggestedRevision: string;
  
  /** Style principle applied */
  stylePrinciple: string;
  
  /** Expected impact */
  expectedImpact: 'low' | 'medium' | 'high';
  
  /** Priority */
  priority: 'low' | 'medium' | 'high';
  
  /** Confidence in suggestion (0-1) */
  confidence: number;
}

/**
 * Flow suggestion for document improvement
 */
export interface FlowSuggestion {
  /** Suggestion type */
  type: 
    | 'improve-transition'
    | 'improve-logical-flow'
    | 'improve-narrative-flow'
    | 'improve-argument-flow'
    | 'improve-topic-flow'
    | 'add-bridge'
    | 'improve-pacing'
    | 'improve-rhythm'
    | 'create-better-connections';
  
  /** Description */
  description: string;
  
  /** Location (between sections or within section) */
  location: {
    fromSectionId?: string;
    toSectionId?: string;
    withinSectionId?: string;
    startIndex?: number;
    endIndex?: number;
  };
  
  /** Current flow issue */
  currentIssue: string;
  
  /** Suggested improvement */
  suggestedImprovement: string;
  
  /** Expected impact */
  expectedImpact: 'low' | 'medium' | 'high';
  
  /** Priority */
  priority: 'low' | 'medium' | 'high';
  
  /** Confidence in suggestion (0-1) */
  confidence: number;
}

/**
 * Main argument in document
 */
export interface MainArgument {
  /** Argument statement */
  argument: string;
  
  /** Strength assessment */
  strength: 'weak' | 'moderate' | 'strong' | 'very-strong';
  
  /** Evidence support */
  evidenceSupport: 'insufficient' | 'adequate' | 'strong' | 'excellent';
  
  /** Logical coherence */
  logicalCoherence: 'low' | 'medium' | 'high';
  
  /** Sections where argument appears */
  sections: string[];
  
  /** Counterarguments addressed */
  counterargumentsAddressed: boolean;
  
  /** Suggestions for strengthening */
  strengtheningSuggestions: string[];
}

/**
 * Evidence analysis
 */
export interface EvidenceAnalysis {
  /** Type of evidence */
  type: 
    | 'statistical'
    | 'anecdotal'
    | 'expert-testimony'
    | 'research-study'
    | 'historical'
    | 'logical'
    | 'experiential'
    | 'documentary'
    | 'missing';
  
  /** Evidence quality */
  quality: 'poor' | 'adequate' | 'good' | 'excellent';
  
  /** Relevance to argument */
  relevance: 'low' | 'medium' | 'high';
  
  /** Credibility assessment */
  credibility: 'low' | 'medium' | 'high';
  
  /** Location in document */
  location: {
    sectionId: string;
    startIndex?: number;
    endIndex?: number;
  };
  
  /** Suggestions for improvement */
  improvementSuggestions: string[];
}

/**
 * Logical flow assessment
 */
export interface LogicalFlowAssessment {
  /** Overall logical coherence score (0-100) */
  overallCoherence: number;
  
  /** Argument chain completeness */
  argumentChainCompleteness: 'incomplete' | 'partial' | 'complete' | 'robust';
  
  /** Logical fallacies detected */
  logicalFallacies: LogicalFallacy[];
  
  /** Reasoning quality */
  reasoningQuality: 'flawed' | 'adequate' | 'sound' | 'excellent';
  
  /** Assumptions identified */
  assumptions: Assumption[];
  
  /** Implications explored */
  implicationsExplored: 'none' | 'some' | 'most' | 'all';
}

/**
 * Audience assessment
 */
export interface AudienceAssessment {
  /** Target audience identified */
  targetAudience: string;
  
  /** Appropriateness for audience */
  appropriateness: 'inappropriate' | 'somewhat-appropriate' | 'appropriate' | 'highly-appropriate';
  
  /** Knowledge level match */
  knowledgeLevelMatch: 'too-basic' | 'appropriate' | 'too-advanced';
  
  /** Interest level maintained */
  interestLevel: 'low' | 'moderate' | 'high' | 'very-high';
  
  /** Accessibility for audience */
  accessibility: 'poor' | 'adequate' | 'good' | 'excellent';
  
  /** Cultural appropriateness */
  culturalAppropriateness: 'poor' | 'adequate' | 'good' | 'excellent';
  
  /** Suggestions for better audience targeting */
  targetingSuggestions: string[];
}

// Supporting interfaces

interface LogicalFallacy {
  /** Fallacy type */
  type: string;
  
  /** Description */
  description: string;
  
  /** Location */
  location: {
    sectionId: string;
    startIndex?: number;
    endIndex?: number;
  };
  
  /** Impact on argument */
  impact: 'minor' | 'moderate' | 'major';
  
  /** Suggested correction */
  suggestedCorrection: string;
}

interface Assumption {
  /** Assumption statement */
  assumption: string;
  
  /** Whether assumption is stated */
  isStated: boolean;
  
  /** Whether assumption is justified */
  isJustified: boolean;
  
  /** Impact if assumption is false */
  impactIfFalse: 'minor' | 'moderate' | 'major' | 'critical';
  
  /** Location */
  location?: {
    sectionId: string;
    startIndex?: number;
    endIndex?: number;
  };
}