/**
 * Brand Tone Model Types
 * 
 * Type definitions for the modular BrandToneModel system
 */

import {
  BrandType,
  BrandProfile,
  ToneGuidelines,
  ToneAnalysis,
  ToneSuggestion,
  ContentAnalysis,
  BrandConsistencyScore,
  ToneDeviation,
  BrandLearningData,
  BrandToneConfig,
  DEFAULT_BRAND_TONE_CONFIG,
  SocialPlatform,
  ToneAnalysisMetadata,
} from '../types';

// ==================== BRAND TONE PROFILE ====================

export interface BrandToneProfile {
  id: string;
  name: string;
  brandType: BrandType;
  toneGuidelines: ToneGuidelines;
  vocabularyLevel: 'basic' | 'intermediate' | 'advanced';
  sentenceLength: 'short' | 'medium' | 'long';
  formality: 'casual' | 'neutral' | 'formal';
  emotion: 'neutral' | 'positive' | 'enthusiastic' | 'serious' | 'humorous';
  pacing: 'slow' | 'moderate' | 'fast';
  keywords: string[];
  prohibitedTerms: string[];
  preferredPhrases: string[];
  exampleContent: string[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    sampleCount: number;
    consistencyScore: number;
  };
}

// ==================== TONE FEATURES ====================

export interface ToneFeatures {
  wordCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  avgWordLength: number;
  formalityScore: number;
  vocabularyScore: number;
  emotionScore: number;
  pacingScore: number;
  keywordMatches: number;
  prohibitedMatches: number;
  readingLevel: 'basic' | 'intermediate' | 'advanced';
}

// ==================== TONE TRANSFORMATION ====================

export interface ToneTransformation {
  original: string;
  transformed: string;
  changes: Array<{
    type: 'vocabulary' | 'sentence-structure' | 'formality' | 'emotion' | 'pacing';
    original: string;
    replacement: string;
    reason: string;
  }>;
  confidence: number;
}

// ==================== TONE PRESETS ====================

export interface TonePreset {
  id: string;
  name: string;
  description: string;
  toneGuidelines: ToneGuidelines;
  vocabularyLevel: 'basic' | 'intermediate' | 'advanced';
  sentenceLength: 'short' | 'medium' | 'long';
  formality: 'casual' | 'neutral' | 'formal';
  emotion: 'neutral' | 'positive' | 'enthusiastic' | 'serious' | 'humorous';
  pacing: 'slow' | 'moderate' | 'fast';
  keywords?: string[];
  preferredPhrases?: string[];
  exampleContent: string[];
}

// ==================== TONE VALIDATION RESULT ====================

export interface ToneValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  score: number;
  metadata: {
    validatedAt: Date;
    profileId: string;
    contentLength: number;
  };
}

// ==================== DEFAULT TONE PRESETS ====================

