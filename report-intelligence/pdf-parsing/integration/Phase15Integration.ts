/**
 * Phase 15 Integration - PDF Parsing to Visual Rendering Engine
 * 
 * Integrates PDF parsing results with Phase 15 Visual Rendering Engine.
 * Provides layout geometry, extracted images, page break hints, and
 * cover page structure for accurate HTML reproduction.
 */

import type {
  PDFParsingResult,
  PDFPageData,
  PDFExtractedImage,
  PDFLayoutInfo,
  PDFTable,
} from '../types';

// Import Phase 15 types (simulated - in real implementation would import actual types)
interface RenderingOptions {
  layout: {
    size: 'A4' | 'A3' | 'Letter' | 'Legal';
    orientation: 'portrait' | 'landscape';
    margins: { top: number; right: number; bottom: number; left: number };
  };
  typography: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    fontWeight: 'normal' | 'bold' | 'light';
    fontColor: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    headings: string;
    borders: string;
  };
  enablePreview: boolean;
  enableSnapshots: boolean;
  enablePDFExport: boolean;
}

interface DocumentContent {
  title: string;
  sections: Array<{
    id: string;
    type: 'section';
    title: string;
    content: Array<{
      id: string;
      type: 'paragraph' | 'heading' | 'list' | 'table' | 'image';
      content: string | string[] | any;
      style?: any;
    }>;
  }>;
  author?: string;
  date?: Date;
  metadata: Record<string, any>;
}

interface VisualRenderingEngine {
  renderDocument(content: DocumentContent, options?: RenderingOptions): Promise<any>;
  exportToPDF(content: DocumentContent, options?: RenderingOptions): Promise<any>;
}

export class Phase15Integration {
  private renderingEngine: VisualRenderingEngine | null = null;
  private defaultOptions: RenderingOptions;

  constructor() {
    console.log('Phase 15 Integration initialized');
    
    // Default rendering options
    this.defaultOptions = {
      layout: {
        size: 'A4',
        orientation: 'portrait',
        margins: { top: 25, right: 20, bottom: 25, left: 20 },
      },
      typography: {
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontSize: 11,
        lineHeight: 1.5,
        fontWeight: 'normal',
        fontColor: '#000000',
      },
      colors: {
        primary: '#2f5233',
        secondary: '#6b7280',
        accent: '#059669',
        background: '#ffffff',
        text: '#000000',
        headings: '#2f5233',
        borders: '#e5e7eb',
      },
      enablePreview: true,
      enableSnapshots: true,
      enablePDFExport: true,
    };
  }

  /**
   * Set the Phase 15 rendering engine instance
   */
  setRenderingEngine(engine: VisualRenderingEngine): void {
    this.renderingEngine = engine;
    console.log('Phase 15 rendering engine set');
  }

  /**
   * Convert PDF parsing results to Phase 15 document content
   */
  async convertToDocumentContent(
    pdfResults: PDFParsingResult,
    options: {
      preserveLayout?: boolean;
      includeImages?: boolean;
      includeTables?: boolean;
      extractStyles?: boolean;
    } = {}
  ): Promise<DocumentContent> {
    if (!pdfResults.success) {
      throw new Error(`PDF parsing failed: ${pdfResults.error}`);
    }

    console.log('Converting PDF results to Phase 15 document content...');
    
    try {
      // Extract document title
      const title = this.extractDocumentTitle(pdfResults);
      
      // Convert pages to sections
      const sections = this.convertPagesToSections(
        pdfResults.pages,
        options
      );
      
      // Extract metadata
      const metadata = this.extractDocumentMetadata(pdfResults);
      
      const documentContent: DocumentContent = {
        title,
        sections,
        author: pdfResults.metadata.author,
        date: pdfResults.metadata.creationDate,
        metadata: {
          ...metadata,
          pdfSource: true,
          pageCount: pdfResults.pages.length,
          extractionStats: pdfResults.statistics,
        },
      };
      
      console.log(`Document content converted: ${sections.length} sections`);
      return documentContent;
    } catch (error) {
      console.error('Failed to convert PDF results to document content:', error);
      throw error;
    }
  }

