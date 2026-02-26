/**
 * Phase 15: HTML Rendering & Visual Reproduction Engine
 * Visual Rendering Engine (Orchestrator)
 * 
 * Main orchestrator that coordinates all rendering components:
 * - CSS Layout Engine
 * - HTML Renderer
 * - Header/Footer System
 * - Cover Page Generator
 * - Image Embedding Pipeline
 * - Page Break Logic
 * - Multi-page PDF Export
 * - Visual Preview Window
 * - Snapshot Capture System
 */

import type {
  RenderingOptions,
  DocumentContent,
  PageContent,
  RenderingResult,
  RenderingProgress,
  RenderingJob,
  RenderingCacheEntry,
  ContentElement,
  SectionElement,
  RenderingError,
  SnapshotResult,
  PDFExportResult
} from '../types';

import { CSSLayoutEngine } from './CSSLayoutEngine';
import { HTMLRenderer } from './HTMLRenderer';
import { HeaderFooterSystem } from './HeaderFooterSystem';
import { CoverPageGenerator } from './CoverPageGenerator';
import { ImageEmbeddingPipeline } from './ImageEmbeddingPipeline';
import { PageBreakLogic } from './PageBreakLogic';
import { MultiPagePDFExport } from './MultiPagePDFExport';
import { VisualPreviewWindow } from './VisualPreviewWindow';
import { SnapshotCaptureSystem } from './SnapshotCaptureSystem';

/**
 * Engine configuration
 */
export interface VisualRenderingEngineConfig {
  enablePreview: boolean;
  enableSnapshots: boolean;
  enablePDFExport: boolean;
  enableCoverPages: boolean;
  enableHeadersFooters: boolean;
  enableImageOptimization: boolean;
  enablePageBreaks: boolean;
  cacheEnabled: boolean;
  cacheMaxSize: number; // MB
  parallelProcessing: boolean;
  maxWorkers: number;
  defaultQuality: number; // 0-100
  defaultFormat: 'png' | 'jpeg' | 'webp' | 'pdf';
}

/**
 * Default engine configuration
 */
export const DEFAULT_ENGINE_CONFIG: VisualRenderingEngineConfig = {
  enablePreview: true,
  enableSnapshots: true,
  enablePDFExport: true,
  enableCoverPages: true,
  enableHeadersFooters: true,
  enableImageOptimization: true,
  enablePageBreaks: true,
  cacheEnabled: true,
  cacheMaxSize: 100, // 100MB
  parallelProcessing: false,
  maxWorkers: 4,
  defaultQuality: 90,
  defaultFormat: 'pdf'
};

/**
 * Rendering job status
 */
export interface JobStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  currentStep: string;
  startTime: number;
  endTime?: number;
  errors: string[];
  warnings: string[];
  result?: RenderingResult;
}

/**
 * Cache entry for rendered content
 */
export interface RenderCacheEntry {
  key: string;
  content: RenderingResult;
  metadata: {
    documentId: string;
    timestamp: number;
    size: number;
    format: string;
    optionsHash: string;
  };
  accessedAt: number;
  createdAt: number;
}

/**
 * Visual Rendering Engine
 */
export class VisualRenderingEngine {
  private options: RenderingOptions;
  private config: VisualRenderingEngineConfig;
  
  // Core components
  private cssEngine: CSSLayoutEngine;
  private htmlRenderer: HTMLRenderer;
  private headerFooterSystem: HeaderFooterSystem;
  private coverPageGenerator: CoverPageGenerator;
  private imagePipeline: ImageEmbeddingPipeline;
  private pageBreakLogic: PageBreakLogic;
  private pdfExporter: MultiPagePDFExport;
  private previewWindow: VisualPreviewWindow | null = null;
  private snapshotSystem: SnapshotCaptureSystem;
  
  // State management
  private jobs: Map<string, JobStatus> = new Map();
  private cache: Map<string, RenderCacheEntry> = new Map();
  private activeJobs: Set<string> = new Set();
  private isInitialized: boolean = false;
  
  // Event listeners
  private progressListeners: Map<string, (progress: RenderingProgress) => void> = new Map();
  private completionListeners: Map<string, (result: RenderingResult) => void> = new Map();
  private errorListeners: Map<string, (error: Error) => void> = new Map();

