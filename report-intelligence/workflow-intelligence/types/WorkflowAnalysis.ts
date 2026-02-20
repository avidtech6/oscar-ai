/**
 * Phase 25: Workflow Intelligence Layer
 * Workflow Analysis Type Definitions
 * 
 * Defines types for workflow analysis, intelligence, predictions,
 * and multi‑document reasoning.
 */

/**
 * Workflow analysis scope
 */
export type WorkflowAnalysisScope =
  | 'single-entity'      // Analysis of a single entity
  | 'entity-group'       // Analysis of a group of related entities
  | 'project-level'      // Analysis at project level
  | 'cross-project'      // Analysis across multiple projects
  | 'temporal'          // Analysis over time
  | 'structural';       // Analysis of structure and relationships

/**
 * Workflow analysis depth
 */
export type WorkflowAnalysisDepth =
  | 'surface'      // Quick, shallow analysis
  | 'standard'     // Balanced depth/speed
  | 'deep'         // Comprehensive analysis
  | 'exhaustive';  // Maximum depth (slow)

/**
 * Workflow analysis request
 */
export interface WorkflowAnalysisRequest {
  /** Entity IDs to analyze */
  entityIds: string[];
  /** Analysis scope */
  scope: WorkflowAnalysisScope;
  /** Analysis depth */
  depth: WorkflowAnalysisDepth;
  /** Focus areas */
  focusAreas?: string[];
  /** Whether to include predictions */
  includePredictions: boolean;
  /** Whether to include recommendations */
  includeRecommendations: boolean;
  /** Whether to include confidence scores */
  includeConfidence: boolean;
  /** Maximum number of insights to return */
  maxInsights?: number;
  /** Context for analysis */
  context?: Record<string, any>;
}

/**
 * Workflow analysis result
 */
export interface WorkflowAnalysisResult {
  /** Analysis metadata */
  metadata: {
    /** When analysis was performed */
    timestamp: Date;
    /** Analysis scope */
    scope: WorkflowAnalysisScope;
    /** Analysis depth */
    depth: WorkflowAnalysisDepth;
    /** Processing time in milliseconds */
    processingTimeMs: number;
    /** Entity statistics */
    statistics: {
      /** Total entities analyzed */
      entityCount: number;
      /** Total relationships analyzed */
      relationshipCount: number;
      /** Average entity complexity */
      averageComplexity: number;
    };
  };
  
  /** Entity analysis */
  entities: {
    /** Entity summaries */
    summaries: EntitySummary[];
    /** Entity relationships */
    relationships: EntityRelationship[];
    /** Entity gaps or issues */
    issues: EntityIssue[];
    /** Entity opportunities */
    opportunities: EntityOpportunity[];
  };
  
  /** Workflow analysis */
  workflow: {
    /** Workflow patterns detected */
    patterns: WorkflowPattern[];
    /** Workflow bottlenecks */
    bottlenecks: WorkflowBottleneck[];
    /** Workflow efficiencies */
    efficiencies: WorkflowEfficiency[];
    /** Workflow risks */
    risks: WorkflowRisk[];
  };
  
  /** Intelligence insights */
  insights: {
    /** Key insights */
    keyInsights: KeyInsight[];
    /** Strategic recommendations */
    strategicRecommendations: StrategicRecommendation[];
    /** Tactical recommendations */
    tacticalRecommendations: TacticalRecommendation[];
    /** Predictive insights */
    predictiveInsights: PredictiveInsight[];
  };
  
  /** Predictions */
  predictions: {
    /** Next likely actions */
    nextActions: NextActionPrediction[];
    /** Outcome predictions */
    outcomePredictions: OutcomePrediction[];
    /** Risk predictions */
    riskPredictions: RiskPrediction[];
    /** Timeline predictions */
    timelinePredictions: TimelinePrediction[];
  };
  
  /** Overall assessment */
  assessment: {
    /** Overall workflow health score (0-100) */
    healthScore: number;
    /** Workflow maturity level */
    maturityLevel: 'initial' | 'developing' | 'defined' | 'managed' | 'optimizing';
    /** Strengths of the workflow */
    strengths: string[];
    /** Areas for improvement */
    areasForImprovement: string[];
    /** Urgency of improvements */
    improvementUrgency: 'low' | 'medium' | 'high' | 'critical';
    /** Confidence in analysis */
    confidence: number; // 0-1
  };
}

/**
 * Entity summary
 */
export interface EntitySummary {
  /** Entity ID */
  entityId: string;
  /** Entity type */
  entityType: string;
  /** Summary text */
  summary: string;
  /** Key attributes */
  keyAttributes: Record<string, any>;
  /** Status assessment */
  statusAssessment: 'healthy' | 'warning' | 'critical' | 'unknown';
  /** Complexity score (0-1) */
  complexityScore: number;
  /** Importance score (0-1) */
  importanceScore: number;
}

/**
 * Entity relationship
 */
