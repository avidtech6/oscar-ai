/**
 * Phase 15: HTML Rendering & Visual Reproduction Engine
 * Core Type Definitions - RenderingOptions
 */

/**
 * Page size options for rendering
 */
export type PageSize = 'A4' | 'A3' | 'Letter' | 'Legal' | 'Custom';

/**
 * Page orientation
 */
export type PageOrientation = 'portrait' | 'landscape';

/**
 * Page margins in millimeters
 */
export interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Page layout configuration
 */
export interface PageLayout {
  size: PageSize;
  orientation: PageOrientation;
  margins: PageMargins;
  customWidth?: number; // in millimeters
  customHeight?: number; // in millimeters
}

/**
 * Typography configuration
 */
export interface TypographyOptions {
  fontFamily: string;
  fontSize: number; // in points
  lineHeight: number; // multiplier
  fontWeight: 'normal' | 'bold' | 'light';
  fontColor: string; // CSS color
  headingFontFamily?: string;
  headingFontSizeMultiplier: number;
}

/**
 * Spacing configuration
 */
export interface SpacingOptions {
  paragraphSpacing: number; // in points
  sectionSpacing: number; // in points
  indentSize: number; // in points
  listItemSpacing: number; // in points
}

/**
 * Color scheme configuration
 */
export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  headings: string;
  borders: string;
}

/**
 * Header configuration
 */
export interface HeaderOptions {
  enabled: boolean;
  content?: string; // HTML or template string
  height: number; // in millimeters
  showOnFirstPage: boolean;
  showPageNumbers: boolean;
  templateId?: string;
}

/**
 * Footer configuration
 */
export interface FooterOptions {
  enabled: boolean;
  content?: string; // HTML or template string
  height: number; // in millimeters
  showOnFirstPage: boolean;
  showPageNumbers: boolean;
  templateId?: string;
}

/**
 * Cover page configuration
 */
export interface CoverPageOptions {
  enabled: boolean;
  templateId?: string;
  includeLogo: boolean;
  includeTitle: boolean;
  includeSubtitle: boolean;
  includeMetadata: boolean;
  includeDate: boolean;
  backgroundColor?: string;
  backgroundImage?: string;
}

/**
 * Image embedding options
 */
export interface ImageEmbeddingOptions {
  maxWidth: number; // in pixels or percentage
  maxHeight: number; // in pixels or percentage
  quality: number; // 0-100
  format: 'original' | 'webp' | 'jpeg' | 'png';
  embedMethod: 'base64' | 'url' | 'file';
  lazyLoading: boolean;
}

/**
 * Page break options
 */
export interface PageBreakOptions {
  automatic: boolean;
  avoidWidowOrphan: boolean;
  minLinesBeforeBreak: number;
  minLinesAfterBreak: number;
  breakBeforeSections: string[]; // section IDs or types
  breakAfterSections: string[];
}

/**
 * PDF export options
 */
export interface PDFExportOptions {
  quality: 'standard' | 'high' | 'print';
  includeHyperlinks: boolean;
  includeBookmarks: boolean;
  compress: boolean;
  passwordProtect?: string;
  permissions?: {
    print: boolean;
    modify: boolean;
    copy: boolean;
    annotate: boolean;
  };
}

/**
 * Visual preview options
 */
export interface PreviewOptions {
  interactive: boolean;
  zoomLevel: number; // 0.5 to 3.0
  showRulers: boolean;
  showGrid: boolean;
  showMargins: boolean;
  autoRefresh: boolean;
}

/**
 * Snapshot capture options
 */
export interface SnapshotOptions {
  format: 'png' | 'jpeg' | 'webp';
  quality: number; // 0-100
  scale: number; // device pixel ratio
  includeBackground: boolean;
  captureDelay: number; // milliseconds
}

/**
 * Main rendering options
 */
export interface RenderingOptions {
  // Layout and styling
  layout: PageLayout;
  typography: TypographyOptions;
  spacing: SpacingOptions;
  colors: ColorScheme;
  
  // Document structure
  header: HeaderOptions;
  footer: FooterOptions;
  coverPage: CoverPageOptions;
  
  // Content handling
  images: ImageEmbeddingOptions;
  pageBreaks: PageBreakOptions;
  
  // Output options
  pdf: PDFExportOptions;
  preview: PreviewOptions;
  snapshot: SnapshotOptions;
  
  // Advanced options
  responsive: boolean;
  accessibility: boolean;
  watermark?: string;
  language: string;
  timezone: string;
  
