/**
 * Report Validation Engine - Phase 4
 * Completeness Validator Module
 * 
 * Validates report completeness aspects like required sections, content depth, and coverage.
 */

import type { SchemaMappingResult } from '../../schema-mapper/SchemaMappingResult';
import type { ValidationRule } from '../ValidationResult';

/**
 * Completeness validation result
 */
export interface CompletenessValidationResult {
  passed: boolean;
  issues: Array<{
    type: 'missing_section' | 'insufficient_content' | 'missing_data' | 'incomplete_coverage';
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    affectedSection?: string;
    requiredContent?: string;
  }>;
  completenessScore: number; // 0-100
  missingSectionsCount: number;
  insufficientContentCount: number;
}

/**
 * Completeness validator class
 */
export class CompletenessValidator {
  private minimumContentLength = 50; // Minimum characters for a section to be considered complete
  private requiredDataTypes = ['date', 'location', 'reference', 'assessment'];

  /**
   * Validate completeness for a schema mapping result
   */
  validate(
    schemaMappingResult: SchemaMappingResult,
    rule: ValidationRule
  ): CompletenessValidationResult {
    const result: CompletenessValidationResult = {
      passed: true,
      issues: [],
      completenessScore: 100, // Start with perfect score
      missingSectionsCount: 0,
      insufficientContentCount: 0,
    };

    // Check missing required sections
    const missingSectionIssues = this.checkMissingSections(schemaMappingResult);
    if (missingSectionIssues.length > 0) {
      result.passed = false;
      result.issues.push(...missingSectionIssues);
      result.missingSectionsCount = missingSectionIssues.length;
      result.completenessScore -= missingSectionIssues.length * 20; // Significant deduction for missing sections
    }

    // Check insufficient content
    const insufficientContentIssues = this.checkInsufficientContent(schemaMappingResult);
    if (insufficientContentIssues.length > 0) {
      result.passed = false;
      result.issues.push(...insufficientContentIssues);
      result.insufficientContentCount = insufficientContentIssues.length;
      result.completenessScore -= insufficientContentIssues.length * 10;
    }

    // Check missing required data
    const missingDataIssues = this.checkMissingRequiredData(schemaMappingResult);
    if (missingDataIssues.length > 0) {
      result.passed = false;
      result.issues.push(...missingDataIssues);
      result.completenessScore -= missingDataIssues.length * 15;
    }

    // Check coverage completeness
    const coverageIssues = this.checkCoverageCompleteness(schemaMappingResult);
    if (coverageIssues.length > 0) {
      result.passed = false;
      result.issues.push(...coverageIssues);
      result.completenessScore -= coverageIssues.length * 5;
    }

    // Ensure score doesn't go below 0
    result.completenessScore = Math.max(0, result.completenessScore);

    return result;
  }

  /**
   * Check for missing required sections
   */
  private checkMissingSections(schemaMappingResult: SchemaMappingResult): Array<{
    type: 'missing_section';
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    affectedSection?: string;
    requiredContent?: string;
  }> {
    const issues: Array<{
      type: 'missing_section';
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
      affectedSection?: string;
      requiredContent?: string;
    }> = [];

    // Check missing required sections from schema mapping result
    for (const missingSection of schemaMappingResult.missingRequiredSections) {
      issues.push({
        type: 'missing_section',
        description: `Missing required section: ${missingSection.sectionName}`,
        severity: missingSection.required ? 'critical' : 'high',
        affectedSection: missingSection.sectionName,
        requiredContent: missingSection.suggestedContent,
      });
    }

    return issues;
  }

  /**
   * Check for insufficient content in sections
   */
  private checkInsufficientContent(schemaMappingResult: SchemaMappingResult): Array<{
    type: 'insufficient_content';
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    affectedSection?: string;
    requiredContent?: string;
  }> {
    const issues: Array<{
      type: 'insufficient_content';
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
      affectedSection?: string;
      requiredContent?: string;
    }> = [];

    // Check mapped fields for insufficient content
    for (const field of schemaMappingResult.mappedFields) {
      const value = field.mappedValue;
      
      if (typeof value === 'string') {
        const contentLength = value.trim().length;
        
        if (contentLength < this.minimumContentLength) {
          issues.push({
            type: 'insufficient_content',
            description: `Section "${field.fieldName}" has insufficient content (${contentLength} characters)`,
            severity: contentLength < 10 ? 'high' : 'medium',
            affectedSection: field.fieldName,
            requiredContent: `Minimum ${this.minimumContentLength} characters recommended`,
          });
        }
      } else if (value === null || value === undefined || value === '') {
        issues.push({
          type: 'insufficient_content',
          description: `Section "${field.fieldName}" is empty`,
          severity: 'high',
          affectedSection: field.fieldName,
          requiredContent: 'Content required for this section',
        });
      }
    }

    return issues;
  }

