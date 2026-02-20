/**
 * Phase 24: Document Intelligence Layer
 * Tone Control Engine
 * 
 * Analyzes and controls document tone across:
 * - Overall document tone assessment
 * - Section-level tone consistency
 * - Tone adjustment recommendations
 * - Tone target matching
 * - Emotional tone analysis
 * - Formality level control
 */

import type { DocumentSection } from '../types/DocumentAnalysis';
import type { ToneAnalysis, EmotionalTone } from '../types/DocumentAnalysis';

/**
 * Tone control options
 */
export interface ToneControlOptions {
  /** Target tone */
  targetTone: 'formal' | 'informal' | 'academic' | 'conversational' | 'persuasive' | 'neutral';
  /** Target emotional tone */
  targetEmotionalTone?: EmotionalTone['valence'];
  /** Target formality level (1-10) */
  targetFormalityLevel: number;
  /** Whether to enforce consistency */
  enforceConsistency: boolean;
  /** Whether to allow mixed tones */
  allowMixedTones: boolean;
  /** Maximum tone shifts allowed */
  maxToneShifts: number;
  /** Target audience */
  targetAudience: 'general' | 'technical' | 'executive' | 'academic';
}

/**
 * Tone analysis result
 */
export interface ToneAnalysisResult {
  /** Overall document tone */
  overallTone: ToneAnalysis;
  /** Section tones */
  sectionTones: Map<string, ToneAnalysis>;
  /** Tone consistency score (0-1) */
  consistencyScore: number;
  /** Tone shifts detected */
  toneShifts: ToneShift[];
  /** Recommendations for tone improvement */
  recommendations: ToneRecommendation[];
  /** Target tone match score (0-1) */
  targetMatchScore: number;
}

/**
 * Tone shift detection
 */
export interface ToneShift {
  /** From section */
  fromSectionId: string;
  /** To section */
  toSectionId: string;
  /** From tone */
  fromTone: ToneAnalysis['primaryTone'];
  /** To tone */
  toTone: ToneAnalysis['primaryTone'];
  /** Shift magnitude (0-1) */
  magnitude: number;
  /** Whether shift is appropriate */
  isAppropriate: boolean;
  /** Explanation */
  explanation: string;
}

/**
 * Tone recommendation
 */
export interface ToneRecommendation {
  /** Type of recommendation */
  type: 'tone-adjustment' | 'consistency-improvement' | 'emotional-tone-adjustment' | 'formality-adjustment';
  /** Section ID (if section-specific) */
  sectionId?: string;
  /** Description */
  description: string;
  /** Suggested action */
  suggestedAction: string;
  /** Priority */
  priority: 'low' | 'medium' | 'high';
  /** Expected impact */
  expectedImpact: 'minor' | 'moderate' | 'major';
}

/**
 * Tone Control Engine
 * 
 * Analyzes and controls document tone for consistency and appropriateness
 */
export class ToneControlEngine {
  /**
   * Analyze tone across document sections
   */
  analyzeTone(
    sections: DocumentSection[],
    options: Partial<ToneControlOptions> = {}
  ): ToneAnalysisResult {
    const fullOptions: ToneControlOptions = {
      targetTone: 'neutral',
      targetFormalityLevel: 5,
      enforceConsistency: true,
      allowMixedTones: false,
      maxToneShifts: 3,
      targetAudience: 'general',
      ...options
    };
    
    // Analyze tone for each section
    const sectionTones = new Map<string, ToneAnalysis>();
    for (const section of sections) {
      const tone = this.analyzeSectionTone(section);
      sectionTones.set(section.id, tone);
    }
    
    // Calculate overall document tone
    const overallTone = this.calculateOverallTone(Array.from(sectionTones.values()));
    
    // Detect tone shifts
    const toneShifts = this.detectToneShifts(sections, sectionTones);
    
    // Calculate consistency score
    const consistencyScore = this.calculateConsistencyScore(sectionTones, toneShifts);
    
    // Generate recommendations
    const recommendations = this.generateToneRecommendations(
      sections,
      sectionTones,
      overallTone,
      toneShifts,
      fullOptions
    );
    
    // Calculate target match score
    const targetMatchScore = this.calculateTargetMatchScore(overallTone, fullOptions);
    
    return {
      overallTone,
      sectionTones,
      consistencyScore,
      toneShifts,
      recommendations,
      targetMatchScore
    };
  }
  
