/**
 * Report Style Learner - Phase 5
 * Tone Extractor
 * 
 * Extracts tone characteristics from decompiled reports.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { ToneProfile } from '../StyleProfile';

/**
 * Extract tone from a decompiled report
 */
export async function extractTone(decompiledReport: DecompiledReport): Promise<ToneProfile> {
  const startTime = Date.now();
  
  try {
    // Analyze text content
    const allText = decompiledReport.sections
      .map(section => section.content)
      .join(' ');
    
    // Basic tone analysis (simplified - would use NLP in production)
    const tone = analyzeToneFromText(allText);
    
    // Calculate confidence based on text length and clarity
    const confidence = calculateToneConfidence(allText, decompiledReport);
    
    return {
      ...tone,
      confidence
    };
    
  } catch (error) {
    console.error('Error extracting tone:', error);
    
    // Return default tone on error
    return {
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
    };
  }
}

/**
 * Analyze tone from text (simplified implementation)
 */
function analyzeToneFromText(text: string): Omit<ToneProfile, 'confidence'> {
  // In a real implementation, this would use NLP libraries
  // For now, use simple heuristics
  
  const words = text.toLowerCase().split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Calculate metrics
  const avgSentenceLength = sentences.length > 0 
    ? words.length / sentences.length 
    : 10;
  
  const formalWords = countFormalWords(words);
  const technicalWords = countTechnicalWords(words);
  const passiveVoiceIndicators = countPassiveVoiceIndicators(text);
  const firstPersonPronouns = countFirstPersonPronouns(text);
  
  // Determine primary tone
  let primaryTone: ToneProfile['primaryTone'] = 'professional';
  
  if (technicalWords > words.length * 0.1) {
    primaryTone = 'technical';
  } else if (formalWords > words.length * 0.15) {
    primaryTone = 'formal';
  } else if (avgSentenceLength < 8) {
    primaryTone = 'concise';
  } else if (avgSentenceLength > 20) {
    primaryTone = 'detailed';
  }
  
  // Determine secondary tones
  const secondaryTones: string[] = [];
  if (technicalWords > 0) secondaryTones.push('technical');
  if (formalWords > words.length * 0.05) secondaryTones.push('formal');
  if (containsPersuasiveLanguage(text)) secondaryTones.push('persuasive');
  if (containsInformativeMarkers(text)) secondaryTones.push('informative');
  
  // Remove primary tone from secondary if present
  const filteredSecondary = secondaryTones.filter(tone => tone !== primaryTone);
  
  // Determine characteristics with proper type casting
  const characteristics = {
    sentenceLength: (avgSentenceLength < 10 ? 'short' : avgSentenceLength > 20 ? 'long' : 'medium') as 'short' | 'medium' | 'long',
    vocabularyComplexity: (technicalWords > words.length * 0.05 ? 'complex' : 'moderate') as 'simple' | 'moderate' | 'complex',
    formalityLevel: (formalWords > words.length * 0.1 ? 'high' : formalWords > words.length * 0.05 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
    passiveVoiceUsage: (passiveVoiceIndicators > sentences.length * 0.3 ? 'high' : passiveVoiceIndicators > sentences.length * 0.1 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
    firstPersonUsage: (firstPersonPronouns > sentences.length * 0.2 ? 'high' : firstPersonPronouns > sentences.length * 0.05 ? 'medium' : 'low') as 'low' | 'medium' | 'high'
  };
  
  // Extract example sentences that demonstrate the tone
  const examples = extractExampleSentences(sentences, primaryTone);
  
  return {
    primaryTone,
    secondaryTones: filteredSecondary,
    characteristics,
    examples
  };
}

/**
 * Calculate confidence in tone analysis
 */
function calculateToneConfidence(text: string, report: DecompiledReport): number {
  let confidence = 0;
  let factors = 0;
  
  // Factor 1: Text length
  const wordCount = text.split(/\s+/).length;
  const lengthFactor = Math.min(wordCount / 500, 1); // More text = more confidence
  confidence += lengthFactor * 0.4;
  factors += 0.4;
  
  // Factor 2: Report confidence
  if (report.confidenceScore) {
    confidence += report.confidenceScore * 0.3;
    factors += 0.3;
  }
  
  // Factor 3: Section structure
  if (report.sections.length > 0) {
    const structureFactor = Math.min(report.sections.length / 10, 1) * 0.3;
    confidence += structureFactor;
    factors += 0.3;
  }
  
  return factors > 0 ? confidence / factors : 0;
}

/**
 * Helper functions for tone analysis
 */
function countFormalWords(words: string[]): number {
  const formalWords = [
    'shall', 'must', 'should', 'hereby', 'thereof', 'wherein', 'pursuant',
    'notwithstanding', 'hereinafter', 'aforementioned', 'whereas'
  ];
  
  return words.filter(word => formalWords.includes(word)).length;
}

function countTechnicalWords(words: string[]): number {
  const technicalWords = [
    'methodology', 'analysis', 'assessment', 'evaluation', 'specification',
    'parameter', 'criterion', 'protocol', 'procedure', 'algorithm',
    'implementation', 'configuration', 'optimization', 'validation'
  ];
  
  return words.filter(word => technicalWords.includes(word)).length;
}

function countPassiveVoiceIndicators(text: string): number {
  const passivePatterns = [
    /\bis\s+[a-z]+\s+by\b/gi,
    /\bare\s+[a-z]+\s+by\b/gi,
    /\bwas\s+[a-z]+\s+by\b/gi,
    /\bwere\s+[a-z]+\s+by\b/gi,
    /\bhas\s+been\s+[a-z]+\b/gi,
    /\bhave\s+been\s+[a-z]+\b/gi,
    /\bhad\s+been\s+[a-z]+\b/gi
  ];
  
  let count = 0;
  for (const pattern of passivePatterns) {
    const matches = text.match(pattern);
    if (matches) count += matches.length;
  }
  
  return count;
}

function countFirstPersonPronouns(text: string): number {
  const firstPersonPatterns = [
    /\bI\b/g,
    /\bme\b/g,
    /\bmy\b/g,
    /\bmine\b/g,
    /\bwe\b/g,
    /\bus\b/g,
    /\bour\b/g,
    /\bours\b/g
  ];
  
  let count = 0;
  for (const pattern of firstPersonPatterns) {
    const matches = text.match(pattern);
    if (matches) count += matches.length;
  }
  
  return count;
}

function containsPersuasiveLanguage(text: string): boolean {
  const persuasiveMarkers = [
    'recommend', 'suggest', 'advise', 'propose', 'urge',
    'essential', 'critical', 'vital', 'important', 'necessary',
    'should', 'must', 'need to', 'ought to'
  ];
  
  return persuasiveMarkers.some(marker => 
    text.toLowerCase().includes(marker.toLowerCase())
  );
}

function containsInformativeMarkers(text: string): boolean {
  const informativeMarkers = [
    'information', 'details', 'specifically', 'namely',
    'for example', 'for instance', 'such as', 'including',
    'according to', 'based on', 'data shows', 'research indicates'
  ];
  
  return informativeMarkers.some(marker => 
    text.toLowerCase().includes(marker.toLowerCase())
  );
}

function extractExampleSentences(
  sentences: string[], 
  primaryTone: string
): string[] {
  // Find sentences that best demonstrate the tone
  const examples: string[] = [];
  
  for (const sentence of sentences) {
    if (sentence.trim().length < 20 || sentence.trim().length > 150) {
      continue; // Skip very short or very long sentences
    }
    
    // Score sentence based on tone indicators
    let score = 0;
    
    switch (primaryTone) {
      case 'formal':
        if (countFormalWords(sentence.toLowerCase().split(/\s+/)) > 0) score += 2;
        if (countPassiveVoiceIndicators(sentence) > 0) score += 1;
        break;
      case 'technical':
        if (countTechnicalWords(sentence.toLowerCase().split(/\s+/)) > 0) score += 2;
        break;
      case 'concise':
        const words = sentence.split(/\s+/);
        if (words.length < 15) score += 2;
        break;
      case 'detailed':
        if (sentence.split(/\s+/).length > 25) score += 2;
        if (sentence.includes(',') || sentence.includes(';')) score += 1;
        break;
    }
    
    if (score > 0) {
      examples.push(sentence.trim());
      if (examples.length >= 3) break; // Limit to 3 examples
    }
  }
  
  return examples;
}