/**
 * Score terminology similarity between a decompiled report and a report type.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';

export function scoreTerminologySimilarity(
	decompiledReport: DecompiledReport,
	reportType: ReportTypeDefinition
): number {
	const decompiledTerms = decompiledReport.terminology.map(t => t.toLowerCase());
	const reportTypeTerms = (reportType.terminology || []).map(t => t.toLowerCase());

	if (reportTypeTerms.length === 0) {
		// If report type has no defined terminology, assume neutral
		return 0.5;
	}

	let matched = 0;
	for (const term of reportTypeTerms) {
		if (decompiledTerms.some(t => t.includes(term) || term.includes(t))) {
			matched++;
		}
	}

	return matched / reportTypeTerms.length;
}