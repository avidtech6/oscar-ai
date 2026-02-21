/**
 * User Workflow Learning Service
 * Wrapper for the Phase 13 User Workflow Learning Engine
 */

let workflowLearningInstance: any = null;

/**
 * Get or create the UserWorkflowLearningEngine instance
 */
async function getUserWorkflowLearningEngine(): Promise<any> {
  if (!workflowLearningInstance) {
    // Temporarily use mock engine to avoid build issues
    // TODO: Restore dynamic import when the module resolution is fixed
    workflowLearningInstance = createMockWorkflowLearningEngine();
  }
  return workflowLearningInstance;
}

/**
 * Create a mock workflow learning engine for fallback
 */
function createMockWorkflowLearningEngine() {
  return {
    async recordUserAction(action: string, context?: any) {
      // Simulate recording delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('User workflow action recorded:', action, context);
      
      return {
        success: true,
        recordedAt: new Date().toISOString(),
        actionId: crypto.randomUUID(),
      };
    },
    
    async analyzeWorkflowPatterns(userId?: string) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock workflow patterns
      const patterns = {
        frequentActions: [
          { action: 'generate_report', count: 12, lastPerformed: '2024-01-15' },
          { action: 'edit_section', count: 8, lastPerformed: '2024-01-14' },
          { action: 'check_compliance', count: 5, lastPerformed: '2024-01-13' },
          { action: 'analyze_style', count: 3, lastPerformed: '2024-01-12' },
        ],
        commonSequences: [
          { sequence: ['select_template', 'fill_gaps', 'generate_report'], frequency: 0.65 },
          { sequence: ['edit_section', 'check_compliance', 'generate_pdf'], frequency: 0.42 },
          { sequence: ['analyze_style', 'edit_section', 'generate_report'], frequency: 0.28 },
        ],
        timePatterns: {
          mostActiveDay: 'Tuesday',
          mostActiveHour: '14:00-15:00',
          averageSessionDuration: '18 minutes',
        },
        templatePreferences: [
          { templateId: 'bs5837', usageCount: 8, averageCompletionTime: '12 minutes' },
          { templateId: 'impact', usageCount: 3, averageCompletionTime: '15 minutes' },
          { templateId: 'method', usageCount: 1, averageCompletionTime: '20 minutes' },
        ],
      };
      
      return {
        success: true,
        data: patterns,
      };
    },
    
    async predictNextAction(context?: any) {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Mock prediction based on context
      let predictedAction = 'generate_report';
      let confidence = 0.72;
      let reasoning = 'Based on your recent template selection and gap filling completion';
      
      if (context?.currentStep === 'edit') {
        predictedAction = 'check_compliance';
        confidence = 0.68;
        reasoning = 'Users typically check compliance after editing report sections';
      } else if (context?.hasComplianceIssues) {
        predictedAction = 'fix_compliance_issues';
        confidence = 0.81;
        reasoning = 'Compliance issues detected - likely next step is to address them';
      } else if (context?.templateId === 'bs5837') {
        predictedAction = 'generate_pdf';
        confidence = 0.65;
        reasoning = 'BS5837 reports are typically exported as PDF for submission';
      }
      
      return {
        success: true,
        data: {
          predictedAction,
          confidence,
          reasoning,
          suggestedActions: [
            { action: predictedAction, label: getActionLabel(predictedAction), priority: 'high' },
            { action: 'review_report', label: 'Review Report', priority: 'medium' },
            { action: 'export_options', label: 'Explore Export Options', priority: 'low' },
          ],
        },
      };
    },
    
    async getPersonalizedSuggestions(userId?: string, context?: any) {
      await new Promise(resolve => setTimeout(resolve, 900));
      
      // Mock personalized suggestions
      const suggestions = [
        {
          type: 'workflow_optimization',
          title: 'Try the Section Editor',
          description: 'Based on your frequent report edits, try using the section-by-section editor for more precise control.',
          benefit: 'Could reduce editing time by ~30%',
          action: 'try_section_editor',
          confidence: 0.78,
        },
        {
          type: 'template_suggestion',
          title: 'Consider Impact Assessment Template',
          description: 'You frequently generate BS5837 reports. The Impact Assessment template might be useful for related projects.',
          benefit: 'Better suited for development projects',
          action: 'explore_impact_template',
          confidence: 0.65,
        },
        {
          type: 'time_saving',
          title: 'Use AI Gap Filling',
          description: 'You spend significant time filling client/site information. The AI gap filling feature can automate this.',
          benefit: 'Save ~5 minutes per report',
          action: 'enable_ai_gap_filling',
          confidence: 0.82,
        },
        {
          type: 'compliance',
          title: 'Check Compliance Early',
          description: 'You often check compliance at the end. Try checking earlier to avoid rework.',
          benefit: 'Reduce compliance-related edits by ~40%',
          action: 'check_compliance_early',
          confidence: 0.71,
        },
      ];
      
      return {
        success: true,
        data: {
          suggestions,
          basedOn: {
            actionCount: 24,
            daysTracked: 14,
            templatesUsed: 3,
          },
        },
      };
    },
    
    async getWorkflowInsights() {
      await new Promise(resolve => setTimeout(resolve, 700));
      
      return {
        success: true,
        data: {
          efficiencyScore: 78,
          improvementAreas: [
            'Gap filling completion time',
            'Compliance check frequency',
            'Template selection confidence',
          ],
          strengths: [
            'Report generation speed',
            'Section editing precision',
            'Multi-format export usage',
          ],
          recommendations: [
            'Use AI suggestions for gap filling to save time',
            'Enable auto-compliance checking',
            'Try the workflow shortcuts in the toolbar',
          ],
        },
      };
    },
  };
}

