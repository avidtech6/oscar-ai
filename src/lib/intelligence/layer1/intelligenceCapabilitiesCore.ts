/**
 * Intelligence Capabilities Core - Layer 1 Pure Functions
 *
 * Pure intelligence capabilities functions extracted from apiCapabilities.ts
 * Contains only business logic, no presentation logic or UI concerns.
 */

import type { OscarIntelligenceEngine } from './intelligenceEngineCore';
import type { PhaseMetadata } from './intelligenceTypes';

/**
 * Core interface for intelligence capabilities operations
 */
export interface IntelligenceCapabilitiesCore {
	/**
	 * Get intelligence capabilities for display
	 */
	getIntelligenceCapabilities(engine: OscarIntelligenceEngine): Promise<{
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
	}>;

	/**
	 * Get architecture summaries for display
	 */
	getArchitectureSummaries(engine: OscarIntelligenceEngine): Promise<
		Array<{ phase: number; title: string; summary: string; keyPoints: string[] }>
	>;
}

/**
 * Default implementation of intelligence capabilities core
 */
export const defaultIntelligenceCapabilitiesCore: IntelligenceCapabilitiesCore = {
	async getIntelligenceCapabilities(engine) {
		const metadata = engine.getAllMetadata();
		const reportTypes = engine.getReportTypes();
		const workflows = engine.getWorkflowDefinitions();
		const schemaMappings = engine.getSchemaMappings();
		
		// Count execution prompts
		const executionPrompts = metadata.filter(m => m.isExecutionPrompt).length;
		
		// Count report engines (phases 1-11)
		const reportEngines = metadata.filter(m => m.phaseNumber >= 1 && m.phaseNumber <= 11).length;
		
		// Count integration points (phases 15-19)
		const integrationPoints = metadata.filter(m => m.phaseNumber >= 15 && m.phaseNumber <= 19).length;
		
		return {
			reportTypes,
			workflows,
			schemaMappings,
			phases: metadata.map(m => ({
				number: m.phaseNumber,
				title: m.title,
				category: m.category
			})),
			stats: {
				totalPhases: metadata.length,
				executionPrompts,
				reportEngines,
				integrationPoints
			}
		};
	},

	async getArchitectureSummaries(engine) {
		const metadata = engine.getAllMetadata();
		
		return metadata.slice(0, 5).map(m => ({
			phase: m.phaseNumber,
			title: m.title,
			summary: m.summary,
			keyPoints: m.objectives.slice(0, 3)
		}));
	}
};

/**
 * Factory function to create intelligence capabilities core
 */
export function createIntelligenceCapabilitiesCore(
	impl: IntelligenceCapabilitiesCore = defaultIntelligenceCapabilitiesCore
): IntelligenceCapabilitiesCore {
	return impl;
}

/**
 * Utility function to execute a capability operation
 */
async function executeCapabilityOperation<T>(
	engine: OscarIntelligenceEngine,
	operation: (engine: OscarIntelligenceEngine) => Promise<T>
): Promise<T> {
	return operation(engine);
}

/**
 * Utility function to batch execute capability operations
 */
export async function batchExecuteCapabilityOperations<T>(
	engine: OscarIntelligenceEngine,
	operations: Array<(engine: OscarIntelligenceEngine) => Promise<T>>
): Promise<T[]> {
	const results = await Promise.all(operations.map(op => executeCapabilityOperation(engine, op)));
	return results;
}