  /**
   * Adjust tone to match target
   */
  adjustTone(
    sections: DocumentSection[],
    targetOptions: ToneControlOptions
  ): DocumentSection[] {
    const adjustedSections: DocumentSection[] = [];
    
    for (const section of sections) {
      const adjustedSection = { ...section };
      const currentTone = this.analyzeSectionTone(section);
      
      // Check if tone needs adjustment
      if (currentTone.primaryTone !== targetOptions.targetTone) {
        // Adjust section content tone
        const adjustedContent = this.adjustSectionTone(
          section.content,
          currentTone,
          targetOptions
        );
        
        adjustedSection.content = adjustedContent;
        
        // Re-analyze tone for adjusted section
        const newTone = this.analyzeSectionTone(adjustedSection);
        adjustedSection.tone = newTone;
      }
      
      adjustedSections.push(adjustedSection);
    }
    
    return adjustedSections;
  }
  
  /**
   * Analyze tone of a single section
   */
  private analyzeSectionTone(section: DocumentSection): ToneAnalysis {
    const content = section.content;
    
    // Analyze formality
    const formalityScore = this.analyzeFormality(content);
    
    // Analyze emotional tone
    const emotionalTone = this.analyzeEmotionalTone(content);
    
    // Determine primary tone based on analysis
    const primaryTone = this.determinePrimaryTone(content, formalityScore, emotionalTone);
    
    // Identify secondary tones
    const secondaryTones = this.identifySecondaryTones(content);
    
    // Calculate consistency (within this section)
    const consistencyScore = this.calculateSectionConsistency(content);
    
    // Determine appropriateness (simplified)
    const appropriateness = this.determineAppropriateness(primaryTone, section);
    
    return {
      primaryTone,
      secondaryTones,
      consistencyScore,
      appropriateness,
      emotionalTone
    };
  }
  
  /**
   * Analyze formality of text
   */
  private analyzeFormality(text: string): number {
    // Formality indicators
    const formalIndicators = [
      'therefore', 'however', 'moreover', 'consequently', 'thus', 'furthermore',
      'nevertheless', 'hence', 'wherein', 'heretofore', 'aforementioned'
    ];
    
    const informalIndicators = [
      'like', 'just', 'really', 'totally', 'awesome', 'cool', 'guy', 'stuff',
      'thing', 'get', 'got', 'gotten', 'make sure', 'check out', 'figure out'
    ];
    
    const words = text.toLowerCase().split(/\W+/);
    
    let formalCount = 0;
    let informalCount = 0;
    
    for (const word of words) {
      if (formalIndicators.includes(word)) formalCount++;
      if (informalIndicators.includes(word)) informalCount++;
    }
    
    // Calculate formality score (0-10)
    const totalIndicators = formalCount + informalCount;
    if (totalIndicators === 0) return 5; // Neutral
    
    const rawScore = (formalCount / totalIndicators) * 10;
    return Math.min(10, Math.max(0, rawScore));
  }
  
  /**
   * Analyze emotional tone of text
   */
  private analyzeEmotionalTone(text: string): EmotionalTone | undefined {
    const positiveWords = [
      'good', 'great', 'excellent', 'wonderful', 'fantastic', 'amazing',
      'positive', 'beneficial', 'advantageous', 'successful', 'happy', 'joyful'
    ];
    
    const negativeWords = [
      'bad', 'poor', 'terrible', 'awful', 'horrible', 'negative',
      'detrimental', 'harmful', 'unsuccessful', 'failed', 'sad', 'unhappy'
    ];
    
    const words = text.toLowerCase().split(/\W+/);
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    for (const word of words) {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    }
    
    const totalEmotionalWords = positiveCount + negativeCount;
    if (totalEmotionalWords === 0) return undefined;
    
    let valence: EmotionalTone['valence'] = 'neutral';
    if (positiveCount > negativeCount * 2) valence = 'positive';
    else if (negativeCount > positiveCount * 2) valence = 'negative';
    else if (positiveCount > 0 && negativeCount > 0) valence = 'mixed';
    
    const intensity = totalEmotionalWords / words.length;
    
    const dominantEmotions: string[] = [];
    if (positiveCount > 0) dominantEmotions.push('positive');
    if (negativeCount > 0) dominantEmotions.push('negative');
    
    return {
      valence,
      intensity: Math.min(1, intensity * 10), // Scale intensity
      dominantEmotions,
      consistency: 0.8 // Simplified
    };
  }
  
