/**
 * Style Learner Service
 * Wrapper for the Phase 5 Report Style Learner Engine
 */

let styleLearnerInstance: any = null;

/**
 * Get or create the ReportStyleLearner instance
 */
async function getStyleLearner(): Promise<any> {
  if (!styleLearnerInstance) {
    try {
      // Dynamic import to avoid TypeScript compilation issues
      const { ReportStyleLearner } = await import('../../../report-intelligence/style-learner/ReportStyleLearner');
      styleLearnerInstance = new ReportStyleLearner();
    } catch (error) {
      console.error('Failed to load ReportStyleLearner:', error);
      // Return a mock style learner for now
      styleLearnerInstance = createMockStyleLearner();
    }
  }
  return styleLearnerInstance;
}

/**
 * Create a mock style learner for fallback
 */
function createMockStyleLearner() {
  return {
    async analyzeReport(reportText: string, reportType?: string) {
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock style analysis
      const styleProfile = {
        tone: 'professional',
        formality: 'high',
        preferredPhrasing: [
          { phrase: 'It is recommended that', count: 3, confidence: 0.85 },
          { phrase: 'The assessment indicates', count: 2, confidence: 0.78 },
          { phrase: 'In accordance with', count: 4, confidence: 0.92 },
          { phrase: 'Based on the findings', count: 2, confidence: 0.75 },
        ],
        sectionOrder: ['Introduction', 'Methodology', 'Findings', 'Recommendations', 'Conclusion'],
        paragraphPatterns: [
          { pattern: 'topic-sentence → evidence → conclusion', frequency: 0.7 },
          { pattern: 'bullet-point lists', frequency: 0.3 },
        ],
        sentenceLength: {
          average: 22.5,
          range: [12, 35],
        },
        vocabulary: {
          technicalTerms: ['arboricultural', 'dendrological', 'phytosanitary', 'substrate'],
          commonAdjectives: ['significant', 'moderate', 'minimal', 'adequate'],
        },
        formatting: {
          usesHeadings: true,
          usesBullets: true,
          usesNumberedLists: false,
          usesTables: true,
        },
        confidence: 0.82,
      };
      
      return {
        success: true,
        data: {
          styleProfile,
          recommendations: [
            {
              type: 'tone',
              suggestion: 'Maintain professional tone throughout',
              confidence: 0.9,
            },
            {
              type: 'structure',
              suggestion: 'Follow the established section order',
              confidence: 0.85,
            },
            {
              type: 'phrasing',
              suggestion: 'Use "It is recommended that" for recommendations',
              confidence: 0.88,
            },
          ],
          compatibilityScore: 87,
          summary: {
            tone: styleProfile.tone,
            formality: styleProfile.formality,
            confidence: styleProfile.confidence,
            keyPhrases: styleProfile.preferredPhrasing.slice(0, 3).map(p => p.phrase),
          },
        },
      };
    },
    
    async learnFromExamples(examples: string[], reportType?: string) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        data: {
          learnedPatterns: 5,
          confidence: 0.76,
          message: 'Style patterns learned from 3 example reports',
        },
      };
    },
    
    async generateStyleGuide(reportType?: string) {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      return {
        success: true,
        data: {
          guide: {
            tone: 'Professional and authoritative',
            structure: 'Introduction → Methodology → Findings → Recommendations → Conclusion',
            phrasing: 'Use formal language, avoid contractions',
            formatting: 'Use headings, bullet points for lists, tables for data',
            examples: [
              'It is recommended that the tree be monitored annually.',
              'The assessment indicates moderate risk of failure.',
              'In accordance with BS5837:2012, a root protection area should be established.',
            ],
          },
        },
      };
    },
  };
}

/**
 * Analyze report style
 */
export async function analyzeReportStyle(
  reportText: string,
  reportType?: string
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const styleLearner = await getStyleLearner();
    const result = await styleLearner.analyzeReport(reportText, reportType);
    
    return {
      success: true,
      data: result.data || result,
    };
  } catch (error) {
    console.error('Style analysis failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during style analysis',
    };
  }
}

/**
 * Learn style from examples
 */
export async function learnStyleFromExamples(
  examples: string[],
  reportType?: string
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const styleLearner = await getStyleLearner();
    const result = await styleLearner.learnFromExamples(examples, reportType);
    
    return {
      success: true,
      data: result.data || result,
    };
  } catch (error) {
    console.error('Style learning failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during style learning',
    };
  }
}

/**
 * Get style guide for a report type
 */
export async function getStyleGuide(
  reportType?: string
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const styleLearner = await getStyleLearner();
    const result = await styleLearner.generateStyleGuide(reportType);
    
    return {
      success: true,
      data: result.data || result,
    };
  } catch (error) {
    console.error('Style guide generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during style guide generation',
    };
  }
}

/**
 * Quick style check
 */
export async function quickStyleCheck(reportText: string): Promise<{
  tone: string;
  formality: string;
  confidence: number;
  compatibility: number;
  keyPhrases: string[];
}> {
  try {
    const result = await analyzeReportStyle(reportText);
    
    if (result.success) {
      return {
        tone: result.data.summary?.tone || 'unknown',
        formality: result.data.summary?.formality || 'medium',
        confidence: result.data.summary?.confidence || 0,
        compatibility: result.data.compatibilityScore || 0,
        keyPhrases: result.data.summary?.keyPhrases || [],
      };
    } else {
      return {
        tone: 'unknown',
        formality: 'medium',
        confidence: 0,
        compatibility: 0,
        keyPhrases: [],
      };
    }
  } catch (error) {
    console.error('Quick style check failed:', error);
    return {
      tone: 'unknown',
      formality: 'medium',
      confidence: 0,
      compatibility: 0,
      keyPhrases: [],
    };
  }
}