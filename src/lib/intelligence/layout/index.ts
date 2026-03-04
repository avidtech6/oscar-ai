/**
 * AI Layout Engine – Phase 23
 * 
 * Exports all layout‑related modules.
 */

export * from './LayoutTypes';
export * from './LayoutBlockSystem';
export * from './ColumnEngine';
export * from './FigureCaptionEngine';
export * from './TableGenerationEngine';
export * from './SectionReorderingEngine';
export * from './LayoutAwareMediaPlacement';
export * from './LayoutAwareContextMode';
export * from './LayoutAwareChatMode';
export * from './LayoutEventModel';
export * from './AILayoutEngine';

// Default export: the main engine
export { AILayoutEngine as default } from './AILayoutEngine';