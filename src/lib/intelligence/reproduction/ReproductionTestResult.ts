/**
 * Reproduction Test Result (Phase 10)
 * 
 * Result of a reproduction test.
 */

export interface ReproductionTestResult {
	id: string;
	reportTypeId: string;
	similarityScore: number; // 0‑1
	structuralMatchScore: number; // 0‑1
	contentMatchScore: number; // 0‑1
	styleMatchScore: number; // 0‑1
	missingSections: string[];
	extraSections: string[];
	mismatchedFields: MismatchedField[];
	mismatchedTerminology: MismatchedTerminology[];
	templateIssues: string[];
	schemaIssues: string[];
	warnings: string[];
	passed: boolean;
	createdAt: Date;
	completedAt: Date;
}

export interface MismatchedField {
	fieldName: string;
	expected: string;
	actual: string;
	severity: 'low' | 'medium' | 'high';
}

export interface MismatchedTerminology {
	term: string;
	expected: string;
	actual: string;
	severity: 'low' | 'medium' | 'high';
}

/**
 * Create a new reproduction test result
 */
export function createReproductionTestResult(
	reportTypeId: string,
	similarityScore: number,
	structuralMatchScore: number,
	contentMatchScore: number,
	styleMatchScore: number,
	missingSections: string[] = [],
	extraSections: string[] = [],
	mismatchedFields: MismatchedField[] = [],
	mismatchedTerminology: MismatchedTerminology[] = [],
	templateIssues: string[] = [],
	schemaIssues: string[] = [],
	warnings: string[] = [],
	passed: boolean = false
): ReproductionTestResult {
	const id = `reproduction_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
	const now = new Date();
	return {
		id,
		reportTypeId,
		similarityScore,
		structuralMatchScore,
		contentMatchScore,
		styleMatchScore,
		missingSections,
		extraSections,
		mismatchedFields,
		mismatchedTerminology,
		templateIssues,
		schemaIssues,
		warnings,
		passed,
		createdAt: now,
		completedAt: now
	};
}