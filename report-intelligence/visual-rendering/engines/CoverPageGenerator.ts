/**
 * Phase 15: HTML Rendering & Visual Reproduction Engine
 * Cover Page Generator
 * 
 * Responsible for generating branded cover pages with images,
 * logos, titles, and metadata for professional documents.
 */

import type {
  RenderingOptions,
  ContentElement,
  DocumentContent,
  ImageSource
} from '../types';

import { CSSLayoutEngine } from './CSSLayoutEngine';
import { HTMLRenderer } from './HTMLRenderer';

/**
 * Cover page configuration
 */
export interface CoverPageConfig {
  enabled: boolean;
  includeLogo: boolean;
  logoImage: ImageSource | null;
  logoPosition: 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom';
  logoMaxWidth: number; // in millimeters
  logoMaxHeight: number; // in millimeters
  includeTitle: boolean;
  titlePosition: 'center' | 'top' | 'bottom';
  titleFontSize: number;
  titleFontFamily: string;
  titleColor: string;
  titleBold: boolean;
  titleItalic: boolean;
  includeSubtitle: boolean;
  subtitleText: string;
  subtitlePosition: 'below-title' | 'above-title' | 'separate';
  subtitleFontSize: number;
  subtitleColor: string;
  includeAuthor: boolean;
  authorPosition: 'below-title' | 'bottom' | 'right';
  includeDate: boolean;
  datePosition: 'below-author' | 'bottom' | 'left';
  dateFormat: string;
  includeVersion: boolean;
  versionPosition: 'top-right' | 'bottom-right';
  includeConfidential: boolean;
  confidentialText: string;
  confidentialPosition: 'top' | 'bottom' | 'watermark';
  includeBackgroundImage: boolean;
  backgroundImage: ImageSource | null;
  backgroundOpacity: number; // 0-1
  backgroundColor: string;
  borderEnabled: boolean;
  borderStyle: 'solid' | 'dashed' | 'double' | 'none';
  borderThickness: number;
  borderColor: string;
  marginTop: number; // in millimeters
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
}

/**
 * Default cover page configuration
 */
export const DEFAULT_COVER_PAGE_CONFIG: CoverPageConfig = {
  enabled: true,
  includeLogo: true,
  logoImage: null,
  logoPosition: 'top-center',
  logoMaxWidth: 100,
  logoMaxHeight: 50,
  includeTitle: true,
  titlePosition: 'center',
  titleFontSize: 36,
  titleFontFamily: 'Arial, sans-serif',
  titleColor: '#000000',
  titleBold: true,
  titleItalic: false,
  includeSubtitle: false,
  subtitleText: '',
  subtitlePosition: 'below-title',
  subtitleFontSize: 18,
  subtitleColor: '#666666',
  includeAuthor: true,
  authorPosition: 'below-title',
  includeDate: true,
  datePosition: 'below-author',
  dateFormat: 'MMMM dd, yyyy',
  includeVersion: true,
  versionPosition: 'top-right',
  includeConfidential: false,
  confidentialText: 'CONFIDENTIAL',
  confidentialPosition: 'top',
  includeBackgroundImage: false,
  backgroundImage: null,
  backgroundOpacity: 0.1,
  backgroundColor: '#ffffff',
  borderEnabled: true,
  borderStyle: 'solid',
  borderThickness: 2,
  borderColor: '#cccccc',
  marginTop: 30,
  marginBottom: 30,
  marginLeft: 30,
  marginRight: 30
};

/**
 * Cover page generation result
 */
export interface CoverPageResult {
  html: string;
  css: string;
  heightPx: number;
  warnings: string[];
  errors: string[];
}

/**
 * Cover Page Generator
 */
export class CoverPageGenerator {
  private options: RenderingOptions;
  private config: CoverPageConfig;
  private cssEngine: CSSLayoutEngine;
  private htmlRenderer: HTMLRenderer;
  private warnings: string[] = [];
  private errors: string[] = [];

  constructor(
    options: RenderingOptions,
    config: Partial<CoverPageConfig> = {}
  ) {
    this.options = options;
    this.config = { ...DEFAULT_COVER_PAGE_CONFIG, ...config };
    this.cssEngine = new CSSLayoutEngine(options);
    this.htmlRenderer = new HTMLRenderer(options);
  }

