/**
 * Phase 15: HTML Rendering & Visual Reproduction Engine
 * Visual Preview Window
 * 
 * Provides an interactive preview of rendered documents with zoom,
 * pan, rulers, grid, and margin visualization.
 */

import type {
  RenderingOptions,
  ContentElement,
  DocumentContent,
  PageContent
} from '../types';

import { HTMLRenderer } from './HTMLRenderer';
import { CSSLayoutEngine } from './CSSLayoutEngine';
import { PageBreakLogic } from './PageBreakLogic';
import { MultiPagePDFExport } from './MultiPagePDFExport';

/**
 * Preview window configuration
 */
export interface PreviewWindowConfig {
  enabled: boolean;
  interactive: boolean;
  zoomLevel: number; // 0.5 to 3.0
  showRulers: boolean;
  showGrid: boolean;
  showMargins: boolean;
  showPageNumbers: boolean;
  showOutline: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // milliseconds
  theme: 'light' | 'dark' | 'system';
  pageSpacing: number; // pixels between pages
  maxWidth: number; // maximum preview width in pixels
  responsive: boolean;
}

/**
 * Default preview window configuration
 */
export const DEFAULT_PREVIEW_CONFIG: PreviewWindowConfig = {
  enabled: true,
  interactive: true,
  zoomLevel: 1.0,
  showRulers: false,
  showGrid: false,
  showMargins: true,
  showPageNumbers: true,
  showOutline: true,
  autoRefresh: true,
  refreshInterval: 1000,
  theme: 'light',
  pageSpacing: 20,
  maxWidth: 1200,
  responsive: true
};

/**
 * Preview window state
 */
export interface PreviewWindowState {
  zoomLevel: number;
  currentPage: number;
  totalPages: number;
  scrollPosition: { x: number; y: number };
  isPanning: boolean;
  isDragging: boolean;
  showControls: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Preview window event types
 */
export type PreviewEventType = 
  | 'zoom-changed'
  | 'page-changed'
  | 'scroll'
  | 'pan-start'
  | 'pan-end'
  | 'drag-start'
  | 'drag-end'
  | 'refresh'
  | 'error'
  | 'loaded';

/**
 * Preview window event
 */
export interface PreviewEvent {
  type: PreviewEventType;
  data?: any;
  timestamp: number;
}

/**
 * Preview window metrics
 */
export interface PreviewMetrics {
  renderTime: number; // milliseconds
  memoryUsage: number; // bytes
  elementCount: number;
  pageCount: number;
  zoomLevel: number;
  viewportSize: { width: number; height: number };
  scrollPosition: { x: number; y: number };
}

/**
 * Visual Preview Window
 */
export class VisualPreviewWindow {
  private options: RenderingOptions;
  private config: PreviewWindowConfig;
  private htmlRenderer: HTMLRenderer;
  private cssEngine: CSSLayoutEngine;
  private pageBreakLogic: PageBreakLogic;
  private pdfExport: MultiPagePDFExport;
  
  private state: PreviewWindowState;
  private metrics: PreviewMetrics;
  private eventListeners: Map<PreviewEventType, Function[]> = new Map();
  private refreshTimer: NodeJS.Timeout | null = null;
  private container: HTMLElement | null = null;
  private previewElement: HTMLElement | null = null;
  private warnings: string[] = [];
  private errors: string[] = [];

  constructor(
    options: RenderingOptions,
    config: Partial<PreviewWindowConfig> = {}
  ) {
    this.options = options;
    this.config = { ...DEFAULT_PREVIEW_CONFIG, ...config };
    this.htmlRenderer = new HTMLRenderer(options);
    this.cssEngine = new CSSLayoutEngine(options);
    this.pageBreakLogic = new PageBreakLogic(options);
    this.pdfExport = new MultiPagePDFExport(options);
    
    this.state = {
      zoomLevel: this.config.zoomLevel,
      currentPage: 1,
      totalPages: 0,
      scrollPosition: { x: 0, y: 0 },
      isPanning: false,
      isDragging: false,
      showControls: true,
      isLoading: false,
      error: null
    };
    
    this.metrics = {
      renderTime: 0,
      memoryUsage: 0,
      elementCount: 0,
      pageCount: 0,
      zoomLevel: this.config.zoomLevel,
      viewportSize: { width: 0, height: 0 },
      scrollPosition: { x: 0, y: 0 }
    };
  }

