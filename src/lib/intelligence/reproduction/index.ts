/**
 * Reproduction Module (Phase 10)
 * 
 * Validates whether the system can reproduce a report.
 */

export { ReportReproductionTester } from './ReportReproductionTester';
export { createReproductionTestResult, type ReproductionTestResult } from './ReproductionTestResult';

// Comparators
export { compareStructure } from './comparators/compareStructure';
export { compareContent } from './comparators/compareContent';
export { compareStyle } from './comparators/compareStyle';
export { computeSimilarityScore } from './comparators/computeSimilarityScore';

// Testers
export { runEndToEndTest } from './testers/runEndToEndTest';
export { generateRegeneratedReport } from './testers/generateRegeneratedReport';