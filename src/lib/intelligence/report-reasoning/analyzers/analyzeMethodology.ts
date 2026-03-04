/**
 * Methodology Analyzer
 * 
 * Detects methodology issues:
 * - Missing methodology description
 * - Incomplete steps
 * - Unclear calculations
 * - Missing references to standards
 * - Logical gaps in procedure
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

export function analyzeMethodology(input: ReasoningInput): AnalyzerResult {
	const insights: ReasoningInsight[] = [];
	const questions: ClarifyingQuestion[] = [];

	const { decompiledReport } = input;

	// 1. Identify methodology sections (by title)
	const methodologySections = decompiledReport.sections.filter(s =>
		s.title.toLowerCase().includes('methodology') ||
		s.title.toLowerCase().includes('procedure') ||
		s.title.toLowerCase().includes('approach') ||
		s.title.toLowerCase().includes('method')
	);

	if (methodologySections.length === 0) {
		insights.push(createReasoningInsight(
			'missingInfo',
			'No dedicated methodology section found.',
			'methodology',
			['Add a section describing the methodology used.'],
			'high'
		));
	} else {
		// 2. Check for completeness (presence of steps, calculations, references)
		methodologySections.forEach(section => {
			const content = section.content.toLowerCase();
			const hasSteps = content.includes('step') || content.includes('first') || content.includes('then') || /\d+\./.test(content);
			const hasCalculations = content.includes('calculate') || content.includes('formula') || content.includes('equation') || content.includes('result');
			const hasStandards = content.includes('bs5837') || content.includes('iso') || content.includes('standard') || content.includes('guideline');

			if (!hasSteps) {
				insights.push(createReasoningInsight(
					'missingInfo',
					`Methodology section "${section.title}" lacks clear step‑by‑step procedure.`,
					section.title,
					['Break down the methodology into numbered steps.'],
					'medium'
				));
			}
			if (!hasCalculations) {
				insights.push(createReasoningInsight(
					'warning',
					`Methodology section "${section.title}" does not describe calculations.`,
					section.title,
					['Include formulas, calculations, or measurement methods.'],
					'low'
				));
			}
			if (!hasStandards) {
				insights.push(createReasoningInsight(
					'complianceIssue',
					`Methodology section "${section.title}" does not reference any standards.`,
					section.title,
					['Reference applicable standards (e.g., BS5837:2012).'],
					'medium'
				));
			}
		});

		// 3. Detect logical gaps (e.g., missing prerequisites)
		const allContent = methodologySections.map(s => s.content).join(' ');
		const gapKeywords = ['assume', 'presume', 'unknown', 'not specified', 'to be determined'];
		gapKeywords.forEach(keyword => {
			if (allContent.toLowerCase().includes(keyword)) {
				insights.push(createReasoningInsight(
					'ambiguity',
					`Methodology contains uncertain language ("${keyword}").`,
					'methodology',
					['Replace assumptions with concrete information.'],
					'medium'
				));
			}
		});

		// 4. Detect contradictory methodology statements
		const contradictoryPairs = [
			{ a: 'measured', b: 'estimated' },
			{ a: 'on site', b: 'remote' },
			{ a: 'quantitative', b: 'qualitative' },
		];
		contradictoryPairs.forEach(pair => {
			if (allContent.includes(pair.a) && allContent.includes(pair.b)) {
				insights.push(createReasoningInsight(
					'contradiction',
					`Contradictory methodology: "${pair.a}" vs "${pair.b}".`,
					'methodology',
					['Clarify which approach was actually used.'],
					'high'
				));
			}
		});
	}

	// 5. Generate clarifying questions about methodology
	if (methodologySections.length === 0) {
		questions.push(createClarifyingQuestion(
			'What methodology was used for this report?',
			'No methodology section was found.',
			'methodology',
			'text',
			undefined,
			0.9
		));
	} else {
		methodologySections.forEach(section => {
			if (section.content.length < 100) {
				questions.push(createClarifyingQuestion(
					`Can you provide more detail about the methodology in "${section.title}"?`,
					'The methodology description is very brief.',
					section.title,
					'text',
					undefined,
					0.7
				));
			}
		});
	}

	return { insights, questions };
}