  constructor(
    options: RenderingOptions,
    config: Partial<VisualRenderingEngineConfig> = {}
  ) {
    this.options = options;
    this.config = { ...DEFAULT_ENGINE_CONFIG, ...config };
    
    // Initialize core components
    this.cssEngine = new CSSLayoutEngine(options);
    this.htmlRenderer = new HTMLRenderer(options);
    this.headerFooterSystem = new HeaderFooterSystem(options);
    this.coverPageGenerator = new CoverPageGenerator(options);
    this.imagePipeline = new ImageEmbeddingPipeline(options);
    this.pageBreakLogic = new PageBreakLogic(options);
    this.pdfExporter = new MultiPagePDFExport(options);
    this.snapshotSystem = new SnapshotCaptureSystem(options);
    
    // Initialize preview window if enabled
    if (this.config.enablePreview) {
      this.previewWindow = new VisualPreviewWindow(options);
    }
    
    this.isInitialized = true;
  }

  /**
   * Initialize the engine (async setup if needed)
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    
    try {
      // Initialize components that need async setup
      // Note: ImageEmbeddingPipeline doesn't have initialize method in our implementation
      // but we'll call it if it exists
      if ((this.imagePipeline as any).initialize) {
        await (this.imagePipeline as any).initialize();
      }
      
      // Setup preview window if enabled
      if (this.config.enablePreview && this.previewWindow) {
        // VisualPreviewWindow doesn't have initialize in our implementation
        // but we'll call it if it exists
        if ((this.previewWindow as any).initialize) {
          await (this.previewWindow as any).initialize();
        }
      }
      
      this.isInitialized = true;
      
    } catch (error) {
      throw new Error(`Failed to initialize VisualRenderingEngine: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate a unique job ID
   */
  private generateJobId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate cache key for document and options
   */
  private generateCacheKey(document: DocumentContent, options: RenderingOptions): string {
    const documentHash = this.hashString(JSON.stringify({
      title: document.title,
      sections: document.sections.length,
      author: document.author,
      date: document.date
    }));
    
    const optionsHash = this.hashString(JSON.stringify(options));
    
    return `cache_${documentHash}_${optionsHash}`;
  }

