/**
 * Clarifying Question Generator
 * 
 * Transforms unresolved insights into actionable clarifying questions.
 * Prioritizes questions that will resolve multiple issues.
 */

import type { ReasoningInsight } from '../ReasoningInsight';
import type { ReasoningInput } from '../ReportAIReasoningEngine';
import type { ClarifyingQuestion } from '../ClarifyingQuestion';
import { createClarifyingQuestion } from '../ClarifyingQuestion';

export function generateClarifyingQuestions(
	insights: ReasoningInsight[],
	input: ReasoningInput
): ClarifyingQuestion[] {
	const questions: ClarifyingQuestion[] = [];

	// 1. Convert missing‑info insights into questions
	const missingInfoInsights = insights.filter(i => i.type === 'missingInfo');
	missingInfoInsights.forEach(insight => {
		const question = createClarifyingQuestion(
			`What information should be provided for "${insight.target}"?`,
			insight.message,
			insight.target,
			'text',
			undefined,
			0.8
		);
		questions.push(question);
	});

	// 2. Convert ambiguity insights into choice questions
	const ambiguityInsights = insights.filter(i => i.type === 'ambiguity');
	ambiguityInsights.forEach(insight => {
		const question = createClarifyingQuestion(
			`How should we resolve the ambiguity regarding "${insight.target}"?`,
			insight.message,
			insight.target,
			'choice',
			['Clarify with definitive statement', 'Remove ambiguous language', 'Leave as is'],
			0.7
		);
		questions.push(question);
	});

	// 3. Convert contradiction insights into yes/no questions
	const contradictionInsights = insights.filter(i => i.type === 'contradiction');
	contradictionInsights.forEach(insight => {
		const question = createClarifyingQuestion(
			`Which of the contradictory statements about "${insight.target}" is correct?`,
			insight.message,
			insight.target,
			'choice',
			['First statement', 'Second statement', 'Both need revision'],
			0.9
		);
		questions.push(question);
	});

	// 4. Generate methodology questions if methodology section is missing
	const { decompiledReport } = input;
	const hasMethodology = decompiledReport.sections.some(s =>
		s.title.toLowerCase().includes('methodology') ||
		s.title.toLowerCase().includes('procedure')
	);
	if (!hasMethodology) {
		const question = createClarifyingQuestion(
			'What methodology was used for this report?',
			'No methodology section was found.',
			'methodology',
			'text',
			undefined,
			0.9
		);
		questions.push(question);
	}

	// 5. Deduplicate questions (same target)
	const uniqueQuestions: ClarifyingQuestion[] = [];
	const seenTargets = new Set<string>();
	questions.forEach(q => {
		if (!seenTargets.has(q.target)) {
			seenTargets.add(q.target);
			uniqueQuestions.push(q);
		}
	});

	// 6. Limit to top 10 questions to avoid overwhelming the user
	return uniqueQuestions.slice(0, 10);
}