  /**
   * Render PDF content using Phase 15 engine
   */
  async renderPDFContent(
    pdfResults: PDFParsingResult,
    renderingOptions?: Partial<RenderingOptions>
  ): Promise<any> {
    if (!this.renderingEngine) {
      throw new Error('Phase 15 rendering engine not set');
    }

    console.log('Rendering PDF content with Phase 15 engine...');
    
    try {
      // Convert to document content
      const documentContent = await this.convertToDocumentContent(pdfResults, {
        preserveLayout: true,
        includeImages: true,
        includeTables: true,
        extractStyles: true,
      });
      
      // Merge with default options
      const options: RenderingOptions = {
        ...this.defaultOptions,
        ...renderingOptions,
      };
      
      // Apply PDF-specific layout adjustments
      this.applyPDFLayoutAdjustments(options, pdfResults);
      
      // Render document
      const renderingResult = await this.renderingEngine.renderDocument(
        documentContent,
        options
      );
      
      console.log('PDF content successfully rendered');
      return renderingResult;
    } catch (error) {
      console.error('Failed to render PDF content:', error);
      throw error;
    }
  }

  /**
   * Export PDF content to PDF using Phase 15 engine
   */
  async exportPDFContent(
    pdfResults: PDFParsingResult,
    exportOptions?: Partial<RenderingOptions>
  ): Promise<any> {
    if (!this.renderingEngine) {
      throw new Error('Phase 15 rendering engine not set');
    }

    console.log('Exporting PDF content with Phase 15 engine...');
    
    try {
      // Convert to document content
      const documentContent = await this.convertToDocumentContent(pdfResults, {
        preserveLayout: true,
        includeImages: true,
        includeTables: true,
        extractStyles: true,
      });
      
      // Merge with default options
      const options: RenderingOptions = {
        ...this.defaultOptions,
        ...exportOptions,
      };
      
      // Apply PDF-specific layout adjustments
      this.applyPDFLayoutAdjustments(options, pdfResults);
      
      // Export to PDF
      const pdfResult = await this.renderingEngine.exportToPDF(
        documentContent,
        options
      );
      
      console.log('PDF content successfully exported');
      return pdfResult;
    } catch (error) {
      console.error('Failed to export PDF content:', error);
      throw error;
    }
  }

  /**
   * Extract document title from PDF results
   */
  private extractDocumentTitle(pdfResults: PDFParsingResult): string {
    // Use PDF metadata title if available
    if (pdfResults.metadata.title && pdfResults.metadata.title.trim().length > 0) {
      return pdfResults.metadata.title;
    }
    
    // Fallback: use first page's largest text
    if (pdfResults.pages.length > 0) {
      const firstPage = pdfResults.pages[0];
      if (firstPage.text.length > 0) {
        const largestText = firstPage.text.reduce((largest, current) => {
          if (current.font.size > (largest?.font.size || 0)) {
            return current;
          }
          return largest;
        }, firstPage.text[0]);
        
        if (largestText && largestText.font.size >= 16) {
          return largestText.content;
        }
      }
    }
    
    return 'Untitled Document';
  }

  /**
   * Convert PDF pages to Phase 15 sections
   */
  private convertPagesToSections(
    pages: PDFPageData[],
    options: {
      preserveLayout?: boolean;
      includeImages?: boolean;
      includeTables?: boolean;
      extractStyles?: boolean;
    }
  ): DocumentContent['sections'] {
    const sections: DocumentContent['sections'] = [];
    
    pages.forEach((page, pageIndex) => {
      const pageNumber = pageIndex + 1;
      
      // Create a section for each page (or group pages logically)
      const section: DocumentContent['sections'][0] = {
        id: `page-${pageNumber}`,
        type: 'section',
        title: `Page ${pageNumber}`,
        content: [],
      };
      
      // Convert text elements
      page.text.forEach((text, textIndex) => {
        const element = this.convertTextToContentElement(
          text,
          pageNumber,
          textIndex,
          options
        );
        section.content.push(element);
      });
      
      // Convert images
      if (options.includeImages) {
        page.images.forEach((image, imageIndex) => {
          const element = this.convertImageToContentElement(
            image,
            pageNumber,
            imageIndex
          );
          section.content.push(element);
        });
      }
      
      // Convert tables
      if (options.includeTables) {
        page.layout.tables.forEach((table, tableIndex) => {
          const element = this.convertTableToContentElement(
            table,
            pageNumber,
            tableIndex
          );
          section.content.push(element);
        });
      }
      
      // Add layout hints if preserving layout
      if (options.preserveLayout) {
        this.addLayoutHints(section, page.layout);
      }
      
      sections.push(section);
    });
    
    return sections;
  }

