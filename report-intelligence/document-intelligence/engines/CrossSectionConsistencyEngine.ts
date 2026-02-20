/**
 * Phase 24: Document Intelligence Layer
 * Cross-Section Consistency Detection Engine
 * 
 * Detects inconsistencies across document sections including:
 * - Terminology consistency (same concept, different terms)
 * - Formatting consistency (headings, lists, numbering)
 * - Style consistency (tone, formality, voice)
 * - Factual consistency (contradictory statements)
 * - Temporal consistency (timeline conflicts)
 * - Numerical consistency (data discrepancies)
 */

import type { DocumentSection, ConsistencyCheck } from '../types/DocumentAnalysis';
import type { Inconsistency } from '../types/ContentAnalysis';

/**
 * Cross-Section Consistency Detection Engine
 * 
 * Analyzes document sections for inconsistencies and contradictions
 * across the entire document or between specific sections.
 */
export class CrossSectionConsistencyEngine {
  /**
   * Analyze consistency across all document sections
   */
  analyzeConsistency(sections: DocumentSection[]): ConsistencyCheck[] {
    const checks: ConsistencyCheck[] = [];
    
    // 1. Terminology consistency check
    checks.push(this.checkTerminologyConsistency(sections));
    
    // 2. Formatting consistency check
    checks.push(this.checkFormattingConsistency(sections));
    
    // 3. Style consistency check
    checks.push(this.checkStyleConsistency(sections));
    
    // 4. Factual consistency check
    checks.push(this.checkFactualConsistency(sections));
    
    // 5. Temporal consistency check
    checks.push(this.checkTemporalConsistency(sections));
    
    // 6. Numerical consistency check
    checks.push(this.checkNumericalConsistency(sections));
    
    return checks.filter(check => check !== null) as ConsistencyCheck[];
  }
  
  /**
   * Check terminology consistency across sections
   */
  private checkTerminologyConsistency(sections: DocumentSection[]): ConsistencyCheck {
    const inconsistencies: Inconsistency[] = [];
    const termVariations = this.extractTermVariations(sections);
    
    // Find terms with multiple variations
    for (const [baseTerm, variations] of Object.entries(termVariations)) {
      if (variations.size > 1) {
        const variationArray = Array.from(variations);
        
        // Create inconsistency for each pair of variations
        for (let i = 0; i < variationArray.length - 1; i++) {
          for (let j = i + 1; j < variationArray.length; j++) {
            const firstOccurrence = this.findTermOccurrence(sections, variationArray[i]);
            const secondOccurrence = this.findTermOccurrence(sections, variationArray[j]);
            
            if (firstOccurrence && secondOccurrence) {
              inconsistencies.push({
                type: 'terminology',
                firstOccurrence: {
                  text: variationArray[i],
                  location: firstOccurrence.location
                },
                secondOccurrence: {
                  text: variationArray[j],
                  location: secondOccurrence.location
                },
                suggestedCorrection: `Use consistent terminology: prefer "${this.selectPreferredTerm(variationArray)}"`
              });
            }
          }
        }
      }
    }
    
    return {
      type: 'terminology',
      result: inconsistencies.length === 0 ? 'consistent' : 'inconsistent',
      inconsistencies: inconsistencies.length > 0 ? inconsistencies : undefined,
      impact: inconsistencies.length > 3 ? 'high' : inconsistencies.length > 0 ? 'medium' : 'low'
    };
  }
  
