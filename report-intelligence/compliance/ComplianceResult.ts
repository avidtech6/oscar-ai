/**
 * Phase 9: Report Compliance Validator
 * ComplianceResult Interface
 * 
 * Defines the structure for compliance validation results.
 */

import type { DecompiledReport } from '../decompiler/DecompiledReport';
import type { SchemaMappingResult } from '../schema-mapper/SchemaMappingResult';
// Note: ReportTemplate import commented out as Phase 8 (Template Generator) may not be implemented yet
// import type { ReportTemplate } from '../template-generator/ReportTemplate';

/**
 * Compliance validation status
 */
export type ComplianceStatus = 'passed' | 'failed' | 'partial' | 'unknown';

/**
 * Issue severity levels
 */
export type ComplianceSeverity = 'critical' | 'high' | 'medium' | 'low' | 'warning';

/**
 * Missing required section
 */
export interface MissingRequiredSection {
  sectionId: string;
  sectionName: string;
  requirementSource: string; // e.g., 'BS5837:2012 Section 4.2'
  severity: ComplianceSeverity;
  description: string;
  remediationGuidance: string;
}

/**
 * Missing required field
 */
export interface MissingRequiredField {
  fieldId: string;
  fieldName: string;
  sectionId: string;
  requirementSource: string;
  severity: ComplianceSeverity;
  description: string;
  remediationGuidance: string;
}

/**
 * Failed compliance rule
 */
export interface FailedComplianceRule {
  ruleId: string;
  ruleName: string;
  standard: string; // e.g., 'BS5837:2012', 'AIA', 'AMS'
  clause?: string; // Specific clause reference
  requirement: string;
  severity: ComplianceSeverity;
  description: string;
  evidence?: string;
  remediationGuidance: string;
}

/**
 * Structural issue
 */
export interface StructuralIssue {
  issueId: string;
  issueType: 'hierarchy' | 'ordering' | 'nesting' | 'duplication' | 'orphaned';
  location: string;
  description: string;
  severity: ComplianceSeverity;
  expectedStructure: string;
  actualStructure: string;
  remediationGuidance: string;
}

/**
 * Terminology issue
 */
export interface TerminologyIssue {
  term: string;
  issueType: 'non_standard' | 'ambiguous' | 'inconsistent' | 'outdated';
  location: string;
  description: string;
  severity: ComplianceSeverity;
  suggestedTerm?: string;
  standardReference?: string;
  remediationGuidance: string;
}

/**
 * Contradiction detection
 */
export interface Contradiction {
  contradictionId: string;
  type: 'logical' | 'temporal' | 'methodological' | 'data' | 'recommendation';
  locationA: string;
  locationB: string;
  description: string;
  severity: ComplianceSeverity;
  evidenceA?: string;
  evidenceB?: string;
  resolutionGuidance: string;
}

/**
 * Warning (non-blocking issue)
 */
export interface ComplianceWarning {
  warningId: string;
  type: 'best_practice' | 'consistency' | 'formatting' | 'completeness';
  location: string;
  description: string;
  suggestion: string;
  impact: 'low' | 'medium' | 'high';
}

/**
 * The complete compliance validation result
 */
export interface ComplianceResult {
  // Core identification
  id: string;
  reportTypeId: string;
  reportTypeName: string;
  
  // Input references
  decompiledReportId?: string;
  schemaMappingResultId?: string;
  templateId?: string;
  
  // Overall result
  passed: boolean;
  status: ComplianceStatus;
  confidenceScore: number; // 0-100
  
  // Issues by category
  missingRequiredSections: MissingRequiredSection[];
  missingRequiredFields: MissingRequiredField[];
  failedComplianceRules: FailedComplianceRule[];
  structuralIssues: StructuralIssue[];
  terminologyIssues: TerminologyIssue[];
  contradictions: Contradiction[];
  warnings: ComplianceWarning[];
  
  // Scoring breakdown
  scores: {
    requiredSectionsScore: number; // 0-100
    requiredFieldsScore: number; // 0-100
    complianceRulesScore: number; // 0-100
    structureScore: number; // 0-100
    terminologyScore: number; // 0-100
    consistencyScore: number; // 0-100
    overallScore: number; // 0-100 weighted average
  };
  
  // Validation metadata
  validatorVersion: string;
  validationStrategy: 'automatic' | 'semi_automatic' | 'manual';
  processingTimeMs: number;
  
  // Timestamps
  createdAt: Date;
  validatedAt: Date;
  expiresAt?: Date; // For time-sensitive compliance
  
  // References
  standardsApplied: string[]; // e.g., ['BS5837:2012', 'AIA', 'AMS']
  validationScope: string; // e.g., 'full', 'structural', 'terminology'
  