  /**
   * Convert text element to content element
   */
  private convertTextToContentElement(
    text: any,
    pageNumber: number,
    index: number,
    options: any
  ): any {
    const element: any = {
      id: `text-${pageNumber}-${index}`,
      type: this.determineElementType(text),
      content: text.content,
    };
    
    // Add style information if extracting styles
    if (options.extractStyles) {
      element.style = {
        fontFamily: text.font.family,
        fontSize: text.font.size,
        fontWeight: text.font.weight,
        fontStyle: text.font.style,
        color: text.font.color,
        textAlign: this.determineTextAlignment(text),
      };
    }
    
    // Add position information if preserving layout
    if (options.preserveLayout) {
      element.position = {
        page: pageNumber,
        x: text.bbox[0],
        y: text.bbox[1],
        width: text.bbox[2] - text.bbox[0],
        height: text.bbox[3] - text.bbox[1],
      };
    }
    
    return element;
  }

  /**
   * Convert image element to content element
   */
  private convertImageToContentElement(
    image: PDFExtractedImage,
    pageNumber: number,
    index: number
  ): any {
    return {
      id: `image-${pageNumber}-${index}`,
      type: 'image',
      content: {
        data: image.data,
        format: image.format,
        altText: image.altText || `Image ${index + 1} on page ${pageNumber}`,
        width: image.properties.width,
        height: image.properties.height,
        properties: image.properties,
      },
      position: {
        page: pageNumber,
        x: image.bbox[0],
        y: image.bbox[1],
        width: image.bbox[2] - image.bbox[0],
        height: image.bbox[3] - image.bbox[1],
      },
    };
  }

  /**
   * Convert table to content element
   */
  private convertTableToContentElement(
    table: PDFTable,
    pageNumber: number,
    index: number
  ): any {
    // Convert table cells to 2D array
    const cells: string[][] = [];
    const rows = table.structure.rows;
    const columns = table.structure.columns;
    
    // Initialize empty cells
    for (let i = 0; i < rows; i++) {
      cells[i] = Array(columns).fill('');
    }
    
    // Fill cells with content
    if (table.structure.cells && Array.isArray(table.structure.cells)) {
      table.structure.cells.forEach((cell: any) => {
        if (cell.row < rows && cell.column < columns) {
          cells[cell.row][cell.column] = cell.content || '';
        }
      });
    }
    
    return {
      id: `table-${pageNumber}-${index}`,
      type: 'table',
      content: {
        rows,
        columns,
        cells,
        hasHeaderRow: table.properties.hasHeaderRow,
        hasBorders: table.properties.hasBorders,
        alignment: table.properties.alignment,
      },
      position: {
        page: pageNumber,
        x: table.bbox[0],
        y: table.bbox[1],
        width: table.bbox[2] - table.bbox[0],
        height: table.bbox[3] - table.bbox[1],
      },
    };
  }

  /**
   * Determine element type from text properties
   */
  private determineElementType(text: any): string {
    if (text.properties.isHeading) return 'heading';
    if (text.properties.isListItem) return 'list';
    if (text.properties.isTableContent) return 'table';
    if (text.properties.isParagraph) return 'paragraph';
    
    // Fallback detection
    if (text.font.size >= 14 || text.font.weight === 'bold') {
      return 'heading';
    }
    
    return 'paragraph';
  }

  /**
   * Determine text alignment from position
   */
  private determineTextAlignment(text: any): string {
    // Simple heuristic based on x-position
    const pageWidth = 595; // Standard A4 width
    const xCenter = text.bbox[0] + (text.bbox[2] - text.bbox[0]) / 2;
    
    if (xCenter < pageWidth * 0.33) return 'left';
    if (xCenter > pageWidth * 0.66) return 'right';
    return 'center';
  }

