/**
 * Intelligence API: Reasoning trace - Layer 2 Presentation
 *
 * Get reasoning trace for a decision.
 *
 * NOTE: Core implementation has been extracted to Layer 1 Core for purity.
 * This file now re-exports the Layer 1 implementation to maintain compatibility.
 */

import { explainDecision } from './apiCore';
import { getIntelligenceEngine } from './engine';
import { createIntelligenceReasoningCore, type IntelligenceReasoningCore } from './layer1/intelligenceReasoningCore';

// Create core reasoning instance
const reasoningCore: IntelligenceReasoningCore = createIntelligenceReasoningCore();

/**
 * Get reasoning trace for a decision
 */
export async function getReasoningTrace(decisionPath: string): Promise<string[]> {
	const engine = await getIntelligenceEngine();
	return reasoningCore.getReasoningTrace(engine, explainDecision, decisionPath);
}