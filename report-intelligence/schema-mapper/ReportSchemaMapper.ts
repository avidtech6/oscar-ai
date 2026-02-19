/**
 * Report Schema Mapper - Phase 3
 * ReportSchemaMapper Class
 * 
 * Main engine for mapping decompiled report components to internal data structures.
 */

import type { DecompiledReport, DetectedSection, TerminologyEntry, ComplianceMarker } from '../decompiler/DecompiledReport';
import type { ReportTypeRegistry } from '../registry/ReportTypeRegistry';
import type { ReportTypeDefinition, ReportSectionDefinition } from '../registry/ReportTypeDefinition';
import { 
  SchemaMappingResult, 
  MappedField, 
  UnmappedSection, 
  MissingRequiredSection, 
  ExtraSection, 
  UnknownTerminology, 
  SchemaGap,
  createSchemaMappingResult,
  calculateMappingCoverage,
  calculateCompletenessScore,
  generateMappingResultId
} from './SchemaMappingResult';

export type SchemaMapperEvent = 
  | 'schemaMapper:started'
  | 'schemaMapper:reportTypeIdentified'
  | 'schemaMapper:sectionsMapped'
  | 'schemaMapper:terminologyMapped'
  | 'schemaMapper:missingSectionsDetected'
  | 'schemaMapper:extraSectionsDetected'
  | 'schemaMapper:schemaGapsDetected'
  | 'schemaMapper:completed'
  | 'schemaMapper:error';

export type EventListener = (event: SchemaMapperEvent, data: any) => void;

export class ReportSchemaMapper {
  private eventListeners: Map<SchemaMapperEvent, Set<EventListener>> = new Map();
  private registry?: ReportTypeRegistry;
  private mapperVersion = '1.0.0';
  
  constructor(registry?: ReportTypeRegistry) {
    this.registry = registry;
    this.initializeEventSystem();
  }

  /**
   * Initialize the event system
   */
  private initializeEventSystem(): void {
    const events: SchemaMapperEvent[] = [
      'schemaMapper:started',
      'schemaMapper:reportTypeIdentified',
      'schemaMapper:sectionsMapped',
      'schemaMapper:terminologyMapped',
      'schemaMapper:missingSectionsDetected',
      'schemaMapper:extraSectionsDetected',
      'schemaMapper:schemaGapsDetected',
      'schemaMapper:completed',
      'schemaMapper:error'
    ];
    
    for (const event of events) {
      this.eventListeners.set(event, new Set());
    }
  }

