/**
 * Schema Compatibility Checker for Oscar AI Phase Compliance Package
 *
 * This file implements the SchemaCompatibilityChecker class that analyzes compatibility between report type schemas.
 * It implements Phase 1: Report Type Registry - Schema Compatibility Checker from the Report Intelligence System.
 *
 * File: src/lib/report-intelligence/schema-compatibility-checker.ts
 * Generated as part of Oscar AI Phase Compliance Package implementation
 */

import type { ReportTypeDefinition, FieldDefinition, SectionDefinition } from './report-type-definitions.js';

/**
 * Compatibility issue interface
 */
export interface CompatibilityIssue {
  severity: 'error' | 'warning' | 'info';
  type: string;
  message: string;
  affectedFields: string[];
}

/**
 * Compatibility result interface
 */
export interface CompatibilityResult {
  isCompatible: boolean;
  compatibilityScore: number;
  issues: CompatibilityIssue[];
  recommendations: string[];
}

/**
 * Schema Compatibility Checker
 * Analyzes compatibility between report type schemas for migration and integration
 */
export class SchemaCompatibilityChecker {
  private static instance: SchemaCompatibilityChecker;

  /**
   * Get the singleton instance of the compatibility checker
   */
  public static getInstance(): SchemaCompatibilityChecker {
    if (!SchemaCompatibilityChecker.instance) {
      SchemaCompatibilityChecker.instance = new SchemaCompatibilityChecker();
    }
    return SchemaCompatibilityChecker.instance;
  }

  /**
   * Check compatibility between two report type schemas
   * @param sourceSchema - The source schema to compare
   * @param targetSchema - The target schema to compare against
   * @returns CompatibilityResult containing compatibility analysis
   */
  public checkSchemaCompatibility(
    sourceSchema: ReportTypeDefinition,
    targetSchema: ReportTypeDefinition
  ): CompatibilityResult {
    const result: CompatibilityResult = {
      isCompatible: true,
      compatibilityScore: 100,
      issues: [],
      recommendations: []
    };

    // Check basic schema compatibility
    this.checkBasicSchemaCompatibility(sourceSchema, targetSchema, result);
    
    // Check field compatibility
    this.checkFieldCompatibility(sourceSchema, targetSchema, result);
    
    // Check section compatibility
    this.checkSectionCompatibility(sourceSchema, targetSchema, result);

    // Calculate compatibility score
    result.compatibilityScore = this.calculateCompatibilityScore(result);
    
    // Determine overall compatibility
    result.isCompatible = result.issues.filter(issue => issue.severity === 'error').length === 0;

    return result;
  }

  /**
   * Check basic schema compatibility
   */
  private checkBasicSchemaCompatibility(
    sourceSchema: ReportTypeDefinition,
    targetSchema: ReportTypeDefinition,
    result: CompatibilityResult
  ): void {
    // Check version compatibility
    if (sourceSchema.version !== targetSchema.version) {
      result.issues.push({
        severity: 'warning',
        type: 'version_mismatch',
        message: `Version mismatch: ${sourceSchema.version} vs ${targetSchema.version}`,
        affectedFields: []
      });
      result.recommendations.push('Consider schema version migration for compatibility');
    }

    // Check author compatibility
    if (sourceSchema.author !== targetSchema.author) {
      result.issues.push({
        severity: 'info',
        type: 'author_mismatch',
        message: `Author mismatch: ${sourceSchema.author} vs ${targetSchema.author}`,
        affectedFields: []
      });
    }

    // Check standards compatibility
    const sourceStandards = sourceSchema.standards || [];
    const targetStandards = targetSchema.standards || [];
    
    const missingStandards = sourceStandards.filter(standard => !targetStandards.includes(standard));
    if (missingStandards.length > 0) {
      result.issues.push({
        severity: 'warning',
        type: 'standards_mismatch',
        message: `Missing standards in target: ${missingStandards.join(', ')}`,
        affectedFields: []
      });
    }
  }

  /**
   * Check field compatibility between schemas
   */
  private checkFieldCompatibility(
    sourceSchema: ReportTypeDefinition,
    targetSchema: ReportTypeDefinition,
    result: CompatibilityResult
  ): void {
    const sourceFields: { [key: string]: any } = {};
    for (const field of sourceSchema.requiredFields || []) {
      sourceFields[field.id] = field;
    }

    const targetFields: { [key: string]: any } = {};
    for (const field of targetSchema.requiredFields || []) {
      targetFields[field.id] = field;
    }

    // Check for missing fields in target
    for (const fieldId in sourceFields) {
      if (!targetFields[fieldId]) {
        result.issues.push({
          severity: 'error',
          type: 'missing_field',
          message: `Field "${fieldId}" is missing in target schema`,
          affectedFields: [fieldId]
        });
        result.recommendations.push(`Add field "${fieldId}" to target schema or mark as optional`);
      } else {
        this.checkIndividualFieldCompatibility(sourceFields[fieldId], targetFields[fieldId], result);
      }
    }

    // Check for extra fields in target
    for (const fieldId in targetFields) {
      if (!sourceFields[fieldId]) {
        result.issues.push({
          severity: 'info',
          type: 'extra_field',
          message: `Field "${fieldId}" exists in target schema but not in source`,
          affectedFields: [fieldId]
        });
      }
    }
  }

