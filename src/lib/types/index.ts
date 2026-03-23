// Core document and project types
export interface Document {
	id: string;
	name: string;
	type: 'document' | 'folder';
	size: string;
	modified: string;
	folder: string;
	folderId: string;
}

export interface Folder {
	id: string;
	name: string;
	type: 'folder';
	children: Document[];
}

export interface Project {
	id: string;
	name: string;
	description: string;
	status: 'active' | 'completed' | 'archived';
	client: string;
	startDate: string;
	endDate?: string;
	budget?: number;
	progress: number;
	tags: string[];
	documents: Document[];
	team: TeamMember[];
}

export interface TeamMember {
	id: string;
	name: string;
	email: string;
	role: string;
	avatar?: string;
}

// Report intelligence types
export interface Report {
	id: string;
	title: string;
	type: 'risk' | 'method' | 'survey' | 'management' | 'inspection';
	typeLabel: string;
	status: 'draft' | 'review' | 'published' | 'archived';
	date: string;
	client: string;
	location: string;
	tags: string[];
	description: string;
	document: Document;
	author: TeamMember;
	reviewers?: TeamMember[];
}

// Intelligence system types
export interface IntelligenceSystem {
	id: string;
	name: string;
	version: string;
	status: 'active' | 'inactive' | 'error' | 'maintenance';
	lastRun?: string;
	nextRun?: string;
	description: string;
	performance: {
		accuracy: number;
		speed: number;
		reliability: number;
	};
}

export interface IntelligenceModule {
	id: string;
	name: string;
	systemId: string;
	status: 'active' | 'inactive' | 'error';
	description: string;
	config: Record<string, any>;
}

// Calendar and task types
export interface CalendarEvent {
	id: string;
	title: string;
	date: string;
	time: string;
	type: 'fieldwork' | 'meeting' | 'deadline' | 'event';
	attendees: string[];
	location?: string;
	description?: string;
}

export interface Task {
	id: string;
	title: string;
	priority: 'high' | 'medium' | 'low';
	due: string;
	status: 'todo' | 'in_progress' | 'completed';
	assignedTo?: string;
	description?: string;
}

// Search and filter types
export interface SearchFilters {
	type?: string[];
	status?: string[];
	date?: {
		start?: string;
		end?: string;
	};
	tags?: string[];
	author?: string[];
	client?: string[];
}

// UI Component types
export interface SidebarItem {
	id: string;
	name: string;
	icon?: string;
	path?: string;
	children?: SidebarItem[];
	active?: boolean;
}

export interface Panel {
	id: string;
	name: string;
	visible: boolean;
	size?: number;
	minSize?: number;
	maxSize?: number;
	content?: any;
}

export interface CopilotCommand {
	id: string;
	name: string;
	description: string;
	icon?: string;
	action: () => void;
	shortcut?: string;
}

export interface AskOscarQuery {
	query: string;
	type: 'text' | 'code' | 'analysis' | 'documentation';
	context?: {
		documentId?: string;
		projectId?: string;
		selection?: string;
	};
	parameters?: Record<string, any>;
}

export interface AskOscarResponse {
	id: string;
	query: AskOscarQuery;
	response: string;
	sources?: Array<{
		id: string;
		type: string;
		title: string;
		relevance: number;
	}>;
	confidence: number;
	timestamp: string;
}

// Phase Compliance types
export interface CompliancePhase {
	id: string;
	name: string;
	version: string;
	status: 'active' | 'inactive' | 'deprecated';
	description: string;
	requirements: ComplianceRequirement[];
}

export interface ComplianceRequirement {
	id: string;
	phaseId: string;
	category: 'structure' | 'behavior' | 'ui' | 'navigation' | 'dependencies';
	title: string;
	description: string;
	mandatory: boolean;
	validation: ValidationRule[];
}

// Intelligence workflow types
export interface IntelligenceWorkflow {
	id: string;
	name: string;
	phase: string;
	status: 'idle' | 'running' | 'completed' | 'error';
	steps: WorkflowStep[];
	context: IntelligenceContext;
	result?: IntelligenceResult;
}

