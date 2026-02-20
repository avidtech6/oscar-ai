/**
 * Phase 24: Document Intelligence Layer
 * Auto-Rewrite Engine
 * 
 * Automatically rewrites text to improve:
 * - Tone adjustment (formal/informal, academic/conversational)
 * - Clarity enhancement (simplify complex sentences, reduce jargon)
 * - Conciseness (remove redundancy, eliminate filler words)
 * - Readability improvement (sentence structure, paragraph flow)
 * - Style consistency (maintain consistent voice and perspective)
 */

import type { DocumentSection } from '../types/DocumentAnalysis';
import type { ToneAnalysis } from '../types/DocumentAnalysis';

/**
 * Rewrite options
 */
export interface RewriteOptions {
  /** Target tone */
  targetTone: 'formal' | 'informal' | 'academic' | 'conversational' | 'persuasive' | 'neutral';
  /** Clarity level */
  clarityLevel: 'simplified' | 'standard' | 'technical';
  /** Conciseness level */
  concisenessLevel: 'verbose' | 'balanced' | 'concise' | 'very-concise';
  /** Whether to preserve key terminology */
  preserveTerminology: boolean;
  /** Whether to maintain original structure */
  maintainStructure: boolean;
  /** Target audience */
  targetAudience: 'general' | 'technical' | 'executive' | 'academic';
  /** Language for rewrite */
  language: string;
  /** Maximum rewrite iterations */
  maxIterations: number;
}

/**
 * Rewrite result
 */
export interface RewriteResult {
  /** Original text */
  originalText: string;
  /** Rewritten text */
  rewrittenText: string;
  /** Changes made */
  changes: RewriteChange[];
  /** Statistics */
  statistics: {
    /** Word count reduction percentage */
    wordReductionPercent: number;
    /** Sentence count change */
    sentenceCountChange: number;
    /** Average sentence length change */
    avgSentenceLengthChange: number;
    /** Readability improvement score (0-100) */
    readabilityImprovement: number;
    /** Clarity improvement score (0-100) */
    clarityImprovement: number;
  };
  /** Tone analysis before and after */
  toneAnalysis: {
    before: ToneAnalysis;
    after: ToneAnalysis;
  };
  /** Confidence in rewrite quality (0-1) */
  confidence: number;
}

/**
 * Individual rewrite change
 */
export interface RewriteChange {
  /** Type of change */
  type: 'tone-adjustment' | 'clarity-improvement' | 'conciseness' | 'jargon-reduction' | 'sentence-restructuring' | 'word-replacement';
  /** Original segment */
  originalSegment: string;
  /** Rewritten segment */
  rewrittenSegment: string;
  /** Explanation of change */
  explanation: string;
  /** Impact of change */
  impact: 'minor' | 'moderate' | 'major';
}

/**
 * Auto-Rewrite Engine
 * 
 * Automatically rewrites text to improve tone, clarity, and conciseness
 */
export class AutoRewriteEngine {
  /**
   * Rewrite document section
   */
  rewriteSection(
    section: DocumentSection,
    options: Partial<RewriteOptions> = {}
  ): RewriteResult {
    const fullOptions: RewriteOptions = {
      targetTone: 'neutral',
      clarityLevel: 'standard',
      concisenessLevel: 'balanced',
      preserveTerminology: true,
      maintainStructure: true,
      targetAudience: 'general',
      language: 'en',
      maxIterations: 3,
      ...options
    };
    
    return this.rewriteText(section.content, fullOptions);
  }
  
