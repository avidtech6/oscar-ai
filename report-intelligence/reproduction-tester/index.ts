/**
 * Phase 10: Report Reproduction Tester
 * Main Module Index
 * 
 * Exports all reproduction tester components and interfaces.
 */

// Core interfaces and types
export {
  TestCase,
  TestResult,
  TestExecution,
  ComparisonResult,
  Difference,
  ConsistencyMeasurement,
  ReproductionStatus,
  TestExecutionStatus,
  createTestResult,
  calculateOverallReproducibilityScore,
  determineReproductionStatus,
  generateTestResultId,
  generateTestExecutionId,
  generateTestCaseId,
  generateDifferenceId,
  generateComparisonResultId,
} from './TestResult';

// Main tester class
export { ReportReproductionTester } from './ReportReproductionTester';
export type { ReproductionTesterConfig } from './ReportReproductionTester';

// Test generation
export { TemplateBasedTestGenerator } from './test-generation/TemplateBasedTestGenerator';
export type { TestGenerationConfig } from './test-generation/TemplateBasedTestGenerator';

// Generation testing
export { ReportGenerationTester } from './ReportGenerationTester';

// Comparison engine
export { ResultComparisonEngine } from './comparison/ResultComparisonEngine';

// Consistency scoring
export { ConsistencyScoringService } from './scoring/ConsistencyScoringService';
export type { ScoringConfig, ConsistencyScoreBreakdown, StatisticalMetrics } from './scoring/ConsistencyScoringService';

// Storage system
export { TestStorageSystem } from './storage/TestStorageSystem';
export type { StorageConfig, StorageStatistics, QueryOptions } from './storage/TestStorageSystem';

// Event system
export { TestEventSystem, TestEventType } from './events/TestEventSystem';
export type {
  TestEvent,
  TestCaseEvent,
  TestExecutionEvent,
  ComparisonEvent,
  ScoringEvent,
  StorageEvent,
  SystemEvent,
  MultiRunEvent,
  EventHandler,
  EventSubscription,
} from './events/TestEventSystem';

// Integration service
export { ReproductionTesterIntegrationService } from './integration/ReproductionTesterIntegrationService';
export type { PhaseIntegrationPoints, IntegrationConfig } from './integration/ReproductionTesterIntegrationService';