  /**
   * Check formatting consistency across sections
   */
  private checkFormattingConsistency(sections: DocumentSection[]): ConsistencyCheck {
    const inconsistencies: Inconsistency[] = [];
    const headingStyles = this.analyzeHeadingStyles(sections);
    const listStyles = this.analyzeListStyles(sections);
    
    // Check heading style consistency
    if (headingStyles.hasMultipleStyles) {
      inconsistencies.push({
        type: 'formatting',
        firstOccurrence: {
          text: headingStyles.examples[0] || 'Heading',
          location: { startIndex: 0, endIndex: 0 }
        },
        secondOccurrence: {
          text: headingStyles.examples[1] || 'Different heading',
          location: { startIndex: 0, endIndex: 0 }
        },
        suggestedCorrection: 'Use consistent heading styles (same capitalization, punctuation)'
      });
    }
    
    // Check list style consistency
    if (listStyles.hasMultipleStyles) {
      inconsistencies.push({
        type: 'formatting',
        firstOccurrence: {
          text: 'List item',
          location: { startIndex: 0, endIndex: 0 }
        },
        secondOccurrence: {
          text: 'Different list style',
          location: { startIndex: 0, endIndex: 0 }
        },
        suggestedCorrection: 'Use consistent list formatting (bullets vs numbers, indentation)'
      });
    }
    
    return {
      type: 'formatting',
      result: inconsistencies.length === 0 ? 'consistent' : 'inconsistent',
      inconsistencies: inconsistencies.length > 0 ? inconsistencies : undefined,
      impact: 'medium'
    };
  }
  
  /**
   * Check style consistency across sections
   */
  private checkStyleConsistency(sections: DocumentSection[]): ConsistencyCheck {
    const inconsistencies: Inconsistency[] = [];
    const styleMetrics = this.analyzeStyleMetrics(sections);
    
    // Check for significant tone shifts
    if (styleMetrics.hasSignificantToneShift) {
      inconsistencies.push({
        type: 'style',
        firstOccurrence: {
          text: styleMetrics.toneExamples[0] || 'Formal text',
          location: { startIndex: 0, endIndex: 0 }
        },
        secondOccurrence: {
          text: styleMetrics.toneExamples[1] || 'Informal text',
          location: { startIndex: 0, endIndex: 0 }
        },
        suggestedCorrection: 'Maintain consistent tone throughout document'
      });
    }
    
    // Check for voice shifts (active vs passive)
    if (styleMetrics.hasVoiceShift) {
      inconsistencies.push({
        type: 'voice',
        firstOccurrence: {
          text: 'Active voice example',
          location: { startIndex: 0, endIndex: 0 }
        },
        secondOccurrence: {
          text: 'Passive voice example',
          location: { startIndex: 0, endIndex: 0 }
        },
        suggestedCorrection: 'Use consistent voice (prefer active voice for clarity)'
      });
    }
    
    return {
      type: 'style',
      result: inconsistencies.length === 0 ? 'consistent' : 'inconsistent',
      inconsistencies: inconsistencies.length > 0 ? inconsistencies : undefined,
      impact: 'medium'
    };
  }
  
  /**
   * Check factual consistency across sections
   */
  private checkFactualConsistency(sections: DocumentSection[]): ConsistencyCheck {
    const inconsistencies: Inconsistency[] = [];
    const statements = this.extractFactualStatements(sections);
    
    // Simple contradiction detection based on keyword analysis
    const contradictions = this.detectContradictions(statements);
    
    for (const contradiction of contradictions) {
      inconsistencies.push({
        type: 'terminology', // Using terminology as closest match
        firstOccurrence: {
          text: contradiction.statement1,
          location: contradiction.location1
        },
        secondOccurrence: {
          text: contradiction.statement2,
          location: contradiction.location2
        },
        suggestedCorrection: 'Review and reconcile contradictory statements'
      });
    }
    
    return {
      type: 'terminology',
      result: inconsistencies.length === 0 ? 'consistent' : 'inconsistent',
      inconsistencies: inconsistencies.length > 0 ? inconsistencies : undefined,
      impact: 'high'
    };
  }
  
  /**
   * Check temporal consistency across sections
   */
  private checkTemporalConsistency(sections: DocumentSection[]): ConsistencyCheck {
    const inconsistencies: Inconsistency[] = [];
    const timeline = this.extractTimeline(sections);
    const conflicts = this.detectTimelineConflicts(timeline);
    
    for (const conflict of conflicts) {
      inconsistencies.push({
        type: 'tense', // Using tense as closest match for temporal
        firstOccurrence: {
          text: conflict.event1,
          location: conflict.location1
        },
        secondOccurrence: {
          text: conflict.event2,
          location: conflict.location2
        },
        suggestedCorrection: 'Ensure chronological consistency in timeline'
      });
    }
    
    return {
      type: 'tense',
      result: inconsistencies.length === 0 ? 'consistent' : 'inconsistent',
      inconsistencies: inconsistencies.length > 0 ? inconsistencies : undefined,
      impact: 'medium'
    };
  }
  
