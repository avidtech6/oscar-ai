/**
 * Section Detector Module
 * 
 * Detects content sections between headings.
 */

import type { DecompiledReport, DetectedSection } from '../DecompiledReport';

export interface SectionDetectionResult {
  count: number;
  confidence: number;
  sections: DetectedSection[];
}

export class SectionDetector {
  /**
   * Detect content sections in the report text
   */
  async detect(report: DecompiledReport): Promise<SectionDetectionResult> {
    const lines = report.normalizedText.split('\n');
    const sections: DetectedSection[] = [];
    let currentSection: DetectedSection | null = null;
    let sectionCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if this line is a heading (using simple heading detection)
      const isHeading = this.isHeading(line);
      
      if (isHeading) {
        // Start a new section
        if (currentSection) {
          currentSection.endLine = i - 1;
          currentSection.metadata.lineCount = currentSection.endLine - currentSection.startLine + 1;
          currentSection.metadata.wordCount = this.countWords(
            lines.slice(currentSection.startLine, currentSection.endLine + 1).join(' ')
          );
        }
        
        currentSection = null;
      } else if (line.length > 0 && !currentSection) {
        // Start a content section
        currentSection = {
          id: `section-${sectionCount}`,
          type: 'section',
          level: 0,
          title: `Section ${sectionCount + 1}`,
          content: line,
          startLine: i,
          endLine: i,
          childrenIds: [],
          metadata: {
            wordCount: this.countWords(line),
            lineCount: 1,
            hasNumbers: /\d/.test(line),
            hasBullets: /^[\-\*•]/.test(line.trim()),
            hasTables: false,
            confidence: 0.7,
          },
        };
        
        sections.push(currentSection);
        sectionCount++;
      } else if (currentSection && line.length > 0) {
        // Continue current section
        currentSection.content += '\n' + line;
        currentSection.endLine = i;
      }
    }
    
    // Close the last section
    if (currentSection) {
      currentSection.metadata.lineCount = currentSection.endLine - currentSection.startLine + 1;
      currentSection.metadata.wordCount = this.countWords(
        lines.slice(currentSection.startLine, currentSection.endLine + 1).join(' ')
      );
    }
    
    return {
      count: sectionCount,
      confidence: sectionCount > 0 ? 0.7 : 0.3,
      sections,
    };
  }
  
  /**
   * Simple heading detection (similar to HeadingDetector)
   */
  private isHeading(line: string): boolean {
    return /^#{1,6}\s/.test(line) ||
           /^[A-Z][A-Z\s]{10,}$/.test(line) ||
           /^[IVX]+\.\s/.test(line) ||
           /^\d+\.\d+\s/.test(line);
  }
  
  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
}