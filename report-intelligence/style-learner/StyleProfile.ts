/**
 * Report Style Learner - Phase 5
 * StyleProfile Interface
 * 
 * Defines the structure for user writing style profiles, capturing tone,
 * structure, formatting preferences, and report-specific habits.
 */

/**
 * Tone detection results
 */
export interface ToneProfile {
  primaryTone: 'formal' | 'professional' | 'casual' | 'technical' | 'concise' | 'detailed' | 'persuasive' | 'informative';
  secondaryTones: string[];
  confidence: number; // 0-1 confidence score
  characteristics: {
    sentenceLength: 'short' | 'medium' | 'long';
    vocabularyComplexity: 'simple' | 'moderate' | 'complex';
    formalityLevel: 'low' | 'medium' | 'high';
    passiveVoiceUsage: 'low' | 'medium' | 'high';
    firstPersonUsage: 'low' | 'medium' | 'high';
  };
  examples: string[]; // Example sentences demonstrating the tone
}

/**
 * Sentence pattern detected in user's writing
 */
export interface SentencePattern {
  pattern: string; // Regex or descriptive pattern
  frequency: number; // How often this pattern appears (0-1)
  examples: string[]; // Example sentences
  context: 'introduction' | 'conclusion' | 'analysis' | 'recommendation' | 'description' | 'general';
}

/**
 * Paragraph structure pattern
 */
export interface ParagraphPattern {
  structure: 'topic-sentence-first' | 'topic-sentence-last' | 'sandwich' | 'list' | 'narrative' | 'explanatory';
  averageLength: number; // Average sentences per paragraph
  transitionUsage: 'low' | 'medium' | 'high';
  examples: string[]; // Example paragraphs
}

/**
 * Section ordering preference
 */
export interface SectionOrdering {
  reportTypeId: string;
  preferredOrder: string[]; // Array of section IDs in preferred order
  confidence: number;
  variations: Array<{
    context: string;
    order: string[];
    frequency: number;
  }>;
}

/**
 * Preferred phrasing for common concepts
 */
export interface PreferredPhrasing {
  concept: string; // e.g., "recommendation", "finding", "conclusion"
  preferredPhrases: string[]; // User's preferred ways to express this concept
  avoidedPhrases: string[]; // Phrases the user avoids
  context: string; // When this phrasing is used
  confidence: number;
}

/**
 * Formatting preferences
 */
export interface FormattingPreferences {
  headings: {
    style: 'sentence-case' | 'title-case' | 'lower-case' | 'all-caps';
    numbering: 'none' | 'numeric' | 'alphanumeric' | 'roman';
    hierarchy: 'consistent' | 'variable';
  };
  lists: {
    bulletStyle: 'dash' | 'asterisk' | 'circle' | 'square' | 'numbered';
    indentation: number; // Indentation level (0-4)
    spacing: 'tight' | 'normal' | 'loose';
  };
  emphasis: {
    boldUsage: 'low' | 'medium' | 'high';
    italicUsage: 'low' | 'medium' | 'high';
    underlineUsage: 'low' | 'medium' | 'high';
  };
  spacing: {
    lineSpacing: 'single' | '1.5' | 'double';
    paragraphSpacing: 'compact' | 'normal' | 'generous';
    sectionSpacing: 'compact' | 'normal' | 'generous';
  };
}

/**
 * Terminology preferences
 */
export interface TerminologyPreferences {
  preferredTerms: Array<{
    standardTerm: string;
    userTerm: string;
    context: string;
    confidence: number;
  }>;
  avoidedTerms: string[]; // Terms the user avoids
  domainSpecificTerms: string[]; // Terms specific to user's domain
  acronymUsage: 'low' | 'medium' | 'high';
  abbreviationStyle: 'full-first' | 'always-abbreviate' | 'context-dependent';
}

/**
 * Structural preferences
 */
export interface StructuralPreferences {
  sectionTemplates: Array<{
    sectionId: string;
    template: string; // Template pattern
    requiredElements: string[];
    optionalElements: string[];
  }>;
  reportFlow: 'linear' | 'hierarchical' | 'modular' | 'narrative';
  conclusionPlacement: 'end-only' | 'end-of-sections' | 'summary-first';
  recommendationStyle: 'integrated' | 'separate-section' | 'bullet-points';
}

/**
 * Complete style profile for a user
 */
export interface StyleProfile {
  // Core identification
  id: string;
  userId: string;
  reportTypeId?: string; // Nullable for general profiles
  profileName: string;
  description?: string;
  
  // Style components
  tone: ToneProfile;
  sentencePatterns: SentencePattern[];
  paragraphPatterns: ParagraphPattern[];
  sectionOrdering: SectionOrdering[];
  preferredPhrasing: PreferredPhrasing[];
  formattingPreferences: FormattingPreferences;
  terminologyPreferences: TerminologyPreferences;
  structuralPreferences: StructuralPreferences;
  
  // Metadata
  confidence: number; // Overall confidence in this profile (0-1)
  sampleCount: number; // Number of reports used to build this profile
  lastUpdated: Date;
  createdAt: Date;
  
  // Evolution tracking
  version: string; // Semantic version (e.g., "1.2.3")
  previousVersionId?: string;
  evolutionNotes?: string[];
  
  // Usage statistics
  applicationCount: number;
  successRate: number; // How often application was successful (0-1)
  userFeedback?: {
    rating: number; // 1-5
    comments: string[];
    lastFeedbackDate: Date;
  };
}

