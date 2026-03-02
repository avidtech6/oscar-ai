/**
 * Intelligence Engine Entrypoint
 * 
 * This module loads all Phase Files as the authoritative architectural blueprint
 * for Oscar AI V2. It provides structured access to the intelligence layer,
 * metadata extraction, indexing, and lookup capabilities.
 * 
 * Architecture Rules:
 * 1. Phase Files are the single source of truth
 * 2. No logic from HAR may influence intelligence layer
 * 3. UI calls intelligence through clean public API
 * 4. Intelligence must be modular, typed, and future-proof
 */

import type { PhaseFile, PhaseMetadata, IntelligenceEngine } from './types';
import { loadPhaseFiles, parsePhaseMetadata } from './loader';

/**
 * Intelligence Engine Implementation
 * 
 * This is the main entrypoint for accessing the intelligence layer.
 * It loads all Phase Files, extracts metadata, and provides structured access.
 */
export class OscarIntelligenceEngine implements IntelligenceEngine {
	private phaseFiles: PhaseFile[] = [];
	private metadata: Map<number, PhaseMetadata> = new Map();
	private initialized = false;

	/**
	 * Initialize the intelligence engine
	 * Loads all Phase Files and extracts metadata
	 */
	async initialize(): Promise<void> {
		if (this.initialized) return;

		try {
			// Load all phase files
			this.phaseFiles = await loadPhaseFiles();
			
			// Parse metadata from each file
			for (const file of this.phaseFiles) {
				const metadata = parsePhaseMetadata(file);
				this.metadata.set(metadata.phaseNumber, metadata);
			}

			this.initialized = true;
			console.log(`Intelligence Engine initialized with ${this.phaseFiles.length} Phase Files`);
		} catch (error) {
			console.error('Failed to initialize Intelligence Engine:', error);
			throw error;
		}
	}

	/**
	 * Get all Phase Files
	 */
	getAllPhaseFiles(): PhaseFile[] {
		this.ensureInitialized();
		return [...this.phaseFiles];
	}

	/**
	 * Get Phase File by number
	 */
	getPhaseFile(phaseNumber: number): PhaseFile | undefined {
		this.ensureInitialized();
		return this.phaseFiles.find(file => {
			const metadata = parsePhaseMetadata(file);
			return metadata.phaseNumber === phaseNumber;
		});
	}

	/**
	 * Get Phase File by title
	 */
	getPhaseFileByTitle(title: string): PhaseFile | undefined {
		this.ensureInitialized();
		return this.phaseFiles.find(file => {
			const metadata = parsePhaseMetadata(file);
			return metadata.title.toLowerCase().includes(title.toLowerCase());
		});
	}

	/**
	 * Get all Phase Metadata
	 */
	getAllMetadata(): PhaseMetadata[] {
		this.ensureInitialized();
		return Array.from(this.metadata.values()).sort((a, b) => a.phaseNumber - b.phaseNumber);
	}

	/**
	 * Get metadata for a specific phase
	 */
	getMetadata(phaseNumber: number): PhaseMetadata | undefined {
		this.ensureInitialized();
		return this.metadata.get(phaseNumber);
	}

	/**
	 * Search across all Phase Files
	 */
	search(query: string): PhaseFile[] {
		this.ensureInitialized();
		const lowerQuery = query.toLowerCase();
		return this.phaseFiles.filter(file => {
			const metadata = parsePhaseMetadata(file);
			return (
				metadata.title.toLowerCase().includes(lowerQuery) ||
				metadata.summary.toLowerCase().includes(lowerQuery) ||
				file.content.toLowerCase().includes(lowerQuery)
			);
		});
	}

	/**
	 * Get report types from Phase 1
	 */
	getReportTypes(): string[] {
		this.ensureInitialized();
		const phase1 = this.getPhaseFile(1);
		if (!phase1) return [];

		// Extract report types from Phase 1 content
		const reportTypes: string[] = [];
		const lines = phase1.content.split('\n');
		
		for (const line of lines) {
			if (line.includes('BS5837:2012 Tree Survey')) reportTypes.push('BS5837:2012 Tree Survey');
			if (line.includes('Arboricultural Impact Assessment')) reportTypes.push('Arboricultural Impact Assessment (AIA)');
			if (line.includes('Arboricultural Method Statement')) reportTypes.push('Arboricultural Method Statement (AMS)');
			if (line.includes('Tree Condition Report')) reportTypes.push('Tree Condition Report');
			if (line.includes('Tree Safety / Hazard Report')) reportTypes.push('Tree Safety / Hazard Report');
			if (line.includes('Mortgage / Insurance Report')) reportTypes.push('Mortgage / Insurance Report');
			if (line.includes('Custom / User‑Defined Report')) reportTypes.push('Custom / User‑Defined Report');
		}

		return [...new Set(reportTypes)]; // Remove duplicates
	}

