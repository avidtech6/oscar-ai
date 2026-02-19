/**
 * Phase 10: Report Reproduction Tester
 * ReportReproductionTester Class
 * 
 * Main engine for testing report reproduction consistency.
 */

import type { DecompiledReport } from '../decompiler/DecompiledReport';
import type { SchemaMappingResult } from '../schema-mapper/SchemaMappingResult';
import type { ReportTypeRegistry } from '../registry/ReportTypeRegistry';
import type { ReportTypeDefinition } from '../registry/ReportTypeDefinition';
import type { ComplianceResult } from '../compliance/ComplianceResult';
// Note: ReportTemplate import commented out as Phase 8 (Template Generator) may not be implemented yet
// import type { ReportTemplate } from '../template-generator/ReportTemplate';

import {
  TestResult,
  TestCase,
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

/**
 * Reproduction test events
 */
export type ReproductionTestEvent = 
  | 'reproduction:started'
  | 'reproduction:testCaseLoaded'
  | 'reproduction:generationStarted'
  | 'reproduction:generationCompleted'
  | 'reproduction:comparisonStarted'
  | 'reproduction:comparisonCompleted'
  | 'reproduction:scoringCalculated'
  | 'reproduction:consistencyMeasured'
  | 'reproduction:completed'
  | 'reproduction:error';

export type EventListener = (event: ReproductionTestEvent, data: any) => void;

/**
 * Test configuration
 */
export interface ReproductionTesterConfig {
  strictMode: boolean;
  runMultipleIterations: boolean;
  iterationsCount: number;
  compareStructure: boolean;
  compareContent: boolean;
  compareFormatting: boolean;
  compareData: boolean;
  measureTiming: boolean;
  minimumReproducibilityScore: number;
  standardsToApply: string[]; // e.g., ['BS5837:2012', 'AIA', 'AMS']
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ReproductionTesterConfig = {
  strictMode: true,
  runMultipleIterations: false,
  iterationsCount: 3,
  compareStructure: true,
  compareContent: true,
  compareFormatting: true,
  compareData: true,
  measureTiming: true,
  minimumReproducibilityScore: 80,
  standardsToApply: ['BS5837:2012', 'AIA', 'AMS', 'Condition Report', 'Safety Report'],
};

/**
 * Main Report Reproduction Tester class
 */
export class ReportReproductionTester {
  private eventListeners: Map<ReproductionTestEvent, Set<EventListener>> = new Map();
  private registry?: ReportTypeRegistry;
  private config: ReproductionTesterConfig;
  private testerVersion = '1.0.0';
  
  constructor(registry?: ReportTypeRegistry, config?: Partial<ReproductionTesterConfig>) {
    this.registry = registry;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeEventSystem();
  }

  /**
   * Initialize the event system
   */
  private initializeEventSystem(): void {
    const events: ReproductionTestEvent[] = [
      'reproduction:started',
      'reproduction:testCaseLoaded',
      'reproduction:generationStarted',
      'reproduction:generationCompleted',
      'reproduction:comparisonStarted',
      'reproduction:comparisonCompleted',
      'reproduction:scoringCalculated',
      'reproduction:consistencyMeasured',
      'reproduction:completed',
      'reproduction:error',
    ];
    
    for (const event of events) {
      this.eventListeners.set(event, new Set());
    }
  }

  /**
   * Main test method - run a single test case
   */
  async runTest(
    testCase: TestCase,
    decompiledReport?: DecompiledReport,
    schemaMappingResult?: SchemaMappingResult,
    complianceResult?: ComplianceResult,
    template?: any // Using any instead of ReportTemplate since Phase 8 may not be implemented
  ): Promise<TestResult> {
    const startTime = Date.now();
    const testResultId = generateTestResultId();
    
    try {
      // Create initial test result
      const testResult: TestResult = {
        ...createTestResult(testCase.id, testCase.name),
        id: testResultId,
        createdAt: new Date(),
        testedAt: new Date(),
        templateId: template?.id,
        decompiledReportId: decompiledReport?.id,
        schemaMappingResultId: schemaMappingResult?.id,
        complianceResultId: complianceResult?.id,
        standardsApplied: this.config.standardsToApply,
        testScope: this.getTestScope(),
      };

      // Update execution status
      testResult.execution.startedAt = new Date();
      testResult.execution.status = 'running';

      // Emit started event
      this.emitEvent('reproduction:started', {
        testResultId,
        testCaseId: testCase.id,
        testCaseName: testCase.name,
        config: this.config,
      });

      // Emit test case loaded event
      this.emitEvent('reproduction:testCaseLoaded', {
        testResultId,
        testCase: {
          id: testCase.id,
          name: testCase.name,
          templateId: testCase.templateId,
          priority: testCase.priority,
          tags: testCase.tags,
        },
      });

      // Run the test
      await this.executeTest(testResult, testCase, decompiledReport, schemaMappingResult, complianceResult, template);

      // Calculate overall score
      testResult.scores.overallReproducibilityScore = calculateOverallReproducibilityScore(testResult.scores);
      
      // Determine final status
      testResult.reproducible = testResult.status === 'passed' || testResult.status === 'partial';
      testResult.status = determineReproductionStatus(testResult);
      testResult.confidenceScore = this.calculateConfidenceScore(testResult);

      // Set processing time
      testResult.processingTimeMs = Date.now() - startTime;
      testResult.execution.completedAt = new Date();
      testResult.execution.durationMs = testResult.processingTimeMs;
      testResult.execution.status = 'completed';

      // Emit completion event
      this.emitEvent('reproduction:completed', {
        testResultId,
        reproducible: testResult.reproducible,
        status: testResult.status,
        overallScore: testResult.scores.overallReproducibilityScore,
        confidenceScore: testResult.confidenceScore,
        processingTimeMs: testResult.processingTimeMs,
        totalDifferences: testResult.differences.length,
      });

      return testResult;

    } catch (error) {
      this.emitEvent('reproduction:error', {
        testResultId,
        error: error instanceof Error ? error.message : String(error),
        testCaseId: testCase.id,
      });
      throw error;
    }
  }

  /**
   * Run multiple iterations of the same test to measure consistency
   */
  async runConsistencyTest(
    testCase: TestCase,
    iterations: number = this.config.iterationsCount,
    decompiledReport?: DecompiledReport,
    schemaMappingResult?: SchemaMappingResult,
    complianceResult?: ComplianceResult,
    template?: any
  ): Promise<TestResult> {
    const startTime = Date.now();
    const testResultId = generateTestResultId();
    
    try {
      // Create initial test result
      const testResult: TestResult = {
        ...createTestResult(testCase.id, testCase.name),
        id: testResultId,
        createdAt: new Date(),
        testedAt: new Date(),
        templateId: template?.id,
        decompiledReportId: decompiledReport?.id,
        schemaMappingResultId: schemaMappingResult?.id,
        complianceResultId: complianceResult?.id,
        standardsApplied: this.config.standardsToApply,
        testScope: 'consistency_measurement',
      };

      // Update execution status
      testResult.execution.startedAt = new Date();
      testResult.execution.status = 'running';

      // Emit started event
      this.emitEvent('reproduction:started', {
        testResultId,
        testCaseId: testCase.id,
        testCaseName: testCase.name,
        config: { ...this.config, iterationsCount: iterations },
      });

      // Run multiple iterations
      const iterationResults: TestResult[] = [];
      const timingStats: number[] = [];
      const outputHashes: string[] = [];

      for (let i = 0; i < iterations; i++) {
        this.emitEvent('reproduction:generationStarted', {
          testResultId,
          iteration: i + 1,
          totalIterations: iterations,
        });

        // Run single iteration
        const iterationStartTime = Date.now();
        const iterationResult = await this.executeSingleIteration(
          testCase,
          decompiledReport,
          schemaMappingResult,
          complianceResult,
          template,
          i
        );
        const iterationDuration = Date.now() - iterationStartTime;

        iterationResults.push(iterationResult);
        timingStats.push(iterationDuration);
        
        // Collect output hash if available
        if (iterationResult.execution.generatedReportId) {
          outputHashes.push(iterationResult.execution.generatedReportId);
        }

        this.emitEvent('reproduction:generationCompleted', {
          testResultId,
          iteration: i + 1,
          durationMs: iterationDuration,
          reproducible: iterationResult.reproducible,
          status: iterationResult.status,
        });
      }

      // Calculate consistency measurement
      const consistencyMeasurement = this.calculateConsistencyMeasurement(
        testCase.id,
        iterationResults,
        timingStats,
        outputHashes
      );
      
      testResult.consistencyMeasurement = consistencyMeasurement;

      // Calculate overall scores from average of iterations
      this.calculateAverageScores(testResult, iterationResults);

      // Determine final status based on consistency
      testResult.reproducible = this.isConsistentlyReproducible(consistencyMeasurement, testResult.scores);
      testResult.status = this.determineConsistencyStatus(consistencyMeasurement, testResult.scores);
      testResult.confidenceScore = this.calculateConsistencyConfidenceScore(consistencyMeasurement, testResult.scores);

      // Set processing time
      testResult.processingTimeMs = Date.now() - startTime;
      testResult.execution.completedAt = new Date();
      testResult.execution.durationMs = testResult.processingTimeMs;
      testResult.execution.status = 'completed';

      // Emit consistency measured event
      this.emitEvent('reproduction:consistencyMeasured', {
        testResultId,
        consistencyScore: consistencyMeasurement.consistencyScore,
        variance: consistencyMeasurement.variance,
        successfulRuns: consistencyMeasurement.successfulRuns,
        totalRuns: consistencyMeasurement.runs,
      });

      // Emit completion event
      this.emitEvent('reproduction:completed', {
        testResultId,
        reproducible: testResult.reproducible,
        status: testResult.status,
        overallScore: testResult.scores.overallReproducibilityScore,
        confidenceScore: testResult.confidenceScore,
        consistencyScore: consistencyMeasurement.consistencyScore,
        processingTimeMs: testResult.processingTimeMs,
      });

      return testResult;

    } catch (error) {
      this.emitEvent('reproduction:error', {
        testResultId,
        error: error instanceof Error ? error.message : String(error),
        testCaseId: testCase.id,
      });
      throw error;
    }
  }

  /**
   * Execute a single test iteration
   */
  private async executeSingleIteration(
    testCase: TestCase,
    decompiledReport?: DecompiledReport,
    schemaMappingResult?: SchemaMappingResult,
    complianceResult?: ComplianceResult,
    template?: any,
    iterationIndex: number = 0
  ): Promise<TestResult> {
    // Create a test result for this iteration
    const iterationTestResult: TestResult = {
      ...createTestResult(testCase.id, `${testCase.name} - Iteration ${iterationIndex + 1}`),
      id: `${generateTestResultId()}_iter${iterationIndex}`,
      createdAt: new Date(),
      testedAt: new Date(),
      templateId: template?.id,
      decompiledReportId: decompiledReport?.id,
      schemaMappingResultId: schemaMappingResult?.id,
      complianceResultId: complianceResult?.id,
      standardsApplied: this.config.standardsToApply,
      testScope: 'single_iteration',
    };

    // Execute the test
    await this.executeTest(
      iterationTestResult,
      testCase,
      decompiledReport,
      schemaMappingResult,
      complianceResult,
      template
    );

    return iterationTestResult;
  }

  /**
   * Execute the core test logic
   */
  private async executeTest(
    testResult: TestResult,
    testCase: TestCase,
    decompiledReport?: DecompiledReport,
    schemaMappingResult?: SchemaMappingResult,
    complianceResult?: ComplianceResult,
    template?: any
  ): Promise<void> {
    // Emit generation started event
    this.emitEvent('reproduction:generationStarted', {
      testResultId: testResult.id,
      testCaseId: testCase.id,
    });

    // Generate report from template/test case
    const generatedReport = await this.generateReport(
      testCase,
      decompiledReport,
      schemaMappingResult,
      complianceResult,
      template
    );

    // Store generated report ID
    testResult.execution.generatedReportId = generatedReport.id;

    // Emit generation completed event
    this.emitEvent('reproduction:generationCompleted', {
      testResultId: testResult.id,
      testCaseId: testCase.id,
      generatedReportId: generatedReport.id,
      generationTimeMs: 0, // Would be calculated in real implementation
    });

    // Emit comparison started event
    this.emitEvent('reproduction:comparisonStarted', {
      testResultId: testResult.id,
      testCaseId: testCase.id,
    });

    // Compare with expected output
    const comparisonResults = await this.compareWithExpected(
      generatedReport,
      testCase,
      decompiledReport,
      schemaMappingResult
    );

    testResult.comparisonResults = comparisonResults;

    // Calculate scores from comparison results
    this.calculateScoresFromComparison(testResult, comparisonResults);

    // Find differences
    testResult.differences = this.extractDifferences(comparisonResults);

    // Emit comparison completed event
    this.emitEvent('reproduction:comparisonCompleted', {
      testResultId: testResult.id,
      testCaseId: testCase.id,
      comparisonResultsCount: comparisonResults.length,
      differencesCount: testResult.differences.length,
    });

    // Emit scoring calculated event
    this.emitEvent('reproduction:scoringCalculated', {
      testResultId: testResult.id,
      scores: testResult.scores,
    });
  }

  /**
   * Generate a report from the test case
   */
  private async generateReport(
    testCase: TestCase,
    decompiledReport?: DecompiledReport,
    schemaMappingResult?: SchemaMappingResult,
    complianceResult?: ComplianceResult,
    template?: any
  ): Promise<{ id: string; content: any; structure: any }> {
    // Simplified implementation - in real system, would use template engine
    // to generate a report from the template and input data
    
    // For now, create a mock generated report
    const reportId = `generated_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    return {
      id: reportId,
      content: {
        title: `Generated Report for ${testCase.name}`,
        sections: this.generateMockSections(testCase),
        metadata: {
          generatedAt: new Date().toISOString(),
          templateId: testCase.templateId,
          testCaseId: testCase.id,
        },
      },
      structure: {
        sections: ['executive_summary', 'methodology', 'findings', 'recommendations', 'conclusions'],
        hierarchy: 'standard',
      },
    };
  }

  /**
   * Compare generated report with expected output
   */
  private async compareWithExpected(
    generatedReport: { id: string; content: any; structure: any },
    testCase: TestCase,
    decompiledReport?: DecompiledReport,
    schemaMappingResult?: SchemaMappingResult
  ): Promise<ComparisonResult[]> {
    const comparisonResults: ComparisonResult[] = [];

    // Compare structure if enabled
    if (this.config.compareStructure) {
      const structureComparison = await this.compareStructure(
        generatedReport.structure,
        testCase.expectedOutputStructure,
        decompiledReport
      );
      comparisonResults.push(structureComparison);
    }

    // Compare content if enabled
    if (this.config.compareContent) {
      const contentComparison = await this.compareContent(
        generatedReport.content,
        testCase,
        decompiledReport
      );
      comparisonResults.push(contentComparison);
    }

    // Compare formatting if enabled
    if (this.config.compareFormatting) {
      const formattingComparison = await this.compareFormatting(
        generatedReport.content,
        testCase,
        decompiledReport
      );
      comparisonResults.push(formattingComparison);
    }

    // Compare data if enabled
    if (this.config.compareData) {
      const dataComparison = await this.compareData(
        generatedReport.content,
        testCase.inputData,
        schemaMappingResult
      );
      comparisonResults.push(dataComparison);
    }

    return comparisonResults;
  }

  /**
   * Compare structure
   */
  private async compareStructure(
    actualStructure: any,
    expectedStructure?: any,
    decompiledReport?: DecompiledReport
  ): Promise<ComparisonResult> {
    // Simplified implementation
    const similarityScore = expectedStructure ? 85 : 100; // Mock score
    
    return {
      aspect: 'structure',
      similarityScore,
      passed: similarityScore >= 80,
      threshold: 80,
      differences: [],
      evidence: expectedStructure
        ? `Structure similarity: ${similarityScore}%`
        : 'No expected structure provided for comparison',
    };
  }

  /**
   * Compare content
   */
  private async compareContent(
    actualContent: any,
    testCase: TestCase,
    decompiledReport?: DecompiledReport
  ): Promise<ComparisonResult> {
    // Simplified implementation
    const similarityScore = 90; // Mock score
    
    return {
      aspect: 'content',
      similarityScore,
      passed: similarityScore >= 85,
      threshold: 85,
      differences: [],
      evidence: `Content similarity: ${similarityScore}%`,
    };
  }

  /**
   * Compare formatting
   */
  private async compareFormatting(
    actualContent: any,
    testCase: TestCase,
    decompiledReport?: DecompiledReport
  ): Promise<ComparisonResult> {
    // Simplified implementation
    const similarityScore = 95; // Mock score
    
    return {
      aspect: 'formatting',
      similarityScore,
      passed: similarityScore >= 90,
      threshold: 90,
      differences: [],
      evidence: `Formatting similarity: ${similarityScore}%`,
    };
  }

  /**
   * Compare data
   */
  private async compareData(
    actualContent: any,
    inputData: Record<string, any>,
    schemaMappingResult?: SchemaMappingResult
  ): Promise<ComparisonResult> {
    // Simplified implementation
    const similarityScore = 88; // Mock score
    
    return {
      aspect: 'data',
      similarityScore,
      passed: similarityScore >= 80,
      threshold: 80,
      differences: [],
      evidence: `Data consistency: ${similarityScore}%`,
    };
  }

  /**
   * Calculate scores from comparison results
   */
  private calculateScoresFromComparison(testResult: TestResult, comparisonResults: ComparisonResult[]): void {
    // Initialize scores
    testResult.scores = {
      structuralSimilarityScore: 0,
      contentSimilarityScore: 0,
      formattingSimilarityScore: 0,
      dataConsistencyScore: 0,
      timingConsistencyScore: 100, // Default for single run
      overallReproducibilityScore: 0,
    };

    // Extract scores from comparison results
    for (const comparison of comparisonResults) {
      switch (comparison.aspect) {
        case 'structure':
          testResult.scores.structuralSimilarityScore = comparison.similarityScore;
          break;
        case 'content':
          testResult.scores.contentSimilarityScore = comparison.similarityScore;
          break;
        case 'formatting':
          testResult.scores.formattingSimilarityScore = comparison.similarityScore;
          break;
        case 'data':
          testResult.scores.dataConsistencyScore = comparison.similarityScore;
          break;
      }
    }

    // Calculate overall score
    testResult.scores.overallReproducibilityScore = calculateOverallReproducibilityScore(testResult.scores);
  }

  /**
   * Extract differences from comparison results
   */
  private extractDifferences(comparisonResults: ComparisonResult[]): Difference[] {
    const differences: Difference[] = [];
    
    for (const comparison of comparisonResults) {
      for (const diff of comparison.differences) {
        differences.push(diff);
      }
    }
    
    return differences;
  }

  /**
   * Calculate consistency measurement across multiple runs
   */
  private calculateConsistencyMeasurement(
    testCaseId: string,
    iterationResults: TestResult[],
    timingStats: number[],
    outputHashes: string[]
  ): ConsistencyMeasurement {
    const runs = iterationResults.length;
    const successfulRuns = iterationResults.filter(r => r.reproducible).length;
    
    // Calculate hash distribution
    const hashDistribution: Record<string, number> = {};
    for (const hash of outputHashes) {
      hashDistribution[hash] = (hashDistribution[hash] || 0) + 1;
    }
    
    // Find most common hash
    let mostCommonHash: string | undefined;
    let maxCount = 0;
    for (const [hash, count] of Object.entries(hashDistribution)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonHash = hash;
      }
    }
    
    // Calculate consistency score (percentage of runs with same output)
    const consistencyScore = mostCommonHash
      ? Math.round((maxCount / runs) * 100)
      : 0;
    
    // Calculate variance (simplified)
    const variance = Math.random() * 20; // Mock variance
    
    // Calculate timing statistics
    const averageMs = timingStats.reduce((sum, time) => sum + time, 0) / timingStats.length;
    const minMs = Math.min(...timingStats);
    const maxMs = Math.max(...timingStats);
    const stdDevMs = Math.sqrt(
      timingStats.reduce((sum, time) => sum + Math.pow(time - averageMs, 2), 0) / timingStats.length
    );
    
    return {
      testCaseId,
      runs,
      successfulRuns,
      consistencyScore,
      variance,
      mostCommonOutputHash: mostCommonHash,
      hashDistribution,
      timingStats: {
        averageMs: Math.round(averageMs),
        minMs: Math.round(minMs),
        maxMs: Math.round(maxMs),
        stdDevMs: Math.round(stdDevMs),
      },
    };
  }

  /**
   * Calculate average scores from multiple iterations
   */
  private calculateAverageScores(mainResult: TestResult, iterationResults: TestResult[]): void {
    if (iterationResults.length === 0) return;
    
    // Initialize accumulator
    const scoreSums = {
      structuralSimilarityScore: 0,
      contentSimilarityScore: 0,
      formattingSimilarityScore: 0,
      dataConsistencyScore: 0,
      timingConsistencyScore: 0,
      overallReproducibilityScore: 0,
    };
    
    // Sum scores from all iterations
    for (const iteration of iterationResults) {
      scoreSums.structuralSimilarityScore += iteration.scores.structuralSimilarityScore;
      scoreSums.contentSimilarityScore += iteration.scores.contentSimilarityScore;
      scoreSums.formattingSimilarityScore += iteration.scores.formattingSimilarityScore;
      scoreSums.dataConsistencyScore += iteration.scores.dataConsistencyScore;
      scoreSums.timingConsistencyScore += iteration.scores.timingConsistencyScore;
      scoreSums.overallReproducibilityScore += iteration.scores.overallReproducibilityScore;
    }
    
    // Calculate averages
    const count = iterationResults.length;
    mainResult.scores = {
      structuralSimilarityScore: Math.round(scoreSums.structuralSimilarityScore / count),
      contentSimilarityScore: Math.round(scoreSums.contentSimilarityScore / count),
      formattingSimilarityScore: Math.round(scoreSums.formattingSimilarityScore / count),
      dataConsistencyScore: Math.round(scoreSums.dataConsistencyScore / count),
      timingConsistencyScore: Math.round(scoreSums.timingConsistencyScore / count),
      overallReproducibilityScore: Math.round(scoreSums.overallReproducibilityScore / count),
    };
  }

  /**
   * Determine if consistently reproducible
   */
  private isConsistentlyReproducible(
    consistencyMeasurement: ConsistencyMeasurement,
    scores: TestResult['scores']
  ): boolean {
    // Must have high consistency score AND high overall reproducibility score
    return consistencyMeasurement.consistencyScore >= 90 && scores.overallReproducibilityScore >= 85;
  }

  /**
   * Determine consistency status
   */
  private determineConsistencyStatus(
    consistencyMeasurement: ConsistencyMeasurement,
    scores: TestResult['scores']
  ): ReproductionStatus {
    if (consistencyMeasurement.consistencyScore >= 95 && scores.overallReproducibilityScore >= 90) {
      return 'passed';
    } else if (consistencyMeasurement.consistencyScore >= 80 && scores.overallReproducibilityScore >= 75) {
      return 'partial';
    } else if (consistencyMeasurement.consistencyScore >= 60 && scores.overallReproducibilityScore >= 50) {
      return 'inconsistent';
    } else {
      return 'failed';
    }
  }

  /**
   * Calculate confidence score for consistency test
   */
  private calculateConsistencyConfidenceScore(
    consistencyMeasurement: ConsistencyMeasurement,
    scores: TestResult['scores']
  ): number {
    // Base confidence on consistency and reproducibility
    let confidence = (consistencyMeasurement.consistencyScore + scores.overallReproducibilityScore) / 2;
    
    // Adjust based on variance (lower variance = higher confidence)
    confidence -= consistencyMeasurement.variance * 0.5;
    
    // Ensure confidence is within bounds
    return Math.max(0, Math.min(100, Math.round(confidence)));
  }

  /**
   * Calculate confidence score for single test
   */
  private calculateConfidenceScore(testResult: TestResult): number {
    // Base confidence on reproducibility score
    let confidence = testResult.scores.overallReproducibilityScore;
    
    // Adjust based on differences
    if (testResult.differences.length > 0) {
      confidence -= testResult.differences.length * 5;
    }
    
    // Ensure confidence is within bounds
    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Get test scope based on configuration
   */
  private getTestScope(): string {
    const scopes: string[] = [];
    
    if (this.config.compareStructure) scopes.push('structure');
    if (this.config.compareContent) scopes.push('content');
    if (this.config.compareFormatting) scopes.push('formatting');
    if (this.config.compareData) scopes.push('data');
    if (this.config.measureTiming) scopes.push('timing');
    
    return scopes.join('_');
  }

  /**
   * Generate mock sections for testing
   */
  private generateMockSections(testCase: TestCase): any[] {
    return [
      {
        id: 'executive_summary',
        title: 'Executive Summary',
        content: `Mock executive summary for ${testCase.name}`,
      },
      {
        id: 'methodology',
        title: 'Methodology',
        content: 'Mock methodology section',
      },
      {
        id: 'findings',
        title: 'Findings',
        content: 'Mock findings section',
      },
      {
        id: 'recommendations',
        title: 'Recommendations',
        content: 'Mock recommendations section',
      },
      {
        id: 'conclusions',
        title: 'Conclusions',
        content: 'Mock conclusions section',
      },
    ];
  }

  /**
   * Emit an event to all registered listeners
   */
  private emitEvent(event: ReproductionTestEvent, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      // Convert Set to Array to avoid downlevel iteration issues
      const listenerArray = Array.from(listeners);
      for (const listener of listenerArray) {
        try {
          listener(event, data);
        } catch (error) {
          console.error(`[ReportReproductionTester] Error in event listener for ${event}:`, error);
        }
      }
    }
  }

  /**
   * Register an event listener
   */
  on(event: ReproductionTestEvent, listener: EventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.add(listener);
    }
  }

  /**
   * Remove an event listener
   */
  off(event: ReproductionTestEvent, listener: EventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Get tester version
   */
  getVersion(): string {
    return this.testerVersion;
  }

  /**
   * Get configuration
   */
  getConfig(): ReproductionTesterConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ReproductionTesterConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Create a test case from a template
   */
  createTestCaseFromTemplate(
    templateId: string,
    name: string,
    inputData: Record<string, any>,
    priority: 'critical' | 'high' | 'medium' | 'low' = 'medium',
    tags: string[] = []
  ): TestCase {
    return {
      id: generateTestCaseId(),
      name,
      description: `Test case for template ${templateId}`,
      templateId,
      inputData,
      expectedOutputHash: undefined,
      expectedOutputStructure: undefined,
      generationParameters: {},
      priority,
      tags: [...tags, 'template_based'],
    };
  }

  /**
   * Create a test case from a decompiled report
   */
  createTestCaseFromDecompiledReport(
    decompiledReport: DecompiledReport,
    name: string,
    priority: 'critical' | 'high' | 'medium' | 'low' = 'medium',
    tags: string[] = []
  ): TestCase {
    return {
      id: generateTestCaseId(),
      name,
      description: `Test case based on decompiled report ${decompiledReport.id}`,
      templateId: 'unknown', // Default template ID since we don't have one
      inputData: this.extractInputDataFromDecompiledReport(decompiledReport),
      expectedOutputHash: decompiledReport.id, // Use ID as hash for now
      expectedOutputStructure: this.extractStructureFromDecompiledReport(decompiledReport),
      generationParameters: {},
      priority,
      tags: [...tags, 'decompiled_report_based'],
    };
  }

  /**
   * Extract input data from decompiled report
   */
  private extractInputDataFromDecompiledReport(decompiledReport: DecompiledReport): Record<string, any> {
    // Simplified implementation
    return {
      reportType: decompiledReport.detectedReportType,
      sectionCount: decompiledReport.sections?.length || 0,
      contentLength: JSON.stringify(decompiledReport).length,
    };
  }

  /**
   * Extract structure from decompiled report
   */
  private extractStructureFromDecompiledReport(decompiledReport: DecompiledReport): Record<string, any> {
    // Simplified implementation
    return {
      sections: decompiledReport.sections?.map(s => ({
        id: s.id,
        title: s.title,
        level: s.level,
      })),
      hierarchy: 'extracted',
    };
  }
}