/**
 * Get human-readable label for action
 */
function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    'generate_report': 'Generate Report',
    'edit_section': 'Edit Section',
    'check_compliance': 'Check Compliance',
    'analyze_style': 'Analyze Style',
    'generate_pdf': 'Generate PDF',
    'select_template': 'Select Template',
    'fill_gaps': 'Fill Information Gaps',
    'review_report': 'Review Report',
    'export_options': 'Explore Export Options',
    'fix_compliance_issues': 'Fix Compliance Issues',
  };
  
  return labels[action] || action.replace('_', ' ');
}

/**
 * Record a user workflow action
 */
export async function recordWorkflowAction(
  action: string,
  context?: any
): Promise<{
  success: boolean;
  recordedAt?: string;
  error?: string;
}> {
  try {
    const engine = await getUserWorkflowLearningEngine();
    const result = await engine.recordUserAction(action, context);
    
    return {
      success: true,
      recordedAt: result.recordedAt,
    };
  } catch (error) {
    console.error('Workflow action recording failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during action recording',
    };
  }
}

/**
 * Analyze user workflow patterns
 */
export async function analyzeWorkflowPatterns(
  userId?: string
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const engine = await getUserWorkflowLearningEngine();
    const result = await engine.analyzeWorkflowPatterns(userId);
    
    return {
      success: true,
      data: result.data || result,
    };
  } catch (error) {
    console.error('Workflow pattern analysis failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during pattern analysis',
    };
  }
}

/**
 * Predict next likely action
 */
export async function predictNextWorkflowAction(
  context?: any
): Promise<{
  success: boolean;
  predictedAction?: string;
  confidence?: number;
  reasoning?: string;
  suggestedActions?: any[];
  error?: string;
}> {
  try {
    const engine = await getUserWorkflowLearningEngine();
    const result = await engine.predictNextAction(context);
    
    if (result.success) {
      return {
        success: true,
        predictedAction: result.data.predictedAction,
        confidence: result.data.confidence,
        reasoning: result.data.reasoning,
        suggestedActions: result.data.suggestedActions,
      };
    } else {
      return {
        success: false,
        error: 'Failed to predict next action',
      };
    }
  } catch (error) {
    console.error('Workflow prediction failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during prediction',
    };
  }
}

/**
 * Get personalized workflow suggestions
 */
export async function getPersonalizedWorkflowSuggestions(
  userId?: string,
  context?: any
): Promise<{
  success: boolean;
  suggestions?: any[];
  error?: string;
}> {
  try {
    const engine = await getUserWorkflowLearningEngine();
    const result = await engine.getPersonalizedSuggestions(userId, context);
    
    if (result.success) {
      return {
        success: true,
        suggestions: result.data.suggestions,
      };
    } else {
      return {
        success: false,
        error: 'Failed to get personalized suggestions',
      };
    }
  } catch (error) {
    console.error('Personalized suggestions failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during suggestions',
    };
  }
}

/**
 * Get workflow insights and recommendations
 */
export async function getWorkflowInsights(): Promise<{
  success: boolean;
  efficiencyScore?: number;
  improvementAreas?: string[];
  strengths?: string[];
  recommendations?: string[];
  error?: string;
}> {
  try {
    const engine = await getUserWorkflowLearningEngine();
    const result = await engine.getWorkflowInsights();
    
    if (result.success) {
      return {
        success: true,
        efficiencyScore: result.data.efficiencyScore,
        improvementAreas: result.data.improvementAreas,
        strengths: result.data.strengths,
        recommendations: result.data.recommendations,
      };
    } else {
      return {
        success: false,
        error: 'Failed to get workflow insights',
      };
    }
  } catch (error) {
    console.error('Workflow insights failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during insights',
    };
  }
}

/**
 * Quick workflow check
 */
export async function quickWorkflowCheck(): Promise<{
  hasPatterns: boolean;
  suggestionCount: number;
  efficiencyScore: number;
  nextActionPrediction: string | null;
}> {
  try {
    const [patterns, suggestions, insights, prediction] = await Promise.all([
      analyzeWorkflowPatterns(),
      getPersonalizedWorkflowSuggestions(),
      getWorkflowInsights(),
      predictNextWorkflowAction(),
    ]);
    
    return {
      hasPatterns: patterns.success && patterns.data?.frequentActions?.length > 0,
      suggestionCount: suggestions.success ? (suggestions.suggestions?.length || 0) : 0,
      efficiencyScore: insights.success ? (insights.efficiencyScore || 0) : 0,
      nextActionPrediction: prediction.success ? prediction.predictedAction || null : null,
    };
  } catch (error) {
    console.error('Quick workflow check failed:', error);
    return {
      hasPatterns: false,
      suggestionCount: 0,
      efficiencyScore: 0,
      nextActionPrediction: null,
    };
  }
}