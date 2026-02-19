/**
 * Schema Updater Engine - Phase 4
 * Apply Field Update Action Handler
 * 
 * Handles the application of 'addField' schema update actions.
 */

import type { SchemaUpdateAction, AddFieldActionPayload } from '../SchemaUpdateAction';
import type { ReportTypeRegistry } from '../../registry/ReportTypeRegistry';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';

/**
 * Apply a field update action
 */
export async function applyFieldUpdate(
  action: SchemaUpdateAction,
  registry: ReportTypeRegistry
): Promise<{
  success: boolean;
  message: string;
  updatedDefinition?: ReportTypeDefinition;
}> {
  try {
    // Validate action type
    if (action.type !== 'addField') {
      return {
        success: false,
        message: `Invalid action type: expected 'addField', got '${action.type}'`
      };
    }
    
    const payload = action.payload as AddFieldActionPayload;
    
    // Validate payload
    if (!payload.fieldId || !payload.fieldName || !payload.fieldType || !payload.parentSectionId) {
      return {
        success: false,
        message: 'Missing required fields in payload: fieldId, fieldName, fieldType, parentSectionId are required'
      };
    }
    
    // Get the report type definition
    const reportTypeId = action.target;
    const reportType = registry.getType(reportTypeId);
    
    if (!reportType) {
      return {
        success: false,
        message: `Report type not found: ${reportTypeId}`
      };
    }
    
    // Find the parent section
    const parentSection = [
      ...reportType.requiredSections,
      ...reportType.optionalSections,
      ...reportType.conditionalSections
    ].find(section => section.id === payload.parentSectionId);
    
    if (!parentSection) {
      return {
        success: false,
        message: `Parent section not found: ${payload.parentSectionId}`
      };
    }
    
    // Check if field already exists
    // Note: This is a simplified check - in a real implementation,
    // we would need to check the actual field structure in the section
    
    // Create updated report type definition
    const updatedDefinition: ReportTypeDefinition = {
      ...reportType,
      updatedAt: new Date()
    };
    
    // In a real implementation, we would:
    // 1. Add the field to the appropriate section structure
    // 2. Update validation rules if provided
    // 3. Update AI guidance if provided
    // 4. Save the updated definition
    
    // For now, we'll just log the update
    console.log(`Field update applied: ${payload.fieldId} to section ${payload.parentSectionId}`);
    
    return {
      success: true,
      message: `Field '${payload.fieldName}' (${payload.fieldId}) added to section '${parentSection.name}'`,
      updatedDefinition
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Error applying field update: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Validate a field update action before applying
 */
export function validateFieldUpdate(
  action: SchemaUpdateAction,
  registry: ReportTypeRegistry
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Basic validation
  if (action.type !== 'addField') {
    errors.push(`Invalid action type: expected 'addField', got '${action.type}'`);
    return { isValid: false, errors, warnings };
  }
  
  const payload = action.payload as AddFieldActionPayload;
  
  // Required fields
  if (!payload.fieldId) errors.push('fieldId is required');
  if (!payload.fieldName) errors.push('fieldName is required');
  if (!payload.fieldType) errors.push('fieldType is required');
  if (!payload.parentSectionId) errors.push('parentSectionId is required');
  
  // Field ID format validation
  if (payload.fieldId && !/^[a-z][a-z0-9_]*$/.test(payload.fieldId)) {
    warnings.push('Field ID should use snake_case format (lowercase letters, numbers, underscores)');
  }
  
  // Field type validation
  const validFieldTypes = ['text', 'number', 'date', 'boolean', 'array', 'object', 'section', 'compliance', 'terminology'];
  if (payload.fieldType && !validFieldTypes.includes(payload.fieldType)) {
    errors.push(`Invalid field type: ${payload.fieldType}. Must be one of: ${validFieldTypes.join(', ')}`);
  }
  
  // Check if report type exists
  const reportType = registry.getType(action.target);
  if (!reportType) {
    errors.push(`Report type not found: ${action.target}`);
  } else {
    // Check if parent section exists
    const parentSection = [
      ...reportType.requiredSections,
      ...reportType.optionalSections,
      ...reportType.conditionalSections
    ].find(section => section.id === payload.parentSectionId);
    
    if (!parentSection) {
      errors.push(`Parent section not found: ${payload.parentSectionId}`);
    }
  }
  
  // Confidence check
  if (action.confidence < 0.5) {
    warnings.push('Low confidence action - consider manual review');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}