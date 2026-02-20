/**
 * Phase 24: Document Intelligence Layer
 * Auto-Summary Engine
 * 
 * Generates intelligent summaries at both document-level and section-level.
 * Features:
 * - Document-level executive summary
 * - Section-level summaries
 * - Key point extraction
 * - Length-adaptive summarization
 * - Tone-preserving summarization
 * - Multi-level detail control
 */

import type { DocumentSection } from '../types/DocumentAnalysis';
import type { ToneAnalysis } from '../types/DocumentAnalysis';

/**
 * Summary generation options
 */
export interface SummaryOptions {
  /** Target summary length in words */
  targetLength: number;
  /** Detail level */
  detailLevel: 'brief' | 'standard' | 'detailed' | 'comprehensive';
  /** Whether to preserve original tone */
  preserveTone: boolean;
  /** Whether to include key points */
  includeKeyPoints: boolean;
  /** Whether to include statistics */
  includeStatistics: boolean;
  /** Target audience */
  targetAudience: 'general' | 'technical' | 'executive' | 'academic';
  /** Language for summary */
  language: string;
}

/**
 * Generated summary
 */
export interface GeneratedSummary {
  /** Summary text */
  summary: string;
  /** Key points extracted */
  keyPoints: string[];
  /** Statistics about the summary */
  statistics: {
    /** Word count of summary */
    wordCount: number;
    /** Compression ratio (summary/original) */
    compressionRatio: number;
    /** Key point count */
    keyPointCount: number;
    /** Coverage of original content (0-1) */
    coverage: number;
  };
  /** Tone analysis of summary */
  tone: ToneAnalysis;
  /** Sections covered (for section-level summaries) */
  sectionsCovered?: string[];
  /** Confidence in summary quality (0-1) */
  confidence: number;
}

/**
 * Document-level summary result
 */
export interface DocumentSummaryResult {
  /** Executive summary */
  executiveSummary: GeneratedSummary;
  /** Section summaries */
  sectionSummaries: Map<string, GeneratedSummary>;
  /** Overall document summary */
  fullDocumentSummary: GeneratedSummary;
  /** Key themes extracted */
  keyThemes: string[];
  /** Main conclusions */
  mainConclusions: string[];
  /** Recommendations (if applicable) */
  recommendations?: string[];
}

/**
 * Auto-Summary Engine
 * 
 * Generates intelligent summaries for documents and sections
 */
export class AutoSummaryEngine {
  /**
   * Generate document-level summary
   */
  generateDocumentSummary(
    sections: DocumentSection[],
    options: Partial<SummaryOptions> = {}
  ): DocumentSummaryResult {
    const fullOptions: SummaryOptions = {
      targetLength: 250,
      detailLevel: 'standard',
      preserveTone: true,
      includeKeyPoints: true,
      includeStatistics: true,
      targetAudience: 'general',
      language: 'en',
      ...options
    };

    // Extract document content
    const documentContent = this.extractDocumentContent(sections);
    
    // Generate executive summary
    const executiveSummary = this.generateExecutiveSummary(sections, fullOptions);
    
    // Generate section summaries
    const sectionSummaries = this.generateSectionSummaries(sections, fullOptions);
    
    // Generate full document summary
    const fullDocumentSummary = this.generateFullDocumentSummary(sections, fullOptions);
    
    // Extract key themes
    const keyThemes = this.extractKeyThemes(sections);
    
    // Extract main conclusions
    const mainConclusions = this.extractMainConclusions(sections);
    
    // Extract recommendations if applicable
    const recommendations = this.extractRecommendations(sections);
    
    return {
      executiveSummary,
      sectionSummaries,
      fullDocumentSummary,
      keyThemes,
      mainConclusions,
      recommendations
    };
  }
  
  /**
   * Generate section-level summary
   */
  generateSectionSummary(
    section: DocumentSection,
    options: Partial<SummaryOptions> = {}
  ): GeneratedSummary {
    const fullOptions: SummaryOptions = {
      targetLength: 100,
      detailLevel: 'standard',
      preserveTone: true,
      includeKeyPoints: true,
      includeStatistics: true,
      targetAudience: 'general',
      language: 'en',
      ...options
    };
    
    return this.summarizeContent(section.content, fullOptions, section);
  }
  
