/**
 * Schema Updater Engine - Phase 4
 * Integration Example
 * 
 * Demonstrates the integration of Phase 4 (Schema Updater Engine) with
 * Phase 1 (Report Type Registry) and Phase 3 (Schema Mapper).
 */

import { ReportTypeRegistry } from '../../registry/ReportTypeRegistry.js';
import { SchemaUpdaterEngine, type SchemaUpdaterEventData } from '../SchemaUpdaterEngine.js';
import { createSchemaMappingResult, type SchemaMappingResult, generateMappingResultId } from '../../schema-mapper/SchemaMappingResult.js';

/**
 * Example integration demonstrating Phase 4 functionality
 */
async function runIntegrationExample(): Promise<void> {
  console.log('=== Phase 4: Schema Updater Engine Integration Example ===\n');
  
  // Step 1: Create a Report Type Registry (Phase 1)
  console.log('1. Creating Report Type Registry (Phase 1)...');
  const registry = new ReportTypeRegistry();
  
  // Load some example report types (simulated)
  console.log('   Loaded example report types');
  
  // Step 2: Create a mock SchemaMappingResult (Phase 3)
  console.log('\n2. Creating mock SchemaMappingResult (Phase 3)...');
  const mappingResultBase = createSchemaMappingResult('decompiled_report_123', 'bs5837_report');
  const mappingResult: SchemaMappingResult = {
    ...mappingResultBase,
    id: generateMappingResultId(),
    createdAt: new Date(),
    processedAt: new Date(),
  };
  
  // Add some schema gaps to simulate discovered issues
  mappingResult.schemaGaps = [
    {
      gapId: 'gap_1',
      type: 'missing_section',
      description: 'Missing "Tree Protection Plan" section',
      severity: 'critical',
      affectedSectionId: 'tree_protection',
      suggestedFix: 'Add Tree Protection Plan section to report type definition',
      data: { sectionName: 'Tree Protection Plan', required: true },
      confidence: 0.9
    },
    {
      gapId: 'gap_2',
      type: 'unknown_terminology',
      description: 'Unknown term "Crown Reduction Percentage"',
      severity: 'warning',
      affectedFieldId: 'crown_measurements',
      suggestedFix: 'Add term to terminology registry',
      data: { term: 'Crown Reduction Percentage', context: 'Recommended crown reduction: 20%' },
      confidence: 0.8
    }
  ];
  
  // Add some unmapped sections
  mappingResult.unmappedSections = [
    {
      sectionId: 'site_photos',
      sectionTitle: 'Site Photographs',
      sectionType: 'media',
      contentPreview: 'Photographic evidence of site conditions...',
      reason: 'no_matching_field',
      confidence: 0.7
    }
  ];
  
  // Add some missing required sections
  mappingResult.missingRequiredSections = [
    {
      sectionId: 'executive_summary',
      sectionName: 'Executive Summary',
      description: 'Brief overview of the report findings',
      required: true,
      reason: 'not_present',
      suggestedContent: 'Provide a concise summary of key findings...',
      aiGuidance: 'Summarize the main findings in 3-5 bullet points'
    }
  ];
  
  // Set some metrics
  mappingResult.confidenceScore = 0.75;
  mappingResult.mappingCoverage = 85;
  mappingResult.completenessScore = 70;
  mappingResult.processingTimeMs = 1250;
  
  console.log(`   Created mapping result with:
   - ${mappingResult.schemaGaps.length} schema gaps
   - ${mappingResult.unmappedSections.length} unmapped sections
   - ${mappingResult.missingRequiredSections.length} missing required sections
   - Confidence: ${mappingResult.confidenceScore}
   - Coverage: ${mappingResult.mappingCoverage}%`);
  
  // Step 3: Create Schema Updater Engine (Phase 4)
  console.log('\n3. Creating Schema Updater Engine (Phase 4)...');
  const schemaUpdater = new SchemaUpdaterEngine(registry, {
    autoApplyUpdates: false, // Manual approval for demonstration
    requireApprovalFor: ['major', 'moderate'],
    maxActionsPerUpdate: 10,
    versionIncrementStrategy: 'auto',
    backupBeforeUpdate: true,
    validationThreshold: 0.6
  });
  
  // Add event listeners
  schemaUpdater.on('schemaUpdater:analysisStarted', (eventData: SchemaUpdaterEventData) => {
    console.log(`   Event: Analysis started for mapping result ${eventData.data.mappingResultId}`);
  });
  
  schemaUpdater.on('schemaUpdater:analysisComplete', (eventData: SchemaUpdaterEventData) => {
    console.log(`   Event: Analysis complete - generated ${eventData.data.totalActions} actions`);
  });
  
  schemaUpdater.on('schemaUpdater:updatesGenerated', (eventData: SchemaUpdaterEventData) => {
    console.log(`   Event: Updates generated - ${eventData.data.totalActions} actions ready`);
  });
  
  schemaUpdater.on('schemaUpdater:updateApplied', (eventData: SchemaUpdaterEventData) => {
    console.log(`   Event: Update applied - ${eventData.data.action.type} to ${eventData.data.action.target}`);
  });
  
  schemaUpdater.on('schemaUpdater:completed', (eventData: SchemaUpdaterEventData) => {
    console.log(`   Event: Update completed - applied ${eventData.data.summary.appliedActions} actions`);
  });
  
  // Step 4: Analyze the mapping result
  console.log('\n4. Analyzing mapping result and generating update actions...');
  const updateActions = await schemaUpdater.analyse(mappingResult);
  
  console.log(`   Generated ${updateActions.length} update actions:`);
  updateActions.forEach((action, index) => {
    console.log(`   ${index + 1}. ${action.type} -> ${action.target} (${action.priority}, confidence: ${action.confidence})`);
    console.log(`      Reason: ${action.reason}`);
  });
  
  // Step 5: Apply updates (with auto-apply disabled, this will show pending actions)
  console.log('\n5. Applying updates (auto-apply disabled)...');
  try {
    const updateSummary = await schemaUpdater.applyUpdates();
    
    console.log(`   Update Summary:
   - Total actions: ${updateSummary.totalActions}
   - Applied: ${updateSummary.appliedActions}
   - Pending: ${updateSummary.pendingActions}
   - Rejected: ${updateSummary.rejectedActions}
   - Updated report types: ${updateSummary.updatedReportTypes.length}
   - Updated sections: ${updateSummary.updatedSections.length}
   - Processing time: ${updateSummary.processingTimeMs}ms`);
    
  } catch (error) {
    console.log(`   Note: Updates not applied (auto-apply disabled): ${error instanceof Error ? error.message : String(error)}`);
    console.log('   This is expected since autoApplyUpdates is set to false');
  }
  
  // Step 6: Get engine statistics
  console.log('\n6. Engine Statistics:');
  const stats = schemaUpdater.getStatistics();
  console.log(`   - Total updates processed: ${stats.totalUpdatesProcessed}`);
  console.log(`   - Total actions generated: ${stats.totalActionsGenerated}`);
  console.log(`   - Total actions applied: ${stats.totalActionsApplied}`);
  console.log(`   - Success rate: ${stats.successRate.toFixed(1)}%`);
  
  // Step 7: Get update summary
  console.log('\n7. Current Update Summary:');
  const currentSummary = schemaUpdater.getUpdateSummary();
  console.log(`   - Total actions: ${currentSummary.totalActions}`);
  console.log(`   - Applied actions: ${currentSummary.appliedActions}`);
  console.log(`   - Pending actions: ${currentSummary.pendingActions}`);
  console.log(`   - Rejected actions: ${currentSummary.rejectedActions}`);
  
  // Step 8: Demonstrate configuration
  console.log('\n8. Engine Configuration:');
  const config = schemaUpdater.getConfig();
  console.log(`   - Auto-apply updates: ${config.autoApplyUpdates}`);
  console.log(`   - Max actions per update: ${config.maxActionsPerUpdate}`);
  console.log(`   - Validation threshold: ${config.validationThreshold}`);
  console.log(`   - Version increment strategy: ${config.versionIncrementStrategy}`);
  
  console.log('\n=== Integration Example Complete ===');
  console.log('\nKey Takeaways:');
  console.log('1. Schema Updater Engine successfully analyzes SchemaMappingResult');
  console.log('2. Generates appropriate update actions based on schema gaps');
  console.log('3. Prioritizes actions by severity and confidence');
  console.log('4. Integrates with Report Type Registry (Phase 1)');
  console.log('5. Provides comprehensive event system for monitoring');
  console.log('6. Supports configurable approval workflows');
  console.log('7. Includes versioning and storage capabilities');
}

// Run the example
runIntegrationExample().catch(error => {
  console.error('Error running integration example:', error);
  process.exit(1);
});