  /**
   * Map a decompiled report to internal schema
   */
  async map(
    decompiledReport: DecompiledReport
  ): Promise<SchemaMappingResult> {
    const startTime = Date.now();
    
    try {
      // Create initial mapping result
      const mappingResultId = generateMappingResultId();
      const mappingResult: SchemaMappingResult = {
        ...createSchemaMappingResult(decompiledReport.id, decompiledReport.detectedReportType),
        id: mappingResultId,
        createdAt: new Date(),
        processedAt: new Date(),
      };

      // Emit started event
      this.emitEvent('schemaMapper:started', {
        mappingResultId,
        decompiledReportId: decompiledReport.id,
        sectionCount: decompiledReport.sections.length,
      });

      // Identify report type (use detected type or try to identify)
      const reportType = await this.identifyReportType(decompiledReport);
      if (reportType) {
        mappingResult.reportTypeId = reportType.id;
        mappingResult.reportTypeName = reportType.name;
        mappingResult.reportTypeDefinitionSnapshot = this.createReportTypeSnapshot(reportType);
        
        this.emitEvent('schemaMapper:reportTypeIdentified', {
          mappingResultId,
          reportTypeId: reportType.id,
          reportTypeName: reportType.name,
        });
      }

      // Map sections to schema
      const mappedFields = await this.mapSections(decompiledReport, reportType);
      mappingResult.mappedFields = mappedFields;

      this.emitEvent('schemaMapper:sectionsMapped', {
        mappingResultId,
        mappedFieldCount: mappedFields.length,
        sectionCount: decompiledReport.sections.length,
      });

      // Map terminology
      const unknownTerminology = await this.mapTerminology(decompiledReport, reportType);
      mappingResult.unknownTerminology = unknownTerminology;

      this.emitEvent('schemaMapper:terminologyMapped', {
        mappingResultId,
        unknownTerminologyCount: unknownTerminology.length,
        totalTerminologyCount: decompiledReport.terminology.length,
      });

      // Detect missing required sections
      const missingRequiredSections = await this.detectMissingRequiredSections(decompiledReport, reportType);
      mappingResult.missingRequiredSections = missingRequiredSections;

      this.emitEvent('schemaMapper:missingSectionsDetected', {
        mappingResultId,
        missingRequiredSectionCount: missingRequiredSections.length,
      });

      // Detect extra sections
      const extraSections = await this.detectExtraSections(decompiledReport, reportType);
      mappingResult.extraSections = extraSections;

      this.emitEvent('schemaMapper:extraSectionsDetected', {
        mappingResultId,
        extraSectionCount: extraSections.length,
      });

      // Detect schema gaps
      const schemaGaps = await this.detectSchemaGaps(decompiledReport, reportType, {
        mappedFields,
        missingRequiredSections,
        extraSections,
        unknownTerminology,
      });
      mappingResult.schemaGaps = schemaGaps;

      this.emitEvent('schemaMapper:schemaGapsDetected', {
        mappingResultId,
        schemaGapCount: schemaGaps.length,
      });

      // Calculate confidence score
      mappingResult.confidenceScore = this.computeConfidenceScore(mappingResult);
      
      // Calculate mapping coverage
      mappingResult.mappingCoverage = calculateMappingCoverage(
        mappedFields,
        decompiledReport.sections.length
      );
      
      // Calculate completeness score
      mappingResult.completenessScore = calculateCompletenessScore(
        missingRequiredSections,
        reportType ? reportType.requiredSections.length : 0
      );

      // Set processing time
      mappingResult.processingTimeMs = Date.now() - startTime;

      // Store decompiled report snapshot
      mappingResult.decompiledReportSnapshot = this.createDecompiledReportSnapshot(decompiledReport);

      // Emit completion event
      this.emitEvent('schemaMapper:completed', {
        mappingResultId,
        confidenceScore: mappingResult.confidenceScore,
        mappingCoverage: mappingResult.mappingCoverage,
        completenessScore: mappingResult.completenessScore,
        processingTimeMs: mappingResult.processingTimeMs,
      });

      return mappingResult;

    } catch (error) {
      this.emitEvent('schemaMapper:error', {
        error: error instanceof Error ? error.message : String(error),
        decompiledReportId: decompiledReport.id,
      });
      throw error;
    }
  }

  /**
   * Identify report type for the decompiled report
   */
  private async identifyReportType(
    decompiledReport: DecompiledReport
  ): Promise<ReportTypeDefinition | null> {
    if (!this.registry) {
      return null;
    }

    // Use detected report type from decompiler if available
    if (decompiledReport.detectedReportType) {
      try {
        const reportType = this.registry.getType(decompiledReport.detectedReportType);
        if (reportType) {
          return reportType;
        }
      } catch (error) {
        console.warn('[ReportSchemaMapper] Error getting detected report type:', error);
      }
    }

    // Try to identify report type based on content
    const reportTypes = this.registry.getAllTypes();
    let bestMatch: { type: ReportTypeDefinition; score: number } | null = null;
    
    for (const reportType of reportTypes) {
      const score = this.calculateReportTypeMatchScore(decompiledReport, reportType);
      
      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { type: reportType, score };
      }
    }

    // Return best match if score is above threshold
    if (bestMatch && bestMatch.score >= 10) {
      return bestMatch.type;
    }