  /**
   * Initialize preview window in a container
   */
  public initialize(container: HTMLElement): boolean {
    try {
      this.container = container;
      this.resetMessages();
      
      // Clear container
      container.innerHTML = '';
      
      // Create preview structure
      this.createPreviewStructure();
      
      // Start auto-refresh if enabled
      if (this.config.autoRefresh) {
        this.startAutoRefresh();
      }
      
      // Initialize metrics
      this.updateMetrics();
      
      this.emitEvent('loaded', { containerId: container.id });
      return true;
      
    } catch (error) {
      this.errors.push(`Failed to initialize preview window: ${error instanceof Error ? error.message : String(error)}`);
      this.emitEvent('error', { error: this.errors[this.errors.length - 1] });
      return false;
    }
  }

  /**
   * Render document in preview window
   */
  public async renderDocument(document: DocumentContent): Promise<boolean> {
    if (!this.container) {
      this.errors.push('Preview window not initialized. Call initialize() first.');
      return false;
    }
    
    this.setState({ isLoading: true, error: null });
    
    try {
      const startTime = performance.now();
      
      // Apply page breaks
      const pageBreakResult = this.pageBreakLogic.applyPageBreaks(document);
      this.state.totalPages = pageBreakResult.pages.length;
      
      if (pageBreakResult.errors.length > 0) {
        this.errors.push(...pageBreakResult.errors);
      }
      if (pageBreakResult.warnings.length > 0) {
        this.warnings.push(...pageBreakResult.warnings);
      }
      
      // Generate HTML for each page
      const pageHTMLs: string[] = [];
      let totalElements = 0;
      
      for (let i = 0; i < pageBreakResult.pages.length; i++) {
        const pageContent = pageBreakResult.pages[i];
        const pageNumber = i + 1;
        
        // Create page container
        const pageHTML = this.renderPage(pageContent, pageNumber, pageBreakResult.pages.length);
        pageHTMLs.push(pageHTML);
        
        totalElements += pageContent.length;
      }
      
      // Update preview content
      if (this.previewElement) {
        this.previewElement.innerHTML = pageHTMLs.join('');
      }
      
      // Update state and metrics
      this.setState({ 
        isLoading: false,
        totalPages: pageBreakResult.pages.length,
        currentPage: Math.min(this.state.currentPage, pageBreakResult.pages.length)
      });
      
      this.metrics.renderTime = performance.now() - startTime;
      this.metrics.elementCount = totalElements;
      this.metrics.pageCount = pageBreakResult.pages.length;
      
      // Update view
      this.updateView();
      
      this.emitEvent('refresh', { pageCount: pageBreakResult.pages.length, elementCount: totalElements });
      return true;
      
    } catch (error) {
      this.setState({ 
        isLoading: false, 
        error: `Failed to render document: ${error instanceof Error ? error.message : String(error)}` 
      });
      this.errors.push(this.state.error!);
      this.emitEvent('error', { error: this.state.error });
      return false;
    }
  }

