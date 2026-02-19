/**
 * Full Pipeline Integration Test
 * 
 * Tests the complete end-to-end pipeline of the Report Intelligence System.
 */

import { ReportIntelligenceSystem } from '../ReportIntelligenceSystem';

export async function runFullPipelineTest(): Promise<{
  success: boolean;
  result?: any;
  error?: string;
  durationMs: number;
}> {
  const startTime = Date.now();
  
  try {
    console.log('Starting full pipeline integration test...');
    
    // Initialize the system
    const system = new ReportIntelligenceSystem();
    await system.initializeSubsystems();
    
    // Test report content
    const testReport = `Tree Assessment Report - Integration Test
===============================

Client: Test Client
Date: ${new Date().toISOString().split('T')[0]}
Location: Test Site

Executive Summary:
Tree T1 (Oak) shows significant decay in the main stem (approx. 40% loss of structural integrity).
The tree is located 5 meters from the main building and poses a moderate risk.

Findings:
1. Decay present in main stem
2. Cracks observed in major limbs
3. Root plate stability compromised

Recommendations:
1. Remove tree T1 within 30 days
2. Monitor surrounding trees (T2, T3) quarterly
3. Implement temporary safety fencing

Compliance Notes:
- BS5837:2012 compliance required
- Local authority notification needed`;

    // Run full pipeline
    console.log('Running full pipeline...');
    const result = await system.runFullPipeline(testReport, {
      enableReasoning: true,
      enableWorkflowLearning: true,
      enableSelfHealing: true,
      enableComplianceValidation: true,
      enableReproductionTesting: true,
      skipTemplateGeneration: true, // Skip if template generator not available
      verbose: true
    });

    const durationMs = Date.now() - startTime;
    
    if (result.success) {
      console.log(`Full pipeline test PASSED in ${durationMs}ms`);
      console.log(`Steps completed: ${Object.keys(result.steps).length}`);
      
      // Validate key results
      const validation = validatePipelineResult(result);
      if (!validation.valid) {
        console.warn('Pipeline result validation warnings:', validation.warnings);
      }
      
      return {
        success: true,
        result,
        durationMs
      };
    } else {
      console.error(`Full pipeline test FAILED: ${result.error}`);
      return {
        success: false,
        error: result.error,
        durationMs
      };
    }
  } catch (error) {
    const durationMs = Date.now() - startTime;
    console.error(`Full pipeline test ERROR: ${error}`);
    return {
      success: false,
      error: `Test failed: ${error}`,
      durationMs
    };
  }
}

function validatePipelineResult(result: any): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  // Check required steps
  const requiredSteps = ['decompilation', 'classification', 'mapping'];
  for (const step of requiredSteps) {
    if (!result.steps[step]) {
      warnings.push(`Missing required step: ${step}`);
    }
  }
  
  // Check classification result
  if (result.steps.classification) {
    if (!result.steps.classification.reportTypeId) {
      warnings.push('Classification missing reportTypeId');
    }
    if (!result.steps.classification.confidence) {
      warnings.push('Classification missing confidence score');
    }
  }
  
  // Check mapping result
  if (result.steps.mapping) {
    if (!result.steps.mapping.mappedSections || result.steps.mapping.mappedSections.length === 0) {
      warnings.push('Mapping produced no mapped sections');
    }
  }
  
  return {
    valid: warnings.length === 0,
    warnings
  };
}

// Run test if executed directly
if (require.main === module) {
  runFullPipelineTest().then(result => {
    if (result.success) {
      console.log('Test completed successfully');
      process.exit(0);
    } else {
      console.error('Test failed:', result.error);
      process.exit(1);
    }
  }).catch(error => {
    console.error('Test execution error:', error);
    process.exit(1);
  });
}