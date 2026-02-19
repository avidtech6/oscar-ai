/**
 * Phase 15: HTML Rendering & Visual Reproduction Engine
 * Multi-Page PDF Export
 * 
 * Responsible for converting HTML content to multi-page PDFs with proper
 * pagination, headers, footers, and visual fidelity.
 */

import type {
  RenderingOptions,
  ContentElement,
  DocumentContent,
  PageContent
} from '../types';

import { HTMLRenderer } from './HTMLRenderer';
import { HeaderFooterSystem } from './HeaderFooterSystem';
import { CoverPageGenerator } from './CoverPageGenerator';
import { PageBreakLogic } from './PageBreakLogic';
import { CSSLayoutEngine } from './CSSLayoutEngine';

/**
 * PDF export configuration
 */
export interface PDFExportConfig {
  format: 'A4' | 'A3' | 'Letter' | 'Legal' | 'Custom';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;    // in millimeters
    right: number;
    bottom: number;
    left: number;
  };
  quality: 'standard' | 'high' | 'print';
  includeCoverPage: boolean;
  includeHeaders: boolean;
  includeFooters: boolean;
  includePageNumbers: boolean;
  includeHyperlinks: boolean;
  includeBookmarks: boolean;
  compress: boolean;
  password?: string;
  permissions?: {
    print: boolean;
    modify: boolean;
    copy: boolean;
    annotate: boolean;
  };
}

/**
 * Default PDF export configuration
 */
export const DEFAULT_PDF_EXPORT_CONFIG: PDFExportConfig = {
  format: 'A4',
  orientation: 'portrait',
  margins: { top: 25, right: 20, bottom: 25, left: 20 },
  quality: 'standard',
  includeCoverPage: true,
  includeHeaders: true,
  includeFooters: true,
  includePageNumbers: true,
  includeHyperlinks: true,
  includeBookmarks: true,
  compress: true
};

/**
 * PDF export result
 */
export interface PDFExportResult {
  success: boolean;
  pdfData?: Uint8Array | string; // Binary PDF data or base64 string
  fileSize?: number; // in bytes
  pageCount: number;
  warnings: string[];
  errors: string[];
  metadata: {
    title: string;
    author: string;
    subject?: string;
    keywords?: string[];
    creator: string;
    creationDate: Date;
    modificationDate?: Date;
  };
}

/**
 * Page rendering context
 */
interface PageRenderingContext {
  pageNumber: number;
  totalPages: number;
  content: ContentElement[];
  header?: ContentElement[];
  footer?: ContentElement[];
  pageSize: {
    width: number;
    height: number;
    unit: 'mm' | 'px' | 'in';
  };
}

/**
 * Multi-Page PDF Export Engine
 */
export class MultiPagePDFExport {
  private options: RenderingOptions;
  private config: PDFExportConfig;
  private htmlRenderer: HTMLRenderer;
  private headerFooterSystem: HeaderFooterSystem;
  private coverPageGenerator: CoverPageGenerator;
  private pageBreakLogic: PageBreakLogic;
  private cssEngine: CSSLayoutEngine;
  private warnings: string[] = [];
  private errors: string[] = [];

  constructor(
    options: RenderingOptions,
    config: Partial<PDFExportConfig> = {}
  ) {
    this.options = options;
    this.config = { ...DEFAULT_PDF_EXPORT_CONFIG, ...config };
    this.htmlRenderer = new HTMLRenderer(options);
    this.headerFooterSystem = new HeaderFooterSystem(options);
    this.coverPageGenerator = new CoverPageGenerator(options);
    this.pageBreakLogic = new PageBreakLogic(options);
    this.cssEngine = new CSSLayoutEngine(options);
  }

