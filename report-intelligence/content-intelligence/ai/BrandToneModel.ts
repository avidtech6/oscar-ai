/**
 * Brand Tone Model
 * 
 * Advanced brand voice and tone analysis system that:
 * - Analyzes content for brand consistency
 * - Provides tone suggestions based on brand guidelines
 * - Detects tone deviations and suggests corrections
 * - Learns from brand-approved content
 * - Integrates with ContentCopilot for AI-assisted tone adjustments
 * - Supports multiple brands (Cedarwood, Tree Academy, Oscar AI)
 * - Provides real-time tone feedback during content creation
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

import { ContentCopilot } from './ContentCopilot';

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

export class BrandToneModel {
  private profiles: BrandToneProfile[] = [];
  private copilot: ContentCopilot;
  private config: BrandToneConfig;

  constructor(copilot: ContentCopilot, config: Partial<BrandToneConfig> = {}) {
    this.copilot = copilot;
    this.config = { ...DEFAULT_BRAND_TONE_CONFIG, ...config };
    this.loadDefaultBrandProfiles();
  }

  // ==================== CORE METHODS ====================

  /**
   * Load default brand profiles
   */
  loadDefaultBrandProfiles(): void {
    // Cedarwood brand profile
    this.registerBrandProfile({
      id: 'cedarwood',
      name: 'Cedarwood Tree Consultants',
      brandType: 'cedarwood',
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
        'quality', 'precision', 'safety', 'compliance', 'standards',
        'assessment', 'inspection', 'maintenance', 'arboriculture'
      ],
      prohibitedTerms: [
        'cheap', 'quick fix', 'hack', 'diy', 'amateur',
        'guess', 'maybe', 'probably', 'sort of', 'kind of',
        'just', 'simply', 'easily', 'no problem'
      ],
      preferredPhrases: [
        'professional assessment', 'expert analysis', 'industry standards',
        'best practices', 'comprehensive solution', 'long-term benefits',
        'thorough inspection', 'detailed report', 'qualified arborist'
      ],
      exampleContent: [
        'Cedarwood Tree Consultants provides professional arboricultural services with a focus on safety and compliance.',
        'Our expert team conducts thorough assessments to ensure optimal tree health and structural integrity.',
        'We adhere to industry standards and best practices for all tree care operations.'
      ],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        sampleCount: 0,
        consistencyScore: 0,
      },
    });

    // Tree Academy brand profile
    this.registerBrandProfile({
      id: 'tree-academy',
      name: 'Tree Academy',
      brandType: 'tree-academy',
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
        'simple', 'clear', 'friendly', 'community', 'growth',
        'education', 'knowledge', 'nature', 'environment'
      ],
      prohibitedTerms: [
        'complicated', 'difficult', 'hard', 'boring', 'tedious',
        'must', 'should', 'required', 'mandatory', 'obligation',
        'academic', 'theoretical', 'complex'
      ],
      preferredPhrases: [
        'let\'s learn together', 'discover the wonders', 'join our community',
        'fun facts about', 'easy to understand', 'hands-on learning',
        'grow your knowledge', 'nature exploration', 'tree education'
      ],
      exampleContent: [
        'Welcome to Tree Academy! Let\'s explore the amazing world of trees together.',
        'Did you know that trees communicate through underground fungal networks?',
        'Join our community of tree enthusiasts and grow your knowledge with us!'
      ],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        sampleCount: 0,
        consistencyScore: 0,
      },
    });

    // Oscar AI brand profile
    this.registerBrandProfile({
      id: 'oscar-ai',
      name: 'Oscar AI',
      brandType: 'oscar-ai',
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
        'algorithm', 'architecture', 'implementation', 'optimization', 'integration',
        'machine learning', 'artificial intelligence', 'automation', 'analytics'
      ],
      prohibitedTerms: [
        'simple', 'basic', 'easy', 'magic', 'black box',
        'just works', 'no coding required', 'automagically',
        'dumb', 'stupid', 'primitive'
      ],
      preferredPhrases: [
        'advanced algorithms', 'scalable architecture', 'intelligent solutions',
        'optimized performance', 'seamless integration', 'innovative approach',
        'data-driven insights', 'automated workflows', 'enterprise-grade'
      ],
      exampleContent: [
        'Oscar AI leverages advanced machine learning algorithms to solve complex problems.',
        'Our platform features scalable architecture designed for enterprise-grade performance.',
        'We provide intelligent solutions that optimize workflows and enhance productivity.'
      ],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        sampleCount: 0,
        consistencyScore: 0,
      },
    });
  }

  /**
   * Register a new brand profile
   */
  registerBrandProfile(profile: BrandToneProfile): void {
    const existingIndex = this.profiles.findIndex(p => p.id === profile.id);
    if (existingIndex >= 0) {
      this.profiles[existingIndex] = profile;
    } else {
      this.profiles.push(profile);
    }
  }

  /**
   * Get brand profile by ID
   */
  getBrandProfile(id: string): BrandToneProfile | undefined {
    return this.profiles.find(profile => profile.id === id);
  }

  /**
   * Get brand profile by brand type
   */
  getBrandProfileByType(brandType: BrandType): BrandToneProfile | undefined {
    return this.profiles.find(profile => profile.brandType === brandType);
  }

  /**
   * List all brand profiles
   */
  listBrandProfiles(): BrandToneProfile[] {
    return [...this.profiles];
  }

  // ==================== ANALYSIS METHODS ====================

  /**
   * Analyze content for brand tone consistency
   */
  analyzeTone(content: string, brandId: string): ToneAnalysis {
    const profile = this.getBrandProfile(brandId);
    if (!profile) {
      throw new Error(`Brand profile not found: ${brandId}`);
    }

    const features = this.extractToneFeatures(content);
    const score = this.calculateToneScore(features, profile);
    const deviations = this.detectToneDeviations(features, profile);
    const suggestions = this.generateToneSuggestions(content, features, profile, deviations);

    const metadata: ToneAnalysisMetadata = {
      analyzedAt: new Date(),
      contentLength: content.length,
      wordCount: features.wordCount,
      sentenceCount: features.sentenceCount,
    };

    return {
      brand: profile.brandType,
      consistencyScore: score.overall,
      formalityScore: score.formality,
      sentenceLengthScore: score.sentenceStructure,
      vocabularyScore: score.vocabulary,
      keywordAlignment: score.keywordAlignment,
      deviations,
      suggestions,
      metadata,
    };
  }

  /**
   * Extract tone features from content
   */
  extractToneFeatures(content: string): ToneFeatures {
    const normalised = this.normaliseText(content);
    const tokens = this.tokenise(normalised);
    const sentences = this.extractSentences(normalised);

    const wordCount = tokens.length;
    const sentenceCount = sentences.length;
    const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    const avgWordLength = tokens.reduce((sum, token) => sum + token.length, 0) / wordCount || 0;

    const formalityScore = this.calculateFormalityScore(tokens);
    const vocabularyScore = this.calculateVocabularyScore(tokens);
    const emotionScore = this.calculateEmotionScore(tokens);
    const pacingScore = this.calculatePacingScore(sentences);
    const readingLevel = this.determineReadingLevel(tokens, sentences);

    return {
      wordCount,
      sentenceCount,
      avgSentenceLength,
      avgWordLength,
      formalityScore,
      vocabularyScore,
      emotionScore,
      pacingScore,
      keywordMatches: 0, // Will be calculated in context
      prohibitedMatches: 0, // Will be calculated in context
      readingLevel,
    };
  }

  /**
   * Calculate tone score based on features and profile
   */
  calculateToneScore(features: ToneFeatures, profile: BrandToneProfile): BrandConsistencyScore {
    // Calculate formality match
    const formalityScore = this.calculateFormalityMatch(features.formalityScore, profile.formality);
    
    // Calculate vocabulary match
    const vocabularyScore = this.calculateVocabularyMatch(features.vocabularyScore, profile.vocabularyLevel);
    
    // Calculate sentence structure match
    const sentenceStructureScore = this.calculateSentenceStructureMatch(features.avgSentenceLength, profile.sentenceLength);
    
    // Calculate emotion match
    const toneScore = this.calculateEmotionMatch(features.emotionScore, profile.emotion);
    
    // Calculate pacing match
    const pacingScore = this.calculatePacingMatch(features.pacingScore, profile.pacing);

    // Calculate overall score (weighted average)
    const overall = (
      formalityScore * 0.25 +
      vocabularyScore * 0.20 +
      sentenceStructureScore * 0.20 +
      toneScore * 0.15 +
      pacingScore * 0.20
    );

    return {
      overall,
      formality: formalityScore,
      vocabulary: vocabularyScore,
      sentenceStructure: sentenceStructureScore,
      keywordAlignment: 0, // Will be calculated separately
      tone: toneScore,
      brandGuidelines: pacingScore,
    };
  }

  // ==================== TRANSFORMATION METHODS ====================

  /**
   * Apply brand tone to content
   */
  applyToneToContent(content: string, brandId: string): ToneTransformation {
    const profile = this.getBrandProfile(brandId);
    if (!profile) {
      throw new Error(`Brand profile not found: ${brandId}`);
    }

    const sentences = this.extractSentences(content);
    const transformedSentences: string[] = [];
    const changes: Array<{
      type: 'vocabulary' | 'sentence-structure' | 'formality' | 'emotion' | 'pacing';
      original: string;
      replacement: string;
      reason: string;
    }> = [];

    for (const sentence of sentences) {
      let transformed = sentence;
      
      // Adjust vocabulary
      transformed = this.adjustVocabulary(transformed, profile);
      if (transformed !== sentence) {
        changes.push({
          type: 'vocabulary',
          original: sentence,
          replacement: transformed,
          reason: 'Adjusted vocabulary to match brand level',
        });
      }

      // Adjust sentence structure
      const structureAdjusted = this.adjustSentenceStructure(transformed, profile);
      if (structureAdjusted !== transformed) {
        changes.push({
          type: 'sentence-structure',
          original: transformed,
          replacement: structureAdjusted,
          reason: 'Adjusted sentence structure for brand pacing',
        });
        transformed = structureAdjusted;
      }

      // Adjust formality
      const formalityAdjusted = this.adjustFormality(transformed, profile);
      if (formalityAdjusted !== transformed) {
        changes.push({
          type: 'formality',
          original: transformed,
          replacement: formalityAdjusted,
          reason: 'Adjusted formality level',
        });
        transformed = formalityAdjusted;
      }

      // Adjust emotion
      const emotionAdjusted = this.adjustEmotion(transformed, profile);
      if (emotionAdjusted !== transformed) {
        changes.push({
          type: 'emotion',
          original: transformed,
          replacement: emotionAdjusted,
          reason: 'Adjusted emotional tone',
        });
        transformed = emotionAdjusted;
      }

      transformedSentences.push(transformed);
    }

    const transformedContent = transformedSentences.join(' ');
    const confidence = this.calculateTransformationConfidence(content, transformedContent, profile);

    return {
      original: content,
      transformed: transformedContent,
      changes,
      confidence,
    };
  }

  /**
   * Adjust sentence structure for brand pacing
   */
  adjustSentenceStructure(sentence: string, profile: BrandToneProfile): string {
    const tokens = this.tokenise(sentence);
    
    if (profile.sentenceLength === 'short' && tokens.length > 15) {
      // Split long sentences for short-sentence brands
      const midpoint = Math.floor(tokens.length / 2);
      const firstHalf = tokens.slice(0, midpoint).join(' ');
      const secondHalf = tokens.slice(midpoint).join(' ');
      return `${firstHalf}. ${secondHalf.charAt(0).toUpperCase()}${secondHalf.slice(1)}.`;
    } else if (profile.sentenceLength === 'long' && tokens.length < 8) {
      // Combine short sentences for long-sentence brands
      return sentence;
    }
    
    return sentence;
  }

  /**
   * Adjust vocabulary level
   */
  adjustVocabulary(sentence: string, profile: BrandToneProfile): string {
    const vocabularyMap: Record<string, Record<string, string>> = {
      'basic': {
        'utilize': 'use',
        'facilitate': 'help',
        'implement': 'put in place',
        'optimize': 'make better',
        'leverage': 'use',
      },
      'advanced': {
        'use': 'utilize',
        'help': 'facilitate',
        'put in place': 'implement',
        'make better': 'optimize',
        'simple': 'straightforward',
      },
    };

    let adjusted = sentence;
    const targetLevel = profile.vocabularyLevel;
    
    if (targetLevel === 'basic') {
      for (const [complex, simple] of Object.entries(vocabularyMap.basic)) {
        adjusted = adjusted.replace(new RegExp(`\\b${complex}\\b`, 'gi'), simple);
      }
    } else if (targetLevel === 'advanced') {
      for (const [simple, complex] of Object.entries(vocabularyMap.advanced)) {
        adjusted = adjusted.replace(new RegExp(`\\b${simple}\\b`, 'gi'), complex);
      }
    }

    return adjusted;
  }

  /**
   * Adjust formality level
   */
  adjustFormality(sentence: string, profile: BrandToneProfile): string {
    const formalityMap: Record<string, Record<string, string>> = {
      'formal': {
        "can't": 'cannot',
        "won't": 'will not',
        "don't": 'do not',
        "it's": 'it is',
        "that's": 'that is',
        'get': 'obtain',
        'buy': 'purchase',
        'help': 'assist',
        'start': 'commence',
      },
      'casual': {
        'cannot': "can't",
        'will not': "won't",
        'do not': "don't",
        'it is': "it's",
        'that is': "that's
