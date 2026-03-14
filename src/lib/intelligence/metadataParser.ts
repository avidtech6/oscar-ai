/**
 * Phase File Metadata Parser
 * 
 * Functions for parsing metadata from Phase File content.
 */

import type { PhaseFile, PhaseMetadata } from './types';

/**
 * Parse metadata from Phase File content
 */
export function parsePhaseMetadata(phaseFile: PhaseFile): PhaseMetadata {
	const { filename, content } = phaseFile;
	
	// Extract phase number from filename
	const phaseNumber = extractPhaseNumber(filename);
	
	// Extract title from first line of content
	const title = extractTitle(content);
	
	// Extract summary from content
	const summary = extractSummary(content);
	
	// Extract objectives
	const objectives = extractSection(content, 'OBJECTIVE', 'CRITICAL REQUIREMENTS');
	
	// Extract requirements
	const requirements = extractSection(content, 'CRITICAL REQUIREMENTS', 'FILES AND FOLDERS');
	
	// Extract files
	const files = extractSection(content, 'FILES AND FOLDERS', 'IMPLEMENTATION DETAILS');
	
	// Extract completion criteria
	const completionCriteria = extractSection(content, 'COMPLETION CRITERIA', 'END OF PHASE');
	
	// Determine if this is an execution prompt
	const isExecutionPrompt = content.includes('EXECUTION PROMPT') || content.includes('ACT‑BUILD PROMPT');
	
	// Determine category based on phase number and content
	const category = determineCategory(phaseNumber, content);
	
	return {
		phaseNumber,
		title,
		summary,
		objectives,
		requirements,
		files,
		completionCriteria,
		isExecutionPrompt,
		category
	};
}

/**
 * Extract phase number from filename
 */
export function extractPhaseNumber(filename: string): number {
	// Try to extract number from patterns like PHASE_1_, PHASE_2_, etc.
	const match = filename.match(/PHASE_(\d+)_/);
	if (match) {
		return parseInt(match[1], 10);
	}
	
	// Try alternative patterns
	const altMatch = filename.match(/Phase(\d+)/);
	if (altMatch) {
		return parseInt(altMatch[1], 10);
	}
	
	// Default to 0 if no number found
	return 0;
}

/**
 * Extract title from content
 */
export function extractTitle(content: string): string {
	const lines = content.split('\n');
	for (const line of lines) {
		if (line.includes('PHASE') && line.includes('—')) {
			return line.trim();
		}
		if (line.includes('PHASE') && line.includes(':')) {
			return line.trim();
		}
	}
	
	// Fallback to first non-empty line
	for (const line of lines) {
		if (line.trim().length > 0) {
			return line.trim();
		}
	}
	
	return 'Unknown Phase';
}

/**
 * Extract summary from content
 */
export function extractSummary(content: string): string {
	const lines = content.split('\n');
	let inSummary = false;
	const summaryLines: string[] = [];
	
	for (const line of lines) {
		if (line.includes('OBJECTIVE') || line.includes('SUMMARY') || line.includes('Purpose:')) {
			inSummary = true;
			continue;
		}
		
		if (inSummary && (line.includes('===') || line.includes('---') || line.trim().length === 0)) {
			break;
		}
		
		if (inSummary && line.trim().length > 0) {
			summaryLines.push(line.trim());
		}
	}
	
	if (summaryLines.length > 0) {
		return summaryLines.join(' ').substring(0, 200) + '...';
	}
	
	// Fallback: first 3 non-empty lines
	const firstLines = lines.filter(line => line.trim().length > 0).slice(0, 3);
	return firstLines.join(' ').substring(0, 200) + '...';
}

/**
 * Extract section from content between start and end markers
 */
export function extractSection(content: string, startMarker: string, endMarker: string): string[] {
	const lines = content.split('\n');
	let inSection = false;
	const sectionLines: string[] = [];
	
	for (const line of lines) {
		if (line.includes(startMarker)) {
			inSection = true;
			continue;
		}
		
		if (line.includes(endMarker)) {
			break;
		}
		
		if (inSection && line.trim().length > 0 && !line.includes('===') && !line.includes('---')) {
			sectionLines.push(line.trim());
		}
	}
	
	return sectionLines;
}

/**
 * Determine category based on phase number and content
 */
export function determineCategory(phaseNumber: number, content: string): PhaseMetadata['category'] {
	// Map phase numbers to categories
	if (phaseNumber >= 1 && phaseNumber <= 11) return 'report';
	if (phaseNumber >= 12 && phaseNumber <= 14) return 'intelligence';
	if (phaseNumber >= 15 && phaseNumber <= 19) return 'integration';
	if (phaseNumber >= 20 && phaseNumber <= 22) return 'testing';
	if (phaseNumber >= 23 && phaseNumber <= 26) return 'workflow';
	
	// Fallback based on content keywords
	const lowerContent = content.toLowerCase();
	if (lowerContent.includes('report')) return 'report';
	if (lowerContent.includes('workflow')) return 'workflow';
	if (lowerContent.includes('schema')) return 'schema';
	if (lowerContent.includes('intelligence')) return 'intelligence';
	if (lowerContent.includes('integration')) return 'integration';
	if (lowerContent.includes('test')) return 'testing';
	
	return 'other';
}