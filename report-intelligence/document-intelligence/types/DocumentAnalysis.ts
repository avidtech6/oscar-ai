/**
 * Phase 24: Document Intelligence Layer
 * Core Document Analysis Type Definitions
 */

// Import types from other files
import type {
  SentenceComplexity,
  JargonAnalysis,
  Ambiguity,
  Inconsistency,
  TransitionAnalysis,
  LogicalProgression,
  NarrativeFlow,
  HierarchyIssue
} from './ContentAnalysis';

import type {
  StructuralSuggestion,
  ContentSuggestion,
  StyleSuggestion,
  FlowSuggestion,
  MainArgument,
  EvidenceAnalysis,
  LogicalFlowAssessment,
  AudienceAssessment
} from './SuggestionTypes';

/**
 * Document analysis scope
 */
export type AnalysisScope =
  | 'full-document'      // Entire document
  | 'section'            // Specific section
  | 'paragraph'          // Single paragraph
  | 'cross-section';     // Across multiple sections

/**
 * Analysis depth level
 */
export type AnalysisDepth =
  | 'surface'      // Quick, shallow analysis
  | 'standard'     // Balanced depth/speed
  | 'deep'         // Comprehensive analysis
  | 'exhaustive';  // Maximum depth (slow)

/**
 * Document analysis request
 */
export interface DocumentAnalysisRequest {
  /** Document content to analyze */
  content: string;
  /** Analysis scope */
  scope: AnalysisScope;
  /** Analysis depth */
  depth: AnalysisDepth;
  /** Optional section boundaries for section analysis */
  sectionBoundaries?: {
    startIndex: number;
    endIndex: number;
  }[];
  /** Focus areas for analysis */
  focusAreas?: string[];
  /** Whether to include suggestions */
  includeSuggestions: boolean;
  /** Whether to include confidence scores */
  includeConfidence: boolean;
  /** Maximum number of issues to return */
  maxIssues?: number;
}

/**
 * Document analysis result
 */
export interface DocumentAnalysisResult {
  /** Analysis metadata */
  metadata: {
    /** When analysis was performed */
    timestamp: Date;
    /** Analysis scope */
    scope: AnalysisScope;
    /** Analysis depth */
    depth: AnalysisDepth;
    /** Processing time in milliseconds */
    processingTimeMs: number;
    /** Document statistics */
    statistics: {
      /** Total characters */
      characterCount: number;
      /** Total words */
      wordCount: number;
      /** Total sentences */
      sentenceCount: number;
      /** Total paragraphs */
      paragraphCount: number;
      /** Estimated reading time in minutes */
      readingTimeMinutes: number;
    };
  };
  
  /** Document structure analysis */
  structure: {
    /** Detected sections */
    sections: DocumentSection[];
    /** Section hierarchy */
    hierarchy: SectionHierarchy;
    /** Structural issues */
    structuralIssues: StructuralIssue[];
    /** Flow analysis between sections */
    flowAnalysis: FlowAnalysis;
  };
  
  /** Content quality analysis */
  quality: {
    /** Readability scores */
    readability: ReadabilityScores;
    /** Tone analysis */
    tone: ToneAnalysis;
    /** Clarity assessment */
    clarity: ClarityAssessment;
    /** Consistency checks */
    consistency: ConsistencyCheck[];
    /** Redundancy detection */
    redundancies: RedundancyDetection[];
  };
  
  /** Intelligence insights */
  insights: {
    /** Key themes and topics */
    keyThemes: KeyTheme[];
    /** Main arguments or points */
    mainArguments: MainArgument[];
    /** Evidence and support analysis */
    evidenceAnalysis: EvidenceAnalysis[];
    /** Logical flow assessment */
    logicalFlow: LogicalFlowAssessment;
    /** Audience appropriateness */
    audienceAppropriateness: AudienceAssessment;
  };
  
  /** Actionable suggestions */
  suggestions: {
    /** Structural improvements */
    structural: StructuralSuggestion[];
    /** Content improvements */
    content: ContentSuggestion[];
    /** Style improvements */
    style: StyleSuggestion[];
    /** Flow improvements */
    flow: FlowSuggestion[];
    /** Priority ranking of suggestions */
    priority: 'low' | 'medium' | 'high';
  };
  
  /** Overall assessment */
  assessment: {
    /** Overall quality score (0-100) */
    overallScore: number;
    /** Strengths of the document */
    strengths: string[];
    /** Areas for improvement */
    areasForImprovement: string[];
    /** Urgency of improvements */
    improvementUrgency: 'low' | 'medium' | 'high' | 'critical';
    /** Confidence in analysis */
    confidence: number; // 0-1
  };
}

/**
 * Document section
 */
export interface DocumentSection {
  /** Section identifier */
  id: string;
  /** Section title or heading */
  title: string;
  /** Section content */
  content: string;
  /** Start position in document */
  startIndex: number;
  /** End position in document */
  endIndex: number;
  /** Section level in hierarchy (1 = top level) */
  level: number;
  /** Parent section ID (if nested) */
  parentId?: string;
  /** Child section IDs */
  childIds: string[];
  /** Key topics in this section */
  keyTopics: string[];
  /** Summary of section */
  summary?: string;
  /** Tone of section */
  tone?: ToneAnalysis;
  /** Readability score for section */
  readability?: ReadabilityScores;
}

/**
 * Section hierarchy
 */
export interface SectionHierarchy {
  /** Root sections (level 1) */
  rootSections: DocumentSection[];
  /** Maximum nesting depth */
  maxDepth: number;
  /** Whether hierarchy is balanced */
  isBalanced: boolean;
  /** Hierarchy issues */
  issues: HierarchyIssue[];
}

/**
 * Structural issue
 */