  /**
   * Check numerical consistency across sections
   */
  private checkNumericalConsistency(sections: DocumentSection[]): ConsistencyCheck {
    const inconsistencies: Inconsistency[] = [];
    const numericalData = this.extractNumericalData(sections);
    const discrepancies = this.detectNumericalDiscrepancies(numericalData);
    
    for (const discrepancy of discrepancies) {
      inconsistencies.push({
        type: 'number-format',
        firstOccurrence: {
          text: discrepancy.value1.toString(),
          location: discrepancy.location1
        },
        secondOccurrence: {
          text: discrepancy.value2.toString(),
          location: discrepancy.location2
        },
        suggestedCorrection: `Verify numerical data: ${discrepancy.description}`
      });
    }
    
    return {
      type: 'number-format',
      result: inconsistencies.length === 0 ? 'consistent' : 'inconsistent',
      inconsistencies: inconsistencies.length > 0 ? inconsistencies : undefined,
      impact: 'high'
    };
  }
  
  // ========== Helper Methods ==========
  
  /**
   * Extract term variations from sections
   */
  private extractTermVariations(sections: DocumentSection[]): Record<string, Set<string>> {
    const termMap: Record<string, Set<string>> = {};
    
    // Simple term extraction based on noun phrases
    for (const section of sections) {
      const words = section.content.toLowerCase().split(/\W+/).filter(w => w.length > 4);
      
      // Group similar terms (simplified)
      for (const word of words) {
        const baseForm = this.getBaseTerm(word);
        if (!termMap[baseForm]) {
          termMap[baseForm] = new Set();
        }
        termMap[baseForm].add(word);
      }
    }
    
    // Filter out terms with only one variation
    const result: Record<string, Set<string>> = {};
    for (const [baseTerm, variations] of Object.entries(termMap)) {
      if (variations.size > 1) {
        result[baseTerm] = variations;
      }
    }
    
    return result;
  }
  
  /**
   * Get base form of a term (simplified)
   */
  private getBaseTerm(term: string): string {
    // Remove common suffixes
    return term.replace(/(ing|ed|s|es|ly|ment|ness|ity|tion|sion)$/, '');
  }
  
  /**
   * Find occurrence of a term in sections
   */
  private findTermOccurrence(sections: DocumentSection[], term: string): { text: string; location: { startIndex: number; endIndex: number } } | null {
    for (const section of sections) {
      const index = section.content.toLowerCase().indexOf(term.toLowerCase());
      if (index !== -1) {
        return {
          text: section.content.substring(index, index + term.length),
          location: {
            startIndex: section.startIndex + index,
            endIndex: section.startIndex + index + term.length
          }
        };
      }
    }
    return null;
  }
  
  /**
   * Select preferred term from variations
   */
  private selectPreferredTerm(variations: string[]): string {
    // Simple heuristic: prefer the most frequent or shortest
    return variations.reduce((a, b) => a.length < b.length ? a : b);
  }
  
  /**
   * Analyze heading styles across sections
   */
  private analyzeHeadingStyles(sections: DocumentSection[]): { hasMultipleStyles: boolean; examples: string[] } {
    const styles = new Set<string>();
    const examples: string[] = [];
    
    for (const section of sections) {
      if (section.title) {
        const style = this.analyzeHeadingStyle(section.title);
        styles.add(style);
        if (examples.length < 2) {
          examples.push(section.title);
        }
      }
    }
    
    return {
      hasMultipleStyles: styles.size > 1,
      examples
    };
  }
  
