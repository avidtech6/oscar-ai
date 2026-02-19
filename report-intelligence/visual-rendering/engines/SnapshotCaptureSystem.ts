/**
 * Phase 15: HTML Rendering & Visual Reproduction Engine
 * Snapshot Capture System
 * 
 * Captures visual snapshots of rendered content for comparison,
 * reproduction testing, and visual regression detection.
 */

import type {
  RenderingOptions,
  ContentElement,
  DocumentContent,
  PageContent,
  SectionElement
} from '../types';

import { HTMLRenderer } from './HTMLRenderer';
import { CSSLayoutEngine } from './CSSLayoutEngine';
import { VisualPreviewWindow } from './VisualPreviewWindow';

/**
 * Snapshot capture configuration
 */
export interface SnapshotConfig {
  enabled: boolean;
  format: 'png' | 'jpeg' | 'webp';
  quality: number; // 0-100
  scale: number; // device pixel ratio
  includeBackground: boolean;
  captureDelay: number; // milliseconds
  compareThreshold: number; // 0-1, similarity threshold
  maxSnapshots: number; // maximum snapshots to keep
  storageLocation: 'memory' | 'localStorage' | 'indexedDB' | 'file';
  autoCompare: boolean;
  generateDiff: boolean;
  diffHighlightColor: string;
}

/**
 * Default snapshot configuration
 */
export const DEFAULT_SNAPSHOT_CONFIG: SnapshotConfig = {
  enabled: true,
  format: 'png',
  quality: 90,
  scale: 1,
  includeBackground: true,
  captureDelay: 100,
  compareThreshold: 0.95,
  maxSnapshots: 100,
  storageLocation: 'memory',
  autoCompare: true,
  generateDiff: true,
  diffHighlightColor: '#ff0000'
};

/**
 * Snapshot metadata
 */
export interface SnapshotMetadata {
  id: string;
  timestamp: number;
  documentId: string;
  pageNumber: number;
  totalPages: number;
  format: string;
  size: number; // bytes
  dimensions: { width: number; height: number };
  checksum: string;
  tags: string[];
  annotations: Record<string, any>;
}

/**
 * Snapshot comparison result
 */
export interface SnapshotComparison {
  identical: boolean;
  similarity: number; // 0-1
  differences: number;
  diffImage?: string; // base64 encoded diff image
  metrics: {
    structuralSimilarity: number;
    pixelDifference: number;
    colorDifference: number;
    layoutShift: number;
  };
  warnings: string[];
  errors: string[];
}

/**
 * Snapshot storage entry
 */
export interface SnapshotStorageEntry {
  metadata: SnapshotMetadata;
  data: string; // base64 encoded image data
  createdAt: number;
  accessedAt: number;
}

/**
 * Snapshot Capture System
 */
export class SnapshotCaptureSystem {
  private options: RenderingOptions;
  private config: SnapshotConfig;
  private htmlRenderer: HTMLRenderer;
  private cssEngine: CSSLayoutEngine;
  private previewWindow: VisualPreviewWindow | null = null;
  
  private snapshots: Map<string, SnapshotStorageEntry> = new Map();
  private warnings: string[] = [];
  private errors: string[] = [];
  private isCapturing: boolean = false;

  constructor(
    options: RenderingOptions,
    config: Partial<SnapshotConfig> = {}
  ) {
    this.options = options;
    this.config = { ...DEFAULT_SNAPSHOT_CONFIG, ...config };
    this.htmlRenderer = new HTMLRenderer(options);
    this.cssEngine = new CSSLayoutEngine(options);
  }

  /**
   * Reset warning and error messages
   */
  private resetMessages(): void {
    this.warnings = [];
    this.errors = [];
  }

