/**
 * Subsystem Interaction Tests
 * 
 * Tests interactions between different subsystems of the Report Intelligence System.
 */

import { ReportIntelligenceSystem } from '../ReportIntelligenceSystem';

export async function runSubsystemInteractionTests(): Promise<{
  success: boolean;
  results: Record<string, any>;
  errors: string[];
  durationMs: number;
}> {
  const startTime = Date.now();
  const results: Record<string, any> = {};
  const errors: string[] = [];
  
  try {
    console.log('Starting subsystem interaction tests...');
    
    // Initialize the system
    const system = new ReportIntelligenceSystem();
    await system.initializeSubsystems();
    
    // Test 1: Decompiler -> Classification interaction
    console.log('Test 1: Decompiler -> Classification interaction');
    try {
      const testContent = 'Test report for classification';
      const classification = await system.classifyReport(testContent);
      results.decompilerClassification = {
        success: true,
        reportTypeId: classification.reportTypeId,
        confidence: classification.confidence
      };
      console.log(`  ✓ Classification successful: ${classification.reportTypeId} (confidence: ${classification.confidence})`);
    } catch (error) {
      errors.push(`Decompiler->Classification failed: ${error}`);
      results.decompilerClassification = { success: false, error };
      console.error(`  ✗ Decompiler->Classification failed: ${error}`);
    }
    
    // Test 2: Classification -> Schema Mapper interaction
    console.log('Test 2: Classification -> Schema Mapper interaction');
    try {
      const testContent = 'Test report for schema mapping';
      const mapping = await system.mapSchema(testContent);
      results.classificationMapping = {
        success: true,
        mappedSections: mapping.mappedSections?.length || 0,
        confidence: mapping.confidence
      };
      console.log(`  ✓ Schema mapping successful: ${results.classificationMapping.mappedSections} sections mapped`);
    } catch (error) {
      errors.push(`Classification->Mapping failed: ${error}`);
      results.classificationMapping = { success: false, error };
      console.error(`  ✗ Classification->Mapping failed: ${error}`);
    }
    
    // Test 3: Schema Mapper -> Schema Updater interaction
    console.log('Test 3: Schema Mapper -> Schema Updater interaction');
    try {
      // First get a mapping result
      const testContent = 'Test report for schema updates';
      const mapping = await system.mapSchema(testContent);
      
      // Then test schema updates
      const updateResult = await system.updateSchemaIfNeeded(mapping, mapping.reportTypeId || 'unknown');
      results.mapperUpdater = {
        success: true,
        actions: updateResult.actions?.length || 0,
        needsUpdate: updateResult.actions && updateResult.actions.length > 0
      };
      console.log(`  ✓ Schema update check successful: ${results.mapperUpdater.actions} update actions`);
    } catch (error) {
      errors.push(`Mapper->Updater failed: ${error}`);
      results.mapperUpdater = { success: false, error };
      console.error(`  ✗ Mapper->Updater failed: ${error}`);
    }
    
    // Test 4: Decompiler -> Compliance Validator interaction
    console.log('Test 4: Decompiler -> Compliance Validator interaction');
    try {
      const complianceValidator = system.getSubsystem('complianceValidator');
      if (complianceValidator) {
        const testContent = 'Test report for compliance validation';
        const compliance = await system.validateCompliance(testContent);
        results.decompilerCompliance = {
          success: true,
          valid: compliance.valid,
          issues: compliance.issues?.length || 0
        };
        console.log(`  ✓ Compliance validation successful: ${compliance.valid ? 'VALID' : 'INVALID'} (${results.decompilerCompliance.issues} issues)`);
      } else {
        results.decompilerCompliance = { success: true, skipped: 'Compliance validator not available' };
        console.log('  ⚠ Compliance validator not available, test skipped');
      }
    } catch (error) {
      errors.push(`Decompiler->Compliance failed: ${error}`);
      results.decompilerCompliance = { success: false, error };
      console.error(`  ✗ Decompiler->Compliance failed: ${error}`);
    }
    
    // Test 5: Decompiler -> AI Reasoning interaction
    console.log('Test 5: Decompiler -> AI Reasoning interaction');
    try {
      const testContent = 'Test report for AI reasoning';
      const reasoning = await system.runReasoning(testContent);
      results.decompilerReasoning = {
        success: true,
        insights: reasoning.insights?.length || 0,
        recommendations: reasoning.recommendations?.length || 0
      };
      console.log(`  ✓ AI reasoning successful: ${results.decompilerReasoning.insights} insights, ${results.decompilerReasoning.recommendations} recommendations`);
    } catch (error) {
      errors.push(`Decompiler->Reasoning failed: ${error}`);
      results.decompilerReasoning = { success: false, error };
      console.error(`  ✗ Decompiler->Reasoning failed: ${error}`);
    }
    
    // Test 6: Decompiler -> Workflow Learning interaction
    console.log('Test 6: Decompiler -> Workflow Learning interaction');
    try {
      const testContent = 'Test report for workflow learning';
      const workflow = await system.runWorkflowLearning(testContent, 'test-user');
      results.decompilerWorkflow = {
        success: true,
        patterns: workflow.patterns?.length || 0,
        predictions: workflow.predictions?.length || 0
      };
      console.log(`  ✓ Workflow learning successful: ${results.decompilerWorkflow.patterns} patterns, ${results.decompilerWorkflow.predictions} predictions`);
    } catch (error) {
      errors.push(`Decompiler->Workflow failed: ${error}`);
      results.decompilerWorkflow = { success: false, error };
      console.error(`  ✗ Decompiler->Workflow failed: ${error}`);
    }
    
    // Test 7: Decompiler -> Self-Healing interaction
    console.log('Test 7: Decompiler -> Self-Healing interaction');
    try {
      const testContent = 'Test report for self-healing';
      const healing = await system.runSelfHealing(testContent);
      results.decompilerHealing = {
        success: true,
        healingApplied: healing.healingApplied || false,
        actions: healing.actions?.length || 0
      };
      console.log(`  ✓ Self-healing successful: ${results.decompilerHealing.healingApplied ? 'HEALING APPLIED' : 'No healing needed'} (${results.decompilerHealing.actions} actions)`);
    } catch (error) {
      errors.push(`Decompiler->Healing failed: ${error}`);
      results.decompilerHealing = { success: false, error };
      console.error(`  ✗ Decompiler->Healing failed: ${error}`);
    }
    
    // Test 8: Decompiler -> Reproduction Tester interaction
    console.log('Test 8: Decompiler -> Reproduction Tester interaction');
    try {
      const testContent = 'Test report for reproduction testing';
      const reproduction = await system.runReproductionTest(testContent);
      results.decompilerReproduction = {
        success: true,
        consistent: reproduction.consistent || false,
        score: reproduction.score || 0
      };
      console.log(`  ✓ Reproduction testing successful: ${results.decompilerReproduction.consistent ? 'CONSISTENT' : 'INCONSISTENT'} (score: ${results.decompilerReproduction.score})`);
    } catch (error) {
      errors.push(`Decompiler->Reproduction failed: ${error}`);
      results.decompilerReproduction = { success: false, error };
      console.error(`  ✗ Decompiler->Reproduction failed: ${error}`);
    }
    
    // Test 9: Template Generator interaction (if available)
    console.log('Test 9: Template Generator interaction');
    try {
      const templateGenerator = system.getSubsystem('templateGenerator');
      if (templateGenerator) {
        // First get a classification and mapping
        const testContent = 'Test report for template generation';
        const classification = await system.classifyReport(testContent);
        const mapping = await system.mapSchema(testContent);
        
        const template = await system.generateTemplate(classification.reportTypeId, mapping);
        results.templateGeneration = {
          success: true,
          templateGenerated: !!template,
          sections: template.sections?.length || 0
        };
        console.log(`  ✓ Template generation successful: ${results.templateGeneration.sections} sections`);
      } else {
        results.templateGeneration = { success: true, skipped: 'Template generator not available' };
        console.log('  ⚠ Template generator not available, test skipped');
      }
    } catch (error) {
      errors.push(`Template generation failed: ${error}`);
      results.templateGeneration = { success: false, error };
      console.error(`  ✗ Template generation failed: ${error}`);
    }
    
    // Test 10: Style Learner interaction
    console.log('Test 10: Style Learner interaction');
    try {
      const testContent = 'Test report for style learning';
      const style = await system.applyStyle(testContent);
      results.styleLearning = {
        success: true,
        applied: style.applied || false,
        confidence: style.confidence || 0
      };
      console.log(`  ✓ Style learning successful: ${results.styleLearning.applied ? 'STYLE APPLIED' : 'No style applied'} (confidence: ${results.styleLearning.confidence})`);
    } catch (error) {
      errors.push(`Style learning failed: ${error}`);
      results.styleLearning = { success: false, error };
      console.error(`  ✗ Style learning failed: ${error}`);
    }
    
    const durationMs = Date.now() - startTime;
    const success = errors.length === 0;
    
    console.log(`\nSubsystem interaction tests ${success ? 'PASSED' : 'FAILED'} in ${durationMs}ms`);
    console.log(`Tests run: ${Object.keys(results).length}, Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.error('\nErrors:');
      errors.forEach((error, index) => console.error(`  ${index + 1}. ${error}`));
    }
    
    return {
      success,
      results,
      errors,
      durationMs
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    console.error(`Subsystem interaction tests ERROR: ${error}`);
    return {
      success: false,
      results,
      errors: [...errors, `Test execution failed: ${error}`],
      durationMs
    };
  }
}

// Run test if executed directly
if (require.main === module) {
  runSubsystemInteractionTests().then(result => {
    if (result.success) {
      console.log('All subsystem interaction tests passed');
      process.exit(0);
    } else {
      console.error('Some subsystem interaction tests failed');
      process.exit(1);
    }
  }).catch(error => {
    console.error('Test execution error:', error);
    process.exit(1);
  });
}