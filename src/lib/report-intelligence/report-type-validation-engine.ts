/**
 * Report Type Validation Engine for Oscar AI Phase Compliance Package
 *
 * This file implements the ReportTypeValidationEngine class that validates report type definitions.
 * It implements Phase 1: Report Type Registry - Validation Engine from the Report Intelligence System.
 *
 * File: src/lib/report-intelligence/report-type-validation-engine.ts
 * Generated as part of Oscar AI Phase Compliance Package implementation
 */

import type { ReportTypeDefinition, FieldDefinition } from './report-type-definitions.js';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Report Type Validation Engine
 * Validates report type definitions according to compliance standards
 */
export class ReportTypeValidationEngine {
  private static instance: ReportTypeValidationEngine;

  /**
   * Get the singleton instance of the validation engine
   */
  public static getInstance(): ReportTypeValidationEngine {
    if (!ReportTypeValidationEngine.instance) {
      ReportTypeValidationEngine.instance = new ReportTypeValidationEngine();
    }
    return ReportTypeValidationEngine.instance;
  }

  /**
   * Validate a report type definition
   * @param reportType - The report type definition to validate
   * @returns ValidationResult containing validation status and messages
   */
  public validateReportType(reportType: ReportTypeDefinition): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Validate basic structure
    this.validateBasicStructure(reportType, result);
    
    // Validate field definitions
    this.validateFieldDefinitions(reportType, result);
    
    // Validate compliance standards
    this.validateComplianceStandards(reportType, result);
    
    // Validate naming conventions
    this.validateNamingConventions(reportType, result);

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * Validate basic structure of report type definition
   */
  private validateBasicStructure(reportType: ReportTypeDefinition, result: ValidationResult): void {
    if (!reportType.id || typeof reportType.id !== 'string') {
      result.errors.push('Report type ID is required and must be a string');
      return;
    }

    if (!reportType.name || typeof reportType.name !== 'string') {
      result.errors.push('Report type name is required and must be a string');
    }

    if (!reportType.version || typeof reportType.version !== 'string') {
      result.errors.push('Report type version is required and must be a string');
    }

    if (!reportType.description || typeof reportType.description !== 'string') {
      result.warnings.push('Report type description is recommended');
    }

    if (!reportType.requiredFields || !Array.isArray(reportType.requiredFields)) {
      result.errors.push('Report type required fields are required and must be an array');
    }
  }

  /**
   * Validate field definitions in the report type
   */
  private validateFieldDefinitions(reportType: ReportTypeDefinition, result: ValidationResult): void {
    if (!reportType.requiredFields) return;

    const fieldIds = new Set<string>();
    
    for (const field of reportType.requiredFields) {
      // Check for duplicate field IDs
      if (fieldIds.has(field.id)) {
        result.errors.push(`Duplicate field ID "${field.id}" found`);
      }
      fieldIds.add(field.id);

      // Validate field structure
      if (!field.id || typeof field.id !== 'string') {
        result.errors.push(`Field ID is required and must be a string`);
      }

      if (!field.name || typeof field.name !== 'string') {
        result.errors.push(`Field name is required for field "${field.id}" and must be a string`);
      }

      if (!field.type || typeof field.type !== 'string') {
        result.errors.push(`Field type is required for field "${field.id}" and must be a string`);
      }

      // Validate field type
      this.validateFieldType(field, result);
    }
  }

  /**
   * Validate field type
   */
  private validateFieldType(field: any, result: ValidationResult): void {
    const validTypes = [
      'string', 'number', 'boolean', 'date', 'datetime', 
      'array', 'object', 'enum', 'geolocation', 'file'
    ];

    if (!validTypes.includes(field.type)) {
      result.errors.push(
        `Invalid field type "${field.type}" for field "${field.id}". Valid types are: ${validTypes.join(', ')}`
      );
    }

    // Validate enum values for enum type
    if (field.type === 'enum' && (!field.values || !Array.isArray(field.values))) {
      result.errors.push(`Enum field "${field.id}" must have a values array`);
    }

    // Validate field constraints
    if (field.constraints) {
      this.validateFieldConstraints(field, result);
    }
  }

