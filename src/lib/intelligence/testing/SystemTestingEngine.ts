/**
 * SystemTestingEngine – orchestrates comprehensive testing across all subsystems.
 *
 * Responsibilities:
 * - Run unit, integration, and end‑to‑end tests
 * - Collect and report test results
 * - Provide debugging insights
 * - No side effects, deterministic execution
 *
 * FreshVibe Rules:
 * - Single responsibility (test orchestration only)
 * - Max 300 lines per file
 * - No external dependencies beyond test modules
 */

export interface TestResult {
	id: string;
	subsystem: string;
	testName: string;
	passed: boolean;
	durationMs: number;
	error?: string;
	timestamp: number;
}

export interface SubsystemReport {
	subsystem: string;
	totalTests: number;
	passed: number;
	failed: number;
	durationMs: number;
	results: TestResult[];
}

export interface SystemTestReport {
	overallPassed: boolean;
	totalSubsystems: number;
	totalTests: number;
	totalPassed: number;
	totalFailed: number;
	totalDurationMs: number;
	subsystemReports: SubsystemReport[];
	generatedAt: number;
}

/**
 * SystemTestingEngine – central test runner.
 */
export class SystemTestingEngine {
	private subsystems: Map<string, () => Promise<SubsystemReport>> = new Map();

	/**
	 * Register a subsystem test suite.
	 */
	registerSubsystem(name: string, testSuite: () => Promise<SubsystemReport>): void {
		this.subsystems.set(name, testSuite);
	}

	/**
	 * Run all registered subsystem tests.
	 */
	async runAllTests(): Promise<SystemTestReport> {
		const startTime = Date.now();
		const subsystemReports: SubsystemReport[] = [];
		let totalTests = 0;
		let totalPassed = 0;
		let totalFailed = 0;

		for (const [name, testSuite] of this.subsystems) {
			try {
				const report = await testSuite();
				subsystemReports.push(report);
				totalTests += report.totalTests;
				totalPassed += report.passed;
				totalFailed += report.failed;
			} catch (error) {
				// If the test suite itself throws, treat as a failed subsystem
				const errorReport: SubsystemReport = {
					subsystem: name,
					totalTests: 0,
					passed: 0,
					failed: 1,
					durationMs: 0,
					results: [
						{
							id: `error_${Date.now()}`,
							subsystem: name,
							testName: 'testSuiteExecution',
							passed: false,
							durationMs: 0,
							error: error instanceof Error ? error.message : String(error),
							timestamp: Date.now(),
						},
					],
				};
				subsystemReports.push(errorReport);
				totalTests += 1;
				totalFailed += 1;
			}
		}

		const totalDurationMs = Date.now() - startTime;

		return {
			overallPassed: totalFailed === 0,
			totalSubsystems: this.subsystems.size,
			totalTests,
			totalPassed,
			totalFailed,
			totalDurationMs,
			subsystemReports,
			generatedAt: Date.now(),
		};
	}

	/**
	 * Run tests for a specific subsystem.
	 */
	async runSubsystemTests(name: string): Promise<SubsystemReport> {
		const testSuite = this.subsystems.get(name);
		if (!testSuite) {
			throw new Error(`Subsystem ${name} not registered`);
		}
		return await testSuite();
	}

	/**
	 * Generate a human‑readable summary of a test report.
	 */
	static formatReport(report: SystemTestReport): string {
		const lines: string[] = [];
		lines.push(`System Test Report – ${new Date(report.generatedAt).toISOString()}`);
		lines.push(`Overall: ${report.overallPassed ? 'PASS' : 'FAIL'}`);
		lines.push(`Subsystems: ${report.totalSubsystems}`);
		lines.push(`Tests: ${report.totalTests} (${report.totalPassed} passed, ${report.totalFailed} failed)`);
		lines.push(`Duration: ${report.totalDurationMs}ms`);
		lines.push('');

		for (const sub of report.subsystemReports) {
			const status = sub.failed === 0 ? '✓' : '✗';
			lines.push(`${status} ${sub.subsystem}: ${sub.passed}/${sub.totalTests} passed (${sub.durationMs}ms)`);
			if (sub.failed > 0) {
				for (const result of sub.results.filter((r) => !r.passed)) {
					lines.push(`  ‣ ${result.testName}: ${result.error}`);
				}
			}
		}

		return lines.join('\n');
	}
}