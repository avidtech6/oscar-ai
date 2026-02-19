/**
 * Report Style Learner - Phase 5
 * Paragraph Patterns Extractor
 * 
 * Extracts paragraph patterns from decompiled reports.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { ParagraphPattern } from '../StyleProfile';

/**
 * Extract paragraph patterns from a decompiled report
 */
export async function extractParagraphPatterns(decompiledReport: DecompiledReport): Promise<ParagraphPattern[]> {
  try {
    const patterns: ParagraphPattern[] = [];
    
    // Extract paragraphs from all sections
    const allParagraphs = extractAllParagraphs(decompiledReport);
    
    if (allParagraphs.length === 0) {
      return [];
    }
    
    // Analyze paragraph structures
    const paragraphAnalyses = analyzeParagraphStructures(allParagraphs);
    
    // Group similar patterns
    const groupedPatterns = groupSimilarParagraphPatterns(paragraphAnalyses);
    
    // Convert to ParagraphPattern format
    for (const group of groupedPatterns) {
      if (group.paragraphs.length >= 2) { // Need at least 2 examples
        patterns.push({
          structure: group.structure as ParagraphPattern['structure'],
          averageLength: calculateAverageLength(group.paragraphs),
          transitionUsage: determineTransitionUsage(group.paragraphs),
          examples: group.paragraphs.slice(0, 2) // Limit to 2 examples
        });
      }
    }
    
    return patterns;
    
  } catch (error) {
    console.error('Error extracting paragraph patterns:', error);
    return [];
  }
}

/**
 * Extract all paragraphs from decompiled report
 */
function extractAllParagraphs(report: DecompiledReport): string[] {
  const paragraphs: string[] = [];
  
  for (const section of report.sections) {
    const sectionParagraphs = section.content
      .split(/\n\s*\n/) // Split by blank lines
      .map(p => p.trim())
      .filter(p => p.length > 50 && p.length < 500); // Filter reasonable length
    
    paragraphs.push(...sectionParagraphs);
  }
  
  return paragraphs;
}

/**
 * Analyze paragraph structures
 */
function analyzeParagraphStructures(paragraphs: string[]): Array<{
  paragraph: string;
  structure: ParagraphPattern['structure'];
  sentenceCount: number;
  hasTopicSentence: boolean;
  hasConclusion: boolean;
}> {
  return paragraphs.map(paragraph => {
    const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length;
    
    // Determine structure
    const structure = determineParagraphStructure(paragraph, sentences);
    
    return {
      paragraph,
      structure,
      sentenceCount,
      hasTopicSentence: hasTopicSentence(paragraph, sentences),
      hasConclusion: hasConclusionSentence(paragraph, sentences)
    };
  });
}

/**
 * Determine paragraph structure
 */
function determineParagraphStructure(paragraph: string, sentences: string[]): ParagraphPattern['structure'] {
  if (sentences.length === 0) return 'explanatory';
  
  // Check for list structure
  if (paragraph.match(/(?:^|\n)[•\-*]\s|\d+\.\s|\(\d+\)/)) {
    return 'list';
  }
  
  // Check for narrative structure
  if (paragraph.match(/I\s|we\s|our\s|my\s/) && sentences.length > 3) {
    return 'narrative';
  }
  
  // Check topic sentence position
  const firstSentence = sentences[0].toLowerCase();
  const lastSentence = sentences[sentences.length - 1].toLowerCase();
  
  const firstIsTopic = firstSentence.includes('this') || firstSentence.includes('the') || 
                       firstSentence.includes('in this') || firstSentence.includes('this section');
  const lastIsTopic = lastSentence.includes('therefore') || lastSentence.includes('thus') ||
                      lastSentence.includes('in conclusion') || lastSentence.includes('summary');
  
  if (firstIsTopic && !lastIsTopic) return 'topic-sentence-first';
  if (!firstIsTopic && lastIsTopic) return 'topic-sentence-last';
  if (firstIsTopic && lastIsTopic) return 'sandwich';
  
  return 'explanatory';
}

/**
 * Group similar paragraph patterns
 */
function groupSimilarParagraphPatterns(
  analyses: Array<{ paragraph: string; structure: string }>
): Array<{ structure: string; paragraphs: string[] }> {
  const groups = new Map<string, string[]>();
  
  for (const analysis of analyses) {
    if (!groups.has(analysis.structure)) {
      groups.set(analysis.structure, []);
    }
    groups.get(analysis.structure)!.push(analysis.paragraph);
  }
  
  return Array.from(groups.entries()).map(([structure, paragraphs]) => ({
    structure: structure as ParagraphPattern['structure'],
    paragraphs
  }));
}

/**
 * Calculate average paragraph length
 */
function calculateAverageLength(paragraphs: string[]): number {
  if (paragraphs.length === 0) return 0;
  
  const totalSentences = paragraphs.reduce((sum, paragraph) => {
    return sum + paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  }, 0);
  
  return Math.round(totalSentences / paragraphs.length);
}

/**
 * Determine transition usage
 */
function determineTransitionUsage(paragraphs: string[]): 'low' | 'medium' | 'high' {
  if (paragraphs.length === 0) return 'low';
  
  let transitionCount = 0;
  const transitionWords = [
    'however', 'therefore', 'consequently', 'furthermore', 'moreover',
    'additionally', 'similarly', 'likewise', 'conversely', 'nevertheless',
    'nonetheless', 'thus', 'hence', 'accordingly', 'subsequently'
  ];
  
  for (const paragraph of paragraphs) {
    const lowerParagraph = paragraph.toLowerCase();
    for (const word of transitionWords) {
      if (lowerParagraph.includes(word)) {
        transitionCount++;
        break; // Count each paragraph only once
      }
    }
  }
  
  const usagePercentage = transitionCount / paragraphs.length;
  
  if (usagePercentage > 0.3) return 'high';
  if (usagePercentage > 0.1) return 'medium';
  return 'low';
}

/**
 * Helper functions
 */
function hasTopicSentence(paragraph: string, sentences: string[]): boolean {
  if (sentences.length === 0) return false;
  
  const firstSentence = sentences[0].toLowerCase();
  const topicIndicators = [
    'this', 'the purpose', 'this section', 'this report',
    'overview', 'introduction', 'summary'
  ];
  
  return topicIndicators.some(indicator => firstSentence.includes(indicator));
}

function hasConclusionSentence(paragraph: string, sentences: string[]): boolean {
  if (sentences.length === 0) return false;
  
  const lastSentence = sentences[sentences.length - 1].toLowerCase();
  const conclusionIndicators = [
    'therefore', 'thus', 'in conclusion', 'to summarize',
    'in summary', 'consequently', 'as a result'
  ];
  
  return conclusionIndicators.some(indicator => lastSentence.includes(indicator));
}