  /**
   * Validate field constraints
   */
  private validateFieldConstraints(field: any, result: ValidationResult): void {
    const constraints = field.constraints;
    
    if (constraints.required && typeof constraints.required !== 'boolean') {
      result.errors.push(`Required constraint for field "${field.id}" must be a boolean`);
    }

    if (constraints.minLength !== undefined && typeof constraints.minLength !== 'number') {
      result.errors.push(`minLength constraint for field "${field.id}" must be a number`);
    }

    if (constraints.maxLength !== undefined && typeof constraints.maxLength !== 'number') {
      result.errors.push(`maxLength constraint for field "${field.id}" must be a number`);
    }

    if (constraints.min !== undefined && typeof constraints.min !== 'number') {
      result.errors.push(`min constraint for field "${field.id}" must be a number`);
    }

    if (constraints.max !== undefined && typeof constraints.max !== 'number') {
      result.errors.push(`max constraint for field "${field.id}" must be a number`);
    }

    if (constraints.pattern && typeof constraints.pattern !== 'string') {
      result.errors.push(`pattern constraint for field "${field.id}" must be a string`);
    }

    if (constraints.enum && !Array.isArray(constraints.enum)) {
      result.errors.push(`enum constraint for field "${field.id}" must be an array`);
    }
  }

  /**
   * Validate compliance standards
   */
  private validateComplianceStandards(reportType: ReportTypeDefinition, result: ValidationResult): void {
    if (!reportType.standards) return;

    const validStandards = [
      'ISO_9001', 'ISO_14001', 'ISO_27001', 'GDPR', 
      'HIPAA', 'SOC_2', 'PCI_DSS', 'COBIT'
    ];

    for (const standard of reportType.standards) {
      if (!validStandards.includes(standard)) {
        result.warnings.push(
          `Unknown compliance standard "${standard}". Valid standards are: ${validStandards.join(', ')}`
        );
      }
    }
  }

  /**
   * Validate naming conventions
   */
  private validateNamingConventions(reportType: ReportTypeDefinition, result: ValidationResult): void {
    // Validate report type ID format
    if (!/^[a-z][a-z0-9_]*$/.test(reportType.id)) {
      result.warnings.push(
        `Report type ID "${reportType.id}" should follow snake_case convention starting with lowercase letter`
      );
    }

    // Validate field ID format
    if (reportType.requiredFields) {
      for (const field of reportType.requiredFields) {
        if (!/^[a-z][a-z0-9_]*$/.test(field.id)) {
          result.warnings.push(
            `Field ID "${field.id}" should follow snake_case convention starting with lowercase letter`
          );
        }
      }
    }
  }

  /**
   * Batch validate multiple report type definitions
   * @param reportTypes - Array of report type definitions to validate
   * @returns Array of ValidationResult objects
   */
  public batchValidate(reportTypes: ReportTypeDefinition[]): ValidationResult[] {
    return reportTypes.map(reportType => this.validateReportType(reportType));
  }

  /**
   * Get validation summary for multiple report types
   * @param results - Array of ValidationResult objects
   * @returns Summary object with counts and statistics
   */
  public getValidationSummary(results: ValidationResult[]): {
    total: number;
    valid: number;
    invalid: number;
    errors: number;
    warnings: number;
  } {
    const summary = {
      total: results.length,
      valid: 0,
      invalid: 0,
      errors: 0,
      warnings: 0
    };

    results.forEach(result => {
      if (result.isValid) {
        summary.valid++;
      } else {
        summary.invalid++;
      }
      summary.errors += result.errors.length;
      summary.warnings += result.warnings.length;
    });

    return summary;
  }
}