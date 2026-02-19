/**
 * Report Validation Engine - Phase 4
 * Integration Example
 * 
 * Demonstrates how Phase 4 (Validation Engine) integrates with:
 * - Phase 1: Report Type Registry
 * - Phase 2: Report Decompiler (via Schema Mapping Result)
 * - Phase 3: Schema Mapper
 */

import { ReportValidationEngine } from '../ReportValidationEngine';
import { ValidationResultStorage } from '../storage/ValidationResultStorage';
import { ValidationEventEmitter } from '../events/ValidationEventEmitter';

// Import types from previous phases
import type { SchemaMappingResult } from '../../schema-mapper/SchemaMappingResult';
import type { ReportTypeRegistry } from '../../registry/ReportTypeRegistry';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';

// Mock data for demonstration
const mockSchemaMappingResult: SchemaMappingResult = {
  id: 'mapping_123456789',
  decompiledReportId: 'decompiled_987654321',
  reportTypeId: 'fire_risk_assessment',
  reportTypeName: 'Fire Risk Assessment',
  
  // Mapping results
  mappedFields: [
    {
      fieldId: 'introduction',
      fieldName: 'Introduction',
      fieldType: 'section',
      sourceSectionId: 'sec_1',
      sourceSectionTitle: 'Introduction',
      mappedValue: 'This is a fire risk assessment report for the building at 123 Main Street.',
      mappingConfidence: 0.95,
      mappingMethod: 'exact_match',
    },
    {
      fieldId: 'methodology',
      fieldName: 'Methodology',
      fieldType: 'section',
      sourceSectionId: 'sec_2',
      sourceSectionTitle: 'Assessment Methodology',
      mappedValue: 'The assessment was conducted in accordance with BS5837:2012 standards.',
      mappingConfidence: 0.90,
      mappingMethod: 'fuzzy_match',
    },
    {
      fieldId: 'findings',
      fieldName: 'Findings',
      fieldType: 'section',
      sourceSectionId: 'sec_3',
      sourceSectionTitle: 'Key Findings',
      mappedValue: 'Several fire safety issues were identified during the assessment.',
      mappingConfidence: 0.85,
      mappingMethod: 'inferred',
    },
  ],
  
  unmappedSections: [
    {
      sectionId: 'sec_4',
      sectionTitle: 'Additional Notes',
      sectionType: 'notes',
      contentPreview: 'Some additional observations...',
      reason: 'no_matching_field',
      confidence: 0.60,
    },
  ],
  
  missingRequiredSections: [
    {
      sectionId: 'recommendations',
      sectionName: 'Recommendations',
      description: 'Required section for fire risk assessments',
      required: true,
      reason: 'not_present',
      suggestedContent: 'Provide recommendations for addressing identified fire risks.',
    },
  ],
  
  extraSections: [
    {
      sectionId: 'sec_5',
      sectionTitle: 'Photographic Evidence',
      sectionType: 'evidence',
      contentPreview: 'Photos of fire safety equipment...',
      potentialPurpose: 'Supporting evidence for findings',
      suggestedAction: 'add_to_schema',
      confidence: 0.75,
    },
  ],
  
  unknownTerminology: [
    {
      term: 'fire compartmentation',
      context: 'The building lacks adequate fire compartmentation.',
      frequency: 2,
      category: 'technical',
      suggestedDefinition: 'Division of a building into fire-resistant compartments',
      confidence: 0.80,
    },
  ],
  
  schemaGaps: [
    {
      gapId: 'gap_1',
      type: 'missing_section',
      description: 'Missing recommendations section',
      severity: 'critical',
      affectedSectionId: 'recommendations',
      suggestedFix: 'Add recommendations section to report',
      data: { required: true },
      confidence: 0.95,
    },
  ],
  
  // Confidence and metrics
  confidenceScore: 0.85,
  mappingCoverage: 75,
  completenessScore: 70,
  
  // Processing metadata
  processingTimeMs: 1250,
  mappingStrategy: 'automatic',
  mapperVersion: '1.0.0',
  
  // Timestamps
  createdAt: new Date('2024-01-15T10:30:00Z'),
  processedAt: new Date('2024-01-15T10:30:01Z'),
  
  // References
  decompiledReportSnapshot: undefined,
  reportTypeDefinitionSnapshot: undefined,
  
  // Warnings and errors
  warnings: ['Some sections could not be mapped with high confidence'],
  errors: [],
};

/**
 * Example 1: Basic validation with ReportValidationEngine
 */
