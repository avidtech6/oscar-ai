/**
 * Phase 15: HTML Rendering & Visual Reproduction Engine
 * Type Definitions Index
 */

// Import all type definitions first
import type {
  PageSize,
  PageOrientation,
  PageLayout,
  TypographyOptions,
  SpacingOptions,
  ColorScheme,
  RenderingOptions as RenderingOptionsType,
  PartialRenderingOptions
} from './RenderingOptions';

import type {
  ContentElementType,
  TextAlignment,
  ListStyleType,
  CellAlignment,
  ImageSource,
  ContentElement,
  TextElement,
  HeadingElement,
  ParagraphElement,
  ListElement,
  ListItemElement,
  TableElement,
  TableRowElement,
  TableCellElement,
  ImageElement,
  CodeElement,
  QuoteElement,
  DividerElement,
  PageBreakElement,
  SectionElement,
  CustomElement,
  DocumentContent as DocumentContentType,
  PageContent,
  ContentTransformOptions,
  ContentValidationResult
} from './RenderingContent';

import type {
  RenderingStatus,
  RenderingErrorType,
  RenderingError,
  RenderingMetrics,
  PageRenderingResult,
  SnapshotResult,
  PDFExportResult,
  VisualComparisonResult,
  RenderingResult as RenderingResultType,
  RenderingProgress,
  RenderingJob,
  RenderingCacheEntry
} from './RenderingResult';

// Re-export all type definitions
export * from './RenderingOptions';
export * from './RenderingContent';
export * from './RenderingResult';

// Re-export commonly used types with aliases to avoid conflicts
export type {
  PageSize,
  PageOrientation,
  PageLayout,
  TypographyOptions,
  SpacingOptions,
  ColorScheme,
  RenderingOptionsType as RenderingOptions,
  PartialRenderingOptions
};

export type {
  ContentElementType,
  TextAlignment,
  ListStyleType,
  CellAlignment,
  ImageSource,
  ContentElement,
  TextElement,
  HeadingElement,
  ParagraphElement,
  ListElement,
  ListItemElement,
  TableElement,
  TableRowElement,
  TableCellElement,
  ImageElement,
  CodeElement,
  QuoteElement,
  DividerElement,
  PageBreakElement,
  SectionElement,
  CustomElement,
  DocumentContentType as DocumentContent,
  PageContent,
  ContentTransformOptions,
  ContentValidationResult
};

export type {
  RenderingStatus,
  RenderingErrorType,
  RenderingError,
  RenderingMetrics,
  PageRenderingResult,
  SnapshotResult,
  PDFExportResult,
  VisualComparisonResult,
  RenderingResultType as RenderingResult,
  RenderingProgress,
  RenderingJob,
  RenderingCacheEntry
};

// Import functions
import {
  DEFAULT_RENDERING_OPTIONS,
  validateRenderingOptions,
  mergeRenderingOptions
} from './RenderingOptions';

import {
  isImageElement,
  isTableElement,
  transformContent,
  validateContent
} from './RenderingContent';

import {
  createRenderingResult,
  updateRenderingProgress,
  addRenderingError,
  addRenderingWarning,
  completeRendering,
  addSnapshot,
  addPDFExport,
  validateRenderingResult,
  calculateReproductionScore
} from './RenderingResult';

// Re-export functions
export {
  DEFAULT_RENDERING_OPTIONS,
  validateRenderingOptions,
  mergeRenderingOptions,
  isImageElement,
  isTableElement,
  transformContent,
  validateContent,
  createRenderingResult,
  updateRenderingProgress,
  addRenderingError,
  addRenderingWarning,
  completeRendering,
  addSnapshot,
  addPDFExport,
  validateRenderingResult,
  calculateReproductionScore
};

/**
 * Type utilities
 */

/**
 * Check if value is a ContentElement
 */
export function isContentElement(value: any): value is ContentElement {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.type === 'string' &&
    'content' in value
  );
}

/**
 * Check if value is a DocumentContent
 */
export function isDocumentContent(value: any): value is DocumentContentType {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.title === 'string' &&
    Array.isArray(value.sections)
  );
}

/**
 * Check if value is a RenderingOptions
 */
export function isRenderingOptions(value: any): value is RenderingOptionsType {
  return (
    value &&
    typeof value === 'object' &&
    value.layout &&
    value.typography &&
    value.spacing &&
    value.colors
  );
}

/**
 * Type predicate for narrowing ContentElement to specific type
 */
export function isElementOfType<T extends ContentElement>(
  element: ContentElement,
  type: ContentElementType
): element is T {
  return element.type === type;
}

