/**
 * Brand Tone Model Analysis
 * 
 * Tone analysis, scoring, and deviation detection
 */

import {
  BrandToneProfile,
  ToneFeatures,
  ToneAnalysis,
  ToneSuggestion,
  ToneDeviation,
  BrandConsistencyScore,
  ToneAnalysisMetadata,
} from './types';

import {
  calculateFormalityScore,
  calculateVocabularyScore,
  calculateEmotionScore,
  calculatePacingScore,
  determineReadingLevel,
  extractKeywords,
  processText,
  analyzeVocabulary,
  analyzeSentences,
} from './utils';

export class BrandToneAnalyzer {
  /**
   * Extract tone features from content
   */
  extractToneFeatures(content: string): ToneFeatures {
    const processed = processText(content);
    const vocabularyAnalysis = analyzeVocabulary(processed.tokens);
    const sentenceAnalysis = analyzeSentences(processed.sentences);

    const formalityScore = calculateFormalityScore(processed.tokens);
    const vocabularyScore = calculateVocabularyScore(processed.tokens);
    const emotionScore = calculateEmotionScore(processed.tokens);
    const pacingScore = calculatePacingScore(processed.sentences);
    const readingLevel = determineReadingLevel(processed.tokens, processed.sentences);

    return {
      wordCount: processed.wordCount,
      sentenceCount: processed.sentenceCount,
      avgSentenceLength: processed.sentenceCount > 0 ? processed.wordCount / processed.sentenceCount : 0,
      avgWordLength: processed.tokens.reduce((sum, token) => sum + token.length, 0) / processed.wordCount || 0,
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

    // Calculate keyword alignment (placeholder - will be calculated separately)
    const keywordAlignment = 0.5;

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
      keywordAlignment,
      tone: toneScore,
      brandGuidelines: pacingScore,
    };
  }

  /**
   * Calculate formality match score (0-1)
   */
  private calculateFormalityMatch(formalityScore: number, targetFormality: string): number {
    const targetScores: Record<string, number> = {
      'casual': 0.2,
      'neutral': 0.5,
      'formal': 0.8,
    };

    const targetScore = targetScores[targetFormality] || 0.5;
    const difference = Math.abs(formalityScore - targetScore);
    
    // Score is 1 when difference is 0, decreases as difference increases
    return Math.max(0, 1 - (difference * 2));
  }

  /**
   * Calculate vocabulary match score (0-1)
   */
  private calculateVocabularyMatch(vocabularyScore: number, targetLevel: string): number {
    const targetScores: Record<string, number> = {
      'basic': 0.2,
      'intermediate': 0.5,
      'advanced': 0.8,
    };

    const targetScore = targetScores[targetLevel] || 0.5;
    const difference = Math.abs(vocabularyScore - targetScore);
    
    return Math.max(0, 1 - (difference * 2));
  }

  /**
   * Calculate sentence structure match score (0-1)
   */
  private calculateSentenceStructureMatch(avgSentenceLength: number, targetLength: string): number {
    const targetLengths: Record<string, number> = {
      'short': 10,
      'medium': 20,
      'long': 30,
    };

    const target = targetLengths[targetLength] || 20;
    const difference = Math.abs(avgSentenceLength - target);
    
    // Normalise difference (max difference considered is 20 words)
    const normalisedDifference = Math.min(difference / 20, 1);
    
    return Math.max(0, 1 - normalisedDifference);
  }

  /**
   * Calculate emotion match score (0-1)
   */
  private calculateEmotionMatch(emotionScore: number, targetEmotion: string): number {
    const targetScores: Record<string, number> = {
      'neutral': 0,
      'positive': 0.5,
      'enthusiastic': 0.8,
      'serious': -0.3,
      'humorous': 0.3,
    };

    const targetScore = targetScores[targetEmotion] || 0;
    const difference = Math.abs(emotionScore - targetScore);
    
    // Emotion score ranges from -1 to 1, so max difference is 2
    return Math.max(0, 1 - (difference / 2));
  }

