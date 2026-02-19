/**
 * Table Detector Module
 * 
 * Detects tables in report text (simplified text-based detection).
 */

import type { DecompiledReport, DetectedSection } from '../DecompiledReport';

export interface TableDetectionResult {
  count: number;
  confidence: number;
  tables: DetectedSection[];
}

export class TableDetector {
  /**
   * Detect tables in the report text
   */
  async detect(report: DecompiledReport): Promise<TableDetectionResult> {
    const lines = report.normalizedText.split('\n');
    const tables: DetectedSection[] = [];
    let tableCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (this.isTableLine(line)) {
        tableCount++;
        
        const table: DetectedSection = {
          id: `table-${tableCount}`,
          type: 'table',
          level: 0,
          title: `Table ${tableCount}`,
          content: line,
          startLine: i,
          endLine: i,
          childrenIds: [],
          metadata: {
            wordCount: this.countWords(line),
            lineCount: 1,
            hasNumbers: /\d/.test(line),
            hasBullets: false,
            hasTables: true,
            confidence: 0.7,
          },
        };
        
        tables.push(table);
      }
    }
    
    return {
      count: tableCount,
      confidence: tableCount > 0 ? 0.6 : 0.4,
      tables,
    };
  }
  
  /**
   * Check if line contains table-like content
   */
  private isTableLine(line: string): boolean {
    // Simple table detection: multiple pipes or consistent column spacing
    if (line.includes('|') && line.split('|').length > 2) {
      return true;
    }
    
    // Check for tab-separated values
    if (line.includes('\t') && line.split('\t').length > 2) {
      return true;
    }
    
    // Check for consistent column spacing (at least 3 columns)
    const spaces = line.split(/\s{2,}/);
    if (spaces.length >= 3) {
      // Verify that columns have reasonable content
      const nonEmptyColumns = spaces.filter(col => col.trim().length > 0);
      return nonEmptyColumns.length >= 3;
    }
    
    return false;
  }
  
  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
}