  /**
   * Determine primary tone based on analysis
   */
  private determinePrimaryTone(
    text: string,
    formalityScore: number,
    emotionalTone?: EmotionalTone
  ): ToneAnalysis['primaryTone'] {
    // Check for academic markers
    const academicMarkers = ['hypothesis', 'methodology', 'analysis', 'conclusion', 'evidence', 'research'];
    const hasAcademicMarkers = academicMarkers.some(marker => text.toLowerCase().includes(marker));
    
    if (hasAcademicMarkers && formalityScore > 7) {
      return 'academic';
    }
    
    // Check for persuasive markers
    const persuasiveMarkers = ['should', 'must', 'need to', 'essential', 'critical', 'important', 'recommend'];
    const hasPersuasiveMarkers = persuasiveMarkers.some(marker => text.toLowerCase().includes(marker));
    
    if (hasPersuasiveMarkers) {
      return 'persuasive';
    }
    
    // Determine based on formality
    if (formalityScore > 7) {
      return 'formal';
    } else if (formalityScore < 3) {
      return 'informal';
    } else if (formalityScore >= 5 && formalityScore <= 7) {
      // Check for conversational markers
      const conversationalMarkers = ['you know', 'I mean', 'actually', 'basically'];
      const hasConversationalMarkers = conversationalMarkers.some(marker => text.toLowerCase().includes(marker));
      
      if (hasConversationalMarkers) {
        return 'conversational';
      }
    }
    
    // Default to neutral
    return 'neutral';
  }
  
  /**
   * Identify secondary tones
   */
  private identifySecondaryTones(text: string): string[] {
    const tones: Set<string> = new Set();
    
    // Check for various tone indicators
    const toneIndicators: Record<string, string[]> = {
      'formal': ['therefore', 'however', 'moreover', 'consequently'],
      'informal': ['like', 'just', 'really', 'totally'],
      'academic': ['hypothesis', 'methodology', 'analysis', 'conclusion'],
      'persuasive': ['should', 'must', 'need to', 'essential'],
      'descriptive': ['described', 'characterized', 'depicted', 'portrayed'],
      'instructive': ['first', 'then', 'next', 'finally', 'step'],
      'analytical': ['because', 'since', 'therefore', 'thus', 'consequently'],
      'critical': ['however', 'although', 'despite', 'nevertheless']
    };
    
    const lowerText = text.toLowerCase();
    
    for (const [tone, indicators] of Object.entries(toneIndicators)) {
      for (const indicator of indicators) {
        if (lowerText.includes(indicator)) {
          tones.add(tone);
          break;
        }
      }
    }
    
    return Array.from(tones);
  }
  
  /**
   * Calculate consistency within a section
   */
  private calculateSectionConsistency(text: string): number {
    // Simplified consistency calculation
    // In a real system, this would analyze tone consistency throughout the section
    
    // For now, return a high consistency score
    return 0.8;
  }
  
  /**
   * Determine tone appropriateness for section
   */
  private determineAppropriateness(
    tone: ToneAnalysis['primaryTone'],
    section: DocumentSection
  ): ToneAnalysis['appropriateness'] {
    // Simplified appropriateness determination
    // Check section title for clues about expected tone
    
    const title = section.title.toLowerCase();
    
    if (title.includes('executive') || title.includes('summary') || title.includes('conclusion')) {
      // Executive summaries and conclusions should be formal or neutral
      if (tone === 'formal' || tone === 'neutral' || tone === 'academic') {
        return 'excellent';
      } else if (tone === 'informal' || tone === 'conversational') {
        return 'poor';
      }
    }
    
    if (title.includes('introduction') || title.includes('background')) {
      // Introductions can be more varied
      return 'adequate';
    }
    
    if (title.includes('method') || title.includes('analysis') || title.includes('results')) {
      // Method and analysis sections should be academic or formal
      if (tone === 'academic' || tone === 'formal') {
        return 'excellent';
      } else if (tone === 'informal' || tone === 'conversational') {
        return 'inappropriate';
      }
    }
    
    // Default to adequate
    return 'adequate';
  }
  