  // Metadata
  title: string;
  author: string;
  subject?: string;
  keywords?: string[];
  creator: string;
  creationDate: Date;
  modificationDate?: Date;
}

/**
 * Default rendering options
 */
export const DEFAULT_RENDERING_OPTIONS: RenderingOptions = {
  layout: {
    size: 'A4',
    orientation: 'portrait',
    margins: { top: 25, right: 20, bottom: 25, left: 20 }
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 11,
    lineHeight: 1.5,
    fontWeight: 'normal',
    fontColor: '#000000',
    headingFontFamily: 'Arial, sans-serif',
    headingFontSizeMultiplier: 1.2
  },
  spacing: {
    paragraphSpacing: 12,
    sectionSpacing: 24,
    indentSize: 36,
    listItemSpacing: 6
  },
  colors: {
    primary: '#2f5233',
    secondary: '#6b7280',
    accent: '#059669',
    background: '#ffffff',
    text: '#000000',
    headings: '#2f5233',
    borders: '#e5e7eb'
  },
  header: {
    enabled: true,
    height: 15,
    showOnFirstPage: true,
    showPageNumbers: true
  },
  footer: {
    enabled: true,
    height: 15,
    showOnFirstPage: true,
    showPageNumbers: true
  },
  coverPage: {
    enabled: true,
    includeLogo: true,
    includeTitle: true,
    includeSubtitle: true,
    includeMetadata: true,
    includeDate: true
  },
  images: {
    maxWidth: 800,
    maxHeight: 600,
    quality: 85,
    format: 'original',
    embedMethod: 'base64',
    lazyLoading: true
  },
  pageBreaks: {
    automatic: true,
    avoidWidowOrphan: true,
    minLinesBeforeBreak: 3,
    minLinesAfterBreak: 3,
    breakBeforeSections: [],
    breakAfterSections: []
  },
  pdf: {
    quality: 'standard',
    includeHyperlinks: true,
    includeBookmarks: true,
    compress: true
  },
  preview: {
    interactive: true,
    zoomLevel: 1.0,
    showRulers: false,
    showGrid: false,
    showMargins: true,
    autoRefresh: true
  },
  snapshot: {
    format: 'png',
    quality: 90,
    scale: 1,
    includeBackground: true,
    captureDelay: 100
  },
  responsive: true,
  accessibility: true,
  language: 'en',
  timezone: 'UTC',
  title: 'Untitled Document',
  author: 'Oscar AI',
  creator: 'Oscar AI Visual Rendering Engine',
  creationDate: new Date()
};

/**
 * Partial rendering options for updates
 */
export type PartialRenderingOptions = Partial<RenderingOptions>;

/**
 * Validate rendering options
 */
export function validateRenderingOptions(options: PartialRenderingOptions): string[] {
  const errors: string[] = [];
  
  // Validate layout
  if (options.layout?.margins) {
    const margins = options.layout.margins;
    if (margins.top < 0 || margins.right < 0 || margins.bottom < 0 || margins.left < 0) {
      errors.push('Page margins must be non-negative');
    }
  }
  
  // Validate typography
  if (options.typography?.fontSize && (options.typography.fontSize < 6 || options.typography.fontSize > 72)) {
    errors.push('Font size must be between 6 and 72 points');
  }
  
  if (options.typography?.lineHeight && (options.typography.lineHeight < 1 || options.typography.lineHeight > 3)) {
    errors.push('Line height must be between 1 and 3');
  }
  
  // Validate image quality
  if (options.images?.quality && (options.images.quality < 1 || options.images.quality > 100)) {
    errors.push('Image quality must be between 1 and 100');
  }
  
  // Validate snapshot quality
  if (options.snapshot?.quality && (options.snapshot.quality < 1 || options.snapshot.quality > 100)) {
    errors.push('Snapshot quality must be between 1 and 100');
  }
  
  // Validate preview zoom
  if (options.preview?.zoomLevel && (options.preview.zoomLevel < 0.1 || options.preview.zoomLevel > 5)) {
    errors.push('Preview zoom level must be between 0.1 and 5');
  }
  
  return errors;
}

/**
 * Merge partial options with defaults
 */
export function mergeRenderingOptions(
  defaults: RenderingOptions,
  overrides: PartialRenderingOptions
): RenderingOptions {
  // Deep merge function
  const deepMerge = (target: any, source: any): any => {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  };
  
  return deepMerge(defaults, overrides);
}