  /**
   * Generate cover page for a document
   */
  public generateCoverPage(document: DocumentContent): CoverPageResult {
    this.resetMessages();

    if (!this.config.enabled) {
      return {
        html: '',
        css: '',
        heightPx: 0,
        warnings: this.warnings,
        errors: this.errors
      };
    }

    // Calculate cover page height based on content
    const estimatedHeightPx = this.estimateCoverPageHeight();

    // Generate CSS
    const css = this.generateCoverPageCSS();

    // Generate HTML
    const html = this.generateCoverPageHTML(document);

    return {
      html,
      css,
      heightPx: estimatedHeightPx,
      warnings: this.warnings,
      errors: this.errors
    };
  }

  /**
   * Generate cover page HTML
   */
  private generateCoverPageHTML(document: DocumentContent): string {
    let html = '<div class="cover-page">\n';

    // Background image
    if (this.config.includeBackgroundImage && this.config.backgroundImage) {
      const bgUrl = this.config.backgroundImage.url || this.config.backgroundImage.dataUrl || '';
      if (bgUrl) {
        const opacity = this.config.backgroundOpacity;
        html += `  <div class="cover-background" style="background-image: url('${bgUrl}'); opacity: ${opacity};"></div>\n`;
      }
    }

    // Confidential watermark
    if (this.config.includeConfidential) {
      const confidentialClass = `confidential-${this.config.confidentialPosition}`;
      html += `  <div class="confidential ${confidentialClass}">${this.escapeHTML(this.config.confidentialText)}</div>\n`;
    }

    // Version
    if (this.config.includeVersion && document.version) {
      const versionClass = `version-${this.config.versionPosition}`;
      html += `  <div class="document-version ${versionClass}">Version: ${this.escapeHTML(document.version)}</div>\n`;
    }

    // Logo
    if (this.config.includeLogo && this.config.logoImage) {
      const logoUrl = this.config.logoImage.url || this.config.logoImage.dataUrl || '';
      if (logoUrl) {
        const logoClass = `logo-${this.config.logoPosition}`;
        const maxWidthPx = this.mmToPx(this.config.logoMaxWidth);
        const maxHeightPx = this.mmToPx(this.config.logoMaxHeight);
        
        html += `  <div class="cover-logo ${logoClass}">\n`;
        html += `    <img src="${logoUrl}" alt="Logo" style="max-width: ${maxWidthPx}px; max-height: ${maxHeightPx}px;" />\n`;
        html += `  </div>\n`;
      }
    }

    // Main content container
    html += '  <div class="cover-content">\n';

    // Title
    if (this.config.includeTitle) {
      const titleClass = `title-${this.config.titlePosition}`;
      const titleStyle = `font-size: ${this.config.titleFontSize}pt; color: ${this.config.titleColor}; font-family: ${this.config.titleFontFamily};`;
      const fontWeight = this.config.titleBold ? 'bold' : 'normal';
      const fontStyle = this.config.titleItalic ? 'italic' : 'normal';
      
      html += `    <div class="cover-title ${titleClass}" style="${titleStyle} font-weight: ${fontWeight}; font-style: ${fontStyle};">\n`;
      html += `      ${this.escapeHTML(document.title)}\n`;
      html += `    </div>\n`;
    }

    // Subtitle
    if (this.config.includeSubtitle && this.config.subtitleText) {
      const subtitleClass = `subtitle-${this.config.subtitlePosition}`;
      const subtitleStyle = `font-size: ${this.config.subtitleFontSize}pt; color: ${this.config.subtitleColor};`;
      
      html += `    <div class="cover-subtitle ${subtitleClass}" style="${subtitleStyle}">\n`;
      html += `      ${this.escapeHTML(this.config.subtitleText)}\n`;
      html += `    </div>\n`;
    }

    // Author
    if (this.config.includeAuthor && document.author) {
      const authorClass = `author-${this.config.authorPosition}`;
      html += `    <div class="cover-author ${authorClass}">\n`;
      html += `      ${this.escapeHTML(document.author)}\n`;
      html += `    </div>\n`;
    }

    // Date
    if (this.config.includeDate && document.date) {
      const dateClass = `date-${this.config.datePosition}`;
      const dateStr = this.formatDate(document.date, this.config.dateFormat);
      html += `    <div class="cover-date ${dateClass}">\n`;
      html += `      ${this.escapeHTML(dateStr)}\n`;
      html += `    </div>\n`;
    }

    html += '  </div>\n'; // Close cover-content

    // Border
    if (this.config.borderEnabled && this.config.borderStyle !== 'none') {
      const borderStyle = `border: ${this.config.borderThickness}px ${this.config.borderStyle} ${this.config.borderColor}`;
      html += `  <div class="cover-border" style="${borderStyle}"></div>\n`;
    }

    html += '</div>\n'; // Close cover-page

    return html;
  }

