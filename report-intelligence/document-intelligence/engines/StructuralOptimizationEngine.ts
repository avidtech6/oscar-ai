/**
 * Phase 24: Document Intelligence Layer
 * Structural Optimization Engine
 * 
 * Optimizes document structure through:
 * - Section merging and splitting
 * - Content reordering for better flow
 * - Hierarchy optimization
 * - Flow improvement suggestions
 * - Structural consistency checks
 */

import type { DocumentSection } from '../types/DocumentAnalysis';

/**
 * Structural optimization options
 */
export interface StructuralOptimizationOptions {
  /** Whether to allow section merging */
  allowMerging: boolean;
  /** Whether to allow section splitting */
  allowSplitting: boolean;
  /** Whether to allow reordering */
  allowReordering: boolean;
  /** Target maximum sections */
  maxSections: number;
  /** Target minimum sections */
  minSections: number;
  /** Target average section length (words) */
  targetSectionLength: number;
  /** Whether to enforce logical flow */
  enforceLogicalFlow: boolean;
  /** Whether to preserve original structure when possible */
  preserveOriginalStructure: boolean;
}

/**
 * Structural optimization result
 */
export interface StructuralOptimizationResult {
  /** Optimized sections */
  optimizedSections: DocumentSection[];
  /** Applied optimizations */
  appliedOptimizations: AppliedOptimization[];
  /** Structural quality score (0-1) */
  structuralQualityScore: number;
  /** Flow improvement score (0-1) */
  flowImprovementScore: number;
  /** Recommendations for further improvement */
  recommendations: StructuralRecommendation[];
}

/**
 * Applied optimization
 */
export interface AppliedOptimization {
  /** Type of optimization */
  type: 'merge' | 'split' | 'reorder' | 'hierarchy-change' | 'flow-improvement';
  /** Description */
  description: string;
  /** Sections involved */
  sectionIds: string[];
  /** Impact */
  impact: 'minor' | 'moderate' | 'major';
  /** Rationale */
  rationale: string;
}

/**
 * Structural recommendation
 */
export interface StructuralRecommendation {
  /** Type of recommendation */
  type: 'merge-sections' | 'split-section' | 'reorder-sections' | 'improve-hierarchy' | 'improve-flow';
  /** Description */
  description: string;
  /** Suggested action */
  suggestedAction: string;
  /** Priority */
  priority: 'low' | 'medium' | 'high';
  /** Expected impact */
  expectedImpact: 'minor' | 'moderate' | 'major';
  /** Sections involved */
  sectionIds?: string[];
}

/**
 * Flow analysis
 */
export interface FlowAnalysis {
  /** Overall flow score (0-1) */
  flowScore: number;
  /** Flow issues */
  flowIssues: FlowIssue[];
  /** Transition quality between sections */
  transitionQuality: Map<string, number>; // key: "fromId-toId"
  /** Logical progression score */
  logicalProgressionScore: number;
}

/**
 * Flow issue
 */
export interface FlowIssue {
  /** Type of issue */
  type: 'abrupt-transition' | 'logical-gap' | 'redundant-content' | 'missing-transition' | 'poor-hierarchy';
  /** Description */
  description: string;
  /** Sections involved */
  sectionIds: string[];
  /** Severity */
  severity: 'low' | 'medium' | 'high';
  /** Suggested fix */
  suggestedFix: string;
}

/**
 * Structural Optimization Engine
 * 
 * Optimizes document structure for better readability and logical flow
 */