  /**
   * Calculate overall tone from section tones
   */
  private calculateOverallTone(sectionTones: ToneAnalysis[]): ToneAnalysis {
    if (sectionTones.length === 0) {
      return {
        primaryTone: 'neutral',
        secondaryTones: [],
        consistencyScore: 1,
        appropriateness: 'adequate'
      };
    }
    
    // Count tone frequencies
    const toneCounts: Record<string, number> = {};
    for (const tone of sectionTones) {
      toneCounts[tone.primaryTone] = (toneCounts[tone.primaryTone] || 0) + 1;
    }
    
    // Find most frequent tone
    let overallTone: ToneAnalysis['primaryTone'] = 'neutral';
    let maxCount = 0;
    
    for (const [tone, count] of Object.entries(toneCounts)) {
      if (count > maxCount) {
        maxCount = count;
        overallTone = tone as ToneAnalysis['primaryTone'];
      }
    }
    
    // Collect all secondary tones
    const allSecondaryTones = new Set<string>();
    for (const tone of sectionTones) {
      tone.secondaryTones.forEach(t => allSecondaryTones.add(t));
    }
    
    // Calculate average consistency
    const avgConsistency = sectionTones.reduce((sum, tone) => sum + tone.consistencyScore, 0) / sectionTones.length;
    
    // Determine appropriateness (simplified)
    const appropriateness = this.determineOverallAppropriateness(overallTone, sectionTones);
    
    return {
      primaryTone: overallTone,
      secondaryTones: Array.from(allSecondaryTones),
      consistencyScore: avgConsistency,
      appropriateness
    };
  }
  
  /**
   * Determine overall appropriateness
   */
  private determineOverallAppropriateness(
    overallTone: ToneAnalysis['primaryTone'],
    sectionTones: ToneAnalysis[]
  ): ToneAnalysis['appropriateness'] {
    // Count appropriate vs inappropriate sections
    let appropriateCount = 0;
    let inappropriateCount = 0;
    
    for (const tone of sectionTones) {
      if (tone.appropriateness === 'excellent' || tone.appropriateness === 'good' || tone.appropriateness === 'adequate') {
        appropriateCount++;
      } else {
        inappropriateCount++;
      }
    }
    
    const total = sectionTones.length;
    const appropriateRatio = appropriateCount / total;
    
    if (appropriateRatio >= 0.9) return 'excellent';
    if (appropriateRatio >= 0.7) return 'good';
    if (appropriateRatio >= 0.5) return 'adequate';
    if (appropriateRatio >= 0.3) return 'poor';
    return 'inappropriate';
  }
  
  /**
   * Detect tone shifts between sections
   */
  private detectToneShifts(
    sections: DocumentSection[],
    sectionTones: Map<string, ToneAnalysis>
  ): ToneShift[] {
    const shifts: ToneShift[] = [];
    
    for (let i = 0; i < sections.length - 1; i++) {
      const currentSection = sections[i];
      const nextSection = sections[i + 1];
      
      const currentTone = sectionTones.get(currentSection.id);
      const nextTone = sectionTones.get(nextSection.id);
      
      if (!currentTone || !nextTone) continue;
      
      if (currentTone.primaryTone !== nextTone.primaryTone) {
        // Calculate shift magnitude (simplified)
        const magnitude = this.calculateToneShiftMagnitude(currentTone, nextTone);
        
        // Determine if shift is appropriate
        const isAppropriate = this.isToneShiftAppropriate(currentSection, nextSection, currentTone, nextTone);
        
        shifts.push({
          fromSectionId: currentSection.id,
          toSectionId: nextSection.id,
          fromTone: currentTone.primaryTone,
          toTone: nextTone.primaryTone,
          magnitude,
          isAppropriate,
          explanation: this.generateToneShiftExplanation(
            currentSection,
            nextSection,
            currentTone,
            nextTone,
            magnitude,
            isAppropriate
          )
        });
      }
    }
    
    return shifts;
  }
  
