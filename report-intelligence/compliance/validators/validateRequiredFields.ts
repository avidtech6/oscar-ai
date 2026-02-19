/**
 * Phase 9: Report Compliance Validator
 * Required Fields Validator
 * 
 * Validates that all required fields are present in the report.
 */

import type { SchemaMappingResult } from '../../schema-mapper/SchemaMappingResult';
import type { ReportTypeRegistry } from '../../registry/ReportTypeRegistry';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';
import type { MissingRequiredField } from '../ComplianceResult';

/**
 * Configuration for field validation
 */
export interface FieldValidationConfig {
  strictMode: boolean;
  allowPartialMatches: boolean;
  minimumConfidence: number;
  validateFieldContent: boolean;
  minimumContentLength: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: FieldValidationConfig = {
  strictMode: true,
  allowPartialMatches: true,
  minimumConfidence: 0.6,
  validateFieldContent: true,
  minimumContentLength: 3,
};

/**
 * Validate required fields in a report
 */
export async function validateRequiredFields(
  schemaMappingResult: SchemaMappingResult,
  registry?: ReportTypeRegistry,
  config: Partial<FieldValidationConfig> = {}
): Promise<MissingRequiredField[]> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const missingFields: MissingRequiredField[] = [];
  
  try {
    // Get report type
    const reportTypeId = schemaMappingResult.reportTypeId;
    if (!reportTypeId) {
      console.warn('[validateRequiredFields] Cannot validate fields: report type unknown');
      return missingFields;
    }
    
    // Get report type definition
    const reportType = registry?.getType(reportTypeId);
    if (!reportType) {
      console.warn(`[validateRequiredFields] Report type "${reportTypeId}" not found in registry`);
      return missingFields;
    }
    
    // Get required fields from report type definition
    const requiredFields = getRequiredFieldsFromDefinition(reportType);
    
    // Get actual fields from schema mapping result
    const actualFields = schemaMappingResult.mappedFields || [];
    
    // Check each required field
    for (const requiredField of requiredFields) {
      const fieldResult = checkFieldPresence(
        requiredField, 
        actualFields, 
        schemaMappingResult,
        mergedConfig
      );
      
      if (!fieldResult.isPresent) {
        const missingField: MissingRequiredField = {
          fieldId: requiredField.id,
          fieldName: requiredField.name,
          sectionId: requiredField.sectionId,
          requirementSource: requiredField.requirementSource || `${reportTypeId} Standard`,
          severity: determineFieldSeverity(requiredField),
          description: `Required field "${requiredField.name}" is missing from section "${requiredField.sectionId}"`,
          remediationGuidance: `Add the "${requiredField.name}" field to the "${requiredField.sectionId}" section`,
        };
        missingFields.push(missingField);
      } else if (fieldResult.isPresentButEmpty && mergedConfig.validateFieldContent) {
        // Field exists but has insufficient content
        const missingField: MissingRequiredField = {
          fieldId: requiredField.id,
          fieldName: requiredField.name,
          sectionId: requiredField.sectionId,
          requirementSource: requiredField.requirementSource || `${reportTypeId} Standard`,
          severity: 'medium',
          description: `Required field "${requiredField.name}" exists but has insufficient content`,
          remediationGuidance: `Add meaningful content to the "${requiredField.name}" field in the "${requiredField.sectionId}" section`,
        };
        missingFields.push(missingField);
      }
    }
    
    return missingFields;
    
  } catch (error) {
    console.error('[validateRequiredFields] Error validating required fields:', error);
    throw error;
  }
}

/**
 * Get required fields from report type definition
 */
