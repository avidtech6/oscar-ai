/**
 * Reasoning Patterns and Inference Engine - Phase 12.7
 * 
 * Exports for the Reasoning module components.
 */

export * from './InferenceEngine';
export { DEFAULT_INFERENCE_ENGINE_CONFIG } from './InferenceEngine';
export type {
  InferenceEngineConfiguration,
  InferencePattern,
  PatternCondition,
  PatternConclusion
} from './InferenceEngine';

// Note: Additional reasoning components will be exported here as they are implemented
// - ReasoningPatternLibrary
// - InferenceValidator
// - ReasoningMetrics
// - etc.