/**
 * Brand Tone Model Utilities
 * 
 * Utility functions for text processing, analysis, and transformation
 */

import {
  TextProcessingResult,
  VocabularyAnalysis,
  SentenceAnalysis,
} from './types';

// ==================== TEXT PROCESSING ====================

/**
 * Normalise text by removing extra whitespace, standardising punctuation, and cleaning
 */
export function normaliseText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remove extra whitespace
  let normalised = text.replace(/\s+/g, ' ').trim();
  
  // Standardise punctuation spacing
  normalised = normalised.replace(/\s+([.,!?;:])/g, '$1');
  normalised = normalised.replace(/([.,!?;:])(\w)/g, '$1 $2');
  
  // Fix common punctuation issues
  normalised = normalised.replace(/\.\.\./g, '…');
  normalised = normalised.replace(/--/g, '—');
  
  // Remove control characters
  normalised = normalised.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
  
  // Standardise quotes
  normalised = normalised.replace(/["'`]/g, '"');
  
  return normalised;
}

/**
 * Tokenise text into words
 */
export function tokenise(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const normalised = normaliseText(text);
  
  // Split by word boundaries, keeping apostrophes for contractions
  const tokens = normalised.match(/[\w']+|[^\w\s]+/g) || [];
  
  // Filter out empty tokens and punctuation-only tokens if needed
  return tokens.filter(token => token.trim().length > 0);
}

/**
 * Extract sentences from text
 */
export function extractSentences(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const normalised = normaliseText(text);
  
  // Split by sentence boundaries (., !, ?, …)
  const sentences = normalised.split(/(?<=[.!?…])\s+/);
  
  // Filter out empty sentences
  return sentences.filter(sentence => sentence.trim().length > 0);
}

/**
 * Extract paragraphs from text
 */
export function extractParagraphs(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Split by double newlines or multiple newlines
  const paragraphs = text.split(/\n\s*\n+/);
  
  // Filter out empty paragraphs and trim
  return paragraphs
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 0);
}

/**
 * Process text and return comprehensive analysis
 */
export function processText(text: string): TextProcessingResult {
  const tokens = tokenise(text);
  const sentences = extractSentences(text);
  const paragraphs = extractParagraphs(text);

  return {
    tokens,
    sentences,
    paragraphs,
    wordCount: tokens.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
  };
}

// ==================== VOCABULARY ANALYSIS ====================

/**
 * Analyze vocabulary complexity
 */
export function analyzeVocabulary(tokens: string[]): VocabularyAnalysis {
  if (!tokens || tokens.length === 0) {
    return {
      uniqueWords: 0,
      wordFrequency: {},
      complexWordCount: 0,
      simpleWordCount: 0,
      technicalTermCount: 0,
    };
  }

  const wordFrequency: Record<string, number> = {};
  const uniqueWords = new Set<string>();
  let complexWordCount = 0;
  let simpleWordCount = 0;
  let technicalTermCount = 0;

  // Common simple words (basic vocabulary)
  const simpleWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
    'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
    'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
    'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
    'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
    'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  ]);

  // Common technical terms (for technical content detection)
  const technicalTerms = new Set([
    'algorithm', 'architecture', 'implementation', 'optimization', 'integration',
    'scalable', 'robust', 'efficient', 'performance', 'enterprise',
    'framework', 'protocol', 'interface', 'database', 'network',
    'encryption', 'authentication', 'authorization', 'deployment', 'container',
    'microservice', 'api', 'endpoint', 'middleware', 'orchestration',
    'kubernetes', 'docker', 'cloud', 'serverless', 'devops',
  ]);

  // Complex word detection (words with 3+ syllables or technical terms)
  const syllableCount = (word: string): number => {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;
    
    const syllables = word
      .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
      .replace(/^y/, '')
      .match(/[aeiouy]{1,2}/g);
    
    return syllables ? syllables.length : 1;
  };

  for (const token of tokens) {
    const word = token.toLowerCase();
    
    // Count frequency
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    uniqueWords.add(word);
    
    // Classify word complexity
    if (simpleWords.has(word)) {
      simpleWordCount++;
    } else if (technicalTerms.has(word)) {
      technicalTermCount++;
      complexWordCount++;
    } else if (syllableCount(word) >= 3) {
      complexWordCount++;
    }
  }

  return {
    uniqueWords: uniqueWords.size,
    wordFrequency,
    complexWordCount,
    simpleWordCount,
    technicalTermCount,
  };
}

// ==================== SENTENCE ANALYSIS ====================

/**
 * Analyze sentence structure and complexity
 */
export function analyzeSentences(sentences: string[]): SentenceAnalysis {
  if (!sentences || sentences.length === 0) {
    return {
      lengths: [],
      structures: [],
      complexity: 0,
      readability: 0,
    };
  }

  const lengths: number[] = [];
  const structures: string[] = [];
  let totalWords = 0;
  let totalSentences = sentences.length;

  for (const sentence of sentences) {
    const words = tokenise(sentence);
    const wordCount = words.length;
    lengths.push(wordCount);
    totalWords += wordCount;

    // Classify sentence structure
    if (wordCount < 8) {
      structures.push('short');
    } else if (wordCount < 20) {
      structures.push('medium');
    } else {
      structures.push('long');
    }
  }

  const avgSentenceLength = totalWords / totalSentences;
  
  // Calculate readability (Flesch Reading Ease approximation)
  const avgWordsPerSentence = avgSentenceLength;
  const avgSyllablesPerWord = 1.5; // Simplified approximation
  const readability = Math.max(0, Math.min(100, 
    206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord
  ));

  // Calculate complexity score (0-1)
  const longSentenceRatio = structures.filter(s => s === 'long').length / totalSentences;
  const shortSentenceRatio = structures.filter(s => s === 'short').length / totalSentences;
  const complexity = (longSentenceRatio * 0.7 + (1 - shortSentenceRatio) * 0.3);

  return {
    lengths,
    structures,
    complexity,
    readability,
  };
}

// ==================== FORMALITY ANALYSIS ====================

/**
 * Calculate formality score (0-1)
 */
export function calculateFormalityScore(tokens: string[]): number {
  if (!tokens || tokens.length === 0) {
    return 0.5;
  }

  const formalWords = new Set([
    'therefore', 'however', 'moreover', 'furthermore', 'consequently',
    'nevertheless', 'notwithstanding', 'accordingly', 'henceforth',
    'utilize', 'facilitate', 'implement', 'optimize', 'leverage',
    'endeavor', 'ascertain', 'elucidate', 'delineate', 'explicate',
  ]);

  const informalWords = new Set([
    'gonna', 'wanna', 'gotta', 'kinda', 'sorta',
    'awesome', 'cool', 'great', 'nice', 'fun',
    'hey', 'hi', 'yo', 'dude', 'bro',
    'stuff', 'things', 'guys', 'folks', 'peeps',
  ]);

  const contractions = new Set([
    "can't", "won't", "don't", "isn't", "aren't",
    "wasn't", "weren't", "haven't", "hasn't", "hadn't",
    "wouldn't", "couldn't", "shouldn't", "mightn't", "mustn't",
    "it's", "that's", "what's", "who's", "where's",
    "i'm", "you're", "he's", "she's", "we're", "they're",
  ]);

  let formalCount = 0;
  let informalCount = 0;
  let contractionCount = 0;

  for (const token of tokens) {
    const word = token.toLowerCase();
    
    if (formalWords.has(word)) {
      formalCount++;
    } else if (informalWords.has(word)) {
      informalCount++;
    } else if (contractions.has(word)) {
      contractionCount++;
    }
  }

  const total = tokens.length;
  const formalScore = formalCount / Math.max(1, total) * 2; // Weight formal words more
  const informalScore = (informalCount + contractionCount * 0.5) / Math.max(1, total);
  
  // Normalise to 0-1 range
  const rawScore = 0.5 + (formalScore - informalScore) * 0.5;
  return Math.max(0, Math.min(1, rawScore));
}

// ==================== VOCABULARY LEVEL ANALYSIS ====================

/**
 * Calculate vocabulary score (0-1, where 1 is more advanced)
 */
export function calculateVocabularyScore(tokens: string[]): number {
  if (!tokens || tokens.length === 0) {
    return 0.5;
  }

  const vocabularyAnalysis = analyzeVocabulary(tokens);
  const totalWords = tokens.length;
  
  if (totalWords === 0) {
    return 0.5;
  }

  // Calculate advanced vocabulary ratio
  const advancedRatio = vocabularyAnalysis.complexWordCount / totalWords;
  const technicalRatio = vocabularyAnalysis.technicalTermCount / totalWords;
  const uniqueRatio = vocabularyAnalysis.uniqueWords / totalWords;

  // Weighted combination
  const score = (
    advancedRatio * 0.4 +
    technicalRatio * 0.4 +
    uniqueRatio * 0.2
  );

  return Math.max(0, Math.min(1, score));
}

// ==================== EMOTION ANALYSIS ====================

/**
 * Calculate emotion score (-1 to 1, where positive is positive emotion)
 */
export function calculateEmotionScore(tokens: string[]): number {
  if (!tokens || tokens.length === 0) {
    return 0;
  }

  const positiveWords = new Set([
    'great', 'excellent', 'wonderful', 'amazing', 'fantastic',
    'happy', 'joyful', 'delighted', 'pleased', 'satisfied',
    'love', 'adore', 'cherish', 'treasure', 'value',
    'success', 'achievement', 'accomplishment', 'victory', 'triumph',
    'beautiful', 'gorgeous', 'stunning', 'magnificent', 'splendid',
    'hope', 'optimistic', 'confident', 'assured', 'certain',
    'grateful', 'thankful', 'appreciative', 'indebted', 'obliged',
  ]);

  const negativeWords = new Set([
    'bad', 'terrible', 'awful', 'horrible', 'dreadful',
    'sad', 'unhappy', 'miserable', 'depressed', 'gloomy',
    'hate', 'despise', 'loathe', 'detest', 'abhor',
    'failure', 'defeat', 'loss', 'setback', 'disappointment',
    'ugly', 'hideous', 'repulsive', 'revolting', 'disgusting',
    'fear', 'afraid', 'scared', 'terrified', 'frightened',
    'angry', 'furious', 'enraged', 'irate', 'incensed',
  ]);

  let positiveCount = 0;
  let negativeCount = 0;

  for (const token of tokens) {
    const word = token.toLowerCase();
    
    if (positiveWords.has(word)) {
      positiveCount++;
    } else if (negativeWords.has(word)) {
      negativeCount++;
    }
  }

  const total = tokens.length;
  if (total === 0) {
    return 0;
  }

  const positiveRatio = positiveCount / total;
  const negativeRatio = negativeCount / total;
  
  // Score from -1 (very negative) to 1 (very positive)
  const score = positiveRatio - negativeRatio;
  return Math.max(-1, Math.min(1, score));
}

// ==================== PACING ANALYSIS ====================

/**
 * Calculate pacing score (0-1, where 1 is faster pacing)
 */
export function calculatePacingScore(sentences: string[]): number {
  if (!sentences || sentences.length === 0) {
    return 0.5;
  }

  const sentenceAnalysis = analyzeSentences(sentences);
  const avgSentenceLength = sentenceAnalysis.lengths.reduce((a, b) => a + b, 0) / sentences.length;
  
  // Shorter sentences = faster pacing
  const lengthScore = Math.max(0, Math.min(1, 1 - (avgSentenceLength / 30)));
  
  // More sentences per paragraph = faster pacing
  const paragraphs = extractParagraphs(sentences.join(' '));
  const sentencesPerParagraph = sentences.length / Math.max(1, paragraphs.length);
  const densityScore = Math.max(0, Math.min(1, sentencesPerParagraph / 5));
  
  // Combine scores
  const score = (lengthScore * 0.6 + densityScore * 0.4);
  return Math.max(0, Math.min(1, score));
}

// ==================== READING LEVEL DETECTION ====================

/**
 * Determine reading level based on vocabulary and sentence complexity
 */
export function determineReadingLevel(tokens: string[], sentences: string[]): 'basic' | 'intermediate' | 'advanced' {
  if (!tokens || tokens.length === 0 || !sentences || sentences.length === 0) {
    return 'intermediate';
  }

  const vocabularyScore = calculateVocabularyScore(tokens);
  const sentenceAnalysis = analyzeSentences(sentences);
  const complexity = sentenceAnalysis.complexity;

  // Combined score
  const combinedScore = (vocabularyScore * 0.6 + complexity * 0.4);

  if (combinedScore < 0.3) {
    return 'basic';
  } else if (combinedScore < 0.7) {
    return 'intermediate';
  } else {
    return 'advanced';
  }
}

// ==================== KEYWORD EXTRACTION ====================

/**
 * Extract keywords from text
 */
export function extractKeywords(text: string, maxKeywords: number = 10): string[] {
  const tokens = tokenise(text);
  const vocabularyAnalysis = analyzeVocabulary(tokens);
  
  // Filter out common stop words
  const stopWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
  ]);

  // Get word frequency, filter stop words, and sort by frequency
  const keywordCandidates = Object.entries(vocabularyAnalysis.wordFrequency)
    .filter(([word, frequency]) => !stopWords.has(word) && word.length > 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords * 2) // Get more candidates for deduplication
    .map(([word]) => word);

  // Simple deduplication (remove similar words)
  const deduplicated: string[] = [];
  const seen = new Set<string>();
  
  for (const word of keywordCandidates) {
    const normalized = word.toLowerCase();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      deduplicated.push(word);
    }
    
    if (deduplicated.length >= maxKeywords) {
      break;
    }
  }
  
  return deduplicated;
}