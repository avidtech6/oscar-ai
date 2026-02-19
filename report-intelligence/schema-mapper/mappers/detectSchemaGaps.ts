/**
 * Report Schema Mapper - Phase 3
 * Detect Schema Gaps Helper
 * 
 * Helper functions for detecting schema gaps in the mapping.
 */

import type { DetectedSection } from '../../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';
import type { MappedField, MissingRequiredSection, ExtraSection, UnknownTerminology, SchemaGap } from '../SchemaMappingResult';

/**
 * Detect schema gaps in the mapping
 */
export function detectSchemaGaps(
  sections: DetectedSection[],
  reportType: ReportTypeDefinition | null,
  context: {
    mappedFields: MappedField[];
    missingRequiredSections: MissingRequiredSection[];
    extraSections: ExtraSection[];
    unknownTerminology: UnknownTerminology[];
  }
): SchemaGap[] {
  const schemaGaps: SchemaGap[] = [];
  
  // Gap 1: Missing required sections
  for (const missingSection of context.missingRequiredSections) {
    schemaGaps.push(createMissingSectionGap(missingSection));
  }
  
  // Gap 2: Extra sections (potential new patterns)
  for (const extraSection of context.extraSections) {
    schemaGaps.push(createExtraSectionGap(extraSection));
  }
  
  // Gap 3: Unknown terminology
  for (const unknownTerm of context.unknownTerminology) {
    schemaGaps.push(createUnknownTerminologyGap(unknownTerm));
  }
  
  // Gap 4: Low confidence mappings
  for (const mappedField of context.mappedFields) {
    if (mappedField.mappingConfidence < 0.6) {
      schemaGaps.push(createLowConfidenceMappingGap(mappedField));
    }
  }
  
  // Gap 5: Unsupported structures
  for (const section of sections) {
    if (section.type === 'table' && !reportType?.supportedFormats?.includes('html')) {
      schemaGaps.push(createUnsupportedStructureGap(section));
    }
  }
  
  // Gap 6: Inconsistent section hierarchy
  const hierarchyGaps = detectHierarchyGaps(sections);
  schemaGaps.push(...hierarchyGaps);
  
  return schemaGaps;
}

/**
 * Create a schema gap for a missing required section
 */
export function createMissingSectionGap(
  missingSection: MissingRequiredSection
): SchemaGap {
  return {
    gapId: `missing_section_${missingSection.sectionId}`,
    type: 'missing_section',
    description: `Required section "${missingSection.sectionName}" is missing from the report`,
    severity: 'critical',
    affectedSectionId: missingSection.sectionId,
    suggestedFix: `Add the "${missingSection.sectionName}" section with appropriate content`,
    data: missingSection,
    confidence: 0.9,
  };
}

/**
 * Create a schema gap for an extra section
 */
export function createExtraSectionGap(
  extraSection: ExtraSection
): SchemaGap {
  return {
    gapId: `extra_section_${extraSection.sectionId}`,
    type: 'unknown_section',
    description: `Section "${extraSection.sectionTitle}" is not defined in the report type schema`,
    severity: 'warning',
    affectedSectionId: extraSection.sectionId,
    suggestedFix: getExtraSectionFixSuggestion(extraSection),
    data: extraSection,
    confidence: extraSection.confidence,
  };
}

/**
 * Get fix suggestion for an extra section based on its suggested action
 */
function getExtraSectionFixSuggestion(extraSection: ExtraSection): string {
  switch (extraSection.suggestedAction) {
    case 'add_to_schema':
      return `Add "${extraSection.sectionTitle}" as a new section to the report type definition`;
    case 'map_to_existing':
      return `Map "${extraSection.sectionTitle}" to an existing section in the schema`;
    case 'ignore':
      return `Ignore "${extraSection.sectionTitle}" as it appears to be noise or duplicate content`;
    case 'flag_for_review':
    default:
      return `Review "${extraSection.sectionTitle}" to determine if it should be added to the schema`;
  }
}

/**
 * Create a schema gap for unknown terminology
 */
