/**
 * Phase 14 Integration - PDF Parsing to Report Intelligence System
 * 
 * Integrates PDF parsing as a subsystem of the Phase 14 Report Intelligence System.
 * Registers PDF parsing subsystem, emits parsing events, and supports
 * the full ingestion pipeline.
 */

import type {
  PDFParsingOptions,
  PDFParsingResult,
  PDFPageData,
} from '../types';

import { PDFParser } from '../PDFParser';
import { Phase2Integration } from './Phase2Integration';
import { Phase15Integration } from './Phase15Integration';

// Import Phase 14 types (simulated - in real implementation would import actual types)
interface SystemEvent {
  type: string;
  data: any;
  timestamp: Date;
  source: string;
}

interface EventEmitter {
  emit(event: SystemEvent): void;
  on(eventType: string, callback: (event: SystemEvent) => void): void;
}

interface ReportIntelligenceSystem {
  registerSubsystem(name: string, subsystem: any): void;
  getSubsystem(name: string): any;
  getEventEmitter(): EventEmitter;
  getConfig(): any;
}

export class Phase14Integration {
  private system: ReportIntelligenceSystem | null = null;
  private pdfParser: PDFParser | null = null;
  private phase2Integration: Phase2Integration | null = null;
  private phase15Integration: Phase15Integration | null = null;
  
  private isInitialized = false;
  private processingQueue: Array<{
    id: string;
    pdfBuffer: Buffer;
    options: PDFParsingOptions;
    callback: (result: PDFParsingResult) => void;
  }> = [];
  
  private stats = {
    totalProcessed: 0,
    totalSuccess: 0,
    totalFailed: 0,
    totalBytesProcessed: 0,
    averageProcessingTime: 0,
  };

  constructor() {
    console.log('Phase 14 Integration initialized');
  }

  /**
   * Initialize integration with Phase 14 system
   */
  async initialize(system: ReportIntelligenceSystem): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('Initializing Phase 14 Integration...');
    
    this.system = system;
    
    // Initialize PDF parser
    this.pdfParser = new PDFParser();
    await this.pdfParser.initialize();
    
    // Initialize Phase 2 integration
    this.phase2Integration = new Phase2Integration();
    
    // Initialize Phase 15 integration
    this.phase15Integration = new Phase15Integration();
    
    // Register as subsystem
    system.registerSubsystem('pdfParsing', this);
    
    // Set up event listeners
    this.setupEventListeners();
    
