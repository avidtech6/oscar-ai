/**
 * Phase 10: Report Reproduction Tester
 * ReproductionTesterIntegrationService Class
 * 
 * Integration service that connects the reproduction tester with Phase 1-9 components.
 */

import { ReportReproductionTester } from '../ReportReproductionTester';
import { TemplateBasedTestGenerator } from '../test-generation/TemplateBasedTestGenerator';
import { ReportGenerationTester } from '../ReportGenerationTester';
import { ResultComparisonEngine } from '../comparison/ResultComparisonEngine';
import { ConsistencyScoringService } from '../scoring/ConsistencyScoringService';
import { TestStorageSystem } from '../storage/TestStorageSystem';
import { TestEventSystem, TestEventType } from '../events/TestEventSystem';

import type { TestCase } from '../TestResult';
import type { TestResult } from '../TestResult';
import type { ConsistencyMeasurement } from '../TestResult';

// Import Phase 1-9 components (these would be available in the actual integration)
// For now, we'll define interfaces for the integration points

/**
 * Integration points with Phase 1-9 components
 */
export interface PhaseIntegrationPoints {
  // Phase 1: Report Decompiler
  decompiler?: {
    decompileReport: (reportContent: string) => Promise<any>;
  };
  
  // Phase 2: Report Type Registry
  registry?: {
    getReportType: (typeId: string) => Promise<any>;
    getAllReportTypes: () => Promise<any[]>;
  };
  
  // Phase 3: Schema Mapper
  schemaMapper?: {
    mapReportToSchema: (reportData: any, schemaId: string) => Promise<any>;
  };
  
  // Phase 4: Schema Updater
  schemaUpdater?: {
    updateSchema: (schemaId: string, updates: any) => Promise<any>;
  };
  
  // Phase 5: Style Learner
  styleLearner?: {
    getStyleProfile: (reportType: string) => Promise<any>;
  };
  
  // Phase 6: Classification Engine
  classification?: {
    classifyReport: (reportData: any) => Promise<any>;
  };
  
  // Phase 7: Self-Healing Engine
  selfHealing?: {
    healReport: (reportData: any, issues: any[]) => Promise<any>;
  };
  
  // Phase 8: Healing Orchestration
  healingOrchestration?: {
    orchestrateHealing: (reportData: any) => Promise<any>;
  };
  
  // Phase 9: Compliance Validator
  compliance?: {
    validateCompliance: (reportData: any) => Promise<any>;
  };
}

/**
 * Integration configuration
 */
export interface IntegrationConfig {
  enableDecompilerIntegration: boolean;
  enableRegistryIntegration: boolean;
  enableSchemaMapperIntegration: boolean;
  enableSchemaUpdaterIntegration: boolean;
  enableStyleLearnerIntegration: boolean;
  enableClassificationIntegration: boolean;
  enableSelfHealingIntegration: boolean;
  enableHealingOrchestrationIntegration: boolean;
  enableComplianceIntegration: boolean;
  
  // Test generation settings
  generateTestsFromRegistry: boolean;
  generateTestsFromStyleProfiles: boolean;
  generateTestsFromComplianceRules: boolean;
  
  // Execution settings
  useRealComponents: boolean;
  mockDataPath?: string;
}

/**
 * Default integration configuration
 */
const DEFAULT_CONFIG: IntegrationConfig = {
  enableDecompilerIntegration: true,
  enableRegistryIntegration: true,
  enableSchemaMapperIntegration: true,
  enableSchemaUpdaterIntegration: true,
  enableStyleLearnerIntegration: true,
  enableClassificationIntegration: true,
  enableSelfHealingIntegration: true,
  enableHealingOrchestrationIntegration: true,
  enableComplianceIntegration: true,
  
  generateTestsFromRegistry: true,
  generateTestsFromStyleProfiles: true,
  generateTestsFromComplianceRules: true,
  
  useRealComponents: false,
  mockDataPath: './mock-data',
};

/**
 * Main integration service
 */
export class ReproductionTesterIntegrationService {
  private config: IntegrationConfig;
  private integrationPoints: PhaseIntegrationPoints;
  private reproductionTester: ReportReproductionTester;
  private testGenerator: TemplateBasedTestGenerator;
  private generationTester: ReportGenerationTester;
  private comparisonEngine: ResultComparisonEngine;
  private scoringService: ConsistencyScoringService;
  private storageSystem: TestStorageSystem;
  private eventSystem: TestEventSystem;
  
