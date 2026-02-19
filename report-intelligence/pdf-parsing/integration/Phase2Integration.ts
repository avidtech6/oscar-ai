/**
 * Phase 2 Integration - PDF Parsing to Report Decompiler
 * 
 * Integrates PDF parsing results with Phase 2 Report Decompiler Engine.
 * Provides structured text, layout cues, and extracted images to improve
 * decompilation accuracy.
 */

import type {
  PDFParsingResult,
  PDFPageData,
  PDFExtractedText,
  PDFExtractedImage,
  PDFLayoutInfo,
} from '../types';

// Import Phase 2 types (simulated - in real implementation would import actual types)
interface DecompiledReport {
  id: string;
  rawText: string;
  detectedReportType: string | null;
  sections: Array<{
    id: string;
    title: string;
    content: string;
    level: number;
    pageNumber?: number;
    position?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  metadata: Record<string, any>;
  terminology: string[];
  complianceMarkers: string[];
  structureMap: Record<string, any>;
  timestamps: {
    ingested: Date;
    decompiled: Date;
  };
}

interface ReportDecompiler {
  ingest(rawText: string, options?: any): Promise<DecompiledReport>;
}

export class Phase2Integration {
  private decompiler: ReportDecompiler | null = null;

  constructor() {
    console.log('Phase 2 Integration initialized');
  }

  /**
   * Set the Phase 2 decompiler instance
   */
  setDecompiler(decompiler: ReportDecompiler): void {
    this.decompiler = decompiler;
    console.log('Phase 2 decompiler set');
  }

  /**
   * Process PDF parsing results through Phase 2 decompiler
   */
  async processPDFResults(
    pdfResults: PDFParsingResult,
    options: {
      includeLayoutCues?: boolean;
      includeImages?: boolean;
      enhanceWithMetadata?: boolean;
    } = {}
  ): Promise<DecompiledReport | null> {
    if (!this.decompiler) {
      console.error('Phase 2 decompiler not set');
      return null;
    }

    if (!pdfResults.success) {
      console.error('PDF parsing failed:', pdfResults.error);
      return null;
    }

    console.log('Processing PDF results through Phase 2 decompiler...');
    
    try {
      // Extract combined text from all pages
      const combinedText = this.extractCombinedText(pdfResults.pages);
      
      // Extract layout cues
      const layoutCues = options.includeLayoutCues
        ? this.extractLayoutCues(pdfResults.pages)
        : {};
      
      // Extract metadata
      const metadata = options.enhanceWithMetadata
        ? this.extractEnhancedMetadata(pdfResults)
        : {};
      
      // Prepare decompiler options
      const decompilerOptions = {
        layoutCues,
        metadata,
        pdfInfo: {
          pageCount: pdfResults.pages.length,
          hasImages: pdfResults.pages.some(page => page.images.length > 0),
          hasTables: pdfResults.pages.some(page => page.layout.tables.length > 0),
          extractedTextElements: pdfResults.statistics.totalTextElements,
          extractedImages: pdfResults.statistics.totalImages,
        },
      };
      
      // Process through Phase 2 decompiler
      const decompiledReport = await this.decompiler.ingest(combinedText, decompilerOptions);
      
      // Enhance decompiled report with PDF-specific information
      const enhancedReport = this.enhanceDecompiledReport(
        decompiledReport,
        pdfResults,
        options
      );
      
      console.log('PDF results successfully processed through Phase 2 decompiler');
      return enhancedReport;
    } catch (error) {
      console.error('Failed to process PDF results through Phase 2:', error);
      return null;
    }
  }

  /**
   * Extract combined text from all pages
   */
  private extractCombinedText(pages: PDFPageData[]): string {
    const textLines: string[] = [];
    
    pages.forEach((page, pageIndex) => {
      // Add page separator
      if (pageIndex > 0) {
        textLines.push(`\n--- Page ${pageIndex + 1} ---\n`);
      }
      
      // Sort text by reading order
      const sortedText = [...page.text].sort((a, b) => 
        a.properties.readingOrder - b.properties.readingOrder
      );
      
      // Group text by y-position (approximate lines)
      const lines = new Map<number, PDFExtractedText[]>();
      sortedText.forEach(text => {
        const y = Math.round(text.bbox[1] / 10) * 10; // Group by 10-point intervals
        if (!lines.has(y)) {
          lines.set(y, []);
        }
        lines.get(y)!.push(text);
      });
      
      // Sort lines by y-position (top to bottom)
      const sortedLines = Array.from(lines.entries())
        .sort(([y1], [y2]) => y1 - y2)
        .map(([_, texts]) => 
          texts.sort((a, b) => a.bbox[0] - b.bbox[0]) // Sort by x-position within line
        );
      
      // Build text lines
      sortedLines.forEach(texts => {
        const lineText = texts.map(text => text.content).join(' ');
        textLines.push(lineText);
      });
    });
    
    return textLines.join('\n');
  }

