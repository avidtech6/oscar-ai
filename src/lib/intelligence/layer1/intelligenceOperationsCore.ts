/**
 * Intelligence Operations Core - Layer 1 Core
 * 
 * Core intelligence operations extracted from apiCore.ts for Layer 1 Core purity.
 * Contains pure business logic for intelligence operations without presentation layer concerns.
 */

import type { PhaseFile, PhaseMetadata, IntelligenceEngine } from '../types.js';

/**
 * Core intelligence operations interface
 */
export interface IntelligenceOperationsCore {
	/** Initialize the intelligence engine */
	initialize(engine: IntelligenceEngine): Promise<void>;
	/** Get Phase File by number */
	getPhase(engine: IntelligenceEngine, phaseNumber: number): Promise<PhaseFile | undefined>;
	/** List all phases with metadata */
	listPhases(engine: IntelligenceEngine): Promise<PhaseMetadata[]>;
	/** Search across the blueprint */
	searchBlueprint(engine: IntelligenceEngine, query: string): Promise<PhaseFile[]>;
	/** Get all report types from Phase 1 */
	getReportTypes(engine: IntelligenceEngine): Promise<string[]>;
	/** Get workflow definitions from Phase Files */
	getWorkflowDefinitions(engine: IntelligenceEngine): Promise<string[]>;
	/** Get schema mappings from Phase 3 */
	getSchemaMappings(engine: IntelligenceEngine): Promise<string[]>;
	/** Summarize a phase */
	summarizePhase(engine: IntelligenceEngine, phaseNumber: number): Promise<string>;
	/** Generate a report using intelligence layer */
	generateReport(engine: IntelligenceEngine, reportType: string, input: Record<string, any>): Promise<string>;
	/** Explain a decision based on intelligence layer */
	explainDecision(engine: IntelligenceEngine, path: string): Promise<string>;
	/** Get intelligence engine status */
	getIntelligenceStatus(engine: IntelligenceEngine): Promise<{
		initialized: boolean;
		phaseCount: number;
		metadataCount: number;
		reportTypes: number;
		workflows: number;
		schemaMappings: number;
	}>;
}

/**
 * Default implementation of core intelligence operations
 */
export const defaultIntelligenceOperationsCore: IntelligenceOperationsCore = {
	async initialize(engine) {
		await engine.initialize();
	},

	async getPhase(engine, phaseNumber) {
		return engine.getPhaseFile(phaseNumber);
	},

	async listPhases(engine) {
		return engine.getAllMetadata();
	},

	async searchBlueprint(engine, query) {
		return engine.search(query);
	},

	async getReportTypes(engine) {
		return engine.getReportTypes();
	},

	async getWorkflowDefinitions(engine) {
		return engine.getWorkflowDefinitions();
	},

	async getSchemaMappings(engine) {
		return engine.getSchemaMappings();
	},

	async summarizePhase(engine, phaseNumber) {
		return engine.summarizePhase(phaseNumber);
	},

	async generateReport(engine, reportType, input) {
		return engine.generateReport(reportType, input);
	},

	async explainDecision(engine, path) {
		return engine.explainDecision(path);
	},

	async getIntelligenceStatus(engine) {
		return engine.getStatus();
	},
};

/**
 * Create a new instance of core intelligence operations
 */
export function createIntelligenceOperationsCore(
	operations: Partial<IntelligenceOperationsCore> = {}
): IntelligenceOperationsCore {
	return {
		...defaultIntelligenceOperationsCore,
		...operations,
	};
}

/**
 * Execute an intelligence operation with error handling
 */
export async function executeIntelligenceOperation<T>(
	operation: () => Promise<T>,
	operationName: string
): Promise<T> {
	try {
		return await operation();
	} catch (error) {
		throw new Error(`Intelligence operation '${operationName}' failed: ${error instanceof Error ? error.message : String(error)}`);
	}
}

/**
 * Batch execute multiple intelligence operations
 */
export async function batchExecuteIntelligenceOperations<T>(
	operations: Array<{
		name: string;
		operation: () => Promise<T>;
	}>
): Promise<Array<{ name: string; result: T; error?: Error }>> {
	const results = await Promise.allSettled(
		operations.map(async ({ name, operation }) => {
			try {
				const result = await executeIntelligenceOperation(operation, name);
				return { name, result };
			} catch (error) {
				return { name, result: null as any, error: error as Error };
			}
		})
	);

	return results.map((result, index) => {
		if (result.status === 'fulfilled') {
			return result.value;
		} else {
			return {
				name: operations[index].name,
				result: null as any,
				error: result.reason as Error,
			};
		}
	});
}