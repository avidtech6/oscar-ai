/**
 * Simple test to check if Visual Rendering Engine works
 */

console.log('Testing Visual Rendering Engine...\n');

// Create a simple test document
const testDocument = {
  title: 'Test Document',
  sections: [
    {
      id: 'section_1',
      type: 'section',
      title: 'Introduction',
      content: [
        {
          id: 'para_1',
          type: 'paragraph',
          content: 'This is a test paragraph for the Visual Rendering Engine.'
        }
      ]
    }
  ],
  author: 'Test Author',
  date: new Date(),
  metadata: {}
};

// Create default options
const defaultOptions = {
  layout: {
    size: 'A4',
    orientation: 'portrait',
    margins: { top: 25, right: 20, bottom: 25, left: 20 }
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 11,
    lineHeight: 1.5,
    fontWeight: 'normal',
    fontColor: '#000000',
    headingFontFamily: 'Arial, sans-serif',
    headingFontSizeMultiplier: 1.2
  },
  spacing: {
    paragraphSpacing: 12,
    sectionSpacing: 24,
    indentSize: 36,
    listItemSpacing: 6
  },
  colors: {
    primary: '#2f5233',
    secondary: '#6b7280',
    accent: '#059669',
    background: '#ffffff',
    text: '#000000',
    headings: '#2f5233',
    borders: '#e5e7eb'
  },
  header: {
    enabled: true,
    height: 15,
    showOnFirstPage: true,
    showPageNumbers: true
  },
  footer: {
    enabled: true,
    height: 15,
    showOnFirstPage: true,
    showPageNumbers: true
  },
  coverPage: {
    enabled: true,
    includeLogo: true,
    includeTitle: true,
    includeSubtitle: true,
    includeMetadata: true,
    includeDate: true
  },
  images: {
    maxWidth: 800,
    maxHeight: 600,
    quality: 85,
    format: 'original',
    embedMethod: 'base64',
    lazyLoading: true
  },
  pageBreaks: {
    automatic: true,
    avoidWidowOrphan: true,
    minLinesBeforeBreak: 3,
    minLinesAfterBreak: 3,
    breakBeforeSections: [],
    breakAfterSections: []
  },
  pdf: {
    quality: 'standard',
    includeHyperlinks: true,
    includeBookmarks: true,
    compress: true
  },
  preview: {
    interactive: true,
    zoomLevel: 1.0,
    showRulers: false,
    showGrid: false,
    showMargins: true,
    autoRefresh: true
  },
  snapshot: {
    format: 'png',
    quality: 90,
    scale: 1,
    includeBackground: true,
    captureDelay: 100
  },
  responsive: true,
  accessibility: true,
  language: 'en',
  timezone: 'UTC',
  title: 'Test Document',
  author: 'Test Author',
  creator: 'Test Creator',
  creationDate: new Date()
};

try {
  // Try to import the engine
  console.log('1. Checking if engine can be imported...');
  const { VisualRenderingEngine } = require('./engines/VisualRenderingEngine.ts');
  console.log('   ✓ Engine imported successfully');
  
  console.log('\n2. Creating engine instance...');
  const engine = new VisualRenderingEngine(defaultOptions);
  console.log('   ✓ Engine created successfully');
  
  console.log('\n3. Testing configuration methods...');
  const config = engine.getConfig();
  console.log('   ✓ getConfig() works:', config.enablePreview ? 'Preview enabled' : 'Preview disabled');
  
  const stats = engine.getStatistics();
  console.log('   ✓ getStatistics() works:', stats.totalJobs === 0 ? 'No jobs yet' : 'Jobs exist');
  
  const cacheStats = engine.getCacheStats();
  console.log('   ✓ getCacheStats() works: size =', cacheStats.size);
  
  console.log('\n4. Testing component access...');
  const snapshotSystem = engine.getSnapshotSystem();
  console.log('   ✓ getSnapshotSystem() works:', snapshotSystem ? 'Snapshot system available' : 'No snapshot system');
  
  const previewWindow = engine.getPreviewWindow();
  console.log('   ✓ getPreviewWindow() works:', previewWindow ? 'Preview window available' : 'No preview window (may be disabled)');
  
  console.log('\n5. Testing cache management...');
  engine.clearCache();
  console.log('   ✓ clearCache() works');
  
  console.log('\n6. Testing reset functionality...');
  engine.reset();
  console.log('   ✓ reset() works');
  
  console.log('\n=== All basic tests passed! ===');
  console.log('\nThe Visual Rendering Engine appears to be working correctly.');
  console.log('Note: Full rendering tests would require all component implementations.');
  
} catch (error) {
  console.error('\n=== Test failed ===');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}