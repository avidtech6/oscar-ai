import { extractPdfData, getPdfExtractionSuggestions, analyzePdfQuick } from './pdfExtractionEngine';
import type { Project } from '$lib/db';
import { updateFollowUps } from './followUpStore';

/**
 * PDF Extraction Service
 *
 * Handles PDF file uploads, extraction, and integration with Copilot system.
 * Professional tone: No teaching, no arboriculture explanations, assumes user expertise.
 */

export interface PdfExtractionRequest {
  file: File;
  project?: Project;
  options?: {
    extractText?: boolean;
    extractImages?: boolean;
    detectTables?: boolean;
    maxPages?: number;
  };
}

export interface PdfExtractionResponse {
  success: boolean;
  result?: any; // PdfExtractionResult
  error?: string;
  suggestions?: string[];
  metadata?: Record<string, string>;
}

/**
 * Main PDF extraction service
 */
export class PdfExtractionService {
  private static instance: PdfExtractionService;
  
  private constructor() {
    // Private constructor for singleton
  }
  
  static getInstance(): PdfExtractionService {
    if (!PdfExtractionService.instance) {
      PdfExtractionService.instance = new PdfExtractionService();
    }
    return PdfExtractionService.instance;
  }
  
  /**
   * Extract PDF data with comprehensive error handling
   */
  async extractPdf(request: PdfExtractionRequest): Promise<PdfExtractionResponse> {
    try {
      console.log(`Starting PDF extraction for: ${request.file.name}`);
      
      // Validate file
      if (!this.isValidPdfFile(request.file)) {
        return {
          success: false,
          error: 'Invalid PDF file. Please upload a valid PDF document.'
        };
      }
      
      // Quick analysis for user feedback
      const quickAnalysis = await analyzePdfQuick(request.file);
      
      // Full extraction
      const extractionResult = await extractPdfData(request.file, {
        extractText: request.options?.extractText ?? true,
        extractImages: request.options?.extractImages ?? false,
        detectTables: request.options?.detectTables ?? true,
        maxPages: request.options?.maxPages ?? 10,
        project: request.project,
        format: 'structured'
      });
      
      // Generate suggestions based on extraction
      const suggestions = getPdfExtractionSuggestions(request.project);
      
      // Update follow-up engine with PDF context
      this.updateFollowUpEngineWithPdfContext(extractionResult, request.project);
      
      return {
        success: true,
        result: extractionResult,
        suggestions,
        metadata: {
          filename: request.file.name,
          size: `${(request.file.size / 1024).toFixed(1)} KB`,
          pages: extractionResult.stats.pageCount.toString(),
          words: extractionResult.stats.textLength.toString(),
          tables: extractionResult.stats.tableCount.toString(),
          images: extractionResult.stats.imageCount.toString(),
          processingTime: `${extractionResult.stats.processingTimeMs}ms`
        }
      };
      
    } catch (error) {
      console.error('PDF extraction service error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during PDF extraction'
      };
    }
  }
  
