/**
 * Phase 15: HTML Rendering & Visual Reproduction Engine
 * HTML Renderer
 * 
 * Responsible for converting content elements into HTML markup,
 * applying styles, and generating complete HTML documents.
 */

import type {
  RenderingOptions,
  ContentElement,
  DocumentContent,
  PageContent,
  TextElement,
  HeadingElement,
  ParagraphElement,
  ListElement,
  ListItemElement,
  TableElement,
  TableRowElement,
  TableCellElement,
  ImageElement,
  CodeElement,
  QuoteElement,
  DividerElement,
  PageBreakElement,
  SectionElement,
  CustomElement
} from '../types';

import { CSSLayoutEngine } from './CSSLayoutEngine';

/**
 * HTML rendering options
 */
export interface HTMLRenderingOptions {
  includeDoctype: boolean;
  includeHTMLTags: boolean;
  includeHead: boolean;
  includeBody: boolean;
  includeStyles: boolean;
  includeScripts: boolean;
  prettyPrint: boolean;
  indentSize: number;
  selfCloseVoidElements: boolean;
  escapeHTML: boolean;
}

/**
 * Default HTML rendering options
 */
export const DEFAULT_HTML_OPTIONS: HTMLRenderingOptions = {
  includeDoctype: true,
  includeHTMLTags: true,
  includeHead: true,
  includeBody: true,
  includeStyles: true,
  includeScripts: false,
  prettyPrint: true,
  indentSize: 2,
  selfCloseVoidElements: true,
  escapeHTML: true
};

/**
 * HTML rendering result
 */
export interface HTMLRenderingResult {
  html: string;
  css: string;
  pageCount: number;
  elementCount: number;
  warnings: string[];
  errors: string[];
  metadata: {
    title: string;
    author?: string;
    date?: Date;
    language: string;
    generator: string;
  };
}

/**
 * HTML Renderer
 */
export class HTMLRenderer {
  private options: RenderingOptions;
  private htmlOptions: HTMLRenderingOptions;
  private cssEngine: CSSLayoutEngine;
  private elementCount: number = 0;
  private warnings: string[] = [];
  private errors: string[] = [];
  
  constructor(
    options: RenderingOptions,
    htmlOptions: Partial<HTMLRenderingOptions> = {}
  ) {
    this.options = options;
    this.htmlOptions = { ...DEFAULT_HTML_OPTIONS, ...htmlOptions };
    this.cssEngine = new CSSLayoutEngine(options);
  }
  
  /**
   * Render complete document
   */
  public renderDocument(document: DocumentContent): HTMLRenderingResult {
    this.resetCounters();
    
    // Generate CSS
    const css = this.cssEngine.generateCSS();
    
    // Generate HTML structure
    let html = '';
    
    if (this.htmlOptions.includeDoctype) {
      html += '<!DOCTYPE html>\n';
    }
    
    if (this.htmlOptions.includeHTMLTags) {
      html += '<html lang="' + (this.options.language || 'en') + '">\n';
    }
    
    // Head section
    if (this.htmlOptions.includeHead) {
      html += this.renderHead(document);
    }
    
    // Body section
    if (this.htmlOptions.includeBody) {
      html += '<body>\n';
    }
    
    // Document content
    html += this.renderDocumentContent(document);
    
    if (this.htmlOptions.includeBody) {
      html += '</body>\n';
    }
    
    if (this.htmlOptions.includeHTMLTags) {
      html += '</html>';
    }
    
    // Pretty print if requested
    if (this.htmlOptions.prettyPrint) {
      html = this.prettyPrintHTML(html);
    }
    
    return {
      html,
      css,
      pageCount: 1, // Simplified - would calculate actual pages
      elementCount: this.elementCount,
      warnings: this.warnings,
      errors: this.errors,
      metadata: {
        title: document.title,
        author: document.author,
        date: document.date,
        language: this.options.language || 'en',
        generator: 'Oscar AI HTML Renderer v1.0'
      }
    };
  }
  
  /**
   * Reset counters and collections
   */
  private resetCounters(): void {
    this.elementCount = 0;
    this.warnings = [];
    this.errors = [];
  }
  
