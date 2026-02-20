/**
 * Brand Tone Model - Main Export
 * 
 * Modular implementation of brand tone analysis and transformation
 */

// Export all types
export * from './types';

// Export core classes
export { BrandToneModel } from './core';
export { BrandToneAnalyzer } from './analysis';
export { BrandToneTransformer } from './transform';
export { BrandToneMetadataExtractor } from './metadata';

// Export utilities
export * from './utils';

// Export default presets
export { DEFAULT_TONE_PRESETS } from './types';

// Re-export from parent types for convenience
export type {
  BrandType,
  BrandProfile,
  ToneGuidelines,
  ToneAnalysis as ParentToneAnalysis,
  ToneSuggestion as ParentToneSuggestion,
  ContentAnalysis as ParentContentAnalysis,
  BrandConsistencyScore as ParentBrandConsistencyScore,
  ToneDeviation as ParentToneDeviation,
  BrandLearningData as ParentBrandLearningData,
  BrandToneConfig as ParentBrandToneConfig,
  ToneAnalysisMetadata as ParentToneAnalysisMetadata,
  SocialPlatform as ParentSocialPlatform,
} from '../types';

export { DEFAULT_BRAND_TONE_CONFIG } from '../types';

/**
 * Main BrandToneModel class that combines all modules
 * This is the primary interface for external usage
 */
export class BrandToneModelSystem {
  private model: import('./core').BrandToneModel;
  private analyzer: import('./analysis').BrandToneAnalyzer;
  private transformer: import('./transform').BrandToneTransformer;
  private metadataExtractor: import('./metadata').BrandToneMetadataExtractor;

  constructor(config?: import('../types').BrandToneConfig) {
    this.model = new (require('./core').BrandToneModel)(config);
    this.analyzer = new (require('./analysis').BrandToneAnalyzer)();
    this.transformer = new (require('./transform').BrandToneTransformer)();
    this.metadataExtractor = new (require('./metadata').BrandToneMetadataExtractor)();
  }

  /**
   * Analyze content for brand tone consistency
   */
  analyzeTone(content: string, profileId: string): import('./types').ToneAnalysis {
    const profile = this.model.getBrandProfile(profileId);
    if (!profile) {
      throw new Error(`Brand profile not found: ${profileId}`);
    }
    return this.analyzer.analyzeTone(content, profile);
  }

  /**
   * Transform content to match brand tone
   */
  transformContent(content: string, profileId: string): import('./types').ToneTransformation {
    const profile = this.model.getBrandProfile(profileId);
    if (!profile) {
      throw new Error(`Brand profile not found: ${profileId}`);
    }
    return this.transformer.applyToneToContent(content, profile);
  }

  /**
   * Extract metadata from content
   */
  extractMetadata(content: string): import('./types').ContentMetadata {
    return this.metadataExtractor.extractMetadata(content);
  }

  /**
   * Get brand tone profile
   */
  getProfile(profileId: string): import('./types').BrandToneProfile {
    const profile = this.model.getBrandProfile(profileId);
    if (!profile) {
      throw new Error(`Brand profile not found: ${profileId}`);
    }
    return profile;
  }

  /**
   * Create or update brand tone profile
   */
  saveProfile(profile: import('./types').BrandToneProfile): void {
    this.model.registerBrandProfile(profile);
  }

  /**
   * Delete brand tone profile
   */
  deleteProfile(profileId: string): void {
    this.model.removeBrandProfile(profileId);
  }

  /**
   * List all profiles
   */
  listProfiles(): import('./types').BrandToneProfile[] {
    return this.model.listBrandProfiles();
  }

  /**
   * Apply tone preset to content
   */
  applyTonePreset(content: string, presetId: string): string {
    return this.transformer.applyTonePreset(content, presetId);
  }

  /**
   * Get default tone presets
   */
  getDefaultPresets(): Record<string, import('./types').TonePreset> {
    return require('./types').DEFAULT_TONE_PRESETS;
  }

  /**
   * Validate content against brand tone
   */
  validateContent(content: string, profileId: string): import('./types').ToneValidationResult {
    const profile = this.model.getBrandProfile(profileId);
    if (!profile) {
      throw new Error(`Brand profile not found: ${profileId}`);
    }
    const analysis = this.analyzer.analyzeTone(content, profile);
    const deviations = this.analyzer.detectToneDeviations(
      this.analyzer.extractToneFeatures(content),
      profile
    );

    const isValid = deviations.length === 0;
    const score = analysis.consistencyScore;

    return {
      isValid,
      errors: isValid ? [] : deviations.map(d => d.message),
      warnings: [],
      suggestions: analysis.suggestions.map(s => s.text),
      score,
      metadata: {
        validatedAt: new Date(),
        profileId,
        contentLength: content.length,
      },
    };
  }

  /**
   * Get detailed analysis report
   */
  getDetailedAnalysis(content: string, profileId: string): {
    analysis: import('./types').ToneAnalysis;
    features: import('./types').ToneFeatures;
    keywordAlignment: number;
    prohibitedViolations: string[];
    readingLevel: string;
  } {
    const profile = this.model.getBrandProfile(profileId);
    if (!profile) {
      throw new Error(`Brand profile not found: ${profileId}`);
    }
    return this.analyzer.getDetailedAnalysis(content, profile);
  }
}

// Default export for convenience
export default BrandToneModelSystem;