  /**
   * Extract layout cues for decompiler
   */
  private extractLayoutCues(pages: PDFPageData[]): Record<string, any> {
    const cues: Record<string, any> = {
      pages: [],
      headings: [],
      paragraphs: [],
      lists: [],
      tables: [],
      images: [],
    };
    
    pages.forEach((page, pageIndex) => {
      const pageCues: any = {
        pageNumber: pageIndex + 1,
        dimensions: {
          width: page.width,
          height: page.height,
        },
        layout: {
          margins: page.layout.margins,
          columns: page.layout.columns.length,
          hasHeader: !!page.layout.header,
          hasFooter: !!page.layout.footer,
        },
        elements: [],
      };
      
      // Process text elements
      page.text.forEach(text => {
        const element = {
          type: this.determineTextType(text),
          content: text.content,
          position: {
            x: text.bbox[0],
            y: text.bbox[1],
            width: text.bbox[2] - text.bbox[0],
            height: text.bbox[3] - text.bbox[1],
          },
          style: {
            fontFamily: text.font.family,
            fontSize: text.font.size,
            fontWeight: text.font.weight,
            fontStyle: text.font.style,
            color: text.font.color,
          },
          properties: text.properties,
        };
        
        pageCues.elements.push(element);
        
        // Add to specific collections
        if (element.type === 'heading') {
          cues.headings.push({
            ...element,
            page: pageIndex + 1,
          });
        } else if (element.type === 'paragraph') {
          cues.paragraphs.push({
            ...element,
            page: pageIndex + 1,
          });
        } else if (element.type === 'list') {
          cues.lists.push({
            ...element,
            page: pageIndex + 1,
          });
        }
      });
      
      // Process tables
      page.layout.tables.forEach((table, tableIndex) => {
        const tableCue = {
          type: 'table',
          id: `table-${pageIndex + 1}-${tableIndex + 1}`,
          position: {
            x: table.bbox[0],
            y: table.bbox[1],
            width: table.bbox[2] - table.bbox[0],
            height: table.bbox[3] - table.bbox[1],
          },
          structure: {
            rows: table.structure.rows,
            columns: table.structure.columns,
            hasHeaderRow: table.properties.hasHeaderRow,
          },
          page: pageIndex + 1,
        };
        
        pageCues.elements.push(tableCue);
        cues.tables.push(tableCue);
      });
      
      // Process images
      page.images.forEach((image, imageIndex) => {
        const imageCue = {
          type: 'image',
          id: image.id,
          position: {
            x: image.bbox[0],
            y: image.bbox[1],
            width: image.bbox[2] - image.bbox[0],
            height: image.bbox[3] - image.bbox[1],
          },
          properties: image.properties,
          altText: image.altText,
          page: pageIndex + 1,
        };
        
        pageCues.elements.push(imageCue);
        cues.images.push(imageCue);
      });
      
      cues.pages.push(pageCues);
    });
    
    return cues;
  }

  /**
   * Determine text type from extracted text properties
   */
  private determineTextType(text: PDFExtractedText): string {
    if (text.properties.isHeading) return 'heading';
    if (text.properties.isListItem) return 'list';
    if (text.properties.isTableContent) return 'table';
    if (text.properties.isParagraph) return 'paragraph';
    
    // Fallback detection based on font properties
    if (text.font.size >= 14 || text.font.weight === 'bold') {
      return 'heading';
    }
    
    return 'paragraph';
  }