  /**
   * Analyze style of a heading
   */
  private analyzeHeadingStyle(heading: string): string {
    // Simple style classification
    if (heading === heading.toUpperCase()) return 'ALL_CAPS';
    if (heading.match(/^[A-Z]/) && heading.match(/[a-z]/)) return 'Title_Case';
    if (heading.match(/^[a-z]/)) return 'sentence_case';
    return 'mixed';
  }
  
  /**
   * Analyze list styles across sections
   */
  private analyzeListStyles(sections: DocumentSection[]): { hasMultipleStyles: boolean } {
    const hasBulletLists = sections.some(s => s.content.includes('•') || s.content.includes('- ') || s.content.includes('* '));
    const hasNumberedLists = sections.some(s => s.content.match(/\d+\.\s/));
    
    return {
      hasMultipleStyles: hasBulletLists && hasNumberedLists
    };
  }
  
  /**
   * Analyze style metrics across sections
   */
  private analyzeStyleMetrics(sections: DocumentSection[]): { 
    hasSignificantToneShift: boolean; 
    hasVoiceShift: boolean;
    toneExamples: string[];
  } {
    const formalWords = ['therefore', 'however', 'moreover', 'consequently', 'thus'];
    const informalWords = ['like', 'just', 'really', 'totally', 'awesome'];
    
    let formalCount = 0;
    let informalCount = 0;
    const toneExamples: string[] = [];
    
    for (const section of sections) {
      const content = section.content.toLowerCase();
      const formalMatches = formalWords.filter(w => content.includes(w)).length;
      const informalMatches = informalWords.filter(w => content.includes(w)).length;
      
      if (formalMatches > informalMatches) formalCount++;
      if (informalMatches > formalMatches) informalCount++;
      
      // Collect example snippets
      if (formalMatches > 0 && toneExamples.length < 2) {
        toneExamples.push(this.extractSnippet(content, formalWords));
      }
      if (informalMatches > 0 && toneExamples.length < 2) {
        toneExamples.push(this.extractSnippet(content, informalWords));
      }
    }
    
    return {
      hasSignificantToneShift: formalCount > 0 && informalCount > 0,
      hasVoiceShift: false, // Simplified
      toneExamples
    };
  }
  
  /**
   * Extract snippet containing target words
   */
  private extractSnippet(content: string, targetWords: string[]): string {
    for (const word of targetWords) {
      const index = content.indexOf(word);
      if (index !== -1) {
        const start = Math.max(0, index - 20);
        const end = Math.min(content.length, index + word.length + 20);
        return content.substring(start, end) + '...';
      }
    }
    return '...';
  }
  
  /**
   * Extract factual statements from sections
   */
  private extractFactualStatements(sections: DocumentSection[]): Array<{ statement: string; location: { startIndex: number; endIndex: number } }> {
    const statements: Array<{ statement: string; location: { startIndex: number; endIndex: number } }> = [];
    
    // Simple extraction based on sentence patterns
    for (const section of sections) {
      const sentences = section.content.split(/[.!?]+/);
      let currentIndex = section.startIndex;
      
      for (const sentence of sentences) {
        if (sentence.trim().length > 10) {
          // Check if sentence appears factual (contains numbers or strong verbs)
          if (sentence.match(/\d+/) || sentence.match(/(is|are|was|were|has|have|shows|indicates|demonstrates)/i)) {
            statements.push({
              statement: sentence.trim(),
              location: {
                startIndex: currentIndex,
                endIndex: currentIndex + sentence.length
              }
            });
          }
        }
        currentIndex += sentence.length + 1; // +1 for punctuation
      }
    }
    
    return statements;
  }
  
  /**
   * Detect contradictions in statements
   */
  private detectContradictions(statements: Array<{ statement: string; location: { startIndex: number; endIndex: number } }>): Array<{
    statement1: string;
    statement2: string;
    location1: { startIndex: number; endIndex: number };
    location2: { startIndex: number; endIndex: number };
  }> {
    const contradictions: Array<{
      statement1: string;
      statement2: string;
      location1: { startIndex: number; endIndex: number };
      location2: { startIndex: number; endIndex: number };
    }> = [];
    
    // Simple contradiction detection based on negation patterns
    for (let i = 0; i < statements.length; i++) {
      for (let j = i + 1; j < statements.length; j++) {
        const stmt1 = statements[i].statement.toLowerCase();
        const stmt2 = statements[j].statement.toLowerCase();
        
        // Check for direct negations
        if (this.areContradictory(stmt1, stmt2)) {
          contradictions.push({
            statement1: statements[i].statement,
            statement2: statements[j].statement,
            location1: statements[i].location,
            location2: statements[j].location
          });
        }
      }
    }
    
    return contradictions;
  }
  