  /**
   * Calculate pacing match score (0-1)
   */
  private calculatePacingMatch(pacingScore: number, targetPacing: string): number {
    const targetScores: Record<string, number> = {
      'slow': 0.2,
      'moderate': 0.5,
      'fast': 0.8,
    };

    const targetScore = targetScores[targetPacing] || 0.5;
    const difference = Math.abs(pacingScore - targetScore);
    
    return Math.max(0, 1 - (difference * 2));
  }

  /**
   * Detect tone deviations
   */
  detectToneDeviations(features: ToneFeatures, profile: BrandToneProfile): ToneDeviation[] {
    const deviations: ToneDeviation[] = [];
    const score = this.calculateToneScore(features, profile);

    // Check formality deviations
    if (score.formality < 0.7) {
      deviations.push({
        type: 'formality',
        severity: score.formality < 0.5 ? 'high' : 'medium',
        message: `Content formality (${features.formalityScore.toFixed(2)}) doesn't match ${profile.formality} brand tone`,
        suggestion: `Adjust tone to be more ${profile.formality}`,
      });
    }

    // Check vocabulary deviations
    if (score.vocabulary < 0.7) {
      deviations.push({
        type: 'vocabulary',
        severity: score.vocabulary < 0.5 ? 'high' : 'medium',
        message: `Vocabulary level (${features.vocabularyScore.toFixed(2)}) doesn't match ${profile.vocabularyLevel} brand level`,
        suggestion: `Use ${profile.vocabularyLevel === 'basic' ? 'simpler' : 'more advanced'} vocabulary`,
      });
    }

    // Check sentence structure deviations
    if (score.sentenceStructure < 0.7) {
      deviations.push({
        type: 'sentence-length',
        severity: score.sentenceStructure < 0.5 ? 'high' : 'medium',
        message: `Average sentence length (${features.avgSentenceLength.toFixed(1)} words) doesn't match ${profile.sentenceLength} brand preference`,
        suggestion: `Use ${profile.sentenceLength === 'short' ? 'shorter' : 'longer'} sentences`,
      });
    }

    // Check emotion deviations
    if (score.tone < 0.6) {
      deviations.push({
        type: 'tone',
        severity: score.tone < 0.4 ? 'high' : 'medium',
        message: `Emotional tone doesn't match ${profile.emotion} brand emotion`,
        suggestion: `Adjust emotional tone to be more ${profile.emotion}`,
      });
    }

    // Check pacing deviations
    if (score.brandGuidelines < 0.7) {
      deviations.push({
        type: 'tone',
        severity: score.brandGuidelines < 0.5 ? 'high' : 'medium',
        message: `Content pacing doesn't match ${profile.pacing} brand pacing`,
        suggestion: `Adjust pacing to be more ${profile.pacing}`,
      });
    }

    return deviations;
  }