export interface EntityRelationship {
  /** Relationship ID */
  relationshipId: string;
  /** Source entity ID */
  sourceId: string;
  /** Target entity ID */
  targetId: string;
  /** Relationship type */
  relationshipType: string;
  /** Strength (0-1) */
  strength: number;
  /** Direction */
  direction: 'forward' | 'backward' | 'bidirectional';
  /** Evidence for relationship */
  evidence: string[];
  /** Confidence in relationship (0-1) */
  confidence: number;
}

/**
 * Entity issue
 */
export interface EntityIssue {
  /** Issue type */
  type: 
    | 'missing-information'
    | 'contradiction'
    | 'outdated'
    | 'incomplete'
    | 'ambiguous'
    | 'duplicate'
    | 'orphaned'
    | 'overly-complex';
  /** Description */
  description: string;
  /** Entity ID */
  entityId: string;
  /** Severity */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Impact */
  impact: 'minor' | 'moderate' | 'major' | 'severe';
  /** Suggested fix */
  suggestedFix: string;
  /** Priority */
  priority: number;
}

/**
 * Entity opportunity
 */
export interface EntityOpportunity {
  /** Opportunity type */
  type:
    | 'automation'
    | 'optimization'
    | 'enhancement'
    | 'integration'
    | 'expansion'
    | 'simplification';
  /** Description */
  description: string;
  /** Entity ID */
  entityId: string;
  /** Potential benefit */
  potentialBenefit: 'minor' | 'moderate' | 'major' | 'transformative';
  /** Effort required */
  effortRequired: 'low' | 'medium' | 'high' | 'very-high';
  /** Implementation complexity */
  implementationComplexity: 'low' | 'medium' | 'high';
  /** Expected ROI */
  expectedROI: number; // Percentage
}

/**
 * Workflow pattern
 */
export interface WorkflowPattern {
  /** Pattern type */
  type:
    | 'linear'
    | 'parallel'
    | 'iterative'
    | 'branching'
    | 'converging'
    | 'diverging'
    | 'cyclic'
    | 'ad-hoc';
  /** Description */
  description: string;
  /** Entities involved */
  entityIds: string[];
  /** Pattern strength (0-1) */
  strength: number;
  /** Efficiency assessment */
  efficiency: 'inefficient' | 'adequate' | 'efficient' | 'highly-efficient';
  /** Recommendations for optimization */
  optimizationRecommendations: string[];
}

/**
 * Workflow bottleneck
 */
export interface WorkflowBottleneck {
  /** Bottleneck type */
  type:
    | 'resource-constraint'
    | 'dependency-wait'
    | 'approval-delay'
    | 'information-gap'
    | 'skill-gap'
    | 'tool-limitation';
  /** Description */
  description: string;
  /** Location (entity IDs) */
  location: string[];
  /** Impact on workflow */
  impact: 'minor' | 'moderate' | 'major' | 'severe';
  /** Root cause */
  rootCause: string;
  /** Suggested resolution */
  suggestedResolution: string;
  /** Estimated resolution time */
  estimatedResolutionTime: 'hours' | 'days' | 'weeks' | 'months';
}

/**
 * Workflow efficiency
 */
export interface WorkflowEfficiency {
  /** Efficiency type */
  type:
    | 'automation'
    | 'parallelization'
    | 'standardization'
    | 'tool-usage'
    | 'knowledge-sharing'
    | 'decision-making';
  /** Description */
  description: string;
  /** Location (entity IDs) */
  location: string[];
  /** Efficiency score (0-1) */
  efficiencyScore: number;
  /** Best practices observed */
  bestPractices: string[];
  /** Replication potential */
  replicationPotential: 'low' | 'medium' | 'high' | 'very-high';
}

/**
 * Workflow risk
 */
export interface WorkflowRisk {
  /** Risk type */
  type:
    | 'single-point-of-failure'
    | 'knowledge-silo'
    | 'process-breakdown'
    | 'compliance-violation'
    | 'security-vulnerability'
    | 'data-loss'
    | 'timeline-slip'
    | 'budget-overrun';
  /** Description */
  description: string;
  /** Location (entity IDs) */
  location: string[];
  /** Likelihood */
  likelihood: 'rare' | 'unlikely' | 'possible' | 'likely' | 'almost-certain';
  /** Impact */
  impact: 'negligible' | 'minor' | 'moderate' | 'major' | 'catastrophic';
  /** Risk level */
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  /** Mitigation strategies */
  mitigationStrategies: string[];
}

/**
 * Key insight
 */
export interface KeyInsight {
  /** Insight type */
  type:
    | 'pattern-recognition'
    | 'correlation-discovery'
    | 'causal-inference'
    | 'trend-identification'
    | 'anomaly-detection'
    | 'opportunity-identification'
    | 'risk-identification';
  /** Insight text */
  insight: string;
  /** Supporting evidence */
  evidence: string[];
  /** Confidence (0-1) */
  confidence: number;
  /** Impact */
  impact: 'low' | 'medium' | 'high' | 'transformative';
  /** Actionability */
  actionability: 'theoretical' | 'actionable' | 'immediately-actionable';
}

/**
 * Strategic recommendation
 */
