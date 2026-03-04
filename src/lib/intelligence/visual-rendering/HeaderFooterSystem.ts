import type { PageLayout } from './types/PageLayout';

/**
 * Header/footer template definition.
 */
export interface HeaderFooterTemplate {
  id: string;
  name: string;
  description: string;
  html: string;
  css: string;
  variables: string[]; // e.g., ['pageNumber', 'totalPages', 'date', 'title', 'author']
}

/**
 * Header/footer system that manages persistent headers and footers across pages.
 */
export class HeaderFooterSystem {
  private templates: HeaderFooterTemplate[] = [];
  private currentHeaderTemplate?: HeaderFooterTemplate;
  private currentFooterTemplate?: HeaderFooterTemplate;

  constructor() {
    this.loadDefaultTemplates();
  }

  /**
   * Sets the header template.
   */
  setHeaderTemplate(templateId: string): boolean {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return false;
    this.currentHeaderTemplate = template;
    return true;
  }

  /**
   * Sets the footer template.
   */
  setFooterTemplate(templateId: string): boolean {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return false;
    this.currentFooterTemplate = template;
    return true;
  }

  /**
   * Renders the header for a given page.
   * @param pageNumber 1‑based page number
   * @param totalPages Total number of pages
   * @param variables Additional variables (title, author, date, etc.)
   * @returns HTML string
   */
  renderHeader(pageNumber: number, totalPages: number, variables: Record<string, string> = {}): string {
    if (!this.currentHeaderTemplate) return '';
    return this.renderTemplate(this.currentHeaderTemplate, pageNumber, totalPages, variables);
  }

  /**
   * Renders the footer for a given page.
   */
  renderFooter(pageNumber: number, totalPages: number, variables: Record<string, string> = {}): string {
    if (!this.currentFooterTemplate) return '';
    return this.renderTemplate(this.currentFooterTemplate, pageNumber, totalPages, variables);
  }

  /**
   * Returns all available templates.
   */
  getTemplates(): HeaderFooterTemplate[] {
    return [...this.templates];
  }

  /**
   * Adds a custom template.
   */
  addTemplate(template: HeaderFooterTemplate): void {
    this.templates.push(template);
  }

  /**
   * Removes a template by ID.
   */
  removeTemplate(templateId: string): boolean {
    const index = this.templates.findIndex(t => t.id === templateId);
    if (index === -1) return false;
    this.templates.splice(index, 1);
    // If removed template was active, clear active reference
    if (this.currentHeaderTemplate?.id === templateId) this.currentHeaderTemplate = undefined;
    if (this.currentFooterTemplate?.id === templateId) this.currentFooterTemplate = undefined;
    return true;
  }

  /**
   * Generates CSS for the active header/footer.
   */
  generateCSS(): string {
    const headerCSS = this.currentHeaderTemplate?.css || '';
    const footerCSS = this.currentFooterTemplate?.css || '';
    return headerCSS + footerCSS;
  }

  // Private methods

  private loadDefaultTemplates(): void {
    this.templates = [
      {
        id: 'default-header',
        name: 'Default Header',
        description: 'Simple header with title and page number',
        html: `
<div class="header">
  <div class="header-left">{{title}}</div>
  <div class="header-right">Page {{pageNumber}} of {{totalPages}}</div>
</div>`,
        css: `
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 15mm;
  padding: 2mm;
  border-bottom: 1px solid #ccc;
  font-size: 10pt;
  font-family: sans-serif;
}
.header-left { font-weight: bold; }
.header-right { color: #666; }`,
        variables: ['title', 'pageNumber', 'totalPages']
      },
      {
        id: 'default-footer',
        name: 'Default Footer',
        description: 'Simple footer with date and confidentiality notice',
        html: `
<div class="footer">
  <div class="footer-left">{{date}}</div>
  <div class="footer-center">{{author}}</div>
  <div class="footer-right">Confidential</div>
</div>`,
        css: `
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 15mm;
  padding: 2mm;
  border-top: 1px solid #ccc;
  font-size: 9pt;
  font-family: sans-serif;
  color: #666;
}
.footer-left, .footer-center, .footer-right { flex: 1; }
.footer-center { text-align: center; }
.footer-right { text-align: right; }`,
        variables: ['date', 'author']
      },
      {
        id: 'minimal-header',
        name: 'Minimal Header',
        description: 'Minimal header with only page number',
        html: `
<div class="header-minimal">
  <span class="page-number">{{pageNumber}}</span>
</div>`,
        css: `
.header-minimal {
  text-align: right;
  height: 10mm;
  padding: 1mm;
  font-size: 9pt;
  color: #999;
}`,
        variables: ['pageNumber']
      },
      {
        id: 'minimal-footer',
        name: 'Minimal Footer',
        description: 'Minimal footer with document title',
        html: `
<div class="footer-minimal">
  {{title}}
</div>`,
        css: `
.footer-minimal {
  text-align: center;
  height: 10mm;
  padding: 1mm;
  font-size: 9pt;
  color: #999;
  border-top: 1px solid #eee;
}`,
        variables: ['title']
      }
    ];
    // Set defaults
    this.currentHeaderTemplate = this.templates[0];
    this.currentFooterTemplate = this.templates[1];
  }

  private renderTemplate(
    template: HeaderFooterTemplate,
    pageNumber: number,
    totalPages: number,
    variables: Record<string, string>
  ): string {
    let html = template.html;
    const allVariables = {
      pageNumber: pageNumber.toString(),
      totalPages: totalPages.toString(),
      date: new Date().toLocaleDateString(),
      ...variables
    };
    for (const [key, value] of Object.entries(allVariables)) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return html;
  }
}