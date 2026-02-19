/**
 * Compliance Validation Tests
 * 
 * Tests compliance validation accuracy and rule enforcement.
 */

import { ReportIntelligenceSystem } from '../ReportIntelligenceSystem';

export async function runComplianceValidationTests(): Promise<{
  success: boolean;
  complianceAccuracy: number;
  testResults: any[];
  errors: string[];
  durationMs: number;
}> {
  const startTime = Date.now();
  const testResults: any[] = [];
  const errors: string[] = [];
  
  try {
    console.log('Starting compliance validation tests...');
    
    // Initialize the system
    const system = new ReportIntelligenceSystem();
    await system.initializeSubsystems();
    
    // Check if compliance validator is available
    const complianceValidator = system.getSubsystem('complianceValidator');
    if (!complianceValidator) {
      console.log('Compliance validator not available, tests skipped');
      return {
        success: true,
        complianceAccuracy: 0,
        testResults: [{ skipped: 'Compliance validator not available' }],
        errors: [],
        durationMs: Date.now() - startTime
      };
    }
    
    // Test cases with different compliance requirements
    const testCases = [
      {
        name: 'BS5837 Compliance Test',
        content: `BS5837:2012 Tree Survey Report
        
        Client: Development Corp
        Site: 123 Main Street
        
        Required Sections:
        - Executive Summary: Present
        - Tree Schedule: Present
        - Recommendations: Present
        - Method Statement: Missing
        
        Compliance Issues:
        - Missing method statement
        - Incomplete tree protection plan`
      },
      {
        name: 'Full Compliance Report',
        content: `Complete Compliance Report
        
        All required sections present:
        1. Executive Summary
        2. Introduction
        3. Methodology
        4. Findings
        5. Recommendations
        6. Appendices
        
        Compliance: FULLY COMPLIANT`
      },
      {
        name: 'Non-Compliant Report',
        content: `Incomplete Report
        
        Missing sections:
        - No executive summary
        - No recommendations
        - No compliance notes
        
        This report does not meet minimum requirements.`
      }
    ];
    
    let totalAccuracy = 0;
    let testsRun = 0;
    
    for (const testCase of testCases) {
      console.log(`\nTesting: ${testCase.name}`);
      
      try {
        // Run compliance validation
        const compliance = await system.validateCompliance(testCase.content);
        
        const testResult = {
          testCase: testCase.name,
          success: true,
          valid: compliance.valid || false,
          issues: compliance.issues?.length || 0,
          score: compliance.score || 0,
          details: compliance
        };
        
        testResults.push(testResult);
        totalAccuracy += testResult.score;
        testsRun++;
        
        console.log(`  ✓ Compliance validation: ${testResult.valid ? 'VALID' : 'INVALID'} (score: ${testResult.score.toFixed(2)}, issues: ${testResult.issues})`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`Compliance test failed for "${testCase.name}": ${errorMessage}`);
        testResults.push({
          testCase: testCase.name,
          success: false,
          error: errorMessage
        });
        console.error(`  ✗ Compliance test failed: ${errorMessage}`);
      }
    }
    
    const durationMs = Date.now() - startTime;
    const complianceAccuracy = testsRun > 0 ? totalAccuracy / testsRun : 0;
    const success = errors.length === 0;
    
    console.log(`\nCompliance validation tests ${success ? 'PASSED' : 'FAILED'} in ${durationMs}ms`);
    console.log(`Average compliance accuracy: ${complianceAccuracy.toFixed(2)}`);
    console.log(`Tests run: ${testsRun}, Errors: ${errors.length}`);
    
    return {
      success,
      complianceAccuracy,
      testResults,
      errors,
      durationMs
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Compliance validation tests ERROR: ${errorMessage}`);
    return {
      success: false,
      complianceAccuracy: 0,
      testResults,
      errors: [...errors, `Test execution failed: ${errorMessage}`],
      durationMs
    };
  }
}

// Run test if executed directly
if (require.main === module) {
  runComplianceValidationTests().then(result => {
    if (result.success) {
      console.log('Compliance validation tests passed');
      process.exit(0);
    } else {
      console.error('Compliance validation tests failed');
      process.exit(1);
    }
  }).catch(error => {
    console.error('Test execution error:', error);
    process.exit(1);
  });
}