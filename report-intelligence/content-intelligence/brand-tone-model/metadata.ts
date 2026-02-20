/**
 * Brand Tone Model Metadata
 * 
 * Metadata extraction and analysis
 */

import {
  ContentMetadata,
  KeywordAnalysis,
  ReadingLevelAnalysis,
  PacingAnalysis,
  ContentStructure,
} from './types';

import {
  tokenise,
  extractSentences,
  calculateFormalityScore,
  calculateVocabularyScore,
  calculateEmotionScore,
  calculatePacingScore,
  determineReadingLevel,
  extractKeywords,
  analyzeVocabulary,
  analyzeSentences,
  processText,
} from './utils';

export class BrandToneMetadataExtractor {
  /**
   * Extract comprehensive metadata from content
   */
  extractMetadata(content: string): ContentMetadata {
    const processed = processText(content);
    const vocabularyAnalysis = analyzeVocabulary(processed.tokens);
    const sentenceAnalysis = analyzeSentences(processed.sentences);
    const keywordAnalysis = this.extractKeywordAnalysis(content);
    const readingLevelAnalysis = this.extractReadingLevelAnalysis(content);
    const pacingAnalysis = this.extractPacingAnalysis(content);
    const structure = this.extractContentStructure(content);

    return {
      wordCount: processed.wordCount,
      sentenceCount: processed.sentenceCount,
      paragraphCount: this.countParagraphs(content),
      characterCount: content.length,
      readingTime: this.calculateReadingTime(processed.wordCount),
      keywordAnalysis,
      readingLevelAnalysis,
      pacingAnalysis,
      structure,
      vocabularyAnalysis,
      sentenceAnalysis,
      extractedAt: new Date(),
    };
  }

  /**
   * Extract keyword analysis
   */
  extractKeywordAnalysis(content: string): KeywordAnalysis {
    const keywords = extractKeywords(content, 20);
    const processed = processText(content);
    
    // Calculate keyword density
    const keywordDensity: Record<string, number> = {};
    const contentLower = content.toLowerCase();
    
    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();
      const regex = new RegExp(`\\b${keywordLower}\\b`, 'gi');
      const matches = (contentLower.match(regex) || []).length;
      const density = processed.wordCount > 0 ? (matches / processed.wordCount) * 100 : 0;
      keywordDensity[keyword] = density;
    }

