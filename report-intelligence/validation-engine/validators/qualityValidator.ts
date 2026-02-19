/**
 * Report Validation Engine - Phase 4
 * Quality Validator Module
 * 
 * Validates report quality aspects like clarity, professionalism, and readability.
 */

import type { SchemaMappingResult } from '../../schema-mapper/SchemaMappingResult';
import type { ValidationRule } from '../ValidationResult';

/**
 * Quality validation result
 */
export interface QualityValidationResult {
  passed: boolean;
  issues: Array<{
    category: 'clarity' | 'accuracy' | 'completeness' | 'consistency' | 'formatting' | 'professionalism';
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    example?: string;
    suggestedImprovement?: string;
  }>;
  qualityScore: number; // 0-100
}

/**
 * Quality validator class
 */
export class QualityValidator {
  private clarityKeywords = ['clear', 'understandable', 'concise', 'well-structured', 'organized'];
  private professionalismKeywords = ['professional', 'formal', 'appropriate', 'respectful', 'objective'];
  private formattingIssues = ['inconsistent', 'poorly formatted', 'missing', 'incorrect'];

  /**
   * Validate quality for a schema mapping result
   */
  validate(
    schemaMappingResult: SchemaMappingResult,
    rule: ValidationRule
  ): QualityValidationResult {
    const result: QualityValidationResult = {
      passed: true,
      issues: [],
      qualityScore: 100, // Start with perfect score
    };

    // Check section clarity
    const clarityIssues = this.checkSectionClarity(schemaMappingResult);
    if (clarityIssues.length > 0) {
      result.passed = false;
      result.issues.push(...clarityIssues);
      result.qualityScore -= clarityIssues.length * 5;
    }

    // Check professionalism
    const professionalismIssues = this.checkProfessionalism(schemaMappingResult);
    if (professionalismIssues.length > 0) {
      result.passed = false;
      result.issues.push(...professionalismIssues);
      result.qualityScore -= professionalismIssues.length * 8;
    }

    // Check formatting consistency
    const formattingIssues = this.checkFormattingConsistency(schemaMappingResult);
    if (formattingIssues.length > 0) {
      result.passed = false;
      result.issues.push(...formattingIssues);
      result.qualityScore -= formattingIssues.length * 3;
    }

    // Check content accuracy indicators
    const accuracyIssues = this.checkAccuracyIndicators(schemaMappingResult);
    if (accuracyIssues.length > 0) {
      result.passed = false;
      result.issues.push(...accuracyIssues);
      result.qualityScore -= accuracyIssues.length * 10;
    }

    // Ensure score doesn't go below 0
    result.qualityScore = Math.max(0, result.qualityScore);

    return result;
  }

  /**
   * Check section clarity
   */
  private checkSectionClarity(schemaMappingResult: SchemaMappingResult): Array<{
    category: 'clarity';
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    example?: string;
    suggestedImprovement?: string;
  }> {
    const issues: Array<{
      category: 'clarity';
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
      example?: string;
      suggestedImprovement?: string;
    }> = [];

    // Check for unclear section titles
    for (const field of schemaMappingResult.mappedFields) {
      if (field.fieldName.length < 3 || field.fieldName === 'Untitled' || field.fieldName === 'Section') {
        issues.push({
          category: 'clarity',
          description: `Unclear section title: "${field.fieldName}"`,
          severity: 'medium',
          example: field.fieldName,
          suggestedImprovement: 'Use a descriptive, specific title for the section',
        });
      }
    }

    // Check for unclear content
    for (const field of schemaMappingResult.mappedFields) {
      const value = field.mappedValue;
      if (typeof value === 'string') {
        if (value.length < 20) {
          issues.push({
            category: 'clarity',
            description: `Section "${field.fieldName}" has insufficient content`,
            severity: 'low',
            example: value.substring(0, 50) + '...',
            suggestedImprovement: 'Add more detailed content to the section',
          });
        }
        
        // Check for vague language
        const vagueTerms = ['thing', 'stuff', 'something', 'various', 'several', 'some'];
        const lowerValue = value.toLowerCase();
        for (const term of vagueTerms) {
          if (lowerValue.includes(term)) {
            issues.push({
              category: 'clarity',
              description: `Vague language in section "${field.fieldName}"`,
              severity: 'low',
              example: `Contains "${term}"`,
              suggestedImprovement: 'Use specific, concrete language',
            });
            break;
          }
        }
      }
    }

    return issues;
  }

