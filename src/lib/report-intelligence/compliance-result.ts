/**
 * ComplianceResult interface
 *
 * Represents the overall compliance validation results for a document.
 * This interface aggregates individual compliance checks and provides summary information.
 */
import type { ComplianceCheck } from './compliance-check';

export interface ComplianceResult {
  /**
   * Unique identifier for the document being validated
   */
  documentId: string;

  /**
   * Overall compliance status
   * true if all checks passed, false if any checks failed
   */
  overallCompliance: boolean;

  /**
   * Detailed results from individual compliance checks
   * array of ComplianceCheck objects with specific validation results
   */
  detailedResults: ComplianceCheck[];

  /**
   * Recommendations for improving compliance
   * array of strings with specific suggestions
   */
  recommendations: string[];

  /**
   * ISO timestamp when the compliance validation was completed
   */
  timestamp: string;

  /**
   * Summary statistics about the compliance validation
   * includes total checks, passed count, failed count, etc.
   */
  summary: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    warningCount: number;
    errorCount: number;
  };

  /**
   * Compliance score (0-100)
   * calculated based on the ratio of passed checks to total checks
   */
  complianceScore: number;

  /**
   * Critical compliance issues that require immediate attention
   * array of strings describing critical problems
   */
  criticalIssues: string[];

  /**
   * Optional metadata about the compliance validation process
   * can include information about validators, standards versions, etc.
   */
  metadata?: Record<string, any>;
}