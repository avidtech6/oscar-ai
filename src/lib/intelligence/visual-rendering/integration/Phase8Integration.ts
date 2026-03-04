import type { ReportTemplate, TemplateSection } from '../../template-generator/ReportTemplate';
import { VisualRenderingEngine } from '../VisualRenderingEngine';
import { CSSLayoutEngine } from '../CSSLayoutEngine';
import { HeaderFooterSystem } from '../HeaderFooterSystem';
import { CoverPageGenerator } from '../CoverPageGenerator';
import { PageBreakLogic } from '../PageBreakLogic';
import { ImageEmbeddingPipeline } from '../ImageEmbeddingPipeline';
import { defaultRenderingOptions } from '../types/RenderingOptions';
import { defaultA4PortraitLayout } from '../types/PageLayout';

/**
 * Integrates Phase 8 (Template Generator) with the visual rendering subsystem.
 */
export class Phase8Integration {
  private renderingEngine: VisualRenderingEngine;
  private cssLayoutEngine: CSSLayoutEngine;
  private headerFooterSystem: HeaderFooterSystem;
  private coverPageGenerator: CoverPageGenerator;
  private pageBreakLogic: PageBreakLogic;
  private imageEmbeddingPipeline: ImageEmbeddingPipeline;

  constructor() {
    this.renderingEngine = new VisualRenderingEngine(defaultRenderingOptions);
    this.cssLayoutEngine = new CSSLayoutEngine(defaultA4PortraitLayout);
    this.headerFooterSystem = new HeaderFooterSystem();
    this.coverPageGenerator = new CoverPageGenerator();
    this.pageBreakLogic = new PageBreakLogic();
    this.imageEmbeddingPipeline = new ImageEmbeddingPipeline();
  }

  /**
   * Renders a Phase 8 template to HTML.
   * @param template ReportTemplate from Phase 8
   * @param data Template data (placeholders filled)
   * @param metadata Additional metadata (title, author, date, client, etc.)
   * @returns HTML string
   */
  renderTemplateToHTML(
    template: ReportTemplate,
    data: Record<string, any>,
    metadata: {
      title?: string;
      author?: string;
      date?: string;
      client?: string;
      coverPage?: boolean;
    } = {}
  ): string {
    const title = metadata.title || `Report (${template.reportTypeId})`;
    const author = metadata.author || 'Unknown Author';
    const date = metadata.date || new Date().toLocaleDateString();
    const client = metadata.client || 'Unknown Client';

    // 1. Apply template structure
    const structuredContent = this.applyTemplateStructure(template, data);

    // 2. Generate CSS from layout engine and header/footer
    const layoutCSS = this.cssLayoutEngine.generateDocumentCSS();
    const headerFooterCSS = this.headerFooterSystem.generateCSS();
    const css = layoutCSS + headerFooterCSS;

    // 3. Apply header/footer templates
    const header = this.headerFooterSystem.renderHeader(1, 1, { title, author });
    const footer = this.headerFooterSystem.renderFooter(1, 1, { date });

    // 4. Apply cover page if configured
    let coverPage = '';
    if (metadata.coverPage) {
      coverPage = this.coverPageGenerator.generate('professional', {
        title,
        subtitle: `Type: ${template.reportTypeId}`,
        author,
        date,
        client,
        version: template.version
      });
    }

    // 5. Embed images (synchronous placeholder)
    const embeddedContent = this.embedImagesSync(structuredContent);

    // 6. Insert page breaks
    const contentWithBreaks = this.pageBreakLogic.insertPageBreaks(embeddedContent);

    // 7. Assemble final HTML
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>${css}</style>
</head>
<body>
  <div class="document">
    ${coverPage}
    <div class="page">
      ${header}
      <div class="content">
        ${contentWithBreaks}
      </div>
      ${footer}
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Renders a Phase 8 template to PDF (via VisualRenderingEngine).
   */
  async renderTemplateToPDF(
    template: ReportTemplate,
    data: Record<string, any>,
    metadata?: any
  ): Promise<Uint8Array> {
    const html = this.renderTemplateToHTML(template, data, metadata);
    // In a real implementation you would call a PDF export engine.
    // For now we return an empty PDF.
    return new Uint8Array();
  }

  // Private helpers

  private applyTemplateStructure(template: ReportTemplate, data: Record<string, any>): string {
    let html = '';
    // Render each section
    for (const section of template.sections) {
      html += this.renderSection(section, data);
    }
    return html;
  }

  private renderSection(section: TemplateSection, data: Record<string, any>): string {
    let html = `<section class="section-${section.id}">`;
    html += `<h2>${section.title}</h2>`;
    // Render fields
    for (const field of section.fields) {
      const value = data[field.id] ?? field.defaultValue ?? '';
      html += `<div class="field field-${field.id}">`;
      html += `<strong>${field.name}:</strong> `;
      html += `<span>${value}</span>`;
      html += `</div>`;
    }
    // Render subsections recursively
    if (section.subsections) {
      for (const sub of section.subsections) {
        html += this.renderSection(sub, data);
      }
    }
    html += `</section>`;
    return html;
  }

  private embedImagesSync(html: string): string {
    // Simple synchronous placeholder: replace image src with a placeholder data URL
    return html.replace(/<img src="([^"]+)"/g, (match, src) => {
      return `<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="`;
    });
  }
}