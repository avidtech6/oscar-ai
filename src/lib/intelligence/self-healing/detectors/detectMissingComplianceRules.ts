/**
 * Detect missing compliance rules in a decompiled report.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';
import { SelfHealingActionType, Severity, type SelfHealingAction } from '../SelfHealingAction';

export function detectMissingComplianceRules(
	decompiledReport: DecompiledReport,
	reportType: ReportTypeDefinition
): SelfHealingAction[] {
	const actions: SelfHealingAction[] = [];
	const decompiledMarkers = decompiledReport.complianceMarkers.map(m => m.toLowerCase());

	for (const rule of reportType.complianceRules) {
		const keywords = rule.split(/[,\s]+/).filter(k => k.length > 3);
		const hasMatch = keywords.some(kw =>
			decompiledMarkers.some(m => m.includes(kw))
		);
		if (!hasMatch) {
			actions.push({
				id: `missing_compliance_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
				type: SelfHealingActionType.ADD_MISSING_COMPLIANCE_RULE,
				target: reportType.id,
				payload: {
					rule,
					reportTypeId: reportType.id,
					decompiledReportId: decompiledReport.id
				},
				severity: Severity.HIGH,
				reason: `Compliance rule "${rule}" not referenced in report`,
				createdAt: new Date(),
				appliedAt: null
			});
		}
	}
	return actions;
}