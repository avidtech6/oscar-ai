/**
 * Lightweight Reasoning Engine for Oscar AI V2
 *
 * Provides simple reasoning capabilities over the intelligence layer:
 * - Query phase files by content, category, or phase number
 * - Find related workflows and report types
 * - Basic inference about architecture relationships
 * - Simple pattern matching for intelligence queries
 */

import { getArchitectureSummaries, getReportTypes, getWorkflowDefinitions, listPhases } from './api';
import type { PhaseMetadata } from './types';
import type { ReasoningQuery, ReasoningResult, ReasoningContext } from './reasoningTypes';
import { inferQueryType } from './reasoningHelpers';
import { processPhaseQuery, processWorkflowQuery, processReportQuery, processGeneralQuery } from './reasoningProcessors';

// Re‑export all types and functions from split modules
export type { ReasoningQuery, ReasoningResult, ReasoningContext, QueryProcessorResult } from './reasoningTypes';
export { inferQueryType, calculateMatchScore } from './reasoningHelpers';
export { processPhaseQuery, processWorkflowQuery, processReportQuery, processGeneralQuery } from './reasoningProcessors';

/**
 * Initialize the reasoning engine with current intelligence data
 */
export async function initializeReasoningEngine(): Promise<ReasoningContext> {
	try {
		const [phaseMetadata, architectureSummaries, reportTypes, workflowDefinitions] = await Promise.all([
			listPhases(),
			getArchitectureSummaries(),
			getReportTypes(),
			getWorkflowDefinitions()
		]);

		return {
			phaseMetadata,
			architectureSummaries,
			reportTypes,
			workflowDefinitions
		};
	} catch (error) {
		console.error('Failed to initialize reasoning engine:', error);
		throw new Error(`Reasoning engine initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

/**
 * Process a natural language query against the intelligence layer
 */
export async function processReasoningQuery(query: string | ReasoningQuery): Promise<ReasoningResult> {
	const context = await initializeReasoningEngine();
	const queryObj = typeof query === 'string' ? { query, type: 'general' as const } : query;
	
	const normalizedQuery = queryObj.query.toLowerCase().trim();
	
	// Determine query type if not specified
	let queryType = queryObj.type;
	if (!queryType) {
		queryType = inferQueryType(normalizedQuery);
	}
	
	// Process based on query type
	let results: any[] = [];
	let confidence = 0;
	let explanation = '';
	
	switch (queryType) {
		case 'phase':
			({ results, confidence, explanation } = processPhaseQuery(normalizedQuery, context));
			break;
		case 'workflow':
			({ results, confidence, explanation } = processWorkflowQuery(normalizedQuery, context));
			break;
		case 'report':
			({ results, confidence, explanation } = processReportQuery(normalizedQuery, context));
			break;
		case 'general':
		default:
			({ results, confidence, explanation } = processGeneralQuery(normalizedQuery, context));
			break;
	}
	
	// Apply limit
	if (queryObj.limit && results.length > queryObj.limit) {
		results = results.slice(0, queryObj.limit);
	}
	
	return {
		query: queryObj.query,
		results,
		confidence,
		explanation,
		timestamp: new Date()
	};
}

/**
 * Get reasoning statistics about the intelligence layer
 */
export async function getReasoningStats() {
	const context = await initializeReasoningEngine();
	
	return {
		totalPhases: context.phaseMetadata.length,
		totalArchitectureSummaries: context.architectureSummaries.length,
		totalReportTypes: context.reportTypes.length,
		totalWorkflows: context.workflowDefinitions.length,
		lastUpdated: new Date(),
		coverage: {
			phases: Math.min(100, (context.architectureSummaries.length / 27) * 100), // 27 total phases
			reports: Math.min(100, (context.reportTypes.length / 10) * 100), // Up to 10 report types
			workflows: Math.min(100, (context.workflowDefinitions.length / 5) * 100) // Up to 5 workflows
		}
	};
}

/**
 * Simple question answering about the intelligence layer
 */
export async function answerQuestion(question: string): Promise<{ answer: string; confidence: number; sources: any[] }> {
	const result = await processReasoningQuery(question);
	
	if (result.results.length === 0) {
		return {
			answer: "I don't have enough information to answer that question. Try asking about phase files, workflows, or report types.",
			confidence: 0.1,
			sources: []
		};
	}
	
	const topResult = result.results[0];
	let answer = '';
	
	switch (topResult.type) {
		case 'phase':
		case 'phase_file':
			answer = `Phase ${topResult.phase || topResult.id}: ${topResult.title || topResult.name}. ${topResult.summary || topResult.description}`;
			break;
		case 'workflow':
			answer = `Workflow: ${topResult.name}. This defines a step-by-step process for handling reports in the system.`;
			break;
		case 'report':
			answer = `Report Type: ${topResult.name}. This is a supported report format in Oscar AI V2.`;
			break;
		default:
			answer = `Found: ${JSON.stringify(topResult, null, 2)}`;
	}
	
	return {
		answer,
		confidence: result.confidence,
		sources: result.results.slice(0, 3)
	};
}