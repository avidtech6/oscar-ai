/**
 * Metadata Analyzer
 * 
 * Detects metadata issues:
 * - Missing required metadata (author, date, version, client, project reference)
 * - Contradictory metadata
 * - Inconsistent formatting
 * - Out‑of‑date timestamps
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

export function analyzeMetadata(input: ReasoningInput): AnalyzerResult {
	const insights: ReasoningInsight[] = [];
	const questions: ClarifyingQuestion[] = [];

	const { decompiledReport } = input;
	const metadata = decompiledReport.metadata || {};

	// 1. Check for missing required metadata fields
	const requiredFields = ['author', 'date', 'version', 'client', 'projectReference'];
	const missingFields = requiredFields.filter(field => !metadata[field] || metadata[field].toString().trim() === '');
	if (missingFields.length > 0) {
		missingFields.forEach(field => {
			insights.push(createReasoningInsight(
				'missingInfo',
				`Required metadata field "${field}" is missing.`,
				field,
				[`Add a value for ${field}.`],
				'high'
			));
		});
	}

	// 2. Detect contradictory metadata (e.g., date before creation date)
	const now = new Date();
	if (metadata.date) {
		const reportDate = new Date(metadata.date);
		if (isNaN(reportDate.getTime())) {
			insights.push(createReasoningInsight(
				'warning',
				`Metadata date "${metadata.date}" is not a valid date.`,
				'date',
				['Use a valid ISO date format (YYYY‑MM‑DD).'],
				'medium'
			));
		} else if (reportDate > now) {
			insights.push(createReasoningInsight(
				'contradiction',
				`Report date ${metadata.date} is in the future.`,
				'date',
				['Correct the date to a past or present date.'],
				'medium'
			));
		}
	}

	// 3. Detect inconsistent formatting (e.g., version numbers)
	if (metadata.version) {
		const version = metadata.version.toString();
		const versionRegex = /^\d+(\.\d+)*$/;
		if (!versionRegex.test(version)) {
			insights.push(createReasoningInsight(
				'styleIssue',
				`Version "${version}" does not follow standard version format (e.g., 1.0.0).`,
				'version',
				['Use semantic versioning (major.minor.patch).'],
				'low'
			));
		}
	}

	// 4. Detect out‑of‑date timestamps (if report is older than a year)
	if (metadata.date) {
		const reportDate = new Date(metadata.date);
		const oneYearAgo = new Date();
		oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
		if (reportDate < oneYearAgo) {
			insights.push(createReasoningInsight(
				'warning',
				`Report date is older than one year (${metadata.date}).`,
				'date',
				['Consider updating the report to reflect current information.'],
				'medium'
			));
		}
	}

	// 5. Detect duplicate metadata values (e.g., same author and client)
	const values = Object.values(metadata).map(v => v.toString().toLowerCase());
	const duplicates = values.filter((v, i) => values.indexOf(v) !== i);
	if (duplicates.length > 0) {
		insights.push(createReasoningInsight(
			'warning',
			`Duplicate metadata values detected: ${duplicates.join(', ')}.`,
			'metadata',
			['Ensure each metadata field has a distinct value.'],
			'low'
		));
	}

	// 6. Generate clarifying questions for missing metadata
	if (missingFields.length > 0) {
		missingFields.forEach(field => {
			questions.push(createClarifyingQuestion(
				`What is the ${field} for this report?`,
				`The ${field} metadata field is missing.`,
				field,
				field === 'date' ? 'date' : 'text',
				undefined,
				0.9
			));
		});
	}

	return { insights, questions };
}