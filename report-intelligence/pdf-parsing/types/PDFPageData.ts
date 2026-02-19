/**
 * PDF Page Data Types
 * 
 * Core type definitions for PDF parsing and extraction results.
 */

export interface PDFPageData {
  /** Page number (1-indexed) */
  pageNumber: number;
  
  /** Page dimensions in points (1/72 inch) */
  width: number;
  height: number;
  
  /** Extracted text content */
  text: PDFExtractedText[];
  
  /** Extracted images */
  images: PDFExtractedImage[];
  
  /** Layout information */
  layout: PDFLayoutInfo;
  
  /** Font and style information */
  styles: PDFStyleInfo[];
  
  /** Metadata */
  metadata: {
    rotation?: number;
    hasTransparency?: boolean;
    isEncrypted?: boolean;
    compression?: string;
  };
}

export interface PDFExtractedText {
  /** Text content */
  content: string;
  
  /** Bounding box [x1, y1, x2, y2] in points */
  bbox: [number, number, number, number];
  
  /** Font information */
  font: {
    family: string;
    size: number;
    weight: 'normal' | 'bold' | 'light';
    style: 'normal' | 'italic';
    color?: string;
  };
  
  /** Text properties */
  properties: {
    isHeading?: boolean;
    isParagraph?: boolean;
    isListItem?: boolean;
    isTableContent?: boolean;
    isHeader?: boolean;
    isFooter?: boolean;
    readingOrder: number;
    confidence: number; // 0-1
  };
}

export interface PDFExtractedImage {
  /** Unique identifier */
  id: string;
  
  /** Image data as base64 string */
  data: string;
  
  /** Image format */
  format: 'png' | 'jpeg' | 'gif' | 'bmp' | 'tiff' | 'svg';
  
  /** Bounding box [x1, y1, x2, y2] in points */
  bbox: [number, number, number, number];
  
  /** Image properties */
  properties: {
    width: number;
    height: number;
    dpi: number;
    isLogo?: boolean;
    isDiagram?: boolean;
    isPhoto?: boolean;
    isBackground?: boolean;
    compression?: string;
    colorSpace?: string;
  };
  
  /** Alternative text (if available) */
  altText?: string;
}

export interface PDFLayoutInfo {
  /** Page margins in points */
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  
  /** Detected columns */
  columns: PDFColumn[];
  
  /** Header region (if detected) */
  header?: PDFRegion;
  
  /** Footer region (if detected) */
  footer?: PDFRegion;
  
  /** Content regions */
  contentRegions: PDFRegion[];
  
  /** Detected tables */
  tables: PDFTable[];
  
  /** Page break information */
  pageBreak: {
    type: 'auto' | 'manual' | 'none';
    position?: number; // y-coordinate of break
  };
}

export interface PDFColumn {
  /** Column index */
  index: number;
  
  /** Column bounding box */
  bbox: [number, number, number, number];
  
  /** Column width */
  width: number;
  
  /** Text alignment within column */
  alignment: 'left' | 'center' | 'right' | 'justify';
}

export interface PDFRegion {
  /** Region type */
  type: 'header' | 'footer' | 'content' | 'sidebar' | 'caption' | 'figure';
  
  /** Bounding box */
  bbox: [number, number, number, number];
  
  /** Content type */
  contentType: 'text' | 'image' | 'mixed' | 'table';
  
  /** Associated elements */
  elementIds: string[];
}

export interface PDFTable {
  /** Table identifier */
  id: string;
  
  /** Bounding box */
  bbox: [number, number, number, number];
  
  /** Table structure */
  structure: {
    rows: number;
    columns: number;
    cells: PDFTableCell[];
  };
  
  /** Table properties */
  properties: {
    hasHeaderRow: boolean;
    hasBorders: boolean;
    isNested: boolean;
    alignment: 'left' | 'center' | 'right';
  };
}

export interface PDFTableCell {
  /** Cell position */
  row: number;
  column: number;
  
  /** Cell span */
  rowSpan?: number;
  colSpan?: number;
  
  /** Cell content */
  content: string;
  
  /** Cell bounding box */
  bbox: [number, number, number, number];
  
  /** Cell style */
  style: {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    fontWeight?: 'normal' | 'bold';
  };
}

export interface PDFStyleInfo {
  /** Font family */
  fontFamily: string;
  
  /** Font size in points */
  fontSize: number;
  
  /** Font weight */
  fontWeight: 'normal' | 'bold' | 'light' | 'medium' | 'semibold';
  
  /** Font style */
  fontStyle: 'normal' | 'italic' | 'oblique';
  
  /** Text color */
  color: string;
  
  /** Line height */
  lineHeight: number;
  
  /** Letter spacing */
  letterSpacing: number;
  
  /** Text alignment */
  textAlign: 'left' | 'center' | 'right' | 'justify';
  
  /** Usage statistics */
  usage: {
    count: number;
    percentage: number;
    elements: string[];
  };
}

export interface PDFParsingOptions {
  /** Extract text */
  extractText: boolean;
  
  /** Extract images */
  extractImages: boolean;
  
  /** Extract layout */
  extractLayout: boolean;
  
  /** Extract fonts and styles */
  extractStyles: boolean;
  
  /** Detect tables */
  detectTables: boolean;
  
  /** Detect headers/footers */
  detectHeadersFooters: boolean;
  
  /** Image extraction quality (0-100) */
  imageQuality: number;
  
  /** Image format for extraction */
  imageFormat: 'png' | 'jpeg' | 'webp';
  
  /** Text extraction confidence threshold (0-1) */
  confidenceThreshold: number;
  
  /** Maximum number of pages to process (0 for all) */
  maxPages: number;
  
  /** Password for encrypted PDFs */
  password?: string;
}

export interface PDFParsingResult {
  /** Success flag */
  success: boolean;
  
  /** Error message (if any) */
  error?: string;
  
  /** Extracted pages */
  pages: PDFPageData[];
  
  /** Document metadata */
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
    pageCount: number;
    isEncrypted: boolean;
    hasForms: boolean;
    hasAnnotations: boolean;
  };
  
  /** Statistics */
  statistics: {
    totalPages: number;
    totalTextElements: number;
    totalImages: number;
    totalTables: number;
    processingTime: number; // milliseconds
    fileSize: number; // bytes
  };
  
  /** Raw extraction data */
  raw?: {
    text?: string;
    images?: Array<{id: string, data: string}>;
    fonts?: Array<{name: string, type: string}>;
  };
}