export class StructuralOptimizationEngine {
  /**
   * Optimize document structure
   */
  optimizeStructure(
    sections: DocumentSection[],
    options: Partial<StructuralOptimizationOptions> = {}
  ): StructuralOptimizationResult {
    const fullOptions: StructuralOptimizationOptions = {
      allowMerging: true,
      allowSplitting: true,
      allowReordering: true,
      maxSections: 20,
      minSections: 3,
      targetSectionLength: 500,
      enforceLogicalFlow: true,
      preserveOriginalStructure: true,
      ...options
    };
    
    let optimizedSections = [...sections];
    const appliedOptimizations: AppliedOptimization[] = [];
    
    // Analyze current structure
    const flowAnalysis = this.analyzeFlow(optimizedSections);
    const structuralQualityScore = this.calculateStructuralQualityScore(optimizedSections, flowAnalysis);
    
    // Apply optimizations based on analysis
    if (fullOptions.allowMerging) {
      const mergeResult = this.applyMergingOptimizations(optimizedSections, fullOptions);
      optimizedSections = mergeResult.optimizedSections;
      appliedOptimizations.push(...mergeResult.appliedOptimizations);
    }
    
    if (fullOptions.allowSplitting) {
      const splitResult = this.applySplittingOptimizations(optimizedSections, fullOptions);
      optimizedSections = splitResult.optimizedSections;
      appliedOptimizations.push(...splitResult.appliedOptimizations);
    }
    
    if (fullOptions.allowReordering) {
      const reorderResult = this.applyReorderingOptimizations(optimizedSections, fullOptions);
      optimizedSections = reorderResult.optimizedSections;
      appliedOptimizations.push(...reorderResult.appliedOptimizations);
    }
    
    // Re-analyze flow after optimizations
    const optimizedFlowAnalysis = this.analyzeFlow(optimizedSections);
    const optimizedStructuralQualityScore = this.calculateStructuralQualityScore(optimizedSections, optimizedFlowAnalysis);
    
    // Calculate flow improvement score
    const flowImprovementScore = this.calculateFlowImprovementScore(
      structuralQualityScore,
      optimizedStructuralQualityScore
    );
    
    // Generate recommendations
    const recommendations = this.generateStructuralRecommendations(
      optimizedSections,
      optimizedFlowAnalysis,
      fullOptions
    );
    
    return {
      optimizedSections,
      appliedOptimizations,
      structuralQualityScore: optimizedStructuralQualityScore,
      flowImprovementScore,
      recommendations
    };
  }
  
  /**
   * Analyze flow between sections
   */
  analyzeFlow(sections: DocumentSection[]): FlowAnalysis {
    const flowIssues: FlowIssue[] = [];
    const transitionQuality = new Map<string, number>();
    
    // Analyze transitions between consecutive sections
    for (let i = 0; i < sections.length - 1; i++) {
      const currentSection = sections[i];
      const nextSection = sections[i + 1];
      
      const transitionScore = this.analyzeTransition(currentSection, nextSection);
      transitionQuality.set(`${currentSection.id}-${nextSection.id}`, transitionScore);
      
      // Identify flow issues
      if (transitionScore < 0.5) {
        flowIssues.push({
          type: 'abrupt-transition',
          description: `Abrupt transition from "${currentSection.title}" to "${nextSection.title}"`,
          sectionIds: [currentSection.id, nextSection.id],
          severity: transitionScore < 0.3 ? 'high' : 'medium',
          suggestedFix: 'Add transitional content or reorder sections for better flow'
        });
      }
    }
    
    // Analyze logical progression
    const logicalProgressionScore = this.analyzeLogicalProgression(sections);
    
    // Check for logical gaps
    const logicalGaps = this.detectLogicalGaps(sections);
    flowIssues.push(...logicalGaps);
    
    // Check for redundant content
    const redundantContent = this.detectRedundantContent(sections);
    flowIssues.push(...redundantContent);
    
    // Check hierarchy issues
    const hierarchyIssues = this.detectHierarchyIssues(sections);
    flowIssues.push(...hierarchyIssues);
    
    // Calculate overall flow score
    const flowScore = this.calculateFlowScore(transitionQuality, logicalProgressionScore, flowIssues);
    
    return {
      flowScore,
      flowIssues,
      transitionQuality,
      logicalProgressionScore
    };
  }
  
  /**
   * Analyze transition between two sections
   */
  private analyzeTransition(
    fromSection: DocumentSection,
    toSection: DocumentSection
  ): number {
    // Check for thematic continuity
    const thematicContinuity = this.analyzeThematicContinuity(fromSection, toSection);
    
    // Check for logical connection
    const logicalConnection = this.analyzeLogicalConnection(fromSection, toSection);
    
    // Check for transitional phrases
    const transitionalPhrases = this.analyzeTransitionalPhrases(fromSection, toSection);
    
    // Weighted average
    return thematicContinuity * 0.4 + logicalConnection * 0.4 + transitionalPhrases * 0.2;
  }
  
