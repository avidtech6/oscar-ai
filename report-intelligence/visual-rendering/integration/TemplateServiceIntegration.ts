/**
 * Phase 15: HTML Rendering & Visual Reproduction Engine
 * Template Service Integration
 * 
 * Integrates the Visual Rendering Engine with the existing template service
 * to provide enhanced rendering capabilities for report templates.
 */

import type {
  TemplateData,
  Template,
  ReportSection
} from '../../../src/lib/services/templateService';

import type {
  RenderingOptions,
  DocumentContent,
  ContentElement,
  SectionElement,
  HeadingElement,
  ParagraphElement,
  TableElement,
  TableRowElement,
  TableCellElement,
  ListElement,
  ListItemElement,
  ImageElement,
  ImageSource
} from '../types';

import { VisualRenderingEngine } from '../engines/VisualRenderingEngine';
import { DEFAULT_RENDERING_OPTIONS } from '../types';

/**
 * Template rendering options
 */
export interface TemplateRenderingOptions {
  templateId: string;
  templateData: TemplateData;
  renderingOptions?: Partial<RenderingOptions>;
  enablePreview?: boolean;
  enablePDFExport?: boolean;
  enableSnapshots?: boolean;
  quality?: number;
  format?: 'html' | 'pdf' | 'png';
}

/**
 * Template rendering result
 */
export interface TemplateRenderingResult {
  success: boolean;
  html?: string;
  css?: string;
  pdfUrl?: string;
  snapshotUrl?: string;
  errors: string[];
  warnings: string[];
  renderingTime: number;
  documentId: string;
}

/**
 * Template Service Integration
 */
export class TemplateServiceIntegration {
  private renderingEngine: VisualRenderingEngine | null = null;
  private isInitialized: boolean = false;

  constructor() {
    // Initialize with default options
    this.initialize();
  }

  /**
   * Initialize the integration
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Create rendering engine with default options
      const options: RenderingOptions = {
        ...DEFAULT_RENDERING_OPTIONS,
        layout: {
          ...DEFAULT_RENDERING_OPTIONS.layout,
          size: 'A4',
          orientation: 'portrait',
          margins: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
          }
        },
        typography: {
          ...DEFAULT_RENDERING_OPTIONS.typography,
          fontFamily: 'Arial, sans-serif',
          fontSize: 12,
          lineHeight: 1.5
        },
        colors: {
          ...DEFAULT_RENDERING_OPTIONS.colors,
          primary: '#2e7d32', // Green for arboricultural reports
          secondary: '#4caf50',
          background: '#ffffff',
          text: '#333333'
        }
      };

      this.renderingEngine = new VisualRenderingEngine(options, {
        enablePreview: true,
        enableSnapshots: true,
        enablePDFExport: true,
        enableCoverPages: true,
        enableHeadersFooters: true,
        enableImageOptimization: true,
        enablePageBreaks: true,
        cacheEnabled: true,
        cacheMaxSize: 50,
        parallelProcessing: false,
        maxWorkers: 2,
        defaultQuality: 90,
        defaultFormat: 'pdf'
      });

      await this.renderingEngine.initialize();
      this.isInitialized = true;

    } catch (error) {
      console.error('Failed to initialize TemplateServiceIntegration:', error);
      throw error;
    }
  }

  /**
   * Convert template data to Phase 15 document format
   */
  public convertTemplateToDocument(
    templateData: TemplateData,
    templateId: string
  ): DocumentContent {
    const sections: SectionElement[] = [];
    
    // 1. Cover/Title Section
    sections.push(this.createTitleSection(templateData));
    
    // 2. Project Information Section
    sections.push(this.createProjectInfoSection(templateData));
    
    // 3. Tree Schedule Section (if trees exist)
    if (templateData.trees && templateData.trees.length > 0) {
      sections.push(this.createTreeScheduleSection(templateData));
    }
    
    // 4. Recommendations Section
    sections.push(this.createRecommendationsSection(templateData));
    
    // 5. Survey Details Section
    sections.push(this.createSurveyDetailsSection(templateData));
    
    // 6. Company Information Section
    sections.push(this.createCompanyInfoSection(templateData));
    
    // Create document
    const document: DocumentContent = {
      title: this.getDocumentTitle(templateId, templateData),
      author: templateData.survey.surveyor,
      date: new Date(),
      version: '1.0',
      sections,
      metadata: {
        templateId,
        projectId: templateData.project.id || 'unknown',
        generatedAt: new Date().toISOString()
      }
    };
    
    return document;
  }

