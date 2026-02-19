/**
 * Phase 15: HTML Rendering & Visual Reproduction Engine
 * Header/Footer System
 * 
 * Responsible for generating and managing persistent headers and footers
 * across multiple pages in a document.
 */

import type {
  RenderingOptions,
  ContentElement,
  DocumentContent,
  PageContent
} from '../types';

import { CSSLayoutEngine } from './CSSLayoutEngine';
import { HTMLRenderer } from './HTMLRenderer';

/**
 * Header/Footer configuration
 */
export interface HeaderFooterConfig {
  enabled: boolean;
  includePageNumbers: boolean;
  pageNumberFormat: string; // e.g., "Page {page} of {total}"
  includeDocumentTitle: boolean;
  includeDate: boolean;
  includeAuthor: boolean;
  includeCustomText: boolean;
  customText: string;
  alignment: 'left' | 'center' | 'right';
  height: number; // in millimeters
  marginFromEdge: number; // in millimeters
  separatorLine: boolean;
  separatorStyle: 'solid' | 'dashed' | 'dotted' | 'none';
  separatorThickness: number;
  separatorColor: string;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
}

/**
 * Default header/footer configuration
 */
export const DEFAULT_HEADER_CONFIG: HeaderFooterConfig = {
  enabled: true,
  includePageNumbers: true,
  pageNumberFormat: 'Page {page} of {total}',
  includeDocumentTitle: true,
  includeDate: true,
  includeAuthor: false,
  includeCustomText: false,
  customText: '',
  alignment: 'center',
  height: 15,
  marginFromEdge: 10,
  separatorLine: true,
  separatorStyle: 'solid',
  separatorThickness: 1,
  separatorColor: '#cccccc',
  backgroundColor: '#ffffff',
  textColor: '#333333',
  fontSize: 10,
  fontFamily: 'Arial, sans-serif',
  bold: false,
  italic: false
};

export const DEFAULT_FOOTER_CONFIG: HeaderFooterConfig = {
  enabled: true,
  includePageNumbers: true,
  pageNumberFormat: 'Page {page} of {total}',
  includeDocumentTitle: false,
  includeDate: true,
  includeAuthor: true,
  includeCustomText: false,
  customText: '',
  alignment: 'center',
  height: 15,
  marginFromEdge: 10,
  separatorLine: true,
  separatorStyle: 'solid',
  separatorThickness: 1,
  separatorColor: '#cccccc',
  backgroundColor: '#ffffff',
  textColor: '#333333',
  fontSize: 10,
  fontFamily: 'Arial, sans-serif',
  bold: false,
  italic: false
};

/**
 * Header/Footer content for a specific page
 */
export interface PageHeaderFooter {
  headerHTML: string;
  footerHTML: string;
  headerHeightPx: number;
  footerHeightPx: number;
  pageNumber: number;
  totalPages: number;
}

/**
 * Header/Footer generation result
 */
export interface HeaderFooterResult {
  headers: PageHeaderFooter[];
  totalPages: number;
  headerHeightPx: number;
  footerHeightPx: number;
  css: string;
  warnings: string[];
  errors: string[];
}

/**
 * Header/Footer System
 */
export class HeaderFooterSystem {
  private options: RenderingOptions;
  private headerConfig: HeaderFooterConfig;
  private footerConfig: HeaderFooterConfig;
  private cssEngine: CSSLayoutEngine;
  private htmlRenderer: HTMLRenderer;
  private warnings: string[] = [];
  private errors: string[] = [];

  constructor(
    options: RenderingOptions,
    headerConfig: Partial<HeaderFooterConfig> = {},
    footerConfig: Partial<HeaderFooterConfig> = {}
  ) {
    this.options = options;
    this.headerConfig = { ...DEFAULT_HEADER_CONFIG, ...headerConfig };
    this.footerConfig = { ...DEFAULT_FOOTER_CONFIG, ...footerConfig };
    this.cssEngine = new CSSLayoutEngine(options);
    this.htmlRenderer = new HTMLRenderer(options);
  }

