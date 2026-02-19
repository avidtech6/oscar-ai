/**
 * Simple test runner for PDF parsing components
 * 
 * This can be run with: node report-intelligence/pdf-parsing/tests/run-tests.js
 */

import { PDFParser } from '../PDFParser.js';
import { PDFTextExtractor } from '../PDFTextExtractor.js';
import { PDFImageExtractor } from '../PDFImageExtractor.js';
import { PDFLayoutExtractor } from '../PDFLayoutExtractor.js';
import { PDFFontExtractor } from '../PDFFontExtractor.js';
import { PDFStructureRebuilder } from '../PDFStructureRebuilder.js';

import { DEFAULT_PDF_PARSING_OPTIONS } from '../types/index.js';

class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('Running PDF Parser Tests...\n');
    
    for (const test of this.tests) {
      try {
        await test.fn();
        console.log(`✓ ${test.name}`);
        this.passed++;
      } catch (error) {
        console.log(`✗ ${test.name}`);
        console.log(`  Error: ${error.message}`);
        if (error.stack) {
          console.log(`  Stack: ${error.stack.split('\n')[1]}`);
        }
        this.failed++;
      }
    }
    
    console.log(`\nResults: ${this.passed} passed, ${this.failed} failed`);
    return this.failed === 0;
  }
}

async function runAllTests() {
  const runner = new TestRunner();
  
  // PDFParser tests
  runner.test('PDFParser should initialize', async () => {
    const parser = new PDFParser();
    await parser.initialize();
    await parser.cleanup();
  });
  
  runner.test('PDFParser should parse simulated PDF', async () => {
    const parser = new PDFParser();
    await parser.initialize();
    
    const pdfBuffer = Buffer.from('%PDF-1.4\nSimulated PDF content');
    const result = await parser.parseFromBuffer(pdfBuffer, 'test.pdf');
    
    if (!result.success) {
      throw new Error('Expected successful parsing');
    }
    
    if (!Array.isArray(result.pages)) {
      throw new Error('Expected pages array');
    }
    
    await parser.cleanup();
  });
  
  runner.test('PDFParser should update options', () => {
    const parser = new PDFParser();
    const newOptions = {
      extractText: false,
      extractImages: false,
      maxPages: 5,
    };
    
    parser.updateOptions(newOptions);
    const options = parser.getOptions();
    
    if (options.extractText !== false) {
      throw new Error('Expected extractText to be false');
    }
    
    if (options.extractImages !== false) {
      throw new Error('Expected extractImages to be false');
    }
    
    if (options.maxPages !== 5) {
      throw new Error('Expected maxPages to be 5');
    }
  });
  
  // PDFTextExtractor tests
  runner.test('PDFTextExtractor should initialize', async () => {
    const extractor = new PDFTextExtractor(DEFAULT_PDF_PARSING_OPTIONS);
    await extractor.initialize();
    await extractor.cleanup();
  });
  
  runner.test('PDFTextExtractor should extract text', async () => {
    const extractor = new PDFTextExtractor(DEFAULT_PDF_PARSING_OPTIONS);
    await extractor.initialize();
    
    const pdfBuffer = Buffer.from('Simulated PDF');
    const text = await extractor.extractText(pdfBuffer, 1);
    
    if (!Array.isArray(text)) {
      throw new Error('Expected text array');
    }
    
    await extractor.cleanup();
  });
  
  // PDFImageExtractor tests
  runner.test('PDFImageExtractor should initialize', async () => {
    const extractor = new PDFImageExtractor(DEFAULT_PDF_PARSING_OPTIONS);
    await extractor.initialize();
    await extractor.cleanup();
  });
  
  // PDFLayoutExtractor tests
  runner.test('PDFLayoutExtractor should initialize', async () => {
    const extractor = new PDFLayoutExtractor(DEFAULT_PDF_PARSING_OPTIONS);
    await extractor.initialize();
    await extractor.cleanup();
  });
  
  // PDFFontExtractor tests
  runner.test('PDFFontExtractor should initialize', async () => {
    const extractor = new PDFFontExtractor(DEFAULT_PDF_PARSING_OPTIONS);
    await extractor.initialize();
    await extractor.cleanup();
  });
  
  // PDFStructureRebuilder tests
  runner.test('PDFStructureRebuilder should initialize', async () => {
    const rebuilder = new PDFStructureRebuilder(DEFAULT_PDF_PARSING_OPTIONS);
    await rebuilder.initialize();
    await rebuilder.cleanup();
  });
  
  runner.test('PDFStructureRebuilder should rebuild document', async () => {
    const rebuilder = new PDFStructureRebuilder(DEFAULT_PDF_PARSING_OPTIONS);
    await rebuilder.initialize();
    
    const pages = [
      {
        pageNumber: 1,
        width: 595,
        height: 842,
        text: [
          {
            content: 'Document Title',
            bbox: [50, 50, 545, 100],
            font: {
              family: 'Helvetica',
              size: 24,
              weight: 'bold',
              style: 'normal',
              color: '#000000',
            },
            properties: {
              isHeading: true,
              isParagraph: false,
              isListItem: false,
              isTableContent: false,
              isHeader: false,
              isFooter: false,
              readingOrder: 1,
              confidence: 0.9,
            },
          },
        ],
        images: [],
        layout: {
          margins: { top: 50, right: 20, bottom: 50, left: 20 },
          columns: [],
          contentRegions: [],
          tables: [],
          pageBreak: { type: 'none' },
        },
        styles: [],
        metadata: {
          rotation: 0,
          hasTransparency: false,
          isEncrypted: false,
          compression: 'none',
        },
      },
    ];
    
    const document = await rebuilder.rebuildDocument(pages);
    
    if (!document) {
      throw new Error('Expected document object');
    }
    
    if (document.title !== 'Document Title') {
      throw new Error(`Expected title "Document Title", got "${document.title}"`);
    }
    
    await rebuilder.cleanup();
  });
  
  // Integration tests
  runner.test('Phase 2 integration should work', async () => {
    // Import dynamically to avoid circular dependencies
    const { Phase2Integration } = await import('../integration/Phase2Integration.js');
    const integration = new Phase2Integration();
    
    const mockDecompiler = {
      decompile: () => ({ success: true, sections: [] }),
    };
    
    const mockParsingResult = {
      success: true,
      pages: [],
      metadata: {},
      statistics: {},
    };
    
    const result = integration.integrateWithDecompiler(mockParsingResult, mockDecompiler);
    
    if (!result.success) {
      throw new Error('Expected successful integration');
    }
  });
  
  runner.test('Phase 15 integration should work', async () => {
    // Import dynamically to avoid circular dependencies
    const { Phase15Integration } = await import('../integration/Phase15Integration.js');
    const integration = new Phase15Integration();
    
    const mockRenderingEngine = {
      renderWithLayout: () => ({ success: true, html: '<div>Test</div>' }),
    };
    
    const mockParsingResult = {
      success: true,
      pages: [],
      metadata: {},
      statistics: {},
    };
    
    const result = integration.integrateWithRenderingEngine(mockParsingResult, mockRenderingEngine);
    
    if (!result.success) {
      throw new Error('Expected successful integration');
    }
  });
  
  const success = await runner.run();
  process.exit(success ? 0 : 1);
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

export { TestRunner, runAllTests };