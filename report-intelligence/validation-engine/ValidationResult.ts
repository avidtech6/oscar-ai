/**
 * Report Validation Engine - Phase 4
 * ValidationResult Interface
 * 
 * This defines the structure for validation results after processing.
 */

import type { SchemaMappingResult } from '../schema-mapper/SchemaMappingResult';
import type { ReportTypeDefinition } from '../registry/ReportTypeDefinition';

/**
 * Validation rule severity levels
 */
export type ValidationSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

/**
 * Validation rule types
 */
export type ValidationRuleType = 
  | 'compliance' 
  | 'quality' 
  | 'completeness' 
  | 'consistency' 
  | 'terminology'
  | 'formatting'
  | 'data_quality'
  | 'logical_coherence';

/**
 * A validation rule definition
 */
export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  type: ValidationRuleType;
  severity: ValidationSeverity;
  appliesTo: string[]; // Report type IDs or 'all'
  
  // Rule configuration
  condition: string | ((report: any, context: any) => boolean);
  messageTemplate: string;
  remediationGuidance?: string;
  
  // Metadata
  source: 'system' | 'organization' | 'regulation' | 'custom';
  regulationStandard?: string; // e.g., 'BS5837:2012', 'ISO 9001'
  version: string;
  enabled: boolean;
  
  // Scoring
  weight: number; // 1-10 weight for scoring
  autoFixable: boolean;
  requiresHumanReview: boolean;
}

/**
 * A validation finding (individual issue)
 */
export interface ValidationFinding {
  id: string;
  ruleId: string;
  ruleName: string;
  ruleType: ValidationRuleType;
  severity: ValidationSeverity;
  
  // Finding details
  description: string;
  location?: {
    sectionId?: string;
    fieldId?: string;
    lineNumber?: number;
    characterRange?: [number, number];
  };
  
  // Context
  contextData: any;
  evidence?: string; // Text evidence supporting the finding
  
  // Remediation
  suggestedFix?: string;
  remediationGuidance?: string;
  autoFixable: boolean;
  
  // Metadata
  detectedAt: Date;
  confidence: number; // 0-1 confidence in the finding
}

/**
 * A compliance violation
 */
export interface ComplianceViolation {
  id: string;
  standard: string; // e.g., 'BS5837:2012'
  clause?: string; // Specific clause reference
  requirement: string;
  severity: ValidationSeverity;
  
  // Violation details
  description: string;
  location?: string;
  evidence?: string;
  
  // Impact
  potentialImpact?: string;
  regulatoryConsequence?: string;
  
  // Status
  status: 'open' | 'acknowledged' | 'mitigated' | 'resolved';
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolutionNotes?: string;
}

/**
 * A quality issue
 */
export interface QualityIssue {
  id: string;
  category: 'clarity' | 'accuracy' | 'completeness' | 'consistency' | 'formatting' | 'professionalism';
  description: string;
  severity: ValidationSeverity;
  
  // Issue details
  example?: string;
  suggestedImprovement?: string;
  
  // Scoring impact
  scoreImpact: number; // 0-100 impact on quality score
}

/**
 * Validation scores
 */
export interface ValidationScores {
  complianceScore: number; // 0-100 percentage of compliance rules passed
  qualityScore: number; // 0-100 quality assessment
  completenessScore: number; // 0-100 completeness assessment
  consistencyScore: number; // 0-100 consistency assessment
  overallScore: number; // 0-100 weighted overall score
  
  // Breakdown
  ruleTypeScores: Record<ValidationRuleType, number>;
  severityCounts: Record<ValidationSeverity, number>;
}

/**
 * The complete validation result
 */
export interface ValidationResult {
  // Core identification
  id: string;
  schemaMappingResultId: string;
  decompiledReportId: string;
  reportTypeId?: string;
  reportTypeName?: string;
  
  // Validation results
  findings: ValidationFinding[];
  complianceViolations: ComplianceViolation[];
  qualityIssues: QualityIssue[];
  
  // Scores
  scores: ValidationScores;
  
  // Rule execution
  rulesExecuted: number;
  rulesPassed: number;
  rulesFailed: number;
  rulesSkipped: number;
  
  // Processing metadata
  processingTimeMs: number;
  validatorVersion: string;
  validationStrategy: 'automatic' | 'semi_automatic' | 'manual';
  
  // Timestamps
  createdAt: Date;
  validatedAt: Date;
  
  // References
  schemaMappingResultSnapshot?: Partial<SchemaMappingResult>;
  reportTypeDefinitionSnapshot?: Partial<ReportTypeDefinition>;
  
  // Status
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  error?: string;
}

/**
 * Helper function to create a new ValidationResult
 */
export function createValidationResult(
  schemaMappingResultId: string,
  decompiledReportId: string,
  reportTypeId?: string
): Omit<ValidationResult, 'id' | 'createdAt' | 'validatedAt'> {
  const now = new Date();
  
  return {
    schemaMappingResultId,
    decompiledReportId,
    reportTypeId,
    reportTypeName: undefined,
    findings: [],
    complianceViolations: [],
    qualityIssues: [],
    scores: {
      complianceScore: 0,
      qualityScore: 0,
      completenessScore: 0,
      consistencyScore: 0,
      overallScore: 0,
      ruleTypeScores: {
        compliance: 0,
        quality: 0,
        completeness: 0,
        consistency: 0,
        terminology: 0,
        formatting: 0,
        data_quality: 0,
        logical_coherence: 0,
      },
      severityCounts: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
      },
    },
    rulesExecuted: 0,
    rulesPassed: 0,
    rulesFailed: 0,
    rulesSkipped: 0,
    processingTimeMs: 0,
    validatorVersion: '1.0.0',
    validationStrategy: 'automatic',
    schemaMappingResultSnapshot: undefined,
    reportTypeDefinitionSnapshot: undefined,
    status: 'pending',
  };
}

/**
 * Calculate overall validation score from component scores
 */
export function calculateOverallScore(scores: ValidationScores): number {
  // Weighted average with emphasis on compliance and quality
  const weights = {
    complianceScore: 0.35,
    qualityScore: 0.30,
    completenessScore: 0.20,
    consistencyScore: 0.15,
  };
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  if (scores.complianceScore !== undefined) {
    weightedSum += scores.complianceScore * weights.complianceScore;
    totalWeight += weights.complianceScore;
  }
  
  if (scores.qualityScore !== undefined) {
    weightedSum += scores.qualityScore * weights.qualityScore;
    totalWeight += weights.qualityScore;
  }
  
  if (scores.completenessScore !== undefined) {
    weightedSum += scores.completenessScore * weights.completenessScore;
    totalWeight += weights.completenessScore;
  }
  
  if (scores.consistencyScore !== undefined) {
    weightedSum += scores.consistencyScore * weights.consistencyScore;
    totalWeight += weights.consistencyScore;
  }
  
  // Normalize by total weight
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Generate a unique ID for a validation result
 */
export function generateValidationResultId(): string {
  return `validation_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a unique ID for a validation finding
 */
export function generateValidationFindingId(): string {
  return `finding_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a unique ID for a compliance violation
 */
export function generateComplianceViolationId(): string {
  return `violation_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a unique ID for a quality issue
 */
export function generateQualityIssueId(): string {
  return `quality_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}