  /**
   * Export document to multi-page PDF
   */
  public async exportToPDF(
    document: DocumentContent
  ): Promise<PDFExportResult> {
    this.resetMessages();

    try {
      // Step 1: Apply page breaks
      const pageBreakResult = this.pageBreakLogic.applyPageBreaks(document);
      
      if (pageBreakResult.errors.length > 0) {
        this.errors.push(...pageBreakResult.errors);
      }
      
      if (pageBreakResult.warnings.length > 0) {
        this.warnings.push(...pageBreakResult.warnings);
      }

      // Step 2: Generate cover page if enabled
      let coverPageHTML = '';
      if (this.config.includeCoverPage) {
        const coverPageResult = this.coverPageGenerator.generateCoverPage(document);
        coverPageHTML = coverPageResult.html;
        if (coverPageResult.warnings.length > 0) {
          this.warnings.push(...coverPageResult.warnings);
        }
        if (coverPageResult.errors.length > 0) {
          this.errors.push(...coverPageResult.errors);
        }
      }

      // Step 3: Generate headers and footers for all pages
      const totalPages = pageBreakResult.pages.length + (coverPageHTML ? 1 : 0);
      const headerFooterResult = this.headerFooterSystem.generateForDocument(document, totalPages);
      
      if (headerFooterResult.warnings.length > 0) {
        this.warnings.push(...headerFooterResult.warnings);
      }
      if (headerFooterResult.errors.length > 0) {
        this.errors.push(...headerFooterResult.errors);
      }

      // Step 4: Render each page
      const pageHTMLs: string[] = [];

      // Add cover page if exists
      if (coverPageHTML) {
        pageHTMLs.push(this.wrapPageHTML(coverPageHTML, 1, totalPages, true));
      }

      // Render content pages
      for (let i = 0; i < pageBreakResult.pages.length; i++) {
        const pageNumber = i + 1 + (coverPageHTML ? 1 : 0);
        const pageContent = pageBreakResult.pages[i];
        
        // Get header/footer for this page
        let headerHTML = '';
        let footerHTML = '';
        
        if (this.config.includeHeaders && headerFooterResult.headers.length > i) {
          headerHTML = headerFooterResult.headers[i]?.headerHTML || '';
        }
        
        if (this.config.includeFooters && headerFooterResult.headers.length > i) {
          footerHTML = headerFooterResult.headers[i]?.footerHTML || '';
        }

        // Render page to HTML
        const pageHTML = this.renderPage(pageContent, headerHTML, footerHTML, pageNumber, totalPages);
        pageHTMLs.push(pageHTML);
      }

      // Step 5: Combine all pages into single HTML
      const fullHTML = this.combinePages(pageHTMLs, headerFooterResult.css);

      // Step 6: Convert HTML to PDF
      const pdfResult = await this.convertHTMLToPDF(fullHTML);

      // Step 7: Return result
      return {
        success: true,
        pdfData: pdfResult.data,
        fileSize: pdfResult.fileSize,
        pageCount: totalPages,
        warnings: this.warnings,
        errors: this.errors,
        metadata: {
          title: document.title,
          author: document.author || this.options.author,
          subject: document.metadata?.subject,
          keywords: document.metadata?.keywords,
          creator: this.options.creator,
          creationDate: new Date(),
          modificationDate: new Date()
        }
      };

    } catch (error) {
      this.errors.push(`PDF export failed: ${error instanceof Error ? error.message : String(error)}`);
      
      return {
        success: false,
        pageCount: 0,
        warnings: this.warnings,
        errors: this.errors,
        metadata: {
          title: document.title,
          author: document.author || this.options.author,
          creator: this.options.creator,
          creationDate: new Date()
        }
      };
    }
  }

  /**
   * Reset warning and error messages
   */
  private resetMessages(): void {
    this.warnings = [];
    this.errors = [];
  }

