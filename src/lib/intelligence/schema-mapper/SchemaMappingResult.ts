/**
 * Schema Mapping Result (Phase 3)
 * 
 * Result of mapping a decompiled report to a known report type schema.
 */

export interface SchemaMappingResult {
	id: string;
	reportTypeId: string | null;
	mappedFields: Record<string, any>;
	unmappedSections: string[];
	missingRequiredSections: string[];
	extraSections: string[];
	unknownTerminology: string[];
	schemaGaps: string[];
	confidenceScore: number; // 0‑1
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Helper to create a new schema mapping result
 */
export function createSchemaMappingResult(
	reportTypeId: string | null = null,
	mappedFields: Record<string, any> = {},
	unmappedSections: string[] = [],
	missingRequiredSections: string[] = [],
	extraSections: string[] = [],
	unknownTerminology: string[] = [],
	schemaGaps: string[] = [],
	confidenceScore: number = 0
): SchemaMappingResult {
	const now = new Date();
	return {
		id: `mapping_${now.getTime()}_${Math.random().toString(36).substring(2)}`,
		reportTypeId,
		mappedFields,
		unmappedSections,
		missingRequiredSections,
		extraSections,
		unknownTerminology,
		schemaGaps,
		confidenceScore,
		createdAt: now,
		updatedAt: now
	};
}