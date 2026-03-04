/**
 * Workflow Profile
 * 
 * Captures learned patterns of user behaviour for report creation.
 * Includes section order, omissions, corrections, interaction patterns, data sources,
 * and heuristics for predicting next actions.
 */

export interface WorkflowProfile {
	id: string;
	userId: string;
	reportTypeId: string | null;
	commonSectionOrder: string[];
	commonOmissions: string[];
	commonCorrections: string[];
	preferredInteractionPatterns: string[];
	typicalDataSources: string[];
	workflowHeuristics: Record<string, any>;
	confidenceScore: number;
	timestamps: {
		created: Date;
		updated: Date;
		lastObserved: Date;
	};
	version: number;
}

/**
 * Create a new workflow profile.
 */
export function createWorkflowProfile(
	userId: string,
	reportTypeId: string | null,
	initialData?: Partial<Omit<WorkflowProfile, 'id' | 'userId' | 'reportTypeId' | 'timestamps' | 'version'>>
): WorkflowProfile {
	const now = new Date();
	return {
		id: `workflow_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
		userId,
		reportTypeId,
		commonSectionOrder: initialData?.commonSectionOrder ?? [],
		commonOmissions: initialData?.commonOmissions ?? [],
		commonCorrections: initialData?.commonCorrections ?? [],
		preferredInteractionPatterns: initialData?.preferredInteractionPatterns ?? [],
		typicalDataSources: initialData?.typicalDataSources ?? [],
		workflowHeuristics: initialData?.workflowHeuristics ?? {},
		confidenceScore: initialData?.confidenceScore ?? 0.0,
		timestamps: {
			created: now,
			updated: now,
			lastObserved: now,
		},
		version: 1,
	};
}

/**
 * Update an existing workflow profile with new observed data.
 */
export function updateWorkflowProfile(
	profile: WorkflowProfile,
	updates: Partial<Omit<WorkflowProfile, 'id' | 'userId' | 'reportTypeId' | 'timestamps' | 'version'>>
): WorkflowProfile {
	const now = new Date();
	return {
		...profile,
		...updates,
		timestamps: {
			...profile.timestamps,
			updated: now,
			lastObserved: now,
		},
		version: profile.version + 1,
	};
}