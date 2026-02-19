/**
 * Report Style Learner - Phase 5
 * Preferred Phrasing Extractor
 * 
 * Extracts preferred phrasing patterns from decompiled reports.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { PreferredPhrasing } from '../StyleProfile';

/**
 * Extract preferred phrasing from a decompiled report
 */
export async function extractPreferredPhrasing(decompiledReport: DecompiledReport): Promise<PreferredPhrasing[]> {
  try {
    const phrasings: PreferredPhrasing[] = [];
    
    // Common concepts to look for
    const concepts = [
      'recommendation',
      'conclusion',
      'finding',
      'method',
      'result',
      'assessment',
      'evaluation',
      'analysis'
    ];
    
    // Extract phrasing for each concept
    for (const concept of concepts) {
      const phrasing = extractPhrasingForConcept(decompiledReport, concept);
      if (phrasing) {
        phrasings.push(phrasing);
      }
    }
    
    return phrasings;
    
  } catch (error) {
    console.error('Error extracting preferred phrasing:', error);
    return [];
  }
}

/**
 * Extract phrasing for a specific concept
 */
function extractPhrasingForConcept(
  report: DecompiledReport,
  concept: string
): PreferredPhrasing | null {
  const allText = report.sections.map(s => s.content).join(' ');
  const lowerText = allText.toLowerCase();
  
  // Find sentences containing the concept
  const conceptSentences = findSentencesContainingConcept(allText, concept);
  
  if (conceptSentences.length === 0) {
    return null;
  }
  
  // Extract preferred phrases
  const preferredPhrases = extractPhrasesFromSentences(conceptSentences, concept);
  
  if (preferredPhrases.length === 0) {
    return null;
  }
  
  // Extract avoided phrases (not present but common alternatives)
  const avoidedPhrases = determineAvoidedPhrases(preferredPhrases, concept);
  
  // Determine context
  const context = determinePhrasingContext(conceptSentences[0]);
  
  // Calculate confidence
  const confidence = calculatePhrasingConfidence(conceptSentences.length, report);
  
  return {
    concept,
    preferredPhrases,
    avoidedPhrases,
    context,
    confidence
  };
}

/**
 * Find sentences containing a concept
 */
function findSentencesContainingConcept(text: string, concept: string): string[] {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  
  return sentences.filter(sentence => {
    const lowerSentence = sentence.toLowerCase();
    return lowerSentence.includes(concept) || 
           relatedTerms[concept]?.some(term => lowerSentence.includes(term)) ||
           false;
  });
}

/**
 * Extract phrases from sentences
 */
function extractPhrasesFromSentences(sentences: string[], concept: string): string[] {
  const phrases = new Set<string>();
  
  for (const sentence of sentences) {
    // Extract phrase around the concept
    const phrase = extractPhraseAroundConcept(sentence, concept);
    if (phrase) {
      phrases.add(phrase);
    }
    
    // Also look for common patterns
    const patterns = extractPhrasingPatterns(sentence, concept);
    patterns.forEach(p => phrases.add(p));
  }
  
  return Array.from(phrases).slice(0, 5); // Limit to 5 phrases
}

/**
 * Extract phrase around a concept
 */
function extractPhraseAroundConcept(sentence: string, concept: string): string | null {
  const lowerSentence = sentence.toLowerCase();
  const conceptIndex = lowerSentence.indexOf(concept);
  
  if (conceptIndex === -1) {
    // Check related terms
    for (const term of relatedTerms[concept] || []) {
      const termIndex = lowerSentence.indexOf(term);
      if (termIndex !== -1) {
        return extractContext(sentence, termIndex, term.length);
      }
    }
    return null;
  }
  
  return extractContext(sentence, conceptIndex, concept.length);
}

/**
 * Extract context around a word
 */
function extractContext(sentence: string, startIndex: number, length: number): string {
  const contextStart = Math.max(0, startIndex - 20);
  const contextEnd = Math.min(sentence.length, startIndex + length + 20);
  
  let extracted = sentence.substring(contextStart, contextEnd);
  
  // Clean up
  if (contextStart > 0) extracted = '...' + extracted;
  if (contextEnd < sentence.length) extracted = extracted + '...';
  
  return extracted.trim();
}