  /**
   * Get document title based on template and data
   */
  private getDocumentTitle(templateId: string, templateData: TemplateData): string {
    const templateNames: Record<string, string> = {
      'bs5837': 'BS5837:2012 Tree Survey Report',
      'impact': 'Arboricultural Impact Assessment',
      'method': 'Arboricultural Method Statement',
      'condition': 'Tree Condition Report'
    };
    
    const templateName = templateNames[templateId] || 'Arboricultural Report';
    return `${templateName} - ${templateData.project.name || 'Project'}`;
  }

  /**
   * Create title section
   */
  private createTitleSection(templateData: TemplateData): SectionElement {
    const elements: ContentElement[] = [];
    
    // Main title
    elements.push({
      id: 'title-heading',
      type: 'heading',
      content: 'Arboricultural Report',
      level: 1,
      style: {
        textAlign: 'center',
        color: '#2e7d32',
        marginBottom: '20px'
      }
    } as HeadingElement);
    
    // Subtitle
    elements.push({
      id: 'subtitle',
      type: 'paragraph',
      content: `Prepared for: ${templateData.project.client || 'Client not specified'}`,
      style: {
        textAlign: 'center',
        fontSize: '14px',
        marginBottom: '10px'
      }
    } as ParagraphElement);
    
    // Project name
    elements.push({
      id: 'project-name',
      type: 'paragraph',
      content: `Project: ${templateData.project.name || 'Project not specified'}`,
      style: {
        textAlign: 'center',
        fontSize: '14px',
        marginBottom: '10px'
      }
    } as ParagraphElement);
    
    // Date
    elements.push({
      id: 'report-date',
      type: 'paragraph',
      content: `Date: ${templateData.survey.date}`,
      style: {
        textAlign: 'center',
        fontSize: '14px',
        marginBottom: '30px'
      }
    } as ParagraphElement);
    
    // Divider
    elements.push({
      id: 'title-divider',
      type: 'divider',
      content: '',
      style: {
        borderTop: '2px solid #2e7d32',
        margin: '20px 0'
      }
    } as any);
    
    return {
      id: 'title-section',
      type: 'section',
      content: elements,
      title: 'Report Title',
      level: 1
    };
  }

  /**
   * Create project information section
   */
  private createProjectInfoSection(templateData: TemplateData): SectionElement {
    const elements: ContentElement[] = [];
    
    // Section heading
    elements.push({
      id: 'project-info-heading',
      type: 'heading',
      content: 'Project Information',
      level: 2,
      style: {
        color: '#2e7d32',
        marginBottom: '15px'
      }
    } as HeadingElement);
    
    // Project details table
    const tableRows: TableRowElement[] = [
      {
        id: 'row1',
        type: 'table-row',
        content: [
          {
            id: 'cell1-1',
            type: 'table-cell',
            content: 'Project Reference',
            header: true,
            style: { fontWeight: 'bold' }
          } as TableCellElement,
          {
            id: 'cell1-2',
            type: 'table-cell',
            content: templateData.project.reference || 'N/A'
          } as TableCellElement
        ]
      } as TableRowElement,
      {
        id: 'row2',
        type: 'table-row',
        content: [
          {
            id: 'cell2-1',
            type: 'table-cell',
            content: 'Site Address',
            header: true,
            style: { fontWeight: 'bold' }
          } as TableCellElement,
          {
            id: 'cell2-2',
            type: 'table-cell',
            content: templateData.project.siteAddress || 'Not specified'
          } as TableCellElement
        ]
      } as TableRowElement,
      {
        id: 'row3',
        type: 'table-row',
        content: [
          {
            id: 'cell3-1',
            type: 'table-cell',
            content: 'Client',
            header: true,
            style: { fontWeight: 'bold' }
          } as TableCellElement,
          {
            id: 'cell3-2',
            type: 'table-cell',
            content: templateData.project.client || 'Not specified'
          } as TableCellElement
        ]
      } as TableRowElement
    ];
    
    elements.push({
      id: 'project-info-table',
      type: 'table',
      content: tableRows,
      style: {
        width: '100%',
        border: '1px solid #ddd',
        marginBottom: '20px'
      }
    } as TableElement);
    
    return {
      id: 'project-info-section',
      type: 'section',
      content: elements,
      title: 'Project Information',
      level: 2
    };
  }

