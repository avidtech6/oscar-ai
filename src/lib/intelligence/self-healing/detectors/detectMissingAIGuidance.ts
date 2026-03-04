/**
 * Detect missing AI guidance (placeholder).
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';
import { SelfHealingActionType, Severity, type SelfHealingAction } from '../SelfHealingAction';

export function detectMissingAIGuidance(
	decompiledReport: DecompiledReport,
	reportType: ReportTypeDefinition
): SelfHealingAction[] {
	const actions: SelfHealingAction[] = [];
	// Check if any AI guidance is referenced in the report content
	const content = decompiledReport.rawText.toLowerCase();
	for (const guidance of reportType.aiGuidance) {
		const keywords = guidance.split(/[,\s]+/).filter(k => k.length > 3);
		const hasMatch = keywords.some(kw => content.includes(kw.toLowerCase()));
		if (!hasMatch) {
			actions.push({
				id: `missing_ai_guidance_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
				type: SelfHealingActionType.ADD_MISSING_AI_GUIDANCE,
				target: reportType.id,
				payload: {
					guidance,
					reportTypeId: reportType.id,
					decompiledReportId: decompiledReport.id
				},
				severity: Severity.LOW,
				reason: `AI guidance "${guidance}" not reflected in report`,
				createdAt: new Date(),
				appliedAt: null
			});
		}
	}
	return actions;
}