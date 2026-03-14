/**
 * Intelligence Engine: Data extractors
 * 
 * Functions for extracting report types, workflows, and schema mappings from Phase Files.
 */

import type { PhaseFile } from './types';
import { parsePhaseMetadata } from './loader';

/**
 * Get report types from Phase 1
 */
export function extractReportTypes(phaseFiles: PhaseFile[]): string[] {
	const phase1 = phaseFiles.find(file => {
		const metadata = parsePhaseMetadata(file);
		return metadata.phaseNumber === 1;
	});
	if (!phase1) return [];

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

	return Array.from(new Set(reportTypes)); // Remove duplicates
}

/**
 * Get workflow definitions from Phase Files
 */
export function extractWorkflowDefinitions(phaseFiles: PhaseFile[]): string[] {
	const workflows: string[] = [];
	
	// Look for workflow definitions in relevant phases
	const workflowPhases = [13, 25]; // Phase 13: User Workflow Learning, Phase 25: Workflow Intelligence
	
	for (const phaseNumber of workflowPhases) {
		const phase = phaseFiles.find(file => {
			const metadata = parsePhaseMetadata(file);
			return metadata.phaseNumber === phaseNumber;
		});
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
export function extractSchemaMappings(phaseFiles: PhaseFile[]): string[] {
	const phase3 = phaseFiles.find(file => {
		const metadata = parsePhaseMetadata(file);
		return metadata.phaseNumber === 3;
	});
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