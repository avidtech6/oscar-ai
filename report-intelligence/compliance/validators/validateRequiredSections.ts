/**
 * Phase 9: Report Compliance Validator
 * Required Sections Validator
 * 
 * Validates that all required sections are present in the report.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { SchemaMappingResult } from '../../schema-mapper/SchemaMappingResult';
import type { ReportTypeRegistry } from '../../registry/ReportTypeRegistry';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';
import type { MissingRequiredSection } from '../ComplianceResult';

/**
 * Configuration for section validation
 */
export interface SectionValidationConfig {
  strictMode: boolean;
  allowSimilarTitles: boolean;
  minimumConfidence: number;
  includeConditionalSections: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: SectionValidationConfig = {
  strictMode: true,
  allowSimilarTitles: true,
  minimumConfidence: 0.7,
  includeConditionalSections: false,
};

/**
 * Validate required sections in a report
 */
export async function validateRequiredSections(
  decompiledReport: DecompiledReport,
  schemaMappingResult: SchemaMappingResult,
  registry?: ReportTypeRegistry,
  config: Partial<SectionValidationConfig> = {}
): Promise<MissingRequiredSection[]> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const missingSections: MissingRequiredSection[] = [];
  
  try {
    // Determine report type
    const reportTypeId = schemaMappingResult.reportTypeId || decompiledReport.detectedReportType;
    if (!reportTypeId) {
      console.warn('[validateRequiredSections] Cannot validate sections: report type unknown');
      return missingSections;
    }
    
    // Get report type definition
    const reportType = registry?.getType(reportTypeId);
    if (!reportType) {
      console.warn(`[validateRequiredSections] Report type "${reportTypeId}" not found in registry`);
      return missingSections;
    }
    
    // Get required sections from report type definition
    const requiredSections = getRequiredSectionsFromDefinition(reportType, mergedConfig);
    
    // Get actual sections from decompiled report and mapping result
    const actualSections = getActualSections(decompiledReport, schemaMappingResult);
    
    // Check each required section
    for (const requiredSection of requiredSections) {
      const isPresent = checkSectionPresence(requiredSection, actualSections, mergedConfig);
      
      if (!isPresent) {
        const missingSection: MissingRequiredSection = {
          sectionId: requiredSection.id,
          sectionName: requiredSection.name,
          requirementSource: requiredSection.requirementSource || `${reportTypeId} Standard`,
          severity: determineSectionSeverity(requiredSection),
          description: `Required section "${requiredSection.name}" is missing`,
          remediationGuidance: `Add the "${requiredSection.name}" section to the report`,
        };
        missingSections.push(missingSection);
      }
    }
    
    return missingSections;
    
  } catch (error) {
    console.error('[validateRequiredSections] Error validating required sections:', error);
    throw error;
  }
}

/**
 * Get required sections from report type definition
 */
function getRequiredSectionsFromDefinition(
  reportType: ReportTypeDefinition,
  config: SectionValidationConfig
): Array<{id: string, name: string, requirementSource?: string, isConditional?: boolean}> {
  const sections: Array<{id: string, name: string, requirementSource?: string, isConditional?: boolean}> = [];
  
  // Add required sections
  if (reportType.requiredSections) {
    for (const section of reportType.requiredSections) {
      sections.push({
        id: section.id,
        name: section.name,
        requirementSource: section.description, // Use description as fallback
        isConditional: false,
      });
    }
  }
  
  // Add conditional sections if configured
  if (config.includeConditionalSections && reportType.conditionalSections) {
    for (const section of reportType.conditionalSections) {
      sections.push({
        id: section.id,
        name: section.name,
        requirementSource: section.description, // Use description as fallback
        isConditional: true,
      });
    }
  }
  
  return sections;
}

/**
 * Get actual sections from decompiled report and mapping result
 */
function getActualSections(
  decompiledReport: DecompiledReport,
  schemaMappingResult: SchemaMappingResult
): Array<{id: string, title: string, confidence: number}> {
  const sections: Array<{id: string, title: string, confidence: number}> = [];
  
  // Add sections from decompiled report
  if (decompiledReport.sections) {
    for (const section of decompiledReport.sections) {
      sections.push({
        id: section.id,
        title: section.title,
        confidence: section.metadata.confidence,
      });
    }
  }
  
  // Add sections from schema mapping result
  if (schemaMappingResult.mappedFields) {
    const uniqueSectionIds = new Set<string>();
    
    for (const field of schemaMappingResult.mappedFields) {
      if (field.sourceSectionId && !uniqueSectionIds.has(field.sourceSectionId)) {
        uniqueSectionIds.add(field.sourceSectionId);
        sections.push({
          id: field.sourceSectionId,
          title: field.sourceSectionTitle || field.sourceSectionId,
          confidence: field.mappingConfidence,
        });
      }
    }
  }
  
  // Add unmapped sections
  if (schemaMappingResult.unmappedSections) {
    for (const section of schemaMappingResult.unmappedSections) {
      sections.push({
        id: section.sectionId,
        title: section.sectionTitle,
        confidence: section.confidence,
      });
    }
  }
  
  return sections;
}