/**
 * Create a type-safe content element factory
 */
export function createElement<T extends ContentElementType>(
  type: T,
  content: any,
  options: Partial<ContentElement> = {}
): ContentElement {
  const id = options.id || `elem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    type,
    content,
    ...options
  } as ContentElement;
}

/**
 * Create a text element
 */
export function createTextElement(
  text: string,
  options: Partial<TextElement> = {}
): TextElement {
  return {
    id: options.id || `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'text',
    content: text,
    ...options
  } as TextElement;
}

/**
 * Create a heading element
 */
export function createHeadingElement(
  text: string,
  level: 1 | 2 | 3 | 4 | 5 | 6,
  options: Partial<HeadingElement> = {}
): HeadingElement {
  return {
    id: options.id || `heading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'heading',
    content: text,
    level,
    ...options
  } as HeadingElement;
}

/**
 * Create a paragraph element
 */
export function createParagraphElement(
  content: string | ContentElement[],
  options: Partial<ParagraphElement> = {}
): ParagraphElement {
  return {
    id: options.id || `para_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'paragraph',
    content,
    ...options
  } as ParagraphElement;
}

/**
 * Create an image element
 */
export function createImageElement(
  source: ImageSource,
  options: Partial<ImageElement> = {}
): ImageElement {
  return {
    id: options.id || `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'image',
    content: source,
    ...options
  } as ImageElement;
}

/**
 * Create a section element
 */
export function createSectionElement(
  content: ContentElement[],
  title?: string,
  options: Partial<SectionElement> = {}
): SectionElement {
  return {
    id: options.id || `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'section',
    content,
    title,
    ...options
  } as SectionElement;
}

/**
 * Create document content
 */
export function createDocumentContent(
  title: string,
  sections: SectionElement[],
  options: Partial<DocumentContentType> = {}
): DocumentContentType {
  return {
    title,
    sections,
    ...options
  };
}

/**
 * Merge multiple rendering options
 */
export function mergeOptions(
  ...optionsArray: Partial<RenderingOptionsType>[]
): RenderingOptionsType {
  let result: RenderingOptionsType = DEFAULT_RENDERING_OPTIONS;
  
  for (const options of optionsArray) {
    result = mergeRenderingOptions(result, options);
  }
  
  return result;
}

/**
 * Generate a unique ID for rendering jobs
 */
export function generateRenderingId(prefix: string = 'render'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Calculate page dimensions in pixels
 */
export function calculatePageDimensions(
  layout: PageLayout,
  dpi: number = 96
): { width: number; height: number } {
  // Convert millimeters to inches, then to pixels
  const mmToInches = (mm: number) => mm / 25.4;
  const inchesToPixels = (inches: number) => inches * dpi;
  
  // Standard page sizes in millimeters
  const pageSizes: Record<PageSize, { width: number; height: number }> = {
    A4: { width: 210, height: 297 },
    A3: { width: 297, height: 420 },
    Letter: { width: 215.9, height: 279.4 },
    Legal: { width: 215.9, height: 355.6 },
    Custom: { width: 0, height: 0 }
  };
  
  let width: number, height: number;
  
  if (layout.size === 'Custom' && layout.customWidth && layout.customHeight) {
    width = layout.customWidth;
    height = layout.customHeight;
  } else {
    const size = pageSizes[layout.size];
    width = size.width;
    height = size.height;
  }
  
  // Adjust for orientation
  if (layout.orientation === 'landscape') {
    [width, height] = [height, width];
  }
  
  // Convert to pixels
  const widthPx = Math.round(inchesToPixels(mmToInches(width)));
  const heightPx = Math.round(inchesToPixels(mmToInches(height)));
  
  return { width: widthPx, height: heightPx };
}

/**
 * Calculate content area dimensions (page minus margins)
 */
export function calculateContentArea(
  layout: PageLayout,
  dpi: number = 96
): { width: number; height: number; top: number; left: number } {
  const page = calculatePageDimensions(layout, dpi);
  
  // Convert margins from mm to pixels
  const mmToPixels = (mm: number) => Math.round((mm / 25.4) * dpi);
  
  const top = mmToPixels(layout.margins.top);
  const right = mmToPixels(layout.margins.right);
  const bottom = mmToPixels(layout.margins.bottom);
  const left = mmToPixels(layout.margins.left);
  
  const width = page.width - left - right;
  const height = page.height - top - bottom;
  
  return {
    width: Math.max(0, width),
    height: Math.max(0, height),
    top,
    left
  };
}