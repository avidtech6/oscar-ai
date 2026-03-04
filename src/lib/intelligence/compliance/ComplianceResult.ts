/**
 * Compliance Result (Phase 9)
 * 
 * Result of a compliance validation.
 */

export interface ComplianceResult {
	id: string;
	reportTypeId: string;
	passed: boolean;
	missingRequiredSections: string[];
	missingRequiredFields: string[];
	failedComplianceRules: FailedRule[];
	structuralIssues: StructuralIssue[];
	terminologyIssues: TerminologyIssue[];
	contradictions: Contradiction[];
	warnings: string[];
	confidenceScore: number; // 0‑1
	createdAt: Date;
}

export interface FailedRule {
	ruleId: string;
	ruleText: string;
	reason: string;
}

export interface StructuralIssue {
	sectionId: string;
	issue: string;
	severity: 'low' | 'medium' | 'high';
}

export interface TerminologyIssue {
	term: string;
	expected: string;
	found: string;
	severity: 'low' | 'medium' | 'high';
}

export interface Contradiction {
	type: 'section' | 'field' | 'methodology' | 'date' | 'calculation';
	description: string;
	evidence: string[];
	severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Create a new compliance result
 */
export function createComplianceResult(
	reportTypeId: string,
	passed: boolean,
	missingRequiredSections: string[] = [],
	missingRequiredFields: string[] = [],
	failedComplianceRules: FailedRule[] = [],
	structuralIssues: StructuralIssue[] = [],
	terminologyIssues: TerminologyIssue[] = [],
	contradictions: Contradiction[] = [],
	warnings: string[] = [],
	confidenceScore: number = 1.0
): ComplianceResult {
	const id = `compliance_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
	return {
		id,
		reportTypeId,
		passed,
		missingRequiredSections,
		missingRequiredFields,
		failedComplianceRules,
		structuralIssues,
		terminologyIssues,
		contradictions,
		warnings,
		confidenceScore,
		createdAt: new Date()
	};
}