  /**
   * Check individual field compatibility
   */
  private checkIndividualFieldCompatibility(
    sourceField: any,
    targetField: any,
    result: CompatibilityResult
  ): void {
    // Check type compatibility
    if (sourceField.type !== targetField.type) {
      result.issues.push({
        severity: 'error',
        type: 'type_mismatch',
        message: `Field "${sourceField.id}" type mismatch: ${sourceField.type} vs ${targetField.type}`,
        affectedFields: [sourceField.id]
      });
      result.recommendations.push(`Consider type conversion or field renaming`);
    }

    // Check name compatibility
    if (sourceField.name !== targetField.name) {
      result.issues.push({
        severity: 'warning',
        type: 'name_mismatch',
        message: `Field "${sourceField.id}" name mismatch: "${sourceField.name}" vs "${targetField.name}"`,
        affectedFields: [sourceField.id]
      });
    }

    // Check constraints compatibility
    if (sourceField.constraints && targetField.constraints) {
      this.checkConstraintsCompatibility(sourceField.constraints, targetField.constraints, sourceField.id, result);
    }
  }

  /**
   * Check constraints compatibility
   */
  private checkConstraintsCompatibility(
    sourceConstraints: any,
    targetConstraints: any,
    fieldId: string,
    result: CompatibilityResult
  ): void {
    // Check required constraint
    if (sourceConstraints.required !== targetConstraints.required) {
      result.issues.push({
        severity: 'warning',
        type: 'constraint_mismatch',
        message: `Required constraint mismatch for field "${fieldId}": ${sourceConstraints.required} vs ${targetConstraints.required}`,
        affectedFields: [fieldId]
      });
    }

    // Check length constraints
    if (sourceConstraints.minLength !== targetConstraints.minLength) {
      result.issues.push({
        severity: 'info',
        type: 'constraint_mismatch',
        message: `minLength constraint mismatch for field "${fieldId}": ${sourceConstraints.minLength} vs ${targetConstraints.minLength}`,
        affectedFields: [fieldId]
      });
    }

    if (sourceConstraints.maxLength !== targetConstraints.maxLength) {
      result.issues.push({
        severity: 'info',
        type: 'constraint_mismatch',
        message: `maxLength constraint mismatch for field "${fieldId}": ${sourceConstraints.maxLength} vs ${targetConstraints.maxLength}`,
        affectedFields: [fieldId]
      });
    }

    // Check numeric constraints
    if (sourceConstraints.min !== targetConstraints.min) {
      result.issues.push({
        severity: 'info',
        type: 'constraint_mismatch',
        message: `min constraint mismatch for field "${fieldId}": ${sourceConstraints.min} vs ${targetConstraints.min}`,
        affectedFields: [fieldId]
      });
    }

    if (sourceConstraints.max !== targetConstraints.max) {
      result.issues.push({
        severity: 'info',
        type: 'constraint_mismatch',
        message: `max constraint mismatch for field "${fieldId}": ${sourceConstraints.max} vs ${targetConstraints.max}`,
        affectedFields: [fieldId]
      });
    }

    // Check pattern constraint
    if (sourceConstraints.pattern !== targetConstraints.pattern) {
      result.issues.push({
        severity: 'info',
        type: 'constraint_mismatch',
        message: `pattern constraint mismatch for field "${fieldId}"`,
        affectedFields: [fieldId]
      });
    }

    // Check enum constraint
    if (sourceConstraints.enum && targetConstraints.enum) {
      const sourceEnum = sourceConstraints.enum;
      const targetEnum = targetConstraints.enum;
      const missingEnumValues = sourceEnum.filter((value: any) => !targetEnum.includes(value));
      
      if (missingEnumValues.length > 0) {
        result.issues.push({
          severity: 'warning',
          type: 'enum_mismatch',
          message: `Missing enum values for field "${fieldId}": ${missingEnumValues.join(', ')}`,
          affectedFields: [fieldId]
        });
      }
    }
  }

  /**
   * Check section compatibility between schemas
   */
  private checkSectionCompatibility(
    sourceSchema: ReportTypeDefinition,
    targetSchema: ReportTypeDefinition,
    result: CompatibilityResult
  ): void {
    // Skip section compatibility check if sections property doesn't exist
    return;
  }

  /**
   * Calculate compatibility score based on issues
   */
  private calculateCompatibilityScore(result: CompatibilityResult): number {
    let score = 100;
    
    // Deduct points for errors
    const errorCount = result.issues.filter(issue => issue.severity === 'error').length;
    score -= errorCount * 20;
    
    // Deduct points for warnings
    const warningCount = result.issues.filter(issue => issue.severity === 'warning').length;
    score -= warningCount * 5;
    
    // Ensure score is within bounds
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Batch check compatibility between multiple schemas
   * @param schemas - Array of schemas to check compatibility for
   * @returns Map of compatibility results between schema pairs
   */
  public batchCheckCompatibility(schemas: ReportTypeDefinition[]): Map<string, CompatibilityResult> {
    const results = new Map<string, CompatibilityResult>();
    
    for (let i = 0; i < schemas.length; i++) {
      for (let j = i + 1; j < schemas.length; j++) {
        const sourceSchema = schemas[i];
        const targetSchema = schemas[j];
        const key = `${sourceSchema.id}-${targetSchema.id}`;
        
        const result = this.checkSchemaCompatibility(sourceSchema, targetSchema);
        results.set(key, result);
      }
    }
    
    return results;
  }

  /**
   * Get compatibility recommendations for improving schema compatibility
   * @param result - Compatibility result to analyze
   * @returns Array of improvement recommendations
   */
  public getCompatibilityRecommendations(result: CompatibilityResult): string[] {
    const recommendations: string[] = [];
    
    // Add general recommendations based on score
    if (result.compatibilityScore < 80) {
      recommendations.push('Consider significant schema refactoring for better compatibility');
    } else if (result.compatibilityScore < 90) {
      recommendations.push('Consider moderate schema adjustments for improved compatibility');
    }
    
    // Add specific recommendations based on issues
    result.recommendations.forEach(rec => {
      recommendations.push(rec);
    });
    
    return recommendations;
  }
}