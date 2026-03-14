/**
 * Intelligence API: Reasoning trace
 * 
 * Get reasoning trace for a decision.
 */

import { explainDecision } from './apiCore';
import { getIntelligenceEngine } from './engine';

/**
 * Get reasoning trace for a decision
 */
export async function getReasoningTrace(decisionPath: string): Promise<string[]> {
	const explanation = await explainDecision(decisionPath);
	
	// Parse explanation into trace steps
	const trace: string[] = [
		`Decision path: ${decisionPath}`,
		`Explanation: ${explanation}`,
		`Timestamp: ${new Date().toISOString()}`,
		`Intelligence layer consulted: Phase Files`
	];
	
	// Add phase references
	const engine = await getIntelligenceEngine();
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