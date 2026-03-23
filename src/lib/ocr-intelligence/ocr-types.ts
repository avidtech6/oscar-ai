/**
 * OCR Intelligence Types
 * 
 * PHASE 29.5 — OCR & Table Extraction Layer
 * Type definitions for OCR, table extraction, and text cleaning.
 */

/**
 * OCR configuration options
 */
export interface OCRConfig {
  /**
   * Language(s) to use for OCR
   */
  languages?: string[];

  /**
   * Confidence threshold for text extraction
   */
  confidenceThreshold?: number;

  /**
   * Enable table detection
   */
  enableTableDetection?: boolean;

  /**
   * Enable layout analysis
   */
  enableLayoutAnalysis?: boolean;

  /**
   * DPI for image processing
   */
  dpi?: number;

  /**
   * Maximum image size in pixels
   */
  maxImageSize?: number;

  /**
   * Enable preprocessing
   */
  enablePreprocessing?: boolean;

  /**
   * Preprocessing options
   */
  preprocessing?: {
    /**
     * Enable grayscale conversion
     */
    grayscale?: boolean;

    /**
     * Enable binarization
     */
    binarize?: boolean;

    /**
     * Enable noise reduction
     */
    denoise?: boolean;
  };

  /**
   * Table detection options
   */
  tableDetection?: {
    /**
     * Minimum table row height
     */
    minRowHeight?: number;

    /**
     * Minimum table column width
     */
    minColumnWidth?: number;

    /**
     * Enable header detection
     */
    detectHeaders?: boolean;
  };
}

/**
 * OCR progress callback
 */
export interface OCRProgress {
  /**
   * Progress ID
   */
  id: string;

  /**
   * Progress percentage (0-100)
   */
  percentage: number;

  /**
   * Current step description
   */
  step: string;

  /**
   * Status
   */
  status: 'processing' | 'complete' | 'error';
}

/**
 * OCR result from image processing
 */
export interface OCRResult {
  /**
   * Result ID
   */
  id: string;

  /**
   * Source image path or data URL
   */
  source: string;

  /**
   * Extracted text
   */
  text: string;

  /**
   * Confidence score (0-1)
   */
  confidence: number;

  /**
   * Language detected
   */
  detectedLanguage?: string;

  /**
   * Text regions with coordinates
   */
  regions?: OCRRegion[];

  /**
   * Tables detected
   */
  tables?: TableDetectionResult[];

  /**
   * Layout structure
   */
  layout?: LayoutStructure;

  /**
   * Processing metadata
   */
  metadata: {
    processingTime: number;
    processedAt: Date;
    dpi: number;
    imageSize: {
      width: number;
      height: number;
    };
  };

  /**
   * Success status
   */
  success: boolean;

  /**
   * Error message if failed
   */
  error?: string;
}

/**
 * OCR text region with coordinates
 */
export interface OCRRegion {
  /**
   * Region ID
   */
  id: string;

  /**
   * Text content
   */
  text: string;

  /**
   * Bounding box coordinates
   */
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  /**
   * Confidence score
   */
  confidence: number;

  /**
   * Region type
   */
  type: 'paragraph' | 'heading' | 'list' | 'table' | 'figure' | 'other';
}

/**
 * Layout structure analysis
 */
export interface LayoutStructure {
  /**
   * Page dimensions
   */
  page: {
    width: number;
    height: number;
  };

  /**
   * Text blocks
   */
  blocks: LayoutBlock[];

  /**
   * Columns
   */
  columns: LayoutColumn[];
}

/**
 * Layout block
 */
export interface LayoutBlock {
  id: string;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  type: 'text' | 'image' | 'table' | 'heading' | 'footer' | 'header';
  content: string;
}

/**
 * Layout column
 */
export interface LayoutColumn {
  id: string;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  blocks: string[];
}

/**
 * Table detection result
 */
export interface TableDetectionResult {
  id: string;

  /**
   * Detected table structure
   */
  structure: TableStructure;

  /**
   * Bounding box coordinates
   */
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  /**
   * Confidence score
   */
  confidence: number;

  /**
   * Number of rows
   */
  rows: number;

  /**
   * Number of columns
   */
  columns: number;

  /**
   * Is header detected
   */
  hasHeader: boolean;
}

/**
 * Table structure
 */
export interface TableStructure {
  /**
   * Table header row index
   */
  headerRowIndex?: number;

  /**
   * Column definitions
   */
  columns: ColumnDefinition[];

  /**
   * Row definitions
   */
  rows: RowDefinition[];
}

/**
 * Column definition
 */
export interface ColumnDefinition {
  id: string;
  index: number;
  width: number;
  headerText?: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'mixed';
}

/**
 * Row definition
 */
export interface RowDefinition {
  id: string;
  index: number;
  cells: TableCell[];
}

/**
 * Table cell
 */
export interface TableCell {
  id: string;
  rowIndex: number;
  columnIndex: number;
  text: string;
  confidence: number;
  merged: boolean;
  mergeInfo?: {
    rowspan: number;
    colspan: number;
  };
}

/**
 * Table extraction result
 */
export interface TableExtractionResult {
  /**
   * Result ID
   */
  id: string;

  /**
   * Source table detection result
   */
  sourceTableId: string;

  /**
   * Extracted table data
   */
  data: string[][];

  /**
   * Table structure
   */
  structure: TableStructure;

  /**
   * Confidence score
   */
  confidence: number;

  /**
   * Success status
   */
  success: boolean;

  /**
   * Error message if failed
   */
  error?: string;
}

/**
 * Cleaned text result
 */
export interface CleanedText {
  /**
   * Original text
   */
  original: string;

  /**
   * Cleaned text
   */
  cleaned: string;

  /**
   * Statistics
   */
  statistics: {
    originalLength: number;
    cleanedLength: number;
    characterCount: number;
    wordCount: number;
    lineCount: number;
    whitespaceRemoved: number;
    punctuationRemoved: number;
    numbersRemoved: number;
  };

  /**
   * Warnings
   */
  warnings: string[];

  /**
   * Success status
   */
  success: boolean;
}

/**
 * Text cleaner configuration
 */
export interface TextCleanerConfig {
  /**
   * Remove extra whitespace
   */
  removeExtraWhitespace?: boolean;

  /**
   * Remove leading/trailing whitespace
   */
  trimWhitespace?: boolean;

  /**
   * Remove punctuation
   */
  removePunctuation?: boolean;

  /**
   * Remove special characters
   */
  removeSpecialChars?: boolean;

  /**
   * Normalize line endings
   */
  normalizeLineEndings?: boolean;

  /**
   * Convert to lowercase
   */
  toLowerCase?: boolean;

  /**
   * Remove numbers
   */
  removeNumbers?: boolean;

  /**
   * Remove URLs
   */
  removeUrls?: boolean;

  /**
   * Remove emails
   */
  removeEmails?: boolean;

  /**
   * Remove HTML tags
   */
  removeHtmlTags?: boolean;

  /**
   * Remove Unicode control characters
   */
  removeControlChars?: boolean;

  /**
   * Replace multiple spaces with single space
   */
  replaceMultipleSpaces?: boolean;

  /**
   * Preserve line breaks
   */
  preserveLineBreaks?: boolean;
}