  /**
   * Render head section
   */
  private renderHead(document: DocumentContent): string {
    let head = '<head>\n';
    
    // Meta tags
    head += this.indent(1) + '<meta charset="UTF-8">\n';
    head += this.indent(1) + '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
    head += this.indent(1) + '<title>' + this.escapeHTML(document.title) + '</title>\n';
    
    if (document.author) {
      head += this.indent(1) + '<meta name="author" content="' + this.escapeHTML(document.author) + '">\n';
    }
    
    if (document.date) {
      head += this.indent(1) + '<meta name="date" content="' + document.date.toISOString() + '">\n';
    }
    
    // CSS styles
    if (this.htmlOptions.includeStyles) {
      head += this.indent(1) + '<style>\n';
      const css = this.cssEngine.generateCSS();
      head += this.indent(css, 2) + '\n';
      head += this.indent(1) + '</style>\n';
    }
    
    // Additional metadata
    if (document.metadata) {
      for (const [key, value] of Object.entries(document.metadata)) {
        if (typeof value === 'string') {
          head += this.indent(1) + `<meta name="${this.escapeHTML(key)}" content="${this.escapeHTML(value)}">\n`;
        }
      }
    }
    
    head += '</head>\n';
    return head;
  }
  
  /**
   * Render document content
   */
  private renderDocumentContent(document: DocumentContent): string {
    let content = '';
    
    // Main container
    content += '<main class="document">\n';
    
    // Document header
    content += this.indent(1) + '<header class="document-header">\n';
    content += this.indent(2) + '<h1 class="document-title">' + this.escapeHTML(document.title) + '</h1>\n';
    
    if (document.author) {
      content += this.indent(2) + '<div class="document-author">' + this.escapeHTML(document.author) + '</div>\n';
    }
    
    if (document.date) {
      content += this.indent(2) + '<div class="document-date">' + document.date.toLocaleDateString() + '</div>\n';
    }
    
    if (document.version) {
      content += this.indent(2) + '<div class="document-version">Version: ' + this.escapeHTML(document.version) + '</div>\n';
    }
    
    content += this.indent(1) + '</header>\n';
    
    // Document sections
    content += '<div class="document-content">\n';
    
    for (const section of document.sections) {
      content += this.renderSection(section, 1);
    }
    
    content += '</div>\n';
    content += '</main>\n';
    
    return content;
  }
  
  /**
   * Render a section element
   */
  private renderSection(section: SectionElement, depth: number = 0): string {
    this.elementCount++;
    
    let html = this.indent(depth) + '<section class="section"';
    
    // Add attributes
    const attributes = this.getElementAttributes(section);
    if (attributes) {
      html += ' ' + attributes;
    }
    
    html += '>\n';
    
    // Section title
    if (section.title) {
      const headingLevel = Math.min(6, (section.level || 1) + 1);
      html += this.indent(depth + 1) + `<h${headingLevel} class="section-title">${this.escapeHTML(section.title)}</h${headingLevel}>\n`;
    }
    
    // Section content
    html += this.indent(depth + 1) + '<div class="section-content">\n';
    
    for (const element of section.content) {
      html += this.renderElement(element, depth + 2);
    }
    
    html += this.indent(depth + 1) + '</div>\n';
    html += this.indent(depth) + '</section>\n';
    
    return html;
  }
  