  /**
   * Generate cover page CSS
   */
  private generateCoverPageCSS(): string {
    const marginTopPx = this.mmToPx(this.config.marginTop);
    const marginBottomPx = this.mmToPx(this.config.marginBottom);
    const marginLeftPx = this.mmToPx(this.config.marginLeft);
    const marginRightPx = this.mmToPx(this.config.marginRight);

    const cssRules: string[] = [];

    cssRules.push(`
      .cover-page {
        position: relative;
        width: 100%;
        min-height: 100vh;
        background-color: ${this.config.backgroundColor};
        margin: 0;
        padding: ${marginTopPx}px ${marginRightPx}px ${marginBottomPx}px ${marginLeftPx}px;
        box-sizing: border-box;
        page-break-after: always;
      }
      
      .cover-background {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        z-index: 0;
      }
      
      .cover-content {
        position: relative;
        z-index: 1;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      
      .cover-border {
        position: absolute;
        top: ${marginTopPx / 2}px;
        left: ${marginLeftPx / 2}px;
        right: ${marginRightPx / 2}px;
        bottom: ${marginBottomPx / 2}px;
        pointer-events: none;
      }
      
      /* Logo positioning */
      .logo-top-left {
        position: absolute;
        top: ${marginTopPx}px;
        left: ${marginLeftPx}px;
      }
      
      .logo-top-center {
        position: absolute;
        top: ${marginTopPx}px;
        left: 50%;
        transform: translateX(-50%);
      }
      
      .logo-top-right {
        position: absolute;
        top: ${marginTopPx}px;
        right: ${marginRightPx}px;
      }
      
      .logo-center {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      
      .logo-bottom {
        position: absolute;
        bottom: ${marginBottomPx}px;
        left: 50%;
        transform: translateX(-50%);
      }
      
      /* Title positioning */
      .title-center {
        text-align: center;
        margin: 40px 0;
      }
      
      .title-top {
        text-align: center;
        margin-top: 80px;
        margin-bottom: 40px;
      }
      
      .title-bottom {
        text-align: center;
        margin-top: auto;
        margin-bottom: 80px;
      }
      
      /* Subtitle positioning */
      .subtitle-below-title {
        text-align: center;
        margin-top: -20px;
        margin-bottom: 40px;
      }
      
      .subtitle-above-title {
        text-align: center;
        margin-bottom: 20px;
      }
      
      .subtitle-separate {
        text-align: center;
        margin: 60px 0;
      }
      
      /* Author positioning */
      .author-below-title {
        text-align: center;
        margin: 20px 0;
        font-size: 16pt;
      }
      
      .author-bottom {
        position: absolute;
        bottom: ${marginBottomPx + 40}px;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        font-size: 16pt;
      }
      
      .author-right {
        position: absolute;
        bottom: ${marginBottomPx + 40}px;
        right: ${marginRightPx + 40}px;
        text-align: right;
        font-size: 16pt;
      }
      
      /* Date positioning */
      .date-below-author {
        text-align: center;
        margin: 10px 0;
        font-size: 14pt;
      }
      
      .date-bottom {
        position: absolute;
        bottom: ${marginBottomPx + 20}px;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        font-size: 14pt;
      }
      
      .date-left {
        position: absolute;
        bottom: ${marginBottomPx + 20}px;
        left: ${marginLeftPx + 40}px;
        text-align: left;
        font-size: 14pt;
      }
      
      /* Version positioning */
      .version-top-right {
        position: absolute;
        top: ${marginTopPx}px;
        right: ${marginRightPx}px;
        font-size: 12pt;
        color: #666;
      }
      
      .version-bottom-right {
        position: absolute;
        bottom: ${marginBottomPx}px;
        right: ${marginRightPx}px;
        font-size: 12pt;
        color: #666;
      }
      
      /* Confidential positioning */
      .confidential-top {
        position: absolute;
        top: ${marginTopPx}px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 24pt;
        color: rgba(255, 0, 0, 0.3);
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 10px;
      }
      
      .confidential-bottom {
        position: absolute;
        bottom: ${marginBottomPx}px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 24pt;
        color: rgba(255, 0, 0, 0.3);
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 10px;
      }
      
      .confidential-watermark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 60pt;
        color: rgba(255, 0, 0, 0.1);
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 20px;
        white-space: nowrap;
        z-index: 0;
      }
      
      /* Print styles */
      @media print {
        .cover-page {
          page-break-after: always;
          break-after: page;
        }
      }
    `);

    return cssRules.join('\n');
  }