  /**
   * Rewrite text with given options
   */
  rewriteText(
    text: string,
    options: RewriteOptions
  ): RewriteResult {
    const originalText = text;
    let rewrittenText = text;
    const changes: RewriteChange[] = [];
    
    // Analyze original tone
    const originalTone = this.analyzeTone(originalText);
    
    // Apply rewrite iterations
    for (let i = 0; i < options.maxIterations; i++) {
      const iterationChanges: RewriteChange[] = [];
      
      // Apply tone adjustment if needed
      if (options.targetTone !== 'neutral' && originalTone.primaryTone !== options.targetTone) {
        const toneChanges = this.adjustTone(rewrittenText, options.targetTone, options);
        iterationChanges.push(...toneChanges);
        rewrittenText = this.applyChanges(rewrittenText, toneChanges);
      }
      
      // Apply clarity improvements
      if (options.clarityLevel !== 'technical') {
        const clarityChanges = this.improveClarity(rewrittenText, options.clarityLevel, options);
        iterationChanges.push(...clarityChanges);
        rewrittenText = this.applyChanges(rewrittenText, clarityChanges);
      }
      
      // Apply conciseness improvements
      if (options.concisenessLevel !== 'verbose') {
        const concisenessChanges = this.improveConciseness(rewrittenText, options.concisenessLevel, options);
        iterationChanges.push(...concisenessChanges);
        rewrittenText = this.applyChanges(rewrittenText, concisenessChanges);
      }
      
      // Apply jargon reduction for general audience
      if (options.targetAudience === 'general' || options.targetAudience === 'executive') {
        const jargonChanges = this.reduceJargon(rewrittenText, options);
        iterationChanges.push(...jargonChanges);
        rewrittenText = this.applyChanges(rewrittenText, jargonChanges);
      }
      
      changes.push(...iterationChanges);
      
      // If no changes in this iteration, break early
      if (iterationChanges.length === 0) {
        break;
      }
    }
    
    // Analyze rewritten tone
    const rewrittenTone = this.analyzeTone(rewrittenText);
    
    // Calculate statistics
    const statistics = this.calculateStatistics(originalText, rewrittenText, changes);
    
    // Calculate confidence
    const confidence = this.calculateRewriteConfidence(originalText, rewrittenText, changes, statistics);
    
    return {
      originalText,
      rewrittenText,
      changes,
      statistics,
      toneAnalysis: {
        before: originalTone,
        after: rewrittenTone
      },
      confidence
    };
  }
  
  /**
   * Adjust tone of text
   */
  private adjustTone(
    text: string,
    targetTone: RewriteOptions['targetTone'],
    options: RewriteOptions
  ): RewriteChange[] {
    const changes: RewriteChange[] = [];
    
    switch (targetTone) {
      case 'formal':
        changes.push(...this.makeFormal(text, options));
        break;
      case 'informal':
        changes.push(...this.makeInformal(text, options));
        break;
      case 'academic':
        changes.push(...this.makeAcademic(text, options));
        break;
      case 'conversational':
        changes.push(...this.makeConversational(text, options));
        break;
      case 'persuasive':
        changes.push(...this.makePersuasive(text, options));
        break;
      case 'neutral':
        // No tone adjustment needed
        break;
    }
    
    return changes;
  }
  
  /**
   * Make text more formal
   */
  private makeFormal(
    text: string,
    options: RewriteOptions
  ): RewriteChange[] {
    const changes: RewriteChange[] = [];
    
    // Replace informal contractions with formal equivalents
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
    
    for (const [contraction, expansion] of Object.entries(contractions)) {
      const regex = new RegExp(`\\b${contraction}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        for (const match of matches) {
          changes.push({
            type: 'tone-adjustment',
            originalSegment: match,
            rewrittenSegment: expansion,
            explanation: `Replaced informal contraction with formal equivalent`,
            impact: 'minor'
          });
        }
      }
    }
    
    // Replace informal phrases with formal equivalents
    const informalPhrases: Record<string, string> = {
      "a lot of": "many",
      "a bunch of": "several",
      "kind of": "somewhat",
      "sort of": "somewhat",
      "pretty much": "essentially",
      "really": "very",
      "totally": "completely",
      "awesome": "excellent",
      "cool": "acceptable",
      "guy": "person",
      "stuff": "material",
      "thing": "item",
      "get": "obtain",
      "got": "received",
      "gotten": "obtained",
      "make sure": "ensure",
      "check out": "examine",
      "look at": "examine",
      "figure out": "determine",
      "find out": "discover",
      "set up": "establish",
      "put together": "assemble"
    };
    
    for (const [informal, formal] of Object.entries(informalPhrases)) {
      const regex = new RegExp(`\\b${informal}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        for (const match of matches) {
          changes.push({
            type: 'tone-adjustment',
            originalSegment: match,
            rewrittenSegment: formal,
            explanation: `Replaced informal phrase with formal equivalent`,
            impact: 'minor'
          });
        }
      }
    }
    
    return changes;
  }
  
