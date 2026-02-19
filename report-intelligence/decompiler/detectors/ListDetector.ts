/**
 * List Detector Module
 * 
 * Detects bulleted and numbered lists in report text.
 */

import type { DecompiledReport, DetectedSection } from '../DecompiledReport';

export interface ListDetectionResult {
  count: number;
  confidence: number;
  lists: DetectedSection[];
}

export class ListDetector {
  /**
   * Detect lists in the report text
   */
  async detect(report: DecompiledReport): Promise<ListDetectionResult> {
    const lines = report.normalizedText.split('\n');
    const lists: DetectedSection[] = [];
    let listCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (this.isListLine(line)) {
        listCount++;
        
        const list: DetectedSection = {
          id: `list-${listCount}`,
          type: 'list',
          level: 0,
          title: `List ${listCount}`,
          content: line,
          startLine: i,
          endLine: i,
          childrenIds: [],
          metadata: {
            wordCount: this.countWords(line),
            lineCount: 1,
            hasNumbers: /^\d+[\.\)]/.test(line),
            hasBullets: /^[\-\*•]/.test(line),
            hasTables: false,
            confidence: 0.9,
          },
        };
        
        lists.push(list);
      }
    }
    
    return {
      count: listCount,
      confidence: listCount > 0 ? 0.8 : 0.5,
      lists,
    };
  }
  
  /**
   * Check if line is a list item
   */
  private isListLine(line: string): boolean {
    return /^[\-\*•]\s/.test(line.trim()) ||    // Bullet lists
           /^\d+[\.\)]\s/.test(line.trim());    // Numbered lists
  }
  
  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
}