  /**
   * Analyze thematic continuity
   */
  private analyzeThematicContinuity(
    fromSection: DocumentSection,
    toSection: DocumentSection
  ): number {
    // Extract key terms from each section
    const fromTerms = this.extractKeyTerms(fromSection.content);
    const toTerms = this.extractKeyTerms(toSection.content);
    
    // Calculate overlap
    const overlap = fromTerms.filter(term => toTerms.includes(term)).length;
    const maxTerms = Math.max(fromTerms.length, toTerms.length);
    
    if (maxTerms === 0) return 0.5; // Neutral if no terms
    
    return overlap / maxTerms;
  }
  
  /**
   * Analyze logical connection
   */
  private analyzeLogicalConnection(
    fromSection: DocumentSection,
    toSection: DocumentSection
  ): number {
    // Check section titles for logical progression
    const fromTitle = fromSection.title.toLowerCase();
    const toTitle = toSection.title.toLowerCase();
    
    // Common logical progressions
    const logicalProgressions = [
      ['introduction', 'background'],
      ['background', 'methodology'],
      ['methodology', 'analysis'],
      ['analysis', 'results'],
      ['results', 'discussion'],
      ['discussion', 'conclusion'],
      ['problem', 'solution'],
      ['cause', 'effect'],
      ['theory', 'application']
    ];
    
    for (const [from, to] of logicalProgressions) {
      if (fromTitle.includes(from) && toTitle.includes(to)) {
        return 1.0; // Perfect logical progression
      }
    }
    
    // Check for logical indicators in content
    const fromContent = fromSection.content.toLowerCase();
    const toContent = toSection.content.toLowerCase();
    
    // Check if from section mentions something that to section addresses
    const logicalIndicators = ['therefore', 'thus', 'consequently', 'as a result', 'leading to'];
    let indicatorCount = 0;
    
    for (const indicator of logicalIndicators) {
      if (fromContent.includes(indicator) || toContent.includes(indicator)) {
        indicatorCount++;
      }
    }
    
    return Math.min(1, indicatorCount / 3); // Normalize
  }
  
  /**
   * Analyze transitional phrases
   */
  private analyzeTransitionalPhrases(
    fromSection: DocumentSection,
    toSection: DocumentSection
  ): number {
    // Check end of from section for transitional phrases
    const fromEnd = fromSection.content.slice(-200).toLowerCase(); // Last 200 chars
    const toStart = toSection.content.slice(0, 200).toLowerCase(); // First 200 chars
    
    const transitionalPhrases = [
      'in conclusion', 'to summarize', 'therefore', 'thus', 'consequently',
      'as a result', 'in addition', 'furthermore', 'moreover', 'however',
      'on the other hand', 'in contrast', 'similarly', 'likewise'
    ];
    
    let phraseCount = 0;
    for (const phrase of transitionalPhrases) {
      if (fromEnd.includes(phrase) || toStart.includes(phrase)) {
        phraseCount++;
      }
    }
    
    return Math.min(1, phraseCount / 5); // Normalize
  }
  