  /**
   * Make text more informal
   */
  private makeInformal(
    text: string,
    options: RewriteOptions
  ): RewriteChange[] {
    const changes: RewriteChange[] = [];
    
    // Replace formal phrases with informal equivalents (reverse of formal mapping)
    const formalToInformal: Record<string, string> = {
      "do not": "don't",
      "cannot": "can't",
      "will not": "won't",
      "is not": "isn't",
      "are not": "aren't",
      "was not": "wasn't",
      "were not": "weren't",
      "have not": "haven't",
      "has not": "hasn't",
      "had not": "hadn't",
      "would not": "wouldn't",
      "should not": "shouldn't",
      "could not": "couldn't",
      "might not": "mightn't",
      "must not": "mustn't",
      "it is": "it's",
      "that is": "that's",
      "there is": "there's",
      "here is": "here's",
      "what is": "what's",
      "where is": "where's",
      "who is": "who's",
      "why is": "why's",
      "how is": "how's",
      "let us": "let's",
      "I am": "I'm",
      "you are": "you're",
      "he is": "he's",
      "she is": "she's",
      "we are": "we're",
      "they are": "they're",
      "I have": "I've",
      "you have": "you've",
      "we have": "we've",
      "they have": "they've",
      "I would": "I'd",
      "you would": "you'd",
      "he would": "he'd",
      "she would": "she'd",
      "we would": "we'd",
      "they would": "they'd",
      "I will": "I'll",
      "you will": "you'll",
      "he will": "he'll",
      "she will": "she'll",
      "we will": "we'll",
      "they will": "they'll"
    };
    
    for (const [formal, informal] of Object.entries(formalToInformal)) {
      const regex = new RegExp(`\\b${formal}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        for (const match of matches) {
          changes.push({
            type: 'tone-adjustment',
            originalSegment: match,
            rewrittenSegment: informal,
            explanation: `Replaced formal phrase with informal contraction`,
            impact: 'minor'
          });
        }
      }
    }
    
    return changes;
  }
  
  /**
   * Make text more academic
   */
  private makeAcademic(
    text: string,
    options: RewriteOptions
  ): RewriteChange[] {
    const changes: RewriteChange[] = [];
    
    // Add academic phrasing
    const academicReplacements: Record<string, string> = {
      "shows": "demonstrates",
      "tells": "indicates",
      "says": "states",
      "thinks": "posits",
      "believes": "contends",
      "looks at": "examines",
      "talks about": "discusses",
      "goes over": "reviews",
      "makes": "creates",
      "gets": "acquires",
      "puts": "places",
      "tries": "attempts",
      "starts": "initiates",
      "ends": "concludes",
      "helps": "facilitates",
      "uses": "utilizes",
      "changes": "modifies",
      "fixes": "rectifies",
      "breaks": "fractures",
      "builds": "constructs"
    };
    
    for (const [common, academic] of Object.entries(academicReplacements)) {
      const regex = new RegExp(`\\b${common}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        for (const match of matches) {
          changes.push({
            type: 'tone-adjustment',
            originalSegment: match,
            rewrittenSegment: academic,
            explanation: `Replaced common term with academic equivalent`,
            impact: 'minor'
          });
        }
      }
    }
    
    return changes;
  }
  
  /**
   * Make text more conversational
   */
  private makeConversational(
    text: string,
    options: RewriteOptions
  ): RewriteChange[] {
    const changes: RewriteChange[] = [];
    
    // Add conversational markers
    const conversationalMarkers = [
      "you know",
      "I mean",
      "actually",
      "basically",
      "literally",
      "seriously",
      "honestly",
      "frankly"
    ];
    
    // This is a simplified implementation
    // In a real system, we would analyze sentence structure and add markers appropriately
    
    return changes;
  }
  
