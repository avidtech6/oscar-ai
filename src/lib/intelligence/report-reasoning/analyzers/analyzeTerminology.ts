/**
 * Terminology Analyzer
 * 
 * Detects terminology issues:
 * - Inconsistent use of domain‑specific terms
 * - Unknown terminology (not in known glossary)
 * - Abbreviations without definitions
 * - Synonym confusion
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

export function analyzeTerminology(input: ReasoningInput): AnalyzerResult {
	const insights: ReasoningInsight[] = [];
	const questions: ClarifyingQuestion[] = [];

	const { decompiledReport, mappingResult } = input;

	// 1. Check for unknown terminology (if mapping result provides unknownTerminology)
	if (mappingResult?.unknownTerminology && mappingResult.unknownTerminology.length > 0) {
		mappingResult.unknownTerminology.forEach(term => {
			insights.push(createReasoningInsight(
				'warning',
				`Unknown terminology "${term}" not found in the report type glossary.`,
				term,
				['Define the term or replace with a known equivalent.'],
				'medium'
			));
		});
	}

	// 2. Detect inconsistent terminology (same concept referred to by different words)
	const terminology = decompiledReport.terminology || [];
	const synonyms = new Map<string, string[]>([
		['tree', ['arbor', 'specimen', 'plant']],
		['survey', ['assessment', 'inspection', 'evaluation']],
		['risk', ['hazard', 'danger', 'threat']],
		['method', ['procedure', 'approach', 'technique']],
	]);
	const foundSynonyms: Record<string, string[]> = {};
	terminology.forEach(term => {
		for (const [key, syns] of synonyms) {
			if (syns.includes(term.toLowerCase()) || term.toLowerCase().includes(key)) {
				if (!foundSynonyms[key]) foundSynonyms[key] = [];
				foundSynonyms[key].push(term);
			}
		}
	});
	Object.entries(foundSynonyms).forEach(([concept, terms]) => {
		if (terms.length > 1) {
			insights.push(createReasoningInsight(
				'styleIssue',
				`Inconsistent terminology for "${concept}": ${terms.join(', ')}.`,
				'terminology',
				['Choose a single preferred term and use it consistently.'],
				'low'
			));
		}
	});

	// 3. Detect abbreviations without definitions
	const abbreviationRegex = /\b([A-Z]{2,})\b/g;
	const abbreviations = new Set<string>();
	decompiledReport.sections.forEach(section => {
		const matches = section.content.match(abbreviationRegex);
		if (matches) matches.forEach(abbr => abbreviations.add(abbr));
	});
	// Filter out common abbreviations that don't need definition
	const commonAbbreviations = ['ISO', 'UK', 'USA', 'EU', 'BS', 'ASTM', 'ANSI', 'ISA'];
	const undefinedAbbreviations = Array.from(abbreviations).filter(abbr => !commonAbbreviations.includes(abbr));
	if (undefinedAbbreviations.length > 0) {
		undefinedAbbreviations.forEach(abbr => {
			insights.push(createReasoningInsight(
				'missingInfo',
				`Abbreviation "${abbr}" used without definition.`,
				abbr,
				['Define the abbreviation on first use.'],
				'low'
			));
		});
	}

	// 4. Detect overused jargon (terms that appear too frequently)
	const termFrequency: Record<string, number> = {};
	decompiledReport.sections.forEach(section => {
		const words = section.content.toLowerCase().split(/\W+/);
		words.forEach(word => {
			if (word.length > 5) termFrequency[word] = (termFrequency[word] || 0) + 1;
		});
	});
	const overused = Object.entries(termFrequency).filter(([_, count]) => count > 10);
	overused.forEach(([term, count]) => {
		insights.push(createReasoningInsight(
			'improvement',
			`Term "${term}" appears ${count} times, consider using synonyms.`,
			term,
			['Vary terminology to improve readability.'],
			'low'
		));
	});

	// 5. Generate clarifying questions for unknown terminology
	if (mappingResult?.unknownTerminology && mappingResult.unknownTerminology.length > 0) {
		mappingResult.unknownTerminology.slice(0, 3).forEach(term => {
			questions.push(createClarifyingQuestion(
				`What does "${term}" mean in this context?`,
				`The term "${term}" is not recognized in the glossary.`,
				term,
				'text',
				undefined,
				0.7
			));
		});
	}

	return { insights, questions };
}