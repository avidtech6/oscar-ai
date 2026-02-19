/**
 * Phase 9: Report Compliance Validator
 * Terminology Validator
 * 
 * Validates terminology usage and consistency in the report.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { SchemaMappingResult } from '../../schema-mapper/SchemaMappingResult';
import type { ReportTypeRegistry } from '../../registry/ReportTypeRegistry';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';
import type { TerminologyIssue, ComplianceSeverity } from '../ComplianceResult';
import { generateTerminologyIssueId } from '../ComplianceResult';

/**
 * Configuration for terminology validation
 */
export interface TerminologyValidationConfig {
  validateStandardTerms: boolean;
  validateConsistency: boolean;
  validateAmbiguity: boolean;
  validateOutdatedTerms: boolean;
  standardsToCheck: string[]; // e.g., ['BS5837:2012', 'AIA', 'AMS']
  minimumConfidence: number;
  includeSuggestions: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: TerminologyValidationConfig = {
  validateStandardTerms: true,
  validateConsistency: true,
  validateAmbiguity: true,
  validateOutdatedTerms: true,
  standardsToCheck: ['BS5837:2012', 'AIA', 'AMS', 'Condition Report', 'Safety Report'],
  minimumConfidence: 0.7,
  includeSuggestions: true,
};

/**
 * Standard terminology databases
 */
const STANDARD_TERMINOLOGY: Record<string, Record<string, string[]>> = {
  'BS5837:2012': {
    'tree': ['tree', 'specimen tree', 'ancient tree', 'veteran tree', 'protected tree'],
    'assessment': ['tree assessment', 'visual tree assessment', 'detailed assessment'],
    'protection': ['root protection area', 'rpa', 'above ground protection', 'below ground protection'],
    'methodology': ['visual tree assessment', 'decay detection', 'resistograph testing'],
    'condition': ['good', 'fair', 'poor', 'dead', 'dying', 'diseased'],
  },
  'AIA': {
    'risk': ['tree risk assessment', 'hazard assessment', 'risk categorization'],
    'condition': ['condition category', 'structural condition', 'physiological condition'],
    'management': ['tree management', 'arboricultural management', 'tree work'],
    'survey': ['tree survey', 'arboricultural survey', 'detailed survey'],
  },
  'AMS': {
    'method': ['method statement', 'arboricultural method statement', 'working method'],
    'safety': ['safe working practices', 'safety procedures', 'risk control measures'],
    'equipment': ['specialist equipment', 'climbing equipment', 'rigging equipment'],
    'supervision': ['supervision', 'site supervision', 'qualified supervision'],
  },
};

/**
 * Outdated terminology to flag
 */
const OUTDATED_TERMS: Record<string, string[]> = {
  'tree_felling': ['felling', 'cutting down', 'removal'], // Modern: 'tree removal', 'tree works'
  'inspection': ['inspection'], // Modern: 'assessment', 'survey'
  'report': ['report'], // Modern: 'assessment report', 'survey report'
  'damage': ['damage', 'injury'], // Modern: 'defect', 'condition issue'
};

/**
 * Ambiguous terms to flag
 */
const AMBIGUOUS_TERMS: Record<string, string[]> = {
  'tree': ['tree'], // Could be specific species or general
  'large': ['large', 'big', 'small'], // Subjective size terms
  'old': ['old', 'young', 'mature'], // Subjective age terms
  'healthy': ['healthy', 'unhealthy', 'sick'], // Subjective health terms
  'significant': ['significant', 'important', 'minor'], // Subjective importance
};

/**
 * Validate terminology in a report
 */
export async function validateTerminology(
  decompiledReport: DecompiledReport,
  schemaMappingResult: SchemaMappingResult,
  registry?: ReportTypeRegistry,
  config: Partial<TerminologyValidationConfig> = {}
): Promise<TerminologyIssue[]> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const issues: TerminologyIssue[] = [];
  
  try {
    // Get report type
    const reportTypeId = schemaMappingResult.reportTypeId || decompiledReport.detectedReportType;
    if (!reportTypeId) {
      console.warn('[validateTerminology] Cannot validate terminology: report type unknown');
      return issues;
    }
    
    // Get report type definition
    const reportType = registry?.getType(reportTypeId);
    
    // Extract all text from decompiled report
    const allText = extractAllText(decompiledReport);
    
    // Validate standard terms
    if (mergedConfig.validateStandardTerms) {
      const standardIssues = validateStandardTerms(allText, reportType, mergedConfig);
      issues.push(...standardIssues);
    }
    
    // Validate consistency
    if (mergedConfig.validateConsistency) {
      const consistencyIssues = validateConsistency(allText, decompiledReport, mergedConfig);
      issues.push(...consistencyIssues);
    }
    
    // Validate ambiguity
    if (mergedConfig.validateAmbiguity) {
      const ambiguityIssues = validateAmbiguity(allText, mergedConfig);
      issues.push(...ambiguityIssues);
    }
    
    // Validate outdated terms
    if (mergedConfig.validateOutdatedTerms) {
      const outdatedIssues = validateOutdatedTerms(allText, mergedConfig);
      issues.push(...outdatedIssues);
    }
    
    return issues;
    
  } catch (error) {
    console.error('[validateTerminology] Error validating terminology:', error);
    throw error;
  }
}

