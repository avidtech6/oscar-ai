import type { CoverPageTemplate } from './coverPageTypes';
import { defaultTemplates } from './coverPageTypes';

/**
 * Cover page generator that creates branded cover pages with logos and metadata.
 */
export class CoverPageGenerator {
  private templates: CoverPageTemplate[] = [];

  constructor() {
    this.loadDefaultTemplates();
  }

  /**
   * Generates a cover page HTML.
   * @param templateId ID of the template to use
   * @param variables Key‑value pairs to replace in the template
   * @returns HTML string
   */
  generate(templateId: string, variables: Record<string, string> = {}): string {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Cover page template "${templateId}" not found`);
    }
    let html = template.html;
    for (const [key, value] of Object.entries(variables)) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return html;
  }

  /**
   * Returns all available templates.
   */
  getTemplates(): CoverPageTemplate[] {
    return [...this.templates];
  }

  /**
   * Adds a custom template.
   */
  addTemplate(template: CoverPageTemplate): void {
    this.templates.push(template);
  }

  /**
   * Removes a template by ID.
   */
  removeTemplate(templateId: string): boolean {
    const index = this.templates.findIndex(t => t.id === templateId);
    if (index === -1) return false;
    this.templates.splice(index, 1);
    return true;
  }

  /**
   * Returns CSS for a given template.
   */
  getTemplateCSS(templateId: string): string {
    const template = this.templates.find(t => t.id === templateId);
    return template?.css || '';
  }

  // Private methods

  private loadDefaultTemplates(): void {
    this.templates = [...defaultTemplates];
  }
}

// Re‑export the interface for external consumers
export type { CoverPageTemplate };