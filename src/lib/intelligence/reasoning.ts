/**
 * Lightweight Reasoning Engine for Oscar AI V2
 *
 * Provides simple reasoning capabilities over the intelligence layer:
 * - Query phase files by content, category, or phase number
 * - Find related workflows and report types
 * - Basic inference about architecture relationships
 * - Simple pattern matching for intelligence queries
 */

import { getArchitectureSummaries, getReportTypes, getWorkflowDefinitions, listPhases, searchBlueprint } from './api';
import type { PhaseFile, PhaseMetadata } from './types';

export interface ReasoningQuery {
	query: string;
	type?: 'phase' | 'workflow' | 'report' | 'general';
	limit?: number;
}

export interface ReasoningResult {
	query: string;
	results: any[];
	confidence: number;
	explanation: string;
	timestamp: Date;
}

export interface ReasoningContext {
	phaseMetadata: PhaseMetadata[];
	architectureSummaries: any[];
	reportTypes: string[];
	workflowDefinitions: string[];
}

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
 * Infer query type from natural language
 */
function inferQueryType(query: string): 'phase' | 'workflow' | 'report' | 'general' {
	const phaseKeywords = ['phase', 'file', 'architecture', 'intelligence', 'layer', 'blueprint'];
	const workflowKeywords = ['workflow', 'process', 'step', 'pipeline', 'procedure'];
	const reportKeywords = ['report', 'type', 'engine', 'template', 'schema', 'classification'];
	
	const queryWords = query.split(/\s+/);
	
	const phaseMatches = queryWords.filter(word => phaseKeywords.includes(word)).length;
	const workflowMatches = queryWords.filter(word => workflowKeywords.includes(word)).length;
	const reportMatches = queryWords.filter(word => reportKeywords.includes(word)).length;
	
	if (phaseMatches > workflowMatches && phaseMatches > reportMatches) return 'phase';
	if (workflowMatches > phaseMatches && workflowMatches > reportMatches) return 'workflow';
	if (reportMatches > phaseMatches && reportMatches > workflowMatches) return 'report';
	
	return 'general';
}

/**
 * Process queries about phase files
 */
function processPhaseQuery(query: string, context: ReasoningContext): { results: any[], confidence: number, explanation: string } {
	const results: any[] = [];
	
	// Search in architecture summaries
	for (const summary of context.architectureSummaries) {
		const matchScore = calculateMatchScore(query, [
			summary.title,
			summary.summary,
			`phase ${summary.phase}`,
			...summary.keyPoints
		]);
		
		if (matchScore > 0.3) {
			results.push({
				type: 'phase',
				phase: summary.phase,
				title: summary.title,
				summary: summary.summary,
				keyPoints: summary.keyPoints,
				matchScore
			});
		}
	}
	
	// Search in phase metadata
	for (const metadata of context.phaseMetadata) {
		const matchScore = calculateMatchScore(query, [
			metadata.title,
			metadata.summary,
			`phase ${metadata.phaseNumber}`,
			...metadata.objectives,
			...metadata.requirements
		]);
		
		if (matchScore > 0.3) {
			results.push({
				type: 'phase_metadata',
				phaseNumber: metadata.phaseNumber,
				title: metadata.title,
				summary: metadata.summary,
				category: metadata.category,
				objectives: metadata.objectives,
				matchScore
			});
		}
	}
	
	// Sort by match score
	results.sort((a, b) => b.matchScore - a.matchScore);
	
	const confidence = results.length > 0 ? Math.min(0.9, results[0].matchScore) : 0.1;
	const explanation = results.length > 0
		? `Found ${results.length} phase-related results matching your query.`
		: 'No phase files matched your query. Try different keywords.';
	
	return { results, confidence, explanation };
}

/**
 * Process queries about workflows
 */