function getRequiredFieldsFromDefinition(
  reportType: ReportTypeDefinition
): Array<{
  id: string;
  name: string;
  sectionId: string;
  requirementSource?: string;
  isCritical?: boolean;
  minLength?: number;
}> {
  const fields: Array<{
    id: string;
    name: string;
    sectionId: string;
    requirementSource?: string;
    isCritical?: boolean;
    minLength?: number;
  }> = [];
  
  // Extract fields from section definitions
  // Note: This is a simplified implementation
  // In a real system, fields would be explicitly defined in the report type definition
  
  // Common required fields for arboricultural reports
  const commonFields = [
    { id: 'survey_date', name: 'Survey Date', sectionId: 'methodology', isCritical: true, requirementSource: 'BS5837:2012 Section 4.2.1' },
    { id: 'surveyor_name', name: 'Surveyor Name', sectionId: 'methodology', isCritical: true, requirementSource: 'BS5837:2012 Section 4.2.2' },
    { id: 'survey_method', name: 'Survey Method', sectionId: 'methodology', isCritical: false, requirementSource: 'BS5837:2012 Section 4.2.3' },
    { id: 'site_address', name: 'Site Address', sectionId: 'introduction', isCritical: true, requirementSource: 'BS5837:2012 Section 4.1.1' },
    { id: 'client_name', name: 'Client Name', sectionId: 'introduction', isCritical: true, requirementSource: 'BS5837:2012 Section 4.1.2' },
    { id: 'tree_count', name: 'Tree Count', sectionId: 'findings', isCritical: true, requirementSource: 'BS5837:2012 Section 4.3.1' },
    { id: 'condition_assessment', name: 'Condition Assessment', sectionId: 'findings', isCritical: true, requirementSource: 'BS5837:2012 Section 4.3.2' },
    { id: 'recommendations_summary', name: 'Recommendations Summary', sectionId: 'recommendations', isCritical: true, requirementSource: 'BS5837:2012 Section 4.4.1' },
    { id: 'priority_level', name: 'Priority Level', sectionId: 'recommendations', isCritical: false, requirementSource: 'BS5837:2012 Section 4.4.2' },
  ];
  
  // Add type-specific fields
  if (reportType.id === 'bs5837') {
    fields.push(
      { id: 'rpa_calculation', name: 'RPA Calculation', sectionId: 'findings', isCritical: true, requirementSource: 'BS5837:2012 Section 4.6' },
      { id: 'tree_preservation_order', name: 'Tree Preservation Order', sectionId: 'legal', isCritical: false, requirementSource: 'BS5837:2012 Section 4.7' }
    );
  } else if (reportType.id === 'aia') {
    fields.push(
      { id: 'risk_assessment', name: 'Risk Assessment', sectionId: 'findings', isCritical: true, requirementSource: 'AIA Guidelines Section 3.2' },
      { id: 'risk_category', name: 'Risk Category', sectionId: 'findings', isCritical: true, requirementSource: 'AIA Guidelines Section 3.3' }
    );
  }
  
  fields.push(...commonFields);
  return fields;
}

/**
 * Check if a required field is present
 */
function checkFieldPresence(
  requiredField: {id: string, name: string, sectionId: string, minLength?: number},
  actualFields: any[],
  schemaMappingResult: SchemaMappingResult,
  config: FieldValidationConfig
): {isPresent: boolean, isPresentButEmpty: boolean, confidence?: number} {
  // Check for exact field ID match
  const exactMatch = actualFields.find(field => 
    field.fieldId === requiredField.id || 
    field.fieldName?.toLowerCase() === requiredField.name.toLowerCase()
  );
  
  if (exactMatch) {
    const hasContent = checkFieldContent(exactMatch, requiredField.minLength || config.minimumContentLength);
    return {
      isPresent: true,
      isPresentButEmpty: !hasContent,
      confidence: exactMatch.mappingConfidence,
    };
  }
  
  // Check for partial matches if allowed
  if (config.allowPartialMatches) {
    const normalizedRequiredName = normalizeText(requiredField.name);
    
    for (const actualField of actualFields) {
      if (actualField.mappingConfidence < config.minimumConfidence) {
        continue;
      }
      
      const normalizedActualName = normalizeText(actualField.fieldName || '');
      
      // Check for partial name match
      if (normalizedActualName.includes(normalizedRequiredName) ||
          normalizedRequiredName.includes(normalizedActualName)) {
        const hasContent = checkFieldContent(actualField, requiredField.minLength || config.minimumContentLength);
        return {
          isPresent: true,
          isPresentButEmpty: !hasContent,
          confidence: actualField.mappingConfidence,
        };
      }
      
      // Check for keyword match
      const requiredKeywords = normalizedRequiredName.split(/\s+/);
      const actualKeywords = normalizedActualName.split(/\s+/);
      
      const matchingKeywords = requiredKeywords.filter(keyword =>
        actualKeywords.some(actual => actual.includes(keyword) || keyword.includes(actual))
      );
      
      if (matchingKeywords.length >= Math.min(2, requiredKeywords.length)) {
        const hasContent = checkFieldContent(actualField, requiredField.minLength || config.minimumContentLength);
        return {
          isPresent: true,
          isPresentButEmpty: !hasContent,
          confidence: actualField.mappingConfidence,
        };
      }
    }
  }
  
  // Check unmapped sections for potential field content
  if (schemaMappingResult.unmappedSections) {
    for (const section of schemaMappingResult.unmappedSections) {
      const normalizedSectionTitle = normalizeText(section.sectionTitle);
      const normalizedRequiredName = normalizeText(requiredField.name);
      
      if (normalizedSectionTitle.includes(normalizedRequiredName) ||
          normalizedRequiredName.includes(normalizedSectionTitle)) {
        // Section title matches field name - might contain the field
        return {
          isPresent: false, // Not mapped as a field
          isPresentButEmpty: false,
          confidence: section.confidence,
        };
      }
    }
  }
  
  return {
    isPresent: false,
    isPresentButEmpty: false,
  };
}