  /**
   * Check professionalism
   */
  private checkProfessionalism(schemaMappingResult: SchemaMappingResult): Array<{
    category: 'professionalism';
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    example?: string;
    suggestedImprovement?: string;
  }> {
    const issues: Array<{
      category: 'professionalism';
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
      example?: string;
      suggestedImprovement?: string;
    }> = [];

    // Check for unprofessional language
    const unprofessionalTerms = [
      'bad', 'terrible', 'awful', 'stupid', 'idiot', 'crazy',
      'obviously', 'clearly', 'everyone knows',
    ];

    for (const field of schemaMappingResult.mappedFields) {
      const value = field.mappedValue;
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        for (const term of unprofessionalTerms) {
          if (lowerValue.includes(term)) {
            issues.push({
              category: 'professionalism',
              description: `Unprofessional language in section "${field.fieldName}"`,
              severity: 'medium',
              example: `Contains "${term}"`,
              suggestedImprovement: 'Use objective, professional language',
            });
            break;
          }
        }

        // Check for excessive use of first person
        const firstPersonCount = (lowerValue.match(/\b(I|me|my|mine|we|us|our|ours)\b/g) || []).length;
        if (firstPersonCount > 3) {
          issues.push({
            category: 'professionalism',
            description: `Excessive use of first person in section "${field.fieldName}"`,
            severity: 'low',
            example: `Contains ${firstPersonCount} first-person references`,
            suggestedImprovement: 'Use third-person or passive voice for professional reports',
          });
        }
      }
    }

    return issues;
  }

  /**
   * Check formatting consistency
   */
  private checkFormattingConsistency(schemaMappingResult: SchemaMappingResult): Array<{
    category: 'formatting';
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    example?: string;
    suggestedImprovement?: string;
  }> {
    const issues: Array<{
      category: 'formatting';
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
      example?: string;
      suggestedImprovement?: string;
    }> = [];

    // Check for inconsistent formatting patterns
    const datePatterns: RegExp[] = [
      /\d{1,2}\/\d{1,2}\/\d{4}/g, // MM/DD/YYYY
      /\d{1,2}-\d{1,2}-\d{4}/g, // MM-DD-YYYY
      /\d{4}-\d{1,2}-\d{1,2}/g, // YYYY-MM-DD
    ];

    const foundDatePatterns = new Set<string>();
    
    for (const field of schemaMappingResult.mappedFields) {
      const value = field.mappedValue;
      if (typeof value === 'string') {
        for (const pattern of datePatterns) {
          const matches = value.match(pattern);
          if (matches && matches.length > 0) {
            foundDatePatterns.add(pattern.source);
          }
        }
      }
    }

    // If multiple date formats found
    if (foundDatePatterns.size > 1) {
      issues.push({
        category: 'formatting',
        description: 'Inconsistent date formats throughout the report',
        severity: 'medium',
        example: `Found ${foundDatePatterns.size} different date formats`,
        suggestedImprovement: 'Use a consistent date format throughout the report',
      });
    }

    return issues;
  }

  /**
   * Check accuracy indicators
   */
  private checkAccuracyIndicators(schemaMappingResult: SchemaMappingResult): Array<{
    category: 'accuracy';
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    example?: string;
    suggestedImprovement?: string;
  }> {
    const issues: Array<{
      category: 'accuracy';
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
      example?: string;
      suggestedImprovement?: string;
    }> = [];

    // Check for contradictory statements
    const contradictionKeywords = [
      ['however', 'but', 'although', 'yet'],
      ['on the one hand', 'on the other hand'],
      ['contradicts', 'contradictory', 'inconsistent'],
    ];

    let contradictionCount = 0;
    
    for (const field of schemaMappingResult.mappedFields) {
      const value = field.mappedValue;
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        for (const keywordGroup of contradictionKeywords) {
          if (keywordGroup.some(kw => lowerValue.includes(kw))) {
            contradictionCount++;
            break;
          }
        }
      }
    }

    if (contradictionCount > 2) {
      issues.push({
        category: 'accuracy',
        description: 'Potential contradictory statements in the report',
        severity: 'high',
        example: `Found ${contradictionCount} sections with contradiction indicators`,
        suggestedImprovement: 'Review for logical consistency and accuracy',
      });
    }

    return issues;
  }

  /**
   * Get quality assessment summary
   */
  getQualitySummary(score: number): string {
    if (score >= 90) return 'Excellent quality';
    if (score >= 80) return 'Good quality';
    if (score >= 70) return 'Acceptable quality';
    if (score >= 60) return 'Needs improvement';
    return 'Poor quality - significant issues';
  }

  /**
   * Calculate readability score (simplified)
   */
  calculateReadabilityScore(schemaMappingResult: SchemaMappingResult): number {
    let totalWords = 0;
    let totalSentences = 0;
    
    for (const field of schemaMappingResult.mappedFields) {
      const value = field.mappedValue;
      if (typeof value === 'string') {
        const words = value.split(/\s+/).length;
        const sentences = value.split(/[.!?]+/).length - 1;
        
        totalWords += words;
        totalSentences += sentences;
      }
    }
    
    if (totalSentences === 0) return 100; // No sentences to analyze
    
    const averageSentenceLength = totalWords / totalSentences;
    
    // Simplified readability scoring
    if (averageSentenceLength < 15) return 90; // Very readable
    if (averageSentenceLength < 25) return 75; // Readable
    if (averageSentenceLength < 35) return 60; // Somewhat difficult
    return 40; // Difficult to read
  }
}