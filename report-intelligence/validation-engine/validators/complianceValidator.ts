/**
 * Report Validation Engine - Phase 4
 * Compliance Validator Module
 * 
 * Validates compliance with regulatory standards and requirements.
 */

import type { SchemaMappingResult } from '../../schema-mapper/SchemaMappingResult';
import type { ValidationRule } from '../ValidationResult';

/**
 * Compliance validation result
 */
export interface ComplianceValidationResult {
  passed: boolean;
  violations: Array<{
    standard: string;
    clause?: string;
    requirement: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  }>;
  complianceScore: number; // 0-100
}

/**
 * Compliance validator class
 */
export class ComplianceValidator {
  private knownStandards = [
    'BS5837:2012',
    'ISO 9001:2015',
    'ISO 14001:2015',
    'ISO 45001:2018',
    'Building Regulations 2010',
    'CDM Regulations 2015',
  ];

  /**
   * Validate compliance for a schema mapping result
   */
  validate(
    schemaMappingResult: SchemaMappingResult,
    rule: ValidationRule
  ): ComplianceValidationResult {
    const result: ComplianceValidationResult = {
      passed: true,
      violations: [],
      complianceScore: 100, // Start with perfect score
    };

    // Check for missing required sections (critical compliance issue)
    if (schemaMappingResult.missingRequiredSections.length > 0) {
      result.passed = false;
      result.violations.push({
        standard: 'Report Structure',
        requirement: 'Required Sections Present',
        description: `Missing ${schemaMappingResult.missingRequiredSections.length} required section(s)`,
        severity: 'critical',
      });
      result.complianceScore -= 30; // Significant deduction for missing sections
    }

    // Check for compliance standard references
    const hasComplianceReferences = this.checkComplianceReferences(schemaMappingResult);
    if (!hasComplianceReferences) {
      result.passed = false;
      result.violations.push({
        standard: 'General Compliance',
        requirement: 'Compliance Standard References',
        description: 'Missing references to applicable compliance standards',
        severity: 'high',
      });
      result.complianceScore -= 20;
    }

    // Check for regulatory terminology
    const terminologyIssues = this.checkRegulatoryTerminology(schemaMappingResult);
    if (terminologyIssues.length > 0) {
      result.passed = false;
      result.violations.push(...terminologyIssues);
      result.complianceScore -= terminologyIssues.length * 5;
    }

    // Ensure score doesn't go below 0
    result.complianceScore = Math.max(0, result.complianceScore);

    return result;
  }

  /**
   * Check if the report contains references to compliance standards
   */
  private checkComplianceReferences(schemaMappingResult: SchemaMappingResult): boolean {
    // Check mapped fields for compliance standard references
    const complianceKeywords = [
      'compliance', 'standard', 'regulation', 'requirement', 'clause',
      'BS5837', 'ISO', 'Building Regulations', 'CDM',
    ];

    for (const field of schemaMappingResult.mappedFields) {
      const value = field.mappedValue;
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        for (const keyword of complianceKeywords) {
          if (lowerValue.includes(keyword.toLowerCase())) {
            return true;
          }
        }
      }
    }

    // Check extra sections
    for (const section of schemaMappingResult.extraSections) {
      if (section.sectionTitle && complianceKeywords.some(kw =>
        section.sectionTitle.toLowerCase().includes(kw.toLowerCase())
      )) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check for proper use of regulatory terminology
   */
  private checkRegulatoryTerminology(schemaMappingResult: SchemaMappingResult): Array<{
    standard: string;
    requirement: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  }> {
    const issues: Array<{
      standard: string;
      requirement: string;
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    }> = [];

    // Check for proper regulatory terminology usage
    const regulatoryTerms = {
      'BS5837:2012': ['fire risk assessment', 'means of escape', 'fire compartmentation', 'fire resistance'],
      'Building Regulations': ['part b', 'part l', 'part f', 'part m', 'approved document'],
      'CDM Regulations': ['principal designer', 'principal contractor', 'construction phase plan', 'health and safety file'],
    };

    // Check each mapped field for terminology issues
    for (const field of schemaMappingResult.mappedFields) {
      const value = field.mappedValue;
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        
        // Check for incorrect terminology
        if (lowerValue.includes('fire assessment') && !lowerValue.includes('fire risk assessment')) {
          issues.push({
            standard: 'BS5837:2012',
            requirement: 'Correct Terminology',
            description: 'Use "fire risk assessment" instead of "fire assessment"',
            severity: 'medium',
          });
        }
      }
    }

    return issues;
  }

  /**
   * Get all known compliance standards
   */
  getKnownStandards(): string[] {
    return [...this.knownStandards];
  }

  /**
   * Add a custom compliance standard
   */
  addStandard(standard: string): void {
    if (!this.knownStandards.includes(standard)) {
      this.knownStandards.push(standard);
    }
  }

  /**
   * Check if a specific standard is applicable to the report type
   */
  isStandardApplicable(standard: string, reportTypeId?: string): boolean {
    // Simplified logic - in real system, would check report type requirements
    if (reportTypeId?.includes('fire')) {
      return standard.includes('BS5837') || standard.includes('fire');
    }
    
    if (reportTypeId?.includes('construction')) {
      return standard.includes('CDM') || standard.includes('Building Regulations');
    }
    
    return true; // Default to applicable
  }
}