  /**
   * Create preview window structure
   */
  private createPreviewStructure(): void {
    if (!this.container) return;
    
    // Create main wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'visual-preview-wrapper';
    wrapper.style.cssText = `
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
      background-color: ${this.config.theme === 'dark' ? '#1a1a1a' : '#f5f5f5'};
    `;
    
    // Create controls panel
    if (this.config.interactive && this.state.showControls) {
      const controls = this.createControlsPanel();
      wrapper.appendChild(controls);
    }
    
    // Create preview container
    const previewContainer = document.createElement('div');
    previewContainer.className = 'preview-container';
    previewContainer.style.cssText = `
      position: absolute;
      top: ${this.config.interactive && this.state.showControls ? '60px' : '0'};
      left: 0;
      right: 0;
      bottom: 0;
      overflow: auto;
      padding: 20px;
    `;
    
    // Create preview content
    const previewContent = document.createElement('div');
    previewContent.className = 'preview-content';
    previewContent.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100%;
      transform: scale(${this.state.zoomLevel});
      transform-origin: top center;
      transition: transform 0.2s ease;
    `;
    
    this.previewElement = previewContent;
    previewContainer.appendChild(previewContent);
    wrapper.appendChild(previewContainer);
    
    // Add event listeners for interactivity
    if (this.config.interactive) {
      this.addInteractivity(previewContainer, previewContent);
    }
    
    // Add CSS styles
    this.addStyles();
    
    this.container.appendChild(wrapper);
  }

  /**
   * Create controls panel
   */
  private createControlsPanel(): HTMLElement {
    const controls = document.createElement('div');
    controls.className = 'preview-controls';
    controls.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      background-color: ${this.config.theme === 'dark' ? '#2d2d2d' : '#ffffff'};
      border-bottom: 1px solid ${this.config.theme === 'dark' ? '#444' : '#ddd'};
      display: flex;
      align-items: center;
      padding: 0 20px;
      z-index: 100;
    `;
    
    // Zoom controls
    const zoomControls = document.createElement('div');
    zoomControls.className = 'zoom-controls';
    zoomControls.style.cssText = 'display: flex; align-items: center; margin-right: 20px;';
    
    const zoomOutBtn = this.createButton('−', 'Zoom out', () => this.zoomOut());
    const zoomLevelDisplay = document.createElement('span');
    zoomLevelDisplay.className = 'zoom-level';
    zoomLevelDisplay.textContent = `${Math.round(this.state.zoomLevel * 100)}%`;
    zoomLevelDisplay.style.cssText = 'margin: 0 10px; min-width: 50px; text-align: center;';
    
    const zoomInBtn = this.createButton('+', 'Zoom in', () => this.zoomIn());
    
    zoomControls.appendChild(zoomOutBtn);
    zoomControls.appendChild(zoomLevelDisplay);
    zoomControls.appendChild(zoomInBtn);
    
    // Page navigation
    const pageControls = document.createElement('div');
    pageControls.className = 'page-controls';
    pageControls.style.cssText = 'display: flex; align-items: center; margin-right: 20px;';
    
    const prevPageBtn = this.createButton('←', 'Previous page', () => this.previousPage());
    const pageDisplay = document.createElement('span');
    pageDisplay.className = 'page-display';
    pageDisplay.textContent = `Page ${this.state.currentPage} of ${this.state.totalPages}`;
    pageDisplay.style.cssText = 'margin: 0 10px; min-width: 120px; text-align: center;';
    
    const nextPageBtn = this.createButton('→', 'Next page', () => this.nextPage());
    
    pageControls.appendChild(prevPageBtn);
    pageControls.appendChild(pageDisplay);
    pageControls.appendChild(nextPageBtn);
    
    // View controls
    const viewControls = document.createElement('div');
    viewControls.className = 'view-controls';
    viewControls.style.cssText = 'display: flex; align-items: center; margin-right: 20px;';
    
    const rulersToggle = this.createToggleButton('Rulers', this.config.showRulers, (checked) => {
      this.config.showRulers = checked;
      this.updateView();
    });
    
    const gridToggle = this.createToggleButton('Grid', this.config.showGrid, (checked) => {
      this.config.showGrid = checked;
      this.updateView();
    });
    
    const marginsToggle = this.createToggleButton('Margins', this.config.showMargins, (checked) => {
      this.config.showMargins = checked;
      this.updateView();
    });
    
    viewControls.appendChild(rulersToggle);
    viewControls.appendChild(gridToggle);
    viewControls.appendChild(marginsToggle);
    
    // Add all controls
    controls.appendChild(zoomControls);
    controls.appendChild(pageControls);
    controls.appendChild(viewControls);
    
    return controls;
  }

  /**
   * Create a button element
   */
  private createButton(text: string, title: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.title = title;
    button.style.cssText = `
      padding: 6px 12px;
      background-color: ${this.config.theme === 'dark' ? '#444' : '#f0f0f0'};
      border: 1px solid ${this.config.theme === 'dark' ? '#666' : '#ccc'};
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      color: ${this.config.theme === 'dark' ? '#fff' : '#333'};
    `;
    button.addEventListener('click', onClick);
    return button;
  }

  /**
   * Create a toggle button
   */
  private createToggleButton(text: string, initialState: boolean, onChange: (checked: boolean) => void): HTMLElement {
    const container = document.createElement('div');
    container.style.cssText = 'display: flex; align-items: center; margin-right: 10px;';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = initialState;
    checkbox.style.cssText = 'margin-right: 5px;';
    checkbox.addEventListener('change', (e) => {
      onChange((e.target as HTMLInputElement).checked);
    });
    
    const label = document.createElement('label');
    label.textContent = text;
    label.style.cssText = `font-size: 12px; color: ${this.config.theme === 'dark' ? '#ccc' : '#666'};`;
    
    container.appendChild(checkbox);
    container.appendChild(label);
    
    return container;
  }

