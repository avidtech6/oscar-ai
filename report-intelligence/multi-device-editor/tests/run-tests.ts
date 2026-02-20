/**
 * Test runner for Multi-Device Editor tests
 */

import { runUnifiedEditorTests } from './UnifiedEditor.test.js';

async function runAllTests() {
  console.log('🚀 Starting Multi-Device Editor Test Suite\n');
  
  try {
    // Run UnifiedEditor tests
    await runUnifiedEditorTests();
    
    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export { runAllTests };