/**
 * Query processors for the Reasoning Engine
 */

import type { ReasoningContext, QueryProcessorResult } from './reasoningTypes';
import { calculateMatchScore } from './reasoningHelpers';

/**
 * Process queries about phase files
 */
export function processPhaseQuery(query: string, context: ReasoningContext): QueryProcessorResult {
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
export function processWorkflowQuery(query: string, context: ReasoningContext): QueryProcessorResult {
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
export function processReportQuery(query: string, context: ReasoningContext): QueryProcessorResult {
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
export function processGeneralQuery(query: string, context: ReasoningContext): QueryProcessorResult {
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