  /**
   * Render any content element
   */
  private renderElement(element: ContentElement, depth: number = 0): string {
    this.elementCount++;
    
    switch (element.type) {
      case 'text':
        return this.renderText(element as TextElement, depth);
      case 'heading':
        return this.renderHeading(element as HeadingElement, depth);
      case 'paragraph':
        return this.renderParagraph(element as ParagraphElement, depth);
      case 'list':
        return this.renderList(element as ListElement, depth);
      case 'list-item':
        return this.renderListItem(element as ListItemElement, depth);
      case 'table':
        return this.renderTable(element as TableElement, depth);
      case 'table-row':
        return this.renderTableRow(element as TableRowElement, depth);
      case 'table-cell':
        return this.renderTableCell(element as TableCellElement, depth);
      case 'image':
        return this.renderImage(element as ImageElement, depth);
      case 'code':
        return this.renderCode(element as CodeElement, depth);
      case 'quote':
        return this.renderQuote(element as QuoteElement, depth);
      case 'divider':
        return this.renderDivider(element as DividerElement, depth);
      case 'page-break':
        return this.renderPageBreak(element as PageBreakElement, depth);
      case 'section':
        return this.renderSection(element as SectionElement, depth);
      case 'custom':
        return this.renderCustom(element as CustomElement, depth);
      default:
        this.warnings.push(`Unknown element type: ${element.type}`);
        return this.indent(depth) + `<!-- Unknown element type: ${element.type} -->\n`;
    }
  }
  
  /**
   * Render text element
   */
  private renderText(element: TextElement, depth: number = 0): string {
    let text = this.escapeHTML(element.content);
    
    // Apply formatting
    if (element.bold) text = `<strong>${text}</strong>`;
    if (element.italic) text = `<em>${text}</em>`;
    if (element.underline) text = `<u>${text}</u>`;
    if (element.strikethrough) text = `<s>${text}</s>`;
    
    // Apply inline styles
    const styles: string[] = [];
    if (element.color) styles.push(`color: ${element.color}`);
    if (element.backgroundColor) styles.push(`background-color: ${element.backgroundColor}`);
    if (element.fontSize) styles.push(`font-size: ${element.fontSize}pt`);
    if (element.fontFamily) styles.push(`font-family: ${element.fontFamily}`);
    
    if (styles.length > 0) {
      text = `<span style="${styles.join('; ')}">${text}</span>`;
    }
    
    return this.indent(depth) + text + '\n';
  }
  
  /**
   * Render heading element
   */
  private renderHeading(element: HeadingElement, depth: number = 0): string {
    const level = Math.min(6, Math.max(1, element.level || 1));
    let html = this.indent(depth) + `<h${level}`;
    
    // Add attributes
    const attributes = this.getElementAttributes(element);
    if (attributes) {
      html += ' ' + attributes;
    }
    
    if (element.alignment) {
      html += ` style="text-align: ${element.alignment}"`;
    }
    
    html += `>${this.escapeHTML(element.content)}</h${level}>\n`;
    
    return html;
  }
  
  /**
   * Render paragraph element
   */
  private renderParagraph(element: ParagraphElement, depth: number = 0): string {
    let html = this.indent(depth) + '<p';
    
    // Add attributes
    const attributes = this.getElementAttributes(element);
    if (attributes) {
      html += ' ' + attributes;
    }
    
    // Add alignment
    if (element.alignment) {
      html += ` style="text-align: ${element.alignment}"`;
    }
    
    html += '>';
    
    // Render content
    if (typeof element.content === 'string') {
      html += this.escapeHTML(element.content);
    } else {
      // Render nested elements
      const innerHTML = element.content.map(elem => 
        this.renderElement(elem, 0).trim()
      ).join('');
      html += innerHTML;
    }
    
    html += '</p>\n';
    
    return html;
  }
  
  /**
   * Render list element
   */
  private renderList(element: ListElement, depth: number = 0): string {
    const tagName = element.ordered ? 'ol' : 'ul';
    let html = this.indent(depth) + `<${tagName}`;
    
    // Add attributes
    const attributes = this.getElementAttributes(element);
    if (attributes) {
      html += ' ' + attributes;
    }
    
    // Add list style
    if (element.listStyle && element.listStyle !== 'none') {
      let styleValue = '';
      switch (element.listStyle) {
        case 'bullet': styleValue = 'disc'; break;
        case 'number': styleValue = 'decimal'; break;
        case 'check': styleValue = 'none'; break;
      }
      if (styleValue) {
        html += ` style="list-style-type: ${styleValue}"`;
      }
    }
    
    if (element.start !== undefined) {
      html += ` start="${element.start}"`;
    }
    
    html += '>\n';
    
    // Render list items
    for (const item of element.content) {
      html += this.renderListItem(item, depth + 1);
    }
    
    html += this.indent(depth) + `</${tagName}>\n`;
    
    return html;
  }
  
