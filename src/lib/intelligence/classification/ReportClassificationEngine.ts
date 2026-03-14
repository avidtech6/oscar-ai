// Simple browser-compatible event emitter
const createEventEmitter = () => ({
  events: {},
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  },
  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  },
  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }
});

import { EventEmitter } from '../events';
import type { DecompiledReport } from '../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../registry/ReportTypeDefinition';
import { reportTypeRegistry } from '../registry/ReportTypeRegistry';
import { createClassificationResult, type ClassificationResult, AmbiguityLevel } from './ClassificationResult';
import { scoreStructureSimilarity } from './scorers/scoreStructureSimilarity';
import { scoreTerminologySimilarity } from './scorers/scoreTerminologySimilarity';
import { scoreComplianceMarkers } from './scorers/scoreComplianceMarkers';
import { scoreMetadata } from './scorers/scoreMetadata';
import { scoreSectionOrdering } from './scorers/scoreSectionOrdering';
import { rankCandidates, type ScoredCandidate } from './rankers/rankCandidates';

const STORAGE_PATH = '/classification-results.json';

export class ReportClassificationEngine {
  private eventEmitter = createEventEmitter();
  private results: ClassificationResult[] = [];

  constructor() {
    this.load();
  }

  /**
   * Classify a decompiled report
   */
  classify(decompiledReport: DecompiledReport): ClassificationResult {
    this.eventEmitter.emit('classification:started', { decompiledReportId: decompiledReport.id });

    const reportTypes = reportTypeRegistry.getAllTypes();
    const scoredCandidates: ScoredCandidate[] = [];

    // Score each report type
    for (const reportType of reportTypes) {
      const structureScore = scoreStructureSimilarity(decompiledReport, reportType);
      const terminologyScore = scoreTerminologySimilarity(decompiledReport, reportType);
      const complianceScore = scoreComplianceMarkers(decompiledReport, reportType);
      const metadataScore = scoreMetadata(decompiledReport, reportType);
      const orderingScore = scoreSectionOrdering(decompiledReport, reportType);

      const reasons = [
        `Structure similarity: ${(structureScore * 100).toFixed(1)}%`,
        `Terminology similarity: ${(terminologyScore * 100).toFixed(1)}%`,
        `Compliance markers: ${(complianceScore * 100).toFixed(1)}%`,
        `Metadata alignment: ${(metadataScore * 100).toFixed(1)}%`,
        `Section ordering: ${(orderingScore * 100).toFixed(1)}%`
      ];

      scoredCandidates.push({
        reportTypeId: reportType.id,
        scores: {
          structure: structureScore,
          terminology: terminologyScore,
          compliance: complianceScore,
          metadata: metadataScore,
          ordering: orderingScore
        },
        reasons
      });

      this.eventEmitter.emit('classification:candidateScored', {
        reportTypeId: reportType.id,
        scores: { structureScore, terminologyScore, complianceScore, metadataScore, orderingScore }
      });
    }

    // Rank candidates
    const rankedCandidates = rankCandidates(scoredCandidates);
    this.eventEmitter.emit('classification:ranked', { rankedCandidates });

    // Compute confidence and ambiguity
    const confidenceScore = this.computeConfidenceScore(rankedCandidates);
    const ambiguityLevel = this.detectAmbiguity(rankedCandidates, confidenceScore);

    // Build reasons
    const reasons = [
      `Top candidate: ${rankedCandidates[0]?.reportTypeId || 'none'} (${(rankedCandidates[0]?.score || 0) * 100}%)`,
      `Confidence: ${(confidenceScore * 100).toFixed(1)}%`,
      `Ambiguity: ${ambiguityLevel}`
    ];

    // Create result
    const result = createClassificationResult(
      decompiledReport.id,
      rankedCandidates[0]?.reportTypeId || null,
      confidenceScore,
      ambiguityLevel,
      rankedCandidates,
      reasons
    );

    this.results.push(result);
    this.save();

    this.eventEmitter.emit('classification:complete', { result });
    return result;
  }

  /**
   * Compute confidence score based on ranking
   */
  private computeConfidenceScore(rankedCandidates: ScoredCandidate[]): number {
    if (rankedCandidates.length === 0) return 0;

    const topScore = rankedCandidates[0].score;
    const secondScore = rankedCandidates[1]?.score || 0;

    // Confidence is higher when there's a clear winner
    const gap = topScore - secondScore;
    return Math.min(0.95, topScore + gap * 0.5); // Cap at 95% confidence
  }

  /**
   * Detect ambiguity level based on score distribution
   */
  private detectAmbiguity(rankedCandidates: ScoredCandidate[], confidenceScore: number): AmbiguityLevel {
    if (rankedCandidates.length < 2) return AmbiguityLevel.LOW;

    const topScore = rankedCandidates[0].score;
    const secondScore = rankedCandidates[1].score;
    const gap = topScore - secondScore;

    if (gap < 0.1) return AmbiguityLevel.HIGH;
    if (gap < 0.2) return AmbiguityLevel.MEDIUM;
    return AmbiguityLevel.LOW;
  }

  /**
   * Load results from localStorage
   */
  private load(): void {
    try {
      const data = localStorage.getItem(STORAGE_PATH);
      if (data) {
        this.results = JSON.parse(data);
      } else {
        this.results = [];
      }
    } catch (err) {
      console.error('Failed to load classification results:', err);
      this.results = [];
    }
  }

  /**
   * Save results to disk
   */
  private save(): void {
    try {
      const data = JSON.stringify(this.results, null, 2);
      localStorage.setItem(STORAGE_PATH, data);
    } catch (err) {
      console.error('Failed to save classification results:', err);
    }
  }

  /**
   * Get all classification results
   */
  getResults(): ClassificationResult[] {
    return this.results;
  }

  /**
   * Get results for a specific decompiled report
   */
  getResult(decompiledReportId: string): ClassificationResult | null {
    return this.results.find(r => r.decompiledReportId === decompiledReportId) || null;
  }

  /**
   * Clear all results
   */
  clearResults(): void {
    this.results = [];
    this.save();
  }

  /**
   * Get event emitter for listening to events
   */
  getEventEmitter(): EventEmitter {
    return this.eventEmitter as unknown as EventEmitter;
  }
}