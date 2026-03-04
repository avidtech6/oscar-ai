/**
 * System Integration Report
 * 
 * Captures the results of system integration validation.
 */

export interface SubsystemStatus {
	phase: number;
	name: string;
	initialised: boolean;
	operational: boolean;
	error?: string;
}

export interface DataFlowStatus {
	source: string;
	target: string;
	flowing: boolean;
	latencyMs?: number;
	error?: string;
}

export interface EventPropagationStatus {
	event: string;
	emitted: boolean;
	received: boolean;
	handlers: number;
	error?: string;
}

export interface VersioningStatus {
	subsystem: string;
	currentVersion: string;
	expectedVersion: string;
	match: boolean;
}

export interface TemplateStatus {
	reportTypeId: string;
	templateGenerated: boolean;
	templateRegenerated: boolean;
	regenerationMatches: boolean;
	error?: string;
}

export interface SystemIntegrationReport {
	id: string;
	subsystemStatus: Record<string, SubsystemStatus>;
	dataFlowStatus: DataFlowStatus[];
	eventPropagationStatus: EventPropagationStatus[];
	versioningStatus: VersioningStatus[];
	templateStatus: TemplateStatus[];
	classificationAccuracy: number; // 0‑1
	mappingAccuracy: number; // 0‑1
	complianceAccuracy: number; // 0‑1
	reasoningQuality: number; // 0‑1
	workflowLearningQuality: number; // 0‑1
	reproductionScores: number[]; // list of similarity scores
	warnings: string[];
	passed: boolean;
	timestamps: {
		started: Date;
		completed: Date;
	};
}

/**
 * Create a new system integration report.
 */
export function createSystemIntegrationReport(
	initialData?: Partial<Omit<SystemIntegrationReport, 'id' | 'timestamps'>>
): SystemIntegrationReport {
	const now = new Date();
	return {
		id: `integration_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
		subsystemStatus: initialData?.subsystemStatus ?? {},
		dataFlowStatus: initialData?.dataFlowStatus ?? [],
		eventPropagationStatus: initialData?.eventPropagationStatus ?? [],
		versioningStatus: initialData?.versioningStatus ?? [],
		templateStatus: initialData?.templateStatus ?? [],
		classificationAccuracy: initialData?.classificationAccuracy ?? 0,
		mappingAccuracy: initialData?.mappingAccuracy ?? 0,
		complianceAccuracy: initialData?.complianceAccuracy ?? 0,
		reasoningQuality: initialData?.reasoningQuality ?? 0,
		workflowLearningQuality: initialData?.workflowLearningQuality ?? 0,
		reproductionScores: initialData?.reproductionScores ?? [],
		warnings: initialData?.warnings ?? [],
		passed: initialData?.passed ?? false,
		timestamps: {
			started: now,
			completed: now,
		},
	};
}

/**
 * Update a system integration report with new data.
 */
export function updateSystemIntegrationReport(
	report: SystemIntegrationReport,
	updates: Partial<Omit<SystemIntegrationReport, 'id' | 'timestamps'>>
): SystemIntegrationReport {
	return {
		...report,
		...updates,
		timestamps: {
			...report.timestamps,
			completed: new Date(),
		},
	};
}