export interface StrategicRecommendation {
  /** Recommendation type */
  type:
    | 'process-redesign'
    | 'tool-adoption'
    | 'skill-development'
    | 'organizational-change'
    | 'strategic-investment'
    | 'partnership-formation';
  /** Recommendation text */
  recommendation: string;
  /** Rationale */
  rationale: string;
  /** Expected benefits */
  expectedBenefits: string[];
  /** Implementation timeline */
  implementationTimeline: 'short-term' | 'medium-term' | 'long-term';
  /** Resource requirements */
  resourceRequirements: 'low' | 'medium' | 'high' | 'very-high';
  /** Risk assessment */
  riskAssessment: 'low' | 'medium' | 'high';
}

/**
 * Tactical recommendation
 */
export interface TacticalRecommendation {
  /** Recommendation type */
  type:
    | 'process-adjustment'
    | 'tool-configuration'
    | 'training-needed'
    | 'communication-improvement'
    | 'quality-check'
    | 'automation-opportunity';
  /** Recommendation text */
  recommendation: string;
  /** Specific action */
  specificAction: string;
  /** Responsible party */
  responsibleParty?: string;
  /** Due date */
  dueDate?: Date;
  /** Priority */
  priority: 'low' | 'medium' | 'high' | 'critical';
  /** Estimated effort */
  estimatedEffort: 'minutes' | 'hours' | 'days' | 'weeks';
}

/**
 * Predictive insight
 */
export interface PredictiveInsight {
  /** Prediction type */
  type:
    | 'outcome-prediction'
    | 'timeline-prediction'
    | 'risk-prediction'
    | 'opportunity-prediction'
    | 'behavior-prediction';
  /** Prediction text */
  prediction: string;
  /** Confidence (0-1) */
  confidence: number;
  /** Time horizon */
  timeHorizon: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
  /** Key factors */
  keyFactors: string[];
  /** Alternative scenarios */
  alternativeScenarios: string[];
}

/**
 * Next action prediction
 */
export interface NextActionPrediction {
  /** Predicted action */
  action: string;
  /** Entity ID (if specific) */
  entityId?: string;
  /** Confidence (0-1) */
  confidence: number;
  /** Expected value */
  expectedValue: 'low' | 'medium' | 'high' | 'very-high';
  /** Estimated time to complete */
  estimatedTimeMinutes?: number;
  /** Dependencies */
  dependencies: string[];
  /** Alternative actions */
  alternatives: Array<{
    action: string;
    confidence: number;
    reason: string;
  }>;
}

/**
 * Outcome prediction
 */
export interface OutcomePrediction {
  /** Outcome description */
  outcome: string;
  /** Probability (0-1) */
  probability: number;
  /** Impact */
  impact: 'negative' | 'neutral' | 'positive' | 'transformative';
  /** Timeframe */
  timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
  /** Key drivers */
  keyDrivers: string[];
  /** Mitigation strategies (for negative outcomes) */
  mitigationStrategies?: string[];
  /** Enhancement strategies (for positive outcomes) */
  enhancementStrategies?: string[];
}

/**
 * Risk prediction
 */
export interface RiskPrediction {
  /** Risk description */
  risk: string;
  /** Likelihood (0-1) */
  likelihood: number;
  /** Impact */
  impact: 'low' | 'medium' | 'high' | 'severe';
  /** Risk level */
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  /** Timeframe */
  timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
  /** Early warning signs */
  earlyWarningSigns: string[];
  /** Mitigation strategies */
  mitigationStrategies: string[];
}

/**
 * Timeline prediction
 */
export interface TimelinePrediction {
  /** Event description */
  event: string;
  /** Predicted date */
  predictedDate: Date;
  /** Confidence interval */
  confidenceInterval: {
    earliest: Date;
    latest: Date;
  };
  /** Confidence (0-1) */
  confidence: number;
  /** Key dependencies */
  keyDependencies: string[];
  /** Acceleration opportunities */
  accelerationOpportunities?: string[];
  /** Delay risks */
  delayRisks?: string[];
}

/**
 * Type utilities
 */

/**
 * Check if value is a WorkflowAnalysisRequest
 */
export function isWorkflowAnalysisRequest(value: any): value is WorkflowAnalysisRequest {
  return (
    value &&
    typeof value === 'object' &&
    Array.isArray(value.entityIds) &&
    typeof value.scope === 'string' &&
    typeof value.depth === 'string' &&
    typeof value.includePredictions === 'boolean' &&
    typeof value.includeRecommendations === 'boolean' &&
    typeof value.includeConfidence === 'boolean'
  );
}

/**
 * Create a default workflow analysis request
 */
export function createDefaultWorkflowAnalysisRequest(
  entityIds: string[],
  options: Partial<WorkflowAnalysisRequest> = {}
): WorkflowAnalysisRequest {
  return {
    entityIds,
    scope: 'entity-group',
    depth: 'standard',
    includePredictions: true,
    includeRecommendations: true,
    includeConfidence: true,
    maxInsights: 20,
    ...options
  };
}