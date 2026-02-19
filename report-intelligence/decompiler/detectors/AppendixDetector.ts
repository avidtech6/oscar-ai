/**
 * Appendix Detector Module
 * 
 * Detects appendices and annexes in report text.
 */

import type { DecompiledReport, DetectedSection } from '../DecompiledReport';

export interface AppendixDetectionResult {
  count: number;
  confidence: number;
  appendices: DetectedSection[];
}

export class AppendixDetector {
  /**
   * Detect appendices in the report text
   */
  async detect(report: DecompiledReport): Promise<AppendixDetectionResult> {
    const lines = report.normalizedText.split('\n');
    const appendices: DetectedSection[] = [];
    let appendixCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim().toLowerCase();
      
      if (this.isAppendixLine(line)) {
        appendixCount++;
        
        const appendix: DetectedSection = {
          id: `appendix-${appendixCount}`,
          type: 'appendix',
          level: 0,
          title: line,
          content: line,
          startLine: i,
          endLine: i,
          childrenIds: [],
          metadata: {
            wordCount: this.countWords(line),
            lineCount: 1,
            hasNumbers: /\d/.test(line),
            hasBullets: false,
            hasTables: false,
            confidence: 0.9,
          },
        };
        
        appendices.push(appendix);
      }
    }
    
    return {
      count: appendixCount,
      confidence: appendixCount > 0 ? 0.8 : 0.5,
      appendices,
    };
  }
  
  /**
   * Check if line contains appendix reference
   */
  private isAppendixLine(line: string): boolean {
    const lowerLine = line.toLowerCase();
    return lowerLine.includes('appendix') || 
           lowerLine.includes('annex') ||
           lowerLine.includes('attachment') ||
           lowerLine.includes('schedule');
  }
  
  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
}