export interface WorkflowStep {
	id: string;
	name: string;
	type: 'analysis' | 'processing' | 'validation' | 'optimization';
	status: 'pending' | 'running' | 'completed' | 'error';
	input: any;
	output?: any;
	error?: string;
	duration?: number;
}

// Enhanced validation types
export interface ValidationRule {
	field: string;
	type: 'required' | 'format' | 'range' | 'custom';
	message: string;
	condition?: (value: any) => boolean;
}

export interface ValidationError {
	field: string;
	message: string;
	severity: 'error' | 'warning';
	code: string;
}

// Enhanced intelligence context
export interface IntelligenceContext {
	userId: string;
	projectId?: string;
	documentId?: string;
	phase: string;
	timestamp: string;
	metadata: Record<string, any>;
	environment: 'development' | 'production' | 'testing';
}

export interface IntelligenceResult {
	success: boolean;
	data?: any;
	errors?: ValidationError[];
	warnings?: ValidationError[];
	metrics: {
		processingTime: number;
		accuracy: number;
		efficiency: number;
	};
}

// Enhanced system types
export interface SystemConfiguration {
	id: string;
	name: string;
	version: string;
	config: Record<string, any>;
	enabled: boolean;
	dependencies: string[];
}

export interface SystemHealth {
	status: 'healthy' | 'warning' | 'error';
	metrics: {
		cpu: number;
		memory: number;
		disk: number;
		network: number;
	};
	lastChecked: string;
	alerts: HealthAlert[];
}

export interface HealthAlert {
	id: string;
	type: 'warning' | 'error';
	message: string;
	timestamp: string;
	resolved: boolean;
}

// Enhanced user types
export interface UserSession {
	id: string;
	userId: string;
	startTime: string;
	endTime?: string;
	status: 'active' | 'inactive' | 'expired';
	ipAddress: string;
	userAgent: string;
	activities: ActivityLog[];
}

export interface ActivityLog {
	id: string;
	action: string;
	timestamp: string;
	details: Record<string, any>;
	success: boolean;
}

// Enhanced search types
export interface SearchQuery {
	query: string;
	filters: SearchFilters;
	sort?: {
		field: string;
		direction: 'asc' | 'desc';
	};
	limit?: number;
	offset?: number;
}

export interface SearchIndex {
	id: string;
	documentId: string;
	content: string;
	tokens: string[];
	metadata: Record<string, any>;
	createdAt: string;
	updatedAt: string;
}

// Enhanced API types
export interface ApiRequest {
	id: string;
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	url: string;
	headers: Record<string, string>;
	body?: any;
	timestamp: string;
	timeout?: number;
}

export interface ApiResponse<T> {
	id: string;
	status: number;
	headers: Record<string, string>;
	data: T;
	error?: string;
	duration: number;
	timestamp: string;
}

// Enhanced form types
export interface FormValidation {
	valid: boolean;
	errors: ValidationError[];
	warnings: ValidationError[];
	timestamp: string;
}

export interface FormSubmission {
	formId: string;
	data: Record<string, any>;
	validation: FormValidation;
	submittedAt: string;
	submittedBy: string;
}

// Enhanced report types
export interface ReportMetadata {
	id: string;
	title: string;
	type: string;
	status: string;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	version: number;
	compliance: {
		phase: string;
		status: 'compliant' | 'non-compliant' | 'pending';
		score: number;
	};
}

export interface ReportSection {
	id: string;
	title: string;
	content: string;
	order: number;
	type: 'text' | 'table' | 'chart' | 'image' | 'appendix';
	metadata: Record<string, any>;
}

export interface ReportTemplate {
	id: string;
	name: string;
	description: string;
	sections: ReportSection[];
	variables: TemplateVariable[];
	validations: ValidationRule[];
	createdAt: string;
	updatedAt: string;
}

export interface TemplateVariable {
	name: string;
	type: 'string' | 'number' | 'date' | 'boolean';
	required: boolean;
	default?: any;
	options?: Array<{ label: string; value: any }>;
}