  /**
   * Estimate cover page height in pixels
   */
  private estimateCoverPageHeight(): number {
    // Base height is the page height minus margins
    const pageHeight = this.calculatePageHeightPx();
    const marginTopPx = this.mmToPx(this.config.marginTop);
    const marginBottomPx = this.mmToPx(this.config.marginBottom);
    
    let contentHeight = 0;
    
    // Add estimated heights for each element
    if (this.config.includeLogo) contentHeight += this.mmToPx(this.config.logoMaxHeight);
    if (this.config.includeTitle) contentHeight += this.config.titleFontSize * 4; // Approximate
    if (this.config.includeSubtitle) contentHeight += this.config.subtitleFontSize * 2;
    if (this.config.includeAuthor) contentHeight += 40; // Approximate
    if (this.config.includeDate) contentHeight += 30;
    
    // Add spacing between elements
    contentHeight += 100; // Padding and margins
    
    // Total height is max of content height or page height
    const totalHeight = Math.max(
      contentHeight + marginTopPx + marginBottomPx,
      pageHeight
    );
    
    return Math.round(totalHeight);
  }
/**
 * Calculate page height in pixels
 */
private calculatePageHeightPx(): number {
  // Get page dimensions from rendering options
  const layout = this.options.layout;
  
  // Convert page size to pixels (assuming A4 portrait by default)
  let heightMm = 297; // A4 height in mm
  
  if (layout.size === 'A4') {
    heightMm = 297;
  } else if (layout.size === 'A3') {
    heightMm = 420;
  } else if (layout.size === 'Letter') {
    heightMm = 279.4;
  } else if (layout.size === 'Legal') {
    heightMm = 355.6;
  } else if (layout.size === 'Custom' && layout.customHeight) {
    heightMm = layout.customHeight;
  }
  
  // Adjust for orientation
  if (layout.orientation === 'landscape') {
    // For landscape, we need the width as height for cover page
    // This is a simplification - actual implementation would be more complex
    if (layout.size === 'A4') {
      heightMm = 210;
    } else if (layout.size === 'A3') {
      heightMm = 297;
    } else if (layout.size === 'Letter') {
      heightMm = 215.9;
    } else if (layout.size === 'Legal') {
      heightMm = 215.9;
    }
  }
  
  // Convert mm to pixels (96 DPI)
  const mmToInches = heightMm / 25.4;
  const inchesToPixels = mmToInches * 96;
  return Math.round(inchesToPixels);
}

/**
 * Convert millimeters to pixels
 */
private mmToPx(mm: number): number {
  const mmToInches = mm / 25.4;
  const inchesToPixels = mmToInches * 96;
  return Math.round(inchesToPixels);
}

/**
 * Format date according to format string
 */
private formatDate(date: Date, format: string): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthShortNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const dayNames = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];
  const dayShortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return format
    .replace(/yyyy/g, year.toString())
    .replace(/yy/g, year.toString().slice(-2))
    .replace(/MMMM/g, monthNames[month - 1])
    .replace(/MMM/g, monthShortNames[month - 1])
    .replace(/MM/g, month.toString().padStart(2, '0'))
    .replace(/M/g, month.toString())
    .replace(/dddd/g, dayNames[date.getDay()])
    .replace(/ddd/g, dayShortNames[date.getDay()])
    .replace(/dd/g, day.toString().padStart(2, '0'))
    .replace(/d/g, day.toString())
    .replace(/HH/g, date.getHours().toString().padStart(2, '0'))
    .replace(/H/g, date.getHours().toString())
    .replace(/hh/g, (date.getHours() % 12 || 12).toString().padStart(2, '0'))
    .replace(/h/g, (date.getHours() % 12 || 12).toString())
    .replace(/mm/g, date.getMinutes().toString().padStart(2, '0'))
    .replace(/m/g, date.getMinutes().toString())
    .replace(/ss/g, date.getSeconds().toString().padStart(2, '0'))
    .replace(/s/g, date.getSeconds().toString())
    .replace(/tt/g, date.getHours() < 12 ? 'AM' : 'PM')
    .replace(/t/g, date.getHours() < 12 ? 'A' : 'P');
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
 * Update cover page configuration
 */
public updateConfig(newConfig: Partial<CoverPageConfig>): void {
  this.config = { ...this.config, ...newConfig };
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
    

