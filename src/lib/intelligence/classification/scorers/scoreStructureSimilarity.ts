/**
 * Score structure similarity between a decompiled report and a report type.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';

export function scoreStructureSimilarity(
	decompiledReport: DecompiledReport,
	reportType: ReportTypeDefinition
): number {
	let score = 0;
	const reasons: string[] = [];

	// 1. Compare required sections
	const requiredSections = reportType.requiredSections;
	const decompiledSectionTitles = decompiledReport.sections.map(s => s.title.toLowerCase());

	let matchedRequired = 0;
	for (const requiredTitle of requiredSections) {
		const lowerRequired = requiredTitle.toLowerCase();
		if (decompiledSectionTitles.some(title => title.includes(lowerRequired) || lowerRequired.includes(title))) {
			matchedRequired++;
			reasons.push(`Required section "${requiredTitle}" found`);
		} else {
			reasons.push(`Required section "${requiredTitle}" missing`);
		}
	}

	const requiredScore = requiredSections.length > 0 ? matchedRequired / requiredSections.length : 1;
	score += requiredScore * 0.4; // 40% weight

	// 2. Compare optional sections (bonus)
	const optionalSections = reportType.optionalSections;
	let matchedOptional = 0;
	for (const optionalTitle of optionalSections) {
		const lowerOptional = optionalTitle.toLowerCase();
		if (decompiledSectionTitles.some(title => title.includes(lowerOptional) || lowerOptional.includes(title))) {
			matchedOptional++;
			reasons.push(`Optional section "${optionalTitle}" found`);
		}
	}

	const optionalScore = optionalSections.length > 0 ? matchedOptional / optionalSections.length : 1;
	score += optionalScore * 0.2; // 20% weight

	// 3. Compare section ordering (simple)
	const decompiledOrder = decompiledReport.sections.map(s => s.title.toLowerCase());
	const expectedOrder = [...requiredSections, ...optionalSections].map(s => s.toLowerCase());
	let orderMatches = 0;
	for (let i = 0; i < Math.min(decompiledOrder.length, expectedOrder.length); i++) {
		if (decompiledOrder[i] === expectedOrder[i]) {
			orderMatches++;
		}
	}

	const orderScore = expectedOrder.length > 0 ? orderMatches / expectedOrder.length : 1;
	score += orderScore * 0.2; // 20% weight

	// 4. Compare depth (subsections)
	const decompiledDepth = decompiledReport.sections.reduce((max, s) => Math.max(max, s.level), 0);
	const expectedDepth = 3; // typical report depth (title, section, subsection)
	const depthScore = decompiledDepth >= expectedDepth ? 1 : decompiledDepth / expectedDepth;
	score += depthScore * 0.1; // 10% weight

	// 5. Appendices presence (check if any section contains "appendix")
	const hasAppendices = decompiledSectionTitles.some(t => t.includes('appendix'));
	const expectsAppendices = [...requiredSections, ...optionalSections].some(s => s.toLowerCase().includes('appendix'));
	if (hasAppendices === expectsAppendices) {
		score += 0.1; // 10% weight
		reasons.push('Appendix presence matches expectation');
	} else {
		reasons.push('Appendix presence mismatch');
	}

	// Normalize to 0‑1
	const finalScore = Math.min(1, Math.max(0, score));
	return finalScore;
}