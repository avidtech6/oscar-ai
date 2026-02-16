export interface Issue {
	id: string;
	type: 'missing-field' | 'ambiguity' | 'inconsistency' | 'missing-data' | 'low-confidence';
	field: string;
	originalInput: string;
	suggestions: Array<{
		value: string;
		confidence: number; // 0-1
	}>;
	explanation: string;
	status: 'pending' | 'resolved' | 'ignored';
	resolvedValue?: string;
}

export interface AIReviewState {
	projectId: string;
	issues: Issue[];
	currentIssueIndex: number;
	conversation: Array<{
		role: 'ai' | 'user';
		content: string;
		timestamp: Date;
	}>;
	status: 'scanning' | 'active' | 'completed' | 'error';
}

export interface ProjectScanResult {
	projectId: string;
	issues: Issue[];
	summary: string;
	scanTimestamp: Date;
}