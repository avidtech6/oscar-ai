/**
 * Heading Detector Module
 * 
 * Detects headings and subheadings in report text.
 */

import type { DecompiledReport, DetectedSection } from '../DecompiledReport';

export interface HeadingDetectionResult {
  count: number;
  confidence: number;
  headings: DetectedSection[];
}

export class HeadingDetector {
  /**
   * Detect headings in the report text
   */
  async detect(report: DecompiledReport): Promise<HeadingDetectionResult> {
    const lines = report.normalizedText.split('\n');
    const headings: DetectedSection[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (this.isHeading(line)) {
        const level = this.getHeadingLevel(line);
        const title = this.extractHeadingTitle(line);
        
        const heading: DetectedSection = {
          id: `heading-${headings.length}`,
          type: level === 1 ? 'heading' : 'subheading',
          level,
          title,
          content: line,
          startLine: i,
          endLine: i,
          childrenIds: [],
          metadata: {
            wordCount: title.split(/\s+/).length,
            lineCount: 1,
            hasNumbers: /\d/.test(line),
            hasBullets: false,
            hasTables: false,
            confidence: 0.9,
          },
        };
        
        headings.push(heading);
      }
    }
    
    return {
      count: headings.length,
      confidence: headings.length > 0 ? 0.8 : 0.3,
      headings,
    };
  }
  
  /**
   * Check if line is a heading
   */
  private isHeading(line: string): boolean {
    // Check for heading patterns
    return /^#{1,6}\s/.test(line) ||           // Markdown headings
           /^[A-Z][A-Z\s]{10,}$/.test(line) || // ALL CAPS headings
           /^[IVX]+\.\s/.test(line) ||         // Roman numeral headings
           /^\d+\.\d+\s/.test(line);           // Numbered headings (1.1, 2.3, etc.)
  }
  
  /**
   * Get heading level
   */
  private getHeadingLevel(line: string): number {
    // Markdown headings
    const markdownMatch = line.match(/^(#{1,6})\s/);
    if (markdownMatch) {
      return markdownMatch[1].length;
    }
    
    // Roman numeral headings
    if (/^[IVX]+\.\s/.test(line)) {
      return 2;
    }
    
    // Numbered headings
    if (/^\d+\.\d+\s/.test(line)) {
      return 3;
    }
    
    // Default level for other headings
    return 1;
  }
  
  /**
   * Extract heading title
   */
  private extractHeadingTitle(line: string): string {
    // Remove markdown hashes
    let title = line.replace(/^#{1,6}\s/, '');
    
    // Remove numbering patterns
    title = title.replace(/^[IVX]+\.\s/, '');
    title = title.replace(/^\d+\.\d+\s/, '');
    
    return title.trim();
  }
}