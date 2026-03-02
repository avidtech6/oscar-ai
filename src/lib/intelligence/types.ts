/**
 * Intelligence Layer Type Definitions
 * 
 * This file defines TypeScript interfaces for the intelligence layer,
 * ensuring type safety and clear contracts between modules.
 */

/**
 * Phase File represents a single Phase File from the intelligence layer
 */
export interface PhaseFile {
	/** File name (e.g., PHASE_1_REPORT_TYPE_REGISTRY.md) */
	filename: string;
	/** Full file content as string */
	content: string;
	/** File path relative to intelligence directory */
	path: string;
	/** File size in bytes */
	size: number;
	/** Last modified timestamp */
	modified: Date;
}

/**
 * Phase Metadata extracted from Phase File content
 */
export interface PhaseMetadata {
	/** Phase number (extracted from filename or content) */
	phaseNumber: number;
	/** Phase title (extracted from first line of content) */
	title: string;
	/** Brief summary of phase purpose */
	summary: string;
	/** Key objectives from phase */
	objectives: string[];
	/** Critical requirements */
	requirements: string[];
	/** Files that must be created/updated */
	files: string[];
	/** Completion criteria */
	completionCriteria: string[];
	/** Whether this is an execution prompt */
	isExecutionPrompt: boolean;
	/** Phase category */
	category: 'report' | 'workflow' | 'schema' | 'intelligence' | 'integration' | 'testing' | 'other';
}

/**
 * Intelligence Engine interface
 */
export interface IntelligenceEngine {
	/** Initialize the engine */
	initialize(): Promise<void>;
	/** Get all Phase Files */
	getAllPhaseFiles(): PhaseFile[];
	/** Get Phase File by number */
	getPhaseFile(phaseNumber: number): PhaseFile | undefined;
	/** Get Phase File by title */
	getPhaseFileByTitle(title: string): PhaseFile | undefined;
	/** Get all Phase Metadata */
	getAllMetadata(): PhaseMetadata[];
	/** Get metadata for a specific phase */
	getMetadata(phaseNumber: number): PhaseMetadata | undefined;
	/** Search across all Phase Files */
	search(query: string): PhaseFile[];
	/** Get report types from Phase 1 */
	getReportTypes(): string[];
	/** Get workflow definitions */
	getWorkflowDefinitions(): string[];
	/** Get schema mappings */
	getSchemaMappings(): string[];
	/** Summarize a phase */
	summarizePhase(phaseNumber: number): string;
	/** Generate a simple report */
	generateReport(reportType: string, input: Record<string, any>): string;
	/** Explain a decision based on intelligence layer */
	explainDecision(path: string): string;
	/** Get engine status */
	getStatus(): {
		initialized: boolean;
		phaseCount: number;
		metadataCount: number;
		reportTypes: number;
		workflows: number;
		schemaMappings: number;
	};
}

/**
 * Report Type Definition (from Phase 1)
 */
export interface ReportTypeDefinition {
	/** Unique identifier */
	id: string;
	/** Report type name */
	name: string;
	/** Description */
	description: string;
	/** Required sections */
	requiredSections: string[];
	/** Optional sections */
	optionalSections: string[];
	/** Conditional sections */
	conditionalSections: string[];
	/** Dependencies on other report types */
	dependencies: string[];
	/** Compliance rules */
	complianceRules: string[];
	/** AI guidance notes */
	aiGuidance: string[];
	/** Version number */
	version: string;
	/** Creation timestamp */
	createdAt: Date;
	/** Last update timestamp */
	updatedAt: Date;
}

/**
 * Workflow Definition (from Phase 13 and 25)
 */
export interface WorkflowDefinition {
	/** Workflow ID */
	id: string;
	/** Workflow name */
	name: string;
	/** Description */
	description: string;
	/** Steps in the workflow */
	steps: WorkflowStep[];
	/** Input requirements */
	inputs: string[];
	/** Output specifications */
	outputs: string[];
	/** Dependencies on other workflows */
	dependencies: string[];
	/** Phase reference */
	phaseReference: number;
}

/**
 * Workflow Step
 */
export interface WorkflowStep {
	/** Step number */
	step: number;
	/** Action description */
	action: string;
	/** Required inputs */
	requires: string[];
	/** Produced outputs */
	produces: string[];
	/** Time estimate */
	estimatedTime: string;
	/** Phase reference */
	phaseReference?: number;
}

/**
 * Schema Mapping (from Phase 3)
 */
export interface SchemaMapping {
	/** Source schema */
	source: string;
	/** Target schema */
	target: string;
	/** Mapping rules */
	rules: MappingRule[];
	/** Validation rules */
	validation: ValidationRule[];
	/** Transformation functions */
	transformations: Transformation[];
}

/**
 * Mapping Rule
 */
export interface MappingRule {
	/** Source field */
	sourceField: string;
	/** Target field */
	targetField: string;
	/** Transformation type */
	transformation: 'direct' | 'calculated' | 'lookup' | 'conditional';
	/** Condition (if any) */
	condition?: string;
	/** Default value */
	defaultValue?: any;
}

/**
 * Validation Rule
 */
export interface ValidationRule {
	/** Field to validate */
	field: string;
	/** Validation type */
	type: 'required' | 'format' | 'range' | 'pattern' | 'custom';
	/** Validation rule */
	rule: string;
	/** Error message */
	errorMessage: string;
	/** Severity */
	severity: 'error' | 'warning' | 'info';
}

/**
 * Transformation
 */
export interface Transformation {
	/** Transformation name */
	name: string;
	/** Function description */
	description: string;
	/** Input parameters */
	parameters: string[];
	/** Output type */
	outputType: string;
	/** Implementation reference */
	implementation: string;
}

/**
 * Intelligence Context for state management
 */
export interface IntelligenceContext {
	/** Current phase being referenced */
	currentPhase?: number;
	/** Current report type */
	currentReportType?: string;
	/** Current workflow */
	currentWorkflow?: string;
	/** Search query */
	searchQuery?: string;
	/** Search results */
	searchResults: PhaseFile[];
	/** Selected decision path */
	decisionPath?: string;
	/** Reasoning trace */
	reasoningTrace: string[];
	/** Last action timestamp */
	lastAction: Date;
	/** User preferences */
	preferences: Record<string, any>;
}

/**
 * Blueprint Search Result
 */
export interface BlueprintSearchResult {
	/** Phase file */
	phaseFile: PhaseFile;
	/** Relevance score */
	score: number;
	/** Matching lines */
	matches: string[];
	/** Context before match */
	contextBefore: string;
	/** Context after match */
	contextAfter: string;
}

/**
 * Reasoning Trace Entry
 */
export interface ReasoningTraceEntry {
	/** Timestamp */
	timestamp: Date;
	/** Decision point */
	decisionPoint: string;
	/** Options considered */
	options: string[];
	/** Selected option */
	selected: string;
	/** Reasoning */
	reasoning: string;
	/** Phase references */
	phaseReferences: number[];
	/** Confidence level */
	confidence: number;
}