	/**
	 * Get workflow definitions from Phase Files
	 */
	getWorkflowDefinitions(): string[] {
		this.ensureInitialized();
		const workflows: string[] = [];
		
		// Look for workflow definitions in relevant phases
		const workflowPhases = [13, 25]; // Phase 13: User Workflow Learning, Phase 25: Workflow Intelligence
		
		for (const phaseNumber of workflowPhases) {
			const phase = this.getPhaseFile(phaseNumber);
			if (phase) {
				// Extract workflow names from content
				const lines = phase.content.split('\n');
				for (const line of lines) {
					if (line.includes('workflow') && line.includes('definition')) {
						workflows.push(`Phase ${phaseNumber}: ${line.trim()}`);
					}
				}
			}
		}

		return workflows.length > 0 ? workflows : ['Default Report Workflow', 'Schema Learning Workflow', 'Compliance Validation Workflow'];
	}

	/**
	 * Get schema mappings from Phase 3
	 */
	getSchemaMappings(): string[] {
		this.ensureInitialized();
		const phase3 = this.getPhaseFile(3);
		if (!phase3) return [];

		const mappings: string[] = [];
		const lines = phase3.content.split('\n');
		
		for (const line of lines) {
			if (line.includes('schema') && line.includes('mapping')) {
				mappings.push(line.trim());
			}
		}

		return mappings.length > 0 ? mappings : ['Report → Schema Mapping', 'Section → Field Mapping', 'Validation → Rule Mapping'];
	}

	/**
	 * Summarize a phase
	 */
	summarizePhase(phaseNumber: number): string {
		this.ensureInitialized();
		const metadata = this.getMetadata(phaseNumber);
		const phase = this.getPhaseFile(phaseNumber);
		
		if (!metadata || !phase) {
			return `Phase ${phaseNumber} not found`;
		}

		return `${metadata.title}\n\n${metadata.summary}\n\nContent length: ${phase.content.length} characters`;
	}

	/**
	 * Generate a simple report based on report type
	 */
	generateReport(reportType: string, input: Record<string, any>): string {
		this.ensureInitialized();
		
		const reportTypes = this.getReportTypes();
		if (!reportTypes.includes(reportType)) {
			return `Error: Report type "${reportType}" not found. Available types: ${reportTypes.join(', ')}`;
		}

		// Simple report generation based on Phase 1 definitions
		const timestamp = new Date().toISOString();
		return `
# ${reportType}
Generated: ${timestamp}

## Summary
This report was generated using the Oscar AI V2 Intelligence Engine.

## Input Data
${Object.entries(input).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Intelligence Layer Reference
Report type validated against Phase 1: Report Type Registry
Schema mappings from Phase 3: Report Schema Mapper
Compliance rules from Phase 9: Report Compliance Validator

## Notes
This is a demonstration of intelligence layer integration.
In production, this would use the full report engines defined in Phase Files.
		`.trim();
	}

	/**
	 * Explain a decision based on intelligence layer
	 */
	explainDecision(path: string): string {
		this.ensureInitialized();
		
		// Map common decision paths to phase explanations
		const decisionMap: Record<string, string> = {
			'report-type-selection': 'Phase 1 defines report types and their requirements',
			'schema-mapping': 'Phase 3 handles schema mapping and transformation',
			'compliance-validation': 'Phase 9 validates reports against compliance rules',
			'workflow-selection': 'Phase 13 and 25 define user workflows and intelligence',
			'classification': 'Phase 6 classifies reports based on content and structure',
			'template-generation': 'Phase 8 generates templates based on report types'
		};

		const explanation = decisionMap[path] || 'Decision path not explicitly mapped in intelligence layer';
		const relevantPhases = this.search(path).map(file => {
			const metadata = parsePhaseMetadata(file);
			return `Phase ${metadata.phaseNumber}: ${metadata.title}`;
		});

		return `
Decision Path: ${path}

Primary Explanation: ${explanation}

Relevant Intelligence Phases:
${relevantPhases.length > 0 ? relevantPhases.join('\n') : 'No specific phases found for this decision path'}

Intelligence Layer Guidance:
All decisions should reference the authoritative Phase Files as the single source of truth.
		`.trim();
	}

	/**
	 * Ensure engine is initialized
	 */
	private ensureInitialized(): void {
		if (!this.initialized) {
			throw new Error('Intelligence Engine not initialized. Call initialize() first.');
		}
	}

	/**
	 * Get engine status
	 */
	getStatus() {
		return {
			initialized: this.initialized,
			phaseCount: this.phaseFiles.length,
			metadataCount: this.metadata.size,
			reportTypes: this.getReportTypes().length,
			workflows: this.getWorkflowDefinitions().length,
			schemaMappings: this.getSchemaMappings().length
		};
	}
}

/**
 * Singleton instance of the intelligence engine
 */
export const intelligenceEngine = new OscarIntelligenceEngine();

/**
 * Helper function to initialize and get the engine
 */
export async function getIntelligenceEngine(): Promise<OscarIntelligenceEngine> {
	await intelligenceEngine.initialize();
	return intelligenceEngine;
}

/**
 * Export the engine as default
 */
export default intelligenceEngine;