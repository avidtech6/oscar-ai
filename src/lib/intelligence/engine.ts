/**
 * Intelligence Engine Entrypoint
 * 
 * This module loads all Phase Files as the authoritative architectural blueprint
 * for Oscar AI V2. It provides structured access to the intelligence layer,
 * metadata extraction, indexing, and lookup capabilities.
 * 
 * Architecture Rules:
 * 1. Phase Files are the single source of truth
 * 2. No logic from HAR may influence intelligence layer
 * 3. UI calls intelligence through clean public API
 * 4. Intelligence must be modular, typed, and future-proof
 */

export { OscarIntelligenceEngine } from './engineCore';
export { extractReportTypes, extractWorkflowDefinitions, extractSchemaMappings } from './engineDataExtractors';
export { generateReport, explainDecision } from './engineReport';

import { OscarIntelligenceEngine } from './engineCore';

/**
 * Singleton instance of the intelligence engine
 */
export const intelligenceEngine = new OscarIntelligenceEngine();

/**
 * Helper function to initialize and get the engine
 */
export async function getIntelligenceEngine(): Promise<OscarIntelligenceEngine> {
	await intelligenceEngine.initialize();
	return intelligenceEngine;
}

/**
 * Export the engine as default
 */
export default intelligenceEngine;