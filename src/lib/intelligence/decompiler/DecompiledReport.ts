/**
 * Decompiled Report (Phase 2)
 * 
 * Structured representation of a report after decompilation.
 * Contains extracted sections, metadata, terminology, compliance markers, and a structure map.
 */

export interface DecompiledSection {
	id: string;
	title: string;
	level: number;
	content: string;
	subsections: DecompiledSection[];
	metadata?: Record<string, any>;
}

export interface DecompiledReport {
	id: string;
	rawText: string;
	detectedReportType: string | null;
	sections: DecompiledSection[];
	metadata: Record<string, any>;
	terminology: string[];
	complianceMarkers: string[];
	structureMap: Record<string, any>;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Helper to create a new decompiled report
 */
export function createDecompiledReport(
	rawText: string,
	detectedReportType: string | null = null,
	sections: DecompiledSection[] = [],
	metadata: Record<string, any> = {},
	terminology: string[] = [],
	complianceMarkers: string[] = [],
	structureMap: Record<string, any> = {}
): DecompiledReport {
	const now = new Date();
	return {
		id: `decompiled_${now.getTime()}_${Math.random().toString(36).substring(2)}`,
		rawText,
		detectedReportType,
		sections,
		metadata,
		terminology,
		complianceMarkers,
		structureMap,
		createdAt: now,
		updatedAt: now
	};
}

/**
 * Helper to flatten sections for easy traversal
 */
export function flattenSections(sections: DecompiledSection[]): DecompiledSection[] {
	const result: DecompiledSection[] = [];
	function traverse(sec: DecompiledSection) {
		result.push(sec);
		sec.subsections.forEach(traverse);
	}
	sections.forEach(traverse);
	return result;
}