// Phase Compliance interfaces from specification
export interface ReportTypeDefinition {
	typeId: string;
	name: string;
	schema: any;
	validationRules: ValidationRule[];
	complianceStandards: string[];
	version: string;
}

export interface DecompiledReport {
	documentId: string;
	structureMap: StructureMap;
	metadata: Record<string, any>;
	content: string;
	format: string;
	extractedAt: string;
}

export interface StructureMap {
	headings: Array<{ level: number; text: string; id: string }>;
	sections: Array<{ id: string; title: string; order: number }>;
	subsections: Array<{ id: string; parentId: string; title: string; order: number }>;
	lists: Array<{ id: string; type: 'ordered' | 'unordered'; items: string[] }>;
	tables: Array<{ id: string; headers: string[]; rows: string[][] }>;
	references: Array<{ id: string; type: string; target: string }>;
	annotations: Array<{ id: string; type: string; content: string; position: any }>;
}

export interface SchemaMapping {
	sourceContent: any;
	targetSchema: any;
	mappingRules: MappingRule[];
	validationResults: ValidationResult[];
}

export interface SectionMapping {
	sectionId: string;
	requiredFields: string[];
	optionalFields: string[];
	dependencies: string[];
	validationRules: ValidationRule[];
}

export interface MappingRule {
	sourcePath: string;
	targetPath: string;
	transformation?: string;
	condition?: string;
}

export interface UpdateOperation {
	operationType: 'create' | 'update' | 'delete' | 'migrate';
	targetSchema: any;
	changes: any;
	timestamp: string;
	user: string;
}

export interface ValidationResult {
	isValid: boolean;
	errors: ValidationError[];
	warnings: ValidationError[];
	suggestions: string[];
	timestamp: string;
}

export interface StyleProfile {
	profileId: string;
	writingStyle: {
		formality: 'casual' | 'formal' | 'technical';
		tone: 'neutral' | 'persuasive' | 'analytical';
		complexity: 'simple' | 'medium' | 'complex';
	};
	formattingPreferences: {
		font: string;
		size: number;
		lineHeight: number;
		paragraphSpacing: number;
	};
	terminology: Record<string, string>;
	voice: {
		person: 'first' | 'second' | 'third';
		perspective: 'subjective' | 'objective';
	};
}

export interface StyleAnalysis {
	documentId: string;
	styleMetrics: {
		readability: number;
		vocabulary: number;
		sentenceLength: number;
		paragraphLength: number;
	};
	vocabulary: {
		uniqueWords: number;
		commonWords: string[];
		technicalTerms: string[];
	};
	readability: {
		fleschScore: number;
		gunningFog: number;
		automatedReadability: number;
	};
	consistency: {
		termConsistency: number;
		formatConsistency: number;
		styleConsistency: number;
	};
}

export interface ClassificationResult {
	documentId: string;
	classifications: Array<{
		type: string;
		confidence: number;
		categories: string[];
	}>;
	confidenceScores: ConfidenceScore[];
	timestamp: string;
}

export interface ConfidenceScore {
	typeId: string;
	score: number;
	evidence: string[];
	metadata: Record<string, any>;
}

export interface HealingOperation {
	operationType: 'structure' | 'content' | 'reference' | 'format';
	target: string;
	fixes: Array<{
		type: string;
		description: string;
		applied: boolean;
	}>;
	timestamp: string;
	user: string;
}

export interface HealingResult {
	documentId: string;
	issuesFixed: number;
	contentPreserved: boolean;
	timestamp: string;
	summary: string;
	details: Array<{
		issue: string;
		fix: string;
		impact: 'low' | 'medium' | 'high';
	}>;
}

export interface TemplateDefinition {
	templateId: string;
	framework: string;
	dynamicSections: Array<{
		id: string;
		title: string;
		required: boolean;
		fields: TemplateField[];
	}>;
	validationRules: ValidationRule[];
}