/**
 * Style application result
 */
export interface StyleApplicationResult {
  success: boolean;
  appliedProfileId: string;
  changes: Array<{
    type: 'tone' | 'phrasing' | 'structure' | 'formatting' | 'terminology';
    description: string;
    before?: string;
    after?: string;
    confidence: number;
  }>;
  warnings: string[];
  errors: string[];
  processingTimeMs: number;
}

/**
 * Helper function to generate a style profile ID
 */
export function generateStyleProfileId(): string {
  return `style_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Helper function to create a new style profile
 */
export function createStyleProfile(
  userId: string,
  reportTypeId?: string
): Omit<StyleProfile, 'id' | 'createdAt' | 'lastUpdated'> {
  const now = new Date();
  
  return {
    userId,
    reportTypeId,
    profileName: reportTypeId ? `Style for ${reportTypeId}` : `General style for user ${userId}`,
    tone: {
      primaryTone: 'professional',
      secondaryTones: [],
      confidence: 0,
      characteristics: {
        sentenceLength: 'medium',
        vocabularyComplexity: 'moderate',
        formalityLevel: 'medium',
        passiveVoiceUsage: 'medium',
        firstPersonUsage: 'medium'
      },
      examples: []
    },
    sentencePatterns: [],
    paragraphPatterns: [],
    sectionOrdering: [],
    preferredPhrasing: [],
    formattingPreferences: {
      headings: {
        style: 'title-case',
        numbering: 'none',
        hierarchy: 'consistent'
      },
      lists: {
        bulletStyle: 'dash',
        indentation: 2,
        spacing: 'normal'
      },
      emphasis: {
        boldUsage: 'medium',
        italicUsage: 'medium',
        underlineUsage: 'low'
      },
      spacing: {
        lineSpacing: 'single',
        paragraphSpacing: 'normal',
        sectionSpacing: 'normal'
      }
    },
    terminologyPreferences: {
      preferredTerms: [],
      avoidedTerms: [],
      domainSpecificTerms: [],
      acronymUsage: 'medium',
      abbreviationStyle: 'context-dependent'
    },
    structuralPreferences: {
      sectionTemplates: [],
      reportFlow: 'linear',
      conclusionPlacement: 'end-only',
      recommendationStyle: 'separate-section'
    },
    confidence: 0,
    sampleCount: 0,
    version: '1.0.0',
    applicationCount: 0,
    successRate: 0
  };
}

/**
 * Validate a style profile
 */
export function validateStyleProfile(profile: StyleProfile): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required fields
  if (!profile.id) errors.push('Missing id');
  if (!profile.userId) errors.push('Missing userId');
  if (!profile.profileName) errors.push('Missing profileName');
  if (!profile.tone) errors.push('Missing tone');
  if (!profile.formattingPreferences) errors.push('Missing formattingPreferences');
  
  // Confidence validation
  if (profile.confidence < 0 || profile.confidence > 1) {
    errors.push(`Confidence must be between 0 and 1, got ${profile.confidence}`);
  }
  
  // Sample count validation
  if (profile.sampleCount < 0) {
    errors.push(`Sample count cannot be negative, got ${profile.sampleCount}`);
  }
  
  // Version validation
  if (!profile.version || !/^\d+\.\d+\.\d+$/.test(profile.version)) {
    warnings.push(`Version format should be semantic (e.g., "1.2.3"), got ${profile.version}`);
  }
  
  // Success rate validation
  if (profile.successRate < 0 || profile.successRate > 1) {
    warnings.push(`Success rate should be between 0 and 1, got ${profile.successRate}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Merge two style profiles (for evolution over time)
 */
export function mergeStyleProfiles(
  oldProfile: StyleProfile,
  newProfile: StyleProfile,
  weight: number = 0.7 // Weight given to new profile (0-1)
): StyleProfile {
  if (oldProfile.userId !== newProfile.userId) {
    throw new Error('Cannot merge profiles for different users');
  }
  
  if (oldProfile.reportTypeId !== newProfile.reportTypeId) {
    throw new Error('Cannot merge profiles for different report types');
  }
  
  const merged = { ...newProfile };
  const oldWeight = 1 - weight;
  
  // Merge confidence (weighted average)
  merged.confidence = (oldProfile.confidence * oldWeight) + (newProfile.confidence * weight);
  
  // Merge sample count (sum)
  merged.sampleCount = oldProfile.sampleCount + newProfile.sampleCount;
  
  // Merge application count (sum)
  merged.applicationCount = oldProfile.applicationCount + newProfile.applicationCount;
  
  // Merge success rate (weighted average)
  const totalApplications = oldProfile.applicationCount + newProfile.applicationCount;
  if (totalApplications > 0) {
    merged.successRate = (
      (oldProfile.successRate * oldProfile.applicationCount) +
      (newProfile.successRate * newProfile.applicationCount)
    ) / totalApplications;
  }
  
  // Update version (increment patch)
  const versionParts = newProfile.version.split('.').map(Number);
  versionParts[2] += 1; // Increment patch version
  merged.version = versionParts.join('.');
  
  // Set previous version ID
  merged.previousVersionId = oldProfile.id;
  
  // Add evolution note
  merged.evolutionNotes = [
    ...(oldProfile.evolutionNotes || []),
    `Merged with profile ${oldProfile.id} at ${new Date().toISOString()}`
  ];
  
  return merged;
}