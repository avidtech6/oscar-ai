/**
 * Detect Contradictions (Phase 9)
 * 
 * Detects logical contradictions within the report.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { Contradiction } from '../ComplianceResult';

/**
 * Detect contradictions
 */
export function detectContradictions(decompiledReport: DecompiledReport): Contradiction[] {
	const contradictions: Contradiction[] = [];

	const text = decompiledReport.rawText.toLowerCase();

	// Example contradiction detection:
	// If report says "no trees present" but also mentions "tree schedule"
	if (text.includes('no trees present') && text.includes('tree schedule')) {
		contradictions.push({
			type: 'section',
			description: 'Report states "no trees present" but includes a tree schedule.',
			evidence: ['"no trees present"', '"tree schedule"'],
			severity: 'high'
		});
	}

	// If report says "tree removal required" but no removal section exists
	if (text.includes('tree removal required') && !text.includes('removal section')) {
		contradictions.push({
			type: 'section',
			description: 'Report states "tree removal required" but no removal section exists.',
			evidence: ['"tree removal required"'],
			severity: 'medium'
		});
	}

	// Methodology contradicts survey date (simplified)
	const surveyDate = decompiledReport.metadata.date;
	if (surveyDate && text.includes('methodology') && text.includes('survey date')) {
		// In a real implementation, we would parse dates and compare.
		// For now, we'll just note a potential contradiction.
		contradictions.push({
			type: 'date',
			description: 'Methodology may contradict survey date.',
			evidence: ['survey date', 'methodology'],
			severity: 'low'
		});
	}

	return contradictions;
}