  /**
   * Add layout hints to section
   */
  private addLayoutHints(section: any, layout: PDFLayoutInfo): void {
    section.layoutHints = {
      margins: layout.margins,
      columns: layout.columns.length,
      hasHeader: !!layout.header,
      hasFooter: !!layout.footer,
      pageBreak: layout.pageBreak,
      contentRegions: layout.contentRegions.map(region => ({
        type: region.type,
        bbox: region.bbox,
        contentType: region.contentType,
      })),
    };
  }

  /**
   * Extract document metadata
   */
  private extractDocumentMetadata(pdfResults: PDFParsingResult): Record<string, any> {
    return {
      pdfMetadata: pdfResults.metadata,
      layoutInfo: {
        totalPages: pdfResults.pages.length,
        pageDimensions: pdfResults.pages.map(page => ({
          width: page.width,
          height: page.height,
        })),
        hasCoverPage: this.detectCoverPage(pdfResults.pages),
        hasTableOfContents: this.detectTableOfContents(pdfResults.pages),
      },
      extractionInfo: {
        textElements: pdfResults.statistics.totalTextElements,
        images: pdfResults.statistics.totalImages,
        tables: pdfResults.statistics.totalTables,
        processingTime: pdfResults.statistics.processingTime,
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
   * Apply PDF-specific layout adjustments
   */
  private applyPDFLayoutAdjustments(
    options: RenderingOptions,
    pdfResults: PDFParsingResult
  ): void {
    if (pdfResults.pages.length === 0) return;
    
    // Use first page dimensions as reference
    const firstPage = pdfResults.pages[0];
    
    // Adjust layout size based on PDF page dimensions
    const width = firstPage.width;
    const height = firstPage.height;
    
    // Determine paper size
    if (width > 800 || height > 800) {
      options.layout.size = 'A3';
    } else if (width > 600 || height > 600) {
      options.layout.size = 'A4';
    }
    
    // Determine orientation
    if (width > height) {
      options.layout.orientation = 'landscape';
    }
    
    // Adjust margins based on PDF layout
    if (firstPage.layout.margins) {
      options.layout.margins = {
        top: Math.max(firstPage.layout.margins.top, 20),
        right: Math.max(firstPage.layout.margins.right, 20),
        bottom: Math.max(firstPage.layout.margins.bottom, 20),
        left: Math.max(firstPage.layout.margins.left, 20),
      };
    }
    
    // Extract dominant font from PDF
    const dominantFont = this.extractDominantFont(pdfResults.pages);
    if (dominantFont) {
      options.typography.fontFamily = dominantFont.family;
      options.typography.fontSize = dominantFont.size;
      options.typography.fontWeight = dominantFont.weight;
    }
  }

  /**
   * Extract dominant font from PDF pages
   */
  private extractDominantFont(pages: PDFPageData[]): {
    family: string;
    size: number;
    weight: 'normal' | 'bold' | 'light';
  } | null {
    if (pages.length === 0) return null;
    
    // Count font occurrences
    const fontCounts = new Map<string, { count: number; size: number; weight: string }>();
    
    pages.forEach(page => {
      page.text.forEach(text => {
        const fontKey = `${text.font.family}-${text.font.size}-${text.font.weight}`;
        if (!fontCounts.has(fontKey)) {
          fontCounts.set(fontKey, {
            count: 0,
            size: text.font.size,
            weight: text.font.weight,
          });
        }
        const font = fontCounts.get(fontKey)!;
        font.count++;
      });
    });
    
    // Find most common font
    let dominantFont: { family: string; size: number; weight: 'normal' | 'bold' | 'light' } | null = null;
    let maxCount = 0;
    
    fontCounts.forEach((stats, key) => {
      if (stats.count > maxCount) {
        const [family] = key.split('-');
        dominantFont = {
          family,
          size: stats.size,
          weight: stats.weight as 'normal' | 'bold' | 'light',
        };
        maxCount = stats.count;
      }
    });
    
    return dominantFont;
  }

  /**
   * Get integration statistics
   */
  getIntegrationStats(): {
    processedDocuments: number;
    renderedDocuments: number;
    exportedDocuments: number;
    averageRenderingTime: number;
  } {
    // In a real implementation, track statistics
    return {
      processedDocuments: 0,
      renderedDocuments: 0,
      exportedDocuments: 0,
      averageRenderingTime: 0,
    };
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    console.log('Cleaning up Phase 15 Integration resources...');
    this.renderingEngine = null;
  }
}