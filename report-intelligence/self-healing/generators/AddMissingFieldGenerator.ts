/**
 * Add Missing Field Generator
 * Generates healing actions for adding missing fields to report schemas
 */

import type { SelfHealingAction, SelfHealingTarget, AddMissingFieldPayload } from '../SelfHealingAction';
import { createSelfHealingAction } from '../SelfHealingAction';

export interface AddMissingFieldOptions {
  fieldId: string;
  fieldName: string;
  fieldType: 'text' | 'number' | 'date' | 'boolean' | 'array' | 'object' | 'section' | 'compliance' | 'terminology';
  sectionId: string;
  defaultValue?: any;
  validationRules?: string[];
  description?: string;
}

export class AddMissingFieldGenerator {
  public generate(
    target: SelfHealingTarget,
    options: AddMissingFieldOptions,
    source: {
      mappingResultId?: string;
      classificationResultId?: string;
      detector: string;
      confidence: number;
    }
  ): SelfHealingAction {
    const payload: AddMissingFieldPayload = {
      fieldId: options.fieldId,
      fieldName: options.fieldName,
      fieldType: options.fieldType,
      sectionId: options.sectionId,
      defaultValue: options.defaultValue,
      validationRules: options.validationRules,
      description: options.description
    };
    
    return createSelfHealingAction(
      'addMissingField',
      target,
      payload,
      'medium',
      `Add missing field: ${options.fieldName}`,
      source
    );
  }
  
  public generateBatch(
    fields: Array<{
      target: SelfHealingTarget;
      options: AddMissingFieldOptions;
      source: {
        mappingResultId?: string;
        classificationResultId?: string;
        detector: string;
        confidence: number;
      };
    }>
  ): SelfHealingAction[] {
    return fields.map(field => this.generate(field.target, field.options, field.source));
  }
  
  public validateOptions(options: AddMissingFieldOptions): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!options.fieldId) errors.push('fieldId is required');
    if (!options.fieldName) errors.push('fieldName is required');
    if (!options.fieldType) errors.push('fieldType is required');
    if (!options.sectionId) errors.push('sectionId is required');
    
    const validFieldTypes = ['text', 'number', 'date', 'boolean', 'array', 'object', 'section', 'compliance', 'terminology'];
    if (!validFieldTypes.includes(options.fieldType)) {
      errors.push(`fieldType must be one of: ${validFieldTypes.join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  public getDefaultOptions(fieldId: string, fieldName: string, sectionId: string): AddMissingFieldOptions {
    return {
      fieldId,
      fieldName,
      fieldType: 'text',
      sectionId,
      defaultValue: '',
      validationRules: [],
      description: `Auto-generated field: ${fieldName}`
    };
  }
  
  public getFieldTypeFromValue(value: any): 'text' | 'number' | 'date' | 'boolean' | 'array' | 'object' {
    if (Array.isArray(value)) return 'array';
    if (value === null || value === undefined) return 'text';
    if (typeof value === 'string') {
      // Check if it's a date string
      if (!isNaN(Date.parse(value))) return 'date';
      return 'text';
    }
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'object') return 'object';
    return 'text';
  }
}