export interface StructuralIssue {
  /** Issue type */
  type: 
    | 'missing-introduction'
    | 'missing-conclusion'
    | 'unbalanced-sections'
    | 'section-too-long'
    | 'section-too-short'
    | 'heading-misuse'
    | 'poor-transition'
    | 'logical-gap'
    | 'repetitive-structure';
  /** Description of issue */
  description: string;
  /** Location in document */
  location: {
    sectionId?: string;
    startIndex?: number;
    endIndex?: number;
  };
  /** Severity */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Suggested fix */
  suggestedFix: string;
  /** Confidence in issue detection */
  confidence: number; // 0-1
}

/**
 * Flow analysis between sections
 */
export interface FlowAnalysis {
  /** Overall flow score (0-100) */
  flowScore: number;
  /** Transition quality between sections */
  transitions: TransitionAnalysis[];
  /** Logical progression assessment */
  logicalProgression: LogicalProgression;
  /** Narrative flow (if applicable) */
  narrativeFlow?: NarrativeFlow;
}

/**
 * Readability scores
 */
export interface ReadabilityScores {
  /** Flesch Reading Ease score */
  fleschReadingEase: number;
  /** Flesch-Kincaid Grade Level */
  fleschKincaidGradeLevel: number;
  /** Gunning Fog Index */
  gunningFogIndex: number;
  /** Coleman-Liau Index */
  colemanLiauIndex: number;
  /** SMOG Index */
  smogIndex: number;
  /** Automated Readability Index */
  automatedReadabilityIndex: number;
  /** Dale-Chall Readability Score */
  daleChallScore: number;
  /** Spache Readability Score (for younger readers) */
  spacheScore?: number;
  /** Overall readability assessment */
  assessment: 'very-easy' | 'easy' | 'fairly-easy' | 'standard' | 'fairly-difficult' | 'difficult' | 'very-difficult';
  /** Target audience reading level */
  targetAudienceLevel: string;
}

/**
 * Tone analysis
 */
export interface ToneAnalysis {
  /** Primary tone */
  primaryTone: 
    | 'formal'
    | 'informal'
    | 'academic'
    | 'conversational'
    | 'persuasive'
    | 'descriptive'
    | 'instructive'
    | 'analytical'
    | 'critical'
    | 'optimistic'
    | 'pessimistic'
    | 'neutral';
  /** Secondary tones */
  secondaryTones: string[];
  /** Tone consistency score (0-1) */
  consistencyScore: number;
  /** Tone appropriateness for audience */
  appropriateness: 'excellent' | 'good' | 'adequate' | 'poor' | 'inappropriate';
  /** Emotional tone analysis */
  emotionalTone?: EmotionalTone;
}

/**
 * Emotional tone analysis
 */
export interface EmotionalTone {
  /** Emotional valence (positive/negative/neutral) */
  valence: 'positive' | 'negative' | 'neutral' | 'mixed';
  /** Emotional intensity (0-1) */
  intensity: number;
  /** Dominant emotions */
  dominantEmotions: string[];
  /** Emotional consistency */
  consistency: number; // 0-1
}

/**
 * Clarity assessment
 */
export interface ClarityAssessment {
  /** Overall clarity score (0-100) */
  clarityScore: number;
  /** Sentence complexity analysis */
  sentenceComplexity: SentenceComplexity;
  /** Jargon usage */
  jargonUsage: JargonAnalysis;
  /** Ambiguity detection */
  ambiguities: Ambiguity[];
  /** Concrete vs abstract language ratio */
  concreteAbstractRatio: number;
}

/**
 * Consistency check
 */
export interface ConsistencyCheck {
  /** Type of consistency */
  type: 
    | 'terminology'
    | 'formatting'
    | 'style'
    | 'tense'
    | 'voice'
    | 'perspective'
    | 'capitalization'
    | 'number-format'
    | 'date-format';
  /** Check result */
  result: 'consistent' | 'inconsistent' | 'mixed';
  /** Inconsistencies found */
  inconsistencies?: Inconsistency[];
  /** Impact of inconsistency */
  impact: 'low' | 'medium' | 'high';
}

/**
 * Redundancy detection
 */
export interface RedundancyDetection {
  /** Type of redundancy */
  type: 'word-repetition' | 'phrase-repetition' | 'idea-repetition' | 'section-repetition';
  /** Redundant content */
  content: string;
  /** Location */
  location: {
    startIndex: number;
    endIndex: number;
  };
  /** Suggested alternative or removal */
  suggestion: string;
  /** Severity */
  severity: 'low' | 'medium' | 'high';
}

/**
 * Key theme
 */
export interface KeyTheme {
  /** Theme name */
  theme: string;
  /** Relevance score (0-1) */
  relevance: number;
  /** Sections where theme appears */
  sections: string[];
  /** Theme development assessment */
  development: 'underdeveloped' | 'adequate' | 'well-developed' | 'overdeveloped';
}

/**
 * Type utilities and helper functions
 */

/**
 * Check if value is a DocumentAnalysisRequest
 */
export function isDocumentAnalysisRequest(value: any): value is DocumentAnalysisRequest {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.content === 'string' &&
    typeof value.scope === 'string' &&
    typeof value.depth === 'string' &&
    typeof value.includeSuggestions === 'boolean' &&
    typeof value.includeConfidence === 'boolean'
  );
}

/**
 * Create a default document analysis request
 */
export function createDefaultDocumentAnalysisRequest(
  content: string,
  options: Partial<DocumentAnalysisRequest> = {}
): DocumentAnalysisRequest {
  return {
    content,
    scope: 'full-document',
    depth: 'standard',
    includeSuggestions: true,
    includeConfidence: true,
    maxIssues: 20,
    ...options
  };
}