  /**
   * Check for missing required data types
   */
  private checkMissingRequiredData(schemaMappingResult: SchemaMappingResult): Array<{
    type: 'missing_data';
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    affectedSection?: string;
    requiredContent?: string;
  }> {
    const issues: Array<{
      type: 'missing_data';
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
      affectedSection?: string;
      requiredContent?: string;
    }> = [];

    // Check for date information
    const hasDate = this.checkForDataType(schemaMappingResult, 'date');
    if (!hasDate) {
      issues.push({
        type: 'missing_data',
        description: 'Missing date information',
        severity: 'high',
        requiredContent: 'Include assessment date, report date, or relevant dates',
      });
    }

    // Check for location information
    const hasLocation = this.checkForDataType(schemaMappingResult, 'location');
    if (!hasLocation) {
      issues.push({
        type: 'missing_data',
        description: 'Missing location information',
        severity: 'high',
        requiredContent: 'Include site address, location details, or geographical information',
      });
    }

    // Check for reference information
    const hasReference = this.checkForDataType(schemaMappingResult, 'reference');
    if (!hasReference) {
      issues.push({
        type: 'missing_data',
        description: 'Missing reference information',
        severity: 'medium',
        requiredContent: 'Include report references, document numbers, or identifiers',
      });
    }

    return issues;
  }

  /**
   * Check for specific data type in the report
   */
  private checkForDataType(schemaMappingResult: SchemaMappingResult, dataType: string): boolean {
    const dataTypePatterns: Record<string, RegExp[]> = {
      date: [
        /\d{1,2}\/\d{1,2}\/\d{4}/, // MM/DD/YYYY
        /\d{1,2}-\d{1,2}-\d{4}/, // MM-DD-YYYY
        /\d{4}-\d{1,2}-\d{1,2}/, // YYYY-MM-DD
        /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/i,
      ],
      location: [
        /\b(address|location|site|property|building)\b/i,
        /\b(road|street|avenue|lane|drive|way)\b/i,
        /\b(postcode|zip code|postal code)\b/i,
        /[A-Z]{1,2}\d{1,2}\s?\d{1,2}[A-Z]{2}/i, // UK postcode pattern
      ],
      reference: [
        /\b(ref|reference|no\.|number|id|identifier)\s*[:#]?\s*[A-Z0-9\-]+\b/i,
        /\b(project|report|document)\s+(no\.|number|id)\s*[:#]?\s*[A-Z0-9\-]+\b/i,
      ],
      assessment: [
        /\b(assessment|evaluation|analysis|review|inspection)\b/i,
        /\b(findings|conclusions|recommendations|observations)\b/i,
        /\b(risk|hazard|safety|compliance)\b/i,
      ],
    };

    const patterns = dataTypePatterns[dataType] || [];
    
    for (const field of schemaMappingResult.mappedFields) {
      const value = field.mappedValue;
      if (typeof value === 'string') {
        for (const pattern of patterns) {
          if (pattern.test(value)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Check coverage completeness
   */
  private checkCoverageCompleteness(schemaMappingResult: SchemaMappingResult): Array<{
    type: 'incomplete_coverage';
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    affectedSection?: string;
    requiredContent?: string;
  }> {
    const issues: Array<{
      type: 'incomplete_coverage';
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
      affectedSection?: string;
      requiredContent?: string;
    }> = [];

    // Check mapping coverage
    if (schemaMappingResult.mappingCoverage < 80) {
      issues.push({
        type: 'incomplete_coverage',
        description: `Low mapping coverage (${schemaMappingResult.mappingCoverage}%)`,
        severity: schemaMappingResult.mappingCoverage < 50 ? 'high' : 'medium',
        requiredContent: 'Ensure all report sections are properly mapped to the schema',
      });
    }

    // Check for unmapped sections
    if (schemaMappingResult.unmappedSections.length > 0) {
      issues.push({
        type: 'incomplete_coverage',
        description: `${schemaMappingResult.unmappedSections.length} unmapped section(s)`,
        severity: schemaMappingResult.unmappedSections.length > 3 ? 'medium' : 'low',
        requiredContent: 'Review unmapped sections for potential schema updates',
      });
    }

    return issues;
  }

  /**
   * Calculate content depth score
   */
  calculateContentDepthScore(schemaMappingResult: SchemaMappingResult): number {
    let totalContentLength = 0;
    let sectionCount = 0;
    
    for (const field of schemaMappingResult.mappedFields) {
      const value = field.mappedValue;
      if (typeof value === 'string') {
        totalContentLength += value.trim().length;
        sectionCount++;
      }
    }
    
    if (sectionCount === 0) return 0;
    
    const averageLength = totalContentLength / sectionCount;
    
    // Score based on average content length per section
    if (averageLength >= 500) return 100; // Excellent depth
    if (averageLength >= 300) return 80;  // Good depth
    if (averageLength >= 150) return 60;  // Adequate depth
    if (averageLength >= 50) return 40;   // Minimal depth
    return 20; // Poor depth
  }

  /**
   * Get completeness assessment summary
   */
  getCompletenessSummary(score: number): string {
    if (score >= 90) return 'Complete and comprehensive';
    if (score >= 80) return 'Mostly complete';
    if (score >= 70) return 'Adequately complete';
    if (score >= 60) return 'Partially complete';
    return 'Incomplete - significant gaps';
  }

  /**
   * Set minimum content length requirement
   */
  setMinimumContentLength(length: number): void {
    this.minimumContentLength = Math.max(10, length);
  }

  /**
   * Add required data type
   */
  addRequiredDataType(dataType: string): void {
    if (!this.requiredDataTypes.includes(dataType)) {
      this.requiredDataTypes.push(dataType);
    }
  }
}