/**
 * Extract all text from decompiled report
 */
function extractAllText(decompiledReport: DecompiledReport): string {
  const sections = decompiledReport.sections || [];
  let allText = '';
  
  // Add section titles and content
  for (const section of sections) {
    allText += ` ${section.title} ${section.content || ''}`;
  }
  
  // Add metadata if available
  if (decompiledReport.metadata) {
    allText += ` ${JSON.stringify(decompiledReport.metadata)}`;
  }
  
  return allText.toLowerCase();
}

/**
 * Validate standard terminology
 */
function validateStandardTerms(
  allText: string,
  reportType: ReportTypeDefinition | undefined,
  config: TerminologyValidationConfig
): TerminologyIssue[] {
  const issues: TerminologyIssue[] = [];
  
  // Determine which standards to check based on report type
  const standardsToCheck = determineApplicableStandards(reportType, config);
  
  // Check each standard
  for (const standard of standardsToCheck) {
    const terminology = STANDARD_TERMINOLOGY[standard];
    if (!terminology) continue;
    
    // Check each category in the standard
    for (const [category, standardTerms] of Object.entries(terminology)) {
      // Check if any standard term is present
      let foundStandardTerm = false;
      for (const term of standardTerms) {
        if (allText.includes(term.toLowerCase())) {
          foundStandardTerm = true;
          break;
        }
      }
      
      // If no standard term found for an important category, flag it
      if (!foundStandardTerm && isImportantCategory(category, standard)) {
        issues.push({
          term: category,
          issueType: 'non_standard',
          location: 'Report',
          description: `Report does not use standard ${standard} terminology for "${category}"`,
          severity: 'medium',
          suggestedTerm: standardTerms[0],
          standardReference: `${standard} terminology`,
          remediationGuidance: `Use standard ${standard} terms for ${category}: ${standardTerms.join(', ')}`,
        });
      }
    }
  }
  
  return issues;
}

/**
 * Validate terminology consistency
 */
function validateConsistency(
  allText: string,
  decompiledReport: DecompiledReport,
  config: TerminologyValidationConfig
): TerminologyIssue[] {
  const issues: TerminologyIssue[] = [];
  const sections = decompiledReport.sections || [];
  
  // Track term usage across sections
  const termUsage: Record<string, {count: number, sections: string[]}> = {};
  
  // Common terms to check for consistency
  const consistencyTerms = [
    'tree', 'assessment', 'survey', 'methodology', 'condition',
    'risk', 'protection', 'recommendation', 'conclusion'
  ];
  
  // Check each section
  for (const section of sections) {
    const sectionText = (section.title + ' ' + (section.content || '')).toLowerCase();
    
    for (const term of consistencyTerms) {
      if (sectionText.includes(term)) {
        if (!termUsage[term]) {
          termUsage[term] = { count: 0, sections: [] };
        }
        termUsage[term].count++;
        termUsage[term].sections.push(section.title);
      }
    }
  }
  
  // Check for inconsistent usage
  for (const [term, usage] of Object.entries(termUsage)) {
    if (usage.count > 1) {
      // Check if term is used consistently (same form throughout)
      // For now, we'll just note if it appears in multiple sections
      // In a more advanced implementation, we'd check for variations
      
      issues.push({
        term,
        issueType: 'inconsistent',
        location: `Sections: ${usage.sections.join(', ')}`,
        description: `Term "${term}" appears in ${usage.count} sections`,
        severity: 'low',
        suggestedTerm: undefined,
        standardReference: 'Terminology consistency',
        remediationGuidance: 'Ensure consistent usage of this term throughout the report',
      });
    }
  }
  
  // Check for synonyms used for the same concept
  const synonymGroups = [
    ['assessment', 'survey', 'inspection', 'evaluation'],
    ['tree', 'specimen', 'plant', 'vegetation'],
    ['methodology', 'method', 'approach', 'procedure'],
    ['recommendation', 'suggestion', 'advice', 'proposal'],
  ];
  
  for (const synonyms of synonymGroups) {
    const foundSynonyms: string[] = [];
    
    for (const synonym of synonyms) {
      if (allText.includes(synonym)) {
        foundSynonyms.push(synonym);
      }
    }
    
    if (foundSynonyms.length > 1) {
      issues.push({
        term: foundSynonyms.join('/'),
        issueType: 'inconsistent',
        location: 'Report',
        description: `Multiple synonyms used for same concept: ${foundSynonyms.join(', ')}`,
        severity: 'low',
        suggestedTerm: foundSynonyms[0], // Use the first one as preferred
        standardReference: 'Terminology consistency',
        remediationGuidance: `Choose one term and use it consistently throughout the report. Recommended: "${foundSynonyms[0]}"`,
      });
    }
  }
  
  return issues;
}