    // Calculate keyword prominence (position-based)
    const keywordProminence: Record<string, number> = {};
    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();
      const firstIndex = contentLower.indexOf(keywordLower);
      const prominence = firstIndex >= 0 ? Math.max(0, 1 - (firstIndex / content.length)) : 0;
      keywordProminence[keyword] = prominence;
    }

    return {
      keywords,
      keywordDensity,
      keywordProminence,
      totalKeywords: keywords.length,
      uniqueKeywords: new Set(keywords.map(k => k.toLowerCase())).size,
    };
  }

  /**
   * Extract reading level analysis
   */
  extractReadingLevelAnalysis(content: string): ReadingLevelAnalysis {
    const processed = processText(content);
    const readingLevel = determineReadingLevel(processed.tokens, processed.sentences);
    
    // Calculate Flesch-Kincaid Grade Level approximation
    const avgSentenceLength = processed.sentenceCount > 0 ? processed.wordCount / processed.sentenceCount : 0;
    const avgSyllablesPerWord = this.calculateAverageSyllables(processed.tokens);
    
    const fleschKincaid = 0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59;
    const fleschReadingEase = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;
    
    // Determine reading level category
    let levelCategory: 'basic' | 'intermediate' | 'advanced';
    if (fleschReadingEase >= 60) {
      levelCategory = 'basic';
    } else if (fleschReadingEase >= 30) {
      levelCategory = 'intermediate';
    } else {
      levelCategory = 'advanced';
    }

    // Calculate complexity score (0-1)
    const complexityScore = Math.min(1, fleschKincaid / 20);

    return {
      readingLevel,
      fleschKincaidGradeLevel: Math.max(0, Math.min(20, fleschKincaid)),
      fleschReadingEase: Math.max(0, Math.min(100, fleschReadingEase)),
      levelCategory,
      complexityScore,
      avgSentenceLength,
      avgSyllablesPerWord,
    };
  }

  /**
   * Extract pacing analysis
   */
  extractPacingAnalysis(content: string): PacingAnalysis {
    const sentences = extractSentences(content);
    const pacingScore = calculatePacingScore(sentences);
    
    // Calculate sentence length distribution
    const sentenceLengths = sentences.map(s => tokenise(s).length);
    const avgSentenceLength = sentenceLengths.reduce((sum, len) => sum + len, 0) / sentences.length || 0;
    
    // Calculate sentence length variance
    const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgSentenceLength, 2), 0) / sentences.length || 0;
    const stdDev = Math.sqrt(variance);
    
    // Calculate pacing patterns
    const pacingPatterns = this.analyzePacingPatterns(sentences);
    
    // Determine pacing category
    let pacingCategory: 'slow' | 'moderate' | 'fast';
    if (pacingScore < 0.4) {
      pacingCategory = 'slow';
    } else if (pacingScore < 0.7) {
      pacingCategory = 'moderate';
    } else {
      pacingCategory = 'fast';
    }

    return {
      pacingScore,
      pacingCategory,
      avgSentenceLength,
      sentenceLengthStdDev: stdDev,
      sentenceLengths,
      pacingPatterns,
      totalSentences: sentences.length,
      shortSentences: sentenceLengths.filter(len => len < 10).length,
      mediumSentences: sentenceLengths.filter(len => len >= 10 && len <= 20).length,
      longSentences: sentenceLengths.filter(len => len > 20).length,
    };
  }

  /**
   * Extract content structure
   */
  extractContentStructure(content: string): ContentStructure {
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const sentences = extractSentences(content);
    
    // Calculate paragraph statistics
    const paragraphLengths = paragraphs.map(p => tokenise(p).length);
    const avgParagraphLength = paragraphLengths.reduce((sum, len) => sum + len, 0) / paragraphs.length || 0;
    
    // Identify headings (lines that start with # or are short and followed by blank line)
    const headingCandidates = content.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && 
             (trimmed.startsWith('#') || 
              (trimmed.length < 60 && /^[A-Z][^.!?]*$/.test(trimmed)));
    });
    
    // Calculate structure score (0-1)
    const structureScore = this.calculateStructureScore(paragraphs, sentences);

    return {
      paragraphs: paragraphs.length,
      avgParagraphLength,
      paragraphLengths,
      headings: headingCandidates.length,
      headingCandidates,
      structureScore,
      hasIntroduction: this.hasIntroduction(paragraphs),
      hasConclusion: this.hasConclusion(paragraphs),
      logicalFlow: this.assessLogicalFlow(paragraphs),
    };
  }

  /**
   * Calculate average syllables per word
   */
  private calculateAverageSyllables(tokens: string[]): number {
    if (tokens.length === 0) return 0;
    
    let totalSyllables = 0;
    for (const token of tokens) {
      totalSyllables += this.countSyllables(token);
    }
    
    return totalSyllables / tokens.length;
  }

  /**
   * Count syllables in a word (approximation)
   */
  private countSyllables(word: string): number {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;
    
    // Simple syllable counting algorithm
    const vowels = 'aeiouy';
    let count = 0;
    let prevCharWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const isVowel = vowels.includes(char);
      
      if (isVowel && !prevCharWasVowel) {
        count++;
      }
      prevCharWasVowel = isVowel;
    }
    
    // Adjust for silent e
    if (word.endsWith('e') && count > 1) {
      count--;
    }
    
    // Adjust for le ending
    if (word.endsWith('le') && word.length > 2 && !vowels.includes(word[word.length - 3])) {
      count++;
    }
    
    return Math.max(1, count);
  }

  /**
   * Analyze pacing patterns
   */
  private analyzePacingPatterns(sentences: string[]): string[] {
    const patterns: string[] = [];
    const sentenceLengths = sentences.map(s => tokenise(s).length);
    
    // Check for consistent pacing
    const avgLength = sentenceLengths.reduce((sum, len) => sum + len, 0) / sentenceLengths.length;
    const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length;
    
    if (variance < 10) {
      patterns.push('consistent-pacing');
    } else if (variance > 50) {
      patterns.push('varied-pacing');
    }
    
    // Check for rhythmic patterns
    if (sentenceLengths.length >= 3) {
      const hasRhythm = this.detectRhythmicPattern(sentenceLengths);
      if (hasRhythm) {
        patterns.push('rhythmic-pattern');
      }
    }
    
    // Check for acceleration/deceleration
    const trend = this.detectPacingTrend(sentenceLengths);
    if (trend === 'accelerating') {
      patterns.push('accelerating-pace');
    } else if (trend === 'decelerating') {
      patterns.push('decelerating-pace');
    }
    
    return patterns;
  }

  /**
   * Detect rhythmic pattern in sentence lengths
   */
  private detectRhythmicPattern(lengths: number[]): boolean {
    if (lengths.length < 3) return false;
    
    // Simple check for alternating pattern
    let alternating = true;
    for (let i = 2; i < lengths.length; i++) {
      if (Math.abs(lengths[i] - lengths[i - 2]) > 5) {
        alternating = false;
        break;
      }
    }
    
    return alternating;
  }

  /**
   * Detect pacing trend
   */
  private detectPacingTrend(lengths: number[]): 'accelerating' | 'decelerating' | 'stable' {
    if (lengths.length < 3) return 'stable';
    
    // Calculate linear regression slope
    const n = lengths.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += lengths[i];
      sumXY += i * lengths[i];
      sumX2 += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    if (slope > 0.5) {
      return 'accelerating'; // Sentence lengths increasing
    } else if (slope < -0.5) {
      return 'decelerating'; // Sentence lengths decreasing
    } else {
      return 'stable';
    }
  }

  /**
   * Calculate structure score
   */
  private calculateStructureScore(paragraphs: string[], sentences: string[]): number {
    if (paragraphs.length === 0 || sentences.length === 0) {
      return 0.5;
    }
    
    let score = 0;
    
    // Paragraph count score
    const idealParagraphCount = Math.max(3, Math.min(10, sentences.length / 3));
    const paragraphCountScore = 1 - Math.min(1, Math.abs(paragraphs.length - idealParagraphCount) / idealParagraphCount);
    score += paragraphCountScore * 0.3;
    
    // Paragraph length consistency score
    const paragraphLengths = paragraphs.map(p => tokenise(p).length);
    const avgParagraphLength = paragraphLengths.reduce((sum, len) => sum + len, 0) / paragraphs.length;
    const paragraphVariance = paragraphLengths.reduce((sum, len) => sum + Math.pow(len - avgParagraphLength, 2), 0) / paragraphs.length;
    const consistencyScore = Math.max(0, 1 - (paragraphVariance / (avgParagraphLength * 2)));
    score += consistencyScore * 0.2;
    
    // Introduction/conclusion score
    const hasIntro = this.hasIntroduction(paragraphs) ? 1 : 0;
    const hasConclusion = this.hasConclusion(paragraphs) ? 1 : 0;
    score += (hasIntro + hasConclusion) * 0.25;
    
    // Logical flow score
    const flowScore = this.assessLogicalFlow(paragraphs);
    score += flowScore * 0.25;
    
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Check if content has introduction
   */
  private hasIntroduction(paragraphs: string[]): boolean {
    if (paragraphs.length === 0) return false;
    
    const firstParagraph = paragraphs[0].toLowerCase();
    const introKeywords = [
      'introduction', 'overview', 'summary', 'in this', 'this document',
      'purpose', 'objective', 'goal', 'aim', 'background'
    ];
    
    return introKeywords.some(keyword => firstParagraph.includes(keyword));
  }

  /**
   * Check if content has conclusion
   */
  private hasConclusion(paragraphs: string[]): boolean {
    if (paragraphs.length === 0) return false;
    
    const lastParagraph = paragraphs[paragraphs.length - 1].toLowerCase();
    const conclusionKeywords = [
      'conclusion', 'summary', 'in summary', 'to conclude',
      'finally', 'in conclusion', 'overall', 'key takeaways',
      'recommendation', 'next steps'
    ];
    
    return conclusionKeywords.some(keyword => lastParagraph.includes(keyword));
  }

  /**
   * Assess logical flow
   */
  private assessLogicalFlow(paragraphs: string[]): number {
    if (paragraphs.length < 2) return 0.5;
    
    // Simple transition word analysis
    const transitionWords = [
      'however', 'therefore', 'consequently', 'furthermore',
      'moreover', 'nevertheless', 'similarly', 'likewise',
      'in addition', 'on the other hand', 'for example',
      'specifically', 'in particular', 'as a result'
    ];
    
    let transitionCount = 0;
    for (const paragraph of paragraphs) {
      const paragraphLower = paragraph.toLowerCase();
      for (const word of transitionWords) {
        if (paragraphLower.includes(word)) {
          transitionCount++;
          break; // Count each paragraph only once
        }
      }
    }
    
    const transitionScore = Math.min(1, transitionCount / paragraphs.length);
    
    // Topic consistency (simple check)
    const firstParagraphWords = new Set(tokenise(paragraphs[0]).map(w => w.toLowerCase()));
    const lastParagraphWords = new Set(tokenise(paragraphs[paragraphs.length - 1]).map(w => w.toLowerCase()));
    
    const intersection = new Set([...firstParagraphWords].filter(x => lastParagraphWords.has(x)));
    const union = new Set([...firstParagraphWords, ...lastParagraphWords]);
    
    const consistencyScore = union.size > 0 ? intersection.size / union.size : 0;
    
    return (transitionScore * 0.6 + consistencyScore * 0.4);
  }

  /**
   * Count paragraphs
   */
  private countParagraphs(content: string): number {
    return content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  }

  /**
   * Calculate reading time in minutes
   */
  private calculateReadingTime(wordCount: number): number {
    const wordsPerMinute = 200; // Average reading speed
    return Math.ceil(wordCount / wordsPerMinute);
  }
}