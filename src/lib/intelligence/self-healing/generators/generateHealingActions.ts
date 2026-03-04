/**
 * Generate healing actions by running all detectors.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';
import type { SelfHealingAction } from '../SelfHealingAction';
import { detectMissingSections } from '../detectors/detectMissingSections';
import { detectMissingFields } from '../detectors/detectMissingFields';
import { detectMissingComplianceRules } from '../detectors/detectMissingComplianceRules';
import { detectMissingTerminology } from '../detectors/detectMissingTerminology';
import { detectMissingTemplates } from '../detectors/detectMissingTemplates';
import { detectMissingAIGuidance } from '../detectors/detectMissingAIGuidance';
import { detectSchemaContradictions } from '../detectors/detectSchemaContradictions';
import { detectStructuralContradictions } from '../detectors/detectStructuralContradictions';
import { detectMetadataContradictions } from '../detectors/detectMetadataContradictions';

export function generateHealingActions(
	decompiledReport: DecompiledReport,
	reportType: ReportTypeDefinition
): SelfHealingAction[] {
	const actions: SelfHealingAction[] = [];

	actions.push(...detectMissingSections(decompiledReport, reportType));
	actions.push(...detectMissingFields(decompiledReport, reportType));
	actions.push(...detectMissingComplianceRules(decompiledReport, reportType));
	actions.push(...detectMissingTerminology(decompiledReport, reportType));
	actions.push(...detectMissingTemplates(decompiledReport, reportType));
	actions.push(...detectMissingAIGuidance(decompiledReport, reportType));
	actions.push(...detectSchemaContradictions(decompiledReport, reportType));
	actions.push(...detectStructuralContradictions(decompiledReport, reportType));
	actions.push(...detectMetadataContradictions(decompiledReport, reportType));

	return actions;
}