  /**
   * Create tree schedule section
   */
  private createTreeScheduleSection(templateData: TemplateData): SectionElement {
    const elements: ContentElement[] = [];
    
    // Section heading
    elements.push({
      id: 'tree-schedule-heading',
      type: 'heading',
      content: 'Tree Schedule',
      level: 2,
      style: {
        color: '#2e7d32',
        marginBottom: '15px'
      }
    } as HeadingElement);
    
    // Tree count summary
    elements.push({
      id: 'tree-count-summary',
      type: 'paragraph',
      content: `Total trees surveyed: ${templateData.trees.length}`,
      style: {
        marginBottom: '10px'
      }
    } as ParagraphElement);
    
    // Create table rows from tree data
    const tableRows: TableRowElement[] = [];
    
    // Header row
    tableRows.push({
      id: 'header-row',
      type: 'table-row',
      content: [
        { id: 'h1', type: 'table-cell', content: 'Ref', header: true, style: { fontWeight: 'bold' } } as TableCellElement,
        { id: 'h2', type: 'table-cell', content: 'Species', header: true, style: { fontWeight: 'bold' } } as TableCellElement,
        { id: 'h3', type: 'table-cell', content: 'Height (m)', header: true, style: { fontWeight: 'bold' } } as TableCellElement,
        { id: 'h4', type: 'table-cell', content: 'DBH (mm)', header: true, style: { fontWeight: 'bold' } } as TableCellElement,
        { id: 'h5', type: 'table-cell', content: 'Category', header: true, style: { fontWeight: 'bold' } } as TableCellElement,
        { id: 'h6', type: 'table-cell', content: 'Condition', header: true, style: { fontWeight: 'bold' } } as TableCellElement
      ]
    } as TableRowElement);
    
    // Data rows
    templateData.trees.forEach((tree, index) => {
      tableRows.push({
        id: `tree-row-${index}`,
        type: 'table-row',
        content: [
          { id: `c1-${index}`, type: 'table-cell', content: tree.number || `T${index + 1}` } as TableCellElement,
          { id: `c2-${index}`, type: 'table-cell', content: tree.species || 'Unknown' } as TableCellElement,
          { id: `c3-${index}`, type: 'table-cell', content: tree.height?.toString() || 'N/A' } as TableCellElement,
          { id: `c4-${index}`, type: 'table-cell', content: tree.DBH?.toString() || 'N/A' } as TableCellElement,
          { id: `c5-${index}`, type: 'table-cell', content: tree.category || 'U' } as TableCellElement,
          { id: `c6-${index}`, type: 'table-cell', content: tree.condition || 'Fair' } as TableCellElement
        ]
      } as TableRowElement);
    });
    
    elements.push({
      id: 'tree-schedule-table',
      type: 'table',
      content: tableRows,
      style: {
        width: '100%',
        border: '1px solid #ddd',
        marginBottom: '20px'
      }
    } as TableElement);
    
    return {
      id: 'tree-schedule-section',
      type: 'section',
      content: elements,
      title: 'Tree Schedule',
      level: 2
    };
  }

  /**
   * Create recommendations section
   */
  private createRecommendationsSection(templateData: TemplateData): SectionElement {
    const elements: ContentElement[] = [];
    
    // Section heading
    elements.push({
      id: 'recommendations-heading',
      type: 'heading',
      content: 'Recommendations',
      level: 2,
      style: {
        color: '#2e7d32',
        marginBottom: '15px'
      }
    } as HeadingElement);
    
    // Retained trees
    if (templateData.recommendations.retainedTrees.length > 0) {
      elements.push({
        id: 'retained-trees-heading',
        type: 'heading',
        content: 'Trees Recommended for Retention',
        level: 3,
        style: {
          marginBottom: '10px'
        }
      } as HeadingElement);
      
      const retainedItems: ListItemElement[] = templateData.recommendations.retainedTrees.map((tree, index) => ({
        id: `retained-${index}`,
        type: 'list-item',
        content: `${tree.treeRef} - ${tree.species} (Category ${tree.category})`
      } as ListItemElement));
      
      elements.push({
        id: 'retained-trees-list',
        type: 'list',
        content: retainedItems,
        listStyle: 'bullet',
        style: {
          marginBottom: '15px'
        }
      } as ListElement);
    }
    
    // Trees for removal
    if (templateData.recommendations.removedTrees.length > 0) {
      elements.push({
        id: 'removed-trees-heading',
        type: 'heading',
        content: 'Trees Recommended for Removal',
        level: 3,
        style: {
          marginBottom: '10px'
        }
      } as HeadingElement);
      
      const removedItems: ListItemElement[] = templateData.recommendations.removedTrees.map((tree, index) => ({
        id: `removed-${index}`,
        type: 'list-item',
        content: `${tree.treeRef} - ${tree.reason}`
      } as ListItemElement));
      
      elements.push({
        id: 'removed-trees-list',
        type: 'list',
        content: removedItems,
        listStyle: 'bullet',
        style: {
          marginBottom: '15px'
        }
      } as ListElement);
    }
    
    // Management recommendations
    if (templateData.recommendations.management.length > 0) {
      elements.push({
        id: 'management-heading',
        type: 'heading',
        content: 'Management Recommendations',
        level: 3,
        style: {
          marginBottom: '10px'
        }
      } as HeadingElement);
      
      const managementItems: ListItemElement[] = templateData.recommendations.management.map((item, index) => ({
        id: `management-${index}`,
        type: 'list-item',
        content: item
      } as ListItemElement));
      
      elements.push({
        id: 'management-list',
        type: 'list',
        content: managementItems,
        listStyle: 'bullet',
        style: {
          marginBottom: '15px'
        }
      } as ListElement);
    }
    
    return {
      id: 'recommendations-section',
      type: 'section',
      content: elements,
      title: 'Recommendations',
      level: 2
    };
  }

