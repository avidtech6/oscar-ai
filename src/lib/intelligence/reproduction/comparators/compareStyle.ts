/**
 * Compare Style (Phase 10)
 * 
 * Compare stylistic elements between original and regenerated reports.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { StyleProfile } from '../../style-learner/StyleProfile';

export interface StyleComparison {
	score: number; // 0‑1
	warnings: string[];
}

/**
 * Compare style of two decompiled reports using a style profile
 */
export function compareStyle(
	original: DecompiledReport,
	regenerated: DecompiledReport,
	styleProfile: StyleProfile | null
): StyleComparison {
	const warnings: string[] = [];

	// If no style profile, assume perfect match
	if (!styleProfile) {
		return { score: 1.0, warnings };
	}

	// Compare tone (placeholder)
	const originalTone = detectTone(original);
	const regeneratedTone = detectTone(regenerated);
	if (originalTone !== regeneratedTone) {
		warnings.push(`Tone mismatch: original ${originalTone}, regenerated ${regeneratedTone}`);
	}

	// Compare sentence length (simplified)
	const originalAvgLength = computeAverageSentenceLength(original);
	const regeneratedAvgLength = computeAverageSentenceLength(regenerated);
	const lengthDiff = Math.abs(originalAvgLength - regeneratedAvgLength);
	if (lengthDiff > 10) {
		warnings.push(`Average sentence length differs by ${lengthDiff.toFixed(1)} characters`);
	}

	// Compare terminology preferences
	const originalTerms = original.terminology || [];
	const profileTerms = styleProfile.terminologyPreferences || [];
	const missingPreferredTerms = profileTerms.filter(term => !originalTerms.includes(term));
	if (missingPreferredTerms.length > 0) {
		warnings.push(`Missing preferred terminology: ${missingPreferredTerms.join(', ')}`);
	}

	// Compute style similarity score
	let score = 1.0;
	score -= warnings.length * 0.05;
	score = Math.max(0, Math.min(1, score));

	return { score, warnings };
}

function detectTone(report: DecompiledReport): string {
	// Very simplistic tone detection based on word choice
	const text = report.rawText.toLowerCase();
	if (text.includes('must') || text.includes('shall') || text.includes('required')) {
		return 'formal';
	}
	if (text.includes('please') || text.includes('recommend') || text.includes('suggest')) {
		return 'polite';
	}
	if (text.includes('urgent') || text.includes('immediately') || text.includes('critical')) {
		return 'urgent';
	}
	return 'neutral';
}

function computeAverageSentenceLength(report: DecompiledReport): number {
	const sentences = report.rawText.split(/[.!?]+/).filter(s => s.trim().length > 0);
	if (sentences.length === 0) return 0;
	const totalChars = sentences.reduce((sum, s) => sum + s.length, 0);
	return totalChars / sentences.length;
}