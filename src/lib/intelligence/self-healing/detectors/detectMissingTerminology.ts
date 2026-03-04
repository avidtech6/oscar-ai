/**
 * Detect missing terminology in a decompiled report.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';
import { SelfHealingActionType, Severity, type SelfHealingAction } from '../SelfHealingAction';

export function detectMissingTerminology(
	decompiledReport: DecompiledReport,
	reportType: ReportTypeDefinition
): SelfHealingAction[] {
	const actions: SelfHealingAction[] = [];
	const decompiledTerms = decompiledReport.terminology.map(t => t.toLowerCase());
	const reportTypeTerms = (reportType.terminology || []).map(t => t.toLowerCase());

	for (const term of reportTypeTerms) {
		const found = decompiledTerms.some(t => t.includes(term) || term.includes(t));
		if (!found) {
			actions.push({
				id: `missing_terminology_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
				type: SelfHealingActionType.ADD_MISSING_TERMINOLOGY,
				target: reportType.id,
				payload: {
					term,
					reportTypeId: reportType.id,
					decompiledReportId: decompiledReport.id
				},
				severity: Severity.MEDIUM,
				reason: `Terminology "${term}" not found in report`,
				createdAt: new Date(),
				appliedAt: null
			});
		}
	}
	return actions;
}