  /**
   * Create survey details section
   */
  private createSurveyDetailsSection(templateData: TemplateData): SectionElement {
    const elements: ContentElement[] = [];
    
    // Section heading
    elements.push({
      id: 'survey-details-heading',
      type: 'heading',
      content: 'Survey Details',
      level: 2,
      style: {
        color: '#2e7d32',
        marginBottom: '15px'
      }
    } as HeadingElement);
    
    // Survey details
    elements.push({
      id: 'survey-date',
      type: 'paragraph',
      content: `Survey Date: ${templateData.survey.date}`,
      style: {
        marginBottom: '5px'
      }
    } as ParagraphElement);
    
    elements.push({
      id: 'surveyor',
      type: 'paragraph',
      content: `Surveyor: ${templateData.survey.surveyor}`,
      style: {
        marginBottom: '5px'
      }
    } as ParagraphElement);
    
    elements.push({
      id: 'qualification',
      type: 'paragraph',
      content: `Qualification: ${templateData.survey.qualification}`,
      style: {
        marginBottom: '15px'
      }
    } as ParagraphElement);
    
    return {
      id: 'survey-details-section',
      type: 'section',
      content: elements,
      title: 'Survey Details',
      level: 2
    };
  }

  /**
   * Create company information section
   */
  private createCompanyInfoSection(templateData: TemplateData): SectionElement {
    const elements: ContentElement[] = [];
    
    // Section heading
    elements.push({
      id: 'company-info-heading',
      type: 'heading',
      content: 'Company Information',
      level: 2,
      style: {
        color: '#2e7d32',
        marginBottom: '15px'
      }
    } as HeadingElement);
    
    // Company details
    elements.push({
      id: 'company-name',
      type: 'paragraph',
      content: `Company: ${templateData.company.name}`,
      style: {
        marginBottom: '5px'
      }
    } as ParagraphElement);
    
    elements.push({
      id: 'company-address',
      type: 'paragraph',
      content: `Address: ${templateData.company.address}`,
      style: {
        marginBottom: '5px'
      }
    } as ParagraphElement);
    
    elements.push({
      id: 'company-phone',
      type: 'paragraph',
      content: `Phone: ${templateData.company.phone}`,
      style: {
        marginBottom: '5px'
      }
    } as ParagraphElement);
    
    elements.push({
      id: 'company-email',
      type: 'paragraph',
      content: `Email: ${templateData.company.email}`,
      style: {
        marginBottom: '15px'
      }
    } as ParagraphElement);
    
    return {
      id: 'company-info-section',
      type: 'section',
      content: elements,
      title: 'Company Information',
      level: 2
    };
  }