  /**
   * Validate PDF file
   */
  private isValidPdfFile(file: File): boolean {
    // Check file type
    const validTypes = ['application/pdf', 'application/x-pdf'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      // Also check by extension for some browsers
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith('.pdf')) {
        return false;
      }
    }
    
    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return false;
    }
    
    // Check if file is empty
    if (file.size === 0) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Update follow-up engine with PDF context
   */
  private updateFollowUpEngineWithPdfContext(
    extractionResult: any,
    project?: Project
  ): void {
    try {
      // Create a mock context for the follow-up engine
      const pdfContext: any = {
        type: 'pdf_extraction',
        hasContent: extractionResult.fullText.length > 0,
        hasTables: extractionResult.tables.length > 0,
        hasImages: extractionResult.images.length > 0,
        pageCount: extractionResult.stats.pageCount,
        project: project,
        metadata: extractionResult.metadata
      };
      
      // Create follow-up suggestions based on PDF content
      const lastUserMessage = `Extracted PDF: ${extractionResult.metadata.title || 'Document'}`;
      const lastAssistantMessage = `PDF extraction complete. Found ${extractionResult.stats.pageCount} pages, ${extractionResult.stats.textLength} characters, ${extractionResult.tables.length} tables.`;
      
      // Update follow-ups
      updateFollowUps(pdfContext, lastUserMessage, lastAssistantMessage);
      
    } catch (error) {
      console.warn('Failed to update follow-up engine with PDF context:', error);
    }
  }
  
  /**
   * Extract text only (lightweight version)
   */
  async extractTextOnly(file: File): Promise<string> {
    try {
      const result = await extractPdfData(file, {
        extractText: true,
        extractImages: false,
        detectTables: false,
        maxPages: 5,
        format: 'text'
      });
      
      return result.fullText;
    } catch (error) {
      console.error('Text-only extraction failed:', error);
      return `[Failed to extract text from ${file.name}]`;
    }
  }
  
  /**
   * Batch extract multiple PDFs
   */
  async extractMultiplePdfs(
    files: File[],
    project?: Project
  ): Promise<Array<{ file: File; result: PdfExtractionResponse }>> {
    const results: Array<{ file: File; result: PdfExtractionResponse }> = [];
    
    for (const file of files) {
      try {
        const result = await this.extractPdf({
          file,
          project,
          options: {
            extractText: true,
            extractImages: false,
            detectTables: true,
            maxPages: 5
          }
        });
        
        results.push({ file, result });
      } catch (error) {
        results.push({
          file,
          result: {
            success: false,
            error: error instanceof Error ? error.message : 'Batch extraction failed'
          }
        });
      }
    }
    
    return results;
  }
  
  /**
   * Get extraction suggestions for UI
   */
  getExtractionSuggestions(project?: Project): string[] {
    return getPdfExtractionSuggestions(project);
  }
  
  /**
   * Format extraction result for display
   */
  formatExtractionResult(result: any): {
    summary: string;
    details: Array<{ label: string; value: string }>;
    actions: string[];
  } {
    if (!result || !result.success) {
      return {
        summary: 'PDF extraction failed',
        details: [],
        actions: ['Try again', 'Upload different file']
      };
    }
    
    const { stats, metadata, headings, tables, images } = result.result;
    
    const summary = `Extracted ${stats.pageCount} pages with ${stats.textLength} characters`;
    
    const details: Array<{ label: string; value: string }> = [
      { label: 'Document', value: metadata.title || 'Untitled' },
      { label: 'Pages', value: stats.pageCount.toString() },
      { label: 'Characters', value: stats.textLength.toString() },
      { label: 'Tables', value: stats.tableCount.toString() },
      { label: 'Images', value: stats.imageCount.toString() },
      { label: 'Headings', value: headings.length.toString() }
    ];
    
    if (metadata.author && metadata.author !== 'Unknown') {
      details.push({ label: 'Author', value: metadata.author });
    }
    
    if (metadata.created) {
      details.push({ label: 'Created', value: new Date(metadata.created).toLocaleDateString() });
    }
    
    const actions = [
      'View extracted text',
      'Analyse tables',
      'Save to project notes',
      'Create report from content',
      'Compare with other documents'
    ];
    
    if (tables.length > 0) {
      actions.push('Export tables as CSV');
    }
    
    if (images.length > 0) {
      actions.push('View extracted images');
    }
    
    return { summary, details, actions };
  }
  
  /**
   * Create project note from extraction
   */
  async createNoteFromExtraction(
    extractionResult: any,
    projectId: string,
    noteTitle?: string
  ): Promise<{ success: boolean; noteId?: string; error?: string }> {
    try {
      // This would integrate with the notes system
      // For now, return a mock response
      console.log('Creating note from PDF extraction:', {
        projectId,
        title: noteTitle || extractionResult.metadata.title,
        contentLength: extractionResult.fullText.length
      });
      
      return {
        success: true,
        noteId: 'mock-note-id-' + Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create note'
      };
    }
  }
  
  /**
   * Export extraction to different formats
   */
  async exportExtraction(
    extractionResult: any,
    format: 'json' | 'text' | 'csv' | 'markdown'
  ): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      let data: string;
      
      switch (format) {
        case 'json':
          data = JSON.stringify(extractionResult, null, 2);
          break;
          
        case 'text':
          data = extractionResult.fullText;
          break;
          
        case 'markdown':
          data = this.convertToMarkdown(extractionResult);
          break;
          
        case 'csv':
          data = this.convertTablesToCsv(extractionResult.tables);
          break;
          
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
      
      return { success: true, data };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed'
      };
    }
  }
  
  /**
   * Convert extraction to markdown
   */
  private convertToMarkdown(extractionResult: any): string {
    let markdown = `# ${extractionResult.metadata.title || 'Extracted Document'}\n\n`;
    
    if (extractionResult.metadata.author && extractionResult.metadata.author !== 'Unknown') {
      markdown += `**Author:** ${extractionResult.metadata.author}\n`;
    }
    
    if (extractionResult.metadata.created) {
      markdown += `**Created:** ${new Date(extractionResult.metadata.created).toLocaleDateString()}\n`;
    }
    
    markdown += `**Pages:** ${extractionResult.stats.pageCount}\n\n`;
    
    // Add headings and sections
    if (extractionResult.sections && extractionResult.sections.length > 0) {
      for (const section of extractionResult.sections) {
        markdown += `## ${section.heading}\n\n`;
        markdown += `${section.content}\n\n`;
      }
    } else {
      // Fallback to full text
      markdown += `${extractionResult.fullText}\n\n`;
    }
    
    // Add tables if present
    if (extractionResult.tables && extractionResult.tables.length > 0) {
      markdown += `## Extracted Tables\n\n`;
      
      for (let i = 0; i < extractionResult.tables.length; i++) {
        const table = extractionResult.tables[i];
        markdown += `### Table ${i + 1}\n\n`;
        
        if (table.rows && table.rows.length > 0) {
          // Create markdown table
          const header = table.rows[0];
          const separator = header.map(() => '---').join(' | ');
          
          markdown += `| ${header.join(' | ')} |\n`;
          markdown += `| ${separator} |\n`;
          
          for (let j = 1; j < table.rows.length; j++) {
            markdown += `| ${table.rows[j].join(' | ')} |\n`;
          }
          
          markdown += '\n';
        }
      }
    }
    
    return markdown;
  }
  
  /**
   * Convert tables to CSV
   */
  private convertTablesToCsv(tables: Array<{ rows: string[][] }>): string {
    let csv = '';
    
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      
      if (i > 0) {
        csv += '\n\n';
      }
      
      csv += `Table ${i + 1}\n`;
      
      if (table.rows && table.rows.length > 0) {
        for (const row of table.rows) {
          // Escape CSV special characters
          const escapedRow = row.map(cell => {
            if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          });
          
          csv += escapedRow.join(',') + '\n';
        }
      }
    }
    
    return csv;
  }
}

// Export singleton instance
export const pdfExtractionService = PdfExtractionService.getInstance();