    this.isInitialized = true;
    console.log('Phase 14 Integration initialized successfully');
  }

  /**
   * Set up event listeners for system events
   */
  private setupEventListeners(): void {
    if (!this.system) return;
    
    const emitter = this.system.getEventEmitter();
    
    // Listen for PDF ingestion requests
    emitter.on('pdf:ingest', (event: SystemEvent) => {
      this.handleIngestRequest(event.data);
    });
    
    // Listen for system shutdown
    emitter.on('system:shutdown', () => {
      this.cleanup();
    });
    
    console.log('Phase 14 Integration event listeners set up');
  }

  /**
   * Handle PDF ingestion request
   */
  private async handleIngestRequest(data: {
    id: string;
    pdfBuffer: Buffer;
    filename?: string;
    options?: Partial<PDFParsingOptions>;
  }): Promise<void> {
    if (!this.pdfParser) {
      this.emitEvent('pdf:error', {
        id: data.id,
        error: 'PDF parser not initialized',
      });
      return;
    }

    console.log(`Processing PDF ingestion request: ${data.id}`);
    
    try {
      // Parse PDF
      const startTime = Date.now();
      const result = await this.pdfParser.parseFromBuffer(
        data.pdfBuffer,
        data.filename
      );
      const processingTime = Date.now() - startTime;
      
      // Update statistics
      this.updateStats(result, processingTime, data.pdfBuffer.length);
      
      // Emit completion event
      this.emitEvent('pdf:parsed', {
        id: data.id,
        result,
        processingTime,
        stats: this.stats,
      });
      
      // Process through Phase 2 if integration is available
      if (this.phase2Integration && result.success) {
        await this.processThroughPhase2(data.id, result);
      }
      
      // Process through Phase 15 if integration is available
      if (this.phase15Integration && result.success) {
        await this.processThroughPhase15(data.id, result);
      }
      
      console.log(`PDF ingestion completed: ${data.id}`);
    } catch (error) {
      console.error(`PDF ingestion failed: ${data.id}`, error);
      
      this.emitEvent('pdf:error', {
        id: data.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      this.stats.totalFailed++;
    }
  }

  /**
   * Process PDF results through Phase 2 decompiler
   */
  private async processThroughPhase2(
    id: string,
    pdfResult: PDFParsingResult
  ): Promise<void> {
    if (!this.phase2Integration) return;
    
    console.log(`Processing PDF ${id} through Phase 2 decompiler...`);
    
    try {
      // Get Phase 2 decompiler from system
      const decompiler = this.system?.getSubsystem('reportDecompiler');
      if (!decompiler) {
        console.warn('Phase 2 decompiler not available in system');
        return;
      }
      
      this.phase2Integration.setDecompiler(decompiler);
      
      const decompiledReport = await this.phase2Integration.processPDFResults(
        pdfResult,
        {
          includeLayoutCues: true,
          includeImages: true,
          enhanceWithMetadata: true,
        }
      );
      
      if (decompiledReport) {
        this.emitEvent('pdf:phase2Processed', {
          id,
          decompiledReport,
        });
        
        console.log(`PDF ${id} successfully processed through Phase 2`);
      }
    } catch (error) {
      console.error(`Phase 2 processing failed for PDF ${id}:`, error);
    }
  }

  /**
   * Process PDF results through Phase 15 rendering engine
   */
  private async processThroughPhase15(
    id: string,
    pdfResult: PDFParsingResult
  ): Promise<void> {
    if (!this.phase15Integration) return;
    
    console.log(`Processing PDF ${id} through Phase 15 rendering engine...`);
    
    try {
      // Get Phase 15 rendering engine from system
      const renderingEngine = this.system?.getSubsystem('visualRendering');
      if (!renderingEngine) {
        console.warn('Phase 15 rendering engine not available in system');
        return;
      }
      
      this.phase15Integration.setRenderingEngine(renderingEngine);
      
      // Convert to document content
      const documentContent = await this.phase15Integration.convertToDocumentContent(
        pdfResult,
        {
          preserveLayout: true,
          includeImages: true,
          includeTables: true,
          extractStyles: true,
        }
      );
      
      this.emitEvent('pdf:phase15Converted', {
        id,
        documentContent,
      });
      
      console.log(`PDF ${id} successfully converted for Phase 15 rendering`);
    } catch (error) {
      console.error(`Phase 15 processing failed for PDF ${id}:`, error);
    }
  }

  /**
   * Update statistics
   */
  private updateStats(
    result: PDFParsingResult,
    processingTime: number,
    fileSize: number
  ): void {
    this.stats.totalProcessed++;
    
    if (result.success) {
      this.stats.totalSuccess++;
    } else {
      this.stats.totalFailed++;
    }
    
    this.stats.totalBytesProcessed += fileSize;
    
    // Update average processing time
    const previousTotalTime = this.stats.averageProcessingTime * (this.stats.totalProcessed - 1);
    this.stats.averageProcessingTime = (previousTotalTime + processingTime) / this.stats.totalProcessed;
  }

  /**
   * Emit system event
   */
  private emitEvent(type: string, data: any): void {
    if (!this.system) return;
    
    const event: SystemEvent = {
      type,
      data,
      timestamp: new Date(),
      source: 'pdfParsing',
    };
    
    this.system.getEventEmitter().emit(event);
  }

  /**
   * Parse PDF file
   */
  async parsePDF(
    pdfBuffer: Buffer,
    filename?: string,
    options?: Partial<PDFParsingOptions>
  ): Promise<PDFParsingResult> {
    if (!this.pdfParser) {
      throw new Error('PDF parser not initialized');
    }

    console.log(`Parsing PDF: ${filename || 'unknown'}`);
    
    const startTime = Date.now();
    const result = await this.pdfParser.parseFromBuffer(pdfBuffer, filename);
    const processingTime = Date.now() - startTime;
    
    // Update statistics
    this.updateStats(result, processingTime, pdfBuffer.length);
    
    // Emit event
    this.emitEvent('pdf:parsed', {
      id: `manual-${Date.now()}`,
      result,
      processingTime,
      filename,
    });
    
    return result;
  }

  /**
   * Parse PDF from file path
   */
  async parsePDFFromFile(
    filePath: string,
    options?: Partial<PDFParsingOptions>
  ): Promise<PDFParsingResult> {
    if (!this.pdfParser) {
      throw new Error('PDF parser not initialized');
    }

    console.log(`Parsing PDF from file: ${filePath}`);
    
    const startTime = Date.now();
    const result = await this.pdfParser.parseFromFile(filePath);
    const processingTime = Date.now() - startTime;
    
    // Update statistics
    // Note: file size would need to be read from file system
    this.updateStats(result, processingTime, 0);
    
    // Emit event
    this.emitEvent('pdf:parsed', {
      id: `file-${Date.now()}`,
      result,
      processingTime,
      filePath,
    });
    
    return result;
  }

  /**
   * Get PDF parsing statistics
   */
  getStatistics(): typeof this.stats {
    return { ...this.stats };
  }

  /**
   * Get integration status
   */
  getStatus(): {
    initialized: boolean;
    parserAvailable: boolean;
    phase2Integration: boolean;
    phase15Integration: boolean;
    queueLength: number;
  } {
    return {
      initialized: this.isInitialized,
      parserAvailable: !!this.pdfParser,
      phase2Integration: !!this.phase2Integration,
      phase15Integration: !!this.phase15Integration,
      queueLength: this.processingQueue.length,
    };
  }

  /**
   * Get PDF parser instance
   */
  getPDFParser(): PDFParser | null {
    return this.pdfParser;
  }

  /**
   * Get Phase 2 integration instance
   */
  getPhase2Integration(): Phase2Integration | null {
    return this.phase2Integration;
  }

  /**
   * Get Phase 15 integration instance
   */
  getPhase15Integration(): Phase15Integration | null {
    return this.phase15Integration;
  }

  /**
   * Update PDF parsing options
   */
  updateOptions(newOptions: Partial<PDFParsingOptions>): void {
    if (this.pdfParser) {
      this.pdfParser.updateOptions(newOptions);
      console.log('PDF parsing options updated');
    }
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    console.log('Cleaning up Phase 14 Integration resources...');
    
    // Clean up PDF parser
    if (this.pdfParser) {
      await this.pdfParser.cleanup();
      this.pdfParser = null;
    }
    
    // Clean up integrations
    if (this.phase2Integration) {
      await this.phase2Integration.cleanup();
      this.phase2Integration = null;
    }
    
    if (this.phase15Integration) {
      await this.phase15Integration.cleanup();
      this.phase15Integration = null;
    }
    
    // Clear queue
    this.processingQueue = [];
    
    this.isInitialized = false;
    this.system = null;
    
    console.log('Phase 14 Integration cleanup completed');
  }
}