  /**
   * Get page size based on configuration
   */
  private getPageSize(): { width: number; height: number; unit: 'mm' } {
    const format = this.config.format;
    const orientation = this.config.orientation;

    // Standard page sizes in millimeters
    const pageSizes: Record<string, { width: number; height: number }> = {
      'A4': { width: 210, height: 297 },
      'A3': { width: 297, height: 420 },
      'Letter': { width: 216, height: 279 },
      'Legal': { width: 216, height: 356 }
    };

    let size = pageSizes[format] || pageSizes['A4'];
    
    // Adjust for orientation
    if (orientation === 'landscape') {
      size = { width: size.height, height: size.width };
    }

    return {
      width: size.width,
      height: size.height,
      unit: 'mm'
    };
  }

  /**
   * Wrap page HTML with page container
   */
  private wrapPageHTML(
    contentHTML: string,
    pageNumber: number,
    totalPages: number,
    isCoverPage: boolean = false
  ): string {
    const pageSize = this.getPageSize();
    const css = this.cssEngine.generateCSS(); // Use the main CSS generator
    
    return `
      <div class="page-container ${isCoverPage ? 'cover-page' : 'content-page'}"
           data-page-number="${pageNumber}"
           data-total-pages="${totalPages}"
           style="width: ${pageSize.width}mm; height: ${pageSize.height}mm;">
        <style>${css}</style>
        <div class="page-content">
          ${contentHTML}
        </div>
      </div>
    `;
  }

  /**
   * Render a single page
   */
  private renderPage(
    content: ContentElement[],
    headerHTML: string,
    footerHTML: string,
    pageNumber: number,
    totalPages: number
  ): string {
    let pageHTML = '';

    // Add header if exists
    if (headerHTML) {
      pageHTML += `<div class="page-header">${headerHTML}</div>`;
    }

    // Add main content - render each element
    pageHTML += `<div class="page-main-content">`;
    for (const element of content) {
      // Use HTMLRenderer's renderElement method (private, so we need a workaround)
      // For now, create a simple representation
      pageHTML += this.renderElementAsHTML(element);
    }
    pageHTML += `</div>`;

    // Add footer if exists
    if (footerHTML) {
      pageHTML += `<div class="page-footer">${footerHTML}</div>`;
    }

    // Wrap with page container
    return this.wrapPageHTML(pageHTML, pageNumber, totalPages);
  }

  /**
   * Render a single element as HTML (simplified)
   */
  private renderElementAsHTML(element: ContentElement): string {
    // Simplified rendering - in a real implementation, use HTMLRenderer
    switch (element.type) {
      case 'text':
        return `<span>${this.escapeHTML(String(element.content))}</span>`;
      case 'heading':
        const level = (element as any).level || 1;
        return `<h${level}>${this.escapeHTML(String(element.content))}</h${level}>`;
      case 'paragraph':
        return `<p>${this.escapeHTML(String(element.content))}</p>`;
      case 'list':
        const items = (element as any).content || [];
        const tag = (element as any).ordered ? 'ol' : 'ul';
        let listHTML = `<${tag}>`;
        for (const item of items) {
          listHTML += `<li>${this.escapeHTML(String(item.content || item))}</li>`;
        }
        listHTML += `</${tag}>`;
        return listHTML;
      case 'image':
        const imgSrc = (element as any).content?.url || (element as any).content?.dataUrl || '';
        const alt = (element as any).content?.alt || '';
        return `<img src="${imgSrc}" alt="${this.escapeHTML(alt)}" style="max-width: 100%;">`;
      default:
        return `<div class="${element.type}">${this.escapeHTML(String(element.content))}</div>`;
    }
  }

  /**
   * Escape HTML special characters
   */
  private escapeHTML(text: string): string {
    return text
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#039;');
  }

