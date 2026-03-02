/**
 * Public Intelligence API
 * 
 * This module exposes a clean, typed API for UI components to interact with
 * the intelligence layer. All logic is derived from Phase Files.
 * 
 * Architecture Rules:
 * 1. UI may only call intelligence functions through this API
 * 2. No logic from HAR may influence the intelligence layer
 * 3. All functions must be typed and documented
 * 4. Functions must be modular and future-proof
 */

import { intelligenceEngine, getIntelligenceEngine } from './engine';
import type { PhaseFile, PhaseMetadata, ReportTypeDefinition, WorkflowDefinition, SchemaMapping } from './types';

/**
 * Initialize the intelligence engine
 * Call this once at app startup
 */
export async function initializeIntelligence(): Promise<void> {
	await intelligenceEngine.initialize();
}

/**
 * Get Phase File by number
 */
export async function getPhase(phaseNumber: number): Promise<PhaseFile | undefined> {
	const engine = await getIntelligenceEngine();
	return engine.getPhaseFile(phaseNumber);
}

/**
 * List all phases with metadata
 */
export async function listPhases(): Promise<PhaseMetadata[]> {
	const engine = await getIntelligenceEngine();
	return engine.getAllMetadata();
}

/**
 * Search across the blueprint
 */
export async function searchBlueprint(query: string): Promise<PhaseFile[]> {
	const engine = await getIntelligenceEngine();
	return engine.search(query);
}

/**
 * Get all report types from Phase 1
 */
export async function getReportTypes(): Promise<string[]> {
	const engine = await getIntelligenceEngine();
	return engine.getReportTypes();
}

/**
 * Get workflow definitions from Phase Files
 */
export async function getWorkflowDefinitions(): Promise<string[]> {
	const engine = await getIntelligenceEngine();
	return engine.getWorkflowDefinitions();
}

/**
 * Get schema mappings from Phase 3
 */
export async function getSchemaMappings(): Promise<string[]> {
	const engine = await getIntelligenceEngine();
	return engine.getSchemaMappings();
}

/**
 * Summarize a phase
 */
export async function summarizePhase(phaseNumber: number): Promise<string> {
	const engine = await getIntelligenceEngine();
	return engine.summarizePhase(phaseNumber);
}

/**
 * Generate a report using intelligence layer
 */
export async function generateReport(reportType: string, input: Record<string, any>): Promise<string> {
	const engine = await getIntelligenceEngine();
	return engine.generateReport(reportType, input);
}

/**
 * Explain a decision based on intelligence layer
 */
export async function explainDecision(path: string): Promise<string> {
	const engine = await getIntelligenceEngine();
	return engine.explainDecision(path);
}

/**
 * Get intelligence engine status
 */
export async function getIntelligenceStatus(): Promise<{
	initialized: boolean;
	phaseCount: number;
	metadataCount: number;
	reportTypes: number;
	workflows: number;
	schemaMappings: number;
}> {
	const engine = await getIntelligenceEngine();
	return engine.getStatus();
}

/**
 * Get detailed report type definition
 * (Placeholder - in real implementation would parse from Phase 1)
 */
export async function getReportTypeDefinition(reportType: string): Promise<ReportTypeDefinition | undefined> {
	const engine = await getIntelligenceEngine();
	const reportTypes = await engine.getReportTypes();
	
	if (!reportTypes.includes(reportType)) {
		return undefined;
	}
	
	// Placeholder implementation
	// In real implementation, this would parse detailed definition from Phase 1
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
}

/**
 * Get detailed workflow definition
 * (Placeholder - in real implementation would parse from Phase 13/25)
 */
