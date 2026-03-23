/**
 * Intelligence API: Capabilities and summaries - Layer 2 Presentation
 *
 * Functions that aggregate data for UI display.
 *
 * NOTE: Core implementation has been extracted to Layer 1 Core for purity.
 * This file now re-exports the Layer 1 implementation to maintain compatibility.
 */

import { getIntelligenceEngine } from './engine';
import { createIntelligenceCapabilitiesCore, type IntelligenceCapabilitiesCore } from './layer1/intelligenceCapabilitiesCore';

// Create core capabilities instance
const capabilitiesCore: IntelligenceCapabilitiesCore = createIntelligenceCapabilitiesCore();

/**
 * Get intelligence capabilities for dashboard display
 */
export async function getIntelligenceCapabilities(): Promise<{
	reportTypes: string[];
	workflows: string[];
	schemaMappings: string[];
	phases: { number: number; title: string; category: string }[];
	stats: {
		totalPhases: number;
		executionPrompts: number;
		reportEngines: number;
		integrationPoints: number;
	};
}> {
	const engine = await getIntelligenceEngine();
	return capabilitiesCore.getIntelligenceCapabilities(engine);
}

/**
 * Get architecture summaries for display
 */
export async function getArchitectureSummaries(): Promise<
	Array<{ phase: number; title: string; summary: string; keyPoints: string[] }>
> {
	const engine = await getIntelligenceEngine();
	return capabilitiesCore.getArchitectureSummaries(engine);
}