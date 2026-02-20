/**
 * Simple test runner for Visual Rendering Engine tests
 * Runs tests directly without compilation
 */

console.log('Running Visual Rendering Engine tests...\n');

// Import the test module using dynamic import (ES module)
import('./VisualRenderingEngine.test.ts')
  .then(module => {
    return module.runVisualRenderingEngineTests();
  })
  .then(result => {
    console.log('\n=== Test Results ===');
    console.log(`Passed: ${result.passed}`);
    console.log(`Failed: ${result.failed}`);
    console.log(`Total: ${result.tests.length}`);
    
    if (result.failed > 0) {
      console.log('\nFailed tests:');
      result.tests.filter(t => !t.passed).forEach(test => {
        console.log(`  - ${test.name}: ${test.error}`);
      });
      process.exit(1);
    } else {
      console.log('\nAll tests passed!');
      process.exit(0);
    }
  })
  .catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
  });