  /**
   * Render list item element
   */
  private renderListItem(element: ListItemElement, depth: number = 0): string {
    let html = this.indent(depth) + '<li';
    
    // Add attributes
    const attributes = this.getElementAttributes(element);
    if (attributes) {
      html += ' ' + attributes;
    }
    
    if (element.checked !== undefined) {
      html += ` data-checked="${element.checked}"`;
    }
    
    html += '>';
    
    // Render content
    if (typeof element.content === 'string') {
      html += this.escapeHTML(element.content);
    } else {
      // Render nested elements
      const innerHTML = element.content.map(elem => 
        this.renderElement(elem, 0).trim()
      ).join('');
      html += innerHTML;
    }
    
    // Render sublist if present
    if (element.sublist) {
      html += '\n' + this.renderList(element.sublist, depth + 1);
      html += this.indent(depth);
    }
    
    html += '</li>\n';
    
    return html;
  }
  
  /**
   * Render table element
   */
  private renderTable(element: TableElement, depth: number = 0): string {
    let html = this.indent(depth) + '<table';
    
    // Add attributes
    const attributes = this.getElementAttributes(element);
    if (attributes) {
      html += ' ' + attributes;
    }
    
    if (element.width) {
      html += ` style="width: ${typeof element.width === 'number' ? element.width + 'px' : element.width}"`;
    }
    
    if (element.border) {
      html += ' border="1"';
    }
    
    html += '>\n';
    
    // Render table header if provided
    if (element.headers && element.headers.length > 0) {
      html += this.indent(depth + 1) + '<thead>\n';
      html += this.indent(depth + 2) + '<tr>\n';
      
      for (const header of element.headers) {
        html += this.indent(depth + 3) + `<th>${this.escapeHTML(header)}</th>\n`;
      }
      
      html += this.indent(depth + 2) + '</tr>\n';
      html += this.indent(depth + 1) + '</thead>\n';
    }
    
    // Render table body
    html += this.indent(depth + 1) + '<tbody>\n';
    
    for (const row of element.content) {
      html += this.renderTableRow(row, depth + 2);
    }
    
    html += this.indent(depth + 1) + '</tbody>\n';
    html += this.indent(depth) + '</table>\n';
    
    return html;
  }
  
  /**
   * Render table row element
   */
  private renderTableRow(element: TableRowElement, depth: number = 0): string {
    let html = this.indent(depth) + '<tr';
    
    // Add attributes
    const attributes = this.getElementAttributes(element);
    if (attributes) {
      html += ' ' + attributes;
    }
    
    html += '>\n';
    
    for (const cell of element.content) {
      html += this.renderTableCell(cell, depth + 1);
    }
    
    html += this.indent(depth) + '</tr>\n';
    
    return html;
  }
  
  /**
   * Render table cell element
   */
  private renderTableCell(element: TableCellElement, depth: number = 0): string {
    const tagName = element.header ? 'th' : 'td';
    let html = this.indent(depth) + `<${tagName}`;
    
    // Add attributes
    const attributes = this.getElementAttributes(element);
    if (attributes) {
      html += ' ' + attributes;
    }
    
    if (element.colspan && element.colspan > 1) {
      html += ` colspan="${element.colspan}"`;
    }
    
    if (element.rowspan && element.rowspan > 1) {
      html += ` rowspan="${element.rowspan}"`;
    }
    
    if (element.alignment) {
      html += ` style="text-align: ${element.alignment}"`;
    }
    
    html += '>';
    
    // Render content
    if (typeof element.content === 'string') {
      html += this.escapeHTML(element.content);
    } else {
      // Render nested elements
      const innerHTML = element.content.map(elem =>
        this.renderElement(elem, 0).trim()
      ).join('');
      html += innerHTML;
    }
    
    html += `</${tagName}>\n`;
    
    return html;
  }
  
