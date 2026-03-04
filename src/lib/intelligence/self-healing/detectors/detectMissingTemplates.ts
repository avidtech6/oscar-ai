/**
 * Detect missing templates (placeholder).
 * In a full implementation, we would compare against a template registry.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';
import { SelfHealingActionType, Severity, type SelfHealingAction } from '../SelfHealingAction';

export function detectMissingTemplates(
	decompiledReport: DecompiledReport,
	reportType: ReportTypeDefinition
): SelfHealingAction[] {
	// For now, we assume templates are present if the report has at least one section.
	// This is a placeholder; real detection would involve a template registry.
	if (decompiledReport.sections.length === 0) {
		return [{
			id: `missing_template_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
			type: SelfHealingActionType.ADD_MISSING_TEMPLATE,
			target: reportType.id,
			payload: {
				reportTypeId: reportType.id,
				decompiledReportId: decompiledReport.id
			},
			severity: Severity.MEDIUM,
			reason: 'No template structure detected for this report type',
			createdAt: new Date(),
			appliedAt: null
		}];
	}
	return [];
}