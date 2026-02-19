/**
 * Phase 10: Report Reproduction Tester
 * ConsistencyScoringService Class
 * 
 * Service for calculating consistency scores across multiple test runs.
 */

import type { TestResult } from '../TestResult';
import type { ConsistencyMeasurement } from '../TestResult';

/**
 * Scoring configuration
 */
export interface ScoringConfig {
  weightStructure: number;
  weightContent: number;
  weightFormatting: number;
  weightData: number;
  weightTiming: number;
  consistencyThreshold: number; // 0-100
  variancePenaltyFactor: number;
  timingConsistencyWeight: number;
  hashConsistencyWeight: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ScoringConfig = {
  weightStructure: 0.25,
  weightContent: 0.30,
  weightFormatting: 0.15,
  weightData: 0.20,
  weightTiming: 0.10,
  consistencyThreshold: 80,
  variancePenaltyFactor: 0.5,
  timingConsistencyWeight: 0.3,
  hashConsistencyWeight: 0.7,
};

/**
 * Consistency score breakdown
 */
export interface ConsistencyScoreBreakdown {
  structureConsistency: number;
  contentConsistency: number;
  formattingConsistency: number;
  dataConsistency: number;
  timingConsistency: number;
  hashConsistency: number;
  overallConsistency: number;
}

/**
 * Statistical metrics
 */
export interface StatisticalMetrics {
  mean: number;
  median: number;
  mode: number;
  standardDeviation: number;
  variance: number;
  min: number;
  max: number;
  range: number;
  coefficientOfVariation: number;
}

/**
 * Main ConsistencyScoringService class
 */
export class ConsistencyScoringService {
  private config: ScoringConfig;
  
  constructor(config?: Partial<ScoringConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Calculate consistency scores from multiple test results
   */
  calculateConsistencyScores(testResults: TestResult[]): ConsistencyScoreBreakdown {
    if (testResults.length === 0) {
      return this.getEmptyScoreBreakdown();
    }
    
    if (testResults.length === 1) {
      // Single result - perfect consistency by definition
      return this.getPerfectConsistencyScore(testResults[0]);
    }
    
    // Extract scores from all test results
    const structureScores = testResults.map(r => r.scores.structuralSimilarityScore);
    const contentScores = testResults.map(r => r.scores.contentSimilarityScore);
    const formattingScores = testResults.map(r => r.scores.formattingSimilarityScore);
    const dataScores = testResults.map(r => r.scores.dataConsistencyScore);
    const timingScores = testResults.map(r => r.scores.timingConsistencyScore);
    
    // Calculate consistency for each aspect
    const structureConsistency = this.calculateAspectConsistency(structureScores);
    const contentConsistency = this.calculateAspectConsistency(contentScores);
    const formattingConsistency = this.calculateAspectConsistency(formattingScores);
    const dataConsistency = this.calculateAspectConsistency(dataScores);
    const timingConsistency = this.calculateTimingConsistency(timingScores);
    
    // Calculate hash consistency if available
    const hashConsistency = this.calculateHashConsistency(testResults);
    
    // Calculate overall consistency
    const overallConsistency = this.calculateOverallConsistency({
      structureConsistency,
      contentConsistency,
      formattingConsistency,
      dataConsistency,
      timingConsistency,
      hashConsistency,
    });
    
    return {
      structureConsistency,
      contentConsistency,
      formattingConsistency,
      dataConsistency,
      timingConsistency,
      hashConsistency,
      overallConsistency,
    };
  }

  /**
   * Calculate consistency measurement for a test case across multiple runs
   */
  calculateConsistencyMeasurement(testResults: TestResult[]): ConsistencyMeasurement {
    if (testResults.length === 0) {
      return this.getEmptyConsistencyMeasurement();
    }
    
    const runs = testResults.length;
    const successfulRuns = testResults.filter(r => r.reproducible).length;
    
    // Calculate output hash distribution
    const hashDistribution = this.calculateHashDistribution(testResults);
    
    // Find most common hash
    let mostCommonOutputHash: string | undefined;
    let maxCount = 0;
    for (const [hash, count] of Object.entries(hashDistribution)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonOutputHash = hash;
      }
    }
    
    // Calculate consistency score
    const consistencyScore = mostCommonOutputHash 
      ? Math.round((maxCount / runs) * 100)
      : 0;
    
    // Calculate timing statistics
    const timingStats = this.calculateTimingStatistics(testResults);
    
    // Calculate variance
    const variance = this.calculateOverallVariance(testResults);
    
    return {
      testCaseId: testResults[0]?.testCaseId || 'unknown',
      runs,
      successfulRuns,
      consistencyScore,
      variance,
      mostCommonOutputHash,
      hashDistribution,
      timingStats,
    };
  }