  /**
   * Render image element
   */
  private renderImage(element: ImageElement, depth: number = 0): string {
    let html = this.indent(depth) + '<figure';
    
    // Add attributes
    const attributes = this.getElementAttributes(element);
    if (attributes) {
      html += ' ' + attributes;
    }
    
    if (element.alignment) {
      html += ` style="text-align: ${element.alignment}"`;
    }
    
    html += '>\n';
    
    // Image tag
    html += this.indent(depth + 1) + '<img';
    html += ` src="${element.content.url || element.content.dataUrl || ''}"`;
    html += ` alt="${element.content.alt || ''}"`;
    
    if (element.width) {
      html += ` width="${element.width}"`;
    }
    
    if (element.height) {
      html += ` height="${element.height}"`;
    }
    
    if (element.wrap === false) {
      html += ' style="display: block;"';
    }
    
    html += this.htmlOptions.selfCloseVoidElements ? ' />\n' : '>\n';
    
    // Caption
    if (element.caption || element.content.caption) {
      const caption = element.caption || element.content.caption || '';
      html += this.indent(depth + 1) + `<figcaption class="image-caption">${this.escapeHTML(caption)}</figcaption>\n`;
    }
    
    html += this.indent(depth) + '</figure>\n';
    
    return html;
  }
  
  /**
   * Render code element
   */
  private renderCode(element: CodeElement, depth: number = 0): string {
    if (element.inline) {
      return this.indent(depth) + `<code>${this.escapeHTML(element.content)}</code>\n`;
    }
    
    let html = this.indent(depth) + '<pre';
    
    // Add attributes
    const attributes = this.getElementAttributes(element);
    if (attributes) {
      html += ' ' + attributes;
    }
    
    if (element.language) {
      html += ` class="language-${element.language}"`;
    }
    
    if (element.lineNumbers) {
      html += ' data-line-numbers';
    }
    
    html += '>\n';
    html += this.indent(depth + 1) + `<code>${this.escapeHTML(element.content)}</code>\n`;
    html += this.indent(depth) + '</pre>\n';
    
    return html;
  }
  
  /**
   * Render quote element
   */
  private renderQuote(element: QuoteElement, depth: number = 0): string {
    let html = this.indent(depth) + '<blockquote';
    
    // Add attributes
    const attributes = this.getElementAttributes(element);
    if (attributes) {
      html += ' ' + attributes;
    }
    
    if (element.alignment) {
      html += ` style="text-align: ${element.alignment}"`;
    }
    
    html += '>\n';
    
    // Quote content
    if (typeof element.content === 'string') {
      html += this.indent(depth + 1) + this.escapeHTML(element.content) + '\n';
    } else {
      for (const elem of element.content) {
        html += this.renderElement(elem, depth + 1);
      }
    }
    
    // Quote attribution
    if (element.author || element.source) {
      html += this.indent(depth + 1) + '<footer class="quote-author">\n';
      
      if (element.author) {
        html += this.indent(depth + 2) + `<cite>${this.escapeHTML(element.author)}</cite>\n`;
      }
      
      if (element.source) {
        html += this.indent(depth + 2) + `<span class="quote-source">${this.escapeHTML(element.source)}</span>\n`;
      }
      
      html += this.indent(depth + 1) + '</footer>\n';
    }
    
    html += this.indent(depth) + '</blockquote>\n';
    
    return html;
  }
  
  /**
   * Render divider element
   */
  private renderDivider(element: DividerElement, depth: number = 0): string {
    let html = this.indent(depth) + '<hr';
    
    // Add attributes
    const attributes = this.getElementAttributes(element);
    if (attributes) {
      html += ' ' + attributes;
    }
    
    // Add styles
    const styles: string[] = [];
    
    if (element.dividerStyle) {
      styles.push(`border-style: ${element.dividerStyle}`);
    }
    
    if (element.thickness) {
      styles.push(`border-width: ${element.thickness}px`);
    }
    
    if (element.color) {
      styles.push(`border-color: ${element.color}`);
    }
    
    if (styles.length > 0) {
      html += ` style="${styles.join('; ')}"`;
    }
    
    html += this.htmlOptions.selfCloseVoidElements ? ' />\n' : '></hr>\n';
    
    return html;
  }
  
