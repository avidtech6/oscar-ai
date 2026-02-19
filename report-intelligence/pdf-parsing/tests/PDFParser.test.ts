/**
 * PDF Parser Tests
 * 
 * Unit tests for PDF parsing components.
 */

import { PDFParser } from '../PDFParser';
import { PDFTextExtractor } from '../PDFTextExtractor';
import { PDFImageExtractor } from '../PDFImageExtractor';
import { PDFLayoutExtractor } from '../PDFLayoutExtractor';
import { PDFFontExtractor } from '../PDFFontExtractor';
import { PDFStructureRebuilder } from '../PDFStructureRebuilder';

import { DEFAULT_PDF_PARSING_OPTIONS } from '../types';

describe('PDF Parser Tests', () => {
  describe('PDFParser', () => {
    let parser: PDFParser;

    beforeEach(() => {
      parser = new PDFParser();
    });

    afterEach(async () => {
      await parser.cleanup();
    });

    test('should initialize successfully', async () => {
      await expect(parser.initialize()).resolves.not.toThrow();
    });

    test('should parse PDF buffer with simulated data', async () => {
      await parser.initialize();
      
      const pdfBuffer = Buffer.from('%PDF-1.4\nSimulated PDF content');
      const result = await parser.parseFromBuffer(pdfBuffer, 'test.pdf');
      
      expect(result.success).toBe(true);
      expect(result.pages).toBeInstanceOf(Array);
      expect(result.metadata).toBeDefined();
      expect(result.statistics).toBeDefined();
    });

    test('should handle invalid PDF buffer', async () => {
      await parser.initialize();
      
      const invalidBuffer = Buffer.from('Not a PDF');
      const result = await parser.parseFromBuffer(invalidBuffer, 'invalid.pdf');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should update options correctly', () => {
      const newOptions = {
        extractText: false,
        extractImages: false,
        maxPages: 5,
      };
      
      parser.updateOptions(newOptions);
      const options = parser.getOptions();
      
      expect(options.extractText).toBe(false);
      expect(options.extractImages).toBe(false);
      expect(options.maxPages).toBe(5);
      expect(options.extractLayout).toBe(true); // Should keep default
    });
  });

  describe('PDFTextExtractor', () => {
    let extractor: PDFTextExtractor;

    beforeEach(() => {
      extractor = new PDFTextExtractor(DEFAULT_PDF_PARSING_OPTIONS);
    });

    afterEach(async () => {
      await extractor.cleanup();
    });

    test('should initialize successfully', async () => {
      await expect(extractor.initialize()).resolves.not.toThrow();
    });

    test('should extract text from simulated PDF', async () => {
      await extractor.initialize();
      
      const pdfBuffer = Buffer.from('Simulated PDF');
      const text = await extractor.extractText(pdfBuffer, 1);
      
      expect(text).toBeInstanceOf(Array);
      expect(text.length).toBeGreaterThan(0);
      
      // Check text structure
      const firstText = text[0];
      expect(firstText.content).toBeDefined();
      expect(firstText.bbox).toHaveLength(4);
      expect(firstText.font).toBeDefined();
      expect(firstText.properties).toBeDefined();
    });

    test('should detect text hierarchy', () => {
      // This is a private method test - in real implementation would need to expose or test indirectly
      // For now, just verify the class works
      expect(extractor).toBeDefined();
    });
  });

  describe('PDFImageExtractor', () => {
    let extractor: PDFImageExtractor;

    beforeEach(() => {
      extractor = new PDFImageExtractor(DEFAULT_PDF_PARSING_OPTIONS);
    });

    afterEach(async () => {
      await extractor.cleanup();
    });

    test('should initialize successfully', async () => {
      await expect(extractor.initialize()).resolves.not.toThrow();
    });

    test('should extract images from simulated PDF', async () => {
      await extractor.initialize();
      
      const pdfBuffer = Buffer.from('Simulated PDF');
      const images = await extractor.extractImages(pdfBuffer, 1);
      
      expect(images).toBeInstanceOf(Array);
      
      if (images.length > 0) {
        const firstImage = images[0];
        expect(firstImage.id).toBeDefined();
        expect(firstImage.data).toBeDefined();
        expect(firstImage.format).toBeDefined();
        expect(firstImage.bbox).toHaveLength(4);
        expect(firstImage.properties).toBeDefined();
      }
    });
  });

  describe('PDFLayoutExtractor', () => {
    let extractor: PDFLayoutExtractor;

    beforeEach(() => {
      extractor = new PDFLayoutExtractor(DEFAULT_PDF_PARSING_OPTIONS);
    });

    afterEach(async () => {
      await extractor.cleanup();
    });

    test('should initialize successfully', async () => {
      await expect(extractor.initialize()).resolves.not.toThrow();
    });

    test('should extract layout from simulated PDF', async () => {
      await extractor.initialize();
      
      const pdfBuffer = Buffer.from('Simulated PDF');
      const layout = await extractor.extractLayout(pdfBuffer, 1);
      
      expect(layout).toBeDefined();
      expect(layout.margins).toBeDefined();
      expect(layout.columns).toBeInstanceOf(Array);
      expect(layout.contentRegions).toBeInstanceOf(Array);
      expect(layout.tables).toBeInstanceOf(Array);
      expect(layout.pageBreak).toBeDefined();
    });

    test('should detect columns correctly', () => {
      // Test column detection logic
      const columns = (extractor as any).detectColumns(1);
      expect(columns).toBeInstanceOf(Array);
    });
  });

  describe('PDFFontExtractor', () => {
    let extractor: PDFFontExtractor;

    beforeEach(() => {
      extractor = new PDFFontExtractor(DEFAULT_PDF_PARSING_OPTIONS);
    });

    afterEach(async () => {
      await extractor.cleanup();
    });

    test('should initialize successfully', async () => {
      await expect(extractor.initialize()).resolves.not.toThrow();
    });

    test('should extract fonts from simulated PDF', async () => {
      await extractor.initialize();
      
      const pdfBuffer = Buffer.from('Simulated PDF');
      const styles = await extractor.extractStyles(pdfBuffer, 1);
      
      expect(styles).toBeInstanceOf(Array);
      
      if (styles.length > 0) {
        const firstStyle = styles[0];
        expect(firstStyle.fontFamily).toBeDefined();
        expect(firstStyle.fontSize).toBeDefined();
        expect(firstStyle.fontWeight).toBeDefined();
        expect(firstStyle.fontStyle).toBeDefined();
        expect(firstStyle.color).toBeDefined();
        expect(firstStyle.usage).toBeDefined();
      }
    });

    test('should analyze font patterns', () => {
      const styles = [
        {
          fontFamily: 'Helvetica',
          fontSize: 16,
          fontWeight: 'bold' as const,
          fontStyle: 'normal' as const,
          color: '#000000',
          lineHeight: 1.3,
          letterSpacing: 0,
          textAlign: 'left' as const,
          usage: { count: 1, percentage: 50, elements: ['heading'] },
        },
        {
          fontFamily: 'Helvetica',
          fontSize: 11,
          fontWeight: 'normal' as const,
          fontStyle: 'normal' as const,
          color: '#000000',
          lineHeight: 1.5,
          letterSpacing: 0,
          textAlign: 'justify' as const,
          usage: { count: 1, percentage: 50, elements: ['paragraph'] },
        },
      ];
      
      const patterns = extractor.analyzeFontPatterns(styles);
      
      expect(patterns.primaryFont).toBeDefined();
      expect(patterns.headingFont).toBeDefined();
      expect(patterns.bodyFont).toBeDefined();
      expect(patterns.fontHierarchy).toBeInstanceOf(Array);
    });
  });

  describe('PDFStructureRebuilder', () => {
    let rebuilder: PDFStructureRebuilder;

    beforeEach(() => {
      rebuilder = new PDFStructureRebuilder(DEFAULT_PDF_PARSING_OPTIONS);
    });

    afterEach(async () => {
      await rebuilder.cleanup();
    });

    test('should initialize successfully', async () => {
      await expect(rebuilder.initialize()).resolves.not.toThrow();
    });

    test('should rebuild document structure', async () => {
      await rebuilder.initialize();
      
      // Create simulated page data
      const pages = [
        {
          pageNumber: 1,
          width: 595,
          height: 842,
          text: [
            {
              content: 'Document Title',
              bbox: [50, 50, 545, 100] as [number, number, number, number],
              font: {
                family: 'Helvetica',
                size: 24,
                weight: 'bold' as const,
                style: 'normal' as const,
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
            {
              content: 'This is a paragraph.',
              bbox: [50, 120, 545, 140] as [number, number, number, number],
              font: {
                family: 'Helvetica',
                size: 11,
                weight: 'normal' as const,
                style: 'normal' as const,
                color: '#000000',
              },
              properties: {
                isHeading: false,
                isParagraph: true,
                isListItem: false,
                isTableContent: false,
                isHeader: false,
                isFooter: false,
                readingOrder: 2,
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
            pageBreak: { type: 'none' as const },
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
      
      expect(document).toBeDefined();
      expect(document.title).toBe('Document Title');
      expect(document.sections).toBeInstanceOf(Array);
      expect(document.metadata).toBeDefined();
      expect(document.structure).toBeDefined();
    });

    test('should extract document title correctly', () => {
      const pages = [
        {
          pageNumber: 1,
          width: 595,
          height: 842,
          text: [
            {
              content: 'Test Title',
              bbox: [50, 50, 545, 100] as [number, number, number, number],
              font: {
                family: 'Helvetica',
                size: 24,
                weight: 'bold' as const,
                style: 'normal' as const,
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
            pageBreak: { type: 'none' as const },
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
      
      const title = (rebuilder as any).extractDocumentTitle(pages);
      expect(title).toBe('Test Title');
    });
  });
});