  /**
   * Generate tone suggestions
   */
  generateToneSuggestions(
    content: string,
    features: ToneFeatures,
    profile: BrandToneProfile,
    deviations: ToneDeviation[]
  ): ToneSuggestion[] {
    const suggestions: ToneSuggestion[] = [];

    // Add suggestions based on deviations
    for (const deviation of deviations) {
      switch (deviation.type) {
        case 'formality':
          suggestions.push({
            type: 'adjust',
            text: 'Adjust formality level',
            target: 'entire-content',
            reason: deviation.message,
            confidence: 0.8,
            implementation: `Use more ${profile.formality === 'formal' ? 'formal language and avoid contractions' : 'casual language and contractions'}`,
          });
          break;

        case 'vocabulary':
          suggestions.push({
            type: 'replace',
            text: 'Adjust vocabulary level',
            target: 'complex-words',
            reason: deviation.message,
            confidence: 0.7,
            implementation: `Replace ${profile.vocabularyLevel === 'basic' ? 'complex words with simpler alternatives' : 'simple words with more sophisticated alternatives'}`,
          });
          break;

        case 'sentence-length':
          suggestions.push({
            type: 'rewrite',
            text: 'Adjust sentence length',
            target: 'long-sentences',
            reason: deviation.message,
            confidence: 0.6,
            implementation: profile.sentenceLength === 'short' 
              ? 'Split long sentences into shorter ones' 
              : 'Combine short sentences into longer, more complex ones',
          });
          break;

        case 'tone':
          suggestions.push({
            type: 'adjust',
            text: 'Adjust emotional tone',
            target: 'emotional-language',
            reason: deviation.message,
            confidence: 0.5,
            implementation: `Use more ${profile.emotion} language and phrasing`,
          });
          break;
      }
    }

    // Add keyword optimization suggestions
    const extractedKeywords = extractKeywords(content, 10);
    const brandKeywords = profile.keywords || [];
    
    const missingKeywords = brandKeywords.filter(keyword => 
      !extractedKeywords.some(extracted => 
        extracted.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(extracted.toLowerCase())
      )
    );

    if (missingKeywords.length > 0 && missingKeywords.length <= 3) {
      suggestions.push({
        type: 'add',
        text: 'Add brand keywords',
        target: 'content',
        reason: `Missing brand keywords: ${missingKeywords.join(', ')}`,
        confidence: 0.9,
        implementation: `Incorporate the following keywords naturally: ${missingKeywords.join(', ')}`,
      });
    }

    // Add reading level suggestion if needed
    if (features.readingLevel !== profile.vocabularyLevel) {
      suggestions.push({
        type: 'adjust',
        text: 'Adjust reading level',
        target: 'vocabulary',
        reason: `Reading level (${features.readingLevel}) doesn't match brand level (${profile.vocabularyLevel})`,
        confidence: 0.7,
        implementation: `Use ${profile.vocabularyLevel === 'basic' ? 'simpler words and shorter sentences' : 'more sophisticated vocabulary and complex sentence structures'}`,
      });
    }

    return suggestions;
  }

  /**
   * Analyze content for brand tone consistency
   */
  analyzeTone(content: string, profile: BrandToneProfile): ToneAnalysis {
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
   * Calculate keyword alignment score
   */
  calculateKeywordAlignment(content: string, keywords: string[]): number {
    if (!keywords || keywords.length === 0) {
      return 0.5;
    }

    const extractedKeywords = extractKeywords(content, 20);
    const contentLower = content.toLowerCase();
    
    let matches = 0;
    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();
      
      // Check if keyword appears in content
      if (contentLower.includes(keywordLower)) {
        matches++;
      } else {
        // Check if similar keywords appear
        const similar = extractedKeywords.some(extracted => 
          extracted.toLowerCase().includes(keywordLower) ||
          keywordLower.includes(extracted.toLowerCase())
        );
        
        if (similar) {
          matches += 0.5;
        }
      }
    }

    return matches / keywords.length;
  }

  /**
   * Calculate prohibited term violations
   */
  calculateProhibitedViolations(content: string, prohibitedTerms: string[]): string[] {
    if (!prohibitedTerms || prohibitedTerms.length === 0) {
      return [];
    }

    const contentLower = content.toLowerCase();
    const violations: string[] = [];

    for (const term of prohibitedTerms) {
      const termLower = term.toLowerCase();
      
      // Simple substring match
      if (contentLower.includes(termLower)) {
        violations.push(term);
      } else {
        // Check for variations (with spaces, punctuation)
        const variations = [
          termLower,
          ` ${termLower} `,
          ` ${termLower}.`,
          ` ${termLower},`,
          ` ${termLower}!`,
          ` ${termLower}?`,
        ];
        
        if (variations.some(variation => contentLower.includes(variation))) {
          violations.push(term);
        }
      }
    }

    return violations;
  }

  /**
   * Get detailed analysis report
   */
  getDetailedAnalysis(content: string, profile: BrandToneProfile): {
    analysis: ToneAnalysis;
    features: ToneFeatures;
    keywordAlignment: number;
    prohibitedViolations: string[];
    readingLevel: string;
  } {
    const analysis = this.analyzeTone(content, profile);
    const features = this.extractToneFeatures(content);
    const keywordAlignment = this.calculateKeywordAlignment(content, profile.keywords || []);
    const prohibitedViolations = this.calculateProhibitedViolations(content, profile.prohibitedTerms || []);
    const readingLevel = features.readingLevel;

    return {
      analysis,
      features,
      keywordAlignment,
      prohibitedViolations,
      readingLevel,
    };
  }
}