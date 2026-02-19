/**
 * Reasoning Validation Tests
 * 
 * Tests AI reasoning quality and inference capabilities.
 */

import { ReportIntelligenceSystem } from '../ReportIntelligenceSystem';

export async function runReasoningValidationTests(): Promise<{
  success: boolean;
  reasoningQuality: number;
  testResults: any[];
  errors: string[];
  durationMs: number;
}> {
  const startTime = Date.now();
  const testResults: any[] = [];
  const errors: string[] = [];
  
  try {
    console.log('Starting reasoning validation tests...');
    
    // Initialize the system
    const system = new ReportIntelligenceSystem();
    await system.initializeSubsystems();
    
    // Test cases for different reasoning scenarios
    const testCases = [
      {
        name: 'Risk Assessment Reasoning',
        content: `Tree Risk Assessment
        
        Tree: Large Oak near building
        Condition: Significant decay in main stem
        Location: 3 meters from residential property
        Target: Building and pedestrians
        
        Required reasoning:
        - Risk level calculation
        - Urgency determination
        - Mitigation recommendations`
      },
      {
        name: 'Compliance Reasoning',
        content: `Development Site Tree Report
        
        Planning Application: PA/2026/1234
        Site: Former industrial land
        Trees: 15 trees to be retained
        
        Reasoning needed:
        - BS5837 compliance analysis
        - Tree protection requirements
        - Method statement adequacy`
      },
      {
        name: 'Diagnostic Reasoning',
        content: `Tree Health Diagnosis
        
        Symptoms:
        - Leaf discoloration
        - Dieback in crown
        - Fungal fruiting bodies at base
        - Soil compaction around roots
        
        Reasoning tasks:
        - Disease identification
        - Cause analysis
        - Treatment recommendations`
      }
    ];
    
    let totalQuality = 0;
    let testsRun = 0;
    
    for (const testCase of testCases) {
      console.log(`\nTesting: ${testCase.name}`);
      
      try {
        // Run AI reasoning
        const reasoning = await system.runReasoning(testCase.content);
        
        const testResult = {
          testCase: testCase.name,
          success: true,
          insights: reasoning.insights?.length || 0,
          recommendations: reasoning.recommendations?.length || 0,
          confidence: reasoning.confidence || 0,
          quality: calculateReasoningQuality(reasoning),
          details: reasoning
        };
        
        testResults.push(testResult);
        totalQuality += testResult.quality;
        testsRun++;
        
        console.log(`  ✓ Reasoning successful: ${testResult.insights} insights, ${testResult.recommendations} recommendations (quality: ${testResult.quality.toFixed(2)})`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`Reasoning test failed for "${testCase.name}": ${errorMessage}`);
        testResults.push({
          testCase: testCase.name,
          success: false,
          error: errorMessage
        });
        console.error(`  ✗ Reasoning test failed: ${errorMessage}`);
      }
    }
    
    const durationMs = Date.now() - startTime;
    const reasoningQuality = testsRun > 0 ? totalQuality / testsRun : 0;
    const success = errors.length === 0 && reasoningQuality > 0.6; // Threshold of 60%
    
    console.log(`\nReasoning validation tests ${success ? 'PASSED' : 'FAILED'} in ${durationMs}ms`);
    console.log(`Average reasoning quality: ${reasoningQuality.toFixed(2)}`);
    console.log(`Tests run: ${testsRun}, Errors: ${errors.length}`);
    
    return {
      success,
      reasoningQuality,
      testResults,
      errors,
      durationMs
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Reasoning validation tests ERROR: ${errorMessage}`);
    return {
      success: false,
      reasoningQuality: 0,
      testResults,
      errors: [...errors, `Test execution failed: ${errorMessage}`],
      durationMs
    };
  }
}

function calculateReasoningQuality(reasoning: any): number {
  let quality = 0;
  
  // Score based on insights
  if (reasoning.insights && reasoning.insights.length > 0) {
    quality += Math.min(reasoning.insights.length / 5, 0.4); // Max 0.4 for insights
  }
  
  // Score based on recommendations
  if (reasoning.recommendations && reasoning.recommendations.length > 0) {
    quality += Math.min(reasoning.recommendations.length / 3, 0.4); // Max 0.4 for recommendations
  }
  
  // Score based on confidence
  if (reasoning.confidence) {
    quality += reasoning.confidence * 0.2; // Max 0.2 for confidence
  }
  
  return Math.min(quality, 1.0);
}

// Run test if executed directly
if (require.main === module) {
  runReasoningValidationTests().then(result => {
    if (result.success) {
      console.log('Reasoning validation tests passed');
      process.exit(0);
    } else {
      console.error('Reasoning validation tests failed');
      process.exit(1);
    }
  }).catch(error => {
    console.error('Test execution error:', error);
    process.exit(1);
  });
}