  /**
   * Generate executive summary
   */
  private generateExecutiveSummary(
    sections: DocumentSection[],
    options: SummaryOptions
  ): GeneratedSummary {
    // Executive summary focuses on introduction, conclusions, and key findings
    const introSection = sections.find(s => 
      s.title.toLowerCase().includes('introduction') || 
      s.title.toLowerCase().includes('executive') ||
      s.level === 1
    );
    
    const conclusionSection = sections.find(s => 
      s.title.toLowerCase().includes('conclusion') || 
      s.title.toLowerCase().includes('summary') ||
      s.title.toLowerCase().includes('recommendation')
    );
    
    const keySections = sections.filter(s => 
      s.keyTopics && s.keyTopics.length > 0
    ).slice(0, 3);
    
    let content = '';
    if (introSection) {
      content += this.extractKeySentences(introSection.content, 2).join(' ');
    }
    
    for (const section of keySections) {
      const keyPoints = this.extractKeyPoints(section.content, 2);
      if (keyPoints.length > 0) {
        content += ' ' + keyPoints.join(' ');
      }
    }
    
    if (conclusionSection) {
      content += ' ' + this.extractKeySentences(conclusionSection.content, 2).join(' ');
    }
    
    // If no specific sections found, use first and last sections
    if (!content.trim()) {
      const firstSection = sections[0];
      const lastSection = sections[sections.length - 1];
      if (firstSection) {
        content += this.extractKeySentences(firstSection.content, 2).join(' ');
      }
      if (lastSection && lastSection !== firstSection) {
        content += ' ' + this.extractKeySentences(lastSection.content, 2).join(' ');
      }
    }
    
    return this.summarizeContent(content, {
      ...options,
      targetLength: Math.min(options.targetLength, 150) // Executive summary is shorter
    });
  }
  
  /**
   * Generate section summaries
   */
  private generateSectionSummaries(
    sections: DocumentSection[],
    options: SummaryOptions
  ): Map<string, GeneratedSummary> {
    const summaries = new Map<string, GeneratedSummary>();
    
    for (const section of sections) {
      const summary = this.generateSectionSummary(section, options);
      summaries.set(section.id, summary);
    }
    
    return summaries;
  }
  
  /**
   * Generate full document summary
   */
  private generateFullDocumentSummary(
    sections: DocumentSection[],
    options: SummaryOptions
  ): GeneratedSummary {
    const documentContent = this.extractDocumentContent(sections);
    return this.summarizeContent(documentContent, options);
  }
  
  /**
   * Summarize content with given options
   */
  private summarizeContent(
    content: string,
    options: SummaryOptions,
    contextSection?: DocumentSection
  ): GeneratedSummary {
    // Extract key sentences
    const keySentences = this.extractKeySentences(content, this.getSentenceCountForDetailLevel(options.detailLevel));
    
    // Extract key points
    const keyPoints = options.includeKeyPoints 
      ? this.extractKeyPoints(content, 5)
      : [];
    
    // Generate summary text
    const summary = this.constructSummary(keySentences, options);
    
    // Analyze tone
    const tone = this.analyzeTone(summary);
    
    // Calculate statistics
    const originalWordCount = content.split(/\s+/).length;
    const summaryWordCount = summary.split(/\s+/).length;
    const compressionRatio = originalWordCount > 0 ? summaryWordCount / originalWordCount : 0;
    
    // Estimate coverage based on key sentences extraction
    const coverage = this.estimateCoverage(content, keySentences);
    
    return {
      summary,
      keyPoints,
      statistics: {
        wordCount: summaryWordCount,
        compressionRatio,
        keyPointCount: keyPoints.length,
        coverage
      },
      tone,
      sectionsCovered: contextSection ? [contextSection.id] : undefined,
      confidence: this.calculateSummaryConfidence(content, summary, keyPoints)
    };
  }
  
  /**
   * Extract key sentences from content
   */
  private extractKeySentences(content: string, maxSentences: number): string[] {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length <= maxSentences) {
      return sentences.map(s => s.trim() + '.');
    }
    
