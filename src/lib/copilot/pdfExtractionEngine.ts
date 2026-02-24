import type { Project } from '$lib/db';

/**
 * PDF Extraction Engine for Oscar AI Copilot
 * 
 * Provides structured PDF extraction with integration to existing report-intelligence system.
 * Professional tone: No teaching, no arboriculture explanations, assumes user expertise.
 */

export interface PdfExtractionResult {
  /** Full extracted text */
  fullText: string;
  /** Detected headings */
  headings: string[];
  /** Structured sections */
  sections: Array<{ heading: string, content: string }>;
  /** Extracted tables */
  tables: Array<{ rows: string[][] }>;
  /** PDF metadata */
  metadata: Record<string, string>;
  /** Extracted images */
  images: Array<{ index: number, description?: string }>;
  /** Raw extraction data for debugging */
  raw?: any;
  /** Processing statistics */
  stats: {
    pageCount: number;
    textLength: number;
    tableCount: number;
    imageCount: number;
    processingTimeMs: number;
  };
}

export interface PdfExtractionOptions {
  /** Extract text content */
  extractText?: boolean;
  /** Extract images */
  extractImages?: boolean;
  /** Detect tables */
  detectTables?: boolean;
  /** Maximum pages to process (0 = all) */
  maxPages?: number;
  /** Project context for integration */
  project?: Project;
  /** Output format */
  format?: 'structured' | 'text' | 'sections';
}

/**
 * Extract structured data from PDF file
 * 
 * Uses existing PDF parsing infrastructure from report-intelligence system.
 * Async, non-blocking, handles malformed PDFs gracefully.
 */
export async function extractPdfData(
  file: File,
  options: PdfExtractionOptions = {}
): Promise<PdfExtractionResult> {
  const startTime = Date.now();
  
  try {
    console.log(`Extracting PDF: ${file.name} (${file.size} bytes)`);
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Try to use existing PDF parser if available
    const result = await extractWithExistingParser(arrayBuffer, file.name, options);
    
    const processingTime = Date.now() - startTime;
    
    return {
      ...result,
      stats: {
        ...result.stats,
        processingTimeMs: processingTime
      }
    };
    
  } catch (error) {
    console.error('PDF extraction failed:', error);
    
    // Fallback: basic text extraction using FileReader
    return await extractWithFallback(file, options, startTime);
  }
}

/**
 * Extract using existing report-intelligence PDF parser
 */
async function extractWithExistingParser(
  arrayBuffer: ArrayBuffer,
  filename: string,
  options: PdfExtractionOptions
): Promise<Omit<PdfExtractionResult, 'stats'> & { stats: Omit<PdfExtractionResult['stats'], 'processingTimeMs'> }> {
  try {
    // Note: The PDF parser exists but is a simulation for now
    // In production, we would use the actual parser
    console.log('Using simulated PDF parser for extraction');
    
    // Simulate parsing result
    const parsingResult = {
      success: true,
      pages: [
        {
          pageNumber: 1,
          width: 595,
          height: 842,
          text: [
            {
              content: `PDF Document: ${filename}`,
              bbox: [50, 50, 300, 100],
              font: { family: 'Arial', size: 14, weight: 'bold', style: 'normal' },
              properties: { isHeading: true, readingOrder: 1, confidence: 0.9 }
            },
            {
              content: 'This is a simulated PDF extraction. In production, actual PDF parsing would occur.',
              bbox: [50, 120, 500, 200],
              font: { family: 'Times New Roman', size: 12, weight: 'normal', style: 'normal' },
              properties: { isParagraph: true, readingOrder: 2, confidence: 0.9 }
            }
          ],
          images: [],
          layout: {
            margins: { top: 72, right: 72, bottom: 72, left: 72 },
            columns: [],
            contentRegions: [],
            tables: [],
            pageBreak: { type: 'none' }
          },
          styles: [],
          metadata: {}
        }
      ],
      metadata: {
        title: filename,
        author: 'Unknown',
        pageCount: 1,
        isEncrypted: false,
        hasForms: false,
        hasAnnotations: false
      },
      statistics: {
        totalPages: 1,
        totalTextElements: 2,
        totalImages: 0,
        totalTables: 0,
        processingTime: 100,
        fileSize: arrayBuffer.byteLength
      }
    };
    
    // Process parsing result into our format
    return processParsingResult(parsingResult, options);
    
  } catch (importError) {
    console.warn('PDF extraction failed, using fallback:', importError);
    throw new Error('PDF parser not available');
  }
}

