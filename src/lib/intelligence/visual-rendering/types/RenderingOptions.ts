/**
 * Rendering options for the visual rendering engine.
 */
export interface RenderingOptions {
  /** Whether to include a cover page */
  includeCoverPage: boolean;
  /** Whether to include headers and footers */
  includeHeaderFooter: boolean;
  /** Whether to embed images as base64 */
  embedImages: boolean;
  /** Whether to apply page breaks */
  applyPageBreaks: boolean;
  /** Whether to generate a PDF */
  generatePDF: boolean;
  /** Whether to capture a visual snapshot */
  captureSnapshot: boolean;
  /** CSS theme to apply */
  cssTheme: 'default' | 'professional' | 'minimal' | 'custom';
  /** Page size for PDF export */
  pageSize: 'A4' | 'Letter' | 'Legal';
  /** Page orientation */
  orientation: 'portrait' | 'landscape';
  /** Margins in CSS units (e.g., '1in', '2cm') */
  margins: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  /** Header template ID */
  headerTemplateId?: string;
  /** Footer template ID */
  footerTemplateId?: string;
  /** Cover page template ID */
  coverPageTemplateId?: string;
  /** Custom CSS string */
  customCSS?: string;
}

/**
 * Default rendering options.
 */
export const defaultRenderingOptions: RenderingOptions = {
  includeCoverPage: true,
  includeHeaderFooter: true,
  embedImages: true,
  applyPageBreaks: true,
  generatePDF: false,
  captureSnapshot: true,
  cssTheme: 'professional',
  pageSize: 'A4',
  orientation: 'portrait',
  margins: {
    top: '1in',
    right: '1in',
    bottom: '1in',
    left: '1in'
  }
};