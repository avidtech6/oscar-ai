/**
 * Merge With Existing Types (Phase 11)
 * 
 * Detects similarity between a proposed report type definition and existing ones,
 * and decides whether to merge or create a new type.
 */

import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';

export interface MergeDecision {
	action: 'create' | 'merge' | 'update';
	targetId?: string; // existing report type ID to merge/update
	confidence: number; // 0–1
	reason: string;
}

/**
 * Compute similarity between two report type definitions.
 * 
 * Simple heuristic based on:
 * - Overlap in required sections
 * - Overlap in optional sections
 * - Overlap in compliance rules
 * - Name similarity (Levenshtein distance)
 */
function computeSimilarity(a: ReportTypeDefinition, b: ReportTypeDefinition): number {
	let score = 0;
	const maxScore = 4; // four dimensions

	// Required sections overlap
	const requiredOverlap = a.requiredSections.filter(s => b.requiredSections.includes(s)).length;
	const requiredUnion = new Set([...a.requiredSections, ...b.requiredSections]).size;
	const requiredScore = requiredUnion > 0 ? requiredOverlap / requiredUnion : 0;
	score += requiredScore;

	// Optional sections overlap
	const optionalOverlap = a.optionalSections.filter(s => b.optionalSections.includes(s)).length;
	const optionalUnion = new Set([...a.optionalSections, ...b.optionalSections]).size;
	const optionalScore = optionalUnion > 0 ? optionalOverlap / optionalUnion : 0;
	score += optionalScore;

	// Compliance rules overlap
	const complianceOverlap = a.complianceRules.filter(r => b.complianceRules.includes(r)).length;
	const complianceUnion = new Set([...a.complianceRules, ...b.complianceRules]).size;
	const complianceScore = complianceUnion > 0 ? complianceOverlap / complianceUnion : 0;
	score += complianceScore;

	// Name similarity (simple substring match)
	const nameA = a.name.toLowerCase();
	const nameB = b.name.toLowerCase();
	const nameScore = nameA.includes(nameB) || nameB.includes(nameA) ? 1 : 0;
	score += nameScore;

	return score / maxScore;
}

/**
 * Decide whether to merge a proposed definition with existing ones.
 * 
 * Returns a MergeDecision with recommended action.
 */
export function mergeWithExistingTypes(
	proposed: ReportTypeDefinition,
	existing: ReportTypeDefinition[]
): MergeDecision {
	if (existing.length === 0) {
		return {
			action: 'create',
			confidence: 1.0,
			reason: 'No existing report types; creating new.'
		};
	}

	// Find the most similar existing definition
	let bestSimilarity = 0;
	let bestMatch: ReportTypeDefinition | null = null;

	for (const def of existing) {
		const similarity = computeSimilarity(proposed, def);
		if (similarity > bestSimilarity) {
			bestSimilarity = similarity;
			bestMatch = def;
		}
	}

	// Thresholds
	const mergeThreshold = 0.7;
	const updateThreshold = 0.5;

	if (bestSimilarity >= mergeThreshold && bestMatch) {
		return {
			action: 'merge',
			targetId: bestMatch.id,
			confidence: bestSimilarity,
			reason: `High similarity (${(bestSimilarity * 100).toFixed(0)}%) with existing report type "${bestMatch.name}".`
		};
	} else if (bestSimilarity >= updateThreshold && bestMatch) {
		return {
			action: 'update',
			targetId: bestMatch.id,
			confidence: bestSimilarity,
			reason: `Moderate similarity (${(bestSimilarity * 100).toFixed(0)}%) with existing report type "${bestMatch.name}". Consider updating.`
		};
	} else {
		return {
			action: 'create',
			confidence: 1 - bestSimilarity,
			reason: `Low similarity (${(bestSimilarity * 100).toFixed(0)}%) with any existing report type; creating new.`
		};
	}
}