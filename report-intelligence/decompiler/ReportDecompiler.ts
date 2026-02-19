/**
 * Report Decompiler Engine - Phase 2
 * ReportDecompiler Class
 * 
 * Main engine for ingesting reports and breaking them into structured components.
 */

import type { DecompiledReport, DetectedSection, ExtractedMetadata, TerminologyEntry, ComplianceMarker } from './DecompiledReport';
import type { ReportTypeRegistry } from '../registry/ReportTypeRegistry';
import { DecompiledReportStorage } from './storage/DecompiledReportStorage';

export type DecompilerEvent = 
  | 'decompiler:ingested' 
  | 'decompiler:sectionsDetected'
  | 'decompiler:metadataExtracted'
  | 'decompiler:terminologyExtracted'
  | 'decompiler:complianceMarkersExtracted'
  | 'decompiler:structureBuilt'
  | 'decompiler:completed'
  | 'decompiler:error';

export type EventListener = (event: DecompilerEvent, data: any) => void;

export class ReportDecompiler {
  private eventListeners: Map<DecompilerEvent, Set<EventListener>> = new Map();
  private registry?: ReportTypeRegistry;
  private storage: DecompiledReportStorage;
  
  constructor(registry?: ReportTypeRegistry, storageOptions?: Partial<ConstructorParameters<typeof DecompiledReportStorage>[0]>) {
    this.registry = registry;
    this.storage = new DecompiledReportStorage(storageOptions);
    this.initializeEventSystem();
  }

  /**
   * Initialize the event system
   */
  private initializeEventSystem(): void {
    const events: DecompilerEvent[] = [
      'decompiler:ingested',
      'decompiler:sectionsDetected',
      'decompiler:metadataExtracted',
      'decompiler:terminologyExtracted',
      'decompiler:complianceMarkersExtracted',
      'decompiler:structureBuilt',
      'decompiler:completed',
      'decompiler:error'
    ];
    
    for (const event of events) {
      this.eventListeners.set(event, new Set());
    }
  }

  /**
   * Ingest raw report content and decompile it
   */
  async ingest(
    rawText: string, 
    inputFormat: 'text' | 'markdown' | 'pdf_text' | 'pasted' = 'text'
  ): Promise<DecompiledReport> {
    const startTime = Date.now();
    
    try {
      // Create initial decompiled report
      const reportId = crypto.randomUUID();
      const decompiledReport: DecompiledReport = {
        ...this.createDecompiledReport(rawText, inputFormat),
        id: reportId,
        createdAt: new Date(),
        processedAt: new Date(),
      };

      // Emit ingested event
      this.emitEvent('decompiler:ingested', {
        reportId,
        inputFormat,
        textLength: rawText.length,
        wordCount: decompiledReport.metadata.wordCount || 0,
      });

      // Normalize text
      const normalizedText = this.normalizeText(rawText);
      decompiledReport.normalizedText = normalizedText;

      // Run detectors
      await this.runDetectors(decompiledReport);

      // Detect report type using Phase 1 registry
      await this.detectReportType(decompiledReport);

      // Build structure map
      this.buildStructureMap(decompiledReport);

      // Calculate confidence score
      this.calculateConfidence(decompiledReport);

      // Set processing time
      decompiledReport.processingTimeMs = Date.now() - startTime;

      // Emit completion event
      this.emitEvent('decompiler:completed', {
        reportId,
        sectionCount: decompiledReport.sections.length,
        processingTimeMs: decompiledReport.processingTimeMs,
        confidenceScore: decompiledReport.confidenceScore,
      });

      // Store the decompiled report
      await this.storeDecompiledReport(decompiledReport);

      return decompiledReport;

    } catch (error) {
      this.emitEvent('decompiler:error', {
        error: error instanceof Error ? error.message : String(error),
        inputFormat,
        textLength: rawText.length,
      });
      throw error;
    }
  }

