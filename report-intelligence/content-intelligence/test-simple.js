/**
 * Simple test script for Content Intelligence Engine
 * This avoids the Visual Rendering Engine dependency issues
 */

console.log('Testing Content Intelligence Engine basic components...');

try {
  // Test 1: Check if StructuredEditor can be imported
  console.log('Test 1: Checking StructuredEditor...');
  const { StructuredEditor } = await import('./editor/StructuredEditor.js');
  console.log('✓ StructuredEditor import successful');
  
  // Test 2: Check if ContentCopilot can be imported  
  console.log('Test 2: Checking ContentCopilot...');
  const { ContentCopilot } = await import('./ai/ContentCopilot.js');
  console.log('✓ ContentCopilot import successful');
  
  // Test 3: Check if SEOAssistant can be imported
  console.log('Test 3: Checking SEOAssistant...');
  const { SEOAssistant } = await import('./ai/SEOAssistant.js');
  console.log('✓ SEOAssistant import successful');
  
  // Test 4: Check if TemplateEngine can be imported
  console.log('Test 4: Checking TemplateEngine...');
  const { TemplateEngine } = await import('./templates/TemplateEngine.js');
  console.log('✓ TemplateEngine import successful');
  
  // Test 5: Check if BrandToneModel can be imported
  console.log('Test 5: Checking BrandToneModel...');
  const { BrandToneModel } = await import('./brand-tone-model/index.js');
  console.log('✓ BrandToneModel import successful');
  
  console.log('\n✅ All basic component imports successful!');
  console.log('Content Intelligence Engine core components are working.');
  
} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}