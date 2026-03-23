/**
 * Intelligence Engine Report - Layer 2 Presentation
 * 
 * Report generation and decision explanation functions.
 * 
 * NOTE: Core implementation has been extracted to Layer 1 Core for purity.
 * This file now re-exports the Layer 1 implementation to maintain compatibility.
 */

// Re-export the Layer 1 core implementation
export { generateReport, explainDecision } from './layer1/intelligenceEngineCore.js';