  /**
   * Render template using Phase 15 rendering engine
   */
  public async renderTemplate(
    options: TemplateRenderingOptions
  ): Promise<TemplateRenderingResult> {
    const startTime = performance.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Ensure integration is initialized
      if (!this.isInitialized || !this.renderingEngine) {
        await this.initialize();
      }
      
      // Convert template data to document format
      const document = this.convertTemplateToDocument(
        options.templateData,
        options.templateId
      );
      
      // Merge rendering options
      const renderingOptions: RenderingOptions = {
        ...DEFAULT_RENDERING_OPTIONS,
        ...options.renderingOptions
      };
      
      // Render the document
      const renderingResult = await this.renderingEngine!.renderDocument(
        document,
        renderingOptions
      );
      
      // Generate PDF if requested
      let pdfUrl: string | undefined;
      if (options.enablePDFExport && renderingResult.html) {
        try {
          const pdfResult = await this.renderingEngine!.exportToPDF(
            renderingResult.html,
            renderingOptions
          );
          pdfUrl = pdfResult.url;
        } catch (pdfError) {
          errors.push(`PDF export failed: ${pdfError}`);
          warnings.push('PDF export unavailable, HTML only');
        }
      }
      
      // Generate snapshot if requested
      let snapshotUrl: string | undefined;
      if (options.enableSnapshots && renderingResult.html) {
        try {
          const snapshotResult = await this.renderingEngine!.captureSnapshot(
            renderingResult.html,
            {
              width: 800,
              height: 1131, // A4 aspect ratio
              quality: options.quality || 90,
              format: options.format || 'png'
            }
          );
          snapshotUrl = snapshotResult.url;
        } catch (snapshotError) {
          warnings.push(`Snapshot capture failed: ${snapshotError}`);
        }
      }
      
      const renderingTime = performance.now() - startTime;
      
      return {
        success: true,
        html: renderingResult.html,
        css: renderingResult.css,
        pdfUrl,
        snapshotUrl,
        errors,
        warnings,
        renderingTime,
        documentId: renderingResult.id || `doc-${Date.now()}`
      };
      
    } catch (error) {
      const renderingTime = performance.now() - startTime;
      errors.push(`Rendering failed: ${error}`);
      
      return {
        success: false,
        errors,
        warnings,
        renderingTime,
        documentId: `error-${Date.now()}`
      };
    }
  }

  /**
   * Render template using existing template service and enhance with Phase 15
   */
  public async renderTemplateWithEnhancement(
    templateId: string,
    templateData: TemplateData,
    options?: Partial<TemplateRenderingOptions>
  ): Promise<TemplateRenderingResult> {
    try {
      // First, render using existing template service
      const { loadTemplateHtml, renderTemplate } = await import('../../../src/lib/services/templateService');
      
      const templateHtml = await loadTemplateHtml(templateId);
      const renderedHtml = renderTemplate(templateHtml, templateData);
      
      // Then enhance with Phase 15 rendering
      const renderingOptions: TemplateRenderingOptions = {
        templateId,
        templateData,
        enablePreview: true,
        enablePDFExport: true,
        enableSnapshots: true,
        ...options
      };
      
      return await this.renderTemplate(renderingOptions);
      
    } catch (error) {
      return {
        success: false,
        errors: [`Template enhancement failed: ${error}`],
        warnings: [],
        renderingTime: 0,
        documentId: `enhancement-error-${Date.now()}`
      };
    }
  }

  /**
   * Get preview of rendered template
   */
  public async getTemplatePreview(
    templateId: string,
    templateData: TemplateData
  ): Promise<{ html: string; css: string; snapshotUrl?: string }> {
    try {
      const result = await this.renderTemplate({
        templateId,
        templateData,
        enablePreview: true,
        enableSnapshots: true,
        enablePDFExport: false
      });
      
      if (!result.success || !result.html) {
        throw new Error('Failed to generate preview');
      }
      
      return {
        html: result.html,
        css: result.css || '',
        snapshotUrl: result.snapshotUrl
      };
    } catch (error) {
      console.error('Failed to generate template preview:', error);
      throw error;
    }
  }

  /**
   * Export template to PDF
   */
  public async exportTemplateToPDF(
    templateId: string,
    templateData: TemplateData,
    options?: Partial<RenderingOptions>
  ): Promise<{ url: string; filename: string }> {
    try {
      const result = await this.renderTemplate({
        templateId,
        templateData,
        enablePreview: false,
        enableSnapshots: false,
        enablePDFExport: true,
        renderingOptions: options
      });
      
      if (!result.success || !result.pdfUrl) {
        throw new Error('Failed to generate PDF');
      }
      
      const filename = `${templateId}_${templateData.project.name || 'report'}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      return {
        url: result.pdfUrl,
        filename
      };
    } catch (error) {
      console.error('Failed to export template to PDF:', error);
      throw error;
    }
  }

  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    if (this.renderingEngine) {
      await this.renderingEngine.cleanup();
      this.renderingEngine = null;
      this.isInitialized = false;
    }
  }

  /**
   * Get integration status
   */
  public getStatus(): {
    initialized: boolean;
    engineAvailable: boolean;
    cacheSize: number;
    lastRenderTime?: number;
  } {
    return {
      initialized: this.isInitialized,
      engineAvailable: !!this.renderingEngine,
      cacheSize: this.renderingEngine?.getCacheSize() || 0,
      lastRenderTime: this.renderingEngine?.getLastRenderTime()
    };
  }
}
