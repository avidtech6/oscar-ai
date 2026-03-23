/**
 * Intelligence Layer Type Definitions - Layer 1 Core
 *
 * This file defines TypeScript interfaces for the intelligence layer,
 * ensuring type safety and clear contracts between modules.
 * Extracted from src/lib/intelligence/types.ts for Layer 1 Core purity.
 */

// Import core types from the main types file
export type {
	// Core types
	Document, Folder, Project, TeamMember, Report,
	
	// Intelligence system types
	IntelligenceSystem, IntelligenceModule,
	
	// Calendar and task types
	CalendarEvent, Task,
	
	// Search and filter types
	SearchFilters,
	
	// UI Component types
	SidebarItem, Panel, CopilotCommand, AskOscarQuery, AskOscarResponse,
	
	// Phase Compliance types
	CompliancePhase, ComplianceRequirement,
	
	// Enhanced system types
	SystemConfiguration, SystemHealth, HealthAlert,
	
	// Enhanced user types
	UserSession, ActivityLog,
	
	// Enhanced search types
	SearchQuery, SearchIndex,
	
	// Enhanced API types
	ApiRequest, ApiResponse,
	
	// Enhanced form types
	FormValidation, FormSubmission,
	
	// Enhanced report types
	ReportMetadata, ReportSection, ReportTemplate, TemplateVariable,
	
	// UI and Layout types
	LayoutConfig, CopilotConfig, AskOscarConfig,
	
	// Intelligence System types
	ExtendedIntelligenceSystem, SystemManagementSystem,
	
	// Navigation types
	NavigationItem, NavigationContext,
	
	// Collaboration types
	CollaborationSession, RealTimeUpdate,
	
	// Error handling types
	ErrorContext, ErrorHandler,
	
	// Event system types
	Event, EventHandler,
	
	// Performance monitoring types
	PerformanceMetrics, PerformanceMonitor,
	
	// Configuration types
	AppConfig, UserPreferences,
	
	// Analytics types
	AnalyticsEvent, AnalyticsTracker,
	
	// Security types
	SecurityPolicy, SecurityAudit,
	
	// Backup and recovery types
	BackupConfig, BackupJob, RecoveryPoint,
	
	// Integration types
	Integration, SyncOperation,
	
	// Export types
	ExportConfig, ExportJob
} from '../../types';

// Layer 1 specific types that are not in the main types file
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
	modified: string;
}

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
	/** Schema definition */
	schema: any;
	/** Validation rules */
	validationRules: ValidationRule[];
	/** Version */
	version: string;
	/** Created timestamp */
	createdAt: string;
	/** Updated timestamp */
	updatedAt: string;
}

export interface WorkflowDefinition {
	/** Unique identifier */
	id: string;
	/** Workflow name */
	name: string;
	/** Description */
	description: string;
	/** Phase number */
	phase: number;
	/** Steps */
	steps: WorkflowStep[];
	/** Input schema */
	inputSchema: any;
	/** Output schema */
	outputSchema: any;
	/** Version */
	version: string;
	/** Status */
	status: 'active' | 'inactive' | 'deprecated';
}

export interface SchemaMapping {
	/** Source schema */
	sourceSchema: any;
	/** Target schema */
	targetSchema: any;
	/** Mapping rules */
	mappingRules: MappingRule[];
	/** Validation results */
	validationResults: ValidationResult[];
	/** Created timestamp */
	createdAt: string;
	/** Updated timestamp */
	updatedAt: string;
}

export interface MappingRule {
	/** Source path */
	sourcePath: string;
	/** Target path */
	targetPath: string;
	/** Transformation function */
	transformation?: 'direct' | 'calculated' | 'lookup' | 'conditional';
	/** Condition for applying the rule */
	condition?: string;
}

export interface ValidationResult {
	/** Whether the validation passed */
	isValid: boolean;
	/** Validation errors */
	errors: ValidationError[];
	/** Validation warnings */
	warnings: ValidationError[];
	/** Suggestions for improvement */
	suggestions: string[];
	/** Validation timestamp */
	timestamp: string;
}

export interface ValidationError {
	/** Field name */
	field: string;
	/** Error message */
	message: string;
	/** Error severity */
	severity: 'error' | 'warning';
	/** Error code */
	code: string;
}

export interface WorkflowStep {
	/** Step identifier */
	id: string;
	/** Step name */
	name: string;
	/** Step type */
	type: 'analysis' | 'processing' | 'validation' | 'optimization';
	/** Step status */
	status: 'pending' | 'running' | 'completed' | 'error';
	/** Step input */
	input: any;
	/** Step output */
	output?: any;
	/** Step error */
	error?: string;
	/** Step duration */
	duration?: number;
}

export interface IntelligenceContext {
	/** User identifier */
	userId: string;
	/** Project identifier */
	projectId?: string;
	/** Document identifier */
	documentId?: string;
	/** Phase identifier */
	phase: string;
	/** Context timestamp */
	timestamp: string;
	/** Context metadata */
	metadata: Record<string, any>;
	/** Environment */
	environment: 'development' | 'production' | 'testing';
}

export interface IntelligenceWorkflow {
	/** Workflow identifier */
	id: string;
	/** Workflow name */
	name: string;
	/** Phase */
	phase: string;
	/** Status */
	status: 'idle' | 'running' | 'completed' | 'error';
	/** Steps */
	steps: WorkflowStep[];
	/** Context */
	context: IntelligenceContext;
	/** Result */
	result?: IntelligenceResult;
}

export interface IntelligenceResult {
	/** Whether the operation was successful */
	success: boolean;
	/** Result data */
	data?: any;
	/** Result errors */
	errors?: ValidationError[];
	/** Result warnings */
	warnings?: ValidationError[];
	/** Performance metrics */
	metrics: {
		processingTime: number;
		accuracy: number;
		efficiency: number;
	};
}

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
	modified: string;
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
	/** Terminology (domain‑specific terms) */
	terminology?: string[];
	/** Version number */
	version: string;
	/** Creation timestamp */
	createdAt: string;
	/** Last update timestamp */
	updatedAt: string;
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
	transformation?: 'direct' | 'calculated' | 'lookup' | 'conditional';
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