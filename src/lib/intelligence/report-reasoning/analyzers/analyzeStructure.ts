/**
 * Structure Analyzer
 * 
 * Detects structural issues in a decompiled report:
 * - Missing required sections (based on report type)
 * - Extra sections not defined in schema
 * - Section ordering inconsistencies
 * - Depth inconsistencies
 * - Missing subsections
 */

import type { ReasoningInput } from '../ReportAIReasoningEngine';
import type { ReasoningInsight, InsightType, InsightSeverity } from '../ReasoningInsight';
import type { ClarifyingQuestion } from '../ClarifyingQuestion';
import { createReasoningInsight } from '../ReasoningInsight';
import { createClarifyingQuestion } from '../ClarifyingQuestion';

export interface AnalyzerResult {
	insights: ReasoningInsight[];
	questions: ClarifyingQuestion[];
}

export function analyzeStructure(input: ReasoningInput): AnalyzerResult {
	const insights: ReasoningInsight[] = [];
	const questions: ClarifyingQuestion[] = [];

	const { decompiledReport, mappingResult } = input;

	// 1. Check for missing required sections (if mapping result available)
	if (mappingResult?.missingRequiredSections && mappingResult.missingRequiredSections.length > 0) {
		mappingResult.missingRequiredSections.forEach(section => {
			insights.push(createReasoningInsight(
				'missingInfo',
				`Required section "${section}" is missing from the report.`,
				section,
				['Add the missing section with appropriate content.'],
				'high'
			));
		});
	}

	// 2. Check for extra sections (if mapping result available)
	if (mappingResult?.extraSections && mappingResult.extraSections.length > 0) {
		mappingResult.extraSections.forEach(section => {
			insights.push(createReasoningInsight(
				'warning',
				`Section "${section}" is not defined in the report type schema.`,
				section,
				['Consider removing the section or adding it to the report type definition.'],
				'medium'
			));
		});
	}

	// 3. Detect section ordering issues (simple heuristic: sections should follow a logical order)
	const sections = decompiledReport.sections;
	if (sections.length > 1) {
		// Example: check if "Conclusion" appears before "Introduction"
		const introIndex = sections.findIndex(s => s.title.toLowerCase().includes('introduction'));
		const conclusionIndex = sections.findIndex(s => s.title.toLowerCase().includes('conclusion'));
		if (introIndex !== -1 && conclusionIndex !== -1 && conclusionIndex < introIndex) {
			insights.push(createReasoningInsight(
				'improvement',
				'Section ordering issue: "Conclusion" appears before "Introduction".',
				'section-order',
				['Reorder sections to follow a logical flow (Introduction → Body → Conclusion).'],
				'medium'
			));
		}
	}

	// 4. Detect depth inconsistencies (e.g., a subsection deeper than its parent)
	function checkDepth(section: any, expectedLevel: number, path: string[]) {
		if (section.level !== expectedLevel) {
			insights.push(createReasoningInsight(
				'styleIssue',
				`Section "${section.title}" has unexpected heading level (expected ${expectedLevel}, got ${section.level}).`,
				path.join(' > '),
				['Adjust heading level to maintain consistent hierarchy.'],
				'low'
			));
		}
		const childLevel = section.level + 1;
		section.subsections.forEach((sub: any, idx: number) => {
			checkDepth(sub, childLevel, [...path, sub.title]);
		});
	}
	sections.forEach(section => checkDepth(section, 1, [section.title]));

	// 5. Generate clarifying questions if structural ambiguity exists
	if (mappingResult?.schemaGaps && mappingResult.schemaGaps.length > 0) {
		mappingResult.schemaGaps.forEach(gap => {
			questions.push(createClarifyingQuestion(
				`How should the "${gap}" be structured?`,
				`The schema does not define a structure for "${gap}".`,
				gap,
				'section',
				undefined,
				0.7
			));
		});
	}

	return { insights, questions };
}