/**
 * Check if field has sufficient content
 */
function checkFieldContent(field: any, minLength: number): boolean {
  if (!field.mappedValue) {
    return false;
  }
  
  const value = field.mappedValue;
  
  if (typeof value === 'string') {
    return value.trim().length >= minLength;
  }
  
  if (typeof value === 'number') {
    return true; // Numbers always have content
  }
  
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  
  if (typeof value === 'object' && value !== null) {
    return Object.keys(value).length > 0;
  }
  
  return false;
}

/**
 * Determine field severity
 */
function determineFieldSeverity(field: {id: string, name: string, isCritical?: boolean}): 'critical' | 'high' | 'medium' | 'low' | 'warning' {
  // Critical fields
  const criticalFields = [
    'survey_date', 'survey-date',
    'surveyor_name', 'surveyor-name',
    'site_address', 'site-address',
    'tree_count', 'tree-count',
    'condition_assessment', 'condition-assessment',
  ];
  
  if (field.isCritical || 
      criticalFields.includes(field.id) ||
      field.name.toLowerCase().includes('date') ||
      field.name.toLowerCase().includes('name') ||
      field.name.toLowerCase().includes('address')) {
    return 'critical';
  }
  
  // High importance fields
  const highFields = [
    'survey_method', 'survey-method',
    'client_name', 'client-name',
    'recommendations_summary', 'recommendations-summary',
  ];
  
  if (highFields.includes(field.id) ||
      field.name.toLowerCase().includes('method') ||
      field.name.toLowerCase().includes('client') ||
      field.name.toLowerCase().includes('recommendation')) {
    return 'high';
  }
  
  // Low importance fields
  const lowFields = [
    'priority_level', 'priority-level',
    'notes', 'comments',
  ];
  
  if (lowFields.includes(field.id) ||
      field.name.toLowerCase().includes('note') ||
      field.name.toLowerCase().includes('comment') ||
      field.name.toLowerCase().includes('optional')) {
    return 'low';
  }
  
  return 'medium'; // Default
}

/**
 * Normalize text for comparison
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' ')     // Normalize whitespace
    .trim();
}

/**
 * Calculate field completeness score
 */
export function calculateFieldCompletenessScore(
  missingFields: MissingRequiredField[],
  totalRequiredFields: number
): number {
  if (totalRequiredFields === 0) {
    return 100;
  }
  
  const missingCount = missingFields.length;
  const presentCount = totalRequiredFields - missingCount;
  
  // Weight by severity
  let weightedScore = 0;
  let totalWeight = 0;
  
  for (const field of missingFields) {
    const weight = getFieldSeverityWeight(field.severity);
    totalWeight += weight;
  }
  
  // Base score is percentage of fields present
  const baseScore = (presentCount / totalRequiredFields) * 100;
  
  // Apply penalty for missing fields weighted by severity
  const penalty = (totalWeight / (totalRequiredFields * 10)) * 100;
  
  return Math.max(0, Math.min(100, baseScore - penalty));
}

/**
 * Get weight for field severity level
 */
function getFieldSeverityWeight(severity: 'critical' | 'high' | 'medium' | 'low' | 'warning'): number {
  switch (severity) {
    case 'critical': return 15;
    case 'high': return 10;
    case 'medium': return 5;
    case 'low': return 2;
    case 'warning': return 0.5;
    default: return 5;
  }
}

/**
 * Get field validation statistics
 */
export function getFieldValidationStats(
  missingFields: MissingRequiredField[],
  totalRequiredFields: number
): {
  presentCount: number;
  missingCount: number;
  criticalMissing: number;
  highMissing: number;
  mediumMissing: number;
  lowMissing: number;
  warningMissing: number;
} {
  const stats = {
    presentCount: totalRequiredFields - missingFields.length,
    missingCount: missingFields.length,
    criticalMissing: 0,
    highMissing: 0,
    mediumMissing: 0,
    lowMissing: 0,
    warningMissing: 0,
  };
  
  for (const field of missingFields) {
    switch (field.severity) {
      case 'critical': stats.criticalMissing++; break;
      case 'high': stats.highMissing++; break;
      case 'medium': stats.mediumMissing++; break;
      case 'low': stats.lowMissing++; break;
      case 'warning': stats.warningMissing++; break;
    }
  }
  
  return stats;
}