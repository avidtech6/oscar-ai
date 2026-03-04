/**
 * Report Type Expansion Engine (Phase 11)
 * 
 * Analyses decompiled reports to propose new report types, validates them,
 * merges with existing types, and registers them in the Report Type Registry.
 */

import type { DecompiledReport } from '../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../registry/ReportTypeDefinition';
import type { ReportTypeExpansionResult } from './ReportTypeExpansionResult';
import { createReportTypeExpansionResult } from './ReportTypeExpansionResult';

import { extractSectionPatterns } from './extractors/extractSectionPatterns';
import { extractRequiredSections } from './extractors/extractRequiredSections';
import { extractOptionalSections } from './extractors/extractOptionalSections';
import { extractConditionalSections } from './extractors/extractConditionalSections';
import { extractCompliancePatterns } from './extractors/extractCompliancePatterns';
import { extractTerminologyPatterns } from './extractors/extractTerminologyPatterns';
import { extractMethodologyBlocks } from './extractors/extractMethodologyBlocks';

import { generateReportTypeDefinition } from './generators/generateReportTypeDefinition';
import { validateReportTypeDefinition } from './generators/validateReportTypeDefinition';
import { mergeWithExistingTypes } from './generators/mergeWithExistingTypes';

import { reportTypeRegistry } from '../registry/ReportTypeRegistry';
import { intelligenceEvents } from '../events';
import { reportTypeExpansionStorage } from './storage';

export class ReportTypeExpansionEngine {
	private results: ReportTypeExpansionResult[] = [];

	constructor() {
		// Load existing results from storage
		this.results = reportTypeExpansionStorage.getAll();
	}

	/**
	 * Analyse a decompiled report and propose a new report type.
	 */
	analyse(decompiledReport: DecompiledReport): ReportTypeExpansionResult {
		intelligenceEvents.emit('expansion:analysisStarted', { decompiledReportId: decompiledReport.id });

		// Extract patterns
		const sectionPatterns = extractSectionPatterns(decompiledReport);
		const requiredSections = extractRequiredSections(decompiledReport);
		const optionalSections = extractOptionalSections(decompiledReport);
		const conditionalSections = extractConditionalSections(decompiledReport);
		const complianceRules = extractCompliancePatterns(decompiledReport);
		const terminology = extractTerminologyPatterns(decompiledReport);
		const methodologyBlocks = extractMethodologyBlocks(decompiledReport);

		intelligenceEvents.emit('expansion:patternsExtracted', {
			decompiledReportId: decompiledReport.id,
			sectionPatternsCount: sectionPatterns.length,
			requiredSectionsCount: requiredSections.length,
			optionalSectionsCount: optionalSections.length,
			conditionalSectionsCount: conditionalSections.length,
			complianceRulesCount: complianceRules.length,
			terminologyCount: terminology.length,
			methodologyBlocksCount: methodologyBlocks.length
		});

		// Generate a report type definition
		const expansionData = {
			requiredSections,
			optionalSections,
			conditionalSections,
			complianceRules,
			terminology,
			methodologyBlocks,
			confidenceScore: 0.8 // placeholder, could be computed based on extraction quality
		};
		const proposedDefinition = generateReportTypeDefinition(expansionData);

		intelligenceEvents.emit('expansion:definitionGenerated', {
			decompiledReportId: decompiledReport.id,
			proposedDefinitionId: proposedDefinition.id
		});

		// Validate the definition
		const existingDefinitions = reportTypeRegistry.getAllTypes();
		const validation = validateReportTypeDefinition(proposedDefinition, existingDefinitions);

		intelligenceEvents.emit('expansion:definitionValidated', {
			decompiledReportId: decompiledReport.id,
			isValid: validation.isValid,
			errors: validation.errors,
			warnings: validation.warnings
		});

		// Merge decision
		const mergeDecision = mergeWithExistingTypes(proposedDefinition, existingDefinitions);

		intelligenceEvents.emit('expansion:merged', {
			decompiledReportId: decompiledReport.id,
			action: mergeDecision.action,
			targetId: mergeDecision.targetId,
			confidence: mergeDecision.confidence,
			reason: mergeDecision.reason
		});

		// Create expansion result
		const result = createReportTypeExpansionResult(
			proposedDefinition,
			requiredSections,
			optionalSections,
			conditionalSections,
			complianceRules,
			terminology,
			methodologyBlocks,
			mergeDecision.confidence,
			validation.warnings
		);

		this.results.push(result);
		reportTypeExpansionStorage.add(result);
		intelligenceEvents.emit('expansion:analysisComplete', { resultId: result.id });

		return result;
	}

	/**
	 * Register a new report type based on an expansion result.
	 * 
	 * This will either create a new report type, merge with an existing one,
	 * or update an existing one, depending on the merge decision.
	 */
	registerNewReportType(result: ReportTypeExpansionResult): { success: boolean; action: string; reportTypeId?: string } {
		const { proposedReportTypeDefinition } = result;
		const existingDefinitions = reportTypeRegistry.getAllTypes();
		const mergeDecision = mergeWithExistingTypes(proposedReportTypeDefinition, existingDefinitions);

		let action = '';
		let reportTypeId = '';

		if (mergeDecision.action === 'create') {
			// Register as a new report type
			reportTypeRegistry.registerType(proposedReportTypeDefinition);
			action = 'created';
			reportTypeId = proposedReportTypeDefinition.id;
			intelligenceEvents.emit('expansion:registered', {
				action: 'created',
				reportTypeId: proposedReportTypeDefinition.id
			});
		} else if (mergeDecision.action === 'merge' && mergeDecision.targetId) {
			// Merge with existing report type (for now, we just skip creation)
			action = 'merged';
			reportTypeId = mergeDecision.targetId;
			intelligenceEvents.emit('expansion:registered', {
				action: 'merged',
				reportTypeId: mergeDecision.targetId
			});
		} else if (mergeDecision.action === 'update' && mergeDecision.targetId) {
			// Update existing report type (for now, we just skip creation)
			action = 'updated';
			reportTypeId = mergeDecision.targetId;
			intelligenceEvents.emit('expansion:registered', {
				action: 'updated',
				reportTypeId: mergeDecision.targetId
			});
		}

		intelligenceEvents.emit('expansion:completed', { resultId: result.id, action, reportTypeId });
		return { success: true, action, reportTypeId };
	}

	/**
	 * Get all expansion results.
	 */
	getExpansionResults(): ReportTypeExpansionResult[] {
		return reportTypeExpansionStorage.getAll();
	}

	/**
	 * Clear all expansion results.
	 */
	clearResults(): void {
		reportTypeExpansionStorage.clear();
		this.results = [];
	}
}