/**
 * Extract phrasing patterns
 */
function extractPhrasingPatterns(sentence: string, concept: string): string[] {
  const patterns: string[] = [];
  const lowerSentence = sentence.toLowerCase();
  
  // Look for common patterns
  const patternRegexes = [
    new RegExp(`(?:it is|we|I)\\s+(?:recommend|suggest|advise|propose)`, 'i'),
    new RegExp(`(?:in|as a)\\s+conclusion`, 'i'),
    new RegExp(`(?:the|our)\\s+findings?\\s+(?:show|indicate|demonstrate)`, 'i'),
    new RegExp(`(?:based on|according to)\\s+the`, 'i')
  ];
  
  for (const regex of patternRegexes) {
    const match = sentence.match(regex);
    if (match) {
      patterns.push(match[0]);
    }
  }
  
  return patterns;
}

/**
 * Determine avoided phrases
 */
function determineAvoidedPhrases(preferredPhrases: string[], concept: string): string[] {
  const avoided: string[] = [];
  
  // Common alternatives that weren't used
  const commonAlternatives: Record<string, string[]> = {
    'recommendation': ['suggestion', 'proposal', 'advice'],
    'conclusion': ['summary', 'ending', 'final thoughts'],
    'finding': ['result', 'outcome', 'discovery'],
    'method': ['approach', 'technique', 'procedure']
  };
  
  const alternatives = commonAlternatives[concept] || [];
  
  for (const alternative of alternatives) {
    let found = false;
    for (const phrase of preferredPhrases) {
      if (phrase.toLowerCase().includes(alternative)) {
        found = true;
        break;
      }
    }
    
    if (!found) {
      avoided.push(alternative);
    }
  }
  
  return avoided.slice(0, 3); // Limit to 3 avoided phrases
}

/**
 * Determine phrasing context
 */
function determinePhrasingContext(sentence: string): string {
  const lowerSentence = sentence.toLowerCase();
  
  if (lowerSentence.includes('recommend') || lowerSentence.includes('suggest')) {
    return 'recommendations';
  }
  
  if (lowerSentence.includes('conclusion') || lowerSentence.includes('summary')) {
    return 'conclusions';
  }
  
  if (lowerSentence.includes('find') || lowerSentence.includes('result')) {
    return 'findings';
  }
  
  if (lowerSentence.includes('method') || lowerSentence.includes('approach')) {
    return 'methodology';
  }
  
  return 'general';
}

/**
 * Calculate phrasing confidence
 */
function calculatePhrasingConfidence(sentenceCount: number, report: DecompiledReport): number {
  let confidence = 0;
  let factors = 0;
  
  // Factor 1: Number of example sentences
  if (sentenceCount > 0) {
    const sentenceFactor = Math.min(sentenceCount / 5, 1);
    confidence += sentenceFactor * 0.5;
    factors += 0.5;
  }
  
  // Factor 2: Report confidence
  if (report.confidenceScore) {
    confidence += report.confidenceScore * 0.3;
    factors += 0.3;
  }
  
  // Factor 3: Text quality
  const wordCount = report.metadata.wordCount || 0;
  if (wordCount > 0) {
    const qualityFactor = Math.min(wordCount / 1000, 1) * 0.2;
    confidence += qualityFactor;
    factors += 0.2;
  }
  
  return factors > 0 ? confidence / factors : 0;
}

/**
 * Related terms for concepts
 */
const relatedTerms: Record<string, string[]> = {
  'recommendation': ['recommend', 'suggest', 'advise', 'propose'],
  'conclusion': ['conclude', 'summary', 'summarize'],
  'finding': ['find', 'discover', 'observe', 'note'],
  'method': ['methodology', 'approach', 'technique', 'procedure'],
  'result': ['outcome', 'finding', 'conclusion'],
  'assessment': ['evaluate', 'appraise', 'judge'],
  'evaluation': ['assess', 'analyze', 'review'],
  'analysis': ['analyze', 'examine', 'study']
};