  /**
   * Render a single page
   */
  private renderPage(content: ContentElement[], pageNumber: number, totalPages: number): string {
    const pageSize = this.getPageSize();
    const pageWidth = pageSize.width;
    const pageHeight = pageSize.height;
    
    let pageHTML = `<div class="preview-page" data-page-number="${pageNumber}" style="width: ${pageWidth}mm; height: ${pageHeight}mm;">`;
    
    // Page background
    pageHTML += `<div class="page-background" style="width: 100%; height: 100%; background-color: white; position: relative;">`;
    
    // Margins visualization
    if (this.config.showMargins) {
      const margins = this.options.layout.margins;
      pageHTML += `<div class="page-margins" style="
        position: absolute;
        top: ${margins.top}mm;
        right: ${margins.right}mm;
        bottom: ${margins.bottom}mm;
        left: ${margins.left}mm;
        border: 1px dashed rgba(0, 0, 0, 0.2);
        pointer-events: none;
      "></div>`;
    }
    
    // Grid visualization
    if (this.config.showGrid) {
      pageHTML += `<div class="page-grid" style="
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: 
          linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
        background-size: 20px 20px;
        pointer-events: none;
      "></div>`;
    }
    
    // Page content
    pageHTML += `<div class="page-content" style="
      position: absolute;
      top: ${this.options.layout.margins.top}mm;
      right: ${this.options.layout.margins.right}mm;
      bottom: ${this.options.layout.margins.bottom}mm;
      left: ${this.options.layout.margins.left}mm;
      padding: 0;
      overflow: hidden;
    ">`;
    
    // Render content elements
    for (const element of content) {
      pageHTML += this.renderElementAsHTML(element);
    }
    
    pageHTML += `</div>`; // Close page-content
    
    // Page number
    if (this.config.showPageNumbers) {
      pageHTML += `<div class="page-number" style="
        position: absolute;
        bottom: 5mm;
        right: 5mm;
        font-size: 10pt;
        color: #666;
      ">${pageNumber} / ${totalPages}</div>`;
    }
    
    pageHTML += `</div>`; // Close page-background
    pageHTML += `</div>`; // Close preview-page
    
    return pageHTML;
  }

  /**
   * Render a single element as HTML (simplified)
   */
  private renderElementAsHTML(element: ContentElement): string {
    // Simplified rendering - similar to MultiPagePDFExport
    switch (element.type) {
      case 'text':
        return `<span class="text-element">${this.escapeHTML(String(element.content))}</span>`;
      case 'heading':
        const level = (element as any).level || 1;
        return `<h${level} class="heading-element">${this.escapeHTML(String(element.content))}</h${level}>`;
      case 'paragraph':
        return `<p class="paragraph-element">${this.escapeHTML(String(element.content))}</p>`;
      case 'list':
        const items = (element as any).content || [];
        const tag = (element as any).ordered ? 'ol' : 'ul';
        let listHTML = `<${tag} class="list-element">`;
        for (const item of items) {
          listHTML += `<li>${this.escapeHTML(String(item.content || item))}</li>`;
        }
        listHTML += `</${tag}>`;
        return listHTML;
      case 'image':
        const imgSrc = (element as any).content?.url || (element as any).content?.dataUrl || '';
        const alt = (element as any).content?.alt || '';
        return `<img src="${imgSrc}" alt="${this.escapeHTML(alt)}" class="image-element" style="max-width: 100%;">`;
      default:
        return `<div class="${element.type}-element">${this.escapeHTML(String(element.content))}</div>`;
    }
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
   * Get page size based on configuration
   */
  private getPageSize(): { width: number; height: number; unit: 'mm' } {
    const layout = this.options.layout;
    const orientation = layout.orientation;

    // Standard page sizes in millimeters
    const pageSizes: Record<string, { width: number; height: number }> = {
      'A4': { width: 210, height: 297 },
      'A3': { width: 297, height: 420 },
      'Letter': { width: 216, height: 279 },
      'Legal': { width: 216, height: 356 }
    };

    let size = pageSizes[layout.size] || pageSizes['A4'];
    
    // Adjust for orientation
    if (orientation === 'landscape') {
      size = { width: size.height, height: size.width };
    }

    return {
      width: size.width,
      height: size.height,
      unit: 'mm'
    };
  }

  /**
   * Add interactivity to preview
   */
  private addInteractivity(container: HTMLElement, content: HTMLElement): void {
    // Zoom with mouse wheel
    container.addEventListener('wheel', (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        this.setZoomLevel(this.state.zoomLevel + delta);
      }
    });

    // Pan with mouse drag
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let scrollLeft = 0;
    let scrollTop = 0;

    container.addEventListener('mousedown', (e) => {
      if (e.button === 1 || (e.button === 0 && e.altKey)) { // Middle click or Alt+Left click
        isDragging = true;
        startX = e.pageX - container.offsetLeft;
        startY = e.pageY - container.offsetTop;
        scrollLeft = container.scrollLeft;
        scrollTop = container.scrollTop;
        container.style.cursor = 'grabbing';
        this.emitEvent('pan-start', { x: startX, y: startY });
      }
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const y = e.pageY - container.offsetTop;
      const walkX = (x - startX) * 2;
      const walkY = (y - startY) * 2;
      container.scrollLeft = scrollLeft - walkX;
      container.scrollTop = scrollTop - walkY;
    });

    container.addEventListener('mouseup', () => {
      isDragging = false;
      container.style.cursor = 'default';
      this.emitEvent('pan-end', {});
    });

    container.addEventListener('mouseleave', () => {
      isDragging = false;
      container.style.cursor = 'default';
    });
  }

