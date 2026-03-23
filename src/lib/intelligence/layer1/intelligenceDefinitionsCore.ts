/**
 * Intelligence Definitions Core - Layer 1 Core
 * 
 * Core definition operations extracted from apiDefinitions.ts for Layer 1 Core purity.
 * Contains pure business logic for intelligence definitions without presentation layer concerns.
 */

import type { 
	ReportTypeDefinition, 
	WorkflowDefinition, 
	SchemaMapping, 
	IntelligenceEngine 
} from '../types.js';

/**
 * Core definition operations interface
 */
export interface IntelligenceDefinitionsCore {
	/** Get detailed report type definition */
	getReportTypeDefinition(engine: IntelligenceEngine, reportType: string): Promise<ReportTypeDefinition | undefined>;
	/** Get detailed workflow definition */
	getWorkflowDefinition(engine: IntelligenceEngine, workflowName: string): Promise<WorkflowDefinition | undefined>;
	/** Get detailed schema mapping definition */
	getSchemaMappingDefinition(engine: IntelligenceEngine, mappingId: string): Promise<SchemaMapping | undefined>;
}

/**
 * Default implementation of core definition operations
 */
export const defaultIntelligenceDefinitionsCore: IntelligenceDefinitionsCore = {
	async getReportTypeDefinition(engine, reportType) {
		const reportTypes = await engine.getReportTypes();
		
		if (!reportTypes.includes(reportType)) {
			return undefined;
		}
		
		// Pure implementation extracted from apiDefinitions.ts
		return {
			id: reportType.toLowerCase().replace(/[^a-z0-9]/g, '-'),
			name: reportType,
			description: `Definition for ${reportType} from Phase 1: Report Type Registry`,
			requiredSections: ['Introduction', 'Findings', 'Recommendations', 'Conclusion'],
			optionalSections: ['Appendices', 'References', 'Glossary'],
			conditionalSections: ['Risk Assessment', 'Cost Analysis', 'Timeline'],
			dependencies: ['BS5837:2012 Tree Survey'],
			complianceRules: ['Must follow industry standards', 'Must include risk assessment'],
			aiGuidance: ['Use structured sections', 'Include visual aids where appropriate'],
			version: '1.0.0',
			createdAt: new Date(),
			updatedAt: new Date()
		};
	},

	async getWorkflowDefinition(engine, workflowName) {
		// Pure implementation extracted from apiDefinitions.ts
		return {
			id: workflowName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
			name: workflowName,
			description: `Workflow definition from intelligence layer`,
			steps: [
				{
					step: 1,
					action: 'Analyze input requirements',
					requires: ['Input data', 'Report type'],
					produces: ['Requirements analysis'],
					estimatedTime: '5 minutes',
					phaseReference: 13
				},
				{
					step: 2,
					action: 'Select appropriate template',
					requires: ['Requirements analysis'],
					produces: ['Template selection'],
					estimatedTime: '2 minutes',
					phaseReference: 8
				},
				{
					step: 3,
					action: 'Apply schema mappings',
					requires: ['Template selection', 'Input data'],
					produces: ['Mapped data'],
					estimatedTime: '10 minutes',
					phaseReference: 3
				},
				{
					step: 4,
					action: 'Generate report',
					requires: ['Mapped data'],
					produces: ['Draft report'],
					estimatedTime: '15 minutes',
					phaseReference: 8
				},
				{
					step: 5,
					action: 'Validate compliance',
					requires: ['Draft report'],
					produces: ['Validated report'],
					estimatedTime: '5 minutes',
					phaseReference: 9
				}
			],
			inputs: ['Input data', 'Report type', 'User preferences'],
			outputs: ['Validated report', 'Compliance certificate', 'Metadata'],
			dependencies: ['Report Type Registry', 'Schema Mapper', 'Compliance Validator'],
			phaseReference: 13
		};
	},

	async getSchemaMappingDefinition(engine, mappingId) {
		// Placeholder implementation - would parse from Phase 3 in real implementation
		return {
			id: mappingId.toLowerCase().replace(/[^a-z0-9]/g, '-'),
			name: mappingId,
			source: 'Input Data Schema',
			target: 'Report Schema',
			rules: [
				{
					sourceField: 'propertyAddress',
					targetField: 'property.address',
					transformation: 'direct',
					required: true
				},
				{
					sourceField: 'treeSpecies',
					targetField: 'trees.species',
					transformation: 'direct',
					required: true
				},
				{
					sourceField: 'surveyDate',
					targetField: 'survey.date',
					transformation: 'direct',
					required: true
				}
			],
			transformations: [
				{
					name: 'propertyAddress',
					description: 'Direct mapping of property address',
					parameters: ['propertyAddress', 'property.address'],
					outputType: 'string',
					implementation: 'direct'
				},
				{
					name: 'treeSpecies',
					description: 'Direct mapping of tree species',
					parameters: ['treeSpecies', 'trees.species'],
					outputType: 'array',
					implementation: 'direct'
				},
				{
					name: 'surveyDate',
					description: 'Direct mapping of survey date',
					parameters: ['surveyDate', 'survey.date'],
					outputType: 'date',
					implementation: 'direct'
				}
			],
			validation: [
				{ type: 'required', rule: 'Required fields must be present', field: 'propertyAddress', errorMessage: 'Required field must be present', severity: 'error' },
				{ type: 'format', rule: 'Date formats must be valid', field: 'surveyDate', errorMessage: 'Date format must be valid', severity: 'error' }
			],
			compliance: ['BS5837:2012'],
			version: '1.0.0',
			createdAt: new Date(),
			updatedAt: new Date()
		};
	},
};

/**
 * Create a new instance of core definition operations
 */
export function createIntelligenceDefinitionsCore(
	operations: Partial<IntelligenceDefinitionsCore> = {}
): IntelligenceDefinitionsCore {
	return {
		...defaultIntelligenceDefinitionsCore,
		...operations,
	};
}

/**
 * Execute a definition operation with error handling
 */
export async function executeDefinitionOperation<T>(
	operation: () => Promise<T>,
	operationName: string
): Promise<T> {
	try {
		return await operation();
	} catch (error) {
		throw new Error(`Definition operation '${operationName}' failed: ${error instanceof Error ? error.message : String(error)}`);
	}
}