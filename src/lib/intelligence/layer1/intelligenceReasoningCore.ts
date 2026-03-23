/**
 * Intelligence Reasoning Core - Layer 1 Pure Functions
 * 
 * Pure intelligence reasoning functions extracted from apiReasoning.ts
 * Contains only business logic, no presentation logic or UI concerns.
 */

import type { OscarIntelligenceEngine } from './intelligenceEngineCore';

/**
 * Core interface for intelligence reasoning operations
 */
export interface IntelligenceReasoningCore {
	/**
	 * Get reasoning trace for a decision
	 */
	getReasoningTrace(
		engine: OscarIntelligenceEngine,
		explainDecision: (decisionPath: string) => Promise<string>,
		decisionPath: string
	): Promise<string[]>;
}

/**
 * Default implementation of intelligence reasoning core
 */
export const defaultIntelligenceReasoningCore: IntelligenceReasoningCore = {
	async getReasoningTrace(engine, explainDecision, decisionPath) {
		const explanation = await explainDecision(decisionPath);
		
		// Parse explanation into trace steps
		const trace: string[] = [
			`Decision path: ${decisionPath}`,
			`Explanation: ${explanation}`,
			`Timestamp: ${new Date().toISOString()}`,
			`Intelligence layer consulted: Phase Files`
		];
		
		// Add phase references
		const searchResults = engine.search(decisionPath);
		if (searchResults.length > 0) {
			trace.push(`Relevant phases found: ${searchResults.length}`);
			searchResults.forEach((result, index) => {
				const metadata = engine.getMetadata(index + 1);
				if (metadata) {
					trace.push(`- Phase ${metadata.phaseNumber}: ${metadata.title}`);
				}
			});
		}
		
		return trace;
	}
};

/**
 * Factory function to create intelligence reasoning core
 */
export function createIntelligenceReasoningCore(
	impl: IntelligenceReasoningCore = defaultIntelligenceReasoningCore
): IntelligenceReasoningCore {
	return impl;
}

/**
 * Utility function to execute a reasoning operation
 */
async function executeReasoningOperation<T>(
	engine: OscarIntelligenceEngine,
	explainDecision: (decisionPath: string) => Promise<string>,
	operation: (engine: OscarIntelligenceEngine, explainDecision: (decisionPath: string) => Promise<string>) => Promise<T>
): Promise<T> {
	return operation(engine, explainDecision);
}

/**
 * Utility function to batch execute reasoning operations
 */
export async function batchExecuteReasoningOperations<T>(
	engine: OscarIntelligenceEngine,
	explainDecision: (decisionPath: string) => Promise<string>,
	operations: Array<(engine: OscarIntelligenceEngine, explainDecision: (decisionPath: string) => Promise<string>) => Promise<T>>
): Promise<T[]> {
	const results = await Promise.all(operations.map(op => executeReasoningOperation(engine, explainDecision, op)));
	return results;
}