async function example1BasicValidation(): Promise<void> {
  console.log('=== Example 1: Basic Validation ===');
  
  // Create validation engine
  const validationEngine = new ReportValidationEngine();
  
  // Add event listeners
  validationEngine.on('validation:started', (event, data) => {
    console.log(`[Event] Validation started: ${data.validationResultId}`);
  });
  
  validationEngine.on('validation:ruleProcessed', (event, data) => {
    console.log(`[Event] Rule processed: ${data.ruleName} - ${data.passed ? 'PASS' : 'FAIL'}`);
  });
  
  validationEngine.on('validation:completed', (event, data) => {
    console.log(`[Event] Validation completed: Score ${data.overallScore}`);
  });
  
  // Validate the schema mapping result
  console.log('Validating schema mapping result...');
  const validationResult = await validationEngine.validate(mockSchemaMappingResult);
  
  // Display results
  console.log('\nValidation Results:');
  console.log(`- Overall Score: ${validationResult.scores.overallScore}`);
  console.log(`- Compliance Score: ${validationResult.scores.complianceScore}`);
  console.log(`- Quality Score: ${validationResult.scores.qualityScore}`);
  console.log(`- Findings: ${validationResult.findings.length}`);
  console.log(`- Compliance Violations: ${validationResult.complianceViolations.length}`);
  console.log(`- Quality Issues: ${validationResult.qualityIssues.length}`);
  console.log(`- Processing Time: ${validationResult.processingTimeMs}ms`);
  
  // Display findings if any
  if (validationResult.findings.length > 0) {
    console.log('\nFindings:');
    validationResult.findings.forEach((finding, index) => {
      console.log(`  ${index + 1}. [${finding.severity}] ${finding.description}`);
    });
  }
}

/**
 * Example 2: Validation with storage
 */
async function example2ValidationWithStorage(): Promise<void> {
  console.log('\n=== Example 2: Validation with Storage ===');
  
  // Create validation engine and storage
  const validationEngine = new ReportValidationEngine();
  const storage = new ValidationResultStorage({
    maxResults: 100,
    autoPrune: true,
    persistToFile: false,
  });
  
  // Validate multiple times (simulating multiple reports)
  console.log('Validating multiple reports...');
  
  for (let i = 0; i < 3; i++) {
    // Create a slightly modified mapping result for each iteration
    const modifiedResult = {
      ...mockSchemaMappingResult,
      id: `mapping_${Date.now()}_${i}`,
      completenessScore: 60 + i * 10, // Varying scores
    };
    
    const validationResult = await validationEngine.validate(modifiedResult);
    
    // Store the result
    const storedId = storage.store(validationResult);
    console.log(`  Stored validation result: ${storedId} (Score: ${validationResult.scores.overallScore})`);
  }
  
  // Query storage
  console.log('\nStorage Statistics:');
  const stats = storage.getStats();
  console.log(`- Total Results: ${stats.totalResults}`);
  console.log(`- Average Processing Time: ${stats.averageProcessingTime.toFixed(2)}ms`);
  
  // Get average scores by report type
  const averageScores = storage.getAverageScoresByReportType();
  console.log('\nAverage Scores by Report Type:');
  Object.entries(averageScores).forEach(([reportType, scores]) => {
    console.log(`  ${reportType}:`);
    console.log(`    Count: ${scores.count}`);
    console.log(`    Overall: ${scores.overallScore.toFixed(1)}`);
    console.log(`    Compliance: ${scores.complianceScore.toFixed(1)}`);
    console.log(`    Quality: ${scores.qualityScore.toFixed(1)}`);
  });
}

/**
 * Example 3: Custom validation rules
 */
async function example3CustomRules(): Promise<void> {
  console.log('\n=== Example 3: Custom Validation Rules ===');
  
  const validationEngine = new ReportValidationEngine();
  
  // Add custom validation rules
  validationEngine.addRule({
    id: 'custom_001',
    name: 'Executive Summary Length',
    description: 'Check that executive summary is between 100-500 words',
    type: 'quality',
    severity: 'medium',
    appliesTo: ['fire_risk_assessment', 'arboriculture_assessment'],
    condition: 'executiveSummaryLength',
    messageTemplate: 'Executive summary should be between 100-500 words (current: {wordCount})',
    remediationGuidance: 'Adjust executive summary length',
    source: 'organization',
    version: '1.0.0',
    enabled: true,
    weight: 6,
    autoFixable: false,
    requiresHumanReview: false,
  });
  
  validationEngine.addRule({
    id: 'custom_002',
    name: 'Photographic Evidence Required',
    description: 'Check that photographic evidence is included for high-risk findings',
    type: 'completeness',
    severity: 'high',
    appliesTo: ['fire_risk_assessment'],
    condition: 'photographicEvidencePresent',
    messageTemplate: 'Missing photographic evidence for high-risk finding: {finding}',
    remediationGuidance: 'Add photographic evidence to support findings',
    source: 'regulation',
    regulationStandard: 'BS5837:2012',
    version: '1.0.0',
    enabled: true,
    weight: 8,
    autoFixable: false,
    requiresHumanReview: true,
  });
  
  // Get all rules
  const allRules = validationEngine.getAllRules();
  console.log(`Total validation rules: ${allRules.length}`);
  
  // Get rules by type
  const qualityRules = validationEngine.getRulesByType('quality');
  const complianceRules = validationEngine.getRulesByType('compliance');
  
  console.log(`Quality rules: ${qualityRules.length}`);
  console.log(`Compliance rules: ${complianceRules.length}`);
  
  // Disable a rule
  validationEngine.setRuleEnabled('custom_001', false);
  console.log('Disabled custom rule: custom_001');
  
  // Validate with custom rules
  console.log('\nValidating with custom rules...');
  const validationResult = await validationEngine.validate(mockSchemaMappingResult);
  
  console.log(`Validation completed with ${validationResult.rulesExecuted} rules executed`);
  console.log(`Rules passed: ${validationResult.rulesPassed}`);
  console.log(`Rules failed: ${validationResult.rulesFailed}`);
}