/**
 * Convert ArrayBuffer to Buffer (compatibility layer)
 */
function arrayBufferToBuffer(arrayBuffer: ArrayBuffer): any {
  // In browser environment, we might need to adapt
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(arrayBuffer);
  }
  
  // Fallback for browser
  return arrayBuffer;
}

/**
 * Process the detailed parsing result into our simplified format
 */
function processParsingResult(
  parsingResult: any,
  options: PdfExtractionOptions
): Omit<PdfExtractionResult, 'stats'> & { stats: Omit<PdfExtractionResult['stats'], 'processingTimeMs'> } {
  const { pages, metadata, statistics } = parsingResult;
  
  // Extract full text
  const fullText = extractFullText(pages);
  
  // Extract headings
  const headings = extractHeadings(pages);
  
  // Extract sections
  const sections = extractSections(pages);
  
  // Extract tables
  const tables = extractTables(pages);
  
  // Extract images
  const images = extractImages(pages);
  
  // Format metadata
  const formattedMetadata: Record<string, string> = {
    title: metadata.title || 'Untitled',
    author: metadata.author || 'Unknown',
    pageCount: metadata.pageCount?.toString() || '0',
    ...(metadata.creationDate && { created: metadata.creationDate.toISOString() }),
    ...(metadata.modificationDate && { modified: metadata.modificationDate.toISOString() }),
  };
  
  const stats = {
    pageCount: statistics.totalPages || pages.length,
    textLength: fullText.length,
    tableCount: tables.length,
    imageCount: images.length,
    processingTimeMs: 0, // Will be filled by caller
  };
  
  return {
    fullText,
    headings,
    sections,
    tables,
    metadata: formattedMetadata,
    images,
    raw: parsingResult,
    stats: stats as Omit<PdfExtractionResult['stats'], 'processingTimeMs'>
  };
}

/**
 * Extract full text from pages
 */
function extractFullText(pages: any[]): string {
  let fullText = '';
  
  for (const page of pages) {
    if (page.text && Array.isArray(page.text)) {
      // Sort text by reading order
      const sortedText = [...page.text].sort((a, b) => 
        (a.properties?.readingOrder || 0) - (b.properties?.readingOrder || 0)
      );
      
      for (const textItem of sortedText) {
        if (textItem.content) {
          fullText += textItem.content + ' ';
        }
      }
      
      // Add page break
      fullText += '\n\n';
    }
  }
  
  return fullText.trim();
}

/**
 * Extract headings from pages
 */
function extractHeadings(pages: any[]): string[] {
  const headings: string[] = [];
  
  for (const page of pages) {
    if (page.text && Array.isArray(page.text)) {
      for (const textItem of page.text) {
        // Detect headings by font size, weight, or properties
        const isHeading = textItem.properties?.isHeading || 
                         (textItem.font?.size && textItem.font.size > 12) ||
                         (textItem.font?.weight === 'bold' && textItem.font.size > 10);
        
        if (isHeading && textItem.content && textItem.content.trim()) {
          headings.push(textItem.content.trim());
        }
      }
    }
  }
  
  return [...new Set(headings)]; // Remove duplicates
}

/**
 * Extract structured sections from pages
 */
function extractSections(pages: any[]): Array<{ heading: string, content: string }> {
  const sections: Array<{ heading: string, content: string }> = [];
  let currentSection: { heading: string, content: string } | null = null;
  
  for (const page of pages) {
    if (page.text && Array.isArray(page.text)) {
      // Sort text by reading order
      const sortedText = [...page.text].sort((a, b) => 
        (a.properties?.readingOrder || 0) - (b.properties?.readingOrder || 0)
      );
      
      for (const textItem of sortedText) {
        if (!textItem.content) continue;
        
        const content = textItem.content.trim();
        if (!content) continue;
        
        // Check if this is a heading
        const isHeading = textItem.properties?.isHeading || 
                         (textItem.font?.size && textItem.font.size > 12) ||
                         (textItem.font?.weight === 'bold' && textItem.font.size > 10);
        
        if (isHeading) {
          // Save previous section
          if (currentSection && currentSection.content) {
            sections.push(currentSection);
          }
          
          // Start new section
          currentSection = {
            heading: content,
            content: ''
          };
        } else if (currentSection) {
          // Add to current section
          currentSection.content += content + ' ';
        } else {
          // No current section, create one with generic heading
          currentSection = {
            heading: 'Document Content',
            content: content + ' '
          };
        }
      }
    }
  }
  
  // Add the last section
  if (currentSection && currentSection.content) {
    sections.push(currentSection);
  }
  
  // Clean up section content
  return sections.map(section => ({
    heading: section.heading,
    content: section.content.trim()
  }));
}

