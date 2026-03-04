/**
 * Report AI Reasoning Integration (Phase 12)
 * 
 * Exports the main engine, types, analyzers, generators, and storage.
 */

export { ReportAIReasoningEngine } from './ReportAIReasoningEngine';
export type { ReasoningInput, ReasoningOutput } from './ReportAIReasoningEngine';

export { createReasoningInsight } from './ReasoningInsight';
export type { ReasoningInsight } from './ReasoningInsight';

export { createClarifyingQuestion } from './ClarifyingQuestion';
export type { ClarifyingQuestion } from './ClarifyingQuestion';

// Analyzers
export { analyzeStructure } from './analyzers/analyzeStructure';
export { analyzeContent } from './analyzers/analyzeContent';
export { analyzeStyle } from './analyzers/analyzeStyle';
export { analyzeCompliance } from './analyzers/analyzeCompliance';
export { analyzeTerminology } from './analyzers/analyzeTerminology';
export { analyzeMetadata } from './analyzers/analyzeMetadata';
export { analyzeMethodology } from './analyzers/analyzeMethodology';

// Generators
export { generateInsights } from './generators/generateInsights';
export { generateClarifyingQuestions } from './generators/generateClarifyingQuestions';
export { generateRecommendedActions } from './generators/generateRecommendedActions';

// Storage
export {
	loadReasoningResults,
	saveReasoningResult,
	getReasoningResultsForReport,
	deleteOldReasoningResults,
} from './storage';
export type { StoredReasoningResult } from './storage';