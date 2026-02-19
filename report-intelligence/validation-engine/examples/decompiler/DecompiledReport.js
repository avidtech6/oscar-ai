"use strict";
/**
 * Report Decompiler Engine - Phase 2
 * DecompiledReport Interface
 *
 * This defines the structure for decompiled reports after processing.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDecompiledReport = void 0;
/**
 * Helper function to create a new DecompiledReport
 */
function createDecompiledReport(rawText, inputFormat = 'text') {
    const now = new Date();
    const normalizedText = normalizeText(rawText);
    return {
        sourceHash: generateTextHash(rawText),
        rawText,
        normalizedText,
        detectedReportType: undefined,
        sections: [],
        metadata: {
            keywords: [],
            wordCount: countWords(normalizedText),
        },
        terminology: [],
        complianceMarkers: [],
        structureMap: {
            hierarchy: [],
            depth: 0,
            sectionCount: 0,
            averageSectionLength: 0,
            hasAppendices: false,
            hasMethodology: false,
            hasLegalSections: false,
        },
        inputFormat,
        processingTimeMs: 0,
        confidenceScore: 0,
        detectorResults: {
            headings: { count: 0, confidence: 0 },
            sections: { count: 0, confidence: 0 },
            lists: { count: 0, confidence: 0 },
            tables: { count: 0, confidence: 0 },
            metadata: { confidence: 0 },
            terminology: { count: 0, confidence: 0 },
            compliance: { count: 0, confidence: 0 },
            appendices: { count: 0, confidence: 0 },
        },
        warnings: [],
        errors: [],
    };
}
exports.createDecompiledReport = createDecompiledReport;
/**
 * Normalize text for processing
 */
function normalizeText(text) {
    // Basic normalization
    return text
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/\t/g, '  ') // Convert tabs to spaces
        .replace(/\u00A0/g, ' ') // Replace non-breaking spaces
        .trim();
}
/**
 * Generate a simple hash for text deduplication
 */
function generateTextHash(text) {
    // Simple hash for demonstration
    // In production, use a proper hash function
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
}
/**
 * Count words in text
 */
function countWords(text) {
    return text.split(/\s+/).filter(word => word.length > 0).length;
}