  /**
   * Generate headers and footers for all pages
   */
  public generateForDocument(
    document: DocumentContent,
    totalPages: number
  ): HeaderFooterResult {
    this.resetMessages();

    if (!this.headerConfig.enabled && !this.footerConfig.enabled) {
      return {
        headers: [],
        totalPages,
        headerHeightPx: 0,
        footerHeightPx: 0,
        css: '',
        warnings: this.warnings,
        errors: this.errors
      };
    }

    // Calculate heights in pixels
    const headerHeightPx = this.calculateHeightPx(this.headerConfig.height);
    const footerHeightPx = this.calculateHeightPx(this.footerConfig.height);

    // Generate CSS for headers/footers
    const css = this.generateHeaderFooterCSS();

    // Generate headers and footers for each page
    const headers: PageHeaderFooter[] = [];
    
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      const pageHeaderFooter = this.generateForPage(
        document,
        pageNumber,
        totalPages,
        headerHeightPx,
        footerHeightPx
      );
      headers.push(pageHeaderFooter);
    }

    return {
      headers,
      totalPages,
      headerHeightPx,
      footerHeightPx,
      css,
      warnings: this.warnings,
      errors: this.errors
    };
  }

  /**
   * Generate header/footer for a specific page
   */
  private generateForPage(
    document: DocumentContent,
    pageNumber: number,
    totalPages: number,
    headerHeightPx: number,
    footerHeightPx: number
  ): PageHeaderFooter {
    const headerHTML = this.headerConfig.enabled
      ? this.generateHeaderHTML(document, pageNumber, totalPages)
      : '';

    const footerHTML = this.footerConfig.enabled
      ? this.generateFooterHTML(document, pageNumber, totalPages)
      : '';

    return {
      headerHTML,
      footerHTML,
      headerHeightPx,
      footerHeightPx,
      pageNumber,
      totalPages
    };
  }

  /**
   * Generate header HTML
   */
  private generateHeaderHTML(
    document: DocumentContent,
    pageNumber: number,
    totalPages: number
  ): string {
    const parts: string[] = [];

    // Document title
    if (this.headerConfig.includeDocumentTitle) {
      parts.push(`<span class="header-title">${this.escapeHTML(document.title)}</span>`);
    }

    // Date
    if (this.headerConfig.includeDate && document.date) {
      const dateStr = document.date.toLocaleDateString();
      parts.push(`<span class="header-date">${this.escapeHTML(dateStr)}</span>`);
    }

    // Author
    if (this.headerConfig.includeAuthor && document.author) {
      parts.push(`<span class="header-author">${this.escapeHTML(document.author)}</span>`);
    }

    // Custom text
    if (this.headerConfig.includeCustomText && this.headerConfig.customText) {
      parts.push(`<span class="header-custom">${this.escapeHTML(this.headerConfig.customText)}</span>`);
    }

    // Page numbers
    if (this.headerConfig.includePageNumbers) {
      const pageNumberText = this.formatPageNumber(
        this.headerConfig.pageNumberFormat,
        pageNumber,
        totalPages
      );
      parts.push(`<span class="header-page-number">${this.escapeHTML(pageNumberText)}</span>`);
    }

    // Join parts with separators
    let content = parts.join(' <span class="header-separator">|</span> ');

    // Wrap in container with alignment
    const alignmentClass = `header-align-${this.headerConfig.alignment}`;
    
    let html = `<div class="document-header ${alignmentClass}">\n`;
    html += `  <div class="header-content">${content}</div>\n`;
    
    // Separator line
    if (this.headerConfig.separatorLine && this.headerConfig.separatorStyle !== 'none') {
      const lineStyle = `border-bottom: ${this.headerConfig.separatorThickness}px ${this.headerConfig.separatorStyle} ${this.headerConfig.separatorColor}`;
      html += `  <div class="header-separator-line" style="${lineStyle}"></div>\n`;
    }
    
    html += `</div>\n`;
    
    return html;
  }

  /**
   * Generate footer HTML
   */
  private generateFooterHTML(
    document: DocumentContent,
    pageNumber: number,
    totalPages: number
  ): string {
    const parts: string[] = [];

    // Document title
    if (this.footerConfig.includeDocumentTitle) {
      parts.push(`<span class="footer-title">${this.escapeHTML(document.title)}</span>`);
    }

    // Date
    if (this.footerConfig.includeDate && document.date) {
      const dateStr = document.date.toLocaleDateString();
      parts.push(`<span class="footer-date">${this.escapeHTML(dateStr)}</span>`);
    }

    // Author
    if (this.footerConfig.includeAuthor && document.author) {
      parts.push(`<span class="footer-author">${this.escapeHTML(document.author)}</span>`);
    }

    // Custom text
    if (this.footerConfig.includeCustomText && this.footerConfig.customText) {
      parts.push(`<span class="footer-custom">${this.escapeHTML(this.footerConfig.customText)}</span>`);
    }

    // Page numbers
    if (this.footerConfig.includePageNumbers) {
      const pageNumberText = this.formatPageNumber(
        this.footerConfig.pageNumberFormat,
        pageNumber,
        totalPages
      );
      parts.push(`<span class="footer-page-number">${this.escapeHTML(pageNumberText)}</span>`);
    }

    // Join parts with separators
    let content = parts.join(' <span class="footer-separator">|</span> ');

    // Wrap in container with alignment
    const alignmentClass = `footer-align-${this.footerConfig.alignment}`;
    
    let html = `<div class="document-footer ${alignmentClass}">\n`;
    
    // Separator line
    if (this.footerConfig.separatorLine && this.footerConfig.separatorStyle !== 'none') {
      const lineStyle = `border-top: ${this.footerConfig.separatorThickness}px ${this.footerConfig.separatorStyle} ${this.footerConfig.separatorColor}`;
      html += `  <div class="footer-separator-line" style="${lineStyle}"></div>\n`;
    }
    
    html += `  <div class="footer-content">${content}</div>\n`;
    html += `</div>\n`;
    
    return html;
  }

  /**
   * Format page number according to format string
   */
  private formatPageNumber(
    format: string,
    pageNumber: number,
    totalPages: number
  ): string {
    return format
      .replace(/{page}/g, pageNumber.toString())
      .replace(/{total}/g, totalPages.toString())
      .replace(/{page-padded}/g, pageNumber.toString().padStart(2, '0'))
      .replace(/{total-padded}/g, totalPages.toString().padStart(2, '0'));
  }

  /**
   * Generate CSS for headers and footers
   */
  private generateHeaderFooterCSS(): string {
    const cssRules: string[] = [];

    // Header styles
    if (this.headerConfig.enabled) {
      cssRules.push(`
        .document-header {
          position: fixed;
          top: ${this.calculateMarginPx(this.headerConfig.marginFromEdge)}px;
          left: 0;
          right: 0;
          height: ${this.calculateHeightPx(this.headerConfig.height)}px;
          background-color: ${this.headerConfig.backgroundColor};
          color: ${this.headerConfig.textColor};
          font-family: ${this.headerConfig.fontFamily};
          font-size: ${this.headerConfig.fontSize}pt;
          z-index: 1000;
          box-sizing: border-box;
          padding: 4px 20px;
        }
        
        .header-content {
          height: 100%;
          display: flex;
          align-items: center;
        }
        
        .header-align-left .header-content {
          justify-content: flex-start;
        }
        
        .header-align-center .header-content {
          justify-content: center;
        }
        
        .header-align-right .header-content {
          justify-content: flex-end;
        }
        
        .header-title {
          font-weight: ${this.headerConfig.bold ? 'bold' : 'normal'};
          font-style: ${this.headerConfig.italic ? 'italic' : 'normal'};
        }
        
        .header-date,
        .header-author,
        .header-custom,
        .header-page-number {
          font-weight: ${this.headerConfig.bold ? 'bold' : 'normal'};
          font-style: ${this.headerConfig.italic ? 'italic' : 'normal'};
        }
        
        .header-separator {
          margin: 0 8px;
          color: #999;
        }
        
        .header-separator-line {
          position: absolute;
          bottom: 0;
          left: 20px;
          right: 20px;
        }
      `);
    }

    // Footer styles
    if (this.footerConfig.enabled) {
      cssRules.push(`
        .document-footer {
          position: fixed;
          bottom: ${this.calculateMarginPx(this.footerConfig.marginFromEdge)}px;
          left: 0;
          right: 0;
          height: ${this.calculateHeightPx(this.footerConfig.height)}px;
          background-color: ${this.footerConfig.backgroundColor};
          color: ${this.footerConfig.textColor};
          font-family: ${this.footerConfig.fontFamily};
          font-size: ${this.footerConfig.fontSize}pt;
          z-index: 1000;
          box-sizing: border-box;
          padding: 4px 20px;
        }
        
        .footer-content {
          height: 100%;
          display: flex;
          align-items: center;
        }
        
        .footer-align-left .footer-content {
          justify-content: flex-start;
        }
        
        .footer-align-center .footer-content {
          justify-content: center;
        }
        
        .footer-align-right .footer-content {
          justify-content: flex-end;
        }
        
        .footer-title {
          font-weight: ${this.footerConfig.bold ? 'bold' : 'normal'};
          font-style: ${this.footerConfig.italic ? 'italic' : 'normal'};
        }
        
        .footer-date,
        .footer-author,
        .footer-custom,
        .footer-page-number {
          font-weight: ${this.footerConfig.bold ? 'bold' : 'normal'};
          font-style: ${this.footerConfig.italic ? 'italic' : 'normal'};
        }
        
        .footer-separator {
          margin: 0 8px;
          color: #999;
        }
        
        .footer-separator-line {
          position: absolute;
          top: 0;
          left: 20px;
          right: 20px;
        }
      `);
    }

    // Page break adjustments for headers/footers
    cssRules.push(`
      @media print {
        .document-header,
        .document-footer {
          position: fixed;
        }
        
        body {
          margin-top: ${this.headerConfig.enabled ? this.calculateHeightPx(this.headerConfig.height) + this.calculateMarginPx(this.headerConfig.marginFromEdge) + 10 : 0}px;
          margin-bottom: ${this.footerConfig.enabled ? this.calculateHeightPx(this.footerConfig.height) + this.calculateMarginPx(this.footerConfig.marginFromEdge) + 10 : 0}px;
        }
      }
    `);

    return cssRules.join('\n');
  }

  /**
   * Calculate height in pixels from millimeters
   */
  private calculateHeightPx(mm: number): number {
    // Convert mm to pixels (assuming 96 DPI)
    const mmToInches = mm / 25.4;
    const inchesToPixels = mmToInches * 96;
    return Math.round(inchesToPixels);
  }

  /**
   * Calculate margin in pixels from millimeters
   */
  private calculateMarginPx(mm: number): number {
    return this.calculateHeightPx(mm);
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
   * Reset warnings and errors
   */
  private resetMessages(): void {
    this.warnings = [];
    this.errors = [];
  }

  /**
   * Update header configuration
   */
  public updateHeaderConfig(newConfig: Partial<HeaderFooterConfig>): void {
    this.headerConfig = { ...this.headerConfig, ...newConfig };
  }

  /**
   * Update footer configuration
   */
  public updateFooterConfig(newConfig: Partial<HeaderFooterConfig>): void {
    this.footerConfig = { ...this.footerConfig, ...newConfig };
  }

  /**
   * Update rendering options
   */
  public updateOptions(newOptions: Partial<RenderingOptions>): void {
    this.options = { ...this.options, ...newOptions };
    this.cssEngine.updateOptions(newOptions);
    this.htmlRenderer.updateOptions(newOptions);
  }

  /**
   * Get current warnings
   */
  public getWarnings(): string[] {
    return [...this.warnings];
  }

  /**
   * Get current errors
   */
  public getErrors(): string[] {
    return [...this.errors];
  }

  /**
   * Clear warnings and errors
   */
  public clearMessages(): void {
    this.warnings = [];
    this.errors = [];
  }
}