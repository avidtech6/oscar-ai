/**
 * OCR Intelligence System Index
 * 
 * PHASE 29.5 — OCR & Table Extraction Layer
 * Required Systems: OCR Intelligence System
 * 
 * This module provides text extraction from images and PDFs,
 * table detection and extraction, and text cleaning capabilities.
 */

export { OCREngine } from './ocr-engine.js';
export { TableExtractor } from './table-extractor.js';
export { TextCleaner } from './text-cleaner.js';
export type {
  OCRResult,
  OCRConfig,
  OCRProgress,
  TableDetectionResult,
  TableExtractionResult,
  TableStructure,
  CleanedText,
  TextCleanerConfig
} from './ocr-types.js';