  /**
   * Calculate tone shift magnitude
   */
  private calculateToneShiftMagnitude(
    fromTone: ToneAnalysis,
    toTone: ToneAnalysis
  ): number {
    // Define tone hierarchy for magnitude calculation
    const toneHierarchy: Record<string, number> = {
      'formal': 5,
      'academic': 4,
      'neutral': 3,
      'persuasive': 2,
      'conversational': 1,
      'informal': 0
    };
    
    const fromValue = toneHierarchy[fromTone.primaryTone] || 3;
    const toValue = toneHierarchy[toTone.primaryTone] || 3;
    
    // Calculate absolute difference normalized to 0-1
    const maxDifference = 5; // formal (5) to informal (0)
    const difference = Math.abs(fromValue - toValue);
    
    return difference / maxDifference;
  }
  
  /**
   * Determine if tone shift is appropriate
   */
  private isToneShiftAppropriate(
    fromSection: DocumentSection,
    toSection: DocumentSection,
    fromTone: ToneAnalysis,
    toTone: ToneAnalysis
  ): boolean {
    // Some tone shifts are natural and appropriate
    const fromTitle = fromSection.title.toLowerCase();
    const toTitle = toSection.title.toLowerCase();
    
    // Shifts from formal to informal are generally inappropriate
    if (fromTone.primaryTone === 'formal' && toTone.primaryTone === 'informal') {
      return false;
    }
    
    // Shifts from informal to formal are appropriate for conclusions
    if (fromTone.primaryTone === 'informal' && toTone.primaryTone === 'formal') {
      if (toTitle.includes('conclusion') || toTitle.includes('summary')) {
        return true;
      }
      return false;
    }
    
    // Shifts to academic tone in analysis sections are appropriate
    if (toTone.primaryTone === 'academic' && toTitle.includes('analysis')) {
      return true;
    }
    
    // Small shifts (neutral to conversational) are generally fine
    const magnitude = this.calculateToneShiftMagnitude(fromTone, toTone);
    if (magnitude < 0.3) {
      return true;
    }
    
    // Default to appropriate for now
    return true;
  }
  
  /**
   * Generate explanation for tone shift
   */
  private generateToneShiftExplanation(
    fromSection: DocumentSection,
    toSection: DocumentSection,
    fromTone: ToneAnalysis,
    toTone: ToneAnalysis,
    magnitude: number,
    isAppropriate: boolean
  ): string {
    const fromTitle = fromSection.title;
    const toTitle = toSection.title;
    
    if (isAppropriate) {
      if (magnitude < 0.3) {
        return `Minor tone shift from ${fromTone.primaryTone} to ${toTone.primaryTone} between "${fromTitle}" and "${toTitle}" is natural and appropriate.`;
      } else {
        return `Significant tone shift from ${fromTone.primaryTone} to ${toTone.primaryTone} between "${fromTitle}" and "${toTitle}" is appropriate for this document structure.`;
      }
    } else {
      return `Inappropriate tone shift from ${fromTone.primaryTone} to ${toTone.primaryTone} between "${fromTitle}" and "${toTitle}". Consider adjusting tone for consistency.`;
    }
  }
  
  /**
   * Calculate consistency score
   */
  private calculateConsistencyScore(
    sectionTones: Map<string, ToneAnalysis>,
    toneShifts: ToneShift[]
  ): number {
    if (sectionTones.size === 0) return 1;
    
    // Base score from section consistency
    let totalSectionConsistency = 0;
    for (const tone of sectionTones.values()) {
      totalSectionConsistency += tone.consistencyScore;
    }
    const avgSectionConsistency = totalSectionConsistency / sectionTones.size;
    
    // Penalty for inappropriate tone shifts
    let inappropriateShiftPenalty = 0;
    for (const shift of toneShifts) {
      if (!shift.isAppropriate) {
        inappropriateShiftPenalty += shift.magnitude * 0.2;
      }
    }
    
    // Calculate final consistency score
    const rawScore = avgSectionConsistency * 0.7 + (1 - Math.min(1, inappropriateShiftPenalty)) * 0.3;
    return Math.max(0, Math.min(1, rawScore));
  }
  
