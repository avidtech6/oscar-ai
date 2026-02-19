/**
 * Metadata Detector Module
 * 
 * Extracts metadata from report text (title, author, date, client, etc.).
 */

import type { DecompiledReport, ExtractedMetadata } from '../DecompiledReport';

export interface MetadataDetectionResult {
  confidence: number;
  metadata: ExtractedMetadata;
}

export class MetadataDetector {
  /**
   * Extract metadata from the report text
   */
  async detect(report: DecompiledReport): Promise<MetadataDetectionResult> {
    const lines = report.normalizedText.split('\n');
    const metadata: ExtractedMetadata = {
      ...report.metadata,
      keywords: [],
    };
    
    // Look for common metadata patterns in first 20 lines
    for (let i = 0; i < Math.min(lines.length, 20); i++) {
      const line = lines[i].trim();
      
      // Title detection
      if (i === 0 && line.length > 10 && line.length < 200) {
        metadata.title = line;
      }
      
      // Author detection
      if (line.toLowerCase().includes('author:') || line.toLowerCase().includes('prepared by:')) {
        metadata.author = line.replace(/.*[:]\s*/i, '').trim();
      }
      
      // Date detection
      if (line.match(/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/) || line.toLowerCase().includes('date:')) {
        metadata.date = line.replace(/.*[:]\s*/i, '').trim();
      }
      
      // Client detection
      if (line.toLowerCase().includes('client:') || line.toLowerCase().includes('prepared for:')) {
        metadata.client = line.replace(/.*[:]\s*/i, '').trim();
      }
      
      // Site address detection
      if (line.toLowerCase().includes('site:') || line.toLowerCase().includes('location:') || line.toLowerCase().includes('address:')) {
        metadata.siteAddress = line.replace(/.*[:]\s*/i, '').trim();
      }
      
      // Report type detection
      if (line.toLowerCase().includes('report type:') || line.toLowerCase().includes('type of report:')) {
        metadata.reportType = line.replace(/.*[:]\s*/i, '').trim();
      }
      
      // Page count detection
      if (line.toLowerCase().includes('page') && line.toLowerCase().includes('of')) {
        const pageMatch = line.match(/\d+\s*of\s*\d+/i);
        if (pageMatch) {
          metadata.pageCount = parseInt(pageMatch[0].split(/\s+/)[2] || '0');
        }
      }
      
      // Version detection
      if (line.toLowerCase().includes('version') || line.toLowerCase().includes('v.')) {
        const versionMatch = line.match(/v\.?\s*(\d+\.\d+)/i);
        if (versionMatch) {
          metadata.version = versionMatch[1];
        }
      }
    }
    
    // Extract keywords (simplified)
    const commonWords = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'are', 'was', 'were', 'from']);
    const words = report.normalizedText.toLowerCase().split(/\s+/);
    const wordFrequency: Record<string, number> = {};
    
    for (const word of words) {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.length > 3 && !commonWords.has(cleanWord)) {
        wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
      }
    }
    
    // Get top 10 keywords
    metadata.keywords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
    
    // Detect language (simplified - assume English for now)
    metadata.language = 'en';
    
    return {
      confidence: 0.6,
      metadata,
    };
  }
}