  /**
   * Calculate aspect consistency based on score variance
   */
  private calculateAspectConsistency(scores: number[]): number {
    if (scores.length === 0) return 0;
    if (scores.length === 1) return 100; // Perfect consistency with single value
    
    // Calculate mean and standard deviation
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate coefficient of variation (lower is better)
    const cv = mean > 0 ? (stdDev / mean) * 100 : 0;
    
    // Convert to consistency score (0-100)
    // Lower CV = higher consistency
    const consistency = Math.max(0, 100 - cv * this.config.variancePenaltyFactor);
    
    return Math.round(consistency);
  }

  /**
   * Calculate timing consistency
   */
  private calculateTimingConsistency(timingScores: number[]): number {
    if (timingScores.length === 0) return 0;
    if (timingScores.length === 1) return 100;
    
    // Timing consistency is based on variance of timing scores
    return this.calculateAspectConsistency(timingScores);
  }

  /**
   * Calculate hash consistency
   */
  private calculateHashConsistency(testResults: TestResult[]): number {
    if (testResults.length === 0) return 0;
    
    const hashDistribution = this.calculateHashDistribution(testResults);
    
    // Count total hashes
    const totalHashes = Object.values(hashDistribution).reduce((sum, count) => sum + count, 0);
    
    if (totalHashes === 0) return 0;
    
    // Find most common hash
    let maxCount = 0;
    for (const count of Object.values(hashDistribution)) {
      if (count > maxCount) {
        maxCount = count;
      }
    }
    
    // Consistency = percentage of runs with most common hash
    return Math.round((maxCount / totalHashes) * 100);
  }

