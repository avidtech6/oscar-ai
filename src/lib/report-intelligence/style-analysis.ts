/**
 * Style Analysis Interface for Report Style Learner
 * 
 * This interface defines the structure for style analysis results
 * that capture quantitative metrics about writing style, vocabulary,
 * readability, and consistency patterns.
 * 
 * PHASE 5 — Report Style Learner
 * Required Systems: Report Intelligence System
 */

export interface StyleAnalysis {
  /** Unique identifier for the document being analyzed */
  documentId: string;
  
  /** Overall style metrics and measurements */
  styleMetrics: StyleMetrics;
  
  /** Vocabulary analysis and complexity metrics */
  vocabulary: VocabularyAnalysis;
  
  /** Readability scores and text complexity analysis */
  readability: ReadabilityAnalysis;
  
  /** Consistency analysis across the document */
  consistency: ConsistencyAnalysis;
  
  /** When the analysis was performed */
  analyzedAt: Date;
  
  /** Version of the analysis algorithm used */
  analysisVersion: string;
  
  /** Confidence level in the analysis results (0-10) */
  confidence: number;
  
  /** Additional metadata about the analysis */
  metadata?: Record<string, any>;
}

export interface StyleMetrics {
  /** Average sentence length in words */
  averageSentenceLength: number;
  
  /** Average paragraph length in words */
  averageParagraphLength: number;
  
  /** Average word length in characters */
  averageWordLength: number;
  
  /** Document length in words */
  totalWords: number;
  
  /** Document length in characters */
  totalCharacters: number;
  
  /** Number of unique words */
  uniqueWords: number;
  
  /** Unique word ratio (unique words / total words) */
  uniqueWordRatio: number;
  
  /** Lexical diversity score (0-10) */
  lexicalDiversity: number;
  
  /** Formality score (0-10) */
  formality: number;
  
  /** Technicality score (0-10) */
  technicality: number;
  
  /** Conciseness score (0-10) */
  conciseness: number;
  
  /** Objectivity score (0-10) */
  objectivity: number;
  
  /** Tone analysis */
  tone: {
    formal: number;
    informal: number;
    technical: number;
    persuasive: number;
    neutral: number;
    authoritative: number;
  };
  
  /** Voice analysis */
  voice: {
    firstPerson: number;
    secondPerson: number;
    thirdPerson: number;
    passive: number;
    active: number;
  };
  
  /** Sentence complexity score (0-10) */
  sentenceComplexity: number;
  
  /** Paragraph complexity score (0-10) */
  paragraphComplexity: number;
  
  /** Overall style quality score (0-10) */
  styleQuality: number;
}

export interface VocabularyAnalysis {
  /** Most frequent words in the document */
  mostFrequentWords: Array<{
    word: string;
    frequency: number;
    percentage: number;
  }>;
  
  /** Least frequent words (excluding common stop words) */
  leastFrequentWords: Array<{
    word: string;
    frequency: number;
    percentage: number;
  }>;
  
  /** Vocabulary grade level estimate */
  vocabularyGradeLevel: number;
  
  /** Vocabulary richness score (0-10) */
  vocabularyRichness: number;
  
  /** Technical vocabulary ratio */
  technicalVocabularyRatio: number;
  
  /** Jargon usage frequency */
  jargonFrequency: number;
  
  /** Abbreviation usage frequency */
  abbreviationFrequency: number;
  
  /** Synonym usage patterns */
  synonymUsage: Record<string, number>;
  
  /** Word length distribution */
  wordLengthDistribution: Record<string, number>;
  
  /** Part of speech distribution */
  posDistribution: Record<string, number>;
  
  /** Academic vocabulary usage */
  academicVocabulary: {
    frequency: number;
    words: string[];
    score: number;
  };
  
  /** Business vocabulary usage */
  businessVocabulary: {
    frequency: number;
    words: string[];
    score: number;
  };
}

export interface ReadabilityAnalysis {
  /** Flesch Reading Ease score (0-100) */
  fleschReadingEase: number;
  
  /** Flesch-Kincaid Grade Level score */
  fleschKincaidGradeLevel: number;
  
  /** Gunning Fog Index score */
  gunningFogIndex: number;
  
  /** Coleman-Liau Index score */
  colemanLiauIndex: number;
  
  /** Automated Readability Index score */
  automatedReadabilityIndex: number;
  
  /** SMOG Index score */
  smogIndex: number;
  
  /** Reading ease category */
  readingEaseCategory: 'very_easy' | 'easy' | 'fairly_easy' | 'standard' | 'fairly_difficult' | 'difficult' | 'very_difficult';
  
  /** Target audience reading level */
  targetAudience: 'elementary' | 'middle_school' | 'high_school' | 'college' | 'professional';
  
  /** Readability score (0-10) */
  readabilityScore: number;
  
  /** Text complexity score (0-10) */
  textComplexity: number;
  
  /** Sentence length variability */
  sentenceLengthVariability: number;
  