  /**
   * Check if two statements are contradictory
   */
  private areContradictory(stmt1: string, stmt2: string): boolean {
    // Simple contradiction detection
    const negationWords = ['not', 'never', 'no', 'none', 'nothing', 'nowhere'];
    const positiveWords = ['always', 'all', 'every', 'each', 'any'];
    
    // Check for direct negation patterns
    for (const negWord of negationWords) {
      if (stmt1.includes(negWord) && !stmt2.includes(negWord)) {
        // If stmt1 has negation and stmt2 doesn't, check if they're about the same thing
        const base1 = stmt1.replace(negWord, '').trim();
        const base2 = stmt2.trim();
        if (base1.includes(base2.substring(0, Math.min(base2.length, 10))) ||
            base2.includes(base1.substring(0, Math.min(base1.length, 10)))) {
          return true;
        }
      }
    }
    
    // Check for "always" vs "never" contradictions
    if ((stmt1.includes('always') && stmt2.includes('never')) ||
        (stmt1.includes('never') && stmt2.includes('always'))) {
      return true;
    }
    
    // Check for "all" vs "none" contradictions
    if ((stmt1.includes('all') && stmt2.includes('none')) ||
        (stmt1.includes('none') && stmt2.includes('all'))) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Extract timeline from sections
   */
  private extractTimeline(sections: DocumentSection[]): Array<{
    event: string;
    timeReference: string;
    location: { startIndex: number; endIndex: number };
  }> {
    const timeline: Array<{
      event: string;
      timeReference: string;
      location: { startIndex: number; endIndex: number };
    }> = [];
    
    const timePatterns = [
      /\b(in|during|on)\s+\d{4}\b/i,
      /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\b/i,
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/,
      /\b(before|after|since|until)\s+\d{4}\b/i
    ];
    
    for (const section of sections) {
      const sentences = section.content.split(/[.!?]+/);
      let currentIndex = section.startIndex;
      
      for (const sentence of sentences) {
        for (const pattern of timePatterns) {
          const match = sentence.match(pattern);
          if (match) {
            timeline.push({
              event: sentence.trim(),
              timeReference: match[0],
              location: {
                startIndex: currentIndex,
                endIndex: currentIndex + sentence.length
              }
            });
            break;
          }
        }
        currentIndex += sentence.length + 1;
      }
    }
    
    return timeline;
  }
  
  /**
   * Detect timeline conflicts
   */
  private detectTimelineConflicts(timeline: Array<{
    event: string;
    timeReference: string;
    location: { startIndex: number; endIndex: number };
  }>): Array<{
    event1: string;
    event2: string;
    location1: { startIndex: number; endIndex: number };
    location2: { startIndex: number; endIndex: number };
  }> {
    const conflicts: Array<{
      event1: string;
      event2: string;
      location1: { startIndex: number; endIndex: number };
      location2: { startIndex: number; endIndex: number };
    }> = [];
    
    // Simple conflict detection based on time references
    for (let i = 0; i < timeline.length; i++) {
      for (let j = i + 1; j < timeline.length; j++) {
        const time1 = this.parseTimeReference(timeline[i].timeReference);
        const time2 = this.parseTimeReference(timeline[j].timeReference);
        
        if (time1 && time2) {
          // Check if events are similar but times are contradictory
          const similarEvents = this.areSimilarEvents(timeline[i].event, timeline[j].event);
          if (similarEvents && Math.abs(time1 - time2) > 365) { // More than a year difference
            conflicts.push({
              event1: timeline[i].event,
              event2: timeline[j].event,
              location1: timeline[i].location,
              location2: timeline[j].location
            });
          }
        }
      }
    }
    
    return conflicts;
  }
  
  /**
   * Parse time reference to year (simplified)
   */
  private parseTimeReference(timeRef: string): number | null {
    const yearMatch = timeRef.match(/\d{4}/);
    if (yearMatch) {
      return parseInt(yearMatch[0], 10);
    }
    return null;
  }
  
  /**
   * Check if two events are similar
   */
  private areSimilarEvents(event1: string, event2: string): boolean {
    const words1 = event1.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const words2 = event2.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    
    // Count overlapping words
    const overlap = words1.filter(w => words2.includes(w)).length;
    const totalUnique = new Set([...words1, ...words2]).size;
    
    return overlap > 0 && overlap / totalUnique > 0.3; // 30% overlap
  }
  
  /**
   * Extract numerical data from sections
   */
  private extractNumericalData(sections: DocumentSection[]): Array<{
    value: number;
    unit: string;
    context: string;
    location: { startIndex: number; endIndex: number };
  }> {
    const numericalData: Array<{
      value: number;
      unit: string;
      context: string;
      location: { startIndex: number; endIndex: number };
    }> = [];
    
    const numberPattern = /\b\d+(?:\.\d+)?\b/g;
    const unitPatterns = ['%', 'kg', 'm', 'cm', 'mm', 'km', 'g', 'mg', 'ml', 'l', '°C', '°F', 'USD', '£', '€'];
    
    for (const section of sections) {
      let match;
      while ((match = numberPattern.exec(section.content)) !== null) {
        const value = parseFloat(match[0]);
        const startIndex = section.startIndex + match.index;
        const endIndex = startIndex + match[0].length;
        
        // Look for unit in surrounding text
        let unit = '';
        const contextStart = Math.max(0, match.index - 10);
        const contextEnd = Math.min(section.content.length, match.index + match[0].length + 10);
        const context = section.content.substring(contextStart, contextEnd);
        
        for (const unitPattern of unitPatterns) {
          if (context.includes(unitPattern)) {
            unit = unitPattern;
            break;
          }
        }
        
        numericalData.push({
          value,
          unit,
          context,
          location: { startIndex, endIndex }
        });
      }
    }
    
    return numericalData;
  }
  
  /**
   * Detect numerical discrepancies
   */
  private detectNumericalDiscrepancies(data: Array<{
    value: number;
    unit: string;
    context: string;
    location: { startIndex: number; endIndex: number };
  }>): Array<{
    value1: number;
    value2: number;
    location1: { startIndex: number; endIndex: number };
    location2: { startIndex: number; endIndex: number };
    description: string;
  }> {
    const discrepancies: Array<{
      value1: number;
      value2: number;
      location1: { startIndex: number; endIndex: number };
      location2: { startIndex: number; endIndex: number };
      description: string;
    }> = [];
    
    // Group by unit and context similarity
    for (let i = 0; i < data.length; i++) {
      for (let j = i + 1; j < data.length; j++) {
        if (data[i].unit === data[j].unit && this.areSimilarContexts(data[i].context, data[j].context)) {
          const diff = Math.abs(data[i].value - data[j].value);
          const avg = (data[i].value + data[j].value) / 2;
          const percentDiff = avg > 0 ? (diff / avg) * 100 : 0;
          
          if (percentDiff > 10) { // More than 10% difference
            discrepancies.push({
              value1: data[i].value,
              value2: data[j].value,
              location1: data[i].location,
              location2: data[j].location,
              description: `${data[i].value}${data[i].unit} vs ${data[j].value}${data[j].unit} (${percentDiff.toFixed(1)}% difference)`
            });
          }
        }
      }
    }
    
    return discrepancies;
  }
  
  /**
   * Check if contexts are similar
   */
  private areSimilarContexts(context1: string, context2: string): boolean {
    const words1 = context1.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const words2 = context2.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    
    const overlap = words1.filter(w => words2.includes(w)).length;
    return overlap >= 2; // At least 2 overlapping significant words
  }
}