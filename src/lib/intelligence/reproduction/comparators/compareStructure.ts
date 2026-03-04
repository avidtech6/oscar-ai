/**
 * Compare Structure (Phase 10)
 * 
 * Compare structural elements between original and regenerated reports.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';

export interface StructuralComparison {
	score: number; // 0‑1
	missingSections: string[];
	extraSections: string[];
	templateIssues: string[];
	schemaIssues: string[];
	warnings: string[];
}

/**
 * Compare structure of two decompiled reports
 */
export function compareStructure(
	original: DecompiledReport,
	regenerated: DecompiledReport
): StructuralComparison {
	const missingSections: string[] = [];
	const extraSections: string[] = [];
	const templateIssues: string[] = [];
	const schemaIssues: string[] = [];
	const warnings: string[] = [];

	// Compare section titles
	const originalTitles = original.sections.map(s => s.title.toLowerCase());
	const regeneratedTitles = regenerated.sections.map(s => s.title.toLowerCase());

	for (const title of originalTitles) {
		if (!regeneratedTitles.includes(title)) {
			missingSections.push(title);
		}
	}
	for (const title of regeneratedTitles) {
		if (!originalTitles.includes(title)) {
			extraSections.push(title);
		}
	}

	// Compare section ordering (simplified)
	const orderingScore = computeOrderingSimilarity(original.sections, regenerated.sections);

	// Compare subsection depth
	const originalDepth = computeMaxDepth(original);
	const regeneratedDepth = computeMaxDepth(regenerated);
	const depthDiff = Math.abs(originalDepth - regeneratedDepth);
	if (depthDiff > 2) {
		warnings.push(`Significant depth difference: original ${originalDepth}, regenerated ${regeneratedDepth}`);
	}

	// Compute overall structural score
	let score = 1.0;
	score -= missingSections.length * 0.1;
	score -= extraSections.length * 0.05;
	score -= (1 - orderingScore) * 0.2;
	score = Math.max(0, Math.min(1, score));

	return {
		score,
		missingSections,
		extraSections,
		templateIssues,
		schemaIssues,
		warnings
	};
}

function computeOrderingSimilarity(originalSections: any[], regeneratedSections: any[]): number {
	if (originalSections.length === 0 || regeneratedSections.length === 0) return 0;
	const maxLen = Math.max(originalSections.length, regeneratedSections.length);
	let matches = 0;
	for (let i = 0; i < Math.min(originalSections.length, regeneratedSections.length); i++) {
		if (originalSections[i].title.toLowerCase() === regeneratedSections[i].title.toLowerCase()) {
			matches++;
		}
	}
	return matches / maxLen;
}

function computeMaxDepth(report: DecompiledReport): number {
	let maxDepth = 0;
	const traverse = (sections: any[], depth: number) => {
		maxDepth = Math.max(maxDepth, depth);
		for (const section of sections) {
			if (section.subsections && section.subsections.length > 0) {
				traverse(section.subsections, depth + 1);
			}
		}
	};
	traverse(report.sections, 1);
	return maxDepth;
}