/**
 * Schema Updater Engine - Phase 4
 * Apply Section Update Action Handler
 * 
 * Handles the application of 'addSection' and 'updateSection' schema update actions.
 */

import type { SchemaUpdateAction, AddSectionActionPayload, UpdateSectionActionPayload } from '../SchemaUpdateAction';
import type { ReportTypeRegistry } from '../../registry/ReportTypeRegistry';
import type { ReportTypeDefinition, ReportSectionDefinition } from '../../registry/ReportTypeDefinition';

/**
 * Apply a section update action
 */
export async function applySectionUpdate(
  action: SchemaUpdateAction,
  registry: ReportTypeRegistry
): Promise<{
  success: boolean;
  message: string;
  updatedDefinition?: ReportTypeDefinition;
}> {
  try {
    // Validate action type
    if (action.type !== 'addSection' && action.type !== 'updateSection') {
      return {
        success: false,
        message: `Invalid action type: expected 'addSection' or 'updateSection', got '${action.type}'`
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
    
    if (action.type === 'addSection') {
      return await applyAddSection(action, action.payload as AddSectionActionPayload, reportType, registry);
    } else {
      return await applyUpdateSection(action, action.payload as UpdateSectionActionPayload, reportType, registry);
    }
    
  } catch (error) {
    return {
      success: false,
      message: `Error applying section update: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Apply an 'addSection' action
 */
async function applyAddSection(
  action: SchemaUpdateAction,
  payload: AddSectionActionPayload,
  reportType: ReportTypeDefinition,
  registry: ReportTypeRegistry
): Promise<{
  success: boolean;
  message: string;
  updatedDefinition?: ReportTypeDefinition;
}> {
  // Check if section already exists
  const allSections = [
    ...reportType.requiredSections,
    ...reportType.optionalSections,
    ...reportType.conditionalSections
  ];
  
  const existingSection = allSections.find(s => s.id === payload.sectionId);
  if (existingSection) {
    return {
      success: false,
      message: `Section already exists: ${payload.sectionId}`
    };
  }
  
  // Create new section definition
  const newSection: ReportSectionDefinition = {
    id: payload.sectionId,
    name: payload.sectionName,
    description: payload.description,
    required: payload.required || false,
    conditionalLogic: payload.conditionalLogic,
    template: payload.template,
    aiGuidance: payload.aiGuidance,
    validationRules: payload.validationRules
  };
  
  // Create updated report type definition
  const updatedDefinition: ReportTypeDefinition = {
    ...reportType,
    updatedAt: new Date()
  };
  
  // Add section to appropriate category
  if (payload.required) {
    updatedDefinition.requiredSections = [...reportType.requiredSections, newSection];
  } else if (payload.conditionalLogic) {
    updatedDefinition.conditionalSections = [...reportType.conditionalSections, newSection];
  } else {
    updatedDefinition.optionalSections = [...reportType.optionalSections, newSection];
  }
  
  // Update the registry
  registry.updateType(updatedDefinition);
  
  return {
    success: true,
    message: `Section '${payload.sectionName}' (${payload.sectionId}) added to report type '${reportType.name}'`,
    updatedDefinition
  };
}

/**
 * Apply an 'updateSection' action
 */
async function applyUpdateSection(
  action: SchemaUpdateAction,
  payload: UpdateSectionActionPayload,
  reportType: ReportTypeDefinition,
  registry: ReportTypeRegistry
): Promise<{
  success: boolean;
  message: string;
  updatedDefinition?: ReportTypeDefinition;
}> {
  // Find the section in all section arrays
  let sectionFound = false;
  let sectionIndex = -1;
  let sectionArray: ReportSectionDefinition[] | null = null;
  
  // Check required sections
  sectionIndex = reportType.requiredSections.findIndex(s => s.id === payload.sectionId);
  if (sectionIndex !== -1) {
    sectionFound = true;
    sectionArray = reportType.requiredSections;
  }
  
  // Check optional sections
  if (!sectionFound) {
    sectionIndex = reportType.optionalSections.findIndex(s => s.id === payload.sectionId);
    if (sectionIndex !== -1) {
      sectionFound = true;
      sectionArray = reportType.optionalSections;
    }
  }
  
  // Check conditional sections
  if (!sectionFound) {
    sectionIndex = reportType.conditionalSections.findIndex(s => s.id === payload.sectionId);
    if (sectionIndex !== -1) {
      sectionFound = true;
      sectionArray = reportType.conditionalSections;
    }
  }
  
  if (!sectionFound || !sectionArray) {
    return {
      success: false,
      message: `Section not found: ${payload.sectionId}`
    };
  }
  
  // Create updated section
  const originalSection = sectionArray[sectionIndex];
  const updatedSection: ReportSectionDefinition = {
    ...originalSection,
    ...payload.updates
  };
  
  // Create updated report type definition
  const updatedDefinition: ReportTypeDefinition = {
    ...reportType,
    updatedAt: new Date()
  };
  
  // Update the appropriate section array
  if (sectionArray === reportType.requiredSections) {
    updatedDefinition.requiredSections = [...reportType.requiredSections];
    updatedDefinition.requiredSections[sectionIndex] = updatedSection;
  } else if (sectionArray === reportType.optionalSections) {
    updatedDefinition.optionalSections = [...reportType.optionalSections];
    updatedDefinition.optionalSections[sectionIndex] = updatedSection;
  } else {
    updatedDefinition.conditionalSections = [...reportType.conditionalSections];
    updatedDefinition.conditionalSections[sectionIndex] = updatedSection;
  }
  
  // Update the registry
  registry.updateType(updatedDefinition);
  
  return {
    success: true,
    message: `Section '${originalSection.name}' (${payload.sectionId}) updated in report type '${reportType.name}'`,
    updatedDefinition
  };
}

/**
 * Validate a section update action before applying
 */
export function validateSectionUpdate(
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
  if (action.type !== 'addSection' && action.type !== 'updateSection') {
    errors.push(`Invalid action type: expected 'addSection' or 'updateSection', got '${action.type}'`);
    return { isValid: false, errors, warnings };
  }
  
  // Check if report type exists
  const reportType = registry.getType(action.target);
  if (!reportType) {
    errors.push(`Report type not found: ${action.target}`);
    return { isValid: false, errors, warnings };
  }
  
  if (action.type === 'addSection') {
    const payload = action.payload as AddSectionActionPayload;
    
    // Required fields
    if (!payload.sectionId) errors.push('sectionId is required');
    if (!payload.sectionName) errors.push('sectionName is required');
    if (!payload.description) errors.push('description is required');
    
    // Check if section already exists
    const allSections = [
      ...reportType.requiredSections,
      ...reportType.optionalSections,
      ...reportType.conditionalSections
    ];
    
    if (payload.sectionId && allSections.some(s => s.id === payload.sectionId)) {
      errors.push(`Section already exists: ${payload.sectionId}`);
    }
    
    // Section ID format validation
    if (payload.sectionId && !/^[a-z][a-z0-9_]*$/.test(payload.sectionId)) {
      warnings.push('Section ID should use snake_case format (lowercase letters, numbers, underscores)');
    }
    
  } else {
    const payload = action.payload as UpdateSectionActionPayload;
    
    // Required fields
    if (!payload.sectionId) errors.push('sectionId is required');
    if (!payload.updates) errors.push('updates are required');
    
    // Check if section exists
    const allSections = [
      ...reportType.requiredSections,
      ...reportType.optionalSections,
      ...reportType.conditionalSections
    ];
    
    if (payload.sectionId && !allSections.some(s => s.id === payload.sectionId)) {
      errors.push(`Section not found: ${payload.sectionId}`);
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