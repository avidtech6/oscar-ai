/**
 * Report Classification Engine - Phase 6
 * ReportClassificationEngine Class
 * 
 * Main engine responsible for identifying report types by analyzing decompiled report content,
 * comparing structure to known report types, and computing confidence scores.
 */

import type { DecompiledReport } from '../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../registry/ReportTypeDefinition';
import type { ReportTypeRegistry } from '../registry/ReportTypeRegistry';
import {
  ClassificationResult,
  ClassificationCandidate,
  createClassificationResult,
  validateClassificationResult,
  type AmbiguityLevel
} from './ClassificationResult';

/**
 * Event types emitted by the ReportClassificationEngine
 */
export type ClassificationEvent = 
  | 'classification:started'
  | 'classification:candidateScored'
  | 'classification:ranked'
  | 'classification:completed'
  | 'classification:ambiguous'
  | 'classification:error';

/**
 * Event data structure
 */
export interface ClassificationEventData {
  event: ClassificationEvent;
  data: any;
  timestamp: Date;
}

/**
 * Classification engine configuration
 */
export interface ClassificationConfig {
  confidenceThreshold: number; // 0-1
  ambiguityThreshold: number; // 0-1 difference between top candidates
  scoringWeights: {
    structure: number;
    terminology: number;
    compliance: number;
    metadata: number;
    ordering: number;
  };
  storagePath: string;
  autoSaveResults: boolean;
}

/**
 * Report Classification Engine Class
 */
export class ReportClassificationEngine {
  // Dependencies
  private registry?: ReportTypeRegistry;
  
  // Configuration
  private config: ClassificationConfig;
  
  // State
  private eventListeners: Map<ClassificationEvent, Function[]> = new Map();
  private isProcessing: boolean = false;
  private classificationResults: Map<string, ClassificationResult> = new Map(); // In-memory cache
  
  // Statistics
  private totalClassifications: number = 0;
  private totalAmbiguousClassifications: number = 0;
  private totalClearClassifications: number = 0;
  
  /**
   * Constructor
   */
  constructor(
    registry?: ReportTypeRegistry,
    config: Partial<ClassificationConfig> = {}
  ) {
    this.registry = registry;
    
    // Default configuration
    this.config = {
      confidenceThreshold: 0.7,
      ambiguityThreshold: 0.2,
      scoringWeights: {
        structure: 0.3,
        terminology: 0.25,
        compliance: 0.2,
        metadata: 0.15,
        ordering: 0.1
      },
      storagePath: 'workspace/classification-results.json',
      autoSaveResults: true,
      ...config
    };
  }
  
