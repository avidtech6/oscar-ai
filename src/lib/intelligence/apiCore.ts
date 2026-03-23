/**
 * Core Intelligence API functions - Layer 2 Presentation
 *
 * Simple wrappers around engine methods.
 *
 * NOTE: Core implementation has been extracted to Layer 1 Core for purity.
 * This file now re-exports the Layer 1 implementation to maintain compatibility.
 */

import { intelligenceEngine, getIntelligenceEngine } from './engine';
import type { PhaseFile, PhaseMetadata } from './types';
import { createIntelligenceOperationsCore, type IntelligenceOperationsCore } from './layer1/intelligenceOperationsCore';

// Create core operations instance
const operationsCore: IntelligenceOperationsCore = createIntelligenceOperationsCore();

/**
 * Initialize the intelligence engine
 * Call this once at app startup
 */
export async function initializeIntelligence(): Promise<void> {
	await operationsCore.initialize(intelligenceEngine);
}

/**
 * Get Phase File by number
 */
export async function getPhase(phaseNumber: number): Promise<PhaseFile | undefined> {
	const engine = await getIntelligenceEngine();
	return operationsCore.getPhase(engine, phaseNumber);
}

/**
 * List all phases with metadata
 */
export async function listPhases(): Promise<PhaseMetadata[]> {
	const engine = await getIntelligenceEngine();
	return operationsCore.listPhases(engine);
}

/**
 * Search across the blueprint
 */
export async function searchBlueprint(query: string): Promise<PhaseFile[]> {
	const engine = await getIntelligenceEngine();
	return operationsCore.searchBlueprint(engine, query);
}

/**
 * Get all report types from Phase 1
 */
export async function getReportTypes(): Promise<string[]> {
	const engine = await getIntelligenceEngine();
	return operationsCore.getReportTypes(engine);
}

/**
 * Get workflow definitions from Phase Files
 */
export async function getWorkflowDefinitions(): Promise<string[]> {
	const engine = await getIntelligenceEngine();
	return operationsCore.getWorkflowDefinitions(engine);
}

/**
 * Get schema mappings from Phase 3
 */
export async function getSchemaMappings(): Promise<string[]> {
	const engine = await getIntelligenceEngine();
	return operationsCore.getSchemaMappings(engine);
}

/**
 * Summarize a phase
 */
export async function summarizePhase(phaseNumber: number): Promise<string> {
	const engine = await getIntelligenceEngine();
	return operationsCore.summarizePhase(engine, phaseNumber);
}

/**
 * Generate a report using intelligence layer
 */
export async function generateReport(reportType: string, input: Record<string, any>): Promise<string> {
	const engine = await getIntelligenceEngine();
	return operationsCore.generateReport(engine, reportType, input);
}

/**
 * Explain a decision based on intelligence layer
 */
export async function explainDecision(path: string): Promise<string> {
	const engine = await getIntelligenceEngine();
	return operationsCore.explainDecision(engine, path);
}

/**
 * Get intelligence engine status
 */
export async function getIntelligenceStatus(): Promise<{
	initialized: boolean;
	phaseCount: number;
	metadataCount: number;
	reportTypes: number;
	workflows: number;
	schemaMappings: number;
}> {
	const engine = await getIntelligenceEngine();
	return operationsCore.getIntelligenceStatus(engine);
}