export interface TemplateInstance {
	instanceId: string;
	template: TemplateDefinition;
	content: Record<string, any>;
	metadata: Record<string, any>;
	createdAt: string;
}

export interface TemplateField {
	name: string;
	type: 'string' | 'number' | 'date' | 'boolean' | 'select' | 'textarea';
	required: boolean;
	label: string;
	default?: any;
	options?: Array<{ label: string; value: any }>;
	validation?: ValidationRule[];
}

export interface ComplianceCheck {
	checkType: string;
	standard: string;
	result: 'pass' | 'fail' | 'warning';
	timestamp: string;
	metadata: Record<string, any>;
}

export interface ComplianceResult {
	documentId: string;
	overallCompliance: number;
	detailedResults: ComplianceCheck[];
	recommendations: string[];
	timestamp: string;
}

export interface ReproductionTest {
	testType: string;
	parameters: Record<string, any>;
	expectedResults: any;
	actualResults: any;
	timestamp: string;
}

export interface TestResult {
	testId: string;
	passed: boolean;
	errors: ValidationError[];
	warnings: ValidationError[];
	metadata: Record<string, any>;
}

export interface ExpansionRule {
	ruleId: string;
	conditions: Array<{
		field: string;
		operator: 'equals' | 'contains' | 'matches' | 'greater' | 'less';
		value: any;
	}>;
	actions: Array<{
		type: 'add' | 'remove' | 'modify' | 'transform';
		target: string;
		value: any;
	}>;
	priority: number;
	scope: 'document' | 'section' | 'field';
}

export interface ExpansionResult {
	originalType: string;
	expandedType: string;
	appliedRules: string[];
	integrityMaintained: boolean;
	timestamp: string;
}

export interface ReasoningQuery {
	queryId: string;
	type: string;
	parameters: Record<string, any>;
	context: IntelligenceContext;
	expectedOutput: any;
}

export interface ReasoningResult {
	resultId: string;
	query: ReasoningQuery;
	answer: any;
	confidence: number;
	reasoningChain: Array<{
		step: number;
		action: string;
		input: any;
		output: any;
		explanation: string;
	}>;
	timestamp: string;
}

export interface WorkflowPattern {
	patternId: string;
	user: string;
	actions: Array<{
		action: string;
		target: string;
		timestamp: string;
	}>;
	frequency: number;
	efficiency: number;
}

export interface LearningResult {
	learningId: string;
	insights: string[];
	recommendations: string[];
	adaptations: Array<{
		type: string;
		target: string;
		change: any;
	}>;
	timestamp: string;
}

export interface IntegrationTest {
	testId: string;
	systems: string[];
	parameters: Record<string, any>;
	expectedResults: any;
	actualResults: any;
}

export interface ValidationReport {
	reportId: string;
	overallStatus: 'pass' | 'fail' | 'warning';
	systemStatuses: Record<string, 'pass' | 'fail' | 'warning'>;
	recommendations: string[];
	timestamp: string;
}

export interface RenderOptions {
	format: 'html' | 'pdf' | 'docx';
	responsive: boolean;
	accessibility: boolean;
	includeStyles: boolean;
}

export interface RenderResult {
	documentId: string;
	html: string;
	styles: string;
	metadata: Record<string, any>;
	timestamp: string;
}

export interface ParsedDocument {
	documentId: string;
	structure: StructureMap;
	layout: {
		pageSize: string;
		margins: any;
		sections: Array<{
			id: string;
			position: any;
			size: any;
		}>;
	};
	formatting: {
		fonts: Record<string, string>;
		colors: Record<string, string>;
		styles: Record<string, any>;
	};
	embeddedContent: Array<{
		type: string;
		id: string;
		data: any;
		position: any;
	}>;
	timestamp: string;
}

export interface ContentAnalysis {
	contentId: string;
	analysisType: string;
	insights: Array<{
		type: string;
		severity: 'low' | 'medium' | 'high';
		description: string;
		recommendation: string;
	}>;
	recommendations: string[];
	timestamp: string;
}

