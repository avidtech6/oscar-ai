/**
 * Detect missing required sections in a decompiled report compared to its report type.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';
import { SelfHealingActionType, Severity, type SelfHealingAction } from '../SelfHealingAction';

export function detectMissingSections(
	decompiledReport: DecompiledReport,
	reportType: ReportTypeDefinition
): SelfHealingAction[] {
	const actions: SelfHealingAction[] = [];
	const decompiledSectionTitles = decompiledReport.sections.map(s => s.title.toLowerCase());

	for (const requiredSection of reportType.requiredSections) {
		const lowerRequired = requiredSection.toLowerCase();
		const found = decompiledSectionTitles.some(title =>
			title.includes(lowerRequired) || lowerRequired.includes(title)
		);
		if (!found) {
			actions.push({
				id: `missing_section_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
				type: SelfHealingActionType.ADD_MISSING_SECTION,
				target: reportType.id,
				payload: {
					sectionTitle: requiredSection,
					reportTypeId: reportType.id,
					decompiledReportId: decompiledReport.id
				},
				severity: Severity.HIGH,
				reason: `Required section "${requiredSection}" is missing in decompiled report`,
				createdAt: new Date(),
				appliedAt: null
			});
		}
	}

	return actions;
}