/**
 * Intelligence API: Definition getters - Layer 2 Presentation
 *
 * Placeholder implementations for report type, workflow, and schema mapping definitions.
 *
 * NOTE: Core implementation has been extracted to Layer 1 Core for purity.
 * This file now re-exports the Layer 1 implementation to maintain compatibility.
 */

import { getIntelligenceEngine } from './engine';
import type { ReportTypeDefinition, WorkflowDefinition, SchemaMapping } from './types';
import { createIntelligenceDefinitionsCore, type IntelligenceDefinitionsCore } from './layer1/intelligenceDefinitionsCore';

// Create core definitions instance
const definitionsCore: IntelligenceDefinitionsCore = createIntelligenceDefinitionsCore();

/**
 * Get detailed report type definition
 * (Placeholder - in real implementation would parse from Phase 1)
 */
export async function getReportTypeDefinition(reportType: string): Promise<ReportTypeDefinition | undefined> {
	const engine = await getIntelligenceEngine();
	return definitionsCore.getReportTypeDefinition(engine, reportType);
}

/**
 * Get detailed workflow definition
 * (Placeholder - in real implementation would parse from Phase 13/25)
 */
export async function getWorkflowDefinition(workflowName: string): Promise<WorkflowDefinition | undefined> {
	const engine = await getIntelligenceEngine();
	return definitionsCore.getWorkflowDefinition(engine, workflowName);
}

/**
 * Get detailed schema mapping definition
 * (Placeholder - in real implementation would parse from Phase 3)
 */
export async function getSchemaMappingDefinition(mappingId: string): Promise<SchemaMapping | undefined> {
	const engine = await getIntelligenceEngine();
	return definitionsCore.getSchemaMappingDefinition(engine, mappingId);
}

/**
 * Get detailed schema mapping
 * (Placeholder - in real implementation would parse from Phase 3)
 */
export async function getSchemaMapping(source: string, target: string): Promise<SchemaMapping | undefined> {
	// Placeholder implementation
	// In real implementation, this would parse from Phase 3
	return {
		source,
		target,
		rules: [
			{
				sourceField: 'title',
				targetField: 'reportTitle',
				transformation: 'direct',
				condition: undefined,
				defaultValue: undefined
			},
			{
				sourceField: 'date',
				targetField: 'reportDate',
				transformation: 'calculated',
				condition: 'date must be valid',
				defaultValue: new Date().toISOString()
			},
			{
				sourceField: 'author',
				targetField: 'reportAuthor',
				transformation: 'direct',
				condition: undefined,
				defaultValue: 'Unknown'
			}
		],
		validation: [
			{
				field: 'reportTitle',
				type: 'required',
				rule: 'must not be empty',
				errorMessage: 'Report title is required',
				severity: 'error'
			},
			{
				field: 'reportDate',
				type: 'format',
				rule: 'must be ISO 8601 format',
				errorMessage: 'Report date must be in ISO 8601 format',
				severity: 'error'
			}
		],
		transformations: [
			{
				name: 'dateToISO',
				description: 'Convert date to ISO 8601 format',
				parameters: ['inputDate'],
				outputType: 'string',
				implementation: 'Date.parse(inputDate).toISOString()'
			},
			{
				name: 'titleCase',
				description: 'Convert string to title case',
				parameters: ['inputString'],
				outputType: 'string',
				implementation: 'inputString.replace(/\\w\\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())'
			}
		]
	};
}