  /**
   * Classify a decompiled report
   */
  public async classify(decompiledReport: DecompiledReport): Promise<ClassificationResult> {
    this.emit('classification:started', { reportId: decompiledReport.id });
    
    try {
      this.isProcessing = true;
      const startTime = Date.now();
      
      // Get all report types from registry
      const reportTypes = await this.getReportTypes();
      
      // Score each report type
      const candidates: ClassificationCandidate[] = [];
      
      for (const reportType of reportTypes) {
        const candidate = await this.scoreReportType(decompiledReport, reportType);
        candidates.push(candidate);
        
        this.emit('classification:candidateScored', {
          reportId: decompiledReport.id,
          reportTypeId: reportType.id,
          score: candidate.score
        });
      }
      
      // Rank candidates
      const rankedCandidates = this.rankCandidates(candidates);
      this.emit('classification:ranked', {
        reportId: decompiledReport.id,
        topCandidate: rankedCandidates[0]
      });
      
      // Compute confidence score
      const confidenceScore = this.computeConfidenceScore(rankedCandidates);
      
      // Detect ambiguity
      const ambiguityLevel = this.detectAmbiguity(rankedCandidates, confidenceScore);
      
      // Generate reasons
      const reasons = this.generateReasons(rankedCandidates, ambiguityLevel);
      
      // Create classification result
      const result = createClassificationResult(decompiledReport.id, rankedCandidates, {
        confidenceScore,
        ambiguityLevel,
        reasons
      });
      
      // Update timestamps
      result.timestamps.started = new Date(startTime).toISOString();
      result.timestamps.completed = new Date().toISOString();
      
      // Validate result
      const validation = validateClassificationResult(result);
      if (!validation.isValid) {
        throw new Error(`Invalid classification result: ${validation.errors.join(', ')}`);
      }
      
      // Store result if configured
      if (this.config.autoSaveResults) {
        await this.storeClassificationResult(result);
      }
      
      // Update in-memory cache
      this.classificationResults.set(result.id, result);
      
      // Update statistics
      this.totalClassifications++;
      if (ambiguityLevel === 'none' || ambiguityLevel === 'low') {
        this.totalClearClassifications++;
      } else {
        this.totalAmbiguousClassifications++;
      }
      
      // Emit appropriate completion event
      if (ambiguityLevel === 'high' || ambiguityLevel === 'very-high') {
        this.emit('classification:ambiguous', {
          reportId: decompiledReport.id,
          result,
          ambiguityLevel
        });
      }
      
      this.emit('classification:completed', { result });
      
      return result;
      
    } catch (error) {
      this.emit('classification:error', {
        error: error instanceof Error ? error.message : String(error),
        reportId: decompiledReport.id
      });
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }
  
  /**
   * Score a report type against decompiled report
   */
  private async scoreReportType(
    decompiledReport: DecompiledReport,
    reportType: ReportTypeDefinition
  ): Promise<ClassificationCandidate> {
    // Score each aspect
    const structureScore = await this.scoreStructureSimilarity(decompiledReport, reportType);
    const terminologyScore = await this.scoreTerminologySimilarity(decompiledReport, reportType);
    const complianceScore = await this.scoreComplianceMarkers(decompiledReport, reportType);
    const metadataScore = await this.scoreMetadata(decompiledReport, reportType);
    const orderingScore = await this.scoreSectionOrdering(decompiledReport, reportType);
    
    // Calculate weighted composite score
    const weights = this.config.scoringWeights;
    const compositeScore = 
      (structureScore * weights.structure) +
      (terminologyScore * weights.terminology) +
      (complianceScore * weights.compliance) +
      (metadataScore * weights.metadata) +
      (orderingScore * weights.ordering);
    
    // Generate reasons
    const reasons: string[] = [];
    if (structureScore > 0.7) reasons.push('Strong structural match');
    if (terminologyScore > 0.7) reasons.push('Strong terminology match');
    if (complianceScore > 0.7) reasons.push('Strong compliance marker match');
    if (metadataScore > 0.7) reasons.push('Strong metadata match');
    if (orderingScore > 0.7) reasons.push('Strong section ordering match');
    
    return {
      reportTypeId: reportType.id,
      score: compositeScore,
      breakdown: {
        structure: structureScore,
        terminology: terminologyScore,
        compliance: complianceScore,
        metadata: metadataScore,
        ordering: orderingScore
      },
      reasons
    };
  }
  
  /**
   * Score structure similarity
   */
  private async scoreStructureSimilarity(
    decompiledReport: DecompiledReport,
    reportType: ReportTypeDefinition
  ): Promise<number> {
    // In a real implementation, would compare section structures
    // For now, return mock score based on section count similarity
    const reportSections = decompiledReport.sections?.length || 0;
    const typeSections = reportType.requiredSections.length + reportType.optionalSections.length;
    
    if (reportSections === 0 || typeSections === 0) return 0;
    
    const sectionRatio = Math.min(reportSections, typeSections) / Math.max(reportSections, typeSections);
    return Math.min(sectionRatio * 0.8 + 0.2, 1); // Base score with minimum 0.2
  }
  
  /**
   * Score terminology similarity
   */
  private async scoreTerminologySimilarity(
    decompiledReport: DecompiledReport,
    reportType: ReportTypeDefinition
  ): Promise<number> {
    // In a real implementation, would compare terminology
    // For now, return mock score based on tags and standards
    const reportTerms = decompiledReport.terminology?.length || 0;
    const typeStandards = reportType.standards?.length || 0;
    
    if (reportTerms === 0 || typeStandards === 0) return 0.3;
    
    // Simulate some terminology matching based on standards
    return Math.min(0.5 + (Math.random() * 0.3), 0.9);
  }
  
  /**
   * Score compliance markers
   */
  private async scoreComplianceMarkers(
    decompiledReport: DecompiledReport,
    reportType: ReportTypeDefinition
  ): Promise<number> {
    // In a real implementation, would check compliance markers
    // For now, return mock score
    const reportMarkers = decompiledReport.complianceMarkers?.length || 0;
    const typeMarkers = reportType.complianceRules?.length || 0;
    
    if (reportMarkers === 0 || typeMarkers === 0) return 0.2;
    
    // Simulate some compliance marker matching
    return Math.min(0.4 + (Math.random() * 0.4), 0.8);
  }
  
  /**
   * Score metadata
   */
  private async scoreMetadata(
    decompiledReport: DecompiledReport,
    reportType: ReportTypeDefinition
  ): Promise<number> {
    // In a real implementation, would compare metadata
    // For now, return mock score based on category match
    const reportMetadata = decompiledReport.metadata;
    
    if (!reportMetadata) return 0.1;
    
    // Check for category match (decompiled report might have category in metadata)
    // For now, use a simple check
    return 0.3;
  }
  
  /**
   * Score section ordering
   */
  private async scoreSectionOrdering(
    decompiledReport: DecompiledReport,
    reportType: ReportTypeDefinition
  ): Promise<number> {
    // In a real implementation, would compare section ordering patterns
    // For now, return mock score
    const reportSections = decompiledReport.sections?.length || 0;
    const typeSections = reportType.requiredSections.length + reportType.optionalSections.length;
    
    if (reportSections === 0 || typeSections === 0) return 0.1;
    
    // Simulate some ordering similarity
    return Math.min(0.3 + (Math.random() * 0.4), 0.7);
  }
  
  /**
   * Rank candidates by score
   */
  private rankCandidates(candidates: ClassificationCandidate[]): ClassificationCandidate[] {
    return [...candidates].sort((a, b) => b.score - a.score);
  }
  
  /**
   * Compute confidence score from ranked candidates
   */
  private computeConfidenceScore(rankedCandidates: ClassificationCandidate[]): number {
    if (rankedCandidates.length === 0) return 0;
    
    const topCandidate = rankedCandidates[0];
    if (rankedCandidates.length === 1) return topCandidate.score;
    
    const secondCandidate = rankedCandidates[1];
    const scoreDifference = topCandidate.score - secondCandidate.score;
    
    // Confidence increases with score difference
    const differenceFactor = Math.min(scoreDifference * 2, 1); // 0-1 based on difference
    return topCandidate.score * (0.7 + 0.3 * differenceFactor);
  }
  
  /**
   * Detect ambiguity in classification
   */
  private detectAmbiguity(
    rankedCandidates: ClassificationCandidate[],
    confidenceScore: number
  ): AmbiguityLevel {
    if (rankedCandidates.length === 0) return 'very-high';
    if (rankedCandidates.length === 1) return 'none';
    
    const topCandidate = rankedCandidates[0];
    const secondCandidate = rankedCandidates[1];
    const scoreDifference = topCandidate.score - secondCandidate.score;
    
    // Check confidence threshold
    if (confidenceScore < this.config.confidenceThreshold) {
      return 'very-high';
    }
    
    // Check score difference
    if (scoreDifference > this.config.ambiguityThreshold) {
      return 'none';
    } else if (scoreDifference > this.config.ambiguityThreshold * 0.7) {
      return 'low';
    } else if (scoreDifference > this.config.ambiguityThreshold * 0.4) {
      return 'medium';
    } else if (scoreDifference > this.config.ambiguityThreshold * 0.1) {
      return 'high';
    } else {
      return 'very-high';
    }
  }
  
  /**
   * Generate reasons for classification
   */
  private generateReasons(
    rankedCandidates: ClassificationCandidate[],
    ambiguityLevel: AmbiguityLevel
  ): string[] {
    const reasons: string[] = [];
    
    if (rankedCandidates.length === 0) {
      reasons.push('No report types matched the content');
      return reasons;
    }
    
    const topCandidate = rankedCandidates[0];
    
    // Add top candidate reasons
    if (topCandidate.reasons.length > 0) {
      reasons.push(...topCandidate.reasons.slice(0, 3));
    }
    
    // Add ambiguity reasons
    switch (ambiguityLevel) {
      case 'none':
        reasons.push('Clear classification with significant score difference');
        break;
      case 'low':
        reasons.push('Minor ambiguity between top candidates');
        break;
      case 'medium':
        reasons.push('Moderate ambiguity - review recommended');
        break;
      case 'high':
        reasons.push('High ambiguity - manual review required');
        break;
      case 'very-high':
        reasons.push('Very high ambiguity - consider adding new report type');
        break;
    }
    
    // Add score-based reasons
    if (topCandidate.score >= 0.8) {
      reasons.push('High overall match score');
    } else if (topCandidate.score >= 0.6) {
      reasons.push('Moderate overall match score');
    } else {
      reasons.push('Low overall match score');
    }
    
    return reasons;
  }
  
  /**
   * Get all report types from registry
   */
  private async getReportTypes(): Promise<ReportTypeDefinition[]> {
    if (this.registry) {
      return this.registry.getAllTypes();
    }
    
    // Fallback: return mock report types
    const now = new Date();
    return [
      {
        id: 'survey',
        name: 'Survey Report',
        description: 'Standard survey report',
        category: 'survey',
        version: '1.0.0',
        createdAt: now,
        updatedAt: now,
        requiredSections: [],
        optionalSections: [],
        conditionalSections: [],
        dependencies: [],
        relatedReportTypes: [],
        complianceRules: [],
        standards: [],
        aiGuidance: [],
        tags: [],
        complexity: 'medium',
        typicalAudience: [],
        supportedFormats: ['pdf', 'html'],
        defaultFormat: 'pdf'
      },
      {
        id: 'assessment',
        name: 'Assessment Report',
        description: 'Technical assessment report',
        category: 'assessment',
        version: '1.0.0',
        createdAt: now,
        updatedAt: now,
        requiredSections: [],
        optionalSections: [],
        conditionalSections: [],
        dependencies: [],
        relatedReportTypes: [],
        complianceRules: [],
        standards: [],
        aiGuidance: [],
        tags: [],
        complexity: 'medium',
        typicalAudience: [],
        supportedFormats: ['pdf', 'html'],
        defaultFormat: 'pdf'
      },
      {
        id: 'method',
        name: 'Method Statement',
        description: 'Method statement report',
        category: 'method',
        version: '1.0.0',
        createdAt: now,
        updatedAt: now,
        requiredSections: [],
        optionalSections: [],
        conditionalSections: [],
        dependencies: [],
        relatedReportTypes: [],
        complianceRules: [],
        standards: [],
        aiGuidance: [],
        tags: [],
        complexity: 'medium',
        typicalAudience: [],
        supportedFormats: ['pdf', 'html'],
        defaultFormat: 'pdf'
      }
    ];
  }
  
  /**
   * Event emitter methods
   */
  public on(event: ClassificationEvent, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }
  
  public off(event: ClassificationEvent, listener: Function): void {
    if (!this.eventListeners.has(event)) return;
    const listeners = this.eventListeners.get(event)!;
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }
  
  private emit(event: ClassificationEvent, data: any): void {
    if (!this.eventListeners.has(event)) return;
    const eventData: ClassificationEventData = {
      event,
      data,
      timestamp: new Date()
    };
    this.eventListeners.get(event)!.forEach(listener => {
      try {
        listener(eventData);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }
  
  /**
   * Storage methods
   */
  private async storeClassificationResult(result: ClassificationResult): Promise<void> {
    // In a real implementation, would save to file or database
    // For now, just update in-memory cache
    this.classificationResults.set(result.id, result);
    console.log(`Classification result ${result.id} stored (in-memory)`);
  }
  
  /**
   * Get classification result by ID
   */
  public async getClassificationResult(resultId: string): Promise<ClassificationResult | null> {
    return this.classificationResults.get(resultId) || null;
  }
  
  /**
   * Get classification results for a report
   */
  public async getClassificationResultsForReport(
    decompiledReportId: string
  ): Promise<ClassificationResult[]> {
    const results: ClassificationResult[] = [];
    
    for (const result of this.classificationResults.values()) {
      if (result.decompiledReportId === decompiledReportId) {
        results.push(result);
      }
    }
    
    // Sort by timestamp (newest first)
    results.sort((a, b) => 
      new Date(b.timestamps.completed).getTime() - new Date(a.timestamps.completed).getTime()
    );
    
    return results;
  }
  
  /**
   * Get engine statistics
   */
  public getStatistics(): {
    totalClassifications: number;
    totalClearClassifications: number;
    totalAmbiguousClassifications: number;
    clearClassificationRate: number;
    activeResults: number;
  } {
    const clearClassificationRate = this.totalClassifications > 0
      ? this.totalClearClassifications / this.totalClassifications
      : 0;
    
    return {
      totalClassifications: this.totalClassifications,
      totalClearClassifications: this.totalClearClassifications,
      totalAmbiguousClassifications: this.totalAmbiguousClassifications,
      clearClassificationRate,
      activeResults: this.classificationResults.size
    };
  }
}
