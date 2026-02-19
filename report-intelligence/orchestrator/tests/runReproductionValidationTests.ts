/**
 * Reproduction Validation Tests
 * 
 * Tests report reproduction accuracy and consistency.
 */

import { ReportIntelligenceSystem } from '../ReportIntelligenceSystem';

export async function runReproductionValidationTests(): Promise<{
  success: boolean;
  consistencyScore: number;
  testResults: any[];
  errors: string[];
  durationMs: number;
}> {
  const startTime = Date.now();
  const testResults: any[] = [];
  const errors: string[] = [];
  
  try {
    console.log('Starting reproduction validation tests...');
    
    // Initialize the system
    const system = new ReportIntelligenceSystem();
    await system.initializeSubsystems();
    
    // Test cases with different report types
    const testCases = [
      {
        name: 'Simple Tree Assessment',
        content: `Tree Assessment Report
        
        Tree T1 shows decay. Remove within 30 days.`
      },
      {
        name: 'Detailed Safety Report',
        content: `Safety Assessment Report
        
        Executive Summary:
        The site presents multiple safety hazards requiring immediate attention.
        
        Findings:
        1. Unstable tree near building
        2. Damaged fencing
        3. Poor visibility
        
        Recommendations:
        1. Remove hazardous tree
        2. Repair fencing
        3. Install warning signs`
      },
      {
        name: 'Compliance-Focused Report',
        content: `BS5837:2012 Compliance Report
        
        Client: Test Client
        Date: 2026-02-19
        
        Assessment:
        Tree works required for development compliance.
        
        Requirements:
        - Tree protection plan needed
        - Arboricultural method statement required
        - Monitoring during construction`
      }
    ];
    
    let totalConsistency = 0;
    let testsRun = 0;
    
    for (const testCase of testCases) {
      console.log(`\nTesting: ${testCase.name}`);
      
      try {
        // Run reproduction test
        const reproduction = await system.runReproductionTest(testCase.content);
        
        const testResult = {
          testCase: testCase.name,
          success: true,
          consistent: reproduction.consistent || false,
          score: reproduction.score || 0,
          details: reproduction
        };
        
        testResults.push(testResult);
        totalConsistency += testResult.score;
        testsRun++;
        
        console.log(`  ✓ Reproduction test: ${testResult.consistent ? 'CONSISTENT' : 'INCONSISTENT'} (score: ${testResult.score.toFixed(2)})`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`Reproduction test failed for "${testCase.name}": ${errorMessage}`);
        testResults.push({
          testCase: testCase.name,
          success: false,
          error: errorMessage
        });
        console.error(`  ✗ Reproduction test failed: ${errorMessage}`);
      }
    }
    
    const durationMs = Date.now() - startTime;
    const consistencyScore = testsRun > 0 ? totalConsistency / testsRun : 0;
    const success = errors.length === 0 && consistencyScore > 0.7; // Threshold of 70%
    
    console.log(`\nReproduction validation tests ${success ? 'PASSED' : 'FAILED'} in ${durationMs}ms`);
    console.log(`Average consistency score: ${consistencyScore.toFixed(2)}`);
    console.log(`Tests run: ${testsRun}, Errors: ${errors.length}`);
    
    return {
      success,
      consistencyScore,
      testResults,
      errors,
      durationMs
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    console.error(`Reproduction validation tests ERROR: ${error}`);
    return {
      success: false,
      consistencyScore: 0,
      testResults,
      errors: [...errors, `Test execution failed: ${error}`],
      durationMs
    };
  }
}

// Run test if executed directly
if (require.main === module) {
  runReproductionValidationTests().then(result => {
    if (result.success) {
      console.log('Reproduction validation tests passed');
      process.exit(0);
    } else {
      console.error('Reproduction validation tests failed');
      process.exit(1);
    }
  }).catch(error => {
    console.error('Test execution error:', error);
    process.exit(1);
  });
}