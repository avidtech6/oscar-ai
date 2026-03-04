/**
 * Compute Compliance Score (Phase 9)
 * 
 * Computes a confidence score based on validation results.
 */

import type { ComplianceResult } from '../ComplianceResult';

/**
 * Compute compliance score
 */
export function computeComplianceScore(result: ComplianceResult): number {
	let score = 1.0;

	// Deductions for missing required sections
	score -= result.missingRequiredSections.length * 0.2;

	// Deductions for missing required fields
	score -= result.missingRequiredFields.length * 0.1;

	// Deductions for failed compliance rules
	score -= result.failedComplianceRules.length * 0.15;

	// Deductions for structural issues
	for (const issue of result.structuralIssues) {
		switch (issue.severity) {
			case 'low': score -= 0.05; break;
			case 'medium': score -= 0.1; break;
			case 'high': score -= 0.2; break;
		}
	}

	// Deductions for terminology issues
	for (const issue of result.terminologyIssues) {
		switch (issue.severity) {
			case 'low': score -= 0.02; break;
			case 'medium': score -= 0.05; break;
			case 'high': score -= 0.1; break;
		}
	}

	// Deductions for contradictions
	for (const contradiction of result.contradictions) {
		switch (contradiction.severity) {
			case 'low': score -= 0.1; break;
			case 'medium': score -= 0.2; break;
			case 'high': score -= 0.3; break;
			case 'critical': score -= 0.5; break;
		}
	}

	// Ensure score is between 0 and 1
	return Math.max(0, Math.min(1, score));
}