  /**
   * Extract key terms from text
   */
  private extractKeyTerms(text: string): string[] {
    // Simplified key term extraction
    // In a real system, this would use NLP
    
    const words = text.toLowerCase().split(/\W+/);
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being'
    ]);
    
    const terms = words.filter(word => 
      word.length > 3 && !stopWords.has(word)
    );
    
    // Return unique terms
    return [...new Set(terms)].slice(0, 10); // Top 10 terms
  }
  
  /**
   * Analyze logical progression
   */
  private analyzeLogicalProgression(sections: DocumentSection[]): number {
    if (sections.length < 2) return 1.0;
    
    let totalScore = 0;
    let pairCount = 0;
    
    for (let i = 0; i < sections.length - 1; i++) {
      const score = this.analyzeLogicalConnection(sections[i], sections[i + 1]);
      totalScore += score;
      pairCount++;
    }
    
    return pairCount > 0 ? totalScore / pairCount : 1.0;
  }
  
  /**
   * Detect logical gaps
   */
  private detectLogicalGaps(sections: DocumentSection[]): FlowIssue[] {
    const issues: FlowIssue[] = [];
    
    // Check for missing sections in standard document structure
    const sectionTitles = sections.map(s => s.title.toLowerCase());
    
    const expectedSections = ['introduction', 'methodology', 'results', 'discussion', 'conclusion'];
    const missingSections = expectedSections.filter(expected => 
      !sectionTitles.some(title => title.includes(expected))
    );
    
    if (missingSections.length > 0) {
      issues.push({
        type: 'logical-gap',
        description: `Missing expected sections: ${missingSections.join(', ')}`,
        sectionIds: [],
        severity: missingSections.length > 2 ? 'high' : 'medium',
        suggestedFix: `Consider adding sections: ${missingSections.join(', ')}`
      });
    }
    
    return issues;
  }
  
  /**
   * Detect redundant content
   */
  private detectRedundantContent(sections: DocumentSection[]): FlowIssue[] {
    const issues: FlowIssue[] = [];
    
    // Check for similar content between sections
    for (let i = 0; i < sections.length; i++) {
      for (let j = i + 1; j < sections.length; j++) {
        const similarity = this.calculateContentSimilarity(
          sections[i].content,
          sections[j].content
        );
        
        if (similarity > 0.7) {
          issues.push({
            type: 'redundant-content',
            description: `High content similarity between "${sections[i].title}" and "${sections[j].title}"`,
            sectionIds: [sections[i].id, sections[j].id],
            severity: similarity > 0.8 ? 'high' : 'medium',
            suggestedFix: 'Consider merging or removing redundant content'
          });
        }
      }
    }
    
    return issues;
  }
  
  /**
   * Calculate content similarity
   */
  private calculateContentSimilarity(text1: string, text2: string): number {
    // Simplified similarity calculation using Jaccard index
    const terms1 = this.extractKeyTerms(text1);
    const terms2 = this.extractKeyTerms(text2);
    
    if (terms1.length === 0 && terms2.length === 0) return 0;
    
    const intersection = terms1.filter(term => terms2.includes(term)).length;
    const union = new Set([...terms1, ...terms2]).size;
    
    return intersection / union;
  }
  
  /**
   * Detect hierarchy issues
   */
  private detectHierarchyIssues(sections: DocumentSection[]): FlowIssue[] {
    const issues: FlowIssue[] = [];
    
    // Check for inconsistent heading levels
    const headingPatterns = sections.map(section => {
      const title = section.title;
      // Check if title looks like a heading (starts with number, etc.)
      const startsWithNumber = /^\d+\./.test(title);
      const startsWithLetterNumber = /^[A-Z]\./.test(title);
      
      return {
        sectionId: section.id,
        isNumbered: startsWithNumber || startsWithLetterNumber,
        level: this.determineHeadingLevel(title)
      };
    });
    
    // Check for inconsistent numbering
    const numberedSections = headingPatterns.filter(h => h.isNumbered);
    const unnumberedSections = headingPatterns.filter(h => !h.isNumbered);
    
    if (numberedSections.length > 0 && unnumberedSections.length > 0) {
      issues.push({
        type: 'poor-hierarchy',
        description: 'Inconsistent heading numbering',
        sectionIds: sections.map(s => s.id),
        severity: 'medium',
        suggestedFix: 'Use consistent numbering or remove numbers from all headings'
      });
    }
    
    return issues;
  }
  
  /**
   * Determine heading level
   */
  private determineHeadingLevel(title: string): number {
    // Simplified heading level detection
    if (/^\d+\.\d+\./.test(title)) return 3; // 1.1. Heading
    if (/^\d+\./.test(title)) return 2; // 1. Heading
    if (/^[A-Z]\./.test(title)) return 2; // A. Heading
    return 1; // Plain heading
  }
  
  /**
   * Calculate flow score
   */
  private calculateFlowScore(
    transitionQuality: Map<string, number>,
    logicalProgressionScore: number,
    flowIssues: FlowIssue[]
  ): number {
    if (transitionQuality.size === 0) return 1.0;
    
    // Average transition quality
    let totalTransitionScore = 0;
    for (const score of transitionQuality.values()) {
      totalTransitionScore += score;
    }
    const avgTransitionScore = totalTransitionScore / transitionQuality.size;
    
    // Penalty for flow issues
    let issuePenalty = 0;
    for (const issue of flowIssues) {
      const severityWeight = issue.severity === 'high' ? 0.3 : issue.severity === 'medium' ? 0.15 : 0.05;
      issuePenalty += severityWeight;
    }
    
    // Cap penalty at 0.5
    issuePenalty = Math.min(0.5, issuePenalty);
    
    // Calculate final score
    const baseScore = (avgTransitionScore * 0.6 + logicalProgressionScore * 0.4);
    return Math.max(0, Math.min(1, baseScore * (1 - issuePenalty)));
  }
  
  /**
   * Calculate structural quality score
   */
  private calculateStructuralQualityScore(
    sections: DocumentSection[],
    flowAnalysis: FlowAnalysis
  ): number {
    if (sections.length === 0) return 1.0;
    
    // Section length balance score
    const lengthBalanceScore = this.calculateLengthBalanceScore(sections);
    
    // Hierarchy quality score
    const hierarchyScore = this.calculateHierarchyScore(sections);
    
    // Flow score from analysis
    const flowScore = flowAnalysis.flowScore;
    
    // Weighted average
    return lengthBalanceScore * 0.3 + hierarchyScore * 0.3 + flowScore * 0.4;
  }
  
  /**
   * Calculate length balance score
   */
  private calculateLengthBalanceScore(sections: DocumentSection[]): number {
    if (sections.length < 2) return 1.0;
    
    const wordCounts = sections.map(s => s.content.split(/\s+/).length);
    const avgLength = wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length;
    
    // Calculate coefficient of variation (lower is better)
    const variance = wordCounts.reduce((sum, count) => sum + Math.pow(count - avgLength, 2), 0) / wordCounts.length;
    const stdDev = Math.sqrt(variance);
    const cv = avgLength > 0 ? stdDev / avgLength : 0;
    
    // Convert to score (0-1, higher is better)
    return Math.max(0, 1 - cv);
  }
  
  /**
   * Calculate hierarchy score
   */
  private calculateHierarchyScore(sections: DocumentSection[]): number {
    if (sections.length < 2) return 1.0;
    
    const headingLevels = sections.map(s => this.determineHeadingLevel(s.title));
    
    // Check for level skipping
    let levelSkipPenalty = 0;
    for (let i = 0; i < headingLevels.length - 1; i++) {
      const levelDiff = Math.abs(headingLevels[i + 1] - headingLevels[i]);
      if (levelDiff > 1) {
        levelSkipPenalty += 0.1;
      }
    }
    
    // Check for consistent progression
    let progressionScore = 0;
    for (let i = 0; i < headingLevels.length - 1; i++) {
      if (headingLevels[i + 1] >= headingLevels[i]) {
        progressionScore += 1; // Good: same or deeper level
      }
    }
    progressionScore = progressionScore / (headingLevels.length - 1);
    
    // Final score
    return Math.max(0, Math.min(1, progressionScore * (1 - levelSkipPenalty)));
  }
  
  /**
   * Apply merging optimizations
   */
  private applyMergingOptimizations(
    sections: DocumentSection[],
    options: StructuralOptimizationOptions
  ): { optimizedSections: DocumentSection[]; appliedOptimizations: AppliedOptimization[] } {
    const optimizedSections = [...sections];
    const appliedOptimizations: AppliedOptimization[] = [];
    
    // Find sections that are too short and should be merged
    for (let i = 0; i < optimizedSections.length - 1; i++) {
      const currentSection = optimizedSections[i];
      const nextSection = optimizedSections[i + 1];
      
      const currentWordCount = currentSection.content.split(/\s+/).length;
      const nextWordCount = nextSection.content.split(/\s+/).length;
      
      // Merge if both sections are very short
      if (currentWordCount < 100 && nextWordCount < 100) {
        const mergedSection: DocumentSection = {
          id: `${currentSection.id}-merged-${nextSection.id}`,
          title: `${currentSection.title} / ${nextSection.title}`,
          content: `${currentSection.content}\n\n${nextSection.content}`,
          startIndex: currentSection.startIndex,
          endIndex: nextSection.endIndex,
          level: Math.min(currentSection.level, nextSection.level),
          parentId: currentSection.parentId || nextSection.parentId,
          childIds: [...currentSection.childIds, ...nextSection.childIds],
          keyTopics: [...new Set([...currentSection.keyTopics, ...nextSection.keyTopics])],
          summary: currentSection.summary || nextSection.summary,
          tone: currentSection.tone || nextSection.tone,
          readability: currentSection.readability || nextSection.readability
        };
        
        // Replace the two sections with the merged one
        optimizedSections.splice(i, 2, mergedSection);
        i--; // Adjust index since we removed an element
        
        appliedOptimizations.push({
          type: 'merge',
          description: `Merged short sections "${currentSection.title}" and "${nextSection.title}"`,
          sectionIds: [currentSection.id, nextSection.id],
          impact: 'moderate',
          rationale: 'Both sections were very short (<100 words). Merging improves readability.'
        });
      }
    }
    
    return { optimizedSections, appliedOptimizations };
  }
  
  /**
   * Apply splitting optimizations
   */
  private applySplittingOptimizations(
    sections: DocumentSection[],
    options: StructuralOptimizationOptions
  ): { optimizedSections: DocumentSection[]; appliedOptimizations: AppliedOptimization[] } {
    const optimizedSections = [...sections];
    const appliedOptimizations: AppliedOptimization[] = [];
    
    for (let i = 0; i < optimizedSections.length; i++) {
      const section = optimizedSections[i];
      const wordCount = section.content.split(/\s+/).length;
      
      // Split if section is too long
      if (wordCount > options.targetSectionLength * 2) {
        // Find natural break points (paragraphs)
        const paragraphs = section.content.split(/\n\s*\n/);
        
        if (paragraphs.length > 1) {
          // Create new sections from paragraphs
          const newSections: DocumentSection[] = [];
          
          for (let j = 0; j < paragraphs.length; j++) {
            // Calculate approximate position for split sections
            const contentLength = section.content.length;
            const paragraphStart = section.content.indexOf(paragraphs[j]);
            const paragraphEnd = paragraphStart + paragraphs[j].length;
            
            newSections.push({
              id: `${section.id}-part-${j + 1}`,
              title: `${section.title} (Part ${j + 1})`,
              content: paragraphs[j],
              startIndex: section.startIndex + paragraphStart,
              endIndex: section.startIndex + paragraphEnd,
              level: section.level,
              parentId: section.parentId,
              childIds: [],
              keyTopics: section.keyTopics,
              summary: undefined, // Would need to generate new summary
              tone: section.tone,
              readability: section.readability
            });
          }
          
          // Replace the long section with the split sections
          optimizedSections.splice(i, 1, ...newSections);
          i += newSections.length - 1; // Adjust index
          
          appliedOptimizations.push({
            type: 'split',
            description: `Split long section "${section.title}" into ${paragraphs.length} parts`,
            sectionIds: [section.id],
            impact: 'moderate',
            rationale: `Section was too long (${wordCount} words). Splitting improves readability.`
          });
        }
      }
    }
    
    return { optimizedSections, appliedOptimizations };
  }
  
  /**
   * Apply reordering optimizations
   */
  private applyReorderingOptimizations(
    sections: DocumentSection[],
    options: StructuralOptimizationOptions
  ): { optimizedSections: DocumentSection[]; appliedOptimizations: AppliedOptimization[] } {
    if (!options.enforceLogicalFlow || sections.length < 2) {
      return { optimizedSections: sections, appliedOptimizations: [] };
    }
    
    const optimizedSections = [...sections];
    const appliedOptimizations: AppliedOptimization[] = [];
    
    // Simple reordering: try to put sections in logical order based on titles
    const sectionOrder = this.determineOptimalOrder(optimizedSections);
    
    // Check if reordering is needed
    let needsReordering = false;
    for (let i = 0; i < sectionOrder.length; i++) {
      if (sectionOrder[i] !== i) {
        needsReordering = true;
        break;
      }
    }
    
    if (needsReordering) {
      // Reorder sections
      const reorderedSections = sectionOrder.map(index => optimizedSections[index]);
      
      appliedOptimizations.push({
        type: 'reorder',
        description: 'Reordered sections for better logical flow',
        sectionIds: optimizedSections.map(s => s.id),
        impact: 'moderate',
        rationale: 'Sections were reordered to follow a more logical progression.'
      });
      
      return { optimizedSections: reorderedSections, appliedOptimizations };
    }
    
    return { optimizedSections, appliedOptimizations };
  }
  
  /**
   * Determine optimal section order
   */
  private determineOptimalOrder(sections: DocumentSection[]): number[] {
    // Score each possible position based on section title keywords
    const sectionScores = sections.map((section, index) => {
      const title = section.title.toLowerCase();
      let score = 0;
      
      // Standard document structure order
      if (title.includes('introduction') || title.includes('abstract') || title.includes('executive')) {
        score = 10;
      } else if (title.includes('background') || title.includes('literature') || title.includes('related')) {
        score = 20;
      } else if (title.includes('method') || title.includes('approach') || title.includes('design')) {
        score = 30;
      } else if (title.includes('analysis') || title.includes('results') || title.includes('findings')) {
        score = 40;
      } else if (title.includes('discussion') || title.includes('interpretation')) {
        score = 50;
      } else if (title.includes('conclusion') || title.includes('summary') || title.includes('recommendation')) {
        score = 60;
      } else if (title.includes('appendix') || title.includes('reference') || title.includes('bibliography')) {
        score = 70;
      } else {
        // Default: maintain original order
        score = 100 + index;
      }
      
      return { index, score };
    });
    
    // Sort by score
    sectionScores.sort((a, b) => a.score - b.score);
    
    return sectionScores.map(item => item.index);
  }
  
  /**
   * Calculate flow improvement score
   */
  private calculateFlowImprovementScore(
    originalScore: number,
    optimizedScore: number
  ): number {
    if (originalScore >= optimizedScore) return 0;
    
    const improvement = optimizedScore - originalScore;
    const maxPossibleImprovement = 1 - originalScore;
    
    if (maxPossibleImprovement === 0) return 1;
    
    return improvement / maxPossibleImprovement;
  }
  
  /**
   * Generate structural recommendations
   */
  private generateStructuralRecommendations(
    sections: DocumentSection[],
    flowAnalysis: FlowAnalysis,
    options: StructuralOptimizationOptions
  ): StructuralRecommendation[] {
    const recommendations: StructuralRecommendation[] = [];
    
    // Check for flow issues
    for (const issue of flowAnalysis.flowIssues) {
      if (issue.severity === 'high' || issue.severity === 'medium') {
        let type: StructuralRecommendation['type'] = 'improve-flow';
        
        if (issue.type === 'redundant-content') {
          type = 'merge-sections';
        } else if (issue.type === 'poor-hierarchy') {
          type = 'improve-hierarchy';
        }
        
        recommendations.push({
          type,
          description: issue.description,
          suggestedAction: issue.suggestedFix,
          priority: issue.severity === 'high' ? 'high' : 'medium',
          expectedImpact: 'moderate',
          sectionIds: issue.sectionIds
        });
      }
    }
    
    // Check section count
    if (sections.length > options.maxSections) {
      recommendations.push({
        type: 'merge-sections',
        description: `Document has ${sections.length} sections, exceeding maximum of ${options.maxSections}`,
        suggestedAction: 'Merge related sections to reduce total count',
        priority: 'medium',
        expectedImpact: 'moderate'
      });
    }
    
    if (sections.length < options.minSections) {
      recommendations.push({
        type: 'split-section',
        description: `Document has only ${sections.length} sections, below minimum of ${options.minSections}`,
        suggestedAction: 'Split long sections to create more logical divisions',
        priority: 'low',
        expectedImpact: 'minor'
      });
    }
    
    // Check section length balance
    const wordCounts = sections.map(s => s.content.split(/\s+/).length);
    const avgLength = wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length;
    
    // Find sections that are too long
    for (let i = 0; i < sections.length; i++) {
      if (wordCounts[i] > options.targetSectionLength * 1.5) {
        recommendations.push({
          type: 'split-section',
          description: `Section "${sections[i].title}" is very long (${wordCounts[i]} words)`,
          suggestedAction: 'Consider splitting this section for better readability',
          priority: 'medium',
          expectedImpact: 'moderate',
          sectionIds: [sections[i].id]
        });
      }
      
      // Find sections that are too short
      if (wordCounts[i] < 50 && sections.length > 1) {
        recommendations.push({
          type: 'merge-sections',
          description: `Section "${sections[i].title}" is very short (${wordCounts[i]} words)`,
          suggestedAction: 'Consider merging with adjacent section',
          priority: 'low',
          expectedImpact: 'minor',
          sectionIds: [sections[i].id]
        });
      }
    }
    
    return recommendations;
  }
}