  /**
   * Simple string hash function
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Get item from cache
   */
  private getFromCache(key: string): RenderingResult | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }
    
    // Update accessed time
    entry.accessedAt = Date.now();
    this.cache.set(key, entry);
    
    return entry.content;
  }

  /**
   * Add item to cache
   */
  private addToCache(key: string, content: RenderingResult): void {
  // Check cache size and evict if needed
  if (this.cache.size >= this.config.cacheMaxSize * 10) { // Approximate entries
    // Remove least recently used entry
    const lru = Array.from(this.cache.entries())
      .reduce((oldest, current) =>
        current[1].accessedAt < oldest[1].accessedAt ? current : oldest
      );
    this.cache.delete(lru[0]);
  }
  
  const entry: RenderCacheEntry = {
    key,
    content,
    metadata: {
      documentId: content.content.title, // Use content.title as documentId
      timestamp: Date.now(),
      size: (content.html?.length || 0) + (content.css?.length || 0),
      format: 'html',
      optionsHash: this.hashString(JSON.stringify(this.options))
    },
    accessedAt: Date.now(),
    createdAt: Date.now()
  };
  
  this.cache.set(key, entry);
}

  /**
   * Update job progress
   */
  private updateJobProgress(jobId: string, progress: number, step: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.progress = progress;
      job.currentStep = step;
      
      // Notify progress listeners
      this.notifyProgress(jobId, {
        jobId,
        status: 'processing',
        progress,
        currentStep: step
      });
    }
  }

  /**
   * Notify progress to listeners
   */
  private notifyProgress(jobId: string, progress: RenderingProgress): void {
    const listener = this.progressListeners.get(jobId);
    if (listener) {
      listener(progress);
    }
  }

  /**
   * Notify completion to listeners
   */
  private notifyCompletion(jobId: string, result: RenderingResult): void {
    const listener = this.completionListeners.get(jobId);
    if (listener) {
      listener(result);
    }
  }

  /**
   * Notify error to listeners
   */
  private notifyError(jobId: string, error: Error): void {
    const listener = this.errorListeners.get(jobId);
    if (listener) {
      listener(error);
    }
  }

  /**
   * Validate document structure
   */
  private validateDocument(document: DocumentContent): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!document.title?.trim()) {
      errors.push('Document title is required');
    }
    
    if (!document.sections || document.sections.length === 0) {
      errors.push('Document must have at least one section');
    }
    
    // Validate sections
    document.sections.forEach((section, index) => {
      if (!section.content || section.content.length === 0) {
        errors.push(`Section "${section.title || `Section ${index + 1}`}" has no content`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Count images in document
   */
  private countImages(document: DocumentContent): number {
    let count = 0;
    
    const countImagesInElements = (elements: ContentElement[]): number => {
      return elements.reduce((total, element) => {
        if (element.type === 'image') {
          return total + 1;
        }
        if (element.type === 'section') {
          return total + countImagesInElements((element as SectionElement).content);
        }
        return total;
      }, 0);
    };
    
    document.sections.forEach(section => {
      count += countImagesInElements(section.content);
    });
    
    return count;
  }

  /**
   * Count elements in document
   */
  private countElements(document: DocumentContent): number {
    let count = 0;
    
    const countElementsRecursive = (elements: ContentElement[]): number => {
      return elements.reduce((total, element) => {
        // Count this element
        let elementCount = 1;
        
        // Count nested elements
        if (element.type === 'section') {
          const section = element as SectionElement;
          elementCount += countElementsRecursive(section.content);
        } else if (element.type === 'list' && Array.isArray((element as any).content)) {
          elementCount += (element as any).content.length;
        } else if (element.type === 'table' && Array.isArray((element as any).content)) {
          elementCount += (element as any).content.length;
        }
        
        return total + elementCount;
      }, 0);
    };
    
    document.sections.forEach(section => {
      count += countElementsRecursive(section.content);
    });
    
    return count;
  }

  /**
   * Count images in page
   */
  private countImagesInPage(pageContent: PageContent): number {
    return pageContent.content.filter(element => element.type === 'image').length;
  }

  /**
   * Render a complete document
   */
  public async renderDocument(
    document: DocumentContent,
    jobId?: string
  ): Promise<RenderingResult> {
    const startTime = Date.now();
    const jobIdToUse = jobId || this.generateJobId('render');
    
    // Create job status
    const jobStatus: JobStatus = {
      jobId: jobIdToUse,
      status: 'processing',
      progress: 0,
      currentStep: 'Initializing',
      startTime,
      errors: [],
      warnings: []
    };
    
    this.jobs.set(jobIdToUse, jobStatus);
    this.activeJobs.add(jobIdToUse);
    
    try {
      // Update progress
      this.updateJobProgress(jobIdToUse, 5, 'Validating document');
      
      // Validate document
      const validationResult = this.validateDocument(document);
      if (!validationResult.valid) {
        throw new Error(`Document validation failed: ${validationResult.errors.join(', ')}`);
      }
      
      // Check cache
      const cacheKey = this.generateCacheKey(document, this.options);
      const cachedResult = this.getFromCache(cacheKey);
      
      if (cachedResult && this.config.cacheEnabled) {
        this.updateJobProgress(jobIdToUse, 100, 'Retrieved from cache');
        jobStatus.status = 'completed';
        jobStatus.endTime = Date.now();
        jobStatus.result = cachedResult;
        
        // Notify completion
        this.notifyCompletion(jobIdToUse, cachedResult);
        
        return cachedResult;
      }
      
      // Process document through pipeline
      this.updateJobProgress(jobIdToUse, 10, 'Processing images');
      
      // 1. Process images (if image pipeline has processDocument method)
      let processedDocument = document;
      if ((this.imagePipeline as any).processDocument) {
        processedDocument = await (this.imagePipeline as any).processDocument(document);
      }
      
      this.updateJobProgress(jobIdToUse, 20, 'Generating CSS layout');
      
      // 2. Generate CSS
      const css = this.cssEngine.generateCSS();
      
      this.updateJobProgress(jobIdToUse, 30, 'Rendering HTML');
      
      // 3. Render HTML
      const renderResult = this.htmlRenderer.renderDocument(processedDocument);
      
      if (renderResult.errors.length > 0) {
        throw new Error(`HTML rendering failed: ${renderResult.errors.join(', ')}`);
      }
      
      this.updateJobProgress(jobIdToUse, 40, 'Adding headers and footers');
      
      // 4. Add headers and footers if enabled
      let finalHTML = renderResult.html || '';
      let finalCSS = css + (renderResult.css || '');
      
      if (this.config.enableHeadersFooters && (this.headerFooterSystem as any).addToDocument) {
        const headerFooterResult = (this.headerFooterSystem as any).addToDocument(
          processedDocument,
          finalHTML
        );
        finalHTML = headerFooterResult.html || finalHTML;
        finalCSS += headerFooterResult.css || '';
      }
      
      this.updateJobProgress(jobIdToUse, 50, 'Generating cover page');
      
      // 5. Add cover page if enabled
      if (this.config.enableCoverPages && (this.coverPageGenerator as any).generateCoverPage) {
        const coverPageResult = (this.coverPageGenerator as any).generateCoverPage(processedDocument);
        finalHTML = (coverPageResult.html || '') + finalHTML;
        finalCSS += coverPageResult.css || '';
      }
      
      this.updateJobProgress(jobIdToUse, 60, 'Applying page breaks');
      
      // 6. Apply page break logic
      if (this.config.enablePageBreaks && (this.pageBreakLogic as any).applyToHTML) {
        const pageBreakResult = (this.pageBreakLogic as any).applyToHTML(finalHTML, finalCSS);
        finalHTML = pageBreakResult.html || finalHTML;
        finalCSS = pageBreakResult.css || finalCSS;
      }
      
      this.updateJobProgress(jobIdToUse, 70, 'Creating rendering result');
      
      // 7. Create rendering result
      const renderingResult: RenderingResult = {
        id: jobIdToUse,
        jobId: jobIdToUse,
        version: '1.0.0',
        status: 'completed',
        progress: 100,
        content: document,
        options: this.options,
        html: finalHTML,
        css: finalCSS,
        pages: [],
        snapshots: [],
        metrics: {
          startTime: new Date(startTime),
          endTime: new Date(),
          duration: Date.now() - startTime,
          pageCount: 0,
          elementCount: this.countElements(document),
          imageCount: this.countImages(document),
          layoutPasses: 0,
          cacheHits: 0,
          cacheMisses: 0
        },
        warnings: [...(renderResult.warnings || []), ...jobStatus.warnings],
        errors: (renderResult.errors || []).map(error => ({
          type: 'rendering' as any,
          message: error,
          timestamp: new Date()
        })),
        createdAt: new Date(startTime),
        updatedAt: new Date()
      };
      
      this.updateJobProgress(jobIdToUse, 80, 'Capturing snapshots');
      
      // 8. Capture snapshots if enabled
      if (this.config.enableSnapshots) {
        const snapshots = await this.snapshotSystem.captureDocumentSnapshot(document, ['rendered']);
        renderingResult.snapshots = snapshots.map(snapshot => {
          const snapshotEntry = this.snapshotSystem.getSnapshot(snapshot.id);
          const data = snapshotEntry?.data || '';
          const dataUrl = data.includes(',') ? data : `data:image/${snapshot.format};base64,${data}`;
          
          return {
            id: snapshot.id,
            pageNumber: snapshot.pageNumber,
            format: snapshot.format as 'png' | 'jpeg' | 'webp',
            dataUrl,
            width: snapshot.dimensions.width,
            height: snapshot.dimensions.height,
            size: dataUrl.length,
            quality: 90,
            captureTime: new Date(snapshot.timestamp),
            metadata: {
              documentId: snapshot.documentId,
              tags: snapshot.tags
            }
          };
        });
      }
      
      this.updateJobProgress(jobIdToUse, 90, 'Exporting to PDF');
      
      // 9. Export to PDF if enabled
      if (this.config.enablePDFExport) {
        try {
          // Create a document content for PDF export
          const pdfDocument: DocumentContent = {
            title: document.title,
            sections: document.sections,
            author: document.author,
            date: document.date,
            metadata: document.metadata
          };
          
          const pdfResult = await this.pdfExporter.exportToPDF(pdfDocument);
          
          // Convert the result to the expected PDFExportResult type
          renderingResult.pdfExport = {
            id: `pdf_${Date.now()}`,
            fileName: `${document.title}.pdf`,
            fileSize: pdfResult.fileSize || 0,
            pageCount: pdfResult.pageCount,
            quality: 'standard',
            generationTime: Date.now() - startTime,
            metadata: pdfResult.metadata
          };
        } catch (pdfError) {
          renderingResult.warnings.push(`PDF export failed: ${pdfError instanceof Error ? pdfError.message : String(pdfError)}`);
        }
      }
      
      this.updateJobProgress(jobIdToUse, 95, 'Caching result');
      
      // 10. Cache the result
      if (this.config.cacheEnabled) {
        this.addToCache(cacheKey, renderingResult);
      }
      
      this.updateJobProgress(jobIdToUse, 100, 'Completed');
      
      // Update job status
      jobStatus.status = 'completed';
      jobStatus.endTime = Date.now();
      jobStatus.result = renderingResult;
      jobStatus.progress = 100;
      jobStatus.currentStep = 'Completed';
      
      // Clean up
      this.activeJobs.delete(jobIdToUse);
      
      // Notify completion
      this.notifyCompletion(jobIdToUse, renderingResult);
      
      // Show preview if enabled
      if (this.config.enablePreview && this.previewWindow && (this.previewWindow as any).showPreview) {
        (this.previewWindow as any).showPreview(finalHTML, finalCSS, {
          title: document.title,
          snapshots: renderingResult.snapshots
        });
      }
      
      return renderingResult;
      
    } catch (error) {
      // Update job status with error
      jobStatus.status = 'failed';
      jobStatus.endTime = Date.now();
      jobStatus.errors.push(error instanceof Error ? error.message : String(error));
      
      // Clean up
      this.activeJobs.delete(jobIdToUse);
      
      // Notify error
      this.notifyError(jobIdToUse, error instanceof Error ? error : new Error(String(error)));
      
      throw error;
    }
  }

  /**
   * Render a single page
   */
  public async renderPage(
    pageContent: PageContent,
    documentId: string,
    jobId?: string
  ): Promise<RenderingResult> {
    const startTime = Date.now();
    const jobIdToUse = jobId || this.generateJobId('page');
    
    // Create job status
    const jobStatus: JobStatus = {
      jobId: jobIdToUse,
      status: 'processing',
      progress: 0,
      currentStep: 'Initializing',
      startTime,
      errors: [],
      warnings: []
    };
    
    this.jobs.set(jobIdToUse, jobStatus);
    this.activeJobs.add(jobIdToUse);
    
    try {
      this.updateJobProgress(jobIdToUse, 10, 'Rendering page HTML');
      
      // Render page to HTML (if htmlRenderer has renderPage method)
      let pageHTML = { html: '', css: '', warnings: [] as string[], errors: [] as string[] };
      if ((this.htmlRenderer as any).renderPage) {
        pageHTML = (this.htmlRenderer as any).renderPage(pageContent);
      } else {
        // Fallback: simple page rendering
        const elements = pageContent.content.map(element => {
          switch (element.type) {
            case 'heading':
              const heading = element as any;
              return `<h${heading.level || 1}>${heading.content}</h${heading.level || 1}>`;
            case 'paragraph':
              const para = element as any;
              return `<p>${para.content}</p>`;
            case 'image':
              const img = element as any;
              return `<img src="${img.content?.url || ''}" alt="${img.content?.alt || ''}" />`;
            default:
              return `<div>${JSON.stringify(element)}</div>`;
          }
        }).join('');
        
        pageHTML.html = `<div class="page">${elements}</div>`;
      }
      
      this.updateJobProgress(jobIdToUse, 30, 'Generating CSS');
      
      // Generate CSS
      const css = this.cssEngine.generateCSS();
      
      this.updateJobProgress(jobIdToUse, 50, 'Creating result');
      
      // Create rendering result
      const renderingResult: RenderingResult = {
        id: jobIdToUse,
        jobId: jobIdToUse,
        version: '1.0.0',
        status: 'completed',
        progress: 100,
        content: {
          title: documentId,
          sections: [{
            id: 'page-section',
            type: 'section',
            title: `Page ${pageContent.pageNumber || 1}`,
            content: pageContent.content
          }]
        },
        options: this.options,
        html: pageHTML.html,
        css: css + (pageHTML.css || ''),
        pages: [],
        snapshots: [],
        metrics: {
          startTime: new Date(startTime),
          endTime: new Date(),
          duration: Date.now() - startTime,
          pageCount: 1,
          elementCount: pageContent.content.length,
          imageCount: this.countImagesInPage(pageContent),
          layoutPasses: 0,
          cacheHits: 0,
          cacheMisses: 0
        },
        warnings: [...(pageHTML.warnings || []), ...jobStatus.warnings],
        errors: (pageHTML.errors || []).map(error => ({
          type: 'rendering' as any,
          message: error,
          timestamp: new Date()
        })),
        createdAt: new Date(startTime),
        updatedAt: new Date()
      };
      
      this.updateJobProgress(jobIdToUse, 70, 'Capturing snapshot');
      
      // Capture snapshot if enabled
      if (this.config.enableSnapshots) {
        const snapshot = await this.snapshotSystem.capturePageSnapshot(
          pageContent,
          documentId,
          [`page-${pageContent.pageNumber}`]
        );
        
        if (snapshot) {
          const snapshotEntry = this.snapshotSystem.getSnapshot(snapshot.id);
          const data = snapshotEntry?.data || '';
          const dataUrl = data.includes(',') ? data : `data:image/${snapshot.format};base64,${data}`;
          
          renderingResult.snapshots.push({
            id: snapshot.id,
            pageNumber: snapshot.pageNumber,
            format: snapshot.format as 'png' | 'jpeg' | 'webp',
            dataUrl,
            width: snapshot.dimensions.width,
            height: snapshot.dimensions.height,
            size: dataUrl.length,
            quality: 90,
            captureTime: new Date(snapshot.timestamp),
            metadata: {
              documentId: snapshot.documentId,
              tags: snapshot.tags
            }
          });
        }
      }
      
      this.updateJobProgress(jobIdToUse, 90, 'Finalizing');
      
      // Update job status
      jobStatus.status = 'completed';
      jobStatus.endTime = Date.now();
      jobStatus.result = renderingResult;
      jobStatus.progress = 100;
      jobStatus.currentStep = 'Completed';
      
      // Clean up
      this.activeJobs.delete(jobIdToUse);
      
      // Notify completion
      this.notifyCompletion(jobIdToUse, renderingResult);
      
      return renderingResult;
      
    } catch (error) {
      // Update job status with error
      jobStatus.status = 'failed';
      jobStatus.endTime = Date.now();
      jobStatus.errors.push(error instanceof Error ? error.message : String(error));
      
      // Clean up
      this.activeJobs.delete(jobIdToUse);
      
      // Notify error
      this.notifyError(jobIdToUse, error instanceof Error ? error : new Error(String(error)));
      
      throw error;
    }
  }

  /**
   * Export document to PDF
   */
  public async exportToPDF(
    document: DocumentContent,
    options?: any
  ): Promise<any> {
    if (!this.config.enablePDFExport) {
      throw new Error('PDF export is disabled');
    }
    
    // First render the document
    const renderResult = await this.renderDocument(document);
    
    // Then export to PDF
    const pdfResult = await this.pdfExporter.exportToPDF(document);
    
    return pdfResult;
  }

  /**
   * Get preview window
   */
  public getPreviewWindow(): VisualPreviewWindow | null {
    return this.previewWindow;
  }

  /**
   * Get snapshot system
   */
  public getSnapshotSystem(): SnapshotCaptureSystem {
    return this.snapshotSystem;
  }

  /**
   * Get job status
   */
  public getJobStatus(jobId: string): JobStatus | null {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Get all active jobs
   */
  public getActiveJobs(): JobStatus[] {
    return Array.from(this.activeJobs)
      .map(jobId => this.jobs.get(jobId))
      .filter(Boolean) as JobStatus[];
  }

  /**
   * Cancel a job
   */
  public cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'processing') {
      return false;
    }
    
    job.status = 'cancelled';
    job.endTime = Date.now();
    job.currentStep = 'Cancelled';
    
    this.activeJobs.delete(jobId);
    
    return true;
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): {
    size: number;
    totalSize: number;
    hitRate: number;
  } {
    let totalSize = 0;
    let hitCount = 0;
    let missCount = 0;
    
    for (const entry of this.cache.values()) {
      totalSize += entry.metadata.size;
    }
    
    // Simple hit/miss tracking (in a real implementation, track actual hits/misses)
    const hitRate = this.cache.size > 0 ? 0.5 : 0; // Placeholder
    
    return {
      size: this.cache.size,
      totalSize,
      hitRate
    };
  }

  /**
   * Add progress listener
   */
  public addProgressListener(jobId: string, listener: (progress: RenderingProgress) => void): void {
    this.progressListeners.set(jobId, listener);
  }

  /**
   * Add completion listener
   */
  public addCompletionListener(jobId: string, listener: (result: RenderingResult) => void): void {
    this.completionListeners.set(jobId, listener);
  }

  /**
   * Add error listener
   */
  public addErrorListener(jobId: string, listener: (error: Error) => void): void {
    this.errorListeners.set(jobId, listener);
  }

  /**
   * Remove all listeners for a job
   */
  public removeListeners(jobId: string): void {
    this.progressListeners.delete(jobId);
    this.completionListeners.delete(jobId);
    this.errorListeners.delete(jobId);
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<VisualRenderingEngineConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Update preview window if needed
    if (this.config.enablePreview && !this.previewWindow) {
      this.previewWindow = new VisualPreviewWindow(this.options);
    } else if (!this.config.enablePreview && this.previewWindow) {
      this.previewWindow = null;
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): VisualRenderingEngineConfig {
    return { ...this.config };
  }

  /**
   * Get engine statistics
   */
  public getStatistics(): {
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
    failedJobs: number;
    cacheSize: number;
    cacheHitRate: number;
    componentStatus: Record<string, boolean>;
  } {
    const totalJobs = this.jobs.size;
    const activeJobs = this.activeJobs.size;
    const completedJobs = Array.from(this.jobs.values()).filter(job => job.status === 'completed').length;
    const failedJobs = Array.from(this.jobs.values()).filter(job => job.status === 'failed').length;
    
    const cacheStats = this.getCacheStats();
    
    return {
      totalJobs,
      activeJobs,
      completedJobs,
      failedJobs,
      cacheSize: cacheStats.size,
      cacheHitRate: cacheStats.hitRate,
      componentStatus: {
        cssEngine: true,
        htmlRenderer: true,
        headerFooterSystem: !!this.headerFooterSystem,
        coverPageGenerator: !!this.coverPageGenerator,
        imagePipeline: !!this.imagePipeline,
        pageBreakLogic: !!this.pageBreakLogic,
        pdfExporter: !!this.pdfExporter,
        previewWindow: !!this.previewWindow,
        snapshotSystem: !!this.snapshotSystem
      }
    };
  }

  /**
   * Reset engine state (clear jobs, cache, etc.)
   */
  public reset(): void {
    this.jobs.clear();
    this.activeJobs.clear();
    this.cache.clear();
    this.progressListeners.clear();
    this.completionListeners.clear();
    this.errorListeners.clear();
    
    // Reset components if they have reset methods
    const components = [
      this.cssEngine,
      this.htmlRenderer,
      this.headerFooterSystem,
      this.coverPageGenerator,
      this.imagePipeline,
      this.pageBreakLogic,
      this.pdfExporter,
      this.previewWindow,
      this.snapshotSystem
    ];
    
    components.forEach(component => {
      if (component && (component as any).reset) {
        (component as any).reset();
      }
    });
  }

  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    // Cancel all active jobs
    for (const jobId of this.activeJobs) {
      this.cancelJob(jobId);
    }
    
    // Clean up components if they have cleanup methods
    const components = [
      this.cssEngine,
      this.htmlRenderer,
      this.headerFooterSystem,
      this.coverPageGenerator,
      this.imagePipeline,
      this.pageBreakLogic,
      this.pdfExporter,
      this.previewWindow,
      this.snapshotSystem
    ];
    
    for (const component of components) {
      if (component && (component as any).cleanup) {
        await (component as any).cleanup();
      }
    }
    
    // Clear all data
    this.reset();
  }
}