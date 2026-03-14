/**
 * Helper functions for blueprint search results
 */

import type { BlueprintSearchResult } from '../../intelligence/types';

/** Calculate relevance score for a search result */
export function calculateRelevanceScore(result: BlueprintSearchResult, index: number): number {
	let score = 50; // Base score
	
	// Boost score based on match count
	score += Math.min(result.matches.length * 10, 30);
	
	// Boost score for matches in title or early in content
	const hasTitleMatch = result.matches.some(match => 
		match.toLowerCase().includes('phase') || match.toLowerCase().includes('objective')
	);
	if (hasTitleMatch) score += 20;
	
	// Reduce score for later results
	score -= Math.min(index * 2, 20);
	
	// Ensure score is between 0 and 100
	return Math.max(0, Math.min(100, score));
}

/** Extract tags from search result */
export function extractTags(result: BlueprintSearchResult): string[] {
	const tags: string[] = [];
	const filename = result.phaseFile.filename;
	
	// Extract phase number
	const phaseMatch = filename.match(/PHASE_(\d+)_/);
	if (phaseMatch) {
		tags.push(`phase-${phaseMatch[1]}`);
	}
	
	// Extract report type if mentioned
	if (filename.includes('REPORT')) {
		tags.push('report');
	}
	
	if (filename.includes('SCHEMA')) {
		tags.push('schema');
	}
	
	if (filename.includes('WORKFLOW')) {
		tags.push('workflow');
	}
	
	if (filename.includes('INTELLIGENCE')) {
		tags.push('intelligence');
	}
	
	if (filename.includes('INTEGRATION')) {
		tags.push('integration');
	}
	
	if (filename.includes('TEST')) {
		tags.push('testing');
	}
	
	// Add content-based tags
	const content = result.phaseFile.content.toLowerCase();
	if (content.includes('execution prompt') || content.includes('act-build')) {
		tags.push('execution-prompt');
	}
	
	if (content.includes('compliance')) {
		tags.push('compliance');
	}
	
	if (content.includes('validation')) {
		tags.push('validation');
	}
	
	return [...new Set(tags)]; // Remove duplicates
}

/** Extract phase number from filename */
export function extractPhaseNumber(filename: string): number {
	const match = filename.match(/PHASE_(\d+)_/);
	return match ? parseInt(match[1]) : 0;
}