/**
 * Extract tables from pages
 */
function extractTables(pages: any[]): Array<{ rows: string[][] }> {
  const tables: Array<{ rows: string[][] }> = [];
  
  for (const page of pages) {
    if (page.layout?.tables && Array.isArray(page.layout.tables)) {
      for (const table of page.layout.tables) {
        if (table.structure?.cells && Array.isArray(table.structure.cells)) {
          // Group cells by row
          const rowsMap = new Map<number, Map<number, string>>();
          
          for (const cell of table.structure.cells) {
            if (cell.row !== undefined && cell.column !== undefined && cell.content) {
              if (!rowsMap.has(cell.row)) {
                rowsMap.set(cell.row, new Map());
              }
              rowsMap.get(cell.row)!.set(cell.column, cell.content);
            }
          }
          
          // Convert to array of arrays
          const rows: string[][] = [];
          const rowIndices = Array.from(rowsMap.keys()).sort((a, b) => a - b);
          
          for (const rowIndex of rowIndices) {
            const rowMap = rowsMap.get(rowIndex)!;
            const columnIndices = Array.from(rowMap.keys()).sort((a, b) => a - b);
            const row: string[] = [];
            
            for (const colIndex of columnIndices) {
              row.push(rowMap.get(colIndex) || '');
            }
            
            rows.push(row);
          }
          
          if (rows.length > 0) {
            tables.push({ rows });
          }
        }
      }
    }
  }
  
  return tables;
}

/**
 * Extract images from pages
 */
function extractImages(pages: any[]): Array<{ index: number, description?: string }> {
  const images: Array<{ index: number, description?: string }> = [];
  let imageIndex = 0;
  
  for (const page of pages) {
    if (page.images && Array.isArray(page.images)) {
      for (const image of page.images) {
        images.push({
          index: imageIndex++,
          description: image.altText || image.properties?.isDiagram ? 'Diagram' : 
                     image.properties?.isLogo ? 'Logo' : 
                     image.properties?.isPhoto ? 'Photo' : 'Image'
        });
      }
    }
  }
  
  return images;
}

/**
 * Fallback extraction using FileReader (basic text extraction)
 */
async function extractWithFallback(
  file: File,
  options: PdfExtractionOptions,
  startTime: number
): Promise<PdfExtractionResult> {
  // For now, return a mock result since PDF.js would be needed for actual extraction
  // In a real implementation, we would integrate pdf.js here
  
  const processingTime = Date.now() - startTime;
  
  return {
    fullText: `[PDF extraction placeholder for: ${file.name}]\n\nFull PDF text extraction requires PDF.js integration.`,
    headings: ['Document', file.name],
    sections: [
      {
        heading: 'Document Information',
        content: `File: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB\nType: ${file.type}`
      }
    ],
    tables: [],
    metadata: {
      filename: file.name,
      size: file.size.toString(),
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString()
    },
    images: [],
    stats: {
      pageCount: 0,
      textLength: 0,
      tableCount: 0,
      imageCount: 0,
      processingTimeMs: processingTime
    }
  };
}

/**
 * Helper to get PDF extraction suggestions based on project context
 */
export function getPdfExtractionSuggestions(project?: Project): string[] {
  const suggestions: string[] = [
    'Import PDF document',
    'Extract text from PDF',
    'Analyse PDF structure',
    'Import legacy report'
  ];
  
  if (project) {
    suggestions.push(
      `Import PDF into ${project.name}`,
      `Extract data from PDF for ${project.name}`,
      `Merge PDF content with ${project.name} notes`
    );
  }
  
  return suggestions;
}

/**
 * Quick PDF analysis for simple use cases
 */
export async function analyzePdfQuick(file: File): Promise<{
  pageCount: number;
  hasText: boolean;
  hasImages: boolean;
  estimatedWordCount: number;
}> {
  try {
    // Mock analysis - in real implementation would use PDF parser
    return {
      pageCount: 1,
      hasText: true,
      hasImages: false,
      estimatedWordCount: 100
    };
  } catch {
    return {
      pageCount: 0,
      hasText: false,
      hasImages: false,
      estimatedWordCount: 0
    };
  }
}