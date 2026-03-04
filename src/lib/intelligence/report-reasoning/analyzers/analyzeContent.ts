/**
 * Content Analyzer
 * 
 * Detects content‑level issues:
 * - Contradictions between sections
 * - Missing information (incomplete fields)
 * - Ambiguous statements
 * - Duplicate content
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

export function analyzeContent(input: ReasoningInput): AnalyzerResult {
	const insights: ReasoningInsight[] = [];
	const questions: ClarifyingQuestion[] = [];

	const { decompiledReport, mappingResult } = input;

	// 1. Detect contradictions between sections (simple keyword‑based)
	const sectionTexts = decompiledReport.sections.map(s => s.content.toLowerCase());
	const contradictions = findContradictions(sectionTexts);
	contradictions.forEach(({ sectionA, sectionB, keyword }) => {
		insights.push(createReasoningInsight(
			'contradiction',
			`Contradiction detected between sections regarding "${keyword}".`,
			`${sectionA} ↔ ${sectionB}`,
			['Review and align the conflicting statements.'],
			'high'
		));
	});

	// 2. Detect missing information (fields that are empty or placeholder)
	const emptySections = decompiledReport.sections.filter(s => !s.content.trim() || s.content.trim().length < 10);
	emptySections.forEach(section => {
		insights.push(createReasoningInsight(
			'missingInfo',
			`Section "${section.title}" appears to be empty or incomplete.`,
			section.title,
			['Add content to this section.'],
			'medium'
		));
	});

	// 3. Detect ambiguous statements (words like "maybe", "possibly", "could be")
	const ambiguousWords = ['maybe', 'possibly', 'could be', 'might', 'perhaps', 'unclear', 'ambiguous'];
	decompiledReport.sections.forEach(section => {
		const lowerContent = section.content.toLowerCase();
		ambiguousWords.forEach(word => {
			if (lowerContent.includes(word)) {
				insights.push(createReasoningInsight(
					'ambiguity',
					`Ambiguous language ("${word}") found in section "${section.title}".`,
					section.title,
					['Replace ambiguous language with definitive statements.'],
					'low'
				));
			}
		});
	});

	// 4. Detect duplicate content across sections (simple substring matching)
	const duplicates = findDuplicateContent(decompiledReport.sections);
	duplicates.forEach(({ sectionA, sectionB, snippet }) => {
		insights.push(createReasoningInsight(
			'improvement',
			`Duplicate content found between "${sectionA}" and "${sectionB}".`,
			`${sectionA} ↔ ${sectionB}`,
			['Consider merging or removing duplicate content.'],
			'medium'
		));
	});

	// 5. Generate clarifying questions for missing information
	if (mappingResult?.unmappedSections && mappingResult.unmappedSections.length > 0) {
		mappingResult.unmappedSections.forEach(section => {
			questions.push(createClarifyingQuestion(
				`What is the purpose of the "${section}" section?`,
				`The section "${section}" could not be mapped to any known schema.`,
				section,
				'text',
				undefined,
				0.6
			));
		});
	}

	return { insights, questions };
}

function findContradictions(sectionTexts: string[]): Array<{ sectionA: number; sectionB: number; keyword: string }> {
	const contradictions: Array<{ sectionA: number; sectionB: number; keyword: string }> = [];
	const contradictionPairs = [
		{ positive: 'yes', negative: 'no' },
		{ positive: 'present', negative: 'absent' },
		{ positive: 'good', negative: 'poor' },
		{ positive: 'high', negative: 'low' },
	];
	for (let i = 0; i < sectionTexts.length; i++) {
		for (let j = i + 1; j < sectionTexts.length; j++) {
			for (const pair of contradictionPairs) {
				if (sectionTexts[i].includes(pair.positive) && sectionTexts[j].includes(pair.negative)) {
					contradictions.push({ sectionA: i, sectionB: j, keyword: `${pair.positive}/${pair.negative}` });
				}
			}
		}
	}
	return contradictions;
}

function findDuplicateContent(sections: any[]): Array<{ sectionA: string; sectionB: string; snippet: string }> {
	const duplicates: Array<{ sectionA: string; sectionB: string; snippet: string }> = [];
	for (let i = 0; i < sections.length; i++) {
		for (let j = i + 1; j < sections.length; j++) {
			const contentA = sections[i].content.toLowerCase();
			const contentB = sections[j].content.toLowerCase();
			// Simple check: if one is substring of another (length > 20)
			if (contentA.length > 20 && contentB.length > 20) {
				if (contentA.includes(contentB) || contentB.includes(contentA)) {
					const snippet = contentA.substring(0, 30) + '...';
					duplicates.push({
						sectionA: sections[i].title,
						sectionB: sections[j].title,
						snippet,
					});
				}
			}
		}
	}
	return duplicates;
}