export async function getWorkflowDefinition(workflowName: string): Promise<WorkflowDefinition | undefined> {
	// Placeholder implementation
	// In real implementation, this would parse from Phase 13 or 25
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

/**
 * Get intelligence capabilities for dashboard display
 */
export async function getIntelligenceCapabilities(): Promise<{
	reportTypes: string[];
	workflows: string[];
	schemaMappings: string[];
	phases: { number: number; title: string; category: string }[];
	stats: {
		totalPhases: number;
		executionPrompts: number;
		reportEngines: number;
		integrationPoints: number;
	};
}> {
	const engine = await getIntelligenceEngine();
	const metadata = engine.getAllMetadata();
	const reportTypes = engine.getReportTypes();
	const workflows = engine.getWorkflowDefinitions();
	const schemaMappings = engine.getSchemaMappings();
	
	// Count execution prompts
	const executionPrompts = metadata.filter(m => m.isExecutionPrompt).length;
	
	// Count report engines (phases 1-11)
	const reportEngines = metadata.filter(m => m.phaseNumber >= 1 && m.phaseNumber <= 11).length;
	
	// Count integration points (phases 15-19)
	const integrationPoints = metadata.filter(m => m.phaseNumber >= 15 && m.phaseNumber <= 19).length;
	
	return {
		reportTypes,
		workflows,
		schemaMappings,
		phases: metadata.map(m => ({
			number: m.phaseNumber,
			title: m.title,
			category: m.category
		})),
		stats: {
			totalPhases: metadata.length,
			executionPrompts,
			reportEngines,
			integrationPoints
		}
	};
}

/**
 * Get architecture summaries for display
 */
export async function getArchitectureSummaries(): Promise<
	Array<{ phase: number; title: string; summary: string; keyPoints: string[] }>
> {
	const engine = await getIntelligenceEngine();
	const metadata = engine.getAllMetadata();
	
	return metadata.slice(0, 5).map(m => ({
		phase: m.phaseNumber,
		title: m.title,
		summary: m.summary,
		keyPoints: m.objectives.slice(0, 3)
	}));
}

/**
 * Validate if a report structure is compliant
 */
export async function validateReportStructure(
	reportType: string,
	structure: Record<string, any>
): Promise<{
	valid: boolean;
	errors: string[];
	warnings: string[];
	missingSections: string[];
	extraSections: string[];
}> {
	const definition = await getReportTypeDefinition(reportType);
	if (!definition) {
		return {
			valid: false,
			errors: [`Report type "${reportType}" not found`],
			warnings: [],
			missingSections: [],
			extraSections: []
		};
	}
	
	const errors: string[] = [];
	const warnings: string[] = [];
	const missingSections: string[] = [];
	const extraSections: string[] = [];
	
	// Check required sections
	for (const requiredSection of definition.requiredSections) {
		if (!structure[requiredSection]) {
			missingSections.push(requiredSection);
			errors.push(`Missing required section: ${requiredSection}`);
		}
	}
	
	// Check for extra sections (not in required, optional, or conditional)
	const allAllowedSections = [
		...definition.requiredSections,
		...definition.optionalSections,
		...definition.conditionalSections
	];
	
	for (const section in structure) {
		if (!allAllowedSections.includes(section)) {
			extraSections.push(section);
			warnings.push(`Extra section found: ${section}`);
		}
	}
	
	return {
		valid: errors.length === 0,
		errors,
		warnings,
		missingSections,
		extraSections
	};
}

/**
 * Get reasoning trace for a decision
 */
export async function getReasoningTrace(decisionPath: string): Promise<string[]> {
	const explanation = await explainDecision(decisionPath);
	
	// Parse explanation into trace steps
	const trace: string[] = [
		`Decision path: ${decisionPath}`,
		`Explanation: ${explanation}`,
		`Timestamp: ${new Date().toISOString()}`,
		`Intelligence layer consulted: Phase Files`
	];
	
	// Add phase references
	const engine = await getIntelligenceEngine();
	const searchResults = engine.search(decisionPath);
	if (searchResults.length > 0) {
		trace.push(`Relevant phases found: ${searchResults.length}`);
		searchResults.forEach((result, index) => {
			const metadata = engine.getMetadata(index + 1);
			if (metadata) {
				trace.push(`- Phase ${metadata.phaseNumber}: ${metadata.title}`);
			}
		});
	}
	
	return trace;
}

/**
 * Export the API as default
 */
export default {
	initializeIntelligence,
	getPhase,
	listPhases,
	searchBlueprint,
	getReportTypes,
	getWorkflowDefinitions,
	getSchemaMappings,
	summarizePhase,
	generateReport,
	explainDecision,
	getIntelligenceStatus,
	getReportTypeDefinition,
	getWorkflowDefinition,
	getSchemaMapping,
	getIntelligenceCapabilities,
	getArchitectureSummaries,
	validateReportStructure,
	getReasoningTrace
};