/**
 * Example 4: Event emitter integration
 */
async function example4EventEmitter(): Promise<void> {
  console.log('\n=== Example 4: Event Emitter Integration ===');
  
  const eventEmitter = new ValidationEventEmitter();
  
  // Set up event listeners
  const unsubscribeStarted = eventEmitter.on('validation:started', (event, data) => {
    console.log(`[EventEmitter] ${event}: ${data.validationResultId}`);
  });
  
  const unsubscribeCompleted = eventEmitter.on('validation:completed', (event, data) => {
    console.log(`[EventEmitter] ${event}: Score ${data.overallScore}, ${data.findingsCount} findings`);
  });
  
  // Listen to all events
  const unsubscribeAll = eventEmitter.onAll((event, data) => {
    console.log(`[EventEmitter-All] ${event} received`);
  });
  
  // Emit some events
  console.log('Emitting events...');
  
  eventEmitter.emitValidationStarted({
    validationResultId: 'test_123',
    schemaMappingResultId: 'mapping_123',
    reportTypeId: 'fire_risk_assessment',
    timestamp: new Date(),
  });
  
  eventEmitter.emitRuleProcessed({
    validationResultId: 'test_123',
    ruleId: 'comp_001',
    ruleName: 'Required Sections Present',
    ruleType: 'compliance',
    passed: false,
    severity: 'critical',
    processingTimeMs: 150,
  });
  
  eventEmitter.emitValidationCompleted({
    validationResultId: 'test_123',
    overallScore: 78.5,
    findingsCount: 3,
    complianceViolationsCount: 1,
    qualityIssuesCount: 2,
    processingTimeMs: 1250,
    timestamp: new Date(),
  });
  
  // Get event statistics
  const stats = eventEmitter.getEventStats();
  console.log('\nEvent Statistics:');
  console.log(`- Total events: ${stats.totalEvents}`);
  console.log(`- Events per minute: ${stats.eventsPerMinute}`);
  console.log(`- Events by type:`, stats.eventsByType);
  
  // Clean up listeners
  unsubscribeStarted();
  unsubscribeCompleted();
  unsubscribeAll();
  console.log('Event listeners cleaned up');
}

/**
 * Example 5: Full integration workflow
 */
async function example5FullIntegrationWorkflow(): Promise<void> {
  console.log('\n=== Example 5: Full Integration Workflow ===');
  
  console.log('Simulating full report intelligence workflow:');
  console.log('1. Report Type Identification (Phase 1)');
  console.log('2. Report Decompilation (Phase 2)');
  console.log('3. Schema Mapping (Phase 3)');
  console.log('4. Report Validation (Phase 4)');
  
  // Create components
  const validationEngine = new ReportValidationEngine();
  const storage = new ValidationResultStorage();
  const eventEmitter = new ValidationEventEmitter();
  
  // Set up event forwarding
  validationEngine.on('validation:started', (event, data) => {
    eventEmitter.emit('validation:started', data);
  });
  
  validationEngine.on('validation:completed', (event, data) => {
    eventEmitter.emit('validation:completed', data);
  });
  
  // Event listener for monitoring
  eventEmitter.on('validation:started', (event, data) => {
    console.log(`[Workflow] Validation started for ${data.schemaMappingResultId}`);
  });
  
  eventEmitter.on('validation:completed', (event, data) => {
    console.log(`[Workflow] Validation completed: ${data.overallScore} score`);
    
    // Store result in database (simulated)
    console.log(`[Workflow] Storing validation result ${data.validationResultId}`);
  });
  
  // Simulate validation
  console.log('\nRunning validation...');
  const validationResult = await validationEngine.validate(mockSchemaMappingResult);
  
  // Store result
  storage.store(validationResult);
  
  console.log('\nWorkflow completed successfully!');
  console.log(`Final validation score: ${validationResult.scores.overallScore}`);
  console.log(`Findings: ${validationResult.findings.length}`);
  console.log(`Storage count: ${storage.getCount()}`);
}

/**
 * Main function to run all examples
 */
async function runAllExamples(): Promise<void> {
  console.log('Report Validation Engine - Phase 4 Integration Examples');
  console.log('=======================================================\n');
  
  try {
    await example1BasicValidation();
    await example2ValidationWithStorage();
    await example3CustomRules();
    await example4EventEmitter();
    await example5FullIntegrationWorkflow();
    
    console.log('\n=== All examples completed successfully ===');
    console.log('\nSummary:');
    console.log('- Phase 4 integrates seamlessly with Phases 1-3');
    console.log('- Validation engine provides comprehensive rule-based validation');
    console.log('- Storage system enables persistence and querying of results');
    console.log('- Event system allows for monitoring and integration');
    console.log('- Custom rules can be added for organization-specific requirements');
    
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Run the examples
runAllExamples().catch(console.error);