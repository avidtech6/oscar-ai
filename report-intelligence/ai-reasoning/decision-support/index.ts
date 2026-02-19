/**
 * AI Decision Support System - Phase 12.8
 * 
 * Exports for the Decision Support module components.
 */

export * from './DecisionSupportSystem';
export { DEFAULT_DECISION_SUPPORT_CONFIG } from './DecisionSupportSystem';
export type {
  DecisionSupportConfiguration,
  DecisionContext,
  HistoricalDecision,
  ActionPlan,
  ActionItem,
  ResourceRequirement,
  RiskAssessment,
  SuccessMetric
} from './DecisionSupportSystem';

// Note: Additional decision support components will be exported here as they are implemented
// - DecisionAnalyzer
// - RecommendationEngine
// - ActionPlanGenerator
// - etc.