export const DEFAULT_TONE_PRESETS: Record<string, TonePreset> = {
  'professional-formal': {
    id: 'professional-formal',
    name: 'Professional Formal',
    description: 'Formal, authoritative tone for professional services',
    toneGuidelines: {
      formality: 'formal',
      voice: 'professional',
      pointOfView: 'third',
      sentenceLength: 'medium',
      vocabularyLevel: 'intermediate',
    },
    vocabularyLevel: 'intermediate',
    sentenceLength: 'medium',
    formality: 'formal',
    emotion: 'serious',
    pacing: 'moderate',
    keywords: [
      'professional', 'expert', 'trusted', 'reliable', 'experienced',
      'quality', 'precision', 'safety', 'compliance', 'standards'
    ],
    preferredPhrases: [
      'professional assessment', 'expert analysis', 'industry standards',
      'best practices', 'comprehensive solution', 'long-term benefits'
    ],
    exampleContent: [
      'Our organization provides comprehensive solutions to complex challenges.',
      'We adhere to industry standards and best practices.',
      'Professional expertise ensures optimal outcomes for all stakeholders.',
    ],
  },
  'educational-casual': {
    id: 'educational-casual',
    name: 'Educational Casual',
    description: 'Casual, engaging tone for educational content',
    toneGuidelines: {
      formality: 'casual',
      voice: 'educational',
      pointOfView: 'second',
      sentenceLength: 'short',
      vocabularyLevel: 'basic',
    },
    vocabularyLevel: 'basic',
    sentenceLength: 'short',
    formality: 'casual',
    emotion: 'enthusiastic',
    pacing: 'moderate',
    keywords: [
      'learn', 'discover', 'explore', 'fun', 'engaging',
      'simple', 'clear', 'friendly', 'community', 'growth'
    ],
    preferredPhrases: [
      'let\'s learn together', 'discover the wonders', 'join our community',
      'fun facts about', 'easy to understand', 'hands-on learning'
    ],
    exampleContent: [
      'Let\'s learn together about this fascinating topic!',
      'Did you know that trees communicate through underground networks?',
      'Join our community and grow your knowledge with us!',
    ],
  },
  'technical-neutral': {
    id: 'technical-neutral',
    name: 'Technical Neutral',
    description: 'Neutral, authoritative tone for technical content',
    toneGuidelines: {
      formality: 'neutral',
      voice: 'authoritative',
      pointOfView: 'third',
      sentenceLength: 'medium',
      vocabularyLevel: 'advanced',
    },
    vocabularyLevel: 'advanced',
    sentenceLength: 'medium',
    formality: 'neutral',
    emotion: 'neutral',
    pacing: 'fast',
    keywords: [
      'innovative', 'intelligent', 'efficient', 'scalable', 'robust',
      'algorithm', 'architecture', 'implementation', 'optimization', 'integration'
    ],
    preferredPhrases: [
      'advanced algorithms', 'scalable architecture', 'intelligent solutions',
      'optimized performance', 'seamless integration', 'innovative approach'
    ],
    exampleContent: [
      'The system leverages advanced algorithms to optimize performance.',
      'Scalable architecture ensures enterprise-grade reliability.',
      'Data-driven insights inform strategic decision-making processes.',
    ],
  },
  'friendly-positive': {
    id: 'friendly-positive',
    name: 'Friendly Positive',
    description: 'Friendly, positive tone for community engagement',
    toneGuidelines: {
      formality: 'casual',
      voice: 'friendly',
      pointOfView: 'first',
      sentenceLength: 'short',
      vocabularyLevel: 'basic',
    },
    vocabularyLevel: 'basic',
    sentenceLength: 'short',
    formality: 'casual',
    emotion: 'positive',
    pacing: 'slow',
    keywords: [
      'friendly', 'welcoming', 'supportive', 'positive', 'encouraging',
      'community', 'together', 'helpful', 'kind', 'caring'
    ],
    preferredPhrases: [
      'we\'re excited to share', 'thank you for being part', 'let\'s work together',
      'make a positive difference', 'wonderful news', 'amazing community'
    ],
    exampleContent: [
      'We\'re excited to share this wonderful news with you!',
      'Thank you for being part of our amazing community.',
      'Let\'s work together to make a positive difference!',
    ],
  },
};

// ==================== UTILITY TYPES ====================

export interface TextProcessingResult {
  tokens: string[];
  sentences: string[];
  paragraphs: string[];
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
}

export interface VocabularyAnalysis {
  uniqueWords: number;
  wordFrequency: Record<string, number>;
  complexWordCount: number;
  simpleWordCount: number;
  technicalTermCount: number;
}

export interface SentenceAnalysis {
  lengths: number[];
  structures: string[];
  complexity: number;
  readability: number;
}

// ==================== METADATA TYPES ====================

export interface ContentMetadata {
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  characterCount: number;
  readingTime: number;
  keywordAnalysis: KeywordAnalysis;
  readingLevelAnalysis: ReadingLevelAnalysis;
  pacingAnalysis: PacingAnalysis;
  structure: ContentStructure;
  vocabularyAnalysis: VocabularyAnalysis;
  sentenceAnalysis: SentenceAnalysis;
  extractedAt: Date;
}

export interface KeywordAnalysis {
  keywords: string[];
  keywordDensity: Record<string, number>;
  keywordProminence: Record<string, number>;
  totalKeywords: number;
  uniqueKeywords: number;
}

export interface ReadingLevelAnalysis {
  readingLevel: 'basic' | 'intermediate' | 'advanced';
  fleschKincaidGradeLevel: number;
  fleschReadingEase: number;
  levelCategory: 'basic' | 'intermediate' | 'advanced';
  complexityScore: number;
  avgSentenceLength: number;
  avgSyllablesPerWord: number;
}

export interface PacingAnalysis {
  pacingScore: number;
  pacingCategory: 'slow' | 'moderate' | 'fast';
  avgSentenceLength: number;
  sentenceLengthStdDev: number;
  sentenceLengths: number[];
  pacingPatterns: string[];
  totalSentences: number;
  shortSentences: number;
  mediumSentences: number;
  longSentences: number;
}

export interface ContentStructure {
  paragraphs: number;
  avgParagraphLength: number;
  paragraphLengths: number[];
  headings: number;
  headingCandidates: string[];
  structureScore: number;
  hasIntroduction: boolean;
  hasConclusion: boolean;
  logicalFlow: number;
}

// ==================== EXPORTS ====================

export type {
  BrandType,
  BrandProfile,
  ToneGuidelines,
  ToneAnalysis,
  ToneSuggestion,
  ContentAnalysis,
  BrandConsistencyScore,
  ToneDeviation,
  BrandLearningData,
  BrandToneConfig,
  ToneAnalysisMetadata,
  SocialPlatform,
};

export { DEFAULT_BRAND_TONE_CONFIG };