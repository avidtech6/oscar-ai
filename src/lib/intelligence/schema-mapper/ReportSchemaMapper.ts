/**
 * Report Schema Mapper (Phase 3)
 * 
 * Maps a decompiled report to a known report type schema, identifying matches, gaps, and mismatches.
 */

import type { DecompiledReport } from '../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../types';
import type { SchemaMappingResult } from './SchemaMappingResult';
import { createSchemaMappingResult } from './SchemaMappingResult';
import { mapSectionsToSchema } from './mappers/mapSectionsToSchema';
import { mapTerminology } from './mappers/mapTerminology';
import { detectMissingSections } from './mappers/detectMissingSections';
import { detectExtraSections } from './mappers/detectExtraSections';
import { detectSchemaGaps } from './mappers/detectSchemaGaps';
import { reportTypeRegistry } from '../registry/ReportTypeRegistry';

export class ReportSchemaMapper {
	/**
	 * Map a decompiled report to a specific report type
	 */
	mapToReportType(
		decompiledReport: DecompiledReport,
		reportTypeId: string
	): SchemaMappingResult {
		const definition = reportTypeRegistry.getType(reportTypeId);
		if (!definition) {
			throw new Error(`Report type "${reportTypeId}" not found in registry`);
		}

		return this.mapToDefinition(decompiledReport, definition);
	}

	/**
	 * Map a decompiled report to a report type definition
	 */
	mapToDefinition(
		decompiledReport: DecompiledReport,
		definition: ReportTypeDefinition
	): SchemaMappingResult {
		// 1. Map sections
		const sectionMappings = mapSectionsToSchema(decompiledReport.sections, definition);
		const mappedFields: Record<string, any> = {};
		for (const mapping of sectionMappings) {
			mappedFields[mapping.mappedField] = mapping.content;
		}

		// 2. Detect missing sections
		const missingRequiredSections = detectMissingSections(decompiledReport.sections, definition);

		// 3. Detect extra sections
		const extraSections = detectExtraSections(decompiledReport.sections, definition);

		// 4. Map terminology
		const terminologyMappings = mapTerminology(decompiledReport, definition);
		const unknownTerminology = terminologyMappings
			.filter(m => m.knownEquivalent === null)
			.map(m => m.term);

		// 5. Detect schema gaps
		const schemaGaps = detectSchemaGaps(decompiledReport, definition);

		// 6. Determine unmapped sections (sections not mapped to any known field)
		const allKnownSections = [
			...definition.requiredSections,
			...definition.optionalSections,
			...definition.conditionalSections
		];
		const mappedSectionTitles = sectionMappings.map(m => m.sectionTitle.toLowerCase());
		const unmappedSections = decompiledReport.sections
			.flatMap(sec => [sec, ...sec.subsections])
			.map(sec => sec.title)
			.filter(title => !mappedSectionTitles.includes(title.toLowerCase()));

		// 7. Calculate confidence score
		const confidenceScore = this.calculateConfidence(
			decompiledReport,
			definition,
			missingRequiredSections.length,
			extraSections.length,
			unknownTerminology.length,
			schemaGaps.length
		);

		// 8. Create result
		return createSchemaMappingResult(
			definition.id,
			mappedFields,
			unmappedSections,
			missingRequiredSections,
			extraSections,
			unknownTerminology,
			schemaGaps,
			confidenceScore
		);
	}

	/**
	 * Calculate a confidence score (0‑1) for the mapping
	 */
	private calculateConfidence(
		decompiledReport: DecompiledReport,
		definition: ReportTypeDefinition,
		missingRequiredCount: number,
		extraSectionsCount: number,
		unknownTerminologyCount: number,
		schemaGapsCount: number
	): number {
		let score = 1.0;

		// Penalties
		const totalRequired = definition.requiredSections.length;
		if (totalRequired > 0) {
			score -= (missingRequiredCount / totalRequired) * 0.5;
		}

		const totalSections = decompiledReport.sections.length;
		if (totalSections > 0) {
			score -= (extraSectionsCount / totalSections) * 0.2;
		}

		const totalTerminology = decompiledReport.terminology?.length || 0;
		if (totalTerminology > 0) {
			score -= (unknownTerminologyCount / totalTerminology) * 0.2;
		}

		score -= schemaGapsCount * 0.05;

		// Clamp to [0, 1]
		return Math.max(0, Math.min(1, score));
	}

	/**
	 * Find the best‑matching report type for a decompiled report
	 */
	findBestMatch(decompiledReport: DecompiledReport): {
		reportTypeId: string | null;
		result: SchemaMappingResult | null;
		confidence: number;
	} {
		const allTypes = reportTypeRegistry.getAllTypes();
		let bestResult: SchemaMappingResult | null = null;
		let bestConfidence = 0;
		let bestTypeId: string | null = null;

		for (const type of allTypes) {
			try {
				const result = this.mapToDefinition(decompiledReport, type);
				if (result.confidenceScore > bestConfidence) {
					bestConfidence = result.confidenceScore;
					bestResult = result;
					bestTypeId = type.id;
				}
			} catch (err) {
				// Skip errors
				continue;
			}
		}

		return {
			reportTypeId: bestTypeId,
			result: bestResult,
			confidence: bestConfidence
		};
	}
}