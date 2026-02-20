/**
 * Simple test runner for Visual Rendering Engine tests
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('Running Visual Rendering Engine tests...\n');

try {
  // First compile TypeScript
  console.log('Compiling TypeScript...');
  execSync('npx tsc --outDir ./dist --module commonjs --target es2020 --skipLibCheck', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  
  // Run the tests
  console.log('\nRunning tests...');
  const testModule = require('./dist/tests/VisualRenderingEngine.test.js');
  
  testModule.runVisualRenderingEngineTests()
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
    
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}