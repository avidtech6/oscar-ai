/**
 * Phase 10: Report Reproduction Tester
 * TestResult Interface
 * 
 * Defines the structure for reproduction test results.
 */

import type { DecompiledReport } from '../decompiler/DecompiledReport';
import type { SchemaMappingResult } from '../schema-mapper/SchemaMappingResult';
// Note: ReportTemplate import commented out as Phase 8 (Template Generator) may not be implemented yet
// import type { ReportTemplate } from '../template-generator/ReportTemplate';
import type { ComplianceResult } from '../compliance/ComplianceResult';

/**
 * Reproduction test status
 */
export type ReproductionStatus = 'passed' | 'failed' | 'partial' | 'inconsistent' | 'unknown';

/**
 * Test execution status
 */
export type TestExecutionStatus = 'pending' | 'running' | 'completed' | 'error' | 'timeout';

/**
 * Comparison result for a specific aspect
 */
export interface ComparisonResult {
  aspect: string; // e.g., 'structure', 'content', 'formatting', 'data'
  similarityScore: number; // 0-100
  passed: boolean;
  threshold: number; // Minimum score to pass
  differences: Difference[];
  evidence?: string; // Supporting evidence or explanation
}

/**
 * Difference between expected and actual
 */
export interface Difference {
  id: string;
  type: 'structural' | 'content' | 'formatting' | 'data' | 'ordering' | 'missing' | 'extra';
  location: string; // e.g., 'section.2.1', 'field.title'
  expected?: string;
  actual?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  impactOnReproducibility: string;
}

/**
 * Test case definition
 */
export interface TestCase {
  id: string;
  name: string;
  description: string;
  templateId: string;
  inputData: Record<string, any>;
  expectedOutputHash?: string; // Hash of expected output for comparison
  expectedOutputStructure?: Record<string, any>; // Expected structure
  generationParameters?: Record<string, any>;
  priority: 'critical' | 'high' | 'medium' | 'low';
  tags: string[];
}

/**
 * Test execution record
 */
export interface TestExecution {
  id: string;
  testCaseId: string;
  startedAt: Date;
  completedAt?: Date;
  status: TestExecutionStatus;
  durationMs?: number;
  generatedReportId?: string;
  error?: string;
  logs: string[];
}

/**
 * Consistency measurement across multiple runs
 */
export interface ConsistencyMeasurement {
  testCaseId: string;
  runs: number;
  successfulRuns: number;
  consistencyScore: number; // 0-100
  variance: number; // Statistical variance across runs
  mostCommonOutputHash?: string;
  hashDistribution: Record<string, number>; // Hash -> count
  timingStats: {
    averageMs: number;
    minMs: number;
    maxMs: number;
    stdDevMs: number;
  };
}

/**
 * The complete reproduction test result
 */
export interface TestResult {
  // Core identification
  id: string;
  testCaseId: string;
  testCaseName: string;
  
  // Input references
  templateId?: string;
  decompiledReportId?: string;
  schemaMappingResultId?: string;
  complianceResultId?: string;
  
  // Test execution
  execution: TestExecution;
  
  // Comparison results
  comparisonResults: ComparisonResult[];
  
  // Overall reproduction assessment
  reproducible: boolean;
  status: ReproductionStatus;
  confidenceScore: number; // 0-100
  
  // Scoring breakdown
  scores: {
    structuralSimilarityScore: number; // 0-100
    contentSimilarityScore: number; // 0-100
    formattingSimilarityScore: number; // 0-100
    dataConsistencyScore: number; // 0-100
    timingConsistencyScore: number; // 0-100
    overallReproducibilityScore: number; // 0-100 weighted average
  };
  
  // Differences found
  differences: Difference[];
  
  // Consistency across runs (if multiple runs performed)
  consistencyMeasurement?: ConsistencyMeasurement;
  
  // Test metadata
  testerVersion: string;
  testStrategy: 'single_run' | 'multiple_runs' | 'cross_validation';
  processingTimeMs: number;
  
  // Timestamps
  createdAt: Date;
  testedAt: Date;
  
  // References
  standardsApplied: string[]; // e.g., ['BS5837:2012', 'AIA', 'AMS']
  testScope: string; // e.g., 'full', 'structural', 'content_only'
  