export interface TestReport {
	reportId: string;
	testResults: TestResult[];
	issues: Array<{
		id: string;
		type: string;
		severity: 'low' | 'medium' | 'high';
		description: string;
		location: string;
	}>;
	recommendations: string[];
	timestamp: string;
}

export interface AssistantCommand {
	commandId: string;
	type: string;
	parameters: Record<string, any>;
	context: IntelligenceContext;
	expectedOutput: any;
}

// UI and Layout types
export interface LayoutConfig {
	sidebar: {
		width: number;
		visible: boolean;
		items: SidebarItem[];
	};
	main: {
		panels: Panel[];
		activePanel: string;
	};
	rightPanel: {
		width: number;
		visible: boolean;
		activeTab: string;
		tabs: Array<{
			id: string;
			name: string;
			icon?: string;
			content?: any;
		}>;
	};
	mobile: {
		breakpoint: number;
		activeView: 'sidebar' | 'main' | 'right';
	};
}

export interface CopilotConfig {
	commands: CopilotCommand[];
	visible: boolean;
	position: 'bottom' | 'top' | 'left' | 'right';
	theme: 'light' | 'dark';
}

export interface AskOscarConfig {
	visible: boolean;
	mode: 'modal' | 'panel';
	position: 'center' | 'right' | 'bottom';
	maxResults: number;
	history: AskOscarResponse[];
}

// Intelligence System types
export interface ExtendedIntelligenceSystem {
	id: string;
	name: string;
	version: string;
	status: 'active' | 'inactive' | 'error' | 'maintenance';
	phases: Array<{
		id: string;
		name: string;
		status: 'pending' | 'running' | 'completed' | 'error';
		progress: number;
	}>;
	performance: {
		accuracy: number;
		speed: number;
		reliability: number;
		efficiency: number;
	};
	metrics: {
		totalProcessed: number;
		errorRate: number;
		averageProcessingTime: number;
	};
	lastRun?: string;
	nextRun?: string;
	description: string;
	config: Record<string, any>;
	dependencies: string[];
}

export interface SystemManagementSystem {
	id: string;
	name: string;
	version: string;
	status: 'active' | 'inactive' | 'error' | 'maintenance';
	systems: IntelligenceSystem[];
	metrics: {
		healthy: number;
		warning: number;
		error: number;
		total: number;
	};
	lastHealthCheck?: string;
	nextHealthCheck?: string;
	config: Record<string, any>;
	alerts: HealthAlert[];
}

// Navigation types
export interface NavigationItem {
	id: string;
	name: string;
	icon?: string;
	path?: string;
	children?: NavigationItem[];
	active?: boolean;
	visible?: boolean;
	order?: number;
}

export interface NavigationContext {
	currentPath: string;
	activeItem: string;
	breadcrumbs: Array<{
		name: string;
		path: string;
	}>;
	permissions: string[];
}

// Collaboration types
export interface CollaborationSession {
	id: string;
	projectId: string;
	documentId?: string;
	participants: Array<{
		userId: string;
		name: string;
		role: string;
		joinedAt: string;
		active: boolean;
	}>;
	startedAt: string;
	endedAt?: string;
	activities: Array<{
		type: 'join' | 'leave' | 'edit' | 'comment' | 'cursor';
		userId: string;
		timestamp: string;
		details?: any;
	}>;
}

export interface RealTimeUpdate {
	type: 'document' | 'cursor' | 'selection' | 'comment';
	documentId: string;
	userId: string;
	timestamp: string;
	data: any;
}

// Report Intelligence specific types
export interface ReportTypeRegistry {
	types: Map<string, ReportTypeDefinition>;
	register: (type: ReportTypeDefinition) => void;
	unregister: (typeId: string) => void;
	get: (typeId: string) => ReportTypeDefinition | undefined;
	list: () => ReportTypeDefinition[];
}

export interface ReportDecompiler {
	decompile: (document: Document) => Promise<DecompiledReport>;
	validate: (decompiled: DecompiledReport) => ValidationResult;
}