  /**
   * Add CSS styles to preview
   */
  private addStyles(): void {
    if (!this.container) return;
    
    const style = document.createElement('style');
    style.textContent = `
      .preview-page {
        background-color: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin-bottom: ${this.config.pageSpacing}px;
        position: relative;
        page-break-inside: avoid;
      }
      
      .preview-page:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }
      
      .preview-page.active {
        box-shadow: 0 0 0 2px #007bff;
      }
      
      .text-element {
        font-family: ${this.options.typography.fontFamily};
        font-size: ${this.options.typography.fontSize}pt;
        color: ${this.options.colors.text};
      }
      
      .heading-element {
        font-family: ${this.options.typography.headingFontFamily || this.options.typography.fontFamily};
        color: ${this.options.colors.headings};
        margin: 1em 0;
      }
      
      .paragraph-element {
        margin: 0.5em 0;
        line-height: ${this.options.typography.lineHeight};
      }
      
      .list-element {
        margin: 0.5em 0;
        padding-left: 2em;
      }
      
      .image-element {
        display: block;
        margin: 1em auto;
      }
      
      @media (max-width: 768px) {
        .preview-page {
          width: 100% !important;
          height: auto !important;
          aspect-ratio: 210 / 297; /* A4 aspect ratio */
        }
      }
    `;
    
    this.container.appendChild(style);
  }

  /**
   * Update preview view based on current state
   */
  private updateView(): void {
    if (!this.previewElement || !this.container) return;
    
    // Update zoom
    this.previewElement.style.transform = `scale(${this.state.zoomLevel})`;
    
    // Update page spacing
    const pages = this.container.querySelectorAll('.preview-page');
    pages.forEach(page => {
      (page as HTMLElement).style.marginBottom = `${this.config.pageSpacing}px`;
    });
    
    // Update active page
    pages.forEach(page => {
      const pageNumber = parseInt(page.getAttribute('data-page-number') || '0');
      if (pageNumber === this.state.currentPage) {
        page.classList.add('active');
      } else {
        page.classList.remove('active');
      }
    });
    
    // Update controls if they exist
    const zoomDisplay = this.container.querySelector('.zoom-level');
    if (zoomDisplay) {
      zoomDisplay.textContent = `${Math.round(this.state.zoomLevel * 100)}%`;
    }
    
    const pageDisplay = this.container.querySelector('.page-display');
    if (pageDisplay) {
      pageDisplay.textContent = `Page ${this.state.currentPage} of ${this.state.totalPages}`;
    }
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    if (!this.container) return;
    
    this.metrics.viewportSize = {
      width: this.container.clientWidth,
      height: this.container.clientHeight
    };
    
    this.metrics.zoomLevel = this.state.zoomLevel;
    
    // Update scroll position
    const previewContainer = this.container.querySelector('.preview-container');
    if (previewContainer) {
      this.metrics.scrollPosition = {
        x: previewContainer.scrollLeft,
        y: previewContainer.scrollTop
      };
    }
    
    // Update memory usage (simplified)
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      this.metrics.memoryUsage = (performance as any).memory.usedJSHeapSize;
    }
  }