    return null;
  }

  /**
   * Calculate match score between decompiled report and report type
   */
  private calculateReportTypeMatchScore(
    decompiledReport: DecompiledReport,
    reportType: ReportTypeDefinition
  ): number {
    let score = 0;
    const text = decompiledReport.normalizedText.toLowerCase();

    // Check for report type name in text
    if (reportType.name && text.includes(reportType.name.toLowerCase())) {
      score += 15;
    }

    // Check for report type ID in text
    if (text.includes(reportType.id.toLowerCase())) {
      score += 20;
    }

    // Check for compliance markers
    for (const marker of decompiledReport.complianceMarkers) {
      if (marker.standard && reportType.complianceRules?.some(rule =>
        rule.standard.toLowerCase().includes(marker.standard?.toLowerCase() || '')
      )) {
        score += 10;
      }
    }

    // Check for section matches
    const allSections = [
      ...(reportType.requiredSections || []),
      ...(reportType.optionalSections || []),
      ...(reportType.conditionalSections || [])
    ];

    for (const section of decompiledReport.sections) {
      for (const sectionDef of allSections) {
        if (section.title.toLowerCase().includes(sectionDef.name.toLowerCase()) ||
            sectionDef.name.toLowerCase().includes(section.title.toLowerCase())) {
          score += 5;
          break;
        }
      }
    }

    // Check for terminology matches
    for (const term of decompiledReport.terminology) {
      if (reportType.tags?.some(tag => 
        tag.toLowerCase().includes(term.term.toLowerCase()) ||
        term.term.toLowerCase().includes(tag.toLowerCase())
      )) {
        score += 3;
      }
    }

    return score;
  }

  /**
   * Map sections from decompiled report to schema fields
   */
  private async mapSections(
    decompiledReport: DecompiledReport,
    reportType: ReportTypeDefinition | null
  ): Promise<MappedField[]> {
    const mappedFields: MappedField[] = [];
    
    for (const section of decompiledReport.sections) {
      const mappedField = await this.mapSectionToField(section, reportType);
      if (mappedField) {
        mappedFields.push(mappedField);
      }
    }

    return mappedFields;
  }

  /**
   * Map a single section to a schema field
   */
  private async mapSectionToField(
    section: DetectedSection,
    reportType: ReportTypeDefinition | null
  ): Promise<MappedField | null> {
    // If no report type, use generic mapping
    if (!reportType) {
      return this.mapSectionToGenericField(section);
    }

    // Try to match with report type sections
    const allSections = [
      ...(reportType.requiredSections || []),
      ...(reportType.optionalSections || []),
      ...(reportType.conditionalSections || [])
    ];

    let bestMatch: { sectionDef: ReportSectionDefinition; confidence: number } | null = null;
    
    for (const sectionDef of allSections) {
      const confidence = this.calculateSectionMatchConfidence(section, sectionDef);
      
      if (confidence > 0.3 && (!bestMatch || confidence > bestMatch.confidence)) {
        bestMatch = { sectionDef, confidence };
      }
    }

    if (bestMatch && bestMatch.confidence >= 0.5) {
      return {
        fieldId: bestMatch.sectionDef.id,
        fieldName: bestMatch.sectionDef.name,
        fieldType: 'section',
        sourceSectionId: section.id,
        sourceSectionTitle: section.title,
        mappedValue: section.content,
        mappingConfidence: bestMatch.confidence,
        mappingMethod: bestMatch.confidence >= 0.8 ? 'exact_match' : 'fuzzy_match',
        notes: `Mapped from section "${section.title}"`,
      };
    }

    // If no good match found, use generic mapping
    return this.mapSectionToGenericField(section);
  }

  /**
   * Map section to generic field when no report type match
   */
  private mapSectionToGenericField(section: DetectedSection): MappedField {
    const fieldId = `generic_${section.type}_${section.id.replace(/[^a-z0-9]/gi, '_')}`;
    
    return {
      fieldId,
      fieldName: section.title || `Untitled ${section.type}`,
      fieldType: this.determineFieldType(section),
      sourceSectionId: section.id,
      sourceSectionTitle: section.title,
      mappedValue: section.content,
      mappingConfidence: 0.4,
      mappingMethod: 'inferred',
      notes: `Generic mapping for ${section.type} section`,
    };
  }

  /**
   * Calculate confidence score for section matching
   */
  private calculateSectionMatchConfidence(
    section: DetectedSection,
    sectionDef: ReportSectionDefinition
  ): number {
    let confidence = 0;
    
    // Exact name match
    if (section.title.toLowerCase() === sectionDef.name.toLowerCase()) {
      confidence += 0.8;
    }
    
    // Partial name match
    else if (section.title.toLowerCase().includes(sectionDef.name.toLowerCase()) ||
             sectionDef.name.toLowerCase().includes(section.title.toLowerCase())) {
      confidence += 0.6;
    }
    
    // Check for keywords in description
    if (sectionDef.description) {
      const descWords = sectionDef.description.toLowerCase().split(/\s+/);
      const titleWords = section.title.toLowerCase().split(/\s+/);
      
      const commonWords = descWords.filter(word => 
        titleWords.includes(word) && word.length > 3
      );
      
      if (commonWords.length > 0) {
        confidence += 0.2 * Math.min(commonWords.length, 3);
      }
    }
    
    // Check section type compatibility
    if (sectionDef.template?.includes('heading') && section.type === 'heading') {
      confidence += 0.1;
    }
    
    // Cap at 1.0
    return Math.min(confidence, 1.0);
  }

  /**
   * Determine field type based on section content
   */
  private determineFieldType(section: DetectedSection): MappedField['fieldType'] {
    const content = section.content.toLowerCase();
    
    if (section.type === 'table') return 'object';
    if (section.type === 'list') return 'array';
    if (/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(content)) return 'date';
    if (/^\d+(\.\d+)?$/.test(section.content.trim())) return 'number';
    if (/^(yes|no|true|false)$/i.test(section.content.trim())) return 'boolean';
    
    return 'text';
  }

  /**
   * Map terminology from decompiled report
   */
  private async mapTerminology(
    decompiledReport: DecompiledReport,
    reportType: ReportTypeDefinition | null
  ): Promise<UnknownTerminology[]> {
    const unknownTerminology: UnknownTerminology[] = [];
    
    for (const termEntry of decompiledReport.terminology) {
      unknownTerminology.push({
        term: termEntry.term,
        context: termEntry.context,
        frequency: termEntry.frequency,
        category: termEntry.category,
        suggestedDefinition: undefined,
        suggestedCategory: termEntry.category,
        confidence: termEntry.confidence,
      });
    }
    
    return unknownTerminology;
  }

  /**
   * Detect missing required sections according to report type definition
   */
  private async detectMissingRequiredSections(
    decompiledReport: DecompiledReport,
    reportType: ReportTypeDefinition | null
  ): Promise<MissingRequiredSection[]> {
    const missingSections: MissingRequiredSection[] = [];
    
    if (!reportType) {
      return missingSections;
    }
    
    for (const requiredSection of reportType.requiredSections) {
      const found = decompiledReport.sections.some(section =>
        this.calculateSectionMatchConfidence(section, requiredSection) >= 0.5
      );
      
      if (!found) {
        missingSections.push({
          sectionId: requiredSection.id,
          sectionName: requiredSection.name,
          description: requiredSection.description,
          required: true,
          reason: 'not_present',
          suggestedContent: requiredSection.template,
          aiGuidance: requiredSection.aiGuidance,
        });
      }
    }
    
    return missingSections;
  }

  /**
   * Detect extra sections not defined in report type definition
   */
  private async detectExtraSections(
    decompiledReport: DecompiledReport,
    reportType: ReportTypeDefinition | null
  ): Promise<ExtraSection[]> {
    const extraSections: ExtraSection[] = [];
    
    if (!reportType) {
      // If no report type, all sections are considered "extra" (not mapped to known schema)
      for (const section of decompiledReport.sections) {
        extraSections.push({
          sectionId: section.id,
          sectionTitle: section.title,
          sectionType: section.type,
          contentPreview: section.content.substring(0, 100) + (section.content.length > 100 ? '...' : ''),
          potentialPurpose: this.inferSectionPurpose(section),
          suggestedAction: 'flag_for_review',
          confidence: 0.5,
        });
      }
      return extraSections;
    }
    
    // Check each decompiled section
    for (const section of decompiledReport.sections) {
      let isDefined = false;
      
      for (const sectionDef of [
        ...reportType.requiredSections,
        ...reportType.optionalSections,
        ...reportType.conditionalSections
      ]) {
        if (this.calculateSectionMatchConfidence(section, sectionDef) >= 0.5) {
          isDefined = true;
          break;
        }
      }
      
      if (!isDefined) {
        extraSections.push({
          sectionId: section.id,
          sectionTitle: section.title,
          sectionType: section.type,
          contentPreview: section.content.substring(0, 100) + (section.content.length > 100 ? '...' : ''),
          potentialPurpose: this.inferSectionPurpose(section),
          suggestedAction: 'flag_for_review',
          confidence: 0.5,
        });
      }
    }
    
    return extraSections;
  }

  /**
   * Detect schema gaps in the mapping
   */
  private async detectSchemaGaps(
    decompiledReport: DecompiledReport,
    reportType: ReportTypeDefinition | null,
    mappingContext: {
      mappedFields: MappedField[];
      missingRequiredSections: MissingRequiredSection[];
      extraSections: ExtraSection[];
      unknownTerminology: UnknownTerminology[];
    }
  ): Promise<SchemaGap[]> {
    const schemaGaps: SchemaGap[] = [];
    
    // Check for unmapped content
    const totalSections = decompiledReport.sections.length;
    const mappedSections = mappingContext.mappedFields.length;
    
    if (mappedSections < totalSections * 0.3) {
      schemaGaps.push({
        gapId: `gap_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type: 'mismatched_schema',
        description: `Only ${mappedSections} out of ${totalSections} sections were mapped to schema fields`,
        severity: 'critical',
        suggestedFix: 'Review mapping rules and consider adding new field definitions',
        data: {
          mappedSections,
          totalSections,
          coveragePercentage: Math.round((mappedSections / totalSections) * 100)
        },
        confidence: 0.8,
      });
    }
    
    // Check for high unknown terminology
    if (mappingContext.unknownTerminology.length > 10) {
      schemaGaps.push({
        gapId: `gap_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type: 'unknown_terminology',
        description: `${mappingContext.unknownTerminology.length} unknown terminology entries detected`,
        severity: 'warning',
        suggestedFix: 'Update terminology dictionary with new terms',
        data: {
          unknownTerminologyCount: mappingContext.unknownTerminology.length,
          sampleTerms: mappingContext.unknownTerminology.slice(0, 3).map(t => t.term)
        },
        confidence: 0.7,
      });
    }
    
    // Check for missing required sections
    if (mappingContext.missingRequiredSections.length > 0) {
      schemaGaps.push({
        gapId: `gap_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type: 'missing_section',
        description: `${mappingContext.missingRequiredSections.length} required sections are missing`,
        severity: 'critical',
        suggestedFix: 'Add missing required sections to the report',
        data: {
          missingSections: mappingContext.missingRequiredSections.map(s => s.sectionName),
          count: mappingContext.missingRequiredSections.length
        },
        confidence: 1.0,
      });
    }
    
    // Check for many extra sections
    if (mappingContext.extraSections.length > 5) {
      schemaGaps.push({
        gapId: `gap_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type: 'unknown_section',
        description: `${mappingContext.extraSections.length} extra sections not defined in schema`,
        severity: 'warning',
        suggestedFix: 'Review schema completeness and consider adding new section definitions',
        data: {
          extraSectionsCount: mappingContext.extraSections.length,
          sampleTitles: mappingContext.extraSections.slice(0, 3).map(s => s.sectionTitle)
        },
        confidence: 0.6,
      });
    }
    
    return schemaGaps;
  }

  /**
   * Compute overall confidence score for the mapping result
   */
  private computeConfidenceScore(mappingResult: SchemaMappingResult): number {
    let score = 0;
    let weight = 0;
    
    // Mapping coverage contributes 40%
    if (mappingResult.mappingCoverage !== undefined) {
      // Convert percentage (0-100) to 0-1 scale
      score += (mappingResult.mappingCoverage / 100) * 0.4;
      weight += 0.4;
    }
    
    // Completeness score contributes 30%
    if (mappingResult.completenessScore !== undefined) {
      // Convert percentage (0-100) to 0-1 scale
      score += (mappingResult.completenessScore / 100) * 0.3;
      weight += 0.3;
    }
    
    // Average mapping confidence contributes 20%
    if (mappingResult.mappedFields.length > 0) {
      const avgConfidence = mappingResult.mappedFields.reduce((sum, field) =>
        sum + field.mappingConfidence, 0) / mappingResult.mappedFields.length;
      score += avgConfidence * 0.2;
      weight += 0.2;
    }
    
    // Schema gaps reduce score (15% penalty for each critical gap, 5% for each warning)
    if (mappingResult.schemaGaps) {
      const criticalGaps = mappingResult.schemaGaps.filter(gap => gap.severity === 'critical').length;
      const warningGaps = mappingResult.schemaGaps.filter(gap => gap.severity === 'warning').length;
      const gapPenalty = Math.min(criticalGaps * 0.15 + warningGaps * 0.05, 0.5);
      score -= gapPenalty;
    }
    
    // Normalize by weight if weight > 0
    if (weight > 0) {
      score = score / weight;
    }
    
    // Ensure score is between 0 and 1
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Infer section purpose based on content and title
   */
  private inferSectionPurpose(section: DetectedSection): string {
    const title = section.title.toLowerCase();
    const content = section.content.toLowerCase();
    
    if (title.includes('introduction') || title.includes('overview')) {
      return 'introductory_content';
    }
    
    if (title.includes('method') || title.includes('procedure') || title.includes('approach')) {
      return 'methodology_description';
    }
    
    if (title.includes('result') || title.includes('finding') || title.includes('observation')) {
      return 'results_presentation';
    }
    
    if (title.includes('conclusion') || title.includes('summary') || title.includes('recommendation')) {
      return 'conclusions_recommendations';
    }
    
    if (title.includes('reference') || title.includes('bibliography')) {
      return 'references';
    }
    
    if (title.includes('appendix') || title.includes('attachment')) {
      return 'appendix_material';
    }
    
    if (content.includes('table') || section.type === 'table') {
      return 'data_table';
    }
    
    if (content.includes('figure') || content.includes('image') || content.includes('diagram')) {
      return 'visual_content';
    }
    
    return 'general_content';
  }

  /**
   * Create a snapshot of report type definition
   */
  private createReportTypeSnapshot(reportType: ReportTypeDefinition): any {
    return {
      id: reportType.id,
      name: reportType.name,
      description: reportType.description,
      requiredSections: reportType.requiredSections.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
      })),
      optionalSections: reportType.optionalSections?.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
      })) || [],
      conditionalSections: reportType.conditionalSections?.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
      })) || [],
      tags: reportType.tags,
      version: reportType.version,
      createdAt: reportType.createdAt,
    };
  }

  /**
   * Create a snapshot of decompiled report
   */
  private createDecompiledReportSnapshot(decompiledReport: DecompiledReport): any {
    return {
      id: decompiledReport.id,
      detectedReportType: decompiledReport.detectedReportType,
      sectionCount: decompiledReport.sections.length,
      terminologyCount: decompiledReport.terminology.length,
      complianceMarkerCount: decompiledReport.complianceMarkers.length,
      sections: decompiledReport.sections.map(s => ({
        id: s.id,
        title: s.title,
        type: s.type,
        contentLength: s.content.length,
      })),
      createdAt: decompiledReport.createdAt,
    };
  }

  /**
   * Emit an event to all registered listeners
   */
  private emitEvent(event: SchemaMapperEvent, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event, data);
        } catch (error) {
          console.error(`[ReportSchemaMapper] Error in event listener for ${event}:`, error);
        }
      }
    }
  }

  /**
   * Register an event listener
   */
  on(event: SchemaMapperEvent, listener: EventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.add(listener);
    }
  }

  /**
   * Remove an event listener
   */
  off(event: SchemaMapperEvent, listener: EventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Get mapper version
   */
  getVersion(): string {
    return this.mapperVersion;
  }
}