  /**
   * Render page break element
   */
  private renderPageBreak(element: PageBreakElement, depth: number = 0): string {
    let html = this.indent(depth) + '<div class="page-break"';
    
    // Add attributes
    const attributes = this.getElementAttributes(element);
    if (attributes) {
      html += ' ' + attributes;
    }
    
    if (element.breakType) {
      html += ` data-break-type="${element.breakType}"`;
    }
    
    html += ' style="page-break-before: always;"></div>\n';
    
    return html;
  }
  
  /**
   * Render custom element
   */
  private renderCustom(element: CustomElement, depth: number = 0): string {
    let html = this.indent(depth) + '<div class="custom-element"';
    
    // Add attributes
    const attributes = this.getElementAttributes(element);
    if (attributes) {
      html += ' ' + attributes;
    }
    
    if (element.component) {
      html += ` data-component="${element.component}"`;
    }
    
    html += '>\n';
    
    // Render content
    if (typeof element.content === 'string') {
      html += this.indent(depth + 1) + this.escapeHTML(element.content) + '\n';
    } else if (element.props) {
      html += this.indent(depth + 1) + `<!-- Custom component props: ${JSON.stringify(element.props)} -->\n`;
    }
    
    html += this.indent(depth) + '</div>\n';
    
    return html;
  }
  
  /**
   * Get element attributes as string
   */
  private getElementAttributes(element: ContentElement): string {
    const attrs: string[] = [];
    
    // ID
    if (element.id) {
      attrs.push(`id="${element.id}"`);
    }
    
    // Classes
    if (element.classes && element.classes.length > 0) {
      attrs.push(`class="${element.classes.join(' ')}"`);
    }
    
    // Custom attributes
    if (element.attributes) {
      for (const [key, value] of Object.entries(element.attributes)) {
        attrs.push(`${key}="${this.escapeHTML(value)}"`);
      }
    }
    
    // Metadata as data attributes
    if (element.metadata) {
      for (const [key, value] of Object.entries(element.metadata)) {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          attrs.push(`data-${key}="${this.escapeHTML(String(value))}"`);
        }
      }
    }
    
    return attrs.join(' ');
  }
  
  /**
   * Indent text by specified depth
   */
  private indent(depth: number): string;
  private indent(text: string, depth: number): string;
  private indent(arg1: number | string, arg2?: number): string {
    if (typeof arg1 === 'number') {
      const depth = arg1;
      return ' '.repeat(depth * this.htmlOptions.indentSize);
    } else {
      const text = arg1;
      const depth = arg2 || 0;
      const indentStr = ' '.repeat(depth * this.htmlOptions.indentSize);
      return text.split('\n').map(line => indentStr + line).join('\n');
    }
  }
  
  /**
   * Escape HTML special characters
   */
  private escapeHTML(text: string): string {
    if (!this.htmlOptions.escapeHTML) {
      return text;
    }
    
    return text
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#039;');
  }
  
  /**
   * Pretty print HTML
   */
  private prettyPrintHTML(html: string): string {
    // Simple pretty printing - in a real implementation, use a proper HTML formatter
    let formatted = '';
    let indentLevel = 0;
    const lines = html.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (!trimmed) {
        continue;
      }
      
      // Decrease indent for closing tags
      if (trimmed.startsWith('</')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      // Add indented line
      formatted += ' '.repeat(indentLevel * this.htmlOptions.indentSize) + trimmed + '\n';
      
      // Increase indent for opening tags (that don't self-close)
      if (trimmed.startsWith('<') && !trimmed.startsWith('</') &&
          !trimmed.includes('/>') && !trimmed.endsWith('/>')) {
        indentLevel++;
      }
    }
    
    return formatted;
  }
  
  /**
   * Update rendering options
   */
  public updateOptions(newOptions: Partial<RenderingOptions>): void {
    this.options = { ...this.options, ...newOptions };
    this.cssEngine.updateOptions(newOptions);
  }
  
  /**
   * Update HTML rendering options
   */
  public updateHTMLOptions(newOptions: Partial<HTMLRenderingOptions>): void {
    this.htmlOptions = { ...this.htmlOptions, ...newOptions };
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