  /**
   * Set zoom level
   */
  public setZoomLevel(zoomLevel: number): void {
    const newZoomLevel = Math.max(0.1, Math.min(5.0, zoomLevel));
    if (newZoomLevel !== this.state.zoomLevel) {
      this.state.zoomLevel = newZoomLevel;
      this.metrics.zoomLevel = newZoomLevel;
      this.updateView();
      this.emitEvent('zoom-changed', { zoomLevel: newZoomLevel });
    }
  }

  /**
   * Zoom in
   */
  public zoomIn(): void {
    this.setZoomLevel(this.state.zoomLevel + 0.1);
  }

  /**
   * Zoom out
   */
  public zoomOut(): void {
    this.setZoomLevel(this.state.zoomLevel - 0.1);
  }

  /**
   * Go to specific page
   */
  public goToPage(pageNumber: number): void {
    const newPage = Math.max(1, Math.min(this.state.totalPages, pageNumber));
    if (newPage !== this.state.currentPage) {
      this.state.currentPage = newPage;
      this.updateView();
      
      // Scroll to page
      if (this.container) {
        const pageElement = this.container.querySelector(`.preview-page[data-page-number="${newPage}"]`);
        if (pageElement && this.container.querySelector('.preview-container')) {
          const container = this.container.querySelector('.preview-container') as HTMLElement;
          const pageRect = pageElement.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          container.scrollTop = pageRect.top - containerRect.top + container.scrollTop - 100;
        }
      }
      
      this.emitEvent('page-changed', { pageNumber: newPage });
    }
  }

  /**
   * Go to next page
   */
  public nextPage(): void {
    this.goToPage(this.state.currentPage + 1);
  }

  /**
   * Go to previous page
   */
  public previousPage(): void {
    this.goToPage(this.state.currentPage - 1);
  }

  /**
   * Set preview window state
   */
  private setState(updates: Partial<PreviewWindowState>): void {
    this.state = { ...this.state, ...updates };
  }

  /**
   * Reset warning and error messages
   */
  private resetMessages(): void {
    this.warnings = [];
    this.errors = [];
  }

  /**
   * Start auto-refresh timer
   */
  private startAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    
    this.refreshTimer = setInterval(() => {
      this.updateMetrics();
      this.emitEvent('refresh', { metrics: this.metrics });
    }, this.config.refreshInterval);
  }

  /**
   * Stop auto-refresh timer
   */
  public stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Emit an event
   */
  private emitEvent(type: PreviewEventType, data?: any): void {
    const event: PreviewEvent = {
      type,
      data,
      timestamp: Date.now()
    };
    
    const listeners = this.eventListeners.get(type) || [];
    listeners.forEach(listener => listener(event));
  }

  /**
   * Add event listener
   */
  public addEventListener(type: PreviewEventType, listener: (event: PreviewEvent) => void): void {
    const listeners = this.eventListeners.get(type) || [];
    listeners.push(listener);
    this.eventListeners.set(type, listeners);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(type: PreviewEventType, listener: (event: PreviewEvent) => void): void {
    const listeners = this.eventListeners.get(type) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
      this.eventListeners.set(type, listeners);
    }
  }

  /**
   * Get current state
   */
  public getState(): PreviewWindowState {
    return { ...this.state };
  }

  /**
   * Get current metrics
   */
  public getMetrics(): PreviewMetrics {
    return { ...this.metrics };
  }

  /**
   * Get warnings
   */
  public getWarnings(): string[] {
    return [...this.warnings];
  }

  /**
   * Get errors
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

  /**
   * Destroy preview window and clean up resources
   */
  public destroy(): void {
    this.stopAutoRefresh();
    
    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }
    
    this.previewElement = null;
    this.eventListeners.clear();
    
    this.emitEvent('loaded', { destroyed: true });
  }
}