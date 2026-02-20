/**
 * Phase 24: Document Intelligence Layer
 * Type Definitions Index
 */

// Export all from DocumentAnalysis
export * from './DocumentAnalysis';

// Export all from ContentAnalysis
export * from './ContentAnalysis';

// Export all from SuggestionTypes
export * from './SuggestionTypes';

/**
 * Type guard utilities
 */

/**
 * Check if value is a DocumentSection
 */
export function isDocumentSection(value: any): value is import('./DocumentAnalysis').DocumentSection {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.content === 'string' &&
    typeof value.startIndex === 'number' &&
    typeof value.endIndex === 'number' &&
    typeof value.level === 'number'
  );
}

/**
 * Check if value is a StructuralSuggestion
 */
export function isStructuralSuggestion(value: any): value is import('./SuggestionTypes').StructuralSuggestion {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.type === 'string' &&
    typeof value.description === 'string' &&
    typeof value.explanation === 'string' &&
    typeof value.priority === 'string' &&
    typeof value.confidence === 'number'
  );
}

/**
 * Check if value is a ContentSuggestion
 */
export function isContentSuggestion(value: any): value is import('./SuggestionTypes').ContentSuggestion {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.type === 'string' &&
    typeof value.description === 'string' &&
    typeof value.currentContent === 'string' &&
    typeof value.suggestedContent === 'string' &&
    typeof value.priority === 'string' &&
    typeof value.confidence === 'number'
  );
}

/**
 * Create a default document analysis result structure
 */
export function createDefaultDocumentAnalysisResult(
  content: string,
  options: Partial<import('./DocumentAnalysis').DocumentAnalysisResult> = {}
): import('./DocumentAnalysis').DocumentAnalysisResult {
  const now = new Date();
  
  return {
    metadata: {
      timestamp: now,
      scope: 'full-document',
      depth: 'standard',
      processingTimeMs: 0,
      statistics: {
        characterCount: content.length,
        wordCount: content.split(/\s+/).length,
        sentenceCount: content.split(/[.!?]+/).length - 1,
        paragraphCount: content.split(/\n\s*\n/).length,
        readingTimeMinutes: Math.ceil(content.split(/\s+/).length / 200) // 200 wpm
      }
    },
    structure: {
      sections: [],
      hierarchy: {
        rootSections: [],
        maxDepth: 0,
        isBalanced: true,
        issues: []
      },
      structuralIssues: [],
      flowAnalysis: {
        flowScore: 0,
        transitions: [],
        logicalProgression: {
          coherenceScore: 0,
          flowType: 'mixed',
          logicalGaps: [],
          argumentStrength: 'moderate',
          evidenceSupport: 'adequate'
        }
      }
    },
    quality: {
      readability: {
        fleschReadingEase: 0,
        fleschKincaidGradeLevel: 0,
        gunningFogIndex: 0,
        colemanLiauIndex: 0,
        smogIndex: 0,
        automatedReadabilityIndex: 0,
        daleChallScore: 0,
        assessment: 'standard',
        targetAudienceLevel: 'general'
      },
      tone: {
        primaryTone: 'neutral',
        secondaryTones: [],
        consistencyScore: 0,
        appropriateness: 'adequate'
      },
      clarity: {
        clarityScore: 0,
        sentenceComplexity: {
          averageSentenceLength: 0,
          longSentenceCount: 0,
          veryLongSentenceCount: 0,
          shortSentenceCount: 0,
          sentenceLengthVariation: 0,
          complexSentencePercentage: 0,
          passiveVoicePercentage: 0,
          impact: 'neutral'
        },
        jargonUsage: {
          jargonTerms: [],
          jargonDensity: 0,
          appropriateness: 'appropriate',
          alternatives: []
        },
        ambiguities: [],
        concreteAbstractRatio: 0
      },
      consistency: [],
      redundancies: []
    },
    insights: {
      keyThemes: [],
      mainArguments: [],
      evidenceAnalysis: [],
      logicalFlow: {
        overallCoherence: 0,
        argumentChainCompleteness: 'partial',
        logicalFallacies: [],
        reasoningQuality: 'adequate',
        assumptions: [],
        implicationsExplored: 'some'
      },
      audienceAppropriateness: {
        targetAudience: 'general',
        appropriateness: 'appropriate',
        knowledgeLevelMatch: 'appropriate',
        interestLevel: 'moderate',
        accessibility: 'adequate',
        culturalAppropriateness: 'adequate',
        targetingSuggestions: []
      }
    },
    suggestions: {
      structural: [],
      content: [],
      style: [],
      flow: [],
      priority: 'medium'
    },
    assessment: {
      overallScore: 0,
      strengths: [],
      areasForImprovement: [],
      improvementUrgency: 'medium',
      confidence: 0
    },
    ...options
  };
}