export interface ReportSchemaMapper {
	map: (source: any, targetSchema: any) => SchemaMapping;
	validate: (mapping: SchemaMapping) => ValidationResult;
}

export interface ReportStyleLearner {
	analyze: (document: Document) => Promise<StyleAnalysis>;
	generateProfile: (analysis: StyleAnalysis) => StyleProfile;
}

export interface ReportClassificationEngine {
	classify: (document: Document) => Promise<ClassificationResult>;
	getConfidence: (result: ClassificationResult) => number;
}

export interface ReportSelfHealingEngine {
	detectIssues: (document: Document) => Promise<Array<{
		type: string;
		severity: 'low' | 'medium' | 'high';
		description: string;
		location: any;
	}>>;
	applyHealing: (document: Document, issues: any[]) => Promise<HealingResult>;
}

export interface ReportTemplateGenerator {
	generate: (document: Document) => Promise<TemplateDefinition>;
	validate: (template: TemplateDefinition) => ValidationResult;
}

export interface ReportComplianceValidator {
	validate: (document: Document, standards: string[]) => Promise<ComplianceResult>;
	checkStandard: (document: Document, standard: string) => ComplianceCheck;
}

export interface ReportReproductionTester {
	test: (document: Document, testType: string) => Promise<TestResult>;
	validateConsistency: (documents: Document[]) => Promise<boolean>;
}

export interface ReportTypeExpansionFramework {
	expand: (document: Document, rules: ExpansionRule[]) => Promise<ExpansionResult>;
	validate: (result: ExpansionResult) => ValidationResult;
}

export interface AIReasoningIntegration {
	reason: (query: ReasoningQuery) => Promise<ReasoningResult>;
	explain: (result: ReasoningResult) => string;
}

export interface UserWorkflowLearning {
	learn: (activities: ActivityLog[]) => Promise<LearningResult>;
	recommend: (user: string) => Array<{
		type: string;
		description: string;
		priority: number;
	}>;
}

export interface FinalIntegrationValidator {
	validate: (systems: string[]) => Promise<ValidationReport>;
	testIntegration: (system1: string, system2: string) => Promise<boolean>;
}

export interface HTMLRenderer {
	render: (document: Document, options: RenderOptions) => Promise<RenderResult>;
	validate: (result: RenderResult) => ValidationResult;
}

export interface LayoutExtractor {
	extract: (document: Document) => Promise<ParsedDocument>;
	preserve: (original: ParsedDocument, modified: ParsedDocument) => boolean;
}

export interface BlogPostGenerator {
	generate: (analysis: ContentAnalysis) => Promise<{
		title: string;
		content: string;
		tags: string[];
		summary: string;
	}>;
	analyze: (content: string) => Promise<ContentAnalysis>;
}

export interface DebugEngine {
	debug: (system: string, issue: string) => Promise<TestReport>;
	trace: (system: string, operation: string) => Promise<Array<{
		step: number;
		action: string;
		timestamp: string;
		result: string;
	}>>;
}

export interface ContextManager {
	track: (context: IntelligenceContext) => void;
	get: (userId: string) => IntelligenceContext | undefined;
	update: (userId: string, updates: Partial<IntelligenceContext>) => void;
}

export interface AssistantCommandExecutor {
	execute: (command: AssistantCommand) => Promise<any>;
	validate: (command: AssistantCommand) => ValidationResult;
}

// Error handling types
export interface ErrorContext {
	code: string;
	message: string;
	severity: 'info' | 'warning' | 'error' | 'critical';
	timestamp: string;
	stack?: string;
	context?: Record<string, any>;
	user?: string;
}

export interface ErrorHandler {
	handle: (error: ErrorContext) => void;
	recover: (error: ErrorContext) => Promise<boolean>;
	log: (error: ErrorContext) => void;
}

// Event system types
export interface Event {
	id: string;
	type: string;
	timestamp: string;
	data: any;
	source: string;
}

export interface EventHandler {
	handle: (event: Event) => void;
	subscribe: (type: string, handler: (event: Event) => void) => void;
	unsubscribe: (type: string, handler: (event: Event) => void) => void;
}

