"use strict";
/**
 * Report Validation Engine - Phase 4
 * ValidationResult Interface
 *
 * This defines the structure for validation results after processing.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQualityIssueId = exports.generateComplianceViolationId = exports.generateValidationFindingId = exports.generateValidationResultId = exports.calculateOverallScore = exports.createValidationResult = void 0;
/**
 * Helper function to create a new ValidationResult
 */
function createValidationResult(schemaMappingResultId, decompiledReportId, reportTypeId) {
    const now = new Date();
    return {
        schemaMappingResultId,
        decompiledReportId,
        reportTypeId,
        reportTypeName: undefined,
        findings: [],
        complianceViolations: [],
        qualityIssues: [],
        scores: {
            complianceScore: 0,
            qualityScore: 0,
            completenessScore: 0,
            consistencyScore: 0,
            overallScore: 0,
            ruleTypeScores: {
                compliance: 0,
                quality: 0,
                completeness: 0,
                consistency: 0,
                terminology: 0,
                formatting: 0,
                data_quality: 0,
                logical_coherence: 0,
            },
            severityCounts: {
                critical: 0,
                high: 0,
                medium: 0,
                low: 0,
                info: 0,
            },
        },
        rulesExecuted: 0,
        rulesPassed: 0,
        rulesFailed: 0,
        rulesSkipped: 0,
        processingTimeMs: 0,
        validatorVersion: '1.0.0',
        validationStrategy: 'automatic',
        schemaMappingResultSnapshot: undefined,
        reportTypeDefinitionSnapshot: undefined,
        status: 'pending',
    };
}
exports.createValidationResult = createValidationResult;
/**
 * Calculate overall validation score from component scores
 */
function calculateOverallScore(scores) {
    // Weighted average with emphasis on compliance and quality
    const weights = {
        complianceScore: 0.35,
        qualityScore: 0.30,
        completenessScore: 0.20,
        consistencyScore: 0.15,
    };
    let weightedSum = 0;
    let totalWeight = 0;
    if (scores.complianceScore !== undefined) {
        weightedSum += scores.complianceScore * weights.complianceScore;
        totalWeight += weights.complianceScore;
    }
    if (scores.qualityScore !== undefined) {
        weightedSum += scores.qualityScore * weights.qualityScore;
        totalWeight += weights.qualityScore;
    }
    if (scores.completenessScore !== undefined) {
        weightedSum += scores.completenessScore * weights.completenessScore;
        totalWeight += weights.completenessScore;
    }
    if (scores.consistencyScore !== undefined) {
        weightedSum += scores.consistencyScore * weights.consistencyScore;
        totalWeight += weights.consistencyScore;
    }
    // Normalize by total weight
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
}
exports.calculateOverallScore = calculateOverallScore;
/**
 * Generate a unique ID for a validation result
 */
function generateValidationResultId() {
    return `validation_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
exports.generateValidationResultId = generateValidationResultId;
/**
 * Generate a unique ID for a validation finding
 */
function generateValidationFindingId() {
    return `finding_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
exports.generateValidationFindingId = generateValidationFindingId;
/**
 * Generate a unique ID for a compliance violation
 */
function generateComplianceViolationId() {
    return `violation_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
exports.generateComplianceViolationId = generateComplianceViolationId;
/**
 * Generate a unique ID for a quality issue
 */
function generateQualityIssueId() {
    return `quality_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
exports.generateQualityIssueId = generateQualityIssueId;