    // Simple heuristic: prioritize sentences with:
    // 1. Topic sentences (first sentence of paragraph)
    // 2. Sentences with important keywords
    // 3. Sentences with numbers or statistics
    // 4. Sentences with conclusion words
    
    const scoredSentences = sentences.map((sentence, index) => {
      let score = 0;
      
      // First sentence gets bonus
      if (index === 0) score += 3;
      
      // Last sentence gets bonus
      if (index === sentences.length - 1) score += 2;
      
      // Sentences with numbers
      if (/\d+/.test(sentence)) score += 2;
      
      // Sentences with conclusion words
      const conclusionWords = ['therefore', 'thus', 'consequently', 'in conclusion', 'in summary', 'overall'];
      if (conclusionWords.some(word => sentence.toLowerCase().includes(word))) {
        score += 2;
      }
      
      // Sentences with important markers
      const importantMarkers = ['important', 'key', 'critical', 'essential', 'significant', 'major'];
      if (importantMarkers.some(word => sentence.toLowerCase().includes(word))) {
        score += 1;
      }
      
      // Longer sentences (but not too long)
      const wordCount = sentence.split(/\s+/).length;
      if (wordCount > 8 && wordCount < 30) score += 1;
      
      return { sentence, score, index };
    });
    
    // Sort by score and take top sentences
    return scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSentences)
      .sort((a, b) => a.index - b.index) // Maintain original order
      .map(item => item.sentence.trim() + '.');
  }
  
  /**
   * Extract key points from content
   */
  private extractKeyPoints(content: string, maxPoints: number): string[] {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Simple extraction: look for bullet-like patterns or important markers
    const keyPointPatterns = [
      /•\s*(.+)/g,
      /-\s*(.+)/g,
      /\d+\.\s*(.+)/g,
      /\*\s*(.+)/g,
      /(?:key|important|critical|essential|significant|major)\s+(?:point|takeaway|finding|result):?\s*(.+)/gi
    ];
    
    const keyPoints: string[] = [];
    
    for (const pattern of keyPointPatterns) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match;
      while ((match = regex.exec(content)) !== null) {
        if (match[1] && match[1].trim().length > 0) {
          keyPoints.push(match[1].trim());
        }
      }
    }
    
    // If no pattern matches, use key sentences as fallback
    if (keyPoints.length === 0) {
      const keySentences = this.extractKeySentences(content, Math.min(5, maxPoints));
      return keySentences.map(s => s.replace(/\.$/, ''));
    }
    
    // Deduplicate and limit
    const uniquePoints = Array.from(new Set(keyPoints));
    return uniquePoints.slice(0, maxPoints);
  }
  
  /**
   * Construct summary from key sentences
   */
  private constructSummary(keySentences: string[], options: SummaryOptions): string {
    let summary = keySentences.join(' ');
    
    // Adjust length if needed
    const wordCount = summary.split(/\s+/).length;
    
    if (wordCount > options.targetLength) {
      // Trim to target length
      const words = summary.split(/\s+/);
      summary = words.slice(0, options.targetLength).join(' ');
      
      // Ensure it ends with a complete sentence
      if (!summary.match(/[.!?]$/)) {
        const lastPeriod = summary.lastIndexOf('.');
        const lastQuestion = summary.lastIndexOf('?');
        const lastExclamation = summary.lastIndexOf('!');
        const lastPunctuation = Math.max(lastPeriod, lastQuestion, lastExclamation);
        
        if (lastPunctuation > 0) {
          summary = summary.substring(0, lastPunctuation + 1);
        } else {
          summary += '.';
        }
      }
    } else if (wordCount < options.targetLength * 0.7 && keySentences.length > 1) {
      // Add more content if summary is too short
      // This is a simplified version - in production would use more sophisticated expansion
      summary = keySentences.join(' ') + ' Additional details support these key points.';
    }
    
    // Adjust tone if needed
    if (options.preserveTone) {
      // Tone preservation would involve more complex NLP
      // For now, we just ensure basic readability
      summary = this.ensureReadability(summary);
    }
    
    // Adjust for target audience
    summary = this.adjustForAudience(summary, options.targetAudience);
    
    return summary.trim();
  }
  
  /**
   * Analyze tone of text
   */
  private analyzeTone(text: string): ToneAnalysis {
    // Simplified tone analysis
    const words = text.toLowerCase().split(/\W+/);
    
    const formalWords = ['therefore', 'however', 'moreover', 'consequently', 'thus', 'furthermore'];
    const informalWords = ['like', 'just', 'really', 'totally', 'awesome', 'cool'];
    const academicWords = ['hypothesis', 'methodology', 'analysis', 'conclusion', 'evidence'];
    const persuasiveWords = ['should', 'must', 'need to', 'essential', 'critical', 'important'];
    
    let formalCount = 0;
    let informalCount = 0;
    let academicCount = 0;
    let persuasiveCount = 0;
    
    for (const word of words) {
      if (formalWords.includes(word)) formalCount++;
      if (informalWords.includes(word)) informalCount++;
      if (academicWords.includes(word)) academicCount++;
      if (persuasiveWords.includes(word)) persuasiveCount++;
    }
    
    let primaryTone: ToneAnalysis['primaryTone'] = 'neutral';
    
    if (academicCount > 2) primaryTone = 'academic';
    else if (persuasiveCount > 2) primaryTone = 'persuasive';
    else if (formalCount > informalCount) primaryTone = 'formal';
    else if (informalCount > formalCount) primaryTone = 'informal';
    
    const secondaryTones: string[] = [];
    if (formalCount > 0) secondaryTones.push('formal');
    if (informalCount > 0) secondaryTones.push('informal');
    if (academicCount > 0) secondaryTones.push('academic');
    if (persuasiveCount > 0) secondaryTones.push('persuasive');
    
    // Deduplicate
    const uniqueSecondaryTones = Array.from(new Set(secondaryTones));
    
    return {
      primaryTone,
      secondaryTones: uniqueSecondaryTones,
      consistencyScore: 0.8, // Simplified
      appropriateness: 'adequate'
    };
  }
  
  /**
   * Extract document content from sections
   */
  private extractDocumentContent(sections: DocumentSection[]): string {
    return sections
      .sort((a, b) => a.startIndex - b.startIndex)
      .map(section => section.content)
      .join('\n\n');
  }
  
  /**
   * Extract key themes from sections
   */
  private extractKeyThemes(sections: DocumentSection[]): string[] {
    const themes = new Set<string>();
    
    for (const section of sections) {
      if (section.keyTopics && section.keyTopics.length > 0) {
        section.keyTopics.forEach(topic => themes.add(topic));
      }
    }
    
    // If no key topics, extract from section titles
    if (themes.size === 0) {
      sections.forEach(section => {
        if (section.title && section.title.length > 3) {
          themes.add(section.title);
        }
      });
    }
    
    return Array.from(themes).slice(0, 5); // Limit to 5 themes
  }
  
  /**
   * Extract main conclusions from sections
   */
  private extractMainConclusions(sections: DocumentSection[]): string[] {
    const conclusions: string[] = [];
    
    // Look for conclusion sections
    const conclusionSections = sections.filter(section =>
      section.title.toLowerCase().includes('conclusion') ||
      section.title.toLowerCase().includes('summary') ||
      section.title.toLowerCase().includes('findings')
    );
    
    for (const section of conclusionSections) {
      const keySentences = this.extractKeySentences(section.content, 3);
      conclusions.push(...keySentences.map(s => s.replace(/\.$/, '')));
    }
    
    // If no conclusion sections, use last section
    if (conclusions.length === 0 && sections.length > 0) {
      const lastSection = sections[sections.length - 1];
      const keySentences = this.extractKeySentences(lastSection.content, 2);
      conclusions.push(...keySentences.map(s => s.replace(/\.$/, '')));
    }
    
    return conclusions.slice(0, 3); // Limit to 3 conclusions
  }
  
  /**
   * Extract recommendations from sections
   */
  private extractRecommendations(sections: DocumentSection[]): string[] | undefined {
    const recommendations: string[] = [];
    
    // Look for recommendation sections
    const recommendationSections = sections.filter(section =>
      section.title.toLowerCase().includes('recommendation') ||
      section.title.toLowerCase().includes('suggestion') ||
      section.title.toLowerCase().includes('action') ||
      section.title.toLowerCase().includes('next steps')
    );
    
    for (const section of recommendationSections) {
      // Extract bullet points or numbered lists
      const bulletPattern = /(?:•|\d+\.|-\s*)([^\n]+)/g;
      let bulletMatch;
      while ((bulletMatch = bulletPattern.exec(section.content)) !== null) {
        if (bulletMatch[1] && bulletMatch[1].trim().length > 0) {
          recommendations.push(bulletMatch[1].trim());
        }
      }
      
      // If no bullets, extract key sentences
      if (recommendations.length === 0) {
        const keySentences = this.extractKeySentences(section.content, 3);
        recommendations.push(...keySentences.map(s => s.replace(/\.$/, '')));
      }
    }
    
    return recommendations.length > 0 ? recommendations.slice(0, 5) : undefined;
  }
  
  /**
   * Get sentence count based on detail level
   */
  private getSentenceCountForDetailLevel(detailLevel: SummaryOptions['detailLevel']): number {
    switch (detailLevel) {
      case 'brief': return 3;
      case 'standard': return 5;
      case 'detailed': return 8;
      case 'comprehensive': return 12;
      default: return 5;
    }
  }
  
  /**
   * Estimate coverage of original content by key sentences
   */
  private estimateCoverage(originalContent: string, keySentences: string[]): number {
    if (keySentences.length === 0) return 0;
    
    const originalSentences = originalContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (originalSentences.length === 0) return 0;
    
    // Simple coverage: ratio of key sentences to total sentences
    const sentenceCoverage = keySentences.length / originalSentences.length;
    
    // Also consider word coverage
    const originalWords = originalContent.split(/\s+/).length;
    const keyWords = keySentences.join(' ').split(/\s+/).length;
    const wordCoverage = originalWords > 0 ? keyWords / originalWords : 0;
    
    // Weighted average favoring sentence coverage
    return (sentenceCoverage * 0.7 + wordCoverage * 0.3);
  }
  
  /**
   * Calculate confidence in summary quality
   */
  private calculateSummaryConfidence(
    originalContent: string,
    summary: string,
    keyPoints: string[]
  ): number {
    let confidence = 0.7; // Base confidence
    
    // Factor 1: Summary length relative to original
    const originalWordCount = originalContent.split(/\s+/).length;
    const summaryWordCount = summary.split(/\s+/).length;
    
    if (originalWordCount > 0) {
      const compressionRatio = summaryWordCount / originalWordCount;
      // Ideal compression ratio is between 0.1 and 0.3 for summaries
      if (compressionRatio >= 0.1 && compressionRatio <= 0.3) {
        confidence += 0.1;
      } else if (compressionRatio > 0.3 && compressionRatio <= 0.5) {
        confidence += 0.05;
      } else if (compressionRatio < 0.1) {
        confidence -= 0.05; // Too compressed
      } else {
        confidence -= 0.1; // Not compressed enough
      }
    }
    
    // Factor 2: Key point extraction
    if (keyPoints.length >= 3) {
      confidence += 0.1;
    } else if (keyPoints.length >= 1) {
      confidence += 0.05;
    } else {
      confidence -= 0.05;
    }
    
    // Factor 3: Summary completeness (ends with punctuation)
    if (summary.match(/[.!?]$/)) {
      confidence += 0.05;
    }
    
    // Factor 4: Summary readability (sentence length variation)
    const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length > 1) {
      const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
      const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
      const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length;
      
      // Some variance is good (not all sentences same length)
      if (variance > 5 && variance < 50) {
        confidence += 0.05;
      }
    }
    
    // Clamp between 0 and 1
    return Math.max(0, Math.min(1, confidence));
  }
  
  /**
   * Ensure readability of text
   */
  private ensureReadability(text: string): string {
    // Simple readability improvements
    let improved = text;
    
    // Fix double spaces
    improved = improved.replace(/\s+/g, ' ');
    
    // Ensure space after punctuation
    improved = improved.replace(/([.!?])([A-Za-z])/g, '$1 $2');
    
    // Capitalize first letter
    if (improved.length > 0) {
      improved = improved.charAt(0).toUpperCase() + improved.slice(1);
    }
    
    return improved;
  }
  
  /**
   * Adjust text for target audience
   */
  private adjustForAudience(text: string, audience: SummaryOptions['targetAudience']): string {
    // Simplified audience adjustment
    switch (audience) {
      case 'executive':
        // Make more concise, focus on key points
        return this.makeConcise(text);
      case 'technical':
        // Keep technical terms, be precise
        return text;
      case 'academic':
        // Ensure formal tone
        return this.makeFormal(text);
      case 'general':
      default:
        // Ensure clarity and simplicity
        return this.simplifyLanguage(text);
    }
  }
  
  /**
   * Make text more concise
   */
  private makeConcise(text: string): string {
    // Remove filler words and phrases
    const fillerWords = [
      'in order to', 'it is important to note that', 'it should be noted that',
      'as a matter of fact', 'the fact that', 'due to the fact that',
      'in the event that', 'at this point in time'
    ];
    
    let concise = text;
    for (const filler of fillerWords) {
      const regex = new RegExp(filler, 'gi');
      concise = concise.replace(regex, '');
    }
    
    // Remove redundant phrases
    const redundantPhrases = [
      /basic fundamentals/gi,
      /end result/gi,
      /future plans/gi,
      /past history/gi,
      /true facts/gi,
      /unexpected surprise/gi
    ];
    
    for (const phrase of redundantPhrases) {
      concise = concise.replace(phrase, (match) => {
        // Keep the first word
        return match.split(' ')[0];
      });
    }
    
    return concise.trim();
  }
  
  /**
   * Make text more formal
   */
  private makeFormal(text: string): string {
    // Replace informal contractions
    const contractions: Record<string, string> = {
      "don't": "do not",
      "can't": "cannot",
      "won't": "will not",
      "isn't": "is not",
      "aren't": "are not",
      "wasn't": "was not",
      "weren't": "were not",
      "haven't": "have not",
      "hasn't": "has not",
      "hadn't": "had not",
      "wouldn't": "would not",
      "shouldn't": "should not",
      "couldn't": "could not",
      "mightn't": "might not",
      "mustn't": "must not",
      "it's": "it is",
      "that's": "that is",
      "there's": "there is",
      "here's": "here is",
      "what's": "what is",
      "where's": "where is",
      "who's": "who is",
      "why's": "why is",
      "how's": "how is",
      "let's": "let us",
      "i'm": "I am",
      "you're": "you are",
      "he's": "he is",
      "she's": "she is",
      "we're": "we are",
      "they're": "they are",
      "i've": "I have",
      "you've": "you have",
      "we've": "we have",
      "they've": "they have",
      "i'd": "I would",
      "you'd": "you would",
      "he'd": "he would",
      "she'd": "she would",
      "we'd": "we would",
      "they'd": "they would",
      "i'll": "I will",
      "you'll": "you will",
      "he'll": "he will",
      "she'll": "she will",
      "we'll": "we will",
      "they'll": "they will"
    };
    
    let formal = text;
    for (const [contraction, expansion] of Object.entries(contractions)) {
      const regex = new RegExp(`\\b${contraction}\\b`, 'gi');
      formal = formal.replace(regex, expansion);
    }
    
    return formal;
  }
  
  /**
   * Simplify language for general audience
   */
  private simplifyLanguage(text: string): string {
    // Replace complex words with simpler alternatives
    const complexWords: Record<string, string> = {
      "utilize": "use",
      "facilitate": "help",
      "implement": "carry out",
      "methodology": "method",
      "paradigm": "model",
      "leverage": "use",
      "synergy": "cooperation",
      "optimize": "improve",
      "streamline": "simplify",
      "enhance": "improve",
      "elucidate": "explain",
      "ascertain": "find out",
      "commence": "begin",
      "terminate": "end",
      "endeavor": "try",
      "subsequent": "later",
      "prior": "earlier",
      "approximately": "about",
      "consequently": "so",
      "nevertheless": "however"
    };
    
    let simple = text;
    for (const [complex, simpleWord] of Object.entries(complexWords)) {
      const regex = new RegExp(`\\b${complex}\\b`, 'gi');
      simple = simple.replace(regex, simpleWord);
    }
    
    return simple;
  }
}