  // Status tracking
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  nextTestDate?: Date;
}

/**
 * Helper function to create a new TestResult
 */
export function createTestResult(
  testCaseId: string,
  testCaseName: string
): Omit<TestResult, 'id' | 'createdAt' | 'testedAt'> {
  const now = new Date();
  
  return {
    testCaseId,
    testCaseName,
    templateId: undefined,
    decompiledReportId: undefined,
    schemaMappingResultId: undefined,
    complianceResultId: undefined,
    execution: {
      id: generateTestExecutionId(),
      testCaseId,
      startedAt: now,
      status: 'pending',
      logs: [],
    },
    comparisonResults: [],
    reproducible: false,
    status: 'unknown',
    confidenceScore: 0,
    scores: {
      structuralSimilarityScore: 0,
      contentSimilarityScore: 0,
      formattingSimilarityScore: 0,
      dataConsistencyScore: 0,
      timingConsistencyScore: 0,
      overallReproducibilityScore: 0,
    },
    differences: [],
    consistencyMeasurement: undefined,
    testerVersion: '1.0.0',
    testStrategy: 'single_run',
    processingTimeMs: 0,
    standardsApplied: [],
    testScope: 'full',
    reviewedBy: undefined,
    reviewedAt: undefined,
    reviewNotes: undefined,
    nextTestDate: undefined,
  };
}

/**
 * Calculate overall reproducibility score from component scores
 */
export function calculateOverallReproducibilityScore(scores: TestResult['scores']): number {
  // Weighted average with emphasis on structural and content similarity
  const weights = {
    structuralSimilarityScore: 0.30,  // Most important - structure must be reproducible
    contentSimilarityScore: 0.25,     // Important - content should match
    dataConsistencyScore: 0.20,       // Important - data should be consistent
    formattingSimilarityScore: 0.15,  // Moderate - formatting affects presentation
    timingConsistencyScore: 0.10,     // Less critical - timing variance is acceptable
  };
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  if (scores.structuralSimilarityScore !== undefined) {
    weightedSum += scores.structuralSimilarityScore * weights.structuralSimilarityScore;
    totalWeight += weights.structuralSimilarityScore;
  }
  
  if (scores.contentSimilarityScore !== undefined) {
    weightedSum += scores.contentSimilarityScore * weights.contentSimilarityScore;
    totalWeight += weights.contentSimilarityScore;
  }
  
  if (scores.dataConsistencyScore !== undefined) {
    weightedSum += scores.dataConsistencyScore * weights.dataConsistencyScore;
    totalWeight += weights.dataConsistencyScore;
  }
  
  if (scores.formattingSimilarityScore !== undefined) {
    weightedSum += scores.formattingSimilarityScore * weights.formattingSimilarityScore;
    totalWeight += weights.formattingSimilarityScore;
  }
  
  if (scores.timingConsistencyScore !== undefined) {
    weightedSum += scores.timingConsistencyScore * weights.timingConsistencyScore;
    totalWeight += weights.timingConsistencyScore;
  }
  
  // Normalize by total weight
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

/**
 * Determine if reproduction passed based on scores and differences
 */
export function determineReproductionStatus(
  result: TestResult
): ReproductionStatus {
  // Critical differences automatically fail
  const hasCriticalDifferences = 
    result.differences.some(d => d.severity === 'critical');
  
  if (hasCriticalDifferences) {
    return 'failed';
  }
  
  // Check scores
  if (result.scores.overallReproducibilityScore >= 95) {
    return 'passed';
  } else if (result.scores.overallReproducibilityScore >= 80) {
    return 'partial';
  } else if (result.scores.overallReproducibilityScore >= 60) {
    return 'inconsistent';
  } else {
    return 'failed';
  }
}

/**
 * Generate a unique ID for a test result
 */
export function generateTestResultId(): string {
  return `test_result_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a unique ID for a test execution
 */
export function generateTestExecutionId(): string {
  return `test_exec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a unique ID for a test case
 */
export function generateTestCaseId(): string {
  return `test_case_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a unique ID for a difference
 */
export function generateDifferenceId(): string {
  return `diff_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a unique ID for a comparison result
 */
export function generateComparisonResultId(): string {
  return `comp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}