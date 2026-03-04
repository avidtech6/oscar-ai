/**
 * Score compliance markers between a decompiled report and a report type.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';

export function scoreComplianceMarkers(
	decompiledReport: DecompiledReport,
	reportType: ReportTypeDefinition
): number {
	const decompiledMarkers = decompiledReport.complianceMarkers.map(m => m.toLowerCase());
	const reportTypeRules = reportType.complianceRules.map(r => r.toLowerCase());

	if (reportTypeRules.length === 0) {
		// If report type has no compliance rules, assume neutral
		return 0.5;
	}

	let matched = 0;
	for (const rule of reportTypeRules) {
		// Check if any decompiled marker contains rule keywords
		const keywords = rule.split(/[,\s]+/).filter(k => k.length > 3);
		const hasMatch = keywords.some(kw =>
			decompiledMarkers.some(m => m.includes(kw))
		);
		if (hasMatch) {
			matched++;
		}
	}

	return matched / reportTypeRules.length;
}