/**
 * Validate ambiguous terminology
 */
function validateAmbiguity(
  allText: string,
  config: TerminologyValidationConfig
): TerminologyIssue[] {
  const issues: TerminologyIssue[] = [];
  
  // Check for ambiguous terms
  for (const [category, ambiguousTerms] of Object.entries(AMBIGUOUS_TERMS)) {
    for (const term of ambiguousTerms) {
      if (allText.includes(term)) {
        issues.push({
          term,
          issueType: 'ambiguous',
          location: 'Report',
          description: `Ambiguous term "${term}" used in report`,
          severity: 'low',
          suggestedTerm: getSuggestedTerm(term),
          standardReference: 'Clear communication',
          remediationGuidance: `Replace ambiguous term "${term}" with more specific terminology`,
        });
      }
    }
  }
  
  return issues;
}

/**
 * Validate outdated terminology
 */
function validateOutdatedTerms(
  allText: string,
  config: TerminologyValidationConfig
): TerminologyIssue[] {
  const issues: TerminologyIssue[] = [];
  
  // Check for outdated terms
  for (const [category, outdatedTerms] of Object.entries(OUTDATED_TERMS)) {
    for (const term of outdatedTerms) {
      if (allText.includes(term)) {
        issues.push({
          term,
          issueType: 'outdated',
          location: 'Report',
          description: `Outdated term "${term}" used in report`,
          severity: 'low',
          suggestedTerm: getModernTerm(term),
          standardReference: 'Modern arboricultural practice',
          remediationGuidance: `Replace outdated term "${term}" with modern equivalent`,
        });
      }
    }
  }
  
  return issues;
}

/**
 * Determine applicable standards based on report type
 */
function determineApplicableStandards(
  reportType: ReportTypeDefinition | undefined,
  config: TerminologyValidationConfig
): string[] {
  // Start with configured standards
  let applicableStandards = [...config.standardsToCheck];
  
  // Filter based on report type if available
  if (reportType) {
    const reportTypeName = reportType.name.toLowerCase();
    
    // Map report types to standards
    if (reportTypeName.includes('bs5837') || reportTypeName.includes('tree survey')) {
      applicableStandards = applicableStandards.filter(s => s.includes('BS5837'));
    } else if (reportTypeName.includes('condition')) {
      applicableStandards = applicableStandards.filter(s => s.includes('Condition') || s.includes('AIA'));
    } else if (reportTypeName.includes('safety') || reportTypeName.includes('method')) {
      applicableStandards = applicableStandards.filter(s => s.includes('AMS') || s.includes('Safety'));
    }
  }
  
  // Ensure we have at least one standard
  if (applicableStandards.length === 0) {
    applicableStandards = ['BS5837:2012']; // Default
  }
  
  return applicableStandards;
}

/**
 * Check if a category is important for a standard
 */
function isImportantCategory(category: string, standard: string): boolean {
  const importantCategories: Record<string, string[]> = {
    'BS5837:2012': ['tree', 'assessment', 'protection', 'methodology'],
    'AIA': ['risk', 'condition', 'management'],
    'AMS': ['method', 'safety', 'equipment'],
  };
  
  return importantCategories[standard]?.includes(category) || false;
}

/**
 * Get suggested term for ambiguous term
 */
function getSuggestedTerm(ambiguousTerm: string): string | undefined {
  const suggestions: Record<string, string> = {
    'tree': 'specimen tree (if specific) or tree population (if general)',
    'large': 'specify dimensions (e.g., "DBH > 50cm", "height > 15m")',
    'old': 'specify age category (e.g., "mature", "veteran", "ancient")',
    'healthy': 'specify condition (e.g., "good condition", "no visible defects")',
    'significant': 'specify criteria (e.g., "protected status", "high amenity value")',
  };
  
  return suggestions[ambiguousTerm];
}

/**
 * Get modern term for outdated term
 */
function getModernTerm(outdatedTerm: string): string | undefined {
  const modernTerms: Record<string, string> = {
    'felling': 'tree removal',
    'cutting down': 'tree works',
    'removal': 'tree removal',
    'inspection': 'tree assessment',
    'report': 'assessment report',
    'damage': 'defect',
    'injury': 'condition issue',
  };
  
  return modernTerms[outdatedTerm];
}