/**
 * Run End‑to‑End Test (Phase 10)
 * 
 * Orchestrates a full reproduction test.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { ReproductionTestResult } from '../ReproductionTestResult';
import { ReportReproductionTester } from '../ReportReproductionTester';

/**
 * Run an end‑to‑end reproduction test
 */
export async function runEndToEndTest(
	decompiledReport: DecompiledReport
): Promise<ReproductionTestResult> {
	const tester = new ReportReproductionTester();
	return await tester.test(decompiledReport);
}