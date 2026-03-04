/**
 * Extract structural preferences from decompiled report.
 * 
 * Detects preferences like inclusion of executive summary, appendix, etc.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';

export function extractStructuralPreferences(decompiledReport: DecompiledReport): Record<string, any> {
	const prefs: Record<string, any> = {};

	// 1. Executive summary detection
	const hasExecutiveSummary = decompiledReport.sections.some(s =>
		s.title.toLowerCase().includes('executive summary') ||
		s.title.toLowerCase().includes('summary')
	);
	prefs.includeExecutiveSummary = hasExecutiveSummary;

	// 2. Appendix detection
	const hasAppendix = decompiledReport.sections.some(s =>
		s.title.toLowerCase().includes('appendix') ||
		s.title.toLowerCase().includes('appendices')
	);
	prefs.includeAppendix = hasAppendix;

	// 3. Table of contents detection
	const hasTOC = decompiledReport.sections.some(s =>
		s.title.toLowerCase().includes('table of contents') ||
		s.title.toLowerCase().includes('contents')
	);
	prefs.includeTableOfContents = hasTOC;

	// 4. Glossary detection
	const hasGlossary = decompiledReport.sections.some(s =>
		s.title.toLowerCase().includes('glossary') ||
		s.title.toLowerCase().includes('terminology')
	);
	prefs.includeGlossary = hasGlossary;

	// 5. Number of sections
	prefs.sectionCount = decompiledReport.sections.length;

	// 6. Average subsection depth
	const depths = decompiledReport.sections.flatMap(s => [s.level, ...s.subsections.map(sub => sub.level)]);
	prefs.averageDepth = depths.length > 0 ? depths.reduce((a, b) => a + b, 0) / depths.length : 0;

	// 7. Use of hierarchical numbering (e.g., 1.1, 1.2)
	const content = decompiledReport.sections.map(s => s.content).join(' ');
	if (content.match(/\d+\.\d+/)) prefs.hierarchicalNumbering = true;

	return prefs;
}