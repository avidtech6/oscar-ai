/**
 * Detect missing required fields in a decompiled report.
 * For simplicity, we treat each section's content as fields.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';
import { SelfHealingActionType, Severity, type SelfHealingAction } from '../SelfHealingAction';

export function detectMissingFields(
	decompiledReport: DecompiledReport,
	reportType: ReportTypeDefinition
): SelfHealingAction[] {
	const actions: SelfHealingAction[] = [];
	// In a real implementation, we would have a mapping of required fields per section.
	// For now, we'll just check if each section has content.
	for (const section of decompiledReport.sections) {
		if (!section.content || section.content.trim().length === 0) {
			actions.push({
				id: `missing_field_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
				type: SelfHealingActionType.ADD_MISSING_FIELD,
				target: section.id,
				payload: {
					sectionId: section.id,
					sectionTitle: section.title,
					reportTypeId: reportType.id
				},
				severity: Severity.MEDIUM,
				reason: `Section "${section.title}" has no content`,
				createdAt: new Date(),
				appliedAt: null
			});
		}
	}
	return actions;
}