  // Status tracking
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  nextReviewDate?: Date;
}

/**
 * Helper function to create a new ComplianceResult
 */
export function createComplianceResult(
  reportTypeId: string,
  reportTypeName: string
): Omit<ComplianceResult, 'id' | 'createdAt' | 'validatedAt'> {
  const now = new Date();
  
  return {
    reportTypeId,
    reportTypeName,
    decompiledReportId: undefined,
    schemaMappingResultId: undefined,
    templateId: undefined,
    passed: false,
    status: 'unknown',
    confidenceScore: 0,
    missingRequiredSections: [],
    missingRequiredFields: [],
    failedComplianceRules: [],
    structuralIssues: [],
    terminologyIssues: [],
    contradictions: [],
    warnings: [],
    scores: {
      requiredSectionsScore: 0,
      requiredFieldsScore: 0,
      complianceRulesScore: 0,
      structureScore: 0,
      terminologyScore: 0,
      consistencyScore: 0,
      overallScore: 0,
    },
    validatorVersion: '1.0.0',
    validationStrategy: 'automatic',
    processingTimeMs: 0,
    standardsApplied: [],
    validationScope: 'full',
    reviewedBy: undefined,
    reviewedAt: undefined,
    reviewNotes: undefined,
    nextReviewDate: undefined,
  };
}

/**
 * Calculate overall compliance score from component scores
 */
export function calculateOverallComplianceScore(scores: ComplianceResult['scores']): number {
  // Weighted average with emphasis on required sections and compliance rules
  const weights = {
    requiredSectionsScore: 0.30,  // Most important - missing required sections is critical
    requiredFieldsScore: 0.25,     // Important - missing fields affects completeness
    complianceRulesScore: 0.20,    // Important - compliance with standards
    structureScore: 0.10,          // Moderate - structure affects readability
    terminologyScore: 0.10,        // Moderate - terminology affects clarity
    consistencyScore: 0.05,        // Less critical - consistency is important but not blocking
  };
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  if (scores.requiredSectionsScore !== undefined) {
    weightedSum += scores.requiredSectionsScore * weights.requiredSectionsScore;
    totalWeight += weights.requiredSectionsScore;
  }
  
  if (scores.requiredFieldsScore !== undefined) {
    weightedSum += scores.requiredFieldsScore * weights.requiredFieldsScore;
    totalWeight += weights.requiredFieldsScore;
  }
  
  if (scores.complianceRulesScore !== undefined) {
    weightedSum += scores.complianceRulesScore * weights.complianceRulesScore;
    totalWeight += weights.complianceRulesScore;
  }
  
  if (scores.structureScore !== undefined) {
    weightedSum += scores.structureScore * weights.structureScore;
    totalWeight += weights.structureScore;
  }
  
  if (scores.terminologyScore !== undefined) {
    weightedSum += scores.terminologyScore * weights.terminologyScore;
    totalWeight += weights.terminologyScore;
  }
  
  if (scores.consistencyScore !== undefined) {
    weightedSum += scores.consistencyScore * weights.consistencyScore;
    totalWeight += weights.consistencyScore;
  }
  
  // Normalize by total weight
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

/**
 * Determine if compliance passed based on scores and issues
 */
export function determineComplianceStatus(
  result: ComplianceResult
): ComplianceStatus {
  // Critical failures automatically fail
  const hasCriticalIssues = 
    result.missingRequiredSections.some(s => s.severity === 'critical') ||
    result.missingRequiredFields.some(f => f.severity === 'critical') ||
    result.failedComplianceRules.some(r => r.severity === 'critical') ||
    result.contradictions.some(c => c.severity === 'critical');
  
  if (hasCriticalIssues) {
    return 'failed';
  }
  
  // Check scores
  if (result.scores.overallScore >= 90) {
    return 'passed';
  } else if (result.scores.overallScore >= 70) {
    return 'partial';
  } else {
    return 'failed';
  }
}

/**
 * Generate a unique ID for a compliance result
 */
export function generateComplianceResultId(): string {
  return `compliance_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a unique ID for a missing section
 */
export function generateMissingSectionId(): string {
  return `missing_section_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a unique ID for a missing field
 */
export function generateMissingFieldId(): string {
  return `missing_field_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a unique ID for a failed rule
 */
export function generateFailedRuleId(): string {
  return `failed_rule_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a unique ID for a structural issue
 */
export function generateStructuralIssueId(): string {
  return `structural_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a unique ID for a terminology issue
 */
export function generateTerminologyIssueId(): string {
  return `terminology_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a unique ID for a contradiction
 */
export function generateContradictionId(): string {
  return `contradiction_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a unique ID for a warning
 */
export function generateWarningId(): string {
  return `warning_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}