  constructor(
    config?: Partial<IntegrationConfig>,
    integrationPoints?: PhaseIntegrationPoints
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.integrationPoints = integrationPoints || {};
    
    // Initialize components
    this.reproductionTester = new ReportReproductionTester();
    this.testGenerator = new TemplateBasedTestGenerator();
    this.generationTester = new ReportGenerationTester();
    this.comparisonEngine = new ResultComparisonEngine();
    this.scoringService = new ConsistencyScoringService();
    this.storageSystem = new TestStorageSystem();
    this.eventSystem = new TestEventSystem();
    
    // Setup event listeners
    this.setupEventListeners();
  }

  /**
   * Setup event listeners for integration
   */
  private setupEventListeners(): void {
    // Listen to test events and forward to integration points
    this.eventSystem.subscribeToAll(event => {
      this.handleIntegrationEvent(event);
    });
    
    // Listen to storage events
    this.eventSystem.subscribe(TestEventType.RESULT_STORED, event => {
      this.onResultStored(event);
    });
    
    // Listen to test completion events
    this.eventSystem.subscribe(TestEventType.TEST_COMPLETED, event => {
      this.onTestCompleted(event);
    });
    
    // Listen to consistency calculated events
    this.eventSystem.subscribe(TestEventType.CONSISTENCY_CALCULATED, event => {
      this.onConsistencyCalculated(event);
    });
  }

  /**
   * Handle integration events
   */
  private handleIntegrationEvent(event: any): void {
    // Log integration events for debugging
    if (this.config.useRealComponents) {
      console.log(`[Integration] Event: ${event.type} from ${event.source}`);
    }
    
    // Forward to appropriate integration points based on event type
    switch (event.type) {
      case TestEventType.TEST_FAILED:
        this.handleTestFailure(event);
        break;
      case TestEventType.ERROR_OCCURRED:
        this.handleSystemError(event);
        break;
      case TestEventType.WARNING_OCCURRED:
        this.handleSystemWarning(event);
        break;
    }
  }

  /**
   * Handle test failure by triggering self-healing
   */
  private handleTestFailure(event: any): void {
    if (!this.config.enableSelfHealingIntegration || !this.integrationPoints.selfHealing) {
      return;
    }
    
    const testCaseId = event.data?.testCaseId;
    const error = event.data?.error;
    
    if (testCaseId && error) {
      console.log(`[Integration] Test ${testCaseId} failed, triggering self-healing`);
      
      // In a real implementation, we would:
      // 1. Get the test case
      // 2. Get the generated report
      // 3. Trigger self-healing
      // 4. Re-run the test
    }
  }

  /**
   * Handle system error
   */
  private handleSystemError(event: any): void {
    const error = event.data?.error;
    const message = event.data?.message;
    
    console.error(`[Integration] System error: ${message}`, error);
    
    // In a real implementation, we might:
    // 1. Log to error tracking system
    // 2. Notify monitoring system
    // 3. Trigger recovery procedures
  }

  /**
   * Handle system warning
   */
  private handleSystemWarning(event: any): void {
    const warning = event.data?.warning;
    
    console.warn(`[Integration] System warning: ${warning}`);
    
    // In a real implementation, we might:
    // 1. Log to monitoring system
    // 2. Update health status
  }

  /**
   * Handle result stored event
   */
  private onResultStored(event: any): void {
    const itemType = event.data?.itemType;
    const itemId = event.data?.itemId;
    
    // If compliance result is stored, update compliance integration
    if (itemType === 'compliance_result' && this.config.enableComplianceIntegration) {
      this.updateComplianceIntegration(itemId);
    }
    
    // If style profile is stored, update style learner integration
    if (itemType === 'style_profile' && this.config.enableStyleLearnerIntegration) {
      this.updateStyleLearnerIntegration(itemId);
    }
  }

  /**
   * Handle test completed event
   */
  private onTestCompleted(event: any): void {
    const testResult = event.data?.testResult;
    
    if (testResult && this.config.enableClassificationIntegration) {
      // Update classification with test results
      this.updateClassificationWithTestResult(testResult);
    }
  }

  /**
   * Handle consistency calculated event
   */
  private onConsistencyCalculated(event: any): void {
    const consistencyMeasurement = event.data?.consistencyMeasurement;
    
    if (consistencyMeasurement && this.config.enableSchemaUpdaterIntegration) {
      // Update schema based on consistency findings
      this.updateSchemaBasedOnConsistency(consistencyMeasurement);
    }
  }

