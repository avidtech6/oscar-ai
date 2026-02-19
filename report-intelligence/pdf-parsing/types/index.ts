/**
 * PDF Parsing Type Definitions
 * 
 * Export all type definitions for PDF parsing and extraction.
 */

export * from './PDFPageData';

// Default parsing options
export const DEFAULT_PDF_PARSING_OPTIONS = {
  extractText: true,
  extractImages: true,
  extractLayout: true,
  extractStyles: true,
  detectTables: true,
  detectHeadersFooters: true,
  imageQuality: 85,
  imageFormat: 'png' as const,
  confidenceThreshold: 0.7,
  maxPages: 0, // 0 means all pages
};

// Type aliases for convenience
export type {
  PDFPageData,
  PDFExtractedText,
  PDFExtractedImage,
  PDFLayoutInfo,
  PDFStyleInfo,
  PDFColumn,
  PDFRegion,
  PDFTable,
  PDFTableCell,
  PDFParsingOptions,
  PDFParsingResult,
} from './PDFPageData';