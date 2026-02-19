/**
 * Phase 10: Report Reproduction Tester
 * ReportGenerationTester Class
 * 
 * Tests report generation from templates and validates the output.
 */

import type { TestCase } from './TestResult';
import type { TestResult } from './TestResult';
import type { ReportReproductionTester } from './ReportReproductionTester';
import type { TemplateBasedTestGenerator } from './test-generation/TemplateBasedTestGenerator';

/**
 * Generation test configuration
 */
export interface GenerationTestConfig {
  validateOutput: boolean;
  compareWithExpected: boolean;
  measurePerformance: boolean;
  performanceThresholdMs: number;
  generateMultipleVersions: boolean;
  versionCount: number;
  failOnValidationError: boolean;
  logDetailedResults: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: GenerationTestConfig = {
  validateOutput: true,
  compareWithExpected: true,
  measurePerformance: true,
  performanceThresholdMs: 5000,
  generateMultipleVersions: false,
  versionCount: 3,
  failOnValidationError: true,
  logDetailedResults: true,
};

/**
 * Generation test result
 */
export interface GenerationTestResult {
  testCaseId: string;
  passed: boolean;
  validationErrors: string[];
  performanceMetrics: {
    generationTimeMs: number;
    validationTimeMs: number;
    totalTimeMs: number;
  };
  outputHash?: string;
  outputSizeBytes: number;
  versionResults?: VersionTestResult[];
}

/**
 * Version test result (for multiple versions)
 */
export interface VersionTestResult {
  version: number;
  passed: boolean;
  outputHash: string;
  generationTimeMs: number;
  validationErrors: string[];
}

/**
 * Batch test summary
 */
export interface BatchTestSummary {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  totalTimeMs: number;
  averageGenerationTimeMs: number;
  averageValidationTimeMs: number;
  totalErrors: number;
  errorCounts: Record<string, number>;
  performanceIssues: number;
}

/**
 * Main ReportGenerationTester class
 */
export class ReportGenerationTester {
  private reproductionTester?: ReportReproductionTester;
  private testGenerator?: TemplateBasedTestGenerator;
  private config: GenerationTestConfig;
  