  /**
   * Update compliance integration
   */
  private updateComplianceIntegration(resultId: string): void {
    // In a real implementation, we would:
    // 1. Get the compliance result
    // 2. Update compliance rules
    // 3. Regenerate compliance-based tests
    console.log(`[Integration] Updating compliance integration with result ${resultId}`);
  }

  /**
   * Update style learner integration
   */
  private updateStyleLearnerIntegration(profileId: string): void {
    // In a real implementation, we would:
    // 1. Get the style profile
    // 2. Update style patterns
    // 3. Regenerate style-based tests
    console.log(`[Integration] Updating style learner integration with profile ${profileId}`);
  }

  /**
   * Update classification with test result
   */
  private updateClassificationWithTestResult(testResult: TestResult): void {
    // In a real implementation, we would:
    // 1. Extract features from test result
    // 2. Update classification model
    // 3. Improve classification accuracy
    console.log(`[Integration] Updating classification with test result ${testResult.id}`);
  }

  /**
   * Update schema based on consistency
   */
  private updateSchemaBasedOnConsistency(measurement: ConsistencyMeasurement): void {
    // In a real implementation, we would:
    // 1. Analyze consistency issues
    // 2. Identify schema gaps
    // 3. Trigger schema updates
    console.log(`[Integration] Updating schema based on consistency measurement for ${measurement.testCaseId}`);
  }

  /**
   * Generate integrated test cases
   */
  async generateIntegratedTestCases(): Promise<TestCase[]> {
    const testCases: TestCase[] = [];
    
    // Generate tests from registry if enabled
    if (this.config.generateTestsFromRegistry && this.config.enableRegistryIntegration) {
      const registryTests = await this.generateTestsFromRegistry();
      testCases.push(...registryTests);
    }
    
    // Generate tests from style profiles if enabled
    if (this.config.generateTestsFromStyleProfiles && this.config.enableStyleLearnerIntegration) {
      const styleTests = await this.generateTestsFromStyleProfiles();
      testCases.push(...styleTests);
    }
    
    // Generate tests from compliance rules if enabled
    if (this.config.generateTestsFromComplianceRules && this.config.enableComplianceIntegration) {
      const complianceTests = await this.generateTestsFromComplianceRules();
      testCases.push(...complianceTests);
    }
    
    // Store test cases
    testCases.forEach(testCase => {
      this.storageSystem.storeTestCase(testCase);
    });
    
    // Emit event
    this.eventSystem.emitSystemEvent(
      TestEventType.SYSTEM_STARTED,
      'ReproductionTesterIntegrationService',
      `Generated ${testCases.length} integrated test cases`
    );
    
    return testCases;
  }

  /**
   * Generate tests from registry
   */
  private async generateTestsFromRegistry(): Promise<TestCase[]> {
    if (!this.integrationPoints.registry) {
      console.warn('[Integration] Registry integration not available, using mock data');
      return this.generateMockRegistryTests();
    }
    
    try {
      const reportTypes = await this.integrationPoints.registry.getAllReportTypes();
      
      // Create test cases from report types using the reproduction tester
      return reportTypes.map(reportType => {
        return this.reproductionTester.createTestCaseFromTemplate(
          reportType.id,
          `Test for ${reportType.name}`,
          { reportType: reportType.id, source: 'registry' },
          'medium',
          ['registry_based', 'integration']
        );
      });
    } catch (error) {
      console.error('[Integration] Failed to generate tests from registry:', error);
      return this.generateMockRegistryTests();
    }
  }

  /**
   * Generate tests from style profiles
   */
  private async generateTestsFromStyleProfiles(): Promise<TestCase[]> {
    if (!this.integrationPoints.styleLearner) {
      console.warn('[Integration] Style learner integration not available, using mock data');
      return this.generateMockStyleTests();
    }
    
    try {
      // In a real implementation, we would get style profiles
      // For now, return mock tests
      return this.generateMockStyleTests();
    } catch (error) {
      console.error('[Integration] Failed to generate tests from style profiles:', error);
      return this.generateMockStyleTests();
    }
  }