  /**
   * Generate tone recommendations
   */
  private generateToneRecommendations(
    sections: DocumentSection[],
    sectionTones: Map<string, ToneAnalysis>,
    overallTone: ToneAnalysis,
    toneShifts: ToneShift[],
    options: ToneControlOptions
  ): ToneRecommendation[] {
    const recommendations: ToneRecommendation[] = [];
    
    // Check for inappropriate tone shifts
    for (const shift of toneShifts) {
      if (!shift.isAppropriate) {
        recommendations.push({
          type: 'consistency-improvement',
          sectionId: shift.fromSectionId,
          description: `Inappropriate tone shift from ${shift.fromTone} to ${shift.toTone}`,
          suggestedAction: `Adjust tone in section "${sections.find(s => s.id === shift.fromSectionId)?.title}" to better match the following section`,
          priority: 'medium',
          expectedImpact: 'moderate'
        });
      }
    }
    
    // Check for sections with poor appropriateness
    for (const [sectionId, tone] of sectionTones) {
      if (tone.appropriateness === 'poor' || tone.appropriateness === 'inappropriate') {
        const section = sections.find(s => s.id === sectionId);
        recommendations.push({
          type: 'tone-adjustment',
          sectionId,
          description: `Tone "${tone.primaryTone}" is ${tone.appropriateness} for section "${section?.title}"`,
          suggestedAction: `Adjust tone to be more appropriate for this section type`,
          priority: 'high',
          expectedImpact: 'major'
        });
      }
    }
    
    // Check target tone match
    if (overallTone.primaryTone !== options.targetTone) {
      recommendations.push({
        type: 'tone-adjustment',
        description: `Overall document tone (${overallTone.primaryTone}) does not match target tone (${options.targetTone})`,
        suggestedAction: `Adjust document tone to match target tone ${options.targetTone}`,
        priority: options.enforceConsistency ? 'high' : 'medium',
        expectedImpact: 'major'
      });
    }
    
    // Check for too many tone shifts
    if (toneShifts.length > options.maxToneShifts && !options.allowMixedTones) {
      recommendations.push({
        type: 'consistency-improvement',
        description: `Document has ${toneShifts.length} tone shifts, exceeding maximum of ${options.maxToneShifts}`,
        suggestedAction: 'Reduce number of tone shifts for better consistency',
        priority: 'medium',
        expectedImpact: 'moderate'
      });
    }
    
    return recommendations;
  }
  
  /**
   * Calculate target match score
   */
  private calculateTargetMatchScore(
    overallTone: ToneAnalysis,
    options: ToneControlOptions
  ): number {
    // Check if primary tone matches target
    const toneMatch = overallTone.primaryTone === options.targetTone ? 1 : 0;
    
    // Check formality level (simplified)
    // In a real system, we would have formality score
    const formalityMatch = 0.7; // Placeholder
    
    // Calculate weighted score
    return toneMatch * 0.7 + formalityMatch * 0.3;
  }
  
  /**
   * Adjust section tone
   */
  private adjustSectionTone(
    content: string,
    currentTone: ToneAnalysis,
    targetOptions: ToneControlOptions
  ): string {
    // Simplified tone adjustment
    // In a real system, this would use NLP to rewrite content
    
    const currentToneType = currentTone.primaryTone;
    const targetToneType = targetOptions.targetTone;
    
    if (currentToneType === targetToneType) {
      return content; // No adjustment needed
    }
    
    // Simple word replacement for demonstration
    let adjustedContent = content;
    
    // Formal to informal adjustments
    if (currentToneType === 'formal' && targetToneType === 'informal') {
      adjustedContent = adjustedContent
        .replace(/\btherefore\b/gi, 'so')
        .replace(/\bhowever\b/gi, 'but')
        .replace(/\bmoreover\b/gi, 'also')
        .replace(/\bconsequently\b/gi, 'so')
        .replace(/\bthus\b/gi, 'so');
    }
    
    // Informal to formal adjustments
    if (currentToneType === 'informal' && targetToneType === 'formal') {
      adjustedContent = adjustedContent
        .replace(/\bso\b/gi, 'therefore')
        .replace(/\bbut\b/gi, 'however')
        .replace(/\balso\b/gi, 'moreover')
        .replace(/\bget\b/gi, 'obtain')
        .replace(/\bstuff\b/gi, 'material');
    }
    
    // Neutral to persuasive adjustments
    if (currentToneType === 'neutral' && targetToneType === 'persuasive') {
      adjustedContent = adjustedContent
        .replace(/\bcan\b/gi, 'should')
        .replace(/\bmay\b/gi, 'must')
        .replace(/\bcould\b/gi, 'will');
    }
    
    return adjustedContent;
  }
}