  /**
   * Wait for rendering to complete
   */
  private async waitForRender(element: HTMLElement): Promise<void> {
    return new Promise(resolve => {
      // Check if element is visible and has dimensions
      const checkRender = () => {
        const rect = element.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          resolve();
        } else {
          setTimeout(checkRender, 50);
        }
      };
      
      // Start checking
      setTimeout(checkRender, 100);
    });
  }

  /**
   * Render page content to HTML
   */
  private renderPageToHTML(pageContent: PageContent): string {
    // Simple page rendering - in a real implementation, this would use the HTMLRenderer
    const elements = pageContent.content.map((element: ContentElement) => {
      switch (element.type) {
        case 'heading':
          const heading = element as any;
          return `<h${heading.level || 1}>${heading.content}</h${heading.level || 1}>`;
        case 'paragraph':
          const para = element as any;
          return `<p>${para.content}</p>`;
        case 'list':
          const list = element as any;
          const listType = list.ordered ? 'ol' : 'ul';
          const items = list.content.map((item: any) => `<li>${item.content}</li>`).join('');
          return `<${listType}>${items}</${listType}>`;
        case 'table':
          const table = element as any;
          const rows = table.content.map((row: any) => 
            `<tr>${row.content.map((cell: any) => `<td>${cell.content}</td>`).join('')}</tr>`
          ).join('');
          return `<table>${rows}</table>`;
        case 'image':
          const img = element as any;
          return `<img src="${img.content?.url || ''}" alt="${img.content?.alt || ''}" />`;
        default:
          return `<div>${JSON.stringify(element)}</div>`;
      }
    }).join('');
    
    return `<div class="page">${elements}</div>`;
  }

  /**
   * Load html2canvas library dynamically
   */
  private async loadHtml2Canvas(): Promise<any> {
    try {
      // Try to load html2canvas if available
      if (typeof window !== 'undefined' && (window as any).html2canvas) {
        return (window as any).html2canvas;
      }
      
      // Try to import dynamically
      const html2canvas = await import('html2canvas');
      return html2canvas.default || html2canvas;
    } catch (error) {
      this.warnings.push('html2canvas not available, using fallback methods');
      return null;
    }
  }

  /**
   * Create SVG from HTML element (fallback method)
   */
  private createSVGFromElement(element: HTMLElement, width: number, height: number): string {
    // Create SVG with foreignObject containing the HTML element
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            ${element.outerHTML}
          </div>
        </foreignObject>
      </svg>
    `;
    
    return svg;
  }

  /**
   * Generate unique snapshot ID
   */
  private generateSnapshotId(): string {
    return `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate size of base64 string
   */
  private getBase64Size(base64: string): number {
    // Remove data URL prefix if present
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    
    // Calculate size in bytes
    const padding = (base64Data.endsWith('==') ? 2 : (base64Data.endsWith('=') ? 1 : 0));
    return (base64Data.length * 3) / 4 - padding;
  }

  /**
   * Generate checksum for image data
   */
  private generateChecksum(data: string): string {
    // Simple checksum - in production, use a proper hash function
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Store snapshot in memory
   */
  private storeSnapshot(metadata: SnapshotMetadata, data: string): void {
    const entry: SnapshotStorageEntry = {
      metadata,
      data,
      createdAt: Date.now(),
      accessedAt: Date.now()
    };
    
    // Store in memory
    this.snapshots.set(metadata.id, entry);
    
    // Enforce max snapshots limit
    if (this.snapshots.size > this.config.maxSnapshots) {
      // Remove oldest snapshot
      const oldest = Array.from(this.snapshots.entries())
        .reduce((oldest, current) => 
          current[1].createdAt < oldest[1].createdAt ? current : oldest
        );
      this.snapshots.delete(oldest[0]);
    }
  }

  /**
   * Load image from base64 data
   */
  private loadImage(data: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = data;
    });
  }

  /**
   * Convert hex color to RGB
   */
  private hexToRgb(hex: string): [number, number, number] {
    // Remove # if present
    const hexColor = hex.startsWith('#') ? hex.slice(1) : hex;
    
    // Parse hex values
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    
    return [r, g, b];
  }

  /**
   * Create temporary container for rendering
   */
  private createTemporaryContainer(): HTMLElement {
    const container = document.createElement('div');
    const padding = this.options.layout.margins?.top || '20mm';
    
    container.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      width: ${this.options.layout.size === 'A4' ? '210mm' : '297mm'};
      height: ${this.options.layout.size === 'A4' ? '297mm' : '210mm'};
      background-color: ${this.options.colors.background};
      padding: ${padding};
      box-sizing: border-box;
      overflow: hidden;
    `;
    
    return container;
  }

  /**
   * Get global document object
   */
  private getGlobalDocument(): Document | null {
    if (typeof window !== 'undefined' && window.document) {
      return window.document;
    }
    return null;
  }

  /**
   * Create style element
   */
  private createStyleElement(): HTMLStyleElement {
    const globalDoc = this.getGlobalDocument();
    if (globalDoc) {
      return globalDoc.createElement('style');
    }
    // Fallback: create element using document.createElement (should work in browser)
    return document.createElement('style');
  }

  /**
   * Capture snapshot of a document
   */
  public async captureDocumentSnapshot(
    document: DocumentContent,
    tags: string[] = []
  ): Promise<SnapshotMetadata[]> {
    this.resetMessages();
    
    if (!this.config.enabled) {
      this.warnings.push('Snapshot capture is disabled');
      return [];
    }
    
    try {
      const snapshots: SnapshotMetadata[] = [];
      
      // Render document to HTML
      const renderResult = this.htmlRenderer.renderDocument(document);
      
      if (renderResult.errors.length > 0) {
        this.errors.push(...renderResult.errors);
        return [];
      }
      
      // Create temporary container for rendering
      const container = this.createTemporaryContainer();
      
      // Use global document if available
      const globalDoc = this.getGlobalDocument();
      if (globalDoc) {
        globalDoc.body.appendChild(container);
      }
      
      // Render HTML to container
      container.innerHTML = renderResult.html;
      
      // Add CSS styles
      const style = this.createStyleElement();
      style.textContent = renderResult.css;
      container.appendChild(style);
      
      // Wait for rendering to complete
      await this.waitForRender(container);
      
      // Capture snapshot of entire document
      const fullSnapshot = await this.captureElementSnapshot(container, {
        documentId: document.title,
        pageNumber: 0,
        totalPages: 1,
        tags: [...tags, 'full-document']
      });
      
      if (fullSnapshot) {
        snapshots.push(fullSnapshot);
      }
      
      // Clean up
      container.remove();
      
      return snapshots;
      
    } catch (error) {
      this.errors.push(`Failed to capture document snapshot: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  /**
   * Capture snapshot of a specific page
   */
  public async capturePageSnapshot(
    pageContent: PageContent,
    documentId: string,
    tags: string[] = []
  ): Promise<SnapshotMetadata | null> {
    this.resetMessages();
    
    if (!this.config.enabled) {
      this.warnings.push('Snapshot capture is disabled');
      return null;
    }
    
    try {
      // Create temporary container for the page
      const container = this.createTemporaryContainer();
      
      // Use global document if available
      const globalDoc = this.getGlobalDocument();
      if (globalDoc) {
        globalDoc.body.appendChild(container);
      }
      
      // Render page to HTML
      const pageHTML = this.renderPageToHTML(pageContent);
      container.innerHTML = pageHTML;
      
      // Add CSS styles
      const style = this.createStyleElement();
      style.textContent = this.cssEngine.generateCSS();
      container.appendChild(style);
      
      // Wait for rendering to complete
      await this.waitForRender(container);
      
      // Capture snapshot
      const snapshot = await this.captureElementSnapshot(container, {
        documentId,
        pageNumber: pageContent.pageNumber,
        totalPages: pageContent.totalPages,
        tags: [...tags, `page-${pageContent.pageNumber}`]
      });
      
      // Clean up
      container.remove();
      
      return snapshot;
      
    } catch (error) {
      this.errors.push(`Failed to capture page snapshot: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  /**
   * Capture snapshot of an HTML element
   */
  private async captureElementSnapshot(
    element: HTMLElement,
    metadata: Partial<SnapshotMetadata>
  ): Promise<SnapshotMetadata | null> {
    if (this.isCapturing) {
      this.warnings.push('Already capturing a snapshot');
      return null;
    }
    
    this.isCapturing = true;
    
    try {
      // Wait for capture delay
      if (this.config.captureDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, this.config.captureDelay));
      }
      
      // Get element dimensions
      const rect = element.getBoundingClientRect();
      const width = Math.ceil(rect.width * this.config.scale);
      const height = Math.ceil(rect.height * this.config.scale);
      
      if (width === 0 || height === 0) {
        this.warnings.push('Element has zero dimensions, skipping snapshot');
        this.isCapturing = false;
        return null;
      }
      
      // Create canvas for capturing
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        this.errors.push('Failed to get canvas context');
        this.isCapturing = false;
        return null;
      }
      
      // Set background if needed
      if (this.config.includeBackground) {
        ctx.fillStyle = this.options.colors.background;
        ctx.fillRect(0, 0, width, height);
      }
      
      // Scale context
      ctx.scale(this.config.scale, this.config.scale);
      
      // Draw element to canvas
      const html2canvas = await this.loadHtml2Canvas();
      if (html2canvas) {
        // Use html2canvas for better rendering
        const elementCanvas = await html2canvas(element, {
          scale: this.config.scale,
          backgroundColor: this.config.includeBackground ? this.options.colors.background : null,
          useCORS: true,
          allowTaint: true
        });
        
        ctx.drawImage(elementCanvas, 0, 0);
      } else {
        // Fallback: try to draw using foreignObject (limited browser support)
        try {
          const svg = this.createSVGFromElement(element, width, height);
          const img = new Image();
          img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
          
          await new Promise((resolve, reject) => {
            img.onload = () => resolve(img);
            img.onerror = reject;
            setTimeout(() => reject(new Error('Image load timeout')), 5000);
          });
          
          ctx.drawImage(img, 0, 0);
        } catch (svgError) {
          this.errors.push(`Failed to capture using SVG fallback: ${svgError}`);
          // Last resort: fill with color
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(0, 0, width, height);
          ctx.fillStyle = '#000000';
          ctx.font = '16px Arial';
          ctx.fillText('Snapshot failed', 10, 30);
        }
      }
      
      // Convert canvas to image data
      const imageData = canvas.toDataURL(`image/${this.config.format}`, this.config.quality / 100);
      
      // Generate metadata
      const snapshotId = this.generateSnapshotId();
      const snapshotMetadata: SnapshotMetadata = {
        id: snapshotId,
        timestamp: Date.now(),
        documentId: metadata.documentId || 'unknown',
        pageNumber: metadata.pageNumber || 0,
        totalPages: metadata.totalPages || 1,
        format: this.config.format,
        size: this.getBase64Size(imageData),
        dimensions: { width, height },
        checksum: this.generateChecksum(imageData),
        tags: metadata.tags || [],
        annotations: metadata.annotations || {}
      };
      
      // Store snapshot
      this.storeSnapshot(snapshotMetadata, imageData);
      
      this.isCapturing = false;
      return snapshotMetadata;
      
    } catch (error) {
      this.errors.push(`Failed to capture element snapshot: ${error instanceof Error ? error.message : String(error)}`);
      this.isCapturing = false;
      return null;
    }
  }

  /**
   * Compare two snapshots
   */
  public async compareSnapshots(
    snapshotId1: string,
    snapshotId2: string
  ): Promise<SnapshotComparison> {
    const result: SnapshotComparison = {
      identical: false,
      similarity: 0,
      differences: 0,
      metrics: {
        structuralSimilarity: 0,
        pixelDifference: 0,
        colorDifference: 0,
        layoutShift: 0
      },
      warnings: [],
      errors: []
    };
    
    try {
      // Get snapshots from storage
      const snapshot1 = this.snapshots.get(snapshotId1);
      const snapshot2 = this.snapshots.get(snapshotId2);
      
      if (!snapshot1 || !snapshot2) {
        result.errors.push(`One or both snapshots not found: ${snapshotId1}, ${snapshotId2}`);
        return result;
      }
      
      // Check if dimensions match
      const dim1 = snapshot1.metadata.dimensions;
      const dim2 = snapshot2.metadata.dimensions;
      
      if (dim1.width !== dim2.width || dim1.height !== dim2.height) {
        result.warnings.push(`Snapshot dimensions differ: ${dim1.width}x${dim1.height} vs ${dim2.width}x${dim2.height}`);
        result.metrics.layoutShift = 1.0;
      }
      
      // Load images for comparison
      const img1 = await this.loadImage(snapshot1.data);
      const img2 = await this.loadImage(snapshot2.data);
      
      // Create canvases for comparison
      const canvas1 = document.createElement('canvas');
      const canvas2 = document.createElement('canvas');
      const diffCanvas = document.createElement('canvas');
      
      const maxWidth = Math.max(dim1.width, dim2.width);
      const maxHeight = Math.max(dim1.height, dim2.height);
      
      canvas1.width = canvas2.width = diffCanvas.width = maxWidth;
      canvas1.height = canvas2.height = diffCanvas.height = maxHeight;
      
      const ctx1 = canvas1.getContext('2d')!;
      const ctx2 = canvas2.getContext('2d')!;
      const diffCtx = diffCanvas.getContext('2d')!;
      
      // Draw images to canvases
      ctx1.drawImage(img1, 0, 0);
      ctx2.drawImage(img2, 0, 0);
      
      // Get image data for comparison
      const imageData1 = ctx1.getImageData(0, 0, maxWidth, maxHeight);
      const imageData2 = ctx2.getImageData(0, 0, maxWidth, maxHeight);
      const diffImageData = diffCtx.createImageData(maxWidth, maxHeight);
      
      let identicalPixels = 0;
      let totalPixels = maxWidth * maxHeight;
      let colorDifferenceSum = 0;
      
      // Compare pixel by pixel
      for (let i = 0; i < imageData1.data.length; i += 4) {
        const r1 = imageData1.data[i];
        const g1 = imageData1.data[i + 1];
        const b1 = imageData1.data[i + 2];
        const a1 = imageData1.data[i + 3];
        
        const r2 = imageData2.data[i];
        const g2 = imageData2.data[i + 1];
        const b2 = imageData2.data[i + 2];
        const a2 = imageData2.data[i + 3];
        
        // Check if pixels are identical
        if (r1 === r2 && g1 === g2 && b1 === b2 && a1 === a2) {
          identicalPixels++;
          // Set diff pixel to transparent
          diffImageData.data[i] = 0;
          diffImageData.data[i + 1] = 0;
          diffImageData.data[i + 2] = 0;
          diffImageData.data[i + 3] = 0;
        } else {
          // Calculate color difference
          const colorDiff = Math.sqrt(
            Math.pow(r1 - r2, 2) +
            Math.pow(g1 - g2, 2) +
            Math.pow(b1 - b2, 2) +
            Math.pow(a1 - a2, 2)
          ) / Math.sqrt(255 * 255 * 4);
          
          colorDifferenceSum += colorDiff;
          
          // Set diff pixel to highlight color
          const [hr, hg, hb] = this.hexToRgb(this.config.diffHighlightColor);
          diffImageData.data[i] = hr;
          diffImageData.data[i + 1] = hg;
          diffImageData.data[i + 2] = hb;
          diffImageData.data[i + 3] = 255;
        }
      }
      
      // Calculate metrics
      result.similarity = identicalPixels / totalPixels;
      result.identical = result.similarity >= this.config.compareThreshold;
      result.differences = totalPixels - identicalPixels;
      result.metrics.pixelDifference = result.differences;
      result.metrics.colorDifference = colorDifferenceSum / totalPixels;
      result.metrics.structuralSimilarity = 1 - (result.differences / totalPixels);
      
      // Generate diff image if requested
      if (this.config.generateDiff && result.differences > 0) {
        diffCtx.putImageData(diffImageData, 0, 0);
        result.diffImage = diffCanvas.toDataURL(`image/${this.config.format}`, this.config.quality / 100);
      }
      
      return result;
      
    } catch (error) {
      result.errors.push(`Failed to compare snapshots: ${error instanceof Error ? error.message : String(error)}`);
      return result;
    }
  }

  /**
   * Get snapshot by ID
   */
  public getSnapshot(id: string): SnapshotStorageEntry | null {
    return this.snapshots.get(id) || null;
  }

  /**
   * Get all snapshots
   */
  public getAllSnapshots(): SnapshotStorageEntry[] {
    return Array.from(this.snapshots.values());
  }

  /**
   * Delete snapshot
   */
  public deleteSnapshot(id: string): boolean {
    return this.snapshots.delete(id);
  }

  /**
   * Clear all snapshots
   */
  public clearSnapshots(): void {
    this.snapshots.clear();
  }

  /**
   * Get snapshot statistics
   */
  public getStatistics(): {
    totalSnapshots: number;
    totalSize: number;
    averageSize: number;
    warnings: string[];
    errors: string[];
  } {
    let totalSize = 0;
    
    for (const snapshot of this.snapshots.values()) {
      totalSize += snapshot.metadata.size;
    }
    
    const averageSize = this.snapshots.size > 0 ? totalSize / this.snapshots.size : 0;
    
    return {
      totalSnapshots: this.snapshots.size,
      totalSize,
      averageSize,
      warnings: [...this.warnings],
      errors: [...this.errors]
    };
  }

  /**
   * Export all snapshots as JSON
   */
  public exportSnapshots(): string {
    const exportData = {
      snapshots: Array.from(this.snapshots.values()),
      metadata: {
        exportedAt: Date.now(),
        totalSnapshots: this.snapshots.size,
        config: this.config
      }
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import snapshots from JSON
   */
  public importSnapshots(json: string): { imported: number; errors: string[] } {
    const errors: string[] = [];
    let imported = 0;
    
    try {
      const data = JSON.parse(json);
      
      if (!data.snapshots || !Array.isArray(data.snapshots)) {
        errors.push('Invalid snapshot data format');
        return { imported: 0, errors };
      }
      
      for (const entry of data.snapshots) {
        try {
          // Validate entry structure
          if (!entry.metadata || !entry.data || !entry.createdAt) {
            errors.push(`Invalid snapshot entry: missing required fields`);
            continue;
          }
          
          // Store snapshot
          this.snapshots.set(entry.metadata.id, entry);
          imported++;
          
        } catch (entryError) {
          errors.push(`Failed to import snapshot: ${entryError instanceof Error ? entryError.message : String(entryError)}`);
        }
      }
      
      return { imported, errors };
      
    } catch (error) {
      errors.push(`Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`);
      return { imported: 0, errors };
    }
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
   * Clear all messages
   */
  public clearMessages(): void {
    this.warnings = [];
    this.errors = [];
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<SnapshotConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  public getConfig(): SnapshotConfig {
    return { ...this.config };
  }

  /**
   * Set preview window
   */
  public setPreviewWindow(previewWindow: VisualPreviewWindow): void {
    this.previewWindow = previewWindow;
  }

  /**
   * Get preview window
   */
  public getPreviewWindow(): VisualPreviewWindow | null {
    return this.previewWindow;
  }