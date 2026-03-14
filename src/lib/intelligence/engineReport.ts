/**
 * Intelligence Engine: Report generation and explanation
 * 
 * Functions for generating reports and explaining decisions.
 */

import type { PhaseFile } from './types';
import { parsePhaseMetadata } from './loader';

/**
 * Generate a simple report based on report type
 */
export function generateReport(
	phaseFiles: PhaseFile[],
	reportType: string,
	input: Record<string, any>
): string {
	const reportTypes = extractReportTypes(phaseFiles);
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
export function explainDecision(
	phaseFiles: PhaseFile[],
	path: string
): string {
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
	const relevantPhases = searchPhaseFiles(phaseFiles, path).map(file => {
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

// Helper functions (re-exported from engine core)
function extractReportTypes(phaseFiles: PhaseFile[]): string[] {
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

	return Array.from(new Set(reportTypes));
}

function searchPhaseFiles(phaseFiles: PhaseFile[], query: string): PhaseFile[] {
	const lowerQuery = query.toLowerCase();
	return phaseFiles.filter(file => {
		const metadata = parsePhaseMetadata(file);
		return (
			metadata.title.toLowerCase().includes(lowerQuery) ||
			metadata.summary.toLowerCase().includes(lowerQuery) ||
			file.content.toLowerCase().includes(lowerQuery)
		);
	});
}