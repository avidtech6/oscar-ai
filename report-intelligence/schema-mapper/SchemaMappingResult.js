"use strict";
/**
 * Report Schema Mapper - Phase 3
 * SchemaMappingResult Interface
 *
 * This defines the structure for schema mapping results after processing.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMappingResultId = exports.calculateCompletenessScore = exports.calculateMappingCoverage = exports.createSchemaMappingResult = void 0;
/**
 * Helper function to create a new SchemaMappingResult
 */
function createSchemaMappingResult(decompiledReportId, reportTypeId) {
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
exports.createSchemaMappingResult = createSchemaMappingResult;
/**
 * Calculate mapping coverage percentage
 */
function calculateMappingCoverage(mappedFields, totalSections) {
    if (totalSections === 0)
        return 0;
    const mappedSections = new Set(mappedFields.map(f => f.sourceSectionId)).size;
    return Math.round((mappedSections / totalSections) * 100);
}
exports.calculateMappingCoverage = calculateMappingCoverage;
/**
 * Calculate completeness score
 */
function calculateCompletenessScore(missingRequiredSections, totalRequiredSections) {
    if (totalRequiredSections === 0)
        return 100;
    const missingCount = missingRequiredSections.filter(s => s.required).length;
    return Math.round(((totalRequiredSections - missingCount) / totalRequiredSections) * 100);
}
exports.calculateCompletenessScore = calculateCompletenessScore;
/**
 * Generate a unique ID for a mapping result
 */
function generateMappingResultId() {
    return `mapping_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
exports.generateMappingResultId = generateMappingResultId;