export function createUnknownTerminologyGap(
  unknownTerm: UnknownTerminology
): SchemaGap {
  return {
    gapId: `unknown_term_${unknownTerm.term.replace(/[^a-z0-9]/gi, '_')}`,
    type: 'unknown_terminology',
    description: `Terminology "${unknownTerm.term}" is not recognized in the system`,
    severity: 'info',
    suggestedFix: `Add "${unknownTerm.term}" to the terminology database with appropriate definition`,
    data: unknownTerm,
    confidence: unknownTerm.confidence,
  };
}

/**
 * Create a schema gap for low confidence mapping
 */
export function createLowConfidenceMappingGap(
  mappedField: MappedField
): SchemaGap {
  return {
    gapId: `low_confidence_mapping_${mappedField.fieldId}`,
    type: 'mismatched_schema',
    description: `Low confidence mapping for field "${mappedField.fieldName}" (confidence: ${mappedField.mappingConfidence.toFixed(2)})`,
    severity: 'warning',
    affectedFieldId: mappedField.fieldId,
    suggestedFix: `Review mapping of section "${mappedField.sourceSectionTitle}" to field "${mappedField.fieldName}"`,
    data: mappedField,
    confidence: 1 - mappedField.mappingConfidence, // Inverse confidence
  };
}

/**
 * Create a schema gap for unsupported structure
 */
export function createUnsupportedStructureGap(
  section: DetectedSection
): SchemaGap {
  return {
    gapId: `unsupported_structure_${section.id}`,
    type: 'unsupported_structure',
    description: `Table structure detected but report type may not support tabular data`,
    severity: 'warning',
    affectedSectionId: section.id,
    suggestedFix: `Consider adding table support to the report type or converting table to text`,
    data: section,
    confidence: 0.8,
  };
}

/**
 * Detect hierarchy gaps in section structure
 */
export function detectHierarchyGaps(
  sections: DetectedSection[]
): SchemaGap[] {
  const gaps: SchemaGap[] = [];
  
  // Check for missing parent sections
  const sectionsWithParents = sections.filter(s => s.parentId);
  const parentIds = new Set(sections.map(s => s.id));
  
  for (const section of sectionsWithParents) {
    if (section.parentId && !parentIds.has(section.parentId)) {
      gaps.push({
        gapId: `missing_parent_${section.id}`,
        type: 'missing_field',
        description: `Section "${section.title}" references missing parent section "${section.parentId}"`,
        severity: 'warning',
        affectedSectionId: section.id,
        suggestedFix: `Fix parent reference or add missing parent section`,
        data: section,
        confidence: 0.7,
      });
    }
  }
  
  // Check for inconsistent heading levels
  const headingSections = sections.filter(s => s.type === 'heading' || s.type === 'subheading');
  const headingLevels = headingSections.map(s => s.level);
  
  if (headingLevels.length > 0) {
    const maxLevel = Math.max(...headingLevels);
    const minLevel = Math.min(...headingLevels);
    
    if (maxLevel - minLevel > 3) {
      gaps.push({
        gapId: 'inconsistent_heading_levels',
        type: 'unsupported_structure',
        description: `Inconsistent heading levels detected (range: ${minLevel}-${maxLevel})`,
        severity: 'info',
        suggestedFix: `Normalize heading levels for better structure`,
        data: { headingLevels, sections: headingSections.length },
        confidence: 0.6,
      });
    }
  }
  
  return gaps;
}

/**
 * Calculate overall schema gap severity
 */
export function calculateOverallGapSeverity(gaps: SchemaGap[]): 'critical' | 'warning' | 'info' {
  if (gaps.some(gap => gap.severity === 'critical')) {
    return 'critical';
  }
  
  if (gaps.some(gap => gap.severity === 'warning')) {
    return 'warning';
  }
  
  return 'info';
}

/**
 * Group schema gaps by type
 */
export function groupGapsByType(gaps: SchemaGap[]): Record<string, SchemaGap[]> {
  const grouped: Record<string, SchemaGap[]> = {};
  
  for (const gap of gaps) {
    if (!grouped[gap.type]) {
      grouped[gap.type] = [];
    }
    grouped[gap.type].push(gap);
  }
  
  return grouped;
}