/**
 * Phase 24: Document Intelligence Layer
 * Content Analysis Type Definitions
 */

/**
 * Sentence complexity analysis
 */
export interface SentenceComplexity {
  /** Average sentence length in words */
  averageSentenceLength: number;
  /** Long sentences (over 25 words) count */
  longSentenceCount: number;
  /** Very long sentences (over 40 words) count */
  veryLongSentenceCount: number;
  /** Short sentences (under 10 words) count */
  shortSentenceCount: number;
  /** Sentence length variation (standard deviation) */
  sentenceLengthVariation: number;
  /** Complex sentence percentage (with multiple clauses) */
  complexSentencePercentage: number;
  /** Passive voice usage percentage */
  passiveVoicePercentage: number;
  /** Readability impact of sentence complexity */
  impact: 'positive' | 'neutral' | 'negative';
}

/**
 * Jargon analysis
 */
export interface JargonAnalysis {
  /** Jargon terms found */
  jargonTerms: JargonTerm[];
  /** Jargon density (terms per 1000 words) */
  jargonDensity: number;
  /** Jargon appropriateness for audience */
  appropriateness: 'appropriate' | 'moderate' | 'excessive' | 'inappropriate';
  /** Suggested plain language alternatives */
  alternatives: JargonAlternative[];
}

/**
 * Jargon term
 */
export interface JargonTerm {
  /** The jargon term */
  term: string;
  /** Frequency in document */
  frequency: number;
  /** Whether term is defined in document */
  isDefined: boolean;
  /** Audience familiarity (estimated) */
  audienceFamiliarity: 'high' | 'medium' | 'low' | 'unknown';
  /** Suggested plain language alternative */
  suggestedAlternative?: string;
}

/**
 * Jargon alternative
 */
export interface JargonAlternative {
  /** Jargon term */
  jargonTerm: string;
  /** Plain language alternative */
  plainAlternative: string;
  /** Context where alternative applies */
  context: string;
}

/**
 * Ambiguity detection
 */
export interface Ambiguity {
  /** Type of ambiguity */
  type: 
    | 'pronoun-reference'
    | 'modifier-placement'
    | 'word-sense'
    | 'structural'
    | 'temporal'
    | 'quantitative'
    | 'scope';
  /** Ambiguous text */
  text: string;
  /** Location */
  location: {
    startIndex: number;
    endIndex: number;
  };
  /** Possible interpretations */
  interpretations: string[];
  /** Suggested clarification */
  suggestedClarification: string;
  /** Severity */
  severity: 'low' | 'medium' | 'high';
}

/**
 * Inconsistency in document
 */
export interface Inconsistency {
  /** Type of inconsistency */
  type: string;
  /** First occurrence */
  firstOccurrence: {
    text: string;
    location: {
      startIndex: number;
      endIndex: number;
    };
  };
  /** Second occurrence (or pattern) */
  secondOccurrence: {
    text: string;
    location: {
      startIndex: number;
      endIndex: number;
    };
  };
  /** Suggested correction */
  suggestedCorrection: string;
}

/**
 * Transition analysis between sections
 */
export interface TransitionAnalysis {
  /** From section */
  fromSectionId: string;
  /** To section */
  toSectionId: string;
  /** Transition quality score (0-100) */
  qualityScore: number;
  /** Transition type */
  transitionType: 
    | 'sequential'
    | 'contrastive'
    | 'causal'
    | 'temporal'
    | 'additive'
    | 'exemplification'
    | 'conclusion'
    | 'weak' 
    | 'missing';
  /** Issues with transition */
  issues: string[];
  /** Suggested improvement */
  suggestedImprovement?: string;
}

/**
 * Logical progression analysis
 */
export interface LogicalProgression {
  /** Overall logical coherence score (0-100) */
  coherenceScore: number;
  /** Logical flow type */
  flowType: 
    | 'deductive'     // General to specific
    | 'inductive'     // Specific to general
    | 'chronological' // Time-based
    | 'problem-solution'
    | 'compare-contrast'
    | 'cause-effect'
    | 'spatial'
    | 'topical'
    | 'mixed';
  /** Logical gaps detected */
  logicalGaps: LogicalGap[];
  /** Argument strength */
  argumentStrength: 'weak' | 'moderate' | 'strong' | 'very-strong';
  /** Evidence support assessment */
  evidenceSupport: 'insufficient' | 'adequate' | 'strong' | 'excellent';
}

/**
 * Narrative flow analysis
 */
export interface NarrativeFlow {
  /** Narrative structure type */
  structureType: 
    | 'linear'
    | 'non-linear'
    | 'circular'
    | 'parallel'
    | 'framed'
    | 'episodic'
    | 'none';
  /** Narrative tension arc */
  tensionArc?: TensionArc;
  /** Character development (if applicable) */
  characterDevelopment?: CharacterDevelopment;
  /** Plot coherence */
  plotCoherence: number; // 0-1
  /** Pacing assessment */
  pacing: 'too-fast' | 'well-paced' | 'too-slow' | 'uneven';
}

/**
 * Hierarchy issue in document structure
 */
export interface HierarchyIssue {
  /** Issue type */
  type: 
    | 'missing-heading'
    | 'heading-skipped-level'
    | 'heading-out-of-order'
    | 'orphaned-content'
    | 'overly-deep-nesting'
    | 'flat-structure'
    | 'inconsistent-heading-style';
  /** Description */
  description: string;
  /** Location */
  location?: {
    sectionId?: string;
    startIndex?: number;
    endIndex?: number;
  };
  /** Severity */
  severity: 'low' | 'medium' | 'high';
  /** Suggested fix */
  suggestedFix: string;
}

// Supporting interfaces for narrative analysis

interface TensionArc {
  /** Introduction tension level (0-1) */
  introduction: number;
  /** Rising action tension level (0-1) */
  risingAction: number;
  /** Climax tension level (0-1) */
  climax: number;
  /** Falling action tension level (0-1) */
  fallingAction: number;
  /** Resolution tension level (0-1) */
  resolution: number;
  /** Arc coherence score (0-1) */
  coherence: number;
}

interface CharacterDevelopment {
  /** Character consistency */
  consistency: number; // 0-1
  /** Character depth */
  depth: 'shallow' | 'moderate' | 'deep';
  /** Character evolution */
  evolution: 'static' | 'dynamic' | 'transformative';
}

interface LogicalGap {
  /** Gap description */
  description: string;
  /** Location between sections */
  betweenSections: [string, string]; // Section IDs
  /** Missing element */
  missingElement: string;
  /** Impact on understanding */
  impact: 'minor' | 'moderate' | 'major';
}