  /**
   * Create a new decompiled report structure
   */
  private createDecompiledReport(
    rawText: string,
    inputFormat: 'text' | 'markdown' | 'pdf_text' | 'pasted'
  ): Omit<DecompiledReport, 'id' | 'createdAt' | 'processedAt'> {
    const normalizedText = this.normalizeText(rawText);
    
    return {
      sourceHash: this.generateTextHash(rawText),
      rawText,
      normalizedText,
      detectedReportType: undefined,
      sections: [],
      metadata: {
        keywords: [],
        wordCount: this.countWords(normalizedText),
      },
      terminology: [],
      complianceMarkers: [],
      structureMap: {
        hierarchy: [],
        depth: 0,
        sectionCount: 0,
        averageSectionLength: 0,
        hasAppendices: false,
        hasMethodology: false,
        hasLegalSections: false,
      },
      inputFormat,
      processingTimeMs: 0,
      confidenceScore: 0,
      detectorResults: {
        headings: { count: 0, confidence: 0 },
        sections: { count: 0, confidence: 0 },
        lists: { count: 0, confidence: 0 },
        tables: { count: 0, confidence: 0 },
        metadata: { confidence: 0 },
        terminology: { count: 0, confidence: 0 },
        compliance: { count: 0, confidence: 0 },
        appendices: { count: 0, confidence: 0 },
      },
      warnings: [],
      errors: [],
    };
  }

