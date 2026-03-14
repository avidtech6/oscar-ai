/**
 * Core Intelligence API functions
 * 
 * Simple wrappers around engine methods.
 */

import { intelligenceEngine, getIntelligenceEngine } from './engine';
import type { PhaseFile, PhaseMetadata } from './types';

/**
 * Initialize the intelligence engine
 * Call this once at app startup
 */
export async function initializeIntelligence(): Promise<void> {
	await intelligenceEngine.initialize();
}

/**
 * Get Phase File by number
 */
export async function getPhase(phaseNumber: number): Promise<PhaseFile | undefined> {
	const engine = await getIntelligenceEngine();
	return engine.getPhaseFile(phaseNumber);
}

/**
 * List all phases with metadata
 */
export async function listPhases(): Promise<PhaseMetadata[]> {
	const engine = await getIntelligenceEngine();
	return engine.getAllMetadata();
}

/**
 * Search across the blueprint
 */
export async function searchBlueprint(query: string): Promise<PhaseFile[]> {
	const engine = await getIntelligenceEngine();
	return engine.search(query);
}

/**
 * Get all report types from Phase 1
 */
export async function getReportTypes(): Promise<string[]> {
	const engine = await getIntelligenceEngine();
	return engine.getReportTypes();
}

/**
 * Get workflow definitions from Phase Files
 */
export async function getWorkflowDefinitions(): Promise<string[]> {
	const engine = await getIntelligenceEngine();
	return engine.getWorkflowDefinitions();
}

/**
 * Get schema mappings from Phase 3
 */
export async function getSchemaMappings(): Promise<string[]> {
	const engine = await getIntelligenceEngine();
	return engine.getSchemaMappings();
}

/**
 * Summarize a phase
 */
export async function summarizePhase(phaseNumber: number): Promise<string> {
	const engine = await getIntelligenceEngine();
	return engine.summarizePhase(phaseNumber);
}

/**
 * Generate a report using intelligence layer
 */
export async function generateReport(reportType: string, input: Record<string, any>): Promise<string> {
	const engine = await getIntelligenceEngine();
	return engine.generateReport(reportType, input);
}

/**
 * Explain a decision based on intelligence layer
 */
export async function explainDecision(path: string): Promise<string> {
	const engine = await getIntelligenceEngine();
	return engine.explainDecision(path);
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
	return engine.getStatus();
}