  /**
   * Calculate hash distribution from test results
   */
  private calculateHashDistribution(testResults: TestResult[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    for (const result of testResults) {
      // Use generated report ID as hash proxy
      const hash = result.execution.generatedReportId || `result_${result.id}`;
      distribution[hash] = (distribution[hash] || 0) + 1;
    }
    
    return distribution;
  }

  /**
   * Calculate timing statistics
   */
  private calculateTimingStatistics(testResults: TestResult[]): {
    averageMs: number;
    minMs: number;
    maxMs: number;
    stdDevMs: number;
  } {
    if (testResults.length === 0) {
      return {
        averageMs: 0,
        minMs: 0,
        maxMs: 0,
        stdDevMs: 0,
      };
    }
    
    const times = testResults.map(r => r.processingTimeMs);
    const averageMs = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minMs = Math.min(...times);
    const maxMs = Math.max(...times);
    
    // Calculate standard deviation
    const variance = times.reduce((sum, time) => sum + Math.pow(time - averageMs, 2), 0) / times.length;
    const stdDevMs = Math.sqrt(variance);
    
    return {
      averageMs: Math.round(averageMs),
      minMs: Math.round(minMs),
      maxMs: Math.round(maxMs),
      stdDevMs: Math.round(stdDevMs),
    };
  }

  /**
   * Calculate overall variance across all aspects
   */
  private calculateOverallVariance(testResults: TestResult[]): number {
    if (testResults.length <= 1) return 0;
    
    // Collect all scores across all aspects
    const allScores: number[] = [];
    
    for (const result of testResults) {
      allScores.push(
        result.scores.structuralSimilarityScore,
        result.scores.contentSimilarityScore,
        result.scores.formattingSimilarityScore,
        result.scores.dataConsistencyScore,
        result.scores.timingConsistencyScore,
      );
    }
    
    // Calculate variance
    const mean = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
    const variance = allScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / allScores.length;
    
    return Math.round(variance * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate overall consistency from breakdown
   */
  private calculateOverallConsistency(breakdown: Omit<ConsistencyScoreBreakdown, 'overallConsistency'>): number {
    const weightedSum = 
      breakdown.structureConsistency * this.config.weightStructure +
      breakdown.contentConsistency * this.config.weightContent +
      breakdown.formattingConsistency * this.config.weightFormatting +
      breakdown.dataConsistency * this.config.weightData +
      breakdown.timingConsistency * this.config.weightTiming;
    
    const totalWeight = 
      this.config.weightStructure +
      this.config.weightContent +
      this.config.weightFormatting +
      this.config.weightData +
      this.config.weightTiming;
    
    const baseConsistency = totalWeight > 0 ? weightedSum / totalWeight : 0;
    
    // Adjust for hash consistency
    const adjustedConsistency = 
      baseConsistency * (1 - this.config.hashConsistencyWeight) +
      breakdown.hashConsistency * this.config.hashConsistencyWeight;
    
    return Math.round(adjustedConsistency);
  }

  /**
   * Get empty score breakdown
   */
  private getEmptyScoreBreakdown(): ConsistencyScoreBreakdown {
    return {
      structureConsistency: 0,
      contentConsistency: 0,
      formattingConsistency: 0,
      dataConsistency: 0,
      timingConsistency: 0,
      hashConsistency: 0,
      overallConsistency: 0,
    };
  }

  /**
   * Get perfect consistency score for single result
   */
  private getPerfectConsistencyScore(testResult: TestResult): ConsistencyScoreBreakdown {
    return {
      structureConsistency: 100,
      contentConsistency: 100,
      formattingConsistency: 100,
      dataConsistency: 100,
      timingConsistency: 100,
      hashConsistency: 100,
      overallConsistency: 100,
    };
  }

  /**
   * Get empty consistency measurement
   */
  private getEmptyConsistencyMeasurement(): ConsistencyMeasurement {
    return {
      testCaseId: 'unknown',
      runs: 0,
      successfulRuns: 0,
      consistencyScore: 0,
      variance: 0,
      mostCommonOutputHash: undefined,
      hashDistribution: {},
      timingStats: {
        averageMs: 0,
        minMs: 0,
        maxMs: 0,
        stdDevMs: 0,
      },
    };
  }

  /**
   * Calculate statistical metrics for a set of values
   */
  calculateStatisticalMetrics(values: number[]): StatisticalMetrics {
    if (values.length === 0) {
      return {
        mean: 0,
        median: 0,
        mode: 0,
        standardDeviation: 0,
        variance: 0,
        min: 0,
        max: 0,
        range: 0,
        coefficientOfVariation: 0,
      };
    }
    
    // Sort values
    const sortedValues = [...values].sort((a, b) => a - b);
    
    // Calculate mean
    const mean = sortedValues.reduce((sum, val) => sum + val, 0) / sortedValues.length;
    
    // Calculate median
    const mid = Math.floor(sortedValues.length / 2);
    const median = sortedValues.length % 2 === 0
      ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
      : sortedValues[mid];
    
    // Calculate mode
    const frequency: Record<number, number> = {};
    let maxFreq = 0;
    let mode = sortedValues[0];
    
    for (const val of sortedValues) {
      frequency[val] = (frequency[val] || 0) + 1;
      if (frequency[val] > maxFreq) {
        maxFreq = frequency[val];
        mode = val;
      }
    }
    
    // Calculate variance and standard deviation
    const variance = sortedValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sortedValues.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Calculate min, max, range
    const min = sortedValues[0];
    const max = sortedValues[sortedValues.length - 1];
    const range = max - min;
    
    // Calculate coefficient of variation
    const coefficientOfVariation = mean > 0 ? (standardDeviation / mean) * 100 : 0;
    
    return {
      mean: Math.round(mean * 100) / 100,
      median: Math.round(median * 100) / 100,
      mode: Math.round(mode * 100) / 100,
      standardDeviation: Math.round(standardDeviation * 100) / 100,
      variance: Math.round(variance * 100) / 100,
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      range: Math.round(range * 100) / 100,
      coefficientOfVariation: Math.round(coefficientOfVariation * 100) / 100,
    };
  }

  /**
   * Determine if consistency is acceptable
   */
  isConsistencyAcceptable(consistencyScore: number): boolean {
    return consistencyScore >= this.config.consistencyThreshold;
  }

  /**
   * Generate consistency report
   */
  generateConsistencyReport(
    breakdown: ConsistencyScoreBreakdown,
    measurement: ConsistencyMeasurement
  ): string {
    let report = `# Consistency Analysis Report\n\n`;
    
    report += `## Overall Consistency\n`;
    report += `- Overall Consistency Score: ${breakdown.overallConsistency}%\n`;
    report += `- Threshold: ${this.config.consistencyThreshold}%\n`;
    report += `- Acceptable: ${this.isConsistencyAcceptable(breakdown.overallConsistency) ? 'YES' : 'NO'}\n\n`;
    
    report += `## Consistency Breakdown\n`;
    report += `- Structure Consistency: ${breakdown.structureConsistency}%\n`;
    report += `- Content Consistency: ${breakdown.contentConsistency}%\n`;
    report += `- Formatting Consistency: ${breakdown.formattingConsistency}%\n`;
    report += `- Data Consistency: ${breakdown.dataConsistency}%\n`;
    report += `- Timing Consistency: ${breakdown.timingConsistency}%\n`;
    report += `- Hash Consistency: ${breakdown.hashConsistency}%\n\n`;
    
    report += `## Measurement Results\n`;
    report += `- Total Runs: ${measurement.runs}\n`;
    report += `- Successful Runs: ${measurement.successfulRuns}\n`;
    report += `- Success Rate: ${measurement.runs > 0 ? Math.round((measurement.successfulRuns / measurement.runs) * 100) : 0}%\n`;
    report += `- Consistency Score: ${measurement.consistencyScore}%\n`;
    report += `- Variance: ${measurement.variance.toFixed(2)}\n\n`;
    
    report += `## Timing Statistics\n`;
    report += `- Average Time: ${measurement.timingStats.averageMs}ms\n`;
    report += `- Minimum Time: ${measurement.timingStats.minMs}ms\n`;
    report += `- Maximum Time: ${measurement.timingStats.maxMs}ms\n`;
    report += `- Standard Deviation: ${measurement.timingStats.stdDevMs}ms\n\n`;
    
    if (Object.keys(measurement.hashDistribution).length > 0) {
      report += `## Hash Distribution\n`;
      for (const [hash, count] of Object.entries(measurement.hashDistribution)) {
        const percentage = Math.round((count / measurement.runs) * 100);
        report += `- ${hash}: ${count} runs (${percentage}%)\n`;
      }
      report += `\n`;
    }
    
    report += `## Recommendations\n`;
    if (this.isConsistencyAcceptable(breakdown.overallConsistency)) {
      report += `Consistency is ACCEPTABLE. The report generation process is sufficiently reproducible.\n`;
    } else {
      report += `Consistency is UNACCEPTABLE. Review the generation process to improve reproducibility.\n`;
      
      // Provide specific recommendations based on low scores
      const recommendations: string[] = [];
      
      if (breakdown.structureConsistency < this.config.consistencyThreshold) {
        recommendations.push('Improve structure consistency by ensuring consistent section hierarchy and ordering.');
      }
      
      if (breakdown.contentConsistency < this.config.consistencyThreshold) {
        recommendations.push('Improve content consistency by standardizing text generation and template usage.');
      }
      
      if (breakdown.formattingConsistency < this.config.consistencyThreshold) {
        recommendations.push('Improve formatting consistency by using consistent styling and layout rules.');
      }
      
      if (breakdown.dataConsistency < this.config.consistencyThreshold) {
        recommendations.push('Improve data consistency by validating input data and calculation methods.');
      }
      
      if (breakdown.timingConsistency < this.config.consistencyThreshold) {
        recommendations.push('Improve timing consistency by optimizing performance and reducing variability.');
      }
      
      if (breakdown.hashConsistency < this.config.consistencyThreshold) {
        recommendations.push('Improve hash consistency by ensuring deterministic output generation.');
      }
      
      if (recommendations.length > 0) {
        report += `\n### Specific Recommendations:\n`;
        for (const rec of recommendations) {
          report += `- ${rec}\n`;
        }
      }
    }
    
    return report;
  }

  /**
   * Get configuration
   */
  getConfig(): ScoringConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ScoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}