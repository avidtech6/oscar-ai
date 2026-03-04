/**
 * Preview window options.
 */
export interface PreviewWindowOptions {
  /** Width of the preview iframe */
  width: string;
  /** Height of the preview iframe */
  height: string;
  /** Whether to enable zoom */
  zoomEnabled: boolean;
  /** Initial zoom level (0.5 = 50%, 1 = 100%, 2 = 200%) */
  initialZoom: number;
  /** Whether to enable panning */
  panEnabled: boolean;
  /** Whether to show page boundaries */
  showPageBoundaries: boolean;
  /** Whether to show margins */
  showMargins: boolean;
  /** Whether to show a ruler */
  showRuler: boolean;
  /** Whether to auto‑refresh on content change */
  autoRefresh: boolean;
  /** Refresh interval in milliseconds */
  refreshInterval: number;
}

/**
 * Default preview window options.
 */
export const defaultPreviewWindowOptions: PreviewWindowOptions = {
  width: '100%',
  height: '800px',
  zoomEnabled: true,
  initialZoom: 1,
  panEnabled: true,
  showPageBoundaries: true,
  showMargins: false,
  showRuler: false,
  autoRefresh: false,
  refreshInterval: 1000
};

/**
 * Visual preview window that provides a sandboxed iframe with live rendering, zoom/pan, and real‑time updates.
 */
export class VisualPreviewWindow {
  private options: PreviewWindowOptions;
  private iframe: HTMLIFrameElement | null = null;
  private currentHTML: string = '';
  private zoomLevel: number;

  constructor(options: Partial<PreviewWindowOptions> = {}) {
    this.options = { ...defaultPreviewWindowOptions, ...options };
    this.zoomLevel = this.options.initialZoom;
  }

  /**
   * Attaches the preview window to a DOM container.
   * @param containerId ID of the container element
   */
  attach(containerId: string): void {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element #${containerId} not found`);
    }
    this.iframe = document.createElement('iframe');
    this.iframe.id = 'visual-preview-iframe';
    this.iframe.style.width = this.options.width;
    this.iframe.style.height = this.options.height;
    this.iframe.style.border = '1px solid #ccc';
    this.iframe.style.background = '#fff';
    this.iframe.sandbox.add('allow-same-origin'); // needed for same‑origin content
    container.appendChild(this.iframe);
    this.applyZoom();
  }

  /**
   * Updates the HTML content of the preview.
   * @param html HTML string
   */
  updateContent(html: string): void {
    this.currentHTML = html;
    if (!this.iframe) return;
    const doc = this.iframe.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
    this.applyZoom();
  }

  /**
   * Sets the zoom level.
   * @param zoom Zoom factor (0.1‑5)
   */
  setZoom(zoom: number): void {
    if (!this.options.zoomEnabled) return;
    this.zoomLevel = Math.max(0.1, Math.min(5, zoom));
    this.applyZoom();
  }

  /**
   * Resets zoom to initial level.
   */
  resetZoom(): void {
    this.zoomLevel = this.options.initialZoom;
    this.applyZoom();
  }

  /**
   * Enables or disables panning.
   */
  setPanEnabled(enabled: boolean): void {
    this.options.panEnabled = enabled;
    // In a real implementation you would add/remove event listeners for mouse drag.
  }

  /**
   * Shows or hides page boundaries.
   */
  setShowPageBoundaries(show: boolean): void {
    this.options.showPageBoundaries = show;
    this.updateOverlay();
  }

  /**
   * Shows or hides margins.
   */
  setShowMargins(show: boolean): void {
    this.options.showMargins = show;
    this.updateOverlay();
  }

  /**
   * Returns the current HTML content.
   */
  getContent(): string {
    return this.currentHTML;
  }

  /**
   * Returns the iframe element (if attached).
   */
  getIframe(): HTMLIFrameElement | null {
    return this.iframe;
  }

  /**
   * Destroys the preview window and removes the iframe.
   */
  destroy(): void {
    if (this.iframe && this.iframe.parentNode) {
      this.iframe.parentNode.removeChild(this.iframe);
      this.iframe = null;
    }
  }

  // Private methods

  private applyZoom(): void {
    if (!this.iframe || !this.options.zoomEnabled) return;
    const doc = this.iframe.contentDocument;
    if (!doc || !doc.body) return;
    doc.body.style.transform = `scale(${this.zoomLevel})`;
    doc.body.style.transformOrigin = 'top left';
    doc.body.style.width = `${100 / this.zoomLevel}%`;
    doc.body.style.height = `${100 / this.zoomLevel}%`;
  }

  private updateOverlay(): void {
    // In a real implementation you would draw overlay elements (boundaries, margins, ruler) on a canvas.
    // This is a placeholder.
  }

  /**
   * Generates CSS for the preview overlay.
   */
  private generateOverlayCSS(): string {
    let css = '';
    if (this.options.showPageBoundaries) {
      css += `
.preview-page-boundary {
  position: absolute;
  border: 1px dashed rgba(0, 0, 255, 0.3);
  pointer-events: none;
}`;
    }
    if (this.options.showMargins) {
      css += `
.preview-margin {
  position: absolute;
  background: rgba(255, 0, 0, 0.05);
  pointer-events: none;
}`;
    }
    return css;
  }
}