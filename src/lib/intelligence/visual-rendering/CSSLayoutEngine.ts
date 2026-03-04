import type { PageLayout } from './types/PageLayout';

/**
 * CSS layout engine responsible for generating CSS rules for typography, spacing, grids, flexbox, and print layout.
 */
export class CSSLayoutEngine {
  private pageLayout: PageLayout;

  constructor(pageLayout: PageLayout) {
    this.pageLayout = pageLayout;
  }

  /**
   * Generates CSS for the entire document.
   */
  generateDocumentCSS(): string {
    const { width, height, margins, orientation } = this.pageLayout;
    return `
@page {
  size: ${width} ${height};
  margin: ${margins.top} ${margins.right} ${margins.bottom} ${margins.left};
}

body {
  margin: 0;
  padding: 0;
  font-family: ${this.getTypographyFontFamily()};
  font-size: ${this.getBaseFontSize()};
  line-height: ${this.getLineHeight()};
  color: ${this.getTextColor()};
  background-color: ${this.getBackgroundColor()};
}

.document {
  width: ${width};
  height: ${height};
  margin: 0 auto;
  background: white;
  box-sizing: border-box;
}

.page {
  position: relative;
  width: ${width};
  height: ${height};
  page-break-after: always;
  box-sizing: border-box;
}

.content {
  padding: ${this.pageLayout.contentArea.top} ${this.pageLayout.contentArea.right} ${this.pageLayout.contentArea.bottom} ${this.pageLayout.contentArea.left};
  width: ${this.pageLayout.contentArea.width};
  height: ${this.pageLayout.contentArea.height};
  overflow: hidden;
}

.header, .footer {
  position: fixed;
  left: ${margins.left};
  right: ${margins.right};
  height: ${this.pageLayout.headerHeight};
  padding: 2mm;
  font-size: 10pt;
  box-sizing: border-box;
}

.header {
  top: ${margins.top};
  border-bottom: 1px solid #ccc;
}

.footer {
  bottom: ${margins.bottom};
  border-top: 1px solid #ccc;
}

.cover-page {
  width: ${width};
  height: ${height};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

${this.generateTypographyCSS()}
${this.generateSpacingCSS()}
${this.generateGridCSS()}
${this.generateFlexboxCSS()}
${this.generatePrintCSS()}
`;
  }

  /**
   * Generates CSS for typography (headings, paragraphs, lists, etc.).
   */
  private generateTypographyCSS(): string {
    return `
h1 { font-size: 2.5em; margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 700; }
h2 { font-size: 2em; margin-top: 1.2em; margin-bottom: 0.5em; font-weight: 600; }
h3 { font-size: 1.75em; margin-top: 1em; margin-bottom: 0.5em; font-weight: 600; }
h4 { font-size: 1.5em; margin-top: 0.8em; margin-bottom: 0.5em; font-weight: 500; }
h5 { font-size: 1.25em; margin-top: 0.6em; margin-bottom: 0.5em; font-weight: 500; }
h6 { font-size: 1em; margin-top: 0.5em; margin-bottom: 0.5em; font-weight: 500; }

p { margin-top: 0.5em; margin-bottom: 1em; }

ul, ol { margin-top: 0.5em; margin-bottom: 1em; padding-left: 2em; }

blockquote {
  margin: 1em 2em;
  padding-left: 1em;
  border-left: 4px solid #ccc;
  font-style: italic;
}

code, pre {
  font-family: 'Courier New', monospace;
  background-color: #f5f5f5;
  padding: 0.2em 0.4em;
  border-radius: 3px;
}

pre {
  padding: 1em;
  overflow-x: auto;
}
`;
  }

  /**
   * Generates CSS for spacing (margins, paddings, gaps).
   */
  private generateSpacingCSS(): string {
    return `
.mt-0 { margin-top: 0; }
.mt-1 { margin-top: 0.25em; }
.mt-2 { margin-top: 0.5em; }
.mt-3 { margin-top: 1em; }
.mt-4 { margin-top: 1.5em; }
.mt-5 { margin-top: 2em; }

.mb-0 { margin-bottom: 0; }
.mb-1 { margin-bottom: 0.25em; }
.mb-2 { margin-bottom: 0.5em; }
.mb-3 { margin-bottom: 1em; }
.mb-4 { margin-bottom: 1.5em; }
.mb-5 { margin-bottom: 2em; }

.p-0 { padding: 0; }
.p-1 { padding: 0.25em; }
.p-2 { padding: 0.5em; }
.p-3 { padding: 1em; }
.p-4 { padding: 1.5em; }
.p-5 { padding: 2em; }

.gap-1 { gap: 0.25em; }
.gap-2 { gap: 0.5em; }
.gap-3 { gap: 1em; }
.gap-4 { gap: 1.5em; }
.gap-5 { gap: 2em; }
`;
  }

  /**
   * Generates CSS for grid layouts.
   */
  private generateGridCSS(): string {
    return `
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1em;
}

.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }
.grid-6 { grid-template-columns: repeat(6, 1fr); }

.col-span-1 { grid-column: span 1; }
.col-span-2 { grid-column: span 2; }
.col-span-3 { grid-column: span 3; }
.col-span-4 { grid-column: span 4; }
.col-span-5 { grid-column: span 5; }
.col-span-6 { grid-column: span 6; }
.col-span-7 { grid-column: span 7; }
.col-span-8 { grid-column: span 8; }
.col-span-9 { grid-column: span 9; }
.col-span-10 { grid-column: span 10; }
.col-span-11 { grid-column: span 11; }
.col-span-12 { grid-column: span 12; }
`;
  }

  /**
   * Generates CSS for flexbox layouts.
   */
  private generateFlexboxCSS(): string {
    return `
.flex { display: flex; }
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.flex-nowrap { flex-wrap: nowrap; }

.justify-start { justify-content: flex-start; }
.justify-end { justify-content: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-around { justify-content: space-around; }

.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }
.items-center { align-items: center; }
.items-baseline { align-items: baseline; }
.items-stretch { align-items: stretch; }

.flex-1 { flex: 1 1 0%; }
.flex-auto { flex: 1 1 auto; }
.flex-none { flex: none; }
`;
  }

  /**
   * Generates CSS specific to print media.
   */
  private generatePrintCSS(): string {
    return `
@media print {
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page {
    page-break-inside: avoid;
  }
  .no-print {
    display: none !important;
  }
  .page-break {
    page-break-before: always;
  }
  .avoid-break {
    page-break-inside: avoid;
  }
}
`;
  }

  // Helper getters

  private getTypographyFontFamily(): string {
    return "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  }

  private getBaseFontSize(): string {
    return '12pt';
  }

  private getLineHeight(): string {
    return '1.5';
  }

  private getTextColor(): string {
    return '#333';
  }

  private getBackgroundColor(): string {
    return '#fff';
  }
}