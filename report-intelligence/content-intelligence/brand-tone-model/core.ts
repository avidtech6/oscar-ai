/**
 * Brand Tone Model Core
 * 
 * Core implementation of the BrandToneModel class with profile management
 */

import { ContentCopilot } from '../ai/ContentCopilot';
import {
  BrandToneProfile,
  BrandToneConfig,
  DEFAULT_BRAND_TONE_CONFIG,
  BrandType,
  TonePreset,
  DEFAULT_TONE_PRESETS,
} from './types';

import {
  normaliseText,
  tokenise,
  extractSentences,
  processText,
} from './utils';

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

  /**
   * Create a custom brand profile from a tone preset
   */
  createProfileFromPreset(
    id: string,
    name: string,
    brandType: BrandType,
    presetId: string,
    customKeywords: string[] = [],
    customProhibitedTerms: string[] = [],
    customPreferredPhrases: string[] = []
  ): BrandToneProfile {
    const preset = DEFAULT_TONE_PRESETS[presetId];
    if (!preset) {
      throw new Error(`Tone preset not found: ${presetId}`);
    }

    return {
      id,
      name,
      brandType,
      toneGuidelines: preset.toneGuidelines,
      vocabularyLevel: preset.vocabularyLevel,
      sentenceLength: preset.sentenceLength,
      formality: preset.formality,
      emotion: preset.emotion,
      pacing: preset.pacing,
      keywords: [...preset.keywords || [], ...customKeywords],
      prohibitedTerms: customProhibitedTerms,
      preferredPhrases: [...preset.preferredPhrases || [], ...customPreferredPhrases],
      exampleContent: preset.exampleContent,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        sampleCount: 0,
        consistencyScore: 0,
      },
    };
  }

  /**
   * Update brand profile metadata
   */
  updateProfileMetadata(id: string, updates: Partial<BrandToneProfile['metadata']>): void {
    const profile = this.getBrandProfile(id);
    if (!profile) {
      throw new Error(`Brand profile not found: ${id}`);
    }

    profile.metadata = {
      ...profile.metadata,
      ...updates,
      updatedAt: new Date(),
    };
  }

  /**
   * Remove a brand profile
   */
  removeBrandProfile(id: string): boolean {
    const initialLength = this.profiles.length;
    this.profiles = this.profiles.filter(profile => profile.id !== id);
    return this.profiles.length < initialLength;
  }

  /**
   * Validate a brand profile
   */
  validateBrandProfile(profile: BrandToneProfile): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields validation
    if (!profile.id || profile.id.trim().length === 0) {
      errors.push('Profile ID is required');
    }

    if (!profile.name || profile.name.trim().length === 0) {
      errors.push('Profile name is required');
    }

    if (!profile.brandType) {
      errors.push('Brand type is required');
    }

    if (!profile.toneGuidelines) {
      errors.push('Tone guidelines are required');
    }

    if (!profile.keywords || profile.keywords.length === 0) {
      errors.push('At least one keyword is required');
    }

    if (!profile.exampleContent || profile.exampleContent.length === 0) {
      errors.push('At least one example content is required');
    }

    // Tone guidelines validation
    const guidelines = profile.toneGuidelines;
    if (!['casual', 'neutral', 'formal'].includes(guidelines.formality)) {
      errors.push('Formality must be one of: casual, neutral, formal');
    }

    if (!['first', 'second', 'third'].includes(guidelines.pointOfView)) {
      errors.push('Point of view must be one of: first, second, third');
    }

    if (!['short', 'medium', 'long'].includes(guidelines.sentenceLength)) {
      errors.push('Sentence length must be one of: short, medium, long');
    }

    if (!['basic', 'intermediate', 'advanced'].includes(guidelines.vocabularyLevel)) {
      errors.push('Vocabulary level must be one of: basic, intermediate, advanced');
    }

    // Consistency validation
    if (profile.vocabularyLevel !== guidelines.vocabularyLevel) {
      errors.push('Vocabulary level must match tone guidelines vocabulary level');
    }

    if (profile.sentenceLength !== guidelines.sentenceLength) {
      errors.push('Sentence length must match tone guidelines sentence length');
    }

    if (profile.formality !== guidelines.formality) {
      errors.push('Formality must match tone guidelines formality');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get tone presets
   */
  getTonePresets(): Record<string, TonePreset> {
    return { ...DEFAULT_TONE_PRESETS };
  }

  /**
   * Get tone preset by ID
   */
  getTonePreset(presetId: string): TonePreset | undefined {
    return DEFAULT_TONE_PRESETS[presetId];
  }

  /**
   * Get configuration
   */
  getConfig(): BrandToneConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<BrandToneConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get ContentCopilot instance
   */
  getCopilot(): ContentCopilot {
    return this.copilot;
  }

  /**
   * Get profile statistics
   */
  getProfileStatistics(): {
    totalProfiles: number;
    byBrandType: Record<BrandType, number>;
    averageConsistencyScore: number;
    totalSampleCount: number;
  } {
    const byBrandType: Record<BrandType, number> = {
      'cedarwood': 0,
      'tree-academy': 0,
      'oscar-ai': 0,
    };

    let totalConsistencyScore = 0;
    let totalSampleCount = 0;

    for (const profile of this.profiles) {
      byBrandType[profile.brandType] = (byBrandType[profile.brandType] || 0) + 1;
      totalConsistencyScore += profile.metadata.consistencyScore;
      totalSampleCount += profile.metadata.sampleCount;
    }

    const averageConsistencyScore = this.profiles.length > 0 
      ? totalConsistencyScore / this.profiles.length 
      : 0;

    return {
      totalProfiles: this.profiles.length,
      byBrandType,
      averageConsistencyScore,
      totalSampleCount,
    };
  }
}