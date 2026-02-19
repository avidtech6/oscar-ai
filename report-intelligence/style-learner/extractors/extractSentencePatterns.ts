/**
 * Report Style Learner - Phase 5
 * Sentence Patterns Extractor
 * 
 * Extracts sentence patterns from decompiled reports.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { SentencePattern } from '../StyleProfile';

/**
 * Extract sentence patterns from a decompiled report
 */
export async function extractSentencePatterns(decompiledReport: DecompiledReport): Promise<SentencePattern[]> {
  try {
    const patterns: SentencePattern[] = [];
    
    // Extract sentences from all sections
    const allSentences = extractAllSentences(decompiledReport);
    
    if (allSentences.length === 0) {
      return [];
    }
    
    // Analyze sentence structures
    const sentenceStructures = analyzeSentenceStructures(allSentences);
    
    // Group similar patterns
    const groupedPatterns = groupSimilarPatterns(sentenceStructures);
    
    // Convert to SentencePattern format
    for (const group of groupedPatterns) {
      if (group.sentences.length >= 2) { // Need at least 2 examples to be a pattern
        const frequency = group.sentences.length / allSentences.length;
        
        patterns.push({
          pattern: describePattern(group.structure),
          frequency,
          examples: group.sentences.slice(0, 3), // Limit to 3 examples
          context: determineSentenceContext(group.sentences[0])
        });
      }
    }
    
    return patterns;
    
  } catch (error) {
    console.error('Error extracting sentence patterns:', error);
    return [];
  }
}

/**
 * Extract all sentences from decompiled report
 */
function extractAllSentences(report: DecompiledReport): string[] {
  const sentences: string[] = [];
  
  for (const section of report.sections) {
    const sectionSentences = section.content
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10 && s.length < 200); // Filter reasonable length
    
    sentences.push(...sectionSentences);
  }
  
  return sentences;
}

/**
 * Analyze sentence structures
 */
function analyzeSentenceStructures(sentences: string[]): Array<{
  sentence: string;
  structure: string;
  wordCount: number;
  hasIntroPhrase: boolean;
  hasConjunction: boolean;
  hasList: boolean;
}> {
  return sentences.map(sentence => {
    const words = sentence.split(/\s+/);
    const wordCount = words.length;
    
    // Analyze structure
    const structure = analyzeSingleSentenceStructure(sentence);
    
    return {
      sentence,
      structure,
      wordCount,
      hasIntroPhrase: hasIntroductoryPhrase(sentence),
      hasConjunction: hasConjunction(sentence),
      hasList: hasListStructure(sentence)
    };
  });
}

/**
 * Analyze structure of a single sentence
 */
function analyzeSingleSentenceStructure(sentence: string): string {
  const words = sentence.split(/\s+/);
  
  // Simple structure detection
  if (sentence.startsWith('The') || sentence.startsWith('This') || sentence.startsWith('These')) {
    return 'definite_article_start';
  }
  
  if (sentence.match(/^[A-Z][a-z]+ly\s/)) { // Adverb start
    return 'adverb_start';
  }
  
  if (sentence.includes(':')) {
    return 'colon_separated';
  }
  
  if (sentence.includes(';')) {
    return 'semicolon_separated';
  }
  
  if (hasListStructure(sentence)) {
    return 'list_structure';
  }
  
  if (hasConjunction(sentence)) {
    return 'conjunction_structure';
  }
  
  // Word count based
  if (words.length < 10) return 'short_simple';
  if (words.length < 20) return 'medium_complex';
  return 'long_complex';
}

/**
 * Group similar sentence patterns
 */
function groupSimilarPatterns(
  analyses: Array<{ sentence: string; structure: string; wordCount: number }>
): Array<{ structure: string; sentences: string[] }> {
  const groups = new Map<string, string[]>();
  
  for (const analysis of analyses) {
    if (!groups.has(analysis.structure)) {
      groups.set(analysis.structure, []);
    }
    groups.get(analysis.structure)!.push(analysis.sentence);
  }
  
  return Array.from(groups.entries()).map(([structure, sentences]) => ({
    structure,
    sentences
  }));
}

/**
 * Describe a pattern in human-readable form
 */
function describePattern(structure: string): string {
  const descriptions: Record<string, string> = {
    'definite_article_start': 'Starts with definite article (The, This, These)',
    'adverb_start': 'Starts with adverb ending in -ly',
    'colon_separated': 'Uses colon to separate clauses',
    'semicolon_separated': 'Uses semicolon to separate clauses',
    'list_structure': 'Contains list items',
    'conjunction_structure': 'Uses conjunctions to connect clauses',
    'short_simple': 'Short, simple sentence (under 10 words)',
    'medium_complex': 'Medium complexity sentence (10-20 words)',
    'long_complex': 'Long, complex sentence (over 20 words)'
  };
  
  return descriptions[structure] || `Pattern: ${structure}`;
}

/**
 * Determine sentence context
 */
function determineSentenceContext(sentence: string): SentencePattern['context'] {
  const lowerSentence = sentence.toLowerCase();
  
  if (lowerSentence.includes('recommend') || lowerSentence.includes('suggest') || lowerSentence.includes('advise')) {
    return 'recommendation';
  }
  
  if (lowerSentence.includes('conclusion') || lowerSentence.includes('summary') || lowerSentence.includes('therefore')) {
    return 'conclusion';
  }
  
  if (lowerSentence.includes('analysis') || lowerSentence.includes('find') || lowerSentence.includes('result')) {
    return 'analysis';
  }
  
  if (lowerSentence.includes('introduction') || lowerSentence.includes('overview') || lowerSentence.includes('purpose')) {
    return 'introduction';
  }
  
  if (lowerSentence.includes('method') || lowerSentence.includes('procedure') || lowerSentence.includes('approach')) {
    return 'description';
  }
  
  return 'general';
}

/**
 * Helper functions
 */
function hasIntroductoryPhrase(sentence: string): boolean {
  const introPhrases = [
    'In order to', 'For example', 'Specifically', 'Generally',
    'Typically', 'Usually', 'Often', 'Sometimes', 'However',
    'Therefore', 'Consequently', 'As a result', 'In conclusion'
  ];
  
  return introPhrases.some(phrase => sentence.startsWith(phrase));
}

function hasConjunction(sentence: string): boolean {
  const conjunctions = ['and', 'but', 'or', 'nor', 'for', 'yet', 'so'];
  const words = sentence.toLowerCase().split(/\s+/);
  return conjunctions.some(conjunction => words.includes(conjunction));
}

function hasListStructure(sentence: string): boolean {
  const listIndicators = [
    /\(\d+\)/g, // (1), (2), etc.
    /\d+\.\s/g, // 1., 2., etc.
    /[•\-*]\s/g, // •, -, *
    /firstly|secondly|thirdly|finally/i,
    /one\s|two\s|three\s|four\s/i
  ];
  
  return listIndicators.some(indicator => indicator.test(sentence));
}