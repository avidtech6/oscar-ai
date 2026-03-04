/**
 * Document Intelligence Layer – Phase 24
 * 
 * Exports all document‑related modules.
 */

export * from './DocumentTypes';
export * from './DocumentStructureAnalysisEngine';
export * from './CrossSectionConsistencyEngine';
export * from './ToneStyleControlEngine';
export * from './DocumentLevelReasoningEngine';
export * from './AutoSummaryEngine';
export * from './AutoRewriteEngine';
export * from './StructuralOptimisationEngine';
export * from './DocumentAwareContextMode';
export * from './DocumentAwareChatMode';
export * from './DocumentEventModel';
export * from './DocumentIntelligenceLayer';

// Default export: the main orchestrator
export { DocumentIntelligenceLayer as default } from './DocumentIntelligenceLayer';