  /**
   * Generate tests from compliance rules
   */
  private async generateTestsFromComplianceRules(): Promise<TestCase[]> {
    if (!this.integrationPoints.compliance) {
      console.warn('[Integration] Compliance integration not available, using mock data');
      return this.generateMockComplianceTests();
    }
    
    try {
      // In a real implementation, we would get compliance rules
      // For now, return mock tests
      return this.generateMockComplianceTests();
    } catch (error) {
      console.error('[Integration] Failed to generate tests from compliance rules:', error);
      return this.generateMockComplianceTests();
    }
  }

  /**
   * Generate mock registry tests
   */
  private generateMockRegistryTests(): TestCase[] {
    return [
      this.reproductionTester.createTestCaseFromTemplate(
        'bs5837',
        'Mock BS5837 Test',
        { reportType: 'bs5837', treeCount: 10, surveyDate: new Date().toISOString() },
        'medium',
        ['mock', 'registry', 'bs5837']
      ),
      this.reproductionTester.createTestCaseFromTemplate(
        'condition',
        'Mock Condition Report Test',
        { reportType: 'condition', assessmentType: 'visual', priority: 'medium' },
        'medium',
        ['mock', 'registry', 'condition']
      ),
    ];
  }

  /**
   * Generate mock style tests
   */
  private generateMockStyleTests(): TestCase[] {
    return [
      this.reproductionTester.createTestCaseFromTemplate(
        'formal_style',
        'Mock Formal Style Test',
        { style: 'formal', tone: 'professional', detailLevel: 'high' },
        'medium',
        ['mock', 'style', 'formal']
      ),
      this.reproductionTester.createTestCaseFromTemplate(
        'concise_style',
        'Mock Concise Style Test',
        { style: 'concise', tone: 'direct', detailLevel: 'medium' },
        'medium',
        ['mock', 'style', 'concise']
      ),
    ];
  }

  /**
   * Generate mock compliance tests
   */
  private generateMockComplianceTests(): TestCase[] {
    return [
      this.reproductionTester.createTestCaseFromTemplate(
        'compliance_full',
        'Mock Full Compliance Test',
        { complianceLevel: 'full', validation: 'strict', sections: 'all' },
        'high',
        ['mock', 'compliance', 'full']
      ),
      this.reproductionTester.createTestCaseFromTemplate(
        'compliance_minimal',
        'Mock Minimal Compliance Test',
        { complianceLevel: 'minimal', validation: 'basic', sections: 'required' },
        'medium',
        ['mock', 'compliance', 'minimal']
      ),
    ];
  }

  /**
   * Run integrated test suite
   */
  async runIntegratedTestSuite(): Promise<TestResult[]> {
    // Get all test cases
    const testCases = this.storageSystem.getAllTestCases();
    
    if (testCases.length === 0) {
      console.warn('[Integration] No test cases found, generating integrated test cases');
      await this.generateIntegratedTestCases();
    }
    
    // Run tests
    const results: TestResult[] = [];
    
    for (const testCase of testCases) {
      try {
        const result = await this.reproductionTester.runTest(testCase);
        results.push(result);
        
        // Store result
        this.storageSystem.storeTestResult(result);
        
        // Emit event
        this.eventSystem.emitTestExecutionEvent(
          TestEventType.TEST_COMPLETED,
          'ReproductionTesterIntegrationService',
          testCase.id,
          result
        );
      } catch (error) {
        console.error(`[Integration] Failed to run test ${testCase.id}:`, error);
        
        // Emit failure event
        this.eventSystem.emitTestExecutionEvent(
          TestEventType.TEST_FAILED,
          'ReproductionTesterIntegrationService',
          testCase.id,
          undefined,
          error as Error
        );
      }
    }
    
    // Calculate consistency scores
    for (const testCase of testCases) {
      const testResults = this.storageSystem.getTestResultsForTestCase(testCase.id);
      
      if (testResults.length >= 2) {
        const consistencyMeasurement = this.scoringService.calculateConsistencyMeasurement(testResults);
        this.storageSystem.storeConsistencyMeasurement(consistencyMeasurement);
        
        // Emit event
        this.eventSystem.emitMultiRunEvent(
          TestEventType.CONSISTENCY_CALCULATED,
          'ReproductionTesterIntegrationService',
          testCase.id,
          testResults.length,
          testResults,
          consistencyMeasurement
        );
      }
    }
    
    // Generate integration report
    this.generateIntegrationReport(results);
    
    return results;
  }

  /**
   * Generate integration report
   */
  private generateIntegrationReport(results: TestResult[]): void {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.status === 'passed').length;
    const failedTests = results.filter(r => r.status === 'failed').length;
    const partialTests = results.filter(r => r.status === 'partial').length;
    const inconsistentTests = results.filter(r => r.status === 'inconsistent').length;
    