/**
 * Check if a required section is present
 */
function checkSectionPresence(
  requiredSection: {id: string, name: string, isConditional?: boolean},
  actualSections: Array<{id: string, title: string, confidence: number}>,
  config: SectionValidationConfig
): boolean {
  // Check by ID
  const exactMatch = actualSections.find(section => 
    section.id === requiredSection.id || 
    section.id.toLowerCase() === requiredSection.id.toLowerCase()
  );
  
  if (exactMatch && exactMatch.confidence >= config.minimumConfidence) {
    return true;
  }
  
  // Check by title similarity if allowed
  if (config.allowSimilarTitles) {
    const normalizedRequiredName = normalizeText(requiredSection.name);
    
    for (const actualSection of actualSections) {
      if (actualSection.confidence < config.minimumConfidence) {
        continue;
      }
      
      const normalizedActualTitle = normalizeText(actualSection.title);
      
      // Check for exact title match
      if (normalizedActualTitle === normalizedRequiredName) {
        return true;
      }
      
      // Check for partial match (e.g., "Executive Summary" vs "Executive Summary:")
      if (normalizedActualTitle.includes(normalizedRequiredName) ||
          normalizedRequiredName.includes(normalizedActualTitle)) {
        return true;
      }
      
      // Check for keyword match
      const requiredKeywords = normalizedRequiredName.split(/\s+/);
      const actualKeywords = normalizedActualTitle.split(/\s+/);
      
      const matchingKeywords = requiredKeywords.filter(keyword =>
        actualKeywords.some(actual => actual.includes(keyword) || keyword.includes(actual))
      );
      
      if (matchingKeywords.length >= Math.min(2, requiredKeywords.length)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Determine section severity
 */
function determineSectionSeverity(section: {id: string, name: string, isConditional?: boolean}): 'critical' | 'high' | 'medium' | 'low' | 'warning' {
  // Critical sections
  const criticalSections = [
    'executive_summary', 'executive-summary',
    'findings',
    'recommendations',
    'methodology',
  ];
  
  if (criticalSections.includes(section.id) ||
      section.name.toLowerCase().includes('executive') ||
      section.name.toLowerCase().includes('findings') ||
      section.name.toLowerCase().includes('recommendations')) {
    return 'critical';
  }
  
  // High importance sections
  const highSections = [
    'conclusions',
    'introduction',
    'scope',
    'limitations',
  ];
  
  if (highSections.includes(section.id) ||
      section.name.toLowerCase().includes('conclusion') ||
      section.name.toLowerCase().includes('introduction')) {
    return 'high';
  }
  
  // Conditional sections are lower severity
  if (section.isConditional) {
    return 'medium';
  }
  
  // Appendices and references are warnings
  const warningSections = [
    'appendix', 'appendices',
    'references', 'bibliography',
    'glossary',
  ];
  
  if (warningSections.some(warning => section.id.includes(warning) || section.name.toLowerCase().includes(warning))) {
    return 'warning';
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
 * Calculate section completeness score
 */
export function calculateSectionCompletenessScore(
  missingSections: MissingRequiredSection[],
  totalRequiredSections: number
): number {
  if (totalRequiredSections === 0) {
    return 100;
  }
  
  const missingCount = missingSections.length;
  const presentCount = totalRequiredSections - missingCount;
  
  // Weight by severity
  let weightedScore = 0;
  let totalWeight = 0;
  
  for (const section of missingSections) {
    const weight = getSeverityWeight(section.severity);
    totalWeight += weight;
  }
  
  // Base score is percentage of sections present
  const baseScore = (presentCount / totalRequiredSections) * 100;
  
  // Apply penalty for missing sections weighted by severity
  const penalty = (totalWeight / (totalRequiredSections * 10)) * 100;
  
  return Math.max(0, Math.min(100, baseScore - penalty));
}

/**
 * Get weight for severity level
 */
function getSeverityWeight(severity: 'critical' | 'high' | 'medium' | 'low' | 'warning'): number {
  switch (severity) {
    case 'critical': return 10;
    case 'high': return 7;
    case 'medium': return 4;
    case 'low': return 1;
    case 'warning': return 0.5; // Warnings have minimal impact on score
    default: return 5;
  }
}