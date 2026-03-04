/**
 * Detect gaps between decompiled report and schema (missing required sections, missing conditional sections, etc.)
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../../types';

export function detectSchemaGaps(
	decompiledReport: DecompiledReport,
	reportTypeDefinition: ReportTypeDefinition
): string[] {
	const gaps: string[] = [];

	// 1. Missing required sections (already covered by detectMissingSections)
	// 2. Missing conditional sections that should be present based on content
	// 3. Missing optional sections that are typical for this report type
	// 4. Missing compliance markers
	// 5. Missing terminology definitions

	// For simplicity, we'll check if any conditional sections are missing but expected
	const conditionalSections = reportTypeDefinition.conditionalSections;
	const allSectionTitles = decompiledReport.sections.flatMap(sec => [
		sec.title,
		...sec.subsections.map(sub => sub.title)
	]).map(t => t.toLowerCase());

	for (const conditional of conditionalSections) {
		const lowerConditional = conditional.toLowerCase();
		let found = false;
		for (const title of allSectionTitles) {
			if (title.includes(lowerConditional) || lowerConditional.includes(title)) {
				found = true;
				break;
			}
		}
		if (!found) {
			gaps.push(`Conditional section "${conditional}" missing`);
		}
	}

	// Check compliance markers
	const complianceRules = reportTypeDefinition.complianceRules;
	const allContent = decompiledReport.sections.map(s => s.content).join(' ').toLowerCase();
	for (const rule of complianceRules) {
		const keywords = rule.toLowerCase().split(/\W+/).filter(k => k.length > 3);
		let missingKeywords = keywords.filter(k => !allContent.includes(k));
		if (missingKeywords.length > 0) {
			gaps.push(`Compliance rule missing keywords: ${missingKeywords.join(', ')}`);
		}
	}

	return gaps;
}