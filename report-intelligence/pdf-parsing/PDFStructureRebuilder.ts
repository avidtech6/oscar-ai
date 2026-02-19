/**
 * PDF Structure Rebuilder
 * 
 * Reconstructs document structure from extracted PDF data,
 * organizing content into sections, headings, paragraphs, lists, and tables.
 */

import type {
  PDFParsingOptions,
  PDFPageData,
  PDFExtractedText,
  PDFExtractedImage,
  PDFLayoutInfo,
  PDFStyleInfo,
} from './types';

export interface RebuiltDocument {
  /** Document title */
  title: string;
  
  /** Document sections */
  sections: DocumentSection[];
  
  /** Document metadata */
  metadata: {
    author?: string;
    date?: Date;
    keywords?: string[];
    pageCount: number;
    wordCount: number;
    imageCount: number;
    tableCount: number;
  };
  
  /** Document structure */
  structure: {
    hasCoverPage: boolean;
    hasTableOfContents: boolean;
    hasReferences: boolean;
    hasAppendices: boolean;
    sectionCount: number;
    maxHeadingLevel: number;
  };
}

export interface DocumentSection {
  /** Section identifier */
  id: string;
  
  /** Section title */
  title: string;
  
  /** Heading level (1-6) */
  level: number;
  
  /** Page number where section starts */
  startPage: number;
  
  /** Section content */
  content: SectionContent[];
  
  /** Subsections */
  subsections: DocumentSection[];
  
  /** Section metadata */
  metadata: {
    wordCount: number;
    imageCount: number;
    tableCount: number;
    hasLists: boolean;
    hasCode: boolean;
    hasQuotes: boolean;
  };
}

export interface SectionContent {
  /** Content type */
  type: 'paragraph' | 'heading' | 'list' | 'table' | 'image' | 'code' | 'quote' | 'separator';
  
  /** Content data */
  data: {
    text?: string;
    items?: string[];
    table?: {
      rows: number;
      columns: number;
      cells: string[][];
    };
    image?: {
      id: string;
      altText?: string;
      width: number;
      height: number;
    };
    language?: string;
    author?: string;
  };
  
