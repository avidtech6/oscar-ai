/**
 * Intelligence Engine Core - Layer 2 Presentation
 * 
 * Core engine class with initialization, basic getters, and search.
 * 
 * NOTE: Core implementation has been extracted to Layer 1 Core for purity.
 * This file now re-exports the Layer 1 implementation to maintain compatibility.
 */

// Re-export the Layer 1 core implementation
export { OscarIntelligenceEngine } from './layer1/intelligenceEngineCore.js';