// Performance monitoring types
export interface PerformanceMetrics {
	cpu: number;
	memory: number;
	disk: number;
	network: number;
	responseTime: number;
	throughput: number;
	errorRate: number;
}

export interface PerformanceMonitor {
	record: (metrics: PerformanceMetrics) => void;
	alert: (thresholds: Record<string, number>) => void;
	report: () => Promise<{
		summary: string;
		details: PerformanceMetrics[];
		trends: Record<string, number>;
	}>;
}

// Configuration types
export interface AppConfig {
	api: {
		baseUrl: string;
		timeout: number;
		retries: number;
	};
	ui: {
		theme: 'light' | 'dark' | 'auto';
		language: string;
		timezone: string;
	};
	features: {
		enabled: string[];
		disabled: string[];
	};
	security: {
		encryption: boolean;
		authentication: boolean;
		authorization: boolean;
	};
}

export interface UserPreferences {
	theme: 'light' | 'dark' | 'auto';
	language: string;
	timezone: string;
	notifications: {
		email: boolean;
		push: boolean;
		inApp: boolean;
	};
	privacy: {
		dataCollection: boolean;
		analytics: boolean;
		personalization: boolean;
	};
	productivity: {
		shortcuts: string[];
		defaultViews: string[];
		autoSave: boolean;
	};
}

// Analytics types
export interface AnalyticsEvent {
	event: string;
	properties: Record<string, any>;
	timestamp: string;
	userId?: string;
	sessionId?: string;
}

export interface AnalyticsTracker {
	track: (event: AnalyticsEvent) => void;
	identify: (userId: string, traits: Record<string, any>) => void;
	group: (groupId: string, traits: Record<string, any>) => void;
	page: (category: string, name: string, properties?: Record<string, any>) => void;
}

// Security types
export interface SecurityPolicy {
	id: string;
	name: string;
	description: string;
	rules: Array<{
		id: string;
		type: 'access' | 'data' | 'network' | 'application';
		condition: string;
		action: 'allow' | 'deny' | 'log' | 'alert';
		priority: number;
	}>;
	enabled: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface SecurityAudit {
	id: string;
	policyId: string;
	timestamp: string;
	result: 'pass' | 'fail' | 'warning';
	violations: Array<{
		ruleId: string;
		severity: 'low' | 'medium' | 'high';
		description: string;
		location: string;
	}>;
	recommendations: string[];
}

// Backup and recovery types
export interface BackupConfig {
	schedule: string;
	retention: number;
	encryption: boolean;
	compression: boolean;
	locations: string[];
}

export interface BackupJob {
	id: string;
	status: 'pending' | 'running' | 'completed' | 'failed';
	startedAt?: string;
	completedAt?: string;
	size: number;
	files: number;
	errors: string[];
}

export interface RecoveryPoint {
	id: string;
	timestamp: string;
	size: number;
	files: number;
	valid: boolean;
	verifiedAt?: string;
}

// Integration types
export interface Integration {
	id: string;
	name: string;
	type: 'api' | 'webhook' | 'database' | 'file';
	config: Record<string, any>;
	status: 'connected' | 'disconnected' | 'error';
	lastSync?: string;
	schema?: any;
}

export interface SyncOperation {
	id: string;
	integrationId: string;
	status: 'pending' | 'running' | 'completed' | 'failed';
	startedAt: string;
	completedAt?: string;
	records: {
		create: number;
		update: number;
		delete: number;
		error: number;
	};
}

// Export types
export interface ExportConfig {
	format: 'pdf' | 'docx' | 'html' | 'markdown' | 'json';
	includeStyles: boolean;
	includeMetadata: boolean;
	includeComments: boolean;
	password?: string;
	options?: Record<string, any>;
}

export interface ExportJob {
	id: string;
	status: 'pending' | 'running' | 'completed' | 'failed';
	startedAt: string;
	completedAt?: string;
	format: string;
	size: number;
	downloadUrl?: string;
	error?: string;
}