  /** Style information */
  style: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    fontStyle?: string;
    color?: string;
    alignment?: string;
  };
  
  /** Page number */
  page: number;
  
  /** Position on page */
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export class PDFStructureRebuilder {
  private options: PDFParsingOptions;
  private isInitialized = false;

  constructor(options: PDFParsingOptions) {
    this.options = options;
  }

  /**
   * Initialize the structure rebuilder
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('Initializing PDF Structure Rebuilder...');
    
    this.isInitialized = true;
    console.log('PDF Structure Rebuilder initialized');
  }

  /**
   * Rebuild document structure from extracted pages
   */
  async rebuildDocument(pages: PDFPageData[]): Promise<RebuiltDocument> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log('Rebuilding document structure...');
    
    try {
      // Extract document title
      const title = this.extractDocumentTitle(pages);
      
      // Extract sections
      const sections = this.extractSections(pages);
      
      // Calculate statistics
      const statistics = this.calculateStatistics(pages, sections);
      
      // Analyze document structure
      const structure = this.analyzeDocumentStructure(pages, sections);
      
      const document: RebuiltDocument = {
        title,
        sections,
        metadata: {
          author: this.extractAuthor(pages),
          date: this.extractDate(pages),
          keywords: this.extractKeywords(pages),
          pageCount: pages.length,
          wordCount: statistics.wordCount,
          imageCount: statistics.imageCount,
          tableCount: statistics.tableCount,
        },
        structure: {
          hasCoverPage: this.hasCoverPage(pages),
          hasTableOfContents: this.hasTableOfContents(pages),
          hasReferences: this.hasReferences(pages),
          hasAppendices: this.hasAppendices(pages),
          sectionCount: sections.length,
          maxHeadingLevel: this.getMaxHeadingLevel(sections),
        },
      };
      
      console.log(`Document structure rebuilt: ${sections.length} sections, ${statistics.wordCount} words`);
      return document;
    } catch (error) {
      console.error('Failed to rebuild document structure:', error);
      return this.getEmptyDocument();
    }
  }

  /**
   * Extract document title
   */
  private extractDocumentTitle(pages: PDFPageData[]): string {
    if (pages.length === 0) {
      return 'Untitled Document';
    }
    
    // Look for large text on first page
    const firstPage = pages[0];
    if (firstPage.text.length > 0) {
      // Find the largest font size text
      const titleText = firstPage.text.reduce((largest, current) => {
        if (current.font.size > (largest?.font.size || 0)) {
          return current;
        }
        return largest;
      }, firstPage.text[0]);
      
      if (titleText && titleText.font.size >= 16) {
        return titleText.content;
      }
    }
    
    // Fallback: use first non-empty text
    for (const page of pages) {
      for (const text of page.text) {
        if (text.content.trim().length > 0) {
          return text.content;
        }
      }
    }
    
    return 'Untitled Document';
  }

  /**
   * Extract document sections
   */
  private extractSections(pages: PDFPageData[]): DocumentSection[] {
    const sections: DocumentSection[] = [];
    let currentSection: DocumentSection | null = null;
    let sectionId = 1;
    
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const page = pages[pageIndex];
      const pageNumber = pageIndex + 1;
      
      // Process text elements on this page
      for (const text of page.text) {
        // Check if this is a heading
        const isHeading = text.properties.isHeading || text.font.size >= 14 || text.font.weight === 'bold';
        const headingLevel = this.determineHeadingLevel(text);
        
        if (isHeading && headingLevel <= 3) {
          // Start a new section
          if (currentSection) {
            sections.push(currentSection);
          }
          
          currentSection = {
            id: `section-${sectionId++}`,
            title: text.content,
            level: headingLevel,
            startPage: pageNumber,
            content: [],
            subsections: [],
            metadata: {
              wordCount: 0,
              imageCount: 0,
              tableCount: 0,
              hasLists: false,
              hasCode: false,
              hasQuotes: false,
            },
          };
        } else if (currentSection) {
          // Add content to current section
          const content = this.createContentFromText(text, pageNumber);
          currentSection.content.push(content);
          
          // Update section metadata
          currentSection.metadata.wordCount += this.countWords(text.content);
          if (text.properties.isListItem) {
            currentSection.metadata.hasLists = true;
          }
        }
      }
      
      // Add images to current section
      if (currentSection) {
        for (const image of page.images) {
          const content = this.createContentFromImage(image, pageNumber);
          currentSection.content.push(content);
          currentSection.metadata.imageCount++;
        }
      }
      
      // Add tables to current section
      if (currentSection && page.layout.tables.length > 0) {
        for (const table of page.layout.tables) {
          const content = this.createContentFromTable(table, pageNumber);
          currentSection.content.push(content);
          currentSection.metadata.tableCount++;
        }
      }
    }
    
    // Add the last section
    if (currentSection) {
      sections.push(currentSection);
    }
    
    // Organize sections into hierarchy
    return this.organizeSectionHierarchy(sections);
  }

  /**
   * Determine heading level from text properties
   */
  private determineHeadingLevel(text: PDFExtractedText): number {
    if (text.font.size >= 20) return 1;
    if (text.font.size >= 16) return 2;
    if (text.font.size >= 14) return 3;
    if (text.font.size >= 12) return 4;
    if (text.font.size >= 11) return 5;
    return 6;
  }

  /**
   * Create content from text element
   */
  private createContentFromText(
    text: PDFExtractedText,
    pageNumber: number
  ): SectionContent {
    const [x1, y1, x2, y2] = text.bbox;
    
    let type: SectionContent['type'] = 'paragraph';
    if (text.properties.isHeading) type = 'heading';
    if (text.properties.isListItem) type = 'list';
    if (text.properties.isTableContent) type = 'table';
    
    return {
      type,
      data: {
        text: text.content,
        items: text.properties.isListItem ? [text.content] : undefined,
      },
      style: {
        fontFamily: text.font.family,
        fontSize: text.font.size,
        fontWeight: text.font.weight,
        fontStyle: text.font.style,
        color: text.font.color,
        alignment: 'left', // Would need to detect from layout
      },
      page: pageNumber,
      position: {
        x: x1,
        y: y1,
        width: x2 - x1,
        height: y2 - y1,
      },
    };
  }

  /**
   * Create content from image element
   */
  private createContentFromImage(
    image: PDFExtractedImage,
    pageNumber: number
  ): SectionContent {
    const [x1, y1, x2, y2] = image.bbox;
    
    return {
      type: 'image',
      data: {
        image: {
          id: image.id,
          altText: image.altText,
          width: image.properties.width,
          height: image.properties.height,
        },
      },
      style: {},
      page: pageNumber,
      position: {
        x: x1,
        y: y1,
        width: x2 - x1,
        height: y2 - y1,
      },
    };
  }

  /**
   * Create content from table
   */
  private createContentFromTable(
    table: any, // Using any for simplicity, would be PDFTable type
    pageNumber: number
  ): SectionContent {
    const [x1, y1, x2, y2] = table.bbox;
    
    // Convert table cells to 2D array
    const cells: string[][] = [];
    const rows = table.structure.rows;
    const columns = table.structure.columns;
    
    // Initialize empty cells
    for (let i = 0; i < rows; i++) {
      cells[i] = Array(columns).fill('');
    }
    
    // Fill cells with content
    if (table.structure.cells && Array.isArray(table.structure.cells)) {
      table.structure.cells.forEach((cell: any) => {
        if (cell.row < rows && cell.column < columns) {
          cells[cell.row][cell.column] = cell.content || '';
        }
      });
    }
    
    return {
      type: 'table',
      data: {
        table: {
          rows,
          columns,
          cells,
        },
      },
      style: {},
      page: pageNumber,
      position: {
        x: x1,
        y: y1,
        width: x2 - x1,
        height: y2 - y1,
      },
    };
  }

  /**
   * Organize sections into hierarchy based on heading levels
   */
  private organizeSectionHierarchy(sections: DocumentSection[]): DocumentSection[] {
    const hierarchy: DocumentSection[] = [];
    const stack: DocumentSection[] = [];
    
    for (const section of sections) {
      // Pop stack until we find parent level
      while (stack.length > 0 && stack[stack.length - 1].level >= section.level) {
        stack.pop();
      }
      
      if (stack.length === 0) {
        // Top-level section
        hierarchy.push(section);
      } else {
        // Child section
        const parent = stack[stack.length - 1];
        parent.subsections.push(section);
      }
      
      stack.push(section);
    }
    
    return hierarchy;
  }

  /**
   * Calculate document statistics
   */
  private calculateStatistics(
    pages: PDFPageData[],
    sections: DocumentSection[]
  ): {
    wordCount: number;
    imageCount: number;
    tableCount: number;
  } {
    let wordCount = 0;
    let imageCount = 0;
    let tableCount = 0;
    
    // Count from pages
    pages.forEach(page => {
      page.text.forEach(text => {
        wordCount += this.countWords(text.content);
      });
      imageCount += page.images.length;
      tableCount += page.layout.tables.length;
    });
    
    return { wordCount, imageCount, tableCount };
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Extract author from document
   */
  private extractAuthor(pages: PDFPageData[]): string | undefined {
    // Look for author metadata or patterns
    for (const page of pages) {
      for (const text of page.text) {
        const content = text.content.toLowerCase();
        if (content.includes('author:') || content.includes('prepared by:')) {
          return text.content.split(':')[1]?.trim();
        }
      }
    }
    return undefined;
  }

  /**
   * Extract date from document
   */
  private extractDate(pages: PDFPageData[]): Date | undefined {
    // Look for date patterns
    const datePatterns = [
      /\d{1,2}\/\d{1,2}\/\d{4}/, // MM/DD/YYYY
      /\d{4}-\d{1,2}-\d{1,2}/, // YYYY-MM-DD
      /\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/i,
    ];
    
    for (const page of pages) {
      for (const text of page.text) {
        for (const pattern of datePatterns) {
          const match = text.content.match(pattern);
          if (match) {
            return new Date(match[0]);
          }
        }
      }
    }
    return undefined;
  }

  /**
   * Extract keywords from document
   */
  private extractKeywords(pages: PDFPageData[]): string[] {
    const keywords = new Set<string>();
    
    // Look for keyword patterns
    for (const page of pages) {
      for (const text of page.text) {
        const content = text.content.toLowerCase();
        if (content.includes('keywords:') || content.includes('key words:')) {
          const keywordText = text.content.split(':')[1];
          if (keywordText) {
            keywordText.split(',').forEach(keyword => {
              const trimmed = keyword.trim();
              if (trimmed.length > 0) {
                keywords.add(trimmed);
              }
            });
          }
        }
      }
    }
    
    return Array.from(keywords);
  }

  /**
   * Check if document has cover page
   */
  private hasCoverPage(pages: PDFPageData[]): boolean {
    if (pages.length === 0) return false;
    
    const firstPage = pages[0];
    // Check for large title text or images on first page
    const hasLargeText = firstPage.text.some(text => text.font.size >= 20);
    const hasImages = firstPage.images.length > 0;
    
    return hasLargeText || hasImages;
  }

  /**
   * Check if document has table of contents
   */
  private hasTableOfContents(pages: PDFPageData[]): boolean {
    // Look for "Table of Contents" or "Contents" heading
    for (const page of pages.slice(0, Math.min(3, pages.length))) {
      for (const text of page.text) {
        const content = text.content.toLowerCase();
        if (content.includes('table of contents') || content.includes('contents')) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Check if document has references
   */
  private hasReferences(pages: PDFPageData[]): boolean {
    // Look for "References" or "Bibliography" heading
    for (const page of pages.slice(-5)) { // Check last 5 pages
      for (const text of page.text) {
        const content = text.content.toLowerCase();
        if (content.includes('references') || content.includes('bibliography')) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Check if document has appendices
   */
  private hasAppendices(pages: PDFPageData[]): boolean {
    // Look for "Appendix" heading
    for (const page of pages) {
      for (const text of page.text) {
        const content = text.content.toLowerCase();
        if (content.includes('appendix')) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Get maximum heading level
   */
  private getMaxHeadingLevel(sections: DocumentSection[]): number {
    if (sections.length === 0) return 0;
    
    let maxLevel = 0;
    const traverse = (section: DocumentSection) => {
      if (section.level > maxLevel) {
        maxLevel = section.level;
      }
      section.subsections.forEach(traverse);
    };
    
    sections.forEach(traverse);
    return maxLevel;
  }

  /**
   * Get empty document (fallback)
   */
  private getEmptyDocument(): RebuiltDocument {
    return {
      title: 'Untitled Document',
      sections: [],
      metadata: {
        author: undefined,
        date: undefined,
        keywords: [],
        pageCount: 0,
        wordCount: 0,
        imageCount: 0,
        tableCount: 0,
      },
      structure: {
        hasCoverPage: false,
        hasTableOfContents: false,
        hasReferences: false,
        hasAppendices: false,
        sectionCount: 0,
        maxHeadingLevel: 0,
      },
    };
  }

  /**
   * Analyze document structure
   */
  private analyzeDocumentStructure(
    pages: PDFPageData[],
    sections: DocumentSection[]
  ): RebuiltDocument['structure'] {
    return {
      hasCoverPage: this.hasCoverPage(pages),
      hasTableOfContents: this.hasTableOfContents(pages),
      hasReferences: this.hasReferences(pages),
      hasAppendices: this.hasAppendices(pages),
      sectionCount: sections.length,
      maxHeadingLevel: this.getMaxHeadingLevel(sections),
    };
  }

  /**
   * Update extraction options
   */
  updateOptions(newOptions: PDFParsingOptions): void {
    this.options = newOptions;
    console.log('PDF Structure Rebuilder options updated');
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    console.log('Cleaning up PDF Structure Rebuilder resources...');
    this.isInitialized = false;
  }
}