/**
 * Report Decompiler Engine - Phase 2
 * DecompiledReport Interface
 * 
 * This defines the structure for decompiled reports after processing.
 */

export interface DetectedSection {
  id: string;
  type: 'heading' | 'subheading' | 'section' | 'subsection' | 'list' | 'table' | 'appendix' | 'methodology' | 'disclaimer' | 'legal' | 'unknown';
  level: number; // Heading level (1-6), 0 for non-headings
  title: string;
  content: string;
  startLine: number;
  endLine: number;
  parentId?: string; // ID of parent section
  childrenIds: string[]; // IDs of child sections
  metadata: {
    wordCount: number;
    lineCount: number;
    hasNumbers: boolean;
    hasBullets: boolean;
    hasTables: boolean;
    confidence: number; // 0-1 confidence score
  };
}

export interface ExtractedMetadata {
  title?: string;
  author?: string;
  date?: string;
  client?: string;
  siteAddress?: string;
  reportType?: string;
  pageCount?: number;
  wordCount?: number;
  language?: string;
  version?: string;
  references?: string[];
  keywords: string[];
}

export interface TerminologyEntry {
  term: string;
  context: string;
  frequency: number;
  category: 'technical' | 'legal' | 'compliance' | 'species' | 'measurement' | 'general';
  definition?: string;
  confidence: number;
}

export interface ComplianceMarker {
  type: 'standard' | 'regulation' | 'requirement' | 'guideline' | 'best_practice';
  text: string;
  standard?: string; // e.g., 'BS5837:2012', 'Arboricultural Association'
  sectionId?: string; // Reference to section containing this marker
  confidence: number;
}

export interface StructureMap {
  hierarchy: Array<{
    id: string;
    type: string;
    level: number;
    title: string;
    children: number[]; // indices of child items
  }>;
  depth: number;
  sectionCount: number;
  averageSectionLength: number;
  hasAppendices: boolean;
  hasMethodology: boolean;
  hasLegalSections: boolean;
}

export interface DecompiledReport {
  // Core identification
  id: string;
  sourceHash: string; // Hash of original text for deduplication
  
  // Original content
  rawText: string;
  normalizedText: string;
  
  // Detection results
  detectedReportType?: string; // ID from Report Type Registry (Phase 1)
  sections: DetectedSection[];
  metadata: ExtractedMetadata;
  terminology: TerminologyEntry[];
  complianceMarkers: ComplianceMarker[];
  structureMap: StructureMap;
  
  // Processing metadata
  inputFormat: 'text' | 'markdown' | 'pdf_text' | 'pasted';
  processingTimeMs: number;
  confidenceScore: number; // Overall confidence in decompilation (0-1)
  
  // Timestamps
  createdAt: Date;
  processedAt: Date;
  
  // Detector results
  detectorResults: {
    headings: {
      count: number;
      confidence: number;
    };
    sections: {
      count: number;
      confidence: number;
    };
    lists: {
      count: number;
      confidence: number;
    };
    tables: {
      count: number;
      confidence: number;
    };
    metadata: {
      confidence: number;
    };
    terminology: {
      count: number;
      confidence: number;
    };
    compliance: {
      count: number;
      confidence: number;
    };
    appendices: {
      count: number;
      confidence: number;
    };
  };
  
  // Warnings and errors
  warnings: string[];
  errors: string[];
}

/**
 * Helper function to create a new DecompiledReport
 */
export function createDecompiledReport(
  rawText: string,
  inputFormat: DecompiledReport['inputFormat'] = 'text'
): Omit<DecompiledReport, 'id' | 'createdAt' | 'processedAt'> {
  const now = new Date();
  const normalizedText = normalizeText(rawText);
  
  return {
    sourceHash: generateTextHash(rawText),
    rawText,
    normalizedText,
    detectedReportType: undefined,
    sections: [],
    metadata: {
      keywords: [],
      wordCount: countWords(normalizedText),
    },
    terminology: [],
    complianceMarkers: [],
    structureMap: {
      hierarchy: [],
      depth: 0,
      sectionCount: 0,
      averageSectionLength: 0,
      hasAppendices: false,
      hasMethodology: false,
      hasLegalSections: false,
    },
    inputFormat,
    processingTimeMs: 0,
    confidenceScore: 0,
    detectorResults: {
      headings: { count: 0, confidence: 0 },
      sections: { count: 0, confidence: 0 },
      lists: { count: 0, confidence: 0 },
      tables: { count: 0, confidence: 0 },
      metadata: { confidence: 0 },
      terminology: { count: 0, confidence: 0 },
      compliance: { count: 0, confidence: 0 },
      appendices: { count: 0, confidence: 0 },
    },
    warnings: [],
    errors: [],
  };
}

/**
 * Normalize text for processing
 */
function normalizeText(text: string): string {
  // Basic normalization
  return text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\t/g, '  ')   // Convert tabs to spaces
    .replace(/\u00A0/g, ' ') // Replace non-breaking spaces
    .trim();
}

/**
 * Generate a simple hash for text deduplication
 */
function generateTextHash(text: string): string {
  // Simple hash for demonstration
  // In production, use a proper hash function
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}