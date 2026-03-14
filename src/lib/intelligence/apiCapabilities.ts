/**
 * Intelligence API: Capabilities and summaries
 * 
 * Functions that aggregate data for UI display.
 */

import { getIntelligenceEngine } from './engine';

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
}

/**
 * Get architecture summaries for display
 */
export async function getArchitectureSummaries(): Promise<
	Array<{ phase: number; title: string; summary: string; keyPoints: string[] }>
> {
	const engine = await getIntelligenceEngine();
	const metadata = engine.getAllMetadata();
	
	return metadata.slice(0, 5).map(m => ({
		phase: m.phaseNumber,
		title: m.title,
		summary: m.summary,
		keyPoints: m.objectives.slice(0, 3)
	}));
}