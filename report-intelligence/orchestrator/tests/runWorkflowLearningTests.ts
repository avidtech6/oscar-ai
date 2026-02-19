/**
 * Workflow Learning Tests
 * 
 * Tests user workflow learning and pattern detection capabilities.
 */

import { ReportIntelligenceSystem } from '../ReportIntelligenceSystem';

export async function runWorkflowLearningTests(): Promise<{
  success: boolean;
  learningQuality: number;
  testResults: any[];
  errors: string[];
  durationMs: number;
}> {
  const startTime = Date.now();
  const testResults: any[] = [];
  const errors: string[] = [];
  
  try {
    console.log('Starting workflow learning tests...');
    
    // Initialize the system
    const system = new ReportIntelligenceSystem();
    await system.initializeSubsystems();
    
    // Test cases for different workflow scenarios
    const testCases = [
      {
        name: 'Standard Report Workflow',
        userId: 'user-001',
        content: `Standard Tree Report
        
        Following typical workflow:
        1. Executive Summary
        2. Introduction
        3. Methodology
        4. Findings
        5. Recommendations
        6. Appendices`
      },
      {
        name: 'Quick Assessment Workflow',
        userId: 'user-002',
        content: `Quick Assessment
        
        Abbreviated workflow:
        1. Observations
        2. Recommendations
        3. Urgency rating
        
        Used for rapid site assessments.`
      },
      {
        name: 'Compliance-Focused Workflow',
        userId: 'user-003',
        content: `Compliance Report
        
        Compliance-driven workflow:
        1. Regulatory context
        2. Compliance checklist
        3. Gap analysis
        4. Action plan
        5. Documentation
        
        Focus on regulatory requirements.`
      }
    ];
    
    let totalQuality = 0;
    let testsRun = 0;
    
    for (const testCase of testCases) {
      console.log(`\nTesting: ${testCase.name} (User: ${testCase.userId})`);
      
      try {
        // Run workflow learning
        const workflow = await system.runWorkflowLearning(testCase.content, testCase.userId);
        
        const testResult = {
          testCase: testCase.name,
          userId: testCase.userId,
          success: true,
          patterns: workflow.patterns?.length || 0,
          predictions: workflow.predictions?.length || 0,
          confidence: workflow.confidence || 0,
          quality: calculateWorkflowQuality(workflow),
          details: workflow
        };
        
        testResults.push(testResult);
        totalQuality += testResult.quality;
        testsRun++;
        
        console.log(`  ✓ Workflow learning successful: ${testResult.patterns} patterns, ${testResult.predictions} predictions (quality: ${testResult.quality.toFixed(2)})`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`Workflow learning test failed for "${testCase.name}": ${errorMessage}`);
        testResults.push({
          testCase: testCase.name,
          userId: testCase.userId,
          success: false,
          error: errorMessage
        });
        console.error(`  ✗ Workflow learning test failed: ${errorMessage}`);
      }
    }
    
    // Test pattern evolution with multiple interactions
    console.log('\nTesting pattern evolution...');
    try {
      const userId = 'test-user-evolution';
      const contents = [
        'First report with standard structure',
        'Second report with similar structure',
        'Third report showing pattern consistency'
      ];
      
      let evolutionResults = [];
      for (let i = 0; i < contents.length; i++) {
        const workflow = await system.runWorkflowLearning(contents[i], userId);
        evolutionResults.push({
          iteration: i + 1,
          patterns: workflow.patterns?.length || 0,
          confidence: workflow.confidence || 0
        });
      }
      
      // Check if confidence increases with more data
      const confidenceImprovement = evolutionResults.length > 1 
        ? evolutionResults[evolutionResults.length - 1].confidence - evolutionResults[0].confidence
        : 0;
      
      testResults.push({
        testCase: 'Pattern Evolution',
        success: true,
        evolutionResults,
        confidenceImprovement,
        quality: Math.min(0.5 + confidenceImprovement * 2, 1.0)
      });
      
      console.log(`  ✓ Pattern evolution test: ${evolutionResults.length} iterations, confidence improvement: ${confidenceImprovement.toFixed(2)}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`Pattern evolution test failed: ${errorMessage}`);
      console.error(`  ✗ Pattern evolution test failed: ${errorMessage}`);
    }
    
    const durationMs = Date.now() - startTime;
    const learningQuality = testsRun > 0 ? totalQuality / testsRun : 0;
    const success = errors.length === 0 && learningQuality > 0.5; // Threshold of 50%
    
    console.log(`\nWorkflow learning tests ${success ? 'PASSED' : 'FAILED'} in ${durationMs}ms`);
    console.log(`Average learning quality: ${learningQuality.toFixed(2)}`);
    console.log(`Tests run: ${testsRun}, Errors: ${errors.length}`);
    
    return {
      success,
      learningQuality,
      testResults,
      errors,
      durationMs
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Workflow learning tests ERROR: ${errorMessage}`);
    return {
      success: false,
      learningQuality: 0,
      testResults,
      errors: [...errors, `Test execution failed: ${errorMessage}`],
      durationMs
    };
  }
}

function calculateWorkflowQuality(workflow: any): number {
  let quality = 0;
  
  // Score based on patterns detected
  if (workflow.patterns && workflow.patterns.length > 0) {
    quality += Math.min(workflow.patterns.length / 3, 0.4); // Max 0.4 for patterns
  }
  
  // Score based on predictions
  if (workflow.predictions && workflow.predictions.length > 0) {
    quality += Math.min(workflow.predictions.length / 2, 0.4); // Max 0.4 for predictions
  }
  
  // Score based on confidence
  if (workflow.confidence) {
    quality += workflow.confidence * 0.2; // Max 0.2 for confidence
  }
  
  return Math.min(quality, 1.0);
}

// Run test if executed directly
if (require.main === module) {
  runWorkflowLearningTests().then(result => {
    if (result.success) {
      console.log('Workflow learning tests passed');
      process.exit(0);
    } else {
      console.error('Workflow learning tests failed');
      process.exit(1);
    }
  }).catch(error => {
    console.error('Test execution error:', error);
    process.exit(1);
  });
}