function processWorkflowQuery(query: string, context: ReasoningContext): { results: any[], confidence: number, explanation: string } {
	const results: any[] = [];
	
	// Search in workflow definitions
	for (const workflow of context.workflowDefinitions) {
		const matchScore = calculateMatchScore(query, [workflow]);
		
		if (matchScore > 0.3) {
			results.push({
				type: 'workflow',
				name: workflow,
				matchScore
			});
		}
	}
	
	// If no direct matches, check for workflow-related terms
	if (results.length === 0) {
		const workflowTerms = ['process', 'step', 'pipeline', 'procedure', 'flow'];
		const hasWorkflowTerms = workflowTerms.some(term => query.includes(term));
		
		if (hasWorkflowTerms) {
			// Return all workflows
			results.push(...context.workflowDefinitions.map((workflow, index) => ({
				type: 'workflow',
				name: workflow,
				matchScore: 0.5 - (index * 0.1)
			})));
		}
	}
	
	const confidence = results.length > 0 ? 0.7 : 0.1;
	const explanation = results.length > 0
		? `Found ${results.length} workflows. Workflows define the step-by-step processes for report handling.`
		: 'No specific workflows matched your query. Try asking about "report processing" or "schema learning".';
	
	return { results, confidence, explanation };
}

/**
 * Process queries about report types
 */
function processReportQuery(query: string, context: ReasoningContext): { results: any[], confidence: number, explanation: string } {
	const results: any[] = [];
	
	// Search in report types
	for (const reportType of context.reportTypes) {
		const matchScore = calculateMatchScore(query, [reportType]);
		
		if (matchScore > 0.3) {
			results.push({
				type: 'report',
				name: reportType,
				matchScore
			});
		}
	}
	
	// If no direct matches, check for report-related terms
	if (results.length === 0) {
		const reportTerms = ['tree', 'survey', 'safety', 'impact', 'method', 'condition', 'mortgage'];
		const hasReportTerms = reportTerms.some(term => query.includes(term));
		
		if (hasReportTerms) {
			// Return all report types
			results.push(...context.reportTypes.map((reportType, index) => ({
				type: 'report',
				name: reportType,
				matchScore: 0.5 - (index * 0.1)
			})));
		}
	}
	
	const confidence = results.length > 0 ? 0.8 : 0.1;
	const explanation = results.length > 0
		? `Found ${results.length} report types. Report types define the structure and requirements for different report formats.`
		: 'No specific report types matched your query. Try asking about "tree survey" or "safety report".';
	
	return { results, confidence, explanation };
}

/**
 * Process general queries
 */
function processGeneralQuery(query: string, context: ReasoningContext): { results: any[], confidence: number, explanation: string } {
	// Try all query types and combine results
	const phaseResults = processPhaseQuery(query, context);
	const workflowResults = processWorkflowQuery(query, context);
	const reportResults = processReportQuery(query, context);
	
	const allResults = [
		...phaseResults.results,
		...workflowResults.results,
		...reportResults.results
	];
	
	// Sort by match score
	allResults.sort((a, b) => b.matchScore - a.matchScore);
	
	const confidence = Math.max(
		phaseResults.confidence,
		workflowResults.confidence,
		reportResults.confidence
	);
	
	const explanation = allResults.length > 0
		? `Found ${allResults.length} results across phases, workflows, and reports.`
		: 'No results found. Try being more specific about phases, workflows, or reports.';
	
	return { results: allResults, confidence, explanation };
}

/**
 * Calculate match score between query and text fields
 */
function calculateMatchScore(query: string, fields: string[]): number {
	if (!query || fields.length === 0) return 0;
	
	const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
	if (queryWords.length === 0) return 0;
	
	let totalScore = 0;
	
	for (const field of fields) {
		const fieldLower = field.toLowerCase();
		let fieldScore = 0;
		
		for (const word of queryWords) {
			if (fieldLower.includes(word)) {
				fieldScore += 0.3; // Base score for word match
				
				// Bonus for exact phrase match
				if (fieldLower.includes(query.toLowerCase())) {
					fieldScore += 0.4;
				}
				
				// Bonus for word at beginning
				if (fieldLower.startsWith(word)) {
					fieldScore += 0.2;
				}
			}
		}
		
		// Normalize by word count
		if (queryWords.length > 0) {
			fieldScore = Math.min(1, fieldScore / queryWords.length);
		}
		
		totalScore = Math.max(totalScore, fieldScore);
	}
	
	return Math.min(1, totalScore);
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