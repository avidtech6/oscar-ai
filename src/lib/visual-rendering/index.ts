/**
 * Visual Rendering System - Main Entry Point
 * 
 * This module exports all visual rendering components for the Oscar AI system.
 * 
 * PHASES 15-16 — Visual Rendering System
 * Required Systems: Report Intelligence Core, Cross System Intelligence
 */

// Phase 15 - HTML Rendering & Visual Reproduction Engine
export { HTMLRenderer, createHTMLRenderer, renderHTML } from './html-renderer.js';
export type { RenderOptions, RenderResult, RenderProgress, DEFAULT_RENDER_OPTIONS } from './render-options.js';

// Phase 16 - Direct PDF Parsing & Layout Extractor
export { PDFParser, createPDFParser, parsePDF } from './pdf-parser.js';
export { LayoutExtractor, createLayoutExtractor, analyzeDocumentLayout } from './layout-extractor.js';
export type {
  LayoutInfo,
  TextBlock,
  ImageBlock,
  TableBlock,
  TableCell,
  DocumentSection,
  HeaderFooter,
  ParsedDocument,
  TOCEntry,
  LayoutAnalysis,
  SectionHierarchy,
  ReadingFlow,
  SectionTransition,
  LayoutModificationOptions
} from './pdf-parser.js';

/**
 * Visual Rendering System Configuration
 */
export interface VisualRenderingConfig {
  /** Default rendering options */
  defaultRenderOptions?: Partial<import('./render-options.js').RenderOptions>;
  
  ** PDF parsing configuration */
  pdfParsing?: {
    enableOCR?: boolean;
    extractImages?: boolean;
    extractTables?: boolean;
    preserveLayout?: boolean;
  };
  
  ** Layout analysis configuration */
  layoutAnalysis?: {
    enableConsistencyAnalysis?: boolean;
    enableContentDistributionAnalysis?: boolean;
    enableStructureAnalysis?: boolean;
  };
  
  ** Error handling */
  onError?: (error: Error) => void;
  
  ** Progress reporting */
  onProgress?: (progress: number, message: string) => void;
}

/**
 * Visual Rendering System - Main Controller
 * 
 * Coordinates all visual rendering operations and provides
 * a unified interface for document rendering and analysis.
 */
export class VisualRenderingSystem {
  private config: VisualRenderingConfig;
  
  /**
   * Create a new visual rendering system
   */
  constructor(config: VisualRenderingConfig = {}) {
    this.config = config;
  }
  
  /**
   * Render content to HTML
   */
  public async renderToHTML(
    content: any,
    options?: Partial<import('./render-options.js').RenderOptions>
  ): Promise<import('./render-options.js').RenderResult> {
    const renderOptions = {
      ...this.config.defaultRenderOptions,
      ...options
    };
    
    return renderHTML(content, renderOptions);
  }
  
  /**
   * Parse PDF document
   */
  public async parsePDF(
    pdfData: Buffer | string,
    options?: Partial<import('./render-options.js').RenderOptions>
  ): Promise<import('./pdf-parser.js').ParsedDocument> {
    const renderOptions = {
      ...this.config.defaultRenderOptions,
      ...options
    };
    
    return parsePDF(pdfData, renderOptions);
  }
  
  /**
   * Convert PDF to HTML
   */
  public async convertPDFToHTML(
    pdfData: Buffer | string,
    options?: Partial<import('./render-options.js').RenderOptions>
  ): Promise<string> {
    const renderOptions = {
      ...this.config.defaultRenderOptions,
      ...options
    };
    
    const parser = createPDFParser(renderOptions);
    return parser.convertToHTML(pdfData, renderOptions);
  }
  
  /**
   * Analyze document layout
   */
  public async analyzeLayout(
    layouts: import('./pdf-parser.js').LayoutInfo[]
  ): Promise<import('./pdf-parser.js').LayoutAnalysis> {
    return analyzeDocumentLayout(layouts, {
      onError: this.config.onError,
      onProgress: this.config.onProgress
    });
  }
  
  /**
   * Extract table of contents from document
   */
  public async extractTableOfContents(
    layouts: import('./pdf-parser.js').LayoutInfo[]
  ): Promise<import('./pdf-parser.js').TOCEntry[]> {
    const extractor = createLayoutExtractor(layouts, {
      onError: this.config.onError,
      onProgress: this.config.onProgress
    });
    
    return extractor.extractTableOfContents();
  }
  
  /**
   * Modify document layout
   */
  public async modifyLayout(
    layouts: import('./pdf-parser.js').LayoutInfo[],
    modifications: import('./layout-extractor.js').LayoutModificationOptions
  ): Promise<import('./pdf-parser.js').LayoutInfo[]> {
    const extractor = createLayoutExtractor(layouts, {
      onError: this.config.onError,
      onProgress: this.config.onProgress
    });
    
    return extractor.modifyLayout(modifications);
  }
}

/**
 * Create visual rendering system instance
 */
export function createVisualRenderingSystem(config: VisualRenderingConfig = {}): VisualRenderingSystem {
  return new VisualRenderingSystem(config);
}

/**
 * Default visual rendering system instance
 */
export const defaultVisualRenderingSystem = createVisualRenderingSystem();