/**
 * Style Profile (Phase 5)
 *
 * Represents a user's writing style, tone, structure, formatting preferences, and report‑specific habits.
 */

export interface StyleProfile {
	id: string;
	userId: string;
	reportTypeId: string | null; // null = generic across all report types
	tone: 'formal' | 'informal' | 'technical' | 'conversational' | 'neutral';
	sentencePatterns: string[]; // e.g., "passive voice", "short sentences", "bullet lists"
	paragraphPatterns: string[]; // e.g., "topic sentence first", "conclusion at end"
	sectionOrdering: string[]; // preferred order of sections (if deviates from standard)
	preferredPhrasing: string[]; // e.g., "It is recommended that" vs "We recommend"
	formattingPreferences: Record<string, any>; // e.g., "headingLevels": 2, "bulletStyle": "dash"
	terminologyPreferences: string[]; // preferred terms over synonyms
	structuralPreferences: Record<string, any>; // e.g., "includeExecutiveSummary": true
	confidenceScore: number; // 0‑1, how confident we are in this profile
	createdAt: Date;
	updatedAt: Date;
	version: string;
	timestamps: {
		created: Date;
		updated: Date;
	};
}

/**
 * Helper to create a new style profile
 */
export function createStyleProfile(
	userId: string,
	reportTypeId: string | null = null,
	tone: StyleProfile['tone'] = 'neutral',
	sentencePatterns: string[] = [],
	paragraphPatterns: string[] = [],
	sectionOrdering: string[] = [],
	preferredPhrasing: string[] = [],
	formattingPreferences: Record<string, any> = {},
	terminologyPreferences: string[] = [],
	structuralPreferences: Record<string, any> = {},
	confidenceScore: number = 0.5
): StyleProfile {
	const now = new Date();
	return {
		id: `style_${now.getTime()}_${Math.random().toString(36).substring(2)}`,
		userId,
		reportTypeId,
		tone,
		sentencePatterns,
		paragraphPatterns,
		sectionOrdering,
		preferredPhrasing,
		formattingPreferences,
		terminologyPreferences,
		structuralPreferences,
		confidenceScore,
		createdAt: now,
		updatedAt: now,
		version: '1.0.0',
		timestamps: {
			created: now,
			updated: now
		}
	};
}