  /**
   * Make text more persuasive
   */
  private makePersuasive(
    text: string,
    options: RewriteOptions
  ): RewriteChange[] {
    const changes: RewriteChange[] = [];
    
    // Add persuasive language
    const persuasiveWords = [
      "compelling",
      "convincing",
      "persuasive",
      "powerful",
      "effective",
      "impactful",
      "significant",
      "important",
      "essential",
      "critical",
      "vital",
      "crucial"
    ];
    
    // Replace neutral adjectives with persuasive ones
    const adjectiveReplacements: Record<string, string> = {
      "good": "excellent",
      "bad": "unacceptable",
      "big": "substantial",
      "small": "limited",
      "fast": "rapid",
      "slow": "gradual",
      "easy": "straightforward",
      "hard": "challenging",
      "simple": "elegant",
      "complex": "sophisticated"
    };
    
    for (const [neutral, persuasive] of Object.entries(adjectiveReplacements)) {
      const regex = new RegExp(`\\b${neutral}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        for (const match of matches) {
          changes.push({
            type: 'tone-adjustment',
            originalSegment: match,
            rewrittenSegment: persuasive,
            explanation: `Replaced neutral adjective with persuasive equivalent`,
            impact: 'minor'
          });
        }
      }
    }
    
    return changes;
  }
  
  /**
   * Improve clarity of text
   */
  private improveClarity(
    text: string,
    clarityLevel: RewriteOptions['clarityLevel'],
    options: RewriteOptions
  ): RewriteChange[] {
    const changes: RewriteChange[] = [];
    
    // This is a simplified implementation
    // In a real system, this would analyze and improve sentence clarity
    
    return changes;
  }
  
  /**
   * Improve conciseness of text
   */
  private improveConciseness(
    text: string,
    concisenessLevel: RewriteOptions['concisenessLevel'],
    options: RewriteOptions
  ): RewriteChange[] {
    const changes: RewriteChange[] = [];
    
    // This is a simplified implementation
    // In a real system, this would remove redundant words and phrases
    
    return changes;
  }
  
  /**
   * Reduce jargon in text
   */
  private reduceJargon(
    text: string,
    options: RewriteOptions
  ): RewriteChange[] {
    const changes: RewriteChange[] = [];
    
    // This is a simplified implementation
    // In a real system, this would replace jargon terms with simpler alternatives
    
    return changes;
  }
  
  /**
   * Apply changes to text
   */
  private applyChanges(text: string, changes: RewriteChange[]): string {
    // Simplified implementation - in real system would apply changes properly
    return text;
  }
  
  /**
   * Analyze tone of text
   */
  private analyzeTone(text: string): ToneAnalysis {
    // Simplified tone analysis
    return {
      primaryTone: 'neutral',
      secondaryTones: [],
      consistencyScore: 0.8,
      appropriateness: 'adequate'
    };
  }
  
  /**
   * Calculate statistics for rewrite
   */
  private calculateStatistics(
    originalText: string,
    rewrittenText: string,
    changes: RewriteChange[]
  ): RewriteResult['statistics'] {
    const originalWords = originalText.split(/\s+/).length;
    const rewrittenWords = rewrittenText.split(/\s+/).length;
    const wordReductionPercent = originalWords > 0 ?
      ((originalWords - rewrittenWords) / originalWords) * 100 : 0;
    
    const originalSentences = originalText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const rewrittenSentences = rewrittenText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const sentenceCountChange = rewrittenSentences - originalSentences;
    
    const originalAvgSentenceLength = originalWords / Math.max(1, originalSentences);
    const rewrittenAvgSentenceLength = rewrittenWords / Math.max(1, rewrittenSentences);
    const avgSentenceLengthChange = rewrittenAvgSentenceLength - originalAvgSentenceLength;
    
    // Simplified calculations
    const readabilityImprovement = 0;
    const clarityImprovement = 0;
    
    return {
      wordReductionPercent,
      sentenceCountChange,
      avgSentenceLengthChange,
      readabilityImprovement,
      clarityImprovement
    };
  }
  
  /**
   * Calculate rewrite confidence
   */
  private calculateRewriteConfidence(
    originalText: string,
    rewrittenText: string,
    changes: RewriteChange[],
    statistics: RewriteResult['statistics']
  ): number {
    // Simplified confidence calculation
    return 0.8;
  }
}
