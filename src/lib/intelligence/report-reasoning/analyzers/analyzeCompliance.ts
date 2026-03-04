/**
 * Compliance Analyzer
 * 
 * Detects compliance issues:
 * - Missing compliance rules
 * - Failed compliance rules
 * - References to standards
 * - Regulatory requirements
 */

import type { ReasoningInput } from '../ReportAIReasoningEngine';
import type { ReasoningInsight } from '../ReasoningInsight';
import type { ClarifyingQuestion } from '../ClarifyingQuestion';
import { createReasoningInsight } from '../ReasoningInsight';
import { createClarifyingQuestion } from '../ClarifyingQuestion';

export interface AnalyzerResult {
	insights: ReasoningInsight[];
	questions: ClarifyingQuestion[];
}

export function analyzeCompliance(input: ReasoningInput): AnalyzerResult {
	const insights: ReasoningInsight[] = [];
	const questions: ClarifyingQuestion[] = [];

	const { decompiledReport, complianceResult } = input;

	// 1. Check for missing compliance markers (if decompiled report has them)
	const complianceMarkers = decompiledReport.complianceMarkers || [];
	if (complianceMarkers.length === 0) {
		insights.push(createReasoningInsight(
			'complianceIssue',
			'No compliance markers (references to standards, regulations) detected.',
			'compliance',
			['Add references to relevant standards (e.g., BS5837:2012, ISA guidelines).'],
			'medium'
		));
	}

	// 2. Detect missing required compliance rules (if compliance result available)
	if (complianceResult) {
		// Assuming complianceResult has a property `failedRules`
		// For now, placeholder
	} else {
		// If no compliance result, we can still check for known standard keywords
		const knownStandards = ['BS5837', 'ISA', 'ISO', 'ANSI', 'ASTM', 'EU', 'UK'];
		const content = decompiledReport.sections.map(s => s.content).join(' ').toLowerCase();
		const foundStandards = knownStandards.filter(std => content.includes(std.toLowerCase()));
		if (foundStandards.length === 0) {
			insights.push(createReasoningInsight(
				'complianceIssue',
				'No known industry standards referenced in the report.',
				'standards',
				['Include references to applicable standards (e.g., BS5837:2012 for tree surveys).'],
				'medium'
			));
		}
	}

	// 3. Detect contradictory compliance statements (e.g., "compliant with X" vs "not compliant")
	const sections = decompiledReport.sections;
	const compliantPhrases = ['compliant', 'meets', 'satisfies', 'conforms'];
	const nonCompliantPhrases = ['non‑compliant', 'does not meet', 'fails', 'violates'];
	let hasCompliant = false;
	let hasNonCompliant = false;
	sections.forEach(section => {
		const text = section.content.toLowerCase();
		if (compliantPhrases.some(p => text.includes(p))) hasCompliant = true;
		if (nonCompliantPhrases.some(p => text.includes(p))) hasNonCompliant = true;
	});
	if (hasCompliant && hasNonCompliant) {
		insights.push(createReasoningInsight(
			'contradiction',
			'Contradictory compliance statements found (both compliant and non‑compliant phrases).',
			'compliance',
			['Review and align compliance statements throughout the report.'],
			'high'
		));
	}

	// 4. Detect missing disclaimers or legal notes (common in professional reports)
	const disclaimerKeywords = ['disclaimer', 'liability', 'warranty', 'legal', 'copyright'];
	const hasDisclaimer = sections.some(s => disclaimerKeywords.some(kw => s.content.toLowerCase().includes(kw)));
	if (!hasDisclaimer) {
		insights.push(createReasoningInsight(
			'complianceIssue',
			'No disclaimer or legal note detected.',
			'disclaimer',
			['Consider adding a standard disclaimer to limit liability.'],
			'low'
		));
	}

	// 5. Generate clarifying questions about compliance
	if (complianceMarkers.length === 0) {
		questions.push(createClarifyingQuestion(
			'Which industry standards apply to this report?',
			'No compliance markers were detected.',
			'standards',
			'list',
			undefined,
			0.8
		));
	}

	return { insights, questions };
}