  /**
   * Combine all pages into single HTML document
   */
  private combinePages(pageHTMLs: string[], additionalCSS: string = ''): string {
    const pageSize = this.getPageSize();
    const globalCSS = this.cssEngine.generateCSS();
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PDF Export</title>
        <style>
          ${globalCSS}
          ${additionalCSS}
          
          body {
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            font-family: ${this.options.typography.fontFamily};
          }
          
          .pdf-document {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
          }
          
          .page-container {
            background: white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
            page-break-after: always;
            overflow: hidden;
            position: relative;
          }
          
          .page-content {
            padding: ${this.config.margins.top}mm ${this.config.margins.right}mm ${this.config.margins.bottom}mm ${this.config.margins.left}mm;
            height: 100%;
            box-sizing: border-box;
          }
          
          .page-header {
            position: absolute;
            top: 0;
            left: ${this.config.margins.left}mm;
            right: ${this.config.margins.right}mm;
            height: ${this.options.header.height}mm;
          }
          
          .page-footer {
            position: absolute;
            bottom: 0;
            left: ${this.config.margins.left}mm;
            right: ${this.config.margins.right}mm;
            height: ${this.options.footer.height}mm;
          }
          
          .page-main-content {
            margin-top: ${this.options.header.enabled ? this.options.header.height + 5 : 0}mm;
            margin-bottom: ${this.options.footer.enabled ? this.options.footer.height + 5 : 0}mm;
          }
          
          .cover-page .page-content {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
          }
          
          @media print {
            body {
              background-color: white;
            }
            
            .pdf-document {
              padding: 0;
            }
            
            .page-container {
              box-shadow: none;
              margin: 0;
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="pdf-document">
          ${pageHTMLs.join('\n')}
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Convert HTML to PDF using available methods
   */
  private async convertHTMLToPDF(html: string): Promise<{ data: Uint8Array | string; fileSize: number }> {
    // This is a placeholder implementation
    // In a real implementation, you would use:
    // 1. Puppeteer for server-side rendering
    // 2. jsPDF for client-side rendering
    // 3. A PDF library like PDFKit
    
    // For now, return a mock implementation
    console.log('Converting HTML to PDF...');
    console.log('HTML length:', html.length);
    
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Create a simple PDF mock (in reality, this would be actual PDF bytes)
    const mockPDF = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 595 842]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Generated by Oscar AI) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000010 00000 n
0000000053 00000 n
0000000106 00000 n
0000000172 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
281
%%EOF`;

    return {
      data: new TextEncoder().encode(mockPDF),
      fileSize: mockPDF.length
    };
  }

  /**
   * Export to PDF and save to file (browser environment)
   */
  public async exportToPDFAndDownload(
    documentContent: DocumentContent,
    filename: string = 'document.pdf'
  ): Promise<boolean> {
    const result = await this.exportToPDF(documentContent);
    
    if (!result.success || !result.pdfData) {
      console.error('PDF export failed:', result.errors);
      return false;
    }

    // In browser environment, trigger download
    if (typeof window !== 'undefined' && result.pdfData) {
      let pdfData: BlobPart;
      
      if (result.pdfData instanceof Uint8Array) {
        // Convert Uint8Array to ArrayBuffer for Blob
        pdfData = result.pdfData.buffer;
      } else if (typeof result.pdfData === 'string') {
        // Convert base64 string to binary
        const binary = atob(result.pdfData);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        pdfData = bytes.buffer;
      } else {
        console.error('Unsupported PDF data type');
        return false;
      }
      
      const blob = new Blob([pdfData], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = window.document.createElement('a');
      a.href = url;
      a.download = filename;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      return true;
    }

    return false;
  }

  /**
   * Export to PDF and return as base64 string
   */
  public async exportToPDFAsBase64(document: DocumentContent): Promise<string | null> {
    const result = await this.exportToPDF(document);
    
    if (!result.success || !result.pdfData) {
      return null;
    }

    if (typeof result.pdfData === 'string') {
      return result.pdfData;
    }

    // Convert Uint8Array to base64
    const binary = Array.from(result.pdfData).map(byte => String.fromCharCode(byte)).join('');
    return btoa(binary);
  }

  /**
   * Get export statistics
   */
  public getStatistics(): {
    warnings: string[];
    errors: string[];
    lastExportSize?: number;
    lastExportPageCount?: number;
  } {
    return {
      warnings: this.warnings,
      errors: this.errors
    };
  }
}