  /**
   * Run all detectors on the decompiled report
   */
  private async runDetectors(report: DecompiledReport): Promise<void> {
    const detectors = [
      this.detectHeadings.bind(this),
      this.detectSections.bind(this),
      this.detectLists.bind(this),
      this.detectTables.bind(this),
      this.detectMetadata.bind(this),
      this.detectTerminology.bind(this),
      this.detectComplianceMarkers.bind(this),
      this.detectAppendices.bind(this),
    ];

    for (const detector of detectors) {
      try {
        await detector(report);
      } catch (error) {
        report.warnings.push(`Detector error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Detect headings in the text
   */
  private async detectHeadings(report: DecompiledReport): Promise<void> {
    const lines = report.normalizedText.split('\n');
    let headingCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for heading patterns
      if (this.isHeading(line)) {
        const level = this.getHeadingLevel(line);
        const title = this.extractHeadingTitle(line);
        
        const section: DetectedSection = {
          id: `heading-${headingCount}`,
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
        
        report.sections.push(section);
        headingCount++;
      }
    }
    
    report.detectorResults.headings = {
      count: headingCount,
      confidence: headingCount > 0 ? 0.8 : 0.3,
    };
    
    this.emitEvent('decompiler:sectionsDetected', {
      reportId: report.id,
      headingCount,
      sectionCount: report.sections.length,
    });
  }

  /**
   * Detect sections based on headings and content
   */
  private async detectSections(report: DecompiledReport): Promise<void> {
    // This is a simplified implementation
    // In a full implementation, this would group content between headings
    
    const lines = report.normalizedText.split('\n');
    let currentSection: DetectedSection | null = null;
    let sectionCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (this.isHeading(line)) {
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
        
        report.sections.push(currentSection);
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
    
    report.detectorResults.sections = {
      count: sectionCount,
      confidence: sectionCount > 0 ? 0.7 : 0.3,
    };
  }

  /**
   * Detect lists in the text
   */
  private async detectLists(report: DecompiledReport): Promise<void> {
    const lines = report.normalizedText.split('\n');
    let listCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (this.isListLine(line)) {
        listCount++;
        
        // Create a list section
        const section: DetectedSection = {
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
        
        report.sections.push(section);
      }
    }
    
    report.detectorResults.lists = {
      count: listCount,
      confidence: listCount > 0 ? 0.8 : 0.5,
    };
  }

  /**
   * Detect tables in the text (simplified text-based detection)
   */
  private async detectTables(report: DecompiledReport): Promise<void> {
    // Simplified table detection - looks for patterns with multiple columns
    const lines = report.normalizedText.split('\n');
    let tableCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Simple table detection: multiple pipes or consistent column spacing
      if (line.includes('|') && line.split('|').length > 2) {
        tableCount++;
        
        const section: DetectedSection = {
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
        
        report.sections.push(section);
      }
    }
    
    report.detectorResults.tables = {
      count: tableCount,
      confidence: tableCount > 0 ? 0.6 : 0.4,
    };
  }

  /**
   * Extract metadata from the report
   */
  private async detectMetadata(report: DecompiledReport): Promise<void> {
    const lines = report.normalizedText.split('\n');
    const metadata: ExtractedMetadata = {
      ...report.metadata,
      keywords: [],
    };
    
    // Look for common metadata patterns
    for (let i = 0; i < Math.min(lines.length, 20); i++) { // Check first 20 lines
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
    
    report.metadata = metadata;
    report.detectorResults.metadata.confidence = 0.6;
    
    this.emitEvent('decompiler:metadataExtracted', {
      reportId: report.id,
      metadata,
    });
  }

  /**
   * Extract terminology from the report
   */
  private async detectTerminology(report: DecompiledReport): Promise<void> {
    // Simplified terminology extraction
    // In a full implementation, this would use domain-specific dictionaries
    
    const technicalTerms = [
      'arboricultural', 'bs5837', 'rpa', 'dbh', 'canopy', 'root', 'protection',
      'mitigation', 'assessment', 'methodology', 'compliance', 'category',
      'species', 'condition', 'hazard', 'risk', 'inspection', 'survey'
    ];
    
    const terminology: TerminologyEntry[] = [];
    
    for (const term of technicalTerms) {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      const matches = report.normalizedText.match(regex);
      
      if (matches && matches.length > 0) {
        // Find context (first occurrence)
        const firstIndex = report.normalizedText.toLowerCase().indexOf(term);
        const contextStart = Math.max(0, firstIndex - 50);
        const contextEnd = Math.min(report.normalizedText.length, firstIndex + term.length + 50);
        const context = report.normalizedText.substring(contextStart, contextEnd);
        
        terminology.push({
          term,
          context,
          frequency: matches.length,
          category: this.categorizeTerm(term),
          confidence: 0.8,
        });
      }
    }
    
    report.terminology = terminology;
    report.detectorResults.terminology = {
      count: terminology.length,
      confidence: terminology.length > 0 ? 0.7 : 0.3,
    };
    
    this.emitEvent('decompiler:terminologyExtracted', {
      reportId: report.id,
      terminologyCount: terminology.length,
    });
  }

  /**
   * Detect compliance markers in the report
   */
  private async detectComplianceMarkers(report: DecompiledReport): Promise<void> {
    const complianceMarkers: ComplianceMarker[] = [];
    
    // Look for compliance references
    const compliancePatterns = [
      { pattern: /BS\s*5837[:]?\s*2012/i, standard: 'BS5837:2012', type: 'standard' as const },
      { pattern: /Arboricultural\s+Association/i, standard: 'Arboricultural Association', type: 'guideline' as const },
      { pattern: /RPA\s*\(Registered\s+Practitioner\)/i, standard: 'RPA', type: 'requirement' as const },
      { pattern: /ISO\s*14001/i, standard: 'ISO14001', type: 'standard' as const },
      { pattern: /Tree\s+Preservation\s+Order/i, standard: 'TPO', type: 'regulation' as const },
      { pattern: /Conservation\s+Area/i, standard: 'Conservation Area', type: 'regulation' as const },
    ];
    
    for (const { pattern, standard, type } of compliancePatterns) {
      const matches = report.normalizedText.match(pattern);
      
      if (matches && matches.length > 0) {
        // Find context
        const firstIndex = report.normalizedText.search(pattern);
        const contextStart = Math.max(0, firstIndex - 50);
        const contextEnd = Math.min(report.normalizedText.length, firstIndex + standard.length + 50);
        const context = report.normalizedText.substring(contextStart, contextEnd);
        
        complianceMarkers.push({
          type,
          text: matches[0],
          standard,
          confidence: 0.8,
        });
      }
    }
    
    report.complianceMarkers = complianceMarkers;
    report.detectorResults.compliance = {
      count: complianceMarkers.length,
      confidence: complianceMarkers.length > 0 ? 0.7 : 0.3,
    };
    
    this.emitEvent('decompiler:complianceMarkersExtracted', {
      reportId: report.id,
      complianceCount: complianceMarkers.length,
    });
  }

  /**
   * Detect appendices in the report
   */
  private async detectAppendices(report: DecompiledReport): Promise<void> {
    const lines = report.normalizedText.split('\n');
    let appendixCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim().toLowerCase();
      
      if (line.includes('appendix') || line.includes('annex')) {
        appendixCount++;
        
        const section: DetectedSection = {
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
        
        report.sections.push(section);
      }
    }
    
    report.detectorResults.appendices = {
      count: appendixCount,
      confidence: appendixCount > 0 ? 0.8 : 0.5,
    };
  }

  /**
   * Detect report type using Phase 1 registry
   */
  private async detectReportType(report: DecompiledReport): Promise<void> {
    if (!this.registry) {
      return;
    }
    
    try {
      // Get all report types from registry
      const reportTypes = this.registry.getAllTypes();
      
      // Simple detection based on keywords in text
      const text = report.normalizedText.toLowerCase();
      let bestMatch: { id: string; score: number } | null = null;
      
      for (const reportType of reportTypes) {
        let score = 0;
        
        // Check for report type name in text
        if (reportType.name && text.includes(reportType.name.toLowerCase())) {
          score += 10;
        }
        
        // Check for report type ID in text
        if (text.includes(reportType.id.toLowerCase())) {
          score += 15;
        }
        
        // Check for compliance markers
        for (const marker of report.complianceMarkers) {
          if (marker.standard && reportType.complianceRules?.some((rule: any) =>
            rule.standard.toLowerCase().includes(marker.standard?.toLowerCase() || '')
          )) {
            score += 5;
          }
        }
        
        // Check for section matches
        const allSections = [
          ...(reportType.requiredSections || []),
          ...(reportType.optionalSections || []),
          ...(reportType.conditionalSections || [])
        ];
        
        for (const section of report.sections) {
          if (allSections.some((def: any) =>
            def.title.toLowerCase().includes(section.title.toLowerCase()) ||
            section.title.toLowerCase().includes(def.title.toLowerCase())
          )) {
            score += 2;
          }
        }
        
        if (score > 0 && (!bestMatch || score > bestMatch.score)) {
          bestMatch = { id: reportType.id, score };
        }
      }
      
      if (bestMatch && bestMatch.score >= 5) {
        report.detectedReportType = bestMatch.id;
        console.log(`[ReportDecompiler] Detected report type: ${bestMatch.id} (score: ${bestMatch.score})`);
      }
    } catch (error) {
      console.warn('[ReportDecompiler] Error detecting report type:', error);
    }
  }

  /**
   * Build structure map from detected sections
   */
  private buildStructureMap(report: DecompiledReport): void {
    const sections = report.sections;
    const hierarchy: Array<{ id: string; type: string; level: number; title: string; children: number[] }> = [];
    let depth = 0;
    let hasAppendices = false;
    let hasMethodology = false;
    let hasLegalSections = false;
    
    // Build hierarchy based on section levels
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      
      if (section.level > depth) {
        depth = section.level;
      }
      
      if (section.type === 'appendix') {
        hasAppendices = true;
      }
      
      if (section.title.toLowerCase().includes('methodology')) {
        hasMethodology = true;
      }
      
      if (section.title.toLowerCase().includes('legal') ||
          section.title.toLowerCase().includes('compliance') ||
          section.title.toLowerCase().includes('regulation')) {
        hasLegalSections = true;
      }
      
      // Add to hierarchy
      hierarchy.push({
        id: section.id,
        type: section.type,
        level: section.level,
        title: section.title,
        children: [], // We'd need to build parent-child relationships
      });
    }
    
    // Calculate average section length
    const totalLength = sections.reduce((sum, section) => {
      return sum + (section.metadata.wordCount || 0);
    }, 0);
    
    const averageSectionLength = sections.length > 0 ? totalLength / sections.length : 0;
    
    report.structureMap = {
      hierarchy,
      depth,
      sectionCount: sections.length,
      averageSectionLength,
      hasAppendices,
      hasMethodology,
      hasLegalSections,
    };
    
    this.emitEvent('decompiler:structureBuilt', {
      reportId: report.id,
      structureMap: report.structureMap,
    });
  }

  /**
   * Calculate confidence score for the decompilation
   */
  private calculateConfidence(report: DecompiledReport): void {
    const weights = {
      headings: 0.2,
      sections: 0.3,
      metadata: 0.15,
      terminology: 0.1,
      compliance: 0.15,
      appendices: 0.1,
    };
    
    const scores = {
      headings: report.detectorResults.headings.confidence,
      sections: report.detectorResults.sections.confidence,
      metadata: report.detectorResults.metadata.confidence,
      terminology: report.detectorResults.terminology.confidence,
      compliance: report.detectorResults.compliance.confidence,
      appendices: report.detectorResults.appendices.confidence,
    };
    
    let totalConfidence = 0;
    let totalWeight = 0;
    
    for (const [key, weight] of Object.entries(weights)) {
      const score = scores[key as keyof typeof scores];
      totalConfidence += score * weight;
      totalWeight += weight;
    }
    
    // Normalize to 0-1 range
    report.confidenceScore = totalWeight > 0 ? totalConfidence / totalWeight : 0;
  }

  /**
   * Store decompiled report to storage
   */
  private async storeDecompiledReport(report: DecompiledReport): Promise<void> {
    await this.storage.storeReport(report);
  }

  /**
   * Emit an event to all listeners
   */
  private emitEvent(event: DecompilerEvent, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event, data);
        } catch (error) {
          console.error(`[ReportDecompiler] Error in event listener for ${event}:`, error);
        }
      }
    }
  }

  /**
   * Add event listener
   */
  on(event: DecompilerEvent, listener: EventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.add(listener);
    }
  }

  /**
   * Remove event listener
   */
  off(event: DecompilerEvent, listener: EventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Utility: Normalize text
   */
  private normalizeText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')           // Normalize line endings
      .replace(/\t/g, '    ')           // Convert tabs to spaces
      .replace(/[ \t]+$/gm, '')         // Trim trailing whitespace on each line
      .replace(/^\s+|\s+$/g, '')        // Trim leading/trailing whitespace
      .replace(/\n{3,}/g, '\n\n');      // Normalize multiple newlines
  }

  /**
   * Utility: Generate text hash
   */
  private generateTextHash(text: string): string {
    // Simple hash for demonstration
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Utility: Count words in text
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Utility: Check if line is a heading
   */
  private isHeading(line: string): boolean {
    // Check for heading patterns
    return /^#{1,6}\s/.test(line) ||           // Markdown headings
           /^[A-Z][A-Z\s]{10,}$/.test(line) || // ALL CAPS headings
           /^[IVX]+\.\s/.test(line) ||         // Roman numeral headings
           /^\d+\.\d+\s/.test(line);           // Numbered headings (1.1, 2.3, etc.)
  }

  /**
   * Utility: Get heading level
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
   * Utility: Extract heading title
   */
  private extractHeadingTitle(line: string): string {
    // Remove markdown hashes
    let title = line.replace(/^#{1,6}\s/, '');
    
    // Remove numbering patterns
    title = title.replace(/^[IVX]+\.\s/, '');
    title = title.replace(/^\d+\.\d+\s/, '');
    
    return title.trim();
  }

  /**
   * Utility: Check if line is a list item
   */
  private isListLine(line: string): boolean {
    return /^[\-\*•]\s/.test(line.trim()) ||    // Bullet lists
           /^\d+[\.\)]\s/.test(line.trim());    // Numbered lists
  }

  /**
   * Utility: Categorize terminology term
   */
  private categorizeTerm(term: string): 'technical' | 'legal' | 'compliance' | 'species' | 'measurement' | 'general' {
    const technicalTerms = ['arboricultural', 'methodology', 'assessment', 'inspection', 'survey'];
    const legalTerms = ['legal', 'regulation', 'statute'];
    const complianceTerms = ['compliance', 'standard', 'requirement'];
    const speciesTerms = ['species', 'tree', 'canopy', 'root'];
    const measurementTerms = ['dbh', 'height', 'diameter', 'measurement'];
    
    if (technicalTerms.some(t => term.includes(t))) return 'technical';
    if (legalTerms.some(t => term.includes(t))) return 'legal';
    if (complianceTerms.some(t => term.includes(t))) return 'compliance';
    if (speciesTerms.some(t => term.includes(t))) return 'species';
    if (measurementTerms.some(t => term.includes(t))) return 'measurement';
    
    return 'general';
  }
}