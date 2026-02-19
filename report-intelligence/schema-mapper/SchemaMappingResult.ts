/**
 * Report Schema Mapper - Phase 3
 * SchemaMappingResult Interface
 * 
 * This defines the structure for schema mapping results after processing.
 */

import type { DecompiledReport } from '../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../registry/ReportTypeDefinition';

/**
 * A mapped field from decompiled section to internal schema
 */
export interface MappedField {
  fieldId: string;
  fieldName: string;
  fieldType: 'text' | 'number' | 'date' | 'boolean' | 'array' | 'object' | 'section' | 'compliance' | 'terminology';
  sourceSectionId: string;
  sourceSectionTitle: string;
  mappedValue: any;
  mappingConfidence: number; // 0-1 confidence score
  mappingMethod: 'exact_match' | 'fuzzy_match' | 'inferred' | 'derived' | 'default';
  notes?: string;
}

/**
 * An unmapped section that couldn't be mapped to the schema
 */
export interface UnmappedSection {
  sectionId: string;
  sectionTitle: string;
  sectionType: string;
  contentPreview: string;
  reason: 'no_matching_field' | 'ambiguous_match' | 'low_confidence' | 'schema_gap' | 'unknown_structure';
  suggestedFieldId?: string;
  suggestedFieldName?: string;
  confidence: number;
}

/**
 * A missing required section according to the report type definition
 */
export interface MissingRequiredSection {
  sectionId: string;
  sectionName: string;
  description: string;
  required: boolean;
  reason: 'not_present' | 'empty' | 'invalid_format' | 'conditional_not_met';
  suggestedContent?: string;
  aiGuidance?: string;
}

/**
 * An extra section not defined in the report type definition
 */
export interface ExtraSection {
  sectionId: string;
  sectionTitle: string;
  sectionType: string;
  contentPreview: string;
  potentialPurpose: string;
  suggestedAction: 'ignore' | 'add_to_schema' | 'map_to_existing' | 'flag_for_review';
  confidence: number;
}

/**
 * Unknown terminology not recognized in the system
 */
export interface UnknownTerminology {
  term: string;
  context: string;
  frequency: number;
  category: 'technical' | 'legal' | 'compliance' | 'species' | 'measurement' | 'general' | 'unknown';
  suggestedDefinition?: string;
  suggestedCategory?: string;
  confidence: number;
}

/**
 * A schema gap identified during mapping
 */
export interface SchemaGap {
  gapId: string;
  type: 'missing_field' | 'missing_section' | 'unknown_section' | 'unknown_terminology' | 'unsupported_structure' | 'mismatched_schema';
  description: string;
  severity: 'critical' | 'warning' | 'info';
  affectedSectionId?: string;
  affectedFieldId?: string;
  suggestedFix: string;
  data: any; // Additional context data
  confidence: number;
}

/**
 * The complete schema mapping result
 */
export interface SchemaMappingResult {
  // Core identification
  id: string;
  decompiledReportId: string;
  reportTypeId?: string; // Nullable if report type couldn't be identified
  reportTypeName?: string;
  
  // Mapping results
  mappedFields: MappedField[];
  unmappedSections: UnmappedSection[];
  missingRequiredSections: MissingRequiredSection[];
  extraSections: ExtraSection[];
  unknownTerminology: UnknownTerminology[];
  schemaGaps: SchemaGap[];
  
  // Confidence and metrics
  confidenceScore: number; // Overall confidence in mapping (0-1)
  mappingCoverage: number; // Percentage of content successfully mapped (0-100)
  completenessScore: number; // How complete the mapping is relative to schema (0-100)
  
  // Processing metadata
  processingTimeMs: number;
  mappingStrategy: 'automatic' | 'semi_automatic' | 'manual';
  mapperVersion: string;
  
  // Timestamps
  createdAt: Date;
  processedAt: Date;
  
  // References
  decompiledReportSnapshot?: Partial<DecompiledReport>;
  reportTypeDefinitionSnapshot?: Partial<ReportTypeDefinition>;
  
  // Warnings and errors
  warnings: string[];
  errors: string[];
}

/**
 * Helper function to create a new SchemaMappingResult
 */
export function createSchemaMappingResult(
  decompiledReportId: string,
  reportTypeId?: string
): Omit<SchemaMappingResult, 'id' | 'createdAt' | 'processedAt'> {
  const now = new Date();
  
  return {
    decompiledReportId,
    reportTypeId,
    reportTypeName: undefined,
    mappedFields: [],
    unmappedSections: [],
    missingRequiredSections: [],
    extraSections: [],
    unknownTerminology: [],
    schemaGaps: [],
    confidenceScore: 0,
    mappingCoverage: 0,
    completenessScore: 0,
    processingTimeMs: 0,
    mappingStrategy: 'automatic',
    mapperVersion: '1.0.0',
    decompiledReportSnapshot: undefined,
    reportTypeDefinitionSnapshot: undefined,
    warnings: [],
    errors: [],
  };
}

/**
 * Calculate mapping coverage percentage
 */
export function calculateMappingCoverage(
  mappedFields: MappedField[],
  totalSections: number
): number {
  if (totalSections === 0) return 0;
  const mappedSections = new Set(mappedFields.map(f => f.sourceSectionId)).size;
  return Math.round((mappedSections / totalSections) * 100);
}

/**
 * Calculate completeness score
 */
export function calculateCompletenessScore(
  missingRequiredSections: MissingRequiredSection[],
  totalRequiredSections: number
): number {
  if (totalRequiredSections === 0) return 100;
  const missingCount = missingRequiredSections.filter(s => s.required).length;
  return Math.round(((totalRequiredSections - missingCount) / totalRequiredSections) * 100);
}

/**
 * Generate a unique ID for a mapping result
 */
export function generateMappingResultId(): string {
  return `mapping_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}