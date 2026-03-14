/**
 * Storage for Reasoning Results
 * 
 * Persists reasoning outputs to workspace/reasoning‑results.json.
 * Each entry includes insights, questions, actions, and timestamps.
 */


import fs from 'fs/promises';
import path from 'path';
import type { ReasoningOutput } from './ReportAIReasoningEngine';

const STORAGE_PATH = './reasoning-results.json';

export interface StoredReasoningResult {
	id: string;
	reportId: string;
	output: ReasoningOutput;
	timestamps: {
		stored: Date;
	};
}

/**
 * Load all stored reasoning results.
 */
export async function loadReasoningResults(): Promise<StoredReasoningResult[]> {
	try {
		const data = await fs.readFile(STORAGE_PATH, 'utf-8');
		const parsed = JSON.parse(data);
		// Convert date strings back to Date objects
		return parsed.map((item: any) => ({
			...item,
			output: {
				...item.output,
				timestamps: {
					started: new Date(item.output.timestamps.started),
					completed: new Date(item.output.timestamps.completed),
				},
				insights: item.output.insights.map((insight: any) => ({
					...insight,
					timestamps: {
						created: new Date(insight.timestamps.created),
						updated: insight.timestamps.updated ? new Date(insight.timestamps.updated) : undefined,
					},
				})),
				questions: item.output.questions.map((question: any) => ({
					...question,
					timestamps: {
						created: new Date(question.timestamps.created),
						answered: question.timestamps.answered ? new Date(question.timestamps.answered) : undefined,
					},
				})),
			},
			timestamps: {
				stored: new Date(item.timestamps.stored),
			},
		}));
	} catch (error) {
		// File doesn't exist or is invalid; return empty array
		return [];
	}
}

/**
 * Save a new reasoning result.
 */
export async function saveReasoningResult(
	reportId: string,
	output: ReasoningOutput
): Promise<StoredReasoningResult> {
	const results = await loadReasoningResults();
	const storedResult: StoredReasoningResult = {
		id: `reasoning_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
		reportId,
		output,
		timestamps: {
			stored: new Date(),
		},
	};
	results.push(storedResult);
	await fs.mkdir(path.dirname(STORAGE_PATH), { recursive: true });
	await fs.writeFile(STORAGE_PATH, JSON.stringify(results, null, 2), 'utf-8');
	return storedResult;
}

/**
 * Get reasoning results for a specific report.
 */
export async function getReasoningResultsForReport(reportId: string): Promise<StoredReasoningResult[]> {
	const results = await loadReasoningResults();
	return results.filter(r => r.reportId === reportId);
}

/**
 * Delete reasoning results older than a given date.
 */
export async function deleteOldReasoningResults(olderThan: Date): Promise<number> {
	const results = await loadReasoningResults();
	const kept = results.filter(r => new Date(r.timestamps.stored) >= olderThan);
	const deletedCount = results.length - kept.length;
	if (deletedCount > 0) {
		await fs.writeFile(STORAGE_PATH, JSON.stringify(kept, null, 2), 'utf-8');
	}
	return deletedCount;
}