    const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    
    console.log(`[Integration] Test Suite Results:`);
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Passed: ${passedTests} (${passRate}%)`);
    console.log(`  Failed: ${failedTests}`);
    console.log(`  Partial: ${partialTests}`);
    console.log(`  Inconsistent: ${inconsistentTests}`);
    
    // Get storage statistics
    const stats = this.storageSystem.getStatistics();
    console.log(`[Integration] Storage Statistics:`);
    console.log(`  Test Cases: ${stats.totalTestCases}`);
    console.log(`  Test Results: ${stats.totalTestResults}`);
    console.log(`  Consistency Measurements: ${stats.totalConsistencyMeasurements}`);
    
    // Emit system event with report
    this.eventSystem.emitSystemEvent(
      TestEventType.SYSTEM_STOPPED,
      'ReproductionTesterIntegrationService',
      `Integration test suite completed: ${passedTests}/${totalTests} passed (${passRate}%)`
    );
  }

  /**
   * Get integration status
   */
  getIntegrationStatus(): {
    enabledIntegrations: string[];
    testCaseCount: number;
    resultCount: number;
    consistencyMeasurementCount: number;
    lastRunTime?: Date;
  } {
    const stats = this.storageSystem.getStatistics();
    
    const enabledIntegrations: string[] = [];
    if (this.config.enableDecompilerIntegration) enabledIntegrations.push('decompiler');
    if (this.config.enableRegistryIntegration) enabledIntegrations.push('registry');
    if (this.config.enableSchemaMapperIntegration) enabledIntegrations.push('schema_mapper');
    if (this.config.enableSchemaUpdaterIntegration) enabledIntegrations.push('schema_updater');
    if (this.config.enableStyleLearnerIntegration) enabledIntegrations.push('style_learner');
    if (this.config.enableClassificationIntegration) enabledIntegrations.push('classification');
    if (this.config.enableSelfHealingIntegration) enabledIntegrations.push('self_healing');
    if (this.config.enableHealingOrchestrationIntegration) enabledIntegrations.push('healing_orchestration');
    if (this.config.enableComplianceIntegration) enabledIntegrations.push('compliance');
    
    // Get last run time from newest result
    let lastRunTime: Date | undefined;
    if (stats.newestResultDate) {
      lastRunTime = stats.newestResultDate;
    }
    
    return {
      enabledIntegrations,
      testCaseCount: stats.totalTestCases,
      resultCount: stats.totalTestResults,
      consistencyMeasurementCount: stats.totalConsistencyMeasurements,
      lastRunTime,
    };
  }

  /**
   * Export integration data
   */
  exportIntegrationData(): string {
    const status = this.getIntegrationStatus();
    const storageJson = this.storageSystem.exportToJson();
    
    const integrationData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        integrationServiceVersion: '1.0.0',
        config: this.config,
      },
      status,
      storageData: JSON.parse(storageJson),
    };
    
    return JSON.stringify(integrationData, null, 2);
  }

  /**
   * Import integration data
   */
  importIntegrationData(json: string): { imported: number; errors: string[] } {
    try {
      const data = JSON.parse(json);
      
      // Import storage data if present
      if (data.storageData) {
        const storageJson = JSON.stringify(data.storageData);
        return this.storageSystem.importFromJson(storageJson);
      }
      
      return { imported: 0, errors: ['No storage data found in import'] };
    } catch (error) {
      return { imported: 0, errors: [`Failed to parse integration data: ${error}`] };
    }
  }

  /**
   * Get configuration
   */
  getConfig(): IntegrationConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<IntegrationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get component references
   */
  getComponents(): {
    reproductionTester: ReportReproductionTester;
    testGenerator: TemplateBasedTestGenerator;
    generationTester: ReportGenerationTester;
    comparisonEngine: ResultComparisonEngine;
    scoringService: ConsistencyScoringService;
    storageSystem: TestStorageSystem;
    eventSystem: TestEventSystem;
  } {
    return {
      reproductionTester: this.reproductionTester,
      testGenerator: this.testGenerator,
      generationTester: this.generationTester,
      comparisonEngine: this.comparisonEngine,
      scoringService: this.scoringService,
      storageSystem: this.storageSystem,
      eventSystem: this.eventSystem,
    };
  }