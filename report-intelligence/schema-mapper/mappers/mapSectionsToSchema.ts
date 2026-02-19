/**
 * Report Schema Mapper - Phase 3
 * Map Sections to Schema Helper
 * 
 * Helper functions for mapping decompiled sections to internal schema fields.
 */

import type { DetectedSection } from '../../decompiler/DecompiledReport';
import type { ReportSectionDefinition } from '../../registry/ReportTypeDefinition';
import type { MappedField } from '../SchemaMappingResult';

/**
 * Map a section to a schema field with confidence scoring
 */
export function mapSectionToSchemaField(
  section: DetectedSection,
  sectionDef: ReportSectionDefinition
): { mappedField: MappedField; confidence: number } {
  const confidence = calculateSectionMatchConfidence(section, sectionDef);
  
  return {
    mappedField: {
      fieldId: sectionDef.id,
      fieldName: sectionDef.name,
      fieldType: determineFieldType(section),
      sourceSectionId: section.id,
      sourceSectionTitle: section.title,
      mappedValue: section.content,
      mappingConfidence: confidence,
      mappingMethod: confidence >= 0.8 ? 'exact_match' : confidence >= 0.6 ? 'fuzzy_match' : 'inferred',
      notes: `Mapped from section "${section.title}" to field "${sectionDef.name}"`,
    },
    confidence,
  };
}

/**
 * Calculate confidence score for section matching
 */
export function calculateSectionMatchConfidence(
  section: DetectedSection,
  sectionDef: ReportSectionDefinition
): number {
  let confidence = 0;
  
  // Exact name match
  if (section.title.toLowerCase() === sectionDef.name.toLowerCase()) {
    confidence += 0.8;
  }
  
  // Partial name match
  else if (section.title.toLowerCase().includes(sectionDef.name.toLowerCase()) ||
           sectionDef.name.toLowerCase().includes(section.title.toLowerCase())) {
    confidence += 0.6;
  }
  
  // Check for keywords in description
  if (sectionDef.description) {
    const descWords = sectionDef.description.toLowerCase().split(/\s+/);
    const titleWords = section.title.toLowerCase().split(/\s+/);
    
    const commonWords = descWords.filter(word => 
      titleWords.includes(word) && word.length > 3
    );
    
    if (commonWords.length > 0) {
      confidence += 0.2 * Math.min(commonWords.length, 3);
    }
  }
  
  // Check section type compatibility
  if (sectionDef.template?.includes('heading') && section.type === 'heading') {
    confidence += 0.1;
  }
  
  // Cap at 1.0
  return Math.min(confidence, 1.0);
}

/**
 * Determine field type based on section content
 */
export function determineFieldType(section: DetectedSection): MappedField['fieldType'] {
  const content = section.content.toLowerCase();
  
  if (section.type === 'table') return 'object';
  if (section.type === 'list') return 'array';
  if (/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(content)) return 'date';
  if (/^\d+(\.\d+)?$/.test(section.content.trim())) return 'number';
  if (/^(yes|no|true|false)$/i.test(section.content.trim())) return 'boolean';
  
  return 'text';
}

/**
 * Find the best matching section definition for a decompiled section
 */
export function findBestSectionMatch(
  section: DetectedSection,
  sectionDefs: ReportSectionDefinition[]
): { sectionDef: ReportSectionDefinition; confidence: number } | null {
  let bestMatch: { sectionDef: ReportSectionDefinition; confidence: number } | null = null;
  
  for (const sectionDef of sectionDefs) {
    const confidence = calculateSectionMatchConfidence(section, sectionDef);
    
    if (confidence > 0.3 && (!bestMatch || confidence > bestMatch.confidence)) {
      bestMatch = { sectionDef, confidence };
    }
  }
  
  return bestMatch;
}

/**
 * Create a generic mapping for a section when no report type match is found
 */
export function createGenericMapping(section: DetectedSection): MappedField {
  const fieldId = `generic_${section.type}_${section.id.replace(/[^a-z0-9]/gi, '_')}`;
  
  return {
    fieldId,
    fieldName: section.title || `Untitled ${section.type}`,
    fieldType: determineFieldType(section),
    sourceSectionId: section.id,
    sourceSectionTitle: section.title,
    mappedValue: section.content,
    mappingConfidence: 0.4,
    mappingMethod: 'inferred',
    notes: `Generic mapping for ${section.type} section`,
  };
}