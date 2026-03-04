/**
 * Integration Test Runner (Phase 20)
 *
 * Orchestrates all integration tests and reports results.
 */

import { runSyncEngineIntegrationTests } from './syncEngineTests';
import type { TestResult } from './syncEngineTests';

export interface IntegrationTestSuiteResult {
	suiteName: string;
	totalTests: number;
	passed: number;
	failed: number;
	durationMs: number;
	results: TestResult[];
}

export async function runAllIntegrationTests(): Promise<IntegrationTestSuiteResult[]> {
	const suites: Array<() => Promise<IntegrationTestSuiteResult>> = [
		async () => {
			const result = await runSyncEngineIntegrationTests();
			return {
				suiteName: 'Sync Engine',
				totalTests: result.totalTests,
				passed: result.passed,
				failed: result.failed,
				durationMs: result.durationMs,
				results: result.results,
			};
		},
		// Add more suites here as they are created
	];

	const results: IntegrationTestSuiteResult[] = [];
	for (const suite of suites) {
		try {
			const suiteResult = await suite();
			results.push(suiteResult);
		} catch (error) {
			results.push({
				suiteName: 'Unknown',
				totalTests: 0,
				passed: 0,
				failed: 1,
				durationMs: 0,
				results: [
					{
						id: `error_${Date.now()}`,
						subsystem: 'integration-runner',
						testName: 'Suite execution',
						passed: false,
						durationMs: 0,
						error: error instanceof Error ? error.message : String(error),
						timestamp: Date.now(),
					},
				],
			});
		}
	}
	return results;
}

export function printIntegrationReport(results: IntegrationTestSuiteResult[]): string {
	let output = '=== INTEGRATION TEST REPORT ===\n\n';
	let totalTests = 0;
	let totalPassed = 0;
	let totalFailed = 0;
	let totalDuration = 0;

	for (const suite of results) {
		totalTests += suite.totalTests;
		totalPassed += suite.passed;
		totalFailed += suite.failed;
		totalDuration += suite.durationMs;

		output += `Suite: ${suite.suiteName}\n`;
		output += `  Tests: ${suite.passed} passed, ${suite.failed} failed (total ${suite.totalTests})\n`;
		output += `  Duration: ${suite.durationMs} ms\n`;
		if (suite.failed > 0) {
			output += `  FAILURES:\n`;
			for (const r of suite.results.filter((r) => !r.passed)) {
				output += `    - ${r.testName}: ${r.error}\n`;
			}
		}
		output += '\n';
	}

	output += `=== SUMMARY ===\n`;
	output += `Total suites: ${results.length}\n`;
	output += `Total tests: ${totalTests}\n`;
	output += `Passed: ${totalPassed}\n`;
	output += `Failed: ${totalFailed}\n`;
	output += `Success rate: ${totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0}%\n`;
	output += `Total duration: ${totalDuration} ms\n`;

	return output;
}

// If this file is run directly (e.g., via node), execute tests and print report.
if (typeof window === 'undefined' && typeof process !== 'undefined') {
	(async () => {
		console.log('Running integration tests...');
		const results = await runAllIntegrationTests();
		console.log(printIntegrationReport(results));
		if (results.some((r) => r.failed > 0)) {
			process.exit(1);
		}
	})();
}