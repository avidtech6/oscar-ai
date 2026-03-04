/**
 * Compare Content (Phase 10)
 * 
 * Compare content and terminology between original and regenerated reports.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { MismatchedField, MismatchedTerminology } from '../ReproductionTestResult';

export interface ContentComparison {
	score: number; // 0‑1
	mismatchedFields: MismatchedField[];
	mismatchedTerminology: MismatchedTerminology[];
	warnings: string[];
}

/**
 * Compare content of two decompiled reports
 */
export function compareContent(
	original: DecompiledReport,
	regenerated: DecompiledReport
): ContentComparison {
	const mismatchedFields: MismatchedField[] = [];
	const mismatchedTerminology: MismatchedTerminology[] = [];
	const warnings: string[] = [];

	// Compare field values (simplified)
	const originalFields = extractFields(original);
	const regeneratedFields = extractFields(regenerated);

	for (const [fieldName, originalValue] of Object.entries(originalFields)) {
		const regeneratedValue = regeneratedFields[fieldName];
		if (regeneratedValue !== undefined && originalValue !== regeneratedValue) {
			mismatchedFields.push({
				fieldName,
				expected: String(originalValue),
				actual: String(regeneratedValue),
				severity: 'medium'
			});
		}
	}

	// Compare terminology
	const originalTerms = original.terminology || [];
	const regeneratedTerms = regenerated.terminology || [];

	for (const term of originalTerms) {
		if (!regeneratedTerms.includes(term)) {
			mismatchedTerminology.push({
				term,
				expected: term,
				actual: 'missing',
				severity: 'low'
			});
		}
	}
	for (const term of regeneratedTerms) {
		if (!originalTerms.includes(term)) {
			mismatchedTerminology.push({
				term,
				expected: 'missing',
				actual: term,
				severity: 'low'
			});
		}
	}

	// Compute content similarity score
	let score = 1.0;
	score -= mismatchedFields.length * 0.05;
	score -= mismatchedTerminology.length * 0.02;
	score = Math.max(0, Math.min(1, score));

	return {
		score,
		mismatchedFields,
		mismatchedTerminology,
		warnings
	};
}

function extractFields(report: DecompiledReport): Record<string, string> {
	const fields: Record<string, string> = {};
	// Extract metadata
	if (report.metadata) {
		Object.entries(report.metadata).forEach(([key, value]) => {
			fields[`metadata.${key}`] = String(value);
		});
	}
	// Extract section content (first 100 chars)
	report.sections.forEach((section, idx) => {
		if (section.content && section.content.length > 0) {
			fields[`section.${section.title}`] = section.content.substring(0, 100);
		}
	});
	return fields;
}