  constructor(
    reproductionTester?: ReportReproductionTester,
    testGenerator?: TemplateBasedTestGenerator,
    config?: Partial<GenerationTestConfig>
  ) {
    this.reproductionTester = reproductionTester;
    this.testGenerator = testGenerator;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Run generation test for a single test case
   */
  async runGenerationTest(testCase: TestCase): Promise<GenerationTestResult> {
    const startTime = Date.now();
    const result: GenerationTestResult = {
      testCaseId: testCase.id,
      passed: false,
      validationErrors: [],
      performanceMetrics: {
        generationTimeMs: 0,
        validationTimeMs: 0,
        totalTimeMs: 0,
      },
      outputSizeBytes: 0,
    };

    try {
      // Generate report
      const generationStart = Date.now();
      const generatedReport = await this.generateReport(testCase);
      const generationTime = Date.now() - generationStart;
      
      result.performanceMetrics.generationTimeMs = generationTime;
      result.outputHash = this.calculateHash(generatedReport);
      result.outputSizeBytes = this.calculateSize(generatedReport);

      // Validate output if enabled
      if (this.config.validateOutput) {
        const validationStart = Date.now();
        const validationErrors = await this.validateOutput(generatedReport, testCase);
        const validationTime = Date.now() - validationStart;
        
        result.validationErrors = validationErrors;
        result.performanceMetrics.validationTimeMs = validationTime;
        
        // Check if passed
        result.passed = validationErrors.length === 0 || !this.config.failOnValidationError;
      } else {
        result.passed = true; // Pass if validation is disabled
      }

      // Compare with expected if enabled and expected output exists
      if (this.config.compareWithExpected && testCase.expectedOutputHash) {
        const comparisonResult = await this.compareWithExpected(generatedReport, testCase);
        if (!comparisonResult.matches) {
          result.validationErrors.push(`Output does not match expected: ${comparisonResult.difference}`);
          if (this.config.failOnValidationError) {
            result.passed = false;
          }
        }
      }

      // Check performance threshold
      if (this.config.measurePerformance && generationTime > this.config.performanceThresholdMs) {
        result.validationErrors.push(`Generation time ${generationTime}ms exceeds threshold ${this.config.performanceThresholdMs}ms`);
        if (this.config.failOnValidationError) {
          result.passed = false;
        }
      }

      // Generate multiple versions if enabled
      if (this.config.generateMultipleVersions) {
        const versionResults = await this.generateMultipleVersions(testCase, this.config.versionCount);
        result.versionResults = versionResults;
        
        // Check if all versions passed
        const allVersionsPassed = versionResults.every((v: VersionTestResult) => v.passed);
        if (!allVersionsPassed && this.config.failOnValidationError) {
          result.passed = false;
        }
      }

    } catch (error) {
      result.validationErrors.push(`Generation error: ${error instanceof Error ? error.message : String(error)}`);
      result.passed = false;
    }

    // Calculate total time
    result.performanceMetrics.totalTimeMs = Date.now() - startTime;

    // Log results if enabled
    if (this.config.logDetailedResults) {
      this.logTestResult(testCase, result);
    }

    return result;
  }

  /**
   * Run generation tests for multiple test cases
   */
  async runBatchGenerationTests(testCases: TestCase[]): Promise<{
    results: GenerationTestResult[];
    summary: BatchTestSummary;
  }> {
    const results: GenerationTestResult[] = [];
    const startTime = Date.now();
    
    for (const testCase of testCases) {
      const result = await this.runGenerationTest(testCase);
      results.push(result);
    }
    
    const totalTime = Date.now() - startTime;
    
    const summary = this.generateBatchSummary(results, totalTime);
    
    return { results, summary };
  }

  /**
   * Generate a report from a test case
   */
  private async generateReport(testCase: TestCase): Promise<any> {
    // Simplified implementation
    // In real system, would use template engine to generate report
    
    const report = {
      id: `generated_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      testCaseId: testCase.id,
      templateId: testCase.templateId,
      generatedAt: new Date().toISOString(),
      content: {
        title: `Generated Report for ${testCase.name}`,
        metadata: {
          testCase: testCase.name,
          template: testCase.templateId,
          generationTime: new Date().toISOString(),
        },
        sections: this.generateSectionsFromInput(testCase.inputData),
      },
      validation: {
        isValid: true,
        validatedAt: new Date().toISOString(),
      },
    };
    
    return report;
  }

  /**
   * Generate sections from input data
   */
  private generateSectionsFromInput(inputData: Record<string, any>): any[] {
    const sections = [];
    
    // Executive Summary
    if (inputData.reportTitle || inputData.surveyDate) {
      sections.push({
        id: 'executive_summary',
        title: 'Executive Summary',
        content: `Report: ${inputData.reportTitle || 'Untitled'}\nDate: ${inputData.surveyDate || 'Unknown'}`,
      });
    }
    
    // Methodology
    if (inputData.surveyMethod || inputData.surveyorName) {
      sections.push({
        id: 'methodology',
        title: 'Methodology',
        content: `Method: ${inputData.surveyMethod || 'Not specified'}\nSurveyor: ${inputData.surveyorName || 'Unknown'}`,
      });
    }
    
    // Findings
    if (inputData.treeCount !== undefined || inputData.conditionAssessment) {
      sections.push({
        id: 'findings',
        title: 'Findings',
        content: `Trees surveyed: ${inputData.treeCount || 0}\nCondition: ${inputData.conditionAssessment || 'Not assessed'}`,
      });
    }
    
    // Recommendations
    if (inputData.recommendations) {
      sections.push({
        id: 'recommendations',
        title: 'Recommendations',
        content: inputData.recommendations,
      });
    }
    
    // Conclusions
    sections.push({
      id: 'conclusions',
      title: 'Conclusions',
      content: 'Report generation completed successfully.',
    });
    
    return sections;
  }

  /**
   * Validate generated report
   */
  private async validateOutput(generatedReport: any, testCase: TestCase): Promise<string[]> {
    const errors: string[] = [];
    
    // Basic validation
    if (!generatedReport.id) {
      errors.push('Generated report missing ID');
    }
    
    if (!generatedReport.content) {
      errors.push('Generated report missing content');
    }
    
    if (!generatedReport.content.title) {
      errors.push('Generated report missing title');
    }
    
    // Check required sections
    const requiredSections = ['executive_summary', 'methodology', 'findings', 'conclusions'];
    const actualSections = generatedReport.content.sections?.map((s: any) => s.id) || [];
    
    for (const requiredSection of requiredSections) {
      if (!actualSections.includes(requiredSection)) {
        errors.push(`Missing required section: ${requiredSection}`);
      }
    }
    
    // Validate against test case input
    if (testCase.inputData.treeCount !== undefined) {
      const treeCount = testCase.inputData.treeCount;
      if (typeof treeCount !== 'number' || treeCount < 0) {
        errors.push(`Invalid tree count in input: ${treeCount}`);
      }
    }
    
    // Check for empty content
    const sections = generatedReport.content.sections || [];
    for (const section of sections) {
      if (!section.content || section.content.trim() === '') {
        errors.push(`Empty content in section: ${section.id}`);
      }
    }
    
    return errors;
  }

  /**
   * Compare with expected output
   */
  private async compareWithExpected(generatedReport: any, testCase: TestCase): Promise<{
    matches: boolean;
    difference?: string;
  }> {
    if (!testCase.expectedOutputHash) {
      return { matches: true }; // Nothing to compare
    }
    
    const actualHash = this.calculateHash(generatedReport);
    const matches = actualHash === testCase.expectedOutputHash;
    
    if (!matches) {
      return {
        matches: false,
        difference: `Hash mismatch: expected ${testCase.expectedOutputHash}, got ${actualHash}`,
      };
    }
    
    return { matches: true };
  }

  /**
   * Generate multiple versions of the same report
   */
  private async generateMultipleVersions(testCase: TestCase, count: number): Promise<VersionTestResult[]> {
    const versionResults: VersionTestResult[] = [];
    
    for (let i = 0; i < count; i++) {
      const versionStart = Date.now();
      
      try {
        // Generate report with slight variations
        const modifiedTestCase = this.createVariation(testCase, i);
        const generatedReport = await this.generateReport(modifiedTestCase);
        const generationTime = Date.now() - versionStart;
        
        // Validate
        const validationErrors = await this.validateOutput(generatedReport, modifiedTestCase);
        
        versionResults.push({
          version: i + 1,
          passed: validationErrors.length === 0,
          outputHash: this.calculateHash(generatedReport),
          generationTimeMs: generationTime,
          validationErrors,
        });
        
      } catch (error) {
        versionResults.push({
          version: i + 1,
          passed: false,
          outputHash: 'error',
          generationTimeMs: Date.now() - versionStart,
          validationErrors: [`Version generation error: ${error instanceof Error ? error.message : String(error)}`],
        });
      }
    }
    
    return versionResults;
  }

  /**
   * Create a variation of a test case
   */
  private createVariation(testCase: TestCase, variationIndex: number): TestCase {
    // Create a copy with slight modifications
    const variation = { ...testCase };
    variation.id = `${testCase.id}_v${variationIndex + 1}`;
    variation.name = `${testCase.name} - Variation ${variationIndex + 1}`;
    
    // Modify input data slightly
    if (variation.inputData.treeCount !== undefined) {
      variation.inputData = { ...variation.inputData };
      variation.inputData.treeCount = variation.inputData.treeCount + variationIndex;
    }
    
    return variation;
  }

  /**
   * Calculate hash of generated report
   */
  private calculateHash(report: any): string {
    // Simplified hash calculation
    const contentString = JSON.stringify(report.content);
    let hash = 0;
    
    for (let i = 0; i < contentString.length; i++) {
      const char = contentString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `hash_${Math.abs(hash).toString(16)}`;
  }

  /**
   * Calculate size of generated report
   */
  private calculateSize(report: any): number {
    const jsonString = JSON.stringify(report);
    return new Blob([jsonString]).size;
  }

  /**
   * Generate batch test summary
   */
  private generateBatchSummary(results: GenerationTestResult[], totalTimeMs: number): BatchTestSummary {
    const total = results.length;
    const passed = results.filter(r => r.passed).length;
    const failed = total - passed;
    
    // Calculate average times
    const totalGenerationTime = results.reduce((sum, r) => sum + r.performanceMetrics.generationTimeMs, 0);
    const totalValidationTime = results.reduce((sum, r) => sum + r.performanceMetrics.validationTimeMs, 0);
    const avgGenerationTime = total > 0 ? Math.round(totalGenerationTime / total) : 0;
    const avgValidationTime = total > 0 ? Math.round(totalValidationTime / total) : 0;
    
    // Collect all validation errors
    const allErrors: string[] = [];
    for (const result of results) {
      allErrors.push(...result.validationErrors);
    }
    
    // Count error types
    const errorCounts: Record<string, number> = {};
    for (const error of allErrors) {
      const errorType = error.split(':')[0] || 'Unknown';
      errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
    }
    
    return {
      total,
      passed,
      failed,
      passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
      totalTimeMs,
      averageGenerationTimeMs: avgGenerationTime,
      averageValidationTimeMs: avgValidationTime,
      totalErrors: allErrors.length,
      errorCounts,
      performanceIssues: results.filter(r => 
        r.performanceMetrics.generationTimeMs > this.config.performanceThresholdMs
      ).length,
    };
  }

  /**
   * Log test result
   */
  private logTestResult(testCase: TestCase, result: GenerationTestResult): void {
    console.log(`[ReportGenerationTester] Test Case: ${testCase.name} (${testCase.id})`);
    console.log(`  Status: ${result.passed ? 'PASSED' : 'FAILED'}`);
    console.log(`  Generation Time: ${result.performanceMetrics.generationTimeMs}ms`);
    console.log(`  Validation Time: ${result.performanceMetrics.validationTimeMs}ms`);
    console.log(`  Total Time: ${result.performanceMetrics.totalTimeMs}ms`);
    console.log(`  Output Size: ${result.outputSizeBytes} bytes`);
    console.log(`  Output Hash: ${result.outputHash}`);
    
    if (result.validationErrors.length > 0) {
      console.log(`  Validation Errors (${result.validationErrors.length}):`);
      for (const error of result.validationErrors) {
        console.log(`    - ${error}`);
      }
    }
    
    if (result.versionResults && result.versionResults.length > 0) {
      console.log(`  Version Results (${result.versionResults.length} versions):`);
      for (const versionResult of result.versionResults) {
        console.log(`    Version ${versionResult.version}: ${versionResult.passed ? 'PASSED' : 'FAILED'} (${versionResult.generationTimeMs}ms)`);
      }
    }
    
    console.log('');
  }

  /**
   * Get configuration
   */
  getConfig(): GenerationTestConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<GenerationTestConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Generate a test report from results
   */
  generateTestReport(results: GenerationTestResult[]): string {
    const summary = this.generateBatchSummary(results, 0);
    
    let report = `# Report Generation Test Results\n\n`;
    report += `## Summary\n`;
    report += `- Total Tests: ${summary.total}\n`;
    report += `- Passed: ${summary.passed}\n`;
    report += `- Failed: ${summary.failed}\n`;
    report += `- Pass Rate: ${summary.passRate}%\n`;
    report += `- Total Errors: ${summary.totalErrors}\n`;
    report += `- Performance Issues: ${summary.performanceIssues}\n\n`;
    
    report += `## Performance Metrics\n`;
    report += `- Average Generation Time: ${summary.averageGenerationTimeMs}ms\n`;
    report += `- Average Validation Time: ${summary.averageValidationTimeMs}ms\n\n`;
    
    if (summary.totalErrors > 0) {
      report += `## Error Breakdown\n`;
      for (const [errorType, count] of Object.entries(summary.errorCounts)) {
        report += `- ${errorType}: ${count}\n`;
      }
      report += `\n`;
    }
    
    report += `## Detailed Results\n\n`;
    
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      report += `### Test ${i + 1}: ${result.testCaseId}\n`;
      report += `- Status: ${result.passed ? 'PASSED' : 'FAILED'}\n`;
      report += `- Generation Time: ${result.performanceMetrics.generationTimeMs}ms\n`;
      report += `- Validation Time: ${result.performanceMetrics.validationTimeMs}ms\n`;
      report += `- Total Time: ${result.performanceMetrics.totalTimeMs}ms\n`;
      report += `- Output Size: ${result.outputSizeBytes} bytes\n`;
      
      if (result.validationErrors.length > 0) {
        report += `- Validation Errors:\n`;
        for (const error of result.validationErrors) {
          report += `  - ${error}\n`;
        }
      }
      
      report += `\n`;
    }
    
    return report;
  }
}