  /**
   * Extract enhanced metadata from PDF results
   */
  private extractEnhancedMetadata(pdfResults: PDFParsingResult): Record<string, any> {
    return {
      pdfMetadata: {
        ...pdfResults.metadata,
        processingTime: pdfResults.statistics.processingTime,
        fileSize: pdfResults.statistics.fileSize,
      },
      extractionStats: {
        totalPages: pdfResults.statistics.totalPages,
        textElements: pdfResults.statistics.totalTextElements,
        images: pdfResults.statistics.totalImages,
        tables: pdfResults.statistics.totalTables,
      },
      documentStructure: {
        hasCoverPage: this.detectCoverPage(pdfResults.pages),
        hasTableOfContents: this.detectTableOfContents(pdfResults.pages),
        hasReferences: this.detectReferences(pdfResults.pages),
        hasAppendices: this.detectAppendices(pdfResults.pages),
      },
    };
  }

  /**
   * Detect cover page
   */
  private detectCoverPage(pages: PDFPageData[]): boolean {
    if (pages.length === 0) return false;
    
    const firstPage = pages[0];
    const hasLargeText = firstPage.text.some(text => text.font.size >= 20);
    const hasImages = firstPage.images.length > 0;
    
    return hasLargeText || hasImages;
  }

  /**
   * Detect table of contents
   */
  private detectTableOfContents(pages: PDFPageData[]): boolean {
    // Check first few pages for TOC indicators
    const tocPages = pages.slice(0, Math.min(3, pages.length));
    
    for (const page of tocPages) {
      for (const text of page.text) {
        const content = text.content.toLowerCase();
        if (content.includes('table of contents') || content.includes('contents')) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Detect references section
   */
  private detectReferences(pages: PDFPageData[]): boolean {
    // Check last few pages for references
    const refPages = pages.slice(-5);
    
    for (const page of refPages) {
      for (const text of page.text) {
        const content = text.content.toLowerCase();
        if (content.includes('references') || content.includes('bibliography')) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Detect appendices
   */
  private detectAppendices(pages: PDFPageData[]): boolean {
    for (const page of pages) {
      for (const text of page.text) {
        const content = text.content.toLowerCase();
        if (content.includes('appendix')) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Enhance decompiled report with PDF-specific information
   */
  private enhanceDecompiledReport(
    report: DecompiledReport,
    pdfResults: PDFParsingResult,
    options: any
  ): DecompiledReport {
    const enhancedReport = { ...report };
    
    // Add PDF metadata
    enhancedReport.metadata = {
      ...enhancedReport.metadata,
      pdfSource: true,
      pdfMetadata: pdfResults.metadata,
      extractionStats: pdfResults.statistics,
    };
    
    // Enhance sections with page numbers and positions
    if (options.includeLayoutCues) {
      enhancedReport.sections = enhancedReport.sections.map(section => {
        // Try to match section with PDF page
        const matchingPage = this.findMatchingPage(section, pdfResults.pages);
        if (matchingPage) {
          return {
            ...section,
            pageNumber: matchingPage.pageNumber,
            position: matchingPage.position,
          };
        }
        return section;
      });
    }
    
    // Add structure map enhancements
    enhancedReport.structureMap = {
      ...enhancedReport.structureMap,
      pdfStructure: {
        pageCount: pdfResults.pages.length,
        hasImages: pdfResults.pages.some(page => page.images.length > 0),
        hasTables: pdfResults.pages.some(page => page.layout.tables.length > 0),
        layoutAnalysis: options.includeLayoutCues ? 'available' : 'not_included',
      },
    };
    
    return enhancedReport;
  }

  /**
   * Find matching page for a section
   */
  private findMatchingPage(
    section: any,
    pages: PDFPageData[]
  ): { pageNumber: number; position: any } | null {
    // Simple matching based on section title
    const sectionTitle = section.title.toLowerCase();
    
    for (const page of pages) {
      for (const text of page.text) {
        if (text.content.toLowerCase().includes(sectionTitle)) {
          return {
            pageNumber: page.pageNumber,
            position: {
              x: text.bbox[0],
              y: text.bbox[1],
              width: text.bbox[2] - text.bbox[0],
              height: text.bbox[3] - text.bbox[1],
            },
          };
        }
      }
    }
    
    return null;
  }

  /**
   * Get integration statistics
   */
  getIntegrationStats(): {
    processedDocuments: number;
    averageProcessingTime: number;
    lastProcessed: Date | null;
  } {
    // In a real implementation, track statistics
    return {
      processedDocuments: 0,
      averageProcessingTime: 0,
      lastProcessed: null,
    };
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    console.log('Cleaning up Phase 2 Integration resources...');
    this.decompiler = null;
  }
}