/**
 * Intelligence Engine Core
 * 
 * Core engine class with initialization, basic getters, and search.
 */

import type { PhaseFile, PhaseMetadata, IntelligenceEngine } from './types';
import { loadPhaseFiles, parsePhaseMetadata } from './loader';
import { extractReportTypes, extractWorkflowDefinitions, extractSchemaMappings } from './engineDataExtractors';
import { generateReport as generateReportHelper, explainDecision as explainDecisionHelper } from './engineReport';

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
		return extractReportTypes(this.phaseFiles);
	}

	/**
	 * Get workflow definitions from Phase Files
	 */
	getWorkflowDefinitions(): string[] {
		this.ensureInitialized();
		return extractWorkflowDefinitions(this.phaseFiles);
	}

	/**
	 * Get schema mappings from Phase 3
	 */
	getSchemaMappings(): string[] {
		this.ensureInitialized();
		return extractSchemaMappings(this.phaseFiles);
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
		return generateReportHelper(this.phaseFiles, reportType, input);
	}

	/**
	 * Explain a decision based on intelligence layer
	 */
	explainDecision(path: string): string {
		this.ensureInitialized();
		return explainDecisionHelper(this.phaseFiles, path);
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