  /** Paragraph length variability */
  paragraphLengthVariability: number;
  
  /** Reading time estimate in minutes */
  estimatedReadingTime: number;
  
  /** Word count per minute reading speed */
  wordsPerMinute: number;
  
  /** Cognitive load score (0-10) */
  cognitiveLoad: number;
}

export interface ConsistencyAnalysis {
  /** Terminology consistency score (0-10) */
  terminologyConsistency: number;
  
  /** Formatting consistency score (0-10) */
  formattingConsistency: number;
  
  /** Style consistency score (0-10) */
  styleConsistency: number;
  
  /** Tone consistency score (0-10) */
  toneConsistency: number;
  
  /** Voice consistency score (0-10) */
  voiceConsistency: number;
  
  /** Structural consistency score (0-10) */
  structuralConsistency: number;
  
  /** Inconsistencies found */
  inconsistencies: Array<{
    type: 'terminology' | 'formatting' | 'style' | 'tone' | 'voice' | 'structural';
    severity: 'low' | 'medium' | 'high';
    description: string;
    location: string;
    suggestion: string;
  }>;
  
  /** Consistency warnings count */
  warnings: number;
  
  /** Consistency errors count */
  errors: number;
  
  /** Overall consistency score (0-10) */
  overallConsistency: number;
  
  /** Consistency improvement suggestions */
  suggestions: string[];
}

/** Helper function to create a new style analysis */
export function createStyleAnalysis(documentId: string): StyleAnalysis {
  return {
    documentId,
    styleMetrics: {
      averageSentenceLength: 0,
      averageParagraphLength: 0,
      averageWordLength: 0,
      totalWords: 0,
      totalCharacters: 0,
      uniqueWords: 0,
      uniqueWordRatio: 0,
      lexicalDiversity: 0,
      formality: 0,
      technicality: 0,
      conciseness: 0,
      objectivity: 0,
      tone: {
        formal: 0,
        informal: 0,
        technical: 0,
        persuasive: 0,
        neutral: 0,
        authoritative: 0,
      },
      voice: {
        firstPerson: 0,
        secondPerson: 0,
        thirdPerson: 0,
        passive: 0,
        active: 0,
      },
      sentenceComplexity: 0,
      paragraphComplexity: 0,
      styleQuality: 0,
    },
    vocabulary: {
      mostFrequentWords: [],
      leastFrequentWords: [],
      vocabularyGradeLevel: 0,
      vocabularyRichness: 0,
      technicalVocabularyRatio: 0,
      jargonFrequency: 0,
      abbreviationFrequency: 0,
      synonymUsage: {},
      wordLengthDistribution: {},
      posDistribution: {},
      academicVocabulary: {
        frequency: 0,
        words: [],
        score: 0,
      },
      businessVocabulary: {
        frequency: 0,
        words: [],
        score: 0,
      },
    },
    readability: {
      fleschReadingEase: 0,
      fleschKincaidGradeLevel: 0,
      gunningFogIndex: 0,
      colemanLiauIndex: 0,
      automatedReadabilityIndex: 0,
      smogIndex: 0,
      readingEaseCategory: 'standard',
      targetAudience: 'professional',
      readabilityScore: 0,
      textComplexity: 0,
      sentenceLengthVariability: 0,
      paragraphLengthVariability: 0,
      estimatedReadingTime: 0,
      wordsPerMinute: 200,
      cognitiveLoad: 0,
    },
    consistency: {
      terminologyConsistency: 0,
      formattingConsistency: 0,
      styleConsistency: 0,
      toneConsistency: 0,
      voiceConsistency: 0,
      structuralConsistency: 0,
      inconsistencies: [],
      warnings: 0,
      errors: 0,
      overallConsistency: 0,
      suggestions: [],
    },
    analyzedAt: new Date(),
    analysisVersion: '1.0.0',
    confidence: 0,
  };
}

/** Helper function to update a style analysis */
export function updateStyleAnalysis(analysis: StyleAnalysis, updates: Partial<StyleAnalysis>): StyleAnalysis {
  return {
    ...analysis,
    ...updates,
    analyzedAt: new Date(),
  };
}

/** Helper function to calculate overall quality score */
export function calculateOverallQualityScore(analysis: StyleAnalysis): number {
  const styleWeight = 0.3;
  const vocabularyWeight = 0.2;
  const readabilityWeight = 0.2;
  const consistencyWeight = 0.3;
  
  const styleScore = analysis.styleMetrics.styleQuality;
  const vocabularyScore = analysis.vocabulary.vocabularyRichness;
  const readabilityScore = analysis.readability.readabilityScore;
  const consistencyScore = analysis.consistency.overallConsistency;
  
  return Math.round(
    (styleScore * styleWeight) +
    (vocabularyScore * vocabularyWeight) +
    (readabilityScore * readabilityWeight) +
    (consistencyScore * consistencyWeight)
  );
}