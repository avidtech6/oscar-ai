/**
 * Types for the Reasoning Engine
 */

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
	phaseMetadata: any[];
	architectureSummaries: any[];
	reportTypes: string[];
	workflowDefinitions: string[];
}

export interface QueryProcessorResult {
	results: any[];
	confidence: number;
	explanation: string;
}